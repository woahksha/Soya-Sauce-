export interface Vehicle {
  id: string;
  name: string;
  type: "Autonomous EV" | "Heavy Carrier" | "eVTOL Cargo Drone";
  status: "Optimized" | "Rerouted" | "Stalled" | "Charging";
  capacity: number; // percentage filled
  battery: number; // percentage
  lat: number;
  lng: number;
  destination: string;
  speed: number; // km/h
  heading: number; // degrees for rot
}

export interface Hub {
  id: string;
  name: string;
  city: string;
  capacity: number; // total sqft capability
  fillRate: number; // percentage filled
  loadCount: number;
  lat: number;
  lng: number;
  status: "Operational" | "At Capacity" | "Gridlock Alert";
}

export interface AgentMessage {
  id: string;
  agent: "Demand Agent" | "Route Agent" | "Warehouse Agent" | "Fleet Agent";
  text: string;
  timestamp: string;
  status: "warning" | "success" | "info" | "action";
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  riskMultiplier: number;
  demandSurges: {
    delhi: number;
    noida: number;
    gurgaon: number;
    grid?: number;
    [key: string]: number | undefined;
  };
  congestionPoints: string[];
}

export interface CapacityTrade {
  id: string;
  truckId: string;
  location: string;
  availableCapacity: number;
  matchScore: number;
  shipmentType: string;
  revenueBoost: string;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  category: "Inventory" | "Route" | "Fleet" | "Warehouse";
  impact: string;
  status: "Pending Autonomous Approval" | "Executing" | "Completed";
  time: string;
}

export interface SimulationScores {
  withLogix: {
    deliveryTime: number; // hours
    fuelSavings: number; // percentage
    utilization: number; // percentage
    onTimeRate: number; // percentage
    revenueImpact: number; // Index or percentage change
  };
  withoutLogix: {
    deliveryTime: number;
    fuelSavings: number;
    utilization: number;
    onTimeRate: number;
    revenueImpact: number;
  };
}

export interface TransporterOffer {
  id: string;
  shipmentId: string;
  transporterName: string;
  transporterPhone: string;
  truckDetails: string;
  availableCapacity: number; // tons or %
  pickupTime: string;
  deliveryCommitment: string;
  extraCharges: number;
  notes: string;
  status: "Pending" | "Approved" | "Rejected" | "Counter-Offer";
  counterPrice?: number;
}

export interface CargoShipment {
  id: string;
  pickup: string;
  destination: string;
  goodsType: string;
  weight: number; // tons
  date: string;
  time: string;
  status: "Posted" | "Offer Submitted" | "Awaiting Approval" | "Approved" | "In Transit" | "Delivered";
  shipperName: string;
  shipperPhone: string;
  specialInstructions: string;
  offers: TransporterOffer[];
  price: number; // Decided by shipper
}

export interface TruckCapacity {
  id: string;
  transporterName: string;
  phone: string;
  location: string;
  route: string;
  capacity: number; // tons
  date: string;
  timeSlots: string;
}

export interface LogisticsNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  role: "transporter" | "shipper" | "all";
}

export interface ChatMessage {
  id: string;
  shipmentId: string;
  sender: "Transporter" | "Shipper" | "System";
  text: string;
  timestamp: string;
}

