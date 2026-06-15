import React, { useState, useEffect } from "react";
import {
  Truck,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  Phone,
  PlusCircle,
  X,
  Search,
  Sparkles,
  User,
  Bell,
  CornerDownRight,
  ShieldCheck,
  Calendar,
  XCircle,
  Scale,
  DollarSign,
  MapPin,
  FileText,
  BookmarkCheck,
  Navigation
} from "lucide-react";
import { CargoShipment, TransporterOffer, TruckCapacity, LogisticsNotification, ChatMessage } from "../types";
import { Language } from "../utils/translations";

interface WorkspaceProps {
  currentRole: "transporter" | "shipper";
  setCurrentRole: (role: "transporter" | "shipper") => void;
  shipments: CargoShipment[];
  onAddShipment: (s: Omit<CargoShipment, "id" | "offers" | "status">) => void;
  onAddOffer: (shipmentId: string, offer: Omit<TransporterOffer, "id" | "status" | "shipmentId">) => void;
  onUpdateOfferStatus: (shipmentId: string, offerId: string, status: "Approved" | "Rejected" | "Counter-Offer", counterPrice?: number) => void;
  onUpdateShipmentStatus: (shipmentId: string, status: CargoShipment["status"]) => void;
  capacities: TruckCapacity[];
  onAddCapacity: (c: Omit<TruckCapacity, "id">) => void;
  notifications: LogisticsNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  chats: Record<string, ChatMessage[]>;
  onSendChatMessage: (shipmentId: string, sender: "Transporter" | "Shipper", text: string) => void;
  language: Language;
}

