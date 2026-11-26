import { describe, expect, it } from "vitest";

import { B, cast, lands, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): split second (rule 702.61b) — while the spell
 * is on the stack, players can't cast spells or activate abilities that
 * aren't mana abilities; triggered abilities still trigger and resolve.
 */
describe("split second, audited", () => {
  it("the opponent may activate a mana ability but no other ability, and cast nothing (rule 702.61b)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Llanowar Elves", B);
    const pyro = spawn(game, "Prodigal Pyromancer", B);
    lands(game, "Mountain", 2, B);
    toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Sudden Shock"), { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.priority.holder === B && s.awaiting === null);
    const offered = game.legalActions(B);
    expect(offered.some((a) => a.kind === "cast-spell")).toBe(false);
    expect(offered.some((a) => a.kind === "activate-ability" && (a as { source?: string }).source === pyro)).toBe(false);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a triggered ability still triggers and resolves while it's on the stack (rule 702.61b)", () => {
    // Monastery Swiftspear's prowess triggers on the cast, above Sudden Shock.
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const spear = spawn(game, "Monastery Swiftspear");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Sudden Shock"), { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 2 && s.awaiting === null);
    expect(zone(game, bears)).toBe("battlefield");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, spear)).toEqual({ power: 2, toughness: 3 });
  });

  it("without split second, the same board offers Bob his Bolt and the Pyromancer (control)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const pyro = spawn(game, "Prodigal Pyromancer", B);
    lands(game, "Mountain", 2, B);
    toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.priority.holder === B && s.awaiting === null);
    const offered = game.legalActions(B);
    expect(offered.some((a) => a.kind === "cast-spell")).toBe(true);
    expect(offered.some((a) => a.kind === "activate-ability" && (a as { source?: string }).source === pyro)).toBe(true);
  });
});
