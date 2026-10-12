/**
 * The set walk, batch 59, part b (2026-10-11): Marvel Super Heroes, Secrets of Strixhaven Commander and Secrets of Strixhaven.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  destroy,
  hand,
  lands,
  life,
  loyalty,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The prepare spell copies in exile. */
const copies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);
const castOffers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);
const enterWith = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = game.debugSpawn(name, player, "battlefield", { announceEntry: true, summoningSick: false });
  return id;
};

describe("Captain Mar-Vell, Space-Born", () => {
  it("casts a creature at instant speed only once an opponent has cast a spell this turn", () => {
    const { game } = table();
    spawn(game, "Captain Mar-Vell, Space-Born");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Mountain", 1, B);
    toStep(game, "precombat-main", B);
    // Bob passes in his main phase: no spell of his yet, so no flash.
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(castOffers(game, bears)).toHaveLength(0);
    game.dispatch({ type: "pass-priority", player: A });
    // Next step: bob casts, then passes with his spell on the stack.
    expect(game.state.priority.holder).toBe(B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(castOffers(game, bears).length).toBeGreaterThan(0);
  });
});

describe("Defiling Daemogoth", () => {
  it("gains 1 per creature's combat damage, then drains each opponent for all the life gained this turn", () => {
    const { game, a } = table({ players: 3 });
    const demon = spawn(game, "Defiling Daemogoth");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    attack(game, a, [demon, bears], B);
    // 1 for each creature that dealt combat damage.
    expect(life(game, A)).toBe(25);
    expect(life(game, B)).toBe(13);
    toStep(game, "end");
    settle(game);
    // 3 + 2 gained this turn.
    expect(life(game, B)).toBe(8);
    expect(life(game, C)).toBe(15);
    expect(life(game, A)).toBe(25);
  });
});

describe("Coercive Impetus", () => {
  it("goads and pumps the enchanted creature, and its controller's attack draws you a card for 1 life", () => {
    const { game, a, b } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    pickTargets(a, bears);
    cast(game, toHand(game, "Coercive Impetus"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const before = hand(game, A).length;
    b.declareAttackersFn = () => [{ attacker: bears, defender: C }];
    toStep(game, "postcombat-main", B);
    expect(hand(game, A).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(17);
  });
});

describe("Eccentric Pestfinder // Turn Stones", () => {
  it("becomes prepared at any end step after you gained life, and Turn Stones makes a Pest for each opponent", () => {
    const { game } = table({ players: 3 });
    const finder = spawn(game, "Eccentric Pestfinder");
    // No life gained: alice's own end step does nothing.
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[finder].prepared).toBeUndefined();
    // Life gained on bob's turn: his end step prepares it.
    toStep(game, "precombat-main", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    toStep(game, "end", B);
    settle(game);
    expect(game.state.objects[finder].prepared).toBeDefined();
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Turn Stones");
    toStep(game, "precombat-main");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    cast(game, copy, { via: "prepared" });
    expect(tokensNamed(game, "Pest Token", A)).toBe(2);
    expect(game.state.objects[finder].prepared).toBeUndefined();
  });
});

describe("Kinetic Ooze", () => {
  it("at X = 10: X counters, destroys an artifact of mana value up to X, draws, and doubles other targets' counters", () => {
    const { game, a } = table();
    const stone = spawn(game, "Wurmcoil Engine", B);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    lands(game, "Forest", 11);
    const ooze = toHand(game, "Kinetic Ooze");
    pickTargets(a, stone, bears);
    const before = hand(game, A).length;
    cast(game, ooze, { x: 10 });
    expect(counters(game, ooze)).toBe(10);
    expect(zone(game, stone)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before);
    expect(counters(game, bears)).toBe(4);
  });

  it("at X = 4: can't reach a mana value 6 artifact, draws nothing and doubles nothing", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Wurmcoil Engine", B);
    const stone = spawn(game, "Mind Stone", B);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    lands(game, "Forest", 5);
    const ooze = toHand(game, "Kinetic Ooze");
    let offered: readonly (readonly string[])[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      offered = legal as unknown as readonly (readonly string[])[];
      return [ref(stone), ref(bears)];
    };
    const before = hand(game, A).length;
    cast(game, ooze, { x: 4 });
    expect(JSON.stringify(offered[0])).not.toContain(wurm);
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(counters(game, ooze)).toBe(4);
    // Cast from hand: one fewer card, none drawn.
    expect(hand(game, A).length).toBe(before - 1);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Gorma, the Gullet", () => {
  it("grows on your creatures' deaths and gives entering nontoken creatures a counter for each", () => {
    const { game } = table();
    const gorma = spawn(game, "Gorma, the Gullet");
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears"));
    // An opponent's creature dying counts for neither.
    destroy(game, spawn(game, "Grizzly Bears", B));
    settle(game);
    expect(counters(game, gorma)).toBe(2);
    const bears = enterWith(game, "Grizzly Bears");
    settle(game);
    expect(counters(game, bears)).toBe(2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Pest Token", count: 1 }, []);
    settle(game);
    const [pest] = named(game, "Pest Token", A);
    expect(counters(game, pest)).toBe(0);
    // Bob's creature isn't yours.
    const theirs = enterWith(game, "Grizzly Bears", B);
    settle(game);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Owlin Spiralmancer", () => {
  it("may copy only your first spell with {X} each turn, keeping its X", () => {
    const { game, a } = table();
    spawn(game, "Owlin Spiralmancer");
    lands(game, "Island", 7);
    pickModes(a, 0);
    const start = hand(game, A).length;
    // A spell without {X} first doesn't use it up.
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Mind Spring"), { x: 1 });
    // Opt: +1 (scry, draw); Mind Spring X=1 and its copy: +2.
    expect(hand(game, A).length).toBe(start + 3);
    cast(game, toHand(game, "Mind Spring"), { x: 1 });
    expect(hand(game, A).length).toBe(start + 4);
  });
});

describe("Defacing Duskmage // Vandal's Edit", () => {
  it("an opponent's second draw prepares it; Vandal's Edit draws two and each player loses 2", () => {
    const { game } = table();
    const mage = spawn(game, "Defacing Duskmage");
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(game.state.objects[mage].prepared).toBeUndefined();
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(game.state.objects[mage].prepared).toBeDefined();
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Vandal's Edit");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    const before = hand(game, A).length;
    cast(game, copy, { via: "prepared" });
    expect(hand(game, A).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Naktamun Lorespinner // Wheel of Fortune", () => {
  it("becomes prepared at your upkeep only if some player has one or fewer cards in hand", () => {
    const { game } = table();
    const spinner = spawn(game, "Naktamun Lorespinner");
    const clear = (p: PlayerId) => {
      for (const id of [...hand(game, p)]) game.state.objects[id].zone = "graveyard";
      game.state.zones.perPlayer[p].hand = [];
    };
    clear(A);
    clear(B);
    for (let i = 0; i < 3; i++) toHand(game, "Wastes", A);
    for (let i = 0; i < 2; i++) toHand(game, "Wastes", B);
    // Next upkeep: alice draws only in her draw step, so 3 and 2 in hand.
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[spinner].prepared).toBeUndefined();
    toStep(game, "precombat-main");
    clear(B);
    toHand(game, "Wastes", B);
    // Bob draws 1 on his turn — clear it again before alice's upkeep.
    toStep(game, "end", B);
    clear(B);
    toHand(game, "Wastes", B);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[spinner].prepared).toBeDefined();
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Wheel of Fortune");
  });
});

describe("Emeritus of Truce // Swords to Plowshares", () => {
  it("target player gets a 1/1 flying Inkling; then it's prepared only if an opponent has more creatures", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    // Alice takes the Inkling herself: 2 to bob's 1, not prepared.
    pickTargets(a, A);
    const first = enterWith(game, "Emeritus of Truce");
    settle(game);
    expect(tokensNamed(game, "Inkling Token (Emeritus of Truce)", A)).toBe(1);
    const [inkling] = named(game, "Inkling Token (Emeritus of Truce)", A);
    expect(pt(game, inkling)).toEqual({ power: 1, toughness: 1 });
    expect(game.state.objects[first].prepared).toBeUndefined();
    destroy(game, first);
    destroy(game, inkling);
    settle(game);
    // Bob takes it: bob 2, alice 1.
    pickTargets(a, B);
    const second = enterWith(game, "Emeritus of Truce");
    settle(game);
    expect(tokensNamed(game, "Inkling Token (Emeritus of Truce)", B)).toBe(1);
    expect(game.state.objects[second].prepared).toBeDefined();
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Swords to Plowshares");
  });
});

describe("Professor Dellian Fel", () => {
  it("−6: the emblem makes target opponent lose as much life as you gain", () => {
    const { game, a } = table();
    const fel = spawn(game, "Professor Dellian Fel");
    loyalty(game, fel, -6, { atLeast: 6 });
    pickTargets(a, B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 4 }, []);
    settle(game);
    expect(life(game, B)).toBe(16);
  });

  it("0: you draw a card and lose 1 life", () => {
    const { game } = table();
    const fel = spawn(game, "Professor Dellian Fel");
    const before = hand(game, A).length;
    loyalty(game, fel, 0);
    expect(hand(game, A).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Emeritus of Conflict // Lightning Bolt", () => {
  it("your third spell this turn prepares it, before that spell resolves", () => {
    const { game } = table();
    const emeritus = spawn(game, "Emeritus of Conflict");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Opt"));
    cast(game, toHand(game, "Opt"));
    expect(game.state.objects[emeritus].prepared).toBeUndefined();
    cast(game, toHand(game, "Opt"), { settle: false });
    // The trigger is above the third spell.
    expect(game.state.zones.shared.stack.length).toBe(2);
    settle(game);
    expect(game.state.objects[emeritus].prepared).toBeDefined();
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Lightning Bolt");
  });
});

describe("Primo, the Unbounded", () => {
  it("enters with twice X counters; base-power-0 attackers' damage makes a Fractal with that many counters", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 1);
    const primo = toHand(game, "Primo, the Unbounded");
    cast(game, primo, { x: 2 });
    expect(counters(game, primo)).toBe(4);
    game.state.objects[primo].summoningSick = false;
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [primo, bears], B);
    expect(life(game, B)).toBe(14);
    const [fractal] = named(game, "Fractal Token", A);
    expect(fractal).toBeDefined();
    // Only Primo's 4: the Bears' base power isn't 0.
    expect(counters(game, fractal)).toBe(4);
    expect(tokensNamed(game, "Fractal Token", A)).toBe(1);
  });
});
