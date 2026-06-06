import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const empRes = await api.get(`/employees/${id}`);
        setEmployee(empRes.data);

        // Fetch assigned projects
        const projRes = await api.get(`/employees/${id}/projects`);
        setProjects(projRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching employee profile", err);
        setError("Failed to load profile.");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error || !employee) {
    return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">{error || "Employee not found"}</div>;
  }

  const isGM = employee.designation === 'General Manager' || employee.designation === 'Deputy General Manager';

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-indigo-300 w-[40rem] h-[40rem] top-[-20%] left-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto animate-fade-in space-y-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/employees')} className="bg-white/40 hover:bg-white/60 text-slate-800 p-2 rounded-full backdrop-blur-xl transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">Employee Profile</h2>
          </div>
          <Link to={`/employees/edit/${employee.id}`} className="btn btn-primary shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </Link>
        </div>

        <div className="glass-card animate-slide-up space-y-8">
          
          {/* Header Info */}
          <div className="flex items-center gap-6 border-b border-gray-100 pb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {employee.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-800">{employee.fullName}</h3>
              <p className="text-indigo-600 font-bold text-lg mt-1">{employee.designation}</p>
              <p className="text-gray-500 font-medium">{employee.department}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2">Contact Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Email</p>
                  <p className="text-gray-800 font-medium">{employee.email}</p>
                </div>
                {employee.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-500 font-bold">Phone Number</p>
                    <p className="text-gray-800 font-medium">{employee.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2">Employment Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-bold">Account Status</p>
                  <p className="text-gray-800 font-medium">{employee.userId ? 'Registered' : 'Not Registered'}</p>
                </div>
                {!isGM && employee.specialization && (
                  <div>
                    <p className="text-sm text-gray-500 font-bold">Specialization</p>
                    <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-bold mt-1">
                      {employee.specialization}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Projects */}
          <div className="pt-8 border-t border-gray-100">
            <h4 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2 mb-6">Assigned Projects</h4>
            
            {isGM ? (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-center text-blue-800 font-medium">
                This role ({employee.designation}) is department-level and is not assigned directly to individual projects.
              </div>
            ) : (
              projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(proj => (
                    <div key={proj.id} className="bg-white/60 border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all">
                      <Link to={`/projects/view/${proj.id}`} className="text-lg font-bold text-indigo-700 hover:text-indigo-900">
                        {proj.projectName}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{proj.projectCode} • {proj.department}</p>
                      <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                        proj.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        proj.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        proj.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50/50 rounded-xl border border-gray-100 text-gray-500 italic">
                  This employee is not assigned to any projects currently.
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default EmployeeProfile;
