const express = require('express');
const router = express.Router();
const Together = require('together-ai');

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY
});

router.post('/analyze', async (req, res) => {
  try {
    const {
      cropName,           // OPTIONAL - will be asked to provide or inferred
      season,             // OPTIONAL - will be inferred from sowingDate
      landArea,
      location,
      actualYield,
      expectedYield,
      costs,
      income,
      cropDetails,
      challenges
    } = req.body;

    // Validate required fields
    if (!actualYield || !costs || !income) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['actualYield', 'costs', 'income']
      });
    }

    // Infer season from sowing date if not provided
    let inferredSeason = season;
    if (!season && cropDetails?.sowingDate) {
      inferredSeason = inferSeasonFromDate(cropDetails.sowingDate);
    }

    // Use variety as crop name if crop name not provided
    const finalCropName = cropName || cropDetails?.variety || 'Unknown Crop';

    // Create prompt for AI
    const prompt = createAnalysisPrompt({
      cropName: finalCropName,
      season: inferredSeason || 'Unknown Season',
      landArea: landArea || 1,
      location: location || {},
      actualYield,
      expectedYield: expectedYield || actualYield * 1.2,
      costs,
      income,
      cropDetails: cropDetails || {},
      challenges: challenges || []
    });

    // Call Together AI
    const response = await together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an agricultural financial analyst specializing in crop loss analysis for Indian farmers. Provide detailed, actionable insights based on the data provided. Always present monetary values in Indian Rupees (₹) and yields in quintals.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const analysis = response.choices[0].message.content;

    // Calculate summary metrics
    const totalCost = Object.values(costs).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    const totalIncome = Object.values(income).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    const netProfit = totalIncome - totalCost;
    const yieldGap = (expectedYield || actualYield * 1.2) - actualYield;

    res.json({
      success: true,
      data: {
        cropName: finalCropName,
        season: inferredSeason,
        summary: {
          totalCost,
          totalIncome,
          netProfit,
          profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0,
          actualYield,
          expectedYield: expectedYield || actualYield * 1.2,
          yieldGap
        },
        analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Loss analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate loss analysis',
      details: error.message
    });
  }
});

// Helper function to infer season from sowing date
function inferSeasonFromDate(dateString) {
  try {
    // Parse date in DD-MM-YYYY format
    const parts = dateString.split('-');
    let month, year;
    
    if (parts.length === 3) {
      month = parseInt(parts[1]);
      year = parseInt(parts[2]);
    } else {
      return 'Unknown Season';
    }

    // Indian agricultural seasons:
    // Kharif: June-October (monsoon crops) - sowing June-July
    // Rabi: November-March (winter crops) - sowing October-November
    // Zaid/Summer: March-June (summer crops) - sowing March-April

    if (month >= 6 && month <= 7) {
      return `Kharif ${year}`;
    } else if (month >= 10 && month <= 11) {
      return `Rabi ${year}-${year + 1}`;
    } else if (month >= 3 && month <= 4) {
      return `Zaid ${year}`;
    } else if (month >= 1 && month <= 2) {
      return `Rabi ${year - 1}-${year}`;
    } else if (month >= 8 && month <= 9) {
      return `Kharif ${year}`;
    } else {
      return `${year}`;
    }
  } catch (error) {
    return 'Unknown Season';
  }
}

// Create AI prompt
function createAnalysisPrompt(data) {
  const totalCost = Object.values(data.costs).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  const totalIncome = Object.values(data.income).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  const netProfit = totalIncome - totalCost;
  const yieldGap = data.expectedYield - data.actualYield;

  return `Analyze the crop loss and provide recommendations for the following farming data:

**Crop Information:**
- Crop/Variety: ${data.cropName}
- Season: ${data.season}
- Land Area: ${data.landArea} hectares
${data.location?.village ? `- Location: ${data.location.village}${data.location.mandal ? `, ${data.location.mandal}` : ''}` : ''}

**Yield Analysis:**
- Actual Yield: ${data.actualYield} quintals
- Expected Yield: ${data.expectedYield} quintals
- Yield Gap: ${yieldGap} quintals (${((yieldGap / data.expectedYield) * 100).toFixed(1)}% less than expected)

**Cost Breakdown (₹):**
${data.costs.labour ? `- Labour: ₹${data.costs.labour}` : ''}
${data.costs.seeds ? `- Seeds: ₹${data.costs.seeds}` : ''}
${data.costs.fertilizers ? `- Fertilizers: ₹${data.costs.fertilizers}` : ''}
${data.costs.pesticides ? `- Pesticides: ₹${data.costs.pesticides}` : ''}
${data.costs.irrigation ? `- Irrigation: ₹${data.costs.irrigation}` : ''}
${data.costs.equipment ? `- Equipment: ₹${data.costs.equipment}` : ''}
${data.costs.transportation ? `- Transportation: ₹${data.costs.transportation}` : ''}
${data.costs.other ? `- Other: ₹${data.costs.other}` : ''}
- **Total Cost: ₹${totalCost}**

**Income (₹):**
${data.income.yieldSale ? `- From Yield Sale: ₹${data.income.yieldSale}` : ''}
${data.income.byproducts ? `- From By-products: ₹${data.income.byproducts}` : ''}
${data.income.residue ? `- From Residue: ₹${data.income.residue}` : ''}
${data.income.subsidy ? `- Government Subsidy: ₹${data.income.subsidy}` : ''}
- **Total Income: ₹${totalIncome}**

**Financial Summary:**
- **Net Profit/Loss: ₹${netProfit}** ${netProfit < 0 ? '(LOSS)' : '(PROFIT)'}
- Profit Margin: ${totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%

**Farming Details:**
${data.cropDetails?.waterSource ? `- Water Source: ${data.cropDetails.waterSource}` : ''}
${data.cropDetails?.irrigationMethod ? `- Irrigation Method: ${data.cropDetails.irrigationMethod}` : ''}
${data.cropDetails?.sowingDate ? `- Date of Sowing: ${data.cropDetails.sowingDate}` : ''}
${data.cropDetails?.harvestDate ? `- Date of Harvest: ${data.cropDetails.harvestDate}` : ''}
${data.cropDetails?.soilType ? `- Soil Type: ${data.cropDetails.soilType}` : ''}

${data.challenges && data.challenges.length > 0 ? `**Challenges Faced:**
${data.challenges.map(c => `- ${c}`).join('\n')}` : ''}

Please provide a comprehensive loss analysis in the following format:

**Primary Factors:**
List 3-5 main factors that contributed to the loss or reduced profit. For each factor:
- Clearly identify the issue
- Quantify the financial impact in ₹ (estimate based on provided data)
- Calculate percentage increase in costs or decrease in expected income
- Example: "Pest attack increased pesticide costs by 25% (₹4,500 extra)"

**Recommendations for Next Cycle:**
Provide 4-6 specific, actionable recommendations:
- Focus on cost reduction strategies
- Yield improvement techniques
- Better resource management (water, fertilizer, pesticides)
- Market timing and price strategies
- Risk mitigation (insurance, diversification)
- Technology adoption suggestions

Keep the analysis practical, specific to Indian agricultural context, and directly applicable to the crop cultivation.`;
}

module.exports = router;
