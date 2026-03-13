# @babybase/ui

A framework-agnostic UI component library. Components are raw HTML + CSS — no JavaScript, no framework. Consumers copy the markup and import a single CSS bundle.

## Dev server

```
pnpm dev   # http://localhost:3010
```

## Package structure

```
components/
  <name>/
    <name>.css.ts   ← component styles
    <name>.ts       ← dev server preview & minimal markup
  icons/            ← SVG icon functions
  logos/            ← SVG logo functions
dev/
  server.ts         ← Hono dev server routes
  shell.ts          ← HTML shell + componentPage() layout
  previews.ts       ← logo preview helpers
  getting-started.ts
css.ts              ← aggregates all component CSS into one export
index.ts            ← public package exports
tag.ts              ← css`` tagged template literal helper
```

## Adding a new component

### 1. Create the component folder

```
components/<name>/
  <name>.css.ts
  <name>.ts
```

### 2. Write the CSS (`<name>.css.ts`)

Use the `css` tagged template literal from `../../tag.ts` for editor syntax highlighting:

```ts
import { css } from "../../tag.ts";

export const buttonCss = css`
.btn {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
}
`;
```

### 3. Write the example (`<name>.ts`)

Export an object with three fields:

```ts
import { html, raw } from "hono/html";
import { buttonCss } from "./button.css.ts";

export const buttonExample = {  // named <name>Example
  description: "One sentence describing what the component does and when to use it.",

  preview: html`
    <style>${raw(buttonCss)}</style>
    <!-- A realistic demo with multiple variants or states -->
    <button class="btn">Click me</button>`,

  markup: html`<button class="btn">Click me</button>`,
};
```

- `preview` — shown in the dot-grid preview box; the full CSS bundle is already injected by the shell, so no `<style>` tag is needed. Only add a `<style>` tag for preview-specific overrides (e.g. disabling animations for a static screenshot)
- `markup` — the minimal copy-paste snippet shown in the Markup block; no `<style>` tag
- `description` — plain sentence shown below the page title

Both `preview` and `markup` use `html\`\`` from `hono/html`.

### 4. Register the CSS in `css.ts`

```ts
import { tooltipCss } from "./components/tooltip/tooltip.css.ts";
import { buttonCss } from "./components/button/button.css.ts";

export { tooltipCss, buttonCss };

export const css = [tooltipCss, buttonCss].join("\n");
```

### 5. Export from `index.ts`

```ts
export { css, tooltipCss, buttonCss } from "./css.ts";
```

### 6. Add a route in `dev/server.ts`

```ts
import { buttonExample } from "../components/button/button.ts";

app.get("/components/button", (c) => c.html(componentPage("button", buttonExample)));
```

### 7. Add to the sidebar nav in `dev/shell.ts`

```ts
const NAV = [
  // ...
  {
    group: "Components",
    items: [
      { label: "tooltip", href: "/components/tooltip" },
      { label: "button", href: "/components/button" },  // ← add here
    ],
  },
];
```

## Adding an icon or logo

Icons and logos are SVG functions — they take an optional `size` parameter and return an SVG string.

```ts
// components/icons/my-icon.ts
import { raw } from "hono/html";

export function iconMyIcon(size = 16) {
  return raw(`<svg width="${size}" height="${size}" ...>...</svg>`);
}
```

- Export from `index.ts`
- Add to the `ICONS` array in `dev/server.ts` to include it on the `/icons` page

## What the package exports — and what it does NOT

The package exports **CSS only** (and SVG icon/logo functions).

**Never export HTML or markup functions from this package.** Components are consumed by copy-pasting the minimal markup from the dev server into the consumer project. The dev server exists solely to document and preview that markup — it is not a runtime dependency.

This means:
- `index.ts` exports CSS strings and icon/logo functions only
- Component `.ts` files may contain helper functions (like `toastHtml`) for internal use in the dev server preview, but those functions must NOT be re-exported from `index.ts`
- If a consumer needs a helper to generate component markup (e.g. a toast factory), they write it themselves in their own project

## Consuming the library

Consumers import CSS once and copy markup from the dev server:

```ts
import { css } from "@babybase/ui";

// In your HTML shell:
// <style>${css}</style>
```

Individual CSS strings are also exported if you only want one component:

```ts
import { tooltipCss } from "@babybase/ui";
```
