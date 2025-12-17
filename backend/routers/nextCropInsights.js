const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const dotenv = require('dotenv');
const { getMSPData } = require('../mspData');
const { getAPMCCropData } = require('../apmcData');
const { generateCacheKey, get, set } = require('../services/cacheService');

dotenv.config();

/**
 * Initialize Together AI client
 */
function initializeTogetherAI() {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY not configured');
  }
  
  return new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: 'https://api.together.xyz/v1'
  });
}

/**
 * Get government schemes for farmers in Andhra Pradesh
 * This function returns schemes applicable to the farmer profile and crop
 */
function getApplicableGovernmentSchemes(farmerProfile = {}, crop) {
  const schemes = [];
  const { bplFamily, gender, irrigationMethod } = farmerProfile;
  
  // Central Government Schemes
  schemes.push({
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    type: "Central",
    description: "Financial support of ₹6000 per year in three equal installments to all landholding farmers",
    eligibility: "All landholding farmers",
    benefit: "₹6000/year",
    applicability: "Universal"
  });
  
  schemes.push({
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    type: "Central",
    description: "Crop insurance scheme providing financial support in case of crop failure due to natural calamities",
    eligibility: "All farmers growing notified crops",
    benefit: "Insurance coverage up to sum insured",
    applicability: crop ? `Applicable for ${crop}` : "Applicable for notified crops"
  });
  
  schemes.push({
    name: "Kisan Credit Card (KCC)",
    type: "Central",
    description: "Credit facility for farmers to meet agricultural expenses including crop cultivation",
    eligibility: "All farmers with land ownership or tenancy",
    benefit: "Credit up to ₹3 lakhs at subsidized interest rates",
    applicability: "Universal"
  });
  
  // Andhra Pradesh State Schemes
  schemes.push({
    name: "Rythu Bharosa",
    type: "State (Andhra Pradesh)",
    description: "Financial assistance to farmers to support farm inputs and reduce cultivation costs",
    eligibility: "All farmers in Andhra Pradesh",
    benefit: "₹13,500/year (₹7,500 for Kharif + ₹6,000 for Rabi)",
    applicability: "Universal for AP farmers"
  });
  
  schemes.push({
    name: "YSR Free Crop Insurance",
    type: "State (Andhra Pradesh)",
    description: "Free crop insurance to farmers without any premium payment by farmers",
    eligibility: "Small and marginal farmers in AP",
    benefit: "100% premium paid by state government",
    applicability: "Zero premium crop insurance"
  });
  
  schemes.push({
    name: "YSR Yantra Seva",
    type: "State (Andhra Pradesh)",
    description: "Subsidy on agricultural equipment and machinery",
    eligibility: "Farmers purchasing agricultural equipment",
    benefit: "50% subsidy on farm equipment (up to specified limits)",
    applicability: "For mechanization support"
  });
  
  schemes.push({
    name: "YSR Sunna Vaddi Pathakam",
    type: "State (Andhra Pradesh)",
    description: "Interest subvention scheme for crop loans",
    eligibility: "Farmers availing crop loans",
    benefit: "Interest-free crop loans up to ₹1 lakh",
    applicability: "For timely loan repayment"
  });
  
  // BPL specific schemes
  if (bplFamily) {
    schemes.push({
      name: "National Food Security Mission (NFSM)",
      type: "Central",
      description: "Scheme to increase production of rice, wheat, pulses, coarse cereals and commercial crops",
      eligibility: "Priority to BPL and small farmers",
      benefit: "Subsidy on seeds, inputs, and farm equipment",
      applicability: "Priority assistance for BPL families"
    });
  }
  
  // Gender-specific schemes
  if (gender === "Female" || gender === "female") {
    schemes.push({
      name: "Mahila Kisan Sashaktikaran Pariyojana (MKSP)",
      type: "Central",
      description: "Scheme to empower women farmers through sustainable agricultural practices",
      eligibility: "Women farmers",
      benefit: "Training, inputs, and financial support",
      applicability: "Women farmer empowerment"
    });
  }
  
  // Drip irrigation schemes
  if (irrigationMethod && (irrigationMethod.toUpperCase() === "DRIP" || irrigationMethod.toUpperCase() === "SPRINKLER")) {
    schemes.push({
      name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
      type: "Central",
      description: "Scheme to enhance water use efficiency through micro-irrigation",
      eligibility: "Farmers adopting micro-irrigation",
      benefit: "Subsidy on drip/sprinkler irrigation systems",
      applicability: "Micro-irrigation support"
    });
  }
  
  return schemes;
}

