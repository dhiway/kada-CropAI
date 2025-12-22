const { getAPMCCropData } = require('./apmcData');
const { mspData } = require('./mspData');

/**
 * Calculate total cost from farmer stages data
 * @param {Array} stages - Farmer crop stages with cost categories
 * @returns {number} Total cost in rupees
 */
function calculateTotalCostFromStages(stages) {
  if (!stages || !Array.isArray(stages)) return 0;
  
  let totalCost = 0;
  
  stages.forEach(stage => {
    if (stage.categories && Array.isArray(stage.categories)) {
      stage.categories.forEach(category => {
        if (category.data && category.data.totalCost) {
          totalCost += category.data.totalCost;
        }
      });
    }
  });
  
  return totalCost;
}

/**
 * Calculate expected income based on yield and market prices
 * @param {string} cropName - Name of the crop
 * @param {number} yieldQty - Yield quantity in quintals
 * @param {string} priceSource - "APMC" or "MSP"
 * @returns {Object} Income calculation
 */
function calculateExpectedIncome(cropName, yieldQty, priceSource = "APMC") {
  const apmcData = getAPMCCropData(cropName);
  
  let pricePerQuintal = 0;
  let priceSourceUsed = "";
  
  if (priceSource === "APMC" && apmcData) {
    pricePerQuintal = apmcData.avgModalPrice;
    priceSourceUsed = `APMC ${apmcData.region}`;
  } else {
    // Try to get MSP data (normalize crop name)
    const mspKey = Object.keys(mspData).find(key => 
      key.toLowerCase().includes(cropName.toLowerCase()) || 
      cropName.toLowerCase().includes(key.toLowerCase().split(' ')[0])
    );
    
    if (mspKey) {
      pricePerQuintal = mspData[mspKey]["2025-26"] || mspData[mspKey]["2024-25"];
      priceSourceUsed = "MSP";
    }
  }
  
  const expectedIncome = pricePerQuintal * yieldQty;
  
  return {
    pricePerQuintal,
    priceSourceUsed,
    yieldQty,
    expectedIncome
  };
}

/**
 * Calculate profit/loss and return on investment
 * @param {Object} farmerData - Farmer profile with crop details
 * @param {string} cropName - Name of the crop
 * @returns {Object} Profitability analysis
 */
function calculateProfitability(farmerData, cropName) {
  const stages = farmerData?.profile?.metaData?.stages || [];
  const cropDetails = farmerData?.profile?.metaData?.masterData?.cropDetails || {};
  
  // Get costs
  const totalCost = calculateTotalCostFromStages(stages);
  
  // Get actual or expected yield (in quintals, assuming 1 quintal = 100 kg)
  const yieldKg = cropDetails.cropYield || 7500; // Default from sample data
  const yieldQuintals = yieldKg / 100;
  
  // Get income calculation
  const incomeCalc = calculateExpectedIncome(cropName, yieldQuintals, "APMC");
  
  // Use expected income for future projections
  const expectedIncome = incomeCalc.expectedIncome;
  
  // Store actual income if available for reference
  const actualIncome = cropDetails.incomeFromYieldSale || null;
  
  // Calculate profit and ROI based on expected income
  const profit = expectedIncome - totalCost;
  const roi = totalCost > 0 ? ((profit / totalCost) * 100).toFixed(2) : 0;
  const profitPerQuintal = yieldQuintals > 0 ? (profit / yieldQuintals).toFixed(2) : 0;
  
  return {
    totalCost,
    expectedIncome,
    actualIncome,
    profit,
    roi: parseFloat(roi),
    profitPerQuintal: parseFloat(profitPerQuintal),
    yieldQuintals,
    pricePerQuintal: incomeCalc.pricePerQuintal,
    priceSource: incomeCalc.priceSourceUsed,
    costBreakdown: calculateCostBreakdown(stages)
  };
}

/**
 * Calculate cost breakdown by stage
 * @param {Array} stages - Farmer crop stages
 * @returns {Object} Cost breakdown
 */
function calculateCostBreakdown(stages) {
  const breakdown = {};
  
  if (!stages || !Array.isArray(stages)) return breakdown;
  
  stages.forEach(stage => {
    let stageCost = 0;
    
    if (stage.categories && Array.isArray(stage.categories)) {
      stage.categories.forEach(category => {
        if (category.data && category.data.totalCost) {
          stageCost += category.data.totalCost;
        }
      });
    }
    
    if (stageCost > 0) {
      breakdown[stage.stageName] = stageCost;
    }
  });
  
  return breakdown;
}

/**
 * Calculate success rate based on completion, yield, and profitability
 * @param {Object} farmerData - Farmer profile data
 * @param {Object} profitability - Profitability analysis
 * @param {Object} apmcData - APMC market data
 * @returns {number} Success rate percentage (0-100)
 */
