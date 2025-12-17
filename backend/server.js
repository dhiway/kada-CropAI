const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Initialize cache service
const { initializeRedis } = require('./services/cacheService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const recommendationRouter = require('./routers/recommendation');
const lossAnalysisRouter = require('./routers/lossAnalysis');
const naturalFarmingRouter = require('./routers/naturalFarming');
const profitableCropsRouter = require('./routers/profitableCrops');
const nextCropInsightsRouter = require('./routers/nextCropInsights');

app.use('/api/recommendations', recommendationRouter);
app.use('/api/loss-analysis', lossAnalysisRouter);
app.use('/api/natural-farming', naturalFarmingRouter);
app.use('/api/profitable-crops', profitableCropsRouter);
app.use('/api/next-crop-insights', nextCropInsightsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Crop Recommendation API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize Redis cache connection
  try {
    const redisClient = initializeRedis();
    if (redisClient) {
      console.log('Cache service initialized');
    } else {
      console.log('Cache service disabled or Redis unavailable - continuing without cache');
    }
  } catch (error) {
    console.error('Error initializing cache service:', error.message);
    console.log('Continuing without cache - API will work but without caching');
  }
});
