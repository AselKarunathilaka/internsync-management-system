import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AdminProfile from './pages/auth/AdminProfile';

import Dashboard from './pages/Dashboard';
import Directory from './pages/Directory';
import InternList from './pages/interns/InternList';
import InternForm from './pages/interns/InternForm';
import InternProfile from './pages/interns/InternProfile';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import EmployeeDashboard from './pages/employees/EmployeeDashboard';
import EmployeeProjects from './pages/employees/EmployeeProjects';
import EmployeeTasks from './pages/employees/EmployeeTasks';
import EmployeeSchedules from './pages/employees/EmployeeSchedules';
import EmployeeMyProfile from './pages/employees/EmployeeMyProfile';
import ProjectList from './pages/projects/ProjectList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectView from './pages/projects/ProjectView';
import DepartmentList from './pages/departments/DepartmentList';
import DepartmentForm from './pages/departments/DepartmentForm';
import DepartmentView from './pages/departments/DepartmentView';

import MyProfile from './pages/interns/MyProfile';
import MyProjects from './pages/interns/MyProjects';
import InternDashboard from './pages/interns/InternDashboard';
import DailyLogBook from './pages/interns/DailyLogBook';

import GmDashboard from './pages/gm/GmDashboard';
import GmInterns from './pages/gm/GmInterns';
import GmProjects from './pages/gm/GmProjects';
import GmEmployees from './pages/gm/GmEmployees';

import DgmDashboard from './pages/dgm/DgmDashboard';

import ProxyDashboard from './pages/proxy/ProxyDashboard';
import ProxyManagement from './pages/proxy/ProxyManagement';

import NotFound from './pages/NotFound';

import MicrosoftRedirectHandler from './auth/MicrosoftRedirectHandler';

function App() {
  return (
    <AuthProvider>
      <Router>
        <MicrosoftRedirectHandler />
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin/profile" element={<ProtectedRoute roles={['ADMIN']}><AdminProfile /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute roles={['ADMIN']}><Dashboard /></ProtectedRoute>} />
            <Route path="/directory" element={<ProtectedRoute roles={['ADMIN']}><Directory /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute roles={['ADMIN']}><EmployeeList /></ProtectedRoute>} />
            <Route path="/employees/view/:id" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><EmployeeProfile /></ProtectedRoute>} />
            <Route path="/employees/add" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><EmployeeForm /></ProtectedRoute>} />
            <Route path="/employees/edit/:id" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><EmployeeForm /></ProtectedRoute>} />
            <Route path="/interns" element={<ProtectedRoute roles={['ADMIN']}><InternList /></ProtectedRoute>} />
            <Route path="/interns/view/:id" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><InternProfile /></ProtectedRoute>} />
            <Route path="/interns/add" element={<ProtectedRoute roles={['ADMIN']}><InternForm /></ProtectedRoute>} />
            <Route path="/interns/edit/:id" element={<ProtectedRoute roles={['ADMIN']}><InternForm /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute roles={['ADMIN']}><ProjectList /></ProtectedRoute>} />
            <Route path="/projects/new" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><ProjectForm /></ProtectedRoute>} />
            <Route path="/projects/edit/:id" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><ProjectForm /></ProtectedRoute>} />
            <Route path="/projects/view/:id" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE', 'INTERN']}><ProjectView /></ProtectedRoute>} />

            {/* Department Routes */}
            <Route path="/departments" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><DepartmentList /></ProtectedRoute>} />
            <Route path="/departments/view/:id" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><DepartmentView /></ProtectedRoute>} />
            <Route path="/departments/new" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><DepartmentForm /></ProtectedRoute>} />
            <Route path="/departments/edit/:id" element={<ProtectedRoute roles={['ADMIN', 'EMPLOYEE']}><DepartmentForm /></ProtectedRoute>} />

            {/* Intern Routes */}
            <Route path="/intern-dashboard" element={<ProtectedRoute roles={['INTERN']}><InternDashboard /></ProtectedRoute>} />
            <Route path="/my-profile" element={<ProtectedRoute roles={['INTERN']}><MyProfile /></ProtectedRoute>} />
            <Route path="/my-projects" element={<ProtectedRoute roles={['INTERN']}><MyProjects /></ProtectedRoute>} />
            <Route path="/log-book" element={<ProtectedRoute roles={['INTERN']}><DailyLogBook /></ProtectedRoute>} />

            {/* Employee Routes */}
            <Route path="/employee-dashboard" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee-projects" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeProjects /></ProtectedRoute>} />
            <Route path="/employee-tasks" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeTasks /></ProtectedRoute>} />
            <Route path="/employee-schedules" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeSchedules /></ProtectedRoute>} />
            <Route path="/employee-profile" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeMyProfile /></ProtectedRoute>} />

            {/* General Manager Routes */}
            <Route path="/gm-dashboard" element={<ProtectedRoute roles={['EMPLOYEE']}><GmDashboard /></ProtectedRoute>} />
            <Route path="/gm-interns" element={<ProtectedRoute roles={['EMPLOYEE']}><GmInterns /></ProtectedRoute>} />
            <Route path="/gm-projects" element={<ProtectedRoute roles={['EMPLOYEE']}><GmProjects /></ProtectedRoute>} />
            <Route path="/gm-employees" element={<ProtectedRoute roles={['EMPLOYEE']}><GmEmployees /></ProtectedRoute>} />

            {/* Proxy Dashboard Route */}
            <Route path="/proxy-dashboard" element={<ProtectedRoute roles={['EMPLOYEE']}><ProxyDashboard /></ProtectedRoute>} />
            <Route path="/proxy-management" element={<ProtectedRoute roles={['EMPLOYEE', 'ADMIN']}><ProxyManagement /></ProtectedRoute>} />

            {/* Deputy General Manager Routes */}
            <Route path="/dgm-dashboard" element={<ProtectedRoute roles={['EMPLOYEE']}><DgmDashboard /></ProtectedRoute>} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
