/**
 * `grant-activated-of` to every permanent matching a filter, with a spending
 * allowance for those abilities alone (rule 609.4b) — Grell Philosopher's
 * "each Horror you control gains all activated abilities of target artifact an
 * opponent controls until end of turn. You may spend blue mana as though it
 * were mana of any color to activate those abilities."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, enter, lands, life, nextTurn, pickTargets, ref, spawn, table, zone } from "./harness.js";

const granted = (game: Game, id: ObjectId) => game.state.objects[id].modifiers.flatMap((m) => m.grantsActivated ?? []);
const offers = (game: Game, source: ObjectId) =>
  game.legalActions(A).filter((x) => x.kind === "activate-ability" && x.source === source);

describe("Grell Philosopher", () => {
  it("each Horror you control gains the artifact's activated abilities; blue pays their red", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bomb = spawn(game, "Pyrite Spellbomb", B);
    const otherHorror = spawn(game, "Grell Philosopher");
    const bears = spawn(game, "Grizzly Bears");
    const theirHorror = spawn(game, "Grell Philosopher", B);
    pickTargets(a, bomb);
    const grell = enter(game, "Grell Philosopher");
    // Pyrite Spellbomb's two: "{R}, Sacrifice this artifact: …" and "{1}, Sacrifice this artifact: Draw a card."
    expect(granted(game, grell)).toHaveLength(2);
    expect(granted(game, otherHorror)).toHaveLength(2);
    expect(granted(game, bears)).toHaveLength(0);
    expect(granted(game, theirHorror)).toHaveLength(0);
    // The Spellbomb keeps its own.
    expect(zone(game, bomb)).toBe("battlefield");
    // {R} paid with an Island: the Grell is the one sacrificed.
    pickTargets(a, B);
    activate(game, grell, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, grell)).toBe("graveyard");
  });

  it("blue pays nothing else as any colour, and the grant ends with the turn", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bomb = spawn(game, "Pyrite Spellbomb", B);
    const mine = spawn(game, "Pyrite Spellbomb");
    pickTargets(a, bomb);
    const grell = enter(game, "Grell Philosopher");
    expect(offers(game, grell).length).toBeGreaterThan(0);
    // My own Spellbomb's {R} isn't one of "those abilities".
    expect(offers(game, mine).some((x) => x.kind === "activate-ability" && x.abilityIndex === 0)).toBe(false);
    nextTurn(game);
    expect(granted(game, grell)).toHaveLength(0);
  });

  it("triggers again at the beginning of your upkeep", () => {
    const { game, a } = table();
    const bomb = spawn(game, "Pyrite Spellbomb", B);
    const grell = spawn(game, "Grell Philosopher");
    pickTargets(a, bomb);
    nextTurn(game);
    // Bob's turn: no upkeep trigger of mine.
    expect(granted(game, grell)).toHaveLength(0);
    nextTurn(game);
    expect(granted(game, grell)).toHaveLength(2);
  });
});
