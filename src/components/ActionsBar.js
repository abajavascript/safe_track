import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faMapMarkedAlt,
  faUserShield,
  faClipboardCheck,
  faKey,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const ActionsBar = () => {
  const navigate = useNavigate();

  // Navigation Handlers
  const handleSelfCheck = () => {
    navigate("/self-check");
  };

  const handlePersonalInfo = () => {
    navigate("/personal-info");
  };

  const handleUserDashboard = () => {
    navigate("/users");
    // navigate("/dashboard");
  };

  const handleRegions = () => {
    navigate("/regions");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // localStorage.removeItem("userData"); // Clear user data from localStorage
      localStorage.removeItem("token"); // Clear user data from localStorage

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        // Get the current subscription
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          // Unsubscribe from push notifications
          await subscription.unsubscribe();
          console.log("User unsubscribed from notifications");
        }
      }

      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="actions-bar">
      {/* Left Aligned Buttons */}
      <div className="left-actions">
        <button
          className="icon-button"
          onClick={handleSelfCheck}
          title="Self Check"
        >
          <FontAwesomeIcon icon={faClipboardCheck} />
        </button>
        <button
          className="icon-button"
          onClick={handlePersonalInfo}
          title="Personal Info"
        >
          <FontAwesomeIcon icon={faUserCircle} />
        </button>
        <button
          className="icon-button"
          onClick={handleUserDashboard}
          title="User Dashboard"
        >
          <FontAwesomeIcon icon={faUserShield} />
        </button>
        <button className="icon-button" onClick={handleRegions} title="Regions">
          <FontAwesomeIcon icon={faMapMarkedAlt} />
        </button>
      </div>

      {/* Right Aligned Buttons */}
      <div className="right-actions">
        <button
          className="icon-button"
          onClick={handleChangePassword}
          title="Change Password"
        >
          <FontAwesomeIcon icon={faKey} />
        </button>
        <button className="icon-button" onClick={handleLogout} title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </div>
  );
};

export default ActionsBar;
