import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminuser, setadminuser] = useState(null);
  const [visitoruser, setvisitoruser] = useState(null);
  const navigate = useNavigate();

  // Function to fetch user data
  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${apiUrl}/api/student/get-student-data`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setUser(userData);
     
    } catch (err) {
      console.error('Error fetching user data:', err);
      navigate('/student');
    }
  };
  const fetchAdmindata = async (token) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/get-admin-data`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setadminuser(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      navigate('/admin');
    }
  };
  const fetcVisitordata = async (token) => {
    try {
      const response = await fetch(`${apiUrl}/api/visitor/get-visitor-data`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      console.log("hii",userData)
      setvisitoruser(userData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      navigate('/visitor');
    }
  };


  // Fetch user data if token exists in localStorage
  const login = (data) => {
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/student');
  };

  const adminlogin = (data) => {
    setadminuser(data);
  };
  const loginvisitor = (data) => {
    setvisitoruser(data);
  };
  const adminlogout = () => {
    localStorage.removeItem('token-admin');
    setadminuser(null);
    navigate('/admin');
  };
  const visitorlogout = () => {
    localStorage.removeItem('token-visitor');
    setadminuser(null);
    navigate('/visitor');
  };

  return (
    <AuthContext.Provider value={{ user,visitoruser,loginvisitor,fetcVisitordata,login, logout, fetchUserData,fetchAdmindata,adminuser,adminlogin,adminlogout,visitorlogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
