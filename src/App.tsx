import React, { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Zap,
  Globe2,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Clock,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  Truck,
  RotateCcw,
  CheckCircle2,
  Volume2
} from "lucide-react";

// Types & Sub-Components
import { Hub, Vehicle, AgentMessage, Scenario, CapacityTrade, OptimizationRecommendation, SimulationScores, CargoShipment, TransporterOffer, TruckCapacity, LogisticsNotification, ChatMessage } from "./types";
import CommandCenterMap from "./components/CommandCenterMap";
import AgentCoordination from "./components/AgentCoordination";
import ExecutiveAnalytics from "./components/ExecutiveAnalytics";
import AnalyticsCharts from "./components/AnalyticsCharts";
import ScenarioSimulator from "./components/ScenarioSimulator";
import CapacityMarketplace from "./components/CapacityMarketplace";
import LogisticsWorkspace from "./components/LogisticsWorkspace";
import { Language, t } from "./utils/translations";

// Static Setup Data
const INITIAL_HUBS: Hub[] = [
  { id: "hub_alpha", name: "Hub North (Delhi NCR)", city: "New Delhi", capacity: 550000, fillRate: 64, loadCount: 2420, lat: 28.61, lng: 77.20, status: "Operational" },
  { id: "hub_beta", name: "Hub West (Mumbai JNPT)", city: "Mumbai", capacity: 480000, fillRate: 72, loadCount: 1940, lat: 19.07, lng: 72.87, status: "Operational" },
  { id: "hub_gamma", name: "Hub South (Bengaluru Tech)", city: "Bengaluru", capacity: 620000, fillRate: 58, loadCount: 2880, lat: 12.97, lng: 77.59, status: "Operational" },
  { id: "hub_delta", name: "Hub East (Kolkata Port)", city: "Kolkata", capacity: 320000, fillRate: 81, loadCount: 1710, lat: 22.57, lng: 88.36, status: "Operational" },
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: "TR-101", name: "Auton Heavy Truck #101", type: "Heavy Carrier", status: "Optimized", capacity: 74, battery: 89, lat: 24.5, lng: 74.5, destination: "Mumbai JNPT", speed: 68, heading: 220 },
  { id: "TR-202", name: "Tesla Cargo Car #202", type: "Autonomous EV", status: "Optimized", capacity: 62, battery: 74, lat: 15.0, lng: 75.0, destination: "Bengaluru Tech", speed: 55, heading: 160 },
  { id: "DR-303", name: "Cyber Envoy Drone #303", type: "eVTOL Cargo Drone", status: "Optimized", capacity: 15, battery: 48, lat: 17.5, lng: 78.5, destination: "Hyderabad Central", speed: 120, heading: 290 },
  { id: "TR-404", name: "Auton Smart Truck #404", type: "Heavy Carrier", status: "Optimized", capacity: 81, battery: 92, lat: 26.5, lng: 76.5, destination: "Delhi NCR Hub", speed: 62, heading: 340 },
  { id: "DR-505", name: "Express EV Car #505", type: "Autonomous EV", status: "Optimized", capacity: 20, battery: 65, lat: 21.5, lng: 84.5, destination: "Kolkata Port", speed: 90, heading: 60 },
];

const SCENARIOS: Scenario[] = [
  { id: "nominal", name: "Nominal Operations", description: "Standard operations across outer circles", icon: "🟢", riskMultiplier: 0.12, demandSurges: { delhi: 8, noida: 4, gurgaon: -2 }, congestionPoints: [] },
  { id: "flood", name: "Monsoon Flood Alert", description: "Heavy torrential monsoon rainfall flooded the eastern NH16 Coast Corridor", icon: "⛈️", riskMultiplier: 0.88, demandSurges: { delhi: 38, noida: 12, gurgaon: -8 }, congestionPoints: ["NH16 Coast Corridor"] },
  { id: "road_closure", name: "NH48 National Highway Blockage", description: "Major highway infrastructure upgrade near Jaipur bottlenecked the primary western route", icon: "🚧", riskMultiplier: 0.74, demandSurges: { delhi: 14, noida: -5, gurgaon: 25 }, congestionPoints: ["NH48 Delhi-Mumbai Arterial"] },
  { id: "festival_traffic", name: "Diwali National Cargo Spike", description: "Pre-festival supply chain surge causing massive cargo traffic across central loops", icon: "🏮", riskMultiplier: 0.65, demandSurges: { delhi: 45, noida: 28, gurgaon: 15 }, congestionPoints: ["Golden Quadrilateral Trunk Route"] },
  { id: "warehouse_failure", name: "Mumbai Port Transit Sorter Halt", description: "Automated container belt failure at the Hub West (JNPT) terminal", icon: "⚠️", riskMultiplier: 0.55, demandSurges: { delhi: 5, noida: 35, gurgaon: 2 }, congestionPoints: ["NH4 Mumbai-Bengaluru Arterial"] },
  { id: "vehicle_breakdown", name: "Central India eVTOL Signal Jam", description: "Electromagnetic storm causing drone landing protocols in Hyderabad sector to stall", icon: "📡", riskMultiplier: 0.42, demandSurges: { delhi: 12, noida: 8, gurgaon: -5 }, congestionPoints: ["NH16 Coast Corridor"] },
];

const INITIAL_TRADES: CapacityTrade[] = [
  { id: "trade_01", truckId: "TR-209", location: "Jaipur Express Tollway", availableCapacity: 42, matchScore: 96, shipmentType: "Interstate Dry Goods Transfer", revenueBoost: "+18% Yield Impact" },
  { id: "trade_02", truckId: "TR-412", location: "Pune Bypass Intersection", availableCapacity: 55, matchScore: 91, shipmentType: "Cold-Chain Pharmaceuticals", revenueBoost: "+24% Yield Impact" },
  { id: "trade_03", truckId: "DR-509", location: "Hyderabad Air Hub Corridor", availableCapacity: 60, matchScore: 84, shipmentType: "EV Battery Spares Air Express", revenueBoost: "+12% Yield Impact" },
];

const INITIAL_RECOMMENDATIONS: OptimizationRecommendation[] = [
  { id: "rec_01", title: "Shift National Inventory: Hub North → Hub South", description: "Balance sortation load across North and South National logistics corridors", category: "Inventory", impact: "+22% Sort Speed", status: "Pending Autonomous Approval", time: "+0.5s" },
  { id: "rec_02", title: "Apply 30-Min Staging Buffer at Hub West (JNPT)", description: "Prevents dockside vehicle congestion during heavy monsoon highway blocks", category: "Warehouse", impact: "-25% Dock Docking Queue", status: "Pending Autonomous Approval", time: "+1.2s" },
  { id: "rec_03", title: "Reroute Heavy Carriers via Golden Bypass Route", description: "Bypasses clogged central state corridors to maintain delivery window SLAs", category: "Route", impact: "Saves 95 Mins ETA", status: "Pending Autonomous Approval", time: "+2.5s" },
];

