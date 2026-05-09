import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ConfirmModal from './components/ConfirmModal';
import { chatAPI } from './services/api';
import { PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';

function App() {
    const [sessions, setSessions] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);

    const loadSessions = async () => {
        try {
            const res = await chatAPI.getSessions();
            const loadedSessions = res.data.sessions || [];
            setSessions(loadedSessions);
            if (!currentChatId && loadedSessions.length > 0) {
                setCurrentChatId(loadedSessions[0].id);
            }
        } catch (error) {
            console.error("Failed to load sessions", error);
        }
    };

    useEffect(() => { loadSessions(); }, []);

    const handleNewChat = async () => {
        try {
            const res = await chatAPI.createNewChat();
            setCurrentChatId(res.data.chatId);
            if (window.innerWidth < 768) setIsSidebarOpen(false); 
            loadSessions();
        } catch (error) {
            console.error("Failed to create new chat", error);
        }
    };

    const confirmDelete = (chatId) => {
        setChatToDelete(chatId);
        setDeleteModalOpen(true);
    };

    const handleDeleteChat = async () => {
        if (!chatToDelete) return;
        try {
            await chatAPI.deleteChat(chatToDelete);
            if (currentChatId === chatToDelete) setCurrentChatId(null);
            loadSessions();
        } catch (error) {
            console.error("Failed to delete chat", error);
        }
    };

    const handleRenameChat = async (chatId, newTitle) => {
        try {
            await chatAPI.renameChat(chatId, newTitle);
            loadSessions();
        } catch (error) {
            console.error("Failed to rename chat", error);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#0B1120] overflow-hidden font-sans text-slate-200 selection:bg-indigo-500/30">
            
            {/* Sidebar with the CSS fix applied */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out bg-slate-900 overflow-hidden shrink-0
                ${isSidebarOpen 
                    ? 'translate-x-0 w-72 opacity-100 border-r border-slate-800 shadow-2xl md:shadow-none' 
                    : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 border-none'
                }
            `}>
                <div className="w-72 h-full"> 
                    <Sidebar 
                        sessions={sessions} 
                        currentChatId={currentChatId}
                        onSelectChat={(id) => { 
                            setCurrentChatId(id); 
                            if (window.innerWidth < 768) setIsSidebarOpen(false); 
                        }}
                        onNewChat={handleNewChat}
                        onDeleteRequest={confirmDelete}
                        onRenameChat={handleRenameChat}
                        isMobileClose={() => setIsSidebarOpen(false)}
                    />
                </div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-20 md:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120] relative">
                
                {/* Aesthetic Top Navigation */}
                <header className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60 bg-[#0B1120]/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                        >
                            {isSidebarOpen ? <PanelLeftClose size={22} /> : <PanelLeft size={22} />}
                        </button>
                        <div className="flex items-center gap-2 pointer-events-none">
                            <Sparkles className="text-indigo-400" size={20} />
                            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
                                Infollion Chatbot
                            </h1>
                        </div>
                    </div>
                </header>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden relative z-0">
                    <ChatArea currentChatId={currentChatId} onChatUpdated={loadSessions} />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal 
                isOpen={deleteModalOpen} 
                onClose={() => setDeleteModalOpen(false)} 
                onConfirm={handleDeleteChat}
                title="Delete Chat"
                message="Are you sure you want to delete this conversation? This action cannot be undone."
            />
        </div>
    );
}

export default App;