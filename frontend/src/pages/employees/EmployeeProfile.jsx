import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';
import { isProxyUser, isActualGM, isActualDGM, isAdmin as checkIsAdmin } from '../../utils/authHelpers';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Account Creation Modal State
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const empRes = await api.get(`/employees/${id}`);
        setEmployee(empRes.data);

        // Fetch assigned projects
        const projRes = await api.get(`/employees/${id}/projects`);
        setProjects(projRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching employee profile", err);
        setError("Failed to load profile.");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error || !employee) {
    return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">{error || "Employee not found"}</div>;
  }

  const isProxy = isProxyUser(user);
  const isAdminUser = checkIsAdmin(user);
  const isActualGmUser = isActualGM(user);
  const isActualDgmUser = isActualDGM(user);

  const canEdit = isAdminUser || ((isActualGmUser || isActualDgmUser) && !isProxy);

  const isGM = employee.designation === 'General Manager' || employee.designation === 'Deputy General Manager';

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');
    if (accountForm.password !== accountForm.confirmPassword) {
      setAccountError('Passwords do not match.');
      return;
    }
    setAccountLoading(true);
    try {
      await api.post(`/employees/${id}/create-account`, accountForm);
      setAccountSuccess('Login account created successfully!');
      
      // Update employee state locally to reflect the new account
      setEmployee({ ...employee, userId: 'new-id' });
      setTimeout(() => setShowAccountModal(false), 2000);
    } catch (err) {
      setAccountError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setAccountLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-indigo-300 w-[40rem] h-[40rem] top-[-20%] left-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto animate-fade-in space-y-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/employees')} className="bg-white/40 hover:bg-white/60 text-slate-800 p-2 rounded-full backdrop-blur-xl transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">Employee Profile</h2>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button onClick={() => {
                  setAccountForm({ username: '', email: employee.email, password: '', confirmPassword: '' });
                  setShowAccountModal(true);
                  setAccountError('');
                  setAccountSuccess('');
                }} 
                className="btn bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Create Login Account
              </button>
              <Link to={`/employees/edit/${employee.id}`} className="btn btn-primary shadow-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </Link>
            </div>
          )}
        </div>

        <div className="glass-card animate-slide-up space-y-8">
          
          {/* Header Info */}
          <div className="flex items-center gap-6 border-b border-gray-100 pb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {employee.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-800">{employee.fullName}</h3>
              <p className="text-sm font-bold text-gray-500 mt-1">ID: #{employee.employeeNumber || 'N/A'}</p>
              <p className="text-indigo-600 font-bold text-lg mt-1">{employee.designation}</p>
              <p className="text-gray-500 font-medium">{employee.department}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2">Contact Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Email</p>
                  <p className="text-gray-800 font-medium">{employee.email}</p>
                </div>
                {employee.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-500 font-bold">Phone Number</p>
                    <p className="text-gray-800 font-medium">{employee.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2">Employment Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Account Status</p>
                  <p className="text-gray-800 font-medium">{employee.userId ? 'Registered' : 'Not Registered'}</p>
                </div>
                {!isGM && employee.specialization && (
                  <div>
                    <p className="text-sm text-gray-500 font-bold">Specialization</p>
                    <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-bold mt-1">
                      {employee.specialization}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Projects */}
          <div className="pt-8 border-t border-gray-100">
            <h4 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2 mb-6">Assigned Projects</h4>
            
            {isGM ? (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-center text-blue-800 font-medium">
                This role ({employee.designation}) is department-level and is not assigned directly to individual projects.
              </div>
            ) : (
              projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(proj => (
                    <div key={proj.id} className="bg-white/60 border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <Link to={`/projects/view/${proj.id}`} className="text-lg font-bold text-indigo-700 hover:text-indigo-900">
                        {proj.projectName}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{proj.projectCode} • {proj.department}</p>
                      <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                        proj.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        proj.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        proj.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50/50 rounded-xl border border-gray-100 text-gray-500 italic">
                  This employee is not assigned to any projects currently.
                </div>
              )
            )}
          </div>

        </div>
      </div>

      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowAccountModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Create Login Account</h3>
            
            {accountError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{accountError}</div>}
            {accountSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{accountSuccess}</div>}
            
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700">Username *</label>
                <input type="text" required className="form-input mt-1" value={accountForm.username} onChange={e => setAccountForm({...accountForm, username: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Email *</label>
                <input type="email" required className="form-input mt-1 bg-gray-100" readOnly value={accountForm.email} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Temporary Password *</label>
                <input type="password" required className="form-input mt-1" minLength={8} value={accountForm.password} onChange={e => setAccountForm({...accountForm, password: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Confirm Password *</label>
                <input type="password" required className="form-input mt-1" minLength={8} value={accountForm.confirmPassword} onChange={e => setAccountForm({...accountForm, confirmPassword: e.target.value})} />
              </div>
              <button type="submit" disabled={accountLoading} className="btn w-full bg-indigo-600 text-white mt-6 py-2">
                {accountLoading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeProfile;
