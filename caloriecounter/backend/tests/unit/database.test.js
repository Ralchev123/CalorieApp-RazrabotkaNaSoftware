const path = require('path');
const fs = require('fs');

const mockSqlite3 = {
  verbose: () => mockSqlite3,
  Database: class MockDatabase {
    constructor(path, callback) {
      this.path = path;
      this.isOpen = true;
      this.data = {
        users: new Map(),
        meals: new Map(),
        nextUserId: 1,
        nextMealId: 1
      };
      if (callback) callback(null);
    }
    
    serialize(callback) {
      if (callback) callback();
    }
    
    exec(sql, callback) {
      if (callback) callback(null);
    }
    
    run(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      
      let result = { lastID: null, changes: 0 };
      
      if (sql.includes('INSERT INTO users')) {
        const userId = this.data.nextUserId++;
        const user = {
          id: userId,
          firebase_uid: params[0],
          email: params[1] || null,
          display_name: params[2] || null,
          created_at: new Date().toISOString()
        };
        this.data.users.set(userId, user);
        result.lastID = userId;
        result.changes = 1;
      } else if (sql.includes('INSERT INTO meals')) {
        const mealId = this.data.nextMealId++;
        const meal = {
          id: mealId,
          user_id: params[0],
          date: params[1],
          name: params[2],
          grams: params[3],
          calories: params[4],
          protein_g: params[5],
          fat_total_g: params[6],
          carbohydrates_total_g: params[7],
          timestamp: params[8],
          created_at: new Date().toISOString()
        };
        this.data.meals.set(mealId, meal);
        result.lastID = mealId;
        result.changes = 1;
      } else if (sql.includes('DELETE FROM meals WHERE')) {
        const mealId = params[0];
        if (this.data.meals.has(mealId)) {
          this.data.meals.delete(mealId);
          result.changes = 1;
        }
      }
      
      if (callback) callback.call(result, null);
    }
    
    get(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      
      let result = null;
      
      if (sql.includes('SELECT * FROM users WHERE firebase_uid')) {
        const firebaseUid = params[0];
        for (let user of this.data.users.values()) {
          if (user.firebase_uid === firebaseUid) {
            result = user;
            break;
          }
        }
      } else if (sql.includes('SELECT * FROM meals WHERE id')) {
        const mealId = params[0];
        result = this.data.meals.get(mealId) || null;
      }
      
      if (callback) callback(null, result);
    }
    
    all(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      
      let results = [];
      
      if (sql.includes('SELECT * FROM meals WHERE user_id')) {
        const userId = params[0];
        
        if (sql.includes('AND date')) {
          const date = params[1];
          for (let meal of this.data.meals.values()) {
            if (meal.user_id === userId && meal.date === date) {
              results.push(meal);
            }
          }
          results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
      }
      
      if (callback) callback(null, results);
    }
    
    close(callback) {
      this.isOpen = false;
      if (callback) callback(null);
    }
  }
};

jest.mock('sqlite3', () => mockSqlite3);

const Database = require('../../database');

describe('Database', () => {
  let db;
  let testDbPath;

  beforeEach(async () => {
    testDbPath = path.join(__dirname, `test_${Date.now()}_${Math.random()}.db`);
    db = new Database();
    db.DB_PATH = testDbPath;
    await db.initialize();
  });

  afterEach(async () => {
    if (db && db.db) {
      await db.close();
    }
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (e) {
      }
    }
  });

  describe('initialize()', () => {
    it('should initialize database tables and indexes', async () => {
      expect(db.initialized).toBe(true);
    });

    it('should not reinitialize if already initialized', async () => {
      const spy = jest.spyOn(db.db, 'serialize');
      await db.initialize();
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('createOrGetUser()', () => {
    it('should create a new user', async () => {
      const firebaseUid = 'test-uid-123';
      const email = 'test@example.com';
      const displayName = 'Test User';

      const user = await db.createOrGetUser(firebaseUid, email, displayName);

      expect(user).toHaveProperty('id');
      expect(user.firebase_uid).toBe(firebaseUid);
      expect(user.email).toBe(email);
      expect(user.display_name).toBe(displayName);
    });

    it('should return existing user', async () => {
      const firebaseUid = 'test-uid-123';
      const email = 'test@example.com';
      const displayName = 'Test User';

      const user1 = await db.createOrGetUser(firebaseUid, email, displayName);
      const user2 = await db.createOrGetUser(firebaseUid);

      expect(user1.id).toBe(user2.id);
      expect(user2.firebase_uid).toBe(firebaseUid);
    });
  });

  describe('getUserByFirebaseUid()', () => {
    it('should return user by firebase UID', async () => {
      const firebaseUid = 'test-uid-123';
      const email = 'test@example.com';
      
      await db.createOrGetUser(firebaseUid, email);
      const user = await db.getUserByFirebaseUid(firebaseUid);

      expect(user).not.toBeNull();
      expect(user.firebase_uid).toBe(firebaseUid);
      expect(user.email).toBe(email);
    });

    it('should return null for non-existent user', async () => {
      const user = await db.getUserByFirebaseUid('non-existent-uid');
      expect(user).toBeNull();
    });
  });

  describe('addMeal()', () => {
    it('should add a meal successfully', async () => {
      const user = await db.createOrGetUser('test-uid-123');
      const mealData = {
        date: '2024-01-15',
        name: 'Apple',
        grams: 100,
        calories: 52,
        protein_g: 0.3,
        fat_total_g: 0.2,
        carbohydrates_total_g: 14,
        timestamp: new Date().toISOString()
      };

      const meal = await db.addMeal(user.id, mealData);

      expect(meal).toHaveProperty('id');
      expect(meal.user_id).toBe(user.id);
      expect(meal.name).toBe('Apple');
      expect(meal.grams).toBe(100);
    });
  });

  describe('getMealsByDate()', () => {
    it('should return empty array for date with no meals', async () => {
      const user = await db.createOrGetUser('test-uid-123');
      const meals = await db.getMealsByDate(user.id, '2024-01-15');
      expect(meals).toBeInstanceOf(Array);
      expect(meals).toHaveLength(0);
    });
  });
});