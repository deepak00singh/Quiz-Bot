import React, { useState, useEffect } from 'react';
import { CheckCircleIcon } from './icons';

interface LoaderProps {
  message: string; // The message prop is kept for compatibility but the new UI is primary
}

const processingSteps = [
    "Reading PDF document...",
    "Extracting text content...",
    "Connecting to AI brain...",
    "Crafting multiple choice questions...",
    "Generating true/false statements...",
    "Formulating short answer questions...",
    "Summarizing key topics...",
    "Finalizing your learning module...",
];

const Loader: React.FC<LoaderProps> = ({ message }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < processingSteps.length - 1) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 700);

        return () => clearInterval(interval);
    }, []);


  return (
    <div className="w-full max-w-md text-left p-8 bg-slate-800/50 rounded-xl shadow-lg border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.25)] animate-fade-in">
        <div className="flex items-center mb-6">
            <svg
                className="animate-spin h-8 w-8 text-indigo-400 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-bold text-slate-200">Processing Your Document...</h2>
        </div>
        <ul className="space-y-3">
            {processingSteps.map((step, index) => (
                <li key={index} className={`flex items-center transition-all duration-500 ${index <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                    {index < currentStep ? (
                        <CheckCircleIcon className="w-5 h-5 mr-3 text-green-400 flex-shrink-0" />
                    ) : (
                         <div className={`w-5 h-5 mr-3 rounded-full flex-shrink-0 ${index === currentStep ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`}></div>
                    )}
                    <span className={`text-sm ${index < currentStep ? 'text-slate-400' : 'text-slate-300 font-medium'}`}>{step}</span>
                </li>
            ))}
        </ul>
    </div>
  );
};

export default Loader;