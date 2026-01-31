import { useState, useEffect, useCallback } from 'react';
import { Task, SleepRecord, UserSettings, Habit, HabitLog } from '../types';
import { getItem, setItem, generateId, formatDate } from '../utils/storage';

// 默认设置
const defaultSettings: UserSettings = {
  usualWakeTime: '08:00',
  usualBedTime: '23:00',
  maxFocusMinutes: 45,
  breakMinutes: 15,
  personalNotes: '',
};

// ===== 任务 Store =====
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => getItem('tasks', []));

  useEffect(() => {
    setItem('tasks', tasks);
  }, [tasks]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
        : t
    ));
  }, []);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return { tasks, incompleteTasks, completedTasks, addTask, updateTask, deleteTask, toggleComplete };
}

// ===== 睡眠记录 Store =====
export function useSleepRecords() {
  const [records, setRecords] = useState<SleepRecord[]>(() => getItem('sleepRecords', []));

  useEffect(() => {
    setItem('sleepRecords', records);
  }, [records]);

  const addRecord = useCallback((record: Omit<SleepRecord, 'id'>) => {
    const newRecord: SleepRecord = { ...record, id: generateId() };
    setRecords(prev => [...prev, newRecord]);
    return newRecord;
  }, []);

  const updateRecord = useCallback((id: string, updates: Partial<SleepRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const getTodayRecord = useCallback(() => {
    const today = formatDate();
    return records.find(r => r.date === today);
  }, [records]);

  const getWeekRecords = useCallback(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return records.filter(r => new Date(r.date) >= weekAgo);
  }, [records]);

  return { records, addRecord, updateRecord, getTodayRecord, getWeekRecords };
}

// ===== 设置 Store =====
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => 
    getItem('settings', defaultSettings)
  );

  useEffect(() => {
    setItem('settings', settings);
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return { settings, updateSettings };
}

// ===== 习惯 Store =====
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => getItem('habits', []));
  const [logs, setLogs] = useState<HabitLog[]>(() => getItem('habitLogs', []));

  useEffect(() => { setItem('habits', habits); }, [habits]);
  useEffect(() => { setItem('habitLogs', logs); }, [logs]);

  const addHabit = useCallback((habit: Omit<Habit, 'id'>) => {
    const newHabit: Habit = { ...habit, id: generateId() };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const toggleHabitLog = useCallback((habitId: string, date: string = formatDate()) => {
    setLogs(prev => {
      const existing = prev.find(l => l.habitId === habitId && l.date === date);
      if (existing) {
        return prev.map(l => 
          l.habitId === habitId && l.date === date 
            ? { ...l, completed: !l.completed } 
            : l
        );
      }
      return [...prev, { habitId, date, completed: true }];
    });
  }, []);

  const isHabitCompleted = useCallback((habitId: string, date: string = formatDate()) => {
    return logs.some(l => l.habitId === habitId && l.date === date && l.completed);
  }, [logs]);

  return { habits, logs, addHabit, deleteHabit, toggleHabitLog, isHabitCompleted };
}
