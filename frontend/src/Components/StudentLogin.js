import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function StudentLogin() {
  const [section, setSection] = useState('login'); 
  const [name, setName] = useState('');
  const [Rollno, setRollno] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login, fetchUserData } = useAuth();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUser = async () => {
      if (!token) {
        navigate('/student');
      } else {
        try {
          await fetchUserData(token);
          navigate('/student/dashboard');
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/student');
        }
      }
    };
    fetchUser();
  }, []);

  const handleSectionToggle = (sectionName) => {
    setSection(sectionName);
    setError('');
    setOtpSent(false);
  };

  const handleNameChange = (e) => setName(e.target.value);
  const handleRollnoChange = (e) => setRollno(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCheckResponse = await fetch(`${apiUrl}/api/student/check-existence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const userCheckData = await userCheckResponse.json();
      if (userCheckData.exists) {
        setError('User already exists. Please login.');
        return;
      }
  
      const otpResponse = await fetch(`${apiUrl}/api/student/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      if (!otpResponse.ok) throw new Error('Error sending OTP.');
  
      setOtpSent(true);
      setError('');
    } catch (err) {
      setError('Error sending OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      const otpResponse = await fetch(`${apiUrl}/api/student/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!otpResponse.ok) throw new Error('Error resending OTP.');

      setError('OTP resent successfully.');
    } catch (err) {
      setError('Error resending OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, otp, password, Rollno }),
      });

      if (!response.ok) throw new Error('Invalid OTP or other registration error.');

      const data = await response.json();
      localStorage.setItem('token', data.token);
      login(data.student);
      navigate('/student/dashboard');
    } catch (err) {
      setError('Invalid OTP or other registration error. Please try again.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Invalid email or password.');
      
      const data = await response.json();
      localStorage.setItem('token', data.token);
      login(data.student);
      navigate('/student/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 w-screen h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="mb-4 flex">
          <button
            onClick={() => handleSectionToggle('login')}
            className={`w-1/2 p-2 ${section === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Login
          </button>
          <button
            onClick={() => handleSectionToggle('register')}
            className={`w-1/2 p-2 ${section === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Register
          </button>
        </div>

        {section === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <h1 className="text-2xl mb-4 text-center">Student Login</h1>
            <input
              type="email"
              placeholder="Enter your student email"
              value={email}
              onChange={handleEmailChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              required
            />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" className="bg-blue-500 text-white w-full p-2 rounded">
              Login
            </button>
          </form>
        ) : (
          !otpSent ? (
            <form onSubmit={handleEmailSubmit}>
              <h1 className="text-2xl mb-4 text-center">Register</h1>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={handleNameChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                placeholder="Enter your Roll no"
                value={Rollno}
                onChange={handleRollnoChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="email"
                placeholder="Enter your student email"
                value={email}
                onChange={handleEmailChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <button type="submit" className="bg-blue-500 text-white w-full p-2 rounded">
                Send OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <h1 className="text-2xl mb-4 text-center">Enter OTP</h1>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="w-full p-2 mb-4 border border-gray-300 rounded"
                required
              />
              {error && <p className="text-red-500">{error}</p>}
              <button type="submit" className="bg-blue-500 text-white w-full p-2 rounded">
                Verify OTP and Register
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                className="bg-gray-500 hover:bg-blue-400 text-white w-full p-2 rounded mt-4"
              >
                Resend OTP
              </button>
            </form>
          )
        )}
        <div className="text-center mt-4">
          <Link to="/" className="bg-indigo-500 hover:scale-110 hover:bg-indigo-700 rounded-lg text-white p-2  inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
