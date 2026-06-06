import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const canManage = user?.roles?.some(r => r.authority === 'ROLE_ADMIN') || user?.designation === 'General Manager' || user?.designation === 'Deputy General Manager';

  const fetchData = async () => {
    try {
      const [deptRes, empRes, projRes, internRes] = await Promise.all([
        api.get('/departments'),
        api.get('/employees'),
        api.get('/projects'),
        api.get('/interns')
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
      setProjects(projRes.data);
      setInterns(internRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data", err);
      setError("Failed to load departments.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await api.delete(`/departments/${id}`);
        setDepartments(departments.filter(d => d.id !== id));
      } catch (err) {
        alert("Failed to delete department.");
      }
    }
  };

  const getEmployeeName = (id) => {
    if (!id) return "Unassigned";
    const emp = employees.find(e => e.id === id);
    return emp ? emp.fullName : "Unknown";
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Departments</h2>
          <p className="text-sm text-gray-500 mt-1">Manage organization departments and leadership</p>
        </div>
        {canManage && (
          <Link to="/departments/new" className="btn bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Department
          </Link>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Departments Found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by creating your first organizational department.</p>
          </div>
        ) : (
          departments.map(dept => {
            const deptProjects = projects.filter(p => p.department === dept.name);
            const projectCount = deptProjects.length;
            const staffCount = employees.filter(e => e.department === dept.name).length;
            const assignedInternIds = new Set(deptProjects.flatMap(p => p.assignedInternIds || []));
            const internCount = interns.filter(i => assignedInternIds.has(i.id)).length;
            
            return (
            <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
              
              <div className="flex justify-between items-start mb-4 mt-2">
                <h3 className="text-xl font-bold text-gray-800">{dept.name}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/departments/view/${dept.id}`} className="text-emerald-500 hover:text-emerald-700 bg-emerald-50 p-2 rounded-lg" title="View Department">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  {canManage && (
                    <>
                      <Link to={`/departments/edit/${dept.id}`} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg" title="Edit Department">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                      <button onClick={() => handleDelete(dept.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg" title="Delete Department">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 min-h-[40px]">{dept.description || 'No description provided.'}</p>
              
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">General Manager</p>
                  <p className="font-medium text-gray-800">{getEmployeeName(dept.gmId)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Deputy General Manager</p>
                  <p className="font-medium text-gray-800">{getEmployeeName(dept.deputyGmId)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                <div className="text-center px-4">
                  <p className="text-2xl font-bold text-emerald-600">{staffCount}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Staff</p>
                </div>
                <div className="text-center border-x border-gray-100 px-8">
                  <p className="text-2xl font-bold text-blue-600">{projectCount}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Projects</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-2xl font-bold text-purple-600">{internCount}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Interns</p>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DepartmentList;
