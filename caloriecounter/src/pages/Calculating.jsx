import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../css/Calculating.css"

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function FoodTracker() {
  const { currentUser, loading: authLoading } = useAuth();

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [foodItem, setFoodItem] = useState("");
  const [grams, setGrams] = useState("");
  const [meals, setMeals] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein_g: 0,
    fat_total_g: 0,
    carbohydrates_total_g: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [historicalDates, setHistoricalDates] = useState([]);
  const [viewingDate, setViewingDate] = useState(getTodayDate());

  useEffect(() => {
    if (currentUser) {
      loadMealsForDate(selectedDate);
      loadHistoricalDates();
    }
  }, [selectedDate, currentUser]);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  async function loadMealsForDate(date) {
    try {
      setIsLoading(true);
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/meals/${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      
      const data = await response.json();
      setMeals(data.meals);
      setDailyTotals(data.totals);
      
    } catch (error) {
      console.error('Error loading meals:', error);
      showToast("Error loading meals for this date", "error");
      setMeals([]);
      resetTotals();
    } finally {
      setIsLoading(false);
    }
  }

  async function loadHistoricalDates() {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/dates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical dates');
      }
      
      const dates = await response.json();
      setHistoricalDates(dates);
      
    } catch (error) {
      console.error('Error loading historical dates:', error);
      setHistoricalDates([]);
    }
  }

  function resetTotals() {
    setDailyTotals({
      calories: 0,
      protein_g: 0,
      fat_total_g: 0,
      carbohydrates_total_g: 0
    });
  }

  async function handleAddFood() {
    if (!foodItem || !grams) {
      showToast("Please enter both food item and weight in grams", "error");
      return;
    }
    
    try {
      setIsLoading(true);
      const token = await currentUser.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          foodItem: foodItem,
          grams: parseInt(grams),
          userId: currentUser.uid
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add food');
      }
      
      const result = await response.json();
      
      await loadMealsForDate(selectedDate);
      await loadHistoricalDates();
      
      setFoodItem("");
      setGrams("");
      
      showToast(result.message, "success");
      
    } catch (error) {
      console.error('Error adding food:', error);
      showToast(error.message || "Error adding food item", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteFood(id) {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/meals/${selectedDate}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete food');
      }
      
      const result = await response.json();
      
      await loadMealsForDate(selectedDate);
      await loadHistoricalDates();
      
      showToast(result.message, "success");
      
    } catch (error) {
      console.error('Error deleting food:', error);
      showToast(error.message || "Error deleting food item", "error");
    }
  }

  function handleViewDate() {
    loadMealsForDate(viewingDate);
    setSelectedDate(viewingDate);
    showToast(`Viewing food log for ${new Date(viewingDate).toLocaleDateString()}`, "info");
  }
  
  function showToast(message, type = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  }

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-card">
          <div className="spinner auth-spinner"></div>
          <p className="auth-loading-text">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="auth-required">
        <div className="auth-card">
          <div className="auth-card-content">
            <h2 className="auth-title">Access Required</h2>
            <p className="auth-subtitle">Please login to access your food tracker</p>
          </div>
          
          <div className="auth-features">
            <div className="auth-features-box">
            </div>
            
            <button 
              onClick={() => window.location.href = '/login'}
              className="auth-login-btn"
            >
              Login to Continue
            </button>
            
            <p className="auth-register-text">
              Don't have an account? 
              <a href="/signup" className="auth-register-link">
                  Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 food-tracker-container">
      <header className="bg-green-600 text-white p-4 shadow-md app-header">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-shadow">Daily Food Tracker</h1>
          <div className="user-info">
            Welcome, {currentUser.email}
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 card card-hover">
          <h2 className="text-xl font-semibold text-green-800 border-b border-green-200 pb-2 mb-4 gradient-text">
            Add Food Item
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Food Item</label>
                <input 
                  type="text" 
                  value={foodItem}
                  onChange={(e) => setFoodItem(e.target.value)}
                  placeholder="e.g. Apple, Chicken Breast"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">Weight (g)</label>
                <input 
                  type="number" 
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  placeholder="100"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleAddFood} 
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Loading...
                  </>
                ) : "Add Food"}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 card totals-card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-800 gradient-text">
              Food Log: {new Date(selectedDate).toLocaleDateString()}
            </h2>
            
            <div className="flex gap-2">
              <input 
                type="date" 
                value={viewingDate}
                onChange={(e) => setViewingDate(e.target.value)}
                className="p-2 border border-gray-300 rounded"
              />
              <button 
                onClick={handleViewDate}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded btn"
                disabled={isLoading}
              >
                View
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <span className="spinner"></span>
              Loading meals...
            </div>
          ) : meals.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="p-2 text-left">Food</th>
                      <th className="p-2 text-left">Weight (g)</th>
                      <th className="p-2 text-left">Calories</th>
                      <th className="p-2 text-left">Protein (g)</th>
                      <th className="p-2 text-left">Carbs (g)</th>
                      <th className="p-2 text-left">Fat (g)</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meals.map((meal) => (
                      <tr key={meal.id} className="border-b border-gray-200 food-item">
                        <td className="p-2">{meal.name}</td>
                        <td className="p-2">{meal.grams}</td>
                        <td className="p-2">{Math.round(meal.calories)}</td>
                        <td className="p-2">{meal.protein_g.toFixed(1)}</td>
                        <td className="p-2">{meal.carbohydrates_total_g.toFixed(1)}</td>
                        <td className="p-2">{meal.fat_total_g.toFixed(1)}</td>
                        <td className="p-2">
                          <button 
                            onClick={() => handleDeleteFood(meal.id)}
                            className="text-red-600 hover:text-red-800 delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 grid grid-cols-4 gap-4 bg-green-50 p-4 rounded-lg totals-grid">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Calories</p>
                  <p className="text-2xl font-bold text-green-800">
                    {Math.round(dailyTotals.calories)}
                  </p>
                  <div className="progress-container">
                    <div 
                      className="progress-bar progress-calories" 
                      style={{ width: `${Math.min(dailyTotals.calories / 2000 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Protein</p>
                  <p className="text-2xl font-bold text-green-800">
                    {dailyTotals.protein_g.toFixed(1)}g
                  </p>
                  <div className="progress-container">
                    <div 
                      className="progress-bar progress-protein" 
                      style={{ width: `${Math.min(dailyTotals.protein_g / 50 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Carbs</p>
                  <p className="text-2xl font-bold text-green-800">
                    {dailyTotals.carbohydrates_total_g.toFixed(1)}g
                  </p>
                  <div className="progress-container">
                    <div 
                      className="progress-bar progress-carbs" 
                      style={{ width: `${Math.min(dailyTotals.carbohydrates_total_g / 250 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Fat</p>
                  <p className="text-2xl font-bold text-green-800">
                    {dailyTotals.fat_total_g.toFixed(1)}g
                  </p>
                  <div className="progress-container">
                    <div 
                      className="progress-bar progress-fat" 
                      style={{ width: `${Math.min(dailyTotals.fat_total_g / 65 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No food items logged for this date. Add some food to get started!
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 card">
          <h2 className="text-xl font-semibold text-green-800 border-b border-green-200 pb-2 mb-4 gradient-text">
            Past Entries
          </h2>
          
          {historicalDates.length > 0 ? (
            <div className="space-y-2">
              {historicalDates.map(({ date, itemCount }) => (
                <div 
                  key={date} 
                  className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-green-50 date-item"
                  onClick={() => {
                    setSelectedDate(date);
                    setViewingDate(date);
                    showToast(`Viewing food log for ${new Date(date).toLocaleDateString()}`, "info");
                  }}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
                    <span className="text-green-700">
                      {itemCount} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No historical data available.
            </div>
          )}
        </div>
      </main>
      
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}