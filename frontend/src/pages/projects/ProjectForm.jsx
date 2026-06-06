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
  const [assignedInternIds, setAssignedInternIds] = useState([]);
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          api.get('/employees'),
          api.get('/departments')
        ]);
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSelectData();

    api.get('/interns')
      .then(res => setAllInterns(res.data))
      .catch(err => console.error("Error fetching interns", err));

    if (isEdit) {
      api.get(`/projects/${id}`)
        .then(res => {
          const data = res.data;
          if (data.startDate) data.startDate = data.startDate.split('T')[0];
          if (data.endDate) data.endDate = data.endDate.split('T')[0];
          setFormData(data);
          setAssignedInternIds(data.assignedInternIds || []);
          setAssignedEmployeeIds(data.assignedEmployeeIds || []);
        })
        .catch(err => console.error("Error fetching project details", err));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInternAssignment = async (internId, isAssigning) => {
    if (!isEdit) {
      alert("Please save the project first before assigning team members.");
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

  const handleEmployeeAssignment = async (employeeId, isAssigning) => {
    if (!isEdit) {
      alert("Please save the project first before assigning team members.");
      return;
    }
    try {
      if (isAssigning) {
        await api.post(`/projects/${id}/assign-employees`, { employeeIds: [employeeId] });
        setAssignedEmployeeIds([...assignedEmployeeIds, employeeId]);
      } else {
        await api.delete(`/projects/${id}/remove-employee/${employeeId}`);
        setAssignedEmployeeIds(assignedEmployeeIds.filter(i => i !== employeeId));
      }
    } catch (err) {
      console.error("Error assigning/removing employee", err);
      alert(err.response?.data?.message || "Failed to update employee assignment");
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

  const eligibleEmployees = employees.filter(emp => 
    !['General Manager', 'Deputy General Manager'].includes(emp.designation)
  );

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-amber-300 w-[30rem] h-[30rem] top-[20%] left-[30%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6 pb-20">
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
                  {eligibleEmployees.map(sup => (
                    <option key={sup.id} value={sup.fullName}>{sup.fullName} ({sup.designation})</option>
                  ))}
                  {formData.supervisor && !eligibleEmployees.find(s => s.fullName === formData.supervisor) && (
                    <option value={formData.supervisor}>{formData.supervisor}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Department *</label>
                <select name="department" value={formData.department} onChange={handleChange} className="form-select mt-1 shadow-sm" required>
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
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

          <div className="max-w-4xl mx-auto flex gap-4 pt-4">
            <button type="submit" className="btn btn-success flex-1 text-lg py-3 shadow-lg flex justify-center items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {isEdit ? 'Save Project Details' : 'Create & Continue to Assignment'}
            </button>
          </div>
        </form>

        {isEdit && (
          <div className="space-y-8 mt-12 pt-8 border-t border-gray-200/50 max-w-4xl mx-auto">
            
            <div className="glass-card animate-slide-up">
              <h3 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2 mb-4">Assign Employees</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse bg-white/50">
                  <thead>
                    <tr className="bg-indigo-50/80 text-indigo-800 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Employee Name</th>
                      <th className="p-4 font-semibold">Designation</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {eligibleEmployees.map(emp => {
                      const isAssigned = assignedEmployeeIds.includes(emp.id);
                      return (
                        <tr key={emp.id} className="hover:bg-indigo-50/50 transition-colors">
                          <td className="p-4 font-medium text-gray-700">{emp.fullName}</td>
                          <td className="p-4 text-gray-600">{emp.designation}</td>
                          <td className="p-4 text-right">
                            {isAssigned ? (
                              <button type="button" onClick={() => handleEmployeeAssignment(emp.id, false)} className="btn btn-outline text-danger border-danger hover:bg-danger hover:text-white text-xs px-3 py-1">
                                Remove
                              </button>
                            ) : (
                              <button type="button" onClick={() => handleEmployeeAssignment(emp.id, true)} className="btn btn-outline text-indigo-600 border-indigo-600 hover:bg-indigo-600 hover:text-white text-xs px-3 py-1">
                                Assign
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {eligibleEmployees.length === 0 && (
                      <tr>
                        <td colSpan="3" className="p-8 text-center text-gray-500 italic">No eligible employees found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card animate-slide-up">
              <h3 className="text-xl font-bold text-teal-900 border-b border-teal-100 pb-2 mb-4">Assign Interns</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse bg-white/50">
                  <thead>
                    <tr className="bg-teal-50/80 text-teal-800 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">Intern Name</th>
                      <th className="p-4 font-semibold">Specialization</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allInterns.map(intern => {
                      const isAssigned = assignedInternIds.includes(intern.id);
                      return (
                        <tr key={intern.id} className="hover:bg-teal-50/50 transition-colors">
                          <td className="p-4 font-medium text-gray-700">{intern.fullName} ({intern.internNumber})</td>
                          <td className="p-4 text-gray-600">{intern.specialization}</td>
                          <td className="p-4 text-right">
                            {isAssigned ? (
                              <button type="button" onClick={() => handleInternAssignment(intern.id, false)} className="btn btn-outline text-danger border-danger hover:bg-danger hover:text-white text-xs px-3 py-1">
                                Remove
                              </button>
                            ) : (
                              <button type="button" onClick={() => handleInternAssignment(intern.id, true)} className="btn btn-outline text-teal-600 border-teal-600 hover:bg-teal-600 hover:text-white text-xs px-3 py-1">
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

      </div>
    </>
  );
};

export default ProjectForm;
