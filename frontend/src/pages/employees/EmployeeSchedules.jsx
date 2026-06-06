import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EmployeeSchedules = () => {
  const { user } = useContext(AuthContext);
  const [initialSchedules, setInitialSchedules] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const activeId = user?.id;

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const start = new Date(today);
    start.setDate(today.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentWeekStart]);

  const formatYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const start = new Date(today);
    start.setDate(today.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    setCurrentWeekStart(start);
  };

  useEffect(() => {
    if (activeId) {
      setLoading(true);
      // Mongo "Between" is exclusive, so we subtract 1 day from start and add 1 day to end
      const queryStart = new Date(weekDates[0]);
      queryStart.setDate(queryStart.getDate() - 1);
      const queryEnd = new Date(weekDates[6]);
      queryEnd.setDate(queryEnd.getDate() + 1);

      const startStr = formatYMD(queryStart);
      const endStr = formatYMD(queryEnd);
      
      api.get(`/employee-schedules/me?employeeId=${activeId}&startDate=${startStr}&endDate=${endStr}`)
        .then(res => {
          const data = res.data || [];
          setInitialSchedules(data);
          setSchedules(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load schedules", err);
          setLoading(false);
        });
    }
  }, [activeId, currentWeekStart]);

  const handleSetSchedule = (dateStr, status) => {
    if (!activeId) return;
    
    setSchedules(prev => {
      const existing = prev.find(s => s.date === dateStr);
      if (existing && existing.status === status) {
        return prev.filter(s => s.date !== dateStr);
      }
      const filtered = prev.filter(s => s.date !== dateStr);
      const newSchedule = existing ? { ...existing, status } : { employeeId: activeId, date: dateStr, status };
      return [...filtered, newSchedule];
    });
  };

  const handleSaveWeeklyReport = async () => {
    setSaving(true);
    try {
      for (const initSched of initialSchedules) {
        // Only delete if it belongs to the CURRENT visible week and is no longer selected
        const belongsToCurrentWeek = weekDates.some(d => formatYMD(d) === initSched.date);
        if (belongsToCurrentWeek) {
            const stillExists = schedules.find(s => s.date === initSched.date);
            if (!stillExists && initSched.id) {
              await api.delete(`/employee-schedules/${initSched.id}`);
            }
        }
      }

      const updatedData = [];
      for (const sched of schedules) {
        // We only post schedules that belong to the current week
        const belongsToCurrentWeek = weekDates.some(d => formatYMD(d) === sched.date);
        if (belongsToCurrentWeek) {
            const res = await api.post('/employee-schedules', { employeeId: activeId, date: sched.date, status: sched.status });
            updatedData.push(res.data);
        } else {
            updatedData.push(sched);
        }
      }

      setInitialSchedules(updatedData);
      setSchedules(updatedData);
      alert("Weekly schedule saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text(`Weekly Schedule Report`, 14, 22);
      
      doc.setFontSize(14);
      doc.setTextColor(71, 85, 105);
      doc.text(`Employee: ${user?.username || 'N/A'}`, 14, 32);
      doc.text(`Week: ${weekDates[0].toLocaleDateString()} to ${weekDates[6].toLocaleDateString()}`, 14, 40);

      const tableColumn = ["Day", "Date", "Status"];
      const tableRows = [];

      weekDates.forEach(dateObj => {
        const dStr = formatYMD(dateObj);
        const schedule = schedules.find(s => s.date === dStr);
        const status = schedule ? schedule.status : 'NOT SET';
        
        const scheduleData = [
          dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
          dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status
        ];
        tableRows.push(scheduleData);
      });

      doc.autoTable({
        startY: 50,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 11, cellPadding: 6 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      const report = { OFFICE: 0, WFH: 0, LEAVE: 0 };
      weekDates.forEach(dateObj => {
        const dStr = formatYMD(dateObj);
        const schedule = schedules.find(s => s.date === dStr);
        if (schedule && schedule.status) {
          report[schedule.status]++;
        }
      });

      const finalY = doc.lastAutoTable.finalY || 50;
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("Weekly Summary", 14, finalY + 15);

      const summaryCols = ["Category", "Total Days"];
      const summaryRows = [
        ["Office Days", report.OFFICE],
        ["WFH Days", report.WFH],
        ["Leave Days", report.LEAVE]
      ];

      doc.autoTable({
        startY: finalY + 22,
        head: [summaryCols],
        body: summaryRows,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] }, // Slate-700
        styles: { fontSize: 11, cellPadding: 6, halign: 'center' },
        columnStyles: { 0: { halign: 'left' } }
      });

      doc.save(`weekly_schedule_${formatYMD(weekDates[0])}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF.");
    } finally {
      setExporting(false);
    }
  };

  const report = { OFFICE: 0, WFH: 0, LEAVE: 0 };
  weekDates.forEach(dateObj => {
    const dStr = formatYMD(dateObj);
    const schedule = schedules.find(s => s.date === dStr);
    if (schedule && schedule.status) {
      report[schedule.status]++;
    }
  });

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-blue-300 w-[40rem] h-[40rem] top-[-10%] right-[-10%]" style={{ animationDelay: '0s', animationDuration: '15s' }}></div>
      </div>

      <div className="animate-fade-in space-y-8 max-w-4xl mx-auto mt-8 pb-20">
        <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight mb-8">My Working Days</h2>
        
        <div className="glass-card animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Weekly Schedule
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
                <button onClick={goToPreviousWeek} disabled={loading || saving} className="p-2 text-gray-600 hover:bg-white rounded hover:shadow-sm transition-all" title="Previous Week">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <button onClick={goToCurrentWeek} disabled={loading || saving} className="px-3 py-1 text-sm font-bold text-gray-700 hover:bg-white rounded hover:shadow-sm transition-all">
                  Today
                </button>
                <button onClick={goToNextWeek} disabled={loading || saving} className="p-2 text-gray-600 hover:bg-white rounded hover:shadow-sm transition-all" title="Next Week">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
              </div>

              <button 
                onClick={handleExportPDF}
                disabled={loading || exporting}
                className="flex items-center gap-2 text-sm font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div></div>
          ) : (
            <div className="space-y-4">
              {weekDates.map((dateObj, idx) => {
                const dStr = formatYMD(dateObj);
                const schedule = schedules.find(s => s.date === dStr);
                const currentStatus = schedule ? schedule.status : null;
                
                return (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm gap-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <div className={`h-12 w-12 rounded-xl flex flex-col items-center justify-center font-bold shadow-inner ${
                        dateObj.toDateString() === new Date().toDateString() ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <span className="text-xs uppercase">{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-lg leading-tight">{dateObj.getDate()}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-lg">{dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        {dateObj.toDateString() === new Date().toDateString() && (
                          <span className="ml-3 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded shadow-sm">TODAY</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleSetSchedule(dStr, 'OFFICE')}
                        className={`flex-1 sm:flex-none text-sm font-bold px-6 py-2.5 rounded-xl transition-all border ${currentStatus === 'OFFICE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Office
                      </button>
                      <button 
                        onClick={() => handleSetSchedule(dStr, 'WFH')}
                        className={`flex-1 sm:flex-none text-sm font-bold px-6 py-2.5 rounded-xl transition-all border ${currentStatus === 'WFH' ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                      >
                        WFH
                      </button>
                      <button 
                        onClick={() => handleSetSchedule(dStr, 'LEAVE')}
                        className={`flex-1 sm:flex-none text-sm font-bold px-6 py-2.5 rounded-xl transition-all border ${currentStatus === 'LEAVE' ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveWeeklyReport}
                  disabled={loading || saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save Weekly Schedule
                    </>
                  )}
                </button>
              </div>

              {/* Weekly Report Section */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Weekly Report Summary
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-emerald-600 uppercase mb-1">Office Days</p>
                    <p className="text-3xl font-extrabold text-emerald-800">{report.OFFICE}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-blue-600 uppercase mb-1">WFH Days</p>
                    <p className="text-3xl font-extrabold text-blue-800">{report.WFH}</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                    <p className="text-sm font-bold text-red-600 uppercase mb-1">Leave Days</p>
                    <p className="text-3xl font-extrabold text-red-800">{report.LEAVE}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeSchedules;
