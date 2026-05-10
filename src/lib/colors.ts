export const TASK_COLORS = [
  { id: "gray",   bg: "bg-gray-400",   ring: "ring-gray-400",   hex: "#9ca3af" },
  { id: "red",    bg: "bg-red-400",    ring: "ring-red-400",    hex: "#f87171" },
  { id: "orange", bg: "bg-orange-400", ring: "ring-orange-400", hex: "#fb923c" },
  { id: "yellow", bg: "bg-yellow-400", ring: "ring-yellow-400", hex: "#facc15" },
  { id: "green",  bg: "bg-green-400",  ring: "ring-green-400",  hex: "#4ade80" },
  { id: "teal",   bg: "bg-teal-400",   ring: "ring-teal-400",   hex: "#2dd4bf" },
  { id: "blue",   bg: "bg-blue-400",   ring: "ring-blue-400",   hex: "#60a5fa" },
  { id: "purple", bg: "bg-purple-400", ring: "ring-purple-400", hex: "#c084fc" },
  { id: "pink",   bg: "bg-pink-400",   ring: "ring-pink-400",   hex: "#f472b6" },
] as const;

export type ColorId = typeof TASK_COLORS[number]["id"];

export function getColor(id?: string) {
  return TASK_COLORS.find((c) => c.id === id) ?? TASK_COLORS[0];
}
