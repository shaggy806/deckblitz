/**
 * A static that makes a planeswalker a creature, while a condition holds or for
 * every planeswalker a permanent reaches (Gideon Blackblade, Grand Master of
 * Flowers, Kaito, Spark Rupture, Luxior).
 *
 * "That's still a planeswalker" keeps its card types (rule 205.1b); "he's a
 * creature" with no such words replaces them (205.1a), and then he can't be
 * attacked, loses no loyalty to damage (306.8, 120.3) and isn't put away at 0
 * loyalty (704.5i) — but loyalty abilities still work (606.3 says "a
 * permanent"). A planeswalker being attacked that stops being one is removed
 * from combat, and what attacks it attacks nothing (506.4, 506.4c).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

/** What `player` is offered as they're asked to attack. */
const attackOffer = (game: Game, player: PlayerId): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === player);
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error(`${player} wasn't asked to attack`);
  return offer;
};

const setLoyalty = (game: Game, id: ObjectId, n: number): void => {
  game.state.objects[id].counters.loyalty = n;
};
const marked = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
/** On to the next step, so state-based actions are looked at. */
const nextStep = (game: Game): void => {
  const from = game.state.turn.step;
  game.advanceUntil((s) => s.turn.step !== from);
};

describe("Gideon Blackblade: a creature that's still a planeswalker, on your turn", () => {
  it("is a 4/4 indestructible Human Soldier planeswalker on your turn, and only a planeswalker on theirs", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon Blackblade");
    expect(types(game, gideon)).toEqual(expect.arrayContaining(["planeswalker", "creature"]));
    expect(subtypes(game, gideon)).toEqual(expect.arrayContaining(["Gideon", "Human", "Soldier"]));
    expect(pt(game, gideon)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, gideon).has("indestructible")).toBe(true);
    nextTurn(game);
    expect(types(game, gideon)).toEqual(["planeswalker"]);
    expect(subtypes(game, gideon)).toEqual(["Gideon"]);
    expect(keywords(game, gideon).has("indestructible")).toBe(false);
  });

  it("attacks on your turn with damage to him prevented; on theirs he's attacked like any planeswalker", () => {
    const { game, a, b } = table();
    const gideon = spawn(game, "Gideon Blackblade", A, { sick: false });
    const giant = spawn(game, "Hill Giant", B, { sick: false });
    const before = life(game, B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: gideon }];
    attack(game, a, [gideon]);
    expect(life(game, B)).toBe(before);
    expect(counters(game, gideon, "loyalty")).toBe(4);
    expect(marked(game, gideon)).toBe(0);
    expect(zone(game, giant)).toBe("graveyard");

    nextTurn(game);
    b.declareBlockersFn = () => [];
    attack(game, b, [spawn(game, "Hill Giant", B, { sick: false })], gideon);
    expect(counters(game, gideon, "loyalty")).toBe(1);
    expect(marked(game, gideon)).toBe(0);
  });

  it("his +1 works while he's a creature, and may target nothing", () => {
    const { game, a } = table();
    const gideon = spawn(game, "Gideon Blackblade");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    loyalty(game, gideon, 1, { targets: [ref(bears)] });
    expect(counters(game, gideon, "loyalty")).toBe(5);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    nextTurn(game);
    nextTurn(game);
    pickModes(a, 0);
    loyalty(game, gideon, 1, { targets: [null] });
    expect(counters(game, gideon, "loyalty")).toBe(6);
  });

  it("the +1 can't target him", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon Blackblade");
    expect(() => loyalty(game, gideon, 1, { targets: [ref(gideon)] })).toThrow();
  });
});

