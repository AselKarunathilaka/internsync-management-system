import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';
import { isProxyUser } from '../../utils/authHelpers';

const GmProjects = () => {
  const { user } = useContext(AuthContext);
  const isProxy = isProxyUser(user);
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/gm/department-projects'),
      api.get('/gm/department-interns')
    ]).then(([projectsRes, internsRes]) => {
      setProjects(projectsRes.data);
      setInterns(internsRes.data);
      setLoading(false);
    }).catch(err => {
      setError(err.response?.data?.error || 'Failed to load projects.');
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemoveIntern = async (projectId, internId) => {
    if (window.confirm('Are you sure you want to remove this intern from the project?')) {
      try {
        await api.delete(`/gm/projects/${projectId}/remove-intern/${internId}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to remove intern.');
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await api.delete(`/projects/${projectId}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete project.');
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (error) return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">{error}</div>;

  return (
    <>
      <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Department Projects</h2>
            <p className="text-gray-500 mt-2">View active projects and manage allocated interns.</p>
          </div>
          {!isProxy && (
            <Link to="/projects/new" className="btn btn-success shadow-sm">+ Create Project</Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-white/40 rounded-xl border border-gray-100 text-gray-500 italic">
              No projects found for your department.
            </div>
          ) : (
            projects.map(project => {
              const assignedInterns = interns.filter(i => project.assignedInternIds?.includes(i.id));

              return (
                <div key={project.id} className="glass-card p-6 animate-slide-up flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-purple-900">
                        <Link to={`/projects/view/${project.id}`} className="hover:underline">{project.projectName}</Link>
                      </h3>
                      <p className="text-sm font-bold text-gray-500 mt-1">{project.projectCode}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                      project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      project.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      project.status === 'PLANNED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Supervisor:</span>
                      <span className="text-sm font-semibold text-gray-700">{project.supervisor || 'Unassigned'}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description || 'No description provided.'}</p>
                    
                    <h4 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Allocated Interns ({assignedInterns.length})</h4>
                    {assignedInterns.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No interns assigned to this project yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {assignedInterns.map(intern => (
                          <li key={intern.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-700">
                              {intern.fullName} <span className="text-xs text-gray-400">({intern.specialization})</span>
                            </span>
                            <button 
                              onClick={() => handleRemoveIntern(project.id, intern.id)}
                              className="text-xs text-danger hover:underline font-bold"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                    {!isProxy && (
                      <>
                        <Link 
                          to={`/projects/edit/${project.id}`} 
                          className="btn btn-outline border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-1.5 px-3 text-xs"
                        >
                          Edit Project
                        </Link>
                        <button 
                          onClick={() => handleDeleteProject(project.id)}
                          className="btn btn-outline border-red-200 text-red-700 hover:bg-red-50 py-1.5 px-3 text-xs"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default GmProjects;
