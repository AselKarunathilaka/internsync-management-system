import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(''); // For display purposes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setToken('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setToken(response.data.token); // Displaying token for easy testing
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating reset token');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-card w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-6">Forgot Password</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">{error}</div>}
        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-center">
            {message}
            {token && (
              <div className="mt-2 text-xs break-all bg-white p-2 border border-green-200 rounded">
                <strong>Test Token:</strong> {token}
              </div>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="form-input" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full shadow-lg">Send Reset Link</button>
        </form>
        <div className="mt-4 text-center flex flex-col gap-2 text-sm">
          <Link to="/reset-password" className="text-indigo-600 hover:underline">Have a token? Reset Password</Link>
          <Link to="/login" className="text-gray-500 hover:text-gray-800">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
