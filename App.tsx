


import { useState, useCallback, useRef, useMemo, useEffect, FormEvent } from 'react';
import { Proficiency, LearningStyle, MicroLessonFormData, LessonFormat, QuizFormData, Quiz, WeeklyReport, PerformanceTrendFormData, PerformanceTrendAnalysis, QuizReport, WeeklyReportFormData, ActivityLogEntry, LessonResult, QuizReportFormData, VisualLessonLanguage, OnboardingFormData, IntegratedPlan, ProjectExplorerFormData, ProjectSuggestion } from './types';
import { generateIntegratedPlan, generateMicroLesson, generateQuiz, generateWeeklyReport, generatePerformanceTrendAnalysis, generateQuizReport, generateProjectSuggestions, summarizeNotes } from './services/geminiService';
import OnboardingForm from './components/OnboardingForm';
import MicroLessonForm from './components/MicroLessonForm';
import QuizForm from './components/QuizForm';
import ActivityReportGenerator from './components/ActivityReportGenerator';
import PerformanceTrendForm from './components/PerformanceTrendForm';
import ProfileCard from './components/ProfileCard';
import AssessmentSuggestions from './components/AssessmentSuggestions';
import AgentGoals from './components/AgentGoals';
import MicroLessonCard from './components/MicroLessonCard';
import QuizCard from './components/QuizCard';
import WeeklyReportCard from './components/WeeklyReportCard';
import PerformanceTrendCard from './components/PerformanceTrendCard';
import LearningPlanCard from './components/LearningPlanCard';
import QuizReportCard from './components/QuizReportCard';
import Loader from './components/Loader';
import ToolFormCard from './components/ToolFormCard';
import QuizHistory from './components/QuizHistory';
import ProjectExplorerForm from './components/ProjectExplorerForm';
import ProjectResultCard from './components/ProjectResultCard';
import NoteSummarizer from './components/NoteSummarizer';

// --- ICONS ---
const Icons = {
  start: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  lesson: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-1.06-1.06M21 12h-1M4 12H3m3.343-5.657l-1.06-1.06m11.314 0l1.06-1.06M12 21v-1m-4.657-3.343l-1.06 1.06m11.314 0l-1.06 1.06M12 7a5 5 0 00-5 5h10a5 5 0 00-5-5z" /></svg>,
  quiz: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  project: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  progress: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  report: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
};

// --- SPEECH RECOGNITION HOOK ---
const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError(null);
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, transcript, error, startListening, stopListening };
};


// --- INITIAL FORM STATES ---
const initialOnboardingFormData: OnboardingFormData = {
  age: '', background: '', proficiency: Proficiency.BEGINNER, interests: '', goals: '', learningStyle: LearningStyle.VISUAL, timeCommitment: "", duration: ""
};
const initialPerformanceTrendFormData: PerformanceTrendFormData = { performanceData: "" };
const initialLessonFormData: MicroLessonFormData = { topic: '', proficiency: Proficiency.BEGINNER, format: LessonFormat.ANALOGY, language: VisualLessonLanguage.ENGLISH };
const initialQuizFormData: QuizFormData = { topic: '', proficiency: Proficiency.BEGINNER, performanceData: '' };
const initialProjectExplorerFormData: ProjectExplorerFormData = { prompt: '' };

const tools = [
  { id: 'start', name: 'Create Plan', icon: Icons.start, theme: 'indigo' },
  { id: 'lesson', name: 'Micro-Lesson', icon: Icons.lesson, theme: 'purple' },
  { id: 'quiz', name: 'Generate Quiz', icon: Icons.quiz, theme: 'amber' },
  { id: 'project-explorer', name: 'Project Explorer', icon: Icons.project, theme: 'emerald' },
  { id: 'progress', name: 'Analyze Progress', icon: Icons.progress, theme: 'rose' },
  { id: 'weekly-report', name: 'Weekly Report', icon: Icons.report, theme: 'cyan' },
];

