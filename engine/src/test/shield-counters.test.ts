/**
 * Shield counters (rule 122.1c): "if this permanent would be destroyed as the result of an
 * effect, instead remove a shield counter from it" and "if damage would be dealt to this
 * permanent, prevent that damage and remove a shield counter from it" — one counter however
 * many it has, one counter for a whole simultaneous event (a combat damage step), still there
 * when it loses its abilities, and no help against state-based actions or a sacrifice (the
 * Streets of New Capenna rulings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { B, attack, cast, counters, lands, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

const shield = (game: Game, id: ObjectId, n = 1): void => {
  game.state.objects[id].counters.shield = n;
};

describe("shield counters (rule 122.1c)", () => {
  it("prevent a spell's damage and lose one counter, however many there are", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    shield(game, bears, 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(counters(game, bears, "shield")).toBe(1);
  });

  it("replace destruction by an effect with removing a counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    shield(game, bears);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Murder"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "shield")).toBe(0);
    // With none left, the next destroy goes through.
    cast(game, toHand(game, "Murder"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("go once for a whole combat damage step: two blockers, one counter", () => {
    const { game, a, b } = table();
    const attacker = spawn(game, "Grizzly Bears");
    shield(game, attacker);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: x, attacker },
      { blocker: y, attacker },
    ];
    attack(game, a, [attacker]);
    expect(zone(game, attacker)).toBe("battlefield");
    expect(game.state.objects[attacker].damageMarked).toBe(0);
    expect(counters(game, attacker, "shield")).toBe(0);
  });

  it("don't stop state-based actions: damage already marked still destroys", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].damageMarked = 2;
    shield(game, bears);
    // State-based actions are checked as a player would get priority.
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("aren't an ability: a creature that lost its abilities keeps the protection", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    shield(game, bears);
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Turn to Frog"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "shield")).toBe(0);
  });

  it("are kept when a one-turn prevention shield covers the damage first (rule 616.1)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    shield(game, bears);
    lands(game, "Plains", 3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Hold at Bay"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(counters(game, bears, "shield")).toBe(1);
  });
});
