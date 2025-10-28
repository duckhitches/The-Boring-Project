"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { encode, decode, decodeAudioData } from '../utils/audioUtils';
import { MicrophoneIcon, StopIcon, CloseIcon } from './IconComponents';
import { LoaderOne } from './ui/loader';

type TranscriptEntry = {
    speaker: 'user' | 'companion';
    text: string;
};

type CompanionStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking' | 'error';

const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;

export const VoiceCompanion: React.FC = () => {
    const [isCompanionOpen, setIsCompanionOpen] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState<CompanionStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

    const sessionPromise = useRef<Promise<{ sendRealtimeInput: (input: { media: Blob; }) => void; close: () => void; }> | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSource = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTime = useRef(0);
    const audioSources = useRef(new Set<AudioBufferSourceNode>());
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const ai = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const handleSessionClose = useCallback(() => {
        if (scriptProcessor.current) {
            scriptProcessor.current.disconnect();
            scriptProcessor.current = null;
        }
        if (mediaStreamSource.current) {
            mediaStreamSource.current.disconnect();
            mediaStreamSource.current = null;
        }
        if (inputAudioContext.current && inputAudioContext.current.state !== 'closed') {
            inputAudioContext.current.close();
        }
        if (outputAudioContext.current && outputAudioContext.current.state !== 'closed') {
            outputAudioContext.current.close();
        }
        audioSources.current.forEach(source => source.stop());
        audioSources.current.clear();

        setIsSessionActive(false);
        setStatus('idle');
    }, []);

    const startConversation = useCallback(async () => {
        if (!API_KEY) {
            console.error("API_KEY is not set.");
            setStatus('error');
            return;
        }

        if (!ai.current) {
            ai.current = new GoogleGenAI({ apiKey: API_KEY });
        }

        setStatus('connecting');
        setTranscript([]);
        setIsSessionActive(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

            inputAudioContext.current = new AudioContext({ sampleRate: 16000 });
            outputAudioContext.current = new AudioContext({ sampleRate: 24000 });

            sessionPromise.current = ai.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        mediaStreamSource.current = inputAudioContext.current!.createMediaStreamSource(stream);
                        scriptProcessor.current = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);

                        scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const int16 = Int16Array.from(inputData, v => v * 32768);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        mediaStreamSource.current.connect(scriptProcessor.current);
                        scriptProcessor.current.connect(inputAudioContext.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        let currentInput = '';
                        let currentOutput = '';

                        if (message.serverContent?.inputTranscription) {
                            currentInput = message.serverContent.inputTranscription.text;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'user') {
                                    return [...prev.slice(0, -1), { speaker: 'user', text: last.text + currentInput }];
                                }
                                return [...prev, { speaker: 'user', text: currentInput }];
                            });
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            setStatus('speaking');
                            const outCtx = outputAudioContext.current!;
                            nextStartTime.current = Math.max(nextStartTime.current, outCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
                            const source = outCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outCtx.destination);
                            source.addEventListener('ended', () => {
                                audioSources.current.delete(source);
                                if (audioSources.current.size === 0) {
                                    setStatus('listening');
                                }
                            });
                            source.start(nextStartTime.current);
                            nextStartTime.current += audioBuffer.duration;
                            audioSources.current.add(source);
                        }

                        if (message.serverContent?.outputTranscription) {
                            currentOutput = message.serverContent.outputTranscription.text;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'companion') {
                                    return [...prev.slice(0, -1), { speaker: 'companion', text: last.text + currentOutput }];
                                }
                                return [...prev, { speaker: 'companion', text: currentOutput }];
                            });
                        }

                        if (message.serverContent?.turnComplete) {
                            setStatus('listening');
                        }

                        if (message.serverContent?.interrupted) {
                            audioSources.current.forEach(s => s.stop());
                            audioSources.current.clear();
                            nextStartTime.current = 0;
                            setStatus('listening');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setStatus('error');
                        handleSessionClose();
                    },
                    onclose: (e: CloseEvent) => {
                        handleSessionClose();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: `You are a friendly, empathetic, and knowledgeable AI companion for developers named 'Echo'. Your purpose is to be a supportive teammate. Listen to the user's ideas, coding problems, or even just their feelings about work. Offer helpful, constructive feedback, brainstorm solutions, explain complex concepts, and provide encouragement. Understand that coding can be a lonely and stressful activity, and aim to make the user feel heard, understood, and less alone. Keep your responses conversational and encouraging.`,
                },
            });
        } catch (error) {
            console.error("Failed to start conversation:", error);
            setStatus('error');
            setIsSessionActive(false);
        }
    }, [handleSessionClose]);

    const stopConversation = useCallback(async () => {
        if (sessionPromise.current) {
            const session = await sessionPromise.current;
            session.close();
            sessionPromise.current = null;
        }
        handleSessionClose();
    }, [handleSessionClose]);

    const getStatusIndicator = () => {
        switch (status) {
            case 'connecting': return <><LoaderOne /><span className="ml-2">Connecting...</span></>;
            case 'listening': return <><span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span><span className="ml-2">Listening...</span></>;
            case 'speaking': return <><span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span><span className="ml-2">Speaking...</span></>;
            case 'thinking': return <><LoaderOne /><span className="ml-2">Thinking...</span></>;
            case 'error': return <><span className="w-3 h-3 bg-red-500 rounded-full"></span><span className="ml-2">Connection Error</span></>;
            default: return <><span className="w-3 h-3 bg-slate-500 rounded-full"></span><span className="ml-2">Idle</span></>;
        }
    };

    return (
        <>
            <button
                onClick={() => setIsCompanionOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 z-40"
                aria-label="Open AI Voice Companion"
            >
                <Image
                    src="/brand.png"
                    alt="Brand Icon"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                    quality={100}
                    priority
                    
                />
            </button>

            {isCompanionOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-black/50 rounded-3xl backdrop-blur-sm w-full max-w-lg h-[70vh] flex flex-col">
                        <header className="flex items-center justify-between p-4 flex-shrink-0">
                            <div className="flex items-center">
                                <Image
                                    src="/images/brand-logo.png"
                                    alt="Brand Logo"
                                    width={80}
                                    height={80}
                                    className="w-30 h-30"
                                    quality={100}
                                    priority
                                />
                                <h2 className="ml-2 text-lg font-bold">Not So Scary AI Companion</h2>
                            </div>
                            <button onClick={() => { stopConversation(); setIsCompanionOpen(false); }} className="p-2 rounded-full hover:bg-slate-700">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </header>
                        <main className="flex-grow p-4 overflow-y-auto">
                            <div className="space-y-4">
                                {transcript.length === 0 && !isSessionActive && (
                                    <div className="text-center text-slate-400 pt-16">
                                        <p>Hello! I'm Echo, your AI teammate.</p>
                                        <p className="text-sm mt-2">Click the button below to start our conversation.</p>
                                    </div>
                                )}
                                {transcript.map((entry, index) => (
                                    <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-xl ${entry.speaker === 'user' ? 'bg-indigo-600/30 text-white' : 'bg-slate-700/30 backdrop-blur-sm text-slate-200'}`}>
                                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{entry.text}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={transcriptEndRef} />
                            </div>
                        </main>
                        <footer className="p-4 border-t border-slate-700 flex-shrink-0 flex flex-col items-center">
                            <div className="flex items-center text-sm text-slate-400 mb-4">
                                {getStatusIndicator()}
                            </div>
                            {!isSessionActive ? (
                                <button
                                    onClick={startConversation}
                                    className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                                >
                                    <Image
                                        src="/brand.png"
                                        alt="Brand Icon"
                                        width={64}
                                        height={64}
                                        className="w-20 h-20"
                                        quality={100}
                                        priority
                                    />
                                </button>
                            ) : (
                                <button
                                    onClick={stopConversation}
                                    className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                                >
                                    <StopIcon className="w-9 h-9" />
                                </button>
                            )}
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};
