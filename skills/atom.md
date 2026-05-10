---
description: Generate an atomic design atom component (HTML + SCSS) from a screenshot or design image, updating the shared design system tokens
argument-hint: <path-to-image>
---

You are generating an **atomic design atom** — the smallest indivisible UI building block — from a provided image, and registering all design values into the shared design system.

## Input

The image path is: $ARGUMENTS

---

## Process

### 1. Read the image

Use the Read tool to load the image at `$ARGUMENTS`. If no path was given, ask the user to provide one before continuing.

### 2. Analyse the visual element

Identify every design property visible in the image:

- **Component type** — button, input, badge, tag, label, icon, avatar, chip, toggle, checkbox, radio, divider, spinner, tooltip, etc.
- **Colors** — exact hex values for background, text, border, shadow, and any overlay
- **Typography** — font size (rem), font weight, letter spacing, line height, text transform
- **Spacing** — padding, margin (use rem or px consistently)
- **Shape** — border-radius, border width, border style
- **States** — extract from image if multiple states are visible (default, hover, active, focus, disabled, loading); otherwise infer sensible accessible defaults
- **Variants** — size variants (sm / md / lg), color schemes, or other modifiers visible in the image

### 3. Name the component

Choose a concise **PascalCase** name that describes what the element *is*, not what it does (e.g., `Button`, `Badge`, `TextInput`, `Avatar`, `Chip`, `Toggle`).

Append a qualifier only when needed for disambiguation (e.g., `IconButton`, `StatusBadge`).

---

### 4. Update the design system tokens

The design system lives at `src/styles/_tokens.scss`. It is the single source of truth for all design values — no raw hex codes, px values, or font sizes are ever written directly into component SCSS files. The styles entry point `src/styles/index.scss` forwards both `_tokens.scss` and `_mixins.scss`, so components only need one import.

#### 4a. Read the current tokens file

Use the Read tool on `src/styles/_tokens.scss`.

- If the file does not exist yet, you will create it from scratch in step 4c.
- If it exists, parse the existing tokens so you know what is already defined.

#### 4b. Extract tokens from the image

Map every design value you found in step 2 to a token name using these conventions:

| Category   | SCSS variable pattern            | Examples                                      |
|------------|----------------------------------|-----------------------------------------------|
| Color      | `$color-[role]-[variant]`        | `$color-primary`, `$color-danger-light`       |
| Background | `$color-bg-[role]`               | `$color-bg-surface`, `$color-bg-subtle`       |
| Text       | `$color-text-[role]`             | `$color-text-default`, `$color-text-muted`    |
| Border     | `$color-border-[role]`           | `$color-border-default`, `$color-border-focus`|
| Font size  | `$font-size-[scale]`             | `$font-size-sm`, `$font-size-md`, `$font-size-lg` |
| Font weight| `$font-weight-[name]`            | `$font-weight-regular`, `$font-weight-medium`, `$font-weight-bold` |
| Radius     | `$radius-[scale]`                | `$radius-sm`, `$radius-md`, `$radius-full`    |
| Spacing    | `$space-[n]` (4px scale: 1=4px)  | `$space-1` (4px), `$space-2` (8px), `$space-4` (16px) |
| Shadow     | `$shadow-[scale]`                | `$shadow-sm`, `$shadow-md`                    |
| Transition | `$transition-[property]`         | `$transition-default`                         |

Naming rules:
- Prefer **semantic names** (`$color-primary`) over **literal names** (`$color-blue-500`) so tokens remain valid if the palette changes.
- If the same value already exists in the file under a different name, **reuse that token** — do not create a duplicate.
- Only add tokens that are genuinely new.

#### 4c. Write the updated tokens file

The file structure must follow this layout (add new entries in the correct section; never reorder existing entries):

