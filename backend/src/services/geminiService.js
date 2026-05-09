const { GoogleGenerativeAI } = require('@google/generative-ai');
const store = require('../store/memoryStore');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const processMessage = async (chatId, message, docFile, imgFile) => {
    let session = store.getSession(chatId);
    if (!session) {
        throw new Error("Chat session not found. Please start a new chat.");
    }

    // 1. Format history properly for the Gemini SDK
    // We dynamically reconstruct the history timeline, attaching files exactly where they belong
    const formattedHistory = session.history.map(msg => {
        const parts = [{ text: msg.text }];

        // Attach historical image to its specific past turn
        if (msg.imgData) {
            parts.push({
                inlineData: { data: msg.imgData.data, mimeType: msg.imgData.mimeType }
            });
        }

        // Attach historical document to its specific past turn
        if (msg.docData) {
            if (msg.docData.type === 'pdf') {
                parts.push({
                    inlineData: { data: msg.docData.data, mimeType: "application/pdf" }
                });
            } else {
                parts.push({ text: `\n--- Document Context ---\n${msg.docData.data}\n--- End Document ---` });
            }
        }

        return {
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: parts
        };
    });

    // 2. Prepare the payload strictly for the CURRENT message
    const requestParts = [{ text: message }];

    // Attach new image ONLY if uploaded in THIS exact turn
    if (imgFile) {
        requestParts.push({
            inlineData: {
                data: imgFile.buffer.toString("base64"),
                mimeType: imgFile.mimetype
            }
        });
    }

    // Attach new document ONLY if uploaded in THIS exact turn
    if (docFile) {
        if (docFile.mimetype === 'application/pdf') {
            requestParts.push({
                inlineData: {
                    data: docFile.buffer.toString("base64"),
                    mimeType: "application/pdf"
                }
            });
        } else if (docFile.mimetype === 'text/plain') {
            requestParts.push({
                text: `\n--- Document Context ---\n${docFile.buffer.toString('utf-8')}\n--- End Document ---`
            });
        }
    }

    // 3. Configure the Model
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are a highly capable AI assistant. You have vision capabilities and can analyze both images and raw PDF documents. 
        
CRITICAL INSTRUCTION FOR IMAGES: When you process high-resolution images, you internally break them into multiple tiles or cropped versions. You MUST NEVER mention these internal crops, tiles, or grid segments to the user. Always respond naturally as if you are looking at one single, unified photograph.`
    });

    try {
        // 4. Initialize Chat and Send Message
        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(requestParts);
        const botResponse = result.response.text();

        // 5. Save the interaction to our memory store
        session.history.push({ 
            role: 'user', 
            text: message,
            // Data for the frontend UI to render previews
            image: imgFile ? `data:${imgFile.mimetype};base64,${imgFile.buffer.toString('base64')}` : null,
            document: docFile ? docFile.originalname : null,
            // Raw binary data saved secretly for future Gemini SDK history mapping
            imgData: imgFile ? { mimeType: imgFile.mimetype, data: imgFile.buffer.toString('base64') } : null,
            docData: docFile ? { 
                type: docFile.mimetype === 'application/pdf' ? 'pdf' : 'text',
                mimeType: docFile.mimetype,
                data: docFile.mimetype === 'application/pdf' ? docFile.buffer.toString('base64') : docFile.buffer.toString('utf-8')
            } : null
        });
        
        session.history.push({ role: 'bot', text: botResponse });

        return { response: botResponse };
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate response from Gemini API.");
    }
};

module.exports = { processMessage };