const OpenAI = require('openai');

// Initialize OpenAI or Together AI client
let llmClient = null;
let llmProvider = null;

function initializeLLMClient() {
  if (llmClient) return llmClient;
  
  // Prioritize Together API if available (as preferred by user)
  if (process.env.TOGETHER_API_KEY) {
    llmClient = new OpenAI({
      apiKey: process.env.TOGETHER_API_KEY,
      baseURL: 'https://api.together.xyz/v1'
    });
    llmProvider = 'together';
  } else if (process.env.OPENAI_API_KEY) {
    llmClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    llmProvider = 'openai';
  }
  
  return llmClient;
}

/**
 * Generate LLM insights for crop profitability in KUPPAM/PALAMANER region
 * @param {string} cropName - Name of the crop
 * @param {Object} recommendation - Crop recommendation data
 * @param {Object} farmerData - Optional farmer profile data
 * @returns {Promise<Object>} LLM generated insights
 */
async function generateLLMInsights(cropName, recommendation, farmerData = null) {
  const client = initializeLLMClient();
  
  if (!client) {
    return {
      available: false,
      message: "LLM service not configured. Please set OPENAI_API_KEY or TOGETHER_API_KEY environment variable."
    };
  }
  
  // Prepare context for LLM
  const context = buildContextForLLM(cropName, recommendation, farmerData);
  
  try {
    const response = await client.chat.completions.create({
      model: llmProvider === 'openai' ? 'gpt-4o-mini' : 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [
        {
          role: "system",
          content: `You are an agricultural expert specializing in the KUPPAM and PALAMANER regions of Andhra Pradesh, India. 
You provide practical, data-driven advice to farmers about crop profitability, market trends, and farming practices specific to this region.
Focus on: soil types in the region, climate patterns, water availability, local market dynamics, and seasonal considerations.
Keep responses concise, actionable, and specific to the Chittoor district agricultural context.`
        },
        {
          role: "user",
          content: context
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    const insights = response.choices[0].message.content;
    
    return {
      available: true,
      provider: llmProvider,
      insights,
      recommendations: parseInsightsIntoRecommendations(insights)
    };
    
  } catch (error) {
    console.error('Error generating LLM insights:', error);
    return {
      available: false,
      error: error.message
    };
  }
}

/**
 * Build context string for LLM prompt
 */
function buildContextForLLM(cropName, recommendation, farmerData) {
  let context = `Analyze the profitability and viability of growing ${cropName} in the KUPPAM/PALAMANER region (Chittoor district, Andhra Pradesh).

**Market Data (PALAMANER APMC):**
- Average Market Price: ₹${recommendation.profitability.pricePerQuintal}/quintal
- Market Demand: ${recommendation.demand}
- Price Volatility: ${recommendation.marketData?.priceVolatility || 'N/A'}
${recommendation.marketData ? `- Recent Arrivals: ${recommendation.marketData.totalArrivals} quintals` : ''}

**Financial Projections:**
- Expected Income: ₹${recommendation.expectedIncome.toLocaleString('en-IN')}
- Total Cost: ₹${Math.round(recommendation.profitability.totalCost).toLocaleString('en-IN')}
- Expected Profit: ₹${Math.round(recommendation.profitability.profit).toLocaleString('en-IN')}
- ROI: ${recommendation.profitability.roi}%
- Success Rate: ${recommendation.successRate}%
- Estimated Yield: ${recommendation.profitability.yieldQuintals.toFixed(1)} quintals per ${recommendation.areaHectares} hectares
`;

  if (farmerData) {
    const cropDetails = farmerData.profile?.metaData?.masterData?.cropDetails;
    const address = farmerData.profile?.address;
    const waterSource = cropDetails?.waterSource;
    const farmingType = cropDetails?.farmingType;
    
    context += `
**Farmer Context:**
- Location: ${address || 'KUPPAM region'}
- Farming Type: ${farmingType || 'Conventional'}
- Water Source: ${waterSource || 'Not specified'}
- Land Area: ${recommendation.areaHectares} hectares
`;
  }

  context += `
Provide specific insights for this crop in KUPPAM/PALAMANER region covering:
1. Regional suitability (soil, climate, water needs)
2. Key success factors and risks
3. Best practices for this region
4. Market timing and selling strategy
5. Alternative crops if this isn't optimal

Keep the response practical and actionable for local farmers.`;

  return context;
}

/**
 * Parse LLM insights into structured recommendations
 */
function parseInsightsIntoRecommendations(insights) {
  // Simple parsing - could be enhanced with more sophisticated NLP
  const recommendations = {
    suitability: null,
    risks: [],
    bestPractices: [],
    timing: null,
    alternatives: []
  };
  
  // Extract key points (basic implementation)
  if (insights.toLowerCase().includes('suitable') || insights.toLowerCase().includes('ideal')) {
    recommendations.suitability = 'HIGH';
  } else if (insights.toLowerCase().includes('not recommended') || insights.toLowerCase().includes('avoid')) {
    recommendations.suitability = 'LOW';
  } else {
    recommendations.suitability = 'MEDIUM';
  }
  
  return recommendations;
}

/**
 * Generate region-specific insights for multiple crops
 */
async function generateBulkInsights(crops, farmerData = null) {
  const client = initializeLLMClient();
  
  if (!client) {
    return { available: false };
  }
  
  const cropList = crops.map(c => c.crop).join(', ');
  
  try {
    const response = await client.chat.completions.create({
      model: llmProvider === 'openai' ? 'gpt-4o-mini' : 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      messages: [
        {
          role: "system",
          content: `You are an agricultural expert for KUPPAM/PALAMANER region in Chittoor district, Andhra Pradesh.
Provide brief, region-specific insights for each crop considering local conditions.`
        },
        {
          role: "user",
          content: `Compare these crops for profitability in KUPPAM/PALAMANER region: ${cropList}
          
For each crop, briefly mention:
- Suitability for the region (1 sentence)
- Expected market demand (1 sentence)
- One key success factor

Keep total response under 300 words.`
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });
    
    return {
      available: true,
      provider: llmProvider,
      insights: response.choices[0].message.content
    };
    
  } catch (error) {
    console.error('Error generating bulk insights:', error);
    return {
      available: false,
      error: error.message
    };
  }
}

/**
 * Generate structured operational details for a crop using LLM
 * @param {string} cropName - Name of the crop
 * @param {Object} recommendation - Crop recommendation data with profitability info
 * @param {Object} farmerData - Optional farmer profile data
 * @returns {Promise<Object>} Structured operational details
 */
async function generateCropOperationalDetails(cropName, recommendation, farmerData = null) {
  const client = initializeLLMClient();
  
  if (!client) {
    // Return defaults if LLM not available
    return getDefaultOperationalDetails(cropName, recommendation);
  }
  
  // Build prompt for structured operational details
  const prompt = buildOperationalDetailsPrompt(cropName, recommendation, farmerData);
  
  try {
    const model = llmProvider === 'openai' 
      ? 'gpt-4o-mini' 
      : 'mistralai/Mistral-7B-Instruct-v0.3';
    
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are an agricultural expert for KUPPAM/PALAMANER region in Chittoor district, Andhra Pradesh, India.
You provide structured operational details for crops including equipment, effort distribution, resource requirements, and farming practices.
Return ONLY valid JSON with no additional text or explanations.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    const aiResponse = response.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const operationalDetails = JSON.parse(jsonMatch[0]);
      
      // Validate and return
      return validateOperationalDetails(operationalDetails, cropName, recommendation);
    } else {
      throw new Error('No JSON found in AI response');
    }
    
  } catch (error) {
    console.error(`Error generating operational details for ${cropName}:`, error.message);
    // Fall back to defaults on error
    try {
      return getDefaultOperationalDetails(cropName, recommendation);
    } catch (fallbackError) {
      console.error('Error in fallback defaults:', fallbackError);
      // Ultimate fallback - return basic structure
      return {
        equipmentNeeded: ['Tractor', 'Plough'],
        effortDistribution: { setup: 20, maintenance: 50, harvesting: 30 },
        resourceRequirements: {
          waterNeeded: '2000 L/ha',
          fertilizers: ['Urea'],
          pesticides: ['Generic Pesticide']
        },
        maturityTime: 90,
        waterRequirement: 2000,
        laborRequirement: 100,
        riskLevel: 'Medium',
        soilConditions: {
          suitability: 'Good',
          analysis: `${cropName} is suitable for cultivation in the region`
        },
        marketAnalysis: {
          profitMargin: '20%',
          marketDemand: recommendation.demand || 'Medium'
        }
      };
    }
  }
}

/**
 * Build prompt for operational details generation
 */
function buildOperationalDetailsPrompt(cropName, recommendation, farmerData) {
  let prompt = `Generate operational details for growing ${cropName} in KUPPAM/PALAMANER region (Chittoor district, Andhra Pradesh).

CROP INFORMATION:
- Crop Name: ${cropName}
- Market Demand: ${recommendation.demand}
- Expected Income: ₹${recommendation.expectedIncome.toLocaleString('en-IN')}
- Success Rate: ${recommendation.successRate}%
- Area: ${recommendation.areaHectares} hectares
${recommendation.marketData ? `- Average Price: ₹${recommendation.marketData.avgModalPrice}/quintal` : ''}
`;

  if (farmerData) {
    const cropDetails = farmerData.profile?.metaData?.masterData?.cropDetails;
    const soilDetails = farmerData.profile?.metaData?.masterData?.soilDetails;
    
    prompt += `
FARMER CONTEXT:
- Farming Type: ${cropDetails?.farmingType || 'Conventional'}
- Water Source: ${cropDetails?.waterSource || 'Not specified'}
- Irrigation Method: ${cropDetails?.methodOfIrrigation || 'Not specified'}
${soilDetails?.soilHealthParameters ? `- Soil pH: ${soilDetails.soilHealthParameters.ph || 'Not specified'}` : ''}
`;
  }

  prompt += `
Return ONLY a valid JSON object with this EXACT structure (no additional text):

{
  "equipmentNeeded": ["equipment1", "equipment2", "equipment3"],
  "effortDistribution": {
    "setup": number_in_hours,
    "maintenance": number_in_hours,
    "harvesting": number_in_hours
  },
  "resourceRequirements": {
    "waterNeeded": "number L/ha",
    "fertilizers": ["fertilizer1", "fertilizer2"],
    "pesticides": ["pesticide1"]
  },
  "maturityTime": number_in_days,
  "waterRequirement": number_in_liters,
  "laborRequirement": number_in_hours,
  "riskLevel": "Low" | "Medium" | "High",
  "soilConditions": {
    "suitability": "Excellent" | "Good" | "Fair" | "Poor",
    "analysis": "Brief analysis of soil suitability for this crop in the region"
  },
  "marketAnalysis": {
    "profitMargin": "percentage%",
    "marketDemand": "High" | "Medium" | "Low"
  }
}

REQUIREMENTS:
- Provide realistic values based on ${cropName} cultivation in Andhra Pradesh
- Consider regional climate (tropical, moderate rainfall)
- Equipment should be commonly available in Indian agricultural context
- Effort distribution should total approximately 100 hours for typical crop cycle
- Water requirement should be realistic for the crop type
- Risk level should consider market volatility and crop susceptibility
- Soil conditions should reflect typical conditions in Chittoor district
- Market analysis should align with the provided demand level

Return ONLY the JSON object, no explanations.`;

  return prompt;
}

/**
 * Validate and sanitize operational details from LLM
 */
function validateOperationalDetails(details, cropName, recommendation) {
  // Ensure all required fields exist with defaults
  const validated = {
    equipmentNeeded: Array.isArray(details.equipmentNeeded) ? details.equipmentNeeded : ['Tractor', 'Plough'],
    effortDistribution: {
      setup: typeof details.effortDistribution?.setup === 'number' ? details.effortDistribution.setup : 20,
      maintenance: typeof details.effortDistribution?.maintenance === 'number' ? details.effortDistribution.maintenance : 50,
      harvesting: typeof details.effortDistribution?.harvesting === 'number' ? details.effortDistribution.harvesting : 30
    },
    resourceRequirements: {
      waterNeeded: details.resourceRequirements?.waterNeeded || '2000 L/ha',
      fertilizers: Array.isArray(details.resourceRequirements?.fertilizers) ? details.resourceRequirements.fertilizers : ['Urea'],
      pesticides: Array.isArray(details.resourceRequirements?.pesticides) ? details.resourceRequirements.pesticides : ['Generic Pesticide']
    },
    maturityTime: typeof details.maturityTime === 'number' ? details.maturityTime : 90,
    waterRequirement: typeof details.waterRequirement === 'number' ? details.waterRequirement : 2000,
    laborRequirement: typeof details.laborRequirement === 'number' ? details.laborRequirement : 100,
    riskLevel: ['Low', 'Medium', 'High'].includes(details.riskLevel) ? details.riskLevel : 'Medium',
    soilConditions: {
      suitability: ['Excellent', 'Good', 'Fair', 'Poor'].includes(details.soilConditions?.suitability) 
        ? details.soilConditions.suitability 
        : 'Good',
      analysis: details.soilConditions?.analysis || `${cropName} is suitable for cultivation in the region`
    },
    marketAnalysis: {
      profitMargin: details.marketAnalysis?.profitMargin || '20%',
      marketDemand: ['High', 'Medium', 'Low'].includes(details.marketAnalysis?.marketDemand)
        ? details.marketAnalysis.marketDemand
        : recommendation.demand || 'Medium'
    }
  };
  
  return validated;
}

/**
 * Get default operational details based on crop type
 */
function getDefaultOperationalDetails(cropName, recommendation) {
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
      }
    }
  };
  
  const categoryDefaults = defaults[category] || defaults.vegetable;
  
  return {
    ...categoryDefaults,
    marketAnalysis: {
      profitMargin: '20%',
      marketDemand: recommendation.demand || 'Medium'
    }
  };
}

module.exports = {
  generateLLMInsights,
  generateBulkInsights,
  generateCropOperationalDetails,
  initializeLLMClient
};
