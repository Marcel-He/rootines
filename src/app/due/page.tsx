"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Task } from "@/types";
import { getPlants, getAllTasks, completeTask } from "@/lib/storage";
import { getNextDueDate } from "@/lib/scheduler";
import TaskItem from "@/components/TaskItem";
import Toast from "@/components/Toast";

export default function DuePage() {
  const [plantMap, setPlantMap] = useState<Record<string, string>>({});
  const [dueTasks, setDueTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const plants = getPlants();
    const map: Record<string, string> = {};
    plants.forEach((p) => { map[p.id] = p.name; });
    setPlantMap(map);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const tasks = getAllTasks()
      .filter((task) => {
        const next = getNextDueDate(task.completions);
        return next !== null && next <= endOfToday;
      })
      .sort((a, b) => {
        const aDate = getNextDueDate(a.completions)!;
        const bDate = getNextDueDate(b.completions)!;
        return aDate.getTime() - bDate.getTime();
      });

    setDueTasks(tasks);
  }, []);

  function handleDone(taskId: string) {
    const updated = completeTask(taskId);
    if (!updated) return;
    setToast(`${updated.name} marked done`);
    setDueTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Plants
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Due Now</h1>
        <p className="text-sm text-gray-400 mb-6">
          {dueTasks.length === 0
            ? "All caught up"
            : `${dueTasks.length} task${dueTasks.length !== 1 ? "s" : ""} need attention`}
        </p>

        {dueTasks.length === 0 ? (
          <p className="text-center text-gray-400 py-12">All caught up!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {dueTasks.map((task) => (
              <div key={task.id}>
                <p className="text-xs text-gray-400 mb-1 px-1">{plantMap[task.plantId]}</p>
                <TaskItem task={task} plantId={task.plantId} onDone={handleDone} />
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </main>
  );
}
