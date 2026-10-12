import React, { useState, useMemo } from 'react';
import { StudyTask, PriorityFilter, StatusFilter } from '../types/planner';
import {
  sortTasksPython,
  isPastDeadline,
  isDueToday,
  formatDeadlineFriendly,
  getPriorityLabel,
} from '../utils/pythonSorter';
import { ACADEMIC_SUBJECTS } from '../data/initialTasks';
import {
  Search,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Edit2,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  ListOrdered,
} from 'lucide-react';

interface TaskDashboardProps {
  tasks: StudyTask[];
  onToggleTask: (id: string) => void;
  onEditTask: (task: StudyTask) => void;
  onDeleteTask: (id: string) => void;
  onStartFocus: (task: StudyTask) => void;
  onOpenNewTaskModal: () => void;
  onLoadSampleTasks: () => void;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({
  tasks,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onOpenNewTaskModal,
  onLoadSampleTasks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  // Python sort is always the authoritative default
  const sortedTasks = useMemo(() => {
    return sortTasksPython(tasks);
  }, [tasks]);

  // Client-side filtering
  const filteredTasks = useMemo(() => {
    return sortedTasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = task.name.toLowerCase().includes(q);
        const matchesSubject = task.subject.toLowerCase().includes(q);
        const matchesNotes = task.notes?.toLowerCase().includes(q);
        if (!matchesName && !matchesSubject && !matchesNotes) return false;
      }

      // Subject
      if (selectedSubject !== 'all' && task.subject !== selectedSubject) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'all' && task.priority !== parseInt(priorityFilter, 10)) {
        return false;
      }

      // Status
      if (statusFilter === 'pending' && task.done) return false;
      if (statusFilter === 'completed' && !task.done) return false;
      if (statusFilter === 'due-today' && !isDueToday(task.deadline)) return false;
      if (statusFilter === 'overdue' && (!isPastDeadline(task.deadline) || task.done)) return false;

      return true;
    });
  }, [sortedTasks, searchQuery, selectedSubject, priorityFilter, statusFilter]);

  // Metrics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => !t.done).length;
  const completedCount = tasks.filter((t) => t.done).length;
  const dueTodayCount = tasks.filter((t) => isDueToday(t.deadline) && !t.done).length;
  const overdueCount = tasks.filter((t) => isPastDeadline(t.deadline) && !t.done).length;
  const highPriorityCount = tasks.filter((t) => t.priority === 1 && !t.done).length;

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Tasks</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {totalCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Pending</span>
          <span className="text-xl font-bold font-mono text-indigo-600 tabular-nums">
            {pendingCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Due Today</span>
          <span className="text-xl font-bold font-mono text-amber-600 tabular-nums">
            {dueTodayCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Overdue Warning</span>
          <span className="text-xl font-bold font-mono text-rose-600 tabular-nums">
            {overdueCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">High Priority (1)</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {highPriorityCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Completed</span>
          <span className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Main Study Plan Workspace */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Workspace Subheader with Search & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Study Task Queue</h2>
                <p className="text-xs text-slate-500 font-mono">
                  Python Tuple Sort: lambda t: (t[&quot;done&quot;], t[&quot;deadline&quot;], t[&quot;priority&quot;])
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLoadSampleTasks}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Reset Sample Tasks
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-600 transition-colors"
              />
            </div>

            {/* Subject Selector */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-600 transition-colors"
              >
                <option value="all">All Subjects</option>
                {ACADEMIC_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-600 transition-colors"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="due-today">Due Today</option>
                <option value="overdue">Overdue Warnings</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:border-indigo-600 transition-colors"
              >
                <option value="all">All Priorities</option>
                <option value="1">Priority 1 (High)</option>
                <option value="2">Priority 2 (Medium)</option>
                <option value="3">Priority 3 (Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List / Table */}
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-800">No matching study tasks found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || statusFilter !== 'all' || selectedSubject !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'Get started by creating your first academic study goal!'}
            </p>
            <button
              onClick={onOpenNewTaskModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Add First Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task, idx) => {
              const isOverdue = isPastDeadline(task.deadline) && !task.done;
              const dueToday = isDueToday(task.deadline) && !task.done;

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    task.done ? 'bg-slate-50/50' : isOverdue ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50/40'
                  }`}
                >
                  {/* Left Column: Number, Checkbox, Name, Unboxed Metadata */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Index matching Python view_tasks() */}
                    <span className="text-xs font-mono text-slate-400 mt-1 w-6 text-right tabular-nums shrink-0">
                      {idx + 1}.
                    </span>

                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                      title={task.done ? 'Mark Pending' : 'Mark Completed'}
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            task.done ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.name}
                        </span>
                        {isOverdue && (
                          <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Deadline in past</span>
                          </span>
                        )}
                        {dueToday && (
                          <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due today</span>
                          </span>
                        )}
                      </div>

                      {/* Clean Unboxed Metadata with · separator */}
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-slate-700">{task.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          Due {formatDeadlineFriendly(task.deadline)} ({task.deadline})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-mono tabular-nums ${
                            task.priority === 1
                              ? 'text-indigo-700 font-semibold'
                              : task.priority === 2
                              ? 'text-slate-700'
                              : 'text-slate-500'
                          }`}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={task.done ? 'text-emerald-700 font-medium' : 'text-slate-600'}>
                          {task.done ? 'Completed' : 'Pending'}
                        </span>
                      </div>

                      {task.notes && (
                        <p className="text-xs text-slate-500 mt-1.5 italic line-clamp-1">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!task.done && (
                      <button
                        type="button"
                        onClick={() => onStartFocus(task)}
                        title="Start Focus Timer on this task"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Focus</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      title="Edit task"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      title="Delete task"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
