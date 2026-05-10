"use client";

import Link from "next/link";
import { Task } from "@/types";
import { getDueLabel } from "@/lib/scheduler";
import { getColor } from "@/lib/colors";

type Props = {
  task: Task;
  plantId: string;
  onDone: (taskId: string) => void;
};

export default function TaskItem({ task, plantId, onDone }: Props) {
  const label = getDueLabel(task.completions);
  const isOverdue = label.startsWith("Overdue");
  const isDueToday = label === "Due today";
  const color = getColor(task.color);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200">
      <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${color.bg}`} />
      <Link href={`/plants/${plantId}/tasks/${task.id}`} className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-medium text-gray-900 truncate hover:text-green-700 transition-colors">{task.name}</span>
        <span
          className={`text-xs ${
            isOverdue ? "text-red-500" : isDueToday ? "text-amber-500" : "text-gray-400"
          }`}
        >
          {label}
        </span>
      </Link>
      <button
        onClick={() => onDone(task.id)}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 active:scale-95 transition-all"
      >
        Done
      </button>
    </div>
  );
}