describe("Grand Master of Flowers: a creature instead of a planeswalker at seven counters", () => {
  it("at six is a planeswalker, at seven a 7/7 flying indestructible Dragon God and no planeswalker", () => {
    const { game } = table();
    const master = spawn(game, "Grand Master of Flowers");
    setLoyalty(game, master, 6);
    expect(types(game, master)).toEqual(["planeswalker"]);
    setLoyalty(game, master, 7);
    expect(types(game, master)).toEqual(["creature"]);
    expect([...subtypes(game, master)].sort()).toEqual(["Dragon", "God"]);
    expect(pt(game, master)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, master).has("flying")).toBe(true);
    expect(keywords(game, master).has("indestructible")).toBe(true);
  });

  it("can't be attacked at seven; at six he can", () => {
    const { game } = table();
    const master = spawn(game, "Grand Master of Flowers");
    setLoyalty(game, master, 7);
    spawn(game, "Hill Giant", B, { sick: false });
    nextTurn(game);
    expect(attackOffer(game, B).defenders).not.toContain(master);

    const other = table();
    const six = spawn(other.game, "Grand Master of Flowers");
    setLoyalty(other.game, six, 6);
    spawn(other.game, "Hill Giant", B, { sick: false });
    nextTurn(other.game);
    expect(attackOffer(other.game, B).defenders).toContain(six);
  });

  it("damage to him at seven takes no loyalty, and he attacks on your turn", () => {
    const { game, a, b } = table();
    const master = spawn(game, "Grand Master of Flowers", A, { sick: false });
    setLoyalty(game, master, 7);
    b.declareBlockersFn = () => [];
    const before = life(game, B);
    attack(game, a, [master]);
    expect(life(game, B)).toBe(before - 7);
    expect(counters(game, master, "loyalty")).toBe(7);
  });

  it("damage from a burn spell marks him and leaves the counters", () => {
    const { game } = table();
    const master = spawn(game, "Grand Master of Flowers");
    setLoyalty(game, master, 7);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(master)] });
    expect(marked(game, master)).toBe(3);
    expect(counters(game, master, "loyalty")).toBe(7);
  });

  it("his +1 works while he's no planeswalker, and only targets a creature without the three keywords, until your next turn", () => {
    const { game } = table();
    const master = spawn(game, "Grand Master of Flowers");
    setLoyalty(game, master, 7);
    const bears = spawn(game, "Grizzly Bears", B, { sick: false });
    const angel = spawn(game, "Serra Angel", B, { sick: false });
    const knight = spawn(game, "White Knight", B, { sick: false });
    const talon = spawn(game, "Boros Swiftblade", B, { sick: false });
    expect(() => loyalty(game, master, 1, { targets: [ref(angel)] })).toThrow();
    expect(() => loyalty(game, master, 1, { targets: [ref(knight)] })).toThrow();
    expect(() => loyalty(game, master, 1, { targets: [ref(talon)] })).toThrow();
    loyalty(game, master, 1, { targets: [ref(bears)] });
    expect(counters(game, master, "loyalty")).toBe(8);
    expect(types(game, master)).toEqual(["creature"]);
    nextTurn(game);
    expect(attackOffer(game, B).eligible).not.toContain(bears);
    nextTurn(game);
    nextTurn(game);
    expect(attackOffer(game, B).eligible).toContain(bears);
  });

  it("the other +1 finds Monk of the Open Hand", () => {
    const { game, a } = table();
    const master = spawn(game, "Grand Master of Flowers");
    const monk = toLibrary(game, "Monk of the Open Hand");
    pickModes(a, 1);
    a.chooseFromZoneFn = (_view, offer) => offer.filter((id) => id === monk);
    const index = game.registry.get("Grand Master of Flowers").activated.findIndex((x) => x.text.includes("Search"));
    activate(game, master, index);
    expect(hand(game)).toContain(monk);
  });

  it("an attack at him when he reaches seven does nothing: he's removed from combat (506.4c), and it's not a player's", () => {
    const { game, b } = table();
    const master = spawn(game, "Grand Master of Flowers");
    setLoyalty(game, master, 6);
    nextTurn(game);
    const giant = spawn(game, "Hill Giant", B, { sick: false });
    b.declareAttackersFn = () => [{ attacker: giant, defender: master }];
    const lifeBefore = life(game, A);
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(game.state.objects[giant].attacking).toBe(master);
    setLoyalty(game, master, 7);
    game.advanceUntil((s) => s.objects[giant].attackingNothing === true);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(counters(game, master, "loyalty")).toBe(7);
    expect(marked(game, master)).toBe(0);
    expect(life(game, A)).toBe(lifeBefore);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].attackingNothing).toBeUndefined();
  });
});

