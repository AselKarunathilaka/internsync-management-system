import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const InternDashboard = () => {
  const { user } = useContext(AuthContext);
  const [internData, setInternData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.internId) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get(`/interns/${user.internId}`),
      api.get('/projects')
    ])
      .then(([internRes, projectsRes]) => {
        setInternData(internRes.data);
        const myProjects = projectsRes.data.filter(p => p.assignedInternIds && p.assignedInternIds.includes(user.internId));
        setProjects(myProjects);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching intern dashboard data", err);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (!internData) {
    return <div className="text-center p-12 text-gray-500 font-bold">Could not load intern profile.</div>;
  }

  const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE').length;

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-indigo-300 w-[30rem] h-[30rem] top-[-10%] right-[-10%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight mb-2">Welcome back, {internData.fullName}!</h2>
            <p className="text-gray-500 font-medium">Here's a quick overview of your internship progress.</p>
          </div>
          <Link to="/my-profile" className="btn bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm border border-indigo-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <div className="glass-card flex items-center gap-4 border-l-4 border-l-primary">
            <div className="bg-indigo-100 p-4 rounded-xl text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-500 uppercase">Status</p>
              <p className={`text-xl font-bold ${internData.status === 'ACTIVE' ? 'text-emerald-600' : 'text-gray-700'}`}>{internData.status}</p>
            </div>
          </div>
          
          <div className="glass-card flex items-center gap-4 border-l-4 border-l-purple-500">
            <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-500 uppercase">Total Projects</p>
              <p className="text-xl font-bold text-gray-800">{projects.length}</p>
            </div>
          </div>

          <div className="glass-card flex items-center gap-4 border-l-4 border-l-emerald-500">
            <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-500 uppercase">Active Projects</p>
              <p className="text-xl font-bold text-gray-800">{activeProjectsCount}</p>
            </div>
          </div>
        </div>

        <div className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Your Recent Projects</h3>
            <Link to="/my-projects" className="text-primary font-bold hover:underline text-sm">View All</Link>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">You haven't been assigned to any projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map(proj => (
                <div key={proj.id} className="bg-white/60 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-indigo-900 truncate pr-2">{proj.projectName}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        proj.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                        proj.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{proj.description || 'No description provided.'}</p>
                  </div>
                  <div className="text-xs font-semibold text-gray-400">Supervisor: <span className="text-gray-600">{proj.supervisor || 'N/A'}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InternDashboard;
