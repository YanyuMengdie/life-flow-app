import { useState } from 'react';
import { useTasks } from '../stores/useStore';
import type { Task } from '../types';

export function TasksPage() {
  const { tasks, incompleteTasks, completedTasks, addTask, toggleComplete, deleteTask } = useTasks();
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    estimatedMinutes: 30,
    deadline: '',
    priority: 'medium' as Task['priority'],
  });

  const handleAdd = () => {
    if (!newTask.title.trim()) return;
    addTask({
      title: newTask.title,
      estimatedMinutes: newTask.estimatedMinutes,
      deadline: newTask.deadline || undefined,
      priority: newTask.priority,
    });
    setNewTask({ title: '', estimatedMinutes: 30, deadline: '', priority: 'medium' });
    setShowAdd(false);
  };

  const progress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const priorityStyles = {
    low: 'bg-[#E6E6FA] text-[#818cf8]',
    medium: 'bg-[#FDE2E4] text-[#f0426e]',
    high: 'bg-[#f0426e]/10 text-[#f0426e]',
  };

  const formatMinutes = (min: number) => {
    if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60 > 0 ? `${min % 60}m` : ''}`;
    return `${min}m`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f0426e] text-2xl">pets</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Today's Plan</h1>
            <p className="text-xs text-[#89616b] font-medium opacity-80 uppercase tracking-widest">
              {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <button className="bg-white/50 p-2 rounded-full border border-[#F5F2E8] text-[#89616b]">
          <span className="material-symbols-outlined">calendar_today</span>
        </button>
      </header>

      {/* Progress Card */}
      <section className="px-6 py-4">
        <div className="bg-white rounded-xl p-5 border border-[#F5F2E8]/50 soft-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Daily Progress</p>
              <span className="text-[10px] text-[#f0426e]/60 animate-pulse">❤</span>
            </div>
            <p className="text-xs font-medium text-[#89616b]">
              {completedTasks.length}/{tasks.length} tasks completed
            </p>
          </div>
          <div className="w-full h-2.5 bg-[#F5F2E8] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#f0426e] rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] text-[#89616b] font-medium italic">
            You're doing great! Keep going ♡
          </p>
        </div>
      </section>

      {/* Task List Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#181113]/70 uppercase tracking-wider">Priority Tasks</h2>
        <span className="material-symbols-outlined text-[#f0426e]/40 text-sm">favorite</span>
      </div>

      {/* Task List */}
      <main className="flex flex-col gap-3 px-6">
        {incompleteTasks.map(task => (
          <div key={task.id} className="bg-white rounded-xl border border-[#F5F2E8]/30 p-4 flex items-center justify-between soft-shadow">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleComplete(task.id)}
                className="h-6 w-6 rounded-lg border-2 border-[#f0426e]/20 bg-transparent flex items-center justify-center"
              />
              <div>
                <p className="text-base font-medium leading-tight">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#89616b] font-medium flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {formatMinutes(task.estimatedMinutes)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full ${priorityStyles[task.priority]}`}>
                <span className="text-[10px] font-bold uppercase">
                  {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                </span>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-[#89616b]/50 hover:text-[#f0426e]">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        ))}

        {/* Completed Tasks */}
        {completedTasks.map(task => (
          <div key={task.id} className="bg-white/50 rounded-xl border border-[#F5F2E8]/30 p-4 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleComplete(task.id)}
                className="h-6 w-6 rounded-lg bg-[#f0426e] flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-white text-sm">check</span>
              </button>
              <p className="text-base font-medium leading-tight line-through text-[#89616b]">{task.title}</p>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {tasks.length === 0 && !showAdd && (
          <div className="mt-8 flex flex-col items-center justify-center py-10 opacity-60">
            <div className="w-32 h-32 mb-4 bg-[#f0426e]/5 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM316xeLC23ZJ6QZj1spZpHVrt2WtKzhQR8ogyEFlrSIP2pS4Tv95zou6u4g1npi768hi3i1MVUE5QenFpquQK-f3FnX3vu5TCWvZbC4nqaqlFmh2YKLpQQSAd_0MPxTK3EVaC8_0EMmYAzOkPe2ROWwTJQEVVt6jNeUEA9UYRaFlBlbYmofzRjcQn6belQ7H1QvNZESOau-vDrj-My7G9otNsaz3ynOk4sdVbCfcIucQ8IN2LSJS4g8smwm9KwR7ilORaqAaBl7I"
                alt="Cute sleeping cat"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm font-medium text-[#89616b]">No tasks yet!</p>
            <p className="text-xs text-[#89616b]/60">Add your first task to get started</p>
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add New Task ✨</h3>
            <input
              type="text"
              placeholder="What do you need to do?"
              value={newTask.title}
              onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="w-full text-lg p-3 border border-[#F5F2E8] rounded-xl mb-3 focus:outline-none focus:border-[#f0426e]"
              autoFocus
            />
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-[#89616b] block mb-1">Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newTask.estimatedMinutes}
                    onChange={e => setNewTask(prev => ({ ...prev, estimatedMinutes: Number(e.target.value) }))}
                    className="w-full p-2 border border-[#F5F2E8] rounded-lg text-sm"
                    min="5"
                    step="5"
                  />
                  <span className="text-sm text-[#89616b]">min</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#89616b] block mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                  className="w-full p-2 border border-[#F5F2E8] rounded-lg text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 text-[#89616b] hover:bg-[#F5F2E8] rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-3 bg-[#f0426e] text-white rounded-xl font-bold shadow-lg shadow-[#f0426e]/30"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <button 
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-6 bg-[#f0426e] text-white w-14 h-14 rounded-xl shadow-lg shadow-[#f0426e]/30 flex items-center justify-center transition-transform active:scale-90 z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Decorative Elements */}
      <div className="fixed top-20 right-4 pointer-events-none opacity-10">
        <span className="material-symbols-outlined text-[#f0426e] text-4xl">favorite</span>
      </div>
      <div className="fixed bottom-40 left-4 pointer-events-none opacity-10">
        <span className="material-symbols-outlined text-[#f0426e] text-2xl">pets</span>
      </div>
    </div>
  );
}