describe("Kaito: a creature instead of a planeswalker, on your turn, with a counter", () => {
  it("is a 3/4 hexproof Ninja creature on your turn, only a planeswalker on theirs", () => {
    const { game } = table();
    const kaito = spawn(game, "Kaito, Bane of Nightmares");
    expect(types(game, kaito)).toEqual(["creature"]);
    expect(subtypes(game, kaito)).toEqual(["Ninja"]);
    expect(pt(game, kaito)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, kaito).has("hexproof")).toBe(true);
    nextTurn(game);
    expect(types(game, kaito)).toEqual(["planeswalker"]);
    expect(subtypes(game, kaito)).toEqual(["Kaito"]);
    expect(keywords(game, kaito).has("hexproof")).toBe(false);
  });

  it("the −2 that takes his last counters leaves a planeswalker with no loyalty (704.5i)", () => {
    const { game } = table();
    const kaito = spawn(game, "Kaito, Bane of Nightmares");
    setLoyalty(game, kaito, 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const index = game.registry.get("Kaito, Bane of Nightmares").activated.findIndex((x) => x.loyaltyCost === -2);
    activate(game, kaito, index, { targets: [ref(bears)] });
    expect(zone(game, kaito)).toBe("graveyard");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(2);
  });

  it("his emblem makes him, a Ninja, a 4/5", () => {
    const { game } = table();
    const kaito = spawn(game, "Kaito, Bane of Nightmares");
    loyalty(game, kaito, 1);
    expect(counters(game, kaito, "loyalty")).toBe(5);
    expect(pt(game, kaito)).toEqual({ power: 4, toughness: 5 });
  });

  it("his 0 draws for each opponent who lost life this turn", () => {
    const { game, a } = table();
    const kaito = spawn(game, "Kaito, Bane of Nightmares", A, { sick: false });
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    a.declareAttackersFn = () => [{ attacker: kaito, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(17);
    const cards = hand(game).length;
    loyalty(game, kaito, 0);
    expect(hand(game).length).toBe(cards + 1);
  });

  it("ninjutsu: enters tapped and attacking as a creature, with his loyalty counters", () => {
    const { game, a, b } = table();
    const rogue = spawn(game, "Grizzly Bears", A, { sick: false });
    const card = toHand(game, "Kaito, Bane of Nightmares");
    lands(game, "Underground Sea", 3);
    a.declareAttackersFn = () => [{ attacker: rogue, defender: B }];
    b.declareBlockersFn = () => [];
    const before = life(game, B);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, card, 0);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].attacking).toBe(B);
    expect(game.state.objects[card].tapped).toBe(true);
    expect(counters(game, card, "loyalty")).toBe(4);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, B)).toBe(before - 3);
  });
});

