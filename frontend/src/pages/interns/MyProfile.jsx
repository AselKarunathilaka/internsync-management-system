import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const MyProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const activeId = user?.internId || user?.id;
    if (activeId) {
      api.get(`/interns/${activeId}`)
        .then(res => {
          setProfile(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching profile", err);
          setError("Failed to load profile details.");
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError("No intern profile associated with your account.");
    }
  }, [user]);

  const handleEditClick = () => {
    setEditForm({ 
      fullName: profile.fullName, 
      phoneNumber: profile.phoneNumber || '' 
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedProfile = { 
        ...profile, 
        fullName: editForm.fullName, 
        phoneNumber: editForm.phoneNumber 
      };
      await api.put(`/interns/${profile.id}`, updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile", err);
      alert(err.response?.data?.message || "Failed to update profile.");
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

  if (!profile) return null;

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-purple-300 w-[40rem] h-[40rem] top-[-10%] left-[-20%]" style={{ animationDelay: '0s', animationDuration: '18s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6 max-w-3xl mx-auto mt-8">
        <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight mb-8">My Profile</h2>
        
        <div className="glass-card animate-slide-up border-t-4 border-t-primary relative">
          {!isEditing ? (
            <button 
              onClick={handleEditClick}
              className="absolute top-6 right-6 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={handleCancel}
                className="text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border-b border-gray-100 pb-6">
            <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-primary text-3xl font-extrabold shadow-inner border-2 border-white shrink-0">
              {profile.fullName.charAt(0)}
            </div>
            <div className="text-center sm:text-left flex-1 w-full">
              {isEditing ? (
                <div className="mb-2 w-full max-w-sm mx-auto sm:mx-0">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    className="form-input text-lg font-bold"
                  />
                </div>
              ) : (
                <h3 className="text-2xl font-bold text-gray-800">{profile.fullName}</h3>
              )}
              <p className="text-gray-500 font-medium">{profile.specialization} • {profile.department}</p>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border inline-block ${
                  profile.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  profile.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  Status: {profile.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Intern Number</p>
              <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.internNumber}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                  className="form-input py-2"
                  placeholder="e.g. 0771111111"
                />
              ) : (
                <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.phoneNumber || 'N/A'}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">University</p>
              <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.university || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
              <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{new Date(profile.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">End Date</p>
              <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.endDate ? new Date(profile.endDate).toLocaleDateString() : 'Ongoing'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfile;
