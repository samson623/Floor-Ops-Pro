// Web Speech API type declarations
// These are not included in standard TypeScript DOM lib

export interface SpeechRecognitionEventMap {
    audioend: Event;
    audiostart: Event;
    end: Event;
    error: SpeechRecognitionErrorEvent;
    nomatch: SpeechRecognitionEvent;
    result: SpeechRecognitionEvent;
    soundend: Event;
    soundstart: Event;
    speechend: Event;
    speechstart: Event;
    start: Event;
}

export interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

export interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
    readonly length: number;
    readonly isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

export interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onaudioend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onaudiostart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
    onnomatch: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
    onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
    onsoundend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onsoundstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onspeechend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onspeechstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
    abort(): void;
    start(): void;
    stop(): void;
}

export interface SpeechRecognitionConstructor {
    new (): SpeechRecognitionInstance;
    prototype: SpeechRecognitionInstance;
}

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

