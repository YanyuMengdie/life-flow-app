import { get, set, del } from 'idb-keyval';

// IndexedDB 封装 (更持久的存储)
const STORAGE_PREFIX = 'lifeflow_';

export async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const item = await get(STORAGE_PREFIX + key);
    return item !== undefined ? item : defaultValue;
  } catch {
    // 降级到 localStorage
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await set(STORAGE_PREFIX + key, value);
    // 同时写入 localStorage 作为备份
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {}
  } catch (e) {
    console.error('Failed to save to IndexedDB:', e);
    // 降级到 localStorage
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {}
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await del(STORAGE_PREFIX + key);
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {}
}

// 同步版本（用于初始化）
export function getItemSync<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
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
