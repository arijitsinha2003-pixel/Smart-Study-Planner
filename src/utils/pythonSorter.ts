import { StudyTask } from '../types/planner';

/**
 * Implements the exact Python sorting logic:
 * ordered = sorted(
 *     tasks,
 *     key=lambda t: (t["done"], t["deadline"], t["priority"])
 * )
 * 
 * In Python:
 * - False (0) < True (1), so pending tasks come before completed tasks.
 * - Earliest deadline string (e.g. '2026-10-12') < later string ('2026-10-15')
 * - Priority 1 (High) < Priority 2 (Medium) < Priority 3 (Low)
 */
export function sortTasksPython(tasks: StudyTask[]): StudyTask[] {
  return [...tasks].sort((a, b) => {
    // 1. Done status: False (0) before True (1)
    const doneA = a.done ? 1 : 0;
    const doneB = b.done ? 1 : 0;
    if (doneA !== doneB) {
      return doneA - doneB;
    }

    // 2. Deadline date comparison
    if (a.deadline !== b.deadline) {
      return a.deadline.localeCompare(b.deadline);
    }

    // 3. Priority comparison (1 before 2 before 3)
    return a.priority - b.priority;
  });
}

/**
 * Check if a date string in YYYY-MM-DD format is in the past
 * (Matching: due_date < date.today())
 */
export function isPastDeadline(deadlineStr: string): boolean {
  if (!deadlineStr) return false;
  const todayStr = getTodayISOString();
  return deadlineStr < todayStr;
}

export function isDueToday(deadlineStr: string): boolean {
  return deadlineStr === getTodayISOString();
}

export function getTodayISOString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDeadlineFriendly(deadlineStr: string): string {
  if (!deadlineStr) return 'No deadline';
  try {
    const [y, m, d] = deadlineStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return deadlineStr;
  }
}

export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1:
      return 'Priority 1 (High)';
    case 2:
      return 'Priority 2 (Medium)';
    case 3:
      return 'Priority 3 (Low)';
    default:
      return `Priority ${priority}`;
  }
}

/**
 * Generates the full executable Python script matching the user's provided code,
 * with current tasks seeded into the initial tasks list!
 */
export function generatePythonScript(tasks: StudyTask[]): string {
  const pythonTasksRepresentation = tasks
    .map((t) => {
      const [y, m, d] = t.deadline.split('-');
      return `    {
        "name": ${JSON.stringify(t.name)},
        "subject": ${JSON.stringify(t.subject)},
        "deadline": date(${parseInt(y, 10)}, ${parseInt(m, 10)}, ${parseInt(d, 10)}),
        "priority": ${t.priority},
        "done": ${t.done ? 'True' : 'False'}
    }`;
    })
    .join(',\n');

  return `from datetime import date, datetime

# Initial student tasks synced from Smart Study Planner
tasks = [
${pythonTasksRepresentation}
]

def add_task():
    name = input("Enter task name: ")
    subject = input("Enter subject: ")
    deadline = input("Deadline (YYYY-MM-DD): ")

    try:
        due_date = datetime.strptime(
            deadline, "%Y-%m-%d"
        ).date()
        if due_date < date.today():
            print("Warning: This deadline is in the past.")
    except ValueError:
        print("Invalid date format.")
        return

    try:
        priority = int(input("Priority (1=High, 2=Medium, 3=Low): "))
        if priority not in (1, 2, 3):
            print("Priority must be 1, 2, or 3.")
            return
    except ValueError:
        print("Enter a valid priority.")
        return

    tasks.append({
        "name": name,
        "subject": subject,
        "deadline": due_date,
        "priority": priority,
        "done": False
    })
    print("Task added successfully!")

def view_tasks():
    if not tasks:
        print("No tasks added yet.")
        return

    ordered = sorted(
        tasks,
        key=lambda t: (t["done"], t["deadline"], t["priority"])
    )

    for i, task in enumerate(ordered, start=1):
        status = "Completed" if task["done"] else "Pending"
        print(
            f'{i}. {task["name"]} | {task["subject"]} | '
            f'{task["deadline"]} | Priority {task["priority"]} | {status}'
        )

def complete_task():
    view_tasks()
    if not tasks:
        return

    try:
        number = int(input("Enter original task number to complete: "))
        if 1 <= number <= len(tasks):
            tasks[number - 1]["done"] = True
            print("Task marked completed!")
        else:
            print("Invalid task number.")
    except ValueError:
        print("Enter a valid number.")

def main():
    while True:
        print("\\n--- SMART STUDY PLANNER ---")
        print("1. Add task")
        print("2. View tasks")
        print("3. Complete task")
        print("4. Exit")

        choice = input("Choose: ").strip()

        if choice == "1":
            add_task()
        elif choice == "2":
            view_tasks()
        elif choice == "3":
            complete_task()
        elif choice == "4":
            print("Goodbye! Keep up the great study momentum.")
            break
        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()
`;
}
