import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/healthright-logo.png";

const Logo = () => (
  <div className="logo">
    <Link to="/">
      <img src={logo} alt="HealthRight Logo" />
    </Link>
  </div>
);

export default Logo;
