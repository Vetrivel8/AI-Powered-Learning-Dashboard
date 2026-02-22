import type { FormEvent } from 'react';
import { PerformanceTrendFormData } from '../types';
import { TextArea } from './shared/TextArea';

interface PerformanceTrendFormProps {
  formData: PerformanceTrendFormData;
  isLoading: boolean;
  onSubmit: (e: FormEvent) => void;
}

const PerformanceTrendForm = ({ formData, isLoading, onSubmit }: PerformanceTrendFormProps) => {
  const theme = 'rose';
  const isFormInvalid = !formData.performanceData.trim();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
        <div>
            <label htmlFor="performanceData" className="block text-sm font-medium text-slate-300">Performance History</label>
            <TextArea 
                name="performanceData" 
                id="performanceData" 
                rows={8} 
                value={formData.performanceData} 
                readOnly
                className={`mt-1 block w-full bg-slate-900 border-slate-700 rounded-md shadow-sm p-3 focus:ring-rose-500 focus:border-rose-500 text-slate-400 cursor-default`}
                placeholder="Your activity log will appear here once you complete some lessons or quizzes."
            />
            <p className="mt-2 text-xs text-slate-400">Your activity log is automatically populated here. Click the button below to generate an analysis.</p>
        </div>

        <div className="pt-2">
            <button type="submit" disabled={isLoading || isFormInvalid} className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme}-600 hover:bg-${theme}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme}-500 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200`}>
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing...</span>
                    </>
                ) : (
                    isFormInvalid ? 'No activity to analyze' : 'Analyze Progress'
                )}
            </button>
        </div>
    </form>
  );
};

export default PerformanceTrendForm;