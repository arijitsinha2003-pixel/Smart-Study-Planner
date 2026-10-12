import React, { useState, useEffect } from 'react';
import { StudyTask, ViewMode } from './types/planner';
import { INITIAL_TASKS } from './data/initialTasks';
import { TopNav } from './components/TopNav';
import { TaskDashboard } from './components/TaskDashboard';
import { DailyGoalTracker } from './components/DailyGoalTracker';
import { FocusTimer } from './components/FocusTimer';
import { PythonTerminal } from './components/PythonTerminal';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { TaskFormModal } from './components/TaskFormModal';
import { Terminal, Code, BookOpen, CheckSquare } from 'lucide-react';

const STORAGE_KEY = 'smart_study_planner_tasks_v1';

export default function App() {
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_TASKS;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [activeFocusTask, setActiveFocusTask] = useState<StudyTask | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage unavailable
    }
  }, [tasks]);

  const handleAddTask = (newTaskData: Omit<StudyTask, 'id'>) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...newTaskData, id: editingTask.id } : t))
      );
      setEditingTask(null);
    } else {
      const newTask: StudyTask = {
        ...newTaskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextDone = !t.done;
          return {
            ...t,
            done: nextDone,
            completedAt: nextDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleCompleteTaskByIndex = (index: number) => {
    // In Python script: tasks[number - 1]["done"] = True
    setTasks((prev) => {
      if (index >= 0 && index < prev.length) {
        const next = [...prev];
        next[index] = {
          ...next[index],
          done: true,
          completedAt: new Date().toISOString(),
        };
        return next;
      }
      return prev;
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenEditModal = (task: StudyTask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleStartFocus = (task: StudyTask) => {
    setActiveFocusTask(task);
    setCurrentView('focus-timer');
  };

  const handleResetSampleTasks = () => {
    setTasks(INITIAL_TASKS);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* 3-Zone Top Navigation Contract */}
      <TopNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenNewTaskModal={handleOpenNewModal}
      />

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'dashboard' && (
          <TaskDashboard
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleDeleteTask}
            onStartFocus={handleStartFocus}
            onOpenNewTaskModal={handleOpenNewModal}
            onLoadSampleTasks={handleResetSampleTasks}
          />
        )}

        {currentView === 'daily-goals' && (
          <DailyGoalTracker
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onOpenNewTaskModal={handleOpenNewModal}
            onStartFocusSession={handleStartFocus}
          />
        )}

        {currentView === 'focus-timer' && (
          <FocusTimer
            tasks={tasks}
            activeTask={activeFocusTask}
            onSelectActiveTask={setActiveFocusTask}
            onCompleteTask={handleToggleTask}
          />
        )}

        {currentView === 'python-studio' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-6 h-6 text-indigo-600" />
                  <span>Python Study Planner Studio</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Run the Python CLI interactive loop, inspect the sorting algorithm, and export standalone scripts.
                </p>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 font-mono">
                Tasks in memory: <strong className="text-slate-900">{tasks.length}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Interactive Python Terminal */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Interactive Python CLI (STDOUT / STDIN)</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Two-way synced
                  </span>
                </div>
                <PythonTerminal
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onCompleteTaskByIndex={handleCompleteTaskByIndex}
                  onResetTasks={handleResetSampleTasks}
                />
              </div>

              {/* Python Code Viewer & Algorithm Deep Dive */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Script Code &amp; Algorithm Spec</span>
                  </span>
                </div>
                <PythonCodeViewer tasks={tasks} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleAddTask}
        editingTask={editingTask}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Smart Study Planner</span>
            <span aria-hidden="true">·</span>
            <span>Python-Powered Academic Goal System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Tuple Sorting: (done, deadline, priority)</span>
            <span aria-hidden="true">·</span>
            <span>Python 3.12 Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
