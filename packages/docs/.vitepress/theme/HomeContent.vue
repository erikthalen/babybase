<script setup lang="ts">
const _features = [
  {
    num: "01",
    title: "Self-hosted",
    desc: "Runs entirely on your machine. Your data never leaves your environment.",
  },
  {
    num: "02",
    title: "SQLite native",
    desc: "Built on Node's built-in SQLite module. No ORM, no abstraction layers.",
  },
  {
    num: "03",
    title: "Schema visualization",
    desc: "Browse tables, inspect columns, and understand your schema at a glance.",
  },
  {
    num: "04",
    title: "Data management",
    desc: "View, insert, edit, and delete rows through a clean browser interface.",
  },
];
</script>

<template>
  <div class="pb-home">
    <!-- ── Hero ──────────────────────────────────────── -->
    <section class="pb-hero">
      <div class="pb-hero-bg" aria-hidden="true"></div>

      <div class="pb-hero-content">
        <h1 class="pb-headline">Your SQLite database,<br />in the browser.</h1>

        <p class="pb-tagline">
          Lightweight, self-hosted database manager.<br />
          Runs on your machine. No cloud required.
        </p>

        <div class="pb-actions">
          <a class="pb-btn-primary" href="/picobase/guide/getting-started"
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
              class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-right"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 12l14 0" />
              <path d="M15 16l4 -4" />
              <path d="M15 8l4 4" /></svg
          ></a>
          <a
            class="pb-btn-ghost"
            href="https://github.com/erikthalen/picobase"
            target="_blank"
            rel="noopener noreferrer"
            >View on GitHub</a
          >
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
          </div>
        </div>
      </div>
    </section>

    <!-- ── Screenshot preview ────────────────────────── -->
    <section class="pb-preview">
      <div class="pb-container">
        <div class="pb-browser">
          <div class="pb-browser-bar" aria-hidden="true">
            <span class="pb-dot"></span>
            <span class="pb-dot"></span>
            <span class="pb-dot"></span>
            <span class="pb-address">localhost:3000</span>
          </div>
          <div class="pb-browser-body">
            <!--
              Replace this block with the screenshot when it's ready:
              <img src="/screenshot.png" alt="Picobase UI" class="pb-screenshot-img" />
            -->
            <div class="pb-placeholder">
              <span class="pb-placeholder-label">Screenshot coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Install ────────────────────────────────────── -->
    <section class="pb-install">
      <div class="pb-container">
        <p class="pb-install-label">Get started in seconds</p>
        <div class="pb-install-code">
          <code>npx picobase ./my-db.sqlite</code>
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
  --text-dim: #2e2e2e;
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
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── Hero ───────────────────────────────────────────── */
.pb-hero {
  position: relative;
  min-height: 66vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7rem 2rem 4rem;
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
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 720px;
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
  justify-content: center;
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

/* ── Screenshot preview ─────────────────────────────── */
.pb-preview {
  padding: 0 1.5rem 5rem;
}

.pb-browser {
  border-radius: 12px;
  border: 1px solid var(--border-mid);
  overflow: hidden;
  box-shadow:
    0 0 0 1px var(--border),
    0 40px 80px rgba(0, 0, 0, 0.7),
    0 0 100px rgba(45, 212, 191, 0.03);
  animation: pb-fade-up 0.7s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.pb-browser-bar {
  background: var(--bg-elevated);
  padding: 0.6875rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.pb-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--border-mid);
}

.pb-address {
  margin-left: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-dim);
  letter-spacing: 0.03em;
}

.pb-browser-body {
  background: var(--bg-card);
  aspect-ratio: 16 / 9;
  display: flex;
}

/* When screenshot is ready: swap placeholder for <img class="pb-screenshot-img"> */
.pb-screenshot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pb-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--border-mid);
  margin: 12px;
  border-radius: 6px;
}

.pb-placeholder-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
  animation: pb-pulse 2.8s ease-in-out infinite;
}

@keyframes pb-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.75;
  }
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
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.pb-feature {
  background: var(--bg);
  padding: 2.25rem 2rem;
  transition: background 0.18s ease;
  position: relative;
  animation: pb-fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.pb-feature:nth-child(1) {
  animation-delay: 280ms;
}
.pb-feature:nth-child(2) {
  animation-delay: 340ms;
}
.pb-feature:nth-child(3) {
  animation-delay: 400ms;
}
.pb-feature:nth-child(4) {
  animation-delay: 460ms;
}

.pb-feature-num {
  display: block;
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--accent);
  opacity: 0.6;
  margin-bottom: 1.125rem;
}

.pb-feature-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.625rem;
  letter-spacing: -0.01em;
}

.pb-feature-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0;
  font-weight: 300;
}

@media (max-width: 600px) {
  .pb-features-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Install ─────────────────────────────────────────── */
.pb-install {
  padding: 2rem 1.5rem 9rem;
}

.pb-install .pb-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.125rem;
}

.pb-install-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  margin: 0;
  font-weight: 500;
}

.pb-install-code {
  background: var(--bg-card);
  border: 1px solid var(--border-mid);
  border-radius: 8px;
  padding: 0.9375rem 2rem;
}

.pb-install-code code {
  font-family: var(--font-mono);
  font-size: 0.9375rem;
  color: var(--accent);
  letter-spacing: 0.01em;
}
</style>