describe("Spark Rupture: every planeswalker with a loyalty counter", () => {
  it("loses its abilities, is only a creature, and its P/T follows its counters", () => {
    const { game } = table();
    spawn(game, "Spark Rupture");
    const walker = spawn(game, "Tezzeret the Seeker");
    expect(types(game, walker)).toEqual(["creature"]);
    expect(subtypes(game, walker)).toEqual([]);
    expect(pt(game, walker)).toEqual({ power: 4, toughness: 4 });
    setLoyalty(game, walker, 2);
    expect(pt(game, walker)).toEqual({ power: 2, toughness: 2 });
    expect(() => loyalty(game, walker, 1, { targets: [null, null] })).toThrow();
  });

  it("a static of its own that began in layer 4 goes on applying (rule 613.6): Gideon on his turn", () => {
    const { game } = table();
    spawn(game, "Spark Rupture");
    const gideon = spawn(game, "Gideon Blackblade");
    expect(types(game, gideon)).toEqual(["creature"]);
    expect(subtypes(game, gideon)).toEqual(["Human", "Soldier"]);
    expect(pt(game, gideon)).toEqual({ power: 4, toughness: 4 });
  });

  it("damage marks it and leaves its counters; with none left it's a planeswalker and is put away", () => {
    const { game, a, b } = table();
    spawn(game, "Spark Rupture");
    const walker = spawn(game, "Tezzeret the Seeker", B, { sick: false });
    const giant = spawn(game, "Hill Giant", A, { sick: false });
    b.declareBlockersFn = () => [{ blocker: walker, attacker: giant }];
    attack(game, a, [giant]);
    expect(counters(game, walker, "loyalty")).toBe(4);
    expect(marked(game, walker)).toBe(3);
    setLoyalty(game, walker, 0);
    nextStep(game);
    expect(zone(game, walker)).toBe("graveyard");
  });

  it("attackers at a planeswalker when it lands attack nothing and may be blocked", () => {
    const { game, a, b } = table();
    const walker = spawn(game, "Tezzeret the Seeker", B);
    const giant = spawn(game, "Hill Giant", A, { sick: false });
    a.declareAttackersFn = () => [{ attacker: giant, defender: walker }];
    game.advanceUntil((s) => s.objects[giant].attacking !== null && s.priority.holder === A);
    expect(game.state.objects[giant].attacking).toBe(walker);
    spawn(game, "Spark Rupture");
    const blocker = spawn(game, "Serra Angel", B, { sick: false });
    b.declareBlockersFn = () => [{ blocker, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    // The walker wasn't dealt its damage; the block was legal, and took it.
    expect(counters(game, walker, "loyalty")).toBe(4);
    expect(marked(game, walker)).toBe(0);
    expect(marked(game, blocker)).toBe(3);
    expect(game.state.objects[giant].attackingNothing).toBeUndefined();
  });
});

describe("Luxior, Giada's Gift: equip planeswalker", () => {
  it("goes on a planeswalker as though it were a creature, which then isn't a planeswalker", () => {
    const { game, a, b } = table();
    const walker = spawn(game, "Tezzeret the Seeker", A, { sick: false });
    const luxior = spawn(game, "Luxior, Giada's Gift");
    lands(game, "Wastes", 1);
    activate(game, luxior, 0, { targets: [ref(walker)] });
    expect(game.state.objects[luxior].attachedTo).toBe(walker);
    expect(types(game, walker)).toEqual(["creature"]);
    expect(subtypes(game, walker)).toEqual([]);
    expect(pt(game, walker)).toEqual({ power: 4, toughness: 4 });
    // Its loyalty ability still works, and every counter counts.
    loyalty(game, walker, 1, { targets: [null, null] });
    expect(pt(game, walker)).toEqual({ power: 5, toughness: 5 });
    // A 5/5 creature that attacks, as no planeswalker can.
    b.declareBlockersFn = () => [];
    const before = life(game, B);
    attack(game, a, [walker]);
    expect(life(game, B)).toBe(before - 5);
  });

  it("the plain equip can't target a planeswalker, and equip planeswalker can't target a creature", () => {
    const { game } = table();
    const walker = spawn(game, "Tezzeret the Seeker");
    const bears = spawn(game, "Grizzly Bears");
    const luxior = spawn(game, "Luxior, Giada's Gift");
    lands(game, "Wastes", 4);
    expect(() => activate(game, luxior, 1, { targets: [ref(walker)] })).toThrow();
    expect(() => activate(game, luxior, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, luxior, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("on a creature it adds a +1/+1 for each counter of any kind", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const luxior = spawn(game, "Luxior, Giada's Gift");
    lands(game, "Wastes", 3);
    activate(game, luxior, 1, { targets: [ref(bears)] });
    game.state.objects[bears].counters.oil = 2;
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, bears)).toEqual(["creature"]);
  });

  it("it's a planeswalker again once the Equipment is gone", () => {
    const { game } = table();
    const walker = spawn(game, "Tezzeret the Seeker");
    const luxior = spawn(game, "Luxior, Giada's Gift");
    lands(game, "Wastes", 1);
    activate(game, luxior, 0, { targets: [ref(walker)] });
    expect(types(game, walker)).toEqual(["creature"]);
    destroy(game, luxior);
    expect(zone(game, luxior)).toBe("graveyard");
    expect(types(game, walker)).toEqual(["planeswalker"]);
    expect(subtypes(game, walker)).toEqual(["Tezzeret"]);
  });
});
