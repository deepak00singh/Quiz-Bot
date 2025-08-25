import React, { useState, useCallback, useEffect } from 'react';
import type { AppState, QuizData } from './types';
import { extractTextFromPdf } from './services/pdfParser';
import { generateQuiz } from './services/geminiService';

import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import QuestionDisplay from './components/QuestionDisplay';
import ApiKeyInput from './components/ApiKeyInput';
import { SparklesIcon } from './components/icons';

const Header: React.FC = () => (
  <header className="w-full py-4 bg-slate-900/50 backdrop-blur-lg border-b border-indigo-500/20 sticky top-0 z-10 header-animated relative overflow-hidden">
    <div className="container mx-auto px-4 flex items-center justify-center">
      <SparklesIcon className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.8)]" />
      <h1 className="ml-3 text-2xl font-bold text-slate-100 tracking-tight [text-shadow:0_0_8px_rgba(255,255,255,0.3)]">
        QuizGenius
      </h1>
    </div>
  </header>
);

const Footer: React.FC = () => (
    <footer className="w-full py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            <p>Crafted with ✦ for innovative educators.</p>
        </div>
    </footer>
);

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('apiKeyNeeded');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isKeyInvalid, setIsKeyInvalid] = useState(false);

  useEffect(() => {
    const storedKey = sessionStorage.getItem('geminiApiKey');
    if (storedKey) {
      setApiKey(storedKey);
      setAppState('initial');
    } else {
      setAppState('apiKeyNeeded');
    }
  }, []);

  const handleApiKeySubmit = (submittedKey: string) => {
    setApiKey(submittedKey);
    sessionStorage.setItem('geminiApiKey', submittedKey);
    setAppState('initial');
    setIsKeyInvalid(false);
  };
  
  const handleChangeApiKey = () => {
    setApiKey(null);
    sessionStorage.removeItem('geminiApiKey');
    setAppState('apiKeyNeeded');
    setErrorMessage('');
    setIsKeyInvalid(false);
  }

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
        setErrorMessage('Only PDF files are accepted. Please try again.');
        setAppState('error');
        return;
    }
    setPdfFile(file);
    setAppState('parsing');
    setErrorMessage('');
    setQuizData(null);
  };
  
  const resetApp = () => {
      setAppState('initial');
      setPdfFile(null);
      setQuizData(null);
      setErrorMessage('');
      setIsKeyInvalid(false);
  }

  const processPdf = useCallback(async () => {
    if (!pdfFile || !apiKey) return;

    try {
      const text = await extractTextFromPdf(pdfFile);
      setAppState('generating');
      const quiz = await generateQuiz(text, apiKey);
      setQuizData(quiz);
      setAppState('finished');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      if (message.toLowerCase().includes('api key is not valid')) {
        setErrorMessage('Your API Key appears to be invalid or has expired. Please enter a valid key.');
        setIsKeyInvalid(true);
      } else {
        setErrorMessage(`Failed to process your request. ${message}`);
        setIsKeyInvalid(false);
      }
      setAppState('error');
    }
  }, [pdfFile, apiKey]);

  useEffect(() => {
    if (appState === 'parsing' && pdfFile) {
        processPdf();
    }
  }, [appState, pdfFile, processPdf]);

  const renderContent = () => {
    switch (appState) {
      case 'apiKeyNeeded':
        return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
      case 'initial':
        return <FileUpload onFileSelect={handleFileSelect} />;
      case 'parsing':
      case 'generating':
        return <Loader message="Processing..." />;
      case 'finished':
        return quizData && <QuestionDisplay quizData={quizData} onRestart={resetApp}/>;
      case 'error':
        return (
            <div className="text-center bg-slate-800/50 p-8 rounded-xl shadow-lg border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-fade-in">
                <h2 className="text-xl font-semibold text-red-400 mb-4 [text-shadow:0_0_8px_rgba(239,68,68,0.5)]">An Error Occurred</h2>
                <p className="text-slate-300 mb-6">{errorMessage}</p>
                {isKeyInvalid ? (
                   <button
                    onClick={handleChangeApiKey}
                    className="bg-yellow-500 text-slate-900 font-semibold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                  >
                    Change API Key
                  </button>
                ) : (
                  <button
                      onClick={resetApp}
                      className="bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-[0_0_15px_rgba(129,140,248,0.4)] hover:shadow-[0_0_20px_rgba(129,140,248,0.6)]"
                  >
                      Try Again
                  </button>
                )}
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;