import React, { useEffect } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';

function AdminPage()  {
  const { fetchAdmindata} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token-admin');
   
     const fetchadmindata = async () => {
      if (!token) {
        // If no token, redirect to login
        navigate('/admin');
      } else {
        try {
          // If token exists, fetch the user data
          await fetchAdmindata(token);
          navigate('/admin/dashboard');
        } catch (error) {
          // If there's an error fetching user data, redirect to login
          console.error('Error fetching admin data:', error);
          navigate('/admin');
        }
      }
    };
   
    fetchadmindata();
  }, []);
  
  return (
    <div className="bg-slate-600  min-w-screen min-h-screen flex items-center justify-center ">
      <AdminDashboard/>
      <br></br>
   
    </div>
  );
  }
export default AdminPage;
