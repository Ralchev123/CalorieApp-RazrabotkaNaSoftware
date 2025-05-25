const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
console.log('API key:', process.env.REACT_APP_API_KEY);


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with actual database in production)
let foodData = {};

// Load data from file on startup
const DATA_FILE = path.join(__dirname, 'food_data.json');

async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    foodData = JSON.parse(data);
    console.log('Data loaded successfully');
  } catch (error) {
    console.log('No existing data file found, starting with empty data');
    foodData = {};
  }
}

async function saveData() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(foodData, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize data on startup
loadData();

// Routes

// Get meals for a specific date
app.get('/api/meals/:date', (req, res) => {
  const { date } = req.params;
  const meals = foodData[date] || [];
  
  // Calculate totals
  const totals = meals.reduce((acc, meal) => {
    acc.calories += meal.calories || 0;
    acc.protein_g += meal.protein_g || 0;
    acc.fat_total_g += meal.fat_total_g || 0;
    acc.carbohydrates_total_g += meal.carbohydrates_total_g || 0;
    return acc;
  }, {
    calories: 0,
    protein_g: 0,
    fat_total_g: 0,
    carbohydrates_total_g: 0
  });
  
  res.json({
    date,
    meals,
    totals
  });
});

// Add a new meal
app.post('/api/meals', async (req, res) => {
  try {
    const { date, foodItem, grams } = req.body;
    
    if (!date || !foodItem || !grams) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, foodItem, grams' 
      });
    }
    
    // Get nutrition data (mock for now)
    const nutritionData = await getNutritionData(foodItem, parseInt(grams));
    
    const newMeal = {
      id: Date.now(),
      name: foodItem,
      grams: parseInt(grams),
      ...nutritionData,
      timestamp: new Date().toISOString()
    };
    
    // Add to data
    if (!foodData[date]) {
      foodData[date] = [];
    }
    foodData[date].push(newMeal);
    
    // Save to file
    await saveData();
    
    res.status(201).json({
      message: `Added ${foodItem} (${grams}g) to your food log`,
      meal: newMeal
    });
    
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a meal
app.delete('/api/meals/:date/:id', async (req, res) => {
  try {
    const { date, id } = req.params;
    
    if (!foodData[date]) {
      return res.status(404).json({ error: 'No meals found for this date' });
    }
    
    const mealIndex = foodData[date].findIndex(meal => meal.id === parseInt(id));
    
    if (mealIndex === -1) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    const deletedMeal = foodData[date][mealIndex];
    foodData[date].splice(mealIndex, 1);
    
    // If no meals left for this date, remove the date entry
    if (foodData[date].length === 0) {
      delete foodData[date];
    }
    
    await saveData();
    
    res.json({
      message: `Removed ${deletedMeal.name} from your food log`,
      meal: deletedMeal
    });
    
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all dates with data
app.get('/api/dates', (req, res) => {
  const dates = Object.keys(foodData)
    .sort((a, b) => new Date(b) - new Date(a))
    .map(date => ({
      date,
      itemCount: foodData[date].length
    }));
  
  res.json(dates);
});

async function getNutritionData(foodItem, weight) {
  try {
    const REACT_APP_API_KEY = process.env.REACT_APP_API_KEY;
    if (!REACT_APP_API_KEY) throw new Error('API key not configured');

    const response = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${weight}g ${foodItem}`,
      {
        headers: {
          'X-Api-Key': REACT_APP_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const nutrition = data.items[0];

      return {
        calories: nutrition.calories ?? 0,
        protein_g: nutrition.protein_g ?? 0,
        fat_total_g: nutrition.fat_total_g ?? 0,
        carbohydrates_total_g: nutrition.carbohydrates_total_g ?? 0
      };
    }

    throw new Error('No nutrition data found');
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    // Fallback values
    return {
      calories: weight * 1.5,
      protein_g: weight * 0.05,
      fat_total_g: weight * 0.03,
      carbohydrates_total_g: weight * 0.2
    };
  }
}


// Nutrition endpoint
app.get('/api/nutrition', async (req, res) => {
  try {
    const { food, weight } = req.query;
    if (!food || !weight) {
      return res.status(400).json({ error: 'Missing food or weight parameter' });
    }
    
    const nutritionData = await getNutritionData(food, parseFloat(weight));
    res.json(nutritionData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Nutrition API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Nutrition endpoint: http://localhost:${PORT}/api/nutrition?food=apple&weight=100`);
});

module.exports = app;