import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../api';

const SPECIALIZATIONS = [
  "AI", "BA", "C#", "CICD", "Cloud", "Flutter", 
  "FullStack", "JAVA", "MERN", "PHP", "PM", "Other"
];

const InternList = () => {
  const [interns, setInterns] = useState([]);
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [stipendFilter, setStipendFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchInterns = () => {
    setLoading(true);
    api.get('/interns')
      .then(res => {
        setInterns(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching interns", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this intern?')) {
      api.delete(`/interns/${id}`)
        .then(() => fetchInterns())
        .catch(err => console.error("Error deleting intern", err));
    }
  };

  const filteredInterns = interns.filter(intern => {
    const term = search.toLowerCase();
    const matchesSearch = 
      intern.internNumber.toLowerCase().includes(term) || 
      intern.fullName.toLowerCase().includes(term) ||
      (intern.email && intern.email.toLowerCase().includes(term));
    const matchesSpec = specializationFilter ? intern.specialization === specializationFilter : true;
    const matchesDept = departmentFilter ? intern.department === departmentFilter : true;
    const matchesStipend = stipendFilter ? intern.stipendType === stipendFilter : true;
    const matchesAssignment = assignmentFilter ? intern.assignmentStatus === assignmentFilter : true;
    return matchesSearch && matchesSpec && matchesDept && matchesStipend && matchesAssignment;
  });

  const getDepartmentStyle = (dept) => {
    switch(dept) {
      case 'Digital Platforms': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Digital Labs': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Human Capital': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text('Intern Directory Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Specialization Filter: ${specializationFilter || 'All'}  |  Search Query: ${search || 'None'}`, 14, 32);
    doc.text(`Total Records Found: ${filteredInterns.length}`, 14, 38);

    const tableColumn = ["Intern #", "Name", "Email", "Spec.", "Dept", "University", "Status", "Stipend", "Assignment"];
    const tableRows = [];

    filteredInterns.forEach(intern => {
      tableRows.push([
        intern.internNumber,
        intern.fullName,
        intern.email || 'N/A',
        intern.specialization || 'N/A',
        intern.department || 'N/A',
        intern.university || 'N/A',
        intern.status,
        intern.stipendType || 'PENDING',
        intern.assignmentStatus || 'PENDING_MANAGER_REVIEW'
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    doc.save(`intern_directory_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-teal-300 w-[40rem] h-[40rem] top-[-20%] right-[-10%]" style={{ animationDelay: '1s', animationDuration: '14s' }}></div>
        <div className="blob bg-blue-400 w-96 h-96 bottom-[10%] left-[-10%]" style={{ animationDelay: '3s', animationDuration: '16s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">Intern Directory</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="btn btn-outline flex-1 sm:flex-none shadow-lg" onClick={handleExportPDF}>
              Export PDF
            </button>
            <Link to="/interns/add" className="btn btn-success flex-1 sm:flex-none shadow-lg">
              + Add New Intern
            </Link>
          </div>
        </div>

        <div className="glass-card animate-slide-up">
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
                placeholder="Search by ID, Name, or Email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="form-input md:w-48 cursor-pointer"
                value={specializationFilter} 
                onChange={(e) => setSpecializationFilter(e.target.value)}
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <select 
                className="form-input md:w-48 cursor-pointer"
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="Digital Platforms">Digital Platforms</option>
                <option value="Digital Labs">Digital Labs</option>
                <option value="Human Capital">Human Capital</option>
              </select>
              <select 
                className="form-input md:w-40 cursor-pointer"
                value={stipendFilter} 
                onChange={(e) => setStipendFilter(e.target.value)}
              >
                <option value="">All Stipends</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="NON_PAID">NON_PAID</option>
              </select>
              <select 
                className="form-input md:w-56 cursor-pointer"
                value={assignmentFilter} 
                onChange={(e) => setAssignmentFilter(e.target.value)}
              >
                <option value="">All Assignments</option>
                <option value="PENDING_MANAGER_REVIEW">PENDING_MANAGER_REVIEW</option>
                <option value="ASSIGNED_TO_PROJECT">ASSIGNED_TO_PROJECT</option>
                <option value="ON_HOLD">ON_HOLD</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>)}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse bg-white/50">
                <thead>
                  <tr className="bg-gray-100/80 text-gray-600 text-xs uppercase tracking-wider">
                    <th className="p-3 font-semibold w-12">#</th>
                    <th className="p-3 font-semibold">Name & Email</th>
                    <th className="p-3 font-semibold">Dept & Spec</th>
                    <th className="p-3 font-semibold">Status/Stipend</th>
                    <th className="p-3 font-semibold">Assignment</th>
                    <th className="p-3 font-semibold text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInterns.length === 0 ? (
                    <tr><td colSpan="6" className="text-center p-8 text-gray-500 italic">No interns found matching your criteria.</td></tr>
                  ) : (
                    filteredInterns.map((intern, idx) => (
                      <tr key={intern.id} className="hover:bg-indigo-50/50 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                        <td className="p-4 font-bold text-gray-800 text-base">{intern.internNumber}</td>
                        <td className="p-4">
                          <p className="font-bold text-gray-800 text-base">{intern.fullName}</p>
                          <p className="text-sm text-gray-500">{intern.email || 'N/A'}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-indigo-700">{intern.department || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{intern.specialization || 'N/A'}</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            intern.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {intern.status}
                          </span>
                          <span className="inline-block ml-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
                            {intern.stipendType || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-600">
                          {intern.assignmentStatus ? intern.assignmentStatus.replace(/_/g, ' ') : 'PENDING'}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Link to={`/interns/edit/${intern.id}`} className="bg-indigo-100 text-primary hover:bg-indigo-200 p-2 rounded-lg transition-colors" title="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </Link>
                            <button onClick={() => handleDelete(intern.id)} className="bg-red-100 text-danger hover:bg-red-200 p-2 rounded-lg transition-colors" title="Delete">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InternList;
