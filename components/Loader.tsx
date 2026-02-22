
interface LoaderProps {
    message?: string;
}

const Loader = ({ message = "AI is thinking..." }: LoaderProps) => (
  <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-400 p-8 animate-fade-in" aria-label="Loading">
    <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg font-semibold text-slate-300 animate-pulse-slow">{message}</p>
    <p className="mt-1 text-sm text-slate-500">This may take a few moments.</p>
  </div>
);

export default Loader;
