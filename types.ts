declare global {
    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
        start(): void;
        stop(): void;
    }

    var SpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };
    
    var webkitSpeechRecognition: {
        prototype: SpeechRecognition;
        new(): SpeechRecognition;
    };

    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof webkitSpeechRecognition;
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }

    type SpeechRecognitionErrorCode =
        | 'no-speech'
        | 'aborted'
        | 'audio-capture'
        | 'network'
        | 'not-allowed'
        | 'service-not-allowed'
        | 'bad-grammar'
        | 'language-not-supported';

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: SpeechRecognitionErrorCode;
        readonly message: string;
    }
}


export enum Proficiency {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export enum LearningStyle {
  VISUAL = 'Visual',
  HANDS_ON = 'Hands-on',
  SELF_PACED = 'Self-paced',
  MIXED = 'A Mix of Styles',
}

export enum LessonFormat {
    ANALOGY = 'Analogy',
    VISUAL = 'Visual Explanation',
    REAL_WORLD = 'Real-World Example',
    CODE_SNIPPET = 'Code Snippet',
}

export enum VisualLessonLanguage {
    ENGLISH = 'English',
    HINDI = 'Hindi',
    BENGALI = 'Bengali',
    TAMIL = 'Tamil',
    TELUGU = 'Telugu',
    MARATHI = 'Marathi',
}

export enum PriorityLevel {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

export interface OnboardingFormData {
  age: string;
  background: string;
  proficiency: Proficiency;
  interests: string;
  goals: string;
  learningStyle: LearningStyle;
  timeCommitment: string;
  duration: string;
}

export interface VisualLesson {
    explanation: string;
    youtubeLinks: { url: string; title: string; }[];
    sources?: { web: { uri: string; title: string } }[];
}

export interface CodeSnippetLesson {
    language: string;
    description: string;
    code: string;
}

export type LessonResult = string | VisualLesson | CodeSnippetLesson;

export interface MicroLessonFormData {
    topic: string;
    proficiency: Proficiency;
    format: LessonFormat;
    language?: VisualLessonLanguage;
}

export interface ProjectExplorerFormData {
    prompt: string;
}

export interface ProjectSuggestion {
    title: string;
    description: string;
    githubUrl: string;
}

export interface QuizFormData {
    topic:string;
    proficiency: Proficiency;
    performanceData: string;
}

export interface MistakeExplanationData {
    question: string;
    userAnswer: string;
    correctAnswer: string;
}

export interface WeeklyReportFormData {
    totalLessons: number;
    totalQuizzes: number;
    totalPlanDays: number;
    averageQuizScore: number | null;
    activitySummary: string;
}

export interface PerformanceTrendFormData {
    performanceData: string;
}

export interface QuizQuestionResult {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

export interface QuizReportFormData {
    topic: string;
    results: QuizQuestionResult[];
}

export interface LearnerProfile {
    summary: string;
    tags: {
        difficulty: string;
        pace: string;
        strategy: string;
    };
}

export interface AgentGoal {
    title: string;
    description: string;
}

export interface IntegratedPlan {
    learnerProfile: LearnerProfile;
    knowledgeAssessment: string[];
    agentGoals: AgentGoal[];
    learningPlan: LearningPlan;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export type Quiz = QuizQuestion[];

export interface WeeklyReport {
    weeklyStats: {
        lessons: number;
        quizzes: number;
        planDays: number;
        averageScore: number | null;
    };
    improvements: string[];
    weakAreas: string[];
    nextStep: {
        title: string;
        description: string;
        action?: {
            type: 'quiz' | 'lesson';
            topic: string;
        };
    };
    motivation: string;
}

export interface PerformanceTrendAnalysis {
    insights: string[];
    actions: string[];
    priority: PriorityLevel;
    trendData: number[];
}

export interface LearningPlanDay {
    day: number;
    topic: string;
    activityType: 'Video' | 'Quiz' | 'Project' | 'Reading' | 'Practice';
    estimatedTime: string;
    agentRole: 'Assess' | 'Explain' | 'Quiz' | 'Review' | 'Guide';
}

export type LearningPlan = LearningPlanDay[];

export interface DetailedScore {
    topic: string;
    score: string;
    percentage: number;
}

export interface QuizReport {
    overallAverage: number;
    detailedScores: DetailedScore[];
    summary: string;
}

export type ActivityLogEntry = 
    | { type: 'LESSON_COMPLETED'; topic: string; timestamp: number; }
    | { type: 'QUIZ_COMPLETED'; topic: string; score: string; timestamp: number; proficiency: Proficiency; }
    | { type: 'PLAN_DAY_COMPLETED'; day: LearningPlanDay; timestamp: number; planDayId: string; };