// Offline fallback dialogues representing AI agent conversations per scenario
const OFFLINE_DIALOGUES: Record<string, AgentMessage[]> = {
  nominal: [
    { id: "nom_01", agent: "Demand Agent", text: "Demand trends fully nominal. Delivery SLA rates holding at a beautiful 94.6% national ratio.", timestamp: "+0s", status: "info" },
    { id: "nom_02", agent: "Warehouse Agent", text: "India regional sorting lines running at optimal 60% average. Stocks fully balanced across all hubs.", timestamp: "+5s", status: "success" },
    { id: "nom_03", agent: "Route Agent", text: "No active gridlock on NH48, NH4 or Golden Quadrilateral. Autopilot systems reporting solid satellite links.", timestamp: "+12s", status: "info" },
    { id: "nom_04", agent: "Fleet Agent", text: "Deploying standard interstate hauling schedules. EV truck battery levels holding safely above 75%.", timestamp: "+18s", status: "success" },
  ],
  flood: [
    { id: "fld_01", agent: "Demand Agent", text: "Heavy rains registered. East India coastal forecasted load surge scaled to +38%. Tactical balancing triggered.", timestamp: "+0s", status: "warning" },
    { id: "fld_02", agent: "Warehouse Agent", text: "Hub East (Kolkata) is reaching 81% sorting capacity. Initiating rail container dispatch to Hub North.", timestamp: "+4s", status: "action" },
    { id: "fld_03", agent: "Route Agent", text: "NH16 Coast Corridor reports heavy floods & 89% congestion index. All heavy logistics trucks being rerouted.", timestamp: "+9s", status: "warning" },
    { id: "fld_04", agent: "Fleet Agent", text: "NH16 closure bypass engaged. Launching 12 long-range cargo eVTOL drones to shuttle high-value priority payloads.", timestamp: "+14s", status: "action" },
  ],
  road_closure: [
    { id: "rc_01", agent: "Route Agent", text: "CRITICAL: Urgent bridge rehab closes sections of NH48. Main western heavy carriers stalled near Jaipur.", timestamp: "+0s", status: "warning" },
    { id: "rc_02", agent: "Fleet Agent", text: "Rerouting TR-101 and TR-404 heavy carrier fleets via secondary state expressway bypass to Jaipur Node.", timestamp: "+5s", status: "action" },
    { id: "rc_03", agent: "Warehouse Agent", text: "Adjusting storage buffers. Holding northern dispatches by 35 mins to perfectly synchronize with delayed arrivals.", timestamp: "+10s", status: "action" },
    { id: "rc_04", agent: "Demand Agent", text: "Customer ETA windows recalculated. National on-time guarantee adjusted to 95.8% bounds. Grid remains intact.", timestamp: "+16s", status: "success" },
  ],
  festival_traffic: [
    { id: "ft_01", agent: "Demand Agent", text: "Diwali shipping demand is spiking. Hub East (Kolkata) sorting queue getting highly overloaded: +45% surge.", timestamp: "+0s", status: "warning" },
    { id: "ft_02", agent: "Warehouse Agent", text: "Unloading bays at Hub East at critical bounds. Spawning automated staging overflow bays.", timestamp: "+4s", status: "action" },
    { id: "ft_03", agent: "Route Agent", text: "Golden Quadrilateral central routes heavily bottlenecked (85% traffic index). Diverting lighter vehicles to bypass lanes.", timestamp: "+8s", status: "warning" },
    { id: "ft_04", agent: "Fleet Agent", text: "Releasing reserve eVTOL drone assets. 8 additional air dispatch lanes scheduled to relieve trunk line bottleneck.", timestamp: "+13s", status: "action" },
  ],
  warehouse_failure: [
    { id: "wf_01", agent: "Warehouse Agent", text: "ALERT: Automated sorting conveyor belt mechanical halt at Hub West (JNPT Mumbai). Specialized repair bots deployed.", timestamp: "+0s", status: "warning" },
    { id: "wf_02", agent: "Demand Agent", text: "Westbound cargo queue forming. Dynamic rerouting graphs directing new dispatches towards Hub Gamma (Bengaluru).", timestamp: "+5s", status: "action" },
    { id: "wf_03", agent: "Route Agent", text: "Rerouting container trailers to Southern Expressway corridors. Adjusting toll tollways accordingly.", timestamp: "+10s", status: "action" },
    { id: "wf_04", agent: "Fleet Agent", text: "Modulating schedules. TR-202 EV flatbed charger delay engaged to align with updated sorting milestones.", timestamp: "+15s", status: "success" },
  ],
  vehicle_breakdown: [
    { id: "vb_01", agent: "Fleet Agent", text: "Drone #303 telemetry reports severe central sector GPS signal jam. Engaging fallback inertial guidance system.", timestamp: "+0s", status: "warning" },
    { id: "vb_02", agent: "Route Agent", text: "Marking Hyderabad-Vizag flight sector orange for cautionary flight. Rerouting neighboring drone paths.", timestamp: "+4s", status: "action" },
    { id: "vb_03", agent: "Warehouse Agent", text: "Dispatching extreme-terrain service unit directly to last known GPS telemetry beacon coordinates.", timestamp: "+9s", status: "action" },
    { id: "vb_04", agent: "Demand Agent", text: "SLA delivery window revised slightly (+15 mins). Primary backup pathing successfully engaged.", timestamp: "+14s", status: "success" },
  ]
};

