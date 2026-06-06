import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const DailyLogBook = () => {
  const { user } = useContext(AuthContext);
  const activeId = user?.internId || user?.id;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [status, setStatus] = useState('WORKING');
  const [taskStack, setTaskStack] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');

  // Calendar helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Format YYYY-MM
  const getMonthStr = (year, month) => {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  };

  // Format YYYY-MM-DD
  const getDateStr = (dateObj) => {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  };

  const selectedDateStr = getDateStr(selectedDate);
  const selectedLog = logs.find(log => log.date === selectedDateStr);

  const fetchLogs = async (year, month) => {
    if (!activeId) return;
    setLoading(true);
    try {
      const monthStr = getMonthStr(year, month);
      const res = await api.get(`/daily-logs/my-logs?internId=${activeId}&month=${monthStr}`);
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      // Fallback to empty array if backend is not ready
      setLogs([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentYear, currentMonth);
  }, [currentYear, currentMonth, activeId]);

  useEffect(() => {
    if (selectedLog) {
      setStatus(selectedLog.status);
      setTaskStack(selectedLog.taskStack || '');
      setTasksCompleted(selectedLog.tasksCompleted || '');
    } else {
      setStatus('WORKING');
      setTaskStack('');
      setTasksCompleted('');
    }
  }, [selectedLog]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!taskStack || !tasksCompleted) {
      alert("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        internId: activeId,
        date: selectedDateStr,
        status,
        taskStack,
        tasksCompleted
      };
      await api.post('/daily-logs', payload);
      // Refresh current month logs
      fetchLogs(currentYear, currentMonth);
      alert("Log saved successfully!");
    } catch (err) {
      console.error("Failed to save log", err);
      alert("Failed to save log. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Generate calendar grid
  const renderCalendarDays = () => {
    const blanks = Array.from({ length: firstDay }).map((_, i) => (
      <div key={`blank-${i}`} className="p-4 border border-transparent"></div>
    ));

    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const dayNum = i + 1;
      const dateObj = new Date(currentYear, currentMonth, dayNum);
      const dStr = getDateStr(dateObj);
      const hasLog = logs.some(log => log.date === dStr);
      const isSelected = selectedDateStr === dStr;
      const isToday = getDateStr(new Date()) === dStr;

      return (
        <div 
          key={dayNum} 
          onClick={() => setSelectedDate(dateObj)}
          className={`relative p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all ${
            isSelected ? 'bg-indigo-100 border-indigo-200 shadow-inner' : 
            'hover:bg-gray-50 border border-transparent'
          }`}
        >
          <span className={`text-sm font-bold ${
            isToday ? 'text-indigo-600' : 'text-gray-700'
          }`}>{dayNum}</span>
          
          {hasLog && (
            <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-purple-500"></div>
          )}
        </div>
      );
    });

    return [...blanks, ...days];
  };

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-blue-300 w-[40rem] h-[40rem] top-[-10%] right-[-10%]" style={{ animationDelay: '0s', animationDuration: '20s' }}></div>
      </div>

      <div className="animate-fade-in space-y-6 max-w-6xl mx-auto">
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT: Calendar View */}
          <div className="lg:w-7/12 glass-card animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button onClick={handleToday} className="px-4 py-2 font-bold text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100">
                  Today
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
          </div>

          {/* RIGHT: Daily Record Form / View */}
          <div className="lg:w-5/12 glass-card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
              Records for {getDayName(selectedDate)}, {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </h3>

            {selectedLog ? (
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-800">My Record</h4>
                </div>
                
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-white text-blue-600 text-xs font-bold rounded-md shadow-sm border border-blue-100">
                    {selectedLog.status}
                  </span>
                  <span className="px-2 py-1 bg-white text-purple-600 text-xs font-bold rounded-md shadow-sm border border-purple-100">
                    {selectedLog.taskStack}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedLog.tasksCompleted}</p>
                </div>
                <p className="text-xs text-gray-400 font-medium">Logged on: {new Date(selectedLog.updatedAt).toLocaleString()}</p>
                
                {/* Allow editing today's log if needed, or any past log */}
                <button onClick={() => setLogs(logs.filter(l => l.id !== selectedLog.id))} className="text-xs text-indigo-600 hover:underline font-bold mt-2">
                  Edit this record
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveLog} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['WORKING', 'WORK_FROM_HOME', 'ON_LEAVE'].map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="status" 
                          value={s} 
                          checked={status === s} 
                          onChange={(e) => setStatus(e.target.value)}
                          className="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="text-sm font-bold text-gray-700">{s.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {status === 'ON_LEAVE' && (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 text-sm font-medium flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    You are marking yourself on leave for this day. You still need to submit the form.
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    Task Stack <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={taskStack} 
                    onChange={(e) => setTaskStack(e.target.value)}
                    className="form-input w-full bg-white font-medium"
                    required
                  >
                    <option value="" disabled>Select your stack...</option>
                    <option value="Frontend">Frontend Development</option>
                    <option value="Backend">Backend Development</option>
                    <option value="Fullstack">Fullstack Development</option>
                    <option value="DevOps">DevOps / Cloud</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="QA / Testing">QA / Testing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Tasks Completed <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={tasksCompleted}
                    onChange={(e) => setTasksCompleted(e.target.value)}
                    placeholder="What did you accomplish today? Be specific..."
                    className="form-input w-full min-h-[120px] resize-y"
                    required
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                  <h5 className="font-bold text-indigo-900 mb-1">Today's Summary</h5>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-500">Date:</span>
                    <span className="font-bold text-indigo-700">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-500">Status:</span>
                    <span className="font-bold text-emerald-600">{status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full btn bg-indigo-600 text-white hover:bg-indigo-700 shadow-md font-bold py-3 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? 'Submitting...' : 'Submit Daily Log'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyLogBook;
