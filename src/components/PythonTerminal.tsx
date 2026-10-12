import React, { useState, useEffect, useRef } from 'react';
import { StudyTask } from '../types/planner';
import { sortTasksPython, isPastDeadline, getTodayISOString } from '../utils/pythonSorter';
import { Terminal, Play, RotateCcw, ArrowRight } from 'lucide-react';

interface PythonTerminalProps {
  tasks: StudyTask[];
  onAddTask: (task: Omit<StudyTask, 'id'>) => void;
  onCompleteTaskByIndex: (index: number) => void;
  onResetTasks: () => void;
}

type TerminalStep =
  | 'MENU'
  | 'ADD_NAME'
  | 'ADD_SUBJECT'
  | 'ADD_DEADLINE'
  | 'ADD_PRIORITY'
  | 'COMPLETE_INDEX'
  | 'EXITED';

interface LogLine {
  id: string;
  type: 'output' | 'input' | 'prompt' | 'warning' | 'success' | 'error';
  text: string;
}

export const PythonTerminal: React.FC<PythonTerminalProps> = ({
  tasks,
  onAddTask,
  onCompleteTaskByIndex,
  onResetTasks,
}) => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [step, setStep] = useState<TerminalStep>('MENU');
  
  // Staging for new task input
  const [stagingTask, setStagingTask] = useState<{
    name: string;
    subject: string;
    deadline: string;
  }>({ name: '', subject: '', deadline: '' });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Initial banner on mount
  useEffect(() => {
    initTerminal();
  }, []);

  const addLog = (
    text: string,
    type: 'output' | 'input' | 'prompt' | 'warning' | 'success' | 'error' = 'output'
  ) => {
    setLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, text, type },
    ]);
  };

  const showMenu = () => {
    addLog('');
    addLog('--- SMART STUDY PLANNER ---', 'output');
    addLog('1. Add task', 'output');
    addLog('2. View tasks', 'output');
    addLog('3. Complete task', 'output');
    addLog('4. Exit', 'output');
    addLog('Choose: ', 'prompt');
    setStep('MENU');
  };

  const initTerminal = () => {
    setLogs([
      { id: '1', text: 'Python 3.12.2 (main, interactive study environment)', type: 'output' },
      { id: '2', text: 'Type options 1-4 to interact directly with the study script.', type: 'output' },
      { id: '3', text: '------------------------------------------------------------', type: 'output' },
      { id: '4', text: '--- SMART STUDY PLANNER ---', type: 'output' },
      { id: '5', text: '1. Add task', type: 'output' },
      { id: '6', text: '2. View tasks', type: 'output' },
      { id: '7', text: '3. Complete task', type: 'output' },
      { id: '8', text: '4. Exit', type: 'output' },
      { id: '9', text: 'Choose: ', type: 'prompt' },
    ]);
    setStep('MENU');
    setInputVal('');
  };

  const handleCommandSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawInput = inputVal;
    setInputVal('');

    // Echo input
    addLog(rawInput, 'input');

    if (step === 'EXITED') {
      if (rawInput.trim().toLowerCase() === 'restart' || rawInput.trim() === 'python' || rawInput.trim() === 'run') {
        initTerminal();
      } else {
        addLog('Script execution terminated. Type "restart" to run again.', 'output');
      }
      return;
    }

    if (step === 'MENU') {
      const choice = rawInput.trim();
      if (choice === '1') {
        addLog('Enter task name: ', 'prompt');
        setStep('ADD_NAME');
      } else if (choice === '2') {
        runViewTasks();
        showMenu();
      } else if (choice === '3') {
        runCompleteTaskPrompt();
      } else if (choice === '4') {
        addLog('Exiting Smart Study Planner. Program finished.', 'success');
        addLog('Type "restart" or click "Reset CLI" to launch another session.', 'output');
        setStep('EXITED');
      } else {
        addLog('Invalid choice.', 'error');
        showMenu();
      }
      return;
    }

    if (step === 'ADD_NAME') {
      const name = rawInput.trim();
      if (!name) {
        addLog('Task name cannot be empty. Enter task name: ', 'error');
        return;
      }
      setStagingTask((prev) => ({ ...prev, name }));
      addLog('Enter subject: ', 'prompt');
      setStep('ADD_SUBJECT');
      return;
    }

    if (step === 'ADD_SUBJECT') {
      const subject = rawInput.trim() || 'General Studies';
      setStagingTask((prev) => ({ ...prev, subject }));
      addLog('Deadline (YYYY-MM-DD): ', 'prompt');
      setStep('ADD_DEADLINE');
      return;
    }

    if (step === 'ADD_DEADLINE') {
      const deadline = rawInput.trim();
      // Date verification matching datetime.strptime(deadline, "%Y-%m-%d").date()
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(deadline)) {
        addLog('Invalid date format.', 'error');
        showMenu();
        return;
      }

      // Check date validity
      const [y, m, d] = deadline.split('-').map(Number);
      const testDate = new Date(y, m - 1, d);
      if (
        testDate.getFullYear() !== y ||
        testDate.getMonth() !== m - 1 ||
        testDate.getDate() !== d
      ) {
        addLog('Invalid date format.', 'error');
        showMenu();
        return;
      }

      // Check if deadline is in the past: due_date < date.today()
      if (isPastDeadline(deadline)) {
        addLog('Warning: This deadline is in the past.', 'warning');
      }

      setStagingTask((prev) => ({ ...prev, deadline }));
      addLog('Priority (1=High, 2=Medium, 3=Low): ', 'prompt');
      setStep('ADD_PRIORITY');
      return;
    }

    if (step === 'ADD_PRIORITY') {
      const parsedPriority = parseInt(rawInput.trim(), 10);
      if (isNaN(parsedPriority)) {
        addLog('Enter a valid priority.', 'error');
        showMenu();
        return;
      }
      if (parsedPriority !== 1 && parsedPriority !== 2 && parsedPriority !== 3) {
        addLog('Priority must be 1, 2, or 3.', 'error');
        showMenu();
        return;
      }

      // Append task to tasks list
      onAddTask({
        name: stagingTask.name,
        subject: stagingTask.subject,
        deadline: stagingTask.deadline,
        priority: parsedPriority as 1 | 2 | 3,
        done: false,
      });

      addLog('Task added successfully!', 'success');
      showMenu();
      return;
    }

    if (step === 'COMPLETE_INDEX') {
      const num = parseInt(rawInput.trim(), 10);
      if (isNaN(num)) {
        addLog('Enter a valid number.', 'error');
        showMenu();
        return;
      }

      if (num >= 1 && num <= tasks.length) {
        onCompleteTaskByIndex(num - 1);
        addLog('Task marked completed!', 'success');
      } else {
        addLog('Invalid task number.', 'error');
      }
      showMenu();
      return;
    }
  };

  const runViewTasks = () => {
    if (!tasks || tasks.length === 0) {
      addLog('No tasks added yet.', 'output');
      return;
    }

    // Python sorting key: lambda t: (t["done"], t["deadline"], t["priority"])
    const ordered = sortTasksPython(tasks);

    ordered.forEach((task, index) => {
      const status = task.done ? 'Completed' : 'Pending';
      addLog(
        `${index + 1}. ${task.name} | ${task.subject} | ${task.deadline} | Priority ${task.priority} | ${status}`,
        'output'
      );
    });
  };

  const runCompleteTaskPrompt = () => {
    if (!tasks || tasks.length === 0) {
      addLog('No tasks added yet.', 'output');
      showMenu();
      return;
    }

    // Displays the current tasks first, exactly as def complete_task() does:
    // complete_task():
    //     view_tasks()
    //     ...
    runViewTasks();
    addLog(`Enter original task number to complete (1 to ${tasks.length}): `, 'prompt');
    setStep('COMPLETE_INDEX');
  };

  const handleQuickAction = (choiceVal: string) => {
    setInputVal(choiceVal);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[640px]">
      {/* Terminal Titlebar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="ml-2 text-xs font-mono text-slate-400">
            smart_planner.py - Python 3.12 CLI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={initTerminal}
            title="Restart Python CLI session"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset CLI</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Console */}
      <div
        className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed text-slate-200 select-text"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.map((log) => {
          if (log.type === 'input') {
            return (
              <div key={log.id} className="text-indigo-300 font-semibold flex items-center gap-1.5 my-0.5">
                <span className="text-slate-500">&gt;&gt;&gt;</span>
                <span>{log.text}</span>
              </div>
            );
          }
          if (log.type === 'prompt') {
            return (
              <div key={log.id} className="text-amber-300 mt-1">
                {log.text}
              </div>
            );
          }
          if (log.type === 'warning') {
            return (
              <div key={log.id} className="text-amber-400 font-medium">
                {log.text}
              </div>
            );
          }
          if (log.type === 'success') {
            return (
              <div key={log.id} className="text-emerald-400 font-medium">
                {log.text}
              </div>
            );
          }
          if (log.type === 'error') {
            return (
              <div key={log.id} className="text-rose-400 font-medium">
                {log.text}
              </div>
            );
          }
          return (
            <div key={log.id} className="text-slate-300 whitespace-pre-wrap">
              {log.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Interactive Input Line */}
      <form
        onSubmit={handleCommandSubmit}
        className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center gap-3"
      >
        <span className="font-mono text-xs text-indigo-400 select-none flex items-center gap-1">
          <span>&gt;</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={
            step === 'MENU'
              ? 'Enter 1 (Add), 2 (View), 3 (Complete), 4 (Exit)...'
              : step === 'ADD_DEADLINE'
              ? 'e.g. ' + getTodayISOString()
              : step === 'ADD_PRIORITY'
              ? '1, 2, or 3'
              : 'Type input and press Enter...'
          }
          className="flex-1 bg-transparent font-mono text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-mono font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors flex items-center gap-1 shrink-0"
        >
          <span>Send</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      {/* Quick Interactive Macro Shortcuts */}
      <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="hidden sm:inline">Quick keys:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleQuickAction('1')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            [1] Add Task
          </button>
          <button
            type="button"
            onClick={() => handleQuickAction('2')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            [2] View Tasks
          </button>
          <button
            type="button"
            onClick={() => handleQuickAction('3')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            [3] Complete Task
          </button>
          <button
            type="button"
            onClick={() => handleQuickAction('4')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
          >
            [4] Exit
          </button>
        </div>
      </div>
    </div>
  );
};
