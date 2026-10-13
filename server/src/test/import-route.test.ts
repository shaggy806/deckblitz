/**
 * `POST /import-deck`'s HTTP side, over a real HTTP server with a stand-in
 * job: the NDJSON stream, refusals, and the body cap.
 */

import { createServer } from "node:http";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IMPORT_BODY_LIMIT, handleImportRoute } from "../import-route.js";
import type { ImportRunner } from "../import-route.js";

describe("import route", () => {
  let server: Server;
  let base: string;
  let runner: ImportRunner;
  let ran: string[];

  beforeEach(async () => {
    ran = [];
    runner = (text, sink) => {
      ran.push(text);
      sink.line({ type: "progress", done: 0, total: 1, name: null });
      setTimeout(() => {
        sink.line({ type: "result", cards: [], format: null });
        sink.end();
      }, 5);
    };
    server = createServer((req, res) => {
      if (handleImportRoute(req, res, (text, sink) => runner(text, sink), "https://example.test")) return;
      res.writeHead(404);
      res.end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  const post = (body: string): Promise<Response> =>
    fetch(`${base}/import-deck`, { method: "POST", headers: { "Content-Type": "application/json" }, body });

  it("streams the job's lines as newline-delimited JSON", async () => {
    const res = await post(JSON.stringify({ text: "1 Sol Ring" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/x-ndjson");
    expect(res.headers.get("access-control-allow-origin")).toBe("https://example.test");
    const lines = (await res.text()).trim().split("\n").map((l) => JSON.parse(l) as { type: string });
    expect(lines.map((l) => l.type)).toEqual(["progress", "result"]);
    expect(ran).toEqual(["1 Sol Ring"]);
  });

  it("answers a job's refusal, a body that isn't JSON, and one without text with a 400", async () => {
    runner = (_text, sink) => sink.reject("nothing to read");
    let res = await post(JSON.stringify({ text: "x" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "nothing to read" });

    res = await post("{not json");
    expect(res.status).toBe(400);
    res = await post(JSON.stringify({ list: "1 Sol Ring" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "missing 'text' field" });
    res = await post("null");
    expect(res.status).toBe(400);
  });

  it("refuses a body over the cap without running anything", async () => {
    const res = await post(JSON.stringify({ text: "1 Forest\n".repeat(IMPORT_BODY_LIMIT / 8) }));
    expect(res.status).toBe(413);
    expect(((await res.json()) as { error: string }).error).toMatch(/too long/);
    expect(ran).toEqual([]);
  });

  it("refuses a streamed body over the cap as it arrives", async () => {
    // No Content-Length up front: the cap has to catch it chunk by chunk.
    const chunk = new TextEncoder().encode("x".repeat(64 * 1024));
    let sent = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (sent > IMPORT_BODY_LIMIT * 2) controller.close();
        else {
          sent += chunk.length;
          controller.enqueue(chunk);
        }
      },
    });
    const res = await fetch(`${base}/import-deck`, {
      method: "POST",
      body,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    expect(res.status).toBe(413);
    expect(ran).toEqual([]);
  });

  it("answers the CORS preflight, and leaves other paths alone", async () => {
    const pre = await fetch(`${base}/import-deck`, { method: "OPTIONS" });
    expect(pre.status).toBe(204);
    expect(pre.headers.get("access-control-allow-methods")).toBe("POST");
    expect((await fetch(`${base}/elsewhere`)).status).toBe(404);
    expect((await fetch(`${base}/import-deck`)).status).toBe(404);
  });
});
