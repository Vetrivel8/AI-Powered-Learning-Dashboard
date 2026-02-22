
import { useState } from 'react';
import { LessonResult, VisualLesson, CodeSnippetLesson } from '../types';

interface MicroLessonCardProps {
    topic: string;
    lesson: LessonResult;
}

const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const MicroLessonCard = ({ topic, lesson }: MicroLessonCardProps) => {
    const [isCopied, setIsCopied] = useState(false);
    
    const isVisualLesson = (lesson: LessonResult): lesson is VisualLesson => {
        return typeof lesson === 'object' && lesson !== null && 'youtubeLinks' in lesson;
    };

    const isCodeSnippetLesson = (lesson: LessonResult): lesson is CodeSnippetLesson => {
        return typeof lesson === 'object' && lesson !== null && 'code' in lesson && 'language' in lesson;
    };

    const handleCopy = (code: string) => {
        if (isCopied) return;
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    if (isVisualLesson(lesson)) {
        const youtubeUrlsSet = new Set(lesson.youtubeLinks.map(link => link.url));
        const otherSources = lesson.sources?.filter(source => !youtubeUrlsSet.has(source.web.uri)) || [];

        return (
            <div className="space-y-6 animate-fade-in-up">
                <h3 className="text-xl font-semibold text-slate-200">
                    Visual Explanation: <span className="text-purple-400">{topic}</span>
                </h3>

                <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-purple-300/10">
                    <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">{lesson.explanation}</p>
                </div>

                {lesson.youtubeLinks && lesson.youtubeLinks.length > 0 && (
                    <div className="space-y-4 stagger-children">
                        <h4 className="font-semibold text-slate-300">Suggested Videos:</h4>
                        {lesson.youtubeLinks.map((link, index) => {
                            const videoId = getYouTubeVideoId(link.url);
                            const thumbnailUrl = videoId ? `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';

                            return (
                                <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    key={index} 
                                    className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 hover:border-purple-400/30 transition-all duration-200 group"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="w-32 h-20 flex-shrink-0 bg-slate-900 rounded-md overflow-hidden">
                                        {thumbnailUrl && <img src={thumbnailUrl} alt={link.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-purple-300 group-hover:text-purple-200 transition-colors line-clamp-2">{link.title}</h5>
                                        <p className="text-xs text-slate-400 mt-1">Click to watch on YouTube</p>
                                    </div>
                                    <div className="text-slate-500 group-hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
                
                {otherSources.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-slate-700/50">
                        <h4 className="text-sm font-semibold text-slate-400 mb-3">Other Web Sources:</h4>
                        <div className="space-y-3">
                            {otherSources.map((source, index) => {
                                let domain = "Web Link";
                                try {
                                    domain = new URL(source.web.uri).hostname.replace(/^www\./, '');
                                } catch (e) { /* Ignore invalid URLs */ }

                                return (
                                    <a 
                                        href={source.web.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={index}
                                        className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 hover:border-purple-400/30 transition-all duration-200 group"
                                    >
                                        <div className="w-10 h-10 flex-shrink-0 bg-slate-900 rounded-md flex items-center justify-center">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-semibold text-purple-300 group-hover:text-purple-200 transition-colors truncate" title={source.web.title || 'Untitled'}>{source.web.title || 'Untitled Web Page'}</h5>
                                            <p className="text-xs text-slate-400 mt-1 truncate" title={domain}>{domain}</p>
                                        </div>
                                        <div className="text-slate-500 group-hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (isCodeSnippetLesson(lesson)) {
        return (
             <div className="space-y-4 animate-fade-in-up">
                <h3 className="text-xl font-semibold text-slate-200">
                    Code Snippet: <span className="text-purple-400">{topic}</span>
                </h3>
                <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-purple-300/10 space-y-4">
                    <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">{lesson.description}</p>
                    <div className="bg-black/30 rounded-lg overflow-hidden border border-slate-700">
                        <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50">
                            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">{lesson.language}</span>
                             <button 
                                onClick={() => handleCopy(lesson.code)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200  text-slate-300 disabled:opacity-50 ${isCopied ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                                disabled={isCopied}
                            >
                                <span className="flex items-center gap-1.5">
                                    {isCopied ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    )}
                                    {isCopied ? 'Copied!' : 'Copy'}
                                </span>
                            </button>
                        </div>
                        <pre className="p-4 text-sm overflow-x-auto text-slate-200"><code className={`language-${lesson.language}`}>{lesson.code}</code></pre>
                    </div>
                </div>
            </div>
        )
    }

    // Fallback for simple string lesson
    return (
        <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-lg border border-purple-300/10 space-y-4 animate-fade-in-up">
            <h3 className="text-xl font-semibold text-slate-200">
                Lesson: <span className="text-purple-400">{topic}</span>
            </h3>
            <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">{lesson}</p>
        </div>
    );
};

export default MicroLessonCard;
