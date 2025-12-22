const express = require('express');
const router = express.Router();
const Together = require('together-ai');

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY
});

router.post('/recommendations', async (req, res) => {
  try {
    const {
      location,
      landArea,
      currentCrop,
      soilType,
      waterSource,
      currentPractices,
      challenges
    } = req.body;

    // Validate required fields
    if (!location || !location.mandal) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['location (with mandal)']
      });
    }

    // Create prompt for AI
    const prompt = createNaturalFarmingPrompt({
      location: location || {},
      landArea: landArea || 1,
      currentCrop: currentCrop || 'mixed crops',
      soilType: soilType || 'red soil',
      waterSource: waterSource || 'bore well',
      currentPractices: currentPractices || {},
      challenges: challenges || []
    });

    // Call Together AI
    const response = await together.chat.completions.create({
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in natural farming and sustainable agriculture practices in India, with deep knowledge of Andhra Pradesh agricultural conditions, particularly the Kuppam region. Provide practical, locally-relevant recommendations that farmers can implement immediately.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const aiResponse = response.choices[0].message.content;

    // Parse the AI response to extract benefits and practices
    const parsedResponse = parseNaturalFarmingResponse(aiResponse);

    res.json({
      success: true,
      data: {
        location: {
          village: location.village,
          mandal: location.mandal,
          region: 'Andhra Pradesh'
        },
        landArea,
        currentCrop,
        benefits: parsedResponse.benefits,
        recommendedPractices: parsedResponse.practices,
        rawAnalysis: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Natural farming recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate natural farming recommendations',
      details: error.message
    });
  }
});

// Create AI prompt for natural farming recommendations
function createNaturalFarmingPrompt(data) {
  return `Provide natural farming recommendations for a farmer in the Kuppam region of Andhra Pradesh, India.

**Farmer's Current Situation:**
- Location: ${data.location.village ? `${data.location.village}, ` : ''}${data.location.mandal}, Andhra Pradesh
- Land Area: ${data.landArea} hectares
- Current Crop: ${data.currentCrop}
- Soil Type: ${data.soilType}
- Water Source: ${data.waterSource}

**Current Farming Practices:**
${data.currentPractices.usesChemicalFertilizers !== undefined ? `- Uses Chemical Fertilizers: ${data.currentPractices.usesChemicalFertilizers ? 'Yes' : 'No'}` : ''}
${data.currentPractices.usesPesticides !== undefined ? `- Uses Chemical Pesticides: ${data.currentPractices.usesPesticides ? 'Yes' : 'No'}` : ''}
${data.currentPractices.irrigationMethod ? `- Irrigation Method: ${data.currentPractices.irrigationMethod}` : ''}
${data.currentPractices.hasLivestock !== undefined ? `- Has Livestock: ${data.currentPractices.hasLivestock ? 'Yes' : 'No'}` : ''}

${data.challenges && data.challenges.length > 0 ? `**Current Challenges:**
${data.challenges.map(c => `- ${c}`).join('\n')}` : ''}

**Context for Kuppam Region:**
Kuppam is located in the southeastern part of Andhra Pradesh, bordering Karnataka and Tamil Nadu. The region typically has:
- Red soil and black soil types
- Semi-arid climate with erratic rainfall
- Average annual rainfall: 800-900mm
- Temperature: 20°C to 40°C
- Common crops: Groundnut, Ragi, Tomato, Mango, Flowers
- Water scarcity issues in summer months

Please provide detailed recommendations in the following EXACT format:

## BENEFITS

List 5-7 key benefits of transitioning to natural farming for this specific farmer. Each benefit should:
- Be specific and quantifiable where possible
- Address soil health, cost reduction, sustainability, and market advantages
- Include expected outcomes (e.g., "Reduce input costs by 40-60%" or "Improve soil organic matter from 0.5% to 2% in 2-3 years")
- Be relevant to Kuppam region conditions

Format each benefit as a bullet point starting with "- "

## RECOMMENDED PRACTICES

Provide 8-12 specific natural farming practices organized into clear categories. For each practice:
- Give the practice name and category (e.g., Soil Health, Pest Management, Water Conservation)
- Explain HOW to implement it step-by-step
- Mention WHEN to apply it (season/timing)
- Include local materials and resources available in Kuppam
- Specify expected results and timeline

Categories to cover:
1. Soil Health & Fertility Management
2. Natural Pest & Disease Management
3. Water Conservation & Management
4. Seed Treatment & Crop Protection
5. Livestock Integration (if applicable)
6. Composting & Organic Inputs

Format each practice as:
**[Category] - [Practice Name]:**
[Detailed explanation with steps, timing, and expected outcomes]

Focus on:
- Zero-Budget Natural Farming (ZBNF) principles popular in Andhra Pradesh
- Locally available materials (neem, cow dung, cow urine, jaggery, etc.)
- Season-specific recommendations for Kuppam's climate
- Practices suitable for the farmer's current crop and land size
- Cost-effective solutions for small and marginal farmers
- Traditional knowledge integrated with modern understanding

Be practical, specific, and actionable. Avoid generic advice.`;
}

