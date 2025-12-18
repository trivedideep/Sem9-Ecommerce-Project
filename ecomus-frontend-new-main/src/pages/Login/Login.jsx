import Footer from "../../components/Footer";
import "../../css/login.css";
import { useState } from "react";
import Loginsection from "./Loginsection";
import Registersection from "./Registersection";
import Header from "../../components/Header/Header";

const Login = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  return (
    <>
      <Header />
      <section className="auth-page marginfromtop">
        <div className={`auth-shell ${isSignUpMode ? "sign-up-mode" : ""}`}>
          <aside className="auth-visual">
            <div className="auth-visual__content">
              <img
                src={`${process.env.PUBLIC_URL}/images/Ecomus.svg`}
                alt="Ecomus"
                className="auth-logo"
              />
              <h2>{isSignUpMode ? "Join the style collective" : "Welcome back to Ecomus"}</h2>
              <p>
                {isSignUpMode
                  ? "Create a free account to unlock exclusive drops, wishlist syncing, and faster checkout experiences."
                  : "Sign in to track orders, manage wishlists, and get personalized picks crafted just for you."}
              </p>
              <button
                type="button"
                className="toggle-cta"
                onClick={() => setIsSignUpMode((prev) => !prev)}
              >
                {isSignUpMode ? "Sign in instead" : "Create account"}
              </button>
            </div>
            <div className="floating-shape shape-one" aria-hidden="true" />
            <div className="floating-shape shape-two" aria-hidden="true" />
            <div className="floating-shape shape-three" aria-hidden="true" />
          </aside>

          <div className="auth-form-wrapper">
            {/* <div className="auth-tabs" role="tablist">
              <button
                type="button"
                className={`auth-tab ${!isSignUpMode ? "active" : ""}`}
                onClick={() => setIsSignUpMode(false)}
              >
                Login
              </button>
              <button
                type="button"
                className={`auth-tab ${isSignUpMode ? "active" : ""}`}
                onClick={() => setIsSignUpMode(true)}
              >
                Register
              </button>
            </div> */}

            <div className="forms-flow">
              <Loginsection
                isActive={!isSignUpMode}
                onSwitch={() => setIsSignUpMode(true)}
              />
              <Registersection
                isActive={isSignUpMode}
                onSwitch={() => setIsSignUpMode(false)}
                onSuccess={() => setIsSignUpMode(false)}
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Login;
