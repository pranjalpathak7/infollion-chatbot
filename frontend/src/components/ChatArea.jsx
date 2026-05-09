import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, FileText, Image as ImageIcon, X, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { chatAPI } from '../services/api';

export default function ChatArea({ currentChatId, onChatUpdated }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [docFile, setDocFile] = useState(null);
    const [imgFile, setImgFile] = useState(null);
    const [imgPreview, setImgPreview] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch history when chat ID changes
    useEffect(() => {
        if (!currentChatId) return;
        
        const fetchHistory = async () => {
            try {
                const res = await chatAPI.getHistory(currentChatId);
                setMessages(res.data.history || []);
            } catch (error) {
                console.error("Failed to fetch history", error);
            }
        };
        fetchHistory();
        clearAttachments();
    }, [currentChatId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            setImgFile(file);
            setImgPreview(URL.createObjectURL(file));
        } else {
            alert('Please upload a valid PNG or JPG image.');
        }
    };

    const handleDocChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
            setDocFile(file);
        } else {
            alert('Please upload a valid PDF or TXT document.');
        }
    };

    const clearAttachments = () => {
        setDocFile(null);
        setImgFile(null);
        setImgPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() && !imgFile && !docFile) return;

        const formData = new FormData();
        formData.append('chatId', currentChatId);
        formData.append('message', input || "Please analyze the attached files.");
        if (docFile) formData.append('document', docFile);
        if (imgFile) formData.append('image', imgFile);

        // Optimistic UI update - saving the preview data into the message state
        const userMsg = { 
            role: 'user', 
            text: input || "Uploaded attachments.",
            image: imgPreview, 
            document: docFile ? docFile.name : null
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        
        // INSTANT CLEAR: Detaches the files from the input area immediately
        clearAttachments(); 

        try {
            const res = await chatAPI.sendMessage(formData);
            setMessages(prev => [...prev, { role: 'model', text: res.data.data.response }]);
            onChatUpdated(); 
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: 'An error occurred. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentChatId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0B1120] text-slate-500 h-full w-full">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700 shadow-inner">
                    <Sparkles size={32} className="text-indigo-500/50" />
                </div>
                <p className="text-lg font-medium text-slate-400">Select a chat or start a new one.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0B1120] relative w-full">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 mt-20 max-w-sm mx-auto">
                        <Bot size={48} className="mx-auto mb-4 opacity-30 text-indigo-400" />
                        <h3 className="text-lg font-medium text-slate-300 mb-2">How can I help you today?</h3>
                        <p className="text-sm">Upload documents, images, or just type a message to begin.</p>
                    </div>
                )}
                
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                                <Bot size={18} className="text-white" />
                            </div>
                        )}
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-900/20' 
                                : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm'
                        }`}>
                            
                            {/* Render Attached Image inside the bubble */}
                            {msg.image && (
                                <img 
                                    src={msg.image} 
                                    alt="Attachment" 
                                    className="mt-1 mb-4 rounded-xl max-h-64 object-cover border border-white/10 shadow-lg" 
                                />
                            )}

                            {/* Render Attached Document inside the bubble */}
                            {msg.document && (
                                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl mt-1 mb-4 text-sm shadow-sm w-fit border ${
                                    msg.role === 'user' ? 'bg-white/10 text-white border-white/10' : 'bg-slate-900 text-slate-300 border-slate-700'
                                }`}>
                                    <FileText size={18} className={msg.role === 'user' ? "text-indigo-200" : "text-indigo-400"} />
                                    <span className="truncate max-w-[200px] font-medium">{msg.document}</span>
                                </div>
                            )}

                            {/* Render Markdown Text */}
                            <div className={`prose prose-sm md:prose-base max-w-none leading-relaxed [&>p]:mb-0 ${msg.role === 'user' ? 'text-white' : 'prose-invert text-slate-300'}`}>
                                <ReactMarkdown>
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1 border border-slate-600 shadow-sm">
                                <User size={18} className="text-slate-300" />
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex gap-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-md">
                            <Bot size={18} className="text-white" />
                        </div>
                        <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-6 py-4 flex items-center gap-3 shadow-sm">
                            <Loader2 size={18} className="animate-spin text-indigo-400" />
                            <span className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">Analyzing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Tightened Input Area */}
            <div className="p-3 bg-[#0B1120] border-t border-slate-800/60 pb-3 md:pb-2">
                <div className="max-w-4xl mx-auto">
                    {/* Input Field Previews (Before Sending) */}
                    {(docFile || imgPreview) && (
                        <div className="flex gap-2 mb-2 px-1">
                            {docFile && (
                                <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/20 text-sm shadow-sm backdrop-blur-sm">
                                    <FileText size={14} />
                                    <span className="truncate max-w-[150px] font-medium">{docFile.name}</span>
                                    <button onClick={() => setDocFile(null)} className="hover:text-indigo-100 transition-colors"><X size={14} /></button>
                                </div>
                            )}
                            {imgPreview && (
                                <div className="relative group">
                                    <img src={imgPreview} alt="Preview" className="h-12 w-12 object-cover rounded-lg border border-slate-700 shadow-sm" />
                                    <button 
                                        onClick={() => { setImgFile(null); setImgPreview(null); }}
                                        className="absolute -top-2 -right-2 bg-slate-800 text-slate-200 border border-slate-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-slate-700"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Input Form */}
                    <form onSubmit={handleSubmit} className="relative flex items-end gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)] focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 transition-all">
                        
                        {/* File Uploads */}
                        <div className="flex gap-0.5 mb-0.5 ml-1 shrink-0">
                            <label className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors" title="Attach Document (PDF/TXT)">
                                <FileText size={18} />
                                <input type="file" accept=".pdf,.txt" onChange={handleDocChange} className="hidden" />
                            </label>
                            <label className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors" title="Attach Image (PNG/JPG)">
                                <ImageIcon size={18} />
                                <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Message Infollion Chatbot..."
                            className="flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-slate-200 placeholder-slate-500 focus:outline-none text-sm md:text-base"
                            rows={1}
                        />

                        <button 
                            type="submit" 
                            disabled={isLoading || (!input.trim() && !docFile && !imgFile)}
                            className="mb-0.5 mr-0.5 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all flex items-center justify-center shrink-0 shadow-sm"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-slate-600 font-medium tracking-wide uppercase">Powered by Google Gemini 2.5 Flash</span>
                    </div>
                </div>
            </div>
        </div>
    );
}