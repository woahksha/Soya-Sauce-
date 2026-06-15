import React, { useState } from "react";
import { Radio, Truck, Activity, Battery, Zap, AlertTriangle, Globe, Settings } from "lucide-react";
import { Hub, Vehicle } from "../types";
import { APIProvider, Map as GMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

interface MapProps {
  hubs: Hub[];
  vehicles: Vehicle[];
  activeScenarioId: string;
  onSelectVehicle: (v: Vehicle | null) => void;
  onSelectHub: (h: Hub | null) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY.trim() !== "";

export default function CommandCenterMap({
  hubs,
  vehicles,
  activeScenarioId,
  onSelectVehicle,
  onSelectHub,
}: MapProps) {
  const [selectedItem, setSelectedItem] = useState<{ type: "hub" | "vehicle"; id: string } | null>(null);
  const [mapMode, setMapMode] = useState<"vector" | "google">("vector");

  // Define coordinate limits for mapping to India SVG space (width: 800, height: 480)
  const mapToSVG = (lat: number, lng: number) => {
    const latMin = 8.0;
    const latMax = 33.0; // Perfect bounding box from Kanyakumari to Kashmir
    const lngMin = 68.0;
    const lngMax = 91.5; // From West Gujarat to East Kolkata

    const x = ((lng - lngMin) / (lngMax - lngMin)) * 800;
    const y = 480 - ((lat - latMin) / (latMax - latMin)) * 480; // Invert Y for screen coordinates
    return { x, y };
  };

  // Border points representing the real map of India outline
  const borderPoints = [
    { lat: 34.5, lng: 76.5 },  // Jammu & Kashmir North point
    { lat: 33.0, lng: 78.5 },
    { lat: 31.0, lng: 79.5 },
    { lat: 28.5, lng: 80.5 },  // Nepal Border Start
    { lat: 27.5, lng: 85.0 },
    { lat: 27.3, lng: 88.5 },  // Sikkim
    { lat: 28.0, lng: 91.5 },  // Bhutan
    { lat: 25.5, lng: 91.0 },  // Assam / Eastern Hills
    { lat: 24.5, lng: 89.5 },  // Bangladesh Border
    { lat: 21.8, lng: 89.0 },  // Sundarbans Delta
    { lat: 19.8, lng: 86.5 },  // Odisha Coast
    { lat: 17.0, lng: 83.2 },  // Vizag
    { lat: 13.0, lng: 80.3 },  // Chennai
    { lat: 9.3,  lng: 78.5 },  // Southern Tip Area
    { lat: 8.0,  lng: 77.5 },  // Kanyakumari Tip
    { lat: 10.0, lng: 76.0 },  // Cochin / Kerala Coast
    { lat: 13.0, lng: 74.8 },  // Karnataka Coast
    { lat: 15.5, lng: 73.8 },  // Goa
    { lat: 19.0, lng: 72.8 },  // Mumbai / Maharashtra Coast
    { lat: 22.5, lng: 70.0 },  // Gujarat Coast (Kutch/Saurashtra)
    { lat: 23.5, lng: 68.3 },  // Kutch Far West
    { lat: 25.0, lng: 71.0 },  // Rajasthan west
    { lat: 28.2, lng: 70.3 },
    { lat: 31.8, lng: 74.0 },  // Punjab Border
    { lat: 34.5, lng: 76.5 },  // Close Loop back to Kashmir
  ];

  const indiaBorderString = borderPoints
    .map((pt) => {
      const { x, y } = mapToSVG(pt.lat, pt.lng);
      return `${x},${y}`;
    })
    .join(" ");

  // Define major highway corridors in India
  const corridors = [
    { 
      name: "NH48 Delhi-Mumbai Arterial", 
      route: ["Hub North (Delhi NCR)", "Hub West (Mumbai JNPT)"], 
      defaultLevel: "orange" 
    },
    { 
      name: "NH4 Mumbai-Bengaluru Arterial", 
      route: ["Hub West (Mumbai JNPT)", "Hub South (Bengaluru Tech)"], 
      defaultLevel: "yellow" 
    },
    { 
      name: "NH16 Coast Corridor", 
      route: ["Hub South (Bengaluru Tech)", "Hub East (Kolkata Port)"], 
      defaultLevel: "green" 
    },
    { 
      name: "NH2 Delhi-Kolkata Grand Trunk Link", 
      route: ["Hub North (Delhi NCR)", "Hub East (Kolkata Port)"], 
      defaultLevel: "none" // No color at all representing "no traffic whatsoever"
    }
  ];

  // Helper to find Hub position
  const getHubPos = (name: string) => {
    const hub = hubs.find((h) => {
      const lowerH = h.name.toLowerCase();
      if (name.toLowerCase().includes("north") && lowerH.includes("north")) return true;
      if (name.toLowerCase().includes("west") && lowerH.includes("west")) return true;
      if (name.toLowerCase().includes("south") && lowerH.includes("south")) return true;
      if (name.toLowerCase().includes("east") && lowerH.includes("east")) return true;
      return false;
    });
    if (hub) return mapToSVG(hub.lat, hub.lng);
    // Hardcoded coordinates fallback if not matched
    if (name.includes("North")) return mapToSVG(28.61, 77.20);
    if (name.includes("West")) return mapToSVG(19.07, 72.87);
    if (name.includes("South")) return mapToSVG(12.97, 77.59);
    if (name.includes("East")) return mapToSVG(22.57, 88.36);
    return { x: 400, y: 240 };
  };

  // Determine current active traffic state mapping
  const getTrafficStatusAndColor = (corridor: typeof corridors[0]) => {
    let level = corridor.defaultLevel;

    // Adjust based on scenarios
    if (activeScenarioId === "flood" && corridor.name.includes("NH16")) {
      level = "orange"; // Flooded highway
    }
    if (activeScenarioId === "road_closure" && corridor.name.includes("NH48")) {
      level = "orange"; // Heavy blockages
    }
    if (activeScenarioId === "festival_traffic" && corridor.name.includes("NH4")) {
      level = "yellow"; // Heavy festival floats
    }

    if (level === "orange") {
      return { stroke: "stroke-orange-500", glow: "url(#glow-orange)", width: "3.5", dash: "none", label: "HIGH CONGESTION" };
    } else if (level === "yellow") {
      return { stroke: "stroke-yellow-500", glow: "url(#glow-yellow)", width: "2.8", dash: "5,4", label: "MODERATE FLUIDS" };
    } else if (level === "green") {
      return { stroke: "stroke-emerald-400/80", glow: "url(#glow-emerald)", width: "2.5", dash: "3,3", label: "OPTIMAL/FREE" };
    } else {
      // "no color for no traffic whatsoever" -> NO STROKE to convey absolutely no traffic layer
      return { stroke: "stroke-neutral-800/10", glow: "none", width: "1.2", dash: "2,2", label: "NO TRAFFIC DETECTED (FREE ZONE)" };
    }
  };

  // If Google Maps is selected but we don't have a valid API Key:
  if (mapMode === "google" && !hasValidKey) {
    return (
      <div className="relative bg-white border-2 border-neutral-300 hover:border-[#FFAE00] rounded-2xl p-5 overflow-hidden shadow-sm transition-all">
        {/* Map Header with Real-Time Pulse */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b-2 border-neutral-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-700"></span>
            </div>
            <div>
              <h3 className="font-black text-black tracking-wide text-sm font-sans flex items-center gap-1.5 uppercase">
                <Globe className="w-5 h-5 text-indigo-700 animate-pulse" /> GOOGLE MAP LIVE
              </h3>
              <p className="text-[11px] text-neutral-800 font-bold font-mono">GOOGLE MAPS PLATFORM SYSTEM LOADER</p>
            </div>
          </div>

          {/* Map Mode Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg border-2 border-neutral-200 shrink-0">
            <button
              onClick={() => setMapMode("vector")}
              className="px-3 py-1 text-[11px] font-mono rounded-md font-black text-neutral-700 hover:text-black hover:bg-white"
            >
              <Radio className="w-3.5 h-3.5 inline mr-1" /> Vector Grid
            </button>
            <button
              onClick={() => setMapMode("google")}
              className="px-3 py-1 text-[11px] font-mono rounded-md font-black bg-indigo-600 text-white shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 inline mr-1" /> Google Map Live
            </button>
          </div>
        </div>

        {/* API Key Required Splash Screen */}
        <div className="w-full aspect-[8/5] bg-neutral-100 rounded-xl border-2 border-neutral-200 flex flex-col items-center justify-center p-6 text-center text-black">
          <div className="p-3 bg-indigo-100 rounded-full border border-indigo-300 mb-3.5 text-indigo-700">
            <Settings className="w-7 h-7" />
          </div>
          <h3 className="font-sans font-black text-base text-black tracking-tight uppercase">
            Google Maps API Key Required
          </h3>
          <p className="text-xs text-neutral-800 font-bold max-w-md mt-1.5 leading-relaxed">
            Connecting real-time satellite imagery & traffic indices requires a Google Maps API Key.
          </p>
          <div className="bg-neutral-950/90 border border-white/5 rounded-lg p-4 text-left max-w-sm w-full mt-4 text-[11px] font-mono space-y-2 text-neutral-400 leading-normal">
            <div>
              <strong className="text-white">Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Get an API Key</a>
            </div>
            <div>
              <strong className="text-white">Step 2:</strong> Add key as secret in AI Studio:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[10px]">
              <li>Open <strong className="text-neutral-300">Settings</strong> (⚙️ gear icon, top-right)</li>
              <li>Select <strong className="text-neutral-300">Secrets</strong></li>
              <li>Add <code className="bg-white/5 px-1 rounded text-teal-400">GOOGLE_MAPS_PLATFORM_KEY</code></li>
              <li>Paste value & press Enter</li>
            </ul>
          </div>
          <p className="text-[10px] text-neutral-500 mt-4 italic">
            The environment automatically executes real-time build updates - no refresh needed!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white border-4 border-amber-400 hover:border-[#FFAE00] rounded-2xl p-5 overflow-hidden shadow-sm transition-all">
      {/* Map Header with Real-Time Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b-2 border-neutral-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-700"></span>
          </div>
          <div>
            <h3 className="font-black text-black tracking-wide text-sm font-sans flex items-center gap-1.5 uppercase">
              <Radio className="w-5 h-5 text-emerald-600 animate-pulse" /> INDIA LOGISTICS GRID
            </h3>
            <p className="text-[11px] text-neutral-800 font-bold font-mono">INDIA DISPATCH LAYER V5.2 - {mapMode === "vector" ? "VECTOR GRID" : "LIVE DIRECT"}</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-4">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-[10px] font-bold font-mono text-neutral-800">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
              <span>Free (Optimal)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block animate-pulse"></span>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block animate-pulse"></span>
              <span>Congested</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-neutral-200 border-2 border-neutral-400 inline-block"></span>
              <span>No Traffic</span>
            </div>
          </div>

          {/* Map Mode Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg border-2 border-neutral-250 shrink-0 select-none">
            <button
              onClick={() => setMapMode("vector")}
              className={`px-3 py-1 text-[11px] font-mono rounded-md font-black transition-all uppercase flex items-center gap-1 cursor-pointer ${
                mapMode === "vector"
                  ? "bg-blue-600 text-white shadow"
                  : "text-neutral-700 hover:text-black hover:bg-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Vector Grid
            </button>
            <button
              onClick={() => setMapMode("google")}
              className={`px-3 py-1 text-[11px] font-mono rounded-md font-black transition-all uppercase flex items-center gap-1 cursor-pointer ${
                mapMode === "google"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-neutral-700 hover:text-black hover:bg-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-700 animate-pulse" /> Google Maps
            </button>
          </div>
        </div>
      </div>

      {/* SVG / Google map Stage Container */}
      <div className="relative w-full aspect-[8/5] bg-[#050507] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
        
        {mapMode === "vector" ? (
          <>
            {/* Radar background circles */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-500 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-emerald-500 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-emerald-500 rounded-full"></div>
              <div className="absolute top-1/2 left-0 right-0 border-t border-emerald-500"></div>
              <div className="absolute left-1/2 top-0 bottom-0 border-l border-emerald-500"></div>
            </div>

            {/* Outer Grid lines for mission control aesthetic */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-[0.05] pointer-events-none">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-neutral-700"></div>
              ))}
            </div>

            {/* Map Vector Stage */}
            <svg viewBox="0 0 800 480" className="w-full h-full relative z-10 select-none">
              {/* Definition for elegant glowing filters */}
              <defs>
                <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* REAL OUTLINE OF INDIA */}
              <polygon
                points={indiaBorderString}
                className="fill-blue-500/[0.02] stroke-white/[0.08]"
                strokeWidth="1.5"
                strokeDasharray="4,6"
              />

              {/* Internal geography coordinate helper pins */}
              <g opacity="0.3" className="text-[8px] font-mono fill-neutral-600 font-bold">
                <text x="140" y="240">ARABIAN SEA</text>
                <text x="610" y="320">BAY OF BENGAL</text>
                <text x="350" y="440">INDIAN OCEAN</text>
              </g>

              {/* Major National Transit Corridors with Custom Traffic Colors */}
              {corridors.map((c, i) => {
                const fromPos = getHubPos(c.route[0]);
                const toPos = getHubPos(c.route[1]);
                const trafficInfo = getTrafficStatusAndColor(c);

                return (
                  <g key={i}>
                    {/* Underlay glow path only if traffic level registered */}
                    {trafficInfo.glow !== "none" && (
                      <line
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        className={trafficInfo.stroke}
                        strokeWidth={parseFloat(trafficInfo.width) * 3}
                        strokeLinecap="round"
                        filter={trafficInfo.glow}
                        opacity="0.1"
                      />
                    )}
                    {/* Main highway line path */}
                    <line
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={toPos.x}
                      y2={toPos.y}
                      className={`${trafficInfo.stroke} transition-all duration-500`}
                      strokeWidth={trafficInfo.width}
                      strokeDasharray={trafficInfo.dash}
                      strokeLinecap="round"
                    />
                    {/* Corridor text Label */}
                    <text
                      x={(fromPos.x + toPos.x) / 2}
                      y={(fromPos.y + toPos.y) / 2 - 8}
                      fill={trafficInfo.stroke === "stroke-neutral-800/10" ? "#404040" : "#a3a3a3"}
                      className="text-[8px] font-mono tracking-wider text-center"
                      textAnchor="middle"
                      opacity="0.8"
                    >
                      {c.name} ({trafficInfo.label})
                    </text>
                  </g>
                );
              })}

              {/* Hub Pins on Grid */}
              {hubs.map((hub) => {
                const { x, y } = mapToSVG(hub.lat, hub.lng);
                const isSelected = selectedItem?.type === "hub" && selectedItem?.id === hub.id;
                let hubColor = "fill-emerald-500 stroke-emerald-400";

                if (hub.status === "Gridlock Alert") {
                  hubColor = "fill-orange-500 stroke-orange-400";
                } else if (hub.status === "At Capacity" || hub.fillRate > 85) {
                  hubColor = "fill-yellow-500 stroke-yellow-400";
                }

                return (
                  <g
                    key={hub.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedItem({ type: "hub", id: hub.id });
                      onSelectHub(hub);
                      onSelectVehicle(null);
                    }}
                  >
                    {/* Soft pulse background rings */}
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      className={`${isSelected ? "stroke-sky-400/50 scale-110" : "stroke-white/0 group-hover:stroke-white/10"} fill-none transition-all`}
                      strokeWidth="2"
                      strokeDasharray="3,2"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? "12" : "10"}
                      className="fill-[#08080c] stroke-white/25"
                      strokeWidth="1.5"
                    />
                    {/* Node type marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? "6" : "5"}
                      className={`${hubColor} transition-all duration-300`}
                    />
                    {/* Floating Hub Name tag */}
                    <g className="translate-y-[-16px]">
                      <rect
                        x={x - 45}
                        y={y - 12}
                        width="90"
                        height="18"
                        rx="3"
                        className="fill-neutral-950/90 stroke-white/10"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={y}
                        fill="#ffffff"
                        className="text-[8px] font-sans font-extrabold text-center"
                        textAnchor="middle"
                      >
                        📍 {hub.city} ({hub.fillRate}%)
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Active Cargo Vehicles (Smooth Moving Particles with floating Emptiness tags) */}
              {vehicles.map((v) => {
                const { x, y } = mapToSVG(v.lat, v.lng);
                const isSelected = selectedItem?.type === "vehicle" && selectedItem?.id === v.id;
                const emptiness = Math.max(0, 100 - v.capacity);
                
                // Differentiate CARS vs TRUCKS
                const vehicleClassLabel = v.type === "Heavy Carrier" ? "Truck" : v.type === "eVTOL Cargo Drone" ? "Drone" : "Car";

                let markerColor = "fill-sky-400 stroke-[#050507]";
                if (v.status === "Rerouted") markerColor = "fill-yellow-450 stroke-[#050507]";
                else if (v.status === "Stalled") markerColor = "fill-orange-500 stroke-[#050507]";

                return (
                  <g
                    key={v.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedItem({ type: "vehicle", id: v.id });
                      onSelectVehicle(v);
                      onSelectHub(null);
                    }}
                  >
                    {/* Direction line indicator */}
                    <line
                      x1={x}
                      y1={y}
                      x2={x + Math.sin((v.heading * Math.PI) / 180) * 15}
                      y2={y - Math.cos((v.heading * Math.PI) / 180) * 15}
                      className="stroke-sky-400/45"
                      strokeWidth="1.2"
                      strokeDasharray="2,2"
                    />

                    {/* Outer pulsing ring halo */}
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      className={`transition-all ${isSelected ? "stroke-sky-400/80 scale-125 animate-pulse" : "stroke-white/5 group-hover:stroke-sky-300/30"} fill-none`}
                      strokeWidth="1.5"
                    />

                    {/* Main Vehicle Icon */}
                    <g transform={`rotate(${v.heading}, ${x}, ${y})`}>
                      {v.type === "eVTOL Cargo Drone" ? (
                        // Drone Cross Vector Shape
                        <path
                          d={`M ${x-6} ${y-6} L ${x+6} ${y+6} M ${x+6} ${y-6} L ${x-6} ${y+6}`}
                          className={`${v.status === "Stalled" ? "stroke-orange-500" : "stroke-sky-400"} fill-none`}
                          strokeWidth="2.5"
                        />
                      ) : v.type === "Heavy Carrier" ? (
                        // Heavy Truck Wedge Shape (larger block)
                        <path
                          d={`M ${x} ${y-7} L ${x+5} ${y+5} L ${x} ${y+1} L ${x-5} ${y+5} Z`}
                          className={`${markerColor} transition-transform duration-300`}
                          strokeWidth="1"
                        />
                      ) : (
                        // Car Compact Wedge Shape (sleek compact triangle)
                        <path
                          d={`M ${x} ${y-5} L ${x+3.5} ${y+4} L ${x} ${y+1} L ${x-3.5} ${y+4} Z`}
                          className={`${markerColor} transition-transform duration-300`}
                          strokeWidth="1"
                        />
                      )}
                    </g>

                    {/* HIGHLY INTERACTIVE FLOATING METADATA TAGS */}
                    {/* Shows where the cars & trucks are going specifically, with percentage of emptiness */}
                    <g className="opacity-85 group-hover:opacity-100 transition-opacity">
                      <rect
                        x={x + 10}
                        y={y - 14}
                        width="145"
                        height="28"
                        rx="4"
                        className="fill-neutral-950/95 stroke-white/[0.08]"
                        strokeWidth="1.2"
                      />
                      <text
                        x={x + 15}
                        y={y - 4}
                        fill="#fff"
                        className="text-[7.5px] font-sans font-extrabold tracking-wider uppercase"
                      >
                        {v.type === "Heavy Carrier" ? "🚛" : "🚗"} {v.id} ({v.type === "Heavy Carrier" ? "Truck" : v.type === "eVTOL Cargo Drone" ? "Drone" : "Car"})
                      </text>
                      <text
                        x={x + 15}
                        y={y + 7}
                        className="text-[7px] font-mono fill-sky-300 font-semibold"
                      >
                        🎯 To: {v.destination} | 📭 Empty: {emptiness}%
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </>
        ) : (
          /* GOOGLE MAPS INTEGRATED LIVE STAGE */
          <div className="w-full h-full relative z-10">
            <APIProvider apiKey={API_KEY} version="weekly">
              <GMap
                defaultCenter={{ lat: 20.5937, lng: 78.9629 }}
                defaultZoom={5}
                mapId="DEMO_MAP_ID"
                gestureHandling="cooperative"
                disableDefaultUI={true}
                zoomControl={true}
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                style={{ width: "100%", height: "100%" }}
              >
                {/* Advanced Markers for Hubs with Interactive Pins */}
                {hubs.map((hub) => {
                  const isSelected = selectedItem?.type === "hub" && selectedItem?.id === hub.id;
                  let pinColor = "#10b981"; // green
                  if (hub.status === "Gridlock Alert") {
                    pinColor = "#ea580c"; // orange
                  } else if (hub.status === "At Capacity" || hub.fillRate > 85) {
                    pinColor = "#eab308"; // yellow
                  }

                  return (
                    <AdvancedMarker
                      key={hub.id}
                      position={{ lat: hub.lat, lng: hub.lng }}
                      onClick={() => {
                        setSelectedItem({ type: "hub", id: hub.id });
                        onSelectHub(hub);
                        onSelectVehicle(null);
                      }}
                    >
                      {/* Explicit sizing (width/height) is strictly required for custom markers in GMAP to bypass CF3 */}
                      <div className="relative w-[34px] h-[34px] flex items-center justify-center cursor-pointer group">
                        <div className={`w-6.5 h-6.5 rounded-lg rotate-45 flex items-center justify-center shadow-md border border-white/20 transition-transform hover:scale-110 bg-neutral-900`}>
                          <div className="-rotate-45 text-[11px]" style={{ color: pinColor }}>📍</div>
                        </div>

                        {/* Floating Hub Name tooltip */}
                        <div className="absolute left-[38px] top-0 bg-neutral-950/95 border border-white/10 px-2 py-1 rounded text-[9px] font-mono text-white whitespace-nowrap pointer-events-none shadow-xl z-50 opacity-90 group-hover:opacity-100 transition-opacity">
                          <div className="font-extrabold">{hub.city} Hub</div>
                          <div>Fill rate: <span className="text-teal-400 font-bold">{hub.fillRate}%</span></div>
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* Advanced Markers for Vehicles: Shows destination paths & emptiness instantly */}
                {vehicles.map((v) => {
                  const isSelected = selectedItem?.type === "vehicle" && selectedItem?.id === v.id;
                  const emptiness = Math.max(0, 100 - v.capacity);
                  const vehicleClassLabel = v.type === "Heavy Carrier" ? "Truck" : v.type === "eVTOL Cargo Drone" ? "Drone" : "Car";
                  
                  let markerColor = "bg-sky-450 border-sky-400 text-sky-950";
                  if (v.status === "Rerouted") markerColor = "bg-yellow-450 border-yellow-400 text-yellow-950";
                  else if (v.status === "Stalled") markerColor = "bg-orange-500 border-orange-400 text-white animate-pulse";

                  return (
                    <AdvancedMarker
                      key={v.id}
                      position={{ lat: v.lat, lng: v.lng }}
                      onClick={() => {
                        setSelectedItem({ type: "vehicle", id: v.id });
                        onSelectVehicle(v);
                        onSelectHub(null);
                      }}
                    >
                      {/* Explicit sizing 36x36 to bypass CF3 */}
                      <div className="relative w-[38px] h-[38px] flex items-center justify-center cursor-pointer group">
                        {/* Interactive sonar ring */}
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping transition-all ${
                          v.status === "Stalled" ? "bg-red-500" : "bg-sky-450"
                        }`}></span>

                        <div className={`w-8 h-8 rounded-full border shadow-xl flex items-center justify-center font-bold text-xs transition-transform hover:scale-115 ${markerColor}`}>
                          {v.type === "eVTOL Cargo Drone" ? (
                            <span>🚁</span>
                          ) : v.type === "Heavy Carrier" ? (
                            <Truck className="w-4 h-4 text-neutral-900" />
                          ) : (
                            <span>🚗</span>
                          )}
                        </div>

                        {/* HIGHLY DETAILS METADATA FLOATING TOOLTIP */}
                        {/* Show where cars and trucks are going specifically, with percentage of emptiness */}
                        <div className="absolute left-[38px] top-[-5px] bg-neutral-950/95 border border-white/10 px-2.5 py-1.5 rounded-md text-[8.5px] font-mono text-white whitespace-nowrap pointer-events-none shadow-2xl flex flex-col gap-0.5 z-50 opacity-90 group-hover:opacity-100 transition-opacity">
                          <div className="font-extrabold text-neutral-100 uppercase tracking-wide flex items-center gap-1 border-b border-white/5 pb-0.5">
                            {v.type === "Heavy Carrier" ? "🚚" : "🚗"} {v.id} ({vehicleClassLabel})
                          </div>
                          <div>To: <span className="text-white font-bold">{v.destination}</span></div>
                          <div>Emptiness: <span className="text-emerald-400 font-extrabold">{emptiness}% Empty</span></div>
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}
              </GMap>
            </APIProvider>
          </div>
        )}

        {/* Selected Item Detail overlay (shared floating glassmorphic container!) */}
        {selectedItem && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#0a0a0f]/95 border border-white/10 rounded-lg p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-30 animation-fade-in text-[12px] font-sans">
            {selectedItem.type === "hub" && (
              (() => {
                const hub = hubs.find((h) => h.id === selectedItem.id);
                if (!hub) return null;
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <div className="font-semibold text-neutral-100">{hub.name}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">LOCATION: {hub.city} | STATUS: {hub.status}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-neutral-500">Node Storage Fill:</span>{" "}
                        <span className="font-semibold text-neutral-200">{hub.fillRate}%</span>
                      </div>
                      <div className="h-4 w-px bg-neutral-800"></div>
                      <div>
                        <span className="text-neutral-500">Sorter load rate:</span>{" "}
                        <span className="text-emerald-450 font-semibold">{hub.loadCount} packages/hr</span>
                      </div>
                    </div>
                    <button
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-neutral-300 rounded font-mono text-[10px] border border-white/10"
                      onClick={() => {
                        setSelectedItem(null);
                        onSelectHub(null);
                      }}
                    >
                      CLEAR
                    </button>
                  </>
                );
              })()
            )}

            {selectedItem.type === "vehicle" && (
              (() => {
                const vec = vehicles.find((v) => v.id === selectedItem.id);
                if (!vec) return null;
                const emptiness = Math.max(0, 100 - vec.capacity);
                const isCarType = vec.type === "Autonomous EV";
                return (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Truck className={`w-4 h-4 ${vec.status === "Stalled" ? "text-orange-500" : "text-sky-400"}`} />
                      <div>
                        <div className="font-semibold text-neutral-100 flex items-center gap-1.5">
                          {vec.id} <span className="text-[10px] bg-white/5 text-sky-400 px-1.5 py-0.5 rounded uppercase font-bold">{isCarType ? "Autonomous Car" : "Freight Truck"}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">DESTINATION: {vec.destination} | SPEED: {vec.speed} KM/H</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-neutral-400">Battery:</span>
                        <span className="text-neutral-100 font-semibold">{vec.battery}%</span>
                      </div>
                      <div className="h-4 w-px bg-neutral-800"></div>
                      <div>
                        <span className="text-neutral-400">Payload Fill:</span>
                        <span className="text-neutral-100 font-semibold">{vec.capacity}%</span>
                      </div>
                      <div className="h-4 w-px bg-neutral-800"></div>
                      <div>
                        <span className="text-teal-400 font-bold">Emptiness Rate: {emptiness}%</span>
                      </div>
                      <div className="h-4 w-px bg-neutral-800"></div>
                      <div>
                        <span className="text-neutral-400">Status:</span>
                        <span className={`font-semibold ${vec.status === "Stalled" ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                          {vec.status}
                        </span>
                      </div>
                    </div>
                    <button
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-neutral-300 rounded font-mono text-[10px] border border-white/10"
                      onClick={() => {
                        setSelectedItem(null);
                        onSelectVehicle(null);
                      }}
                    >
                      CLEAR
                    </button>
                  </>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* Dynamic Telematics Feed bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
        <div className="bg-transparent shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-neutral-200/60 rounded-xl p-3 flex items-center gap-2.5 transition-all">
          <Activity className="w-5 h-5 text-indigo-600 animate-pulse" />
          <div>
            <div className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase font-black">CARGO FLIGHT lanes</div>
            <div className="text-xs font-black text-black">Active (99.8%)</div>
          </div>
        </div>
        <div className="bg-transparent shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-neutral-200/60 rounded-xl p-3 flex items-center gap-2.5 transition-all">
          <AlertTriangle className="w-5 h-5 text-orange-600 animate-pulse" />
          <div>
            <div className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase font-black">ACTIVE TRAFFIC ALERTS</div>
            <div className="text-xs font-black text-black">2 Highways Blocked</div>
          </div>
        </div>
        <div className="bg-transparent shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-neutral-200/60 rounded-xl p-3 flex items-center gap-2.5 transition-all">
          <Zap className="w-5 h-5 text-sky-600" />
          <div>
            <div className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase font-black">AUTONOMY SCORE</div>
            <div className="text-xs font-black text-black">97.8% Efficiency</div>
          </div>
        </div>
      </div>
    </div>
  );
}
