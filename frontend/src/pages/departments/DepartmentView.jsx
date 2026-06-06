import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

  const getEmployeeName = (empId) => {
    if (!empId) return "Unassigned";
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.fullName : "Unknown";
  };

  const getIntern = (internId) => {
    return interns.find(i => i.id === internId) || null;
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-emerald-300 w-[40rem] h-[40rem] top-[-10%] right-[-10%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto animate-fade-in space-y-8 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/departments')} className="bg-white/40 hover:bg-white/60 text-slate-800 p-2 rounded-full backdrop-blur-xl transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">{department.name}</h2>
        </div>

        {/* Department Info Card */}
        <div className="glass-card animate-slide-up">
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
