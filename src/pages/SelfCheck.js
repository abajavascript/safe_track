import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Logo from "../components/Logo";
import LanguageSelector from "../components/LanguageSelector";
import Messages from "../components/Messages";
import { apiService } from "../services/apiService";
import ActionsBar from "../components/ActionsBar";

const SelfCheck = () => {
  const { t } = useTranslation();
  const [safetyStatus, setSafetyStatus] = useState(null); // Yes or No
  const [safetyComment, setSafetyComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    } catch (err) {
      setError(err.response ? err.response.data.message : t("unknown-error"));
    }
  };

  return (
    <div className="self-check">
      <Logo />
      <LanguageSelector />
      <ActionsBar />
      <h1>{t("selfCheck")}</h1>
      <Messages error={error} success={success} />
      <div className="question">
        <p>{t("areYouSafe")}</p>
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
      </div>
      {safetyStatus === "No" && (
        <div className="comment-section">
          <textarea
            placeholder={t("provideDetails")}
            value={safetyComment}
            onChange={(e) => setSafetyComment(e.target.value)}
          />
        </div>
      )}
      <button onClick={handleResponse}>{t("respond")}</button>
    </div>
  );
};

export default SelfCheck;
