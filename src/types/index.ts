// 任务
export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number; // 预估时长（分钟）
  deadline?: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

// 排程项目
export interface ScheduleItem {
  id: string;
  taskId?: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string;
  type: 'task' | 'break' | 'meal' | 'rest' | 'custom';
}

// 每日计划
export interface DaySchedule {
  date: string; // YYYY-MM-DD
  items: ScheduleItem[];
  confirmed: boolean;
  notes?: string;
}

// 睡眠记录
export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  bedTime?: string; // ISO datetime
  wakeTime?: string; // ISO datetime
  quality?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

// 习惯
export interface Habit {
  id: string;
  name: string;
  icon?: string;
  frequency: 'daily' | 'weekly';
}

// 习惯打卡记录
export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

// 用户设置
export interface UserSettings {
  // 作息
  usualWakeTime: string; // HH:mm
  usualBedTime: string;
  
  // 专注偏好
  maxFocusMinutes: number; // 单次最长专注时间
  breakMinutes: number; // 休息时长
  
  // 个性化描述（给 AI 用）
  personalNotes: string;
  
  // AI 相关
  aiApiKey?: string;
}

// AI 对话消息
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
