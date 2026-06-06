import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const GmDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/gm/dashboard')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load dashboard data.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  if (error) return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100">{error}</div>;

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-indigo-300 w-[40rem] h-[40rem] top-[-20%] left-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Department Dashboard</h2>
            <p className="text-indigo-600 font-bold text-lg mt-1">{stats.department} Division</p>
          </div>
          <Link to="/employee-profile" className="btn bg-white/60 text-slate-700 hover:bg-white/80 shadow-sm border border-white/50">
            My GM Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Total Interns</p>
                <p className="text-3xl font-extrabold text-slate-800">{stats.totalInterns}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Pending Review</p>
                <p className="text-3xl font-extrabold text-slate-800">{stats.pendingInterns}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Paid Interns</p>
                <p className="text-3xl font-extrabold text-slate-800">{stats.paidInterns}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500">Active Projects</p>
                <p className="text-3xl font-extrabold text-slate-800">{stats.activeProjects}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Intern Management</h3>
            <p className="text-gray-600 mb-6">Review pending interns, set their stipend status, and assign them to active department projects.</p>
            <Link to="/gm-interns" className="btn btn-primary w-full shadow-lg">Manage Department Interns</Link>
          </div>
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
            <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Project Overview</h3>
            <p className="text-gray-600 mb-6">View active projects within your department and manage intern allocations.</p>
            <Link to="/gm-projects" className="btn bg-purple-600 hover:bg-purple-700 text-white w-full shadow-lg">View Department Projects</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default GmDashboard;
