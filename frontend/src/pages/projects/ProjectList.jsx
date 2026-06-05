import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    setLoading(true);
    api.get('/projects')
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching projects", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      api.delete(`/projects/${id}`)
        .then(() => fetchProjects())
        .catch(err => console.error("Error deleting project", err));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-amber-300 w-[40rem] h-[40rem] top-[-20%] right-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">Project Management</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link to="/projects/add" className="btn btn-success flex-1 sm:flex-none shadow-lg">
              + Create Project
            </Link>
          </div>
        </div>

        <div className="glass-card animate-slide-up">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>)}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse bg-white/50">
                <thead>
                  <tr className="bg-gray-100/80 text-gray-600 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Code</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Department</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.length === 0 ? (
                    <tr><td colSpan="5" className="text-center p-8 text-gray-500 italic">No projects found.</td></tr>
                  ) : (
                    projects.map((project, idx) => (
                      <tr key={project.id} className="hover:bg-indigo-50/50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                        <td className="p-4 font-bold text-gray-800">{project.projectCode}</td>
                        <td className="p-4 font-medium text-gray-700">{project.projectName}</td>
                        <td className="p-4 text-gray-600">{project.department}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border ${
                            project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            project.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            project.status === 'ON_HOLD' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Link to={`/projects/view/${project.id}`} className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 p-2 rounded-lg transition-colors" title="View">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            </Link>
                            <Link to={`/projects/edit/${project.id}`} className="bg-indigo-100 text-primary hover:bg-indigo-200 p-2 rounded-lg transition-colors" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </Link>
                            <button onClick={() => handleDelete(project.id)} className="bg-red-100 text-danger hover:bg-red-200 p-2 rounded-lg transition-colors" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectList;
