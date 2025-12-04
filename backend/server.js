const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const recommendationRouter = require('./routers/recommendation');
const lossAnalysisRouter = require('./routers/lossAnalysis');
const naturalFarmingRouter = require('./routers/naturalFarming');
const profitableCropsRouter = require('./routers/profitableCrops');

app.use('/api/recommendations', recommendationRouter);
app.use('/api/loss-analysis', lossAnalysisRouter);
app.use('/api/natural-farming', naturalFarmingRouter);
app.use('/api/profitable-crops', profitableCropsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Crop Recommendation API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
