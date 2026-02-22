

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { OnboardingFormData, IntegratedPlan, MicroLessonFormData, QuizFormData, Quiz, MistakeExplanationData, WeeklyReportFormData, WeeklyReport, PerformanceTrendFormData, PerformanceTrendAnalysis, PriorityLevel, LearningPlan, QuizReportFormData, QuizReport, LessonFormat, LessonResult, VisualLesson, CodeSnippetLesson, VisualLessonLanguage, ProjectExplorerFormData, ProjectSuggestion } from '../types';

// --- AI Client Factory ---
const getAiClient = (): GoogleGenAI => {
    // This check runs on every call to ensure the key is available.
    if (typeof process === 'undefined' || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_GEMINI_API_KEY_HERE') {
        throw new Error("GEMINI API KEY IS MISSING. Please create an `env.js` file with your Google Gemini API key. Check the README.md for instructions. Note: This application does not use Firebase.");
    }
    // Always return a new instance to prevent state issues between API calls.
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};


// --- Error Handling Helper ---
const handleGeminiError = (error: unknown, context: string): never => {
    console.error(`Error in ${context} with Gemini:`, error);
    let errorMessage = "An unexpected error occurred while communicating with the AI.";
    
    let errorBody: any = {};
    let errorIsObject = false;

    if (error instanceof Error) {
        // The error message from the backend can be a JSON string.
        try {
            errorBody = JSON.parse(error.message);
            errorIsObject = true;
        } catch (e) {
            // It's a regular error message string.
            errorMessage = error.message;
        }
    } else if (typeof error === 'object' && error !== null) {
        // The error could be the raw JSON response body.
        errorBody = error;
        errorIsObject = true;
    }

    if (errorIsObject) {
        const message = (errorBody.error?.message || errorBody.message || '').toString();
        const status = (errorBody.error?.status || '').toString();

        if (message.includes("GEMINI_API_KEY_INVALID") || message.includes("API key not valid")) {
            errorMessage = "Your Gemini API key is not valid. Please ensure it's correct in your `env.js` file and that the Gemini API is enabled for it in your Google Cloud project.";
        } else if (message.includes("GEMINI_API_KEY IS MISSING") || message.includes("GEMINI_API_KEY is not configured")) {
            errorMessage = message; // Use the specific message from getAiClient
        } else if (message.includes("RESOURCE_EXHAUSTED") || status.includes("RESOURCE_EXHAUSTED")) {
            errorMessage = "You have exceeded your API quota. Please check your plan and billing details in your Google Cloud project. For more information, visit https://ai.google.dev/gemini-api/docs/rate-limits.";
        } else if (message) {
            // Use the message from the parsed error if available
            errorMessage = message;
        }
    }
    
    throw new Error(`AI generation for ${context} failed. ${errorMessage}`);
};


const generateIntegratedPlanPrompt = (data: OnboardingFormData): string => {
  return `
    You are an expert AI tutor and learning strategist.
    Based on the following learner data, create a comprehensive learner profile AND a personalized, adaptive learning plan.

    **Learner Data:**
    - Age: ${data.age}
    - Background: ${data.background}
    - Current Proficiency: ${data.proficiency}
    - Subjects of Interest: ${data.interests}
    - Learning Goals: ${data.goals}
    - Learning Style Preference: ${data.learningStyle}
    - Time Commitment: ${data.timeCommitment}
    - Plan Duration: ${data.duration}

    **Your Task:**
    Generate a structured JSON output with the following components:
    1.  **learnerProfile**: A structured profile with a summary and tags for 'difficulty', 'pace', and 'strategy'.
    2.  **knowledgeAssessment**: A list of 3-4 actionable suggestions for an initial knowledge assessment.
    3.  **agentGoals**: A list of exactly 3 distinct, high-level goals for an AI agent.
    4.  **learningPlan**: A structured JSON array representing a day-by-day learning plan for the specified duration. The plan should be adaptive, balanced, and logically structured, prioritizing inferred weak areas and building on inferred strengths. Each day should have 'day', 'topic', 'activityType', 'estimatedTime', and 'agentRole'.

    Infer the learner's strengths and weaknesses from their background and goals to make the plan truly adaptive.
    `;
};


