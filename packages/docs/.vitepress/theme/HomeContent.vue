<script setup lang="ts">
const _features = [
  {
    num: "01",
    title: "Self-hosted",
    desc: "Runs entirely on your machine. Your data never leaves your environment.",
    detail: "No cloud. No account. No monthly bill.",
  },
  {
    num: "02",
    title: "SQLite native",
    desc: "Built on Node's built-in SQLite module. No ORM, no abstraction layers.",
    detail: "node:sqlite · zero external deps",
  },
  {
    num: "03",
    title: "Schema visualization",
    desc: "Browse tables, inspect columns, and visualize relations at a glance.",
    detail: "Live ER diagram · FK detection",
  },
  {
    num: "04",
    title: "Data management",
    desc: "View, insert, edit, and delete rows. Run migrations. Manage backups.",
    detail: "Migrations · backups · row editing",
  },
];
</script>

<template>
  <div class="pb-home">
    <!-- ── Hero ──────────────────────────────────────── -->
    <section class="pb-hero">
      <div class="pb-hero-bg" aria-hidden="true"></div>

      <div class="pb-container">
      <div class="pb-hero-content">
        <h1 class="pb-headline">Your SQLite<br />database,<br />in the browser.</h1>

        <p class="pb-tagline">
          A lightweight admin panel for SQLite.<br />
          Run it on the fly or embed it in your app.
        </p>

        <div class="pb-actions">
          <a class="pb-btn-primary" href="/babybase/guide/getting-started"
            >Get Started
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 12l14 0" />
              <path d="M15 16l4 -4" />
              <path d="M15 8l4 4" /></svg
          ></a>
          <a
            class="pb-btn-ghost"
            href="https://github.com/erikthalen/babybase"
            target="_blank"
            rel="noopener noreferrer"
            >View on GitHub</a
          >
        </div>
      </div>
      </div>

      <div class="pb-hero-shots" aria-hidden="true">
        <img class="pb-hero-shot pb-hero-shot--back" src="/babybase/screenshot-2.jpg" alt="" />
        <img class="pb-hero-shot pb-hero-shot--front" src="/babybase/screenshot-1.jpg" alt="" />
      </div>
    </section>

    <!-- ── CLI spotlight ─────────────────────────────── -->
    <section class="pb-cli">
      <div class="pb-container">
        <div class="pb-cli-inner">
          <div class="pb-cli-copy">
            <p class="pb-cli-eyebrow">Option 1 — on the fly</p>
            <h2 class="pb-cli-heading">One command.<br />Browser opens.</h2>
            <p class="pb-cli-desc">
              No config, no setup. Point it at any <code>.db</code> file
              and your browser opens automatically. Great for quick
              exploration or one-off tasks.
            </p>
            <a class="pb-btn-primary pb-cli-link" href="/babybase/guide/cli"
              >CLI reference
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12l14 0" />
                <path d="M15 16l4 -4" />
                <path d="M15 8l4 4" />
              </svg>
            </a>
          </div>
          <div class="pb-terminal" aria-hidden="true">
            <div class="pb-terminal-bar">
              <span class="pb-dot"></span>
              <span class="pb-dot"></span>
              <span class="pb-dot"></span>
              <span class="pb-terminal-title">terminal</span>
            </div>
            <pre
              class="pb-terminal-body"
            ><span class="t-prompt">$ </span><span class="t-cmd">npx babybase</span><span class="t-arg"> ./data.db</span>

<span class="t-logo">╷    ─╮ ╷   ╷ ╷ ╷    ─╮ ╭─╮ ╭─╮
├─╮ ╭─┤ ├─╮ ╰─┤ ├─╮ ╭─┤ ╰─╮ ├─ 
╰─╯ ╰─╯ ╰─╯   ╵ ╰─╯ ╰─╯  ─╯ ╰─╯</span>

<span class="t-dim">  Server started on port </span><span class="t-url">3000</span><span class="t-dim">.</span>
<span class="t-dim">  Browse your database at </span><span class="t-url">http://localhost:3000</span>

