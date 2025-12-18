import { useMemo, useState } from "react";
import { Field, Form, Formik } from "formik";
import { Loginuser } from "./Validation/Loginuser";
import { useNavigate } from "react-router-dom";
import { tokenstore } from "../../Localstorage/Store";
import {
  usePostLoginUserMutation,
  usePostGoogleAuthMutation,
} from "../../store/api/userapi";
import { useDispatch } from "react-redux";
import { userApi } from "../../store/api/userapi";
import {
  FaEnvelope,
  FaGoogle,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaLock,
} from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";

const Loginsection = ({ isActive, onSwitch }) => {
  const [clientloginerrors, setclientloginerrors] = useState(null);
  const nvg = useNavigate();
  const dispatch = useDispatch();
  const [loginuser] = usePostLoginUserMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = usePostGoogleAuthMutation();

  const googleLoginEnabled = useMemo(
    () => Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID),
    []
  );

  const handleGoogleSignIn = useGoogleLogin({
    flow: "implicit",
    scope: "openid profile email",
    ux_mode: "popup",
    redirect_uri: window.location.origin,
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse?.access_token && !tokenResponse?.id_token) {
        setclientloginerrors("Unable to authenticate with Google. Please try again.");
        return;
      }

      try {
        const response = await googleAuth({
          accessToken: tokenResponse.access_token,
          credential: tokenResponse.id_token,
        });

        if (response?.data?.status === "successfull") {
          setclientloginerrors(null);
          tokenstore(response.data.token);
          dispatch(userApi.util.invalidateTags(["User"]));
          nvg("/home");
        } else {
          setclientloginerrors(
            response?.error?.data?.message || "Google sign-in failed."
          );
        }
      } catch (error) {
        setclientloginerrors("Google sign-in failed. Please try again.");
      }
    },
    onError: () => {
      setclientloginerrors("Google sign-in was cancelled. Please try again.");
    },
  });

  const loginform = async (value, setFieldError) => {
    try {
      const response = await loginuser(value);
      if (response?.data?.status === "successfull") {
        tokenstore(response.data.token);
        dispatch(userApi.util.invalidateTags(["User"]));
        nvg("/home");
      } else if (response?.error?.data?.message) {
        setclientloginerrors(response.error.data.message);
      }
    } catch (error) { }
  };

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        remember: true,
      }}
      validationSchema={Loginuser}
      onSubmit={(values, { setFieldError }) => {
        loginform(values, setFieldError);
      }}
    >
      {({ values, errors, handleSubmit, touched }) => (
        <Form
          autoComplete="off"
          className={`auth-form sign-in-form ${isActive ? "active" : ""}`}
          onSubmit={handleSubmit}
        >
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue shopping with Ecomus</p>



          <div className="input-field">
            <FaEnvelope />
            <Field
              type="email"
              name="email"
              placeholder="Email address"
              value={values.email}
            />
          </div>
          {errors.email && touched.email ? (
            <span className="input-error">{errors.email}</span>
          ) : null}

          <div className="input-field">
            <FaLock />
            <Field
              type="password"
              name="password"
              placeholder="Password"
              value={values.password}
            />
          </div>
          {errors.password && touched.password ? (
            <span className="input-error">{errors.password}</span>
          ) : null}

          <div className="auth-actions">
            <label className="remember">
              <Field type="checkbox" name="remember" />
              Remember me
            </label>
            <button
              type="button"
              className="link-btn"
              onClick={() => nvg("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="submit-btn">
            Sign in
          </button>

          <div className="social-text">Or sign in with</div>
          <div className="social-media">
            <button
              style={{ justifyContent: "center", width: "100%" }}
              type="button"
              className="social-icon"
              aria-label="Sign in with Google"
              onClick={() => {
                setclientloginerrors(null);
                if (!googleLoginEnabled) {
                  setclientloginerrors(
                    "Google sign-in is not configured. Please contact support."
                  );
                  return;
                }
                if (!isGoogleLoading) {
                  handleGoogleSignIn();
                }
              }}
              disabled={!googleLoginEnabled || isGoogleLoading}
            >
              <FaGoogle />oogle
            </button>
            {/* <button type="button" className="social-icon" aria-label="Sign in with Facebook">
              <FaFacebookF />
            </button>
            <button type="button" className="social-icon" aria-label="Sign in with GitHub">
              <FaGithub />
            </button>
            <button type="button" className="social-icon" aria-label="Sign in with LinkedIn">
              <FaLinkedinIn />
            </button> */}
          </div>


          {clientloginerrors ? (
            <span className="input-error" style={{ textAlign: "center" }}>
              {clientloginerrors}
            </span>
          ) : null}

          <div className="toggle-message">
            <span>New to Ecomus?</span>
            <button type="button" className="switch-btn" onClick={onSwitch}>
              Create account
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Loginsection;
