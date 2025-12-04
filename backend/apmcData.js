// APMC PALAMANER Trade Data (Dec 1-3, 2025)
const apmcData = {
  "TOMATO": {
    region: "PALAMANER",
    state: "ANDHRA PRADESH",
    recentTrades: [
      { date: "2025-12-03", minPrice: 2900, modalPrice: 3800, maxPrice: 3800, arrivals: 231, traded: 231, unit: "Qui" },
      { date: "2025-12-02", minPrice: 4300, modalPrice: 4800, maxPrice: 4800, arrivals: 201, traded: 201, unit: "Qui" },
      { date: "2025-12-01", minPrice: 3300, modalPrice: 4000, maxPrice: 4000, arrivals: 180, traded: 180, unit: "Qui" }
    ],
    totalArrivals: 612,
    avgModalPrice: 4200,
    priceVolatility: "MEDIUM",
    demand: "HIGH"
  },
  "CAULIFLOWER": {
    region: "PALAMANER",
    state: "ANDHRA PRADESH",
    recentTrades: [
      { date: "2025-12-03", minPrice: 1000, modalPrice: 1600, maxPrice: 1600, arrivals: 46, traded: 46, unit: "Qui" },
      { date: "2025-12-02", minPrice: 1500, modalPrice: 1700, maxPrice: 1700, arrivals: 57, traded: 57, unit: "Qui" },
      { date: "2025-12-01", minPrice: 1200, modalPrice: 1400, maxPrice: 1400, arrivals: 64, traded: 64, unit: "Qui" }
    ],
    totalArrivals: 167,
    avgModalPrice: 1567,
    priceVolatility: "LOW",
    demand: "MEDIUM"
  },
  "CABBAGE": {
    region: "PALAMANER",
    state: "ANDHRA PRADESH",
    recentTrades: [
      { date: "2025-12-03", minPrice: 700, modalPrice: 1500, maxPrice: 1500, arrivals: 45, traded: 45, unit: "Qui" },
      { date: "2025-12-02", minPrice: 600, modalPrice: 1300, maxPrice: 1300, arrivals: 59, traded: 59, unit: "Qui" },
      { date: "2025-12-01", minPrice: 1300, modalPrice: 1600, maxPrice: 1600, arrivals: 58, traded: 58, unit: "Qui" }
    ],
    totalArrivals: 162,
    avgModalPrice: 1467,
    priceVolatility: "MEDIUM",
    demand: "MEDIUM"
  },
  "GREEN CHILLI": {
    region: "PALAMANER",
    state: "ANDHRA PRADESH",
    recentTrades: [
      { date: "2025-12-03", minPrice: 3000, modalPrice: 4500, maxPrice: 4500, arrivals: 13, traded: 13, unit: "Qui" },
      { date: "2025-12-02", minPrice: 3500, modalPrice: 4500, maxPrice: 4500, arrivals: 25, traded: 25, unit: "Qui" },
      { date: "2025-12-01", minPrice: 3500, modalPrice: 3500, maxPrice: 4000, arrivals: 21, traded: 21, unit: "Qui" }
    ],
    totalArrivals: 59,
    avgModalPrice: 4167,
    priceVolatility: "MEDIUM",
    demand: "HIGH"
  },
  "BRINJAL": {
    region: "PALAMANER",
    state: "ANDHRA PRADESH",
    recentTrades: [
      { date: "2025-12-03", minPrice: 2000, modalPrice: 3000, maxPrice: 3000, arrivals: 13, traded: 13, unit: "Qui" },
      { date: "2025-12-02", minPrice: 2500, modalPrice: 2500, maxPrice: 2500, arrivals: 14, traded: 14, unit: "Qui" },
      { date: "2025-12-01", minPrice: 2000, modalPrice: 4000, maxPrice: 4000, arrivals: 21, traded: 21, unit: "Qui" }
    ],
    totalArrivals: 48,
    avgModalPrice: 3167,
    priceVolatility: "HIGH",
    demand: "MEDIUM"
  },
  "POTATO": {
    region: "PALAMANER",
    state: "ANDHRA PRADESH",
    recentTrades: [
      { date: "2025-12-03", minPrice: 1000, modalPrice: 2500, maxPrice: 2500, arrivals: 16, traded: 16, unit: "Qui" },
      { date: "2025-12-02", minPrice: 3000, modalPrice: 3000, maxPrice: 3000, arrivals: 17, traded: 17, unit: "Qui" },
      { date: "2025-12-01", minPrice: 2000, modalPrice: 2500, maxPrice: 3000, arrivals: 20, traded: 20, unit: "Qui" }
    ],
    totalArrivals: 53,
    avgModalPrice: 2667,
    priceVolatility: "MEDIUM",
    demand: "MEDIUM"
  },
  "BEANS -CLUSTER": {
    region: "PALAMANER",
    state: "ANDHRA PRADESH",
    recentTrades: [
      { date: "2025-12-03", minPrice: 2000, modalPrice: 3500, maxPrice: 3500, arrivals: 14, traded: 14, unit: "Qui" },
      { date: "2025-12-02", minPrice: 2000, modalPrice: 2500, maxPrice: 3500, arrivals: 18, traded: 18, unit: "Qui" },
      { date: "2025-12-01", minPrice: 2000, modalPrice: 3000, maxPrice: 3000, arrivals: 17, traded: 17, unit: "Qui" }
    ],
    totalArrivals: 49,
    avgModalPrice: 3000,
    priceVolatility: "MEDIUM",
    demand: "MEDIUM"
  },
  "RIDGE GOURD (TURAI)": {
    region: "PALAMANER",
    state: "ANDHRA PRADESH",
    recentTrades: [
      { date: "2025-12-03", minPrice: 2500, modalPrice: 4000, maxPrice: 4000, arrivals: 14, traded: 14, unit: "Qui" },
      { date: "2025-12-02", minPrice: 4000, modalPrice: 4000, maxPrice: 4000, arrivals: 12, traded: 12, unit: "Qui" },
      { date: "2025-12-01", minPrice: 2500, modalPrice: 2500, maxPrice: 3000, arrivals: 9, traded: 9, unit: "Qui" }
    ],
    totalArrivals: 35,
    avgModalPrice: 3500,
    priceVolatility: "HIGH",
    demand: "MEDIUM"
  }
};