const integratedPlanSchema = {
  type: Type.OBJECT,
  properties: {
    learnerProfile: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A concise summary of the learner's profile." },
        tags: {
          type: Type.OBJECT,
          properties: {
            difficulty: { type: Type.STRING, description: "The suggested difficulty level for learning materials." },
            pace: { type: Type.STRING, description: "The recommended learning pace." },
            strategy: { type: Type.STRING, description: "The most effective learning strategy." },
          },
          required: ["difficulty", "pace", "strategy"],
        },
      },
      required: ["summary", "tags"],
    },
    knowledgeAssessment: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-4 specific suggestions for an initial knowledge assessment."
    },
    agentGoals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A clear title for the agent's goal." },
          description: { type: Type.STRING, description: "A description of how the AI agent will assist the learner." },
        },
        required: ["title", "description"],
      },
      description: "A list of exactly 3 distinct goals for an AI agent."
    },
    learningPlan: {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              day: { type: Type.INTEGER, description: "The day number, starting from 1." },
              topic: { type: Type.STRING, description: "The specific topic of study for the day." },
              activityType: {
                  type: Type.STRING,
                  enum: ['Video', 'Quiz', 'Project', 'Reading', 'Practice'],
                  description: "The type of learning activity."
              },
              estimatedTime: { type: Type.STRING, description: "Estimated time for the activity, e.g., '90 minutes'." },
              agentRole: {
                  type: Type.STRING,
                  enum: ['Assess', 'Explain', 'Quiz', 'Review', 'Guide'],
                  description: "The role of the AI tutor for that day."
              }
          },
          required: ["day", "topic", "activityType", "estimatedTime", "agentRole"]
      }
    }
  },
  required: ["learnerProfile", "knowledgeAssessment", "agentGoals", "learningPlan"],
};


export const generateIntegratedPlan = async (formData: OnboardingFormData): Promise<IntegratedPlan> => {
  try {
    const client = getAiClient();
    const prompt = generateIntegratedPlanPrompt(formData);

    const response: GenerateContentResponse = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: integratedPlanSchema,
            temperature: 0.7,
        }
    });
    
    const jsonText = response.text.trim();
    const parsedData: IntegratedPlan = JSON.parse(jsonText);
    
    // Sort by day just in case the model returns them out of order
    parsedData.learningPlan.sort((a, b) => a.day - b.day);
    
    return parsedData;
  } catch (error) {
    handleGeminiError(error, "Integrated Plan");
  }
};

const generateMicroLessonPrompt = (data: MicroLessonFormData): string => {
  return `
    Act as an AI tutor. Generate a micro-lesson (between 300 and 400 words) on the topic of "${data.topic}".
    The lesson must be customized for a ${data.proficiency} learner.
    
    Use the learner's preferred format: ${data.format}.
    
    At the end of the lesson, you must include a 2-sentence summary and one insightful reflection question.
    `;
};

const codeSnippetLessonSchema = {
    type: Type.OBJECT,
    properties: {
        language: { 
            type: Type.STRING,
            description: "The programming language of the code snippet (e.g., 'javascript', 'python', 'css'). Should be a simple, lowercase string."
        },
        description: { 
            type: Type.STRING, 
            description: "A clear, concise explanation of what the code does and the concept it demonstrates. This should be formatted with markdown (e.g., newlines)." 
        },
        code: { 
            type: Type.STRING, 
            description: "The well-formatted code snippet itself." 
        }
    },
    required: ["language", "description", "code"]
};

const generateCodeSnippetLessonPrompt = (data: MicroLessonFormData): string => {
  return `
    Act as an expert AI software engineer and tutor. Your task is to provide a practical code example to teach a concept.
    The topic is "${data.topic}" and the learner's proficiency is ${data.proficiency}.

    **Your Task:**
    Generate a JSON object that includes a functional, easy-to-understand code snippet to demonstrate the topic.
    The JSON object must have the following properties:
    1.  **language**: A simple, lowercase string for the programming language (e.g., "javascript", "python").
    2.  **description**: A brief but clear explanation of the code, what it does, and why it's a good example of the topic. Use newlines for readability.
    3.  **code**: The code snippet itself, well-formatted and ready to be displayed. Add comments where necessary to help the learner.
    `;
};


