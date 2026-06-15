import React from "react";
import { TrendingUp, ArrowUpRight, Zap, Navigation, Award, AlertTriangle, Cpu, CircleDot } from "lucide-react";
import { Language, t } from "../utils/translations";

interface AnalyticsProps {
  totalDeliveries: number;
  activeVehicles: number;
  predictedDemand: string;
  congestionRisk: number;
  utilization: number;
  efficiency: number;
  emissionsSaved: number;
  activeScenarioName: string;
  language: Language;
}

export default function ExecutiveAnalytics({
  totalDeliveries,
  activeVehicles,
  predictedDemand,
  congestionRisk,
  utilization,
  efficiency,
  emissionsSaved,
  activeScenarioName,
  language,
}: AnalyticsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {/* 1. Total Deliveries */}
      <div className="bg-white border-2 border-neutral-300 hover:border-[#FFB800] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFEDE1] rounded-full filter blur-md opacity-30"></div>
        <div className="flex items-center justify-between mb-2 z-10 w-full">
          <span className="text-[10px] text-neutral-800 font-extrabold uppercase tracking-wide">
            {t("totalRoutings", language)}
          </span>
          <ArrowUpRight className="w-4 h-4 text-[#E15307]" />
        </div>
        <div className="z-10 mt-1">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-black font-mono">
            {totalDeliveries.toLocaleString()}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#E15307] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% today</span>
          </div>
        </div>
      </div>

      {/* 2. Active Vehicles - "TRUCKS ON THE ROAD" */}
      <div className="bg-white border-2 border-neutral-300 hover:border-[#FFB800] rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all font-sans">
        <div className="flex items-center justify-between mb-2 z-10 w-full">
          <span className="text-[10px] text-neutral-800 font-extrabold uppercase tracking-wide">
            {t("activeFleet", language)}
          </span>
          <Zap className="w-3.5 h-3.5 text-[#2563EB]" />
        </div>
        <div className="z-10 mt-1">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-black font-mono">
            {activeVehicles}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-800 font-bold">
            <CircleDot className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
            <span>94% Auton. EVs</span>
          </div>
        </div>
      </div>

      {/* 3. Predicted Demand Index - "PREDICTION DEMAND" (Red Borderline as requested) */}
      <div className="bg-white border-2 border-red-500 hover:border-red-600 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-2 z-10 w-full">
          <span className="text-[10px] text-red-700 font-black uppercase tracking-wide">
            {t("predictedDemand", language)}
          </span>
          <TrendingUp className="w-3.5 h-3.5 text-red-600" />
        </div>
        <div className="z-10 mt-1">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-red-700 font-mono">
            {predictedDemand}
          </span>
          <div className="text-[10px] text-neutral-900 mt-1 uppercase font-black truncate">
            {activeScenarioName}
          </div>
        </div>
      </div>

      {/* 4. Congestion Risk (Yellow Borderline as requested) */}
      <div className="bg-white border-2 border-yellow-400 hover:border-yellow-500 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all font-sans">
        <div className="flex items-center justify-between mb-2 z-10 w-full">
          <span className="text-[10px] text-neutral-800 font-extrabold uppercase tracking-wide">
            {t("congestionRisk", language)}
          </span>
          <AlertTriangle className={`w-3.5 h-3.5 ${congestionRisk > 60 ? "text-rose-600" : "text-amber-500"}`} />
        </div>
        <div className="z-10 mt-1">
          <span className={`text-xl sm:text-2xl font-black tracking-tight ${congestionRisk > 65 ? "text-red-700 animate-pulse font-mono" : "text-amber-600 font-mono"}`}>
            {congestionRisk}%
          </span>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${congestionRisk > 60 ? "bg-red-500" : "bg-amber-500"}`}
              style={{ width: `${congestionRisk}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 5. Fleet Utilization - "TRUCKS RUNNING WELL" (Yellow Borderline as requested) */}
      <div className="bg-white border-2 border-yellow-400 hover:border-yellow-500 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-2 z-10 w-full">
          <span className="text-[10px] text-neutral-800 font-extrabold uppercase tracking-wide">
            {t("fleetOptim", language)}
          </span>
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
        </div>
        <div className="z-10 mt-1">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-black font-mono">
            {utilization}%
          </span>
          <div className="items-center mt-1 text-[11px] text-sky-800 font-bold">
            <span>+8.9% capacity load</span>
          </div>
        </div>
      </div>

      {/* 6. Network Efficiency Score (Yellow Borderline as requested) */}
      <div className="bg-white border-2 border-yellow-400 hover:border-yellow-500 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all font-mono">
        <div className="flex items-center justify-between mb-2 z-10 w-full">
          <span className="text-[10px] text-neutral-800 font-extrabold uppercase tracking-wide">
            {t("netEfficiency", language)}
          </span>
          <Cpu className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <div className="z-10 mt-1">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-800 font-mono">
            {efficiency}/100
          </span>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${efficiency}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 7. Carbon Credits (Yellow Borderline as requested) */}
      <div className="bg-white border-2 border-yellow-400 hover:border-yellow-500 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-2 z-10 w-full">
          <span className="text-[10px] text-neutral-800 font-extrabold uppercase tracking-wide">
            {t("carbonSaved", language)}
          </span>
          <Award className="w-3.5 h-3.5 text-teal-600" />
        </div>
        <div className="z-10 mt-1">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-teal-700 font-mono">
            {emissionsSaved} CC
          </div>
          <div className="mt-1 flex flex-col text-[10px] font-bold leading-normal text-neutral-800 font-mono">
            <span>Offset: <strong className="text-teal-700">{emissionsSaved}t CO₂</strong></span>
            <span>Value: <strong className="text-emerald-700">${(emissionsSaved * 45).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
