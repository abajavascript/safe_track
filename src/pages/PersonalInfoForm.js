import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

import Logo from "../components/Logo"; // Add this
import LanguageSelector from "../components/LanguageSelector"; // Add this
import Messages from "../components/Messages"; // Add this
import ActionsBar from "../components/ActionsBar";

import { apiService } from "../services/apiService";
import { useAuth } from "../AuthContext";

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
  const { user } = useAuth();
  // const [email, setEmail] = useState(auth.currentUser?.email);

  // Fetch regions and managers from the database
  useEffect(() => {
    const fetchData = async () => {
      console.log("fetchData: Load Regions and Managers");
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
      console.log("fetchUserData: entered");
      if (!user) {
        console.log("fetchUserData: user is null");
        return;
      }
      try {
        console.log("fetchUserData: Load User Data", user);
        let userResponse = await apiService.existUserById(user.uid);
        if (userResponse.data.exist) {
          userResponse = await apiService.getUserById(user.uid);
          setUserExists(true);
          setFormData({
            ...userResponse.data.data,
            email: user.email,
            uid: user.uid,
          });
          setIsApproved(userResponse.data.data.status === "Approved");
          if (userResponse.data.data.status !== "Approved")
            setError(t("ERR_EMAIL_IS_NOT_APPROVED"));
        } else {
          setUserExists(false);
          setFormData({
            uid: user.uid,
            email: user.email,
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
        setUserExists(false);
        console.log(error);
        setError(t("failedToLoadData"));
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    console.log(e.target.name, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      console.log("handleSubmit with formData: ", formData);

      console.log("userExists = " + userExists);

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
          email: user.email,
          uid: user.uid,
          manager_name: selectedManagerName,
        });
        setSuccess(t("personalInfoSaved"));
      } else {
        console.log("addUser...api");
        const response = await apiService.addUser({
          ...formData,
          email: user.email,
          uid: user.uid,
          manager_name: selectedManagerName,
        });
        console.log(response);
        // Redirect to login after 3 seconds
        setSuccess(t("Waiting Operator for approve your access."));

        setTimeout(() => {
          navigate(`/?email=${encodeURIComponent(user?.email)}`);
        }, 3000);
      }
    } catch (err) {
      setError(err.response ? err.response.data.message : t("unknown-error"));
    }
  };

  return (
    <div className="container">
      <Logo />
      <LanguageSelector />
      {isApproved && <ActionsBar />}
      <h1>{t("personalInformation")}</h1>
      <p>
        {t("Email")} {user?.email}
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
      <Messages error={error} success={success} />
      <div className="personal-info-form">
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
            pattern="[0-9+\-\s()]{7,15}"
            title={t("phone-format")}
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
    </div>
  );
};

export default PersonalInfoForm;
