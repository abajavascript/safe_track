import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useTranslation } from "react-i18next";
import Logo from "../components/Logo";
import LanguageSelector from "../components/LanguageSelector";
import Messages from "../components/Messages";
import { useNavigate, useLocation } from "react-router-dom";

const SignUp = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Extract email from query parameters on page load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromQuery = params.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location.search]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(userCredential.user); // --- NEED TO BE UNCOMMENTED IN PRODUCTION
      setSuccess(t("verify-your-email"));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Redirect to login page after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(`/?email=${encodeURIComponent(email)}`);
      }, 3000);
      return () => clearTimeout(timer); // Cleanup timer if component unmounts
    }
  }, [success, email, navigate]);

  return (
    <div className="container">
      <Logo />
      <LanguageSelector />
      <h2>{t("signUp")}</h2>
      <Messages error={error} success={success} />
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t("signUp")}</button>
      </form>
    </div>
  );
};

export default SignUp;