/**
 * Calculate stage-wise investment requirements
 */
function calculateStageWiseInvestment(stages, crop, landArea = 0.6) {
  const stageNames = [
    "Treating Soil",
    "Land Preparation", 
    "Sowing",
    "Crop Protection",
    "Vegetative Stage",
    "Flowering",
    "Fruiting",
    "Harvesting",
    "Post Harvest"
  ];
  
  const stageInvestments = stages.map((stage, index) => {
    let totalCost = 0;
    const breakdown = [];
    
    if (stage.categories && Array.isArray(stage.categories)) {
      stage.categories.forEach(category => {
        if (category.data && category.data.totalCost) {
          totalCost += category.data.totalCost;
          
          let categoryName = category.category.replace(/_/g, ' ').toLowerCase();
          categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
          
          breakdown.push({
            category: categoryName,
            cost: category.data.totalCost,
            details: getCategoryDetails(category)
          });
        }
      });
    }
    
    return {
      stage: index + 1,
      name: stageNames[index] || stage.stageName,
      totalCost: totalCost,
      costPerAcre: Math.round(totalCost / (landArea * 2.47)), // Convert hectares to acres
      breakdown: breakdown
    };
  });
  
  const totalInvestment = stageInvestments.reduce((sum, stage) => sum + stage.totalCost, 0);
  
  return {
    totalInvestment,
    totalInvestmentPerAcre: Math.round(totalInvestment / (landArea * 2.47)),
    stages: stageInvestments,
    landAreaHectares: landArea,
    landAreaAcres: Math.round(landArea * 2.47 * 100) / 100
  };
}

/**
 * Get category details for breakdown
 */
function getCategoryDetails(category) {
  const data = category.data;
  const details = {};
  
  if (data.days) details.days = data.days;
  if (data.persons) details.persons = data.persons;
  if (data.wagePerDay) details.wagePerDay = data.wagePerDay;
  if (data.quantity) details.quantity = data.quantity;
  if (data.equipmentName) details.equipment = data.equipmentName;
  if (data.costPerDay) details.costPerDay = data.costPerDay;
  
  return details;
}

/**
 * Get market data for crop
 */
function getMarketData(crop) {
  const apmcData = getAPMCCropData(crop);
  const mspDataAll = getMSPData();
  
  let marketPrice = null;
  let mspPrice = null;
  
  if (apmcData) {
    marketPrice = {
      price: apmcData.avgModalPrice,
      source: `APMC ${apmcData.region}`,
      priceRange: {
        min: apmcData.minPrice,
        max: apmcData.maxPrice
      }
    };
  }
  
  // Find MSP for crop
  const mspKey = Object.keys(mspDataAll).find(key => 
    key.toLowerCase().includes(crop.toLowerCase()) || 
    crop.toLowerCase().includes(key.toLowerCase().split(' ')[0])
  );
  
  if (mspKey) {
    const mspEntry = mspDataAll.find(d => d.crop === mspKey);
    if (mspEntry) {
      mspPrice = {
        price: mspEntry.msp["2025-26"],
        trend: mspEntry.trend,
        category: mspEntry.category
      };
    }
  }
  
  return { marketPrice, mspPrice };
}

/**
 * Main API endpoint for Next Crop Selection & AI Insights
 */
