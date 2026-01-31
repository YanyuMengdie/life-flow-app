import { useState } from 'react';
import { useSleepRecords } from '../stores/useStore';
import { formatDate } from '../utils/storage';

const BUNNY_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuAShjof-e5yAk5fIURjjKL0v93uTZahA_oRqopBzvQTXhLNA6j33Hg3Idn7Itbnb8VDK6NHI75e_eC2cwWI8E-gV_KPH0FgJ87PJ1pd_AmuSUk6qljFv1-3oYyP-5wFIMm1gpAdbv3CsH_pO09cQTsHdRC3_0bMA29zGzxOcYzdhbu_Rg_VyeWgtqY2HN7uAdwf6me6HWhGa4Y8FboZ6vE5P6FcCThnoLImVgaZsMJDhyczkyoV0X583WoGjfIHVA7J-b33WM3aIi4";

export function SleepPage() {
  const { addRecord, updateRecord, getTodayRecord, getWeekRecords } = useSleepRecords();
  const [showAdd, setShowAdd] = useState(false);
  const [newRecord, setNewRecord] = useState({
    bedTime: '',
    wakeTime: '',
    quality: 3 as 1 | 2 | 3 | 4 | 5,
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
    };

    if (todayRecord) {
      updateRecord(todayRecord.id, recordData);
    } else {
      addRecord(recordData);
    }
    setShowAdd(false);
  };

  // Calculate sleep duration
  const getSleepDuration = (bedTime?: string, wakeTime?: string) => {
    if (!bedTime || !wakeTime) return null;
    const bed = new Date(bedTime);
    const wake = new Date(wakeTime);
    let diff = wake.getTime() - bed.getTime();
    if (diff < 0) diff += 24 * 60 * 60 * 1000;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, total: diff };
  };

  const todaySleep = todayRecord ? getSleepDuration(todayRecord.bedTime, todayRecord.wakeTime) : null;

  // Calculate week average
  const weekAvg = (() => {
    const validRecords = weekRecords.filter(r => r.bedTime && r.wakeTime);
    if (validRecords.length === 0) return null;
    const total = validRecords.reduce((acc, r) => {
      const duration = getSleepDuration(r.bedTime, r.wakeTime);
      return acc + (duration?.total || 0);
    }, 0);
    const avgMs = total / validRecords.length;
    return Math.round(avgMs / (1000 * 60 * 60) * 10) / 10;
  })();

  const qualityEmoji = ['😫', '🥱', '😊', '🤩', '😴'];
  const qualitySelected = newRecord.quality;

  return (
    <div className="min-h-screen bg-[#fcfafc] pb-28">
      {/* Header */}
      <div className="flex items-center p-6 pb-2 justify-between sticky top-0 bg-[#fcfafc]/80 ios-blur z-10">
        <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-white soft-shadow cursor-pointer">
          <span className="material-symbols-outlined text-lg text-[#89616b]">chevron_left</span>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Sleep Tracker</h2>
        <div className="flex w-10 h-10 items-center justify-center rounded-full bg-white soft-shadow cursor-pointer">
          <span className="material-symbols-outlined text-lg text-[#89616b]">settings</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex p-4 flex-col items-center">
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
          {/* Background blur */}
          <div className="absolute inset-0 bg-[#e8e7ff] rounded-full blur-3xl opacity-60" />
          {/* Bunny illustration */}
          <div 
            className="z-10 bg-center bg-no-repeat aspect-square bg-contain w-full"
            style={{ backgroundImage: `url('${BUNNY_IMAGE}')` }}
          />
        </div>
        <div className="flex flex-col items-center justify-center text-center space-y-1">
          <p className="text-2xl font-bold tracking-tight">
            {todaySleep ? 'Sweet dreams!' : 'Ready to track?'}
          </p>
          <p className="text-[#89616b] text-base">
            {todaySleep 
              ? <>You slept for <span className="text-[#f0426e] font-semibold">{todaySleep.hours}h {todaySleep.minutes}m</span> last night</>
              : 'Record your sleep to see insights'
            }
          </p>
        </div>
      </div>

      {/* Bedtime & Wake up Cards */}
      <div className="grid grid-cols-2 gap-4 px-6 py-4">
        <div className="flex flex-col gap-3 rounded-xl bg-white p-5 soft-shadow border border-gray-50">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#e8e7ff] text-[#f0426e]">
            <span className="material-symbols-outlined">dark_mode</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold">
              {todayRecord?.bedTime 
                ? new Date(todayRecord.bedTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                : '--:--'
              }
            </h2>
            <p className="text-[#89616b] text-xs font-medium uppercase tracking-wider">Bedtime</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-white p-5 soft-shadow border border-gray-50">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-500">
            <span className="material-symbols-outlined">light_mode</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-bold">
              {todayRecord?.wakeTime 
                ? new Date(todayRecord.wakeTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                : '--:--'
              }
            </h2>
            <p className="text-[#89616b] text-xs font-medium uppercase tracking-wider">Wake up</p>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold tracking-tight">Weekly Stats</h3>
          {weekAvg && (
            <span className="text-xs font-semibold text-[#f0426e] bg-[#f0426e]/10 px-2 py-1 rounded-full italic">
              Average: {weekAvg}h
            </span>
          )}
        </div>
        <div className="bg-white rounded-xl p-5 soft-shadow flex items-end justify-between h-40 gap-2 border border-gray-50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const record = weekRecords[i];
            const duration = record ? getSleepDuration(record.bedTime, record.wakeTime) : null;
            const height = duration ? Math.min((duration.hours / 10) * 100, 100) : 20;
            const isToday = i === new Date().getDay() - 1;
            
            return (
              <div key={day} className="flex flex-col items-center flex-1 gap-2">
                <div 
                  className={`w-full rounded-full relative overflow-hidden transition-all ${
                    isToday ? 'bg-[#f0426e] shadow-lg shadow-[#f0426e]/30' : 'bg-[#e8e7ff]'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-[#f0426e]' : 'text-gray-400'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sleep Quality */}
      <div className="px-6 pt-4">
        <h3 className="text-lg font-bold tracking-tight mb-3">How do you feel today?</h3>
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl soft-shadow border border-gray-50">
          {[1, 2, 3, 4, 5].map(q => (
            <button
              key={q}
              onClick={() => setNewRecord(prev => ({ ...prev, quality: q as 1|2|3|4|5 }))}
              className={`flex flex-1 flex-col items-center justify-center py-3 rounded-xl transition-colors ${
                qualitySelected === q ? 'bg-[#e8e7ff]' : 'hover:bg-[#e8e7ff]/50'
              }`}
            >
              <span className={`text-2xl ${qualitySelected === q ? '' : 'grayscale'}`}>
                {qualityEmoji[q - 1]}
              </span>
              {qualitySelected === q && <div className="w-1 h-1 bg-[#f0426e] rounded-full mt-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="mt-6 px-6 py-4 text-center">
        <p className="text-xs text-gray-400 font-medium italic">
          "Rest is the best medicine. Sleep well tonight." 🌙
        </p>
      </div>

      {/* Action Button */}
      <div className="fixed bottom-24 left-0 right-0 px-6">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-[#f0426e] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#f0426e]/25 flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined">bedtime</span>
          {todayRecord ? 'Update Record' : 'Start Tracking'}
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-end justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-6 text-center">Record Sleep 🌙</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-[#89616b] flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-sm text-[#f0426e]">dark_mode</span>
                  Bedtime
                </label>
                <input
                  type="time"
                  value={newRecord.bedTime}
                  onChange={e => setNewRecord(prev => ({ ...prev, bedTime: e.target.value }))}
                  className="w-full p-3 border border-[#F5F2E8] rounded-xl text-center text-lg font-semibold"
                />
              </div>
              <div>
                <label className="text-xs text-[#89616b] flex items-center gap-1 mb-2">
                  <span className="material-symbols-outlined text-sm text-orange-500">light_mode</span>
                  Wake up
                </label>
                <input
                  type="time"
                  value={newRecord.wakeTime}
                  onChange={e => setNewRecord(prev => ({ ...prev, wakeTime: e.target.value }))}
                  className="w-full p-3 border border-[#F5F2E8] rounded-xl text-center text-lg font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 text-[#89616b] hover:bg-[#F5F2E8] rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-[#f0426e] text-white rounded-xl font-bold shadow-lg shadow-[#f0426e]/30"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
