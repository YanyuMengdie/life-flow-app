import { useState, useRef, useEffect } from 'react';
import { useSettings, useTasks } from '../stores/useStore';
import type { Message } from '../types';
import { generateId } from '../utils/storage';
import { chatWithGemini } from '../utils/gemini';
import type { GeminiMessage } from '../utils/gemini';

const MOCHI_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuBusDnqoUzFPnd6b9AtyA93mDPzdz4OmXfYmW3SqsxN_AMIOs3c-2kE11SlM5DfRJ6kPN1QVNAd5wqHhQHCKMNWJ-8q93i-qecZcpRG1phEqnnWlk55GD7d_M0WdLlPK_X3bC7tfkLLOPrkaHQ7S0oxc4_KgWjOCwyx6E4rpymj0g-rjq7iEgpxmr2VQ8IJqCeN9nvmMJRWYuVeraKcjMCy4nOAywqzWPwW8cxSsng4edQL2sbavD-93iG0sr7CDdfqCROYey0J2s8";

export function ChatPage() {
  const { settings } = useSettings();
  const { incompleteTasks, completedTasks } = useTasks();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Good morning! ✨ Ready to organize your day? I\'ve already pulled up your list.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const systemPrompt = `你是一个可爱、温柔、善解人意的生活助手，名叫 Mochi（一只可爱的小猫）。

用户情况：
${settings.personalNotes ? `个人备注：${settings.personalNotes}` : ''}
- 起床时间：${settings.usualWakeTime}
- 睡觉时间：${settings.usualBedTime}
- 最长专注：${settings.maxFocusMinutes} 分钟
- 待办任务：${incompleteTasks.length} 个
- 已完成：${completedTasks.length} 个

你的性格：
1. 说话温柔可爱，偶尔用 emoji
2. 像朋友一样关心用户
3. 不施压，理解用户的困难
4. 给建议时简洁实用
5. 用中文回复`;

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!settings.geminiApiKey) {
        setTimeout(() => {
          const response = '💡 在设置页面填写 Gemini API Key 后，我会变得更聪明哦～';
          setMessages(prev => [...prev, {
            id: generateId(),
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString(),
          }]);
          setIsLoading(false);
        }, 500);
        return;
      }

      const history: GeminiMessage[] = messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: userMessage.content }] });

      const response = await chatWithGemini(settings.geminiApiKey, history, systemPrompt);
      
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: '哎呀，出了点问题... 🐱 ' + (e instanceof Error ? e.message : ''),
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: 'bolt', label: 'Focus mode', message: '帮我开始专注模式' },
    { icon: 'checklist', label: 'Plan my day', message: '帮我规划今天' },
    { icon: 'auto_awesome', label: 'Daily Quote', message: '给我一句励志的话' },
  ];

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#fdfaf9] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#fdfaf9]/80 ios-blur border-b border-pink-100/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full border-2 border-[#f0426e]/20 bg-cover bg-center"
                style={{ backgroundImage: `url('${MOCHI_AVATAR}')` }}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Mochi</h1>
              <p className="text-[#89616b] text-xs">Your AI Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-[#f0426e]">
              <span className="material-symbols-outlined">favorite</span>
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        {/* Decorative Stars */}
        <div className="absolute top-20 right-10 text-[#f0426e]/10 pointer-events-none">
          <span className="material-symbols-outlined text-2xl">star</span>
        </div>

        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div 
                className="w-8 h-8 rounded-full bg-cover bg-center shrink-0 mb-1 border border-pink-100"
                style={{ backgroundImage: `url('${MOCHI_AVATAR}')` }}
              />
            )}
            <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-[#f0426e] text-white rounded-br-none shadow-md'
                  : 'bg-[#fcf5f1] text-[#181113] rounded-bl-none shadow-sm border border-pink-50/50'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="text-[10px] text-[#89616b] mx-1">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-2">
            <div 
              className="w-8 h-8 rounded-full bg-cover bg-center shrink-0 mb-1 border border-pink-100"
              style={{ backgroundImage: `url('${MOCHI_AVATAR}')` }}
            />
            <div className="bg-[#fcf5f1] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
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

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => setInput(action.message)}
                className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-white border border-pink-100 text-[#181113] px-4 text-sm font-medium shadow-sm active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-[#f0426e] text-sm">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <footer className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-pink-100">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-[#fcf5f1] text-[#f0426e]">
            <span className="material-symbols-outlined">add</span>
          </button>
          <div className="flex-1 relative">
            <div className="flex items-center w-full min-h-[48px] bg-[#fcf5f1] rounded-2xl px-4 border border-transparent focus-within:border-[#f0426e]/30 transition-all">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Talk to Mochi..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-base placeholder:text-[#89616b]/60 p-0"
              />
              <div className="flex items-center gap-2">
                <button className="text-[#89616b] hover:text-[#f0426e] transition-colors">
                  <span className="material-symbols-outlined">mood</span>
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-[#f0426e] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-[#f0426e]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">arrow_upward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
