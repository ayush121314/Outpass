import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="w-screen bg-slate-600 h-screen flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[100px]">
       
        {/* Student Login */}
        <div
          className="bg-gray-800 hover:bg-gray-700 text-white text-center py-16 px-8 rounded-lg cursor-pointer transition duration-300 ease-in-out"
          onClick={() => navigate('/student/dashboard')}
        >
          <h2 className="text-4xl font-semibold">Student</h2>
          <p className="mt-4 text-lg">Login as a student</p>
        </div>
       
        {/* Admin Login */}
        <div
          className="bg-gray-800 hover:bg-gray-700 text-white text-center py-16 px-8 rounded-lg cursor-pointer transition duration-300 ease-in-out"
          onClick={() => navigate('/admin')}
        >
          <h2 className="text-4xl font-semibold">Admin</h2>
          <p className="mt-4 text-lg">Login as an admin</p>
        </div>

        {/* Visitor Login */}
        <div
          className="bg-gray-800 hover:bg-gray-700 text-white text-center py-16 px-8 rounded-lg cursor-pointer transition duration-300 ease-in-out"
          onClick={() => navigate('/visitor')}
        >
          <h2 className="text-4xl font-semibold">Visitor</h2>
          <p className="mt-4 text-lg">Login as a visitor</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