function calculateSuccessRate(farmerData, profitability, apmcData) {
  let successScore = 0;
  
  // 1. Crop completion status (30%)
  const status = farmerData?.profile?.metaData?.status;
  if (status === "COMPLETED") {
    successScore += 30;
  } else if (status === "IN_PROGRESS") {
    successScore += 15;
  }
  
  // 2. Profitability (30%)
  if (profitability.roi > 50) {
    successScore += 30;
  } else if (profitability.roi > 30) {
    successScore += 25;
  } else if (profitability.roi > 10) {
    successScore += 15;
  } else if (profitability.roi > 0) {
    successScore += 10;
  }
  
  // 3. Yield achievement (20%)
  const actualYield = profitability.yieldQuintals;
  const expectedYield = 75; // Average expected for vegetables
  const yieldRatio = actualYield / expectedYield;
  
  if (yieldRatio >= 1) {
    successScore += 20;
  } else if (yieldRatio >= 0.8) {
    successScore += 15;
  } else if (yieldRatio >= 0.6) {
    successScore += 10;
  }
  
  // 4. Market demand alignment (20%)
  if (apmcData) {
    if (apmcData.demand === "HIGH") {
      successScore += 20;
    } else if (apmcData.demand === "MEDIUM-HIGH") {
      successScore += 15;
    } else if (apmcData.demand === "MEDIUM") {
      successScore += 10;
    }
  } else {
    successScore += 10; // Neutral if no APMC data
  }
  
  return Math.min(100, Math.round(successScore));
}

/**
 * Generate crop recommendation with profitability data
 * @param {string} cropName - Name of the crop
 * @param {Object} farmerData - Farmer profile data (optional)
 * @param {number} landAreaHectares - Land area in hectares
 * @returns {Object} Crop recommendation with all metrics
 */
function generateCropRecommendation(cropName, farmerData = null, landAreaHectares = 0.6) {
  const apmcData = getAPMCCropData(cropName);
  
  // Use farmer data if provided, otherwise create estimates
  let profitability;
  let successRate;
  
  if (farmerData) {
    profitability = calculateProfitability(farmerData, cropName);
    successRate = calculateSuccessRate(farmerData, profitability, apmcData);
  } else {
    // Estimate based on APMC and typical costs
    const estimatedYield = 75; // quintals for 0.6 hectares
    const estimatedCost = 110000; // Based on sample farmer data
    const incomeCalc = calculateExpectedIncome(cropName, estimatedYield, "APMC");
    
    profitability = {
      totalCost: estimatedCost,
      expectedIncome: incomeCalc.expectedIncome,
      profit: incomeCalc.expectedIncome - estimatedCost,
      roi: ((incomeCalc.expectedIncome - estimatedCost) / estimatedCost * 100).toFixed(2),
      yieldQuintals: estimatedYield,
      pricePerQuintal: incomeCalc.pricePerQuintal,
      priceSource: incomeCalc.priceSourceUsed
    };
    
    // Estimate success rate
    successRate = apmcData ? (apmcData.demand === "HIGH" ? 78 : 65) : 60;
  }
  
  return {
    crop: cropName,
    expectedIncome: Math.round(profitability.expectedIncome),
    demand: apmcData ? apmcData.demand : "MEDIUM",
    successRate,
    profitability: {
      ...profitability,
      roi: parseFloat(profitability.roi)
    },
    marketData: apmcData || null,
    areaHectares: landAreaHectares
  };
}

/**
 * Get top profitable crops for a region
 * @param {Array} cropList - List of crop names to analyze
 * @param {Object} farmerData - Optional farmer profile data
 * @param {number} topN - Number of top crops to return
 * @returns {Array} Sorted list of profitable crops
 */
function getTopProfitableCrops(cropList, farmerData = null, topN = 5) {
  const recommendations = cropList.map(crop => 
    generateCropRecommendation(crop, farmerData)
  );
  
  // Sort by expected income (descending)
  return recommendations
    .sort((a, b) => b.expectedIncome - a.expectedIncome)
    .slice(0, topN);
}

/**
 * Generate operational details for a crop (equipment, effort, resources, etc.)
 * Uses LLM if available, otherwise falls back to crop-type defaults
 * @param {string} cropName - Name of the crop
 * @param {Object} recommendation - Crop recommendation data
 * @param {Object} farmerData - Optional farmer profile data
 * @returns {Promise<Object>} Operational details object
 */
async function generateCropOperationalDetails(cropName, recommendation, farmerData = null) {
  // Try to use LLM service if available
  try {
    const llmService = require('./llmService');
    if (llmService.generateCropOperationalDetails) {
      const operationalDetails = await llmService.generateCropOperationalDetails(cropName, recommendation, farmerData);
      return operationalDetails;
    }
  } catch (error) {
    console.error(`Error generating operational details for ${cropName}:`, error.message);
  }
  
  // Fall back to defaults if LLM unavailable or fails
  return getDefaultOperationalDetailsFallback(cropName, recommendation);
}

/**
 * Fallback function for default operational details (when LLM unavailable)
 */
