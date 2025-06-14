const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const Database = require('./database');
require('dotenv').config();

console.log('API key:', process.env.REACT_APP_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

let firebaseInitialized = false;
try {
  const serviceAccount = require('./firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  firebaseInitialized = true;
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.log('Firebase service account not found or invalid. Some features may be disabled.');
  console.log('Error:', error.message);
}

const db = new Database();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:8080'] 
    : '*',
  credentials: true
}));
app.use(express.json());

async function authenticateFirebaseToken(req, res, next) {
  if (!firebaseInitialized) {
    return res.status(500).json({ error: 'Firebase authentication not configured' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    const user = await db.createOrGetUser(
      decodedToken.uid,
      decodedToken.email,
      decodedToken.name
    );
    
    req.user = {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      dbUserId: user.id
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

async function initializeApp() {
  try {
    await db.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

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
    return {
      calories: weight * 1.5,
      protein_g: weight * 0.05,
      fat_total_g: weight * 0.03,
      carbohydrates_total_g: weight * 0.2
    };
  }
}


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    firebase: firebaseInitialized ? 'initialized' : 'not configured',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Nutrition Tracker API',
    status: 'Running',
    endpoints: {
      health: '/api/health',
      nutrition: '/api/nutrition?food=apple&weight=100'
    }
  });
});

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


app.get('/api/user', authenticateFirebaseToken, async (req, res) => {
  try {
    const user = await db.getUserByFirebaseUid(req.user.firebaseUid);
    res.json({
      id: user.id,
      firebaseUid: user.firebase_uid,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/meals/:date', authenticateFirebaseToken, async (req, res) => {
  try {
    const { date } = req.params;
    const meals = await db.getMealsByDate(req.user.dbUserId, date);
    
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
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/meals', authenticateFirebaseToken, async (req, res) => {
  try {
    const { date, foodItem, grams } = req.body;
    
    if (!date || !foodItem || !grams) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, foodItem, grams' 
      });
    }
    
    const nutritionData = await getNutritionData(foodItem, parseInt(grams));
    
    const mealData = {
      date,
      name: foodItem,
      grams: parseInt(grams),
      ...nutritionData,
      timestamp: new Date().toISOString()
    };
    
    const newMeal = await db.addMeal(req.user.dbUserId, mealData);
    
    res.status(201).json({
      message: `Added ${foodItem} (${grams}g) to your food log`,
      meal: newMeal
    });
    
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/meals/:id', authenticateFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { foodItem, grams } = req.body;
    
    if (!foodItem || !grams) {
      return res.status(400).json({ 
        error: 'Missing required fields: foodItem, grams' 
      });
    }
    
    const nutritionData = await getNutritionData(foodItem, parseInt(grams));
    
    const mealData = {
      name: foodItem,
      grams: parseInt(grams),
      ...nutritionData
    };
    
    const updatedMeal = await db.updateMeal(req.user.dbUserId, parseInt(id), mealData);
    
    res.json({
      message: `Updated meal to ${foodItem} (${grams}g)`,
      meal: updatedMeal
    });
    
  } catch (error) {
    if (error.message === 'Meal not found') {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    console.error('Error updating meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/meals/:date/:id', authenticateFirebaseToken, async (req, res) => {
  try {
    const { date, id } = req.params;
    
    const deletedMeal = await db.deleteMeal(req.user.dbUserId, date, parseInt(id));
    
    res.json({
      message: `Removed ${deletedMeal.name} from your food log`,
      meal: deletedMeal
    });
    
  } catch (error) {
    if (error.message === 'Meal not found') {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dates', authenticateFirebaseToken, async (req, res) => {
  try {
    const dates = await db.getAllDates(req.user.dbUserId);
    res.json(dates);
  } catch (error) {
    console.error('Error fetching dates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/meals', authenticateFirebaseToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: startDate, endDate' 
      });
    }
    
    const meals = await db.getMealsByDateRange(req.user.dbUserId, startDate, endDate);
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals by date range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search', authenticateFirebaseToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Missing search query parameter: q' });
    }
    
    const meals = await db.searchMeals(req.user.dbUserId, q);
    res.json(meals);
  } catch (error) {
    console.error('Error searching meals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/nutrition/:date', authenticateFirebaseToken, async (req, res) => {
  try {
    const { date } = req.params;
    const totals = await db.getNutritionTotalsByDate(req.user.dbUserId, date);
    res.json(totals);
  } catch (error) {
    console.error('Error fetching nutrition totals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stats', authenticateFirebaseToken, async (req, res) => {
  try {
    const stats = await db.getStats(req.user.dbUserId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/backup', authenticateFirebaseToken, async (req, res) => {
  try {
    const backupData = await db.backup(req.user.dbUserId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="nutrition-backup-${req.user.firebaseUid}-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(backupData);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

app.post('/api/restore', authenticateFirebaseToken, async (req, res) => {
  try {
    const backupData = req.body;
    
    if (!backupData.meals || !Array.isArray(backupData.meals)) {
      return res.status(400).json({ error: 'Invalid backup data format' });
    }
    
    const result = await db.restore(req.user.dbUserId, backupData);
    res.json({
      message: `Successfully restored ${result.restored} meals`,
      ...result
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  try {
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

initializeApp().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nutrition API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Firebase: ${firebaseInitialized ? 'Configured' : 'Not configured'}`);
  });
}).catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

module.exports = app;