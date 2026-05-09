import React, { useState } from 'react';
import { MessageSquarePlus, MessageCircle, Trash2, Edit2, Check, X } from 'lucide-react';

export default function Sidebar({ sessions, currentChatId, onSelectChat, onNewChat, onDeleteRequest, onRenameChat, isMobileClose }) {
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");

    const startEditing = (e, session) => {
        e.stopPropagation();
        setEditingId(session.id);
        setEditTitle(session.title);
    };

    const submitEdit = (e, id) => {
        e.stopPropagation();
        if (editTitle.trim()) onRenameChat(id, editTitle.trim());
        setEditingId(null);
    };

    const cancelEdit = (e) => {
        e.stopPropagation();
        setEditingId(null);
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-900 text-slate-300">
            {/* Mobile Close Button Container */}
            <div className="md:hidden flex justify-end p-2 border-b border-slate-800">
                <button onClick={isMobileClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                    <X size={20} />
                </button>
            </div>

            <div className="p-4">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-xl transition-all font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)] active:scale-[0.98]"
                >
                    <MessageSquarePlus size={18} />
                    New Chat
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">
                    Recent Sessions
                </h3>
                {sessions.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center mt-6 italic">No conversations yet</p>
                ) : (
                    sessions.map((session) => (
                        <div 
                            key={session.id}
                            onClick={() => onSelectChat(session.id)}
                            className={`group w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all cursor-pointer border ${
                                currentChatId === session.id 
                                    ? 'bg-slate-800 text-indigo-300 border-slate-700 shadow-sm' 
                                    : 'text-slate-400 hover:bg-slate-800/60 border-transparent hover:text-slate-200'
                            }`}
                        >
                            {editingId === session.id ? (
                                <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                                    <input 
                                        autoFocus
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && submitEdit(e, session.id)}
                                        className="flex-1 bg-slate-950 text-white text-sm px-2 py-1 rounded border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button onClick={(e) => submitEdit(e, session.id)} className="text-green-400 hover:text-green-300 p-1"><Check size={16}/></button>
                                    <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-300 p-1"><X size={16}/></button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <MessageCircle size={16} className={currentChatId === session.id ? "text-indigo-400" : "text-slate-500"} />
                                        <span className="text-sm truncate font-medium">{session.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => startEditing(e, session)} 
                                            className="p-1.5 text-slate-500 hover:text-indigo-300 hover:bg-slate-700 rounded-md transition-colors" title="Rename"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteRequest(session.id); }} 
                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors" title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}