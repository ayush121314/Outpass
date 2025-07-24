import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Studentadmin } from './Studentadmin';
import { VisitorAdmin } from './VisitorAdmin';

export const AdminDashboard = () => {
  const [mode, setMode] = useState('student'); // Initialize mode as 'student'

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-lg space-y-4">
      <div className="flex space-x-4">
        {/* Button to select "Student" */}
        <button
          onClick={() => setMode('student')}
          className={`py-2 px-4 font-bold rounded transition-colors duration-300 ${
            mode === 'student' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
          } hover:bg-blue-600`}
        >
          Student
        </button>

        {/* Button to select "Visitor" */}
        <button
          onClick={() => setMode('visitor')}
          className={`py-2 px-4 font-bold rounded transition-colors duration-300 ${
            mode === 'visitor' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
          } hover:bg-blue-600`}
        >
          Visitor
        </button>
      </div>

      {/* Conditionally render StudentAdmin if mode is 'student' */}
      {mode === 'student' && (
        <div className="mt-4">
          <Studentadmin />
        </div>
      )}

      {/* Conditionally render Visitor content if mode is 'visitor' */}
      {mode === 'visitor' && (
        <div className="mt-4">
          <VisitorAdmin />
        </div>
      )}
    </div>
  );
};
