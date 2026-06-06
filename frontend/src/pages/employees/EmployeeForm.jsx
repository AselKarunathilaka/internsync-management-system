import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isEditing = !!id;
  const isManager = user?.designation === 'General Manager' || user?.designation === 'Deputy General Manager';
  const isAdmin = user?.roles?.some(r => r.authority === 'ROLE_ADMIN');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    designation: 'Engineer',
    phoneNumber: '',
    specialization: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);

  const designations = ['General Manager', 'Deputy General Manager', 'Senior Engineer', 'Engineer', 'HR Manager', 'Tech Lead'];
  const specializationsList = ['AI', 'BA', 'C#', 'CICD', 'Cloud', 'Finance', 'Flutter', 'FullStack', 'IOT', 'JAVA', 'Logistics', 'Marketing', 'MERN', 'PHP', 'PM', 'Python', 'QA', 'ReactJS', 'UIUX'];

  const getAvailableSpecializations = (dept) => {
    if (!dept) return specializationsList;
    if (dept === 'Digital Labs') return ['IOT'];
    if (dept === 'Human Capital') return ['Finance', 'Marketing', 'Logistics'];
    return specializationsList.filter(s => !['IOT', 'Finance', 'Marketing', 'Logistics'].includes(s));
  };

  const availableSpecializations = getAvailableSpecializations(formData.department);
  const needsSpecialization = !['General Manager', 'Deputy General Manager'].includes(formData.designation);

  useEffect(() => {
    api.get('/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error("Error fetching departments", err));
  }, []);

  useEffect(() => {
    if (isEditing) {
      api.get(`/employees/${id}`)
        .then(res => {
          setFormData({
            fullName: res.data.fullName || '',
            email: res.data.email || '',
            department: res.data.department || '',
            designation: res.data.designation || 'Engineer',
            phoneNumber: res.data.phoneNumber || '',
            specialization: res.data.specialization || '',
            username: '',
            password: '',
            confirmPassword: ''
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching employee", err);
          setError("Failed to load employee data.");
          setLoading(false);
        });
    } else if (isManager && user?.employeeId) {
      // Fetch the GM/DGM's own employee profile to get their department
      api.get(`/employees/${user.employeeId}`)
        .then(res => {
          if (res.data.department) {
            setFormData(prev => ({ ...prev, department: res.data.department }));
          }
        })
        .catch(err => console.error("Error fetching manager department", err));
    }
  }, [id, isEditing, isManager, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!isEditing && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setSaving(false);
      return;
    }

    if (needsSpecialization && !formData.specialization.trim()) {
      setError("Specialization is required for this designation.");
      setSaving(false);
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/employees/${id}`, {
          fullName: formData.fullName,
          email: formData.email,
          department: formData.department,
          designation: formData.designation,
          phoneNumber: formData.phoneNumber,
          specialization: needsSpecialization ? formData.specialization : null
        });
      } else {
        await api.post('/auth/register-employee', formData);
      }
      if (isManager && !isAdmin) {
        navigate('/gm-employees');
      } else {
        navigate('/employees');
      }
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

      <div className="max-w-3xl mx-auto animate-fade-in space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(isManager && !isAdmin ? '/gm-employees' : '/employees')} className="bg-white/40 hover:bg-white/60 text-slate-800 p-3 rounded-full backdrop-blur-xl transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-bold text-center">{error}</div>}

        <div className="glass-card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <h3 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2">Employee Details</h3>
            
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
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Department *</label>
                  {departments.length === 0 && !isManager && (
                    <Link to="/departments/new" className="text-xs text-primary hover:underline font-bold">
                      + Create Department First
                    </Link>
                  )}
                </div>
                {isManager ? (
                  <input 
                    type="text" 
                    className="form-input mt-1 shadow-sm bg-gray-100 text-gray-500" 
                    value={formData.department} 
                    readOnly 
                  />
                ) : (
                  <select 
                    className="form-select mt-1 shadow-sm" 
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="" disabled>
                      {departments.length === 0 ? "No departments available" : "Select Department"}
                    </option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                  placeholder="+1 234 567 890"
                />
              </div>

              {needsSpecialization && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Specialization *</label>
                  <select 
                    className="form-select" 
                    name="specialization" 
                    value={formData.specialization} 
                    onChange={handleChange} 
                    required={needsSpecialization}
                  >
                    <option value="" disabled>Select Specialization</option>
                    {availableSpecializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}</select>
                </div>
              )}
            </div>

            {!isEditing && (
              <>
                <h3 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2 mt-8">Login Account Details</h3>
                
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
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Password *</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                      placeholder="••••••••"
                      minLength="6"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password *</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      required 
                      placeholder="••••••••"
                      minLength="6"
                    />
                  </div>
                </div>
              </>
            )}

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
                {saving ? 'Saving...' : (isEditing ? 'Update Employee' : 'Register Employee')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EmployeeForm;