<span class="t-dim">  database  </span><span class="t-muted">./data.db</span>
<span class="t-dim">  storage   </span><span class="t-muted">./.babybase/storage</span></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Embed ──────────────────────────────────────── -->
    <section class="pb-embed">
      <div class="pb-container">
        <div class="pb-embed-inner">
          <div class="pb-embed-copy">
            <p class="pb-cli-eyebrow">Option 2 — self-hosted</p>
            <h2 class="pb-embed-heading">Already have<br />an app?</h2>
            <p class="pb-embed-desc">
              Mount it as a route inside your existing Hono server and
              it travels with your deployment. Protect it with whatever
              auth you already have — no new infrastructure needed.
            </p>
            <a class="pb-btn-primary pb-embed-link" href="/babybase/guide/getting-started">
              Getting started
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M5 12l14 0"/><path d="M15 16l4 -4"/><path d="M15 8l4 4"/>
              </svg>
            </a>
          </div>
          <div class="pb-editor">
            <div class="pb-editor-bar">
              <div class="pb-editor-tab">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pb-editor-tab-icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/></svg>
                server.ts
              </div>
            </div>
            <pre
              class="pb-editor-body"
            ><span class="e-k">import</span> { <span class="e-i">Hono</span> } <span class="e-k">from</span> <span class="e-s">"hono"</span>
<span class="e-k">import</span> { <span class="e-i">serve</span> } <span class="e-k">from</span> <span class="e-s">"@hono/node-server"</span>
<span class="e-k">import</span> { <span class="e-i">defineBabybase</span> } <span class="e-k">from</span> <span class="e-s">"@babybase/core"</span>

<span class="e-k">const</span> app = <span class="e-k">new</span> <span class="e-t">Hono</span>()

<span class="e-c">// protect with your own auth middleware</span>
app.<span class="e-f">use</span>(<span class="e-s">"/admin/*"</span>, authMiddleware)
app.<span class="e-f">route</span>(<span class="e-s">"/admin"</span>, <span class="e-f">defineBabybase</span>({
  database: <span class="e-s">"./app.db"</span>,
}))

<span class="e-f">serve</span>(app)</pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Features ──────────────────────────────────── -->
    <section class="pb-features" aria-label="Features">
      <div class="pb-container">
        <div class="pb-features-grid">
          <div v-for="f in _features" :key="f.num" class="pb-feature">
            <span class="pb-feature-num" aria-hidden="true">{{ f.num }}</span>
            <h3 class="pb-feature-title">{{ f.title }}</h3>
            <p class="pb-feature-desc">{{ f.desc }}</p>
            <p class="pb-feature-detail">{{ f.detail }}</p>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* ── Tokens ─────────────────────────────────────────── */
.pb-home {
  --bg: #080808;
  --bg-card: #0f0f0f;
  --bg-elevated: #161616;
  --border: #1c1c1c;
  --border-mid: #2a2a2a;
  --text: #efefef;
  --text-muted: #777777;
  --text-dim: #a1a1a1;
  --accent: #2dd4bf;
  --accent-dim: rgba(45, 212, 191, 0.06);
  --accent-glow: rgba(45, 212, 191, 0.22);
  --font-display: "Be Vietnam Pro", sans-serif;
  --font-body: "Be Vietnam Pro", sans-serif;
  --font-mono: "Atkinson Hyperlegible Mono", ui-monospace, monospace;

  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

/* ── Container ──────────────────────────────────────── */
.pb-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── Hero ───────────────────────────────────────────── */
.pb-hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  padding: 7rem 0 5rem;
  overflow: hidden;
}

.pb-hero-bg {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(
      ellipse 90% 60% at 50% -10%,
      rgba(45, 212, 191, 0.07) 0%,
      transparent 70%
    ),
    linear-gradient(to right, var(--border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border) 1px, transparent 1px);
  background-size:
    auto,
    48px 48px,
    48px 48px;
  mask-image: radial-gradient(
    ellipse 100% 90% at 50% 0%,
    black 30%,
    transparent 75%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 100% 90% at 50% 0%,
    black 30%,
    transparent 75%
  );
}

