import { QuizReport, DetailedScore } from '../types';

const CircularProgress = ({ percentage }: { percentage: number }) => {
    const radius = 50;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = (p: number) => {
        if (p < 50) return 'text-red-400';
        if (p < 75) return 'text-yellow-400';
        return 'text-green-400';
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    className="text-slate-700"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
                    className={`${getColor(percentage)}`}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <span className={`absolute text-2xl font-bold ${getColor(percentage)}`}>
                {Math.round(percentage)}%
            </span>
        </div>
    );
};

const QuizReportCard = ({ report }: { report: QuizReport }) => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-xl font-semibold text-slate-300">Quiz Performance Report</h3>
            
            <div className="flex flex-col items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 animate-fade-in-up">
                <h4 className="text-lg font-semibold text-slate-300 mb-2">Overall Score</h4>
                <CircularProgress percentage={report.overallAverage} />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h4 className="text-lg font-semibold text-slate-300 mb-2">Score Breakdown</h4>
                <div className="space-y-2 stagger-children">
                    {report.detailedScores.map((item: DetailedScore, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md" style={{ animationDelay: `${index * 100}ms`}}>
                            <div className="flex-1">
                                <p className="font-medium text-slate-200">{item.topic}</p>
                                <p className="text-xs text-slate-400">{item.score}</p>
                            </div>
                            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full transition-all duration-500 ease-out ${item.percentage < 50 ? 'bg-red-500' : item.percentage < 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{width: `${item.percentage}%`}}
                                ></div>
                            </div>
                            <p className="w-12 text-right font-bold text-slate-300">{item.percentage}%</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-fuchsia-500 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                 <p className="italic text-fuchsia-300">"{report.summary}"</p>
            </div>

        </div>
    );
};

export default QuizReportCard;