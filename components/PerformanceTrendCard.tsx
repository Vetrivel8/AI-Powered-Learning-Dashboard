
import { PerformanceTrendAnalysis, PriorityLevel } from '../types';

const PriorityBadge = ({ priority }: { priority: PriorityLevel }) => {
    const priorityStyles: Record<PriorityLevel, string> = {
        [PriorityLevel.HIGH]: 'bg-red-500/20 text-red-400 border-red-500/30',
        [PriorityLevel.MEDIUM]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        [PriorityLevel.LOW]: 'bg-green-500/20 text-green-400 border-green-500/30',
    };

    return (
        <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full border ${priorityStyles[priority] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
            {priority} Priority
        </span>
    );
};

const Sparkline = ({ data }: { data: number[] }) => {
    if (data.length < 2) {
        return <div className="text-center text-sm text-slate-500">Not enough data to draw a trend line.</div>;
    }

    const width = 300;
    const height = 60;
    const padding = 5;

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d - minVal) / range) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');

    const lastPoint = points.split(' ').pop()?.split(',');
    const trendColor = data[data.length - 1] >= data[0] ? 'stroke-green-400' : 'stroke-red-400';

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <polyline
                    fill="none"
                    strokeWidth="2"
                    points={points}
                    className={`${trendColor} transition-all`}
                />
                {lastPoint && (
                     <circle cx={lastPoint[0]} cy={lastPoint[1]} r="3" className={`${trendColor.replace('stroke', 'fill')} animate-pulse`} />
                )}
            </svg>
             <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Start: {data[0]}%</span>
                <span>End: {data[data.length - 1]}%</span>
            </div>
        </div>
    );
};

const PieChart = ({ data }: { data: { lessons: number; quizzes: number; planDays: number; } }) => {
    const { lessons, quizzes, planDays } = data;
    const total = lessons + quizzes + planDays;
    if (total === 0) return <div className="text-center text-sm text-slate-500 p-4">No activity to display.</div>;

    const lessonDeg = (lessons / total) * 360;
    const quizDeg = (quizzes / total) * 360;

    const gradient = `conic-gradient(
        #a855f7 0 ${lessonDeg}deg,
        #f59e0b ${lessonDeg}deg ${lessonDeg + quizDeg}deg,
        #6366f1 ${lessonDeg + quizDeg}deg 360deg
    )`;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
            <div className="w-32 h-32 rounded-full flex-shrink-0 transition-all" style={{ background: gradient }}></div>
            <div className="space-y-2 text-sm stagger-children">
                <div style={{animationDelay: '100ms'}} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className="text-slate-300">Lessons ({lessons})</span>
                </div>
                <div style={{animationDelay: '200ms'}} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-slate-300">Quizzes ({quizzes})</span>
                </div>
                <div style={{animationDelay: '300ms'}} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                    <span className="text-slate-300">Plan Days ({planDays})</span>
                </div>
            </div>
        </div>
    );
};

