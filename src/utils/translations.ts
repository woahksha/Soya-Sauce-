// Bilingual Dictionary for Apna Logix
export type Language = "english" | "hindi";

export const t = (key: string, lang: Language): string => {
  const dictionary: Record<string, Record<Language, string>> = {
    appName: {
      english: "APNA LOGIX",
      hindi: "अपना लॉजिक्स"
    },
    tagline: {
      english: "Insta-Matching Terminal",
      hindi: "त्वरित मिलान टर्मिनल"
    },
    heroTitle: {
      english: "Predict Logistics Problems",
      hindi: "लॉजिस्टिक्स समस्याओं का पूर्वानुमान लगाएं"
    },
    heroSubtitle: {
      english: "Before They Exist",
      hindi: "उनके उत्पन्न होने से पहले"
    },
    heroDesc: {
      english: "An AI-powered multi-agent command center that forecasts demand, predicts congestion, optimizes fleets, and coordinates logistics networks autonomously.",
      hindi: "एक एआई-संचालित मल्टी-एजेंट कमांड सेंटर जो मांग का पूर्वानुमान लगाता है, रसद भीड़भाड़ की भविष्यवाणी करता है, और ऑटोमैटिक रसद नेटवर्क को संचालित करता है।"
    },
    launchCc: {
      english: "Launch Command Center",
      hindi: "नियंत्रण केंद्र शुरू करें"
    },
    watchSim: {
      english: "Watch Automated Simulation",
      hindi: "स्वचालित सिमुलेशन देखें"
    },
    directEntryHeader: {
      english: "━ Transporter & Shipper Portal Direct Entry ━",
      hindi: "━ गाड़ी मालिक और शिपर पोर्टल सीधा प्रवेश ━"
    },
    ccCardTitle: {
      english: "Control Center",
      hindi: "ग्रिड नियंत्रण केंद्र"
    },
    ccCardDesc: {
      english: "Monitor live grid, risk meters, and simulate severe weather/closure events.",
      hindi: "लाइव ग्रिड, जोखिम मीटर की निगरानी करें और सुचारू संचालन सुनिश्चित करें।"
    },
    transporterCardTitle: {
      english: "Transporter",
      hindi: "ट्रांसपोर्टर / गाड़ी मालिक"
    },
    transporterCardDesc: {
      english: "Post truck load space, browse shipping requests, submit direct condition bids.",
      hindi: "खाली ट्रक पोस्ट करें, सामान की खोज करें और सीधे सौदे की बोली लगाएं।"
    },
    shipperCardTitle: {
      english: "Shipper",
      hindi: "शिपर / सामान भेजने वाला"
    },
    shipperCardDesc: {
      english: "Publish cargo load details, receive offers, make counter-bids, direct sauda.",
      hindi: "माल विवरण पोस्ट करें, बोलियां प्राप्त करें, और सीधे मोल-भाव पक्का करें।"
    },
    authTitle: {
      english: "APNA LOGIX GATEWAY",
      hindi: "अपना लॉजिक्स द्वार"
    },
    authSubtitle: {
      english: "Secure Logistics Entry",
      hindi: "सुरक्षित लॉजिस्टिक्स प्रवेश"
    },
    loginTab: {
      english: "Log In",
      hindi: "लॉग-इन करें"
    },
    signupTab: {
      english: "Sign Up",
      hindi: "पंजीकरण / साइन-अप"
    },
    phoneLabel: {
      english: "Mobile Phone Number *",
      hindi: "मोबाइल फोन नंबर *"
    },
    passwordLabel: {
      english: "Secure Password *",
      hindi: "सुरक्षित पासवर्ड *"
    },
    loginBtn: {
      english: "Verify & Proceed Securely",
      hindi: "सत्यापित करें और आगे बढ़ें"
    },
    signUpBtn: {
      english: "Register & Join Now",
      hindi: "खाता बनाएं और अभी जुड़ें"
    },
    nameLabel: {
      english: "What is Your Name? *",
      hindi: "आपका नाम क्या है? *"
    },
    roleLabel: {
      english: "Select Your Role *",
      hindi: "अपनी भूमिका चुनें *"
    },
    optTransporter: {
      english: "Transporter / Vehicle Operator",
      hindi: "ट्रांसपोर्टर / गाड़ी मालिक"
    },
    optShipper: {
      english: "Shipper / Merchant",
      hindi: "शिपर / व्यापारी"
    },
    optOperator: {
      english: "Grid Operator / Control Agent",
      hindi: "नियंत्रण केंद्र ऑपरेटर"
    },
    serverOnline: {
      english: "Servers: Online",
      hindi: "सर्वर: सक्रिय"
    },
    simActive: {
      english: "Sim: Active",
      hindi: "सिमुलेशन: सक्रिय"
    },
    exit: {
      english: "Exit",
      hindi: "बाहर निकलें"
    },
    portalSwitch: {
      english: "SWITCH ACTIVE PORTAL:",
      hindi: "सक्रिय पोर्टल बदलें:"
    },
    totalRoutings: {
      english: "TOTAL ROUTINGS",
      hindi: "कुल रूटिंग्स"
    },
    activeFleet: {
      english: "TRUCKS ON THE ROAD",
      hindi: "सड़क पर गाड़ियां (कुल)"
    },
    predictedDemand: {
      english: "PREDICTION DEMAND",
      hindi: "पूर्वानुमानित मांग"
    },
    congestionRisk: {
      english: "CONGESTION RISK",
      hindi: "भीड़भाड़ का जोखिम"
    },
    fleetOptim: {
      english: "TRUCKS RUNNING WELL",
      hindi: "सही चल रही गाड़ियां"
    },
    netEfficiency: {
      english: "NET EFFICIENCY",
      hindi: "शुद्ध दक्षता"
    },
    carbonSaved: {
      english: "CARBON SAVED",
      hindi: "बचाया कार्बन"
    },
    transporterDashboard: {
      english: "Transporter Dashboard",
      hindi: "गाड़ी मालिक (ट्रांसपोर्टर) डैशबोर्ड"
    },
    shipperDashboard: {
      english: "Shipper Dashboard",
      hindi: "सामान भेजने वाला (शिपर) डैशबोर्ड"
    },
    findLoadsTab: {
      english: "Find Loads",
      hindi: "सामान ढूँढें"
    },
    listTrucksTab: {
      english: "Post Truck Trip",
      hindi: "अपनी गाड़ी की ट्रिप पोस्ट करें"
    },
    bidsChatTab: {
      english: "Deals & Bids",
      hindi: "मेरे सौदे और मोल-भाव"
    },
    postedCargoTab: {
      english: "My Shipments",
      hindi: "मेरा पोस्ट किया सामान"
    },
    postCargoTab: {
      english: "Post Freight Request",
      hindi: "नया सामान पोस्ट करें"
    },
    trackerTab: {
      english: "Live Tracker",
      hindi: "लाइव ट्रैकर"
    },
    postedBy: {
      english: "Party Name",
      hindi: "पार्टी का नाम"
    },
    vajan: {
      english: "Approx Weight",
      hindi: "अनुमानित वजन"
    },
    tarik: {
      english: "Target Date",
      hindi: "नियत तारीख"
    },
    loadingDetails: {
      english: "Loading Point Details",
      hindi: "लोडिंग पॉइंट विवरण"
    },
    instructions: {
      english: "Instructions",
      hindi: "विशेष निर्देश"
    },
    searchPlaceholderTransporter: {
      english: "Where do you want to find loads? Search city...",
      hindi: "सामान कहाँ के लिए चाहिए? शहर खोजें..."
    }
  };

  const strObj = dictionary[key];
  if (!strObj) return key;
  return strObj[lang] || strObj["english"];
};