// Parse AI response to extract structured data
function parseNaturalFarmingResponse(aiResponse) {
  const result = {
    benefits: [],
    practices: []
  };

  try {
    // Split response into sections
    const sections = aiResponse.split(/##\s+/);
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      const sectionTitle = lines[0].toUpperCase();

      if (sectionTitle.includes('BENEFIT')) {
        // Extract benefits
        const benefits = lines.slice(1)
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim()))
          .map(line => line.replace(/^[-•\d.]\s*/, '').trim())
          .filter(line => line.length > 10);
        
        result.benefits = benefits;
      } else if (sectionTitle.includes('PRACTICE') || sectionTitle.includes('RECOMMENDED')) {
        // Extract practices
        let currentPractice = null;
        
        lines.slice(1).forEach(line => {
          const trimmedLine = line.trim();
          
          // Check if it's a practice heading (bold or contains category)
          if (trimmedLine.startsWith('**') || trimmedLine.includes(':')) {
            if (currentPractice && currentPractice.description) {
              result.practices.push(currentPractice);
            }
            
            // Extract practice name and category
            const practiceText = trimmedLine.replace(/\*\*/g, '').replace(/:/g, '');
            const parts = practiceText.split('-').map(p => p.trim());
            
            currentPractice = {
              category: parts.length > 1 ? parts[0] : 'General Practice',
              name: parts.length > 1 ? parts.slice(1).join(' - ') : parts[0],
              description: ''
            };
          } else if (currentPractice && trimmedLine.length > 0) {
            // Add to current practice description
            currentPractice.description += (currentPractice.description ? ' ' : '') + trimmedLine;
          }
        });
        
        // Add the last practice
        if (currentPractice && currentPractice.description) {
          result.practices.push(currentPractice);
        }
      }
    });

    // If parsing didn't work well, create a fallback structure
    if (result.benefits.length === 0 || result.practices.length === 0) {
      // Split by double newlines and try to identify benefits and practices
      const paragraphs = aiResponse.split(/\n\n+/).filter(p => p.trim().length > 0);
      
      let inBenefits = false;
      let inPractices = false;
      
      paragraphs.forEach(para => {
        const upperPara = para.toUpperCase();
        
        if (upperPara.includes('BENEFIT')) {
          inBenefits = true;
          inPractices = false;
          return;
        } else if (upperPara.includes('PRACTICE') || upperPara.includes('RECOMMENDED')) {
          inPractices = true;
          inBenefits = false;
          return;
        }
        
        if (inBenefits && result.benefits.length === 0) {
          // Extract bullet points as benefits
          const bullets = para.split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || /^\d+\./.test(line.trim()))
            .map(line => line.replace(/^[-•\d.]\s*/, '').trim())
            .filter(line => line.length > 10);
          result.benefits = bullets;
        } else if (inPractices && result.practices.length === 0) {
          // Try to extract practices
          const practices = para.split(/\n(?=\*\*|[A-Z].*:)/)
            .filter(p => p.trim().length > 20)
            .map(p => ({
              category: 'Natural Farming Practice',
              name: p.split(':')[0].replace(/\*\*/g, '').trim(),
              description: p.split(':').slice(1).join(':').trim() || p
            }));
          result.practices = practices;
        }
      });
    }

  } catch (error) {
    console.error('Error parsing natural farming response:', error);
  }

  return result;
}

module.exports = router;
