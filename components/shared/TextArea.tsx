import { useRef, useEffect, type DetailedHTMLProps, type TextareaHTMLAttributes } from 'react';

type TextAreaProps = DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;

export const TextArea = (props: TextAreaProps) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize logic
    useEffect(() => {
        if (textAreaRef.current) {
            // Temporarily shrink to get the true scrollHeight
            textAreaRef.current.style.height = '0px'; 
            const scrollHeight = textAreaRef.current.scrollHeight;
            
            // Set the height to the scrollHeight to fit the content
            textAreaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [props.value]); // Re-run this effect when the text content changes

    return (
        <textarea
            ref={textAreaRef}
            {...props}
            // Ensure a minimum height is respected via rows prop, while still allowing overflow to be hidden for resize calculation
            style={{ ...props.style, overflow: 'hidden' }}
        />
    );
};
