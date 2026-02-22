
import { useMemo } from 'react';
import { LearningPlan, LearningPlanDay } from '../types';

const activityIcons = {
    Video: '▶️',
    Quiz: '📝',
    Project: '💻',
    Reading: '📖',
    Practice: '✍️',
};

interface LearningPlanCardProps {
    plan: LearningPlan;
    onStartQuiz: (topic: string) => void;
    onStartLesson: (topic: string) => void;
    onStartProject: (topic: string) => void;
    completedDays: boolean[];
    onToggleDay: (index: number) => void;
}

const LearningPlanCard = ({ plan, onStartQuiz, onStartLesson, onStartProject, completedDays, onToggleDay }: LearningPlanCardProps) => {
    
    const completedCount = useMemo(() => completedDays.filter(Boolean).length, [completedDays]);
    const progressPercentage = plan.length > 0 ? (completedCount / plan.length) * 100 : 0;

    const getActionButton = (day: LearningPlanDay) => {
        if (day.activityType === 'Quiz' || day.activityType === 'Practice') {
            return <button onClick={() => onStartQuiz(day.topic)} className="text-xs font-bold py-1 px-3 rounded-full transition-all duration-300 border border-amber-500/50 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 hover:text-white hover:border-amber-500">Start Quiz</button>;
        }
        if (day.activityType === 'Project') {
            return <button onClick={() => onStartProject(day.topic)} className="text-xs font-bold py-1 px-3 rounded-full transition-all duration-300 border border-emerald-500/50 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-white hover:border-emerald-500">Explore Projects</button>;
        }
        if (['Video', 'Reading'].includes(day.activityType)) {
             return <button onClick={() => onStartLesson(day.topic)} className="text-xs font-bold py-1 px-3 rounded-full transition-all duration-300 border border-purple-500/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white hover:border-purple-500">Get Lesson</button>;
        }
        return null;
    };
    
    const chunk = (arr: LearningPlanDay[], size: number): LearningPlanDay[][] =>
      Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
      );

    const weeks = chunk(plan, 7);

    const renderWeek = (weekData: LearningPlanDay[], weekNumber: number, startingIndex: number) => (
        <div key={weekNumber} className="animate-fade-in-up" style={{ animationDelay: `${weekNumber * 100}ms` }}>
            <h4 className="text-lg font-bold text-emerald-400 mt-4 mb-3">Week {weekNumber}</h4>
            <div className="space-y-3">
                {weekData.map((day, dayIndexInWeek) => {
                    const overallIndex = startingIndex + dayIndexInWeek;
                    const isCompleted = completedDays[overallIndex];
                    return (
                        <div 
                            key={overallIndex} 
                            style={{ animationDelay: `${dayIndexInWeek * 50}ms` }}
                            className={`p-4 bg-slate-800/50 rounded-lg border border-slate-700 transition-all duration-300 ease-out stagger-children-item ${isCompleted ? 'opacity-60 saturate-50' : 'opacity-100 hover:bg-slate-700/50 hover:shadow-md hover:-translate-y-1 hover:border-slate-600'}`}>
                            <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-center">
                               <div className="col-span-1 flex items-center">
                                    <input 
                                        type="checkbox"
                                        checked={isCompleted}
                                        onChange={() => onToggleDay(overallIndex)}
                                        className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                        aria-label={`Mark Day ${day.day} as complete`}
                                    />
                                </div>
                                <div className={`col-span-11 md:col-span-5 font-semibold text-slate-200 flex items-center transition-all duration-300 ${isCompleted ? 'line-through' : ''}`}>
                                  <span className="text-sm font-mono bg-slate-700/50 rounded px-2 py-1 mr-3">{day.day}</span>
                                  {day.topic}
                                </div>
                                <div className="col-span-full md:col-span-2 text-sm text-slate-300 flex items-center md:justify-center">
                                    <span className="mr-2" role="img" aria-label={day.activityType}>{activityIcons[day.activityType as keyof typeof activityIcons] || '-'}</span>
                                    {day.activityType}
                                </div>
                                <div className="col-span-full md:col-span-2 text-sm text-slate-400 flex items-center md:justify-center">{day.estimatedTime}</div>
                                <div className="col-span-full md:col-span-2 text-sm text-slate-300 flex items-center justify-end">
                                    {getActionButton(day)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-xl font-semibold text-slate-300">Your Adaptive Learning Path</h3>
            
            {/* Progress Bar */}
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-emerald-400">Progress</span>
                    <span className="text-sm font-medium text-slate-300">{completedCount} of {plan.length} days</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            {weeks.map((week, index) => renderWeek(week, index + 1, index * 7))}
        </div>
    );
};

export default LearningPlanCard;
