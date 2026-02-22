

import { type ChangeEvent, type FormEvent } from 'react';
import { TextArea } from './shared/TextArea';
import Loader from './Loader';

interface NoteSummarizerProps {
    isOpen: boolean;
    notes: string;
    summary: string | null;
    isLoading: boolean;
    error: string | null;
    onToggle: () => void;
    onReset: () => void;
    onNotesChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
}

const SummarizerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const NoteSummarizer = ({ isOpen, onToggle, notes, onNotesChange, onSubmit, summary, isLoading, error, onReset }: NoteSummarizerProps) => {
    const isFormInvalid = !notes.trim();

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
            {/* Bot Window */}
            {isOpen && (
                <div 
                    className="w-[calc(100vw-2rem)] sm:w-96 h-[60vh] max-h-[500px] mb-4 bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-teal-400/30 flex flex-col animate-fade-in-up"
                    style={{ animationDuration: '0.3s' }}
                >
                    {/* Header */}
                    <header className="flex items-center justify-between p-3 border-b border-teal-400/20 flex-shrink-0">
                        <div className="flex items-center gap-3 text-teal-300">
                             <SummarizerIcon />
                            <h3 className="font-semibold">Note Summarizer</h3>
                        </div>
                        <button 
                            onClick={onToggle} 
                            className="p-1 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                            aria-label="Close summarizer"
                        >
                           <CloseIcon />
                        </button>
                    </header>

                    {/* Content */}
                    <div className="flex-grow flex flex-col p-4 overflow-y-auto">
                        {!summary && !isLoading && !error && (
                             <form onSubmit={onSubmit} className="flex-grow flex flex-col">
                                <label htmlFor="notes-input" className="text-sm font-medium text-slate-300 mb-2">
                                    Paste your notes here:
                                </label>
                                <TextArea 
                                    id="notes-input"
                                    value={notes} 
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onNotesChange(e.target.value)}
                                    className="w-full flex-grow bg-slate-800/60 border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="e.g., meeting minutes, lecture notes, article snippets..."
                                />
                                <button type="submit" disabled={isLoading || isFormInvalid} className="mt-4 w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-lg shadow-teal-500/20 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-bg-primary disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200">
                                    {isLoading ? 'Summarizing...' : 'Summarize'}
                                </button>
                            </form>
                        )}
                       
                        {isLoading && <Loader message="Summarizing..." />}

                        {error && (
                            <div className="text-center text-red-400 p-4 flex flex-col items-center justify-center h-full">
                                <p className="font-semibold">Error</p>
                                <p className="text-sm mb-4">{error}</p>
                                <button 
                                    onClick={onReset} 
                                    className="mt-4 w-full sm:w-auto flex justify-center items-center py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-bg-primary transition-all"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {summary && !isLoading && !error && (
                            <div className="space-y-4 animate-fade-in flex flex-col h-full">
                                <h4 className="font-semibold text-teal-300 flex-shrink-0">Summary:</h4>
                                <div className="whitespace-pre-wrap text-slate-300 bg-slate-800/60 p-3 rounded-md text-sm leading-relaxed flex-grow overflow-y-auto">
                                    {summary}
                                </div>
                                <button 
                                    onClick={onReset}
                                    className="mt-4 w-full flex-shrink-0 justify-center items-center py-2.5 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-bg-primary transition-all"
                                >
                                    Summarize Another Note
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Floating Action Button */}
            <button 
                onClick={onToggle}
                className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                aria-label="Toggle note summarizer"
            >
                {isOpen ? <CloseIcon /> : <SummarizerIcon />}
            </button>
        </div>
    );
};

export default NoteSummarizer;