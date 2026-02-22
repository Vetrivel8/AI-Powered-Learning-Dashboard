
import type { ChangeEvent, FormEvent } from 'react';
import { ProjectExplorerFormData } from '../types';
import { TextArea } from './shared/TextArea';

interface ProjectExplorerFormProps {
  formData: ProjectExplorerFormData;
  isLoading: boolean;
  onFormChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
  isListening: boolean;
  onSpeechRequest: (form: string, field: string) => void;
  speechTarget: { form: string; field: string } | null;
}

const SpeechControlButton = ({ isListening, onClick, theme }: { isListening: boolean; onClick: () => void; theme: string; }) => (
    <button type="button" onClick={onClick} className={`absolute right-3 top-2.5 p-1.5 rounded-full transition-colors duration-200 ${isListening ? 'animate-[listening-pulse_1.5s_ease-out_infinite]' : ''} bg-slate-600/50 hover:bg-slate-500/50`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isListening ? `text-${theme}-400` : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    </button>
);


const ProjectExplorerForm = ({ formData, isLoading, onFormChange, onSubmit, isListening, onSpeechRequest, speechTarget }: ProjectExplorerFormProps) => {
  const theme = 'emerald';
  const isFormInvalid = !formData.prompt.trim();
  const isThisListening = isListening && speechTarget?.form === 'project-explorer' && speechTarget?.field === 'prompt';

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">Project Idea</label>
        <div className="relative mt-1">
          <TextArea
            name="prompt"
            id="prompt"
            rows={4}
            value={formData.prompt}
            onChange={onFormChange}
            className={`block w-full bg-slate-900/70 border-slate-600 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500 pr-12`}
            placeholder="e.g., 'a simple to-do list app using React and TypeScript', 'a data visualization dashboard with D3.js', 'a beginner-friendly game with Pygame'"
          />
          <SpeechControlButton isListening={isThisListening} onClick={() => onSpeechRequest('project-explorer', 'prompt')} theme={theme} />
        </div>
        <p className="mt-2 text-xs text-slate-400">Describe a project you want to build or learn from to find relevant open-source examples.</p>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={isLoading || isFormInvalid} className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg shadow-emerald-500/20 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-bg-primary disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200`}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Finding Projects...</span>
            </>
          ) : (
            isFormInvalid ? 'Describe a project to find' : 'Explore Projects'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProjectExplorerForm;
