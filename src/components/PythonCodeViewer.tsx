import React, { useState } from 'react';
import { StudyTask } from '../types/planner';
import { generatePythonScript } from '../utils/pythonSorter';
import { Copy, Check, Download, Code2, BookOpen, Layers } from 'lucide-react';

interface PythonCodeViewerProps {
  tasks: StudyTask[];
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ tasks }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'source' | 'algorithm'>('source');

  const pythonCode = generatePythonScript(tasks);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart_planner.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <span>Python Source &amp; Algorithm Spec</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized with {tasks.length} active tasks · Ready for CLI or local execution
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Tab Control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('source')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'source'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python Script
            </button>
            <button
              onClick={() => setActiveTab('algorithm')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'algorithm'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Algorithm Analysis
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {activeTab === 'source' ? (
        <div className="relative">
          <pre className="p-5 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[580px] select-text">
            <code>{pythonCode}</code>
          </pre>
        </div>
      ) : (
        <div className="p-6 space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Multi-Criteria Tuple Sorting: lambda t: (t[&quot;done&quot;], t[&quot;deadline&quot;], t[&quot;priority&quot;])</span>
            </h3>
            <p className="mt-2 text-slate-600 leading-relaxed text-xs">
              Python uses lexicographical tuple comparison. When sorting a list of dictionaries with this tuple key, Python evaluates elements in strict priority order:
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-900 block">1. t[&quot;done&quot;] (Status Tier)</span>
                <p className="text-xs text-slate-600 mt-1">
                  In Python, <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-600">False == 0</code> and{' '}
                  <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-600">True == 1</code>. Pending tasks always precede completed tasks.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-900 block">2. t[&quot;deadline&quot;] (Chronological)</span>
                <p className="text-xs text-slate-600 mt-1">
                  Next, Python compares the <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-600">date</code> objects or ISO dates. Closer and overdue deadlines float to the top.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-semibold text-slate-900 block">3. t[&quot;priority&quot;] (Urgency Tiebreaker)</span>
                <p className="text-xs text-slate-600 mt-1">
                  If two tasks share the same status and deadline, <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-600">1 (High) &lt; 2 (Medium) &lt; 3 (Low)</code> orders the higher priority task first.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Input Validation &amp; Past-Deadline Warning</span>
            </h3>
            <p className="mt-2 text-slate-600 text-xs leading-relaxed">
              The script parses incoming deadlines via <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600">datetime.strptime(deadline, &quot;%Y-%m-%d&quot;).date()</code>. If <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600">due_date &lt; date.today()</code>, it issues an immediate warning: <span className="font-semibold text-amber-700">&quot;Warning: This deadline is in the past.&quot;</span> while still letting students record backlog tasks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