router.post('/', async (req, res) => {
  console.log('API called: /api/next-crop-insights');
  
  try {
    const {
      landArea,
      currentCrop,
      stages,
      suggestedCrop,
      season = 'Kharif',
      region = 'Kuppam',
      language = 'en',
      // Optional fields
      currentYield,
      currentIncome,
      bplFamily,
      gender,
      education,
      irrigationMethod,
      waterSource,
      farmingType
    } = req.body;
    
    // Validate required fields
    if (!landArea || !currentCrop || !stages || !suggestedCrop) {
      return res.status(400).json({
        success: false,
        error: 'landArea, currentCrop, stages, and suggestedCrop are required fields'
      });
    }
    
    // Validate stages array
    if (!Array.isArray(stages) || stages.length !== 9) {
      return res.status(400).json({
        success: false,
        error: 'stages must be an array of 9 crop stages'
      });
    }
    
    // Extract farmer data (with defaults)
    const farmerLandArea = parseFloat(landArea) || 0.6;
    const farmerCurrentCrop = currentCrop || 'Previous Crop';
    const farmerCurrentYield = currentYield || null;
    const farmerCurrentIncome = currentIncome || null;
    
    // Calculate stage-wise investment
    console.log('Calculating stage-wise investment...');
    const investmentAnalysis = calculateStageWiseInvestment(stages, suggestedCrop, farmerLandArea);
    
    // Get market data
    console.log('Fetching market data...');
    const marketData = getMarketData(suggestedCrop);
    
    // Get applicable government schemes
    console.log('Fetching applicable government schemes...');
    const farmerProfileForSchemes = { bplFamily, gender, irrigationMethod };
    const governmentSchemes = getApplicableGovernmentSchemes(farmerProfileForSchemes, suggestedCrop);
    
    // Check cache for AI insights
    const cacheParams = {
      crop: suggestedCrop?.toLowerCase(),
      season: season?.toLowerCase(),
      region: region?.toLowerCase(),
      landArea: farmerLandArea,
      currentCrop: farmerCurrentCrop?.toLowerCase(),
      currentYield: farmerCurrentYield,
      currentIncome: farmerCurrentIncome,
      investmentTotal: investmentAnalysis.totalInvestment,
      farmerProfileHash: JSON.stringify({
        bplFamily,
        gender,
        education,
        irrigationMethod,
        waterSource,
        farmingType
      }).substring(0, 100)
    };
    const cacheKey = generateCacheKey('next-crop-insights', cacheParams);
    
    // Try to get cached AI insights
    let parsedInsights = null;
    let aiInsights = null;
    const cachedInsights = await get(cacheKey);
    
    if (cachedInsights) {
      console.log('Using cached AI insights');
      parsedInsights = cachedInsights.parsedInsights;
      aiInsights = cachedInsights.aiInsights;
    } else {
      // Initialize Together AI
      console.log('Initializing Together AI...');
      const client = initializeTogetherAI();
    
      // Build comprehensive prompt for AI
      const aiPrompt = `You are an expert agricultural advisor for Andhra Pradesh, specifically for the ${region} region in Chittoor district.

**FARMER PROFILE:**
- Location: ${region}, Andhra Pradesh
- Land Area: ${farmerLandArea} hectares (${(farmerLandArea * 2.47).toFixed(2)} acres)
- Current Crop: ${farmerCurrentCrop}
- Current Yield: ${farmerCurrentYield ? `${farmerCurrentYield} kg` : 'Not provided'}
- Current Income: ${farmerCurrentIncome ? `₹${farmerCurrentIncome}` : 'Not provided'}
- BPL Family: ${bplFamily ? 'Yes' : 'No'}
- Education: ${education || 'N/A'}
- Irrigation: ${irrigationMethod || 'N/A'}
- Water Source: ${waterSource || 'N/A'}
- Farming Type: ${farmingType || 'Conventional'}

**SUGGESTED CROP FOR ANALYSIS:** ${suggestedCrop}
**SEASON:** ${season}
**REGION CONTEXT:** ${region} region, Chittoor district, Andhra Pradesh

**INVESTMENT ANALYSIS:**
Total Investment Required: ₹${investmentAnalysis.totalInvestment.toLocaleString('en-IN')}
Investment per Acre: ₹${investmentAnalysis.totalInvestmentPerAcre.toLocaleString('en-IN')}

**MARKET DATA:**
${marketData.marketPrice ? `APMC Price: ₹${marketData.marketPrice.price}/quintal (${marketData.marketPrice.source})` : 'APMC Price: Not available'}
${marketData.mspPrice ? `MSP 2025-26: ₹${marketData.mspPrice.price}/quintal` : 'MSP: Not available'}

**CURRENT CROP COMPARISON:**
Current Crop: ${farmerCurrentCrop}
Current Yield: ${farmerCurrentYield ? `${farmerCurrentYield} kg` : 'Not provided'}
Current Income: ${farmerCurrentIncome ? `₹${farmerCurrentIncome}` : 'Not provided'}

**TASK:**
Provide a detailed analysis for growing ${suggestedCrop} in the ${season} season in ${region} region, structured as follows:

**TASK:**
You must respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations. Just pure JSON.

Required JSON structure:
{
  "projections": {
    "expectedYieldKg": <number: expected yield in kg for ${farmerLandArea} hectares>,
    "expectedYieldQuintals": <number: yield in quintals>,
    "marketPricePerQuintal": <number: realistic market price in rupees>,
    "estimatedRevenue": <number: yield × price>,
    "estimatedProfit": <number: revenue minus ${investmentAnalysis.totalInvestment}>
  },
  "riskFactors": [
    "<risk 1: climate/weather specific to ${season}>",
    "<risk 2: market volatility>",
    "<risk 3: pest/disease>",
    "<risk 4: water/resource>",
    "<risk 5: region-specific>"
  ],
  "successFactors": [
    "<factor 1: best practice for ${suggestedCrop}>",
    "<factor 2: timing for ${season}>",
    "<factor 3: water management>",
    "<factor 4: market strategy>",
    "<factor 5: quality tips>"
  ],
  "comparison": {
    "investmentChange": "<text: compare ₹${investmentAnalysis.totalInvestment} with typical ${farmerCurrentCrop} investment>",
    "profitImprovement": "<text with numbers: ${farmerCurrentIncome ? `compare profit with current ₹${farmerCurrentIncome}` : 'estimate improvement percentage'}>",
    "riskLevel": "<Low/Medium/High: compare ${suggestedCrop} vs ${farmerCurrentCrop} risk with reasoning>"
  },
  "recommendations": [
    "<recommendation 1>",
    "<recommendation 2>",
    "<recommendation 3>"
  ],
  "insights": "<1-2 paragraphs: detailed analysis specific to ${region}, ${season}, and farmer profile>"
}

**CALCULATION NOTES:**
- Base market price: ${marketData.marketPrice?.price || marketData.mspPrice?.price || 3500}/quintal
- Average ${suggestedCrop} yield in ${region}: research regional data
- Season ${season} price variations: consider market trends
- Investment: ₹${investmentAnalysis.totalInvestment}
- Current income: ${farmerCurrentIncome ? `₹${farmerCurrentIncome}` : 'not provided'}

Return ONLY the JSON object.`;

      console.log('Calling Together AI for insights...');
      const aiResponse = await client.chat.completions.create({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [
          {
            role: "system",
            content: "You are a precise agricultural data analyst for Andhra Pradesh. You ONLY respond with valid JSON objects. Never use markdown, never explain, just pure JSON with accurate farming data for Chittoor district."
          },
          {
            role: "user",
            content: aiPrompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });
      
      aiInsights = aiResponse.choices[0].message.content;
      console.log('AI insights generated successfully');
      console.log('Raw AI response length:', aiInsights.length);
      
      // Clean up response - remove markdown code blocks if present
      aiInsights = aiInsights.trim();
      if (aiInsights.startsWith('```json')) {
        aiInsights = aiInsights.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (aiInsights.startsWith('```')) {
        aiInsights = aiInsights.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Parse AI response to extract structured data
      parsedInsights = {};
      try {
        // Try to parse as JSON
        parsedInsights = JSON.parse(aiInsights);
        console.log('Successfully parsed AI response as JSON');
      } catch (e) {
        console.error('Failed to parse AI response as JSON:', e.message);
        console.log('First 200 chars of response:', aiInsights.substring(0, 200));
        // If not JSON, keep as text
        parsedInsights = { rawInsights: aiInsights };
      }
      
      // Cache the AI insights
      await set(cacheKey, {
        parsedInsights,
        aiInsights
      }, 6); // Cache for 6 hours
    }
    
    // Build final response
    const response = {
      success: true,
      data: {
        crop: suggestedCrop,
        season: season,
        region: region,
        
        // Investment Requirements
        investmentRequirements: {
          totalInvestment: investmentAnalysis.totalInvestment,
          totalInvestmentPerAcre: investmentAnalysis.totalInvestmentPerAcre,
          landArea: {
            hectares: investmentAnalysis.landAreaHectares,
            acres: investmentAnalysis.landAreaAcres
          },
          stages: investmentAnalysis.stages
        },
        
        // AI-Powered Projections (from AI or calculated)
        aiProjections: parsedInsights.projections ? {
          expectedYield: {
            kg: parsedInsights.projections.expectedYieldKg,
            quintals: parsedInsights.projections.expectedYieldQuintals
          },
          marketPrice: parsedInsights.projections.marketPricePerQuintal || marketData.marketPrice?.price || marketData.mspPrice?.price,
          estimatedRevenue: parsedInsights.projections.estimatedRevenue,
          estimatedProfit: parsedInsights.projections.estimatedProfit
        } : {
          expectedYield: {
            kg: null,
            quintals: null,
            note: "AI response not properly formatted"
          },
          marketPrice: marketData.marketPrice?.price || marketData.mspPrice?.price || null,
          estimatedRevenue: null,
          estimatedProfit: null
        },
        
        // Market Context
        marketContext: {
          apmcPrice: marketData.marketPrice,
          mspPrice: marketData.mspPrice,
          priceSource: marketData.marketPrice ? 'APMC' : (marketData.mspPrice ? 'MSP' : 'Estimated')
        },
        
        // Risk and Success Factors
        riskFactors: parsedInsights.riskFactors || [],
        successFactors: parsedInsights.successFactors || [],
        
        // Comparison with Previous Crop
        comparisonWithPreviousCrop: {
          previousCrop: {
            name: farmerCurrentCrop,
            yield: farmerCurrentYield,
            income: farmerCurrentIncome,
            investment: investmentAnalysis.totalInvestment // Using same stages
          },
          suggestedCrop: {
            name: suggestedCrop,
            estimatedYield: parsedInsights.projections?.expectedYieldKg || null,
            estimatedIncome: parsedInsights.projections?.estimatedRevenue || null,
            investment: investmentAnalysis.totalInvestment
          },
          comparison: parsedInsights.comparison || {
            investmentChange: "AI response not properly formatted",
            profitImprovement: "AI response not properly formatted",
            riskLevel: "AI response not properly formatted"
          }
        },
        
        // Key Recommendations
        recommendations: parsedInsights.recommendations || [],
        
        // Government Schemes
        applicableSchemes: governmentSchemes,
        
        // AI Insights (full text)
        aiInsights: aiInsights,
        
        // Metadata
        metadata: {
          generatedAt: new Date().toISOString(),
          aiProvider: "Together AI",
          model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          region: region,
          season: season
        }
      }
    };
    
    console.log('Response prepared successfully');
    res.json(response);
    
  } catch (error) {
    console.error('Error in next-crop-insights API:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
