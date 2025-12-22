const express = require('express');
const router = express.Router();
const { getAllAPMCCrops, getHighDemandCrops } = require('../apmcData');
const { getTopProfitableCrops, generateCropRecommendation, generateCropOperationalDetails } = require('../profitabilityEngine');

/**
 * POST /api/profitable-crops
 * Get top profitable crops for a farmer based on their profile
 * 
 * Body:
 * {
 *   "farmerData": { ... }, // Optional farmer profile
 *   "region": "KUPPAM", // Optional, defaults to PALAMANER area
 *   "topN": 5 // Optional, number of crops to return
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { farmerData, region = "KUPPAM/PALAMANER", topN = 5 } = req.body;
    
    // Get available crops from APMC data
    const apmcCrops = getAllAPMCCrops();
    const cropNames = apmcCrops.map(c => c.crop);
    
    // Get land area from farmer data or use default
    const landArea = farmerData?.profile?.metaData?.masterData?.agriStack?.totalAreaHectares || 0.6;
    
    // Generate recommendations
    const recommendations = getTopProfitableCrops(cropNames, farmerData, topN);
    
    // Generate operational details for each crop recommendation
    const formattedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        // Generate operational details (replaces financial details)
        const operationalDetails = await generateCropOperationalDetails(
          rec.crop,
          rec,
          farmerData
        );
        
        return {
          crop: rec.crop,
          expectedIncome: `₹${rec.expectedIncome.toLocaleString('en-IN')}`,
          demand: rec.demand,
          successRate: `${rec.successRate}%`,
          details: operationalDetails, // Operational details instead of financial details
          marketInfo: rec.marketData ? {
            recentTrades: rec.marketData.recentTrades.length,
            totalArrivals: rec.marketData.totalArrivals,
            avgPrice: `₹${rec.marketData.avgModalPrice}/quintal`,
            volatility: rec.marketData.priceVolatility
          } : null
        };
      })
    );
    
    res.json({
      success: true,
      region,
      totalCropsAnalyzed: cropNames.length,
      recommendations: formattedRecommendations
    });
    
  } catch (error) {
    console.error('Error generating profitable crops:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/profitable-crops/analyze
 * Detailed analysis for a specific crop with LLM insights
 * 
 * Body:
 * {
 *   "cropName": "TOMATO",
 *   "farmerData": { ... } // Optional
 * }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { cropName, farmerData } = req.body;
    
    if (!cropName) {
      return res.status(400).json({
        success: false,
        error: 'cropName is required'
      });
    }
    
    const recommendation = generateCropRecommendation(cropName, farmerData);
    
    // Get LLM insights if API key available
    let llmInsights = null;
    if (process.env.OPENAI_API_KEY || process.env.TOGETHER_API_KEY) {
      const { generateLLMInsights } = require('../llmService');
      llmInsights = await generateLLMInsights(cropName, recommendation, farmerData);
    }
    
    res.json({
      success: true,
      crop: cropName,
      analysis: {
        expectedIncome: `₹${recommendation.expectedIncome.toLocaleString('en-IN')}`,
        demand: recommendation.demand,
        successRate: `${recommendation.successRate}%`,
        profitability: {
          roi: `${recommendation.profitability.roi}%`,
          totalCost: `₹${Math.round(recommendation.profitability.totalCost).toLocaleString('en-IN')}`,
          profit: `₹${Math.round(recommendation.profitability.profit).toLocaleString('en-IN')}`,
          pricePerQuintal: `₹${recommendation.profitability.pricePerQuintal}/quintal`,
          priceSource: recommendation.profitability.priceSource,
          costBreakdown: recommendation.profitability.costBreakdown
        },
        marketData: recommendation.marketData
      },
      llmInsights
    });
    
  } catch (error) {
    console.error('Error analyzing crop:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/profitable-crops/high-demand
 * Get high demand crops in the region
 */
router.get('/high-demand', (req, res) => {
  try {
    const highDemandCrops = getHighDemandCrops();
    
    const formatted = highDemandCrops.map(crop => ({
      crop: crop.crop,
      demand: crop.demand,
      totalArrivals: crop.totalArrivals,
      avgPrice: `₹${crop.avgModalPrice}/quintal`,
      volatility: crop.priceVolatility
    }));
    
    res.json({
      success: true,
      region: "PALAMANER",
      highDemandCrops: formatted
    });
    
  } catch (error) {
    console.error('Error fetching high demand crops:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/profitable-crops/market-overview
 * Get market overview for all crops
 */
router.get('/market-overview', (req, res) => {
  try {
    const allCrops = getAllAPMCCrops();
    
    const overview = {
      totalCrops: allCrops.length,
      totalArrivals: allCrops.reduce((sum, crop) => sum + crop.totalArrivals, 0),
      avgPrice: Math.round(
        allCrops.reduce((sum, crop) => sum + crop.avgModalPrice, 0) / allCrops.length
      ),
      crops: allCrops.map(crop => ({
        crop: crop.crop,
        avgPrice: `₹${crop.avgModalPrice}/quintal`,
        demand: crop.demand,
        arrivals: crop.totalArrivals,
        volatility: crop.priceVolatility
      }))
    };
    
    res.json({
      success: true,
      region: "PALAMANER",
      overview
    });
    
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
