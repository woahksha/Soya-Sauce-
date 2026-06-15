import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, Shield, Compass, Sliders, Volume2, VolumeX, MessageSquare, AudioLines, Zap, Sparkles } from "lucide-react";
import { AgentMessage } from "../types";

interface AgentCoordinationProps {
  messages: AgentMessage[];
  isThinking: boolean;
  onSendCustomIncident: (customText: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const AGENT_META = {
  "Demand Agent": {
    avatar: "📊",
    color: "text-emerald-700 border-emerald-600/30",
    bg: "bg-emerald-50",
    accent: "bg-emerald-500",
    role: "Demand Forecaster",
    model: "DeepMind-Logix-Demand-V4",
  },
  "Route Agent": {
    avatar: "🗺️",
    color: "text-amber-700 border-amber-600/30",
    bg: "bg-amber-50",
    accent: "bg-amber-500",
    role: "Congestion Router",
    model: "DeepMind-Logix-Route-V3",
  },
  "Warehouse Agent": {
    avatar: "📦",
    color: "text-[#E15307] border-orange-600/30",
    bg: "bg-[#FFEDE1]",
    accent: "bg-[#E15307]",
    role: "Inventory Balancer",
    model: "DeepMind-Logix-Store-V5",
  },
  "Fleet Agent": {
    avatar: "⚡",
    color: "text-blue-700 border-blue-600/30",
    bg: "bg-blue-50",
    accent: "bg-blue-500",
    role: "Capacity Manager",
    model: "DeepMind-Logix-Fleet-V6",
  },
};

export default function AgentCoordination({
  messages,
  isThinking,
  onSendCustomIncident,
  soundEnabled,
  setSoundEnabled,
}: AgentCoordinationProps) {
  const [inputText, setInputText] = useState("");
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Play synthetic Sci-Fi chimes
  const playChime = (pitch = 440, type: OscillatorType = "sine", duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context block browser safety
    }
  };

  // Auto Scroll & Sound trigger on message update
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0) {
      playChime(620, "sine", 0.06);
      setTimeout(() => playChime(840, "sine", 0.08), 50);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendCustomIncident(inputText);
    setInputText("");
    playChime(350, "sawtooth", 0.15); // Confirmation sound
  };

  return (
    <div className="bg-[#FFFDE3] border-4 border-amber-400 hover:border-[#FFAE00] rounded-2xl p-5 flex flex-col h-[520px] shadow-sm overflow-hidden relative transition-all">
      {/* Decorative cyber grid overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFEDE1] rounded-full filter blur-xl pointer-events-none opacity-45"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#E15307] animate-pulse" />
          <div>
            <h3 className="font-black text-black text-sm tracking-wide uppercase font-sans">
              Autonomous Coordination Engine
            </h3>
            <p className="text-[10px] text-neutral-800 font-bold font-mono flex items-center gap-1.5 uppercase">
              <AudioLines className="w-3.5 h-3.5 text-[#E15307]" /> MULTI-AGENT EXCHANGE | 4 CORES ONLINE
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border-2 transition-all cursor-pointer ${
              soundEnabled
                ? "bg-amber-100 border-amber-400 text-amber-900"
                : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
            }`}
            title={soundEnabled ? "Mute Sonic Feedback" : "Unmute Sonic Feedback"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <span className="text-[10px] font-black font-mono bg-white px-2 py-1 border-2 border-neutral-300 text-neutral-850 rounded-md">
            SYS STATUS: <span className="text-emerald-700">NOMINAL</span>
          </span>
        </div>
      </div>

      {/* Conversational timeline channel stream */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3.5 custom-scrollbar pb-4">
        {messages.map((m, i) => {
          const meta = AGENT_META[m.agent] || {
            avatar: "🤖",
            color: "text-neutral-900",
            bg: "bg-neutral-100",
            accent: "bg-[#E15307]",
            role: "AI Core",
            model: "Core-L1",
          };

          const isAction = m.status === "action";
          const isWarning = m.status === "warning";

          return (
            <div
              key={m.id || i}
              className="flex gap-3 items-start animate-fade-in transition-all"
            >
              {/* Agent Avatar Frame */}
              <div className="relative shrink-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border-2 relative ${meta.bg} ${meta.color} font-sans shadow p-1`}
                >
                  {meta.avatar}
                  <span className={`absolute bottom-[-1.5px] right-[-1.5px] w-2.5 h-2.5 rounded-full border-2 border-white ${meta.accent} animate-ping`}></span>
                  <span className={`absolute bottom-[-1.5px] right-[-1.5px] w-2.5 h-2.5 rounded-full border-2 border-white ${meta.accent}`}></span>
                </div>
              </div>

              {/* Chat Bubble card with high readability black text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline flex-wrap gap-1.5 mb-1">
                  <span className="text-xs font-black text-black">{m.agent}</span>
                  <span className="text-[9px] font-mono text-neutral-800 bg-white/70 px-1 py-0.5 rounded border border-neutral-300 uppercase font-bold">
                    {meta.role}
                  </span>
                  <span className="text-[8px] font-mono text-neutral-700 font-bold">
                    {meta.model}
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-neutral-800 font-bold">{m.timestamp}</span>
                </div>

                <div
                  className={`rounded-xl px-4 py-2.5 text-xs text-black font-semibold leading-relaxed border-2 relative ${
                    isWarning
                      ? "bg-red-50 border-red-300"
                      : isAction
                      ? "bg-emerald-50 border-emerald-300"
                      : "bg-white border-neutral-300"
                  }`}
                >
                  {/* Message status bar tag */}
                  {m.status !== "info" && (
                    <span
                      className={`absolute top-2.5 right-2 text-[8px] font-black uppercase px-1 rounded border-2 ${
                        isWarning
                          ? "bg-red-100 text-red-800 border-red-300"
                          : isAction
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-[#7C2D12] border-amber-300"
                      }`}
                    >
                      {m.status}
                    </span>
                  )}
                  <p className="pr-12">{m.text}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Typing Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-3 items-center py-2 animate-pulse text-xs text-[#E15307] font-black font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E15307] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E15307]"></span>
            </span>
            <span>LOGIX CENTRAL THREAD CALCULATING OPTIMIZED STRATEGIES...</span>
          </div>
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Commander's Overwriting Console */}
      <form onSubmit={handleSubmit} className="mt-3 border-t-2 border-neutral-200 pt-3">
        <label className="text-[10px] font-black text-black mb-1.5 flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#E15307] animate-pulse" /> OVERWRITE (Bina commission direct command!)
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type any crisis (e.g. 'Heavy rain in South Delhi sector 12')..."
            className="w-full bg-white border-2 border-neutral-350 rounded-xl pl-4 pr-24 py-3 text-xs text-black font-semibold placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 transition-all font-mono"
            disabled={isThinking}
          />
          <button
            type="submit"
            disabled={isThinking || !inputText.trim()}
            className="absolute right-2 px-3 py-1.5 bg-[#E15307] hover:bg-[#C2410C] text-white font-sans text-xs font-black rounded-lg transition-all flex items-center gap-1 disabled:opacity-40 cursor-pointer shadow border-2 border-transparent"
          >
            <span>Ask AI</span>
            <Send className="w-3 h-3 text-white" />
          </button>
        </div>
        <p className="text-[9px] text-neutral-800 font-bold font-mono mt-1.5 w-full text-right uppercase">
          SECURE CONNECTION VIA SYSTEM GEMINI ENGINE
        </p>
      </form>
    </div>
  );
}
