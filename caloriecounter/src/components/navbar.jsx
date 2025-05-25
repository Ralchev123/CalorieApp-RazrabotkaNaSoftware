// NavBar.js
import { useState } from 'react';
import { ChevronDown, Utensils } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function NavBar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <div className="logo">
              <Utensils className="logo-icon" />
              <Link to="/" className="logo-text">MyCal</Link>
            </div>
          </div>
          <div className="navbar-links">
            <Link to="/count-your-cal" className="nav-link">Count Your Cal</Link>
            <a href="#features" className="nav-link">What It Does</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            
            {currentUser ? (
              <div className="user-menu">
                <span className="user-email">{currentUser.email}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-login">Log In</Link>
                <Link to="/signup" className="btn-signup">Sign Up</Link>
              </>
            )}
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
            <Link to="/count-your-cal" className="mobile-nav-link">Count Your Cal</Link>
            <a href="#features" className="mobile-nav-link">Features</a>
            <a href="#how-it-works" className="mobile-nav-link">How It Works</a>
            <div className="mobile-buttons">
              {currentUser ? (
                <>
                  <span className="user-email-mobile">{currentUser.email}</span>
                  <button onClick={handleLogout} className="btn-logout-mobile">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-login-mobile">Log In</Link>
                  <Link to="/signup" className="btn-signup-mobile">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;