/**
 * Portal Three Kingdoms and Urza's Destiny, group C: horsemanship damage,
 * the attacked-this-step activation gate, counter-scaled Auras, Masticore's
 * upkeep, Goblin Festival's coin flip.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** Bob's turn, his creatures declared attacking as given, alice holding
 * priority in his declare attackers step. */
function bobAttacks(game: Game, b: ScriptedController, attacks: readonly (readonly [ObjectId, PlayerId])[]): void {
  nextTurn(game);
  b.declareAttackersFn = () => attacks.map(([attacker, defender]) => ({ attacker, defender }));
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
}

describe("Borrowing the East Wind", () => {
  it("deals X to each creature with horsemanship and each player, not to other creatures", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const rider = spawn(game, "Shu Elite Companions", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const wind = toHand(game, "Borrowing the East Wind");
    cast(game, wind, { x: 3 });
    expect(zone(game, rider)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });
});

describe("Kongming's Contraptions", () => {
  it("shoots an attacker in the declare attackers step you were attacked in, and not before", () => {
    const { game, b } = table();
    const contraptions = spawn(game, "Kongming's Contraptions");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, contraptions, 0, { targets: [ref(bears)] })).toThrow();
    bobAttacks(game, b, [[bears, A]]);
    activate(game, contraptions, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Festering Wound", () => {
  it("grows in your upkeep and hurts the enchanted creature's controller in theirs", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const wound = toHand(game, "Festering Wound");
    cast(game, wound, { targets: [ref(bears)] });
    pickModes(a, 0);
    nextTurn(game); // Bob's turn 2: no counters yet.
    expect(life(game, B)).toBe(20);
    nextTurn(game); // Alice's turn 3: a counter.
    expect(counters(game, wound, "infection")).toBe(1);
    nextTurn(game); // Bob's turn 4: 1 damage.
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Momentum", () => {
  it("gives +1/+1 per growth counter, added only if you choose", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const momentum = toHand(game, "Momentum");
    cast(game, momentum, { targets: [ref(bears)] });
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    pickModes(a);
    toStep(game, "precombat-main");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Masticore", () => {
  it("stays if you discard a card in your upkeep", () => {
    const { game, a } = table();
    const masticore = spawn(game, "Masticore");
    const before = hand(game).length;
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(zone(game, masticore)).toBe("battlefield");
    expect(hand(game).length).toBe(before); // one discarded, one drawn
  });

  it("is sacrificed with an empty hand", () => {
    const { game } = table();
    const masticore = spawn(game, "Masticore");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    toStep(game, "precombat-main");
    expect(zone(game, masticore)).toBe("graveyard");
  });
});

describe("Goblin Festival", () => {
  it("deals 1 damage, and a lost flip gives it to an opponent", () => {
    const owners = new Set<PlayerId>();
    for (let seed = 1; seed <= 12; seed += 1) {
      const { game } = table({ seed });
      lands(game, "Mountain", 2);
      const festival = spawn(game, "Goblin Festival");
      activate(game, festival, 0, { targets: [ref(B)] });
      expect(life(game, B)).toBe(19);
      owners.add(controller(game, festival));
    }
    expect(owners).toEqual(new Set([A, B]));
  });
});

describe("Yavimaya Enchantress", () => {
  it("counts every enchantment on the battlefield", () => {
    const { game } = table();
    const enchantress = spawn(game, "Yavimaya Enchantress");
    spawn(game, "Goblin Festival");
    spawn(game, "Goblin Festival", B);
    expect(pt(game, enchantress)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Encroach", () => {
  it("discards a nonbasic land, never a basic one", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const mine = toHand(game, "Strip Mine", B);
    const before = hand(game, B).length;
    const encroach = toHand(game, "Encroach");
    cast(game, encroach, { targets: [ref(B)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("False Prophet", () => {
  it("exiles all creatures when it dies", () => {
    const { game } = table();
    const prophet = spawn(game, "False Prophet");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, prophet);
    expect(zone(game, prophet)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Xun Yu, Wei Advisor", () => {
  it("gives a creature you control +2/+0 before attackers are declared", () => {
    const { game } = table();
    const xun = spawn(game, "Xun Yu, Wei Advisor");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, xun, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});
