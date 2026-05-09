import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                        <AlertTriangle className="text-red-500" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{message}</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-950/50 flex justify-end gap-3 border-t border-slate-800">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-900/20 transition-colors"
                    >
                        Delete Chat
                    </button>
                </div>
            </div>
        </div>
    );
}