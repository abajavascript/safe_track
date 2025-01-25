import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faUser,
  faTachometerAlt,
  faMapMarkedAlt,
  faKey,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ActionsBar = () => {
  const navigate = useNavigate();

  return (
    <div className="actions-bar">
      <div className="actions-left">
        <button onClick={() => navigate("/self-check")} title="Self Check">
          <FontAwesomeIcon icon={faCheckCircle} />
        </button>
        <button
          onClick={() => navigate("/personal-info")}
          title="Personal Info"
        >
          <FontAwesomeIcon icon={faUser} />
        </button>
        <button onClick={() => navigate("/dashboard")} title="User Dashboard">
          <FontAwesomeIcon icon={faTachometerAlt} />
        </button>
        <button onClick={() => navigate("/regions")} title="Regions">
          <FontAwesomeIcon icon={faMapMarkedAlt} />
        </button>
      </div>
      <div className="actions-right">
        <button
          onClick={() => navigate("/change-password")}
          title="Change Password"
        >
          <FontAwesomeIcon icon={faKey} />
        </button>
        <button onClick={() => navigate("/logout")} title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </div>
  );
};

export default ActionsBar;
