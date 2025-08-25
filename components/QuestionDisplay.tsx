import React, { useState, useCallback } from 'react';
import type { QuizData } from '../types';
import { ClipboardCopyIcon, CheckCircleIcon, ListChecksIcon, BinaryIcon, PencilLineIcon, BookTextIcon } from './icons';

interface QuestionDisplayProps {
  quizData: QuizData;
  onRestart: () => void;
}

type ActiveTab = 'mc' | 'tf' | 'sa' | 'sum';

const formatQuizForExport = (quizData: QuizData): string => {
    let text = "Quiz & Summaries\n\n";

    if(quizData.multipleChoice.length > 0) {
        text += "--- Multiple Choice ---\n\n";
        quizData.multipleChoice.forEach((q, i) => {
            text += `${i + 1}. ${q.question}\n`;
            q.options.forEach(opt => text += `- ${opt}\n`);
            text += `Correct Answer: ${q.correctAnswer}\n\n`;
        });
    }

    if(quizData.trueFalse.length > 0) {
        text += "--- True/False ---\n\n";
        quizData.trueFalse.forEach((q, i) => {
            text += `${i + 1}. ${q.question}\n`;
            text += `Correct Answer: ${q.correctAnswer}\n\n`;
        });
    }

    if(quizData.shortAnswer.length > 0) {
        text += "--- Short Answer ---\n\n";
        quizData.shortAnswer.forEach((q, i) => {
            text += `${i + 1}. ${q.question}\n`;
            text += `Answer: ${q.answer}\n\n`;
        });
    }
    
    if(quizData.topicSummaries.length > 0) {
        text += "--- Topic Summaries ---\n\n";
        quizData.topicSummaries.forEach((s, i) => {
            text += `Topic: ${s.topic}\n`;
            text += `Summary: ${s.summary}\n\n`;
        });
    }

    return text;
};


