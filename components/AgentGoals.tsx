
import { AgentGoal } from '../types';

interface AgentGoalsProps {
  goals: AgentGoal[];
}

const AgentGoals = ({ goals }: AgentGoalsProps) => {
  return (
    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3m6-6h3m-18 0h3M9.663 17h4.673M12 3v1m6.364 1.636l-1.06-1.06M21 12h-1M4 12H3m3.343-5.657l-1.06-1.06m11.314 0l1.06-1.06M12 21v-1m-4.657-3.343l-1.06 1.06m11.314 0l-1.06 1.06M12 7a5 5 0 00-5 5h10a5 5 0 00-5-5z" /></svg>
        <span>AI Agent Goals</span>
      </h3>
      <div className="space-y-3 stagger-children">
        {goals.map((goal, index) => (
          <div 
            key={index} 
            className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-cyan-300/10 transition-all duration-300 hover:border-cyan-300/30 hover:bg-slate-800/60"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h4 className="font-semibold text-cyan-300">{goal.title}</h4>
            <p className="text-slate-400 mt-1 text-sm">{goal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentGoals;
