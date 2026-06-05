import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: 'Digital Platforms',
    designation: 'Supervisor'
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const departments = ['Digital Platforms', 'Digital Labs', 'Management', 'HR', 'Finance', 'Other'];
  const designations = ['General Manager', 'Supervisor', 'Project Manager', 'HR Manager', 'Tech Lead', 'Senior Engineer'];

  useEffect(() => {
    if (isEditing) {
      api.get(`/employees/${id}`)
        .then(res => {
          setFormData({
            fullName: res.data.fullName || '',
            email: res.data.email || '',
            department: res.data.department || 'Digital Platforms',
            designation: res.data.designation || 'Supervisor'
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching employee", err);
          setError("Failed to load employee data.");
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await api.put(`/employees/${id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      navigate('/employees');
    } catch (err) {
      console.error("Error saving employee", err);
      setError(err.response?.data?.message || "An error occurred while saving.");
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
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/employees')} className="bg-white/40 hover:bg-white/60 text-slate-800 p-2 rounded-full backdrop-blur-xl transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-bold text-center">{error}</div>}

        <div className="glass-card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  required 
                  placeholder="John Doe"
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
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Department *</label>
                <select 
                  className="form-select" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  required
                >
                  <option value="" disabled>Select Department</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Designation *</label>
                <select 
                  className="form-select" 
                  name="designation" 
                  value={formData.designation} 
                  onChange={handleChange} 
                  required
                >
                  <option value="" disabled>Select Designation</option>
                  {designations.map(des => <option key={des} value={des}>{des}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-4 mt-8">
              <button 
                type="button" 
                onClick={() => navigate('/employees')} 
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 flex-1 py-3"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary flex-1 text-lg py-3 shadow-lg flex justify-center items-center gap-2"
                disabled={saving}
              >
                {saving ? 'Saving...' : (isEditing ? 'Update Employee' : 'Save Employee')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmployeeForm;
