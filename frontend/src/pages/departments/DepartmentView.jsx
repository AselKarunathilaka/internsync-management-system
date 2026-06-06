import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import api from '../../api';

const DepartmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', gmId: '', deputyGmId: '' });
  const { user } = React.useContext(AuthContext);

  const canManage = user?.roles?.some(r => r.authority === 'ROLE_ADMIN') || 
                    user?.designation === 'General Manager' || 
                    user?.designation === 'Deputy General Manager';

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const [deptRes, empRes, projRes, internRes] = await Promise.all([
          api.get(`/departments/${id}`),
          api.get('/employees'),
          api.get('/projects'),
          api.get('/interns')
        ]);
        
        setDepartment(deptRes.data);
        setEditForm({
          name: deptRes.data.name || '',
          description: deptRes.data.description || '',
          gmId: deptRes.data.gmId || '',
          deputyGmId: deptRes.data.deputyGmId || ''
        });
        setEmployees(empRes.data);
        setProjects(projRes.data.filter(p => p.department === deptRes.data.name));
        setInterns(internRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching department view data", err);
        setError("Failed to load department data. You might not have permission.");
        setLoading(false);
      }
    };
    fetchDepartmentData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error || !department) {
    return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">{error || "Department not found"}</div>;
  }

  if (isDeleted) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center p-12 bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-red-100 animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Department Deleted</h2>
        <p className="text-gray-500 mb-8">This department has been successfully deleted from the system.</p>
        <button onClick={() => navigate('/directory')} className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-md py-3 px-6 rounded-xl">
          Return to Directory
        </button>
      </div>
    );
  }

  const getEmployeeName = (empId) => {
    if (!empId) return "Unassigned";
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.fullName : "Unknown";
  };

  const getIntern = (internId) => {
    return interns.find(i => i.id === internId) || null;
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      try {
        await api.delete(`/departments/${id}`);
        setIsDeleted(true);
      } catch (err) {
        console.error("Failed to delete department", err);
        alert("Failed to delete department. It may have associated records.");
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/departments/${id}`, editForm);
      setDepartment(res.data);
      setIsEditing(false);
      // Ensure projects map to the new name if changed
      setProjects(projects.map(p => ({ ...p, department: res.data.name })));
    } catch (err) {
      console.error("Failed to update department", err);
      alert("Failed to update department details.");
    }
  };

  const handleRemoveEmployee = async (emp) => {
    if (window.confirm(`Are you sure you want to remove ${emp.fullName} from ${department.name}?`)) {
      try {
        const updatedEmp = { ...emp, department: 'Unassigned' };
        await api.put(`/employees/${emp.id}`, updatedEmp);
        setEmployees(employees.map(e => e.id === emp.id ? updatedEmp : e));
      } catch (err) {
        console.error("Failed to remove employee", err);
        alert(err.response?.data || "Failed to remove employee");
      }
    }
  };

  const eligibleGMs = employees.filter(e => e.designation === 'General Manager');
  const eligibleDGMs = employees.filter(e => e.designation === 'Deputy General Manager');

  // Prepare chart data
  const assignedInternIds = new Set(projects.flatMap(p => p.assignedInternIds || []));
  const departmentInterns = interns.filter(i => assignedInternIds.has(i.id));

  const internSpecializationData = departmentInterns.reduce((acc, curr) => {
    const spec = curr.specialization || 'Unknown';
    const existing = acc.find(item => item.name === spec);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: spec, value: 1 });
    }
    return acc;
  }, []);

  const projectStatusData = projects.reduce((acc, curr) => {
    const stat = curr.status || 'Unknown';
    const existing = acc.find(item => item.name === stat);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: stat, count: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-emerald-300 w-[40rem] h-[40rem] top-[-10%] right-[-10%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto animate-fade-in space-y-8 pb-20">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/directory')} className="bg-white/40 hover:bg-white/60 text-slate-800 p-2 rounded-full backdrop-blur-xl transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">{department.name}</h2>
          </div>
          {canManage && !isEditing && (
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(true)} className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
              <button onClick={handleDelete} className="btn bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Department Info Card */}
        <div className="glass-card animate-slide-up">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Edit Department Overview</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl shadow-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl shadow-md">
                    Save Changes
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Department Name</label>
                  <input type="text" className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">Description</label>
                  <textarea className="form-input h-24 resize-none" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">General Manager</label>
                  <select className="form-select" value={editForm.gmId} onChange={e => setEditForm({...editForm, gmId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {eligibleGMs.map(gm => <option key={gm.id} value={gm.id}>{gm.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Deputy General Manager</label>
                  <select className="form-select" value={editForm.deputyGmId} onChange={e => setEditForm({...editForm, deputyGmId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {eligibleDGMs.map(dgm => <option key={dgm.id} value={dgm.id}>{dgm.fullName}</option>)}
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Department Overview</h3>
                  <p className="text-gray-600 max-w-2xl">{department.description || 'No description provided.'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-gray-100 pt-6">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">General Manager</p>
                  <p className="font-bold text-lg text-indigo-900">{getEmployeeName(department.gmId)}</p>
                </div>
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Deputy General Manager</p>
                  <p className="font-bold text-lg text-teal-900">{getEmployeeName(department.deputyGmId)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
          {/* Interns Chart */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Intern Specializations
            </h3>
            {internSpecializationData.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-10">No intern data available.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={internSpecializationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {internSpecializationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Projects Chart */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Project Status
            </h3>
            {projectStatusData.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-10">No project data available.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Department Staff */}
        <div className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Department Staff
            </h3>
          </div>
          
          {(() => {
            const staff = employees.filter(e => e.department === department.name);
            if (staff.length === 0) {
              return <div className="text-center p-8 bg-white/40 rounded-xl border border-gray-100 italic text-gray-500">No staff members assigned to this department.</div>;
            }
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {staff.map(emp => (
                  <div key={emp.id} className="bg-white/60 p-4 rounded-xl border border-emerald-100 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow group">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{emp.fullName}</span>
                      <span className="text-xs font-semibold text-emerald-600 uppercase mt-1">{emp.designation}</span>
                    </div>
                    {canManage && (
                      <button 
                        onClick={() => handleRemoveEmployee(emp)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Remove from Department"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Projects and Interns */}
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Department Projects
          </h3>

          {projects.length === 0 ? (
            <div className="text-center p-12 bg-white/40 rounded-xl border border-gray-100 italic text-gray-500">
              No projects found for this department.
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map(proj => (
                <div key={proj.id} className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 p-6 animate-slide-up hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <Link to={`/projects/view/${proj.id}`} className="text-xl font-bold text-blue-700 hover:text-blue-900 hover:underline">
                          {proj.projectName}
                        </Link>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          proj.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          proj.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          proj.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 font-medium">Code: {proj.projectCode} • Supervisor: {proj.supervisor || 'Unassigned'}</p>
                    </div>
                    <Link to={`/projects/view/${proj.id}`} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm py-2 px-4 shadow-sm">
                      Manage Project
                    </Link>
                  </div>

                  {/* Interns inside project */}
                  <div>
                    <h4 className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-3">Assigned Interns ({proj.assignedInternIds?.length || 0})</h4>
                    {(!proj.assignedInternIds || proj.assignedInternIds.length === 0) ? (
                      <p className="text-sm text-gray-400 italic">No interns assigned to this project yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {proj.assignedInternIds.map(internId => {
                          const intObj = getIntern(internId);
                          if (!intObj) return null;
                          return (
                            <Link key={intObj.id} to={`/interns/view/${intObj.id}`} className="flex items-center p-3 rounded-lg border border-purple-100 bg-purple-50/30 hover:bg-purple-50 transition-colors group">
                              <div className="h-8 w-8 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs mr-3 group-hover:scale-110 transition-transform">
                                {intObj.fullName.charAt(0)}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-bold text-gray-800 truncate group-hover:text-purple-700">{intObj.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">{intObj.specialization}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DepartmentView;
