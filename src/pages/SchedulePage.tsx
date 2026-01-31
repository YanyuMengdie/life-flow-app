import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useTasks, useSettings } from '../stores/useStore';
import { formatDate } from '../utils/storage';

interface ScheduleBlock {
  time: string;
  title: string;
  duration: number;
  type: 'task' | 'break' | 'meal';
}

export function SchedulePage() {
  const { incompleteTasks } = useTasks();
  const { settings } = useSettings();
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // 简单的本地排程生成（不需要 AI）
  const generateLocalSchedule = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const blocks: ScheduleBlock[] = [];
      const [wakeHour] = settings.usualWakeTime.split(':').map(Number);
      let currentHour = wakeHour;
      let currentMinute = 0;
      
      // 添加早餐
      blocks.push({
        time: `${currentHour.toString().padStart(2, '0')}:00`,
        title: '起床 & 早餐',
        duration: 60,
        type: 'meal',
      });
      currentHour += 1;
      
      // 分配任务
      const tasksToSchedule = incompleteTasks
        .sort((a, b) => {
          // 优先级排序
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, 5); // 每天最多安排5个任务
      
      for (const task of tasksToSchedule) {
        // 添加任务（最多安排 maxFocusMinutes 分钟）
        const taskDuration = Math.min(task.estimatedMinutes, settings.maxFocusMinutes);
        
        blocks.push({
          time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
          title: task.title,
          duration: taskDuration,
          type: 'task',
        });
        
        // 更新时间
        currentMinute += taskDuration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
        
        // 添加休息
        blocks.push({
          time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
          title: '休息一下 ☕',
          duration: settings.breakMinutes,
          type: 'break',
        });
        
        currentMinute += settings.breakMinutes;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
        
        // 午餐时间
        if (currentHour >= 12 && currentHour < 13 && !blocks.some(b => b.title.includes('午餐'))) {
          blocks.push({
            time: '12:00',
            title: '午餐 & 休息',
            duration: 60,
            type: 'meal',
          });
          currentHour = 13;
          currentMinute = 0;
        }
      }
      
      setSchedule(blocks);
      setIsGenerating(false);
    }, 500);
  };

  const copyToCalendar = () => {
    const today = formatDate();
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Life Flow//CN
`;
    
    schedule.forEach((block, index) => {
      const [hour, minute] = block.time.split(':').map(Number);
      const startDate = new Date(today);
      startDate.setHours(hour, minute, 0, 0);
      const endDate = new Date(startDate.getTime() + block.duration * 60000);
      
      const formatICSDate = (d: Date) => 
        d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      
      icsContent += `BEGIN:VEVENT
UID:lifeflow-${today}-${index}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${block.title}
END:VEVENT
`;
    });
    
    icsContent += 'END:VCALENDAR';
    
    // 创建下载
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${today}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeColors = {
    task: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    break: 'bg-green-100 border-green-300 text-green-800',
    meal: 'bg-orange-100 border-orange-300 text-orange-800',
  };

  return (
    <div className="p-4 pb-24">
      <PageHeader 
        title="今日安排" 
        subtitle={formatDate()}
      />

      {incompleteTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">没有待办任务</p>
          <p className="text-sm">先去添加一些任务吧 ✨</p>
        </div>
      ) : (
        <>
          {schedule.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                你有 {incompleteTasks.length} 个待办任务
              </p>
              <button
                onClick={generateLocalSchedule}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                {isGenerating ? '生成中...' : '生成今日安排'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={copyToCalendar}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已下载' : '导出到日历'}
                </button>
              </div>

              <div className="space-y-3">
                {schedule.map((block, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 ${typeColors[block.type]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{block.title}</span>
                      <span className="text-sm opacity-75">{block.duration} 分钟</span>
                    </div>
                    <div className="text-sm opacity-75 mt-1">{block.time}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl text-sm text-yellow-800">
                💡 这只是建议安排。你觉得怎么样？需要调整的话可以去 AI 对话页面跟我聊聊。
              </div>

              <button
                onClick={() => setSchedule([])}
                className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700"
              >
                重新生成
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
