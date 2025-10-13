import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLogin() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { fetchAdmindata } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token-admin");
    const fetchadmindata = async () => {
      if (!token) {
        navigate("/admin");
      } else {
        try {
          await fetchAdmindata(token);
          navigate("/admin/dashboard");
        } catch (error) {
          console.error("Error fetching admin data:", error);
          navigate("/admin");
        }
      }
    };
    fetchadmindata();
  }, [navigate, fetchAdmindata]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json();
      localStorage.setItem("token-admin", data.token);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert(
        "Refer ayush121314 Github Outpass repository to get ID and password"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 px-4">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl flex flex-col md:flex-row overflow-hidden w-full max-w-5xl">
        {/* Left side - Form */}
        <div className="md:w-1/2 w-full p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-indigo-700 mb-2 text-center">
            Admin Portal
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Secure access for administrators — manage outpass system
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin1@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-semibold mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="admin1password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Login
            </button>
          </form>

        <div className="mt-6 text-center">
  <a
    href="https://outpass-zeta.vercel.app/"
    className="inline-flex items-center justify-center w-max bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300"
  >
    Back to Home
  </a>
</div>

        </div>

        {/* Right side - Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center p-8 relative">
          <svg
            width="360"
            height="260"
            viewBox="0 0 360 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            <defs>
              <linearGradient id="grad-main" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="25" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <circle
              cx="180"
              cy="130"
              r="115"
              fill="url(#grad-main)"
              opacity="0.25"
              filter="url(#glow)"
            />
            <rect
              x="90"
              y="80"
              rx="18"
              ry="18"
              width="180"
              height="110"
              fill="url(#grad-main)"
              filter="url(#glow)"
            />
            <rect
              x="90"
              y="80"
              rx="18"
              ry="18"
              width="180"
              height="110"
              fill="white"
              opacity="0.08"
            />
            <rect
              x="90"
              y="80"
              width="180"
              height="25"
              rx="18"
              ry="18"
              fill="rgba(255,255,255,0.1)"
            />

            <path
              d="M180 105 L200 112 L200 130 C200 142 180 155 180 155 C180 155 160 142 160 130 L160 112 Z"
              fill="white"
              opacity="0.95"
            />
            <path d="M180 115 L180 135" stroke="url(#grad-main)" strokeWidth="2" />
            <circle cx="180" cy="110" r="2.5" fill="url(#grad-main)" />
            <path
              d="M172 103 L176 98 L180 103 L184 98 L188 103"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            <rect x="200" y="145" width="14" height="14" rx="3" fill="white" opacity="0.9" />
            <rect x="220" y="145" width="14" height="14" rx="3" fill="white" opacity="0.7" />
            <rect x="240" y="145" width="14" height="14" rx="3" fill="white" opacity="0.5" />

            <text x="105" y="160" fill="white" fontSize="15" fontWeight="600" letterSpacing="0.5px">
              ADMIN ACCESS
            </text>
            <text x="105" y="176" fill="#E5E7EB" fontSize="11">
              Authorized Management Portal
            </text>

            <circle cx="120" cy="90" r="2.5" fill="white" opacity="0.8" />
            <circle cx="260" cy="95" r="1.8" fill="white" opacity="0.6" />
            <circle cx="230" cy="200" r="2" fill="white" opacity="0.7" />
          </svg>

          <div className="absolute bottom-6 text-white text-center">
            <h3 className="text-xl font-semibold">Admin Dashboard Access</h3>
            <p className="text-sm text-gray-200 mt-1">
              Manage students, outpasses, and approvals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
