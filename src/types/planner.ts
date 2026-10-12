export type PriorityLevel = 1 | 2 | 3;

export interface StudyTask {
  id: string;
  name: string;
  subject: string;
  deadline: string; // YYYY-MM-DD
  priority: PriorityLevel; // 1 = High, 2 = Medium, 3 = Low
  done: boolean;
  notes?: string;
  estimatedMinutes?: number;
  completedAt?: string;
}

export type ViewMode = 'dashboard' | 'daily-goals' | 'focus-timer' | 'python-studio';

export type PriorityFilter = 'all' | '1' | '2' | '3';
export type StatusFilter = 'all' | 'pending' | 'completed' | 'due-today' | 'overdue';
