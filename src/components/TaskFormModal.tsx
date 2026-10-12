import React, { useState, useEffect } from 'react';
import { StudyTask, PriorityLevel } from '../types/planner';
import { isPastDeadline, getTodayISOString } from '../utils/pythonSorter';
import { ACADEMIC_SUBJECTS } from '../data/initialTasks';
import { X, AlertTriangle, Calendar, BookOpen, Flag, Clock } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<StudyTask, 'id'>) => void;
  editingTask?: StudyTask | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(ACADEMIC_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [deadline, setDeadline] = useState(getTodayISOString());
  const [priority, setPriority] = useState<PriorityLevel>(1);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(45);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      if (ACADEMIC_SUBJECTS.includes(editingTask.subject)) {
        setSubject(editingTask.subject);
        setIsCustomSubject(false);
      } else {
        setSubject('Custom');
        setCustomSubject(editingTask.subject);
        setIsCustomSubject(true);
      }
      setDeadline(editingTask.deadline);
      setPriority(editingTask.priority);
      setEstimatedMinutes(editingTask.estimatedMinutes || 45);
      setNotes(editingTask.notes || '');
    } else {
      setName('');
      setSubject(ACADEMIC_SUBJECTS[0]);
      setIsCustomSubject(false);
      setCustomSubject('');
      setDeadline(getTodayISOString());
      setPriority(1);
      setEstimatedMinutes(45);
      setNotes('');
    }
    setErrorMsg('');
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const showPastDeadlineWarning = isPastDeadline(deadline);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Task name cannot be empty.');
      return;
    }

    const finalSubject = isCustomSubject ? customSubject.trim() || 'General Studies' : subject;

    // Check date regex YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(deadline)) {
      setErrorMsg('Invalid date format. Use YYYY-MM-DD.');
      return;
    }

    onSubmit({
      name: name.trim(),
      subject: finalSubject,
      deadline,
      priority,
      done: editingTask ? editingTask.done : false,
      estimatedMinutes: Math.max(5, estimatedMinutes || 30),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingTask ? 'Edit Study Task' : 'Add Study Task'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Schema: (name, subject, deadline, priority, done)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Name (Topic / Assignment) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Graph Algorithms Lab, Chapter 5 Problems..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
          </div>

          {/* Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Academic Subject</span>
              </label>
              <select
                value={isCustomSubject ? 'Custom' : subject}
                onChange={(e) => {
                  if (e.target.value === 'Custom') {
                    setIsCustomSubject(true);
                  } else {
                    setIsCustomSubject(false);
                    setSubject(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              >
                {ACADEMIC_SUBJECTS.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
                <option value="Custom">+ Other Subject...</option>
              </select>
            </div>

            {isCustomSubject && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specify Subject
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="e.g. Quantum Mechanics"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-500" />
                <span>Priority (Python scale)</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10) as PriorityLevel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors font-mono"
              >
                <option value={1}>1 - High Priority</option>
                <option value={2}>2 - Medium Priority</option>
                <option value={3}>3 - Low Priority</option>
              </select>
            </div>
          </div>

          {/* Deadline & Warning */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Deadline (YYYY-MM-DD)</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            {showPastDeadlineWarning && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Warning: This deadline is in the past.</span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Python validation notice: The task due date precedes today&apos;s date.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Estimated minutes & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Est. Minutes</span>
              </label>
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes / Resources (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Reference chapter 3, slides 40-52"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              {editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
