import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    projectCode: '',
    projectName: '',
    description: '',
    supervisor: '',
    department: '',
    status: 'PLANNED',
    startDate: '',
    endDate: ''
  });

  const [allInterns, setAllInterns] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [assignedInternIds, setAssignedInternIds] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/interns')
      .then(res => setAllInterns(res.data))
      .catch(err => console.error("Error fetching interns", err));

    api.get('/employees/supervisors')
      .then(res => setSupervisors(res.data))
      .catch(err => console.error("Error fetching supervisors", err));

    if (isEdit) {
      api.get(`/projects/${id}`)
        .then(res => {
          const data = res.data;
          if (data.startDate) data.startDate = data.startDate.split('T')[0];
          if (data.endDate) data.endDate = data.endDate.split('T')[0];
          setFormData(data);
          setAssignedInternIds(data.assignedInternIds || []);
        })
        .catch(err => console.error("Error fetching project details", err));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInternAssignment = async (internId, isAssigning) => {
    if (!isEdit) {
      alert("Please save the project first before assigning interns.");
      return;
    }
    try {
      if (isAssigning) {
        await api.post(`/projects/${id}/assign-interns`, { internIds: [internId] });
        setAssignedInternIds([...assignedInternIds, internId]);
      } else {
        await api.delete(`/projects/${id}/remove-intern/${internId}`);
        setAssignedInternIds(assignedInternIds.filter(i => i !== internId));
      }
    } catch (err) {
      console.error("Error assigning/removing intern", err);
      alert("Failed to update intern assignment");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isEdit) {
        await api.put(`/projects/${id}`, formData);
      } else {
        const res = await api.post(`/projects`, formData);
        navigate(`/projects/edit/${res.data.id}`);
        return;
      }
      navigate('/projects');
    } catch (err) {
      console.error("Error saving project", err);
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-amber-300 w-[30rem] h-[30rem] top-[20%] left-[30%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="bg-white/40 hover:bg-white/60 text-slate-800 p-3 rounded-full backdrop-blur-xl transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">{isEdit ? 'Edit Project' : 'Create Project'}</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center max-w-4xl mx-auto">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-card max-w-4xl mx-auto animate-slide-up">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Project Code *</label>
                <input type="text" className="form-input" name="projectCode" value={formData.projectCode} onChange={handleChange} required disabled={isEdit} placeholder="e.g. PRJ-001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Project Name *</label>
                <input type="text" className="form-input" name="projectName" value={formData.projectName} onChange={handleChange} required placeholder="Website Redesign" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                <textarea className="form-input h-24 resize-none" name="description" value={formData.description || ''} onChange={handleChange} placeholder="Project description..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Supervisor *</label>
                <select className="form-select" name="supervisor" value={formData.supervisor} onChange={handleChange} required>
                  <option value="" disabled>Select Supervisor</option>
                  {supervisors.map(sup => (
                    <option key={sup.id} value={sup.fullName}>{sup.fullName}</option>
                  ))}
                  {/* Fallback for existing supervisors not in the employee list */}
                  {formData.supervisor && !supervisors.find(s => s.fullName === formData.supervisor) && (
                    <option value={formData.supervisor}>{formData.supervisor}</option>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Department *</label>
                <input type="text" className="form-input" name="department" value={formData.department} onChange={handleChange} required placeholder="Digital Platforms" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Status *</label>
                <select className="form-input cursor-pointer" name="status" value={formData.status} onChange={handleChange} required>
                  <option value="PLANNED">PLANNED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_HOLD">ON HOLD</option>
                  <option value="COMPLETED">COMPLETED</option>
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
          </div>

          {isEdit && (
            <div className="glass-card max-w-4xl mx-auto animate-slide-up">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Assigned Interns</h3>
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse bg-white/50">
                    <thead>
                      <tr className="bg-gray-100/80 text-gray-600 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">Intern Name</th>
                        <th className="p-4 font-semibold">Specialization</th>
                        <th className="p-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allInterns.map(intern => {
                        const isAssigned = assignedInternIds.includes(intern.id);
                        return (
                          <tr key={intern.id} className="hover:bg-indigo-50/50 transition-colors">
                            <td className="p-4 font-medium text-gray-700">{intern.fullName} ({intern.internNumber})</td>
                            <td className="p-4 text-gray-600">{intern.specialization}</td>
                            <td className="p-4 text-right">
                              {isAssigned ? (
                                <button type="button" onClick={() => handleInternAssignment(intern.id, false)} className="btn btn-outline text-danger border-danger hover:bg-danger hover:text-white text-xs px-3 py-1">
                                  Remove
                                </button>
                              ) : (
                                <button type="button" onClick={() => handleInternAssignment(intern.id, true)} className="btn btn-outline text-primary border-primary hover:bg-primary hover:text-white text-xs px-3 py-1">
                                  Assign
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto flex gap-4 pt-4">
            <button type="submit" className="btn btn-success flex-1 text-lg py-3 shadow-lg flex justify-center items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {isEdit ? 'Save Project' : 'Create & Continue to Assignment'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProjectForm;
