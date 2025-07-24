// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// function LoginPage() {
//   const navigate = useNavigate();

//   return (
//     <div className="w-screen bg-slate-600 min-h-screen h-full py-5 flex items-center justify-center">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-[100px]">
       
//         {/* Student Login */}
//         <div
//           className="bg-gray-800 hover:bg-gray-700 text-white text-center py-16 px-8 rounded-lg cursor-pointer transition duration-300 ease-in-out"
//           onClick={() => navigate('/student/dashboard')}
//         >
//           <h2 className="text-4xl font-semibold">Student</h2>
//           <p className="mt-4 text-lg">Login as a student</p>
//         </div>
       
//         {/* Admin Login */}
//         <div
//           className="bg-gray-800 hover:bg-gray-700 text-white text-center py-16 px-8 rounded-lg cursor-pointer transition duration-300 ease-in-out"
//           onClick={() => navigate('/admin')}
//         >
//           <h2 className="text-4xl font-semibold">Admin</h2>
//           <p className="mt-4 text-lg">Login as an admin</p>
//         </div>

//         {/* Visitor Login */}
//         <div
//           className="bg-gray-800 hover:bg-gray-700 text-white text-center py-16 px-8 rounded-lg cursor-pointer transition duration-300 ease-in-out"
//           onClick={() => navigate('/visitor')}
//         >
//           <h2 className="text-4xl font-semibold">Visitor</h2>
//           <p className="mt-4 text-lg">Login as a visitor</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Sign in to continue
        </h2>

        {/* Student Login */}
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center w-full gap-4 px-4 py-3 mb-4 border border-gray-200 rounded-xl hover:bg-blue-50 transition"
        >
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 14l6.16-3.422A12.083 12.083 0 0118 10.25C18 13.59 15.31 16.5 12 16.5S6 13.59 6 10.25c0-.383.034-.76.097-1.128L12 14z"
            />
          </svg>
          <span className="text-gray-700 font-medium">Login as Student</span>
        </button>

        {/* Admin Login */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center w-full gap-4 px-4 py-3 mb-4 border border-gray-200 rounded-xl hover:bg-purple-50 transition"
        >
          <svg
            className="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-gray-700 font-medium">Login as Admin</span>
        </button>

        {/* Visitor Login */}
        <button
          onClick={() => navigate('/visitor')}
          className="flex items-center w-full gap-4 px-4 py-3 border border-gray-200 rounded-xl hover:bg-green-50 transition"
        >
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.121 17.804A12.042 12.042 0 0112 15c2.136 0 4.126.56 5.879 1.546M12 12a4 4 0 100-8 4 4 0 000 8z"
            />
          </svg>
          <span className="text-gray-700 font-medium">Login as Visitor</span>
        </button>

        {/* Bottom CTA */}
        
      </div>
    </div>
  );
}

export default LoginPage;

