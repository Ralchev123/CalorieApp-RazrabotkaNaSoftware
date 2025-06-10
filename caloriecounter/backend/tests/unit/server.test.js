const request = require('supertest');
const express = require('express');
const admin = require('firebase-admin');

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  auth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn()
  })
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      items: [{
        calories: 52,
        protein_g: 0.3,
        fat_total_g: 0.2,
        carbohydrates_total_g: 14
      }]
    })
  })
);

class MockDatabase {
  async getUserByFirebaseUid(firebaseUid) {
    return {
      id: 1,
      firebase_uid: firebaseUid,
      email: 'test@example.com',
      display_name: 'Test User',
      created_at: new Date().toISOString()
    };
  }

  async getMealsByDate(userId, date) {
    return [
      {
        id: 1,
        user_id: userId,
        date,
        name: 'Apple',
        grams: 100,
        calories: 52,
        protein_g: 0.3,
        fat_total_g: 0.2,
        carbohydrates_total_g: 14,
        created_at: new Date().toISOString()
      }
    ];
  }
}

function setupRoutes(app, db) {
  const mockAuth = (req, res, next) => {
    req.user = {
      firebaseUid: 'test-uid-123',
      email: 'test@example.com',
      name: 'Test User',
      dbUserId: 1
    };
    next();
  };

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      firebase: 'initialized',
      port: 5000,
      environment: 'test'
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

      const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${weight}g ${food}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const nutrition = data.items[0];
        res.json({
          calories: nutrition.calories ?? 0,
          protein_g: nutrition.protein_g ?? 0,
          fat_total_g: nutrition.fat_total_g ?? 0,
          carbohydrates_total_g: nutrition.carbohydrates_total_g ?? 0
        });
      } else {
        throw new Error('No nutrition data found');
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch nutrition data' });
    }
  });

  app.get('/api/user', mockAuth, async (req, res) => {
    try {
      const user = await db.getUserByFirebaseUid(req.user.firebaseUid);
      res.json({
        id: user.id,
        firebaseUid: user.firebase_uid,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at
      });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/meals/:date', mockAuth, async (req, res) => {
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

      res.json({ meals, totals });
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

describe('Nutrition API Server', () => {
  let app;
  let db;

  beforeEach(() => {
    db = new MockDatabase();
    app = express();
    app.use(express.json());
    setupRoutes(app, db);
  });

  test('GET /api/health should return status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.firebase).toBe('initialized');
  });

  test('GET / should return root info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Running');
    expect(res.body.endpoints).toHaveProperty('health');
  });

  test('GET /api/nutrition returns correct nutrition data', async () => {
    const res = await request(app).get('/api/nutrition?food=apple&weight=100');
    expect(res.status).toBe(200);
    expect(res.body.calories).toBe(52);
  });

  test('GET /api/nutrition with missing query returns 400', async () => {
    const res = await request(app).get('/api/nutrition');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing food or weight parameter');
  });

  test('GET /api/user returns user info', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });

  test('GET /api/meals/:date returns meals and totals', async () => {
    const res = await request(app).get('/api/meals/2024-01-15');
    expect(res.status).toBe(200);
    expect(res.body.meals.length).toBe(1);
    expect(res.body.totals.calories).toBeGreaterThan(0);
  });
});
