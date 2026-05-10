# Plant Tracker

A minimal web app for tracking plant care tasks. The core idea: no long setup forms — add a plant name, add task names, mark them done. The app learns from completion history and auto-calculates the next due date based on the average interval between completions.

## Design Principle: Usability First

**Easy and straightforward usability is the highest priority** when making any product or code decision.

- Fewer taps/clicks is always better. Prefer one-tap actions over multi-step flows.
- Never add friction: no confirmation dialogs, no required fields beyond the minimum, no onboarding.
- If a feature would make the UI busier or harder to scan, don't add it.
- Default states should be immediately useful — the user should never feel lost or stuck.
- When in doubt between two approaches, choose the one a first-time user would find obvious without explanation.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** — Postgres database + Auth (magic link email)
- **Node.js 26** (upgraded from 20.2.0 during initial setup)

## Goal & USP

Fast to open, one tap to log a task. The schedule emerges automatically from usage — mark a task done twice and it will start showing a due date.

## Future plans

The plan is to eventually build a React Native iOS app. To support this:
- Core logic (`lib/scheduler.ts`, `types/`, storage interface) is kept framework-agnostic
- Next.js API routes will become the shared backend when that time comes

## Data Model (`src/types/index.ts`)

```ts
type Plant = {
  id: string;        // nanoid
  name: string;
  createdAt: string; // ISO
};

type Task = {
  id: string;        // nanoid
  plantId: string;
  name: string;
  completions: string[]; // ISO timestamps, sorted ascending
  color?: string;        // color id from TASK_COLORS palette
};
```

Data is stored in Supabase Postgres in `plants` and `tasks` tables. Both tables have `user_id uuid` (references `auth.users`) with RLS enabled — users only see their own rows.

## Auto-scheduling Logic (`src/lib/scheduler.ts`)

- `getNextDueDate(completions)` — returns `null` if fewer than 2 completions, otherwise: `lastCompletion + avgInterval`
- `getDueLabel(completions)` — returns a human string: "No schedule yet", "Done once — do it again to set schedule", "Due today", "Due in Xd", "Overdue by Xd"

## Color System (`src/lib/colors.ts`)

9 preset colors (gray, red, orange, yellow, green, teal, blue, purple, pink) stored as `TASK_COLORS`. Each entry has `id`, `bg` (Tailwind class), `ring` (Tailwind class), and `hex`. `getColor(id?)` always returns a fallback (gray) so color is never undefined in the UI.

## File Structure

```
src/
  app/
    layout.tsx                      # Root layout, metadata
    page.tsx                        # / — plant list
    login/
      page.tsx                      # /login — magic link email form
    auth/
      callback/
        route.ts                    # /auth/callback — exchanges magic link token for session
    plants/
      [id]/
        page.tsx                    # /plants/[id] — plant detail + task list
        tasks/
          [taskId]/
            page.tsx                # /plants/[id]/tasks/[taskId] — task detail
  components/
    AddInline.tsx                   # Reusable inline text input (Enter to submit)
    PlantCard.tsx                   # Plant name + task count + most urgent due label
    TaskItem.tsx                    # Task row: color dot + name + due label + Done button
    Toast.tsx                       # Slide-up feedback notification (auto-dismisses ~2s)
  lib/
    storage.ts                      # Supabase CRUD — getPlants, savePlant, deletePlant,
                                    #   getTasksByPlant, saveTask, updateTask, completeTask, deleteTask
    supabase-browser.ts             # Supabase browser client (used in "use client" components)
    supabase-server.ts              # Supabase server client (used in proxy.ts)
    scheduler.ts                    # Due date calculation logic (framework-agnostic)
    colors.ts                       # Color palette + getColor helper
  types/
    index.ts                        # Plant and Task types (framework-agnostic)
  proxy.ts                          # Auth guard — redirects unauthenticated users to /login
```

## Key Behaviours

- **Login (`/login`)** — magic link email form; session lasts up to 60 days with auto-refresh
- **Plant list (`/`)** — plant cards with most-urgent due label; inline add at bottom; Sign out button
- **Plant detail (`/plants/[id]`)** — task list with color dot, due label, Done button; inline add; toast on Done
- **Task detail (`/plants/[id]/tasks/[taskId]`)** — color picker, schedule summary (status, next due, avg interval, total completions), full completion history with per-entry intervals; toast on Mark done
- **Toast** — slides up on task completion, auto-dismisses after ~2s

## Dev

```bash
npm run dev   # starts on localhost:3000
```

## Rules

- Never read `.env.local`
