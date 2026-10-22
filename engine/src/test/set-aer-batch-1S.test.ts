/**
 * Aether Revolt, group S: the cards whose behaviour is more than a stat line
 * or a copy of an already-tested shape.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
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
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Aether Revolt — group S", () => {
  it("Illusionist's Stratagem with no targets just draws", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const card = toHand(game, "Illusionist's Stratagem");
    const before = hand(game).length;
    cast(game, card, { targets: [null, null] });
    expect(hand(game).length).toBe(before);
  });

  it("Illusionist's Stratagem blinks two creatures (counters gone) and draws", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    game.state.objects[bears].counters["+1/+1"] = 2;
    const card = toHand(game, "Illusionist's Stratagem");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(bears), ref(elves)] });
    expect(hand(game).length).toBe(before);
    const [newBears] = named(game, "Grizzly Bears");
    expect(newBears).toBeDefined();
    expect(counters(game, newBears)).toBe(0);
    expect(named(game, "Llanowar Elves")).toHaveLength(1);
  });

  it("Aethergeode Miner pays two energy to blink itself", () => {
    const { game } = table();
    game.state.players[A].energy = 2;
    const miner = spawn(game, "Aethergeode Miner");
    game.state.objects[miner].counters["+1/+1"] = 1;
    activate(game, miner);
    expect(game.state.players[A].energy).toBe(0);
    const [back] = named(game, "Aethergeode Miner");
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(0);
  });

  it("Aetherwind Basker gets one energy per creature you control, and spends it on +1/+1", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const basker = enter(game, "Aetherwind Basker");
    expect(game.state.players[A].energy).toBe(3);
    activate(game, basker);
    expect(game.state.players[A].energy).toBe(2);
    expect(pt(game, basker)).toEqual({ power: 8, toughness: 8 });
  });

  it("Release the Gremlins destroys X artifacts and makes X Gremlins", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const rings = [spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B)];
    cast(game, toHand(game, "Release the Gremlins"), { x: 2, targets: rings.map((id) => ref(id)) });
    expect(rings.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(tokensNamed(game, "2/2 Gremlin Token", A)).toBe(2);
  });

  it("Resourceful Return draws only if you control an artifact", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Sol Ring");
    const bears = toGraveyard(game, "Grizzly Bears");
    const card = toHand(game, "Resourceful Return");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Tezzeret the Schemer's −2 gives +X/-X for the artifacts you control", () => {
    const { game } = table();
    spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears", B);
    const tez = spawn(game, "Tezzeret the Schemer");
    game.state.objects[tez].counters.loyalty = 5;
    loyalty(game, tez, -2, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 1 });
  });

  it("Tezzeret the Schemer's emblem makes an artifact a 5/5 artifact creature at your beginning of combat", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const tez = spawn(game, "Tezzeret the Schemer");
    loyalty(game, tez, -7, { atLeast: 7 });
    pickTargets(a, ring);
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 5, toughness: 5 });
  });

  it("Quicksmith Spy's draw ability lasts only while you control the Spy", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter");
    pickTargets(a, thopter);
    const spy = enter(game, "Quicksmith Spy");
    const before = hand(game).length;
    activate(game, thopter);
    expect(hand(game).length).toBe(before + 1);
    game.state.objects[thopter].tapped = false;
    destroy(game, spy);
    expect(() => activate(game, thopter)).toThrow();
  });

  it("Steal the Show: the target player discards what they choose and draws that many; damage counts your instants and sorceries", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Lightning Bolt");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    b.chooseDiscardsFn = (cards) => cards.slice(0, 3).map((c) => c.id);
    cast(game, toHand(game, "Steal the Show"), { modes: [0, 1], targets: [ref(B), ref(bears)] });
    expect(hand(game, B).length).toBe(before);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game, B).length).toBe(4);
  });

  it("Tezzeret's Simulacrum drains 1, or 3 with a Tezzeret", () => {
    const { game } = table();
    const first = spawn(game, "Tezzeret's Simulacrum");
    activate(game, first, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    spawn(game, "Tezzeret the Schemer");
    const second = spawn(game, "Tezzeret's Simulacrum");
    activate(game, second, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });

  it("Implement of Examination draws twice when sacrificed", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const implement = spawn(game, "Implement of Examination");
    const before = hand(game).length;
    activate(game, implement);
    expect(hand(game).length).toBe(before + 2);
  });

  it("Aether Inspector pays two energy on attack for a Servo", () => {
    const { game, a } = table();
    game.state.players[A].energy = 2;
    const inspector = spawn(game, "Aether Inspector");
    pickModes(a, 0);
    attack(game, a, [inspector]);
    expect(game.state.players[A].energy).toBe(0);
    expect(tokensNamed(game, "Servo Token", A)).toBe(1);
  });
});
