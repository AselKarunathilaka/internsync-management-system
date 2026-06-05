import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const SPECIALIZATIONS = [
  "AI", "BA", "C#", "CICD", "Cloud", "Flutter", 
  "FullStack", "JAVA", "MERN", "PHP", "PM", "Other"
];

const InternForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    internNumber: '',
    fullName: '',
    email: '',
    department: '',
    specialization: '',
    university: '',
    phoneNumber: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE'
  });

  const [accountData, setAccountData] = useState({
    username: '',
    password: ''
  });
  const [createAccount, setCreateAccount] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isEdit) {
      api.get(`/interns/${id}`)
        .then(res => {
          const data = res.data;
          if (data.startDate) data.startDate = data.startDate.split('T')[0];
          if (data.endDate) data.endDate = data.endDate.split('T')[0];
          setFormData(data);
        })
        .catch(err => console.error("Error fetching intern details", err));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAccountChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let internId = id;
      if (isEdit) {
        await api.put(`/interns/${id}`, formData);
      } else {
        const res = await api.post(`/interns`, formData);
        internId = res.data.id;
      }

      if (createAccount && !isEdit) {
        // Create user account for this intern
        try {
          await api.post('/auth/create-intern-user', {
            username: accountData.username,
            email: formData.email,
            password: accountData.password,
            internId: internId
          });
        } catch (accErr) {
          setError(accErr.response?.data?.message || 'Error creating intern account, but intern was saved.');
          return;
        }
      }

      navigate('/interns');
    } catch (err) {
      console.error("Error saving intern", err);
      setError(err.response?.data?.message || 'Failed to save intern');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-rose-300 w-[30rem] h-[30rem] top-[20%] left-[30%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/interns')} className="bg-white/40 hover:bg-white/60 text-slate-800 p-3 rounded-full backdrop-blur-xl transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">{isEdit ? 'Edit Intern Profile' : 'Register New Intern'}</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center max-w-4xl mx-auto">{error}</div>}

        <div className="glass-card max-w-4xl mx-auto animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Profile Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Intern Number *</label>
                <input type="text" className="form-input" name="internNumber" value={formData.internNumber} onChange={handleChange} required placeholder="e.g. 3531" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Full Name *</label>
                <input type="text" className="form-input" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address *</label>
                <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                <input type="text" className="form-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="0771234567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Department *</label>
                <input type="text" className="form-input" name="department" value={formData.department} onChange={handleChange} required placeholder="Digital Platforms" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Specialization *</label>
                <select className="form-input cursor-pointer" name="specialization" value={formData.specialization} onChange={handleChange} required>
                  <option value="" disabled>Select Specialization</option>
                  {SPECIALIZATIONS.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">University</label>
                <input type="text" className="form-input" name="university" value={formData.university} onChange={handleChange} placeholder="SLIIT" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Current Status *</label>
                <select className="form-input cursor-pointer" name="status" value={formData.status} onChange={handleChange} required>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="TERMINATED">TERMINATED</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Start Date *</label>
                <input type="date" className="form-input cursor-pointer" name="startDate" value={formData.startDate} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">End Date</label>
                <input type="date" className="form-input cursor-pointer" name="endDate" value={formData.endDate || ''} onChange={handleChange} />
              </div>
            </div>
            
            {!isEdit && (
              <>
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 pt-4 mt-6">Account Details</h3>
                <div className="flex items-center gap-2 mb-4">
                  <input type="checkbox" id="createAccount" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="createAccount" className="text-sm font-bold text-gray-700">Create a login account for this intern</label>
                </div>

                {createAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Username *</label>
                      <input type="text" className="form-input" name="username" value={accountData.username} onChange={handleAccountChange} required={createAccount} placeholder="johndoe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Temporary Password *</label>
                      <input type="password" className="form-input" name="password" value={accountData.password} onChange={handleAccountChange} required={createAccount} placeholder="Min 8 chars" />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-6 border-t border-gray-100 flex gap-4 mt-6">
              <button type="submit" className="btn btn-success flex-1 text-lg py-3 shadow-lg flex justify-center items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {isEdit ? 'Save Profile' : 'Register Intern'}
              </button>
              <button type="button" className="btn bg-white/40 hover:bg-white/60 text-slate-700 flex-1 text-lg py-3 shadow-md border border-white/50" onClick={() => navigate('/interns')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InternForm;
