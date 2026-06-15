import React from "react";
import { TrendingUp, BarChart4, Clock, ShieldAlert, CheckCircle, Percent, Zap } from "lucide-react";
import { SimulationScores } from "../types";

interface ChartsProps {
  scores: SimulationScores;
  demandSurges: { delhi: number; noida: number; gurgaon: number };
}

export default function AnalyticsCharts({ scores, demandSurges }: ChartsProps) {
  const hours = ["08:00", "12:00", "16:00", "20:00", "00:00", "04:00"];
  const points = [35, 65, 88, 55, 25, 12];

  const getSurgValue = (city: string) => {
    if (city === "delhi") return demandSurges.delhi;
    if (city === "noida") return demandSurges.noida;
    return demandSurges.gurgaon;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* AI Demand Forecast Panel (Next 24h) */}
      <div className="lg:col-span-5 bg-white border-2 border-neutral-300 hover:border-[#FFB800] rounded-2xl p-5 flex flex-col justify-between shadow-sm relative transition-all">
        <div>
          <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-emerald-700 w-5 h-5" />
              <div>
                <h4 className="font-black text-black text-sm uppercase tracking-wide">AI Demand Forecast</h4>
                <p className="text-[10px] text-neutral-800 font-bold font-mono">NEXT 24 HOURS REAL-TIME ESTIMATES</p>
              </div>
            </div>
          </div>

          {/* Regional Demand Heatmap list selector */}
          <div className="space-y-3 mb-5">
            {[
              { id: "delhi", label: "South Delhi Network", change: getSurgValue("delhi") },
              { id: "noida", label: "Noida Inbound Corridor", change: getSurgValue("noida") },
              { id: "gurgaon", label: "Gurgaon Manufacturing Sector", change: getSurgValue("gurgaon") },
            ].map((region) => {
              const isPositive = region.change >= 0;
              return (
                <div key={region.id} className="bg-[#FFFDF4] border-2 border-neutral-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-black">{region.label}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-800 font-bold mt-0.5">
                      <span>LOAD SENSITIVITY: MEDIUM</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black font-mono ${isPositive ? "text-emerald-700" : "text-rose-700"}`}>
                      {isPositive ? `+${region.change}%` : `${region.change}%`}
                    </span>
                    <div className="w-16 bg-neutral-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${isPositive ? "bg-emerald-600" : "bg-rose-500"}`}
                        style={{ width: `${Math.min(Math.abs(region.change) * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="bg-[#FFFDF4]/80 border-2 border-neutral-200 rounded-xl p-3 mt-1">
          <div className="text-[10px] font-bold text-neutral-850 mb-2 uppercase">VOLUME FORECAST TRACE</div>
          <div className="relative h-28 w-full bg-white border border-neutral-300 rounded-lg p-2 overflow-hidden">
            <svg viewBox="0 0 400 100" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f1f1" strokeDasharray="3,3" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f1f1" strokeDasharray="3,3" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f1f1" strokeDasharray="3,3" />

              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d={`M 0 100 
                    L 0 ${100 - points[0]} 
                    L 80 ${100 - points[1] - getSurgValue("delhi") * 0.2} 
                    L 160 ${100 - points[2] - getSurgValue("noida") * 0.1} 
                    L 240 ${100 - points[3]} 
                    L 320 ${100 - points[4]} 
                    L 400 ${100 - points[5]} 
                    L 400 100 Z`}
                fill="url(#chartGrad)"
              />

              <path
                d={`M 0 ${100 - points[0]} 
                    L 80 ${100 - points[1] - getSurgValue("delhi") * 0.2} 
                    L 160 ${100 - points[2] - getSurgValue("noida") * 0.1} 
                    L 240 ${100 - points[3]} 
                    L 320 ${100 - points[4]} 
                    L 400 ${100 - points[5]}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              <circle cx="160" cy={100 - points[2] - getSurgValue("noida") * 0.1} r="5" fill="#10b981" stroke="#fff" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-neutral-800 mt-2 px-1">
            {hours.map((h, i) => (
              <span key={i}>{h}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Comparison Mode */}
      <div className="lg:col-span-7 bg-white border-2 border-neutral-300 hover:border-[#FFB800] rounded-2xl p-5 flex flex-col justify-between shadow-sm relative transition-all">
        <div>
          <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BarChart4 className="text-blue-700 w-5 h-5 flex-shrink-0" />
              <div>
                <h4 className="font-black text-black text-sm uppercase tracking-wide">Simulation Comparison Engine</h4>
                <p className="text-[10px] text-neutral-800 font-bold font-mono">APNA LOGIX MULTI-AGENT vs TRADITIONAL DISPATCH</p>
              </div>
            </div>
          </div>

          <p className="text-[11.5px] text-neutral-800 mb-4 bg-amber-50 border-2 border-amber-200 p-2.5 rounded-lg leading-relaxed font-bold">
            Analysis based on current Indian parameters: <span className="text-emerald-800 font-extrabold">Continuous Dynamic Matching Active</span>
          </p>

          {/* Stacked comparison bar graphs */}
          <div className="space-y-4">
            {/* 1. Avg Delivery Time */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-black">Average Delivery Cycle</span>
                <div className="flex gap-3 font-mono text-[11px] font-black">
                  <span className="text-neutral-700">Traditional: {scores.withoutLogix.deliveryTime}h</span>
                  <span className="text-[#E15307]">APNA: {scores.withLogix.deliveryTime}h</span>
                </div>
              </div>
              <div className="h-6 w-full bg-neutral-100 border-2 border-neutral-300 rounded-lg overflow-hidden flex items-center relative px-2 gap-1.5">
                <div className="bg-red-50 border-r-2 border-red-200 h-full w-full flex items-center pl-1">
                  <span className="text-[10px] font-black text-red-800 uppercase tracking-tight">Without Apna Logix: High Delay</span>
                </div>
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[#FFF0BF] border-l-2 border-amber-400 flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${Math.max(10, 100 - (scores.withLogix.deliveryTime / scores.withoutLogix.deliveryTime) * 100)}%` }}
                >
                  <span className="text-[10px] font-black font-mono text-[#7C2D12] uppercase tracking-wide animate-pulse">
                    {Math.round(((scores.withoutLogix.deliveryTime - scores.withLogix.deliveryTime) / scores.withoutLogix.deliveryTime) * 100)}% faster
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Fuel / CO2 Efficiency */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-black">CO2 Efficiency & Power Usage</span>
                <div className="flex gap-3 font-mono text-[11px] font-black">
                  <span className="text-neutral-700">Static: {scores.withoutLogix.fuelSavings}%</span>
                  <span className="text-emerald-700">APNA: {scores.withLogix.fuelSavings}%</span>
                </div>
              </div>
              <div className="h-4 bg-neutral-200 rounded-full overflow-hidden flex flex-col gap-1.5 relative border border-neutral-300">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.withLogix.fuelSavings}%` }}
                ></div>
                <div
                  className="absolute bottom-0 top-0 bg-rose-200/50 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.withoutLogix.fuelSavings}%` }}
                ></div>
              </div>
            </div>

            {/* 3. Driver/Vehicle Utilization */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-black">Fleet Capacity Optimization Rate</span>
                <div className="flex gap-3 font-mono text-[11px] font-black">
                  <span className="text-neutral-700">Static: {scores.withoutLogix.utilization}%</span>
                  <span className="text-blue-700">APNA: {scores.withLogix.utilization}%</span>
                </div>
              </div>
              <div className="h-4 bg-neutral-200 rounded-full overflow-hidden flex flex-col gap-1.5 relative border border-neutral-300">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.withLogix.utilization}%` }}
                ></div>
                <div
                  className="absolute bottom-0 top-0 bg-neutral-350 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.withoutLogix.utilization}%` }}
                ></div>
              </div>
            </div>

            {/* 4. On-Time Delivery Ratio */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-bold">
                <span className="text-black">SLA On-Time Guarantee</span>
                <div className="flex gap-3 font-mono text-[11px] font-black">
                  <span className="text-neutral-700">Baseline: {scores.withoutLogix.onTimeRate}%</span>
                  <span className="text-indigo-700">APNA: {scores.withLogix.onTimeRate}%</span>
                </div>
              </div>
              <div className="h-4 bg-neutral-200 rounded-full overflow-hidden flex flex-col gap-1.5 relative border border-neutral-300">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.withLogix.onTimeRate}%` }}
                ></div>
                <div
                  className="absolute bottom-0 top-0 bg-red-100 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scores.withoutLogix.onTimeRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic bottom telemetry comparing LOGIX benefits */}
        <div className="grid grid-cols-2 gap-3.5 mt-5 border-t border-neutral-200 pt-4 text-xs font-sans">
          <div className="bg-[#FFFDF4] p-2.5 rounded-lg border-2 border-neutral-200 flex items-center gap-2">
            <CheckCircle className="text-emerald-700 w-5 h-5 shrink-0" />
            <div>
              <span className="block font-black text-black">Revenue Impact Boost</span>
              <span className="font-mono text-[11px] text-emerald-800 font-black">+{scores.withLogix.revenueImpact}% Network Yield</span>
            </div>
          </div>
          <div className="bg-[#FFFDF4] p-2.5 rounded-lg border-2 border-neutral-200 flex items-center gap-2">
            <Zap className="text-blue-700 w-5 h-5 shrink-0" />
            <div>
              <span className="block font-black text-black">Autonomous Match</span>
              <span className="font-mono text-[11px] text-blue-800 font-black">Direct Commission-Free Sauda</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
