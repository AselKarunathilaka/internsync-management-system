import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gmId: '',
    deputyGmId: ''
  });
  
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees');
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/departments/${id}`)
        .then(res => {
          const data = res.data;
          setFormData({
            name: data.name || '',
            description: data.description || '',
            gmId: data.gmId || '',
            deputyGmId: data.deputyGmId || ''
          });
          setLoading(false);
        })
        .catch(err => {
          setError("Failed to load department.");
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isEdit) {
        await api.put(`/departments/${id}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      navigate('/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-6">{isEdit ? 'Edit Department' : 'Add New Department'}</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm mb-6 font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Department Name *</label>
            <input 
              type="text" name="name"
              className="form-input mt-1 shadow-sm" 
              placeholder="e.g. Digital Platforms" value={formData.name} onChange={handleChange} required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
            <textarea 
              name="description" rows="3"
              className="form-input mt-1 shadow-sm" 
              placeholder="Brief description of the department's role..." value={formData.description} onChange={handleChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider ml-1">General Manager (Optional)</label>
              <select 
                name="gmId" value={formData.gmId} onChange={handleChange}
                className="form-select mt-1 shadow-sm border-indigo-200 focus:border-indigo-500"
              >
                <option value="">None / Assign Later</option>
                {employees.filter(e => e.designation === 'General Manager').map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-1 ml-1 font-medium">You can create the department first and assign a GM later.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-teal-600 uppercase tracking-wider ml-1">Deputy General Manager (Optional)</label>
              <select 
                name="deputyGmId" value={formData.deputyGmId} onChange={handleChange}
                className="form-select mt-1 shadow-sm border-teal-200 focus:border-teal-500"
              >
                <option value="">None / Assign Later</option>
                {employees.filter(e => e.designation === 'Deputy General Manager').map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
              <p className="text-[10px] text-gray-500 mt-1 ml-1 font-medium">You can assign a Deputy GM later.</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button type="submit" className="btn btn-primary flex-1 py-3 text-lg">{isEdit ? 'Update Department' : 'Save Department'}</button>
            <button type="button" onClick={() => navigate('/departments')} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1 py-3 text-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;
