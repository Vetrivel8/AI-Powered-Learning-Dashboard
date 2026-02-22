import { Proficiency, LearningStyle, LessonFormat, VisualLessonLanguage } from '../types';

export const initialOnboardingFormData = {
  age: '', background: '', proficiency: Proficiency.BEGINNER, interests: '', goals: '', learningStyle: LearningStyle.VISUAL, timeCommitment: "", duration: ""
};

export const initialPerformanceTrendFormData = { performanceData: "" };

export const initialLessonFormData = {
  topic: '',
  proficiency: Proficiency.BEGINNER,
  format: LessonFormat.ANALOGY,
  language: VisualLessonLanguage.ENGLISH
};

export const initialQuizFormData = { topic: '', proficiency: Proficiency.BEGINNER, performanceData: '' };

export const initialProjectExplorerFormData = { prompt: '' };