const App = () => {
  const mainRef = useRef<HTMLElement>(null);
  const { isListening, transcript, startListening } = useSpeechRecognition();
  const [speechTarget, setSpeechTarget] = useState<{ form: string; field: string } | null>(null);
  
  const [activeTool, setActiveTool] = useState(tools[0].id);
  const [planState, setPlanState] = useState<{activityLog: ActivityLogEntry[], completedDays: boolean[]}>({ activityLog: [], completedDays: [] });

  const [onboardingFormData, setOnboardingFormData] = useState<OnboardingFormData>(initialOnboardingFormData);
  const [onboardingLoading, setOnboardingLoading] = useState<boolean>(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [integratedResult, setIntegratedResult] = useState<IntegratedPlan | null>(null);

  const [performanceTrendFormData, setPerformanceTrendFormData] = useState<PerformanceTrendFormData>(initialPerformanceTrendFormData);
  const [performanceTrendLoading, setPerformanceTrendLoading] = useState<boolean>(false);
  const [performanceTrendError, setPerformanceTrendError] = useState<string | null>(null);
  const [performanceTrendResult, setPerformanceTrendResult] = useState<PerformanceTrendAnalysis | null>(null);
  const [progressChartData, setProgressChartData] = useState<any | null>(null);

  const [lessonFormData, setLessonFormData] = useState<MicroLessonFormData>(initialLessonFormData);
  const [lessonLoading, setLessonLoading] = useState<boolean>(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [lessonResult, setLessonResult] = useState<LessonResult | null>(null);
  
  const [quizFormData, setQuizFormData] = useState<QuizFormData>(initialQuizFormData);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([]);

  const [projectExplorerFormData, setProjectExplorerFormData] = useState<ProjectExplorerFormData>(initialProjectExplorerFormData);
  const [projectExplorerLoading, setProjectExplorerLoading] = useState<boolean>(false);
  const [projectExplorerError, setProjectExplorerError] = useState<string | null>(null);
  const [projectExplorerResult, setProjectExplorerResult] = useState<ProjectSuggestion[] | null>(null);

  const [quizReportLoading, setQuizReportLoading] = useState<boolean>(false);
  const [quizReportError, setQuizReportError] = useState<string | null>(null);
  const [quizReportResult, setQuizReportResult] = useState<QuizReport | null>(null);

  const [weeklyReportLoading, setWeeklyReportLoading] = useState<boolean>(false);
  const [weeklyReportError, setWeeklyReportError] = useState<string | null>(null);
  const [weeklyReportResult, setWeeklyReportResult] = useState<WeeklyReport | null>(null);
  
  // Note Summarizer State
  const [isSummarizerOpen, setIsSummarizerOpen] = useState(false);
  const [notesToSummarize, setNotesToSummarize] = useState('');
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);


  // --- SPEECH TRANSCRIPT HANDLER ---
  useEffect(() => {
    if (transcript && speechTarget) {
        const { form, field } = speechTarget;
        switch (form) {
            case 'onboarding':
                setOnboardingFormData(prev => ({ ...prev, [field]: transcript }));
                break;
            case 'lesson':
                setLessonFormData(prev => ({ ...prev, [field]: transcript }));
                break;
            case 'quiz':
                setQuizFormData(prev => ({ ...prev, [field]: transcript }));
                break;
            case 'project-explorer':
                setProjectExplorerFormData(prev => ({ ...prev, [field]: transcript }));
                break;
        }
        setSpeechTarget(null); // Reset after applying
    }
  }, [transcript, speechTarget]);

  const handleSpeechRequest = (form: string, field: string) => {
    // Reset the target field's content before starting recognition.
    switch (form) {
        case 'onboarding':
            setOnboardingFormData(prev => ({ ...prev, [field]: '' }));
            break;
        case 'lesson':
            setLessonFormData(prev => ({ ...prev, [field]: '' }));
            break;
        case 'quiz':
            setQuizFormData(prev => ({ ...prev, [field]: '' }));
            break;
        case 'project-explorer':
            setProjectExplorerFormData(prev => ({ ...prev, [field]: '' }));
            break;
    }

    setSpeechTarget({ form, field });
    startListening();
  };

  const weeklyActivityLog = useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return planState.activityLog.filter(a => a.timestamp >= oneWeekAgo);
  }, [planState.activityLog]);
  
  const generatePerformanceLogFromActivity = useCallback((log: ActivityLogEntry[]): string => {
    if (log.length === 0) return "No activities logged yet. Complete some lessons or quizzes to see your progress.";
    const entries = log.map(item => {
        const date = new Date(item.timestamp).toLocaleString();
        if (item.type === 'LESSON_COMPLETED') return `${date}: Completed lesson on "${item.topic}".`;
        if (item.type === 'QUIZ_COMPLETED') return `${date}: Completed quiz on "${item.topic}" with score ${item.score} at ${item.proficiency} level.`;
        if (item.type === 'PLAN_DAY_COMPLETED') return `${date}: Completed plan day for "${item.day.topic}" (Activity: ${item.day.activityType}, Estimated Time: ${item.day.estimatedTime}).`;
        return '';
    }).join('\n');
    return `Summary of recent learning activities:\n\n${entries}`;
  }, []);

  const handleReset = useCallback(() => {
    setActiveTool(tools[0].id);
    setPlanState({ activityLog: [], completedDays: [] });
    setOnboardingFormData(initialOnboardingFormData);
    setPerformanceTrendFormData(initialPerformanceTrendFormData);
    setLessonFormData(initialLessonFormData);
    setQuizFormData(initialQuizFormData);
    setProjectExplorerFormData(initialProjectExplorerFormData);
    setOnboardingLoading(false); setOnboardingError(null); setIntegratedResult(null);
    setPerformanceTrendLoading(false); setPerformanceTrendError(null); setPerformanceTrendResult(null); setProgressChartData(null);
    setLessonLoading(false); setLessonError(null); setLessonResult(null);
    setQuizLoading(false); setQuizError(null); setQuizResult(null); setSelectedAnswers([]);
    setProjectExplorerLoading(false); setProjectExplorerError(null); setProjectExplorerResult(null);
    setQuizReportLoading(false); setQuizReportError(null); setQuizReportResult(null);
    setWeeklyReportLoading(false); setWeeklyReportError(null); setWeeklyReportResult(null);
    setTimeout(() => { mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
  }, []);

  const handleToolSelect = useCallback((toolId: string) => {
    setActiveTool(toolId);
    if (toolId === 'quiz') { setQuizResult(null); setQuizReportResult(null); setSelectedAnswers([]); setQuizError(null); }
    if (toolId === 'progress') {
        const performanceLog = generatePerformanceLogFromActivity(planState.activityLog);
        setPerformanceTrendFormData({ performanceData: performanceLog });
    }
    if (toolId === 'project-explorer') { setProjectExplorerResult(null); setProjectExplorerError(null); }
    setTimeout(() => { document.getElementById('tool-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
  }, [planState.activityLog, generatePerformanceLogFromActivity]);

  const handleOnboardingFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; setOnboardingFormData((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleOnboardingRadioChange = useCallback((name: keyof OnboardingFormData, value: Proficiency | LearningStyle) => {
    setOnboardingFormData((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setOnboardingLoading(true); setOnboardingError(null); setIntegratedResult(null);
    try {
      const planResult = await generateIntegratedPlan(onboardingFormData);
      setIntegratedResult(planResult);
      setPlanState(prev => ({ ...prev, completedDays: Array(planResult.learningPlan.length).fill(false) }));
    } catch (err) { setOnboardingError(err instanceof Error ? `Failed to generate plan: ${err.message}` : 'An unknown error occurred.');
    } finally { setOnboardingLoading(false); }
  };
  
  const handleToggleDay = (index: number) => {
    setPlanState(prev => {
        const wasCompleted = prev.completedDays[index];
        // Use map for guarantened immutability and cleaner update, fixing potential state bugs.
        const newCompletedDays = prev.completedDays.map((c, i) => i === index ? !c : c);
        
        const planDayId = `plan-day-${index}`;
        let newActivityLog;

        if (!wasCompleted) {
            const dayData = integratedResult?.learningPlan[index];
            if (dayData) {
                newActivityLog = [...prev.activityLog, { type: 'PLAN_DAY_COMPLETED' as const, day: dayData, timestamp: Date.now(), planDayId }];
            } else {
                newActivityLog = prev.activityLog;
            }
        } else {
            newActivityLog = prev.activityLog.filter(entry => !(entry.type === 'PLAN_DAY_COMPLETED' && entry.planDayId === planDayId));
        }
        
        // Return a new object with the updated parts, preserving any other state properties.
        return { ...prev, completedDays: newCompletedDays, activityLog: newActivityLog };
    });
  };

  const handlePerformanceTrendSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setPerformanceTrendLoading(true); setPerformanceTrendError(null); setPerformanceTrendResult(null); setProgressChartData(null);
    try {
        const report = await generatePerformanceTrendAnalysis(performanceTrendFormData);
        setPerformanceTrendResult(report);
        const activityDistribution = {
            lessons: planState.activityLog.filter(a => a.type === 'LESSON_COMPLETED').length,
            quizzes: planState.activityLog.filter(a => a.type === 'QUIZ_COMPLETED').length,
            planDays: planState.activityLog.filter(a => a.type === 'PLAN_DAY_COMPLETED').length,
        };
        const topicCounts: { [key: string]: number } = {};
        planState.activityLog.forEach(activity => {
            if ((activity.type === 'LESSON_COMPLETED' || activity.type === 'QUIZ_COMPLETED') && activity.topic) topicCounts[activity.topic] = (topicCounts[activity.topic] || 0) + 1;
            else if (activity.type === 'PLAN_DAY_COMPLETED' && activity.day.topic) topicCounts[activity.day.topic] = (topicCounts[activity.day.topic] || 0) + 1;
        });
        const topicFrequency = Object.entries(topicCounts).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count);
        setProgressChartData({ activityDistribution, topicFrequency });
    } catch (err) { setPerformanceTrendError(err instanceof Error ? `Failed to analyze trends: ${err.message}` : 'An unknown error occurred.');
    } finally { setPerformanceTrendLoading(false); }
  };

  const handleLessonFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target; setLessonFormData((prev: MicroLessonFormData) => ({...prev, [name]: value}));
  }, []);
  const handleLessonRadioChange = useCallback((name: keyof MicroLessonFormData, value: Proficiency | LessonFormat | VisualLessonLanguage) => {
    setLessonFormData((prev: MicroLessonFormData) => ({ ...prev, [name]: value }));
  }, []);
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLessonLoading(true); setLessonError(null); setLessonResult(null);
    try {
        const lesson = await generateMicroLesson(lessonFormData);
        setLessonResult(lesson);
        setPlanState(prev => ({ ...prev, activityLog: [...prev.activityLog, { type: 'LESSON_COMPLETED', topic: lessonFormData.topic, timestamp: Date.now() }] }));
    } catch (err) { setLessonError(err instanceof Error ? `Failed to generate lesson: ${err.message}` : 'An unknown error occurred.');
    } finally { setLessonLoading(false); }
  };

  const handleProjectExplorerFormChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { name, value } = e.target; setProjectExplorerFormData((prev: ProjectExplorerFormData) => ({...prev, [name]: value}));
  }, []);
  
  const findProjects = useCallback(async (prompt: string) => {
    setProjectExplorerLoading(true);
    setProjectExplorerError(null);
    setProjectExplorerResult(null);
    try {
        const result = await generateProjectSuggestions({ prompt });
        setProjectExplorerResult(result);
    } catch (err) {
        setProjectExplorerError(err instanceof Error ? `Failed to find projects: ${err.message}` : 'An unknown error occurred.');
    } finally {
        setProjectExplorerLoading(false);
    }
  }, []);
  
  const handleProjectExplorerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await findProjects(projectExplorerFormData.prompt);
  };
  
  const handleQuizFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target; setQuizFormData((prev: QuizFormData) => ({...prev, [name]: value}));
  }, []);
  const handleQuizRadioChange = useCallback((name: keyof QuizFormData, value: Proficiency) => {
    setQuizFormData((prev: QuizFormData) => ({ ...prev, [name]: value }));
  }, []);
  const handleQuizSubmit = useCallback(async (e: React.FormEvent, overrideTopic?: string) => {
    e.preventDefault(); setQuizLoading(true); setQuizError(null); setQuizResult(null); setSelectedAnswers([]); setQuizReportResult(null);
    const topicToUse = overrideTopic || quizFormData.topic;
    if (!topicToUse) { setQuizError("Please enter a topic for the quiz."); setQuizLoading(false); return; }
    const historyForTopic = planState.activityLog
        .filter((item): item is Extract<ActivityLogEntry, {type: 'QUIZ_COMPLETED'}> => item.type === 'QUIZ_COMPLETED' && item.topic.toLowerCase() === topicToUse.toLowerCase())
        .map(item => `On ${new Date(item.timestamp).toLocaleDateString()}, scored ${item.score} on this topic.`).join('\n');
    const dataForGemini: QuizFormData = { ...quizFormData, topic: topicToUse, performanceData: historyForTopic || "No prior performance on this specific topic." };
    try {
        const quiz = await generateQuiz(dataForGemini);
        setQuizResult(quiz);
        setSelectedAnswers(Array(quiz.length).fill(null));
    } catch (err) { setQuizError(err instanceof Error ? `Failed to generate quiz: ${err.message}` : 'An unknown error occurred.');
    } finally { setQuizLoading(false); }
  }, [planState.activityLog, quizFormData]);
  
   const handleQuizCompletion = useCallback((result: { topic: string; score: string; proficiency: Proficiency; }) => {
    setPlanState(prev => ({...prev, activityLog: [...prev.activityLog, { type: 'QUIZ_COMPLETED', topic: result.topic, score: result.score, proficiency: result.proficiency, timestamp: Date.now() }]}));
  }, []);
  const handleRetakeQuiz = useCallback((topic: string) => {
    setQuizFormData(prev => ({ ...prev, topic }));
    handleQuizSubmit({ preventDefault: () => {} } as React.FormEvent, topic);
    document.getElementById('tool-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [handleQuizSubmit]);
  const handleTryNewTopic = useCallback(() => {
    setQuizResult(null); setQuizReportResult(null); setSelectedAnswers([]); setQuizError(null); setQuizFormData(prev => ({ ...prev, topic: '' }));
  }, []);

  const handleGenerateReportFromQuiz = useCallback(async (data: QuizReportFormData) => {
    setQuizReportLoading(true); setQuizReportError(null); setQuizReportResult(null);
    try {
        const report = await generateQuizReport(data); setQuizReportResult(report);
    } catch (err) { setQuizReportError(err instanceof Error ? `Failed to generate quiz report: ${err.message}` : 'An unknown error occurred.');
    } finally { setQuizReportLoading(false); }
  }, []);

  const handleGenerateAutomatedWeeklyReport = async (e: React.FormEvent) => {
    e.preventDefault(); setWeeklyReportLoading(true); setWeeklyReportError(null); setWeeklyReportResult(null);
    const totalLessons = weeklyActivityLog.filter(a => a.type === 'LESSON_COMPLETED').length;
    const totalQuizzes = weeklyActivityLog.filter(a => a.type === 'QUIZ_COMPLETED').length;
    const totalPlanDays = weeklyActivityLog.filter(a => a.type === 'PLAN_DAY_COMPLETED').length;
    const quizScoresRaw = weeklyActivityLog.filter((item): item is Extract<ActivityLogEntry, {type: 'QUIZ_COMPLETED'}> => item.type === 'QUIZ_COMPLETED').map(item => item.score);
    let averageQuizScore: number | null = null;
    if (quizScoresRaw.length > 0) {
        const percentages = quizScoresRaw.map(score => { const [correct, total] = score.split('/').map(Number); return total > 0 ? (correct / total) * 100 : 0; });
        averageQuizScore = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    }
    const activitySummary = generatePerformanceLogFromActivity(weeklyActivityLog);
    const weeklyReportData: WeeklyReportFormData = { totalLessons, totalQuizzes, totalPlanDays, averageQuizScore, activitySummary };
    try {
        const report = await generateWeeklyReport(weeklyReportData); setWeeklyReportResult(report);
    } catch (err) { setWeeklyReportError(err instanceof Error ? `Failed to generate report: ${err.message}` : 'An unknown error occurred.');
    } finally { setWeeklyReportLoading(false); }
  };
  
  const handleStartQuizFromPlan = useCallback((topic: string) => {
    handleToolSelect('quiz'); setQuizFormData((prev: QuizFormData) => ({...prev, topic})); setQuizResult(null); setSelectedAnswers([]); setQuizError(null); setQuizReportResult(null);
  }, [handleToolSelect]);
  const handleStartLessonFromPlan = useCallback((topic: string) => {
      handleToolSelect('lesson'); setLessonFormData((prev: MicroLessonFormData) => ({...prev, topic})); setLessonResult(null); setLessonError(null);
  }, [handleToolSelect]);

  const handleStartProjectFromPlan = useCallback((topic: string) => {
    handleToolSelect('project-explorer');
    setProjectExplorerFormData({ prompt: topic });
    findProjects(topic);
    setTimeout(() => { document.getElementById('project-explorer-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  }, [handleToolSelect, findProjects]);

  const handleResetSummarizer = () => {
    setNotesToSummarize('');
    setSummaryResult(null);
    setSummaryError(null);
    setSummaryLoading(false);
  };

  const handleToggleSummarizer = () => {
    setIsSummarizerOpen(prev => {
        if (prev) { // If we are closing it
            handleResetSummarizer();
        }
        return !prev;
    });
  };

  const handleSummarizeNotes = async (e: FormEvent) => {
    e.preventDefault();
    if (!notesToSummarize.trim()) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryResult(null);
    try {
        const result = await summarizeNotes(notesToSummarize);
        setSummaryResult(result);
    } catch (err) {
        setSummaryError(err instanceof Error ? err.message : 'An unknown error occurred during summarization.');
    } finally {
        setSummaryLoading(false);
    }
  };

  const renderActiveForm = () => {
    const activeToolData = tools.find(t => t.id === activeTool);
    if (!activeToolData) return null;
    
    let formContent;
    const speechProps = { isListening, onSpeechRequest: handleSpeechRequest, speechTarget };
    switch(activeTool) {
      case 'start':
        formContent = <OnboardingForm formData={onboardingFormData} isLoading={onboardingLoading} onFormChange={handleOnboardingFormChange} onRadioChange={handleOnboardingRadioChange} onSubmit={handleOnboardingSubmit} {...speechProps} />;
        break;
      case 'progress':
        formContent = <PerformanceTrendForm formData={performanceTrendFormData} isLoading={performanceTrendLoading} onSubmit={handlePerformanceTrendSubmit} />;
        break;
      case 'lesson':
        formContent = <MicroLessonForm formData={lessonFormData} isLoading={lessonLoading} onFormChange={handleLessonFormChange} onRadioChange={handleLessonRadioChange} onSubmit={handleLessonSubmit} {...speechProps} />;
        break;
      case 'project-explorer':
        formContent = <ProjectExplorerForm formData={projectExplorerFormData} isLoading={projectExplorerLoading} onFormChange={handleProjectExplorerFormChange} onSubmit={handleProjectExplorerSubmit} {...speechProps} />;
        break;
      case 'quiz':
        const quizHistoryEntries = planState.activityLog.filter((item): item is Extract<ActivityLogEntry, {type: 'QUIZ_COMPLETED'}> => item.type === 'QUIZ_COMPLETED').sort((a,b) => b.timestamp - a.timestamp);
        formContent = (
            <>
                <QuizForm formData={quizFormData} isLoading={quizLoading} onFormChange={handleQuizFormChange} onRadioChange={handleQuizRadioChange} onSubmit={handleQuizSubmit} {...speechProps} />
                <QuizHistory history={quizHistoryEntries} onRetake={handleRetakeQuiz} />
            </>
        );
        break;
      case 'weekly-report':
        formContent = <ActivityReportGenerator weeklyActivityLog={weeklyActivityLog} isLoading={weeklyReportLoading} onSubmit={handleGenerateAutomatedWeeklyReport} />;
        break;
      default: formContent = null;
    }
    
    return (
        <div id="tool-form">
            <ToolFormCard title={activeToolData.name} icon={activeToolData.icon} theme={activeToolData.theme}>
                {formContent}
            </ToolFormCard>
        </div>
    )
  }

  const renderActiveContent = () => {
     switch(activeTool) {
        case 'start':
            if (onboardingLoading) return <Loader message="Crafting Your Personalized Plan..." />;
            if (onboardingError) return <p className="text-red-400 text-center animate-fade-in-up">{onboardingError}</p>;
            if (integratedResult) return (
                <div className="space-y-8">
                    <ProfileCard profile={integratedResult.learnerProfile} />
                    <AssessmentSuggestions suggestions={integratedResult.knowledgeAssessment} />
                    <AgentGoals goals={integratedResult.agentGoals} />
                    <LearningPlanCard 
                      plan={integratedResult.learningPlan} 
                      onStartQuiz={handleStartQuizFromPlan} 
                      onStartLesson={handleStartLessonFromPlan}
                      onStartProject={handleStartProjectFromPlan}
                      completedDays={planState.completedDays} 
                      onToggleDay={handleToggleDay} 
                    />
                </div>
            );
            return null;
        case 'progress':
            if (performanceTrendLoading) return <Loader message="Analyzing Your Progress..." />;
            if (performanceTrendError) return <p className="text-red-400 text-center animate-fade-in-up">{performanceTrendError}</p>;
            if (performanceTrendResult) return <PerformanceTrendCard analysis={performanceTrendResult} chartData={progressChartData} onStartQuiz={handleStartQuizFromPlan} onStartLesson={handleStartLessonFromPlan} />;
            return null;
        case 'lesson':
            if (lessonLoading) return <Loader message="Generating Your Lesson..." />;
            if (lessonError) return <p className="text-red-400 text-center animate-fade-in-up">{lessonError}</p>;
            if (lessonResult) return <MicroLessonCard topic={lessonFormData.topic} lesson={lessonResult} />;
            return null;
        case 'project-explorer':
            if (projectExplorerLoading) return <Loader message="Scouting for Projects..." />;
            if (projectExplorerError) return <p className="text-red-400 text-center animate-fade-in-up">{projectExplorerError}</p>;
            if (projectExplorerResult) return <div id="project-explorer-results"><ProjectResultCard projects={projectExplorerResult} /></div>;
            return null;
        case 'quiz':
            if (quizLoading) return <Loader message="Building Your Quiz..." />;
            if (quizError) return <p className="text-red-400 text-center animate-fade-in-up">{quizError}</p>;
            if (quizResult) return <>
                <QuizCard 
                    topic={quizFormData.topic || (quizResult.length > 0 ? 'Current Quiz' : '')} 
                    quiz={quizResult}
                    proficiency={quizFormData.proficiency}
                    selectedAnswers={selectedAnswers}
                    setSelectedAnswers={setSelectedAnswers}
                    onGenerateReport={handleGenerateReportFromQuiz} 
                    isReportLoading={quizReportLoading} 
                    onQuizComplete={handleQuizCompletion} 
                    onRetake={handleRetakeQuiz}
                    onTryNewTopic={handleTryNewTopic}
                    isReportGenerated={quizReportResult !== null}
                />
                {quizReportLoading && <Loader message="Generating Your Report..." />}
                {quizReportError && <p className="text-red-400 text-center animate-fade-in-up">{quizReportError}</p>}
                {quizReportResult && <QuizReportCard report={quizReportResult} />}
            </>;
            return null;
        case 'weekly-report':
            if (weeklyReportLoading) return <Loader message="Compiling Your Weekly Report..." />;
            if (weeklyReportError) return <p className="text-red-400 text-center animate-fade-in-up">{weeklyReportError}</p>;
            if (weeklyReportResult) return <WeeklyReportCard report={weeklyReportResult} onStartQuiz={handleStartQuizFromPlan} onStartLesson={handleStartLessonFromPlan} />;
            return null;
        default:
            return null;
    }
  }

  const activeContent = renderActiveContent();

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header ref={mainRef} className="text-center my-12 animate-fade-in">
          <div className="absolute top-4 right-6 flex items-center gap-3">
             <button 
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800/50 border border-slate-700 rounded-full hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-bg-primary"
                aria-label="Reset application and start over"
              >
                Start Over
              </button>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-400 to-purple-400 pb-2">
            DevBeeZ
          </h1>
          <p className="mt-2 text-lg text-slate-300/80">
            Your personal AI-powered learning Bee
          </p>
        </header>

        <main className="space-y-12">
            <nav className="flex flex-wrap gap-3 p-2 bg-black/20 rounded-xl border border-cyan-300/10 animate-fade-in-up">
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className={`flex-grow flex items-center justify-center gap-3 px-4 py-3 text-sm rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary ${activeTool === tool.id 
                            ? `bg-cyan-500/10 text-cyan-300 font-semibold shadow-lg shadow-cyan-500/10 border border-cyan-400/30` 
                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent'}`}
                    >
                        <span className={`transition-colors ${activeTool === tool.id ? 'text-cyan-300' : 'text-slate-400'}`}>{tool.icon}</span>
                        <span>{tool.name}</span>
                    </button>
                ))}
            </nav>
            
            <div className="space-y-8">
                {renderActiveForm()}

                <div className="min-h-[400px] flex flex-col justify-start">
                  <div key={activeTool} className="flex-grow flex flex-col">
                    {activeContent === null ? (
                       <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-8 animate-fade-in-up">
                          <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5-2.5-7C1.443 3.443 0 5.864 0 9c0 4.418 3.582 8 8 8s8-3.582 8-8c0-1.23-.312-2.38-.857-3.429C13.62 7.688 12 10 12 10s1.688-2.313 3.429-4.143c2.243 1.223 3.571 3.57 3.571 6.143 0 3.866-3.134 7-7 7-2.138 0-4.066-.95-5.429-2.429.933 1.25 2.429 2.429 4.429 2.429 2.21 0 4-1.79 4-4 0-1.742-1.122-3.22-2.657-3.843" /></svg>
                          </div>
                          <h3 className="mt-6 text-xl font-semibold text-slate-300">Awaiting Input</h3>
                          <p className="mt-2 text-base text-slate-500">Your generated results will appear here.</p>
                       </div>
                    ) : activeContent}
                  </div>
                </div>
            </div>
        </main>
      </div>
       <NoteSummarizer
            isOpen={isSummarizerOpen}
            onToggle={handleToggleSummarizer}
            onReset={handleResetSummarizer}
            notes={notesToSummarize}
            onNotesChange={setNotesToSummarize}
            onSubmit={handleSummarizeNotes}
            summary={summaryResult}
            isLoading={summaryLoading}
            error={summaryError}
        />
    </div>
  );
};

export default App;