import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [allInterns, setAllInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.roles?.some(r => r.authority === 'ROLE_EMPLOYEE')) {
          setError("No employee profile associated with your account.");
          setLoading(false);
          return;
        }

        const [profileRes, projectsRes, internsRes] = await Promise.all([
          api.get(`/employees/me`).catch(() => ({ data: null })),
          api.get(`/employees/me/projects`).catch(() => ({ data: [] })),
          api.get(`/interns`).catch(() => ({ data: [] }))
        ]);

        if (!profileRes.data) {
          // Fallback if the employee profile isn't fully linked
          setProfile({
            fullName: user?.fullName || user?.username || 'Employee User',
            email: user?.email || '',
            designation: 'New Employee',
            department: 'Unassigned',
            phoneNumber: '',
            specialization: 'Onboarding'
          });
        } else {
          setProfile(profileRes.data);
        }
        
        setProjects(projectsRes.data || []);
        setAllInterns(internsRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employee dashboard data", err);
        setError("Failed to load dashboard details.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-sm text-center font-medium max-w-2xl mx-auto mt-10">{error}</div>;
  }

  if (!profile) return null;

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-blue-300 w-[40rem] h-[40rem] top-[-10%] left-[-20%]" style={{ animationDelay: '0s', animationDuration: '18s' }}></div>
      </div>

      <div className="animate-fade-in space-y-8 max-w-5xl mx-auto mt-8 pb-20">
        <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight mb-8">Employee Dashboard</h2>
        
        <div className="glass-card animate-slide-up border-t-4 border-t-primary">
          <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-6">
            <div className="h-24 w-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-primary text-3xl font-extrabold shadow-inner border-2 border-white">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{profile.fullName}</h3>
              <p className="text-gray-500 font-medium">{profile.designation} • {profile.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
              <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.phoneNumber || 'N/A'}</p>
            </div>
            {profile.specialization && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Specialization</p>
                <p className="text-gray-800 font-medium bg-gray-50 px-3 py-2 rounded-lg">{profile.specialization}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Linked</p>
              <p className="text-gray-800 font-medium bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg inline-block">Active</p>
            </div>
          </div>
        </div>

        <div className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-2xl font-bold text-slate-800 border-b border-gray-100 pb-4 mb-6">My Assigned Projects & Teams</h3>
          
          {profile.designation === 'General Manager' || profile.designation === 'Deputy General Manager' ? (
            <div className="text-center p-8 bg-indigo-50 rounded-xl border border-indigo-100">
              <h4 className="text-xl font-bold text-indigo-800 mb-2">Department-Level Responsibility</h4>
              <p className="text-indigo-600">This role manages department-level operations and is not assigned directly to individual projects as a worker.</p>
              <Link to={profile.designation === 'General Manager' ? '/gm-dashboard' : '/dgm-dashboard'} className="btn btn-primary mt-4 inline-block">
                Go to Department Dashboard
              </Link>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-8 bg-gray-50/50 rounded-xl border border-gray-100 text-gray-500 italic">
              You are not currently assigned to any active projects.
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project, idx) => {
                const assignedInterns = allInterns.filter(intern => project.assignedInternIds?.includes(intern.id));
                
                return (
                  <div key={project.id} className="bg-white/60 border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400 block">{project.projectCode}</span>
                        <h4 className="text-xl font-bold text-indigo-700">{project.projectName}</h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                        project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        project.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        project.status === 'ON_HOLD' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6 border-b border-gray-100 pb-4">
                      {project.description || 'No description provided.'}
                    </p>

                    <div className="mt-4">
                      <h5 className="text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Interns Assigned ({assignedInterns.length})
                      </h5>
                      
                      {assignedInterns.length === 0 ? (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">No interns are currently assigned to this project.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {assignedInterns.map(intern => (
                            <div key={intern.id} className="flex items-center gap-3 p-3 bg-white border border-teal-100 rounded-lg shadow-sm">
                              <div className="h-10 w-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {intern.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{intern.fullName}</p>
                                <p className="text-xs text-gray-500">{intern.specialization || 'Intern'} • {intern.internNumber}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
