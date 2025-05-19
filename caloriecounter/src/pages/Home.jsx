import { useState } from 'react';
import { ArrowRight, ChevronDown, Check, Utensils, Activity, TrendingUp, User } from 'lucide-react';
import "../css/HomePage.css"

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="navbar-logo">
              <div className="logo">
                <Utensils className="logo-icon" />
                <span className="logo-text">NutriTrack</span>
              </div>
            </div>
            <div className="navbar-links">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#testimonials" className="nav-link">Testimonials</a>
              <button className="btn-login">Log In</button>
              <button className="btn-signup">Sign Up</button>
            </div>
            <div className="mobile-menu-button">
              <button 
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="mobile-menu-icon"
              >
                <ChevronDown className={`menu-icon ${isNavOpen ? 'rotate' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isNavOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              <a href="#features" className="mobile-nav-link">Features</a>
              <a href="#how-it-works" className="mobile-nav-link">How It Works</a>
              <a href="#pricing" className="mobile-nav-link">Pricing</a>
              <a href="#testimonials" className="mobile-nav-link">Testimonials</a>
              <div className="mobile-buttons">
                <button className="btn-login-mobile">Log In</button>
                <button className="btn-signup-mobile">Sign Up</button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Track Your Calories, <span className="highlight">Transform Your Life</span>
              </h1>
              <p className="hero-description">
                The easiest way to track your nutrition, stay fit, and achieve your health goals. Used by over 1 million people worldwide.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary">
                  Get Started Free
                  <ArrowRight className="btn-icon" />
                </button>
                <button className="btn-secondary">
                  View Demo
                </button>
              </div>
              <div className="user-count">
                <div className="user-avatars">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`user-avatar user-avatar-${i}`}>
                      <User className="avatar-icon" />
                    </div>
                  ))}
                </div>
                <span className="user-count-text">
                  Joined by 10,000+ users this month
                </span>
              </div>
            </div>
            <div className="hero-image">
              <div className="app-preview">
                <div className="app-badge">
                  Beta
                </div>
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Features Designed for Your Success</h2>
            <p className="section-description">
              Everything you need to track your nutrition and reach your health goals.
            </p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: <Utensils className="feature-icon" />,
                title: "Extensive Food Database",
                description: "Over 1 million foods with accurate nutritional information to track your diet precisely."
              },
              {
                icon: <Activity className="feature-icon" />,
                title: "Personalized Goals",
                description: "Set custom calorie and macro goals based on your unique health objectives."
              },
              {
                icon: <TrendingUp className="feature-icon" />,
                title: "Detailed Analytics",
                description: "Track trends over time with beautiful charts and actionable insights."
              },
              {
                icon: <Check className="feature-icon" />,
                title: "Meal Planning",
                description: "Plan your meals ahead of time and stay on track with your nutrition goals."
              },
              {
                icon: <User className="feature-icon" />,
                title: "Community Support",
                description: "Connect with others on the same journey and share tips and motivation."
              },
              {
                icon: <ArrowRight className="feature-icon" />,
                title: "Recipe Calculator",
                description: "Calculate nutrition for your homemade meals and save them for future use."
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon-wrapper">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="process-section">
        <div className="process-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Start your health journey in three simple steps.
            </p>
          </div>
          <div className="process-steps">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Sign up and tell us about your goals, activity level, and dietary preferences."
              },
              {
                step: "02",
                title: "Track Your Food",
                description: "Log your meals and snacks with our easy-to-use food tracking system."
              },
              {
                step: "03",
                title: "Reach Your Goals",
                description: "Stay consistent, monitor your progress, and achieve lasting results."
              }
            ].map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">
                  <span>{step.step}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < 2 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Health?</h2>
          <p className="cta-description">
            Join thousands of users who are achieving their health goals with NutriTrack.
          </p>
          <div className="cta-buttons">
            <button className="cta-primary">
              Get Started Free
            </button>
            <button className="cta-secondary">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-columns">
            <div className="footer-column">
              <div className="footer-logo">
                <Utensils className="footer-logo-icon" />
                <span className="footer-logo-text">NutriTrack</span>
              </div>
              <p className="footer-tagline">
                Making nutrition tracking simple and effective for everyone.
              </p>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-heading">Product</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">Features</a></li>
                <li><a href="#" className="footer-link">Pricing</a></li>
                <li><a href="#" className="footer-link">FAQ</a></li>
                <li><a href="#" className="footer-link">Download App</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-heading">Company</h3>
              <ul className="footer-links">
                <li><a href="#" className="footer-link">About Us</a></li>
                <li><a href="#" className="footer-link">Blog</a></li>
                <li><a href="#" className="footer-link">Careers</a></li>
                <li><a href="#" className="footer-link">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-heading">Stay Updated</h3>
              <p className="footer-newsletter-text">
                Subscribe to our newsletter for tips and updates.
              </p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">
              &copy; {new Date().getFullYear()} NutriTrack. All rights reserved.
            </p>
            <div className="legal-links">
              <a href="#" className="legal-link">
                Terms
              </a>
              <a href="#" className="legal-link">
                Privacy
              </a>
              <a href="#" className="legal-link">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}