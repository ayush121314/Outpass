import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./Components/LoginPage";
import StudentPage from "./Components/StudentPage";
import StudentLogin from "./Components/StudentLogin";
import AdminPage from "./Components/AdminPage";
import AdminLogin from "./Components/AdminLogin";


import AdmAdminDashboardnLogin from "./Components/AdminDashboard";

function App() {
  return (
    <div className="bg-black">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/student" element={<StudentLogin />} />
            <Route path="/student/dashboard" element={<StudentPage />} />
            <Route path="/admin" element={<AdminLogin/>} />
            <Route path="/admin/dashboard" element={<AdminPage/>}/>
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
