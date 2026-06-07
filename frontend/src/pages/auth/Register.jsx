import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'INTERN',
    internNumber: ''
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error("Error fetching departments", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.role === 'INTERN' && !formData.internNumber) {
      setError("Intern Number is required for Intern registration.");
      return;
    }

    if (formData.role === 'EMPLOYEE') {
      if (!formData.fullName || !formData.department || !formData.designation) {
        setError("Full Name, Department, and Designation are required for Employee registration.");
        return;
      }
      const needsSpecialization = !['General Manager', 'Deputy General Manager'].includes(formData.designation);
      if (needsSpecialization && !formData.specialization) {
        setError("Specialization is required for your designation.");
        return;
      }
    }

    setLoading(true);
    try {
      let payload;
      let endpoint = '/auth/register';

    if (formData.role === 'EMPLOYEE') {
      endpoint = '/auth/register-employee-public';
      payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      } else {
        payload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          internNumber: formData.internNumber
        };
      }

      await api.post(endpoint, payload);
      alert("Registration successful! You can now log in.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 py-12">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="blob bg-indigo-300 w-96 h-96 top-[-10%] left-[-10%]"></div>
        <div className="blob bg-cyan-300 w-96 h-96 bottom-[-10%] right-[-10%] animation-delay-2000"></div>
      </div>

      <div className="glass-card w-full max-w-xl p-8 z-10 animate-fade-in shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-cyan-400"></div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 drop-shadow-sm">Create Account</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Join InternSync Management System</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm mb-6 font-semibold animate-pulse text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.role === 'INTERN' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFormData({...formData, role: 'INTERN'})}
            >
              Intern
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.role === 'EMPLOYEE' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setFormData({...formData, role: 'EMPLOYEE', internNumber: ''})}
            >
              Employee
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {formData.role === 'EMPLOYEE' && (
              <div className="md:col-span-2">
                <p className="text-xs text-teal-600 font-bold mb-4 bg-teal-50 p-3 rounded-lg border border-teal-100">
                  Note: Employee registration is only available for employees already added by an administrator. Please use the same email address that exists in your employee profile.
                </p>
              </div>
            )}

            {formData.role === 'INTERN' && (
              <div className="md:col-span-2 animate-fade-in">
                <p className="text-xs text-purple-600 font-bold mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
                  Note: Intern registration is only available for interns already added by an administrator. Please use your intern number and registered email address to create your login account.
                </p>
                <label className="text-xs font-bold text-purple-600 uppercase tracking-wider ml-1">Intern Number *</label>
                <input 
                  type="text" name="internNumber"
                  className="form-input mt-1 shadow-sm border-purple-200 focus:border-purple-500" 
                  placeholder="e.g. 3539" value={formData.internNumber} onChange={handleChange} required={formData.role === 'INTERN'}
                />
              </div>
            )}

            <div className={formData.role === 'EMPLOYEE' ? '' : 'md:col-span-2'}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username *</label>
              <input 
                type="text" name="username"
                className="form-input mt-1 shadow-sm" 
                placeholder="e.g. johndoe" value={formData.username} onChange={handleChange} required
              />
            </div>

            <div className={formData.role === 'EMPLOYEE' ? '' : 'md:col-span-2'}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email *</label>
              <input 
                type="email" name="email"
                className="form-input mt-1 shadow-sm" 
                placeholder="name@example.com" value={formData.email} onChange={handleChange} required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password *</label>
              <input 
                type="password" name="password"
                className="form-input mt-1 shadow-sm" 
                placeholder="••••••••" value={formData.password} onChange={handleChange} required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm Password *</label>
              <input 
                type="password" name="confirmPassword"
                className="form-input mt-1 shadow-sm" 
                placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn w-full mt-8 py-3 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 bg-primary text-white hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-indigo-700 font-bold hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
