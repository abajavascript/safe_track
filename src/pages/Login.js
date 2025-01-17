import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import Logo from "../components/Logo"; // Add this
import LanguageSelector from "../components/LanguageSelector"; // Add this
import Messages from "../components/Messages"; // Add this
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";

const Login = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  function clearMessages() {
    setResetMessage("");
    setError("");
  }

  // Extract email from query parameters on page load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromQuery = params.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location.search]);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from the backend
          // const userData = await apiService.getUserById(user.uid);
          // if (userData.data.status === "PendingApproval") {
          //   navigate("/personal-info");
          // } else {
          //   navigate("/dashboard");
          // }
          console.log("onAuthStateChanged");
          console.log(user);
          console.log(auth);
          await userAfterLogin(user);
          console.log("User is logged in");
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      } else {
        console.log("not loggd in");
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const userAfterLogin = async (user) => {
    const token = await user.getIdToken(); // Get Firebase token
    localStorage.setItem("token", token); // Store token in localStorage

    // Check user status from the backend
    let userStatus = "";
    let response = await apiService.existUserById(user.uid);
    if (response.data.exist) {
      try {
        response = await apiService.getUserById(user.uid);
        userStatus = response.data.data.status;
      } catch (error) {
        userStatus = "UserStatusUnknown";
      }
    } else {
      userStatus = "UserDoesNotExist";
    }
    if (userStatus === "UserDoesNotExist" || userStatus === "PendingApproval") {
      // Redirect to Personal Information page
      console.log(userStatus);
      navigate("/personal-info");
    } else {
      // Redirect to Dashboard
      await subscribeToNotifications(user.uid);
      navigate("/regions");
      // navigate("/dashboard");
    }
  };

  const subscribeToNotifications = async (uid) => {
    console.log("Enter to subscribeToNotifications.");
    if ("serviceWorker" in navigator && "PushManager" in window) {
      console.log("step 1 to subscribeToNotifications.");
      // Use the existing registered service worker
      const registration = await navigator.serviceWorker.ready;

      // const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("step 2 to subscribeToNotifications.");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BIHekNP1gYjqFv0utx40bX4EkxZy3xnlKPFxABpbLGj7Gw9wY1zAcuOZ30Iip5PAutJm1T0W-sccI4Vfl0L9G3A", // Replace with your public VAPID key
      });
      console.log("step 3 to subscribeToNotifications.");

      // Send subscription to backend
      await apiService.saveSubscription({
        subscription,
        uid: uid,
      });
    }
    console.log("Exit from subscribeToNotifications.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // const token = await userCredential.user.getIdToken(); // Get Firebase token
      // localStorage.setItem("token", token); // Store token in localStorage

      // // Check user status from the backend
      // let userStatus = "";
      // let response = await apiService.existUserById(userCredential.user.uid);
      // if (response.data.exist) {
      //   try {
      //     response = await apiService.getUserById(userCredential.user.uid);
      //     userStatus = response.data.data.status;
      //   } catch (error) {
      //     userStatus = "UserStatusUnknown";
      //   }
      // } else {
      //   userStatus = "UserDoesNotExist";
      // }
      // if (
      //   userStatus === "UserDoesNotExist" ||
      //   userStatus === "PendingApproval"
      // ) {
      //   // Redirect to Personal Information page
      //   console.log(userStatus);
      //   navigate("/personal-info");
      // } else {
      //   // Redirect to Dashboard
      //   await subscribeToNotifications(userCredential.user.uid);
      //   navigate("/regions");
      //   // navigate("/dashboard");
      // }
    } catch (err) {
      //setError(err.message);
      if (err.response?.data?.message === "ERR_EMAIL_IS_NOT_VERIFIED") {
        setError(t("ERR_EMAIL_IS_NOT_VERIFIED"));
      } else if (err.response?.data?.message === "ERR_EMAIL_IS_NOT_APPROVED") {
        setError(t("ERR_EMAIL_IS_NOT_APPROVED"));
      } else {
        setError(err.response ? err.response.data.message : err.message);
      }
    }
  };

  const handlePasswordReset = async () => {
    clearMessages();
    if (!email) {
      setError(t("please-enter-your-email-to-reset-your-password"));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage(t("password-reset-email-sent"));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignUp = () => {
    navigate(`/signup?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="container">
      <Logo />
      <LanguageSelector />
      <Messages error={error} success={resetMessage} />{" "}
      <form onSubmit={handleLogin}>
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
        <button type="submit">{t("signIn")}</button>
      </form>
      <div
        className="links"
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "300px",
          marginTop: "15px",
        }}
      >
        <button
          onClick={handlePasswordReset}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          {t("resetPassword")}
        </button>
        <button
          onClick={handleSignUp}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          {t("signUp")}
        </button>
      </div>
    </div>
  );
};

export default Login;
