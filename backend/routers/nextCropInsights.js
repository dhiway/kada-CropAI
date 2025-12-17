const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const dotenv = require('dotenv');
const { getMSPData } = require('../mspData');
const { getAPMCCropData } = require('../apmcData');

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
 * Determine crop category based on crop name
 */
function getCropCategory(crop) {
  if (!crop) return 'agriculture';
  
  const cropLower = crop.toLowerCase();
  
  // Horticulture crops (fruits, vegetables, flowers, spices)
  const horticultureKeywords = [
    'tomato', 'potato', 'onion', 'chilli', 'brinjal', 'cauliflower', 'cabbage',
    'beans', 'cucumber', 'gourd', 'okra', 'carrot', 'radish', 'beetroot',
    'mango', 'banana', 'orange', 'citrus', 'guava', 'papaya', 'pomegranate',
    'coconut', 'oilpalm', 'cashew', 'spice', 'turmeric', 'ginger', 'garlic',
    'flower', 'rose', 'marigold', 'chrysanthemum'
  ];
  
  // Sericulture crops (mulberry, silk-related)
  const sericultureKeywords = [
    'mulberry', 'silk', 'sericulture', 'silkworm'
  ];
  
  // Check for horticulture
  if (horticultureKeywords.some(keyword => cropLower.includes(keyword))) {
    return 'horticulture';
  }
  
  // Check for sericulture
  if (sericultureKeywords.some(keyword => cropLower.includes(keyword))) {
    return 'sericulture';
  }
  
  // Default to agriculture (grains, pulses, oilseeds, cash crops)
  return 'agriculture';
}

/**
 * Get government schemes for farmers in Andhra Pradesh
 * Returns filtered schemes based on farmer profile and crop details
 */
