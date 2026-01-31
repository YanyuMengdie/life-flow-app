// 简单的 localStorage 封装
const STORAGE_PREFIX = 'lifeflow_';

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function removeItem(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

// 生成唯一 ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// 格式化日期
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// 格式化时间
export function formatTime(date: Date = new Date()): string {
  return date.toTimeString().slice(0, 5);
}
