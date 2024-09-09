import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminuser, setadminuser] = useState(null);
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

  // Fetch user data if token exists in localStorage
  const login = (data) => {
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const adminlogin = (data) => {
    setadminuser(data);
  };

  const adminlogout = () => {
    localStorage.removeItem('token-admin');
    setadminuser(null);
    navigate('/');
  };

  const isAuthenticated = !!user;
  const isadminauthenticated=!!adminuser;
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, fetchUserData,isadminauthenticated,fetchAdmindata,adminuser,adminlogin,adminlogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
