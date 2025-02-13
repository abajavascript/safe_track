import React from "react";
import { useTranslation } from "react-i18next";
import { auth } from "../firebaseConfig";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="lang">
      <div>{auth.currentUser?.email ? auth.currentUser?.email : "\u00A0"}</div>
      <select
        onChange={(e) => changeLanguage(e.target.value)}
        defaultValue={i18n.language}
      >
        <option value="uk">Українська</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
