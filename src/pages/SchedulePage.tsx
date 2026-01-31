import { useState, useRef, useEffect } from 'react';
import { useTasks, useSettings, useTodaySchedule } from '../stores/useStore';
import { formatDate } from '../utils/storage';
import { generateScheduleWithAI, chatWithGemini } from '../utils/gemini';
import type { GeminiMessage } from '../utils/gemini';

const BUNNY_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuADZkQB-KJkDZOMm540vGx7EZIzperM8hiu-IfObCtSoHOjowwOXeqPBBJ6rUKW1WMzj9wX4REEdvvY6sSVz6g3pM8QNkfUJBeqOk-KINN4XHSLwerFSMYALFQ-QBNbnMe4KxvNCxvsIJkvSlDv7ASyQqf3PAqqXF-a_yaNZ46wNzgkundUfN9_i1kY-zMZQfS7j0uPphW_9aGDW2cbE0STBK3iI_k5xnpbaRHq2CezfnxHvhMxR71p72OOtquPNtGkfyWSY-EBR-Q";

export function SchedulePage() {
  const { incompleteTasks } = useTasks();
  const { settings } = useSettings();
  const { schedule, saveSchedule, confirmSchedule, clearSchedule } = useTodaySchedule();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (schedule && chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        content: schedule.content
      }]);
    }
  }, [schedule]);

  const generateSchedule = async () => {
    if (!settings.geminiApiKey) {
      setError('Please add your Gemini API Key in Settings first 💕');
      return;
    }

    if (incompleteTasks.length === 0) {
      setError('No tasks yet! Add some first ✨');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const tasks = incompleteTasks.map(t => ({
        title: t.title,
        estimatedMinutes: t.estimatedMinutes,
        priority: t.priority,
        deadline: t.deadline,
      }));

      const result = await generateScheduleWithAI(settings.geminiApiKey, tasks, settings);
      saveSchedule(result);
      setChatMessages([{ role: 'assistant', content: result }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong...');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending || !settings.geminiApiKey) return;

    const userMessage = input.trim();
    setInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSending(true);

    try {
      const history: GeminiMessage[] = chatMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: userMessage }] });

      const systemPrompt = `你是 Bunny AI，一个可爱温柔的日程助手。用户正在讨论今天的安排。
用户情况：${settings.personalNotes || '暂无'}
最长专注时间：${settings.maxFocusMinutes} 分钟

原则：
1. 如果用户想调整，给出新的完整安排
2. 语气温柔可爱，用 emoji
3. 尊重用户的感受`;

      const result = await chatWithGemini(settings.geminiApiKey, history, systemPrompt);
      setChatMessages(prev => [...prev, { role: 'assistant', content: result }]);
      
      if (result.includes('⏰') || result.includes(':00') || result.includes(':30')) {
        saveSchedule(result);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Oops, something went wrong... 🐰 ' + (e instanceof Error ? e.message : '') 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col">
      {/* Header */}
      <header className="flex items-center bg-[#FFFDF5]/80 ios-blur sticky top-0 z-20 p-4 pb-2 justify-between">
        <div className="text-[#f0426e] flex w-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-2xl">calendar_today</span>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold leading-tight tracking-tight">Daily Schedule</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#89616b] font-bold">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex w-12 items-center justify-end">
          {schedule && (
            <button 
              onClick={() => { clearSchedule(); setChatMessages([]); }}
              className="flex cursor-pointer items-center justify-center rounded-xl h-10 w-10 bg-transparent text-[#89616b] hover:bg-gray-100/50"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      {!settings.geminiApiKey ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <span className="material-symbols-outlined text-[#f0426e] text-5xl mb-4">key</span>
            <p className="text-[#89616b] mb-2">Need Gemini API Key</p>
            <p className="text-sm text-[#89616b]/60">Add it in Settings to unlock AI scheduling</p>
          </div>
        </div>
      ) : incompleteTasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-[#89616b]">
            <span className="material-symbols-outlined text-5xl mb-4">checklist</span>
            <p className="text-lg mb-2">No tasks yet!</p>
            <p className="text-sm opacity-60">Add some tasks first ✨</p>
          </div>
        </div>
      ) : !schedule ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#f0426e]/20">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${BUNNY_AVATAR}')` }}
              />
            </div>
            <p className="text-[#89616b] mb-2">
              You have <span className="text-[#f0426e] font-bold">{incompleteTasks.length}</span> tasks today
            </p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={generateSchedule}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#f0426e] text-white rounded-xl font-bold shadow-lg shadow-[#f0426e]/30 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">auto_awesome</span>
              {isGenerating ? 'Planning...' : 'Let Bunny Plan!'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Area */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div 
                    className="bg-[#f0426e]/10 rounded-full w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm bg-cover bg-center"
                    style={{ backgroundImage: `url('${BUNNY_AVATAR}')` }}
                  />
                )}
                <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className={`text-base font-normal leading-relaxed rounded-2xl px-4 py-3 shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#f0426e] text-white rounded-br-none'
                      : 'bg-white text-[#181113] rounded-bl-none border border-[#F5F2E8]/50'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-end gap-3">
                <div 
                  className="bg-[#f0426e]/10 rounded-full w-10 h-10 shrink-0 overflow-hidden border-2 border-white shadow-sm bg-cover bg-center"
                  style={{ backgroundImage: `url('${BUNNY_AVATAR}')` }}
                />
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="animate-bounce text-[#f0426e]">·</span>
                    <span className="animate-bounce text-[#f0426e]" style={{ animationDelay: '0.1s' }}>·</span>
                    <span className="animate-bounce text-[#f0426e]" style={{ animationDelay: '0.2s' }}>·</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </main>

          {/* Confirm Button */}
          {!schedule.confirmed && chatMessages.length > 0 && (
            <div className="px-4 py-2 bg-green-50 border-t border-green-100">
              <button
                onClick={confirmSchedule}
                className="w-full py-3 bg-green-500 text-white rounded-xl flex items-center justify-center gap-2 font-bold"
              >
                <span className="material-symbols-outlined">check</span>
                Looks good! Confirm
              </button>
            </div>
          )}

          {/* Input */}
          <div className="fixed bottom-20 left-0 right-0 bg-[#FFFDF5]/95 p-4 border-t border-[#F5F2E8]">
            <div className="max-w-md mx-auto flex items-center gap-3">
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f0426e]/10 text-[#f0426e]">
                <span className="material-symbols-outlined">add</span>
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a schedule change..."
                  className="w-full h-12 rounded-full border-none bg-white px-5 text-sm shadow-inner focus:ring-2 focus:ring-[#f0426e]/20 placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f0426e] text-white shadow-lg shadow-[#f0426e]/30 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">arrow_upward</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bunny Mascot */}
      {!schedule && (
        <div className="fixed bottom-28 left-4 z-10 opacity-30">
          <div 
            className="w-16 h-16 bg-contain bg-no-repeat"
            style={{ backgroundImage: `url('${BUNNY_AVATAR}')` }}
          />
        </div>
      )}
    </div>
  );
}
