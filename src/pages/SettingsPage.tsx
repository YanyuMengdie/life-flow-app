import { useState } from 'react';
import { Clock, Brain, User, Save, Check, Key } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useSettings, useHabits } from '../stores/useStore';

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { habits, addHabit, deleteHabit, isHabitCompleted, toggleHabitLog } = useHabits();
  const [saved, setSaved] = useState(false);
  const [newHabit, setNewHabit] = useState('');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    addHabit({ name: newHabit.trim(), frequency: 'daily' });
    setNewHabit('');
  };

  return (
    <div className="p-4 pb-24">
      <PageHeader 
        title="设置" 
        subtitle="个性化你的助手"
      />

      {/* 作息设置 */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-600" />
          <h2 className="font-medium">作息时间</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">通常起床时间</label>
            <input
              type="time"
              value={settings.usualWakeTime}
              onChange={e => updateSettings({ usualWakeTime: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">通常睡觉时间</label>
            <input
              type="time"
              value={settings.usualBedTime}
              onChange={e => updateSettings({ usualBedTime: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* 专注偏好 */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h2 className="font-medium">专注偏好</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">
              单次最长专注时间（分钟）
            </label>
            <input
              type="range"
              min="15"
              max="90"
              step="5"
              value={settings.maxFocusMinutes}
              onChange={e => updateSettings({ maxFocusMinutes: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>15</span>
              <span className="text-indigo-600 font-medium">{settings.maxFocusMinutes} 分钟</span>
              <span>90</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-500 block mb-1">
              休息时长（分钟）
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={settings.breakMinutes}
              onChange={e => updateSettings({ breakMinutes: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>5</span>
              <span className="text-indigo-600 font-medium">{settings.breakMinutes} 分钟</span>
              <span>30</span>
            </div>
          </div>
        </div>
      </section>

      {/* 个人备注 */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-indigo-600" />
          <h2 className="font-medium">关于我</h2>
        </div>
        
        <textarea
          value={settings.personalNotes}
          onChange={e => updateSettings({ personalNotes: e.target.value })}
          placeholder="告诉 AI 一些关于你的事情，比如：&#10;• 我容易焦虑，需要多鼓励&#10;• 我喜欢在早上处理难的任务&#10;• 下午3点后我容易犯困"
          className="w-full p-3 border rounded-lg text-sm min-h-[120px] resize-none"
        />
        <p className="text-xs text-gray-400 mt-2">
          这些信息会帮助 AI 更好地理解你，给出更贴心的建议
        </p>
      </section>

      {/* 每日习惯 */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-indigo-600" />
            <h2 className="font-medium">每日习惯</h2>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {habits.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              还没有设置习惯，添加一个试试？
            </p>
          ) : (
            habits.map(habit => (
              <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabitLog(habit.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isHabitCompleted(habit.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {isHabitCompleted(habit.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <span className={isHabitCompleted(habit.id) ? 'text-gray-400 line-through' : ''}>
                    {habit.name}
                  </span>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
            placeholder="添加新习惯..."
            className="flex-1 p-2 border rounded-lg text-sm"
          />
          <button
            onClick={handleAddHabit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
          >
            添加
          </button>
        </div>
      </section>

      {/* Gemini API Key */}
      <section className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-indigo-600" />
          <h2 className="font-medium">Gemini API</h2>
        </div>
        
        <div>
          <label className="text-sm text-gray-500 block mb-1">API Key</label>
          <input
            type="password"
            value={settings.geminiApiKey || ''}
            onChange={e => updateSettings({ geminiApiKey: e.target.value })}
            placeholder="AIzaSy..."
            className="w-full p-2 border rounded-lg text-sm font-mono"
          />
          <p className="text-xs text-gray-400 mt-2">
            从 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-indigo-500 underline">Google AI Studio</a> 获取免费的 API Key
          </p>
        </div>
      </section>

      {/* 保存按钮 */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
      >
        {saved ? (
          <>
            <Check className="w-5 h-5" />
            已保存
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            保存设置
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        设置会自动保存到本地存储
      </p>
    </div>
  );
}
