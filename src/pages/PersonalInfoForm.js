import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { useTranslation } from "react-i18next";
import Logo from "../components/Logo"; // Add this
import LanguageSelector from "../components/LanguageSelector"; // Add this
import Messages from "../components/Messages"; // Add this
import ActionsBar from "../components/ActionsBar";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

const PersonalInfoForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    region: "",
    manager_uid: "",
    manager_name: "",
  });
  const [regions, setRegions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate(); // Initialize navigate
  const [email, setEmail] = useState(auth.currentUser.email);

  // Fetch regions and managers from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const regionsResponse = await apiService.getRegions();
        const managersResponse = await apiService.getManagers();
        setRegions(regionsResponse.data);
        setManagers(managersResponse.data);
      } catch (err) {
        setError(t("failedToLoadData"));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let userResponse = await apiService.existUserById(auth.currentUser.uid);
        if (userResponse.data.exist) {
          userResponse = await apiService.getUserById(auth.currentUser.uid);
          setUserExists(true);
          setFormData({
            ...userResponse.data.data,
            email: email,
            uid: auth.currentUser.uid,
          });
          // setFormData({
          //   uid: auth.currentUser.uid,
          //   name: userResponse.data.data.name || "",
          //   surname: userResponse.data.data.surname || "",
          //   phone: userResponse.data.data.phone || "",
          //   region: userResponse.data.data.region || "",
          //   manager_uid: userResponse.data.data.manager_uid || "",
          //   manager_name: userResponse.data.data.manager_name || "",
          // });
          setIsApproved(userResponse.data.data.status === "Approved");
          if (userResponse.data.data.status !== "Approved")
            setError(t("ERR_EMAIL_IS_NOT_APPROVED"));
        } else {
          setUserExists(false);
          setFormData({
            uid: auth.currentUser.uid,
            email: email,
            name: "",
            surname: "",
            phone: "",
            region: "",
            manager_uid: "",
            manager_name: "",
          });
        }
      } catch (error) {
        // If user does not exist, proceed with empty formData
        setFormData({
          //uid: auth.currentUser.uid,
          //email: email,
          name: "",
          surname: "",
          phone: "",
          region: "",
          manager_uid: "",
          manager_name: "",
        });
        console.log("Clear userInfo 2");
        setUserExists(false);
        console.log(error);
        setError(t("failedToLoadData"));
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    console.log(e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      console.log(formData);

      //   setFormData({ ...formData, user_uid:  });
      console.log("Show userInfo 1");

      console.log(userExists);

      const managerSelect = document.querySelector(
        "select[name='manager_uid']"
      );
      const selectedManagerName =
        managerSelect.options[managerSelect.selectedIndex].text;

      // setFormData({
      //   ...formData,
      //   email: email,
      //   manager_name: selectedManagerName,
      // });
      if (userExists) {
        console.log("updateUser...api");
        console.log(formData);
        await apiService.updateUser(formData.uid, {
          ...formData,
          manager_name: selectedManagerName,
        });
        setSuccess(t("personalInfoSaved"));
      } else {
        console.log("addUser...api");
        const response = await apiService.addUser({
          ...formData,
          manager_name: selectedManagerName,
        });
        console.log(response);
        // Redirect to login after 3 seconds
        setSuccess(t("Waiting Operator for approve your access."));

        setTimeout(() => {
          navigate(`/?email=${encodeURIComponent(auth.currentUser.email)}`);
        }, 3000);
      }
    } catch (err) {
      setError(err.response ? err.response.data.message : t("unknown-error"));
    }
  };

  return (
    <div className="personal-info-form">
      <Logo />
      <LanguageSelector />
      <ActionsBar />
      <h1>{t("personalInformation")}</h1>
      {success && <p style={{ color: "green" }}>{success}</p>}
      <p>
        {t("Email")} {email}
        {isApproved ? (
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{ color: "green", paddingLeft: "10px" }}
            title="Approved"
          />
        ) : (
          <FontAwesomeIcon
            icon={faExclamationCircle}
            style={{ color: "orange", paddingLeft: "10px" }}
            title="Need Approve"
          />
        )}
      </p>
      <Messages error={error} />{" "}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder={t("name")}
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="surname"
          placeholder={t("surname")}
          value={formData.surname}
          onChange={handleInputChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder={t("phone")}
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        <select
          name="region"
          value={formData.region}
          onChange={handleInputChange}
          required={regions.length > 0}
        >
          <option value="" disabled>
            {t("selectRegion")}
          </option>
          {regions.map((region) => (
            <option key={region.id} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
        <input type="hidden" name="manager_name" value="" />
        <select
          name="manager_uid"
          value={formData.manager_uid}
          onChange={handleInputChange}
          required={managers.length > 0}
        >
          <option value="" disabled>
            {t("selectManager")}
          </option>
          {managers.map((manager) => (
            <option key={manager.uid} value={manager.uid}>
              {manager.name + " " + manager.surname}
            </option>
          ))}
        </select>
        <button type="submit">{t("save")}</button>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
