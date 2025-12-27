"use client";

import { useState, useEffect, useRef } from "react";
import { generateCoordinate } from "@/lib/entropy";
import { cn } from "@/lib/utils";
import { saveKey, loadKey } from "@/lib/security";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileImage, Info, Lock, Zap } from "lucide-react";

type Phase = "void" | "viewing" | "manifestation" | "debrief";
type Protocol = "PRECOGNITION" | "REMOTE_VIEWING";

export default function AetherFlow() {
    const [phase, setPhase] = useState<Phase>("void");
    const [coordinate, setCoordinate] = useState<string>("");
    const [isMounted, setIsMounted] = useState(false);
    const [description, setDescription] = useState("");
    const [sketchUrl, setSketchUrl] = useState<string | null>(null);
    const [result, setResult] = useState<{ targetUrl: string; analysis: string; prompt: string; protocol: Protocol; seed: number } | null>(null);
    const [apiKey, setApiKey] = useState("");
    const [protocol, setProtocol] = useState<Protocol>("PRECOGNITION");
    const [showInfo, setShowInfo] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCoordinate(generateCoordinate());
        setIsMounted(true);
        // Load encrypted key from session storage
        const storedKey = loadKey();
        if (storedKey) setApiKey(storedKey);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) setSketchUrl(e.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearFile = () => {
        setSketchUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCommit = async () => {
        setPhase("manifestation");

        try {
            // We pass the raw key to the API (over SSL/TLS)
            const res = await fetch("/api/generate", {
                method: "POST",
                body: JSON.stringify({ sketch: sketchUrl, description, coordinate, apiKey, protocol }),
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setResult(data);
            setPhase("debrief");
        } catch (e) {
            console.error(e);
            alert("Manifestation failed. The timeline is unstable. (Check API Key)");
            setPhase("viewing");
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono flex flex-col items-center justify-center overflow-hidden relative selection:bg-neutral-700 selection:text-white">

            {/* INFO MODAL */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowInfo(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full p-8 rounded-sm shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={20} /></button>
                            <h2 className="text-2xl font-bold mb-6 tracking-tight text-white">Protocol Definitions</h2>

                            <div className="space-y-6">
                                <div className="p-4 border border-emerald-900/30 bg-emerald-950/10 rounded-sm">
                                    <h3 className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2">
                                        <Lock size={14} /> Anchor Mode (Remote Viewing)
                                    </h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        The target is <strong>deterministically locked</strong> at the moment the coordinate is generated (T-0).
                                        The image already "exists" mathematically before you start your session.
                                        <br /><span className="text-emerald-500/50 text-xs mt-2 block">Goal: Perceive information that is already fixed in spacetime.</span>
                                    </p>
                                </div>

                                <div className="p-4 border border-violet-900/30 bg-violet-950/10 rounded-sm">
                                    <h3 className="flex items-center gap-2 text-violet-400 font-bold uppercase tracking-widest text-xs mb-2">
                                        <Zap size={14} /> Paradox Mode (Precognition)
                                    </h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed">
                                        The target is <strong>generated randomly</strong> only AFTER you submit your session (T+1).
                                        The image does not exist when you are drawing it.
                                        <br /><span className="text-violet-500/50 text-xs mt-2 block">Goal: Perceive information from a future timeline that hasn't happened yet.</span>
                                    </p>
                                </div>

                                <div className="p-4 border border-neutral-800 bg-neutral-900/50 rounded-sm mt-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Simulated Reality</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        <strong>Note:</strong> In both protocols, the "Target" is a simulated construct generated by Artificial Intelligence.
                                        It does not exist in the physical world. The experiment tests your ability to perceive <em>information causing the simulation</em>, not a physical location.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {phase === "void" && (
                    <motion.div
                        key="void"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-8 z-10"
                    >
                        <div className="flex flex-col items-center gap-2 max-w-lg text-center">
                            <span className="text-xs uppercase tracking-[0.3em] text-neutral-500 animate-pulse">Aether Link Established</span>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white/20 select-none">
                                [LOCKED]
                            </h1>
                            <div className="flex items-center gap-2 mt-4 justify-center">
                                <p className="text-[10px] md:text-xs text-neutral-400 font-sans">
                                    PROJECT AETHER: <strong className="text-white">Temporal Perception Protocol</strong>
                                </p>
                                <button onClick={() => setShowInfo(true)} className="text-neutral-500 hover:text-white transition-colors">
                                    <Info size={14} />
                                </button>
                            </div>
                        </div>

                        {/* PROTOCOL TOGGLE */}
                        <div className="flex items-center bg-neutral-900/50 border border-neutral-800 p-1 rounded-full">
                            <button
                                onClick={() => setProtocol("PRECOGNITION")}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all",
                                    protocol === "PRECOGNITION" ? "bg-violet-900/30 text-violet-200 shadow-[0_0_10px_rgba(139,92,246,0.3)]" : "text-neutral-500 hover:text-neutral-300"
                                )}
                            >
                                Paradox Mode
                            </button>
                            <button
                                onClick={() => setProtocol("REMOTE_VIEWING")}
                                className={cn(
                                    "px-4 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all",
                                    protocol === "REMOTE_VIEWING" ? "bg-emerald-900/30 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "text-neutral-500 hover:text-neutral-300"
                                )}
                            >
                                Anchor Mode
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 w-full max-w-xs items-center">
                            <input
                                type="password"
                                placeholder="OPENROUTER API KEY"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    saveKey(e.target.value);
                                }}
                                className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs text-center text-neutral-300 focus:outline-none focus:border-neutral-500 tracking-widest transition-colors placeholder:text-neutral-700 font-mono"
                            />
                            <p className="text-[9px] text-neutral-600 uppercase tracking-wider">
                                Required: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors">Key from OpenRouter.ai</a>
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                if (!apiKey) {
                                    alert("API KEY REQUIRED FOR INITIALIZATION");
                                    return;
                                }
                                setPhase("viewing");
                            }}
                            className="group relative px-8 py-3 bg-transparent border border-neutral-700 hover:border-neutral-300 transition-all duration-500 overflow-hidden cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out mix-blend-difference" />
                            <span className="relative z-10 text-xs uppercase tracking-[0.2em] group-hover:text-black transition-colors duration-500">
                                Initiate Protocol
                            </span>
                        </button>
                    </motion.div>
                )}

                {phase === "viewing" && (
                    <motion.div
                        key="viewing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 p-4 md:p-12 max-w-7xl mx-auto"
                    >
                        <div className="flex flex-col gap-4 w-full md:w-1/2 items-center">
                            <div className="flex flex-col items-center gap-1 mb-4">
                                <span className="text-[10px] uppercase tracking-widest text-emerald-500 animate-pulse">Target Locked</span>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                                    [{coordinate}]
                                </h1>
                            </div>

                            {/* File Upload Zone */}
                            <div className="w-full aspect-square max-w-[500px] border border-neutral-700 bg-[#0f0f0f] relative group">
                                {sketchUrl ? (
                                    <div className="w-full h-full relative">
                                        <img src={sketchUrl} alt="Uploaded Sketch" className="w-full h-full object-contain" />
                                        <button onClick={clearFile} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all cursor-pointer">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-full flex flex-col items-center justify-center gap-4 text-neutral-600 hover:text-neutral-400 hover:bg-white/5 transition-all cursor-pointer"
                                    >
                                        <Upload size={32} strokeWidth={1} />
                                        <div className="text-center p-8">
                                            <p className="text-xs uppercase tracking-widest mb-2">Acquire Visual Data</p>
                                            <p className="text-[10px] text-neutral-700">Focus on the coordinate. Upload sketch when ready.</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 w-full md:w-1/2 h-[500px]">
                            <div className="flex flex-col gap-2 h-full">
                                <label className="text-xs uppercase tracking-[0.2em] text-neutral-500">Sensory Data</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full h-full bg-neutral-900 border border-neutral-800 p-4 text-sm text-neutral-300 focus:outline-none focus:border-neutral-600 resize-none font-sans"
                                    placeholder="Describe textures, smells, sounds, temperatures..."
                                />
                            </div>

                            <div className="mt-auto">
                                <div className="p-4 border border-red-900/30 bg-red-950/10 rounded-sm mb-4">
                                    <p className="text-[10px] uppercase text-red-400 tracking-wider">
                                        warning: observation affects reality.
                                    </p>
                                    <p className="text-[10px] text-red-400/70 mt-1">
                                        Submitting this session will collapse the wave function.
                                    </p>
                                </div>

                                <button
                                    onClick={handleCommit}
                                    className="w-full py-4 bg-white hover:bg-neutral-200 text-black uppercase tracking-[0.2em] font-bold transition-colors cursor-pointer"
                                >
                                    Commit & Collapse
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === "manifestation" && (
                    <motion.div
                        key="manifestation"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 text-center p-8"
                    >
                        <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-white animate-spin mb-4" />
                        <h2 className="text-2xl font-light">Collapsing Wave Function...</h2>
                        <p className="text-xs uppercase tracking-widest text-neutral-500 max-w-md animate-pulse">
                            Generating Target from Entropy Hash...
                            <br />
                            {sketchUrl ? "Consulting The Judge..." : "Skipping Analysis Protocol..."}
                        </p>
                    </motion.div>
                )}

                {phase === "debrief" && result && (
                    <motion.div
                        key="debrief"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto overflow-y-auto"
                    >
                        <div className="flex flex-col md:flex-row gap-8 mb-8 h-[500px]">
                            {/* User Data */}
                            <div className={cn("flex-1 flex flex-col gap-2", !sketchUrl && "opacity-50 grayscale")}>
                                <span className="text-xs uppercase tracking-widest text-neutral-500">Your Perception</span>
                                <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-sm overflow-hidden relative flex items-center justify-center">
                                    {sketchUrl ? (
                                        <img src={sketchUrl} alt="Your Sketch" className="absolute inset-0 w-full h-full object-contain bg-black" />
                                    ) : (
                                        <div className="text-neutral-700 flex flex-col items-center gap-2">
                                            <FileImage size={24} />
                                            <span className="text-[10px] uppercase tracking-widest">No Sketch Data</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-400 italic line-clamp-2">"{description}"</p>
                            </div>

                            {/* Reality */}
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs uppercase tracking-widest text-neutral-500">Objective Reality</span>
                                    <span className={cn("text-[9px] uppercase tracking-wider px-2 py-1 rounded bg-neutral-800", result.protocol === "PRECOGNITION" ? "text-violet-400" : "text-emerald-400")}>
                                        {result.protocol === "PRECOGNITION" ? "Paradox" : "Anchor"}
                                    </span>
                                </div>
                                <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-sm overflow-hidden relative">
                                    <img src={result.targetUrl} alt="Target Reality" className="absolute inset-0 w-full h-full object-cover" />
                                </div>
                                <p className="text-xs text-neutral-400 italic line-clamp-2">Prompt: {result.prompt}</p>
                            </div>
                        </div>

                        {/* Analysis */}
                        {sketchUrl && (
                            <div className="w-full bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-sm">
                                <h3 className="text-xs uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-800 pb-2">Judgement Protocol</h3>
                                <div className="prose prose-invert max-w-none text-sm font-sans leading-relaxed">
                                    <p>{result.analysis}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setPhase("void");
                                setResult(null);
                                setSketchUrl(null);
                                setDescription("");
                                setCoordinate(generateCoordinate());
                            }}
                            className="mt-8 self-center px-8 py-3 border border-neutral-700 hover:bg-white hover:text-black transition-all text-xs uppercase tracking-widest cursor-pointer"
                        >
                            Initiate New Cycle
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>

            <div className="absolute top-4 left-4 text-[10px] text-neutral-600 uppercase tracking-widest pointer-events-none">
                Project Aether v1.2
            </div>
        </div>
    );
}
