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

// Client-only: only NEXT_PUBLIC_* vars are available in the browser.
const API_KEY =
  process.env.NEXT_PUBLIC_GEMINI_VOICE_KEY ||
  process.env.NEXT_PUBLIC_API_KEY ||
  '';

export const VoiceCompanion: React.FC = () => {
    const [isCompanionOpen, setIsCompanionOpen] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState<CompanionStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const sessionPromise = useRef<Promise<{ sendRealtimeInput: (input: { media: Blob; }) => void; close: () => void; }> | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const workletNode = useRef<AudioWorkletNode | null>(null);
    const mediaStreamSource = useRef<MediaStreamAudioSourceNode | null>(null);
    const gainNode = useRef<GainNode | null>(null);
    const nextStartTime = useRef(0);
    const audioSources = useRef(new Set<AudioBufferSourceNode>());
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const ai = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const handleSessionClose = useCallback(() => {
        if (workletNode.current) {
            workletNode.current.port.onmessage = null;
            workletNode.current.disconnect();
            workletNode.current = null;
        }
        if (gainNode.current) {
            gainNode.current.disconnect();
            gainNode.current = null;
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
        setConnectionError(null);
    }, []);

    const startConversation = useCallback(async () => {
        if (!API_KEY) {
            console.error("Voice: set NEXT_PUBLIC_GEMINI_VOICE_KEY or NEXT_PUBLIC_API_KEY in .env.local");
            setStatus('error');
            setConnectionError('Missing API key. Add NEXT_PUBLIC_GEMINI_VOICE_KEY to .env.local and restart.');
            return;
        }

        if (!ai.current) {
            ai.current = new GoogleGenAI({ apiKey: API_KEY });
        }

        setStatus('connecting');
        setTranscript([]);
        setConnectionError(null);
        setIsSessionActive(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            inputAudioContext.current = new AudioContextClass({ sampleRate: 16000 });
            outputAudioContext.current = new AudioContextClass({ sampleRate: 24000 });

            const ctx = inputAudioContext.current;
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            await ctx.audioWorklet.addModule('/audio-worklet-processor.js');
            mediaStreamSource.current = ctx.createMediaStreamSource(stream);
            workletNode.current = new AudioWorkletNode(ctx, 'mic-processor');
            gainNode.current = ctx.createGain();
            gainNode.current.gain.value = 0;

            workletNode.current.port.onmessage = (event: MessageEvent<{ type: string; buffer: ArrayBuffer }>) => {
                if (event.data?.type !== 'pcm' || !event.data.buffer) return;
                const pcmBlob: Blob = {
                    data: encode(new Uint8Array(event.data.buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                };
                sessionPromise.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };
            mediaStreamSource.current.connect(workletNode.current);
            workletNode.current.connect(gainNode.current);
            gainNode.current.connect(ctx.destination);

            const connectPromise = ai.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        setConnectionError(null);
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
                        console.error('Gemini Live session error:', e);
                        setStatus('error');
                        setConnectionError('Connection failed. Check your API key and network.');
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
            sessionPromise.current = connectPromise;
            connectPromise.catch((err: unknown) => {
                console.error('Gemini Live connect failed:', err);
                setStatus('error');
                const msg = err instanceof Error ? err.message : String(err);
                setConnectionError(msg.includes('API key') ? 'Invalid or missing API key.' : 'Could not connect. Check console.');
                setIsSessionActive(false);
                handleSessionClose();
            });
        } catch (error) {
            console.error("Failed to start conversation:", error);
            setStatus('error');
            setConnectionError(error instanceof Error ? error.message : 'Setup failed.');
            setIsSessionActive(false);
            handleSessionClose();
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
            case 'connecting': return <span className="text-yellow-500 font-mono text-xs uppercase tracking-widest animate-pulse">Establishing Connection...</span>;
            case 'listening': return <span className="text-green-500 font-mono text-xs uppercase tracking-widest animate-pulse">LISTENING ON CHANNEL_1</span>;
            case 'speaking': return <span className="text-blue-500 font-mono text-xs uppercase tracking-widest animate-pulse">TRANSMITTING AUDIO_OUT...</span>;
            case 'thinking': return <span className="text-purple-500 font-mono text-xs uppercase tracking-widest animate-pulse">PROCESSING DATA...</span>;
            case 'error': return <span className="text-red-500 font-mono text-xs uppercase tracking-widest">{API_KEY ? 'CONNECTION_LOST' : 'MISSING_API_KEY'}</span>;
            default: return <span className="text-white/30 font-mono text-xs uppercase tracking-widest">SYSTEM_IDLE</span>;
        }
    };

    return (
        <>
            <button
                onClick={() => setIsCompanionOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-white border border-white hover:bg-black hover:text-white hover:border-white transition-colors flex items-center justify-center z-40 group"
                aria-label="Open AI Voice Companion"
            >
               <div className="relative w-8 h-8">
                   <Image
                       src="/brand.png"
                       alt="Voice"
                       fill
                       className="object-contain grayscale group-hover:invert transition-all"
                   />
               </div>
            </button>

            {isCompanionOpen && (
                <div className="fixed inset-x-0 top-16 bottom-0 md:inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-8">
                    <div className="w-full max-w-2xl h-full md:h-[80vh] md:max-h-[700px] bg-black border border-white/20 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0d0d0d]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 relative">
                                    <Image
                                        src="/brand.png"
                                        alt="Logo"
                                        fill
                                        className="object-contain grayscale"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-lg font-boldonse text-white uppercase tracking-widest leading-none">Voice Interface</h2>
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Module: ECHO_01</p>
                                </div>
                            </div>
                            <button 
                               onClick={() => { stopConversation(); setIsCompanionOpen(false); }} 
                               className="p-2 border border-white/10 hover:bg-white hover:text-black text-white transition-all"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Transcript Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('/grid.svg')] bg-[length:20px_20px] bg-fixed">
                            {!API_KEY && (
                                <div className="border border-red-500/30 bg-red-500/5 p-4 text-center">
                                    <p className="font-mono text-xs text-red-500 uppercase tracking-widest mb-2">CRITICAL ERROR: MISSING_API_KEY</p>
                                    <p className="font-mono text-[10px] text-white/50">Configure .env.local with valid credentials.</p>
                                </div>
                            )}
                            
                            {connectionError && (
                                <div className="border border-red-500/30 bg-red-500/5 p-4 text-center">
                                    <p className="font-mono text-xs text-red-500 uppercase tracking-widest mb-2">CONNECTION FAILURE</p>
                                    <p className="font-mono text-[10px] text-white/50">{connectionError}</p>
                                </div>
                            )}

                            {transcript.length === 0 && !isSessionActive && API_KEY && !connectionError && (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 pointer-events-none">
                                    <MicrophoneIcon className="w-24 h-24 mb-6 stroke-1" />
                                    <p className="font-boldonse text-2xl uppercase tracking-widest text-center">System Ready</p>
                                    <p className="font-mono text-xs uppercase tracking-wider mt-2">Initialize conversation sequence</p>
                                </div>
                            )}

                            {transcript.map((entry, index) => (
                                <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 border ${entry.speaker === 'user' ? 'border-white bg-white text-black' : 'border-white/20 bg-black text-white'}`}>
                                        <div className="flex items-center gap-2 mb-2 border-b border-black/10 pb-1">
                                           <span className="font-mono text-[8px] uppercase tracking-widest opacity-50">
                                              {entry.speaker === 'user' ? 'USER_INPUT' : 'ECHO_RESPONSE'}
                                           </span>
                                        </div>
                                        <p className="font-mono text-xs leading-relaxed uppercase tracking-wide whitespace-pre-wrap">{entry.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={transcriptEndRef} />
                        </div>

                        {/* Controls */}
                        <div className="p-6 border-t border-white/10 bg-[#0d0d0d] flex flex-col items-center gap-6">
                            <div className="w-full flex justify-center">
                                {getStatusIndicator()}
                            </div>
                            
                            {!isSessionActive ? (
                                <button
                                    onClick={startConversation}
                                    className="w-full py-4 bg-white hover:bg-white/90 text-black border border-white font-mono text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all group"
                                >
                                    <span>Initialize</span>
                                    <div className="w-2 h-2 bg-black group-hover:bg-green-500 transition-colors"></div>
                                </button>
                            ) : (
                                <button
                                    onClick={stopConversation}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white border border-red-600 font-mono text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all animate-pulse hover:animate-none"
                                >
                                    <span>Terminate Signal</span>
                                    <div className="w-2 h-2 bg-white"></div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
