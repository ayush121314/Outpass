import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-9xl font-extrabold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-md md:text-lg text-gray-600 mb-6 text-center px-4">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
          Back to Home
        </button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
