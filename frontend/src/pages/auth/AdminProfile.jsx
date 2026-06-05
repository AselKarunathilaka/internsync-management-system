import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setFormData({
          username: res.data.username || '',
          email: res.data.email || '',
          password: '',
          confirmPassword: ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile", err);
        setMessage({ type: 'error', text: 'Failed to load profile details.' });
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      await api.put('/auth/profile', payload);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear password fields
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      console.error("Error updating profile", err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-indigo-300 w-[40rem] h-[40rem] top-[-20%] left-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
        <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">Admin Profile</h2>
        <p className="text-gray-500 mb-8">Manage your administrative account settings and credentials.</p>

        {message.text && (
          <div className={`p-4 rounded-xl text-center font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {message.text}
          </div>
        )}

        <div className="glass-card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Username *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
              <p className="text-xs text-gray-500 mb-4">Leave password fields blank if you do not wish to change your password.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-4 mt-6">
              <button 
                type="submit" 
                className="btn btn-primary flex-1 text-lg py-3 shadow-lg flex justify-center items-center gap-2"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
