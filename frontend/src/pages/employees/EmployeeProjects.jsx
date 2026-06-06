import React, { useState, useEffect } from 'react';
import api from '../../api';

const EmployeeProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/employees/me/projects')
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching my projects", err);
        setError(err.response?.data?.message || 'Failed to load projects');
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-blue-300 w-[40rem] h-[40rem] top-[-20%] right-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">My Projects</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="animate-pulse space-y-4 col-span-full">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>)}
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center p-12 glass-card text-gray-500 italic">
              You are not assigned to any projects yet.
            </div>
          ) : (
            projects.map((project, idx) => (
              <div key={project.id} className="glass-card animate-slide-up hover:shadow-xl transition-shadow" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-gray-400 block">{project.projectCode}</span>
                    <h3 className="text-xl font-bold text-slate-800">{project.projectName}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border ${
                    project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    project.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    project.status === 'ON_HOLD' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[3rem]">
                  {project.description || 'No description provided.'}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold">Department:</span>
                    <span className="text-gray-700 font-medium">{project.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-semibold">Duration:</span>
                    <span className="text-gray-700 font-medium">
                      {project.startDate} to {project.endDate || 'Ongoing'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeProjects;