export const generateMicroLesson = async (data: MicroLessonFormData): Promise<LessonResult> => {
    try {
        const client = getAiClient();
        if (data.format === LessonFormat.VISUAL) {
            const language = data.language || VisualLessonLanguage.ENGLISH;
            
            // --- Step 1: Generate the textual explanation for the topic ---
            const explanationPrompt = `Act as an expert AI tutor. Your goal is to provide a clear and concise explanation for a learner. Explain the topic of "${data.topic}" tailored for a ${data.proficiency} learner. The explanation should be comprehensive but easy to understand, around 150-200 words. Do not include any titles or introductory phrases like "Here is an explanation...". Just provide the explanation text directly.`;
            const explanationResponse: GenerateContentResponse = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: explanationPrompt,
                config: { temperature: 0.7 }
            });
            const topicExplanation = explanationResponse.text;

            // --- Step 2: Search for relevant YouTube videos ---
            const searchQuery = `YouTube video tutorials for "${data.topic}" for a ${data.proficiency} learner in ${language}.`;
            const searchResponse: GenerateContentResponse = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: searchQuery,
                config: {
                    tools: [{googleSearch: {}}],
                    temperature: 0,
                }
            });
            
            const groundingMetadata = searchResponse.candidates?.[0]?.groundingMetadata;
            let youtubeLinks: { url: string; title: string }[] = [];
            let allSources: { web: { uri: string; title: string } }[] = [];

            if (groundingMetadata?.groundingChunks) {
                allSources = groundingMetadata.groundingChunks
                    .filter(chunk => chunk.web && chunk.web.uri)
                    .map(chunk => ({
                        web: {
                            uri: chunk.web.uri!,
                            title: chunk.web.title || chunk.web.uri!,
                        }
                    }));
                
                // A robust regex to identify YouTube video URLs.
                const youtubeVideoRegex = /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)/;
                
                const filteredYoutubeLinks = allSources
                    .filter(source => youtubeVideoRegex.test(source.web.uri))
                    .map(source => ({
                        url: source.web.uri,
                        title: source.web.title || "YouTube Video" // Fallback title
                    }));
                
                // Get unique videos (up to 3)
                youtubeLinks = [...new Map(filteredYoutubeLinks.map(item => [item.url, item])).values()].slice(0, 3);
            }

            const visualLesson: VisualLesson = {
                explanation: topicExplanation,
                youtubeLinks: youtubeLinks,
                sources: allSources,
            };

            return visualLesson;

        } else if (data.format === LessonFormat.CODE_SNIPPET) {
            const prompt = generateCodeSnippetLessonPrompt(data);
            const response: GenerateContentResponse = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: codeSnippetLessonSchema,
                    temperature: 0.6,
                }
            });
            const jsonText = response.text.trim();
            const parsedData: CodeSnippetLesson = JSON.parse(jsonText);
            return parsedData;
        }

        const prompt = generateMicroLessonPrompt(data);

        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });

        return response.text;

    } catch (error) {
        handleGeminiError(error, "Micro-Lesson");
    }
};

const generateQuizPrompt = (data: QuizFormData): string => {
  return `
    You are an AI quiz master. Create a quiz on the topic of "${data.topic}", tailored for a ${data.proficiency} learner.

    **Learner's Prior Performance Data:**
    ${data.performanceData || 'No prior performance data provided.'}

    **Your Task:**
    Generate a structured JSON array of 3 to 10 quiz questions. The difficulty should be varied based on the learner's proficiency and prior performance.
    
    For each question, provide a JSON object with the following properties:
    1.  **question**: The text of the question.
    2.  **options**: An array of exactly four strings representing the possible answers.
    3.  **correctAnswer**: The string that is the correct answer.
    4.  **explanation**: A short, clear explanation for why the correct answer is right.

    **CRITICAL REQUIREMENT:** The value for "correctAnswer" MUST be an exact, case-sensitive match to one of the strings in the "options" array.
    `;
};

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING, description: "The text of the quiz question." },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of exactly four possible answers."
            },
            correctAnswer: { type: Type.STRING, description: "The correct answer from the options." },
            explanation: { type: Type.STRING, description: "A brief explanation of the correct answer." }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
    }
};

export const generateQuiz = async (data: QuizFormData): Promise<Quiz> => {
    try {
        const client = getAiClient();
        const prompt = generateQuizPrompt(data);

        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
                temperature: 0.6,
            }
        });

        const jsonText = response.text.trim();
        const parsedData: Quiz = JSON.parse(jsonText);
        return parsedData;
    } catch (error) {
        handleGeminiError(error, "Quiz");
    }
};

