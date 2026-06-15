import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    setError("");
    const data = await login(email);
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setError("Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="page login-page">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <span className="login-icon">🛡️</span>
            <h1>Welcome Back</h1>
            <p>Sign in to FraudGuard AI Banking</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="login-hints">
            <p>Demo accounts:</p>
            <p><code>user@example.com</code> → User Dashboard</p>
            <p><code>admin@example.com</code> → Admin Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
