import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching employees", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        console.error("Error deleting employee", err);
        alert("Failed to delete employee.");
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-purple-300 w-[30rem] h-[30rem] top-[10%] left-[20%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">Employee Directory</h2>
          <Link to="/employees/add" className="btn btn-primary shadow-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Employee
          </Link>
        </div>

        <div className="glass-card animate-slide-up">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center p-12 text-gray-500 italic bg-white/40 rounded-xl border border-gray-100">
              No employees found. Add some employees to get started!
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="w-full text-left border-collapse bg-white/50 backdrop-blur-md">
                <thead>
                  <tr className="bg-gray-100/80 text-gray-600 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Department</th>
                    <th className="p-4 font-semibold">Designation</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-indigo-50/50 transition-colors duration-150 group">
                      <td className="p-4 font-bold text-indigo-600">#{emp.employeeNumber || 'N/A'}</td>
                      <td className="p-4 font-bold text-gray-800">{emp.fullName}</td>
                      <td className="p-4 text-gray-600">{emp.email}</td>
                      <td className="p-4 font-medium text-gray-700">{emp.department}</td>
                      <td className="p-4 text-gray-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          emp.designation.toLowerCase().includes('manager') ? 'bg-indigo-100 text-indigo-700' :
                          emp.designation.toLowerCase().includes('supervisor') ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {emp.designation}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link to={`/employees/view/${emp.id}`} className="bg-teal-100 text-teal-700 hover:bg-teal-200 p-2 rounded-lg transition-colors" title="View Profile">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </Link>
                          <Link to={`/employees/edit/${emp.id}`} className="bg-indigo-100 text-primary hover:bg-indigo-200 p-2 rounded-lg transition-colors" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </Link>
                          <button onClick={() => handleDelete(emp.id)} className="bg-red-100 text-danger hover:bg-red-200 p-2 rounded-lg transition-colors" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeList;
