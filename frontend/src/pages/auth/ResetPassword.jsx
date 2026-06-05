import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ token: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', formData);
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-card w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-6">Reset Password</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-center">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">Reset Token</label>
            <input 
              type="text" 
              name="token" 
              value={formData.token} 
              onChange={handleChange} 
              className="form-input font-mono text-sm" 
              required 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
            <input 
              type="password" 
              name="newPassword" 
              value={formData.newPassword} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full shadow-lg">Reset Password</button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-gray-500 hover:text-gray-800 text-sm">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