// Crop mapping to normalize names
const cropNameMapping = {
  "TOMATO": ["tomato", "tomatoes"],
  "CAULIFLOWER": ["cauliflower"],
  "CABBAGE": ["cabbage"],
  "GREEN CHILLI": ["green chilli", "chilli", "green chili"],
  "BRINJAL": ["brinjal", "eggplant", "baingan"],
  "POTATO": ["potato", "potatoes", "aloo"],
  "BEANS -CLUSTER": ["cluster beans", "beans cluster", "guar"],
  "RIDGE GOURD (TURAI)": ["ridge gourd", "turai", "beerakaya"]
};

function getAPMCCropData(cropName) {
  const normalizedName = cropName.toUpperCase().trim();
  
  // Direct match
  if (apmcData[normalizedName]) {
    return apmcData[normalizedName];
  }
  
  // Search through mappings
  for (const [key, aliases] of Object.entries(cropNameMapping)) {
    if (aliases.some(alias => normalizedName.includes(alias.toUpperCase()) || alias.toUpperCase().includes(normalizedName))) {
      return apmcData[key];
    }
  }
  
  return null;
}

function calculateDemandLevel(totalArrivals, avgPrice, priceVolatility) {
  // High arrivals + Good prices = High demand
  if (totalArrivals > 150 && avgPrice > 3000) return "HIGH";
  if (totalArrivals > 100 || avgPrice > 3500) return "MEDIUM-HIGH";
  if (totalArrivals > 50 && avgPrice > 2000) return "MEDIUM";
  return "LOW-MEDIUM";
}

function getAllAPMCCrops() {
  return Object.keys(apmcData).map(crop => ({
    crop,
    ...apmcData[crop]
  })).sort((a, b) => b.totalArrivals - a.totalArrivals);
}

function getHighDemandCrops() {
  return getAllAPMCCrops().filter(crop => crop.demand === "HIGH" || crop.totalArrivals > 150);
}

module.exports = {
  apmcData,
  getAPMCCropData,
  calculateDemandLevel,
  getAllAPMCCrops,
  getHighDemandCrops,
  cropNameMapping
};