const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ quizData, onRestart }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

    const findInitialTab = useCallback((): ActiveTab => {
        if (quizData.multipleChoice.length > 0) return 'mc';
        if (quizData.trueFalse.length > 0) return 'tf';
        if (quizData.shortAnswer.length > 0) return 'sa';
        if (quizData.topicSummaries.length > 0) return 'sum';
        return 'mc'; // Fallback
    }, [quizData]);

    const [activeTab, setActiveTab] = useState<ActiveTab>(findInitialTab());

    const toggleAnswer = (id: string) => {
        setRevealedAnswers(prev => ({ ...prev, [id]: true }));
    };

    const handleCopyToClipboard = useCallback(() => {
        const textToCopy = formatQuizForExport(quizData);
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    }, [quizData]);
    
    const TabButton: React.FC<{tab: ActiveTab, label: string, icon: React.ReactNode, disabled?: boolean}> = ({ tab, label, icon, disabled }) => (
        <button
            onClick={() => !disabled && setActiveTab(tab)}
            disabled={disabled}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${activeTab === tab ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(129,140,248,0.5)]' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon}
            {label}
        </button>
    );

    const isDataEmpty = 
        quizData.multipleChoice.length === 0 &&
        quizData.trueFalse.length === 0 &&
        quizData.shortAnswer.length === 0 &&
        quizData.topicSummaries.length === 0;

    if (isDataEmpty) {
        return (
             <div className="w-full max-w-4xl bg-slate-900/70 backdrop-blur-sm border border-yellow-500/20 rounded-2xl shadow-2xl shadow-yellow-500/10 p-6 sm:p-8 animate-fade-in text-center">
                <h2 className="text-2xl font-bold text-yellow-300">Content Could Not Be Generated</h2>
                <p className="text-slate-400 mt-2 mb-6">The AI was unable to create a quiz from the provided document. This can happen if the document is very short, consists mainly of images, or is in a complex format.</p>
                <button
                    onClick={onRestart}
                    className="bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-[0_0_15px_rgba(129,140,248,0.4)] hover:shadow-[0_0_20px_rgba(129,140,248,0.6)]"
                >
                    Try a Different File
                </button>
            </div>
        )
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'mc':
                return (
                    <div className="space-y-6">
                        {quizData.multipleChoice.map((q, index) => {
                            const id = `mc-${index}`;
                            const isRevealed = revealedAnswers[id];
                            return (
                                <div key={index} className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 transition-all duration-300 hover:bg-slate-800 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/10">
                                    <p className="font-semibold text-slate-200 mb-3">{index + 1}. {q.question}</p>
                                    <div className="space-y-2">
                                        {q.options.map((option, optIndex) => (
                                            <div key={optIndex} className={`flex items-center p-2 rounded-md text-slate-300 transition-colors duration-300 ${isRevealed && option === q.correctAnswer ? 'bg-green-500/20 text-green-300 font-medium border border-green-500/50' : 'bg-slate-700/50'}`}>
                                                <span className="text-sm font-mono mr-3 text-slate-500">{String.fromCharCode(65 + optIndex)}.</span>
                                                <span>{option}</span>
                                                {isRevealed && option === q.correctAnswer && <CheckCircleIcon className="w-5 h-5 ml-auto text-green-400" />}
                                            </div>
                                        ))}
                                    </div>
                                    {!isRevealed && <button onClick={() => toggleAnswer(id)} className="text-sm mt-4 text-indigo-400 hover:text-indigo-300 font-semibold">Reveal Answer</button>}
                                </div>
                            )
                        })}
                    </div>
                );
            case 'tf':
                 return (
                    <div className="space-y-6">
                        {quizData.trueFalse.map((q, index) => {
                            const id = `tf-${index}`;
                            const isRevealed = revealedAnswers[id];
                            return(
                                <div key={index} className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 transition-all duration-300 hover:bg-slate-800 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/10">
                                    <p className="font-semibold text-slate-200 mb-3">{index + 1}. {q.question}</p>
                                    {isRevealed ? (
                                        <div className="flex items-center space-x-4">
                                            <div className={`flex items-center p-2 px-4 rounded-md ${q.correctAnswer === true ? 'bg-green-500/20 text-green-300 font-medium border border-green-500/50' : 'bg-slate-700/50 text-slate-300'}`}>True {q.correctAnswer === true && <CheckCircleIcon className="w-5 h-5 ml-2 text-green-400" />}</div>
                                            <div className={`flex items-center p-2 px-4 rounded-md ${q.correctAnswer === false ? 'bg-green-500/20 text-green-300 font-medium border border-green-500/50' : 'bg-slate-700/50 text-slate-300'}`}>False {q.correctAnswer === false && <CheckCircleIcon className="w-5 h-5 ml-2 text-green-400" />}</div>
                                        </div>
                                    ) : (
                                        <button onClick={() => toggleAnswer(id)} className="text-sm mt-2 text-indigo-400 hover:text-indigo-300 font-semibold">Reveal Answer</button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                );
            case 'sa':
                 return (
                    <div className="space-y-6">
                        {quizData.shortAnswer.map((q, index) => {
                            const id = `sa-${index}`;
                            const isRevealed = revealedAnswers[id];
                            return (
                                <div key={index} className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 transition-all duration-300 hover:bg-slate-800 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/10">
                                    <p className="font-semibold text-slate-200 mb-3">{index + 1}. {q.question}</p>
                                    {isRevealed ? (
                                        <div className="p-3 bg-slate-700/50 rounded-md text-slate-300 animate-fade-in">
                                            <p>{q.answer}</p>
                                        </div>
                                    ) : (
                                        <button onClick={() => toggleAnswer(id)} className="text-sm mt-2 text-indigo-400 hover:text-indigo-300 font-semibold">Reveal Answer</button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                );
            case 'sum':
                return (
                    <div className="space-y-6">
                        {quizData.topicSummaries.map((s, index) => (
                             <div key={index} className="p-4 border border-slate-700 rounded-lg bg-slate-800/50 transition-all duration-300 hover:bg-slate-800 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/10">
                                <h4 className="font-semibold text-indigo-300 mb-2">{s.topic}</h4>
                                <p className="text-slate-300 leading-relaxed">{s.summary}</p>
                            </div>
                        ))}
                    </div>
                );
        }
    };

  return (
    <div className="w-full max-w-4xl bg-slate-900/70 backdrop-blur-sm border border-indigo-500/20 rounded-2xl shadow-2xl shadow-indigo-500/10 p-6 sm:p-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-100">Your Learning Module is Ready!</h2>
                <p className="text-slate-400 mt-1">Review the AI-generated content below.</p>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0 flex-shrink-0">
                 <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2 bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-[0_0_15px_rgba(129,140,248,0.4)] hover:shadow-[0_0_20px_rgba(129,140,248,0.6)]"
                >
                    {copyStatus === 'idle' ? <ClipboardCopyIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                    {copyStatus === 'idle' ? 'Copy All' : 'Copied!'}
                </button>
                 <button
                    onClick={onRestart}
                    className="bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300"
                >
                    Start Over
                </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 p-2 bg-slate-800/50 rounded-lg flex items-center justify-center sm:justify-start flex-wrap gap-2 border border-slate-700">
            <TabButton tab="mc" label="Multiple Choice" icon={<ListChecksIcon className="w-5 h-5" />} disabled={quizData.multipleChoice.length === 0} />
            <TabButton tab="tf" label="True/False" icon={<BinaryIcon className="w-5 h-5" />} disabled={quizData.trueFalse.length === 0} />
            <TabButton tab="sa" label="Short Answer" icon={<PencilLineIcon className="w-5 h-5" />} disabled={quizData.shortAnswer.length === 0} />
            <TabButton tab="sum" label="Summaries" icon={<BookTextIcon className="w-5 h-5" />} disabled={quizData.topicSummaries.length === 0} />
        </div>

        <div className="min-h-[400px]">
            {renderContent()}
        </div>
    </div>
  );
};

export default QuestionDisplay;