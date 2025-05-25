import { useState } from 'react';
import { ArrowRight, ChevronDown, Check, Utensils, Activity, TrendingUp, User } from 'lucide-react';
import { Link } from "react-router-dom";
import "../css/HomePage.css"

function NavBar(){
    const [isNavOpen, setIsNavOpen] = useState(false);

    
    return <nav className="navbar">  
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <div className="logo">
              <Utensils className="logo-icon" />
              <Link to="/" className="logo-text">MyCal</Link>
            </div>
          </div>
          <div className="navbar-links">
            <a href="count-your-cal" className="nav-link">Count Your Cal</a>
            <a href="how-it-works" className="nav-link">What It Does</a>
            <a href="pricing" className="nav-link">How It Works</a>
            <Link to="/login" className="btn-login">Log In</Link>
            <Link to="/signup" className="btn-signup">Sign Up</Link>

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
            <Link to="/login" className="btn-login-mobile">Log In</Link>
            <Link to="/signup" className="btn-signup-mobile">Sign Up</Link>

            </div>
          </div>
        </div>
      )}
    </nav>
}

export default NavBar