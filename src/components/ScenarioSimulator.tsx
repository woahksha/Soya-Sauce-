import React, { useState } from "react";
import { Play, RotateCcw, AlertTriangle, CloudRain, ShieldCheck, Flag, Zap, Sparkles } from "lucide-react";
import { Scenario } from "../types";

interface SimulatorProps {
  scenarios: Scenario[];
  activeScenarioId: string;
  onSelectScenario: (id: string) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  simulationPhase: string;
}

export default function ScenarioSimulator({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onRunSimulation,
  isSimulating,
  simulationPhase,
}: SimulatorProps) {
  return (
    <div className="bg-white border-4 border-red-500 hover:border-red-600 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all">
      {/* Extreme city disruption box underlined/bordered at the top as a gradient red color */}
      <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-red-600 via-rose-500 to-red-700"></div>

      <div className="pt-2">
        <div className="flex items-center justify-between border-b-2 border-neutral-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#E15307] w-5 h-5 animate-pulse" />
            <div>
              <h4 className="font-black text-black text-sm uppercase tracking-wide">FUTURE DISRUPTION MODE</h4>
              <p className="text-[10px] text-neutral-800 font-bold font-mono">SIMULATE EXTREME CITY DISRUPTIONS</p>
            </div>
          </div>
        </div>

        {/* Short instructions */}
        <p className="text-xs text-neutral-800 mb-4 font-bold leading-relaxed">
          Inject real-time operational disruptions. Select any environment modifier to evaluate Apna Logix's real-time autonomous routing, inventory balancing, and matching.
        </p>

        {/* Live Scenario Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5 mb-5">
          {scenarios.map((scen) => {
            const isActive = activeScenarioId === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => !isSimulating && onSelectScenario(scen.id)}
                disabled={isSimulating}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FFF0BF] border-[#FFAE00] text-black font-extrabold shadow-sm"
                    : "bg-[#FFF9EA]/40 border-yellow-300 hover:bg-[#FFFAD6] text-neutral-800 font-bold"
                } disabled:opacity-50`}
              >
                <span className="text-xl mb-1">{scen.icon}</span>
                <span className="text-[10.5px] font-black tracking-wide uppercase truncate max-w-full">
                  {scen.name}
                </span>
                <span className="text-[8.5px] font-mono text-neutral-700 mt-1 uppercase font-black">
                  RISK: {Math.round(scen.riskMultiplier * 100)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Signature Hackathon Demo Trigger card */}
      <div className="bg-[#FFFDF4] border-2 border-amber-300 rounded-xl p-4 flex flex-col justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#FFEDE1] border border-[#FFAE00]/30 rounded-lg shrink-0">
            <Zap className="w-5 h-5 text-[#E15307] animate-pulse" />
          </div>
          <div>
            <h5 className="text-xs font-black text-black uppercase">LIVE COMMISSION-FREE SIMULATOR</h5>
            <p className="text-[10.5px] text-neutral-800 leading-relaxed font-bold mt-0.5">
              Click to launch a multi-phase real-time simulation: sudden demand rise initiates and multi-agent systems negotiate, auto-reroute vehicles, and optimize logistics logs.
            </p>
          </div>
        </div>

        {/* State Steps for Demo Mode progress */}
        {isSimulating && (
          <div className="bg-[#FFF0BF] border-2 border-[#FFAE00] rounded-lg p-2.5 font-mono text-[11px] text-[#A13B00] font-black animate-pulse">
            <div className="flex items-center gap-1.5 uppercase font-black text-[9px] text-neutral-800 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E15307] inline-block animate-ping"></span>
              <span>SIMULATING APNA LOGIX RUN</span>
            </div>
            <div>{simulationPhase}</div>
          </div>
        )}

        {/* Simulation Execution button */}
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className={`w-full py-3.5 px-4 rounded-xl font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm relative cursor-pointer ${
            isSimulating
              ? "bg-amber-100 text-[#7C2D12] border-2 border-[#FDBA74]"
              : "bg-[#E15307] hover:bg-[#C2410C] text-white border-2 border-transparent font-sans shadow-md"
          }`}
        >
          {isSimulating ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin text-[#7C2D12]" />
              <span>SIMULATION RUNNING...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>RUN FREE AI SIMULATION</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