.pb-hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  max-width: 480px;
}

.pb-hero-shots {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 58%;
  pointer-events: none;
  z-index: 1;
}

.pb-hero-shots::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 20%;
  background: linear-gradient(to left, var(--bg), transparent);
  z-index: 3;
}

.pb-hero-shot {
  position: absolute;
  display: block;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.4),
    0 24px 60px rgba(0, 0, 0, 0.7);
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top;
  animation: pb-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.pb-hero-shot--front {
  width: 70%;
  right: 5%;
  top: 30%;
  transform: translateY(-55%) perspective(1200px) rotateX(5deg) rotateY(-10deg);
  z-index: 2;
  animation-delay: 300ms;
}

.pb-hero-shot--back {
  width: 66%;
  right: 33%;
  top: 15%;
  transform: translateY(-35%) perspective(1200px) rotateX(5deg) rotateY(-10deg);
  z-index: 1;
  opacity: 0.45;
  animation-delay: 200ms;
}

@media (max-width: 768px) {
  .pb-hero-shots {
    display: none;
  }

  .pb-hero-content {
    align-items: center;
    text-align: center;
    max-width: 720px;
  }
}

/* Staggered entrance */
.pb-headline,
.pb-tagline,
.pb-actions {
  animation: pb-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.pb-headline {
  animation-delay: 0ms;
}
.pb-tagline {
  animation-delay: 90ms;
}
.pb-actions {
  animation-delay: 180ms;
}

@keyframes pb-fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pb-headline {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5.5vw, 4rem);
  font-weight: 300;
  line-height: 1.06;
  letter-spacing: -0.03em;
  color: var(--text);
  margin: 0 0 1.5rem;
}

.pb-tagline {
  font-size: 1.0625rem;
  font-weight: 300;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 2.75rem;
  letter-spacing: 0.01em;
}

.pb-actions {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.pb-btn-primary,
.pb-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: var(--font-body);
  text-decoration: none;
  transition:
    background 0.12s,
    border-color 0.12s,
    color 0.12s;
  white-space: nowrap;
  cursor: pointer;
}

.pb-btn-primary {
  background: #fafafa;
  color: #09090b;
  border: 1px solid #fafafa;
}

.pb-btn-primary:hover {
  background: #e4e4e7;
  border-color: #e4e4e7;
}

.pb-btn-ghost {
  background: transparent;
  color: #fafafa;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.pb-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

.pb-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--border-mid);
}

/* ── Features ───────────────────────────────────────── */
.pb-features {
  padding: 3rem 1.5rem 5rem;
}

.pb-features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border-mid);
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px var(--border),
    0 24px 48px rgba(0, 0, 0, 0.4);
}

.pb-feature {
  background: var(--bg-card);
  padding: 1.625rem 1.75rem;
  position: relative;
  overflow: hidden;
  animation: pb-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Per-cell corner gradients */
.pb-feature::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.7;
}

.pb-feature:nth-child(1) {
  animation-delay: 280ms;
}
.pb-feature:nth-child(1)::before {
  background: radial-gradient(ellipse 80% 60% at 0% 0%, rgba(45, 212, 191, 0.07), transparent);
}

.pb-feature:nth-child(2) {
  animation-delay: 340ms;
}
.pb-feature:nth-child(2)::before {
  background: radial-gradient(ellipse 80% 60% at 100% 0%, rgba(139, 92, 246, 0.07), transparent);
}

.pb-feature:nth-child(3) {
  animation-delay: 400ms;
}
.pb-feature:nth-child(3)::before {
  background: radial-gradient(ellipse 80% 60% at 0% 100%, rgba(59, 130, 246, 0.07), transparent);
}

.pb-feature:nth-child(4) {
  animation-delay: 460ms;
}
.pb-feature:nth-child(4)::before {
  background: radial-gradient(ellipse 80% 60% at 100% 100%, rgba(251, 146, 60, 0.06), transparent);
}

.pb-feature-num {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  margin-bottom: 1rem;
}

.pb-feature-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.01em;
}

.pb-feature-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0 0 1rem;
  font-weight: 300;
}

