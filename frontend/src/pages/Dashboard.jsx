import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import api from '../api';

const Dashboard = () => {
  const [status, setStatus] = useState({
    frontend: 'running',
    backend: 'checking...',
    database: 'checking...',
    version: '...'
  });
  const [interns, setInterns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/status')
      .then(res => {
        setStatus(prev => ({
          ...prev,
          backend: res.data.backend,
          database: res.data.database,
          version: res.data.version
        }));
      })
      .catch(err => {
        setStatus(prev => ({ ...prev, backend: 'error', database: 'error' }));
      });

    Promise.all([
      api.get('/interns'),
      api.get('/projects')
    ])
      .then(([internsRes, projectsRes]) => {
        setInterns(internsRes.data);
        setProjects(projectsRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching analytics", err);
        setLoading(false);
      });
  }, []);

  const activeInterns = interns.filter(i => i.status === 'ACTIVE').length;
  const completedInterns = interns.filter(i => i.status === 'COMPLETED').length;
  const recentInterns = [...interns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const totalInterns = interns.length;

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const recentProjects = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const totalProjects = projects.length;

  const universityData = Object.values(interns.reduce((acc, intern) => {
    const uni = intern.university || 'Unknown';
    acc[uni] = acc[uni] || { name: uni, value: 0 };
    acc[uni].value += 1;
    return acc;
  }, {}));

  const specializationData = Object.values(interns.reduce((acc, intern) => {
    const spec = intern.specialization || 'N/A';
    acc[spec] = acc[spec] || { name: spec, count: 0 };
    acc[spec].count += 1;
    return acc;
  }, {})).sort((a, b) => b.count - a.count).map(item => ({
    ...item,
    percent: totalInterns > 0 ? ((item.count / totalInterns) * 100).toFixed(0) : 0
  }));

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold shadow-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-purple-400 w-96 h-96 top-[-10%] left-[-10%]" style={{ animationDelay: '0s', animationDuration: '12s' }}></div>
        <div className="blob bg-pink-400 w-96 h-96 top-[40%] right-[-10%]" style={{ animationDelay: '2s', animationDuration: '15s' }}></div>
        <div className="blob bg-indigo-400 w-[30rem] h-[30rem] bottom-[-20%] left-[20%]" style={{ animationDelay: '4s', animationDuration: '18s' }}></div>
      </div>
      
      <div className="animate-fade-in space-y-6">
        <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">System Dashboard</h2>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Frontend Status', value: status.frontend, subtitle: 'React Vite UI', statusColor: 'text-secondary', pulseColor: 'bg-secondary' },
          { title: 'Backend Status', value: status.backend, subtitle: 'Spring Boot API', statusColor: status.backend === 'running' ? 'text-secondary' : 'text-danger', pulseColor: status.backend === 'running' ? 'bg-secondary' : 'bg-danger' },
          { title: 'Database Status', value: status.database, subtitle: 'MongoDB Atlas', statusColor: status.database === 'connected' ? 'text-secondary' : 'text-danger', pulseColor: status.database === 'connected' ? 'bg-secondary' : 'bg-danger' },
          { title: 'App Version', value: status.version, subtitle: 'From Backend API', statusColor: 'text-primary', pulseColor: 'bg-primary', noPulse: true }
        ].map((card, index) => (
          <div key={index} className="glass-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{card.title}</h3>
            <div className={`text-3xl font-bold mt-2 mb-1 flex items-center ${card.statusColor}`}>
              {!card.noPulse && (
                <span className="relative flex h-3 w-3 mr-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${card.pulseColor}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${card.pulseColor}`}></span>
                </span>
              )}
              {card.value}
            </div>
            <p className="text-xs text-gray-400">{card.subtitle}</p>
          </div>
        ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="glass-card col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Internship Analytics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500 font-medium">Total Interns</span>
                  <span className="text-2xl font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{loading ? '...' : interns.length}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500 font-medium">Active</span>
                  <span className="text-2xl font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{loading ? '...' : activeInterns}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-500 font-medium">Completed</span>
                  <span className="text-2xl font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{loading ? '...' : completedInterns}</span>
                </div>
              </div>
            </div>
            <Link to="/interns" className="btn btn-primary w-full mt-6 flex justify-center items-center group">
              Manage All Interns
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="glass-card col-span-1 lg:col-span-2 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recently Added Interns</h3>
            {loading ? (
              <div className="animate-pulse space-y-4 mt-8">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>)}
              </div>
            ) : recentInterns.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 italic">No interns found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 rounded-tl-lg font-semibold">Intern #</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Specialization</th>
                      <th className="p-4 rounded-tr-lg font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentInterns.map((intern, idx) => (
                      <tr key={intern.id} className="hover:bg-gray-50/80 transition-colors duration-150 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                        <td className="p-4 font-bold text-gray-700">{intern.internNumber}</td>
                        <td className="p-4 font-medium">{intern.fullName}</td>
                        <td className="p-4"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">{intern.specialization || 'N/A'}</span></td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            intern.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                            intern.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {intern.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Project Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '450ms' }}>
          <div className="glass-card col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Project Analytics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500 font-medium">Total Projects</span>
                  <span className="text-2xl font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">{loading ? '...' : totalProjects}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-500 font-medium">Active</span>
                  <span className="text-2xl font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{loading ? '...' : activeProjects}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-500 font-medium">Completed</span>
                  <span className="text-2xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{loading ? '...' : completedProjects}</span>
                </div>
              </div>
            </div>
            <Link to="/projects" className="btn btn-primary w-full mt-6 flex justify-center items-center group">
              Manage All Projects
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="glass-card col-span-1 lg:col-span-2 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recently Added Projects</h3>
            {loading ? (
              <div className="animate-pulse space-y-4 mt-8">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>)}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 italic">No projects found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="p-4 rounded-tl-lg font-semibold">Code</th>
                      <th className="p-4 font-semibold">Project Name</th>
                      <th className="p-4 font-semibold">Supervisor</th>
                      <th className="p-4 rounded-tr-lg font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentProjects.map((project, idx) => (
                      <tr key={project.id} className="hover:bg-gray-50/80 transition-colors duration-150 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                        <td className="p-4 font-bold text-gray-700">{project.projectCode}</td>
                        <td className="p-4 font-medium text-indigo-700">
                          <Link to={`/projects/view/${project.id}`} className="hover:underline">{project.projectName}</Link>
                        </td>
                        <td className="p-4 text-gray-600">{project.supervisor || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            project.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                            project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 
                            project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="glass-card flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Interns by University</h3>
              <span className="bg-indigo-50 text-primary px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-indigo-100">Total: {interns.length}</span>
            </div>
            <div className="h-72 w-full flex-grow relative">
              {loading ? <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-gray-100 rounded-xl"></div> : interns.length === 0 ? <p className="text-center text-gray-400 mt-20">No data</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={universityData}
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={110}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      className="drop-shadow-md"
                    >
                      {universityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value} Interns`, 'Count']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="glass-card flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Interns by Specialization</h3>
              <span className="bg-indigo-50 text-primary px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-indigo-100">Total: {interns.length}</span>
            </div>
            <div className="h-72 w-full flex-grow relative">
              {loading ? <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-gray-100 rounded-xl"></div> : interns.length === 0 ? <p className="text-center text-gray-400 mt-20">No data</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={specializationData} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} interval={0} angle={-30} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                    <RechartsTooltip cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }} formatter={(value) => [`${value} Interns`, 'Count']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} className="drop-shadow-sm">
                      <LabelList dataKey="percent" position="top" formatter={(val) => `${val}%`} style={{ fontSize: '12px', fill: '#4B5563', fontWeight: 'bold' }} />
                      {specializationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
