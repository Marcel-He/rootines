"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plant, Task } from "@/types";
import { getPlants, getTasksByPlant, saveTask, completeTask } from "@/lib/storage";
import TaskItem from "@/components/TaskItem";
import AddInline from "@/components/AddInline";
import TaskSuggestions from "@/components/TaskSuggestions";
import Toast from "@/components/Toast";
import { nanoid } from "nanoid";

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const plants = await getPlants();
      const found = plants.find((p) => p.id === id) ?? null;
      setPlant(found);
      if (found) setTasks(await getTasksByPlant(id));
    })();
  }, [id]);

  async function handleAddTask(name: string) {
    const task: Task = {
      id: nanoid(),
      plantId: id,
      name,
      completions: [],
    };
    await saveTask(task);
    setTasks((prev) => [...prev, task]);
  }

  async function handleDone(taskId: string) {
    const updated = await completeTask(taskId);
    if (!updated) return;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    setToast(`${updated.name} marked done`);
  }

  if (!plant) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Plant not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{plant.name}</h1>
        <p className="text-sm text-gray-400 mb-6">
          {tasks.length === 0
            ? "No tasks yet — add one below"
            : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} plantId={id} onDone={handleDone} />
          ))}
        </div>

        <AddInline placeholder="Add a task… (press Enter)" onAdd={handleAddTask} />
        <TaskSuggestions
          plantId={id}
          currentTaskNames={tasks.map((t) => t.name)}
          onSelect={handleAddTask}
        />
      </div>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </main>
  );
}
