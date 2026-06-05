import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const MyProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.internId) {
      api.get(`/interns/${user.internId}`)
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
        
        <div className="glass-card animate-slide-up border-t-4 border-t-primary">
          <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
            <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-primary text-3xl font-extrabold shadow-inner border-2 border-white">
              {profile.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{profile.fullName}</h3>
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
              <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.phoneNumber || 'N/A'}</p>
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
