"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types";
import { getAllTasks } from "@/lib/storage";

type Props = {
  plantId: string;
  currentTaskNames: string[];
  onSelect: (name: string) => void;
};

export default function TaskSuggestions({ plantId, currentTaskNames, onSelect }: Props) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    getAllTasks().then(setAllTasks);
  }, []);

  const currentSet = new Set(currentTaskNames.map((n) => n.trim().toLowerCase()));

  const freq: Record<string, { count: number; canonical: string }> = {};
  for (const task of allTasks) {
    if (task.plantId === plantId) continue;
    const key = task.name.trim().toLowerCase();
    if (!freq[key]) freq[key] = { count: 0, canonical: task.name.trim() };
    freq[key].count++;
  }

  const suggestions = Object.entries(freq)
    .filter(([key]) => !currentSet.has(key))
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([, { canonical }]) => canonical);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {suggestions.map((name) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 active:scale-95 transition-all border border-green-100"
        >
          + {name}
        </button>
      ))}
    </div>
  );
}
