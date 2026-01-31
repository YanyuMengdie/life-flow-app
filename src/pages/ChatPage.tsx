import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useSettings, useTasks } from '../stores/useStore';
import type { Message } from '../types';
import { generateId } from '../utils/storage';

export function ChatPage() {
  const { settings } = useSettings();
  const { incompleteTasks } = useTasks();
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

  // 本地回复（不需要 API）
  const generateLocalResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('安排') || lowerMsg.includes('计划') || lowerMsg.includes('schedule')) {
      if (incompleteTasks.length === 0) {
        return '你现在没有待办任务哦～要不要先去任务页面添加一些？添加好之后我再帮你安排 😊';
      }
      
      const taskList = incompleteTasks.slice(0, 5).map(t => 
        `• ${t.title}（约 ${t.estimatedMinutes} 分钟）`
      ).join('\n');
      
      return `好的，让我看看你的任务...\n\n你现在有这些待办：\n${taskList}\n\n我建议你可以：\n1. 每完成一个任务后休息 ${settings.breakMinutes} 分钟\n2. 单次专注不要超过 ${settings.maxFocusMinutes} 分钟\n3. 中间穿插一些走动和喝水\n\n你觉得这样可以吗？有什么想调整的随时告诉我～ 💪`;
    }
    
    if (lowerMsg.includes('累') || lowerMsg.includes('tired') || lowerMsg.includes('疲')) {
      return '听起来你有点累了... 这很正常的，不用勉强自己 💙\n\n要不要先休息一下？可以：\n• 闭眼深呼吸几分钟\n• 听听喜欢的音乐\n• 出去走走透透气\n\n等你准备好了，我们再继续～';
    }
    
    if (lowerMsg.includes('焦虑') || lowerMsg.includes('压力') || lowerMsg.includes('anxious')) {
      return '我理解你的感受，有压力是很正常的 🤗\n\n试试这样：\n1. 把大任务拆成小步骤\n2. 先做最简单的那一个\n3. 完成一个就给自己点小奖励\n\n不需要一次做完所有事情。一步一步来，你已经做得很好了 ✨';
    }
    
    if (lowerMsg.includes('睡') || lowerMsg.includes('sleep')) {
      return `根据你的设置，你通常 ${settings.usualBedTime} 睡觉。\n\n良好的睡眠很重要哦～建议睡前一小时：\n• 放下手机\n• 调暗灯光\n• 可以听听轻音乐或白噪音\n\n晚安，好梦 🌙`;
    }
    
    if (lowerMsg.includes('谢') || lowerMsg.includes('thank')) {
      return '不客气呀～有需要随时找我 😊';
    }
    
    // 默认回复
    const responses = [
      '我在听着呢～你想聊聊什么？',
      '嗯嗯，继续说～',
      '我明白了。还有什么我可以帮你的吗？',
      '好的，我记下了。需要我帮你做点什么吗？',
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

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

    // 模拟打字延迟
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
    }, 500 + Math.random() * 1000);
  };

  const quickActions = [
    { label: '帮我安排今天', message: '帮我安排一下今天的任务吧' },
    { label: '我有点累', message: '我感觉有点累了...' },
    { label: '睡眠建议', message: '有什么睡眠建议吗？' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b bg-white">
        <PageHeader 
          title="AI 助手" 
          subtitle="温柔倾听，智慧建议"
        />
      </div>

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
