import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles.css";
import { AuthProvider } from "./AuthContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
// import Dashboard from "./pages/Dashboard";
import Regions from "./pages/Regions";
import UsersList from "./pages/UsersList";
import PersonalInfoForm from "./pages/PersonalInfoForm";
import SelfCheck from "./pages/SelfCheck";

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          <Route path="/regions" element={<Regions />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/personal-info" element={<PersonalInfoForm />} />
          <Route path="/self-check" element={<SelfCheck />} />;
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
