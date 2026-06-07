import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const InternProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [intern, setIntern] = useState(null);
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
        const internRes = await api.get(`/interns/${id}`);
        setIntern(internRes.data);

        // Fetch assigned projects using the new endpoint
        const projRes = await api.get(`/projects/intern/${id}`);
        setProjects(projRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching intern profile", err);
        setError("Failed to load profile.");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error || !intern) {
    return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">{error || "Intern not found"}</div>;
  }

  // Basic role check to determine if the user can edit
  // Ideally this would come from AuthContext, but we can assume if they reached here via UI they might have access,
  // or the backend will block the edit request.
  const canEdit = true; // In a full app, we'd check if role === 'ADMIN'

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
      await api.post(`/interns/${id}/create-account`, accountForm);
      setAccountSuccess('Login account created successfully!');
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
        <div className="blob bg-purple-300 w-[40rem] h-[40rem] top-[-20%] left-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto animate-fade-in space-y-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="bg-white/40 hover:bg-white/60 text-slate-800 p-2 rounded-full backdrop-blur-xl transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">Intern Profile</h2>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button onClick={() => {
                  setAccountForm({ username: '', email: intern.email, password: '', confirmPassword: '' });
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
              <Link to={`/interns/edit/${intern.id}`} className="btn bg-purple-600 text-white hover:bg-purple-700 shadow-sm flex items-center gap-2">
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {intern.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-extrabold text-slate-800">{intern.fullName}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  intern.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                  intern.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {intern.status}
                </span>
              </div>
              <p className="text-purple-600 font-bold text-lg mt-1">{intern.internNumber}</p>
              <p className="text-gray-500 font-medium">{intern.department} • {intern.specialization}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-purple-900 border-b border-purple-100 pb-2">Contact & Info</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Email</p>
                  <p className="text-gray-800 font-medium">{intern.email}</p>
                </div>
                {intern.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-500 font-bold">Phone Number</p>
                    <p className="text-gray-800 font-medium">{intern.phoneNumber}</p>
                  </div>
                )}
                {intern.university && (
                  <div>
                    <p className="text-sm text-gray-500 font-bold">University</p>
                    <p className="text-gray-800 font-medium">{intern.university}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-bold text-purple-900 border-b border-purple-100 pb-2">Internship Timeline</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Start Date</p>
                  <p className="text-gray-800 font-medium">{new Date(intern.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold">End Date</p>
                  <p className="text-gray-800 font-medium">{intern.endDate ? new Date(intern.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h4 className="text-xl font-bold text-purple-900 border-b border-purple-100 pb-2">Status & Assignment</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Stipend Type</p>
                  <p className="text-gray-800 font-medium">{intern.stipendType || 'PENDING'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold">Assignment Status</p>
                  <p className="text-gray-800 font-medium">{intern.assignmentStatus ? intern.assignmentStatus.replace(/_/g, ' ') : 'PENDING_MANAGER_REVIEW'}</p>
                </div>
                {intern.assignedManagerId && (
                  <div>
                    <p className="text-sm text-gray-500 font-bold">Assigned GM ID</p>
                    <p className="text-gray-800 font-medium text-xs">{intern.assignedManagerId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Projects */}
          <div className="pt-8 border-t border-gray-100">
            <h4 className="text-xl font-bold text-purple-900 border-b border-purple-100 pb-2 mb-6">Assigned Projects</h4>
            
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(proj => (
                  <div key={proj.id} className="bg-white/60 border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <Link to={`/projects/view/${proj.id}`} className="text-lg font-bold text-purple-700 hover:text-purple-900">
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
                This intern is not currently assigned to any projects.
              </div>
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

export default InternProfile;
