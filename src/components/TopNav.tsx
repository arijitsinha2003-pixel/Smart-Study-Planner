import React from 'react';
import { ViewMode } from '../types/planner';
import { Plus } from 'lucide-react';

interface TopNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenNewTaskModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onSelectView,
  onOpenNewTaskModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onSelectView('dashboard')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-indigo-600 transition-colors text-left"
          >
            Smart Study Planner
          </button>

          {/* Zone 2: 4-5 single-line clean nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onSelectView('dashboard')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentView === 'dashboard'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectView('daily-goals')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentView === 'daily-goals'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Goals
            </button>
            <button
              onClick={() => onSelectView('focus-timer')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentView === 'focus-timer'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Focus Timer
            </button>
            <button
              onClick={() => onSelectView('python-studio')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentView === 'python-studio'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python Studio
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenNewTaskModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap shrink-0 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center gap-4 overflow-x-auto py-2.5 border-t border-slate-100 text-xs font-medium no-scrollbar">
          <button
            onClick={() => onSelectView('dashboard')}
            className={`whitespace-nowrap shrink-0 ${
              currentView === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectView('daily-goals')}
            className={`whitespace-nowrap shrink-0 ${
              currentView === 'daily-goals' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Daily Goals
          </button>
          <button
            onClick={() => onSelectView('focus-timer')}
            className={`whitespace-nowrap shrink-0 ${
              currentView === 'focus-timer' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Focus Timer
          </button>
          <button
            onClick={() => onSelectView('python-studio')}
            className={`whitespace-nowrap shrink-0 ${
              currentView === 'python-studio' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
            }`}
          >
            Python Studio
          </button>
        </div>
      </div>
    </header>
  );
};
