
import { useState, useEffect } from 'react';
import { Quiz, QuizQuestion, QuizReportFormData, QuizQuestionResult, Proficiency } from '../types';
import { generateMistakeExplanation } from '../services/geminiService';

interface QuizCardProps {
    topic: string;
    quiz: Quiz;
    proficiency: Proficiency;
    selectedAnswers: (string | null)[];
    setSelectedAnswers: (answers: (string | null)[]) => void;
    onGenerateReport: (data: QuizReportFormData) => void;
    isReportLoading: boolean;
    onQuizComplete: (result: { topic: string; score: string; proficiency: Proficiency; }) => void;
    onRetake: (topic: string) => void;
    onTryNewTopic: () => void;
    isReportGenerated: boolean;
}

const QuizCard = ({ topic, quiz, proficiency, selectedAnswers, setSelectedAnswers, onGenerateReport, isReportLoading, onQuizComplete, onRetake, onTryNewTopic, isReportGenerated }: QuizCardProps) => {
    const [detailedExplanations, setDetailedExplanations] = useState<(string | null)[]>([]);
    const [explanationLoading, setExplanationLoading] = useState<boolean[]>([]);
    const [explanationError, setExplanationError] = useState<(string | null)[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        setDetailedExplanations(Array(quiz.length).fill(null));
        setExplanationLoading(Array(quiz.length).fill(false));
        setExplanationError(Array(quiz.length).fill(null));
        setIsCompleted(false);
    }, [quiz]);

    const isQuizComplete = selectedAnswers.every(answer => answer !== null);

    useEffect(() => {
        if (isQuizComplete && !isCompleted) {
            const correctCount = quiz.reduce((acc, q, index) => {
                return selectedAnswers[index] === q.correctAnswer ? acc + 1 : acc;
            }, 0);
            const totalQuestions = quiz.length;
            onQuizComplete({ topic, score: `${correctCount}/${totalQuestions}`, proficiency });
            setIsCompleted(true);
        }
    }, [isQuizComplete, isCompleted, onQuizComplete, quiz, selectedAnswers, topic, proficiency]);


    const handleSelectAnswer = (questionIndex: number, answer: string) => {
        if (selectedAnswers[questionIndex] !== null) return;

        const newAnswers = [...selectedAnswers];
        newAnswers[questionIndex] = answer;
        setSelectedAnswers(newAnswers);
    };

    const handleExplainMistake = async (questionIndex: number, question: QuizQuestion, userAnswer: string) => {
        const newLoading = [...explanationLoading];
        newLoading[questionIndex] = true;
        setExplanationLoading(newLoading);
        
        const newError = [...explanationError];
        newError[questionIndex] = null;
        setExplanationError(newError);

        try {
            const explanation = await generateMistakeExplanation({
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer
            });
            const newExplanations = [...detailedExplanations];
            newExplanations[questionIndex] = explanation;
            setDetailedExplanations(newExplanations);
        } catch (err) {
             const newError = [...explanationError];
             newError[questionIndex] = err instanceof Error ? err.message : 'Failed to load explanation.';
             setExplanationError(newError);
        } finally {
            const newLoading = [...explanationLoading];
            newLoading[questionIndex] = false;
            setExplanationLoading(newLoading);
        }
    };


    const getButtonClass = (questionIndex: number, option: string) => {
        const selected = selectedAnswers[questionIndex];
        const correct = quiz[questionIndex].correctAnswer;
        
        if (selected === null) {
            return 'bg-slate-700/60 hover:bg-slate-700/90 border-slate-600 hover:border-amber-400/50';
        }
        if (option === correct) {
            return 'bg-green-500/80 text-white font-semibold border-green-400';
        }
        if (option === selected && option !== correct) {
            return 'bg-red-500/80 text-white font-semibold border-red-400';
        }
        
        return 'bg-slate-800/50 border-slate-700/50 cursor-not-allowed opacity-60';
    };
    
    const handleReportGeneration = () => {
        if (isReportLoading) return;
        
        const results: QuizQuestionResult[] = quiz.map((q, index) => {
            const userAnswer = selectedAnswers[index];
            if (userAnswer === null) {
                return { question: q.question, userAnswer: "Not Answered", correctAnswer: q.correctAnswer, isCorrect: false };
            }
            return { question: q.question, userAnswer: userAnswer, correctAnswer: q.correctAnswer, isCorrect: userAnswer === q.correctAnswer };
        });

        onGenerateReport({ topic, results });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-xl font-semibold text-slate-300">
                Quiz: <span className="text-amber-400">{topic}</span>
            </h3>
            <div className="space-y-8 stagger-children">
                {quiz.map((q, qIndex) => {
                    const selectedAnswer = selectedAnswers[qIndex];
                    const isAnswered = selectedAnswer !== null;
                    const isIncorrect = isAnswered && selectedAnswer !== q.correctAnswer;

                    return (
                        <div 
                            key={qIndex} 
                            className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-amber-300/10" 
                            style={{ animationDelay: `${qIndex * 100}ms` }}
                        >
                            <p className="font-semibold text-slate-200 mb-4">{qIndex + 1}. {q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {q.options.map((option, oIndex) => (
                                    <button
                                        key={oIndex}
                                        onClick={() => handleSelectAnswer(qIndex, option)}
                                        className={`p-3 rounded-md text-left w-full transition-all duration-200 border ${getButtonClass(qIndex, option)}`}
                                        disabled={isAnswered}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            {isAnswered && (
                                <div className="mt-4 p-3 bg-slate-900/70 rounded-md border-l-4 border-sky-500 animate-fade-in-fast">
                                    <p className="font-semibold text-sky-400">Explanation</p>
                                    <p className="text-slate-300 text-sm mt-1">{q.explanation}</p>
                                </div>
                            )}
                            {isIncorrect && !detailedExplanations[qIndex] && (
                                <div className="mt-4 text-center animate-fade-in-fast">
                                     <button 
                                        onClick={() => handleExplainMistake(qIndex, q, selectedAnswer as string)}
                                        disabled={explanationLoading[qIndex]}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-800/80 hover:bg-red-700/80 rounded-md transition-colors disabled:bg-red-500/50 disabled:cursor-wait"
                                    >
                                        {explanationLoading[qIndex] ? (
                                             <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Analyzing...</span>
                                             </>
                                        ) : (
                                            'Explain My Mistake'
                                        )}
                                     </button>
                                     {explanationError[qIndex] && <p className="text-red-400 text-xs mt-2">{explanationError[qIndex]}</p>}
                                </div>
                            )}
                            {detailedExplanations[qIndex] && (
                                 <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-500/50 animate-fade-in-up">
                                    <h4 className="font-bold text-red-400">Deeper Dive</h4>
                                     <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-sm mt-2">{detailedExplanations[qIndex]}</div>
                                 </div>
                            )}
                        </div>
                    )
                })}
            </div>
            
            {isQuizComplete && !isReportGenerated && (
                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-center animate-fade-in-up">
                    <button 
                        onClick={handleReportGeneration}
                        disabled={isReportLoading}
                        className="w-full max-w-sm flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-lg shadow-fuchsia-500/20 text-sm font-medium text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 focus:ring-offset-bg-primary disabled:bg-fuchsia-500/50 disabled:cursor-not-allowed transition-all"
                    >
                         {isReportLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Generating Report...</span>
                            </>
                        ) : (
                            'Generate Quiz Report'
                        )}
                    </button>
                </div>
            )}
            
            {isReportGenerated && (
                 <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up">
                    <button 
                        onClick={() => onRetake(topic)}
                        className="w-full sm:w-auto flex-grow flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-bg-primary transition-all duration-200"
                    >
                        Retake Quiz
                    </button>
                     <button 
                        onClick={onTryNewTopic}
                        className="w-full sm:w-auto flex-grow flex justify-center items-center py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-bg-primary transition-all"
                    >
                        Try a New Topic
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizCard;
