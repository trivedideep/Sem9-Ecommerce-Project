import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import "../../css/login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const url = `${process.env.REACT_APP_API_URL}/user/forgetpassword`;
      const formData = new FormData();
      formData.append("email", email);
      const res = await axios.post(url, formData);

      setMessage("Reset link generated. Redirecting to reset page...");
      const { userId, token } = res.data;
      setTimeout(() => {
        navigate(`/reset-password/${userId}/${token}`);
      }, 800);
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to process request";
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
            <h2 className="auth-title">Forgot password</h2>
            <p className="auth-subtitle">Enter your account email to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-standalone-form">
            <div className="input-field">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error ? <div className="input-error text-center">{error}</div> : null}
            {message ? <div className="success-text text-center">{message}</div> : null}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Loading..." : "Submit"}
            </button>

            <div className="toggle-message">
              <button type="button" className="switch-btn" onClick={() => navigate("/login")}>
                Back to login
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
