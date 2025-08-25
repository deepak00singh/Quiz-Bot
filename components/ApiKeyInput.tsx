import React, { useState } from 'react';
import { KeyIcon, ArrowRightIcon } from './icons';

interface ApiKeyInputProps {
    onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onApiKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="w-full max-w-md animate-fade-in">
            <div className="relative bg-slate-900/50 backdrop-blur-lg border border-indigo-500/20 rounded-2xl shadow-2xl shadow-indigo-500/20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10" />
                <div className="p-8 relative z-10">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/30">
                            <KeyIcon className="w-8 h-8 text-indigo-400 animate-pulse-slow" />
                        </div>
                    </div>
                    <h2 className="text-center text-2xl font-bold text-slate-100 mb-2 [text-shadow:0_0_10px_rgba(255,255,255,0.2)]">
                        Enter Your API Key
                    </h2>
                    <p className="text-center text-slate-400 mb-8 text-sm max-w-xs mx-auto">
                        Your key is stored only in your browser for this session.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="relative mb-6">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Paste your Gemini API key here"
                                className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 peer"
                                required
                            />
                             <label className="absolute left-4 -top-2.5 text-xs text-slate-400 bg-slate-900 px-1 transition-all duration-300 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400">
                                API Key
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={!apiKey.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 enabled:hover:bg-indigo-500 enabled:shadow-[0_0_20px_rgba(129,140,248,0.6)] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            Continue
                            <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-500 mt-8">
                        Don't have a key? Get one from {' '}
                        <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline"
                        >
                            Google AI Studio
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyInput;