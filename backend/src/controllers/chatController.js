const { v4: uuidv4 } = require('uuid');
const geminiService = require('../services/geminiService');
const store = require('../store/memoryStore');

const createNewChat = (req, res) => {
    const newChatId = uuidv4();
    store.createNewSession(newChatId);
    res.status(201).json({ success: true, chatId: newChatId });
};

const handleChatMessage = async (req, res) => {
    try {
        const { chatId, message } = req.body;
        if (!chatId || !message) return res.status(400).json({ success: false, error: "chatId and message are required." });

        const documentFile = req.files?.document ? req.files.document[0] : null;
        const imageFile = req.files?.image ? req.files.image[0] : null;

        const result = await geminiService.processMessage(chatId, message, documentFile, imageFile);
        
        // Auto-title the chat based on the first user message
        const session = store.getSession(chatId);
        if (session && session.title === "New Chat" && session.history.length === 2) {
            const cleanTitle = message.replace(/[^a-zA-Z0-9 ]/g, "").trim();
            session.title = cleanTitle.substring(0, 25) + (cleanTitle.length > 25 ? '...' : '');
        }

        res.status(200).json({ success: true, data: result, title: session?.title });
    } catch (error) {
        console.error("🔥 FATAL ERROR in handleChatMessage:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getChatSessions = (req, res) => {
    res.status(200).json({ success: true, sessions: store.getAllSessionsSummary() });
};

const getChatHistory = (req, res) => {
    const session = store.getSession(req.params.chatId);
    if (!session) return res.status(404).json({ success: false, error: "Chat not found." });
    res.status(200).json({ success: true, history: session.history });
};

const renameChat = (req, res) => {
    const { title } = req.body;
    store.renameSession(req.params.chatId, title);
    res.status(200).json({ success: true });
};

const deleteChat = (req, res) => {
    store.clearSession(req.params.chatId);
    res.status(200).json({ success: true });
};

module.exports = { createNewChat, handleChatMessage, getChatSessions, getChatHistory, renameChat, deleteChat };