
import type { ReactNode } from 'react';

interface ToolFormCardProps {
  title: string;
  icon: ReactNode;
  theme: string;
  children: ReactNode;
}

const themeClasses: Record<string, { border: string, text: string, shadow: string }> = {
    indigo: { border: 'border-indigo-400/30', text: 'text-indigo-300', shadow: 'shadow-indigo-500/10' },
    purple: { border: 'border-purple-400/30', text: 'text-purple-300', shadow: 'shadow-purple-500/10' },
    amber: { border: 'border-amber-400/30', text: 'text-amber-300', shadow: 'shadow-amber-500/10' },
    cyan: { border: 'border-cyan-400/30', text: 'text-cyan-300', shadow: 'shadow-cyan-500/10' },
    rose: { border: 'border-rose-400/30', text: 'text-rose-300', shadow: 'shadow-rose-500/10' },
    emerald: { border: 'border-emerald-400/30', text: 'text-emerald-300', shadow: 'shadow-emerald-500/10' },
};

const ToolFormCard = ({ title, icon, theme, children }: ToolFormCardProps) => {
    const currentTheme = themeClasses[theme] || themeClasses.indigo;

    return (
        <div className={`bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl shadow-black/20 border ${currentTheme.border} ${currentTheme.shadow} animate-fade-in-up`}>
            <h2 className={`text-xl font-semibold ${currentTheme.text} mb-6 flex items-center gap-3`}>
                <span className={`p-1.5 rounded-md bg-black/20 ${currentTheme.text}`}>{icon}</span>
                <span>{title}</span>
            </h2>
            {children}
        </div>
    );
};

export default ToolFormCard;