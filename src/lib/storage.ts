import { Plant, Task } from "@/types";
import { createClient } from "./supabase-browser";

function rowToPlant(row: Record<string, unknown>): Plant {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
  };
}

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    plantId: row.plant_id as string,
    name: row.name as string,
    completions: (row.completions as string[]) ?? [],
    color: (row.color as string | null) ?? undefined,
  };
}

async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getPlants(): Promise<Plant[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("plants").select("*").order("created_at");
  if (error || !data) return [];
  return data.map(rowToPlant);
}

export async function savePlant(plant: Plant): Promise<void> {
  const supabase = createClient();
  const userId = await getUserId();
  await supabase.from("plants").upsert({
    id: plant.id,
    name: plant.name,
    created_at: plant.createdAt,
    user_id: userId,
  });
}

export async function deletePlant(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("plants").delete().eq("id", id);
}

export async function getAllTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("tasks").select("*");
  if (error || !data) return [];
  return data.map(rowToTask);
}

export async function getTasksByPlant(plantId: string): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("tasks").select("*").eq("plant_id", plantId);
  if (error || !data) return [];
  return data.map(rowToTask);
}

export async function saveTask(task: Task): Promise<void> {
  const supabase = createClient();
  const userId = await getUserId();
  await supabase.from("tasks").upsert({
    id: task.id,
    plant_id: task.plantId,
    name: task.name,
    completions: task.completions,
    color: task.color ?? null,
    user_id: userId,
  });
}

export async function completeTask(taskId: string): Promise<Task | null> {
  const supabase = createClient();
  const { data: row } = await supabase.from("tasks").select("*").eq("id", taskId).single();
  if (!row) return null;
  const completions = [...((row.completions as string[]) ?? []), new Date().toISOString()].sort();
  const { data: updated } = await supabase
    .from("tasks")
    .update({ completions })
    .eq("id", taskId)
    .select()
    .single();
  if (!updated) return null;
  return rowToTask(updated);
}

export async function updateTask(taskId: string, patch: Partial<Task>): Promise<Task | null> {
  const supabase = createClient();
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.color !== undefined) dbPatch.color = patch.color;
  if (patch.completions !== undefined) dbPatch.completions = patch.completions;
  const { data: updated } = await supabase
    .from("tasks")
    .update(dbPatch)
    .eq("id", taskId)
    .select()
    .single();
  if (!updated) return null;
  return rowToTask(updated);
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("tasks").delete().eq("id", id);
}
