// src/types/speech.d.ts

// Declare the global SpeechRecognition interface (type)
// This provides the structure for variables typed as SpeechRecognition
interface SpeechRecognition extends EventTarget {
    // Include the properties and methods you use from the API
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null; // Use SpeechRecognitionEvent type
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null; // Use SpeechRecognitionErrorEvent type
    start(): void;
    stop(): void;
    abort(): void;
    // Add other members if you use them and need type safety
}

// Declare the global SpeechRecognition variable (constructor)
// This allows you to use 'new SpeechRecognition()'
declare var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
};

// Augment the Window interface to include webkitSpeechRecognition
// This is needed for the runtime check `window.webkitSpeechRecognition`
// It also declares the standard SpeechRecognition constructor on Window
interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition | undefined;
    SpeechRecognition: typeof SpeechRecognition | undefined;
}

// Also declare the necessary event types used in the interface above
// These should ideally come from 'dom', but if 'dom' is spotty,
// declaring them minimally here helps.
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList; // Use SpeechRecognitionResultList type
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string; // You might refine this based on actual error codes
    readonly message: string;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult; // Use SpeechRecognitionResult type
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative; // Use SpeechRecognitionAlternative type
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
