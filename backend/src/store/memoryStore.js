const chatSessions = new Map();

const createNewSession = (chatId) => {
    chatSessions.set(chatId, {
        id: chatId,
        title: "New Chat", // Default title
        history: [],
        documentText: "",
        imageBuffer: null,
        imageMimeType: "",
        createdAt: Date.now() // For sorting in the sidebar
    });
    return getSession(chatId);
};

const getSession = (chatId) => {
    return chatSessions.get(chatId);
};

const clearSession = (chatId) => {
    chatSessions.delete(chatId);
};

const renameSession = (chatId, newTitle) => {
    const session = chatSessions.get(chatId);
    if (session) {
        session.title = newTitle;
    }
};

// Returns a lightweight summary for the sidebar, sorted newest first
const getAllSessionsSummary = () => {
    return Array.from(chatSessions.values())
        .map(session => ({
            id: session.id,
            title: session.title,
            createdAt: session.createdAt
        }))
        .sort((a, b) => b.createdAt - a.createdAt);
};

module.exports = {
    createNewSession,
    getSession,
    clearSession,
    renameSession,
    getAllSessionsSummary
};