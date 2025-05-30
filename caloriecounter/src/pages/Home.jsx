import { useState } from 'react';
import { ArrowRight, ChevronDown, Check, Utensils, Activity, TrendingUp, User } from 'lucide-react';
import { Link } from "react-router-dom";

import "../css/HomePage.css"

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="home-page">

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Get Your Life <span className="highlight">In Your Hands</span>
              </h1>
              <p className="hero-description">
                Best and easiest way to track your nutrition, get a customised diet plan and lose weigth.
              </p>
              <div className="hero-buttons">
                <Link to = "/signup" className="btn-primary">
                  Sign Up
                  <ArrowRight className="btn-icon" />
                </Link>
                <Link to = "/login"className="btn-secondary">
                  Log In
                </Link>
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
                  Become One of the Many Happy Users
                </span>
              </div>
            </div>
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
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Features Designed Only For The Best</h2>
            <p className="section-description">
              Understand what you eat and learn what you should.
            </p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: <Activity className="feature-icon" />,
                title: "Personalized Goals",
                description: "Set custom calorie goals based on your needs."
              },
              {
                icon: <TrendingUp className="feature-icon" />,
                title: "Detailed Analytics",
                description: "Understand all the macros that you consume and how much you should."
              },
              {
                icon: <Check className="feature-icon" />,
                title: "Diet Plan",
                description: "Get a personalised diet plan tailored only to you."
              },

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

      <section id="how-it-works" className="process-section">
        <div className="process-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">
              Follow These Simple Steps
            </p>
          </div>
          <div className="process-steps">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Sign Up and Log your charachteristics."
              },
              {
                step: "02",
                title: "Track Your Food",
                description: "Log your meals and snacks"
              },
              {
                step: "03",
                title: "Get A Custom Diet Plan",
                description: "Our app will give you a plan of exactly what you need"
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

      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Health?</h2>
          <p className="cta-description">
            Join thousands of users who are achieving their health goals with MyCal.
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

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-columns">
            <div className="footer-column">
              <div className="footer-logo">
                <Utensils className="footer-logo-icon" />
                <span className="footer-logo-text">MyCal</span>
              </div>
              <p className="footer-tagline">
                Making nutrition tracking simple and effective for everyone.
              </p>
            </div>
            
            
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">
              &copy; {new Date().getFullYear()} MyCal. All rights reserved.
            </p>
            <div className="legal-links">
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}