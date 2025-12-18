import { useMemo, useState } from "react";
import { Field, Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { tokenstore } from "../../Localstorage/Store";
import { Registerform } from "./Validation/Registerform";
import {
  usePostCreateUserMutation,
  usePostGoogleAuthMutation,
} from "../../store/api/userapi";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaGoogle,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn,
  FaCalendarAlt,
} from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";

const Registersection = ({ isActive, onSwitch, onSuccess }) => {
  const nvg = useNavigate();
  const [createuser] = usePostCreateUserMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = usePostGoogleAuthMutation();
  const [googleError, setGoogleError] = useState(null);

  const googleLoginEnabled = useMemo(
    () => Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID),
    []
  );

  const handleGoogleSignUp = useGoogleLogin({
    flow: "implicit",
    scope: "openid profile email",
    ux_mode: "popup",
    redirect_uri: window.location.origin,
    onSuccess: async (tokenResponse) => {
      if (!tokenResponse?.access_token && !tokenResponse?.id_token) {
        setGoogleError("Unable to authenticate with Google. Please try again.");
        return;
      }

      try {
        const response = await googleAuth({
          accessToken: tokenResponse.access_token,
          credential: tokenResponse.id_token,
        });

        if (response?.data?.status === "successfull") {
          setGoogleError(null);
          tokenstore(response.data.token);
          if (onSuccess) {
            onSuccess(response.data);
          } else {
            nvg("/home");
          }
        } else {
          setGoogleError(
            response?.error?.data?.message || "Google sign-up failed."
          );
        }
      } catch (error) {
        setGoogleError("Google sign-up failed. Please try again.");
      }
    },
    onError: () => {
      setGoogleError("Google sign-up was cancelled. Please try again.");
    },
  });

  const registerform = async (value, setFieldError) => {
    try {
      const response = await createuser(value);
      if (response.data.status === "sucessful") {
        tokenstore(response.data.token);
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          nvg("/home");
        }
      } else if (response.data.errors) {
        if (response.data.errors.keyValue?.email) {
          setFieldError(
            "email",
            "Email is already registered. Please use a different email."
          );
        }
        if (response.data.errors.keyValue?.mobile) {
          setFieldError(
            "mobile",
            "Mobile number is already registered. Please use a different number."
          );
        }
      }
    } catch (error) { }
  };

  return (
    <Formik
      initialValues={{
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        password: "",
        dob: null,
      }}
      validationSchema={Registerform}
      onSubmit={(values, { setFieldError }) => {
        registerform(values, setFieldError);
      }}
    >
      {({ values, errors, handleSubmit, touched }) => (
        <Form
          autoComplete="off"
          className={`auth-form sign-up-form ${isActive ? "active" : ""}`}
          onSubmit={handleSubmit}
        >
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">
            Join Ecomus and discover curated picks just for you
          </p>



          <div className="input-grid">
            <div>
              <div className="input-field">
                <FaUser />
                <Field
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  value={values.first_name}
                />
              </div>
              {errors.first_name && touched.first_name ? (
                <span className="input-error">{errors.first_name}</span>
              ) : null}
            </div>

            <div>
              <div className="input-field">
                <FaUser />
                <Field
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  value={values.last_name}
                />
              </div>
              {errors.last_name && touched.last_name ? (
                <span className="input-error">{errors.last_name}</span>
              ) : null}
            </div>

            <div>
              <div className="input-field">
                <FaPhoneAlt />
                <Field
                  type="tel"
                  name="mobile"
                  placeholder="Mobile number"
                  value={values.mobile}
                />
              </div>
              {errors.mobile && touched.mobile ? (
                <span className="input-error">{errors.mobile}</span>
              ) : null}
            </div>

            <div>
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
            </div>

            <div>
              <div className="input-field">
                <FaCalendarAlt />
                <Field
                  type="date"
                  name="dob"
                  placeholder="Date of birth"
                  value={values.dob}
                />
              </div>
              {errors.dob && touched.dob ? (
                <span className="input-error">{errors.dob}</span>
              ) : null}
            </div>

            <div>
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
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Register now
          </button >

          <div className="social-text">Or sign up with</div>
          <div className="social-media">
            <button
              style={{ justifyContent: "center", width: "100%" }}
              type="button"
              className="social-icon"
              aria-label="Register with Google"
              onClick={() => {
                setGoogleError(null);
                if (!googleLoginEnabled) {
                  setGoogleError(
                    "Google sign-up is not configured. Please contact support."
                  );
                  return;
                }
                if (!isGoogleLoading) {
                  handleGoogleSignUp();
                }
              }}
              disabled={!googleLoginEnabled || isGoogleLoading}
            >
              <FaGoogle />oogle
            </button>
            {/* <button type="button" className="social-icon" aria-label="Register with Facebook">
              <FaFacebookF />
            </button>
            <button type="button" className="social-icon" aria-label="Register with GitHub">
              <FaGithub />
            </button>
            <button type="button" className="social-icon" aria-label="Register with LinkedIn">
              <FaLinkedinIn />
            </button> */}
          </div>

          {googleError ? (
            <span className="input-error" style={{ textAlign: "center" }}>
              {googleError}
            </span>
          ) : null}

          <div className="toggle-message">
            <span>Already have an account?</span>
            <button type="button" className="switch-btn" onClick={onSwitch}>
              Sign in
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default Registersection;