export default function LogisticsWorkspace({
  currentRole,
  setCurrentRole,
  shipments,
  onAddShipment,
  onAddOffer,
  onUpdateOfferStatus,
  onUpdateShipmentStatus,
  capacities,
  onAddCapacity,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  chats,
  onSendChatMessage,
  language
}: WorkspaceProps) {
  // Navigation & Modal tabs
  const [activeTab, setActiveTab] = useState<"capacities" | "browse_shipments" | "active_jobs" | "post_shipment" | "my_shipments" | "active_track">("browse_shipments");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingShipment, setViewingShipment] = useState<CargoShipment | null>(null);
  const [viewingOffersForShipment, setViewingOffersForShipment] = useState<CargoShipment | null>(null);
  
  // Notification menu toggle
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Form states - Post Capacity
  const [capacityForm, setCapacityForm] = useState({
    location: "New Delhi (Hub North)",
    route: "New Delhi (Hub North) → Mumbai (Hub West)",
    capacity: 12,
    date: new Date().toISOString().split('T')[0],
    timeSlots: "Morning Slot (06:00 - 12:00)",
    transporterName: "Gupta Speed Transport Ltd",
    phone: "+91 98112 00344"
  });

  // Form states - Post Shipment
  const [shipmentForm, setShipmentForm] = useState({
    pickup: "New Delhi (Hub North)",
    destination: "Mumbai (Hub West)",
    goodsType: "FMCG Grocery Packs & Tea Boxes",
    weight: 5.5,
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    specialInstructions: "Needs weather-proof truck sheet. Tarpaulin must cover fully.",
    shipperName: "Bharat Swadeshi Agro Wholesalers",
    shipperPhone: "+91 70014 33221",
    price: 15000
  });

  // Form states - Submit Offer conditions
  const [offerForm, setOfferForm] = useState({
    transporterName: "Verma Roadways India",
    transporterPhone: "+91 94331 44550",
    truckDetails: "TATA Ultra Cabin Truck (10 Ton Loading)",
    availableCapacity: 8,
    pickupTime: "Daily Slot (Between 10 AM to 4 PM)",
    deliveryCommitment: "Guaranteed express delivery in 24-30 Hours",
    extraCharges: 1000,
    notes: "Professional cargo protection drivers. Fully prepared with water covers."
  });

  // Counter offer state
  const [counterPriceMap, setCounterPriceMap] = useState<Record<string, number>>({});

  // Real-time Chat interactive message input
  const [chatMessageInput, setChatMessageInput] = useState("");

  // Sync active tab when switcher role updates
  useEffect(() => {
    if (currentRole === "transporter") {
      setActiveTab("browse_shipments");
    } else {
      setActiveTab("my_shipments");
    }
  }, [currentRole]);

  // SMART MATCHING ALGORITHM
  const calculateSmartMatchScore = (shipment: CargoShipment): { score: number; truckId: string | null; route: string | null } => {
    let maxScore = 55; // Base minimum match
    let matchedTruck: TruckCapacity | null = null;

    for (const cap of capacities) {
      let score = 55;
      const isPickupMatch = cap.location.toLowerCase().includes(shipment.pickup.toLowerCase()) || shipment.pickup.toLowerCase().includes(cap.location.toLowerCase());
      
      if (isPickupMatch) {
         score += 25;
      }

      const isRouteMatch = cap.route.toLowerCase().includes(shipment.destination.toLowerCase()) || shipment.destination.toLowerCase().includes(cap.route.toLowerCase());
      if (isRouteMatch) {
         score += 15;
      }

      if (cap.capacity >= shipment.weight) {
        score += 5;
      }

      if (cap.date === shipment.date) {
        score += 4;
      }

      if (score > maxScore) {
        maxScore = score;
        matchedTruck = cap;
      }
    }

    return {
      score: Math.min(maxScore, 99),
      truckId: matchedTruck ? matchedTruck.id : "CAP-T-02",
      route: matchedTruck ? matchedTruck.route : null
    };
  };

  // Submit forms
  const handlePostCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCapacity({
      transporterName: capacityForm.transporterName,
      phone: capacityForm.phone,
      location: capacityForm.location,
      route: capacityForm.route,
      capacity: Number(capacityForm.capacity),
      date: capacityForm.date,
      timeSlots: capacityForm.timeSlots
    });
    setActiveTab("capacities");
  };

  const handlePostShipment = (e: React.FormEvent) => {
    e.preventDefault();
    onAddShipment({
      pickup: shipmentForm.pickup,
      destination: shipmentForm.destination,
      goodsType: shipmentForm.goodsType,
      weight: Number(shipmentForm.weight),
      date: shipmentForm.date,
      time: shipmentForm.time,
      shipperName: shipmentForm.shipperName,
      shipperPhone: shipmentForm.shipperPhone,
      specialInstructions: shipmentForm.specialInstructions,
      price: Number(shipmentForm.price)
    });
    setActiveTab("my_shipments");
  };

  const handleSubmitOffer = (e: React.FormEvent, shipmentId: string) => {
    e.preventDefault();
    onAddOffer(shipmentId, {
      transporterName: offerForm.transporterName,
      transporterPhone: offerForm.transporterPhone,
      truckDetails: offerForm.truckDetails,
      availableCapacity: Number(offerForm.availableCapacity),
      pickupTime: offerForm.pickupTime,
      deliveryCommitment: offerForm.deliveryCommitment,
      extraCharges: Number(offerForm.extraCharges),
      notes: offerForm.notes
    });
    setViewingShipment(null);
  };

  return (
    <div className="bg-white border-4 border-[#FFB800] rounded-3xl overflow-hidden shadow-xl z-10 w-full font-sans text-neutral-800">
      
      {/* Friendly Instamart header */}
      <div className="bg-[#FFF6D1] border-b-2 border-[#FFD034] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E15307] rounded-2xl shadow-md">
            <Truck className="w-8 h-8 text-white mr-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xl text-[#1E202B] tracking-tight">
                {language === "hindi" ? "अपना डायरेक्ट कार्गो एक्सचेंज 🇮🇳" : "Direct Cargo Exchange 🇮🇳"}
              </h3>
              <span className="text-[10px] bg-[#E15307] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                DIRECT FAST MATCH
              </span>
            </div>
            <p className="text-xs text-[#525560] font-medium">
              {language === "hindi" ? "बिना कमीशन सीधा सौदा! स्मार्ट डायरेक्ट मैच" : "Smart direct match with zero mediator commission!"}
            </p>
          </div>
        </div>

        {/* Action controls & Toggle roles */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Notification Menu Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3 rounded-xl border-2 transition-all relative ${
                showNotifications || unreadCount > 0
                  ? "bg-[#FFEFA6] border-[#FFAE00] text-[#E15307]"
                  : "bg-white border-neutral-250 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black font-mono text-[10px] px-1.5 py-0.2 rounded-full border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification drop menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border-2 border-[#FFD034] rounded-2xl overflow-hidden shadow-2xl z-50 text-xs">
                <div className="p-3 bg-[#FFF9E3] border-b-2 border-[#FFF0BF] flex justify-between items-center text-neutral-900 font-bold">
                  <span>🛎️ Alerters / Khabarein ({unreadCount})</span>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={onClearNotifications}
                        className="text-[11px] text-[#E15307] hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-neutral-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-neutral-400 font-medium">
                      Koi naya sandesh nahi hai.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3.5 space-y-1 hover:bg-[#FFFDF4] cursor-pointer transition-colors ${!notif.read ? 'bg-[#FCF7DF]' : ''}`}
                        onClick={() => {
                          onMarkNotificationRead(notif.id);
                          setShowNotifications(false);
                          
                          if (notif.role === "transporter") {
                            setCurrentRole("transporter");
                            setActiveTab("active_jobs");
                          } else if (notif.role === "shipper") {
                            setCurrentRole("shipper");
                            setActiveTab("my_shipments");
                          }
                        }}
                      >
                        <div className="flex justify-between font-bold text-neutral-800">
                          <span>{notif.title}</span>
                          <span className="text-[9px] text-neutral-500 font-mono">{notif.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clean Portal Swapper Mode */}
          <div className="flex items-center gap-1 bg-[#F4F2E9] p-1.5 rounded-2xl border border-neutral-200 select-none">
            <button
              onClick={() => {
                setCurrentRole("transporter");
              }}
              className={`px-4 py-2 text-xs rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                currentRole === "transporter"
                  ? "bg-[#2563EB] text-white shadow"
                  : "text-neutral-600 hover:text-black hover:bg-white"
              }`}
            >
              <User className="w-4 h-4" />
              <span>{language === "hindi" ? "वाहन चालक / गाड़ी मालिक (Transporter)" : "Transporter"}</span>
            </button>
            <button
              onClick={() => {
                setCurrentRole("shipper");
              }}
              className={`px-4 py-2 text-xs rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                currentRole === "shipper"
                  ? "bg-[#E15307] text-white shadow"
                  : "text-neutral-600 hover:text-black hover:bg-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{language === "hindi" ? "सामान भेजने वाला (Shipper)" : "Shipper"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Role banner descriptive */}
      <div className="px-5 py-4 bg-[#FCFAF0] border-b-2 border-[#EBEBE0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-[#E15307] uppercase">
            {currentRole === "transporter" ? (language === "hindi" ? "गाड़ी मालिक बाजार" : "TRUCK OWNERS MARKET") : (language === "hindi" ? "सामान भेजने वाले" : "CARGO SHIPPERS INBOX")}
          </span>
          <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>{currentRole === "transporter" ? (language === "hindi" ? "🚛 गाड़ी मालिक (Transporter) डैशबोर्ड" : "🚛 Transporter Dashboard") : (language === "hindi" ? "🌾 सामान भेजने वाला (Shipper) डैशबोर्ड" : "🌾 Cargo Shipper Dashboard")}</span>
          </h2>
        </div>

        {/* Tab Swappers */}
        <div className="flex flex-wrap gap-2 text-xs">
          {currentRole === "transporter" && (
            <>
              <button
                onClick={() => setActiveTab("browse_shipments")}
                className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                  activeTab === "browse_shipments"
                    ? "bg-[#E0EEFF] border-[#2563EB] text-[#1E40AF]"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-[#FAF9F5]"
                }`}
              >
                {language === "hindi" ? "📥 सामान ढूंढें (Available Loads)" : "📥 Available Loads"}
              </button>
              <button
                onClick={() => setActiveTab("capacities")}
                className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                  activeTab === "capacities"
                    ? "bg-[#E0EEFF] border-[#2563EB] text-[#1E40AF]"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-[#FAF9F5]"
                }`}
              >
                {language === "hindi" ? "🚛 गाड़ी पोस्ट करें (List Trucks)" : "🚛 List Trucks"}
              </button>
              <button
                onClick={() => setActiveTab("active_jobs")}
                className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                  activeTab === "active_jobs"
                    ? "bg-[#E0EEFF] border-[#2563EB] text-[#1E40AF]"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-[#FAF9F5]"
                }`}
              >
                {language === "hindi" ? "📋 सौदे और चैट (Bids & Chat)" : "📋 My Deals & Chat"}
              </button>
            </>
          )}

          {currentRole === "shipper" && (
            <>
              <button
                onClick={() => setActiveTab("my_shipments")}
                className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                  activeTab === "my_shipments"
                    ? "bg-[#FFEDE1] border-[#E15307] text-[#9A3412]"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-[#FAF9F5]"
                }`}
              >
                {language === "hindi" ? "📋 मेरा पोस्ट किया सामान" : "📋 Posted Cargo"}
              </button>
              <button
                onClick={() => setActiveTab("post_shipment")}
                className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                  activeTab === "post_shipment"
                    ? "bg-[#FFEDE1] border-[#E15307] text-[#9A3412]"
                    : "bg-[#FFB800] border-[#E15307] text-[#1e1e1e] hover:brightness-105"
                }`}
              >
                {language === "hindi" ? "➕ सामान पोस्ट करें" : "➕ Post New Cargo"}
              </button>
              <button
                onClick={() => setActiveTab("active_track")}
                className={`px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                  activeTab === "active_track"
                    ? "bg-[#FFEDE1] border-[#E15307] text-[#9A3412]"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-[#FAF9F5]"
                }`}
              >
                {language === "hindi" ? "📍 ट्रैकर और चैट" : "📍 Tracking & Chat"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 bg-[#FCFAF0]">
        
        {/* ========================================================= */}
        {/* TAB 1: BROWSE SHIPMENT REQUESTS */}
        {/* ========================================================= */}
        {currentRole === "transporter" && activeTab === "browse_shipments" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-[#FFF0BF]">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === "hindi" ? "गाड़ी कहाँ के लिए चाहिए? खोजें..." : "Search destination, route or cargo details..."}
                  className="bg-neutral-50 w-full rounded-xl pl-10 pr-4 py-2.5 border-2 border-neutral-200 text-sm font-sans focus:outline-none focus:border-[#2563EB]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-bold bg-[#E6F3FF] border border-[#BFDBFE] px-3 py-1.5 rounded-lg">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === "hindi" ? "स्मार्ट मैच ऑन! स्वचालित रूप से मिलान करेंगे!" : "Smart Match Active (Auto-matching vehicles)"}</span>
              </div>
            </div>

            {/* List of Shipments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {shipments
                .filter(s => s.status === "Posted" || s.status === "Offer Submitted" || s.status === "Awaiting Approval")
                .filter(s => 
                  s.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.goodsType.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((shipment) => {
                  const match = calculateSmartMatchScore(shipment);
                  const isAlreadyOffered = shipment.offers.some(o => o.transporterName === offerForm.transporterName);

                  return (
                    <div
                      key={shipment.id}
                      className="bg-white border-2 border-neutral-200 hover:border-[#2563EB] p-5 rounded-3xl flex flex-col justify-between gap-4 transition-all hover:translate-y-[-2px] relative shadow-sm"
                    >
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-full border border-[#BAE6FD]">
                          {shipment.status === "Posted" ? (language === "hindi" ? "नया लोड" : "New Load") : (language === "hindi" ? "बोली जारी" : "Bids Pending")}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#10B981]" />
                          {match.score}% match score
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-neutral-400 font-bold tracking-wider uppercase">Load Code ID: {shipment.id}</div>
                          <div className="text-base font-extrabold text-[#1E202B]">{shipment.goodsType}</div>
                        </div>

                        {/* Route Block */}
                        <div className="space-y-2 p-3.5 bg-[#F9FBFF] rounded-2xl border border-[#D5E6FF] text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#10B981] ring-4 ring-[#D1FAE5]"></span>
                            <span className="text-neutral-500 w-24">{language === "hindi" ? "उठाना है (From):" : "Pickup (From):"}</span>
                            <span className="text-neutral-900 font-bold">{shipment.pickup}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#2563EB] ring-4 ring-[#DBEAFE]"></span>
                            <span className="text-neutral-500 w-24">{language === "hindi" ? "पहुंचाना है (To):" : "Destination (To):"}</span>
                            <span className="text-neutral-900 font-bold">{shipment.destination}</span>
                          </div>
                        </div>

                        {/* Weight, Date, and Prominent Pricing */}
                        <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                          <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-neutral-150">
                            <span className="text-neutral-400 block text-[9px] uppercase">{language === "hindi" ? "वजन (Weight)" : "Approx Weight"}</span>
                            <span className="text-neutral-850 font-extrabold text-sm">{shipment.weight} Tons</span>
                          </div>
                          <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-neutral-150">
                            <span className="text-neutral-400 block text-[9px] uppercase">{language === "hindi" ? "तारीख (Date)" : "Target Date"}</span>
                            <span className="text-neutral-850 font-extrabold text-sm">{shipment.date}</span>
                          </div>
                          <div className="bg-[#FFFDF0] p-2.5 rounded-xl border border-orange-200">
                            <span className="text-[#B45309] block text-[9px] uppercase">{language === "hindi" ? "तय भाड़ा" : "Offered Price"}</span>
                            <span className="text-orange-850 font-black text-sm">₹{shipment.price.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">{language === "hindi" ? "जरूरी निर्देश (Instructions)" : "Special Instructions"}</span>
                          <p className="text-[11px] text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-150 font-medium italic">
                            "{shipment.specialInstructions}"
                          </p>
                        </div>
                      </div>

                      {/* Approver Details & Secured numbers */}
                      <div className="border-t border-neutral-100 pt-3.5 flex items-center justify-between">
                        <span className="text-xs text-neutral-500 font-semibold">
                          {language === "hindi" ? "पार्टी नाम" : "Shipper Party"}: <strong className="text-neutral-800">{shipment.shipperName}</strong>
                        </span>
                        
                        {isAlreadyOffered ? (
                          <span className="text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> {language === "hindi" ? "बोली लगा दी है" : "Bid Submitted"}
                          </span>
                        ) : (
                          <button
                            onClick={() => setViewingShipment(shipment)}
                            className="bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                          >
                            <span>{language === "hindi" ? "बोली लगाएं / Apply" : "Submit Offer / Apply"}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {shipments.filter(s => s.status === "Posted" || s.status === "Offer Submitted" || s.status === "Awaiting Approval").length === 0 && (
                <div className="col-span-2 text-center py-12 text-neutral-500 bg-white border-2 border-dashed border-neutral-200 rounded-3xl font-medium">
                  {language === "hindi" ? "अभी कोई सामान उपलब्ध नहीं है।" : "No cargo loads posted yet. Go to Shipper tab and post a load to test!"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: POST TRUCK DETAILS */}
        {/* ========================================================= */}
        {currentRole === "transporter" && activeTab === "capacities" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white border-2 border-[#FFD034] p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="space-y-1">
                <h4 className="font-extrabold text-[#111] text-base flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-[#2563EB]" />
                  {language === "hindi" ? "गाड़ी का रूट और क्षमता डालें (List Truck)" : "Post Truck Route & Capacity"}
                </h4>
                <p className="text-xs text-neutral-500 font-medium">
                  {language === "hindi" ? "आपकी गाड़ी कब खाली है और कहाँ जा सकती है?" : "Specify when your truck is empty and available for loads."}
                </p>
              </div>

              <form onSubmit={handlePostCapacity} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-neutral-500 mb-1">{language === "hindi" ? "अपना नाम" : "Owner/Transporter Name"}</label>
                    <input
                      type="text"
                      className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                      value={capacityForm.transporterName}
                      onChange={(e) => setCapacityForm({...capacityForm, transporterName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-1">{language === "hindi" ? "मोबाइल नंबर" : "Mobile Phone Number"}</label>
                    <input
                      type="text"
                      className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                      value={capacityForm.phone}
                      onChange={(e) => setCapacityForm({...capacityForm, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "गाड़ी अभी कहाँ है? (Current Hub Location)" : "Current Hub Location"}</label>
                  <select
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-xs font-bold"
                    value={capacityForm.location}
                    onChange={(e) => setCapacityForm({...capacityForm, location: e.target.value})}
                  >
                    <option value="New Delhi (Hub North)">New Delhi (Hub North) {language === "hindi" ? "[उत्तर भारत]" : "[North India]"}</option>
                    <option value="Mumbai (Hub West)">Mumbai (Hub West) {language === "hindi" ? "[पश्चिम भारत]" : "[West India]"}</option>
                    <option value="Bengaluru (Hub South)">Bengaluru (Hub South) {language === "hindi" ? "[दक्षिण भारत]" : "[South India]"}</option>
                    <option value="Kolkata (Hub East)">Kolkata (Hub East) {language === "hindi" ? "[पूर्व भारत]" : "[East India]"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "कहाँ तक जा सकते हैं? (Destination Route)" : "Destination Hub/Route"}</label>
                  <select
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-xs font-bold"
                    value={capacityForm.route}
                    onChange={(e) => setCapacityForm({...capacityForm, route: e.target.value})}
                  >
                    <option value="New Delhi (Hub North) → Mumbai (Hub West)">New Delhi → Mumbai Road Route</option>
                    <option value="Mumbai (Hub West) → Bengaluru (Hub South)">Mumbai → Bengaluru Road Route</option>
                    <option value="Bengaluru (Hub South) → Kolkata (Hub East)">Bengaluru → Kolkata Road Route</option>
                    <option value="New Delhi (Hub North) → Kolkata (Hub East)">New Delhi → Kolkata Road Route</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-neutral-500 mb-1">{language === "hindi" ? "वजन सीमा (Tons)" : "Weight Capacity limit (Tons)"}</label>
                    <input
                      type="number"
                      min="1"
                      className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                      value={capacityForm.capacity}
                      onChange={(e) => setCapacityForm({...capacityForm, capacity: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-1">{language === "hindi" ? "खाली होने की तारीख" : "Available Date"}</label>
                    <input
                      type="date"
                      className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-950"
                      value={capacityForm.date}
                      onChange={(e) => setCapacityForm({...capacityForm, date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "पसंदीदा समय (Preferred Slot)" : "Preferred Timing Slot"}</label>
                  <input
                    type="text"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    placeholder={language === "hindi" ? "जैसे: सुबह 8 से दोपहर 2 बजे" : "e.g. Morning 8 AM to 2 PM"}
                    value={capacityForm.timeSlots}
                    onChange={(e) => setCapacityForm({...capacityForm, timeSlots: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  🚚 {language === "hindi" ? "गाड़ी रूट पब्लिश करें" : "Publish Truck Route"}
                </button>
              </form>
            </div>

            {/* List Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs text-neutral-500 block uppercase font-bold tracking-wider">{language === "hindi" ? "सक्रिय गाड़ियां" : "Active Available Trucks"}</h4>
                <span className="text-xs bg-white border border-neutral-200 text-neutral-700 font-bold px-2 py-1 rounded-full">{capacities.length} trucks online</span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {capacities.map((cap) => (
                  <div key={cap.id} className="bg-white border-2 border-neutral-200 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded">{language === "hindi" ? "गाड़ी" : "Truck"} #{cap.id}</span>
                        <span className="text-xs font-bold text-neutral-700"> {cap.transporterName}</span>
                      </div>
                      <div className="text-sm font-extrabold text-neutral-850">{cap.route}</div>
                      <div className="text-xs text-neutral-500 font-medium flex flex-wrap gap-2">
                        <span>📍 Location: {cap.location}</span>
                        <span>•</span>
                        <span>📅 Available: {cap.date} ({cap.timeSlots})</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-neutral-400 block font-bold">MAX LOAD</span>
                      <span className="text-sm font-black text-rose-600">{cap.capacity} Tons capacity</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* TAB 3: TRANSPORTER MY BIDS (MERA SAUDA) */}
        {/* ========================================================= */}
        {currentRole === "transporter" && activeTab === "active_jobs" && (
          <div className="space-y-5">
            <h4 className="text-xs text-neutral-500 uppercase font-black tracking-wider">
              {language === "hindi" ? "सत्यापन डैशबोर्ड:" : "Verification dashboard for:"} {offerForm.transporterName}
            </h4>

            <div className="grid grid-cols-1 gap-5">
              {shipments
                .filter(s => s.offers.some(o => o.transporterName === offerForm.transporterName))
                .map((shipment) => {
                  const offer = shipment.offers.find(o => o.transporterName === offerForm.transporterName)!;
                  const isApproved = shipment.status === "Approved" || shipment.status === "In Transit" || shipment.status === "Delivered";

                  return (
                    <div key={shipment.id} className="bg-white border-2 border-neutral-200 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between gap-5">
                      <div className="space-y-4 flex-1">
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold bg-[#FAF9F5] text-neutral-500 border border-neutral-200 px-3 py-1 rounded-full">{language === "hindi" ? "सामान कोड नंबर:" : "Cargo No:"} {shipment.id}</span>
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1 ${
                            shipment.status === "Approved" ? "bg-emerald-100 text-emerald-800 border border-emerald-250 animate-bounce" :
                            shipment.status === "In Transit" ? "bg-[#3B82F6] text-white animate-pulse" :
                            shipment.status === "Delivered" ? "bg-neutral-100 text-neutral-600" :
                            "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {language === "hindi" ? "स्थिति:" : "Status:"} {shipment.status === "Posted" ? (language === "hindi" ? "प्रस्तावित" : "Offer Applied") : shipment.status}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-extrabold text-base text-[#111]">{shipment.goodsType} ({shipment.weight} Tons)</h5>
                          <p className="text-xs text-neutral-500 font-bold">{shipment.pickup} → {shipment.destination}</p>
                        </div>

                        {/* Bid terms submitted */}
                        <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-[#FFD034] space-y-2 text-xs font-semibold text-neutral-700">
                          <span className="text-[#E15307] text-[10px] block uppercase font-extrabold tracking-wider">{language === "hindi" ? "आपकी बोली और शर्ते (Your Bid Conditions)" : "Your Bid Conditions"}</span>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <span className="text-neutral-400 block text-[9px]">{language === "hindi" ? "उठाने का समय:" : "Pickup Time:"}</span>
                              <span className="text-neutral-900 font-bold">{offer.pickupTime}</span>
                            </div>
                            <div>
                              <span className="text-neutral-400 block text-[9px]">{language === "hindi" ? "समय प्रतिबद्धता:" : "ETA Commitment:"}</span>
                              <span className="text-neutral-900 font-bold">{offer.deliveryCommitment}</span>
                            </div>
                            <div>
                              <span className="text-neutral-400 block text-[9px]">{language === "hindi" ? "प्रस्तावित भाड़ा:" : "Offer Price / Tariff:"}</span>
                              <span className="text-[#E15307] font-extrabold text-xs">₹{offer.extraCharges}</span>
                            </div>
                            <div>
                              <span className="text-neutral-400 block text-[9px]">{language === "hindi" ? "आवंटित गाड़ी:" : "Truck Allocated:"}</span>
                              <span className="text-neutral-900 block truncate font-bold" title={offer.truckDetails}>{offer.truckDetails}</span>
                            </div>
                          </div>
                        </div>

                        {offer.status === "Counter-Offer" && (
                          <div className="bg-[#FFFDF4] border-2 border-amber-400 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
                            <div>
                              <span className="text-amber-800 font-extrabold text-[#963F01] text-xs">⚠️ {language === "hindi" ? "भाड़े का प्रस्ताव आया है (Counter-Offer Received)" : "Counter-Offer Received"}</span>
                              <p className="text-xs text-neutral-850 mt-1 font-bold">
                                {language === "hindi" 
                                  ? `शिपर ने आपके ₹${offer.extraCharges} के बजाय एक काउंटर मूल्य प्रस्तावित किया है: ₹${offer.counterPrice}`
                                  : `Shipper has proposed a Counter Price of: ₹${offer.counterPrice} instead of your ₹${offer.extraCharges} charges.`}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                onUpdateOfferStatus(shipment.id, offer.id, "Approved");
                                alert(language === "hindi" ? `🎉 मुबारक हो! आपने ₹${offer.counterPrice} का नया भाड़ा स्वीकार कर लिया है!` : `🎉 Congratulations! You accepted the counter-offer of ₹${offer.counterPrice}! Deal is locked.`);
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer"
                            >
                              {language === "hindi" ? "स्वीकार करें और डील पक्की करें ✅" : "Accept Proposed Price & Lock Deal ✅"}
                            </button>
                          </div>
                        )}

                        {/* Approved Contact Reveal section (TRUST UNLOCKED) */}
                        <div className="bg-[#EFF6FF] border-2 border-[#BFDBFE] p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wide">📞 {language === "hindi" ? "शिपर का असली फ़ोन नंबर (Contact)" : "Shipper Phone Number & Contact Details"}</span>
                            {isApproved ? (
                              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                <span className="text-[#2563EB] font-black text-sm flex items-center gap-1 bg-white border border-[#93C5FD] px-3 py-1 rounded-xl">
                                  <Phone className="w-4 h-4 text-emerald-500 mr-0.5" /> {shipment.shipperPhone}
                                </span>
                                <span className="text-neutral-500 text-xs font-bold">({shipment.shipperName})</span>
                                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-full">{language === "hindi" ? "स्वीकृत और जुड़े हुए ✅" : "APPROVED & CONNECTED ✅"}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-neutral-600 flex items-center gap-1.5 mt-1 font-bold">
                                <span className="text-amber-600 animate-pulse">🔒 {language === "hindi" ? "फ़ोन नंबर अदृश्य (सुरक्षित है)" : "PHONE NUMBER SECURELY HIDDEN."}</span>
                                <span>{language === "hindi" ? "शिपर के अप्रूवल के बाद नंबर दिखाई देगा।" : "Will be unmasked after the Shipper approves your bid offer."}</span>
                              </div>
                            )}
                          </div>

                          {isApproved && (
                            <button
                              onClick={() => {
                                setCurrentRole("transporter");
                                setActiveTab("active_jobs");
                              }}
                              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl flex items-center gap-1 text-xs shadow-md shadow-blue-500/10 cursor-pointer"
                            >
                              <MessageSquare className="w-4.5 h-4.5 mr-0" />
                              <span>{language === "hindi" ? "नीचे चैट करें" : "Direct Chat Box Below"}</span>
                            </button>
                          )}
                        </div>

                      </div>

                      {/* Side Actions (Vessel status updates) */}
                      <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-neutral-200 pt-4 md:pt-0 md:pl-5 shrink-0 min-w-[200px] text-xs">
                        <div className="text-right w-full md:w-auto">
                          <span className="text-neutral-400 block font-bold text-[9px] uppercase">{language === "hindi" ? "बोली स्थिति" : "Bid Status"}</span>
                          <span className={`font-extrabold text-xs block mt-1 ${
                            offer.status === "Approved" ? "text-emerald-600" :
                            offer.status === "Rejected" ? "text-red-500 font-normal" : "text-amber-600 animate-pulse"
                          }`}>
                            • {offer.status === "Approved" ? (language === "hindi" ? "सौदा पक्का! (Approved)" : "Approved!") : offer.status === "Rejected" ? (language === "hindi" ? "अस्वीकृत (Rejected)" : "Rejected") : (language === "hindi" ? "शिपर समीक्षा कर रहे हैं" : "Awaiting Shipper review...")}
                          </span>
                        </div>

                        {/* Truck transit lifecycle button updates */}
                        {isApproved && (
                          <div className="w-full space-y-2 mt-4">
                            {shipment.status === "Approved" && (
                              <button
                                onClick={() => onUpdateShipmentStatus(shipment.id, "In Transit")}
                                className="w-full py-3 bg-[#E15307] hover:bg-orange-700 text-white font-black rounded-xl uppercase tracking-wider text-xs shadow-md cursor-pointer"
                              >
                                {language === "hindi" ? "गाड़ी रवाना हुई 🛫 (Start Transit)" : "Start Transit 🛫"}
                              </button>
                            )}

                            {shipment.status === "In Transit" && (
                              <button
                                onClick={() => onUpdateShipmentStatus(shipment.id, "Delivered")}
                                className="w-full py-3 bg-[#10B981] hover:bg-emerald-600 text-white font-black rounded-xl uppercase tracking-wider text-xs shadow-md cursor-pointer"
                              >
                                {language === "hindi" ? "सामान पहुँच गया ✅ (Mark Delivered)" : "Mark Delivered ✅"}
                              </button>
                            )}

                            {shipment.status === "Delivered" && (
                              <span className="text-neutral-500 text-center font-bold font-mono bg-neutral-100 py-2 border rounded-xl block text-[10px]">
                                DELIVERY COMPLETED 🎉
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {shipments.filter(s => s.offers.some(o => o.transporterName === offerForm.transporterName)).length === 0 && (
                <div className="text-center py-10 bg-white border border-neutral-250 rounded-2xl text-neutral-500 font-semibold text-xs">
                  {language === "hindi" ? "आपने अभी तक किसी सामान पर बोली नहीं लगाई है। loads देखें!" : "You have not applied to any cargo loads yet. Go to cargo requests to apply."}
                </div>
              )}
            </div>

            {/* Simulated chat section shown below */}
            {shipments.some(s => s.offers.some(o => o.transporterName === offerForm.transporterName) && (s.status === "Approved" || s.status === "In Transit" || s.status === "Delivered")) && (
              <div className="mt-8 border-2 border-[#FFD034] bg-[#FFFDF5] p-5 rounded-3xl shadow-sm">
                <h4 className="font-extrabold text-base text-neutral-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[#2563EB] animate-bounce" />
                  Real-time direct chat room (Bina network charges ke)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-4 max-h-56 overflow-y-auto divide-y divide-neutral-100 bg-white rounded-2xl border-2 border-neutral-200">
                    {shipments
                      .filter(s => s.offers.some(o => o.transporterName === offerForm.transporterName) && (s.status === "Approved" || s.status === "In Transit" || s.status === "Delivered"))
                      .map((s) => (
                        <div
                          key={s.id}
                          className="w-full text-left p-3.5 hover:bg-neutral-50 flex justify-between items-center text-xs font-semibold cursor-pointer border-l-4 border-[#2563EB]"
                        >
                          <div>
                            <div className="font-bold text-neutral-900">{s.id} - {s.goodsType}</div>
                            <div className="text-[10px] text-neutral-500 font-bold">Farmer: {s.shipperName}</div>
                          </div>
                          <span className="inline-block w-3 h-3 rounded-full bg-[#10B981] animate-pulse"></span>
                        </div>
                      ))}
                  </div>

                  <div className="md:col-span-8 flex flex-col h-72 bg-white border-2 border-neutral-200 rounded-2xl p-4 justify-between">
                    {(() => {
                      const activeApprovedShipment = shipments.find(s => s.offers.some(o => o.transporterName === offerForm.transporterName) && (s.status === "Approved" || s.status === "In Transit" || s.status === "Delivered"));
                      if (!activeApprovedShipment) return null;
                      const msgHistory = chats[activeApprovedShipment.id] || [];

                      return (
                        <>
                          <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                            <div className="text-center text-[10px] text-neutral-400 font-bold tracking-wide leading-normal bg-neutral-50 p-2 border rounded-xl">
                              🔒 AAPKA DIRECT CONNECTION CHALU HAI. SAMAAN DETAILS PAR CHAT KAREIN.
                            </div>
                            {msgHistory.map((msg) => {
                              const isMe = msg.sender === "Transporter";
                              return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed max-w-xs ${
                                    isMe ? 'bg-[#2563EB] text-white rounded-tr-none shadow-sm' : 'bg-[#F2F4F7] text-neutral-800 rounded-tl-none border-2 border-[#E4E7EC]'
                                  }`}>
                                    {msg.text}
                                  </div>
                                  <span className="text-[8px] text-neutral-400 font-bold mt-1 uppercase">{msg.timestamp} • {msg.sender === "Transporter" ? "Main" : "Shipper Party"}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex gap-2 border-t-2 border-neutral-100 pt-3 mt-3">
                            <input
                              type="text"
                              placeholder="Message likhein (e.g., Gaddi bypass par nikal chuki hai)..."
                              className="flex-1 bg-[#F9FAFB] border-2 border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-[#2563EB]"
                              value={chatMessageInput}
                              onChange={(e) => setChatMessageInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && chatMessageInput.trim()) {
                                  onSendChatMessage(activeApprovedShipment.id, "Transporter", chatMessageInput);
                                  setChatMessageInput("");
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (chatMessageInput.trim()) {
                                  onSendChatMessage(activeApprovedShipment.id, "Transporter", chatMessageInput);
                                  setChatMessageInput("");
                                }
                              }}
                              className="px-4 py-2.5 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-neutral-800 flex items-center mr-0 cursor-pointer"
                            >
                              <Send className="w-4 h-4 mr-0" />
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SHIPPER POST LOAD FORM (SAMAAN POST KAREIN) */}
        {/* ========================================================= */}
        {currentRole === "shipper" && activeTab === "post_shipment" && (
          <div className="max-w-2xl mx-auto bg-white border-2 border-[#E15307] p-6 rounded-3xl space-y-4 shadow-sm text-neutral-800">
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-[#111] flex items-center gap-1.5 uppercase tracking-tight">
                <PlusCircle className="w-5 h-5 text-[#E15307]" />
                {language === "hindi" ? "नया सामान भेजने के लिए गाड़ी बुलाएं (Post Load)" : "Call Vehicle for New Cargo (Post Load)"}
              </h4>
              <p className="text-xs text-neutral-500 font-medium">
                {language === "hindi" ? "अपना रूट और सामान का वजन डालें। गाड़ी मालिक सीधे संपर्क करेंगे।" : "Specify route and weight. Transporters will contact you directly."}
              </p>
            </div>

            <form onSubmit={handlePostShipment} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "अपना नाम / व्यापारिक नाम" : "Your Name / Wholesaler Business Name"}</label>
                  <input
                    type="text"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={shipmentForm.shipperName}
                    onChange={(e) => setShipmentForm({...shipmentForm, shipperName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "मोबाइल नंबर (सुरक्षित)" : "Mobile number (Secure / Surakshit)"}</label>
                  <input
                    type="text"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={shipmentForm.shipperPhone}
                    onChange={(e) => setShipmentForm({...shipmentForm, shipperPhone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "कहाँ से लोड उठाना है? (Pickup Location)" : "Pickup Location (Loading Point)"}</label>
                  <select
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-xs font-bold"
                    value={shipmentForm.pickup}
                    onChange={(e) => setShipmentForm({...shipmentForm, pickup: e.target.value})}
                  >
                    <option value="New Delhi (Hub North)">New Delhi (Hub North) {language === "hindi" ? "[उत्तरी भारत]" : "[North India]"}</option>
                    <option value="Mumbai (Hub West)">Mumbai (Hub West) {language === "hindi" ? "[पश्चिमी भारत]" : "[West India]"}</option>
                    <option value="Bengaluru (Hub South)">Bengaluru (Hub South) {language === "hindi" ? "[दक्षिणी भारत]" : "[South India]"}</option>
                    <option value="Kolkata (Hub East)">Kolkata (Hub East) {language === "hindi" ? "[पूर्वी भारत]" : "[East India]"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "कहाँ पहुँचाना है? (Delivery Destination)" : "Delivery Destination (Unloading Point)"}</label>
                  <select
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-xs font-bold"
                    value={shipmentForm.destination}
                    onChange={(e) => setShipmentForm({...shipmentForm, destination: e.target.value})}
                  >
                    <option value="New Delhi (Hub North)">New Delhi (Hub North)</option>
                    <option value="Mumbai (Hub West)">Mumbai (Hub West)</option>
                    <option value="Bengaluru (Hub South)">Bengaluru (Hub South)</option>
                    <option value="Kolkata (Hub East)">Kolkata (Hub East)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div className="col-span-2">
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "सामान का नाम (Goods details)" : "Goods Type & Description"}</label>
                  <input
                    type="text"
                    placeholder={language === "hindi" ? "जैसे: आलू की बोरियां, दवाइयां, इलेक्ट्रॉनिक सामान..." : "e.g. Potato sacks, pharmaceuticals, electronics..."}
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={shipmentForm.goodsType}
                    onChange={(e) => setShipmentForm({...shipmentForm, goodsType: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "वजन (Weight in Tons)" : "Weight (Metric Tons)"}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={shipmentForm.weight}
                    onChange={(e) => setShipmentForm({...shipmentForm, weight: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "भेजने की तारीख (Date)" : "Scheduled Loading Date"}</label>
                  <input
                    type="date"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={shipmentForm.date}
                    onChange={(e) => setShipmentForm({...shipmentForm, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "पसंदीदा समय स्लॉट (Time)" : "Preferred Loading Time"}</label>
                  <input
                    type="time"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={shipmentForm.time}
                    onChange={(e) => setShipmentForm({...shipmentForm, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1 font-bold text-black">{language === "hindi" ? "आपके द्वारा तय किया गया भाड़ा (₹) *" : "Your Proposed Base Fare / Price (₹) *"}</label>
                <input
                  type="number"
                  className="bg-neutral-50 border-2 border-[#E15307]/40 rounded-xl px-3 py-2 w-full text-neutral-940 font-black text-sm"
                  placeholder="e.g. 15000"
                  value={shipmentForm.price}
                  onChange={(e) => setShipmentForm({...shipmentForm, price: Number(e.target.value)})}
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{language === "hindi" ? "गाड़ी वाले के लिए कोई विशेष निर्देश संदेश" : "Special Instructions for Transporter"}</label>
                <textarea
                  rows={2}
                  className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900 font-medium"
                  placeholder="e.g. Double trip tarpaulin required..."
                  value={shipmentForm.specialInstructions}
                  onChange={(e) => setShipmentForm({...shipmentForm, specialInstructions: e.target.value})}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#E15307] hover:bg-orange-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                📢 {language === "hindi" ? "अपना लोड पोस्ट करें" : "Publish Load Request"}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: MY SHIPMENT REQUESTS (SHIPPER LOAD DASH) */}
        {/* ========================================================= */}
        {currentRole === "shipper" && activeTab === "my_shipments" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-neutral-200 pb-3">
              <h4 className="text-xs text-neutral-500 uppercase font-black tracking-wider">{language === "hindi" ? "आपके पोस्ट किए गए सामान की आवश्यकताएं" : "Your Posted Cargo Requirements"}</h4>
              <button
                onClick={() => setActiveTab("post_shipment")}
                className="text-xs bg-[#E15307] hover:bg-orange-700 font-extrabold px-4 py-2.5 rounded-xl text-white flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 mr-0" /> {language === "hindi" ? "और नया सामान पोस्ट करें" : "Post More Cargo"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {shipments.map((s) => {
                const hasOffers = s.offers.length > 0;
                const isUnderOffer = s.status === "Offer Submitted";
                const isApproved = s.status === "Approved" || s.status === "In Transit" || s.status === "Delivered";

                return (
                  <div key={s.id} className="bg-white border-2 border-neutral-200 p-5 rounded-3xl shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      
                      <div className="space-y-2 flex-1 font-sans text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] text-neutral-550 font-bold bg-[#FAF9F5] px-2.5 py-0.5 border border-neutral-250 rounded">Cargo ID: {s.id}</span>
                          <span className={`px-2.5 py-1 rounded-full font-extrabold text-[9px] uppercase ${
                            s.status === "Approved" ? "bg-emerald-100 text-[#047857] border border-emerald-200" :
                            s.status === "In Transit" ? "bg-blue-100 text-blue-700 border border-blue-200 animate-pulse" :
                            s.status === "Delivered" ? "bg-neutral-100 text-neutral-600" :
                            s.status === "Offer Submitted" ? "bg-amber-100 text-[#D97706] border border-amber-300 animate-pulse" :
                            "bg-[#FAF9F5] text-neutral-400"
                          }`}>
                            📍 Status: {s.status === "Posted" ? (language === "hindi" ? "गाड़ी ढूंढ रहे हैं" : "Searching Trucks") : s.status}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-extrabold text-base text-neutral-900">{s.goodsType}</h5>
                          <p className="text-xs text-neutral-500 font-bold">🚛 {language === "hindi" ? "अनुमानित वजन:" : "Approximate Weight:"} {s.weight} Tons</p>
                          <p className="text-xs text-blue-700 font-bold">📍 {language === "hindi" ? "मार्ग:" : "Route:"} {s.pickup} → {s.destination}</p>
                          <p className="text-[10px] text-neutral-400">{language === "hindi" ? "निर्धारित तिथि:" : "Scheduled Date:"} {s.date} ({language === "hindi" ? "समय:" : "Slot:"} {s.time})</p>
                        </div>
                      </div>

                      {/* Right column: action triggers */}
                      <div className="flex flex-col justify-between items-end shrink-0 min-w-[200px] border-t md:border-t-0 md:border-l border-neutral-200 pt-3 md:pt-0 md:pl-5 font-sans">
                        <div className="text-right w-full md:w-auto">
                          <span className="text-[9px] text-[#E15307] font-extrabold block uppercase tracking-wider">{language === "hindi" ? "आए हुए प्रस्ताव (Bids)" : "Incoming Bids (Gaddi Owners)"}</span>
                          <span className="text-base font-black text-neutral-850">{s.offers.length} {language === "hindi" ? "बोली प्राप्त हुई" : "Bids Received"}</span>
                        </div>

                        {hasOffers ? (
                          <button
                            onClick={() => setViewingOffersForShipment(s)}
                            className="w-full md:w-auto px-4 py-2.5 bg-[#E15307] hover:bg-orange-700 rounded-xl text-white font-extrabold text-xs mt-3 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {language === "hindi" ? "प्रस्तावों की समीक्षा करें" : "Review & Accept Offers"} ({s.offers.length}) ➔
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-bold italic mt-4">
                            {language === "hindi" ? "गाड़ी वाले अभी प्रस्ताव दे रहे हैं..." : "Transporters are calculating conditions & bidding..."}
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}

              {shipments.length === 0 && (
                <div className="text-center py-12 bg-white border border-neutral-200 rounded-2xl text-neutral-400 font-bold italic">
                  {language === "hindi" ? "आपने अभी तक कोई सामान पोस्ट नहीं किया है।" : "Empty cargo request history! Click Post New Cargo to list one."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: SHIPPER ACTIVE TRACKER & PHONE REVEAL */}
        {/* ========================================================= */}
        {currentRole === "shipper" && activeTab === "active_track" && (
          <div className="space-y-4">
            <h4 className="text-xs text-neutral-500 uppercase font-black tracking-wider">
              {language === "hindi" ? "स्वीकृत गाड़ी सौदे / फ़ोन नंबर एवं चैट रूम" : "Approved Deals / Verified Phone Contacts & Chat Room"}
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {shipments
                .filter(s => s.status === "Approved" || s.status === "In Transit" || s.status === "Delivered")
                .map((shipment) => {
                  const approvedOffer = shipment.offers.find(o => o.status === "Approved")!;
                  if (!approvedOffer) return null;

                  return (
                    <div key={shipment.id} className="bg-white p-5 border-2 border-neutral-200 rounded-3xl space-y-4 shadow-sm text-xs font-semibold text-neutral-700">
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-neutral-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">Cargo ID: {shipment.id}</span>
                            <span className="text-[11px] text-[#2563EB] font-extrabold">{language === "hindi" ? "🤝 गाड़ी मालिक:" : "🤝 Secured with:"} {approvedOffer.transporterName}</span>
                          </div>
                          <p className="text-neutral-500 mt-1">{language === "hindi" ? "गाड़ी का विवरण:" : "Truck details / Model:"} {approvedOffer.truckDetails}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold rounded-full uppercase text-[9px]">
                          {language === "hindi" ? "🤝 गाड़ी सुनिश्चित (सौदा पक्का)" : "🤝 TRANSPORTER SECURED"}
                        </span>
                      </div>

                      {/* Route specs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-[#FAF9F5] p-3 rounded-2xl border">
                          <span className="text-neutral-400 block text-[9px] uppercase">{language === "hindi" ? "गाड़ी वाले का फ़ोन नंबर" : "Verified Transporter Contact"}</span>
                          <span className="text-neutral-900 font-black text-sm flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-4 h-4 text-emerald-500 mr-0.5" /> {approvedOffer.transporterPhone}
                          </span>
                        </div>
                        <div className="bg-[#FAF9F5] p-3 rounded-2xl border">
                          <span className="text-neutral-400 block text-[9px] uppercase">{language === "hindi" ? "तय भाड़ा" : "Agreed Price / Charges"}</span>
                          <span className="text-[#E15307] font-black text-sm mt-0.5 block">₹{approvedOffer.extraCharges}</span>
                        </div>
                        <div className="bg-[#FAF9F5] p-3 rounded-2xl border">
                          <span className="text-neutral-400 block text-[9px] uppercase">{language === "hindi" ? "वर्तमान पारगमन स्थिति" : "Current Transit Status"}</span>
                          <span className="text-blue-700 font-black text-xs block mt-0.5">{shipment.status}</span>
                        </div>
                      </div>

                      {/* Message history section for Shippers */}
                      <div className="border-t-2 border-neutral-100 pt-4">
                        <h5 className="font-extrabold text-sm mb-3 text-neutral-900 flex items-center gap-1.5">
                          <MessageSquare className="w-4.5 h-4.5 text-[#2563EB]" />
                          {language === "hindi" ? "सीधा संदेश बॉक्स (Chat Box)" : "Logix Direct Chat Box"}
                        </h5>
                        <div className="bg-neutral-50 border rounded-2xl p-4 h-56 flex flex-col justify-between">
                          <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                            {(chats[shipment.id] || []).map((msg) => {
                              const isMe = msg.sender === "Shipper";
                              return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed max-w-sm ${
                                    isMe ? 'bg-[#E15307] text-white rounded-tr-none shadow-sm' : 'bg-white text-neutral-800 rounded-tl-none border-2 border-neutral-200'
                                  }`}>
                                    {msg.text}
                                  </div>
                                  <span className="text-[8px] text-neutral-400 tracking-wider font-extrabold mt-1">
                                    {msg.timestamp} • {msg.sender === "Shipper" ? (language === "hindi" ? "मैं (Mera Message)" : "Me") : (language === "hindi" ? "गाड़ी चालक" : "Transporter/Driver")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex gap-2 border-t pt-3 mt-3">
                            <input
                              type="text"
                              placeholder={language === "hindi" ? "स्थिति सिंक करने के लिए संदेश टाइप करें..." : "Type transaction update or status sync..."}
                              className="flex-1 bg-white border-2 border-neutral-200 rounded-xl px-4 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#E15307]"
                              value={chatMessageInput}
                              onChange={(e) => setChatMessageInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && chatMessageInput.trim()) {
                                  onSendChatMessage(shipment.id, "Shipper", chatMessageInput);
                                  setChatMessageInput("");
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                if (chatMessageInput.trim()) {
                                  onSendChatMessage(shipment.id, "Shipper", chatMessageInput);
                                  setChatMessageInput("");
                                }
                              }}
                              className="px-4 py-2 bg-[#E15307] text-white rounded-xl hover:bg-orange-700 flex items-center mr-0 cursor-pointer"
                            >
                              <Send className="w-4 h-4 mr-0" />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}

              {shipments.filter(s => s.status === "Approved" || s.status === "In Transit" || s.status === "Delivered").length === 0 && (
                <div className="text-center py-10 bg-white border border-neutral-250 rounded-2xl text-neutral-400 font-bold italic">
                  {language === "hindi" ? "अभी कोई सक्रिय सौदा या चैट उपलब्ध नहीं है। कृपया पहले बोली स्वीकार करें!" : "No active deals or chats. Please accept a transporter bid first to open the direct dialer & workspace!"}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* DIALOG 1: TRANSPORTER APPLY OFFER (Boli Lagayein Modal) */}
      {/* ========================================================= */}
      {viewingShipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white border-4 border-[#2563EB] rounded-3xl max-w-lg w-full p-6 text-neutral-800 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-[#111] text-base flex items-center gap-1.5 uppercase tracking-wide">
                <Truck className="w-5 h-5 text-[#2563EB]" />
                {language === "hindi" ? "सामान पर बोली लगाएं (Apply Conditions Bids)" : "Submit Bid/Offer on Cargo Requirement"}
              </h3>
              <button onClick={() => setViewingShipment(null)} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FFFDF3] border-2 border-[#FFD034] p-4 rounded-2xl text-xs font-semibold leading-relaxed">
              <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">{language === "hindi" ? "सामान की आवश्यकता विवरण" : "Cargo Requirement Details"}</p>
              <p className="text-neutral-900 font-extrabold text-sm">{viewingShipment.goodsType} ({viewingShipment.weight} Tons)</p>
              <p className="text-blue-800">{language === "hindi" ? "मार्ग:" : "Route:"} {viewingShipment.pickup} ➜ {viewingShipment.destination}</p>
              <p className="text-neutral-600 font-normal mt-1.5">{language === "hindi" ? "विशेष निर्देश:" : "Instructions:"} "{viewingShipment.specialInstructions}"</p>
            </div>

            <form onSubmit={(e) => handleSubmitOffer(e, viewingShipment.id)} className="space-y-3.5 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "ट्रांसपोर्ट कंपनी / वाहन चालक का नाम" : "Transport Company / Driver's Name"}</label>
                  <input
                    type="text"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={offerForm.transporterName}
                    onChange={(e) => setOfferForm({...offerForm, transporterName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "असली मोबाइल नंबर" : "Direct Phone Mobile Number"}</label>
                  <input
                    type="text"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={offerForm.transporterPhone}
                    onChange={(e) => setOfferForm({...offerForm, transporterPhone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{language === "hindi" ? "गाड़ी / ट्रक का नाम और विवरण (TATA/Leyland model)" : "Vehicle / Truck Name and specs (TATA/Leyland model)"}</label>
                <input
                  type="text"
                  className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                  value={offerForm.truckDetails}
                  onChange={(e) => setOfferForm({...offerForm, truckDetails: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "कब गाड़ी उठा सकती है? (Pickup)" : "Pickup Timing Availability"}</label>
                  <input
                    type="text"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={offerForm.pickupTime}
                    onChange={(e) => setOfferForm({...offerForm, pickupTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 mb-1">{language === "hindi" ? "कुल भाड़ा (₹)" : "Proposed Tariff (₹)"}</label>
                  <input
                    type="number"
                    className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                    value={offerForm.extraCharges}
                    onChange={(e) => setOfferForm({...offerForm, extraCharges: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{language === "hindi" ? "आने/वितरण का समय प्रतिबद्धता (ETA hours)" : "Arriving/Delivery Commitment details (ETA hours)"}</label>
                <input
                  type="text"
                  className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                  value={offerForm.deliveryCommitment}
                  onChange={(e) => setOfferForm({...offerForm, deliveryCommitment: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">{language === "hindi" ? "कोई विशेष बात/एक्स्ट्रा नोट (e.g. तिरपाल लोडेड है)" : "Special Remarks / Notes (e.g. tarpaulin sheet loaded)"}</label>
                <textarea
                  rows={2}
                  className="bg-neutral-50 border-2 border-neutral-200 rounded-xl px-3 py-2 w-full text-neutral-900"
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm({...offerForm, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-2 justify-end border-t pt-3 mt-4">
                <button
                  type="button"
                  onClick={() => setViewingShipment(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-neutral-50"
                >
                  {language === "hindi" ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold rounded-xl animate-bounce"
                >
                  {language === "hindi" ? "बोली की पुष्टि करें (Launch Bid)" : "Confirm Bid & Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DIALOG 2: SHIPPER REVIEWS DEALS (Accept bids Modal) */}
      {/* ========================================================= */}
      {viewingOffersForShipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white border-4 border-[#E15307] rounded-3xl max-w-xl w-full p-6 text-neutral-800 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-neutral-900 flex items-center gap-1.5 uppercase">
                <BadgeCheckIcon className="w-5 h-5 text-[#E15307]" />
                {language === "hindi" ? "प्राप्त बोलियों की समीक्षा" : "Review Transporter Bids"} ({viewingOffersForShipment.offers.length})
              </h3>
              <button onClick={() => setViewingOffersForShipment(null)} className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF9F5] p-3 rounded-2xl border text-xs font-semibold">
              <p className="text-neutral-400 block text-[9px] uppercase">{language === "hindi" ? "मेरे सामान के लोडिंग विवरण" : "My Cargo Loading details"}</p>
              <p className="text-yellow-905">{viewingOffersForShipment.goodsType} ({viewingOffersForShipment.weight} Tons) • {viewingOffersForShipment.pickup} ➜ {viewingOffersForShipment.destination}</p>
            </div>

            <div className="space-y-4">
              {viewingOffersForShipment.offers.map((offer) => {
                const counterAmt = counterPriceMap[offer.id] || offeringCounterPlaceholderPrice(offer.extraCharges);
                return (
                  <div key={offer.id} className="bg-white border-2 border-[#FFD034] p-4 rounded-2xl text-xs space-y-3 font-semibold relative text-neutral-800">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="text-neutral-400 text-[9px] block">{language === "hindi" ? "गाड़ी मालिक का नाम" : "Gaddi Owner / Transporter Name"}</span>
                        <span className="text-neutral-900 text-sm font-black">{offer.transporterName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-400 text-[9px] block">{language === "hindi" ? "फ़ोन नंबर" : "Phone number"}</span>
                        <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 border rounded-lg font-bold">🔒 {language === "hindi" ? "सुरक्षित फ़ोन" : "Secure phone"}</span>
                      </div>
                    </div>

                    <div className="bg-[#FAF9F5] p-3 rounded-xl border grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-neutral-400 block text-[9px]">{language === "hindi" ? "गाड़ी मॉडल:" : "Truck Model:"}</span>
                        <span className="text-neutral-800 font-extrabold">{offer.truckDetails}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[9px]">Pickup Hours:</span>
                        <span className="text-neutral-800 font-extrabold">{offer.pickupTime}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[9px]">Carrier ETA:</span>
                        <span className="text-neutral-800 font-extrabold">{offer.deliveryCommitment}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[9px]">{language === "hindi" ? "भाड़ा (₹):" : "Charges (₹):"}</span>
                        <span className="text-[#E15307] font-black">₹{offer.extraCharges}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-600 font-medium bg-[#FFFDF5] p-2 rounded border">
                      {language === "hindi" ? "विशेष सूचना:" : "Notes:"} "{offer.notes}"
                    </div>

                    {/* Deal accept and counter triggers */}
                    <div className="border-t pt-3 flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder={language === "hindi" ? "काउंटर रेट..." : "Tariff Counter..."}
                          className="bg-neutral-50 border rounded-lg px-2 py-1 w-28 text-xs focus:outline-none focus:border-[#E15307]"
                          value={counterPriceMap[offer.id] || ""}
                          onChange={(e) => setCounterPriceMap({...counterPriceMap, [offer.id]: Number(e.target.value)})}
                        />
                        <button
                          onClick={() => {
                            onUpdateOfferStatus(viewingOffersForShipment.id, offer.id, "Counter-Offer", counterAmt);
                            setViewingOffersForShipment(null);
                            alert(language === "hindi" ? `₹${counterAmt} का काउंटर ऑफर डायरेक्ट भेज दिया गया है!` : `Counter tariff offer of ₹${counterAmt} sent directly to the transporter!`);
                          }}
                          className="bg-[#FFEFA6] hover:bg-[#FFD034] text-neutral-800 font-extrabold px-3 py-1.5 rounded-lg border border-yellow-400"
                        >
                          {language === "hindi" ? "ऑफर भेजें" : "Send Counter"}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onUpdateOfferStatus(viewingOffersForShipment.id, offer.id, "Rejected");
                            setViewingOffersForShipment(null);
                            alert(language === "hindi" ? "प्रस्ताव अस्वीकार कर दिया गया।" : "Bid rejected successfully.");
                          }}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border border-rose-250"
                        >
                          {language === "hindi" ? "नामंजूर" : "Decline"}
                        </button>
                        <button
                          onClick={() => {
                            onUpdateOfferStatus(viewingOffersForShipment.id, offer.id, "Approved");
                            setViewingOffersForShipment(null);
                            alert(language === "hindi" ? `🎉 मुबारक हो! सौदा पक्का हुआ! गाड़ी सुनिश्चित कर दी गई है।` : `🎉 Mubarak Ho! Sauda pakka hua! Samaan status sets to Approved. Phone details verified and unmasked.`);
                          }}
                          className="px-4 py-1.5 bg-[#E15307] hover:bg-orange-700 text-white font-extrabold rounded-lg shadow-sm"
                        >
                          {language === "hindi" ? "स्वीकार करें ✅" : "Accept & Reveal ✅"}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingOffersForShipment(null)}
                className="px-4 py-2 border rounded-xl"
              >
                {language === "hindi" ? "बंद करें" : "Close Window"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Helpers
function BadgeCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function offeringCounterPlaceholderPrice(basePrice: number): number {
  return Math.max(0, Math.floor(basePrice * 0.9));
}
