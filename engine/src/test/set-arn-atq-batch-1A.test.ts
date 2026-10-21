/**
 * Arabian Nights + Antiquities, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  C,
  cast,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** Activate `source`'s ability 0, sacrificing `sacrifice` for its cost. */
function activateSacrificing(game: Game, source: ObjectId, sacrifice: ObjectId, targets: readonly TargetRef[] = []): void {
  const action: Action = { type: "activate-ability", player: A, source, abilityIndex: 0, targets, sacrifice };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

describe("Metamorphosis", () => {
  it("adds 1 plus the sacrificed creature's mana value of one colour, for creature spells only", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears"); // mana value 2
    const meta = toHand(game, "Metamorphosis");
    cast(game, meta, { sacrifice: bears, settle: false });
    game.advanceUntil(
      (s) => s.awaiting?.kind === "choose-modes" || (s.zones.shared.stack.length === 0 && s.awaiting === null),
    );
    if (game.state.awaiting?.kind === "choose-modes") game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    const units = game.state.players[A].manaPool;
    expect(units).toHaveLength(3);
    expect(Object.values(poolCounts(units)).filter((n) => n > 0)).toEqual([3]);
    expect(units.every((u) => u.restriction?.spell?.type === "creature")).toBe(true);
  });
});

describe("Energy Flux", () => {
  it("gives each artifact its controller's upkeep sacrifice-unless-pay trigger", () => {
    const { game, a, b } = table();
    spawn(game, "Energy Flux");
    const mine = spawn(game, "Sol Ring", A);
    const theirs = spawn(game, "Sol Ring", B);
    pickModes(a);
    pickModes(b);
    nextTurn(game, "draw"); // bob's upkeep has passed, alice's hasn't come
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    toStep(game, "draw");
    expect(zone(game, mine)).toBe("graveyard");
  });
});

describe("Gate to Phyrexia", () => {
  it("activates only during your upkeep, once each turn", () => {
    const { game } = table();
    const gate = spawn(game, "Gate to Phyrexia");
    const bears1 = spawn(game, "Grizzly Bears");
    const bears2 = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring", B);
    const stone = spawn(game, "Mind Stone", B);
    expect(() => activateSacrificing(game, gate, bears1, [ref(ring)])).toThrow();
    toStep(game, "upkeep");
    activateSacrificing(game, gate, bears1, [ref(ring)]);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears1)).toBe("graveyard");
    expect(() => activateSacrificing(game, gate, bears2, [ref(stone)])).toThrow();
  });
});

describe("Desert Nomads", () => {
  it("prevents damage from Deserts, not from other sources", () => {
    const { game } = table();
    const nomads = spawn(game, "Desert Nomads");
    const desert = spawn(game, "Jagged Barrens", B);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(nomads)], { source: desert });
    settle(game);
    expect(game.state.objects[nomads].damageMarked).toBe(0);
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(nomads)], { source: bears });
    settle(game);
    expect(game.state.objects[nomads].damageMarked).toBe(1);
  });
});

describe("Yawgmoth Demon", () => {
  it("taps and deals 2 damage to you when no artifact is sacrificed", () => {
    const { game, a } = table();
    const demon = spawn(game, "Yawgmoth Demon");
    pickModes(a);
    toStep(game, "draw");
    expect(game.state.objects[demon].tapped).toBe(true);
    expect(life(game, A)).toBe(18);
  });
});

describe("Giant Tortoise", () => {
  it("gets +0/+3 only while untapped", () => {
    const { game } = table();
    const tortoise = spawn(game, "Giant Tortoise");
    expect(pt(game, tortoise)).toEqual({ power: 1, toughness: 4 });
    game.state.objects[tortoise].tapped = true;
    invalidateComputedCache();
    expect(pt(game, tortoise)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Gaea's Avenger", () => {
  it("is 1 plus the artifacts all opponents control", () => {
    const { game } = table({ players: 3 });
    const avenger = spawn(game, "Gaea's Avenger");
    spawn(game, "Sol Ring", A);
    spawn(game, "Sol Ring", B);
    spawn(game, "Mind Stone", C);
    expect(pt(game, avenger)).toEqual({ power: 3, toughness: 3 });
  });
});
