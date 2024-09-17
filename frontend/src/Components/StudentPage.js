import React, { useEffect } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';

function StudentPage() {
  const { fetchUserData ,user} = useAuth();
  const navigate = useNavigate();
 
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUser = async () => {
      if (!token) {
        // If no token, redirect to login
        navigate('/student');
      } else {
        try {
          // If token exists, fetch the user data
          await fetchUserData(token);
        } catch (error) {
          // If there's an error fetching user data, redirect to login
          console.error('Error fetching user data:', error);
          navigate('/student');
        }
      }
    };
    fetchUser();
  }, []);

  
  return (
    <div className=" ">
      <StudentDashboard/>
      <br></br>
   
    </div>
  );
}

export default StudentPage;