const generateMistakeExplanationPrompt = (data: MistakeExplanationData): string => {
    return `
    Act as an expert AI tutor. A learner has answered a quiz question incorrectly. Your task is to provide a clear, helpful explanation.

    **Question:**
    ${data.question}

    **Learner's Incorrect Answer:**
    ${data.userAnswer}

    **Correct Answer:**
    ${data.correctAnswer}

    **Your Explanation (in plain text, not JSON):**
    Please structure your response in three parts:
    1.  **Why the Correct Answer is Right:** Briefly explain the concept behind the correct answer.
    2.  **Why the Learner's Choice is a Common Mistake:** Explain the misconception that likely led to choosing the incorrect answer. Be empathetic.
    3.  **Learning Tip:** Provide a concise, actionable tip to help the learner remember the concept and avoid this mistake in the future.

    Format the output cleanly with headings for each part.
    `;
};

export const generateMistakeExplanation = async (data: MistakeExplanationData): Promise<string> => {
    try {
        const client = getAiClient();
        const prompt = generateMistakeExplanationPrompt(data);

        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        
        return response.text;
    } catch (error) {
        handleGeminiError(error, "Mistake Explanation");
    }
};

const generateWeeklyReportPrompt = (data: WeeklyReportFormData): string => {
    const scoreInfo = data.averageQuizScore !== null 
        ? `The user's average quiz score was ${data.averageQuizScore.toFixed(0)}%.` 
        : 'The user did not take any quizzes this period.';

    return `
    You are an AI learning coach. Generate a personalized, encouraging weekly learning report based on the user's activity summary.

    **Weekly Activity Summary:**
    - Lessons Completed: ${data.totalLessons}
    - Quizzes Taken: ${data.totalQuizzes}
    - Learning Plan Days Completed: ${data.totalPlanDays}
    - ${scoreInfo}
    - Detailed Log:
    ${data.activitySummary}

    **Your Task:**
    Analyze the activity and generate a structured JSON object for the report. Your tone should be supportive and motivational.
    
    **JSON Output Structure:**
    1.  **weeklyStats**: An object summarizing the raw numbers. It MUST match the input data: { "lessons": ${data.totalLessons}, "quizzes": ${data.totalQuizzes}, "planDays": ${data.totalPlanDays}, "averageScore": ${data.averageQuizScore === null ? 'null' : data.averageQuizScore.toFixed(0)} }.
    2.  **improvements**: A list of 1-2 key accomplishments. Be specific and positive.
    3.  **weakAreas**: A list of 1-2 areas that could use more focus, based on the activity log (e.g., low quiz scores on a topic, or a topic that was studied but not quizzed on). Frame this constructively.
    4.  **nextStep**: An object for the next goal.
        - **title**: A concise, motivating title for the goal (e.g., "Solidify Your React Knowledge").
        - **description**: A 1-2 sentence explanation of why this goal is important.
        - **action**: (Optional) If a specific action is recommended (like retaking a quiz or learning a new sub-topic), provide an object with "type" ('quiz' or 'lesson') and "topic". If the goal is more general, omit this field.
    5.  **motivation**: An inspiring and relevant motivational quote or short message.
    `;
};

const weeklyReportSchema = {
    type: Type.OBJECT,
    properties: {
        weeklyStats: {
            type: Type.OBJECT,
            properties: {
                lessons: { type: Type.INTEGER, description: "Number of lessons completed." },
                quizzes: { type: Type.INTEGER, description: "Number of quizzes taken." },
                planDays: { type: Type.INTEGER, description: "Number of plan days completed." },
                averageScore: { type: [Type.NUMBER, Type.NULL], description: "Average quiz score, or null." },
            },
            required: ["lessons", "quizzes", "planDays", "averageScore"]
        },
        improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of key improvements."
        },
        weakAreas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of areas to focus on."
        },
        nextStep: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Title of the next goal." },
                description: { type: Type.STRING, description: "Description of the next goal." },
                action: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['quiz', 'lesson'], description: "The type of action." },
                        topic: { type: Type.STRING, description: "The topic for the action." }
                    },
                    required: ['type', 'topic']
                }
            },
            required: ["title", "description"]
        },
        motivation: {
            type: Type.STRING,
            description: "A motivational quote or tip."
        }
    },
    required: ["weeklyStats", "improvements", "weakAreas", "nextStep", "motivation"]
};

