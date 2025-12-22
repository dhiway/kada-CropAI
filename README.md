# 🌾 CropAI - AI-Powered Crop Recommendation System

<div align="center">

![CropAI Logo](https://img.shields.io/badge/CropAI-Agriculture--AI-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19+-blue?style=flat-square&logo=react)
![Express](https://img.shields.io/badge/Express-5.1+-black?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Ready-green?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**Revolutionizing Agriculture with AI-Powered Crop Recommendations**

[🚀 Live Demo](#) | [📖 Documentation](#api-documentation) | [🔧 Installation](#installation)

</div>

---

## 🌟 Overview

CropAI is an intelligent agricultural platform that leverages artificial intelligence to provide personalized crop recommendations for farmers. By analyzing comprehensive farming data including soil health, climate conditions, historical yields, and government MSP (Minimum Support Price) data, CropAI helps farmers make data-driven decisions to maximize profitability and sustainability.

### ✨ Key Features

- 🤖 **AI-Powered Recommendations**: Uses advanced AI models (OpenAI GPT-4 or Together AI Mistral-7B)
- 📊 **MSP Integration**: Real-time integration with Government of India MSP data (2015-2026)
- 🌱 **Comprehensive Analysis**: Considers soil health, climate, land details, and farmer profiles
- 💰 **Profit Optimization**: Calculates expected profits, yields, and resource requirements
- 🔄 **Alternative Options**: Provides multiple crop alternatives with detailed comparisons
- 📱 **Modern UI**: Responsive React interface with intuitive farmer data collection
- 🛡️ **Risk Assessment**: Evaluates crop risks and provides mitigation strategies

---

## 🏗️ Architecture

### Project Structure

```
CropAI/
├── backend/                      # Node.js/Express API Server
│   ├── server.js                # Main Express server and entry point
│   ├── routers/                 # API route handlers
│   │   ├── recommendation.js    # Crop recommendation endpoint
│   │   ├── lossAnalysis.js      # Crop loss analysis endpoint
│   │   ├── naturalFarming.js    # Natural farming recommendations
│   │   ├── profitableCrops.js   # Profitable crops analysis
│   │   └── nextCropInsights.js  # Next crop planning insights
│   ├── mspData.js               # Government MSP (Minimum Support Price) data
│   ├── apmcData.js              # APMC (Agricultural Produce Market Committee) data
│   ├── profitabilityEngine.js   # Crop profitability calculation engine
│   ├── llmService.js            # LLM (AI) service integration
│   ├── sample-request.json      # Sample API request data
│   ├── package.json             # Backend dependencies
│   ├── .env                     # Environment variables (create this)
│   └── node_modules/            # Backend dependencies (generated)
│
├── frontend/                     # React Application (Vite)
│   ├── src/
│   │   ├── App.jsx              # Main application component
│   │   ├── main.jsx             # React application entry point
│   │   ├── App.css              # Application styles
│   │   ├── index.css            # Global styles and Tailwind imports
│   │   ├── i18n.ts              # Internationalization configuration
│   │   └── assets/              # Static assets (images, icons)
│   ├── index.html               # HTML template
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite build configuration
│   ├── tailwind.config.js       # TailwindCSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── eslint.config.js         # ESLint configuration
│   └── node_modules/            # Frontend dependencies (generated)
│
├── API_DOCUMENTATION.md          # Detailed API documentation
└── README.md                     # This file - Project documentation
```

### Key Files Explained

**Backend**:
- `server.js`: Express server setup, middleware configuration, route mounting
- `routers/*.js`: Individual route handlers for each API endpoint
- `mspData.js`: Government MSP data for crop pricing (2015-2026)
- `apmcData.js`: APMC market data for crop demand and pricing
- `profitabilityEngine.js`: Core logic for calculating crop profitability
- `llmService.js`: Integration with OpenAI/Together AI for AI-powered insights

**Frontend**:
- `App.jsx`: Main React component with form handling and API integration
- `main.jsx`: React DOM rendering and app initialization
- `i18n.ts`: Internationalization setup (supports multiple languages)
- `index.css`: Global styles and TailwindCSS imports

### Technology Stack

**Backend**:
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1+
- **AI Services**: OpenAI SDK, Together AI SDK
- **Environment**: dotenv for configuration

**Frontend**:
- **Framework**: React 19+
- **Build Tool**: Vite 7+
- **Styling**: TailwindCSS 3.4+
- **i18n**: react-i18next
- **Language**: TypeScript (config) + JavaScript (implementation)

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed on your system:

#### Required Software

1. **Node.js** (Version 18.0.0 or higher)
   - Download from: [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version  # Should show v18.x.x or higher
     npm --version   # Should show 9.x.x or higher
     ```

2. **npm** (comes with Node.js)
   - Verify installation:
     ```bash
     npm --version
     ```

3. **Git** (for cloning the repository)
   - Download from: [git-scm.com](https://git-scm.com/)
   - Verify installation:
     ```bash
     git --version
     ```

#### API Keys (Required for AI Features)

You'll need at least one of the following API keys:

- **Together AI** (Recommended - Free tier available)
  - Sign up at: [together.ai](https://together.ai/)
  - Get your API key from the dashboard
  - Free tier includes generous credits for testing

- **OpenAI** (Alternative)
  - Sign up at: [platform.openai.com](https://platform.openai.com/)
  - Get your API key from API Keys section
  - Requires paid credits

> **Note**: The application will work without API keys, but AI-powered features will be disabled. You can still test the API structure and data processing.

### Installation

Follow these steps to set up the project locally:

#### Step 1: Clone the Repository

   ```bash
   git clone https://github.com/your-username/CropAI.git
   cd CropAI
   ```

**Verify**: You should see `backend/` and `frontend/` directories.

#### Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   **Expected output**: Dependencies will be installed. This may take 1-2 minutes.
   
   **Verify installation**:
   ```bash
   ls node_modules  # Should show installed packages
   ```

3. **Create environment file**
   
   Create a `.env` file in the `backend/` directory:
   ```bash
   touch .env
   ```
   
   Or on Windows:
   ```cmd
   type nul > .env
   ```
   
   Add the following content to `.env`:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # AI Service Configuration (choose at least one)
   # Together AI (Recommended - Free tier available)
   TOGETHER_API_KEY=your_together_api_key_here
   
   # OpenAI (Alternative)
   # OPENAI_API_KEY=your_openai_api_key_here
   
   # Database (Optional - for future use)
   # MONGODB_URI=mongodb://localhost:27017/cropai
   ```
   
   **Important**: Replace `your_together_api_key_here` with your actual API key.

4. **Start the backend server**
   ```bash
   npm run dev
   ```

   **Expected output**:
   ```
   Server running on port 5000
   ```
   
   **Verify backend is running**:
   - Open http://localhost:5000 in your browser
   - You should see: `{"message":"Crop Recommendation API"}`
   - Or test with curl:
     ```bash
     curl http://localhost:5000
     ```

#### Step 3: Frontend Setup (New Terminal)

1. **Open a new terminal window** (keep backend running)

2. **Navigate to frontend directory**
   ```bash
   cd frontend
   # If you're in the project root:
   cd /path/to/CropAI/frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```
   
   **Expected output**: Dependencies will be installed. This may take 2-3 minutes.
   
   **Verify installation**:
   ```bash
   ls node_modules  # Should show installed packages
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```

   **Expected output**:
   ```
   VITE v7.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

#### Step 4: Access the Application

Once both servers are running:

- **Frontend Application**: http://localhost:5173
  - Open in your browser
  - You should see the CropAI interface
  
- **Backend API**: http://localhost:5000
  - API base URL: http://localhost:5000/api
  - Health check: http://localhost:5000

#### Step 5: Verify Everything Works

1. **Test Backend API**:
   ```bash
   curl http://localhost:5000
   ```
   Should return: `{"message":"Crop Recommendation API"}`

2. **Test Frontend**:
   - Open http://localhost:5173
   - You should see the CropAI homepage
   - Try loading sample data using the sample data buttons

3. **Test API Endpoint** (with sample data):
   ```bash
   curl -X POST http://localhost:5000/api/recommendations \
     -H "Content-Type: application/json" \
     -d '{
       "soilType": "loam",
       "phLevel": 7.2,
       "rainfall": 1200,
       "temperature": 28,
       "currentCrop": "Rice",
       "yieldHistory": 3.5,
       "marketPrice": 25
     }'
   ```
   
   **Note**: If you haven't set up API keys, you may see an error about AI service configuration, but the API structure should still respond.

### Running Both Services Simultaneously

You need **two terminal windows**:
- **Terminal 1**: Backend server (`cd backend && npm run dev`)
- **Terminal 2**: Frontend server (`cd frontend && npm run dev`)

**Tip**: Use a terminal multiplexer like `tmux` or `screen`, or use VS Code's integrated terminal with split panes.

---

## 🔧 Configuration

### Environment Variables

The backend requires a `.env` file in the `backend/` directory. Create it if it doesn't exist:

```bash
cd backend
touch .env  # or type nul > .env on Windows
```

#### Complete `.env` File Template

```env
# ============================================
# Server Configuration
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# AI Service Configuration
# ============================================
# You need at least ONE of the following API keys
# Together AI is recommended (free tier available)

# Together AI (Recommended)
# Get your API key from: https://together.ai/
TOGETHER_API_KEY=your_together_api_key_here

# OpenAI (Alternative)
# Get your API key from: https://platform.openai.com/api-keys
# OPENAI_API_KEY=your_openai_api_key_here

# ============================================
# Database Configuration (Optional)
# ============================================
# MongoDB is not currently required, but reserved for future use
# MONGODB_URI=mongodb://localhost:27017/cropai
```

#### Environment Variable Details

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Backend server port | `5000` |
| `NODE_ENV` | No | Environment mode (`development` or `production`) | `development` |
| `TOGETHER_API_KEY` | Yes* | Together AI API key for LLM features | - |
| `OPENAI_API_KEY` | Yes* | OpenAI API key (alternative to Together AI) | - |
| `MONGODB_URI` | No | MongoDB connection string (future use) | - |

\* At least one AI API key is required for AI-powered features to work.

#### Getting API Keys

**Together AI (Recommended)**:
1. Visit [together.ai](https://together.ai/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

**OpenAI**:
1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new secret key
5. Copy the key to your `.env` file
6. **Note**: Requires paid credits

### AI Provider Selection

CropAI supports two AI providers:

- **Together AI** (Recommended)
  - Model: Meta-Llama-3.1-8B-Instruct-Turbo
  - Free tier available with generous credits
  - Cost-effective for production
  - Good performance for agricultural recommendations

- **OpenAI**
  - Model: GPT-4o-mini
  - Higher accuracy and reasoning
  - Requires paid credits
  - Better for complex analysis

**How to Configure**:
- Set the API key in `.env` file
- The backend automatically uses Together AI if `TOGETHER_API_KEY` is set
- Falls back to OpenAI if only `OPENAI_API_KEY` is available
- You can also specify `aiProvider: "together"` or `aiProvider: "openai"` in API requests

### Frontend Configuration (Optional)

The frontend can be configured via environment variables. Create `.env.local` in the `frontend/` directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_DEFAULT_AI_PROVIDER=together
```

**Note**: Frontend environment variables must be prefixed with `VITE_` to be accessible in the React app.

---

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Currently, no authentication required. Add API keys for production use.

### Content Type
All requests must use `Content-Type: application/json` header.

### CORS Configuration
The backend is configured to accept requests from `http://localhost:5173` (frontend). For other origins, update CORS settings in `backend/server.js`.

### Endpoints Overview

The API provides 5 main endpoint groups:

1. **`/api/recommendations`** - AI-powered crop recommendations
2. **`/api/loss-analysis`** - Analyze crop losses and provide recommendations
3. **`/api/natural-farming`** - Natural farming practice recommendations
4. **`/api/profitable-crops`** - Get top profitable crops based on market data
5. **`/api/next-crop-insights`** - Comprehensive next crop planning insights

---

### 1. POST `/api/recommendations`

Get AI-powered crop recommendations based on comprehensive farmer data.

**Endpoint**: `POST /api/recommendations`

**Request Body:**
```json
{
  "soilType": "loam",
  "phLevel": 7.2,
  "rainfall": 1200,
  "temperature": 28,
  "currentCrop": "Rice",
  "yieldHistory": 3.5,
  "marketPrice": 25,
  "aiProvider": "together",
  "language": "en",
  "landDetails": {
    "state": "Andhra Pradesh",
    "district": "Chittoor",
    "subDistrict": "Kuppam",
    "village": "Kuppam Village",
    "surveyNumber": "789/B",
    "totalArea": 3.2,
    "extentAssignedArea": 2.8,
    "landSource": "Own Land"
  },
  "ownershipDetails": [{
    "ownerNumber": "001",
    "mainOwnerNumber": "001",
    "identifierName": "Farmer Name",
    "ownerType": "Individual",
    "ownerShareType": "Full Owner",
    "extent": 2.8
  }],
  "soilDetails": {
    "centreName": "Agricultural Research Center",
    "testId": "TEST-001",
    "testingDate": "2024-03-15",
    "validity": "2025-03-15",
    "surveyNo": "123/A",
    "plotSize": 2.3,
    "soilHealthParameters": {
      "nitrogen": 280,
      "phosphorus": 25,
      "potassium": 180,
      "ph": 7.2,
      "organicCarbon": 0.8,
      "sulphur": 15,
      "zinc": 1.2
    }
  },
  "cropDetailsEPanta": {
    "farmerName": "Farmer Name",
    "aadhaarNumber": "123456789012",
    "mobileNumber": "9876543210",
    "variety": "MTU 1010",
    "areaSown": 2.3,
    "dateOfSowing": "2024-07-15",
    "cropNature": "Kharif",
    "waterSource": "Canal",
    "methodOfIrrigation": "Drip Irrigation",
    "farmingType": "Organic"
  },
  "cropDetailsFarmer": {
    "investmentKharif": "₹85000",
    "cropYield": "4.2 tons/ha",
    "farmerAssets": ["Tractor", "Irrigation Pump"],
    "stages": {
      "preSowing": "Fertilizer application",
      "sowing": "Manual sowing",
      "germination": "70% germination",
      "vegetative": "Good growth",
      "flowering": "Dense flowering",
      "fruitingMaturity": "Grain filling",
      "harvesting": "Manual harvesting",
      "postHarvest": "Threshing and storage"
    }
  },
  "cropInsurance": {
    "insured": true,
    "sumInsured": "₹50000",
    "premiumPaid": "₹750",
    "coverageArea": 2.3,
    "riskCoverage": "Flood, Drought, Pest Attack"
  },
  "encumbrance": {
    "status": "Clear",
    "mortgageDetails": "Nil",
    "encumbranceIfAny": "No encumbrance"
  }
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "recommendedCrop": "Tur (Arhar)",
    "reason": "High MSP rates and suitable for loam soil conditions",
    "confidenceScore": 85,
    "expectedProfit": 80000,
    "expectedYield": 2.0,
    "waterRequirement": 2000,
    "laborRequirement": 100,
    "maturityTime": 110,
    "riskLevel": "Medium",
    "equipmentNeeded": ["Tractor", "Plough"],
    "effortDistribution": {
      "setup": 20,
      "maintenance": 50,
      "harvesting": 30
    },
    "resourceRequirements": {
      "waterNeeded": "2000 L/ha",
      "fertilizers": ["Urea", "DAP"],
      "pesticides": ["Generic Pesticide"]
    },
    "soilConditions": {
      "suitability": "Good",
      "analysis": "Tur is suitable for loam soil with pH 7.2"
    },
    "marketAnalysis": {
      "profitMargin": "25%",
      "marketDemand": "Medium"
    },
    "alternativeCrops": [
      {
        "crop": "Groundnut",
        "score": 75,
        "reason": "Alternative oilseed crop with stable market demand",
        "expectedProfit": 70000,
        "expectedYield": 1.8,
        "waterRequirement": 1800,
        "laborRequirement": 90,
        "maturityTime": 105,
        "riskLevel": "Medium",
        "equipmentNeeded": ["Tractor"],
        "resourceRequirements": {
          "waterNeeded": "1800 L/ha",
          "fertilizers": ["DAP"],
          "pesticides": ["Cypermethrin"]
        }
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "error": "All crop data fields are required",
  "details": "Missing required field: soilType"
}
```

---

### 2. POST `/api/loss-analysis/analyze`

Analyze crop losses and provide detailed recommendations for improvement.

**Endpoint**: `POST /api/loss-analysis/analyze`

**Required Fields**:
- `actualYield` (number) - Actual yield in quintals
- `costs` (object) - Cost breakdown with fields like `labour`, `seeds`, `fertilizers`, `pesticides`, `irrigation`, `equipment`, `transportation`, `other`
- `income` (object) - Income breakdown with fields like `yieldSale`, `byproducts`, `residue`, `subsidy`

**Optional Fields**:
- `cropName` (string) - Name of the crop
- `season` (string) - Season (Kharif/Rabi/Zaid) - auto-inferred if not provided
- `landArea` (number) - Land area in hectares
- `location` (object) - Location details with `village`, `mandal`
- `expectedYield` (number) - Expected yield in quintals
- `cropDetails` (object) - Additional crop details
- `challenges` (array) - Array of challenges faced

**Example Request**:
```json
{
  "cropName": "Rice",
  "season": "Kharif 2024",
  "landArea": 2.5,
  "location": {
    "village": "Kuppam",
    "mandal": "Kuppam Mandal"
  },
  "actualYield": 45,
  "expectedYield": 60,
  "costs": {
    "labour": 25000,
    "seeds": 5000,
    "fertilizers": 15000,
    "pesticides": 8000,
    "irrigation": 12000,
    "equipment": 5000,
    "transportation": 3000,
    "other": 2000
  },
  "income": {
    "yieldSale": 90000,
    "byproducts": 5000,
    "residue": 3000,
    "subsidy": 2000
  },
  "cropDetails": {
    "waterSource": "Bore Well",
    "irrigationMethod": "Drip Irrigation",
    "sowingDate": "15-07-2024",
    "harvestDate": "15-11-2024",
    "soilType": "Red Soil"
  },
  "challenges": [
    "Pest attack in flowering stage",
    "Water scarcity in August",
    "High fertilizer costs"
  ]
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "cropName": "Rice",
    "season": "Kharif 2024",
    "summary": {
      "totalCost": 73000,
      "totalIncome": 100000,
      "netProfit": 27000,
      "profitMargin": "27.00",
      "actualYield": 45,
      "expectedYield": 60,
      "yieldGap": 15
    },
    "analysis": "Comprehensive AI-generated analysis with primary factors and recommendations...",
    "timestamp": "2024-12-01T10:30:00.000Z"
  }
}
```

---

### 3. POST `/api/natural-farming/recommendations`

Get natural farming practice recommendations for transitioning to sustainable agriculture.

**Endpoint**: `POST /api/natural-farming/recommendations`

**Required Fields**:
- `location` (object) - Must include `mandal` field
  - `village` (string, optional)
  - `mandal` (string, required)

**Optional Fields**:
- `landArea` (number) - Land area in hectares (default: 1)
- `currentCrop` (string) - Current crop being grown (default: "mixed crops")
- `soilType` (string) - Soil type (default: "red soil")
- `waterSource` (string) - Water source (default: "bore well")
- `currentPractices` (object) - Current farming practices
  - `usesChemicalFertilizers` (boolean)
  - `usesPesticides` (boolean)
  - `irrigationMethod` (string)
  - `hasLivestock` (boolean)
- `challenges` (array) - Array of current challenges

**Example Request**:
```json
{
  "location": {
    "village": "Kuppam",
    "mandal": "Kuppam Mandal"
  },
  "landArea": 2.5,
  "currentCrop": "Groundnut",
  "soilType": "Red Soil",
  "waterSource": "Bore Well",
  "currentPractices": {
    "usesChemicalFertilizers": true,
    "usesPesticides": true,
    "irrigationMethod": "Drip Irrigation",
    "hasLivestock": true
  },
  "challenges": [
    "High input costs",
    "Soil degradation",
    "Water scarcity"
  ]
}
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "location": {
      "village": "Kuppam",
      "mandal": "Kuppam Mandal",
      "region": "Andhra Pradesh"
    },
    "landArea": 2.5,
    "currentCrop": "Groundnut",
    "benefits": [
      "Reduce input costs by 40-60%",
      "Improve soil organic matter from 0.5% to 2% in 2-3 years",
      "Enhance water retention capacity by 30-40%"
    ],
    "recommendedPractices": [
      {
        "category": "Soil Health & Fertility Management",
        "name": "Jeevamrutham Application",
        "description": "Detailed steps for preparing and applying Jeevamrutham..."
      }
    ],
    "rawAnalysis": "Full AI-generated analysis...",
    "timestamp": "2024-12-01T10:30:00.000Z"
  }
}
```

---

### 4. POST `/api/profitable-crops`

Get top profitable crops based on market data and farmer profile.

**Endpoint**: `POST /api/profitable-crops`

**Optional Fields**:
- `farmerData` (object) - Farmer profile data (optional)
- `region` (string) - Region name (default: "KUPPAM/PALAMANER")
- `topN` (number) - Number of crops to return (default: 5)

**Example Request**:
```json
{
  "farmerData": {
    "profile": {
      "metaData": {
        "masterData": {
          "agriStack": {
            "totalAreaHectares": 2.5
          }
        }
      }
    }
  },
  "region": "KUPPAM",
  "topN": 5
}
```

**Example Response**:
```json
{
  "success": true,
  "region": "KUPPAM",
  "totalCropsAnalyzed": 25,
  "recommendations": [
    {
      "crop": "TOMATO",
      "expectedIncome": "₹1,25,000",
      "demand": "High",
      "successRate": "85%",
      "details": {
        "operationalDetails": "Detailed operational guidance...",
        "season": "Kharif/Rabi",
        "duration": "90-120 days"
      },
      "marketInfo": {
        "recentTrades": 150,
        "totalArrivals": 5000,
        "avgPrice": "₹2,500/quintal",
        "volatility": "Medium"
      }
    }
  ]
}
```

#### Additional Profitable Crops Endpoints

**GET `/api/profitable-crops/high-demand`**
- Returns crops with high market demand
- No request body required

**GET `/api/profitable-crops/market-overview`**
- Returns market overview for all crops
- No request body required

**POST `/api/profitable-crops/analyze`**
- Detailed analysis for a specific crop
- Requires: `cropName` (string)
- Optional: `farmerData` (object)

---

### 5. POST `/api/next-crop-insights`

Get comprehensive insights for planning the next crop cycle, including crop recommendations, government schemes, and operational guidance.

**Endpoint**: `POST /api/next-crop-insights`

**Request Body**: Accepts comprehensive farmer profile data similar to `/api/recommendations`, plus additional fields for crop planning.

**Example Request**:
```json
{
  "farmerData": {
    "profile": {
      "address": "Kuppam",
      "metaData": {
        "masterData": {
          "agriStack": {
            "totalAreaHectares": 2.5,
            "soilType": "Red Soil",
            "waterSource": "Bore Well"
          }
        }
      }
    }
  },
  "currentCrop": "Rice",
  "season": "Kharif",
  "region": "KUPPAM"
}
```

**Example Response**:
```json
{
  "success": true,
  "insights": {
    "recommendedCrops": [...],
    "governmentSchemes": [...],
    "operationalGuidance": {...},
    "marketAnalysis": {...},
    "riskAssessment": {...}
  }
}
```

---

### Testing API Endpoints

#### Using cURL

**Test Recommendations Endpoint**:
```bash
curl -X POST http://localhost:5000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "soilType": "loam",
    "phLevel": 7.2,
    "rainfall": 1200,
    "temperature": 28,
    "currentCrop": "Rice",
    "yieldHistory": 3.5,
    "marketPrice": 25
  }'
```

**Test Loss Analysis**:
```bash
curl -X POST http://localhost:5000/api/loss-analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "actualYield": 45,
    "expectedYield": 60,
    "costs": {"labour": 25000, "seeds": 5000},
    "income": {"yieldSale": 90000}
  }'
```

**Test High Demand Crops**:
```bash
curl http://localhost:5000/api/profitable-crops/high-demand
```

#### Using Postman

1. Import the collection (if available)
2. Set base URL: `http://localhost:5000/api`
3. Use POST method for endpoints requiring data
4. Set `Content-Type: application/json` header
5. Add request body in JSON format

#### Using Frontend

The React frontend at http://localhost:5173 provides a UI for testing all endpoints with sample data.

---

## ✅ Verification & Testing

After completing the installation, verify that everything is working correctly:

### Step 1: Verify Backend Server

1. **Check if backend is running**:
   ```bash
   curl http://localhost:5000
   ```
   
   **Expected Response**:
   ```json
   {"message":"Crop Recommendation API"}
   ```

2. **Test API endpoint**:
   ```bash
   curl -X POST http://localhost:5000/api/recommendations \
     -H "Content-Type: application/json" \
     -d '{
       "soilType": "loam",
       "phLevel": 7.2,
       "rainfall": 1200,
       "temperature": 28,
       "currentCrop": "Rice",
       "yieldHistory": 3.5,
       "marketPrice": 25
     }'
   ```
   
   **Expected Response**: JSON with `success: true` and recommendation data
   
   **Note**: If API keys are not configured, you may see an error about AI service, but the API structure should still respond.

### Step 2: Verify Frontend Application

1. **Open browser**: Navigate to http://localhost:5173

2. **Check for errors**:
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - Check Network tab to verify API calls

3. **Test sample data**:
   - Click on any "Load Sample Data" button
   - Verify form fields are populated
   - Submit the form to test API integration

### Step 3: Test All API Endpoints

**Test Loss Analysis**:
```bash
curl -X POST http://localhost:5000/api/loss-analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "actualYield": 45,
    "expectedYield": 60,
    "costs": {"labour": 25000, "seeds": 5000},
    "income": {"yieldSale": 90000}
  }'
```

**Test Natural Farming**:
```bash
curl -X POST http://localhost:5000/api/natural-farming/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "location": {"mandal": "Kuppam Mandal"},
    "landArea": 2.5,
    "currentCrop": "Groundnut"
  }'
```

**Test Profitable Crops**:
```bash
curl http://localhost:5000/api/profitable-crops/high-demand
```

### Step 4: Verify API Keys (If Configured)

If you've added API keys, test AI features:

1. **Check backend logs** for API key validation messages
2. **Make a recommendation request** and verify AI-generated content
3. **Check for errors** in console if API calls fail

### Common Success Indicators

✅ **Backend Working**:
- Server shows "Server running on port 5000"
- `curl http://localhost:5000` returns JSON response
- No errors in backend terminal

✅ **Frontend Working**:
- Page loads at http://localhost:5173
- No console errors in browser DevTools
- Forms are interactive and responsive

✅ **API Integration Working**:
- Form submission triggers API call
- Response data appears in UI
- Network tab shows successful API requests

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**Problem: Port 5000 already in use**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**:
```bash
# Option 1: Kill the process using port 5000
# On macOS/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Option 2: Change port in .env file
PORT=5001
```

**Problem: Module not found errors**
```
Error: Cannot find module 'express'
```

**Solution**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Problem: API key not working**
```
Error: LLM service not configured
```

**Solution**:
1. Verify `.env` file exists in `backend/` directory
2. Check API key is correctly set (no extra spaces)
3. Restart backend server after changing `.env`
4. Verify API key is valid by testing it directly with the provider

**Problem: CORS errors**
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution**:
- CORS is already configured in `backend/server.js`
- If you're using a different frontend URL, update CORS settings:
  ```javascript
  app.use(cors({
    origin: 'http://your-frontend-url:port'
  }));
  ```

#### Frontend Issues

**Problem: Port 5173 already in use**
```
Error: Port 5173 is in use
```

**Solution**:
```bash
# Vite will automatically try the next available port
# Or specify a different port:
npm run dev -- --port 5174
```

**Problem: Dependencies installation fails**
```
npm ERR! code ERESOLVE
```

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
# Or use:
npm install --force
```

**Problem: Build errors**
```
Error: Cannot find module 'react'
```

**Solution**:
```bash
cd frontend
rm -rf node_modules
npm install
```

**Problem: API calls failing**
```
Failed to fetch
```

**Solution**:
1. Verify backend is running on port 5000
2. Check browser console for detailed error
3. Verify CORS configuration
4. Check network tab in DevTools for request details

#### Environment Setup Issues

**Problem: `.env` file not being read**
```
process.env.TOGETHER_API_KEY is undefined
```

**Solution**:
1. Ensure `.env` file is in `backend/` directory (not project root)
2. Verify file is named exactly `.env` (not `.env.txt` or `.env.example`)
3. Restart backend server after creating/modifying `.env`
4. Check for syntax errors in `.env` file (no spaces around `=`)

**Problem: Node.js version mismatch**
```
Error: The engine "node" is incompatible with this module
```

**Solution**:
```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Update Node.js if needed:
# Using nvm (recommended):
nvm install 18
nvm use 18

# Or download from nodejs.org
```

#### API-Specific Issues

**Problem: AI responses are slow or timeout**
- **Cause**: Large AI models can take 10-30 seconds
- **Solution**: This is normal. Consider using Together AI for faster responses

**Problem: Invalid API response format**
```
Error: Failed to process AI response
```

**Solution**:
1. Check API key is valid and has credits
2. Verify network connection
3. Check backend logs for detailed error
4. Try a different AI provider

**Problem: Missing required fields error**
```
Error: All crop data fields are required
```

**Solution**:
- Review API documentation for required fields
- Use sample data from frontend as reference
- Check request body format matches examples

### Getting Help

If you encounter issues not covered here:

1. **Check logs**:
   - Backend: Terminal where `npm run dev` is running
   - Frontend: Browser DevTools Console

2. **Verify setup**:
   - Node.js version: `node --version` (should be 18+)
   - npm version: `npm --version`
   - Dependencies installed: Check `node_modules/` exists

3. **Test components individually**:
   - Test backend API with curl/Postman
   - Test frontend without backend (will show connection errors, but UI should load)

4. **Common fixes**:
   - Delete `node_modules` and reinstall
   - Clear browser cache
   - Restart both servers
   - Check `.env` file configuration

5. **Still stuck?**:
   - Check [GitHub Issues](https://github.com/your-username/CropAI/issues)
   - Review [API Documentation](API_DOCUMENTATION.md)
   - Create a new issue with:
     - Error messages
     - Steps to reproduce
     - Node.js and npm versions
     - Operating system

---

## 🎯 Usage Examples

### Basic Recommendation Request

```javascript
const farmerData = {
  soilType: "loam",
  phLevel: 7.0,
  rainfall: 1000,
  temperature: 25,
  currentCrop: "Rice",
  yieldHistory: 3.0,
  marketPrice: 20,
  aiProvider: "together"
};

fetch('http://localhost:5000/api/recommendations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(farmerData),
})
.then(response => response.json())
.then(data => console.log(data.recommendation));
```

### Using with React Frontend

The frontend provides a comprehensive form interface for data collection. Sample farmer data is pre-loaded for testing.

---

## 📊 Data Sources

### MSP (Minimum Support Price) Data
- **Source**: Government of India, Ministry of Agriculture
- **Coverage**: 2015-2026 for major crops
- **Update Frequency**: Annual (Kharif & Rabi seasons)
- **Crops Covered**: Paddy, Wheat, Tur, Moong, Urad, Cotton, and more

### AI Models
- **OpenAI GPT-4**: Advanced reasoning and analysis
- **Together AI Mistral-7B**: Efficient and cost-effective

---

## 🔒 Security & Privacy

- **Data Privacy**: Farmer data is processed locally (no external storage)
- **API Security**: Implement authentication for production use
- **Input Validation**: Comprehensive validation of all input parameters
- **Error Handling**: Secure error responses without data leakage

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Government of India** for MSP data and agricultural support
- **OpenAI** and **Together AI** for AI model access
- **React & Node.js communities** for excellent frameworks
- **KADA (Kuppam Area Development Authority)** for domain expertise

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/CropAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/CropAI/discussions)
- **Email**: support@cropai.com

---

<div align="center">

**Made with ❤️ for farmers worldwide**

[⬆️ Back to Top](#-cropai---ai-powered-crop-recommendation-system)

</div>
