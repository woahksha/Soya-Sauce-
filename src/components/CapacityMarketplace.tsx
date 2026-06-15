import React from "react";
import { Truck, ArrowRightLeft, Clock, Grid, Compass, CheckCircle2, ShieldAlert, BadgeInfo } from "lucide-react";
import { CapacityTrade, OptimizationRecommendation } from "../types";

interface MarketplaceProps {
  capacityTrades: CapacityTrade[];
  recommendations: OptimizationRecommendation[];
  onExecuteRecommendation: (id: string) => void;
  onAcceptCapacityTrade: (id: string) => void;
}

export default function CapacityMarketplace({
  capacityTrades,
  recommendations,
  onExecuteRecommendation,
  onAcceptCapacityTrade,
}: MarketplaceProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 5. Empty Capacity Marketplace */}
      <div className="bg-white border-2 border-neutral-300 hover:border-[#FFB800] rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all">
        <div>
          <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Truck className="text-blue-700 w-5 h-5 animate-pulse" />
              <div>
                <h4 className="font-black text-black text-sm uppercase tracking-wide">Capacity Marketplace</h4>
                <p className="text-[10px] text-neutral-850 font-bold font-mono">AUTONOMOUS FILL ESTIMATES & MATCHING</p>
              </div>
            </div>
            <span className="text-[10px] font-black font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded border border-blue-300 uppercase">
              3 Nearby Deals
            </span>
          </div>

          <p className="text-[11.5px] text-neutral-800 font-bold mb-4 leading-relaxed font-sans">
            Logix continuously scans the region to detect vehicles traveling with empty trailer space and matches them with spot shipments to maximize fleet yields.
          </p>

          <div className="space-y-3">
            {capacityTrades.map((trade) => (
              <div key={trade.id} className="bg-[#FFFDF4] border-2 border-neutral-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-[#FFAE00]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-black font-mono">{trade.truckId}</span>
                    <span className="text-[9px] font-black bg-white text-neutral-800 px-2 py-0.5 rounded border-2 border-neutral-300 font-sans">
                      {trade.location}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-black font-bold font-sans">
                    Shipper: {trade.shipmentType}
                  </div>
                  <div className="flex items-center gap-3 text-[10.5px] font-black font-mono text-neutral-800">
                    <div>
                      Unused: <span className="text-[#E15307]">{trade.availableCapacity}%</span>
                    </div>
                    <div className="h-3 w-px bg-neutral-300"></div>
                    <div>
                      Match: <span className="text-emerald-700">{trade.matchScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-1">
                  <span className="text-xs font-black text-emerald-800 font-mono">{trade.revenueBoost}</span>
                  <button
                    onClick={() => onAcceptCapacityTrade(trade.id)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10.5px] rounded-lg font-black transition-all uppercase border-2 border-transparent cursor-pointer"
                  >
                    Accept Shipment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. AI Optimization Recommendations */}
      <div className="bg-white border-2 border-neutral-300 hover:border-[#FFB800] rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all">
        <div>
          <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Compass className="text-indigo-700 w-5 h-5" />
              <div>
                <h4 className="font-black text-black text-sm uppercase tracking-wide">AI Optimization Decisions</h4>
                <p className="text-[10px] text-neutral-850 font-bold font-mono">AUTOMATED NETWORK BALANCING DIRECTIVES</p>
              </div>
            </div>
            <span className="text-[10px] font-black font-mono bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded border border-indigo-300 uppercase animate-pulse">
              Optimization Core Active
            </span>
          </div>

          <p className="text-[11.5px] text-neutral-800 font-bold mb-4 leading-relaxed font-sans">
            Pending recommendations dispatched by coordinates AI agents. Approve or activate autonomous triggers below.
          </p>

          <div className="space-y-3">
            {recommendations.map((rec) => {
              const isExecuting = rec.status === "Executing";
              const isCompleted = rec.status === "Completed";

              return (
                <div key={rec.id} className="bg-[#FFFDF4] border-2 border-neutral-200 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-[#FFAE00] transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border-2 uppercase font-mono ${
                        rec.category === "Inventory"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : rec.category === "Route"
                          ? "bg-amber-100 text-[#7C2D12] border-amber-300"
                          : "bg-sky-100 text-sky-800 border-sky-300"
                      }`}>
                        {rec.category}
                      </span>
                      <span className="text-[10.5px] font-bold font-mono text-neutral-800">{rec.time}</span>
                    </div>
                    <div className="text-xs font-black text-black">{rec.title}</div>
                    <p className="text-[11px] text-neutral-800 font-bold font-sans leading-normal">{rec.description}</p>
                    <div className="text-[10.5px] font-black font-mono text-emerald-700 uppercase tracking-wider">
                      IMPACT: {rec.impact}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    {isCompleted ? (
                      <span className="text-emerald-700 font-black font-mono text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </span>
                    ) : isExecuting ? (
                      <span className="text-amber-700 font-black font-mono text-[11px] animate-pulse flex items-center gap-1">
                        <Clock className="w-4 h-4 animate-spin animate-pulse" />
                        <span>Working</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onExecuteRecommendation(rec.id)}
                        className="px-3 py-1.5 bg-[#E15307] hover:bg-[#C2410C] text-white font-black font-sans text-[11px] rounded-lg transition-all uppercase border-2 border-transparent cursor-pointer"
                      >
                        Execute
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
