import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../auth/msalConfig';
import api from '../../api';

const MICROSOFT_LOGIN_PENDING_KEY = 'internsync_ms_login_pending';

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const [loginType, setLoginType] = useState('ADMIN'); // ADMIN, EMPLOYEE, INTERN
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [employeeLoginMethod, setEmployeeLoginMethod] = useState('ID'); // ID or EMAIL

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { instance } = useMsal();


  const handleChange = (e) => {
    let value = e.target.value;
    
    // If we're on the Employee ID tab, only allow numbers
    if (e.target.name === 'usernameOrEmail' && loginType === 'EMPLOYEE' && employeeLoginMethod === 'ID') {
      value = value.replace(/\D/g, ''); // Strip non-numeric characters
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setFormData({ usernameOrEmail: '', password: '' });
    setError('');
  };

  const hasRole = (roles = [], roleName) => {
    return roles.some((r) => r === roleName || r?.authority === roleName);
  };

  const navigateAfterLogin = (data) => {
    const roles = data.roles || [];

    if (hasRole(roles, 'ROLE_ADMIN') || data.role === 'ADMIN') {
      navigate('/');
      return;
    }

    if (hasRole(roles, 'ROLE_EMPLOYEE') || data.role === 'EMPLOYEE') {
      const designation = data.designation;
      const isProxy = data.isProxy === true;

      if (isProxy) {
        navigate('/proxy-dashboard');
      } else if (designation === 'General Manager') {
        navigate('/gm-dashboard');
      } else if (designation === 'Deputy General Manager') {
        navigate('/dgm-dashboard');
      } else {
        navigate('/employee-dashboard');
      }

      return;
    }

    navigate('/intern-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Explicit manual validation for Employee ID
    if (loginType === 'EMPLOYEE' && employeeLoginMethod === 'ID') {
      const isSixDigits = /^00\d{4}$/.test(formData.usernameOrEmail);
      if (!isSixDigits) {
        setError('Employee ID must be exactly 6 digits starting with 00');
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        loginMethod: loginType === 'EMPLOYEE' ? employeeLoginMethod : 'USERNAME',
      };
      const response = await api.post('/auth/login', payload);

      login(response.data.token, response.data);
      navigateAfterLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');

    try {
      console.log('Starting Microsoft redirect login...');

      sessionStorage.setItem(MICROSOFT_LOGIN_PENDING_KEY, 'true');

      await instance.loginRedirect({
        ...loginRequest,
        prompt: 'select_account',
      });
    } catch (err) {
      console.error('Microsoft login failed:', err);

      sessionStorage.removeItem(MICROSOFT_LOGIN_PENDING_KEY);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Microsoft login failed.';

      if (!message.includes('user_cancelled')) {
        setError('Microsoft login failed: ' + message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-card w-full max-w-md animate-fade-in relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-full h-2 ${loginType === 'ADMIN'
            ? 'bg-gradient-to-r from-primary to-cyan-400'
            : loginType === 'EMPLOYEE'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
        ></div>

        <h2 className="text-3xl font-extrabold text-slate-800 text-center mb-2 mt-2">
          {loginType === 'ADMIN'
            ? 'Admin Access'
            : loginType === 'EMPLOYEE'
              ? 'Employee Portal'
              : 'Intern Login'}
        </h2>

        <p className="text-center text-sm font-medium text-gray-500 mb-6">
          Sign in to your account
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center font-semibold animate-fade-in">
            {error}
          </div>
        )}

        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 shadow-inner">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'ADMIN'
              ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => handleLoginTypeChange('ADMIN')}
          >
            Admin
          </button>

          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'EMPLOYEE'
              ? 'bg-white text-teal-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => handleLoginTypeChange('EMPLOYEE')}
          >
            Employee
          </button>

          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginType === 'INTERN'
              ? 'bg-white text-purple-600 shadow-sm ring-1 ring-black/5'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => handleLoginTypeChange('INTERN')}
          >
            Intern
          </button>
        </div>

        {loginType === 'EMPLOYEE' && (
          <div className="flex bg-gray-50 p-1 rounded-lg mb-5 w-5/6 mx-auto border border-gray-200 shadow-inner">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${employeeLoginMethod === 'ID'
                ? 'bg-white text-teal-600 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
                }`}
              onClick={() => {
                setEmployeeLoginMethod('ID');
                setFormData((prev) => ({ ...prev, usernameOrEmail: '' }));
              }}
            >
              Use Employee ID
            </button>

            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${employeeLoginMethod === 'EMAIL'
                ? 'bg-white text-teal-600 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
                }`}
              onClick={() => {
                setEmployeeLoginMethod('EMAIL');
                setFormData((prev) => ({ ...prev, usernameOrEmail: '' }));
              }}
            >
              Use Email / Username
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-fade-in">
            <label className="text-sm font-bold text-gray-700 ml-1">
              {loginType === 'ADMIN'
                ? 'Username or Email'
                : loginType === 'EMPLOYEE'
                  ? employeeLoginMethod === 'ID'
                    ? 'Employee ID'
                    : 'Username or Email'
                  : 'Username or Email'}
            </label>

            <input
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              className={`form-input mt-1 ${loginType === 'EMPLOYEE' && employeeLoginMethod === 'ID'
                ? 'font-mono text-lg tracking-wider'
                : ''
                }`}
              placeholder={
                loginType === 'ADMIN'
                  ? 'e.g. admin'
                  : loginType === 'EMPLOYEE'
                    ? employeeLoginMethod === 'ID'
                      ? 'e.g. 001234'
                      : 'name@example.com'
                    : 'e.g. johndoe or name@example.com'
              }
              required
              {...(loginType === 'EMPLOYEE' && employeeLoginMethod === 'ID'
                ? {
                    pattern: '^00\\d{4}$',
                    title: 'Employee ID must be exactly 6 digits starting with 00',
                    maxLength: 6,
                    minLength: 6,
                  }
                : {})}
            />
          </div>

          <div className="relative">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Password
            </label>

            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input pr-10"
              required
            />

            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className={`btn w-full shadow-lg text-white ${loginType === 'ADMIN'
              ? 'bg-primary hover:bg-indigo-700'
              : loginType === 'EMPLOYEE'
                ? 'bg-teal-600 hover:bg-teal-700'
                : 'bg-purple-600 hover:bg-purple-700'
              }`}
          >
            Sign In
          </button>
        </form>

        {loginType === 'EMPLOYEE' && import.meta.env.VITE_ENABLE_MICROSOFT_LOGIN === "true" && (
          <div className="mt-4">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 21 21"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="#f25022" d="M1 1h9v9H1z" />
                <path fill="#00a4ef" d="M1 11h9v9H1z" />
                <path fill="#7fba00" d="M11 1h9v9h-9z" />
                <path fill="#ffb900" d="M11 11h9v9h-9z" />
              </svg>
              Sign in with Microsoft
            </button>
          </div>
        )}

        <div className="mt-8 text-center border-t border-gray-100 pt-6 space-y-3">
          <p className="text-sm text-gray-500 font-medium">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary hover:text-indigo-700 font-bold hover:underline transition-colors"
            >
              Register here
            </Link>
          </p>

          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:text-indigo-700 font-bold hover:underline transition-colors block"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;