
interface AssessmentSuggestionsProps {
  suggestions: string[];
}

const AssessmentSuggestions = ({ suggestions }: AssessmentSuggestionsProps) => {
  return (
    <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <h3 className="flex items-center gap-3 text-xl font-semibold text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        <span>Initial Knowledge Assessment</span>
      </h3>
      <ul className="list-none space-y-2 text-slate-300 pl-2 stagger-children">
        {suggestions.map((suggestion, index) => (
          <li key={index} style={{ animationDelay: `${index * 100}ms` }} className="flex items-start gap-3 p-2 rounded-md transition-colors hover:bg-slate-800/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssessmentSuggestions;
