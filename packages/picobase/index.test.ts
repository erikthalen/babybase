import { describe, it, expect, afterAll } from "vitest";
import { unlinkSync, existsSync } from "node:fs";
import { definePicobase } from "./index.ts";

const dbPath = "./tmp-picobase-test.db";

describe("definePicobase", () => {
  afterAll(() => {
    if (existsSync(dbPath)) unlinkSync(dbPath);
  });

  it("returns a Hono app that redirects / to /tables", async () => {
    const app = definePicobase({ database: dbPath });
    const res = await app.request("/");
    expect(res.status).toBe(302);
  });

  it("responds 200 to /tables", async () => {
    const app = definePicobase({ database: dbPath });
    const res = await app.request("/tables");
    expect(res.status).toBe(200);
  });
});
