import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./Components/LoginPage";
import StudentPage from "./Components/StudentPage";
import StudentLogin from "./Components/StudentLogin";
import AdminPage from "./Components/AdminPage";
import AdminLogin from "./Components/AdminLogin";
import  VisitorLogin  from "./Components/VisitorLogin";
import VisitorDashboard from "./Components/VisitorDashboard";
import NotFoundPage from "./Components/NotFoundPage";

function App() {
  return (
    <div className="">
      <Router>
  <AuthProvider>
    <Routes>
      <Route path="/" element={<LoginPage />} /> 
      <Route path="/visitor" element={<VisitorLogin/>} />
      <Route path="/student" element={<StudentLogin/>} />
      <Route path="/student/dashboard" element={<StudentPage />} />
      <Route path="/visitor/dashboard" element={<VisitorDashboard />} />
      <Route path="/admin" element={<AdminLogin/>} />
      <Route path="/admin/dashboard" element={<AdminPage/>} />
      {/* Catch-all route to display 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </AuthProvider>
</Router>

    </div>
  );
}

export default App;
