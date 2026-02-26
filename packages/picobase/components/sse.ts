import type { Context } from "hono";
import { streamSSE } from "hono/streaming";

export type SSEStream = {
  patchElements: (html: string) => Promise<void>;
  patchSignals: (signals: Record<string, unknown>) => Promise<void>;
};

function formatPatchElements(html: string): string {
  return html
    .split("\n")
    .map((l) => `elements ${l}`)
    .join("\n");
}

function formatPatchSignals(signals: Record<string, unknown>): string {
  return JSON.stringify(signals)
    .split("\n")
    .map((l) => `signals ${l}`)
    .join("\n");
}

/**
 * Returns a full-page Response for direct browser loads,
 * or streams a datastar-patch-elements event for Datastar requests.
 */
export async function respond(
  c: Context,
  opts: { fullPage: () => string; fragment: () => string },
): Promise<Response> {
  const isDatastar = c.req.header("accept")?.includes("text/event-stream");

  if (!isDatastar) {
    return c.html(opts.fullPage());
  }

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: "datastar-patch-elements",
      data: formatPatchElements(opts.fragment()),
    });
  });
}

/**
 * Streams an SSE response for write operations (POST/PATCH/DELETE).
 * Callback receives helpers to patch DOM and signals.
 */
export function sseAction(
  c: Context,
  fn: (stream: SSEStream) => Promise<void>,
): Response {
  return streamSSE(c, async (stream) => {
    await fn({
      patchElements: (html) =>
        stream.writeSSE({
          event: "datastar-patch-elements",
          data: formatPatchElements(html),
        }),
      patchSignals: (signals) =>
        stream.writeSSE({
          event: "datastar-patch-signals",
          data: formatPatchSignals(signals),
        }),
    });
  });
}
