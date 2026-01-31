import { useState } from 'react';
import { Plus, Clock, Calendar, Check, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useTasks } from '../stores/useStore';
import { Task } from '../types';

export function TasksPage() {
  const { incompleteTasks, completedTasks, addTask, toggleComplete, deleteTask } = useTasks();
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

  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 pb-24">
      <PageHeader 
        title="任务清单" 
        subtitle={`${incompleteTasks.length} 个待完成`}
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      {/* 添加任务表单 */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
          <input
            type="text"
            placeholder="任务名称..."
            value={newTask.title}
            onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-lg font-medium mb-3 p-2 border-b border-gray-200 focus:border-indigo-500 focus:outline-none"
            autoFocus
          />
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">预估时长</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={newTask.estimatedMinutes}
                  onChange={e => setNewTask(prev => ({ ...prev, estimatedMinutes: Number(e.target.value) }))}
                  className="w-full p-2 border rounded-lg text-sm"
                  min="5"
                  step="5"
                />
                <span className="text-sm text-gray-500">分钟</span>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 block mb-1">截止日期</label>
              <input
                type="date"
                value={newTask.deadline}
                onChange={e => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full p-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-500 block mb-1">优先级</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setNewTask(prev => ({ ...prev, priority: p }))}
                  className={`px-3 py-1 rounded-full text-sm ${
                    newTask.priority === p 
                      ? priorityColors[p] + ' ring-2 ring-offset-1 ring-indigo-400'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {p === 'low' ? '低' : p === 'medium' ? '中' : '高'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              添加
            </button>
          </div>
        </div>
      )}

      {/* 待完成任务 */}
      <div className="space-y-3">
        {incompleteTasks.map(task => (
          <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleComplete(task.id)}
                className="mt-1 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-indigo-500 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {task.estimatedMinutes} 分钟
                  </span>
                  {task.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {task.deadline}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority]}`}>
                    {task.priority === 'low' ? '低' : task.priority === 'medium' ? '中' : '高'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {incompleteTasks.length === 0 && !showAdd && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">没有待办任务 ✨</p>
            <p className="text-sm">点击右上角的 + 添加新任务</p>
          </div>
        )}
      </div>

      {/* 已完成任务 */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            已完成 ({completedTasks.length})
          </h2>
          <div className="space-y-2">
            {completedTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={() => toggleComplete(task.id)}
                  className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-3 h-3 text-white" />
                </button>
                <span className="text-gray-500 line-through">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