export const generateWeeklyReport = async (data: WeeklyReportFormData): Promise<WeeklyReport> => {
    try {
        const client = getAiClient();
        const prompt = generateWeeklyReportPrompt(data);

        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: weeklyReportSchema,
                temperature: 0.7,
            }
        });

        const jsonText = response.text.trim();
        const parsedData: WeeklyReport = JSON.parse(jsonText);
        return parsedData;
    } catch (error) {
        handleGeminiError(error, "Weekly Report");
    }
};

const generatePerformanceTrendPrompt = (data: PerformanceTrendFormData): string => {
    return `
    You are an expert AI data analyst and a motivational learning coach. Your primary goal is to provide positive and encouraging feedback. Analyze the provided user performance data to identify trends, highlight strengths, and suggest inspiring next steps.

    **User Performance Data (across topics, quizzes, projects over time):**
    ${data.performanceData}

    **CRITICAL Instructions on How to Interpret Data:**
    - **Rule 1: Completion is Success.** If the data shows "completion" of topics (e.g., "Completed topic X", "Finished all plan days"), this is a sign of **great success and dedication**. Frame your entire analysis around this accomplishment.
    - **Rule 2: No Negative Framing for Completions.** When only completion data is available (no scores), DO NOT invent weaknesses or problems. Your analysis must be positive. The 'insights' should be about their consistency and dedication. The 'actions' should be about what exciting things they can do next (e.g., "Apply your new skills to a project," "Explore an advanced topic," "Share what you've learned").
    - **Rule 3: Full Plan Completion is a Major Achievement.** If the user indicates they have completed their entire learning plan, the feedback should be celebratory. Insights should praise their achievement. Actions should suggest long-term next steps like starting a new, more advanced plan, or building a portfolio project.
    - **Rule 4: Analyze Scores Objectively.** If the data includes scores (e.g., "scored 80%"), then you can analyze trends to identify both strengths (high scores) and areas for review (low scores). Even with low scores, maintain an encouraging tone.

    **Your Task:**
    Generate a structured JSON object with the following properties:
    1.  **insights**: A list of 2-3 key positive trends or accomplishments. For pure completion data, this should be about their consistency and success in following the plan.
    2.  **actions**: A list of 2-3 specific, forward-looking suggestions. These are NEXT STEPS, not fixes. Examples: "Start a project on [topic]", "Learn about advanced concept Y", "Take a quiz to solidify knowledge on X".
    3.  **priority**: A priority level for these actions. If the user is doing well, the priority should be "Medium" or "Low", representing next steps for growth, not urgent fixes. If there are clear knowledge gaps from scores, priority can be "High".
    4.  **trendData**: An array of numerical scores (e.g., quiz percentages) extracted sequentially from the performance data. If no numerical scores are found, return an empty array.
    `;
};

const performanceTrendSchema = {
    type: Type.OBJECT,
    properties: {
        insights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of key trends in improvement or decline."
        },
        actions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of suggested actions like 'Revise topic X' or 'Advance to Y'."
        },
        priority: {
            type: Type.STRING,
            enum: Object.values(PriorityLevel),
            description: "The overall priority level for the suggested actions."
        },
        trendData: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "An array of numerical scores extracted from the performance data to visualize the trend."
        }
    },
    required: ["insights", "actions", "priority", "trendData"]
};

export const generatePerformanceTrendAnalysis = async (data: PerformanceTrendFormData): Promise<PerformanceTrendAnalysis> => {
    try {
        const client = getAiClient();
        const prompt = generatePerformanceTrendPrompt(data);

        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: performanceTrendSchema,
                temperature: 0.6,
            }
        });

        const jsonText = response.text.trim();
        const parsedData: PerformanceTrendAnalysis = JSON.parse(jsonText);
        return parsedData;
    } catch (error) {
        handleGeminiError(error, "Performance Trend Analysis");
    }
};

