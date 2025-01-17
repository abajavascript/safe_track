import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { useTranslation } from "react-i18next";
import Logo from "../components/Logo"; // Add this
import LanguageSelector from "../components/LanguageSelector"; // Add this
import Messages from "../components/Messages"; // Add this
import { auth } from "../firebaseConfig";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Dashboard = () => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [userAuthState, setUserAuthState] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiService.getUserList(); // Fetch user list
        setUserData(response.data);
        setError("");
      } catch (err) {
        if (err.response?.data?.message === "ERR_EMAIL_IS_NOT_VERIFIED") {
          setError(t("ERR_EMAIL_IS_NOT_VERIFIED"));
          setUserAuthState("NotVerifiedEmail");
        } else if (
          err.response?.data?.message === "ERR_EMAIL_IS_NOT_APPROVED"
        ) {
          setError(t("ERR_EMAIL_IS_NOT_APPROVED"));
          setUserAuthState("NotApprovedUser");
        } else {
          setError(
            err.response ? err.response.data.message : t("unknown-error")
          );
        }
      }
    };

    fetchUserData();
  }, []);

  const handleResendVerification = async () => {
    setVerificationMessage("");
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setVerificationMessage(t("verificationEmailSent"));
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate(`/?email=${encodeURIComponent(user.email)}`);
        }, 3000);
      } else {
        setVerificationMessage(t("userNotLoggedIn"));
      }
    } catch (error) {
      setVerificationMessage(t("failedToSendVerificationEmail"));
    }
  };

  return (
    <div className="dashboard">
      <Logo />
      <LanguageSelector />
      <h1>{t("dashboard")}</h1>
      <Messages error={error} />{" "}
      {error && userAuthState === "NotVerifiedEmail" && (
        <div>
          <button onClick={handleResendVerification}>
            {t("resendVerificationEmail")}
          </button>
        </div>
      )}
      {verificationMessage && (
        <p style={{ color: "green" }}>{verificationMessage}</p>
      )}
      {userData && (
        <div>
          <h2>{t("userList")}</h2>
          <ul>
            {userData.data.map((user) => (
              <li key={user.uid}>
                {user.name} - {user.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
