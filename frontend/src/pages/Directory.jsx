import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Directory = () => {
  const [interns, setInterns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/interns'),
      api.get('/employees'),
      api.get('/projects')
    ])
      .then(([internsRes, employeesRes, projectsRes]) => {
        setInterns(internsRes.data);
        setEmployees(employeesRes.data);
        setProjects(projectsRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching directory data", err);
        setLoading(false);
      });
  }, []);

  // Group all data by department
  const directoryData = {};

  // Initialize departments
  const addDept = (dept) => {
    if (!dept) return;
    if (!directoryData[dept]) {
      directoryData[dept] = { employees: [], interns: [], projects: [] };
    }
  };

  employees.forEach(emp => {
    addDept(emp.department);
    directoryData[emp.department].employees.push(emp);
  });

  interns.forEach(intern => {
    const dept = intern.department || 'Unassigned';
    addDept(dept);
    directoryData[dept].interns.push(intern);
  });

  projects.forEach(project => {
    const dept = project.department || 'Unassigned';
    addDept(dept);
    directoryData[dept].projects.push(project);
  });

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  const departments = Object.keys(directoryData).sort();

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-indigo-300 w-[30rem] h-[30rem] top-[10%] right-[10%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
        <div className="blob bg-purple-300 w-[40rem] h-[40rem] bottom-[-20%] left-[-10%]" style={{ animationDelay: '2s', animationDuration: '25s' }}></div>
      </div>

      <div className="animate-fade-in space-y-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight mb-4">Organization Directory</h2>
          <p className="text-gray-500 text-lg">A comprehensive view of departments, their employees, active projects, and interns across the organization.</p>
        </div>

        {departments.length === 0 ? (
          <div className="text-center p-12 text-gray-500 italic bg-white/40 rounded-xl border border-gray-100 max-w-4xl mx-auto">
            No organizational data found.
          </div>
        ) : (
          <div className="space-y-12">
            {departments.map((deptName, idx) => {
              const dept = directoryData[deptName];
              
              // Sort employees to show GM/Management first, then Supervisors, then others
              const sortedEmployees = [...dept.employees].sort((a, b) => {
                const aDesig = a.designation.toLowerCase();
                const bDesig = b.designation.toLowerCase();
                if (aDesig.includes('manager') || aDesig.includes('gm')) return -1;
                if (bDesig.includes('manager') || bDesig.includes('gm')) return 1;
                if (aDesig.includes('supervisor') || aDesig.includes('lead')) return -1;
                if (bDesig.includes('supervisor') || bDesig.includes('lead')) return 1;
                return a.fullName.localeCompare(b.fullName);
              });

              return (
                <div key={deptName} className="glass-card animate-slide-up" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200/50">
                    <h3 className="text-2xl font-bold text-indigo-900 flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      {deptName}
                    </h3>
                    <div className="flex gap-4">
                      <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full shadow-sm">{dept.employees.length} Employees</span>
                      <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-full shadow-sm">{dept.interns.length} Interns</span>
                      <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full shadow-sm">{dept.projects.length} Projects</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Employees Column */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        Leadership & Staff
                      </h4>
                      {sortedEmployees.length === 0 ? <p className="text-sm text-gray-400 italic">No staff assigned.</p> : (
                        <div className="space-y-3">
                          {sortedEmployees.map(emp => (
                            <div key={emp.id} className="bg-white/60 p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                              <span className="font-bold text-gray-800">{emp.fullName}</span>
                              <span className="text-xs font-semibold text-emerald-600 uppercase mt-1">{emp.designation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Projects Column */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                        Department Projects
                      </h4>
                      {dept.projects.length === 0 ? <p className="text-sm text-gray-400 italic">No projects assigned.</p> : (
                        <div className="space-y-3">
                          {dept.projects.map(proj => (
                            <div key={proj.id} className="bg-white/60 p-3 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-1">
                                <Link to={`/projects/view/${proj.id}`} className="font-bold text-blue-700 hover:underline line-clamp-1">{proj.projectName}</Link>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${proj.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>{proj.status}</span>
                              </div>
                              <div className="text-xs text-gray-500 font-medium">Supervisor: {proj.supervisor || 'N/A'}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interns Column */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                        Assigned Interns
                      </h4>
                      {dept.interns.length === 0 ? <p className="text-sm text-gray-400 italic">No interns assigned.</p> : (
                        <div className="space-y-3">
                          {dept.interns.map(intern => (
                            <div key={intern.id} className="bg-white/60 p-3 rounded-xl border border-purple-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                              <div className="flex flex-col">
                                <Link to={`/interns/view/${intern.id}`} className="font-bold text-gray-800 hover:text-primary hover:underline">{intern.fullName}</Link>
                                <span className="text-xs text-gray-500">{intern.specialization}</span>
                              </div>
                              <span className={`h-2 w-2 rounded-full ${intern.status === 'ACTIVE' ? 'bg-emerald-500' : intern.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-red-500'}`} title={intern.status}></span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Directory;
