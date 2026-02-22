
import { ActivityLogEntry, Proficiency } from '../types';

type QuizHistoryEntry = Extract<ActivityLogEntry, { type: 'QUIZ_COMPLETED' }>;

interface QuizHistoryProps {
  history: QuizHistoryEntry[];
  onRetake: (topic: string) => void;
}

const proficiencyColors: Record<Proficiency, string> = {
    [Proficiency.BEGINNER]: 'bg-green-500/20 text-green-300',
    [Proficiency.INTERMEDIATE]: 'bg-yellow-500/20 text-yellow-300',
    [Proficiency.ADVANCED]: 'bg-red-500/20 text-red-300',
};

const QuizHistory = ({ history, onRetake }: QuizHistoryProps) => {

  return (
    <div className="space-y-4 pt-6 mt-6 border-t border-slate-700/50 animate-fade-in-up">
      <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Quiz History Log</span>
      </h3>
      {history.length === 0 ? (
        <div className="p-4 bg-slate-800/50 rounded-lg text-center text-slate-500">
          <p>Your quiz history will appear here once you complete a quiz.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto p-1 pr-2 bg-black/20 rounded-lg border border-amber-400/10">
          {history.map((item, index) => {
              const [correct, total] = item.score.split('/').map(Number);
              const percentage = total > 0 ? (correct / total) * 100 : 0;
              const scoreColor = percentage < 50 ? 'text-red-400' : percentage < 75 ? 'text-yellow-400' : 'text-green-400';

              return (
                   <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md border border-transparent hover:border-amber-400/20 hover:bg-slate-800/70 transition-all">
                      <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-200 truncate" title={item.topic}>{item.topic}</p>
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                              <span className="font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                              <span className="font-mono">Score: <span className={`font-bold ${scoreColor}`}>{item.score}</span></span>
                              <span className={`px-2 py-0.5 rounded-full font-semibold ${proficiencyColors[item.proficiency] || 'bg-slate-500/20 text-slate-400'}`}>
                                  {item.proficiency}
                              </span>
                          </div>
                      </div>
                      <button onClick={() => onRetake(item.topic)} className="ml-4 flex-shrink-0 text-xs font-bold py-1 px-3 rounded-full transition-all duration-300 border border-slate-500/50 text-slate-300 bg-slate-500/10 hover:bg-slate-500/20 hover:text-white hover:border-slate-500">
                          Retake
                      </button>
                  </div>
              )
          })}
        </div>
      )}
    </div>
  );
};

export default QuizHistory;