export default function App() {
  const [language, setLanguage] = useState<Language>("english");
  const [activeView, setActiveView] = useState<"landing" | "dashboard">("landing");

  // Core Simulation States
  const [hubs, setHubs] = useState<Hub[]>(INITIAL_HUBS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("nominal");
  const [messages, setMessages] = useState<AgentMessage[]>(OFFLINE_DIALOGUES.nominal);
  const [capacityTrades, setCapacityTrades] = useState<CapacityTrade[]>(INITIAL_TRADES);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>(INITIAL_RECOMMENDATIONS);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Hackathon Multi-Phase simulator variables
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationPhase, setSimulationPhase] = useState<string>("Inactive");

  // Metrics that change based on Scenarios/Actions
  const [metrics, setMetrics] = useState({
    totalDeliveries: 42180,
    activeVehicles: 5,
    predictedDemand: "Normal (+8%)",
    congestionRisk: 12,
    utilization: 81,
    efficiency: 92,
    emissionsSaved: 342,
  });

  const [scores, setScores] = useState<SimulationScores>({
    withLogix: { deliveryTime: 2.8, fuelSavings: 38, utilization: 91, onTimeRate: 98.4, revenueImpact: 22 },
    withoutLogix: { deliveryTime: 4.2, fuelSavings: 14, utilization: 64, onTimeRate: 74.2, revenueImpact: 4 }
  });

  // DIRECT-MATCH CARGO EXCHANGE STATES
  const [currentWorkspaceRole, setCurrentWorkspaceRole] = useState<"transporter" | "shipper">("shipper");
  const [dashboardRoleChoice, setDashboardRoleChoice] = useState<"operator" | "workspace">("workspace");

  // Auth state for secure login/signup gate as requested by user
  const [currentUser, setCurrentUser] = useState<{ name: string; phone: string; role: "transporter" | "shipper" | "operator" } | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginPhone, setLoginPhone] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [signupForm, setSignupForm] = useState({
    name: "",
    role: "transporter" as "transporter" | "shipper" | "operator",
    phone: "",
    password: "",
    city: ""
  });

  const [workspaceShipments, setWorkspaceShipments] = useState<CargoShipment[]>([
    {
      id: "SH-101",
      pickup: "New Delhi (Hub North)",
      destination: "Mumbai (Hub West)",
      goodsType: "High-Value Consumer Electronics",
      weight: 4.8,
      date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0], // 2 days from now
      time: "09:00",
      status: "Posted",
      shipperName: "Swastika Electronics Ltd",
      shipperPhone: "+91 98311 00451",
      specialInstructions: "Must remain below 24°C inside double insulated trailer.",
      price: 2000,
      offers: []
    },
    {
      id: "SH-102",
      pickup: "Mumbai (Hub West)",
      destination: "Bengaluru (Hub South)",
      goodsType: "SLA Critical Pharmaceuticals",
      weight: 2.2,
      date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0], // 3 days from now
      time: "14:30",
      status: "Offer Submitted",
      shipperName: "Biotech Pharma Distributors",
      shipperPhone: "+91 88200 11993",
      specialInstructions: "Regular temp validation reports requested over chat stream.",
      price: 3500,
      offers: [
        {
          id: "OF-501",
          shipmentId: "SH-102",
          transporterName: "Singh Roadlines India",
          transporterPhone: "+91 94421 88100",
          truckDetails: "TATA Prima Multi-Axle EV Carrier",
          availableCapacity: 6,
          pickupTime: "15:00 onwards",
          deliveryCommitment: "SLA Guaranteed under 24 Hours",
          extraCharges: 3200,
          notes: "Tarpaulin protections fitted. Level-1 experienced highway driver assigned.",
          status: "Pending"
        }
      ]
    },
    {
      id: "SH-103",
      pickup: "Bengaluru (Hub South)",
      destination: "Kolkata (Hub East)",
      goodsType: "Export Woolen Textiles",
      weight: 8.5,
      date: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0], // 4 days from now
      time: "11:00",
      status: "Approved",
      shipperName: "Decent Weaves & Garments",
      shipperPhone: "+91 74100 22914",
      specialInstructions: "Fully sealed cargo box required. Risk of tropical downpours.",
      price: 6500,
      offers: [
        {
          id: "OF-502",
          shipmentId: "SH-103",
          transporterName: "Kargos Air & Land Transit",
          transporterPhone: "+91 99011 32900",
          truckDetails: "BharatBenz Heavy Cargo Series 4023",
          availableCapacity: 12,
          pickupTime: "08:00 AM Sharp",
          deliveryCommitment: "Direct Express (36 Hour ETA)",
          extraCharges: 6000,
          notes: "Equipped with pneumatic anti-shock ride dampers.",
          status: "Approved"
        }
      ]
    }
  ]);

  const [workspaceCapacities, setWorkspaceCapacities] = useState<TruckCapacity[]>([
    {
      id: "CAP-201",
      transporterName: "Express India Fleet",
      phone: "+91 91722 00392",
      location: "New Delhi (Hub North)",
      route: "New Delhi (Hub North) → Mumbai (Hub West)",
      capacity: 10,
      date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      timeSlots: "Morning Slot (06:00 - 12:00)"
    },
    {
      id: "CAP-202",
      transporterName: "Southern Cargo Liners",
      phone: "+91 98823 44021",
      location: "Bengaluru (Hub South)",
      route: "Bengaluru (Hub South) → Kolkata (Hub East)",
      capacity: 15,
      date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      timeSlots: "Evening Slot (18:00 - 24:00)"
    }
  ]);

  const [workspaceNotifications, setWorkspaceNotifications] = useState<LogisticsNotification[]>([
    {
      id: "NOT-001",
      title: "New Bid Received",
      message: "Singh Roadlines India submitted conditions bid for critical Pharma parcel #SH-102",
      timestamp: "2 mins ago",
      read: false,
      role: "shipper"
    },
    {
      id: "NOT-002",
      title: "Contract Securing Success",
      message: "Your bid conditions on Cargo #SH-103 approved! Representative phone unreleased.",
      timestamp: "10 mins ago",
      read: false,
      role: "transporter"
    }
  ]);

  const [workspaceChats, setWorkspaceChats] = useState<Record<string, ChatMessage[]>>({
    "SH-103": [
      { id: "msg_1", shipmentId: "SH-103", sender: "System", text: "Secure shipment trust link created between Shipper Swastika Electronics and Transporter Kargos Transit.", timestamp: "11:00 AM" },
      { id: "msg_2", shipmentId: "SH-103", sender: "Shipper", text: "Hello driver, is your truck ready for the monsoon raincovers? Textile cargo has low tolerance to humidity.", timestamp: "11:02 AM" },
      { id: "msg_3", shipmentId: "SH-103", sender: "Transporter", text: "Yes shipper! We have double tarpaulin sheets and internal moisture readers check-out.", timestamp: "11:05 AM" }
    ]
  });

  // 1. Vehicle Movement Tick (Simulate real-time map movement)
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === "Stalled") return v;

          // Slightly adjust Lat/Lng based on their heading direction to show live map vector motion
          const headingRad = (v.heading * Math.PI) / 180;
          const latDiff = Math.cos(headingRad) * 0.06;
          const lngDiff = Math.sin(headingRad) * 0.06;

          let newLat = v.lat + latDiff;
          let newLng = v.lng + lngDiff;

          // Bounce back bounds so vehicles stay in India bounds
          if (newLat < 9.0 || newLat > 31.0) {
            v.heading = (v.heading + 180) % 360;
            newLat = v.lat;
          }
          if (newLng < 69.0 || newLng > 90.0) {
            v.heading = (v.heading + 180) % 360;
            newLng = v.lng;
          }

          // Slightly discharge batteries
          let newBattery = v.battery - (Math.random() > 0.7 ? 1 : 0);
          if (newBattery <= 10) {
            newBattery = 100; // auto recharge simulation
          }

          return {
            ...v,
            lat: newLat,
            lng: newLng,
            battery: newBattery,
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // 2. Scenario Picker - Modulates metrics and AI dialogues
  const handleSelectScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    const scen = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

    // Trigger local offline dialogues instantly as start state
    setMessages(OFFLINE_DIALOGUES[scenarioId] || OFFLINE_DIALOGUES.nominal);

    // Dynamic metrics modulation based on injected crisis
    let networkCongestion = Math.round(scen.riskMultiplier * 100);
    let totalRoutings = metrics.totalDeliveries + Math.round(Math.random() * 200 - 100);

    let efficiencyScore = 95 - Math.round(scen.riskMultiplier * 40);
    let utilRate = 80 + Math.round(scen.riskMultiplier * 10);
    let demandStr = scen.demandSurges.delhi > 0 ? `Surge (+${scen.demandSurges.delhi}%)` : `Normal (${scen.demandSurges.delhi}%)`;

    setMetrics((prev) => ({
      ...prev,
      totalDeliveries: totalRoutings,
      congestionRisk: networkCongestion,
      predictedDemand: demandStr,
      efficiency: efficiencyScore,
      utilization: utilRate,
    }));

    // Update Hub statuses
    setHubs((prevHubs) =>
      prevHubs.map((h) => {
        if (scenarioId === "flood" && h.id === "hub_delta") {
          return { ...h, status: "Gridlock Alert", fillRate: 98, loadCount: 2100 };
        }
        if (scenarioId === "warehouse_failure" && h.id === "hub_beta") {
          return { ...h, status: "Gridlock Alert", fillRate: 92, loadCount: 1540 };
        }
        if (scenarioId === "festival_traffic" && h.id === "hub_delta") {
          return { ...h, status: "At Capacity", fillRate: 89, loadCount: 1200 };
        }
        return { ...h, status: "Operational", fillRate: Math.max(40, Math.min(85, h.fillRate + Math.round(Math.random() * 10 - 5))) };
      })
    );

    // Update vehicle statuses
    setVehicles((prev) =>
      prev.map((v) => {
        if (scenarioId === "road_closure" && (v.id === "TR-101" || v.id === "TR-404")) {
          return { ...v, status: "Rerouted", speed: 45 };
        }
        if (scenarioId === "vehicle_breakdown" && v.id === "DR-303") {
          return { ...v, status: "Stalled", speed: 0 };
        }
        return { ...v, status: "Optimized", speed: v.type === "eVTOL Cargo Drone" ? 90 : 60 };
      })
    );
  };

  // 3. Launch Hackathon AI simulation sequences
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationPhase("🟢 INITIATING SYSTEM DISPATCH SCAN...");

    // Sound effect chimes
    if (soundEnabled) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playFreq = (f: number, t: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = f;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + t);
        osc.stop(audioCtx.currentTime + t + 0.1);
      };
      playFreq(300, 0);
      playFreq(400, 0.1);
      playFreq(500, 0.2);
    }

    // Step 1: Demand Spikes
    setTimeout(() => {
      setSimulationPhase("📊 DEPLOYING CRITICAL DEMAND IN MUMBAI JNPT & KOLKATA PORT...");
      setActiveScenarioId("festival_traffic");
      setMetrics((prev) => ({
        ...prev,
        congestionRisk: 68,
        predictedDemand: "Critical National Surge (+45%)",
        efficiency: 78,
      }));
      setHubs((prev) =>
        prev.map((h) => (h.id === "hub_delta" ? { ...h, status: "At Capacity", fillRate: 94 } : h))
      );
    }, 2000);

    // Step 2: Agents communicate
    setTimeout(() => {
      setSimulationPhase("🧠 INTER-AGENT SYNAPSE ACTIVE. NEGOTIATING CONSTRAINTS...");
      setMessages([
        { id: "sim_01", agent: "Demand Agent", text: "Predictive volumes in East India (Kolkata) spiked by 45%. Sorters overloaded. We need national capacity redistribution immediately.", timestamp: "+0s", status: "warning" },
        { id: "sim_02", agent: "Warehouse Agent", text: "Concur. Sorting bays at Hub East at threshold. Shift container batches to Hub South (Bengaluru). Adjusting cross-dock factors.", timestamp: "+3s", status: "action" },
        { id: "sim_03", agent: "Route Agent", text: "Warning: Golden Quadrilateral central routes have an 85% congestion rate. Rerouting heavy EV flatbeds and bypassing closed segments.", timestamp: "+6s", status: "warning" },
        { id: "sim_04", agent: "Fleet Agent", text: "National fleet optimized. Scheduled 12 long-haul backup drone dispatches from Hub North to bypass highway bottlenecks.", timestamp: "+9s", status: "success" },
      ]);
    }, 4500);

    // Step 3: Routes update and vehicles auto-optimized
    setTimeout(() => {
      setSimulationPhase("🗺️ ALTERNATIVE CORRIDORS MAP DIRECTLY ON VEHICLE DASH...");
      setVehicles((prev) =>
        prev.map((v) => ({ ...v, status: v.type === "eVTOL Cargo Drone" ? "Optimized" : "Rerouted", speed: v.type === "eVTOL Cargo Drone" ? 95 : 48 }))
      );
    }, 7000);

    // Step 4: Stabilize Metrics
    setTimeout(() => {
      setSimulationPhase("✅ LOGIX NETWORK SYSTEM STABILIZED. SAVINGS UPDATED!");
      setMetrics((prev) => ({
        ...prev,
        congestionRisk: 24, // Optimized risk dropped!
        efficiency: 96,
        utilization: 94,
        emissionsSaved: prev.emissionsSaved + 18,
      }));
      setScores({
        withLogix: { deliveryTime: 2.1, fuelSavings: 46, utilization: 94, onTimeRate: 99.4, revenueImpact: 28 },
        withoutLogix: { deliveryTime: 4.8, fuelSavings: 12, utilization: 60, onTimeRate: 71.0, revenueImpact: 2 }
      });
      setIsSimulating(false);
      setSimulationPhase("Nominal Active");
    }, 9500);
  };

  // 4. Custom Commander's Overwrite Input - proxies through Gemini Express Backend
  const handleSendCustomIncident = async (customText: string) => {
    setIsThinking(true);

    try {
      // Post to our real-time Node server, which wraps process.env.GEMINI_API_KEY inside GoogleGenAI
      const response = await fetch("/api/agents/coordinate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioName: SCENARIOS.find((s) => s.id === activeScenarioId)?.name || "Standard Operations",
          activeConflict: customText,
          customInput: customText,
        }),
      });

      const data = await response.json();

      if (data.isOfflineFallback || !data.conversation) {
        // Fallback: If API key is not yet set or backend can't connect, simulate a beautiful dialogue client-side!
        simulateClientSideGeminiAgentReaction(customText);
      } else {
        // Splendid! Real-time generative AI coordinated dialogue received successfully!
        const generatedMsgs: AgentMessage[] = data.conversation.map((msg: any, i: number) => ({
          id: `ai_${Date.now()}_${i}`,
          agent: msg.agent,
          text: msg.text,
          timestamp: msg.timestamp || `+${i * 4}s`,
          status: msg.status || "info",
        }));
        setMessages(generatedMsgs);
      }
    } catch (err) {
      console.error("Express API error, initiating client-side fallback:", err);
      simulateClientSideGeminiAgentReaction(customText);
    } finally {
      setIsThinking(false);
    }
  };

  // Smart client-side dialogue author if backend is in offline state
  const simulateClientSideGeminiAgentReaction = (customText: string) => {
    setTimeout(() => {
      setMessages([
        { id: "fall_01", agent: "Demand Agent", text: `Recategorizing central operations for custom incident: "${customText}". Detecting localized traffic and demand shifts.`, timestamp: "+0s", status: "warning" },
        { id: "fall_02", agent: "Route Agent", text: "Processing custom congestion. Suggesting instant gridlock warnings on local corridors and activating tactical alternative road sectors.", timestamp: "+4s", status: "action" },
        { id: "fall_03", agent: "Warehouse Agent", text: "Docking algorithms updated. Warehouse parcel queues deferred to prevent overload bottlenecks.", timestamp: "+8s", status: "action" },
        { id: "fall_04", agent: "Fleet Agent", text: "Deploying backup autonomous EV trailers and eVTOL carrier drones to secure SLA delivery. Metrics recalculated.", timestamp: "+12s", status: "success" },
      ]);
    }, 2000);
  };

  // Capacity spot trade accepted helper
  const handleAcceptCapacityTrade = (id: string) => {
    setCapacityTrades((prev) => prev.filter((t) => t.id !== id));
    setMetrics((prev) => ({
      ...prev,
      totalDeliveries: prev.totalDeliveries + 1,
      utilization: Math.min(prev.utilization + 2, 100),
    }));
  };

  // Optimization recommendations execution helper
  const handleExecuteRecommendation = (id: string) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status: "Executing" } : rec))
    );

    setTimeout(() => {
      setRecommendations((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, status: "Completed" } : rec))
      );
      setMetrics((prev) => ({
        ...prev,
        efficiency: Math.min(prev.efficiency + 3, 100),
        emissionsSaved: prev.emissionsSaved + 12,
      }));
    }, 3000);
  };

  // DIRECT-MATCH WORKSPACE EVENT HANDLERS
  const handleWorkspaceAddShipment = (shipment: Omit<CargoShipment, "id" | "offers" | "status">) => {
    const newId = `SH-${100 + workspaceShipments.length + 1}`;
    const newS: CargoShipment = {
      ...shipment,
      id: newId,
      status: "Posted",
      offers: []
    };
    setWorkspaceShipments((prev) => [newS, ...prev]);

    // Create a notification for Transporters
    const newN: LogisticsNotification = {
      id: `NOT-${Date.now()}`,
      title: "New Cargo Posted",
      message: `${shipment.shipperName} posted a cargo requirement for ${shipment.goodsType} (${shipment.weight} Tons) from ${shipment.pickup} to ${shipment.destination}`,
      timestamp: "Just now",
      read: false,
      role: "transporter"
    };
    setWorkspaceNotifications((prev) => [newN, ...prev]);
  };

  const handleWorkspaceAddCapacity = (cap: Omit<TruckCapacity, "id">) => {
    const newId = `CAP-${200 + workspaceCapacities.length + 1}`;
    const newC: TruckCapacity = {
      ...cap,
      id: newId
    };
    setWorkspaceCapacities((prev) => [newC, ...prev]);

    // Create a notification for Shippers
    const newN: LogisticsNotification = {
      id: `NOT-${Date.now()}`,
      title: "New Truck Capacity Available",
      message: `${cap.transporterName} published truck slots (${cap.capacity} Tons) for the route: ${cap.route}`,
      timestamp: "Just now",
      read: false,
      role: "shipper"
    };
    setWorkspaceNotifications((prev) => [newN, ...prev]);
  };

  const handleWorkspaceAddOffer = (shipmentId: string, offer: Omit<TransporterOffer, "id" | "status" | "shipmentId">) => {
    const newOfferId = `OF-${500 + Math.floor(Math.random() * 1000)}`;
    const newOffer: TransporterOffer = {
      ...offer,
      id: newOfferId,
      shipmentId,
      status: "Pending"
    };

    setWorkspaceShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            status: "Offer Submitted",
            offers: [...s.offers, newOffer]
          };
        }
        return s;
      })
    );

    // Create a notification for the Shipper
    const newN: LogisticsNotification = {
      id: `NOT-${Date.now()}`,
      title: "New Condition Bid Received",
      message: `${offer.transporterName} submitted a transit conditions and surcharge bid for Cargo #${shipmentId}`,
      timestamp: "Just now",
      read: false,
      role: "shipper"
    };
    setWorkspaceNotifications((prev) => [newN, ...prev]);
  };

  const handleWorkspaceUpdateOfferStatus = (shipmentId: string, offerId: string, status: "Approved" | "Rejected" | "Counter-Offer", counterPrice?: number) => {
    setWorkspaceShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          const updatedOffers = s.offers.map((o) => {
            if (o.id === offerId) {
              return {
                ...o,
                status: status,
                counterPrice: counterPrice
              };
            }
            return {
              ...o,
              status: status === "Approved" ? "Rejected" : o.status // decline other bids if one is approved
            } as TransporterOffer;
          });

          return {
            ...s,
            status: status === "Approved" ? "Approved" : s.status,
            offers: updatedOffers
          };
        }
        return s;
      })
    );

    // Get details for notification logs
    const shipmentObj = workspaceShipments.find(s => s.id === shipmentId);
    const offerObj = shipmentObj?.offers.find(o => o.id === offerId);
    const carrierName = offerObj?.transporterName || "Contractor";
    const shipperName = shipmentObj?.shipperName || "Shipper Representative";

    let msgTitle = "";
    let msgBody = "";
    let roleTarget: "transporter" | "shipper" | "all" = "transporter";

    if (status === "Approved") {
      msgTitle = "Direct-Match Secured!";
      msgBody = `${shipperName} approved your conditions bid for Cargo #${shipmentId}! Phone numbers unmasked, chat link established.`;
      roleTarget = "transporter";

      // Seed chat session
      setWorkspaceChats((chats) => ({
        ...chats,
        [shipmentId]: [
          { id: `sys_${Date.now()}`, shipmentId, sender: "System", text: `🔒 Freight contract secured between Shipper: ${shipperName} and Carrier: ${carrierName}. Safe transit protocols activated.`, timestamp: "12:00 UTC" }
        ]
      }));
    } else if (status === "Rejected") {
      msgTitle = "Bid Declined";
      msgBody = `Your conditions bid for Cargo #${shipmentId} was declined by ${shipperName}. Check alternative shipments.`;
      roleTarget = "transporter";
    } else if (status === "Counter-Offer") {
      msgTitle = "Counter Tariff Transmitted";
      msgBody = `${shipperName} sent a counter-offer of ₹${counterPrice} for Cargo #${shipmentId}. Review terms.`;
      roleTarget = "transporter";
    }

    const newN: LogisticsNotification = {
      id: `NOT-${Date.now()}`,
      title: msgTitle,
      message: msgBody,
      timestamp: "Just now",
      read: false,
      role: roleTarget
    };
    setWorkspaceNotifications((prev) => [newN, ...prev]);
  };

  const handleWorkspaceUpdateShipmentStatus = (shipmentId: string, status: CargoShipment["status"]) => {
    setWorkspaceShipments((prev) =>
      prev.map((s) => (s.id === shipmentId ? { ...s, status } : s))
    );

    // Create system notification
    const shipmentObj = workspaceShipments.find(s => s.id === shipmentId);
    const approvedOffer = shipmentObj?.offers.find(o => o.status === "Approved");
    const carrierName = approvedOffer?.transporterName || "Carrier Driver";

    const newN: LogisticsNotification = {
      id: `NOT-${Date.now()}`,
      title: `Cargo Status Update: ${status}`,
      message: `Shipment #${shipmentId} (${shipmentObj?.goodsType}) status set to ${status} by ${carrierName}.`,
      timestamp: "Just now",
      read: false,
      role: "shipper"
    };
    setWorkspaceNotifications((prev) => [newN, ...prev]);

    // Send a system message inside the chat stream
    setWorkspaceChats((chats) => {
      const history = chats[shipmentId] || [];
      return {
        ...chats,
        [shipmentId]: [
          ...history,
          { id: `sys_${Date.now()}`, shipmentId, sender: "System", text: `🚨 STATUS ALERT: Vessel status is now [${status}]. Verified by carrier driver.`, timestamp: "Just now" }
        ]
      };
    });
  };

  const handleWorkspaceSendChatMessage = (shipmentId: string, sender: "Transporter" | "Shipper", text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      shipmentId,
      sender,
      text,
      timestamp: timeStr
    };

    setWorkspaceChats((chats) => ({
      ...chats,
      [shipmentId]: [...(chats[shipmentId] || []), newMsg]
    }));

    // SMART AUTOMATED REACTION RESPDONDER
    // Responds 1.5 seconds later
    setTimeout(() => {
      let responseText = "";
      if (sender === "Shipper") {
        const reactions = [
          "Acknowledged, shipper! Representative driver reports vehicle cargo locks are sealed.",
          "Understood. Telemetry checks show optimal container humidity and temperature holding.",
          "Confirmed! We are currently cruising bypass roads close to Indore sector.",
          "Received! Driver will trigger cargo unloading requests upon arriving at the receiving yard dock.",
          "Perfect. Route is calculated. Standing by for pickup slots."
        ];
        responseText = reactions[Math.floor(Math.random() * reactions.length)];
      } else {
        const reactions = [
          "Thank you for the update! Receiving bays are notified of your arrival window.",
          "Acknowledged. Telemetry logs received. Keep us informed if any weather barriers emerge.",
          "Excellent service! Our port clearing documentation is completely ready.",
          "Got it. Drive safe. Clear speeds are key to our supply SLA requirements.",
          "Standing by. Let us know immediately upon completing final delivery."
        ];
        responseText = reactions[Math.floor(Math.random() * reactions.length)];
      }

      const replyMsg: ChatMessage = {
        id: `msg_reply_${Date.now()}`,
        shipmentId,
        sender: sender === "Shipper" ? "Transporter" : "Shipper",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setWorkspaceChats((chats) => ({
        ...chats,
        [shipmentId]: [...(chats[shipmentId] || []), replyMsg]
      }));
    }, 1500);
  };

  const handleWorkspaceMarkNotificationRead = (id: string) => {
    setWorkspaceNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleWorkspaceClearNotifications = () => {
    setWorkspaceNotifications([]);
  };



  return (
    <div className="min-h-screen bg-[#FCFAF2] text-[#1F1F22] font-sans selection:bg-[#FFD034]/40 overflow-x-hidden antialiased relative">
      {/* Visual Overlay Frame (Techy Decoration) */}
      <div className="fixed inset-0 border-[10px] border-[#FFAE00]/[0.02] pointer-events-none rounded-2xl z-50"></div>

      {/* Top ambient status flare */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[150px] bg-[#FFEFA6]/[0.10] filter blur-[120px] pointer-events-none z-0"></div>

      {/* ----------------- LANDING VIEWS ----------------- */}
      {activeView === "landing" ? (
        <div className="relative min-h-screen flex flex-col justify-between p-6 sm:p-12 z-10">
          {/* Header Bar */}
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full border-b border-[#EBEBE0] pb-6 mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E15307] rounded-xl flex items-center justify-center mr-1.5 shadow-[0_4px_10px_rgba(225,83,7,0.30)]">
                <div className="w-4 h-4 border-2 border-white rotate-45"></div>
              </div>
              <div>
                <span className="font-extrabold text-neutral-900 text-lg tracking-wider font-mono">APNA LOGIX</span>
                <span className="text-[10px] text-neutral-500 font-mono block uppercase font-bold">Insta-Matching Terminal</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 font-mono">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Servers: Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Free Service</span>
              </div>
            </div>
          </div>

          {/* Core Hero Content */}
          <div className="max-w-4xl mx-auto w-full text-center py-12 flex-1 flex flex-col justify-center items-center">
            {/* Glowing Main Landing Titles */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-sans leading-tight mb-6">
              <span className="text-blue-600 block">
                {language === "hindi" ? "लॉजिस्टिक्स समस्याओं का पूर्वानुमान लगाएं" : "Predict Logistics Problems"}
              </span>
              <span className="text-neutral-800 block text-3xl sm:text-5xl mt-2">
                {language === "hindi" ? "उनके उत्पन्न होने से पहले" : "Before They Exist"}
              </span>
            </h1>

            {/* Subtitle description */}
            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed mb-10 font-sans font-medium">
              {language === "hindi"
                ? "एक एआई-संचालित मल्टी-एजेंट कमांड सेंटर जो मांग का पूर्वानुमान लगाता है, भीड़भाड़ की भविष्यवाणी करता है, बेड़े का अनुकूलन करता है और रसद नेटवर्क को स्वचालित रूप से संचालित करता है।"
                : "An AI-powered multi-agent command center that forecasts demand, predicts congestion, optimizes fleets, and coordinates logistics networks autonomously."}
            </p>

            {/* Hero Interactive button triggers */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
              <button
                onClick={() => {
                  setActiveView("dashboard");
                  setDashboardRoleChoice("operator");
                }}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-xl shadow-blue-600/20 border border-blue-500/30 flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>{language === "hindi" ? "नियंत्रण केंद्र शुरू करें" : "Launch Command Center"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setActiveView("dashboard");
                  setDashboardRoleChoice("operator");
                  setTimeout(() => {
                    handleRunSimulation();
                  }, 600);
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/25 text-neutral-800 border-2 border-neutral-300 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>{language === "hindi" ? "स्वचालित सिमुलेशन देखें" : "Watch Automated Simulation"}</span>
              </button>
            </div>

            {/* Indian-style Insta Portal choices */}
            <div className="mt-12 w-full max-w-3xl z-20">
              <h2 className="text-sm font-black text-neutral-800 uppercase tracking-widest mb-4 font-mono text-center">
                ━ {language === "hindi" 
                    ? "वाहन चालक (ट्रांसपोटर) और शिपर सीधा प्रवेश" 
                    : "Transporter & Shipper Portal Direct Entry"
                  } ━
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Control Center Card */}
                <button
                  onClick={() => {
                    setActiveView("dashboard");
                    setDashboardRoleChoice("operator");
                  }}
                  className="bg-white hover:bg-[#FFFDF4] border-4 border-amber-400 p-4.5 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer group shadow-lg scale-100 hover:scale-[1.02]"
                >
                  <span className="text-2xl">⚡</span>
                  <div className="mt-4">
                    <h4 className="font-sans font-black text-[#E15307] text-[12px] uppercase tracking-wide">
                      {language === "hindi" ? "ग्रिड नियंत्रण केंद्र (Control Center)" : "Control Center"}
                    </h4>
                    <p className="text-[11px] text-neutral-800 leading-snug font-bold mt-1">
                      {language === "hindi"
                        ? "लाइव ग्रिड, जोखिम मीटर और मुख्य यातायात की निगरानी करें।"
                        : "Monitor live grid, risk meters, and simulate severe weather/closure events."}
                    </p>
                  </div>
                </button>
 
                 {/* 2. Transporter Card */}
                 <button
                   onClick={() => {
                     setActiveView("dashboard");
                     setDashboardRoleChoice("workspace");
                     setCurrentWorkspaceRole("transporter");
                   }}
                   className="bg-white hover:bg-[#E6F3FF] border-4 border-blue-300 p-4.5 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer group shadow-lg scale-100 hover:scale-[1.02]"
                 >
                   <span className="text-2xl">🚛</span>
                   <div className="mt-4">
                     <h4 className="font-sans font-black text-blue-700 text-[12px] uppercase tracking-wide font-mono">
                       {language === "hindi" ? "वाहन चालक (Transporter)" : "Transporter"}
                     </h4>
                     <p className="text-[11px] text-neutral-800 leading-snug font-bold mt-1">
                       {language === "hindi"
                         ? "खाली ट्रक विवरण पोस्ट करें, सामान ढूंढे और सीधे सौदे की बोली लगाएं।"
                         : "Post truck load space, browse shipping requests, submit direct condition bids."}
                     </p>
                   </div>
                 </button>
 
                 {/* 3. Shipper Card */}
                 <button
                   onClick={() => {
                     setActiveView("dashboard");
                     setDashboardRoleChoice("workspace");
                     setCurrentWorkspaceRole("shipper");
                   }}
                   className="bg-white hover:bg-[#FFEDE1] border-4 border-[#FDBA74] p-4.5 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer group shadow-lg scale-100 hover:scale-[1.02]"
                 >
                   <span className="text-2xl">📦</span>
                   <div className="mt-4">
                     <h4 className="font-sans font-black text-[#963F01] text-[12px] uppercase tracking-wide">
                       {language === "hindi" ? "सामान भेजने वाला (Shipper)" : "Shipper"}
                     </h4>
                     <p className="text-[11px] text-neutral-800 leading-snug font-bold mt-1">
                       {language === "hindi"
                         ? "सामान विवरण पोस्ट करें, बोलियां देखें, मोल-भाव करें और सौदा पक्का करें।"
                         : "Publish cargo load details, receive offers, make counter-bids, direct sauda."}
                     </p>
                   </div>
                 </button>
              </div>
            </div>

            {/* Interactive Vector grid backscatter mockup in Hero */}
            <div className="w-full max-w-3xl mt-16 aspect-[16/8] bg-white/[0.02] border border-white/5 rounded-2xl p-4 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-dot-pattern opacity-[0.25]"></div>
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050507] to-transparent"></div>

              {/* Fake Map Elements */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <svg viewBox="0 0 800 400" className="w-full h-full opacity-30">
                  <path d="M 100 100 L 400 200 L 700 80" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="5,5" fill="none" />
                  <path d="M 200 300 L 400 200 L 500 350" stroke="#10b981" strokeWidth="2" strokeDasharray="2,2" fill="none" />
                  <circle cx="400" cy="200" r="14" fill="rgba(37, 99, 235, 0.1)" stroke="#2563eb" strokeWidth="1.5" />
                  <circle cx="100" cy="100" r="8" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="700" cy="80" r="8" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Tiny Floating Agent box visuals */}
              <div className="absolute top-4 left-4 bg-[#0a0a0f]/90 border border-white/10 rounded-lg p-2.5 text-left text-xs font-mono max-w-xs backdrop-blur-sm shadow-md">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">▲ DEMAND AGENT</div>
                <div className="text-neutral-400 mt-1">Surge detected in South Delhi block (+38%)</div>
              </div>
              <div className="absolute bottom-6 right-4 bg-[#0a0a0f]/90 border border-white/10 rounded-lg p-2.5 text-left text-xs font-mono max-w-xs backdrop-blur-sm shadow-md">
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">⚡ FLEET CORE</div>
                <div className="text-neutral-400 mt-1 font-sans">Autonomous eVTOL drone cluster assigned.</div>
              </div>
            </div>
          </div>

          {/* Footer branding */}
          <div className="max-w-7xl mx-auto w-full text-center text-xs text-neutral-600 font-mono border-t border-white/5 pt-6 mt-8">
            LOGIX CONTROL TERMINAL SYSTEM © 2026. FOR HACKATHON EVALUATION.
          </div>
        </div>
      ) : currentUser === null ? (
        /* ----------------- AUTHENTICATION ENTRY GATE ----------------- */
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 z-20 font-sans">
          <div className="w-full max-w-md bg-[#FFFDE8] border-4 border-amber-400 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#E15307] via-yellow-400 to-[#E15307]"></div>
            
            {/* Logo area */}
            <div className="text-center">
              <div className="mx-auto w-10 h-10 bg-[#E15307] rounded-xl flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(225,83,7,0.25)]">
                <div className="w-5 h-5 border-2 border-white rotate-45"></div>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-black">{language === "hindi" ? "अपना लॉजिक्स द्वार (APNA LOGIX GATEWAY)" : "APNA LOGIX GATEWAY"}</h2>
              <p className="text-xs text-neutral-800 font-bold font-mono uppercase mt-0.5">
                {language === "hindi" ? "सुरक्षित प्रवेश द्वार • Secure Logistics Entry" : "Secure Logistics Entry"}
              </p>
            </div>

            {/* Toggle Mode Tab */}
            <div className="grid grid-cols-2 gap-1 bg-[#F4F2E9] p-1.5 rounded-2xl border-2 border-neutral-200">
              <button
                onClick={() => setAuthMode("login")}
                className={`py-2 text-xs rounded-xl font-black tracking-wide uppercase transition-all ${
                  authMode === "login"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-neutral-700 hover:bg-white"
                }`}
              >
                {language === "hindi" ? "लॉग-इन (Log In)" : "Log In"}
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`py-2 text-xs rounded-xl font-black tracking-wide uppercase transition-all ${
                  authMode === "signup"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-neutral-700 hover:bg-white"
                }`}
              >
                {language === "hindi" ? "साइन-अप (Sign Up)" : "Sign Up"}
              </button>
            </div>

            {/* FORM AREA */}
            {authMode === "login" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!loginPhone || !loginPassword) {
                    alert("Please enter both mobile number and password.");
                    return;
                  }
                  // Log in successfully
                  setCurrentUser({
                    name: language === "hindi" ? "Ramesh Yadav (रमेश यादव)" : "Ramesh Yadav",
                    phone: loginPhone,
                    role: currentWorkspaceRole === "transporter" ? "transporter" : "shipper"
                  });
                  alert(language === "hindi" ? "लॉग-इन सफल हुआ! (Successfully logged in)" : "Successfully logged in!");
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1.5">
                    {language === "hindi" ? "मोबाइल नंबर (Mobile Phone Number) *" : "Mobile Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    placeholder="98XXXXXX55"
                    className="w-full bg-white border-2 border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-black font-semibold focus:outline-none focus:border-[#2563EB]"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1.5">
                    {language === "hindi" ? "पासवर्ड (Secure Password) *" : "Secure Password *"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-black font-semibold focus:outline-none focus:border-[#2563EB]"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#E15307] hover:bg-orange-700 text-white font-black text-sm rounded-xl tracking-wider uppercase shadow-md transition-all cursor-pointer"
                >
                  {language === "hindi" ? "सुरक्षित प्रवेश करें (Verify & Proceed Securely)" : "Verify & Proceed Securely"}
                </button>

                {/* Instant Prefills for high usability */}
                <div className="pt-2 border-t border-neutral-200">
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase mb-1.5 text-center">⚡ Instant Guest Prefill Test Log In</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginPhone("+91 98110 55432");
                        setLoginPassword("password123");
                        setCurrentUser({
                          name: language === "hindi" ? "Ramesh Yadav (रमेश यादव)" : "Ramesh Yadav",
                          phone: "+91 98110 55432",
                          role: "transporter"
                        });
                        setDashboardRoleChoice("workspace");
                        setCurrentWorkspaceRole("transporter");
                        alert(language === "hindi" ? "रमेश यादव के रूप में लॉग-इन सफल! (Logged in as Ramesh Yadav)" : "Logged in as Ramesh Yadav!");
                      }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg border border-blue-200 transition-all cursor-pointer mt-0"
                    >
                      Transporter / Vehicle Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginPhone("+91 70012 34567");
                        setLoginPassword("password123");
                        setCurrentUser({
                          name: language === "hindi" ? "Ramesh Gupta (रमेश गुप्ता)" : "Ramesh Gupta",
                          phone: "+91 70012 34567",
                          role: "shipper"
                        });
                        setDashboardRoleChoice("workspace");
                        setCurrentWorkspaceRole("shipper");
                        alert(language === "hindi" ? "रमेश गुप्ता के रूप में लॉग-इन सफल! (Logged in as Ramesh Gupta)" : "Logged in as Ramesh Gupta!");
                      }}
                      className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-black rounded-lg border border-orange-200 transition-all cursor-pointer mt-0"
                    >
                      Shipper (Party)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!signupForm.name || !signupForm.phone || !signupForm.password) {
                    alert("Please fill in all required registration fields.");
                    return;
                  }
                  // Register successfully
                  setCurrentUser({
                    name: signupForm.name,
                    phone: signupForm.phone,
                    role: signupForm.role
                  });
                  setDashboardRoleChoice(signupForm.role === "operator" ? "operator" : "workspace");
                  if (signupForm.role !== "operator") {
                    setCurrentWorkspaceRole(signupForm.role as "transporter" | "shipper");
                  }
                  alert(language === "hindi" ? `पंजीकरण पूर्ण हुआ! Account created for ${signupForm.name}.` : `Registration complete! Account created for ${signupForm.name}.`);
                }}
                className="space-y-4 text-left font-sans"
              >
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    {language === "hindi" ? "आपका नाम क्या है? (What is Your Name?) *" : "What is Your Name? *"}
                  </label>
                  <input
                    type="text"
                    placeholder="Ramesh Yadav"
                    className="w-full bg-white border-2 border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#2563EB]"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    {language === "hindi" ? "मंच पर अपनी भूमिका चुनें (Select Your Role) *" : "Select Your Role *"}
                  </label>
                  <select
                    className="w-full bg-white border-2 border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#2563EB]"
                    value={signupForm.role}
                    onChange={(e) => setSignupForm({...signupForm, role: e.target.value as any})}
                    required
                  >
                    <option value="transporter">
                      {language === "hindi" ? "वाहन चालक / गाड़ी मालिक (Transporter)" : "Transporter"}
                    </option>
                    <option value="shipper">
                      {language === "hindi" ? "सामान भेजने वाला / व्यापारी (Shipper / Merchant)" : "Cargo Shipper / Merchant"}
                    </option>
                    <option value="operator">
                      {language === "hindi" ? "नियंत्रण केंद्र ऑपरेटर (Grid Operator / Control Agent)" : "Grid Operator / Control Agent"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    {language === "hindi" ? "मोबाइल नंबर (Mobile Phone Number) *" : "Mobile Phone Number *"}
                  </label>
                  <input
                    type="tel"
                    placeholder="98100 XXXXX"
                    className="w-full bg-white border-2 border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#2563EB]"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    {language === "hindi" ? "सुरक्षित पासवर्ड बनाएं (Create Secure Password) *" : "Create Secure Password *"}
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    className="w-full bg-white border-2 border-neutral-350 rounded-xl px-3.5 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#2563EB]"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    {language === "hindi" ? "शहर/जिला (Business City / Head Office)" : "Business City / Head Office"}
                  </label>
                  <input
                    type="text"
                    placeholder="New Delhi, India"
                    className="w-full bg-white border-2 border-neutral-355 rounded-xl px-3.5 py-1 text-xs text-black font-semibold focus:outline-none focus:border-[#2563EB]"
                    value={signupForm.city}
                    onChange={(e) => setSignupForm({...signupForm, city: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl tracking-wider uppercase shadow-md transition-all cursor-pointer"
                >
                  {language === "hindi" ? "पंजीकरण करें और प्रवेश करें (Register & Enter Terminal)" : "Register & Enter Terminal"}
                </button>
              </form>
            )}

            {/* Back to landing */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveView("landing");
                }}
                className="text-xs font-black text-[#E15307] hover:underline"
              >
                ← Go Back to Home (होम पेज पर वापस जाएं)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ----------------- DASHBOARD VIEWS ----------------- */
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative z-10 animate-fade-in">
          {/* Main system header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EBEBE0] pb-4 px-2">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#E15307] rounded-xl flex items-center justify-center mr-3 shadow-[0_4px_10px_rgba(225,83,7,0.25)]">
                  <div className="w-4 h-4 border-2 border-white rotate-45"></div>
                </div>
                <h1 className="text-2xl font-black tracking-tighter font-mono text-[#1F1F22]">APNA LOGIX</h1>
              </div>
              <div className="hidden sm:flex space-x-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Servers: Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Sim: Active</span>
                </div>
              </div>
            </div>

            {/* Middle Nav Pill */}
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full border-2 border-[#EBEBE0] shadow-sm">
              <button 
                onClick={() => setActiveView("dashboard")}
                className="px-3.5 py-1 bg-blue-600 rounded-full text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Dashboard
              </button>
              <button 
                onClick={() => {
                  if (!isSimulating) handleRunSimulation();
                }}
                className={`px-3.5 py-1 rounded-full text-xs font-bold text-neutral-700 transition-all ${isSimulating ? 'bg-amber-400 text-neutral-900 animate-pulse font-extrabold' : 'hover:bg-neutral-100'}`}
              >
                {isSimulating ? "Running Sim..." : "Run Sim"}
              </button>
              <button 
                onClick={() => setActiveView("landing")}
                className="px-3 py-1 hover:bg-neutral-100 rounded-full text-xs font-bold text-[#E15307]"
              >
                Exit
              </button>
            </div>

            {/* Top-Right login options as requested by prompt */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right shrink-0">
                <div className="text-[10px] text-neutral-800 font-black tracking-wider font-mono uppercase">SWITCH ACTIVE PORTAL:</div>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <button
                    onClick={() => {
                      setDashboardRoleChoice("operator");
                    }}
                    className={`px-3 py-1.5 font-sans text-[11px] uppercase rounded-xl font-black border-2 transition-all cursor-pointer ${
                      dashboardRoleChoice === "operator"
                        ? "bg-[#FFF0BF] text-[#E15307] border-[#FFAE00] shadow-sm scale-105"
                        : "bg-white border-neutral-300 text-black hover:bg-neutral-50"
                    }`}
                  >
                    Control Center
                  </button>
                  <button
                    onClick={() => {
                      setDashboardRoleChoice("workspace");
                      setCurrentWorkspaceRole("transporter");
                    }}
                    className={`px-3 py-1.5 font-sans text-[11px] uppercase rounded-xl font-black border-2 transition-all cursor-pointer ${
                      dashboardRoleChoice === "workspace" && currentWorkspaceRole === "transporter"
                        ? "bg-[#E6F3FF] text-[#1E40AF] border-[#93C5FD] shadow-sm scale-105"
                        : "bg-white border-neutral-300 text-black hover:bg-neutral-50"
                    }`}
                  >
                    Transporter (वाहन चालक)
                  </button>
                  <button
                    onClick={() => {
                      setDashboardRoleChoice("workspace");
                      setCurrentWorkspaceRole("shipper");
                    }}
                    className={`px-3 py-1.5 font-sans text-[11px] uppercase rounded-xl font-black border-2 transition-all cursor-pointer ${
                      dashboardRoleChoice === "workspace" && currentWorkspaceRole === "shipper"
                        ? "bg-[#FFEDE1] text-[#9A3412] border-[#FDBA74] shadow-sm scale-105"
                        : "bg-white border-neutral-300 text-black hover:bg-neutral-50"
                    }`}
                  >
                    Cargo Shipper (सामान भेजने वाला)
                  </button>
                </div>
              </div>

              <div className="h-8 w-px bg-neutral-200 hidden md:block"></div>

              {/* Language dynamic switch */}
              <button 
                onClick={() => setLanguage(language === "english" ? "hindi" : "english")}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl text-[11px] font-black text-blue-700 tracking-wider hover:scale-[1.02] active:scale-95 transition-all font-mono shrink-0 cursor-pointer"
                title="Change language / भाषा बदलें"
              >
                🌐 {language === "english" ? "हिन्दी माध्यम" : "English Medium"}
              </button>

              <div className="h-8 w-px bg-neutral-200 hidden md:block"></div>

              {/* Clock Panel */}
              <div className="text-right hidden sm:block">
                <div className="text-xs font-mono text-neutral-600 uppercase tracking-widest flex items-center justify-end gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#E15307]" />
                  <span>08:21:44 UTC</span>
                </div>
                <div className="text-[10px] text-blue-700 font-extrabold font-mono font-sans">{language === "hindi" ? "पोर्ट: मुख्य" : "PORT: CENTRAL"}</div>
              </div>
            </div>

          </header>

          {/* Dynamic Personalized Greeting banner for Ramesh */}
          {currentUser && (
            <div className="bg-gradient-to-r from-blue-50 to-neutral-50 border-2 border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm animate-fade-in font-sans">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300 font-extrabold text-blue-700 text-lg uppercase shadow-sm">
                  {currentUser.name[0]}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                    {(() => {
                      const hr = new Date().getHours();
                      let greetingWord = "Hi";
                      if (language === "hindi") {
                        if (hr >= 4 && hr < 12) greetingWord = "शुभ प्रभात (Good morning)";
                        else if (hr >= 12 && hr < 17) greetingWord = "नमस्कार (Good afternoon)";
                        else greetingWord = "शुभ संध्या (Good evening)";
                        return `${greetingWord}, ${currentUser.name}!`;
                      } else {
                        if (hr >= 4 && hr < 12) greetingWord = "Good morning";
                        else if (hr >= 12 && hr < 17) greetingWord = "Good afternoon";
                        else greetingWord = "Good evening";
                        return `${greetingWord} ${currentUser.name.split(" (")[0]}!`;
                      }
                    })()}
                  </h2>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase font-mono tracking-wider mt-0.5">
                    {language === "hindi" 
                      ? `सक्रिय लॉजिस्टिक्स सत्र • मोबाइल नंबर: ${currentUser.phone}` 
                      : `Active Logistics Session • Mobile: ${currentUser.phone}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full font-black uppercase tracking-wider animate-pulse font-mono">
                  {language === "hindi" ? "प्रवेश स्वीकृत" : "Access Approved"}
                </span>
                <button
                  onClick={() => setCurrentUser(null)}
                  className="px-3 py-1.5 bg-neutral-200 hover:bg-red-50 hover:text-red-700 border border-neutral-300 text-neutral-700 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  {language === "hindi" ? "बाहर निकलें (Logout)" : "Logout"}
                </button>
              </div>
            </div>
          )}

          {/* 8. Executive Analytics Cards row */}
          <section className="animate-fade-in relative z-10">
            <ExecutiveAnalytics
              totalDeliveries={metrics.totalDeliveries}
              activeVehicles={metrics.activeVehicles}
              predictedDemand={metrics.predictedDemand}
              congestionRisk={metrics.congestionRisk}
              utilization={metrics.utilization}
              efficiency={metrics.efficiency}
              emissionsSaved={metrics.emissionsSaved}
              activeScenarioName={SCENARIOS.find((s) => s.id === activeScenarioId)?.name || "Standard Operations"}
              language={language || "english"}
            />
          </section>

          {/* Primary Layout Map & Agent Panel Grid (Bento columns) or Direct Cargo exchange workspace */}
          {dashboardRoleChoice === "workspace" ? (
            <section className="animate-fade-in relative z-10">
              <LogisticsWorkspace
                currentRole={currentWorkspaceRole}
                setCurrentRole={setCurrentWorkspaceRole}
                shipments={workspaceShipments}
                onAddShipment={handleWorkspaceAddShipment}
                onAddOffer={handleWorkspaceAddOffer}
                onUpdateOfferStatus={handleWorkspaceUpdateOfferStatus}
                onUpdateShipmentStatus={handleWorkspaceUpdateShipmentStatus}
                capacities={workspaceCapacities}
                onAddCapacity={handleWorkspaceAddCapacity}
                notifications={workspaceNotifications}
                onMarkNotificationRead={handleWorkspaceMarkNotificationRead}
                onClearNotifications={handleWorkspaceClearNotifications}
                chats={workspaceChats}
                onSendChatMessage={handleWorkspaceSendChatMessage}
                language={language}
              />
            </section>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Col: Map and congestion predictors */}
                <div className="lg:col-span-8 space-y-5">
                  {/* 1. City Logistics Map */}
                  <CommandCenterMap
                    hubs={hubs}
                    vehicles={vehicles}
                    activeScenarioId={activeScenarioId}
                    onSelectVehicle={setSelectedVehicle}
                    onSelectHub={setSelectedHub}
                  />

                  {/* 3. Congestion Prediction Panel overlay */}
                  <div className="bg-[#FFFDE3] border-4 border-amber-400 hover:border-[#FFAE00] rounded-2xl p-5 shadow-sm transition-all">
                    <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="text-rose-600 w-5 h-5 animate-pulse" />
                        <div>
                          <h4 className="font-extrabold text-black text-sm uppercase tracking-wide">Congestion Prediction Engine</h4>
                          <p className="text-[10px] text-neutral-800 font-bold font-mono">NEURAL FORECAST FOR TRAVEL INDEX CORRIDORS (NH48, OUTER RING, DND)</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black font-mono bg-red-100 text-red-800 border-2 border-red-300 px-2 py-0.5 rounded uppercase animate-pulse">
                        Risk Detector Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { id: "nh48", corridor: "NH48 Expressway Sector", risk: activeScenarioId === "road_closure" ? 95 : activeScenarioId === "flood" ? 45 : 18, action: "Reroute Heavy Carrier", window: "10 AM - 6 PM" },
                        { id: "dnd", corridor: "DND Flyway Transits", risk: activeScenarioId === "flood" ? 89 : activeScenarioId === "festival_traffic" ? 65 : 22, action: "Assign Air Drones", window: "2 PM - 5 PM" },
                        { id: "ring", corridor: "Outer Ring Road Sector", risk: activeScenarioId === "festival_traffic" ? 92 : activeScenarioId === "flood" ? 55 : 14, action: "Leverage Cargo eVTOL", window: "4 PM - 9 PM" },
                      ].map((lane) => {
                        return (
                          <div key={lane.id} className="bg-white border-2 border-neutral-300 rounded-xl p-3.5 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-black text-black">{lane.corridor}</span>
                                <span className={`text-[11px] font-mono font-black ${lane.risk > 70 ? "text-red-700 animate-pulse" : lane.risk > 40 ? "text-amber-600" : "text-emerald-700"}`}>
                                  {lane.risk}% RISK
                                </span>
                              </div>
                              <div className="text-[10px] text-neutral-800 font-bold font-mono uppercase mt-1">EXPECTED PEAK: {lane.window}</div>
                            </div>
                            <div className="mt-4 pt-2 border-t border-neutral-200 flex items-center justify-between">
                              <span className="text-[9px] font-black font-mono text-neutral-700">ACTION:</span>
                              <span className={`text-[9.5px] font-black font-mono px-1.5 py-0.5 rounded border ${lane.risk > 50 ? "bg-red-50 text-red-800 border-red-300" : "bg-neutral-100 text-neutral-700 border-neutral-200"}`}>
                                {lane.action}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Col: Multi-Agent Coordination Feed & Scenario Controllers */}
                <div className="lg:col-span-4 space-y-5">
                  {/* 4. Multi-Agent Coordination dialogues */}
                  <AgentCoordination
                    messages={messages}
                    isThinking={isThinking}
                    onSendCustomIncident={handleSendCustomIncident}
                    soundEnabled={soundEnabled}
                    setSoundEnabled={setSoundEnabled}
                  />

                  {/* 9. Scenario Simulator Controller & 10. Hackathon Trigger wrapper */}
                  <ScenarioSimulator
                    scenarios={SCENARIOS}
                    activeScenarioId={activeScenarioId}
                    onSelectScenario={handleSelectScenario}
                    onRunSimulation={handleRunSimulation}
                    isSimulating={isSimulating}
                    simulationPhase={simulationPhase}
                  />
                </div>
              </div>

              {/* 2 & 7. Charts & Heatmap Analytics comparisons */}
              <section className="animate-fade-in">
                <AnalyticsCharts scores={scores} demandSurges={SCENARIOS.find((s) => s.id === activeScenarioId)?.demandSurges || SCENARIOS[0].demandSurges} />
              </section>

              {/* 5 & 6. Capacity spot trade marketplace & AI Optimization Recommendations */}
              <section className="animate-fade-in relative z-10">
                <CapacityMarketplace
                  capacityTrades={capacityTrades}
                  recommendations={recommendations}
                  onExecuteRecommendation={handleExecuteRecommendation}
                  onAcceptCapacityTrade={handleAcceptCapacityTrade}
                />
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
