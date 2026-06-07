import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [assignedInterns, setAssignedInterns] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeProfile, setEmployeeProfile] = useState(null);

  const isAdmin = user?.roles?.some(r => r.authority === 'ROLE_ADMIN');
  const isEmployee = user?.roles?.some(r => r.authority === 'ROLE_EMPLOYEE');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const projRes = await api.get(`/projects/${id}`);
        setProject(projRes.data);

        const internsRes = await api.get('/interns');
        const allInterns = internsRes.data;
        const assignedInts = allInterns.filter(intern => 
          projRes.data.assignedInternIds && projRes.data.assignedInternIds.includes(intern.id)
        );
        setAssignedInterns(assignedInts);

        const empsRes = await api.get('/employees');
        const allEmps = empsRes.data;
        const assignedEmps = allEmps.filter(emp => 
          projRes.data.assignedEmployeeIds && projRes.data.assignedEmployeeIds.includes(emp.id)
        );
        setAssignedEmployees(assignedEmps);

        if (isEmployee) {
          setEmployeeProfile({
            designation: user?.designation,
            department: user?.department
          });
        }

        setLoading(false);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Error fetching project details", err);
        }
        if (err.response?.status === 403) {
          setError("You do not have permission to view this project.");
        } else if (err.response?.status === 404) {
          setError("Project not found.");
        } else if (err.response?.status >= 500) {
          setError("Server error while loading project.");
        } else {
          setError("Failed to load project details.");
        }
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, isEmployee]);

  const canManageProject = () => {
    if (!project) return false;
    if (isAdmin) return true;
    if (isEmployee && employeeProfile) {
      const { designation, department } = employeeProfile;
      const isGmOrDgm = designation === 'General Manager' || designation === 'Deputy General Manager';
      return isGmOrDgm && department === project.department;
    }
    return false;
  };

  const handleBack = () => {
    if (isAdmin) {
      navigate('/projects');
    } else if (isEmployee && user?.designation) {
      const desig = user.designation;
      if (desig === 'General Manager' || desig === 'Deputy General Manager') {
        navigate('/gm-projects');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-red-100 max-w-lg mx-auto shadow-2xl animate-fade-in">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-800 mb-3 drop-shadow-sm">Access Restricted</h3>
          <p className="text-gray-600 font-medium mb-8 text-lg">{error || "Project not found or you don't have permission to view it."}</p>
          <button onClick={() => navigate('/projects')} className="btn bg-slate-800 text-white hover:bg-slate-900 px-8 py-3 rounded-xl shadow-lg w-full font-bold text-lg transition-all hover:scale-[1.02]">
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-indigo-300 w-[30rem] h-[30rem] top-[10%] left-[20%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6 max-w-5xl mx-auto pb-20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="bg-white/40 hover:bg-white/60 text-slate-800 p-3 rounded-full backdrop-blur-xl transition-all shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">{project.projectName}</h2>
          </div>
          {canManageProject() && (
            <Link to={`/projects/edit/${project.id}`} className="btn btn-primary shadow-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Project
            </Link>
          )}
        </div>

        <div className="glass-card animate-slide-up">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">Project Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Project Code</p>
              <p className="text-lg font-semibold text-gray-800">{project.projectCode}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm inline-block ${
                project.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 
                project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {project.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Department</p>
              <p className="text-lg font-medium text-gray-800">{project.department}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Supervisor</p>
              <p className="text-lg font-medium text-gray-800">{project.supervisor || 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Start Date</p>
              <p className="text-lg font-medium text-gray-800">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">End Date</p>
              <p className="text-lg font-medium text-gray-800">{project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-base text-gray-700 bg-white/50 p-4 rounded-xl border border-gray-100">{project.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2 mb-4 flex justify-between items-center">
              <span>Assigned Employees</span>
              <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">{assignedEmployees.length} Members</span>
            </h3>
            
            <div className="overflow-x-auto rounded-xl border border-gray-100 mt-4">
              <table className="w-full text-left border-collapse bg-white/50">
                <thead>
                  <tr className="bg-indigo-50/80 text-indigo-800 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Designation</th>
                    <th className="p-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignedEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center p-8 text-gray-500 italic">No employees assigned to this project.</td>
                    </tr>
                  ) : (
                    assignedEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{emp.fullName}</td>
                        <td className="p-4 text-gray-600">{emp.designation}</td>
                        <td className="p-4 text-center">
                          <Link to={`/employees/view/${emp.id}`} className="text-primary hover:text-indigo-700 text-sm font-bold hover:underline">View</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xl font-bold text-teal-900 border-b border-teal-100 pb-2 mb-4 flex justify-between items-center">
              <span>Assigned Interns</span>
              <span className="bg-teal-100 text-teal-700 text-sm py-1 px-3 rounded-full">{assignedInterns.length} Members</span>
            </h3>
            
            <div className="overflow-x-auto rounded-xl border border-gray-100 mt-4">
              <table className="w-full text-left border-collapse bg-white/50">
                <thead>
                  <tr className="bg-teal-50/80 text-teal-800 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Intern #</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignedInterns.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center p-8 text-gray-500 italic">No interns assigned to this project.</td>
                    </tr>
                  ) : (
                    assignedInterns.map(intern => (
                      <tr key={intern.id} className="hover:bg-teal-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-700">{intern.internNumber}</td>
                        <td className="p-4 font-medium text-gray-800">{intern.fullName}</td>
                        <td className="p-4 text-center">
                          <Link to={`/interns/view/${intern.id}`} className="text-teal-600 hover:text-teal-800 text-sm font-bold hover:underline">View</Link>
                        </td>
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

export default ProjectView;
