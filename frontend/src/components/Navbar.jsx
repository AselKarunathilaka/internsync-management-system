import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.roles?.some(r => r.authority === 'ROLE_ADMIN');
  const isIntern = user?.roles?.some(r => r.authority === 'ROLE_INTERN');
  const isEmployee = user?.roles?.some(r => r.authority === 'ROLE_EMPLOYEE');
  
  const designation = user?.designation;
  const isGM = isEmployee && designation === 'General Manager';
  const isDGM = isEmployee && designation === 'Deputy General Manager';
  const isRegularEmployee = isEmployee && !isGM && !isDGM;

  return (
    <header className="glass-header">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 rounded-2xl shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">InternSync</h1>
        </div>
        <nav className="flex items-center gap-2">
          {user && (
            <>
              {isAdmin && (
                <>
                  <Link to="/" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dashboard</Link>
                  <Link to="/directory" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Org Directory</Link>
                  <Link to="/departments" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Departments</Link>
                  <Link to="/employees" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Employees</Link>
                  <Link to="/interns" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Interns</Link>
                  <Link to="/projects" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Projects</Link>
                  <Link to="/admin/profile" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">My Profile</Link>
                </>
              )}
              {isIntern && (
                <>
                  <Link to="/intern-dashboard" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dashboard</Link>
                  <Link to="/my-profile" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">My Profile</Link>
                  <Link to="/my-projects" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">My Projects</Link>
                  <Link to="/log-book" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Log Book</Link>
                </>
              )}
              {isGM && (
                <>
                  <Link to="/gm-dashboard" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dept. Dashboard</Link>
                  <Link to="/gm-interns" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dept. Interns</Link>
                  <Link to="/gm-projects" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dept. Projects</Link>
                  <Link to="/gm-employees" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dept. Employees</Link>
                  <Link to="/employee-profile" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">My Profile</Link>
                </>
              )}
              {isDGM && (
                <>
                  <Link to="/dgm-dashboard" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dept. Dashboard</Link>
                  <Link to="/gm-interns" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dept. Interns</Link>
                  <Link to="/gm-projects" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dept. Projects</Link>
                  <Link to="/gm-employees" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dept. Employees</Link>
                  <Link to="/employee-profile" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">My Profile</Link>
                </>
              )}
              {isRegularEmployee && (
                <>
                  <Link to="/employee-dashboard" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Dashboard</Link>
                  <Link to="/employee-profile" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">My Profile</Link>
                  <Link to="/employee-projects" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">My Projects</Link>
                  <Link to="/employee-tasks" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Task Checklist</Link>
                  <Link to="/employee-schedules" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-3 py-2 rounded-xl font-bold transition-all">Working Days</Link>
                </>
              )}
              <span className="text-gray-500 text-sm ml-4 border-l pl-4 border-gray-300">
                Hi, {user.username}
              </span>
              <button 
                onClick={handleLogout}
                className="ml-2 text-danger hover:bg-red-50 px-3 py-2 rounded-xl font-bold transition-all"
              >
                Logout
              </button>
            </>
          )}
          {!user && (
            <Link to="/login" className="text-slate-700 hover:text-indigo-600 hover:bg-white/40 px-5 py-2.5 rounded-xl font-bold transition-all">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
