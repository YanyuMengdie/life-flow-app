import { useState } from 'react';
import { Moon, Sun, Plus, TrendingUp } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useSleepRecords } from '../stores/useStore';
import { formatDate, formatTime } from '../utils/storage';

export function SleepPage() {
  const { records, addRecord, updateRecord, getTodayRecord, getWeekRecords } = useSleepRecords();
  const [showAdd, setShowAdd] = useState(false);
  const [newRecord, setNewRecord] = useState({
    bedTime: '',
    wakeTime: '',
    quality: 3 as 1 | 2 | 3 | 4 | 5,
    notes: '',
  });

  const today = formatDate();
  const todayRecord = getTodayRecord();
  const weekRecords = getWeekRecords();

  const handleSave = () => {
    const recordData = {
      date: today,
      bedTime: newRecord.bedTime ? new Date(`${today}T${newRecord.bedTime}`).toISOString() : undefined,
      wakeTime: newRecord.wakeTime ? new Date(`${today}T${newRecord.wakeTime}`).toISOString() : undefined,
      quality: newRecord.quality,
      notes: newRecord.notes || undefined,
    };

    if (todayRecord) {
      updateRecord(todayRecord.id, recordData);
    } else {
      addRecord(recordData);
    }
    setShowAdd(false);
  };

  // 计算周统计
  const weekStats = (() => {
    if (weekRecords.length === 0) return null;
    
    let totalSleep = 0;
    let totalQuality = 0;
    let count = 0;

    weekRecords.forEach(r => {
      if (r.bedTime && r.wakeTime) {
        const bed = new Date(r.bedTime);
        const wake = new Date(r.wakeTime);
        // 如果睡觉时间晚于起床时间，说明是跨夜
        let diff = wake.getTime() - bed.getTime();
        if (diff < 0) diff += 24 * 60 * 60 * 1000;
        totalSleep += diff;
        count++;
      }
      if (r.quality) totalQuality += r.quality;
    });

    return {
      avgSleep: count > 0 ? Math.round(totalSleep / count / 1000 / 60) : 0, // 分钟
      avgQuality: weekRecords.length > 0 ? (totalQuality / weekRecords.length).toFixed(1) : 0,
      recordCount: weekRecords.length,
    };
  })();

  const qualityEmoji = ['😫', '😔', '😐', '😊', '😴'];

  return (
    <div className="p-4 pb-24">
      <PageHeader 
        title="睡眠记录" 
        subtitle="保持良好作息 💤"
        action={
          !todayRecord && (
            <button
              onClick={() => setShowAdd(true)}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          )
        }
      />

      {/* 今日记录卡片 */}
      {todayRecord ? (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white mb-6">
          <h3 className="text-sm opacity-80 mb-2">今日记录</h3>
          <div className="flex items-center gap-6">
            {todayRecord.bedTime && (
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5" />
                <span className="text-lg font-medium">
                  {new Date(todayRecord.bedTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {todayRecord.wakeTime && (
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                <span className="text-lg font-medium">
                  {new Date(todayRecord.wakeTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
          {todayRecord.quality && (
            <div className="mt-3">
              <span className="text-2xl">{qualityEmoji[todayRecord.quality - 1]}</span>
              <span className="ml-2 text-sm opacity-80">睡眠质量</span>
            </div>
          )}
          <button
            onClick={() => {
              setNewRecord({
                bedTime: todayRecord.bedTime ? new Date(todayRecord.bedTime).toTimeString().slice(0, 5) : '',
                wakeTime: todayRecord.wakeTime ? new Date(todayRecord.wakeTime).toTimeString().slice(0, 5) : '',
                quality: todayRecord.quality || 3,
                notes: todayRecord.notes || '',
              });
              setShowAdd(true);
            }}
            className="mt-4 text-sm underline opacity-80 hover:opacity-100"
          >
            编辑记录
          </button>
        </div>
      ) : (
        <div 
          onClick={() => setShowAdd(true)}
          className="bg-gray-100 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-200 mb-6"
        >
          <p className="text-gray-500">今天还没有记录</p>
          <p className="text-sm text-gray-400 mt-1">点击添加睡眠记录</p>
        </div>
      )}

      {/* 添加/编辑表单 */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
          <h3 className="font-medium mb-4">记录睡眠</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Moon className="w-3 h-3" /> 睡觉时间
              </label>
              <input
                type="time"
                value={newRecord.bedTime}
                onChange={e => setNewRecord(prev => ({ ...prev, bedTime: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <Sun className="w-3 h-3" /> 起床时间
              </label>
              <input
                type="time"
                value={newRecord.wakeTime}
                onChange={e => setNewRecord(prev => ({ ...prev, wakeTime: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-500 block mb-2">睡眠质量</label>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map(q => (
                <button
                  key={q}
                  onClick={() => setNewRecord(prev => ({ ...prev, quality: q as 1|2|3|4|5 }))}
                  className={`text-2xl p-2 rounded-lg transition-transform ${
                    newRecord.quality === q ? 'scale-125 bg-indigo-100' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  {qualityEmoji[q - 1]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-500 block mb-1">备注（可选）</label>
            <input
              type="text"
              value={newRecord.notes}
              onChange={e => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="比如：做了个好梦..."
              className="w-full p-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 周报 */}
      {weekStats && weekStats.recordCount > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="font-medium">本周统计</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {Math.floor(weekStats.avgSleep / 60)}h {weekStats.avgSleep % 60}m
              </div>
              <div className="text-xs text-gray-500">平均睡眠</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">{weekStats.avgQuality}</div>
              <div className="text-xs text-gray-500">平均质量</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">{weekStats.recordCount}</div>
              <div className="text-xs text-gray-500">记录天数</div>
            </div>
          </div>
        </div>
      )}

      {/* 历史记录 */}
      {records.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">历史记录</h3>
          <div className="space-y-2">
            {records.slice(-7).reverse().map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <span className="text-gray-600">{record.date}</span>
                <div className="flex items-center gap-3">
                  {record.quality && <span>{qualityEmoji[record.quality - 1]}</span>}
                  {record.bedTime && record.wakeTime && (
                    <span className="text-gray-500">
                      {new Date(record.bedTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      {' → '}
                      {new Date(record.wakeTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
