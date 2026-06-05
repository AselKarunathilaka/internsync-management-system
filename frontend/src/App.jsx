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
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import ProjectList from './pages/projects/ProjectList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectView from './pages/projects/ProjectView';

import MyProfile from './pages/interns/MyProfile';
import MyProjects from './pages/interns/MyProjects';
import InternDashboard from './pages/interns/InternDashboard';

import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
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
            <Route path="/employees/add" element={<ProtectedRoute roles={['ADMIN']}><EmployeeForm /></ProtectedRoute>} />
            <Route path="/employees/edit/:id" element={<ProtectedRoute roles={['ADMIN']}><EmployeeForm /></ProtectedRoute>} />
            <Route path="/interns" element={<ProtectedRoute roles={['ADMIN']}><InternList /></ProtectedRoute>} />
            <Route path="/interns/add" element={<ProtectedRoute roles={['ADMIN']}><InternForm /></ProtectedRoute>} />
            <Route path="/interns/edit/:id" element={<ProtectedRoute roles={['ADMIN']}><InternForm /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute roles={['ADMIN']}><ProjectList /></ProtectedRoute>} />
            <Route path="/projects/add" element={<ProtectedRoute roles={['ADMIN']}><ProjectForm /></ProtectedRoute>} />
            <Route path="/projects/edit/:id" element={<ProtectedRoute roles={['ADMIN']}><ProjectForm /></ProtectedRoute>} />
            <Route path="/projects/view/:id" element={<ProtectedRoute roles={['ADMIN']}><ProjectView /></ProtectedRoute>} />

            {/* Intern Routes */}
            <Route path="/intern-dashboard" element={<ProtectedRoute roles={['INTERN']}><InternDashboard /></ProtectedRoute>} />
            <Route path="/my-profile" element={<ProtectedRoute roles={['INTERN']}><MyProfile /></ProtectedRoute>} />
            <Route path="/my-projects" element={<ProtectedRoute roles={['INTERN']}><MyProjects /></ProtectedRoute>} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
