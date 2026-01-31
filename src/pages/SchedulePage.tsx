import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useTasks, useSettings, useTodaySchedule } from '../stores/useStore';
import { formatDate } from '../utils/storage';
import { generateScheduleWithAI, chatWithGemini } from '../utils/gemini';
import type { GeminiMessage } from '../utils/gemini';

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

  // 当有安排时，初始化对话
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
      setError('请先在设置中填写 Gemini API Key');
      return;
    }

    if (incompleteTasks.length === 0) {
      setError('没有待办任务，先去添加一些吧～');
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

      const result = await generateScheduleWithAI(
        settings.geminiApiKey,
        tasks,
        settings
      );

      saveSchedule(result);
      setChatMessages([{ role: 'assistant', content: result }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败，请稍后重试');
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
      // 构建对话历史
      const history: GeminiMessage[] = chatMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: userMessage }] });

      const systemPrompt = `你是一个温柔、善解人意的生活助手。用户正在和你讨论今天的日程安排。
用户的个人情况：${settings.personalNotes || '暂无'}
单次最长专注时间：${settings.maxFocusMinutes} 分钟

重要：
1. 如果用户想调整安排，帮他们调整并给出新的完整安排
2. 语气要温柔、理解、鼓励
3. 尊重用户的感受和限制`;

      const result = await chatWithGemini(settings.geminiApiKey, history, systemPrompt);
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: result }]);
      
      // 如果回复包含新的安排（有时间格式），更新保存的安排
      if (result.includes('⏰') || result.includes(':00') || result.includes(':30')) {
        saveSchedule(result);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，出了点问题... ' + (e instanceof Error ? e.message : '') 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="p-4 bg-white border-b">
        <PageHeader 
          title="今日安排" 
          subtitle={formatDate()}
          action={
            schedule && (
              <button
                onClick={() => { clearSchedule(); setChatMessages([]); }}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )
          }
        />
      </div>

      {!settings.geminiApiKey ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">需要 Gemini API Key</p>
            <p className="text-sm text-gray-400">请在设置页面填写你的 API Key</p>
          </div>
        </div>
      ) : incompleteTasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">没有待办任务</p>
            <p className="text-sm">先去添加一些任务吧 ✨</p>
          </div>
        </div>
      ) : !schedule ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              你有 {incompleteTasks.length} 个待办任务
            </p>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <button
              onClick={generateSchedule}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              {isGenerating ? '正在生成...' : '让 AI 帮我安排'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 对话区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 p-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>·</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 确认按钮 */}
          {!schedule.confirmed && chatMessages.length > 0 && (
            <div className="px-4 py-2 bg-green-50 border-t border-green-100">
              <button
                onClick={confirmSchedule}
                className="w-full py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                这个安排可以，确认！
              </button>
            </div>
          )}

          {/* 输入框 */}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
            <div className="flex gap-2 max-w-lg mx-auto">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="想调整什么？告诉我..."
                className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
