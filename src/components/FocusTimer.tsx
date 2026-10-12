import React, { useState, useEffect } from 'react';
import { StudyTask } from '../types/planner';
import { Play, Pause, RotateCcw, CheckCircle2, BookOpen, Coffee } from 'lucide-react';

interface FocusTimerProps {
  tasks: StudyTask[];
  activeTask?: StudyTask | null;
  onSelectActiveTask: (task: StudyTask | null) => void;
  onCompleteTask: (taskId: string) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  tasks,
  activeTask,
  onSelectActiveTask,
  onCompleteTask,
}) => {
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 mins in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const pendingTasks = tasks.filter((t) => !t.done);

  // Set default selected task if none
  useEffect(() => {
    if (!activeTask && pendingTasks.length > 0) {
      onSelectActiveTask(pendingTasks[0]);
    }
  }, [pendingTasks, activeTask, onSelectActiveTask]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session finished
      if (mode === 'study') {
        setCompletedSessions((c) => c + 1);
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('study');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'study' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = mode === 'study' ? 25 * 60 : 5 * 60;
  const progressPct = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs text-center">
        {/* Study / Break Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold mb-6">
          <button
            onClick={() => switchMode('study')}
            className={`px-4 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              mode === 'study' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Deep Study (25 min)</span>
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-4 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              mode === 'break' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Short Break (5 min)</span>
          </button>
        </div>

        {/* Large Countdown Display */}
        <div className="my-6">
          <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-slate-900 tabular-nums">
            {timeFormatted}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden max-w-md mx-auto">
            <div
              className={`h-full transition-all duration-300 ease-linear ${
                mode === 'study' ? 'bg-indigo-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={resetTimer}
            title="Reset timer"
            className="p-3 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 text-sm font-semibold rounded-full text-white shadow-sm transition-all flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Session</span>
              </>
            )}
          </button>
        </div>

        {/* Active Task Selector */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-left">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Target Task for Current Session:
          </label>
          {pendingTasks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No pending tasks remaining. Great job!</p>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <select
                value={activeTask?.id || ''}
                onChange={(e) => {
                  const found = tasks.find((t) => t.id === e.target.value);
                  onSelectActiveTask(found || null);
                }}
                className="flex-1 px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 truncate"
              >
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.subject}] {t.name} (Priority {t.priority})
                  </option>
                ))}
              </select>

              {activeTask && (
                <button
                  type="button"
                  onClick={() => {
                    onCompleteTask(activeTask.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mark Done</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Session Stats */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span>Completed focus blocks today: <strong className="font-mono text-slate-900 tabular-nums">{completedSessions}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Target: 4 blocks</span>
        </div>
      </div>
    </div>
  );
};
