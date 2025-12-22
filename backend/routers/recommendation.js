const express = require('express');
const Together = require('together-ai');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const router = express.Router();
const { getMSPData, getHighValueCrops } = require('../mspData');

// Load environment variables
dotenv.config();

// Separate function for OpenAI API request
async function getOpenAIRecommendation(farmProfile) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: farmProfile,
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  return response.choices[0].message.content;
}

// Get crop recommendation
router.post('/', async (req, res) => {
  console.log('API called: /api/recommendations');
  console.log('Request body:', req.body);
  console.log('API Key present:', !!process.env.TOGETHER_API_KEY);

  try {
    const cropData = req.body;
    const language = req.body.language || 'en'; // Default to English
    const aiProvider = req.body.aiProvider || 'together'; // Default to Together AI

    // Validate input data
    console.log('Validating input data...');
    const { soilType, phLevel, rainfall, temperature, currentCrop, yieldHistory, marketPrice } = cropData;

    if (!soilType || !phLevel || !rainfall || !temperature || !currentCrop || !yieldHistory || !marketPrice) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({ error: 'All crop data fields are required' });
    }

    console.log('Validation passed, initializing AI...');
    console.log('Selected AI Provider:', aiProvider);

    // Get MSP data for price analysis
    console.log('Getting MSP data...');
    const highValueCrops = getHighValueCrops();
    const allCropData = getMSPData();

    // Show top 12 crops with full 5-year trend analysis
    const cropTrendAnalysis = highValueCrops.slice(0, 12).map(crop => {
      const data = allCropData.find(d => d.crop === crop.crop);
      const trend = data.trend;
      return `- ${crop.crop}:\n    ${trend["2021-22"]} → ${trend["2022-23"]} → ${trend["2023-24"]} → ${trend["2024-25"]} → ${trend["2025-26"]} ₹/q`;
    }).join('\n');

    const historicalPriceContext = `
HISTORICAL MSP DATA (Government of India MSP Rates in ₹/Quintal):
Showing 5-year trend analysis for maximum profit potential:

${cropTrendAnalysis}

HIGH-VALUE CROPS (>5000 ₹/quintal in 2025-26):
${highValueCrops.map(c => c.crop).join(', ')}

MARKET ANALYSIS FOCUS:
- Priority crops with MSP >5000 ₹/quintal and upward trending
- Consider regional seasonality (Kharif/Rabi)
- Maximize farmer income through government pricing support
- 5-year trend shows stable government support for high-value crops

RECOMMENDATION STRATEGY:
1. Select crops with highest 2015-26 MSP rates for immediate profit
2. Analyze 15-year trend to identify stable/rising income sources
4. Balance yield per hectare with MSP value for maximum total income
5. Factor in regional adaptability and market access`;
    console.log('MSP data prepared');

    // Create prompt for AI model using complete farmer data
    console.log('Creating AI prompt...');

    // Extract all farmer information from request body
    const {
      landDetails = {},
      ownershipDetails = [],
      soilDetails = { soilHealthParameters: {} },
      cropDetailsEPanta = {},
      cropDetailsFarmer = { stages: {}, farmerAssets: [] },
      cropInsurance = {},
      encumbrance = {}
    } = cropData;

    // Create comprehensive farm profile
    const farmProfile = `
COMPREHENSIVE FARMER PROFILE:

BASIC FARM INFORMATION:
- Current Crop: ${cropData.currentCrop}
- Soil Type: ${cropData.soilType}
- Soil pH: ${cropData.phLevel}
- Annual Rainfall: ${cropData.rainfall} mm
- Average Temperature: ${cropData.temperature} °C
- Last Year's Yield: ${cropData.yieldHistory} tons/hectare
- Current Market Price: ₹${cropData.marketPrice} per kg

LAND DETAILS:
- State: ${landDetails.state || 'Not provided'}
- District: ${landDetails.district || 'Not provided'}
- Sub-District: ${landDetails.subDistrict || 'Not provided'}
- Village: ${landDetails.village || 'Not provided'}
- Survey Number: ${landDetails.surveyNumber || 'Not provided'}
- Total Area: ${landDetails.totalArea || 0} hectares
- Extent Assigned Area: ${landDetails.extentAssignedArea || 0} hectares
- Land Source: ${landDetails.landSource || 'Not provided'}

SOIL HEALTH PARAMETERS:
- Nitrogen: ${soilDetails.soilHealthParameters?.nitrogen || 0} kg/ha
- Phosphorus: ${soilDetails.soilHealthParameters?.phosphorus || 0} kg/ha
- Potassium: ${soilDetails.soilHealthParameters?.potassium || 0} kg/ha
- pH: ${soilDetails.soilHealthParameters?.ph || cropData.phLevel}
- Organic Carbon: ${soilDetails.soilHealthParameters?.organicCarbon || 0}%

FARMER'S INVESTMENT & INCOME:
- Investment in Kharif: ₹${cropDetailsFarmer.investmentKharif || '0'}
- Farmer Assets: ${cropDetailsFarmer.farmerAssets?.join(', ') || 'Not provided'}

${historicalPriceContext}

Your task:
Analyze this comprehensive farmer data and provide crop recommendations in the EXACT JSON structure below.

CRITICAL: Return ONLY valid JSON with no additional text, explanations, or formatting.

{
  "recommendedCrop": "Crop Name",
  "reason": "Brief explanation why this crop is recommended",
  "confidenceScore": inpercentage,
  "expectedProfit": inINR,
  "expectedYield": inTons,
  "waterRequirement": inLitres,
  "laborRequirement": inHours,
  "maturityTime": inDays,
  "riskLevel": "Low",
  "equipmentNeeded": ["", "", ""],
  "effortDistribution": {
    "setup": inHours,
    "maintenance": inHours,
    "harvesting": inHours
  },
  "resourceRequirements": {
    "waterNeeded": inLitres,
    "fertilizers": ["", "", ""],
    "pesticides": [""]
  },
  "soilConditions": {
    "suitability": "Excellent || Good || Fair || Poor",
    "analysis": "Soil pH and nutrients are ideal for this crop"
  },
  "marketAnalysis": {
    "profitMargin": "%",
    "marketDemand": "High || Medium || Low"
  },
  "alternativeCrops": [
    {
      "crop": "cropName",
      "score": inpercentage between 0 and 100,
      "reason": "in500Charectors",
      "expectedProfit": inINR,
      "expectedYield": inTons,
      "waterRequirement": inMM,
      "laborRequirement": inHours,
      "maturityTime": inDays,
      "riskLevel": "Low || Medium || High",
      "equipmentNeeded": ["", "", ""],
      "effortDistribution": {
        "setup": inHours,
        "maintenance": inHours,
        "harvesting": inHours
      },
      "resourceRequirements": {
        "waterNeeded": inLitres,
        "fertilizers": ["", "", ""],
        "pesticides": [""]
      }
    },
    {
      "crop": "cropName",
      "score": inpercentage between 0 and 100,
      "reason": "in500Charectors",
      "expectedProfit": inINR,
      "expectedYield": inTons,
      "waterRequirement": inLitres,
      "laborRequirement": inHours,
      "maturityTime": inDays,
      "riskLevel": "Medium || High || Very High || low",
      "equipmentNeeded": ["", "", ""],
      "effortDistribution": {
        "setup": inHours,
        "maintenance": inHours,
        "harvesting": inHours
      },
      "resourceRequirements": {
        "waterNeeded": inLitres,
        "fertilizers": ["", "", ""],
        "pesticides": [""]
      }
    },
    {
      "crop": "cropName",
      "score": inpercentage between 0 and 100,
      "reason": "in500Charectors",
      "expectedProfit": inINR,
      "expectedYield": inTons,
      "waterRequirement": inLitres,
      "laborRequirement": inHours,
      "maturityTime": inDays,
      "riskLevel": "Low || Medium || High",
      "equipmentNeeded": ["", "", ""],
      "effortDistribution": {
        "setup": inHours,
        "maintenance": inHours,
        "harvesting": inHours
      },
      "resourceRequirements": {
        "waterNeeded": inLitres,
        "fertilizers": ["", "", ""],
        "pesticides": [""]
      }
    },
    {
      "crop": "cropName",
      "score": inpercentage between 0 and 100,
      "reason": "in500Charectors",
      "expectedProfit": inINR,
      "expectedYield": inTons,
      "waterRequirement": inLitres,
      "laborRequirement": inHours,
      "maturityTime": inDays,
      "riskLevel": "Low || Medium || High",
      "equipmentNeeded": ["", "", ""],
      "effortDistribution": {
        "setup": inHours,
        "maintenance": inHours,
        "harvesting": inHours
      },
      "resourceRequirements": {
        "waterNeeded": inLitres,
        "fertilizers": ["", "", ""],
        "pesticides": [""]
      }
    }
  ]
}

REQUIREMENTS:
- Fill ALL fields with realistic values based on farmer data
- Use actual crop names suitable for the region
- Calculate profit based on MSP data and expected yield
- Consider soil conditions and climate data
- Provide 4-5 relevant alternative crops with different characteristics to give farmers multiple viable options
- Ensure variety in the alternative crops (different profit levels, risk levels, water requirements, maturity times)
- Rank alternative crops by their score (0-100) based on suitability for the farmer's conditions
- Return ONLY the JSON object, no additional text
`;

    // Call AI based on provider selection
    let aiResponse;
    if (aiProvider === 'openai') {
      console.log('Calling OpenAI...');
      aiResponse = await getOpenAIRecommendation(farmProfile);
    } else {
      console.log('Calling Together AI...');
      // Initialize Together AI inside the route handler
      const together = new Together({
        apiKey: process.env.TOGETHER_API_KEY,
      });
      const response = await together.chat.completions.create({
        messages: [
          {
            role: "user",
            content: farmProfile,
          },
        ],
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        temperature: 0.7,
        max_tokens: 3000,
        stop: ["</s>"],
      });
      aiResponse = response.choices[0].message.content;
    }
    console.log('Raw AI Response:', aiResponse);

    // Process AI response with error handling
    let recommendationData;

    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendationData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }

      // Validate required fields and provide defaults if missing
      const requiredFields = ['recommendedCrop', 'reason', 'confidenceScore', 'expectedProfit', 'expectedYield'];
      for (const field of requiredFields) {
        if (!(field in recommendationData)) {
          console.warn(`Missing required field: ${field}, setting default`);
          if (field === 'recommendedCrop') recommendationData.recommendedCrop = 'Tur (Arhar)';
          else if (field === 'reason') recommendationData.reason = 'AI recommendation based on soil and MSP data';
          else if (field === 'confidenceScore') recommendationData.confidenceScore = 70;
          else if (field === 'expectedProfit') recommendationData.expectedProfit = 80000;
          else if (field === 'expectedYield') recommendationData.expectedYield = 2.0;
        }
      }

      // Ensure arrays exist
      if (!Array.isArray(recommendationData.equipmentNeeded)) {
        recommendationData.equipmentNeeded = ['Tractor'];
      }
      if (!Array.isArray(recommendationData.alternativeCrops)) {
        recommendationData.alternativeCrops = [];
      }

    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      // Provide fallback recommendation if AI fails
      recommendationData = {
        recommendedCrop: 'Tur (Arhar)',
        reason: 'Fallback recommendation due to AI processing error. Tur (Arhar) has high MSP rates and is suitable for most soil types.',
        confidenceScore: 70,
        expectedProfit: 80000,
        expectedYield: 2.0,
        waterRequirement: 2000,
        laborRequirement: 100,
        maturityTime: 110,
        riskLevel: "Medium",
        equipmentNeeded: ["Tractor", "Plough"],
        effortDistribution: { setup: 20, maintenance: 50, harvesting: 30 },
        resourceRequirements: { waterNeeded: "2000 L/ha", fertilizers: ["Urea"], pesticides: ["Generic Pesticide"] },
        soilConditions: { suitability: "Good", analysis: "Tur is suitable for most Indian soil conditions" },
        marketAnalysis: { profitMargin: "25%", marketDemand: "Medium" },
        alternativeCrops: [
          {
            crop: "Groundnut",
            score: 85,
            reason: "High-value oilseed crop with stable market demand and good MSP support. Suitable for diverse soil types.",
            expectedProfit: 90000,
            expectedYield: 2.2,
            waterRequirement: 1500,
            laborRequirement: 90,
            maturityTime: 105,
            riskLevel: "Low",
            equipmentNeeded: ["Tractor", "Seed Drill"],
            effortDistribution: { setup: 15, maintenance: 45, harvesting: 30 },
            resourceRequirements: { waterNeeded: "1500 L/ha", fertilizers: ["DAP", "Urea"], pesticides: ["Cypermethrin"] }
          },
          {
            crop: "Cotton (Medium Staple)",
            score: 80,
            reason: "Excellent cash crop with high MSP rates. Suitable for moderate rainfall regions with good profit margins.",
            expectedProfit: 120000,
            expectedYield: 3.5,
            waterRequirement: 2500,
            laborRequirement: 150,
            maturityTime: 150,
            riskLevel: "Medium",
            equipmentNeeded: ["Tractor", "Cotton Picker"],
            effortDistribution: { setup: 30, maintenance: 70, harvesting: 50 },
            resourceRequirements: { waterNeeded: "2500 L/ha", fertilizers: ["Urea", "Potash"], pesticides: ["Pesticide Mix"] }
          },
          {
            crop: "Moong (Green Gram)",
            score: 75,
            reason: "Short-duration pulse crop with good MSP. Ideal for crop rotation and improves soil nitrogen content.",
            expectedProfit: 65000,
            expectedYield: 1.5,
            waterRequirement: 1200,
            laborRequirement: 70,
            maturityTime: 70,
            riskLevel: "Low",
            equipmentNeeded: ["Tractor", "Thresher"],
            effortDistribution: { setup: 10, maintenance: 35, harvesting: 25 },
            resourceRequirements: { waterNeeded: "1200 L/ha", fertilizers: ["DAP"], pesticides: ["Neem Oil"] }
          },
          {
            crop: "Sesamum (Til)",
            score: 70,
            reason: "High-value oilseed with excellent MSP rates. Requires less water and suitable for rain-fed conditions.",
            expectedProfit: 75000,
            expectedYield: 1.8,
            waterRequirement: 1000,
            laborRequirement: 80,
            maturityTime: 90,
            riskLevel: "Medium",
            equipmentNeeded: ["Tractor", "Harvester"],
            effortDistribution: { setup: 15, maintenance: 40, harvesting: 25 },
            resourceRequirements: { waterNeeded: "1000 L/ha", fertilizers: ["Urea", "SSP"], pesticides: ["Insecticide"] }
          }
        ]
      };
    }

    // Return the AI-generated recommendation
    res.json({
      success: true,
      recommendation: recommendationData
    });

  } catch (error) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({
      error: 'Failed to generate crop recommendation',
      details: error.message
    });
  }
});



module.exports = router;
