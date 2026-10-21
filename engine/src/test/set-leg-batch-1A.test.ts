/**
 * Legends, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import { poolCounts } from "../mana.js";
import { A, B, attack, cast, keywords, lands, life, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Energy Tap", () => {
  it("taps the creature and adds {C} equal to its mana value", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Energy Tap"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(poolCounts(game.state.players[A].manaPool).C).toBe(4);
  });
});

describe("Evil Eye of Orms-by-Gore", () => {
  it("keeps your non-Eye creatures from attacking, but not itself", () => {
    const { game } = table();
    const eye = spawn(game, "Evil Eye of Orms-by-Gore");
    const bears = spawn(game, "Grizzly Bears");
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const offer = game.legalActions(A).find((x) => x.kind === "declare-attackers");
    const eligible = offer?.kind === "declare-attackers" ? offer.eligible : [];
    expect(eligible).toContain(eye);
    expect(eligible).not.toContain(bears);
  });
});

describe("Divine Offering", () => {
  it("gains life equal to the destroyed artifact's mana value, and still does if it survives", () => {
    const { game } = table();
    const icy = spawn(game, "Icy Manipulator", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Divine Offering"), { targets: [ref(icy)] });
    expect(zone(game, icy)).toBe("graveyard");
    expect(life(game)).toBe(24);
    const myr = spawn(game, "Darksteel Myr", B);
    cast(game, toHand(game, "Divine Offering"), { targets: [ref(myr)] });
    expect(zone(game, myr)).toBe("battlefield");
    expect(life(game)).toBe(27);
  });
});

describe("Kobold Overlord", () => {
  it("gives your other Kobolds first strike, not an opponent's", () => {
    const { game } = table();
    spawn(game, "Kobold Overlord");
    const mine = spawn(game, "Crimson Kobolds");
    const theirs = spawn(game, "Crimson Kobolds", B);
    expect(keywords(game, mine).has("first-strike")).toBe(true);
    expect(keywords(game, theirs).has("first-strike")).toBe(false);
  });
});

describe("Life Chisel", () => {
  it("can't be activated outside your upkeep; in it, gains the sacrificed creature's toughness", () => {
    const { game } = table();
    const chisel = spawn(game, "Life Chisel");
    const giant = spawn(game, "Hill Giant");
    const at = { type: "activate-ability", player: A, source: chisel, abilityIndex: 0, targets: [], sacrifice: giant } as Action;
    expect(game.canDispatch(at)).not.toBeNull();
    toStep(game, "upkeep");
    const before = life(game);
    game.dispatch({ type: "activate-ability", player: A, source: chisel, abilityIndex: 0, targets: [], sacrifice: giant } as Action);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game)).toBe(before + 3);
  });
});

describe("Abomination", () => {
  it("destroys a green creature blocking it at end of combat, but not a red one", () => {
    const { game, a, b } = table();
    const abom = spawn(game, "Abomination");
    const spider = spawn(game, "Giant Spider", B);
    b.declareBlockersFn = () => [{ blocker: spider, attacker: abom }];
    attack(game, a, [abom]);
    expect(zone(game, spider)).toBe("graveyard");

    const second = table();
    const other = spawn(second.game, "Abomination");
    const giant = spawn(second.game, "Hill Giant", B);
    second.b.declareBlockersFn = () => [{ blocker: giant, attacker: other }];
    attack(second.game, second.a, [other]);
    expect(zone(second.game, giant)).toBe("battlefield");
  });
});
