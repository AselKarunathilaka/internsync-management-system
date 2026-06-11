import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';
import { isProxyUser } from '../../utils/authHelpers';

// Format a date in Sri Lanka local time (Asia/Colombo)
const fmtSL = (dt) => {
  if (!dt) return '—';
  let d;
  if (Array.isArray(dt)) d = new Date(Date.UTC(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0));
  else d = new Date(typeof dt === 'string' && !dt.endsWith('Z') ? dt + 'Z' : dt);
  return d.toLocaleString('en-GB', {
    timeZone: 'Asia/Colombo',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const getTimeRemaining = (expiresAt) => {
  if (!expiresAt) return null;
  let d;
  if (Array.isArray(expiresAt)) d = new Date(Date.UTC(expiresAt[0], expiresAt[1] - 1, expiresAt[2], expiresAt[3] || 0, expiresAt[4] || 0));
  else d = new Date(typeof expiresAt === 'string' && !expiresAt.endsWith('Z') ? expiresAt + 'Z' : expiresAt);
  const diffMs = d - Date.now();
  if (diffMs <= 0) return { label: 'Expired', expired: true, urgent: false, critical: false };
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  let label;
  if (days > 0) label = `${days}d ${hours}h ${mins}m remaining`;
  else if (hours > 0) label = `${hours}h ${mins}m remaining`;
  else label = `${mins}m remaining`;
  return { label, expired: false, urgent: diffMs < 86400000, critical: diffMs < 3600000 };
};

const EmployeeMyProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isProxy = isProxyUser(user);
  const [proxyAccess, setProxyAccess] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.roles?.some(r => r.authority === 'ROLE_EMPLOYEE')) {
          setError("No employee profile associated with your account.");
          setLoading(false);
          return;
        }

        const [profileRes, proxyRes] = await Promise.all([
          api.get('/employees/me').catch(() => ({ data: null })),
          api.get('/proxy/me').catch(() => ({ data: null }))
        ]);

        let fetchedProfile = profileRes.data;
        if (!fetchedProfile) {
          fetchedProfile = {
            fullName: user?.fullName || user?.username || 'Employee User',
            email: user?.email || '',
            designation: 'New Employee',
            department: 'Unassigned',
            phoneNumber: '',
            specialization: 'Onboarding'
          };
        }

        setProfile(fetchedProfile);
        setFormData({
          fullName: fetchedProfile.fullName || '',
          email: fetchedProfile.email || '',
          phoneNumber: fetchedProfile.phoneNumber || ''
        });

        if (proxyRes.data?.isProxy) {
          setProxyAccess(proxyRes.data);
          setTimeRemaining(getTimeRemaining(proxyRes.data.expiresAt));
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching employee profile", err);
        setError("Failed to load profile details.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Live countdown timer — updates every 30 seconds
  useEffect(() => {
    if (!proxyAccess?.expiresAt) return;
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(proxyAccess.expiresAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [proxyAccess]);

  const handleSave = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      alert("Name and Email are required!");
      return;
    }
    
    setSaving(true);
    try {
      const res = await api.put('/employees/me', formData);
      setProfile(res.data);
      setIsEditing(false);
      alert("Profile updated successfully! If your name or email changed, you will see it reflected immediately.");
      // Optional: force reload to update AuthContext if needed
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. " + (err.response?.data?.message || err.response?.data || ''));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-sm text-center font-medium max-w-2xl mx-auto mt-10">{error}</div>;
  }

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-blue-300 w-[40rem] h-[40rem] top-[-10%] left-[-20%]" style={{ animationDelay: '0s', animationDuration: '18s' }}></div>
      </div>

      <div className="animate-fade-in space-y-8 max-w-3xl mx-auto mt-8 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">My Profile</h2>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 font-bold py-2 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    fullName: profile.fullName || '',
                    email: profile.email || '',
                    phoneNumber: profile.phoneNumber || ''
                  });
                }}
                className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-bold py-2 px-6 rounded-xl shadow-sm transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
        
        <div className="glass-card animate-slide-up border-t-4 border-t-primary">
          <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
            <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-primary text-4xl font-extrabold shadow-inner border-4 border-white">
              {(profile.fullName || 'E').charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="form-input text-2xl font-bold mb-2 max-w-sm"
                  placeholder="Full Name"
                />
              ) : (
                <h3 className="text-3xl font-bold text-gray-800">{profile.fullName}</h3>
              )}
              <p className="text-gray-500 font-medium text-lg">{profile.designation} • {profile.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </p>
              {isEditing ? (
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input w-full"
                  placeholder="Email Address"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">{profile.email || 'N/A'}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone
              </p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="form-input w-full"
                  placeholder="Phone Number"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">{profile.phoneNumber || 'N/A'}</p>
              )}
            </div>
            {profile.specialization && (
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Specialization</p>
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">{profile.specialization}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Account Status</p>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 rounded-xl w-fit">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-sm">Active & Linked</span>
              </div>
            </div>
          </div>
        </div>

        {(isProxy || proxyAccess?.isProxy) && (
          <div className={`glass-card animate-slide-up border-t-4 mt-8 ${
            timeRemaining?.critical ? 'border-t-red-500' :
            timeRemaining?.urgent  ? 'border-t-orange-500' :
                                     'border-t-purple-500'
          }`}>
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Proxy Access
            </h3>

            {/* Time Remaining Banner */}
            {proxyAccess?.expiresAt && (
              <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
                timeRemaining?.expired  ? 'bg-gray-100 border border-gray-300' :
                timeRemaining?.critical ? 'bg-red-50 border border-red-300 animate-pulse' :
                timeRemaining?.urgent   ? 'bg-orange-50 border border-orange-300' :
                                          'bg-amber-50 border border-amber-200'
              }`}>
                <span className="text-2xl">{timeRemaining?.expired ? '❌' : timeRemaining?.critical ? '🚨' : timeRemaining?.urgent ? '⚠️' : '🕐'}</span>
                <div>
                  <p className={`font-extrabold text-sm ${
                    timeRemaining?.expired  ? 'text-gray-600' :
                    timeRemaining?.critical ? 'text-red-700' :
                    timeRemaining?.urgent   ? 'text-orange-700' :
                                              'text-amber-800'
                  }`}>
                    {timeRemaining?.expired ? 'Proxy Access Expired' : timeRemaining?.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Expires: {fmtSL(proxyAccess.expiresAt)} (Sri Lanka Time)</p>
                </div>
              </div>
            )}
            {!proxyAccess?.expiresAt && (
              <div className="rounded-xl p-4 mb-6 flex items-center gap-3 bg-green-50 border border-green-200">
                <span className="text-2xl">🔑</span>
                <p className="font-extrabold text-sm text-green-700">Proxy Access Active — No Expiry Set</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-500">Status</p>
                  <p className="text-emerald-600 font-bold">Active</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Source</p>
                  <p className="text-indigo-600 font-bold">{proxyAccess?.source || user?.proxySource || 'INTERNAL'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Proxy Role</p>
                  <p className="text-slate-800 font-bold">{proxyAccess?.proxyRole || user?.proxyRole || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Department Scope</p>
                  <p className="text-slate-800 font-bold">{proxyAccess?.scopeValue || user?.proxyScopeValue || '—'}</p>
                </div>
                {proxyAccess?.startDate && (
                  <div>
                    <p className="text-sm font-bold text-gray-500">Valid From</p>
                    <p className="text-slate-700 font-medium">{fmtSL(proxyAccess.startDate)}</p>
                  </div>
                )}
                {proxyAccess?.expiresAt && (
                  <div>
                    <p className="text-sm font-bold text-gray-500">Valid Until</p>
                    <p className="text-slate-700 font-medium">{fmtSL(proxyAccess.expiresAt)}</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Granted Permissions</h4>
                <div className="flex flex-wrap gap-2">
                  {(proxyAccess?.permissions || user?.proxyPermissions || []).length > 0 ? (
                    (proxyAccess?.permissions || user?.proxyPermissions || []).map((perm, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-sm font-semibold">
                        {perm.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm italic">No permissions listed</span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-2">Restricted Actions</h4>
                <ul className="list-disc list-inside text-red-600 space-y-1 ml-2 text-sm">
                  <li>Cannot edit employee profiles</li>
                  <li>Cannot create login accounts</li>
                  <li>Cannot create/edit/delete projects</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeMyProfile;