.pb-feature-detail {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--accent);
  opacity: 0.55;
  margin: 0;
  letter-spacing: 0.02em;
}

@media (max-width: 600px) {
  .pb-features-grid {
    grid-template-columns: 1fr;
  }
}

/* ── CLI spotlight ───────────────────────────────────── */
.pb-cli {
  animation: pb-fade-up 0.65s 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.pb-cli {
  padding: 3rem 1.5rem 5rem;
}

.pb-cli-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.pb-cli-eyebrow {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: 0.7;
  margin: 0 0 1rem;
}

.pb-cli-heading {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 1.125rem;
}

.pb-cli-desc {
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 1.75rem;
  font-weight: 300;
}

.pb-cli-desc code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  color: var(--accent);
  background: var(--accent-dim);
  border-radius: 3px;
  padding: 0.1em 0.35em;
}

.pb-cli-link {
  display: inline-flex;
}

.pb-terminal {
  border-radius: 12px;
  border: 1px solid var(--border-mid);
  overflow: hidden;
  box-shadow:
    0 0 0 1px var(--border),
    0 24px 48px rgba(0, 0, 0, 0.5);
}

.pb-terminal-bar {
  background: var(--bg-elevated);
  padding: 0.625rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-bottom: 1px solid var(--border);
}

.pb-terminal-title {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-dim);
  margin-left: 0.5rem;
  letter-spacing: 0.04em;
}

.pb-terminal-body {
  background: var(--bg-card);
  margin: 0;
  padding: 1.25rem 1.5rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.7;
  color: var(--text-muted);
  white-space: pre;
  overflow-x: auto;
}

.t-prompt {
  color: var(--text-dim);
}
.t-cmd {
  color: var(--text);
}
.t-arg {
  color: var(--accent);
  opacity: 0.85;
}
.t-logo {
  color: var(--accent);
  font-family: monospace;
}
.t-dim {
  color: var(--text-dim);
}
.t-url {
  color: var(--accent);
}
.t-muted {
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .pb-cli-inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}

@media (max-width: 480px) {
  .pb-container {
    padding: 0;
  }

  .pb-hero {
    padding: 10rem 1rem 3rem;
  }

  .pb-features {
    padding: 2rem 1rem 4rem;
  }

  .pb-feature {
    padding: 1.75rem 1.25rem;
  }

  .pb-cli {
    padding: 2rem 1rem 4rem;
  }

  .pb-shots {
    padding: 0 1rem 4rem;
  }

  .pb-embed {
    padding: 2rem 1rem 7rem;
  }
}

/* ── Embed ───────────────────────────────────────────── */
.pb-embed {
  padding: 3rem 1.5rem 9rem;
  animation: pb-fade-up 0.65s 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.pb-embed-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.pb-embed-heading {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 1.125rem;
}

.pb-embed-desc {
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 1.75rem;
  font-weight: 300;
}

.pb-embed-link {
  display: inline-flex;
}

/* ── Code editor ─────────────────────────────────────── */
.pb-editor {
  border-radius: 12px;
  border: 1px solid var(--border-mid);
  overflow: hidden;
  box-shadow:
    0 0 0 1px var(--border),
    0 24px 48px rgba(0, 0, 0, 0.5);
}

.pb-editor-bar {
  background: var(--bg-elevated);
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid var(--border);
}

.pb-editor-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-dim);
  letter-spacing: 0.03em;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--accent);
  margin-bottom: -1px;
}

.pb-editor-tab-icon {
  color: var(--text-dim);
  opacity: 0.6;
}

.pb-editor-body {
  background: var(--bg-card);
  margin: 0;
  padding: 1.25rem 1.5rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.8;
  color: var(--text-muted);
  white-space: pre;
  overflow-x: auto;
}

.e-k { color: #c678dd; }
.e-s { color: #98c379; }
.e-f { color: #61afef; }
.e-t { color: #e5c07b; }
.e-i { color: var(--text-dim); }
.e-c { color: #4b5563; font-style: italic; }

@media (max-width: 768px) {
  .pb-embed-inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}
</style>
