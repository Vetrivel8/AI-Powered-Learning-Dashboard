import { useState, useEffect, useRef } from 'react';

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            setTranscript(event.results[0][0].transcript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;

        return () => recognition.stop();
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError(null);
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, transcript, error, startListening, stopListening };
};
