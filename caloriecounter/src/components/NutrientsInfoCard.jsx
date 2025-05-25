<div className="hero-image">
<div className="app-preview">
  <div className="app-header">
    <div className="app-title">Daily Summary</div>
    <div className="app-summary">
      <div className="calorie-info">
        <div className="calorie-label">Calories</div>
        <div className="calorie-value">1,456 / 2,000</div>
      </div>
      <div className="calorie-chart">
        <div className="chart-percent">73%</div>
        <svg className="chart-circle" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" className="chart-bg"></circle>
          <circle 
            cx="18" cy="18" r="16" 
            className="chart-progress"
            strokeDasharray="100" 
            strokeDashoffset="27"
            transform="rotate(-90 18 18)"
          ></circle>
        </svg>
      </div>
    </div>
  </div>
  <div className="app-content">
    <div className="nutrient-item">
      <div className="nutrient-info">
        <div className="nutrient-icon protein-icon">
          <Utensils className="icon" />
        </div>
        <div className="nutrient-details">
          <div className="nutrient-name">Protein</div>
          <div className="nutrient-value">82g / 120g</div>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill protein-fill" style={{ width: '68%' }}></div>
      </div>
    </div>
    <div className="nutrient-item">
      <div className="nutrient-info">
        <div className="nutrient-icon carbs-icon">
          <Activity className="icon" />
        </div>
        <div className="nutrient-details">
          <div className="nutrient-name">Carbs</div>
          <div className="nutrient-value">145g / 250g</div>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill carbs-fill" style={{ width: '58%' }}></div>
      </div>
    </div>
    <div className="nutrient-item">
      <div className="nutrient-info">
        <div className="nutrient-icon fat-icon">
          <TrendingUp className="icon" />
        </div>
        <div className="nutrient-details">
          <div className="nutrient-name">Fat</div>
          <div className="nutrient-value">47g / 65g</div>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill fat-fill" style={{ width: '72%' }}></div>
      </div>
    </div>
  </div>
</div>
</div>