const generateQuizReportPrompt = (data: QuizReportFormData): string => {
  const correctCount = data.results.filter(r => r.isCorrect).length;
  const totalCount = data.results.length;

  const resultsSummary = data.results.map((r, i) => 
    `Question ${i+1}: ${r.question}\n- User Answer: "${r.userAnswer}" (${r.isCorrect ? 'Correct' : 'Incorrect'})\n- Correct Answer: "${r.correctAnswer}"`
  ).join('\n\n');

  return `
    You are an AI data analyst for learning. A user has completed a quiz on "${data.topic}". Analyze their performance based on the detailed results below to generate a comprehensive report.

    **Detailed Quiz Results:**
    - Topic: ${data.topic}
    - Final Score: ${correctCount} out of ${totalCount}
    - Breakdown:
    ${resultsSummary}

    **Your Task:**
    Calculate the final scores and generate a structured JSON object that provides a full analysis.
    
    The JSON object must have the following properties:
    1.  **overallAverage**: A number representing the average score for this quiz, calculated as a percentage.
    2.  **detailedScores**: An array of objects. Since this is a single quiz, it should contain only ONE object with 'topic' ("${data.topic}"), 'score' (a string like "${correctCount}/${totalCount}"), and 'percentage' (the calculated percentage).
    3.  **summary**: A brief, 1-2 sentence encouraging summary of the performance. Based on the incorrect answers, identify a potential pattern or concept the user struggled with and give a positive suggestion. For example, if they missed questions about a specific concept, mention that.
    `;
};

const quizReportSchema = {
    type: Type.OBJECT,
    properties: {
        overallAverage: { type: Type.NUMBER, description: "The average score as a percentage." },
        detailedScores: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    score: { type: Type.STRING },
                    percentage: { type: Type.NUMBER }
                },
                required: ['topic', 'score', 'percentage']
            }
        },
        summary: { type: Type.STRING, description: "A brief, encouraging performance summary." }
    },
    required: ["overallAverage", "detailedScores", "summary"]
};

export const generateQuizReport = async (data: QuizReportFormData): Promise<QuizReport> => {
    try {
        const client = getAiClient();
        const prompt = generateQuizReportPrompt(data);

        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizReportSchema,
                temperature: 0.5,
            }
        });

        const jsonText = response.text.trim();
        const parsedData: QuizReport = JSON.parse(jsonText);
        return parsedData;
    } catch (error) {
        handleGeminiError(error, "Quiz Report");
    }
};

const generateProjectSuggestionsPrompt = (data: ProjectExplorerFormData): string => {
  return `
    You are an expert tech scout and learning advisor. A learner is looking for open-source projects to learn from or contribute to.

    **Learner's Request:**
    "${data.prompt}"

    **Your Task:**
    Use Google Search to find 3-5 relevant and well-documented open-source GitHub projects suitable for learning, based on the learner's request.
    For each project found, create a JSON object with the following properties:
    1.  "title": The name of the project.
    2.  "description": A brief, one-sentence description of the project and why it's a good fit for the learner, based on the search results.
    3.  "githubUrl": The full, valid URL to the GitHub repository from the search results.

    Return ONLY a valid JSON array of these project objects. Do not include any other text or markdown formatting. Your entire response must be a raw JSON array. For example: [{"title": "project-name", "description": "...", "githubUrl": "..."}]
  `;
};

export const generateProjectSuggestions = async (data: ProjectExplorerFormData): Promise<ProjectSuggestion[]> => {
    try {
        const client = getAiClient();
        const prompt = generateProjectSuggestionsPrompt(data);

        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
                temperature: 0.1,
            }
        });

        let jsonText = response.text.trim();
        // The model might wrap the JSON in markdown backticks.
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }

        const parsedData: ProjectSuggestion[] = JSON.parse(jsonText);
        return parsedData;
    } catch (error) {
        handleGeminiError(error, "Project Suggestions");
    }
};

const summarizeNotesPrompt = (notes: string): string => {
  return `
    You are an expert summarization AI. Your task is to take the following notes and distill them into a concise, easy-to-read summary. 
    Focus on extracting the most critical key points, main ideas, and any actionable items.
    The summary should be clear and well-structured, possibly using bullet points if it makes the information easier to digest.

    **Notes to Summarize:**
    ---
    ${notes}
    ---

    Provide only the summary text.
  `;
};

export const summarizeNotes = async (notes: string): Promise<string> => {
    try {
        const client = getAiClient();
        const prompt = summarizeNotesPrompt(notes);

        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
            }
        });

        return response.text;
    } catch (error) {
        handleGeminiError(error, "Note Summarization");
    }
};