import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Signup.css";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="signup-container">
      <form className="signup-form">
        <h2>Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "SignUp"}
        </button>

        <p className="redirect-text">
          Have an Account? <Link to="/login">LogIn</Link>
        </p>
      </form>
    </div>
  );
}

