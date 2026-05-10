"use client";

import { useEffect, useState } from "react";
import { Plant, Task } from "@/types";
import { getPlants, savePlant, getTasksByPlant } from "@/lib/storage";
import PlantCard from "@/components/PlantCard";
import AddInline from "@/components/AddInline";
import { nanoid } from "nanoid";

export default function Home() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [taskMap, setTaskMap] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    const loaded = getPlants();
    setPlants(loaded);
    const map: Record<string, Task[]> = {};
    loaded.forEach((p) => {
      map[p.id] = getTasksByPlant(p.id);
    });
    setTaskMap(map);
  }, []);

  function handleAddPlant(name: string) {
    const plant: Plant = { id: nanoid(), name, createdAt: new Date().toISOString() };
    savePlant(plant);
    setPlants((prev) => [...prev, plant]);
    setTaskMap((prev) => ({ ...prev, [plant.id]: [] }));
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Plants</h1>
        <p className="text-sm text-gray-400 mb-6">
          {plants.length === 0
            ? "Add your first plant below"
            : `${plants.length} plant${plants.length !== 1 ? "s" : ""}`}
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} tasks={taskMap[plant.id] ?? []} />
          ))}
        </div>

        <AddInline placeholder="Add a plant… (press Enter)" onAdd={handleAddPlant} />
      </div>
    </main>
  );
}
