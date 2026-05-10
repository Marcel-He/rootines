import { Plant, Task } from "@/types";

const PLANTS_KEY = "plants";
const TASKS_KEY = "tasks";

export function getPlants(): Plant[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PLANTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function savePlant(plant: Plant): void {
  const plants = getPlants();
  const existing = plants.findIndex((p) => p.id === plant.id);
  if (existing >= 0) {
    plants[existing] = plant;
  } else {
    plants.push(plant);
  }
  localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
}

export function deletePlant(id: string): void {
  const plants = getPlants().filter((p) => p.id !== id);
  localStorage.setItem(PLANTS_KEY, JSON.stringify(plants));
  const tasks = getAllTasks().filter((t) => t.plantId !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getAllTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getTasksByPlant(plantId: string): Task[] {
  return getAllTasks().filter((t) => t.plantId === plantId);
}

export function saveTask(task: Task): void {
  const tasks = getAllTasks();
  const existing = tasks.findIndex((t) => t.id === task.id);
  if (existing >= 0) {
    tasks[existing] = task;
  } else {
    tasks.push(task);
  }
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function completeTask(taskId: string): Task | null {
  const tasks = getAllTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;
  task.completions = [...task.completions, new Date().toISOString()].sort();
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return task;
}

export function updateTask(taskId: string, patch: Partial<Task>): Task | null {
  const tasks = getAllTasks();
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;
  tasks[idx] = { ...tasks[idx], ...patch };
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return tasks[idx];
}

export function deleteTask(id: string): void {
  const tasks = getAllTasks().filter((t) => t.id !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}
