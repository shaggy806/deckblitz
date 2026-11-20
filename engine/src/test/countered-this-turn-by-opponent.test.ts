/**
 * "If a creature spell you cast this turn was countered by a spell or ability
 * an opponent controlled": the journal's `countered` entries (rule 701.6a —
 * a cast spell only, read as it was cast), each with who controlled the
 * countering spell or ability (`by`), read by the `turn-history` condition's
 * `by`. Summoning Trap.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, pickFromZone, ref, settle, table, toHand, toLibrary, zone } from "./harness.js";

/** A casts `spell`; `counterer` answers it with `counter` before it resolves. */
function counteredBy(game: Game, spell: string, counter: string, counterer: PlayerId): ObjectId {
  const id = toHand(game, spell);
  cast(game, id, { settle: false });
  if (counterer !== A) game.dispatch({ type: "pass-priority", player: A });
  cast(game, toHand(game, counter, counterer), { player: counterer, targets: [ref(id)] });
  settle(game);
  return id;
}

describe("Summoning Trap", () => {
  it("costs {0} once an opponent countered a creature spell of yours this turn, and puts a creature from the top seven onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2, B);
    const trap = toHand(game, "Summoning Trap");
    expect(() => cast(game, trap, { altCost: true, settle: false })).toThrow(/alternative/i);
    const bears = counteredBy(game, "Grizzly Bears", "Essence Scatter", B);
    expect(zone(game, bears)).toBe("graveyard");
    const entry = game.state.journal?.entries.find((e) => e.kind === "countered" && e.object === bears);
    expect(entry?.player).toBe(A);
    expect(entry?.by).toBe(B);
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, giant);
    cast(game, trap, { altCost: true });
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("isn't opened by your own counterspell, or an opponent's countering a noncreature spell", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    lands(game, "Island", 2, B);
    counteredBy(game, "Grizzly Bears", "Essence Scatter", A);
    counteredBy(game, "Opt", "Counterspell", B);
    const trap = toHand(game, "Summoning Trap");
    expect(() => cast(game, trap, { altCost: true, settle: false })).toThrow(/alternative/i);
  });
});
