/**
 * Batch 233, group D: the rest of Mercadian Masques — Forced March's X
 * sweep, Armistice's split draw / life gain, Righteous Indignation's and
 * Quagmire Lamprey's block triggers, Shoving Match's grant to every
 * creature, Puffer Extract's delayed destroy, Extravagant Spirit's
 * hand-sized upkeep, Charmed Griffin's gift, Kyren Legate's free cast and
 * Cateran Overlord's Mercenary search.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  controller,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Forced March", () => {
  it("destroys every creature with mana value X or less", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const elf = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Forced March"), { x: 2 });
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Armistice", () => {
  it("draws you a card and gives the target opponent 3 life", () => {
    const { game } = table();
    const armistice = spawn(game, "Armistice");
    lands(game, "Plains", 5);
    const before = hand(game).length;
    const theirs = hand(game, B).length;
    activate(game, armistice, 0, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before + 1);
    expect(hand(game, B).length).toBe(theirs);
    expect(life(game, B)).toBe(23);
    expect(life(game, A)).toBe(20);
  });
});

describe("Righteous Indignation", () => {
  it("pumps a creature blocking a red creature, not one blocking a green creature", () => {
    const { game, a, b } = table();
    spawn(game, "Righteous Indignation", B);
    const goblin = spawn(game, "Raging Goblin");
    const elf = spawn(game, "Llanowar Elves");
    const wall1 = spawn(game, "Grizzly Bears", B);
    const wall2 = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: wall1, attacker: goblin },
      { blocker: wall2, attacker: elf },
    ];
    attack(game, a, [goblin, elf]);
    expect(pt(game, wall1)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, wall2)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Quagmire Lamprey", () => {
  it("puts a -1/-1 counter on the creature blocking it", () => {
    const { game, a, b } = table();
    const lamprey = spawn(game, "Quagmire Lamprey");
    const blocker = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker, attacker: lamprey }];
    attack(game, a, [lamprey]);
    expect(counters(game, blocker, "-1/-1")).toBe(1);
  });
});

describe("Shoving Match", () => {
  it("gives an opponent's creature too \"{T}: Tap target creature.\"", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shoving Match"));
    // Alice passes with the stack empty; Bob gets priority and uses the grant.
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, theirs, 0, { player: B, targets: [ref(mine)] });
    expect(game.state.objects[mine].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Puffer Extract", () => {
  it("gives +X/+X, then destroys the creature at the next end step", () => {
    const { game } = table();
    const extract = spawn(game, "Puffer Extract");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, extract, 0, { x: 2, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Extravagant Spirit", () => {
  it("is sacrificed at upkeep when you can't pay {1} for each card in hand", () => {
    const { game } = table();
    const spirit = spawn(game, "Extravagant Spirit");
    lands(game, "Island", 2);
    nextTurn(game);
    expect(zone(game, spirit)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, spirit)).toBe("graveyard");
  });
});

describe("Charmed Griffin", () => {
  it("lets an opponent put an artifact card from their hand onto the battlefield", () => {
    const { game, b } = table();
    const ring = toHand(game, "Sol Ring", B);
    pickModes(b, 0);
    pickFromZone(b, ring);
    game.debugSpawn("Charmed Griffin", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(controller(game, ring)).toBe(B);
  });
});

describe("Kyren Legate", () => {
  it("is free only while an opponent controls a Plains and you control a Mountain", () => {
    const { game } = table();
    const card = toHand(game, "Kyren Legate");
    const freeOffered = (): boolean =>
      game.legalActions(A).some((act) => act.kind === "cast-spell" && act.card === card && act.free === true);
    spawn(game, "Mountain");
    expect(freeOffered()).toBe(false);
    spawn(game, "Plains", B);
    expect(freeOffered()).toBe(true);
    cast(game, card, { free: true });
    expect(zone(game, card)).toBe("battlefield");
  });
});

describe("Cateran Overlord", () => {
  it("puts a Mercenary permanent card with mana value 6 or less onto the battlefield", () => {
    const { game, a } = table();
    const overlord = spawn(game, "Cateran Overlord");
    lands(game, "Swamp", 6);
    const merc = toLibrary(game, "Rathi Assassin");
    const picked = pickFromZone(a, merc);
    activate(game, overlord, 1);
    expect(picked.offered).toContain(merc);
    expect(zone(game, merc)).toBe("battlefield");
  });
});
