import React, { useState, useEffect, useCallback } from 'react';
import {
    getProxyAssignments, getProxyConfig, assignProxy,
    disableProxy, enableProxy, removeProxy, getProxyLogs, getMyProxyAccess
} from '../../features/proxy/api/proxyApi';
import api from '../../api';

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

const isExpired = (expiresAt) => {
    const d = parseDate(expiresAt);
    return d && d < new Date();
};

const hasStarted = (startDate) => {
    const d = parseDate(startDate);
    return !d || d <= new Date();
};

const timeRemaining = (expiresAt) => {
    const d = parseDate(expiresAt);
    if (!d) return null;
    const now = new Date();
    const diffMs = d - now;
    if (diffMs <= 0) return 'Expired';
    const days = Math.floor(diffMs / 86400000);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    return `${mins}m remaining`;
};

const timeUntilStart = (startDate) => {
    const d = parseDate(startDate);
    if (!d || d <= new Date()) return null;
    const diffMs = d - new Date();
    const days = Math.floor(diffMs / 86400000);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    if (days > 0) return `starts in ${days}d ${hours}h`;
    const mins = Math.floor(diffMs / 60000);
    return `starts in ${mins}m`;
};

const urgencyColor = (expiresAt) => {
    const d = parseDate(expiresAt);
    if (!d) return '';
    const diffMs = d - new Date();
    if (diffMs <= 0) return 'text-red-500';
    if (diffMs < 86400000) return 'text-red-500 animate-pulse'; // < 1 day
    if (diffMs < 3 * 86400000) return 'text-amber-500'; // < 3 days
    return 'text-green-600';
};

const PERM_LABELS = {
    VIEW_DEPARTMENT_INTERNS: 'View Interns',
    VIEW_DEPARTMENT_PROJECTS: 'View Projects',
    UPDATE_INTERN_PAYMENT_STATUS: 'Update Payment',
    ASSIGN_INTERN_TO_PROJECT: 'Assign to Project',
    REMOVE_INTERN_FROM_PROJECT: 'Remove from Project',
};

const PERM_COLORS = {
    VIEW_DEPARTMENT_INTERNS: 'bg-blue-100 text-blue-700',
    VIEW_DEPARTMENT_PROJECTS: 'bg-violet-100 text-violet-700',
    UPDATE_INTERN_PAYMENT_STATUS: 'bg-amber-100 text-amber-700',
    ASSIGN_INTERN_TO_PROJECT: 'bg-green-100 text-green-700',
    REMOVE_INTERN_FROM_PROJECT: 'bg-rose-100 text-rose-700',
};

const pl = (key) => PERM_LABELS[key] || key;
const pc = (key) => PERM_COLORS[key] || 'bg-slate-100 text-slate-600';

const ALL_PERMISSIONS = Object.keys(PERM_LABELS);
const VIEW_ONLY_PERMISSIONS = ['VIEW_DEPARTMENT_INTERNS', 'VIEW_DEPARTMENT_PROJECTS'];

// ─── Proxy Time Notification Banner ──────────────────────────────────────────

