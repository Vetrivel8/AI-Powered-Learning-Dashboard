import { type FormEvent } from 'react';
import { ActivityLogEntry } from '../types';

interface ActivityReportGeneratorProps {
  weeklyActivityLog: ActivityLogEntry[];
  isLoading: boolean;
  onSubmit: (e: FormEvent) => void;
}

const ActivityReportGenerator = ({ weeklyActivityLog, isLoading, onSubmit }: ActivityReportGeneratorProps) => {
  const theme = 'cyan';

  const lessonCount = weeklyActivityLog.filter(a => a.type === 'LESSON_COMPLETED').length;
  const quizCount = weeklyActivityLog.filter(a => a.type === 'QUIZ_COMPLETED').length;
  const planDaysCount = weeklyActivityLog.filter(a => a.type === 'PLAN_DAY_COMPLETED').length;
  const totalActivities = weeklyActivityLog.length;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 space-y-3 text-center">
        <h3 className="text-lg font-semibold text-slate-200">Activity Summary (Last 7 Days)</h3>
        {totalActivities > 0 ? (
          <>
            <p className="text-slate-300">
              Here is a summary of your activity in the past week:
            </p>
            <div className="flex justify-center gap-4 text-slate-200 pt-2">
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{lessonCount}</div>
                    <div className="text-xs text-slate-400">Lessons</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{quizCount}</div>
                    <div className="text-xs text-slate-400">Quizzes</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{planDaysCount}</div>
                    <div className="text-xs text-slate-400">Plan Days</div>
                </div>
            </div>
             <p className="text-sm text-slate-400 pt-3">
              Click the button below to generate a consolidated report based on these activities.
            </p>
          </>
        ) : (
          <p className="text-slate-400 p-4">
            No activity has been logged in the past 7 days. Complete some lessons, quizzes, or learning plan tasks to generate a weekly report.
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || totalActivities === 0}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme}-600 hover:bg-${theme}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme}-500 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating Report...</span>
            </>
          ) : (
            'Generate Weekly Report'
          )}
        </button>
      </div>
    </form>
  );
};

export default ActivityReportGenerator;