import { Plant, Task } from "@/types";
import { getDueLabel, getNextDueDate } from "@/lib/scheduler";
import Link from "next/link";

type Props = {
  plant: Plant;
  tasks: Task[];
};

function getMostUrgentLabel(tasks: Task[]): string {
  if (tasks.length === 0) return "No tasks yet";

  const overdue = tasks.filter((t) => {
    const label = getDueLabel(t.completions);
    return label.startsWith("Overdue");
  });
  if (overdue.length > 0) return `${overdue.length} overdue`;

  const dueToday = tasks.filter((t) => getDueLabel(t.completions) === "Due today");
  if (dueToday.length > 0) return "Due today";

  const upcoming = tasks
    .map((t) => getNextDueDate(t.completions))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (upcoming.length > 0) {
    const diff = Math.round((upcoming[0].getTime() - Date.now()) / 86400000);
    return `Next in ${diff}d`;
  }

  return "No schedule yet";
}

export default function PlantCard({ plant, tasks }: Props) {
  const urgentLabel = getMostUrgentLabel(tasks);
  const isUrgent = urgentLabel.includes("overdue") || urgentLabel === "Due today";

  return (
    <Link href={`/plants/${plant.id}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-semibold text-gray-900 truncate">{plant.name}</span>
          <span className="text-xs text-gray-400">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${
            isUrgent ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"
          }`}
        >
          {urgentLabel}
        </span>
      </div>
    </Link>
  );
}
