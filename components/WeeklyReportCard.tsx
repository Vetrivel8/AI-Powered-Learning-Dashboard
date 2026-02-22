
import type { ReactNode } from 'react';
import { WeeklyReport } from '../types';

interface WeeklyReportCardProps {
    report: WeeklyReport;
    onStartQuiz: (topic: string) => void;
    onStartLesson: (topic: string) => void;
}

const StatCard = ({ icon, value, label, color, delay }: { icon: ReactNode; value: string | number | null; label: string; color: string; delay: number }) => (
    <div 
        className="flex-1 p-4 bg-slate-800/60 rounded-lg text-center border border-slate-700 animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`text-3xl ${color}`}>{icon}</div>
        <div className={`text-2xl font-bold mt-2 ${color}`}>{value ?? 'N/A'}</div>
        <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
);

const Icons = {
    lesson: <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.247-8.248l10.494 4.996M6.753 18l10.494-4.996" /></svg>,
    quiz: <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01" /></svg>,
    plan: <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    score: <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 21.945A9.001 9.001 0 0013 3.055V13h8.945a9.001 9.001 0 00-8.945 8.945z" /></svg>,
};


const WeeklyReportCard = ({ report, onStartQuiz, onStartLesson }: WeeklyReportCardProps) => {
    const { weeklyStats, improvements, weakAreas, nextStep, motivation } = report;

    const getActionButton = () => {
        if (!nextStep.action) return null;

        const { type, topic } = nextStep.action;
        if (type === 'quiz') {
            return (
                <button
                    onClick={() => onStartQuiz(topic)}
                    className="mt-4 w-full sm:w-auto inline-flex justify-center items-center py-2 px-6 border border-amber-500/80 rounded-md shadow-lg shadow-amber-500/20 text-sm font-medium text-amber-200 bg-amber-600/20 hover:bg-amber-600/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-bg-primary transition-all"
                >
                    Practice: {topic}
                </button>
            );
        }
        if (type === 'lesson') {
            return (
                 <button
                    onClick={() => onStartLesson(topic)}
                    className="mt-4 w-full sm:w-auto inline-flex justify-center items-center py-2 px-6 border border-purple-500/80 rounded-md shadow-lg shadow-purple-500/20 text-sm font-medium text-purple-200 bg-purple-600/20 hover:bg-purple-600/40 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-bg-primary transition-all"
                >
                    Learn: {topic}
                </button>
            )
        }
        return null;
    }
    
    return (
        <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-500 animate-fade-in-up">
                Your Weekly Debrief
            </h3>
            
            {/* Stats Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="flex flex-col sm:flex-row gap-4">
                    <StatCard icon={<div className="w-8 h-8 mx-auto">{Icons.lesson}</div>} value={weeklyStats.lessons} label="Lessons Done" color="text-purple-400" delay={200} />
                    <StatCard icon={<div className="w-8 h-8 mx-auto">{Icons.quiz}</div>} value={weeklyStats.quizzes} label="Quizzes Taken" color="text-amber-400" delay={300} />
                    <StatCard icon={<div className="w-8 h-8 mx-auto">{Icons.plan}</div>} value={weeklyStats.planDays} label="Plan Days Done" color="text-emerald-400" delay={400} />
                    <StatCard 
                        icon={<div className="w-8 h-8 mx-auto">{Icons.score}</div>}
                        value={weeklyStats.averageScore !== null ? `${weeklyStats.averageScore.toFixed(0)}%` : null} 
                        label="Avg. Score" 
                        color="text-sky-400" 
                        delay={500}
                    />
                </div>
            </div>

            {/* Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <h4 className="flex items-center text-lg font-semibold text-green-400 mb-2">
                        Key Accomplishments
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {improvements.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                 <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                    <h4 className="flex items-center text-lg font-semibold text-yellow-400 mb-2">
                        Areas for Focus
                    </h4>
                     <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {weakAreas.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            </div>

            {/* Next Goal */}
            <div className="p-6 bg-slate-900/50 rounded-lg border-t-4 border-cyan-500 text-center shadow-lg animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                 <h4 className="flex items-center justify-center text-xl font-bold text-sky-300 mb-2">
                    Your Goal For Next Week
                </h4>
                <p className="text-lg font-semibold text-white">{nextStep.title}</p>
                <p className="text-slate-400 mt-2 max-w-xl mx-auto">{nextStep.description}</p>
                {getActionButton()}
            </div>

            {/* Motivation */}
            <div className="p-4 bg-slate-800/50 rounded-lg text-center animate-fade-in-up" style={{ animationDelay: '900ms' }}>
                <blockquote className="italic text-cyan-300/80">
                    "{motivation}"
                </blockquote>
            </div>
        </div>
    );
};

export default WeeklyReportCard;
