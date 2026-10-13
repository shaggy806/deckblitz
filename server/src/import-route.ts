/**
 * `POST /import-deck`'s HTTP side: reads the body (capped), takes the pasted
 * text out of it, and streams the job's lines back as newline-delimited JSON.
 * The job itself — parsing the list, the registry, the Oracle snapshot,
 * Scryfall — runs wherever the host runs it (`runImportJob` in
 * `import-deck.ts`): on this thread, or on one shard, so the Scryfall
 * throttle and caches stay single copies. Main-side: no engine.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

/** A body past this is refused (413). A 100-card list is a few KB; a whole
 * collection pasted by mistake is still well under it. */
export const IMPORT_BODY_LIMIT = 1024 * 1024;

/** Where one import's output goes, line by line. */
export interface ImportSink {
  /** One NDJSON line. The first one means the job took the list (a 200,
   * streamed from there). */
  line(value: unknown): void;
  /** Refused before any line: a 400 with this message. */
  reject(message: string): void;
  /** The job is over. */
  end(): void;
}

/** Runs one import of `text`, writing its output to `sink`. */
export type ImportRunner = (text: string, sink: ImportSink) => void;

/**
 * Handles `/import-deck` (and its CORS preflight), or returns `false` for any
 * other request. Newline-delimited JSON, streamed: one `{type:"progress"}`
 * line per resolved card, then a single `{type:"result"}` line — or an
 * `{type:"error"}` line if it fails after the first. A long decklist spends a
 * throttled Scryfall round-trip on every card nobody has a record of, so the
 * client needs to see it moving rather than stare at a silent request.
 */
export function handleImportRoute(
  req: IncomingMessage,
  res: ServerResponse,
  run: ImportRunner,
  clientOrigin: string,
): boolean {
  if (req.url !== "/import-deck") return false;
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": clientOrigin,
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return true;
  }
  if (req.method !== "POST") return false;

  const refuse = (status: number, message: string): void => {
    if (res.headersSent) return;
    res.writeHead(status, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": clientOrigin,
    });
    res.end(JSON.stringify({ error: message }));
  };
  // Answered at once; whatever is still coming is read and dropped, so the
  // client gets the answer rather than a reset connection.
  const tooLarge = (): void => refuse(413, "that decklist is too long to import (over 1 MB)");

  if (Number(req.headers["content-length"] ?? 0) > IMPORT_BODY_LIMIT) {
    tooLarge();
    req.resume();
    return true;
  }
  const chunks: Buffer[] = [];
  let size = 0;
  let over = false;
  req.on("data", (chunk: Buffer) => {
    if (over) return;
    size += chunk.length;
    if (size > IMPORT_BODY_LIMIT) {
      over = true;
      chunks.length = 0;
      tooLarge();
      return;
    }
    chunks.push(chunk);
  });
  req.on("end", () => {
    if (over) return;
    let text: unknown;
    try {
      text = (JSON.parse(Buffer.concat(chunks).toString("utf8")) as { text?: unknown } | null)?.text;
    } catch (err) {
      refuse(400, err instanceof Error ? err.message : String(err));
      return;
    }
    if (typeof text !== "string") {
      refuse(400, "missing 'text' field");
      return;
    }
    let ended = false;
    run(text, {
      line: (value) => {
        if (ended) return;
        if (!res.headersSent) {
          res.writeHead(200, {
            "Content-Type": "application/x-ndjson",
            "Cache-Control": "no-cache, no-transform",
            // Asks an intermediate proxy not to buffer the body, which would
            // defeat the point of streaming it.
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": clientOrigin,
          });
        }
        res.write(`${JSON.stringify(value)}\n`);
      },
      reject: (message) => {
        if (ended) return;
        ended = true;
        refuse(400, message);
      },
      end: () => {
        if (ended) return;
        ended = true;
        if (!res.headersSent) refuse(500, "the import ended without an answer");
        else res.end();
      },
    });
  });
  return true;
}
