import { useState } from 'react';
import { useSettings, useHabits } from '../stores/useStore';

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { habits, addHabit, deleteHabit, isHabitCompleted, toggleHabitLog } = useHabits();
  const [saved, setSaved] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

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
    <div className="min-h-screen bg-[#f9f6f2] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#f9f6f2]/80 ios-blur px-4 py-4 flex items-center justify-center">
        <h1 className="text-lg font-bold">设置</h1>
      </header>

      <main className="px-4 space-y-6">
        {/* Schedule Preferences */}
        <section>
          <div className="flex items-center gap-2 px-2 pb-2 pt-4">
            <span className="material-symbols-outlined text-[#f0426e] text-lg">schedule</span>
            <h3 className="text-[#f0426e] text-xs font-bold uppercase tracking-widest">作息时间</h3>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden soft-shadow border border-pink-100/30">
            <div className="flex items-center gap-4 px-4 py-4 border-b border-[#f9f6f2]">
              <p className="text-base font-normal flex-1">起床时间</p>
              <input
                type="time"
                value={settings.usualWakeTime}
                onChange={e => updateSettings({ usualWakeTime: e.target.value })}
                className="text-[#f0426e] text-sm font-semibold bg-transparent border-none focus:ring-0 text-right"
              />
            </div>
            <div className="flex items-center gap-4 px-4 py-4">
              <p className="text-base font-normal flex-1">睡觉时间</p>
              <input
                type="time"
                value={settings.usualBedTime}
                onChange={e => updateSettings({ usualBedTime: e.target.value })}
                className="text-[#f0426e] text-sm font-semibold bg-transparent border-none focus:ring-0 text-right"
              />
            </div>
          </div>
        </section>

        {/* Focus Mode */}
        <section>
          <div className="flex items-center gap-2 px-2 pb-2">
            <span className="material-symbols-outlined text-[#f0426e] text-lg">psychology</span>
            <h3 className="text-[#f0426e] text-xs font-bold uppercase tracking-widest">专注模式</h3>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden soft-shadow border border-pink-100/30 p-4 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[#89616b]">最长专注时间</p>
                <p className="text-sm font-bold text-[#f0426e]">{settings.maxFocusMinutes} 分钟</p>
              </div>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={settings.maxFocusMinutes}
                onChange={e => updateSettings({ maxFocusMinutes: Number(e.target.value) })}
                className="w-full h-2 bg-[#F5F2E8] rounded-full appearance-none cursor-pointer accent-[#f0426e]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[#89616b]">休息时长</p>
                <p className="text-sm font-bold text-[#f0426e]">{settings.breakMinutes} 分钟</p>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={settings.breakMinutes}
                onChange={e => updateSettings({ breakMinutes: Number(e.target.value) })}
                className="w-full h-2 bg-[#F5F2E8] rounded-full appearance-none cursor-pointer accent-[#f0426e]"
              />
            </div>
          </div>
        </section>

        {/* Personal Notes */}
        <section>
          <div className="flex items-center gap-2 px-2 pb-2">
            <span className="material-symbols-outlined text-[#f0426e] text-lg">edit_note</span>
            <h3 className="text-[#f0426e] text-xs font-bold uppercase tracking-widest">关于我</h3>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden soft-shadow border border-pink-100/30 p-4">
            <textarea
              value={settings.personalNotes}
              onChange={e => updateSettings({ personalNotes: e.target.value })}
              placeholder="告诉 AI 一些关于你的事情...&#10;• 我容易焦虑&#10;• 我喜欢早上工作&#10;• 我需要经常休息"
              className="w-full p-3 bg-[#f9f6f2]/50 border-none rounded-xl text-sm min-h-[100px] resize-none focus:ring-1 focus:ring-[#f0426e]/30 placeholder:text-[#89616b]/50"
            />
            <p className="text-[11px] text-[#89616b]/60 mt-2 italic">
              这些信息会帮助 AI 更好地理解你 💕
            </p>
          </div>
        </section>

        {/* Daily Habits */}
        <section>
          <div className="flex items-center gap-2 px-2 pb-2">
            <span className="material-symbols-outlined text-[#f0426e] text-lg">check_circle</span>
            <h3 className="text-[#f0426e] text-xs font-bold uppercase tracking-widest">每日习惯</h3>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden soft-shadow border border-pink-100/30 p-4">
            {habits.length === 0 ? (
              <p className="text-sm text-[#89616b]/60 text-center py-4 italic">
                还没有设置习惯，添加一个试试？🌱
              </p>
            ) : (
              <div className="space-y-2 mb-4">
                {habits.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-[#f9f6f2]/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabitLog(habit.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isHabitCompleted(habit.id)
                            ? 'bg-[#f0426e] border-[#f0426e]'
                            : 'border-[#f0426e]/30 hover:border-[#f0426e]'
                        }`}
                      >
                        {isHabitCompleted(habit.id) && (
                          <span className="material-symbols-outlined text-white text-sm">check</span>
                        )}
                      </button>
                      <span className={isHabitCompleted(habit.id) ? 'text-[#89616b] line-through' : ''}>
                        {habit.name}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-[#89616b]/40 hover:text-[#f0426e] p-1"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newHabit}
                onChange={e => setNewHabit(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                placeholder="添加新习惯..."
                className="flex-1 p-2.5 bg-[#f9f6f2]/50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#f0426e]/30"
              />
              <button
                onClick={handleAddHabit}
                className="px-4 py-2 bg-[#f0426e] text-white rounded-xl text-sm font-bold"
              >
                添加
              </button>
            </div>
          </div>
        </section>

        {/* API Key */}
        <section>
          <div className="flex items-center gap-2 px-2 pb-2">
            <span className="material-symbols-outlined text-[#f0426e] text-lg">key</span>
            <h3 className="text-[#f0426e] text-xs font-bold uppercase tracking-widest">API 设置</h3>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden soft-shadow border border-pink-100/30 p-4">
            <p className="text-sm font-medium mb-2">Gemini API Key</p>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.geminiApiKey || ''}
                onChange={e => updateSettings({ geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-[#f9f6f2]/50 border-none rounded-xl text-sm font-mono py-3 pl-3 pr-16 focus:ring-1 focus:ring-[#f0426e]/30"
              />
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#f0426e]/10 rounded text-[#f0426e]"
              >
                <span className="material-symbols-outlined text-xl">
                  {showApiKey ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="mt-3 text-[11px] text-[#89616b]/60 italic">
              从{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-[#f0426e] underline">
                Google AI Studio
              </a>
              {' '}免费获取
            </p>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-[#f0426e] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#f0426e]/25 flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <span className="material-symbols-outlined">check</span>
              已保存！
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">save</span>
              保存设置
            </>
          )}
        </button>

        {/* Footer */}
        <footer className="pt-6 pb-8 flex flex-col items-center justify-center space-y-3 opacity-50">
          <span className="material-symbols-outlined text-[#f0426e] text-4xl">pets</span>
          <div className="text-center">
            <p className="text-xs font-bold text-[#89616b]">Life Flow v1.0</p>
            <p className="text-[10px] text-[#89616b] mt-1 italic">用爱制作 💕</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
