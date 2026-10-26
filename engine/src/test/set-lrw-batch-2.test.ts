/** Lorwyn (batch 192): the lead's "whenever you clash" cards — the `clashes`
 * trigger, and "if you won" as a `trigger-value` condition. */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, enter, hand, keywords, lands, named, spawn, table, toLibrary } from "./harness.js";

/** Every clashed card stays on top; any other question takes its first mode
 * (a "may" is yes). */
function leaveOnTop(seat: ScriptedController): void {
  seat.chooseModesFn = (_view, min, _max, texts) => {
    const at = texts.findIndex((t) => t.startsWith("Leave it on top"));
    return at >= 0 ? [at] : Array.from({ length: Math.max(min, 1) }, (_u, i) => i);
  };
}

describe("whenever you clash (rule 701.30)", () => {
  it("Sylvan Echoes draws on a clash won, not on one lost", () => {
    const { game, a, b } = table();
    leaveOnTop(a);
    leaveOnTop(b);
    enter(game, "Sylvan Echoes", A);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    const before = hand(game, A).length;
    enter(game, "Paperfin Rascal", A);
    expect(hand(game, A).length).toBe(before + 1);

    toLibrary(game, "Wastes", A);
    toLibrary(game, "Hill Giant", B);
    enter(game, "Paperfin Rascal", A);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Sylvan Echoes triggers on a clash an opponent started, when you win it", () => {
    const { game, a, b } = table();
    leaveOnTop(a);
    leaveOnTop(b);
    enter(game, "Sylvan Echoes", A);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    const before = hand(game, A).length;
    enter(game, "Paperfin Rascal", B);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Rebellion of the Flamekin: a 3/1 for {1}, with haste only if you won", () => {
    const { game, a, b } = table();
    leaveOnTop(a);
    leaveOnTop(b);
    enter(game, "Rebellion of the Flamekin", A);
    lands(game, "Mountain", 2, A);
    toLibrary(game, "Wastes", A);
    toLibrary(game, "Hill Giant", B);
    enter(game, "Paperfin Rascal", A);
    const lost = named(game, "Elemental Shaman Token", A);
    expect(lost.length).toBe(1);
    expect(keywords(game, lost[0]).has("haste")).toBe(false);

    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    enter(game, "Paperfin Rascal", A);
    const tokens = named(game, "Elemental Shaman Token", A);
    expect(tokens.length).toBe(2);
    const won = tokens.find((t) => t !== lost[0]) as ObjectId;
    expect(keywords(game, won).has("haste")).toBe(true);
  });

  it("Entangling Trap taps, and on a win the creature also skips its next untap", () => {
    const { game, a, b } = table();
    leaveOnTop(a);
    leaveOnTop(b);
    enter(game, "Entangling Trap", A);
    const bear = spawn(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes", A);
    toLibrary(game, "Hill Giant", B);
    enter(game, "Paperfin Rascal", A);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(game.state.objects[bear].skipsNextUntap ?? false).toBe(false);

    game.state.objects[bear].tapped = false;
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    enter(game, "Paperfin Rascal", A);
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(game.state.objects[bear].skipsNextUntap).toBe(true);
  });
});
