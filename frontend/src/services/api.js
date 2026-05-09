import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ 
    baseURL: baseURL 
});

export const chatAPI = {
    createNewChat: () => api.post('/chat/new'),
    getSessions: () => api.get('/chat'),
    getHistory: (chatId) => api.get(`/chat/${chatId}`),
    sendMessage: (formData) => api.post('/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    renameChat: (chatId, title) => api.put(`/chat/${chatId}/rename`, { title }),
    deleteChat: (chatId) => api.delete(`/chat/${chatId}`)
};