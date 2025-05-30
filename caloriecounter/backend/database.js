const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.DB_PATH = path.join(__dirname, 'nutrition.db');
    this.db = new sqlite3.Database(this.DB_PATH);
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firebase_uid TEXT UNIQUE NOT NULL,
          email TEXT,
          display_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;

      const createMealsTableQuery = `
        CREATE TABLE IF NOT EXISTS meals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          name TEXT NOT NULL,
          grams INTEGER NOT NULL,
          calories REAL DEFAULT 0,
          protein_g REAL DEFAULT 0,
          fat_total_g REAL DEFAULT 0,
          carbohydrates_total_g REAL DEFAULT 0,
          timestamp TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
      `;

      const createIndexesQuery = `
        CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
        CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
        CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
        CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
      `;

      this.db.serialize(() => {
        this.db.run(createUsersTableQuery, (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
            return;
          }
        });

        this.db.run(createMealsTableQuery, (err) => {
          if (err) {
            console.error('Error creating meals table:', err);
            reject(err);
            return;
          }
        });

        this.db.exec(createIndexesQuery, (err) => {
          if (err) {
            console.error('Error creating indexes:', err);
            reject(err);
          } else {
            console.log('Database tables and indexes initialized successfully');
            this.initialized = true;
            resolve();
          }
        });
      });
    });
  }

  async createOrGetUser(firebaseUid, email = null, displayName = null) {
    return new Promise((resolve, reject) => {
      const selectQuery = `SELECT * FROM users WHERE firebase_uid = ?`;
      
      this.db.get(selectQuery, [firebaseUid], (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row) {
          if (email || displayName) {
            const updateQuery = `
              UPDATE users 
              SET email = COALESCE(?, email), 
                  display_name = COALESCE(?, display_name),
                  updated_at = CURRENT_TIMESTAMP
              WHERE firebase_uid = ?
            `;
            
            this.db.run(updateQuery, [email, displayName, firebaseUid], function(updateErr) {
              if (updateErr) {
                reject(updateErr);
              } else {
                resolve({ ...row, email: email || row.email, display_name: displayName || row.display_name });
              }
            });
          } else {
            resolve(row);
          }
        } else {
          const insertQuery = `
            INSERT INTO users (firebase_uid, email, display_name)
            VALUES (?, ?, ?)
          `;
          
          this.db.run(insertQuery, [firebaseUid, email, displayName], function(insertErr) {
            if (insertErr) {
              reject(insertErr);
            } else {
              resolve({
                id: this.lastID,
                firebase_uid: firebaseUid,
                email,
                display_name: displayName
              });
            }
          });
        }
      });
    });
  }

  async getUserByFirebaseUid(firebaseUid) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE firebase_uid = ?`;
      
      this.db.get(query, [firebaseUid], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getMealsByDate(userId, date) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM meals 
        WHERE user_id = ? AND date = ? 
        ORDER BY created_at DESC
      `;
      
      this.db.all(query, [userId, date], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  addMeal(userId, mealData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO meals (user_id, date, name, grams, calories, protein_g, fat_total_g, carbohydrates_total_g, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        userId,
        mealData.date,
        mealData.name,
        mealData.grams,
        mealData.calories,
        mealData.protein_g,
        mealData.fat_total_g,
        mealData.carbohydrates_total_g,
        mealData.timestamp
      ];
      
      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, user_id: userId, ...mealData });
        }
      });
    });
  }

  deleteMeal(userId, date, id) {
    return new Promise((resolve, reject) => {
      const selectQuery = `SELECT * FROM meals WHERE user_id = ? AND date = ? AND id = ?`;
      
      this.db.get(selectQuery, [userId, date, id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          reject(new Error('Meal not found'));
          return;
        }
        
        const deleteQuery = `DELETE FROM meals WHERE user_id = ? AND date = ? AND id = ?`;
        
        this.db.run(deleteQuery, [userId, date, id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    });
  }

  getAllDates(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT date, COUNT(*) as itemCount 
        FROM meals 
        WHERE user_id = ?
        GROUP BY date 
        ORDER BY date DESC
      `;
      
      this.db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getStats(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as totalMeals,
          COUNT(DISTINCT date) as totalDays,
          SUM(calories) as totalCalories,
          AVG(calories) as avgCaloriesPerMeal,
          SUM(protein_g) as totalProtein,
          SUM(fat_total_g) as totalFat,
          SUM(carbohydrates_total_g) as totalCarbs
        FROM meals
        WHERE user_id = ?
      `;
      
      this.db.get(query, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getMealsByDateRange(userId, startDate, endDate) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM meals 
        WHERE user_id = ? AND date BETWEEN ? AND ? 
        ORDER BY date DESC, created_at DESC
      `;
      
      this.db.all(query, [userId, startDate, endDate], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getNutritionTotalsByDate(userId, date) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          date,
          SUM(calories) as totalCalories,
          SUM(protein_g) as totalProtein,
          SUM(fat_total_g) as totalFat,
          SUM(carbohydrates_total_g) as totalCarbs,
          COUNT(*) as mealCount
        FROM meals 
        WHERE user_id = ? AND date = ?
        GROUP BY date
      `;
      
      this.db.get(query, [userId, date], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || {
            date,
            totalCalories: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            mealCount: 0
          });
        }
      });
    });
  }

  searchMeals(userId, searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM meals 
        WHERE user_id = ? AND name LIKE ? 
        ORDER BY created_at DESC
        LIMIT 50
      `;
      
      this.db.all(query, [userId, `%${searchTerm}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  updateMeal(userId, id, mealData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE meals 
        SET name = ?, grams = ?, calories = ?, protein_g = ?, fat_total_g = ?, carbohydrates_total_g = ?
        WHERE user_id = ? AND id = ?
      `;
      
      const values = [
        mealData.name,
        mealData.grams,
        mealData.calories,
        mealData.protein_g,
        mealData.fat_total_g,
        mealData.carbohydrates_total_g,
        userId,
        id
      ];
      
      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Meal not found'));
        } else {
          resolve({ id, user_id: userId, ...mealData });
        }
      });
    });
  }

  async backup(userId) {
    try {
      const meals = await new Promise((resolve, reject) => {
        this.db.all('SELECT * FROM meals WHERE user_id = ? ORDER BY date, created_at', [userId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const user = await new Promise((resolve, reject) => {
        this.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      return {
        exportDate: new Date().toISOString(),
        user: user,
        totalMeals: meals.length,
        meals
      };
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async restore(userId, backupData) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        this.db.run('DELETE FROM meals WHERE user_id = ?', [userId], (err) => {
          if (err) {
            this.db.run('ROLLBACK');
            reject(err);
            return;
          }
        });

        const insertStmt = this.db.prepare(`
          INSERT INTO meals (user_id, date, name, grams, calories, protein_g, fat_total_g, carbohydrates_total_g, timestamp, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let errors = [];
        backupData.meals.forEach(meal => {
          insertStmt.run([
            userId, 
            meal.date,
            meal.name,
            meal.grams,
            meal.calories,
            meal.protein_g,
            meal.fat_total_g,
            meal.carbohydrates_total_g,
            meal.timestamp,
            meal.created_at
          ], (err) => {
            if (err) errors.push(err);
          });
        });

        insertStmt.finalize((err) => {
          if (err || errors.length > 0) {
            this.db.run('ROLLBACK');
            reject(err || errors[0]);
          } else {
            this.db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve({ restored: backupData.meals.length });
              }
            });
          }
        });
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database connection:', err);
          reject(err);
        } else {
          console.log('Database connection closed successfully');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;