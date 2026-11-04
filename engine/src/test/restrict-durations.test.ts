/**
 * Restrictions and prohibitions for a duration beyond this turn (rules 611.2,
 * 500.5a, 511.2): "until your next turn" on a target and on a set fixed as it
 * resolves (Linvala, Shield of Sea Gate; Edifice of Authority; Dovin Baan;
 * Taunt from the Rampart), "this combat" and "until end of combat" (Ma Chao,
 * Yuan Shao's Infantry, Flummoxed Cyclops, Battering Ram), and "during its
 * controller's next turn" (Wall of Dust), not before it.
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import { goadersOf } from "../goad.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const bound = (game: Game, id: ObjectId): ReadonlySet<string> => restrictionsOf(game.state, registryOf(game), id);
const canActivate = (game: Game, player: PlayerId, id: ObjectId): boolean =>
  game.legalActions(player).some((o) => o.kind === "activate-ability" && o.source === id);

const fullParty = (game: Game): void => {
  spawn(game, "Abbey Matron"); // Cleric
  spawn(game, "Academy Raider"); // Warrior
  spawn(game, "Aetherblade Agent"); // Rogue
};

describe("Linvala, Shield of Sea Gate", () => {
  const atCombat = (party: boolean) => {
    const t = table();
    const linvala = spawn(t.game, "Linvala, Shield of Sea Gate"); // Wizard
    if (party) fullParty(t.game);
    return { ...t, linvala };
  };

  it("with a full party: until your next turn it can't attack, block or activate — mana abilities too", () => {
    const { game, a, linvala } = atCombat(true);
    const elves = spawn(game, "Llanowar Elves", B);
    pickTargets(a, elves);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, linvala)).toBe("battlefield");
    expect(bound(game, elves).has("cant-attack")).toBe(true);
    expect(bound(game, elves).has("cant-block")).toBe(true);
    // Bob's own turn: still bound, it can't tap for mana.
    nextTurn(game);
    expect(bound(game, elves).has("cant-attack")).toBe(true);
    expect(canActivate(game, B, elves)).toBe(false);
    // Gone as Alice's next turn begins.
    nextTurn(game);
    expect(bound(game, elves).has("cant-attack")).toBe(false);
    expect(bound(game, elves).has("cant-block")).toBe(false);
    expect(game.state.objects[elves].modifiers.some((m) => m.abilitiesCantBeActivated === true)).toBe(false);
  });

  it("without a full party it doesn't trigger", () => {
    const { game, linvala } = atCombat(false);
    const elves = spawn(game, "Llanowar Elves", B);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, linvala)).toBe("battlefield");
    expect(bound(game, elves).has("cant-attack")).toBe(false);
  });

  it("it lasts after the party breaks and Linvala leaves (the ruling)", () => {
    const { game, a, linvala } = atCombat(true);
    const elves = spawn(game, "Llanowar Elves", B);
    pickTargets(a, elves);
    toStep(game, "begin-combat");
    settle(game);
    pickModes(a, 0);
    activate(game, linvala);
    expect(zone(game, linvala)).toBe("graveyard");
    nextTurn(game);
    expect(bound(game, elves).has("cant-block")).toBe(true);
  });

  it("sacrificed: the keyword is chosen as it resolves, for creatures you control then", () => {
    const { game, a, linvala } = atCombat(true);
    const matron = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    activate(game, linvala);
    expect(keywords(game, matron).has("indestructible")).toBe(true);
    expect(keywords(game, matron).has("hexproof")).toBe(false);
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
  });
});

describe("Edifice of Authority", () => {
  it("the first ability binds one turn and adds a brick; the second needs three bricks", () => {
    const { game } = table();
    const edifice = spawn(game, "Edifice of Authority");
    lands(game, "Wastes", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, edifice, 1, { targets: [ref(bear)] })).toThrow();
    activate(game, edifice, 0, { targets: [ref(bear)] });
    expect(counters(game, edifice, "brick")).toBe(1);
    expect(bound(game, bear).has("cant-attack")).toBe(true);
    nextTurn(game);
    expect(bound(game, bear).has("cant-attack")).toBe(false);
  });

  it("three bricks: until your next turn, no attacking, blocking or activating", () => {
    const { game } = table();
    const edifice = spawn(game, "Edifice of Authority");
    lands(game, "Wastes", 1);
    game.state.objects[edifice].counters.brick = 3;
    const elves = spawn(game, "Llanowar Elves", B);
    activate(game, edifice, 1, { targets: [ref(elves)] });
    nextTurn(game);
    expect(bound(game, elves).has("cant-attack")).toBe(true);
    expect(bound(game, elves).has("cant-block")).toBe(true);
    expect(canActivate(game, B, elves)).toBe(false);
    nextTurn(game);
    expect(bound(game, elves).has("cant-block")).toBe(false);
  });
});

describe("Dovin Baan", () => {
  it("+1: -3/-0 and no activations until your next turn; a target is optional", () => {
    const { game } = table();
    const dovin = spawn(game, "Dovin Baan");
    const elves = spawn(game, "Llanowar Elves", B);
    loyalty(game, dovin, 1, { targets: [ref(elves)] });
    expect(pt(game, elves).power).toBe(-2);
    nextTurn(game);
    expect(canActivate(game, B, elves)).toBe(false);
    nextTurn(game);
    expect(pt(game, elves).power).toBe(1);
    expect(canActivate(game, A, dovin)).toBe(true);
    loyalty(game, dovin, 1, { targets: [null] });
    expect(game.state.objects[dovin].counters.loyalty).toBe(5);
  });

  it("−1: gain 2 and draw", () => {
    const { game } = table();
    const dovin = spawn(game, "Dovin Baan");
    const before = hand(game).length;
    loyalty(game, dovin, -1);
    expect(life(game)).toBe(22);
    expect(hand(game).length).toBe(before + 1);
  });

  it("−7's emblem: your opponents untap two permanents, and you aren't limited", () => {
    const { game } = table();
    const dovin = spawn(game, "Dovin Baan");
    loyalty(game, dovin, -7, { atLeast: 7 });
    expect(game.state.emblems.length).toBe(1);
    const theirs = [1, 2, 3].map(() => spawn(game, "Grizzly Bears", B, { tapped: true }));
    const mine = [1, 2, 3].map(() => spawn(game, "Grizzly Bears", A, { tapped: true }));
    nextTurn(game);
    expect(theirs.filter((id) => game.state.objects[id].tapped).length).toBe(1);
    nextTurn(game);
    expect(mine.filter((id) => game.state.objects[id].tapped).length).toBe(0);
  });
});

describe("Taunt from the Rampart", () => {
  it("goads and stops blocking the creatures opponents control as it resolves, until your next turn", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 3);
    lands(game, "Mountain", 2);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const mine = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Taunt from the Rampart"));
    expect(goadersOf(game.state, registryOf(game), bobs)).toEqual([A]);
    expect(bound(game, bobs).has("cant-block")).toBe(true);
    expect(bound(game, carols).has("cant-block")).toBe(true);
    expect(bound(game, mine).has("cant-block")).toBe(false);
    const later = spawn(game, "Grizzly Bears", B);
    expect(bound(game, later).has("cant-block")).toBe(false);
    expect(goadersOf(game.state, registryOf(game), later)).toEqual([]);
    nextTurn(game);
    nextTurn(game);
    expect(bound(game, bobs).has("cant-block")).toBe(true);
    nextTurn(game);
    expect(bound(game, bobs).has("cant-block")).toBe(false);
    expect(goadersOf(game.state, registryOf(game), bobs)).toEqual([]);
  });
});

describe("this combat", () => {
  it("Ma Chao attacks alone: no one can block it, and it ends with that combat", () => {
    const { game, a } = table();
    const chao = spawn(game, "Ma Chao, Western Warrior", A, { sick: false });
    spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: chao, defender: B }];
    toStep(game, "declare-blockers");
    expect(bound(game, chao).has("cant-be-blocked")).toBe(true);
    toStep(game, "postcombat-main");
    expect(bound(game, chao).has("cant-be-blocked")).toBe(false);
  });

  it("Yuan Shao's Infantry: alone only", () => {
    const { game, a } = table();
    const infantry = spawn(game, "Yuan Shao's Infantry", A, { sick: false });
    const friend = spawn(game, "Grizzly Bears", A, { sick: false });
    attack(game, a, [infantry, friend]);
    expect(life(game, B)).toBe(16);
    nextTurn(game);
    nextTurn(game);
    a.declareAttackersFn = () => [{ attacker: infantry, defender: B }];
    toStep(game, "declare-blockers");
    expect(bound(game, infantry).has("cant-be-blocked")).toBe(true);
  });

  it("Flummoxed Cyclops: two attackers keep it out of this combat, one doesn't", () => {
    const { game, b } = table({ step: "precombat-main" });
    nextTurn(game);
    const cyclops = spawn(game, "Flummoxed Cyclops", A);
    const one = spawn(game, "Grizzly Bears", B, { sick: false });
    const two = spawn(game, "Grizzly Bears", B, { sick: false });
    b.declareAttackersFn = () => [{ attacker: one, defender: A }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    expect(bound(game, cyclops).has("cant-block")).toBe(false);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    nextTurn(game);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: one, defender: A },
      { attacker: two, defender: A },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length > 0);
    settle(game);
    expect(bound(game, cyclops).has("cant-block")).toBe(true);
    toStep(game, "postcombat-main", B);
    expect(bound(game, cyclops).has("cant-block")).toBe(false);
  });

  it("Battering Ram: banding until end of combat; a Wall that blocks it is destroyed at end of combat", () => {
    const { game, a, b } = table();
    const ram = spawn(game, "Battering Ram", A, { sick: false });
    const wall = spawn(game, "Wall of Dust", B);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, ram).has("banding")).toBe(true);
    a.declareAttackersFn = () => [{ attacker: ram, defender: B }];
    b.declareBlockersFn = () => [{ blocker: wall, attacker: ram }];
    toStep(game, "postcombat-main");
    expect(keywords(game, ram).has("banding")).toBe(false);
    expect(zone(game, wall)).toBe("graveyard");
  });
});

describe("Wall of Dust", () => {
  it("the creature it blocks can't attack during its controller's next turn, and only then", () => {
    const { game, a, b } = table();
    const bear = spawn(game, "Grizzly Bears", A, { sick: false });
    const wall = enter(game, "Wall of Dust", B);
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bear }];
    toStep(game, "postcombat-main");
    // Not yet bound: the rest of this turn, and Bob's.
    expect(bound(game, bear).has("cant-attack")).toBe(false);
    nextTurn(game);
    expect(bound(game, bear).has("cant-attack")).toBe(false);
    // Alice's next turn.
    nextTurn(game);
    expect(bound(game, bear).has("cant-attack")).toBe(true);
    // Over with that turn.
    nextTurn(game);
    expect(bound(game, bear).has("cant-attack")).toBe(false);
    nextTurn(game);
    expect(bound(game, bear).has("cant-attack")).toBe(false);
  });
});
