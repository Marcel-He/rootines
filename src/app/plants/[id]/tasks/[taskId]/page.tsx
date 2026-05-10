"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Task } from "@/types";
import { getTasksByPlant, completeTask, updateTask } from "@/lib/storage";
import { getDueLabel, getNextDueDate } from "@/lib/scheduler";
import { TASK_COLORS, getColor } from "@/lib/colors";
import Toast from "@/components/Toast";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatInterval(ms: number): string {
  const totalMinutes = Math.round(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  return parts.join(" ") || "< 1m";
}

export default function TaskDetailPage() {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const tasks = getTasksByPlant(id);
    setTask(tasks.find((t) => t.id === taskId) ?? null);
  }, [id, taskId]);

  function handleDone() {
    const updated = completeTask(taskId);
    if (!updated) return;
    setTask(updated);
    setToast(true);
  }

  function handleColorChange(colorId: string) {
    const updated = updateTask(taskId, { color: colorId });
    if (updated) setTask(updated);
  }

  if (!task) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Task not found.</p>
      </main>
    );
  }

  const sorted = [...task.completions].sort();
  const intervals = sorted.slice(1).map((t, i) => new Date(t).getTime() - new Date(sorted[i]).getTime());
  const avgMs = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : null;
  const nextDue = getNextDueDate(task.completions);
  const dueLabel = getDueLabel(task.completions);
  const isOverdue = dueLabel.startsWith("Overdue");
  const isDueToday = dueLabel === "Due today";
  const activeColor = getColor(task.color);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`shrink-0 w-3 h-3 rounded-full ${activeColor.bg}`} />
            <h1 className="text-2xl font-bold text-gray-900 truncate">{task.name}</h1>
          </div>
          <button
            onClick={handleDone}
            className="shrink-0 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 active:scale-95 transition-all"
          >
            Mark done
          </button>
        </div>

        {/* Color picker */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Color</p>
          <div className="flex gap-3 flex-wrap">
            {TASK_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleColorChange(c.id)}
                className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                  activeColor.id === c.id ? `ring-2 ring-offset-2 ${c.ring}` : "opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Schedule summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Schedule</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Status</p>
              <p
                className={`text-sm font-semibold ${
                  isOverdue ? "text-red-500" : isDueToday ? "text-amber-500" : "text-gray-800"
                }`}
              >
                {dueLabel}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Next due</p>
              <p className="text-sm font-semibold text-gray-800">
                {nextDue
                  ? nextDue.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Avg interval</p>
              <p className="text-sm font-semibold text-gray-800">
                {avgMs !== null ? formatInterval(avgMs) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total completions</p>
              <p className="text-sm font-semibold text-gray-800">{sorted.length}</p>
            </div>
          </div>
        </div>

        {/* Completion history */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">History</p>
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400">No completions yet.</p>
          ) : (
            <div className="flex flex-col">
              {[...sorted].reverse().map((iso, revIdx) => {
                const origIdx = sorted.length - 1 - revIdx;
                const interval = intervals[origIdx - 1];
                return (
                  <div key={iso} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-gray-800">{formatDate(iso)}</p>
                      {interval !== undefined && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatInterval(interval)} since previous
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-300">#{origIdx + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message="Marked done" onDone={() => setToast(false)} />}
    </main>
  );
}
