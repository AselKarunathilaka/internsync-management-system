import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const DgmDashboard = () => {
  const [stats, setStats] = useState(null);
  const [interns, setInterns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dgm/dashboard'),
      api.get('/dgm/department-interns'),
      api.get('/dgm/department-projects'),
      api.get('/dgm/department-employees')
    ]).then(([statsRes, internsRes, projectsRes, employeesRes]) => {
      setStats(statsRes.data);
      setInterns(internsRes.data);
      setProjects(projectsRes.data);
      setEmployees(employeesRes.data);
      setLoading(false);
    }).catch(err => {
      setError(err.response?.data?.error || 'Failed to load DGM dashboard.');
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (error) return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100 max-w-2xl mx-auto">{error}</div>;

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-emerald-200 w-[40rem] h-[40rem] top-[10%] right-[-10%]" style={{ animationDelay: '0s', animationDuration: '15s' }}></div>
      </div>

      <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Deputy GM Dashboard</h2>
            <p className="text-emerald-700 font-bold text-lg mt-1">{stats.department} Division</p>
          </div>
          <Link to="/employee-profile" className="btn bg-white/60 text-slate-700 hover:bg-white/80 shadow-sm border border-white/50">
            My Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 border-emerald-100/50">
            <p className="text-sm font-bold text-gray-500">Department Employees</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{employees.length}</p>
          </div>
          <div className="glass-card p-6 border-emerald-100/50">
            <p className="text-sm font-bold text-gray-500">Total Interns</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.totalInterns}</p>
          </div>
          <div className="glass-card p-6 border-emerald-100/50">
            <p className="text-sm font-bold text-gray-500">Paid Interns</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.paidInterns}</p>
          </div>
          <div className="glass-card p-6 border-emerald-100/50">
            <p className="text-sm font-bold text-gray-500">Active Projects</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.activeProjects}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interns List */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-gray-100">Department Interns</h3>
            <div className="p-0 overflow-y-auto max-h-96">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Stipend</th>
                    <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {interns.length === 0 ? (
                    <tr><td colSpan="4" className="p-6 text-center text-gray-400 italic">No interns found.</td></tr>
                  ) : (
                    interns.map(intern => (
                      <tr key={intern.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-700">{intern.fullName}</td>
                        <td className="p-4 text-sm text-gray-600">{intern.specialization}</td>
                        <td className="p-4 text-sm font-semibold text-gray-600">{intern.stipendType || 'PENDING'}</td>
                        <td className="p-4 text-xs font-bold text-emerald-600">{intern.assignmentStatus.replace(/_/g, ' ')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Projects List */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-gray-100">Department Projects</h3>
            <div className="p-0 overflow-y-auto max-h-96">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Project Name</th>
                    <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Interns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.length === 0 ? (
                    <tr><td colSpan="4" className="p-6 text-center text-gray-400 italic">No projects found.</td></tr>
                  ) : (
                    projects.map(proj => (
                      <tr key={proj.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-gray-500 text-xs">{proj.projectCode}</td>
                        <td className="p-4 font-bold text-indigo-700">
                          <Link to={`/projects/view/${proj.id}`} className="hover:underline">{proj.projectName}</Link>
                        </td>
                        <td className="p-4 text-xs font-bold text-gray-600">{proj.status}</td>
                        <td className="p-4 text-sm font-semibold text-gray-600">{proj.assignedInternIds?.length || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default DgmDashboard;
