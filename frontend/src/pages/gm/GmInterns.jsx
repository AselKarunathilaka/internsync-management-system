import React, { useState, useEffect } from 'react';
import api from '../../api';

const GmInterns = () => {
  const [interns, setInterns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState('ALL'); // 'PENDING', 'ASSIGNED', 'ALL'

  // Filters
  const [search, setSearch] = useState('');
  const [stipendFilter, setStipendFilter] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/gm/department-interns'),
      api.get('/gm/department-projects')
    ]).then(([internsRes, projectsRes]) => {
      setInterns(internsRes.data);
      setProjects(projectsRes.data); // Keep ALL projects for display/lookup
      setLoading(false);
    }).catch(err => {
      setError(err.response?.data?.error || 'Failed to fetch data.');
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStipend = async (internId, stipendType) => {
    try {
      await api.put(`/gm/interns/${internId}/stipend-type`, { stipendType });
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update stipend.');
    }
  };

  const openManageProjectsModal = (intern) => {
    setSelectedIntern(intern);
    setSelectedProjectIds(intern.assignedProjectIds || []);
    setIsModalOpen(true);
  };

  const closeManageProjectsModal = () => {
    setSelectedIntern(null);
    setSelectedProjectIds([]);
    setIsModalOpen(false);
  };

  const handleToggleProject = (projectId) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSaveProjects = async () => {
    if (!selectedIntern) return;
    setIsSaving(true);
    
    try {
      const originalProjectIds = selectedIntern.assignedProjectIds || [];
      const projectsToAdd = selectedProjectIds.filter(id => !originalProjectIds.includes(id));
      const projectsToRemove = originalProjectIds.filter(id => !selectedProjectIds.includes(id));

      // Execute additions
      for (const pId of projectsToAdd) {
        await api.post(`/gm/projects/${pId}/assign-interns`, { internId: selectedIntern.id });
      }

      // Execute removals
      for (const pId of projectsToRemove) {
        await api.delete(`/gm/projects/${pId}/remove-intern/${selectedIntern.id}`);
      }

      fetchData();
      closeManageProjectsModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update project assignments.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (error) return <div className="text-center p-8 text-red-600 font-bold bg-white/40 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">{error}</div>;

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.fullName.toLowerCase().includes(search.toLowerCase()) || intern.internNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStipend = stipendFilter ? intern.stipendType === stipendFilter : true;
    
    let matchesTab = true;
    if (activeTab === 'PENDING') {
      matchesTab = intern.assignmentStatus === 'PENDING_MANAGER_REVIEW';
    } else if (activeTab === 'ASSIGNED') {
      matchesTab = intern.assignmentStatus === 'ASSIGNED_TO_PROJECT' || intern.assignmentStatus === 'ON_HOLD';
    }
    
    return matchesSearch && matchesStipend && matchesTab;
  });

  return (
    <>
      <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Department Interns</h2>
            <p className="text-gray-500 mt-2">Manage stipend types and project assignments for interns in your department.</p>
          </div>
        </div>

        <div className="glass-card animate-slide-up pb-2">
          {/* Tabs */}
          <div className="flex space-x-1 p-1 bg-gray-100/50 rounded-xl mb-6 w-full md:w-max">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`flex-1 md:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'PENDING' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setActiveTab('ASSIGNED')}
              className={`flex-1 md:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'ASSIGNED' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 md:px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'ALL' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              All Interns
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                className="form-input pl-10" 
                placeholder="Search by ID or Name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="form-input md:w-64 cursor-pointer"
              value={stipendFilter} 
              onChange={(e) => setStipendFilter(e.target.value)}
            >
              <option value="">All Stipends</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="NON_PAID">NON_PAID</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse bg-white/50">
              <thead>
                <tr className="bg-indigo-50/80 text-indigo-800 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Intern</th>
                  <th className="p-4 font-semibold">Specialization</th>
                  <th className="p-4 font-semibold">Stipend Status</th>
                  <th className="p-4 font-semibold">Assignment</th>
                  <th className="p-4 font-semibold">Projects</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInterns.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">No interns found.</td></tr>
                ) : (
                  filteredInterns.map((intern, idx) => (
                    <tr key={intern.id} className="hover:bg-indigo-50/30 transition-colors" style={{ animationDelay: `${idx * 50}ms` }}>
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{intern.fullName}</p>
                        <p className="text-xs font-bold text-gray-500">{intern.internNumber}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                          {intern.specialization || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          className={`form-input text-xs py-1 font-bold shadow-sm border ${
                            intern.stipendType === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 
                            intern.stipendType === 'NON_PAID' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                          value={intern.stipendType || 'PENDING'}
                          onChange={(e) => handleUpdateStipend(intern.id, e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="NON_PAID">NON_PAID</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                          intern.assignmentStatus === 'ASSIGNED_TO_PROJECT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {intern.assignmentStatus ? intern.assignmentStatus.replace(/_/g, ' ') : 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {intern.assignedProjectIds && intern.assignedProjectIds.length > 0 ? (
                            intern.assignedProjectIds.map(pid => {
                              const p = projects.find(proj => proj.id === pid);
                              return p ? (
                                <span key={pid} className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold" title={p.projectName}>
                                  {p.projectCode}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-xs text-gray-400 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          className="btn bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 text-xs shadow-md"
                          onClick={() => openManageProjectsModal(intern)}
                        >
                          Manage Projects
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manage Projects Modal */}
      {isModalOpen && selectedIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="bg-indigo-600 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Manage Projects</h3>
              <button onClick={closeManageProjectsModal} className="text-indigo-200 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Intern</p>
                <p className="text-lg font-extrabold text-slate-800">{selectedIntern.fullName}</p>
                <p className="text-sm text-gray-600">{selectedIntern.specialization} • {selectedIntern.internNumber}</p>
              </div>

              <p className="text-sm font-bold text-slate-700 mb-3">Select Active Projects</p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {projects.filter(p => p.status !== 'COMPLETED').length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No assignable department projects available.</p>
                ) : (
                  projects.filter(p => p.status !== 'COMPLETED').map(proj => (
                    <label key={proj.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        checked={selectedProjectIds.includes(proj.id)}
                        onChange={() => handleToggleProject(proj.id)}
                      />
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{proj.projectName}</p>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">{proj.projectCode}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={closeManageProjectsModal} 
                className="btn btn-outline text-gray-600 border-gray-300 hover:bg-gray-100"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProjects} 
                className="btn bg-indigo-600 hover:bg-indigo-700 text-white shadow-md flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div> Saving...</>
                ) : 'Save Assignments'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GmInterns;
