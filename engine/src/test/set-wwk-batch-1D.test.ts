/**
 * Worldwake (WWK) — group D of the set walk: landfall, Allies, a Trap, and
 * the land-animating cards.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  hand,
  lands,
  life,
  named,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  subtypes,
  zone,
  nextTurn,
} from "./harness.js";

describe("Hada Freeblade", () => {
  it("may take a counter as it enters and as another Ally enters", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const hada = enter(game, "Hada Freeblade");
    expect(counters(game, hada)).toBe(1);
    enter(game, "Vastwood Animist");
    expect(counters(game, hada)).toBe(2);
    enter(game, "Grizzly Bears");
    expect(counters(game, hada)).toBe(2);
  });
});

describe("Dread Statuary", () => {
  it("becomes a 4/2 Golem artifact creature that's still a land", () => {
    const { game } = table();
    const statuary = spawn(game, "Dread Statuary");
    lands(game, "Wastes", 4);
    activate(game, statuary, 1);
    expect(pt(game, statuary)).toEqual({ power: 4, toughness: 2 });
    expect(types(game, statuary)).toEqual(expect.arrayContaining(["land", "artifact", "creature"]));
    expect(subtypes(game, statuary)).toContain("Golem");
  });
});

describe("Rest for the Weary", () => {
  it("gains 4, or 8 once a land entered under your control this turn", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Rest for the Weary"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(24);
    enter(game, "Plains");
    cast(game, toHand(game, "Rest for the Weary"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(32);
  });
});

describe("Mysteries of the Deep", () => {
  it("draws two, or three after landfall", () => {
    const { game } = table();
    lands(game, "Island", 10);
    const before = hand(game).length;
    cast(game, toHand(game, "Mysteries of the Deep"));
    expect(hand(game).length).toBe(before + 2);
    enter(game, "Island");
    cast(game, toHand(game, "Mysteries of the Deep"));
    expect(hand(game).length).toBe(before + 5);
  });
});

describe("Scrib Nibblers", () => {
  it("gains 1 life only when the exiled card is a land", () => {
    const { game, a } = table();
    const rats = spawn(game, "Scrib Nibblers");
    const bears = toLibrary(game, "Grizzly Bears", B);
    activate(game, rats, 0, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, A)).toBe(20);
    pickModes(a, 0);
    enter(game, "Swamp");
    expect(game.state.objects[rats].tapped).toBe(false);
    const forest = toLibrary(game, "Forest", B);
    activate(game, rats, 0, { targets: [ref(B)] });
    expect(zone(game, forest)).toBe("exile");
    expect(life(game, A)).toBe(21);
  });
});

describe("Caustic Crawler", () => {
  it("may give target creature -1/-1 on landfall", () => {
    const { game, a } = table();
    spawn(game, "Caustic Crawler");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    enter(game, "Swamp");
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Brink of Disaster", () => {
  it("destroys the enchanted creature when it becomes tapped", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Brink of Disaster"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Nemesis Trap", () => {
  it("costs {B}{B} with a white creature attacking, exiles it and makes a copy exiled at end step", () => {
    const { game, a } = table();
    const lions = spawn(game, "Savannah Lions");
    lands(game, "Swamp", 2);
    a.declareAttackersFn = () => [{ attacker: lions, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    cast(game, toHand(game, "Nemesis Trap"), { targets: [ref(lions)], altCost: true });
    expect(zone(game, lions)).toBe("exile");
    const copies = named(game, "Savannah Lions").filter((id) => zone(game, id) === "battlefield");
    expect(copies.length).toBe(1);
    expect(controller(game, copies[0])).toBe(A);
    expect(tokensNamed(game, "Savannah Lions", A)).toBe(1);
    nextTurn(game);
    expect(tokensNamed(game, "Savannah Lions", A)).toBe(0);
  });

  it("can't be cast for {B}{B} when no white creature is attacking", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(() => cast(game, toHand(game, "Nemesis Trap"), { targets: [ref(bears)], altCost: true })).toThrow();
  });
});

describe("Vastwood Animist", () => {
  it("makes a land you control an X/X for the Allies you control", () => {
    const { game } = table();
    spawn(game, "Hada Freeblade");
    const animist = spawn(game, "Vastwood Animist");
    const [forest] = lands(game, "Forest", 1);
    activate(game, animist, 0, { targets: [ref(forest)] });
    expect(pt(game, forest)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, forest)).toContain("Elemental");
  });
});

describe("Vapor Snare", () => {
  it("steals the creature, and is sacrificed at upkeep unless a land is returned", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const [island] = lands(game, "Island", 5);
    const snare = toHand(game, "Vapor Snare");
    cast(game, snare, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    pickModes(a, 0);
    pickPermanents(a, island);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, island)).toBe("hand");
    expect(zone(game, snare)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, snare)).toBe("graveyard");
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Ruthless Cullblade", () => {
  it("gets +2/+1 while an opponent has 10 or less life", () => {
    const { game } = table();
    const cullblade = spawn(game, "Ruthless Cullblade");
    expect(pt(game, cullblade)).toEqual({ power: 2, toughness: 1 });
    game.state.players[B].life = 10;
    expect(pt(game, cullblade)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Shoreline Salvager", () => {
  it("may draw on combat damage only if you control an Island", () => {
    const { game, a } = table();
    const salvager = spawn(game, "Shoreline Salvager");
    pickModes(a, 0);
    const before = hand(game).length;
    attack(game, a, [salvager]);
    expect(hand(game).length).toBe(before);
    spawn(game, "Island");
    nextTurn(game);
    toStep(game, "precombat-main");
    const start = hand(game).length;
    attack(game, a, [salvager]);
    expect(hand(game).length).toBe(start + 1);
  });
});
