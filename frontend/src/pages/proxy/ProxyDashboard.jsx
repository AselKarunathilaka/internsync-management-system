import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../../api';
import { getMyProxyAccess } from '../../features/proxy/api/proxyApi';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parseDate = (dt) => {
    if (!dt) return null;
    if (Array.isArray(dt)) return new Date(Date.UTC(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0));
    const dtStr = typeof dt === 'string' && !dt.includes('T') ? dt : (typeof dt === 'string' && !dt.endsWith('Z') && !dt.includes('+') ? dt + '+05:30' : dt);
    return new Date(dtStr);
};

const fmt = (dt) => {
    const d = parseDate(dt);
    if (!d) return '—';
    return d.toLocaleString('en-GB', {
        timeZone: 'Asia/Colombo',
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const getTimeRemaining = (expiresAt) => {
    const d = parseDate(expiresAt);
    if (!d) return null;
    const diffMs = d - new Date();
    if (diffMs <= 0) return { label: 'Expired', expired: true, urgent: false };
    const days = Math.floor(diffMs / 86400000);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    let label;
    if (days > 0) label = `${days}d ${hours}h remaining`;
    else if (hours > 0) label = `${hours}h ${mins}m remaining`;
    else label = `${mins}m remaining`;
    return { label, expired: false, urgent: diffMs < 86400000 };
};

// ─── Proxy Access Notification Banner ────────────────────────────────────────

const ProxyAccessBanner = ({ proxyAccess }) => {
    if (!proxyAccess?.isProxy) return null;
    const remaining = proxyAccess.expiresAt ? getTimeRemaining(proxyAccess.expiresAt) : null;

    if (remaining?.expired) return null; // don't show if already expired

    const urgent = remaining?.urgent;
    const noExpiry = !proxyAccess.expiresAt;

    return (
        <div className={`rounded-2xl p-5 border flex items-start gap-4 ${
            urgent ? 'bg-red-50 border-red-200' : noExpiry ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
        }`}>
            <div className={`text-3xl ${urgent ? 'animate-bounce' : ''}`}>
                {urgent ? '⚠️' : noExpiry ? '🔑' : '🕐'}
            </div>
            <div className="flex-1">
                <h4 className={`font-extrabold text-sm mb-1 ${
                    urgent ? 'text-red-700' : noExpiry ? 'text-green-700' : 'text-amber-800'
                }`}>
                    {urgent
                        ? `⚠ Proxy Access Expiring Soon — ${remaining.label}`
                        : noExpiry
                            ? 'Your Proxy Access is Active (No Expiry)'
                            : `Proxy Access Active — ${remaining?.label || 'No expiry'}`
                    }
                </h4>
                <p className="text-xs text-slate-600">
                    You are acting as a proxy for <strong>{proxyAccess.scopeValue}</strong>.
                    {proxyAccess.expiresAt && <> Access expires on <strong>{fmt(proxyAccess.expiresAt)}</strong>.</>}
                </p>
                {proxyAccess.permissions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {proxyAccess.permissions.map(p => (
                            <span key={p} className="px-2 py-0.5 bg-white/70 border border-current/20 rounded text-xs font-medium text-slate-700">{p.replace(/_/g, ' ')}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProxyDashboard = () => {
  const [data, setData] = useState(null);
  const [proxyAccess, setProxyAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load dashboard data and proxy access in parallel
    Promise.all([
        api.get('/dashboard/gm'),
        getMyProxyAccess().catch(() => null),
    ]).then(([dashRes, proxyRes]) => {
        setData(dashRes.data);
        setProxyAccess(proxyRes);
        setLoading(false);
    }).catch(err => {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (error) return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100 max-w-2xl mx-auto">{error}</div>;

  const stipendData = data.internsByStipend ? Object.keys(data.internsByStipend).map(key => ({ name: key, value: data.internsByStipend[key] })) : [];
  const specData = data.internsBySpecialization ? Object.keys(data.internsBySpecialization).map(key => ({ name: key, count: data.internsBySpecialization[key] })) : [];
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-indigo-300 w-[40rem] h-[40rem] top-[-20%] left-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
      </div>

      <div className="animate-fade-in space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              {data.department ? data.department.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown'} Proxy Dashboard
            </h2>
            <p className="text-indigo-600 font-bold text-lg mt-1">
              Delegated access assigned internally by department authority
            </p>
          </div>
          <Link to="/employee-profile" className="btn bg-white/60 text-slate-700 hover:bg-white/80 shadow-sm border border-white/50">
            My Profile
          </Link>
        </div>

        {/* Proxy Time Remaining Notification */}
        <ProxyAccessBanner proxyAccess={proxyAccess} />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 border-l-4 border-indigo-500">
            <p className="text-sm font-bold text-gray-500">Total Interns</p>
            <p className="text-3xl font-extrabold text-slate-800">{data.totalInterns}</p>
          </div>
          <div className="glass-card p-6 border-l-4 border-orange-500">
            <p className="text-sm font-bold text-gray-500">Pending Review</p>
            <p className="text-3xl font-extrabold text-slate-800">{data.pendingReviewCount}</p>
          </div>
          <div className="glass-card p-6 border-l-4 border-green-500">
            <p className="text-sm font-bold text-gray-500">Paid Interns</p>
            <p className="text-3xl font-extrabold text-slate-800">{data.paidInternCount}</p>
          </div>
          <div className="glass-card p-6 border-l-4 border-purple-500">
            <p className="text-sm font-bold text-gray-500">Active Projects</p>
            <p className="text-3xl font-extrabold text-slate-800">{data.activeProjectCount}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Interns by Stipend Status</h3>
            <div className="h-[300px] w-full">
              {stipendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stipendData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value">
                      {stipendData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Interns by Specialization</h3>
            <div className="h-[300px] w-full">
              {specData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={specData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{fill: 'rgba(238, 238, 238, 0.5)'}} />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Pending Interns Review */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Pending Interns Review</h3>
            <Link to="/gm-interns" className="text-indigo-600 font-bold hover:underline text-sm">View All Interns &rarr;</Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse bg-white/50">
              <thead>
                <tr className="bg-indigo-50/80 text-indigo-800 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Intern #</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Specialization</th>
                  <th className="p-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentPendingInterns && data.recentPendingInterns.length > 0 ? (
                  data.recentPendingInterns.map(intern => (
                    <tr key={intern.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-4 font-bold text-gray-700">{intern.internNumber}</td>
                      <td className="p-4 font-medium text-gray-800">{intern.fullName}</td>
                      <td className="p-4 text-gray-600">{intern.specialization}</td>
                      <td className="p-4 text-center">
                        <Link to={`/interns/view/${intern.id}`} className="btn bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs py-1 px-3">Review</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center p-8 text-gray-500 italic">No pending interns at the moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Projects Overview */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Active Department Projects</h3>
            <Link to="/gm-projects" className="text-indigo-600 font-bold hover:underline text-sm">View All Projects &rarr;</Link>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse bg-white/50">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Code</th>
                  <th className="p-4 font-semibold">Project Name</th>
                  <th className="p-4 font-semibold">Assigned Interns</th>
                  <th className="p-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.activeProjects && data.activeProjects.length > 0 ? (
                  data.activeProjects.map(proj => (
                    <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-700">{proj.projectCode}</td>
                      <td className="p-4 font-medium text-gray-800">{proj.projectName}</td>
                      <td className="p-4 text-gray-600">{proj.assignedInternIds ? proj.assignedInternIds.length : 0}</td>
                      <td className="p-4 text-center">
                        <Link to={`/projects/view/${proj.id}`} className="btn bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs py-1 px-3">Manage</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center p-8 text-gray-500 italic">No active projects at the moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default ProxyDashboard;
