import { StudyTask } from '../types/planner';
import { getTodayISOString } from '../utils/pythonSorter';

const today = getTodayISOString();

// Helper to compute offset dates
function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    name: 'Implement Dijkstra Graph Algorithm Lab',
    subject: 'Computer Science',
    deadline: today, // Due today!
    priority: 1, // High
    done: false,
    estimatedMinutes: 90,
    notes: 'Implement adjacency list and min-heap priority queue in Python.',
  },
  {
    id: 'task-2',
    name: 'Eigenvalues & Diagonalization Practice Set',
    subject: 'Linear Algebra',
    deadline: offsetDate(1), // Tomorrow
    priority: 1, // High
    done: false,
    estimatedMinutes: 60,
    notes: 'Solve exercises 4.1 to 4.5; review characteristic polynomial proof.',
  },
  {
    id: 'task-3',
    name: 'Reaction Mechanisms Summary Sheet',
    subject: 'Organic Chemistry',
    deadline: offsetDate(2),
    priority: 2, // Medium
    done: false,
    estimatedMinutes: 45,
    notes: 'Synthesize SN1 vs SN2 comparison diagram with solvent effects.',
  },
  {
    id: 'task-4',
    name: 'Draft Literature Review Outline',
    subject: 'Academic Writing',
    deadline: offsetDate(5),
    priority: 3, // Low
    done: false,
    estimatedMinutes: 40,
    notes: 'Select 5 peer-reviewed sources and annotate primary arguments.',
  },
  {
    id: 'task-5',
    name: 'Read Neuroscience Chapter 7: Memory Consolidation',
    subject: 'Cognitive Science',
    deadline: offsetDate(-1), // In the past to showcase warning!
    priority: 2, // Medium
    done: false,
    estimatedMinutes: 50,
    notes: 'Focus on long-term potentiation and hippocampal storage.',
  },
  {
    id: 'task-6',
    name: 'Midterm Self-Assessment Quiz',
    subject: 'Computer Science',
    deadline: offsetDate(-2), // Completed past task
    priority: 1, // High
    done: true,
    estimatedMinutes: 30,
    completedAt: '2026-10-10T14:30:00Z',
    notes: 'Scored 94% on dynamic programming modules.',
  },
];

export const ACADEMIC_SUBJECTS = [
  'Computer Science',
  'Linear Algebra',
  'Organic Chemistry',
  'Cognitive Science',
  'Academic Writing',
  'Physics',
  'Economics',
  'Statistics',
];