const BarChart = ({ data }: { data: { topic: string; count: number; }[] }) => {
    if (data.length === 0) return <div className="text-center text-sm text-slate-500 p-4">No topics studied yet.</div>;
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="space-y-3 stagger-children">
            {data.slice(0, 5).map(({ topic, count }, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-center text-sm" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="col-span-1 truncate text-slate-300 font-medium" title={topic}>{topic}</div>
                    <div className="col-span-3">
                        <div className="flex items-center bg-slate-700/50 rounded-md h-6">
                            <div
                                className="bg-rose-500 rounded-md h-full flex items-center justify-end px-2 text-white font-semibold text-xs transition-all duration-500 ease-out"
                                style={{ width: `${(count / maxCount) * 100}%` }}
                            >
                                {count}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


// Helper to extract a topic from an action string
const extractTopic = (action: string): string => {
    // Look for text in quotes
    const quotedMatch = action.match(/["'](.*?)["']/);
    if (quotedMatch) return quotedMatch[1];
    
    // Fallback: remove the verb and return the rest
    const words = ['revise', 'retake quiz on', 'study', 'learn', 'practice', 'advance to'];
    const lowerAction = action.toLowerCase();
    for (const word of words) {
        if (lowerAction.startsWith(word)) {
            return action.substring(word.length).trim().replace(/^['"]|['"]$/g, '');
        }
    }
    return action; // return original if no keyword found
}


interface PerformanceTrendCardProps {
    analysis: PerformanceTrendAnalysis;
    chartData: {
        activityDistribution: { lessons: number; quizzes: number; planDays: number; };
        topicFrequency: { topic: string; count: number; }[];
    } | null;
    onStartQuiz: (topic: string) => void;
    onStartLesson: (topic: string) => void;
}

const PerformanceTrendCard = ({ analysis, chartData, onStartQuiz, onStartLesson }: PerformanceTrendCardProps) => {
    
    const renderAction = (action: string, index: number) => {
        const lowerAction = action.toLowerCase();
        const topic = extractTopic(action);

        if (lowerAction.includes('quiz') || lowerAction.includes('practice') || lowerAction.includes('challenge')) {
            return (
                 <li key={index} style={{animationDelay: `${index * 100}ms`}} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md">
                    <span>{action}</span>
                    <button onClick={() => onStartQuiz(topic)} className="text-xs font-bold py-1 px-3 rounded-full transition-all duration-300 border border-amber-500/50 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 hover:text-white hover:border-amber-500">Start Quiz</button>
                </li>
            );
        }

        if (lowerAction.includes('revise') || lowerAction.includes('learn') || lowerAction.includes('study') || lowerAction.includes('lesson')) {
             return (
                 <li key={index} style={{animationDelay: `${index * 100}ms`}} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-md">
                    <span>{action}</span>
                    <button onClick={() => onStartLesson(topic)} className="text-xs font-bold py-1 px-3 rounded-full transition-all duration-300 border border-purple-500/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white hover:border-purple-500">Get Lesson</button>
                </li>
            );
        }

        return <li key={index} style={{animationDelay: `${index * 100}ms`}} className="p-3 bg-slate-700/50 rounded-md">{action}</li>; // Fallback for non-actionable items
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-start">
                 <h3 className="text-xl font-semibold text-slate-300">Performance Trend Analysis</h3>
                 <PriorityBadge priority={analysis.priority} />
            </div>
            
            {chartData && (chartData.activityDistribution.lessons > 0 || chartData.activityDistribution.quizzes > 0 || chartData.activityDistribution.planDays > 0) && (
                 <div className="space-y-5 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-fade-in-up">
                    <h4 className="flex items-center text-lg font-semibold text-rose-400 mb-4">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                           <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                        </svg>
                        Visual Summary
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h5 className="text-base font-semibold text-slate-300 mb-3 text-center lg:text-left">Activity Distribution</h5>
                            <PieChart data={chartData.activityDistribution} />
                        </div>
                         <div>
                            <h5 className="text-base font-semibold text-slate-300 mb-3 text-center lg:text-left">Top Studied Topics</h5>
                            <BarChart data={chartData.topicFrequency} />
                        </div>
                    </div>
                </div>
            )}

             {analysis.trendData && analysis.trendData.length > 0 && (
                <div className="animate-fade-in-up">
                     <h4 className="flex items-center text-lg font-semibold text-rose-400 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Quiz Score Trend
                    </h4>
                    <Sparkline data={analysis.trendData} />
                </div>
            )}
            
            <div className="space-y-5 p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-fade-in-up">
                <div>
                    <h4 className="text-lg font-semibold text-rose-400 mb-2">
                        Key Insights
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2 stagger-children">
                        {analysis.insights.map((item, index) => <li key={index} style={{animationDelay: `${index * 100}ms`}}>{item}</li>)}
                    </ul>
                </div>

                <div>
                    <h4 className="flex items-center text-lg font-semibold text-sky-400 mb-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        Recommended Actions
                    </h4>
                     <ul className="space-y-2 text-slate-300 font-medium stagger-children">
                        {analysis.actions.map(renderAction)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PerformanceTrendCard;
