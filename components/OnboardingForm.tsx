
import type { ChangeEvent, FormEvent } from 'react';
import { OnboardingFormData, Proficiency, LearningStyle } from '../types';
import { TextArea } from './shared/TextArea';

interface OnboardingFormProps {
  formData: OnboardingFormData;
  isLoading: boolean;
  onFormChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRadioChange: (name: keyof OnboardingFormData, value: Proficiency | LearningStyle) => void;
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


const RadioGroup = <T extends string>({ label, name, options, selectedValue, onChange, theme }: { label: string, name: keyof OnboardingFormData, options: Readonly<T[]>, selectedValue: T, onChange: (name: keyof OnboardingFormData, value: T) => void, theme: string}) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(name, option)}
                    className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${selectedValue === option ? `bg-indigo-600 text-white font-semibold` : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'}`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);


const OnboardingForm = ({ formData, isLoading, onFormChange, onRadioChange, onSubmit, isListening, onSpeechRequest, speechTarget }: OnboardingFormProps) => {
  const theme = 'indigo';
  const isFormInvalid = !formData.age.trim() || !formData.background.trim() || !formData.interests.trim() || !formData.goals.trim() || !formData.timeCommitment.trim() || !formData.duration.trim();
  
  const isFieldListening = (field: string) => isListening && speechTarget?.form === 'onboarding' && speechTarget?.field === field;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
        <div>
            <label htmlFor="age" className="block text-sm font-medium text-slate-300">Age</label>
            <input type="number" name="age" id="age" value={formData.age} onChange={onFormChange} className={`mt-1 block w-full bg-slate-900/70 border-slate-600 rounded-md shadow-sm p-3 focus:ring-${theme}-500 focus:border-${theme}-500`} />
        </div>

        <div>
            <label htmlFor="background" className="block text-sm font-medium text-slate-300">Your Background</label>
            <div className="relative mt-1">
                <TextArea name="background" id="background" rows={3} value={formData.background} onChange={onFormChange} className={`block w-full bg-slate-900/70 border-slate-600 rounded-md shadow-sm p-3 focus:ring-${theme}-500 focus:border-${theme}-500 pr-12`} placeholder="e.g., beginner in programming, familiar with basic Python"/>
                <SpeechControlButton isListening={isFieldListening('background')} onClick={() => onSpeechRequest('onboarding', 'background')} theme={theme} />
            </div>
        </div>

        <RadioGroup label="Proficiency Level" name="proficiency" options={Object.values(Proficiency)} selectedValue={formData.proficiency} onChange={onRadioChange} theme={theme} />

        <div>
            <label htmlFor="interests" className="block text-sm font-medium text-slate-300">Subjects of Interest</label>
             <div className="relative mt-1">
                <input type="text" name="interests" id="interests" value={formData.interests} onChange={onFormChange} className={`block w-full bg-slate-900/70 border-slate-600 rounded-md shadow-sm p-3 focus:ring-${theme}-500 focus:border-${theme}-500 pr-12`} placeholder="e.g., Python, Math, Data Structures" />
                <SpeechControlButton isListening={isFieldListening('interests')} onClick={() => onSpeechRequest('onboarding', 'interests')} theme={theme} />
            </div>
        </div>

        <div>
            <label htmlFor="goals" className="block text-sm font-medium text-slate-300">Learning Goals</label>
            <div className="relative mt-1">
                <TextArea name="goals" id="goals" rows={2} value={formData.goals} onChange={onFormChange} className={`block w-full bg-slate-900/70 border-slate-600 rounded-md shadow-sm p-3 focus:ring-${theme}-500 focus:border-${theme}-500 pr-12`} placeholder="e.g., Build a web application, understand machine learning concepts" />
                <SpeechControlButton isListening={isFieldListening('goals')} onClick={() => onSpeechRequest('onboarding', 'goals')} theme={theme} />
            </div>
        </div>

        <RadioGroup label="Learning Style" name="learningStyle" options={Object.values(LearningStyle)} selectedValue={formData.learningStyle} onChange={onRadioChange} theme={theme} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-300">Plan Duration</label>
                <input 
                    type="text"
                    name="duration" 
                    id="duration" 
                    value={formData.duration} 
                    onChange={onFormChange} 
                    className={`mt-1 block w-full bg-slate-900/70 border-slate-600 rounded-md shadow-sm p-3 focus:ring-${theme}-500 focus:border-${theme}-500`}
                    placeholder="e.g., 2 Weeks, 1 Month"
                />
            </div>
            <div>
                <label htmlFor="timeCommitment" className="block text-sm font-medium text-slate-300">Time Commitment</label>
                <input 
                    type="text"
                    name="timeCommitment" 
                    id="timeCommitment" 
                    value={formData.timeCommitment} 
                    onChange={onFormChange} 
                    className={`mt-1 block w-full bg-slate-900/70 border-slate-600 rounded-md shadow-sm p-3 focus:ring-${theme}-500 focus:border-${theme}-500`}
                    placeholder="e.g., 1-2 hours per day"
                />
            </div>
        </div>

        <div className="pt-2">
            <button type="submit" disabled={isLoading || isFormInvalid} className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg shadow-indigo-500/20 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-bg-primary disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200`}>
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating Plan...</span>
                    </>
                ) : (
                    isFormInvalid ? 'Please fill all fields' : 'Generate My Plan'
                )}
            </button>
        </div>
    </form>
  );
};

export default OnboardingForm;
