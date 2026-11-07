/**
 * One chosen for each of several slots, then all at once — `choose-for-each-slot`:
 * Call the Spirit Dragons' "for each color, put a +1/+1 counter on a Dragon you
 * control of that color. If you put +1/+1 counters on five Dragons this way, you
 * win the game." A Dragon of two colors may be chosen twice and gets both
 * counters together (rule 608.2f — one placement, so Hardened Scales adds one);
 * the win needs five different Dragons (the rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, counters, keywords, nextTurn, spawn, table } from "./harness.js";

const toYourNextUpkeep = (game: Game): void => {
  nextTurn(game);
  nextTurn(game);
};

/** Answers each per-color question with the first of `prefer` offered,
 * recording each prompt and what it offered. */
function prefer(seat: ScriptedController, ...ids: readonly ObjectId[]): { prompts: string[]; offered: ObjectId[][] } {
  const seen = { prompts: [] as string[], offered: [] as ObjectId[][] };
  seat.choosePermanentsFn = (view, eligible) => {
    seen.prompts.push(view.state.awaiting?.kind === "choose-permanents" ? view.state.awaiting.prompt : "");
    seen.offered.push([...eligible]);
    const pick = ids.find((id) => eligible.includes(id));
    return pick === undefined ? [eligible[0]] : [pick];
  };
  return seen;
}

describe("Call the Spirit Dragons", () => {
  it("gives Dragons you control indestructible", () => {
    const { game } = table();
    spawn(game, "Call the Spirit Dragons");
    const dragon = spawn(game, "Pearl Dragon");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, dragon).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
  });

  it("puts a counter on one Dragon of each color, and five different Dragons win", () => {
    const { game, a } = table();
    spawn(game, "Call the Spirit Dragons");
    const dragons = ["Pearl Dragon", "Belltoll Dragon", "Acid-Spewer Dragon", "Ancient Hellkite", "Canopy Dragon"].map(
      (name) => spawn(game, name),
    );
    // One Dragon of each color: nothing to ask.
    const seen = prefer(a);
    toYourNextUpkeep(game);
    expect(seen.prompts).toEqual([]);
    for (const id of dragons) expect(counters(game, id)).toBe(1);
    expect(game.winner).toBe(A);
  });

  it("doesn't win with a color missing", () => {
    const { game } = table();
    spawn(game, "Call the Spirit Dragons");
    const dragons = ["Pearl Dragon", "Belltoll Dragon", "Acid-Spewer Dragon", "Ancient Hellkite"].map((name) =>
      spawn(game, name),
    );
    toYourNextUpkeep(game);
    for (const id of dragons) expect(counters(game, id)).toBe(1);
    expect(game.winner).toBeNull();
  });

  it("asks per color, a two-color Dragon may take both, and then it's four Dragons: no win", () => {
    const { game, a } = table();
    spawn(game, "Call the Spirit Dragons");
    const gold = spawn(game, "Adult Gold Dragon"); // red and white
    const pearl = spawn(game, "Pearl Dragon");
    const hellkite = spawn(game, "Ancient Hellkite");
    const others = ["Belltoll Dragon", "Acid-Spewer Dragon", "Canopy Dragon"].map((name) => spawn(game, name));
    const seen = prefer(a, gold);
    toYourNextUpkeep(game);
    // White and red were questions; the rest had one Dragon each.
    expect(seen.prompts).toEqual([
      "Put a +1/+1 counter on a white Dragon you control",
      "Put a +1/+1 counter on a red Dragon you control",
    ]);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([gold, pearl]));
    expect(seen.offered[1]).toEqual(expect.arrayContaining([gold, hellkite]));
    expect(counters(game, gold)).toBe(2);
    expect(counters(game, pearl) + counters(game, hellkite)).toBe(0);
    for (const id of others) expect(counters(game, id)).toBe(1);
    expect(game.winner).toBeNull();
  });

  it("puts a twice-chosen Dragon's counters on together: Hardened Scales adds one, not two", () => {
    const { game, a } = table();
    spawn(game, "Call the Spirit Dragons");
    spawn(game, "Hardened Scales");
    const gold = spawn(game, "Adult Gold Dragon");
    spawn(game, "Pearl Dragon");
    prefer(a, gold);
    toYourNextUpkeep(game);
    expect(counters(game, gold)).toBe(3);
  });

  it("does nothing with no Dragons", () => {
    const { game } = table();
    spawn(game, "Call the Spirit Dragons");
    const bears = spawn(game, "Grizzly Bears");
    toYourNextUpkeep(game);
    expect(counters(game, bears)).toBe(0);
    expect(game.winner).toBeNull();
  });
});
