import React from 'react';
import { StudyTask } from '../types/planner';
import { isDueToday, isPastDeadline, formatDeadlineFriendly, getPriorityLabel } from '../utils/pythonSorter';
import { CheckCircle2, Circle, AlertCircle, Clock, Calendar, CheckSquare, Sparkles } from 'lucide-react';

interface DailyGoalTrackerProps {
  tasks: StudyTask[];
  onToggleTask: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onStartFocusSession: (task: StudyTask) => void;
}

export const DailyGoalTracker: React.FC<DailyGoalTrackerProps> = ({
  tasks,
  onToggleTask,
  onOpenNewTaskModal,
  onStartFocusSession,
}) => {
  // Tasks relevant to today (either due today, overdue, or planned for today)
  const todayTasks = tasks.filter((t) => isDueToday(t.deadline));
  const overdueTasks = tasks.filter((t) => isPastDeadline(t.deadline) && !t.done);
  const completedToday = tasks.filter((t) => t.done && (isDueToday(t.deadline) || t.completedAt));

  const totalActionable = todayTasks.length + overdueTasks.length;
  const completedCount = todayTasks.filter((t) => t.done).length;
  const progressPct = totalActionable > 0 ? Math.round((completedCount / totalActionable) * 100) : 100;

  const totalEstMinutesToday = todayTasks
    .filter((t) => !t.done)
    .reduce((acc, t) => acc + (t.estimatedMinutes || 45), 0);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Daily Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Daily Academic Goals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Prioritize deep work, clear urgent deadlines, and maintain consistent momentum.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Today&apos;s Target</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {progressPct}%
              </span>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 transition-all duration-500 ease-out"
                  strokeDasharray={`${progressPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <CheckSquare className="w-5 h-5 text-indigo-600 absolute" />
            </div>
          </div>
        </div>

        {/* Metric summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-500">Scheduled Today</span>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {todayTasks.length} tasks
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Estimated Study Time</span>
            <p className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {totalEstMinutesToday} mins
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Completed Today</span>
            <p className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-0.5">
              {completedCount} tasks
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Active Study Streak</span>
            <p className="text-lg font-bold font-mono tabular-nums text-indigo-600 mt-0.5 flex items-center gap-1">
              <span>7 days</span>
              <Sparkles className="w-4 h-4 text-amber-500 inline" />
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Warning Callout */}
      {overdueTasks.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                Warning: {overdueTasks.length} task{overdueTasks.length > 1 ? 's' : ''} with past deadlines
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Per Python sorting criteria, these past deadlines are grouped at the top to prevent falling behind.
              </p>
              <div className="mt-3 space-y-2">
                {overdueTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between bg-white/90 p-3 rounded-lg border border-amber-200/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleTask(t.id)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div>
                        <span className="font-semibold text-slate-900">{t.name}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {t.subject} · Was due {formatDeadlineFriendly(t.deadline)} · {getPriorityLabel(t.priority)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onStartFocusSession(t)}
                      className="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-100/80 hover:bg-amber-200 rounded transition-colors whitespace-nowrap"
                    >
                      Focus Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Goals List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Today&apos;s Focus Tasks ({todayTasks.length})
          </h2>
          <button
            onClick={onOpenNewTaskModal}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            + Add Task For Today
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">
              No pending tasks specifically due today!
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You&apos;re caught up with today&apos;s deadlines, or you can add a target study task to stay ahead of upcoming courses.
            </p>
            <button
              onClick={onOpenNewTaskModal}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Set Daily Goal
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                  task.done ? 'bg-slate-50/60' : 'hover:bg-slate-50/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-1 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                  >
                    {task.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <span
                      className={`text-sm font-semibold block truncate ${
                        task.done ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.name}
                    </span>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                      <span>{task.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{getPriorityLabel(task.priority)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {task.estimatedMinutes || 45} mins
                      </span>
                    </div>
                  </div>
                </div>

                {!task.done && (
                  <button
                    onClick={() => onStartFocusSession(task)}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0 whitespace-nowrap"
                  >
                    Start Session
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
