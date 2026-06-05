import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const Login = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.token, response.data);
      
      const roles = response.data.roles;
      if (roles.some(r => r.authority === 'ROLE_ADMIN')) {
        navigate('/');
      } else {
        navigate('/intern-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-card w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-6">Login</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">Username or Email</label>
            <input 
              type="text" 
              name="usernameOrEmail" 
              value={formData.usernameOrEmail} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="form-input" 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full shadow-lg">Sign In</button>
        </form>
        <div className="mt-8 text-center border-t border-gray-100 pt-6 space-y-3">
          <p className="text-sm text-gray-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-indigo-700 font-bold hover:underline transition-colors">
              Register here
            </Link>
          </p>
          <Link to="/forgot-password" className="text-sm text-primary hover:text-indigo-700 font-bold hover:underline transition-colors block">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
