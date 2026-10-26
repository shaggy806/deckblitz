/**
 * Betrayers of Kamigawa / Champions of Kamigawa, batch 207, group E
 * (2026-10-26). Written on the shared table in `harness.ts`, each test from
 * the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Genju of the Fields", () => {
  it("each activation grants another copy of the life trigger", () => {
    const { game, a } = table();
    const plains = spawn(game, "Plains");
    lands(game, "Plains", 1);
    const genju = toHand(game, "Genju of the Fields");
    cast(game, genju, { targets: [ref(plains)] });
    expect(game.state.objects[genju].attachedTo).toBe(plains);
    game.state.objects[plains].tapped = false;
    lands(game, "Wastes", 4);
    activate(game, genju);
    activate(game, genju);
    expect(pt(game, plains)).toEqual({ power: 2, toughness: 5 });
    const before = life(game, A);
    pickModes(a);
    attack(game, a, [plains]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(before + 4);
  });
});

describe("Heed the Mists", () => {
  it("draws cards equal to the milled card's mana value", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const giant = toLibrary(game, "Hill Giant");
    const heed = toHand(game, "Heed the Mists");
    const before = hand(game).length;
    cast(game, heed);
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 4);
  });
});

describe("Minamo Sightbender", () => {
  it("targets only a creature with power X or less", () => {
    const { game } = table();
    const bender = spawn(game, "Minamo Sightbender");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Wastes", 3);
    expect(() => activate(game, bender, 0, { x: 2, targets: [ref(giant)] })).toThrow();
    activate(game, bender, 0, { x: 3, targets: [ref(giant)] });
    expect(keywords(game, giant).has("unblockable")).toBe(true);
  });
});

describe("Call for Blood", () => {
  it("gives -X/-X, X the sacrificed creature's power", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const giant = spawn(game, "Hill Giant");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Call for Blood"), { sacrifice: giant, targets: [ref(wurm)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Quillmane Baku", () => {
  it("removes X ki counters to bounce a creature with mana value X or less", () => {
    const { game } = table();
    const baku = spawn(game, "Quillmane Baku");
    game.state.objects[baku].counters.ki = 3;
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    expect(() => activate(game, baku, 0, { x: 1, targets: [ref(bears)] })).toThrow();
    activate(game, baku, 0, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, baku, "ki")).toBe(1);
  });
});

describe("Myojin of Night's Reach", () => {
  it("cast from hand, it has a divinity counter and indestructible; removing it empties each opponent's hand", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const myojin = toHand(game, "Myojin of Night's Reach");
    cast(game, myojin);
    expect(counters(game, myojin, "divinity")).toBe(1);
    expect(keywords(game, myojin).has("indestructible")).toBe(true);
    const mine = hand(game, A).length;
    activate(game, myojin);
    expect(hand(game, B).length).toBe(0);
    expect(hand(game, A).length).toBe(mine);
    expect(keywords(game, myojin).has("indestructible")).toBe(false);
  });

  it("put onto the battlefield without being cast, it has no counter", () => {
    const { game } = table();
    const myojin = spawn(game, "Myojin of Night's Reach");
    expect(counters(game, myojin, "divinity")).toBe(0);
    expect(keywords(game, myojin).has("indestructible")).toBe(false);
  });
});

describe("Uyo, Silent Prophet", () => {
  it("returns two lands to copy an instant", () => {
    const { game, a } = table();
    const uyo = spawn(game, "Uyo, Silent Prophet");
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const islands = lands(game, "Island", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    pickPermanents(a, ...islands);
    activate(game, uyo, 0, { targets: [{ kind: "object", object: game.state.zones.shared.stack[0] }] });
    expect(zone(game, islands[0])).toBe("hand");
    expect(zone(game, islands[1])).toBe("hand");
    expect(life(game, B)).toBe(14);
  });
});

describe("Soratami Savant", () => {
  it("returns a land to counter a spell whose controller can't pay {3}", () => {
    const { game, a } = table();
    const savant = spawn(game, "Soratami Savant");
    lands(game, "Mountain", 1);
    const island = spawn(game, "Island");
    lands(game, "Wastes", 3);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickPermanents(a, island);
    activate(game, savant, 0, { targets: [{ kind: "object", object: game.state.zones.shared.stack[0] }] });
    expect(zone(game, island)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Kuro, Pitlord", () => {
  it("is sacrificed at upkeep unless you pay {B}{B}{B}{B}", () => {
    const { game, a } = table();
    const kuro = spawn(game, "Kuro, Pitlord");
    pickModes(a, 1);
    toStep(game, "draw");
    settle(game);
    expect(zone(game, kuro)).toBe("graveyard");
  });
});

describe("Nagao, Bound by Honor", () => {
  it("pumps Samurai you control when it attacks, and only Samurai", () => {
    const { game, a } = table();
    const nagao = spawn(game, "Nagao, Bound by Honor");
    const isao = spawn(game, "Isao, Enlightened Bushi");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: nagao, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, nagao)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, isao)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