const ProxyTimeBanner = ({ myProxyAccess }) => {
    if (!myProxyAccess?.isProxy) return null;
    const exp = parseDate(myProxyAccess.expiresAt);
    const start = parseDate(myProxyAccess.startDate);
    const now = new Date();

    if (exp && exp < now) return null; // already expired, dashboard handles this

    const remaining = exp ? timeRemaining(myProxyAccess.expiresAt) : 'No expiry set';
    const diffMs = exp ? exp - now : null;
    const isUrgent = diffMs && diffMs < 86400000;
    const notYetStarted = start && start > now;

    return (
        <div className={`rounded-2xl p-4 flex items-center gap-4 shadow-sm border ${
            notYetStarted
                ? 'bg-blue-50 border-blue-200'
                : isUrgent
                    ? 'bg-red-50 border-red-200 animate-pulse'
                    : 'bg-amber-50 border-amber-200'
        }`}>
            <div className={`text-2xl ${notYetStarted ? '' : isUrgent ? 'animate-bounce' : ''}`}>
                {notYetStarted ? '🕐' : isUrgent ? '⚠️' : '🔑'}
            </div>
            <div className="flex-1">
                <p className={`font-bold text-sm ${
                    notYetStarted ? 'text-blue-700' : isUrgent ? 'text-red-700' : 'text-amber-800'
                }`}>
                    {notYetStarted
                        ? `Your proxy access ${timeUntilStart(myProxyAccess.startDate)}`
                        : isUrgent
                            ? `⚠ Proxy access expiring soon — ${remaining}`
                            : `Your proxy access is active — ${remaining}`
                    }
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                    Scope: <strong>{myProxyAccess.scopeValue}</strong>
                    {exp && <> · Expires: <strong>{fmt(myProxyAccess.expiresAt)}</strong></>}
                    {' '}· Permissions: {(myProxyAccess.permissions || []).map(pl).join(', ')}
                </p>
            </div>
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ assignment }) => {
    const expired = isExpired(assignment.expiresAt);
    const started = hasStarted(assignment.startDate);

    if (!assignment.active)
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Disabled</span>;
    if (expired)
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">Expired</span>;
    if (!started)
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Pending</span>;
    return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProxyManagement = () => {
    const [assignments, setAssignments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [config, setConfig] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [myDepartment, setMyDepartment] = useState(null);
    const [myProxyAccess, setMyProxyAccess] = useState(null);
    const [activeTab, setActiveTab] = useState('assign');
    const [confirmRemove, setConfirmRemove] = useState(null); // id to confirm

    const [form, setForm] = useState({
        proxyUserId: '',
        scopeType: 'DEPARTMENT',
        scopeValue: '',
        proxyRole: 'GM_DGM_DEPARTMENT_PROXY',
        permissions: [],
        startDate: '',
        expiresAt: '',
    });

    const applyPreset = (preset) => {
        setForm(f => ({
            ...f,
            permissions: preset === 'full' ? [...ALL_PERMISSIONS] : [...VIEW_ONLY_PERMISSIONS]
        }));
    };

    const handlePermissionToggle = (perm) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    // ── Refresh helpers ───────────────────────────────────────────────────────
    const refreshAll = useCallback(async (dept) => {
        let assRes = await getProxyAssignments();
        if (dept) assRes = assRes.filter(a => a.scopeValue === dept);
        setAssignments(assRes);

        try {
            const logsRes = await getProxyLogs(dept || undefined);
            setLogs(logsRes);
        } catch (_) {
            setLogs([]);
        }
    }, []);

    // ── Initial data load ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                const conf = await getProxyConfig();
                setConfig(conf);

                // Check if current user has proxy access
                try {
                    const proxyAccess = await getMyProxyAccess();
                    setMyProxyAccess(proxyAccess);
                } catch (_) {}

                const empRes = await api.get('/employees');
                let allEmployees = empRes.data;

                let scopeDept = null;
                try {
                    const myProfileRes = await api.get('/employees/me');
                    const myProfile = myProfileRes.data;
                    const isGmOrDgm =
                        myProfile?.designation === 'General Manager' ||
                        myProfile?.designation === 'Deputy General Manager';

                    if (isGmOrDgm && myProfile?.department) {
                        scopeDept = myProfile.department;
                        setMyDepartment(scopeDept);
                        allEmployees = allEmployees.filter(e => e.department === scopeDept);
                        setForm(prev => ({ ...prev, scopeValue: scopeDept }));
                    }
                } catch (_) {
                    // Admin — see all employees
                }

                setEmployees(allEmployees.filter(e => e.userId));
                await refreshAll(scopeDept);
                setLoading(false);
            } catch (err) {
                setError('Failed to load proxy management data: ' + (err.response?.data?.message || err.message));
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshAll]);

    // ── Form submit ───────────────────────────────────────────────────────────
    const handleAssign = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!form.proxyUserId) { setError('Please select an employee.'); return; }
        if (form.permissions.length === 0) { setError('Please select at least one permission.'); return; }
        if (!form.startDate || !form.expiresAt) { setError('Please set both a start date and an end date.'); return; }
        if (new Date(form.startDate) >= new Date(form.expiresAt)) { setError('End date must be after start date.'); return; }

        try {
            await assignProxy({
                proxyUserId: form.proxyUserId,
                scopeType: form.scopeType,
                scopeValue: form.scopeValue,
                proxyRole: form.proxyRole,
                permissions: form.permissions,
                startDate: form.startDate,
                expiresAt: form.expiresAt,
            });
            setSuccessMsg('Proxy assigned successfully.');
            setForm(prev => ({ ...prev, proxyUserId: '', permissions: [], startDate: '', expiresAt: '' }));
            await refreshAll(myDepartment);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign proxy.');
        }
    };

    const handleDisable = async (id) => {
        try {
            await disableProxy(id, 'Disabled by manager');
            await refreshAll(myDepartment);
        } catch (_) { setError('Failed to disable proxy.'); }
    };

    const handleEnable = async (id) => {
        try {
            await enableProxy(id, 'Re-enabled by manager');
            await refreshAll(myDepartment);
        } catch (_) { setError('Failed to enable proxy.'); }
    };

    const handleRemove = async (id) => {
        try {
            await removeProxy(id, 'Removed by manager');
            setConfirmRemove(null);
            setSuccessMsg('Proxy assignment removed.');
            await refreshAll(myDepartment);
        } catch (_) { setError('Failed to remove proxy.'); }
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-500 text-sm font-medium">Loading proxy management…</span>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800">Proxy Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Control and monitor delegated access within your department</p>
                </div>
                {myDepartment && (
                    <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold border border-indigo-200">
                        🏢 {myDepartment}
                    </span>
                )}
            </div>

            {/* ── Proxy Time Notification (if current user is a proxy) ─── */}
            {myProxyAccess && <ProxyTimeBanner myProxyAccess={myProxyAccess} />}

            {/* ── Alerts ────────────────────────────────────────────────── */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                    <span className="text-xl mt-0.5">⚠</span>
                    <div><p className="font-semibold text-sm">{error}</p></div>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700 text-lg">✕</button>
                </div>
            )}
            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-start gap-3">
                    <span className="text-xl mt-0.5">✓</span>
                    <p className="font-semibold text-sm">{successMsg}</p>
                    <button onClick={() => setSuccessMsg(null)} className="ml-auto text-green-400 hover:text-green-700 text-lg">✕</button>
                </div>
            )}

            {/* ── Tab bar ───────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-white/60 backdrop-blur border border-white/80 shadow-sm p-1 rounded-xl w-fit">
                {[
                    { id: 'assign', label: '📋 Assignments', count: assignments.length },
                    { id: 'logs', label: '📜 Activity Logs', count: logs.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                            activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                        }`}
                    >
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                            activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* ═══════════════ ASSIGNMENTS TAB ════════════════════════════ */}
            {activeTab === 'assign' && (
                <>
                    {/* ── Assign New Proxy ─────────────────────────────── */}
                    <div className="glass-card p-6 border border-white/60">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">+</div>
                            <h3 className="text-xl font-bold text-slate-800">Assign New Proxy</h3>
                        </div>

                        <form onSubmit={handleAssign} className="space-y-5">

                            {/* Employee + Scope */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Employee
                                    </label>
                                    <select
                                        id="proxy-employee-select"
                                        className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-shadow"
                                        value={form.proxyUserId}
                                        onChange={e => setForm({ ...form, proxyUserId: e.target.value })}
                                    >
                                        <option value="">— Select Employee —</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.fullName}{emp.employeeNumber ? ` — #${emp.employeeNumber}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {employees.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">No employees with login accounts found.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Department Scope
                                        {myDepartment && <span className="ml-1 text-indigo-400 normal-case font-normal">(locked to your dept)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        className={`block w-full rounded-xl border p-3 text-sm transition-shadow ${
                                            myDepartment
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold cursor-not-allowed'
                                                : 'bg-white border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none'
                                        }`}
                                        value={form.scopeValue}
                                        onChange={e => !myDepartment && setForm({ ...form, scopeValue: e.target.value })}
                                        readOnly={!!myDepartment}
                                        placeholder="e.g. Digital Platforms"
                                    />
                                </div>
                            </div>

                            {/* Validity Window */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg">⏱</span>
                                    <span className="text-sm font-bold text-amber-800">Proxy Validity Window</span>
                                    <span className="text-xs text-amber-600 font-normal">— cannot be changed after assignment</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-amber-700 font-semibold mb-1">Valid From</label>
                                        <input
                                            type="datetime-local"
                                            id="proxy-start-date"
                                            className="block w-full rounded-lg border border-amber-200 bg-white p-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                            value={form.startDate}
                                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-amber-700 font-semibold mb-1">Valid Until</label>
                                        <input
                                            type="datetime-local"
                                            id="proxy-end-date"
                                            className="block w-full rounded-lg border border-amber-200 bg-white p-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                            value={form.expiresAt}
                                            onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Permissions
                                </label>
                                {/* Presets */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('full')}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <span>⚡</span> Full GM/DGM Proxy Ability
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPreset('view')}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                        <span>👁</span> View Only
                                    </button>
                                    {form.permissions.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, permissions: [] }))}
                                            className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            ✕ Clear
                                        </button>
                                    )}
                                </div>
                                {/* Individual checkboxes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {ALL_PERMISSIONS.map(key => (
                                        <label
                                            key={key}
                                            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                                                form.permissions.includes(key)
                                                    ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="accent-indigo-600 w-4 h-4"
                                                checked={form.permissions.includes(key)}
                                                onChange={() => handlePermissionToggle(key)}
                                            />
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc(key)}`}>
                                                {pl(key)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
                            >
                                Assign Proxy
                            </button>
                        </form>
                    </div>

                    {/* ── Current Assignments ──────────────────────────── */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xl font-bold text-slate-800">Current Proxy Assignments</h3>
                            <span className="text-sm text-slate-400 font-medium">{assignments.length} total</span>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-100">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-3 py-3 font-semibold text-slate-600 text-sm">Employee</th>
                                        <th className="px-3 py-3 font-semibold text-slate-600 text-sm">Department</th>
                                        <th className="px-3 py-3 font-semibold text-slate-600 text-sm">Permissions</th>
                                        <th className="px-3 py-3 font-semibold text-slate-600 text-sm">Valid From</th>
                                        <th className="px-3 py-3 font-semibold text-slate-600 text-sm">Valid Until</th>
                                        <th className="px-3 py-3 font-semibold text-slate-600 text-sm">Time Left</th>
                                        <th className="px-3 py-3 font-semibold text-slate-600 text-sm">Status</th>
                                        <th className="px-3 py-3 font-semibold text-slate-600 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {assignments.map(a => {
                                        const expired = isExpired(a.expiresAt);
                                        const remaining = (!expired && a.active) ? timeRemaining(a.expiresAt) : null;

                                        return (
                                            <tr key={a.id} className="hover:bg-slate-50/60 transition-colors group">
                                                <td className="px-3 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0">
                                                            {(a.proxyUserName || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-800 text-sm">{a.proxyUserName}</span>
                                                            {a.proxyUserEmployeeNumber && (
                                                                <span className="text-xs text-slate-500 font-mono">#{a.proxyUserEmployeeNumber}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-slate-600 text-sm">{a.scopeValue}</td>
                                                <td className="px-3 py-4">
                                                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                        {(a.permissions || []).map(perm => (
                                                            <span key={perm} className={`px-2 py-0.5 rounded text-xs font-semibold ${pc(perm)}`}>
                                                                {pl(perm)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-slate-600 text-sm">{fmt(a.startDate)}</td>
                                                <td className="px-3 py-4 text-slate-600 text-sm">{fmt(a.expiresAt)}</td>
                                                <td className="px-3 py-4">
                                                    {remaining && (
                                                        <span className={`text-sm font-bold ${urgencyColor(a.expiresAt)}`}>
                                                            {remaining}
                                                        </span>
                                                    )}
                                                    {!remaining && expired && <span className="text-sm text-slate-400">Expired</span>}
                                                    {!remaining && !expired && !a.active && <span className="text-sm text-slate-400">—</span>}
                                                    {!expired && a.active && !a.expiresAt && <span className="text-sm text-green-600 font-bold">No expiry</span>}
                                                </td>
                                                <td className="px-3 py-4"><StatusBadge assignment={a} /></td>
                                                <td className="px-3 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {a.active && !expired ? (
                                                            <button
                                                                onClick={() => handleDisable(a.id)}
                                                                className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200 transition-colors"
                                                            >
                                                                Disable
                                                            </button>
                                                        ) : !a.active ? (
                                                            <button
                                                                onClick={() => handleEnable(a.id)}
                                                                className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors"
                                                            >
                                                                Enable
                                                            </button>
                                                        ) : null}
                                                        <button
                                                            onClick={() => setConfirmRemove(a.id)}
                                                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {assignments.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-slate-400">
                                                <div className="text-4xl mb-3">📭</div>
                                                <p className="font-medium">No proxy assignments yet</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════ LOGS TAB ═══════════════════════════════════ */}
            {activeTab === 'logs' && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Proxy Activity Logs</h3>
                            <p className="text-sm text-slate-400 mt-0.5">Permanent audit trail — logs are never deleted</p>
                        </div>
                        <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
                            {logs.length} entries
                        </span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {['Timestamp', 'Performed By', 'Action', 'Target', 'Permissions', 'Scope', 'Result'].map(h => (
                                        <th key={h} className="px-3 py-3 font-semibold text-slate-600 text-sm">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-3 py-4 text-sm text-slate-500 font-mono">
                                            {fmt(log.timestamp)}
                                        </td>
                                        <td className="px-3 py-4">
                                            <p className="font-semibold text-slate-800 text-sm">{log.performedByName || '—'}</p>
                                            {log.performedByEmail && (
                                                <p className="text-xs text-slate-400">{log.performedByEmail}</p>
                                            )}
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-bold">
                                                {log.action || '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-slate-700 text-sm">
                                            {log.targetName || log.targetId || '—'}
                                        </td>
                                        <td className="px-3 py-4">
                                            {log.permissionUsed ? (
                                                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                    {log.permissionUsed.split(', ').map(perm => {
                                                        const p = perm.trim();
                                                        return p ? (
                                                            <span key={p} className={`px-2 py-0.5 rounded text-xs font-semibold ${pc(p)}`}>
                                                                {pl(p)}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            ) : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-3 py-4 text-slate-600 text-sm">{log.scopeValue || '—'}</td>
                                        <td className="px-3 py-4">
                                            {log.success
                                                ? <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Success</span>
                                                : <span className="flex items-center gap-1.5 text-red-600 text-sm font-bold"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Failed</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-400">
                                            <div className="text-4xl mb-3">📋</div>
                                            <p className="font-medium">No activity logs yet</p>
                                            <p className="text-sm mt-1">Logs will appear here as proxies perform actions in the system</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══════════════ REMOVE CONFIRM MODAL ══════════════════════ */}
            {confirmRemove && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-fade-in">
                        <div className="text-center">
                            <div className="text-5xl mb-4">🗑</div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">Remove Proxy Assignment?</h4>
                            <p className="text-sm text-slate-500 mb-6">
                                This will permanently remove the proxy assignment. The employee will immediately lose all proxy permissions.
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setConfirmRemove(null)}
                                    className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRemove(confirmRemove)}
                                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow"
                                >
                                    Remove Permanently
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProxyManagement;
