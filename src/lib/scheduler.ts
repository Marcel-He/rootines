export function getNextDueDate(completions: string[]): Date | null {
  if (completions.length < 2) return null;
  const sorted = completions.map((c) => new Date(c).getTime()).sort((a, b) => a - b);
  const intervals = sorted.slice(1).map((t, i) => t - sorted[i]);
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return new Date(sorted[sorted.length - 1] + avg);
}

export function getDueLabel(completions: string[]): string {
  const next = getNextDueDate(completions);
  if (!next) {
    return completions.length === 1 ? "Done once — do it again to set schedule" : "No schedule yet";
  }
  const diff = Math.round((next.getTime() - Date.now()) / 86400000);
  if (diff < 0) return `Overdue by ${Math.abs(diff)}d`;
  if (diff === 0) return "Due today";
  return `Due in ${diff}d`;
}
