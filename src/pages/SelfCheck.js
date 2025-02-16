import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import Logo from "../components/Logo";
import LanguageSelector from "../components/LanguageSelector";
import ActionsBar from "../components/ActionsBar";
import Messages from "../components/Messages";

import { apiService } from "../services/apiService";
import { useAuth } from "../AuthContext";

const SelfCheck = () => {
  const { t } = useTranslation();
  const [safetyStatus, setSafetyStatus] = useState(null); // Yes or No
  const [safetyComment, setSafetyComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const { user } = useAuth();

  const fetchStatus = async () => {
    if (!user) {
      console.log("fetchStatus : user is null");
      return;
    }
    console.log("fetchStatus : user = ", user);
    try {
      const status = await apiService.getLastStatusByUserId(user.uid);
      console.log("fetchStatus : status = ", status);
      // const status = {
      //   lastRequest: new Date() - 1,
      //   lastResponse: { date: new Date(), safety_status: "Yes" },
      // };
      setLastRequest(status.data.data.lastRequest);
      setLastResponse(status.data.data.lastResponse);
      console.log(status);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleResponse = async () => {
    setError("");
    setSuccess("");

    if (safetyStatus === null) {
      setError(t("pleaseSelectResponse"));
      return;
    }

    try {
      const response = {
        safety_status: safetyStatus,
        safety_comment: safetyStatus === "No" ? safetyComment : "",
      };
      await apiService.addResponse(response);
      setSuccess(t("responseSaved"));
      setSafetyStatus(null);
      setSafetyComment("");
      fetchStatus();
    } catch (err) {
      setError(err.response ? err.response.data.message : t("unknown-error"));
    }
  };

  return (
    <div className="container">
      <Logo />
      <LanguageSelector />
      <ActionsBar />
      {user && (
        <>
          <h1>{t("selfCheck")}</h1>
          <Messages error={error} success={success} />

          <div className="status-container">
            {lastRequest && (
              <div className="status-item">
                <span>Last Request: {formatDate(lastRequest.createdAt)}</span>
                <span>
                  {lastResponse &&
                  new Date(lastRequest.createdAt) <
                    new Date(lastResponse.response_date_time) ? (
                    lastResponse.safety_status === "Yes" ? (
                      <span style={{ color: "green" }}>✔️</span>
                    ) : (
                      <span style={{ color: "red" }}>❌</span>
                    )
                  ) : (
                    <span style={{ color: "gray" }}>⚪</span>
                  )}
                </span>
              </div>
            )}
            {lastResponse && (
              <div className="status-item">
                <span>
                  Last Response: {formatDate(lastResponse.response_date_time)} -{" "}
                  {lastResponse.safety_status}
                </span>
              </div>
            )}
          </div>

          <div className="question">
            <h3>{t("areYouSafe")}</h3>
            <div className="response-buttons">
              <button
                onClick={() => setSafetyStatus("Yes")}
                className={safetyStatus === "Yes" ? "selected" : ""}
              >
                👍 {t("yes")}
              </button>
              <button
                onClick={() => setSafetyStatus("No")}
                className={safetyStatus === "No" ? "selected" : ""}
              >
                👎 {t("no")}
              </button>
            </div>
            {safetyStatus === "No" && (
              <textarea
                placeholder={t("provideDetails")}
                value={safetyComment}
                onChange={(e) => setSafetyComment(e.target.value)}
              />
            )}
            <button onClick={handleResponse}>{t("respond")}</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SelfCheck;
