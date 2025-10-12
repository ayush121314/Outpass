import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentLogin() {
  const navigate = useNavigate();
  const { login, fetchUserData } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL || "";

  // UI state
  const [section, setSection] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // form state
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // extras
  const [showPassword, setShowPassword] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0); // seconds left for resend
const otpTimerRef = useRef(null);

  useEffect(() => {
    // Auto-redirect if already logged in
    const token = localStorage.getItem("token");
    const fetchUser = async () => {
      if (!token) {
        // stay on page
        return;
      }
      try {
        await fetchUserData(token);
        navigate("/student/dashboard");
      } catch (err) {
        console.warn("Invalid token, clearing.", err);
        localStorage.removeItem("token");
      }
    };
    fetchUser();
    // cleanup OTP timer on unmount
    return () => {
      if (otpTimerRef.current) {
        clearInterval(otpTimerRef.current);
      }
    };
  }, [fetchUserData, navigate]);

  // helper: start OTP cooldown (60s)
  const startOtpCooldown = (seconds = 60) => {
    setOtpCooldown(seconds);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    otpTimerRef.current = window.setInterval(() => {
      setOtpCooldown((s) => {
        if (s <= 1) {
          if (otpTimerRef.current) clearInterval(otpTimerRef.current);
          otpTimerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // small validators (client-side)
  const isEmailValid = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());

  const resetMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  const handleSectionToggle = (name) => {
    setSection(name);
    resetMessages();
    setOtpSent(false);
    setOtp("");
    setPassword("");
    setConfirmPassword("");
  };

  // REGISTER STEP 1: send OTP (also checks existence)
  const handleEmailSubmit = async (ev) => {
    ev.preventDefault();
    resetMessages();

    if (!name.trim() || !rollNo.trim()) {
      setError("Name and Roll number are required.");
      return;
    }
    if (!isEmailValid(email)) {
      setError("Please provide a valid student email.");
      return;
    }
    setLoading(true);
    try {
      // check existence first
      const chk = await fetch(`${apiUrl}/api/student/check-existence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const chkJson = await chk.json();
      if (chkJson.exists) {
        setError("User already exists. Please login.");
        setLoading(false);
        return;
      }

      const otpRes = await fetch(`${apiUrl}/api/student/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpRes.ok) throw new Error("Failed to send OTP");

      setOtpSent(true);
      setSuccessMsg("OTP sent to your email. Enter it below to finish registration.");
      startOtpCooldown(60);
    } catch (err) {
      console.error(err);
      setError("Unable to send OTP right now. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP with cooldown check
  const handleResendOtp = async () => {
    resetMessages();
    if (otpCooldown > 0) {
      setError(`Please wait ${otpCooldown}s before resending OTP.`);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${apiUrl}/api/student/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error("Resend failed");
      setSuccessMsg("OTP resent. Check your email.");
      startOtpCooldown(60);
    } catch (err) {
      console.error(err);
      setError("Error resending OTP. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // REGISTER STEP 2: verify OTP & create account
  const handleOtpSubmit = async (ev) => {
    ev.preventDefault();
    resetMessages();

    if (!otp.trim()) {
      setError("Enter the OTP sent to your email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          Rollno: rollNo.trim(),
          email: email.trim(),
          otp: otp.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Registration failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      login(data.student);
      navigate("/student/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Check OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLoginSubmit = async (ev) => {
    ev.preventDefault();
    resetMessages();
    if (!isEmailValid(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (!password) {
      setError("Please enter password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Invalid email or password");
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      login(data.student);
      navigate("/student/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-6">
      <div className="relative z-10 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden bg-white/60 backdrop-blur-lg border border-white/30 flex flex-col md:flex-row">
        {/* Left panel - form */}
        <main className="md:w-1/2 p-8 md:p-12">
          <header className="mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-600 to-purple-700">
              College Outpass
            </h1>
            <p className="mt-2 text-sm text-gray-700/90">
              Secure access for students — register with college email or login to continue.
            </p>
          </header>

          {/* toggles */}
          <div className="flex gap-2 bg-white/50 p-1 rounded-xl w-fit mb-6">
            <button
              aria-pressed={section === "login"}
              onClick={() => handleSectionToggle("login")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                section === "login"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-white/60"
              }`}
            >
              Login
            </button>
            <button
              aria-pressed={section === "register"}
              onClick={() => handleSectionToggle("register")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                section === "register"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow"
                  : "text-gray-600 hover:bg-white/60"
              }`}
            >
              Register
            </button>
          </div>

          {/* messages */}
          <div className="min-h-[40px] mb-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 py-2 px-3 rounded">
                {error}
              </div>
            )}
            {!error && successMsg && (
              <div className="text-sm text-green-700 bg-green-50 py-2 px-3 rounded">
                {successMsg}
              </div>
            )}
          </div>

          {/* forms */}
          {section === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Student Email</span>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="you@college.edu"
                    required
                    aria-label="Student email"
                  />
                  <svg
                    className="absolute right-3 top-3 w-4 h-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 12H8m8-4H8m6 8H8" />
                  </svg>
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Password</span>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="••••••••"
                    required
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3-11-7 1.04-2.33 2.79-4.24 4.9-5.46" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-lg shadow hover:scale-[1.01] transition disabled:opacity-60"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" opacity="0.25" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : null}
                  Sign in
                </button>

                
              </div>
            </form>
          ) : (
            // Registration forms
            !otpSent ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Full name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Jane Student"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Roll number</span>
                  <input
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="e.g., 20BCS1234"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">College email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="you@college.edu"
                    required
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow hover:scale-[1.01] transition disabled:opacity-60"
                  >
                    {loading ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" opacity="0.25" />
                        <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : null}
                    Send OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName("");
                      setRollNo("");
                      setEmail("");
                      resetMessages();
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">OTP</span>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Enter code"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Create a password (min 6 chars)"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Confirm Password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Confirm password"
                    required
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow hover:scale-[1.01] transition disabled:opacity-60"
                  >
                    {loading ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" opacity="0.25" />
                        <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : null}
                    Verify & Register
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpCooldown > 0 || loading}
                    className={`px-4 py-2 rounded-lg ${
                      otpCooldown > 0 ? "bg-gray-200 text-gray-500" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            )
          )}

          <footer className="mt-6 text-center text-sm text-gray-600">
            <Link to="/" className="text-indigo-600 hover:underline">
              Back to Home
            </Link>
          </footer>
        </main>

        {/* Right panel - Illustration */}
       {/* Right panel - Illustration */}
<aside className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-gradient-to-tr from-indigo-50 to-purple-50 relative">
  <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
    <defs>
      <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#667eea", stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: "#764ba2", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#f093fb", stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "rgba(255,255,255,0)" }} />
        <stop offset="50%" style={{ stopColor: "rgba(255,255,255,0.6)" }} />
        <stop offset="100%" style={{ stopColor: "rgba(255,255,255,0)" }} />
        <animate attributeName="x1" values="-100%;200%" dur="3s" repeatCount="indefinite" />
        <animate attributeName="x2" values="0%;300%" dur="3s" repeatCount="indefinite" />
      </linearGradient>
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
        <feBlend in="SourceGraphic" in2="glow" mode="normal" />
      </filter>
      <radialGradient id="orbGlow">
        <stop offset="0%" style={{ stopColor: "#a78bfa", stopOpacity: 0.8 }} />
        <stop offset="100%" style={{ stopColor: "#a78bfa", stopOpacity: 0 }} />
      </radialGradient>
    </defs>

    <style>{`
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
      @keyframes floatSlow { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-15px)} }
      @keyframes rotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      @keyframes orbitLeft { 0%{transform:rotate(0deg) translateX(100px) rotate(0)} 100%{transform:rotate(360deg) translateX(100px) rotate(-360deg)} }
      @keyframes orbitRight { 0%{transform:rotate(0deg) translateX(120px) rotate(0)} 100%{transform:rotate(-360deg) translateX(120px) rotate(360deg)} }
      .card { animation: floatSlow 6s ease-in-out infinite; }
      .float { animation: float 4s ease-in-out infinite; }
      .float-slow { animation: floatSlow 8s ease-in-out infinite; }
      .pulse { animation: pulse 3s ease-in-out infinite; }
      .orbit-left { animation: orbitLeft 15s linear infinite; }
      .orbit-right { animation: orbitRight 20s linear infinite; }
    `}</style>

    <circle cx="300" cy="250" r="200" fill="url(#orbGlow)" className="pulse" opacity="0.3" />
    <g className="orbit-left" transformOrigin="300 250">
      <circle cx="0" cy="0" r="8" fill="#c4b5fd" opacity="0.6" filter="url(#softGlow)" />
    </g>
    <g className="orbit-right" transformOrigin="300 250">
      <circle cx="0" cy="0" r="6" fill="#fbbf24" opacity="0.5" filter="url(#softGlow)" />
    </g>

    <g className="card">
      <ellipse cx="300" cy="340" rx="140" ry="12" fill="#000" opacity="0.1" />
      <rect x="160" y="180" width="280" height="160" rx="20" fill="url(#cardGradient)" filter="url(#softGlow)" />
      <rect x="160" y="180" width="280" height="80" rx="20" fill="rgba(255,255,255,0.1)" />
      <rect x="160" y="180" width="280" height="160" rx="20" fill="url(#shimmer)" opacity="0.3" />
      <text x="300" y="220" textAnchor="middle" fill="white" fontSize="26" fontWeight="700" fontFamily="system-ui">Student OUTPASS</text>
      <text x="300" y="245" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12" fontWeight="500" letterSpacing="2">AUTHORIZED ACCESS</text>

      <g opacity="0.8">
        <rect x="190" y="265" width="80" height="8" rx="4" fill="rgba(255,255,255,0.4)" />
        <rect x="190" y="280" width="120" height="8" rx="4" fill="rgba(255,255,255,0.4)" />
        <rect x="190" y="295" width="60" height="8" rx="4" fill="rgba(255,255,255,0.4)" />
      </g>

      <g transform="translate(340, 260)">
        <rect width="50" height="50" rx="8" fill="white" opacity="0.95" />
        <rect x="6" y="6" width="12" height="12" rx="2" fill="#667eea" />
        <rect x="22" y="6" width="6" height="12" rx="1" fill="#667eea" />
        <rect x="32" y="6" width="12" height="12" rx="2" fill="#667eea" />
        <rect x="6" y="22" width="6" height="12" rx="1" fill="#667eea" />
        <rect x="16" y="22" width="18" height="6" rx="1" fill="#667eea" />
        <rect x="6" y="32" width="12" height="12" rx="2" fill="#667eea" />
        <rect x="22" y="32" width="10" height="12" rx="1" fill="#667eea" />
        <rect x="36" y="32" width="8" height="12" rx="1" fill="#667eea" />
      </g>

      <circle cx="425" cy="195" r="4" fill="white" opacity="0.6" />
    </g>
  </svg>
</aside>

      </div>

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes bob {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatIn { 0% { opacity:0; transform: translateY(-8px) } 100% { opacity:1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}

export default StudentLogin;
