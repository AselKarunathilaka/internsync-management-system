import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api';

const EmployeeTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // We will use user.id to guarantee tasks save even if no employee profile is formally linked
  const activeId = user?.id;

  useEffect(() => {
    if (activeId) {
      api.get(`/employee-tasks/me?employeeId=${activeId}`)
        .then(res => {
          setTasks(res.data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load tasks", err);
          setLoading(false);
        });
    }
  }, [activeId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeId || isAdding) return;
    
    setIsAdding(true);
    try {
      const res = await api.post('/employee-tasks', { employeeId: activeId, title: newTaskTitle, completed: false });
      setTasks([res.data, ...tasks]);
      setNewTaskTitle('');
    } catch (err) {
      console.error(err);
      alert("Failed to add task. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const res = await api.put(`/employee-tasks/${task.id}`, { ...task, completed: !task.completed });
      setTasks(tasks.map(t => t.id === task.id ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/employee-tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="blob bg-blue-300 w-[40rem] h-[40rem] top-[-10%] left-[-20%]" style={{ animationDelay: '0s', animationDuration: '18s' }}></div>
      </div>

      <div className="animate-fade-in space-y-8 max-w-4xl mx-auto mt-8 pb-20">
        <h2 className="text-4xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight mb-8">My Task Checklist</h2>
        
        <div className="glass-card animate-slide-up" style={{ animationDelay: '50ms' }}>
          <form onSubmit={handleAddTask} className="mb-8 flex gap-3">
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done? Add a new task..."
              className="form-input w-full text-lg py-3 px-4 shadow-sm"
            />
            <button 
              type="submit" 
              disabled={isAdding}
              className={`font-bold py-3 px-6 rounded-xl shadow-md transition-colors whitespace-nowrap text-lg ${
                isAdding ? 'bg-indigo-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isAdding ? 'Adding...' : 'Add Task'}
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div></div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.length === 0 ? (
                <div className="text-center p-12 bg-gray-50/50 rounded-xl border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-lg text-gray-500 italic">Your checklist is clear! Awesome job.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="flex justify-between items-center group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <label className="flex items-center gap-4 cursor-pointer flex-1 min-w-0 pr-4">
                      <input 
                        type="checkbox" 
                        checked={task.completed}
                        onChange={() => handleToggleTask(task)}
                        className="form-checkbox h-6 w-6 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`text-lg font-bold truncate transition-colors ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </span>
                    </label>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50"
                      title="Delete task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeTasks;