```scss
// =============================================================================
// Design System Tokens
// src/styles/_tokens.scss
// Single source of truth — never write raw values in component SCSS.
// =============================================================================

// --- Colors ------------------------------------------------------------------

// Brand
// $color-primary: #...;

// Backgrounds
// $color-bg-surface: #...;

// Text
// $color-text-default: #...;
// $color-text-muted: #...;

// Borders
// $color-border-default: #...;

// Feedback
// $color-success: #...;
// $color-danger:  #...;
// $color-warning: #...;

// --- Typography --------------------------------------------------------------

// $font-size-xs:   0.75rem;
// $font-size-sm:   0.875rem;
// $font-size-md:   1rem;
// $font-size-lg:   1.125rem;
// $font-size-xl:   1.25rem;

// $font-weight-regular: 400;
// $font-weight-medium:  500;
// $font-weight-bold:    700;

// $line-height-tight:  1.25;
// $line-height-normal: 1.5;

// --- Spacing (4px base scale) ------------------------------------------------

// $space-1:  0.25rem;   //  4px
// $space-2:  0.5rem;    //  8px
// $space-3:  0.75rem;   // 12px
// $space-4:  1rem;      // 16px
// $space-5:  1.25rem;   // 20px
// $space-6:  1.5rem;    // 24px
// $space-8:  2rem;      // 32px
// $space-10: 2.5rem;    // 40px

// --- Shape -------------------------------------------------------------------

// $radius-sm:   4px;
// $radius-md:   8px;
// $radius-lg:   12px;
// $radius-full: 9999px;

// --- Shadows -----------------------------------------------------------------

// $shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
// $shadow-md: 0 4px 6px rgba(0, 0, 0, 0.08);

// --- Transitions -------------------------------------------------------------

// $transition-default: 0.15s ease;
```

Write only the tokens that are actually needed (uncomment / fill in values that exist in the design; leave the rest as comments or omit them). If the file already exists, merge carefully — preserve all existing tokens, only append new ones.

---

### 5. Create the atom component files

Output directory: `src/components/atoms/[ComponentName]/`

#### `[ComponentName].html`

Write semantic, standalone HTML:

```html
<!-- Atom: [ComponentName] — [one-line description] -->
<element class="[block-name]">
  <!-- inner structure using __elements -->
</element>
```

Rules:
- Use the most semantic HTML5 element (`<button>`, `<input>`, `<span>`, `<img>`, `<a>`, etc.)
- BEM class naming: block = component name in **kebab-case** (e.g., `status-badge`)
- Sub-elements: `block__element` — Modifiers: `block--modifier`
- Add `aria-*` attributes where relevant
- Include one example of each visible variant as a separate commented element

#### `[ComponentName].scss`

```scss
@use '../../../styles' as *;

.block-name {
  // All values must reference $tokens — no raw hex, px, or rem literals.

  // --- Base styles ---
  // Property order: positioning → box model → typography → visual → transitions

  // --- Elements ---
  &__element { }

  // --- Modifiers ---
  &--modifier { }

  // --- States ---
  &:hover { }
  &:focus-visible { }
  &:active { }
  &:disabled,
  &.is-disabled { }
}
```

Rules:
- Every value must use a `$token` from `_tokens.scss` — **no raw literals anywhere in component SCSS**
- `@use '../../../styles' as *` imports the forwarding index so tokens and mixins are both available
- Use `transition: $transition-default` for interactive states
- Size variants (`--sm`, `--lg`) override spacing/font tokens via local custom properties, not duplicate rules

---

### 6. Write all files

Use the Write tool to write:
1. `src/styles/_tokens.scss` (created or updated)
2. `src/components/atoms/[ComponentName]/[ComponentName].html`
3. `src/components/atoms/[ComponentName]/_[component-name].scss` — actual styles
4. `src/components/atoms/[ComponentName]/index.scss` — forwards the component styles:

```scss
@forward './[component-name]';
// @forward './_variables';  // uncomment if component has local variable overrides
// @forward './_mixins';     // uncomment if component has local mixins
```

Optionally create `_variables.scss` or `_mixins.scss` inside the same folder if the component needs local overrides or helpers that should not live in the global design system.

---

### 7. Report back

State:
- Component name and type identified
- Tokens added to `_tokens.scss` (list each new token and its value)
- Tokens reused from existing design system (if file already existed)
- File paths created
- Any design decisions or assumptions made
