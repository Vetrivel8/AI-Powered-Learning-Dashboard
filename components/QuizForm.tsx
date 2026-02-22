
import type { ChangeEvent, FormEvent } from 'react';
import { QuizFormData, Proficiency } from '../types';

interface QuizFormProps {
  formData: QuizFormData;
  isLoading: boolean;
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRadioChange: (name: keyof QuizFormData, value: Proficiency) => void;
  onSubmit: (e: FormEvent) => void;
  isListening: boolean;
  onSpeechRequest: (form: string, field: string) => void;
  speechTarget: { form: string; field: string } | null;
}

const SpeechControlButton = ({ isListening, onClick, theme }: { isListening: boolean; onClick: () => void; theme: string }) => (
    <button type="button" onClick={onClick} className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors duration-200 ${isListening ? 'animate-[listening-pulse_1.5s_ease-out_infinite]' : ''} bg-slate-600/50 hover:bg-slate-500/50`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isListening ? `text-${theme}-400` : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    </button>
);


const RadioGroup = ({ label, name, options, selectedValue, onChange, theme }: { label: string, name: keyof QuizFormData, options: Readonly<Proficiency[]>, selectedValue: Proficiency, onChange: (name: keyof QuizFormData, value: Proficiency) => void, theme: string}) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(name, option)}
                    className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${selectedValue === option ? `bg-amber-600 text-white font-semibold` : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const QuizForm = ({ formData, isLoading, onFormChange, onRadioChange, onSubmit, isListening, onSpeechRequest, speechTarget }: QuizFormProps) => {
  const theme = 'amber';
  const isFormInvalid = !formData.topic.trim();
  const isThisListening = isListening && speechTarget?.form === 'quiz' && speechTarget?.field === 'topic';

  return (
    <form onSubmit={onSubmit} className="space-y-6">
        <div>
            <label htmlFor="topic" className="block text-sm font-medium text-slate-300">Topic</label>
            <div className="relative mt-1">
                <input 
                    type="text" 
                    name="topic" 
                    id="topic" 
                    value={formData.topic} 
                    onChange={onFormChange} 
                    className={`block w-full bg-slate-900/70 border-slate-600 rounded-md shadow-sm p-3 focus:ring-amber-500 focus:border-amber-500 pr-12`}
                    placeholder="e.g., React State Management"
                />
                <SpeechControlButton isListening={isThisListening} onClick={() => onSpeechRequest('quiz', 'topic')} theme={theme} />
            </div>
        </div>

        <RadioGroup label="Proficiency Level" name="proficiency" options={Object.values(Proficiency)} selectedValue={formData.proficiency} onChange={onRadioChange} theme={theme} />
        
        <div className="pt-2">
            <button type="submit" disabled={isLoading || isFormInvalid} className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg shadow-amber-500/20 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-bg-primary disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200`}>
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating Quiz...</span>
                    </>
                ) : (
                    isFormInvalid ? 'Please enter a topic' : 'Generate Quiz'
                )}
            </button>
        </div>
    </form>
  );
};

export default QuizForm;
