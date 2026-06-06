import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const Login = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [loginType, setLoginType] = useState('ADMIN'); // 'ADMIN', 'EMPLOYEE', 'INTERN'
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
      } else if (roles.some(r => r.authority === 'ROLE_EMPLOYEE')) {
        navigate('/employee-dashboard');
      } else {
        navigate('/intern-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-card w-full max-w-md animate-fade-in relative overflow-hidden">
        
        {/* Dynamic header styling based on loginType */}
        <div className={`absolute top-0 left-0 w-full h-2 ${
          loginType === 'ADMIN' ? 'bg-gradient-to-r from-primary to-cyan-400' : 
          loginType === 'EMPLOYEE' ? 'bg-gradient-to-r from-teal-500 to-emerald-400' :
          'bg-gradient-to-r from-purple-500 to-pink-500'
        }`}></div>

        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-2 mt-2">
          {loginType === 'ADMIN' ? 'Admin Access' : loginType === 'EMPLOYEE' ? 'Employee Portal' : 'Intern Login'}
        </h2>
        <p className="text-center text-sm font-medium text-gray-500 mb-6">Sign in to your account</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center font-semibold">{error}</div>}
        
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'ADMIN' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setLoginType('ADMIN')}
          >
            Admin
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'EMPLOYEE' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setLoginType('EMPLOYEE')}
          >
            Employee
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'INTERN' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setLoginType('INTERN')}
          >
            Intern
          </button>
        </div>

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
          <button 
            type="submit" 
            className={`btn w-full shadow-lg text-white ${
              loginType === 'ADMIN' ? 'bg-primary hover:bg-indigo-700' : 
              loginType === 'EMPLOYEE' ? 'bg-teal-600 hover:bg-teal-700' :
              'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            Sign In
          </button>
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
