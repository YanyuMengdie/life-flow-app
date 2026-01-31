import { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useSettings, useTasks } from '../stores/useStore';
import type { Message } from '../types';
import { generateId } from '../utils/storage';
import { chatWithGemini } from '../utils/gemini';
import type { GeminiMessage } from '../utils/gemini';

export function ChatPage() {
  const { settings } = useSettings();
  const { incompleteTasks, completedTasks } = useTasks();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好呀 ☺️ 我是你的生活助手。有什么我可以帮你的吗？比如帮你安排一下今天的任务，或者聊聊你的困扰～',
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

  const systemPrompt = `你是一个温柔、善解人意的生活助手。你的名字叫"Life Flow"。

关于用户：
${settings.personalNotes ? `用户的个人情况：${settings.personalNotes}` : ''}
- 通常起床时间：${settings.usualWakeTime}
- 通常睡觉时间：${settings.usualBedTime}
- 单次最长专注时间：${settings.maxFocusMinutes} 分钟

用户的任务情况：
- 待办任务：${incompleteTasks.length} 个
- 已完成：${completedTasks.length} 个
${incompleteTasks.length > 0 ? `待办列表：\n${incompleteTasks.slice(0, 5).map(t => `  - ${t.title}（${t.estimatedMinutes}分钟）`).join('\n')}` : ''}

你的性格和原则：
1. 语气温柔、理解、有同理心
2. 不施压，尊重用户的感受
3. 适当鼓励，但不要过度
4. 如果用户表达负面情绪，先倾听和理解
5. 给建议时考虑用户的专注力限制
6. 回复简洁，不要太长

用中文回复。`;

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
        // 没有 API Key，使用本地回复
        setTimeout(() => {
          const response = generateLocalResponse(userMessage.content);
          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 500);
        return;
      }

      // 使用 Gemini API
      const history: GeminiMessage[] = messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: userMessage.content }] });

      const response = await chatWithGemini(settings.geminiApiKey, history, systemPrompt);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '抱歉，出了点问题... ' + (e instanceof Error ? e.message : '请稍后再试'),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 本地回复（没有 API Key 时的降级方案）
  const generateLocalResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('安排') || lowerMsg.includes('计划')) {
      return '建议你去「安排」页面，让 AI 帮你生成今天的计划～那里可以更详细地讨论和调整 😊';
    }
    
    if (lowerMsg.includes('累') || lowerMsg.includes('疲')) {
      return '听起来你有点累了... 这很正常的，不用勉强自己 💙\n\n要不要先休息一下？';
    }
    
    if (lowerMsg.includes('焦虑') || lowerMsg.includes('压力')) {
      return '我理解你的感受，有压力是很正常的 🤗\n\n一步一步来，你已经做得很好了 ✨';
    }
    
    return '💡 提示：在设置页面填写 Gemini API Key 后，我会变得更聪明哦～';
  };

  const quickActions = [
    { label: '帮我安排今天', message: '帮我安排一下今天的任务吧' },
    { label: '我有点累', message: '我感觉有点累了...' },
    { label: '聊聊心情', message: '我想聊聊最近的心情' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b bg-white">
        <PageHeader 
          title="AI 助手" 
          subtitle={settings.geminiApiKey ? "由 Gemini 驱动" : "本地模式（功能有限）"}
        />
      </div>

      {!settings.geminiApiKey && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 flex items-center gap-2 text-sm text-yellow-700">
          <AlertCircle className="w-4 h-4" />
          <span>在设置中填写 Gemini API Key 可解锁完整 AI 功能</span>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-md">
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

      {/* 快捷操作 */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 flex-wrap">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => setInput(action.message)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm hover:bg-indigo-100"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入框 */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <div className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="说点什么..."
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
