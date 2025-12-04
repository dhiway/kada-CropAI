const OpenAI = require('openai');

// Initialize OpenAI or Together AI client
let llmClient = null;
let llmProvider = null;

function initializeLLMClient() {
  if (llmClient) return llmClient;
  
  if (process.env.OPENAI_API_KEY) {
    llmClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    llmProvider = 'openai';
  } else if (process.env.TOGETHER_API_KEY) {
    llmClient = new OpenAI({
      apiKey: process.env.TOGETHER_API_KEY,
      baseURL: 'https://api.together.xyz/v1'
    });
    llmProvider = 'together';
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

module.exports = {
  generateLLMInsights,
  generateBulkInsights,
  initializeLLMClient
};