function getDefaultOperationalDetailsFallback(cropName, recommendation) {
  const cropLower = cropName.toLowerCase();
  
  // Determine crop category
  let category = 'vegetable';
  if (cropLower.includes('rice') || cropLower.includes('wheat') || cropLower.includes('maize')) {
    category = 'grain';
  } else if (cropLower.includes('moong') || cropLower.includes('tur') || cropLower.includes('arhar') || cropLower.includes('dal')) {
    category = 'pulse';
  } else if (cropLower.includes('cotton') || cropLower.includes('sugarcane')) {
    category = 'cash';
  } else if (cropLower.includes('groundnut') || cropLower.includes('sesamum') || cropLower.includes('til')) {
    category = 'oilseed';
  }
  
  // Default values based on category
  const defaults = {
    vegetable: {
      equipmentNeeded: ['Tractor', 'Drip Irrigation', 'Sprayer', 'Harvester'],
      effortDistribution: { setup: 20, maintenance: 50, harvesting: 30 },
      resourceRequirements: {
        waterNeeded: '2500 L/ha',
        fertilizers: ['Urea', 'DAP', 'Potash'],
        pesticides: ['Neem Oil', 'Insecticide']
      },
      maturityTime: 90,
      waterRequirement: 2500,
      laborRequirement: 120,
      riskLevel: 'Medium',
      soilConditions: {
        suitability: 'Good',
        analysis: 'Vegetables grow well in well-drained loamy soil with good organic matter'
      },
      marketAnalysis: {
        profitMargin: '20%',
        marketDemand: recommendation.demand || 'Medium'
      }
    },
    grain: {
      equipmentNeeded: ['Tractor', 'Seed Drill', 'Thresher', 'Harvester'],
      effortDistribution: { setup: 30, maintenance: 60, harvesting: 40 },
      resourceRequirements: {
        waterNeeded: '3000 L/ha',
        fertilizers: ['Urea', 'DAP'],
        pesticides: ['Herbicide', 'Fungicide']
      },
      maturityTime: 120,
      waterRequirement: 3000,
      laborRequirement: 150,
      riskLevel: 'Low',
      soilConditions: {
        suitability: 'Good',
        analysis: 'Grains require fertile soil with good water retention capacity'
      },
      marketAnalysis: {
        profitMargin: '20%',
        marketDemand: recommendation.demand || 'Medium'
      }
    },
    pulse: {
      equipmentNeeded: ['Tractor', 'Seed Drill', 'Thresher'],
      effortDistribution: { setup: 15, maintenance: 40, harvesting: 25 },
      resourceRequirements: {
        waterNeeded: '1500 L/ha',
        fertilizers: ['DAP', 'Rhizobium'],
        pesticides: ['Neem Oil']
      },
      maturityTime: 80,
      waterRequirement: 1500,
      laborRequirement: 80,
      riskLevel: 'Low',
      soilConditions: {
        suitability: 'Good',
        analysis: 'Pulses are well-suited for the region and improve soil nitrogen'
      },
      marketAnalysis: {
        profitMargin: '20%',
        marketDemand: recommendation.demand || 'Medium'
      }
    },
    cash: {
      equipmentNeeded: ['Tractor', 'Cotton Picker', 'Sprayer'],
      effortDistribution: { setup: 35, maintenance: 70, harvesting: 50 },
      resourceRequirements: {
        waterNeeded: '4000 L/ha',
        fertilizers: ['Urea', 'DAP', 'Potash'],
        pesticides: ['Insecticide', 'Herbicide']
      },
      maturityTime: 150,
      waterRequirement: 4000,
      laborRequirement: 200,
      riskLevel: 'Medium',
      soilConditions: {
        suitability: 'Good',
        analysis: 'Cash crops require well-drained soil with adequate nutrients'
      },
      marketAnalysis: {
        profitMargin: '20%',
        marketDemand: recommendation.demand || 'Medium'
      }
    },
    oilseed: {
      equipmentNeeded: ['Tractor', 'Seed Drill', 'Harvester'],
      effortDistribution: { setup: 20, maintenance: 45, harvesting: 30 },
      resourceRequirements: {
        waterNeeded: '2000 L/ha',
        fertilizers: ['DAP', 'Urea'],
        pesticides: ['Insecticide']
      },
      maturityTime: 100,
      waterRequirement: 2000,
      laborRequirement: 100,
      riskLevel: 'Medium',
      soilConditions: {
        suitability: 'Good',
        analysis: 'Oilseeds grow well in well-drained sandy loam soil'
      },
      marketAnalysis: {
        profitMargin: '20%',
        marketDemand: recommendation.demand || 'Medium'
      }
    }
  };
  
  return defaults[category] || defaults.vegetable;
}

module.exports = {
  calculateTotalCostFromStages,
  calculateExpectedIncome,
  calculateProfitability,
  calculateCostBreakdown,
  calculateSuccessRate,
  generateCropRecommendation,
  getTopProfitableCrops,
  generateCropOperationalDetails
};