function getApplicableGovernmentSchemes(farmerProfile = {}, crop, farmingType = null) {
  const { irrigationMethod } = farmerProfile;
  const cropCategory = getCropCategory(crop);
  
  // All schemes with categories/tags from Excel file: Agricultural Schemes (2).xlsx
  const allSchemes = [
    // Universal schemes (always shown)
    {
      name: "e-Panta",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['universal']
    },
    {
      name: "PM Kisan Scheme",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['universal']
    },
    {
      name: "AnnadathaSukhibhava- PM Kisan Scheme",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['universal']
    },
    {
      name: "Crop Insurance",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['universal']
    },
    {
      name: "Rythu Seva Kendralu (RSKs)",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['universal']
    },
    {
      name: "Weekly Polam Pilisthundhi",
      link: "https://gad.ap.gov.in/annual_report/annual-administrative-report-2016-17-2.pdf",
      categories: ['universal']
    },
    
    // Agriculture-specific schemes
    {
      name: "National Mission on management of Soil Health & Fertility (NMSH&F",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "PM- RKVY- Rainfed Area Development (RAD) 2025-26",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Insight - Quality Control",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Integrated Agri labs",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Polambadi",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Farm Mechanisation",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture', 'mechanization']
    },
    {
      name: "Seed Farms",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Digital Agricultural Mission- GoI",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Fertilizers",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Sub Mission on Agricultural Extension (Agriculture Technology Management Agency- ATMA)",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Rashtriya Krishi Vikas Yojana (RKVY)",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "SUBSIDY SEED DISTRIBUTION",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    {
      name: "Natural calamities-Input Subsidy Relief to Affected Farmers",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture', 'universal']
    },
    {
      name: "NFSNM-Seed Components (erstwhile SMSP) ASSISTANCE FOR FOSTERING SEEDS OF NEW VARIETIES",
      link: "https://agriculture.ap.gov.in/home",
      categories: ['agriculture']
    },
    
    // Horticulture-specific schemes
    {
      name: "Andhra Pradesh Micro Irrigation Project (APMIP)",
      link: "https://horticulturedept.ap.gov.in/Horticulture/NewAboutUs.aspx",
      categories: ['horticulture', 'micro-irrigation']
    },
    {
      name: "Mission for Integrated Development of Horticulture (MIDH) in Andhra Pradesh",
      link: "https://horticulture.ap.nic.in/MIDH.html",
      categories: ['horticulture']
    },
    {
      name: "Rashtriya Krishi Vikas Yojana",
      link: "https://horticulture.ap.nic.in/RKVY.html",
      categories: ['horticulture']
    },
    {
      name: "National Food Security Mission-Oilpalm",
      link: "https://horticulture.ap.nic.in/OIL%20PALM.html",
      categories: ['horticulture']
    },
    {
      name: "Coconut Development Board",
      link: "https://horticulture.ap.nic.in/CDB.html",
      categories: ['horticulture']
    },
    
    // Sericulture-specific schemes
    {
      name: "Silk Samagra",
      link: "https://csb.gov.in/schemes/isdsi/",
      categories: ['sericulture']
    },
    {
      name: "Catalytic Development Programme during XII Five Year Plan (Centrally Sponsored Scheme)",
      link: "https://csb.gov.in/schemes/centrally-sponsored/",
      categories: ['sericulture']
    },
    {
      name: "All schemes related",
      link: "https://silks.csb.gov.in/eastgodavari/schemes-grants-for-farmers/",
      categories: ['sericulture']
    },
    {
      name: "Supply of Rearing appliances",
      link: "http://sericulture.ap.gov.in/sub_schemes.php?id=4",
      categories: ['sericulture']
    },
    {
      name: "Construction of Rearing Sheds",
      link: "http://sericulture.ap.gov.in/sub_schemes.php?id=3",
      categories: ['sericulture']
    },
    {
      name: "REMUNERATIVE APPROACHES FOR AGRICULTURE AND ALLIED SECTOR REJUNENATION",
      link: "http://sericulture.ap.gov.in/sub_schemes.php?id=18",
      categories: ['sericulture']
    },
    {
      name: "Development of Mulberry Bush Plantation",
      link: "http://sericulture.ap.gov.in/sub_schemes.php?id=19",
      categories: ['sericulture']
    },
    {
      name: "Construction of Silkworm Rearing Sheds (Type-I & Type-II)",
      link: "http://sericulture.ap.gov.in/sub_schemes.php?id=21",
      categories: ['sericulture']
    },
    {
      name: "Silk Samagra",
      link: "http://sericulture.ap.gov.in/schemes.php?id=4",
      categories: ['sericulture']
    },
    
    // Natural Farming schemes
    {
      name: "Bhartiya Prakritik Krishi Paddhati (BPKP), a sub-scheme under the Paramparagat Krishi Vikas Yojana (PKVY)",
      link: "https://blogs.isb.edu/bhartiinstitute/2024/12/03/natural-farming-in-andhra-pradesh-a-model-state-in-the-making/",
      categories: ['natural-farming']
    }
  ];
  
  // Filter schemes based on relevance
  const filteredSchemes = allSchemes.filter(scheme => {
    // Always include universal schemes
    if (scheme.categories.includes('universal')) {
      return true;
    }
    
    // Include schemes matching crop category
    if (scheme.categories.includes(cropCategory)) {
      return true;
    }
    
    // Include micro-irrigation schemes if farmer uses drip/sprinkler
    if (scheme.categories.includes('micro-irrigation')) {
      const irrigationUpper = irrigationMethod ? irrigationMethod.toUpperCase() : '';
      if (irrigationUpper === 'DRIP' || irrigationUpper === 'SPRINKLER' || irrigationUpper.includes('MICRO')) {
        return true;
      }
    }
    
    // Include natural farming schemes if farmer practices natural/organic farming
    if (scheme.categories.includes('natural-farming')) {
      const farmingTypeUpper = farmingType ? farmingType.toUpperCase() : '';
      if (farmingTypeUpper.includes('NATURAL') || farmingTypeUpper.includes('ORGANIC') || farmingTypeUpper.includes('PRACTICE')) {
        return true;
      }
    }
    
    // Include mechanization schemes (generally applicable)
    if (scheme.categories.includes('mechanization')) {
      return true;
    }
    
    return false;
  });
  
  // Remove duplicate schemes (some schemes appear multiple times)
  const uniqueSchemes = [];
  const seenNames = new Set();
  filteredSchemes.forEach(scheme => {
    if (!seenNames.has(scheme.name)) {
      seenNames.add(scheme.name);
      uniqueSchemes.push({
        name: scheme.name,
        link: scheme.link
      });
    }
  });
  
  return uniqueSchemes;
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
    const governmentSchemes = getApplicableGovernmentSchemes(farmerProfileForSchemes, suggestedCrop, farmingType);
    
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
    
    let aiInsights = aiResponse.choices[0].message.content;
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
    let parsedInsights = {};
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
