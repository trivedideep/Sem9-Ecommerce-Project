import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import "../../css/login.css";

const ResetPassword = () => {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_URL}/user/forgetpassword/${userId}/${token}`;
      const formData = new FormData();
      formData.append("password", password);
      formData.append("confirm_password", confirmPassword);
      await axios.patch(url, formData);
      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to reset password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <main className="auth-page auth-standalone-page">
        <div className="auth-standalone-card">
          <div className="auth-standalone-header">
            <h2 className="auth-title">Reset password</h2>
            <p className="auth-subtitle">Choose a new password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-standalone-form">
            <div className="input-field">
              <input
                type="password"
                name="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error ? <div className="input-error text-center">{error}</div> : null}
            {message ? <div className="success-text text-center">{message}</div> : null}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Saving..." : "Save password"}
            </button>

            <div className="toggle-message">
              <button type="button" className="switch-btn" onClick={() => navigate("/login")}>Back to login</button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
