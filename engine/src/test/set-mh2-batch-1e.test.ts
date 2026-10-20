/**
 * Modern Horizons 2 and Commander 2021, group e: Moderation, Essence Pulse,
 * Sanctifier en-Vec, Breathless Knight, Dakkon, Shadow Slayer, Geyadrone
 * Dihada, Altar of the Goyf, Sweep the Skies, Sequence Engine, Ghost-Lit
 * Drifter, Fae Offering, Feast of Sanity and Cabal Initiate — the clause of
 * each most likely to be wrong. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
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
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Moderation", () => {
  it("draws for the spell you cast, then bars a second spell that turn", () => {
    const { game } = table();
    spawn(game, "Moderation");
    lands(game, "Island", 6);
    const first = toHand(game, "Divination");
    const second = toHand(game, "Divination");
    const before = hand(game).length;
    cast(game, first);
    // -1 cast, +1 Moderation, +2 Divination.
    expect(hand(game).length).toBe(before + 2);
    expect(() => cast(game, second)).toThrow(/can't cast/);
  });

  it("counts a spell cast before it was on the battlefield", () => {
    const { game } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Divination"));
    spawn(game, "Moderation");
    expect(() => cast(game, toHand(game, "Divination"))).toThrow(/can't cast/);
  });
});

describe("Essence Pulse", () => {
  it("X is all the life gained this turn, its own 2 included, whatever was lost", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" }, []);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Essence Pulse"));
    expect(life(game)).toBe(22);
    expect(pt(game, maw)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Sanctifier en-Vec", () => {
  it("exiles black and red cards from graveyards as it enters, and catches them after", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    enter(game, "Sanctifier en-Vec");
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");

    // A red spell resolving, and a red creature dying, are exiled instead.
    lands(game, "Mountain", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    const myBolt = toHand(game, "Lightning Bolt");
    cast(game, myBolt, { targets: [{ kind: "object", object: goblin }] });
    expect(zone(game, myBolt)).toBe("exile");
    expect(zone(game, goblin)).toBe("exile");
  });
});

describe("Breathless Knight", () => {
  it("grows for a creature that entered from a graveyard, not one cast from hand", () => {
    const { game } = table();
    const knight = spawn(game, "Breathless Knight");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const dead = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Reanimate"), { targets: [{ kind: "object", object: dead }] });
    expect(zone(game, dead)).toBe("battlefield");
    expect(counters(game, knight)).toBe(1);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, knight)).toBe(1);
  });
});

describe("Dakkon, Shadow Slayer", () => {
  it("enters with a loyalty counter for each land you control", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const dakkon = toHand(game, "Dakkon, Shadow Slayer");
    cast(game, dakkon);
    expect(zone(game, dakkon)).toBe("battlefield");
    expect(counters(game, dakkon, "loyalty")).toBe(5);
  });
});

describe("Geyadrone Dihada", () => {
  it("+1 drains and corrupts; a corrupted creature's combat damage to her is prevented; −7 takes it", () => {
    const { game, b } = table();
    const dihada = spawn(game, "Geyadrone Dihada");
    game.state.objects[dihada].counters.loyalty = 4;
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, dihada, 1, { targets: [{ kind: "object", object: bears }] });
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(22);
    expect(counters(game, bears, "corruption")).toBe(1);
    expect(counters(game, dihada, "loyalty")).toBe(5);

    nextTurn(game);
    attack(game, b, [bears], dihada);
    expect(game.state.objects[bears].tapped).toBe(true); // it did attack her
    expect(counters(game, dihada, "loyalty")).toBe(5);

    toStep(game, "precombat-main", A);
    loyalty(game, dihada, -7, { atLeast: 7 });
    expect(game.state.objects[bears].controller).toBe(A);
  });
});

describe("Altar of the Goyf", () => {
  it("a creature attacking alone gets +X/+X for the card types in all graveyards", () => {
    const { game, a } = table();
    spawn(game, "Altar of the Goyf");
    toGraveyard(game, "Lightning Bolt", B);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Altar of the Goyf", B); // artifact and kindred
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    // instant, creature, artifact, kindred.
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Sweep the Skies", () => {
  it("makes a Thopter for each colour spent, not for X", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Sweep the Skies"), { x: 2 });
    expect(tokensNamed(game, "Thopter Token", A)).toBe(3);
  });
});

describe("Sequence Engine", () => {
  it("exiles a creature card of mana value X from any graveyard for an X-counter Fractal", () => {
    const { game } = table();
    const engine = spawn(game, "Sequence Engine");
    lands(game, "Forest", 3);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    expect(() => activate(game, engine, 0, { x: 1, targets: [{ kind: "object", object: bears }] })).toThrow();
    activate(game, engine, 0, { x: 2, targets: [{ kind: "object", object: bears }] });
    expect(zone(game, bears)).toBe("exile");
    const fractal = game.battlefield.find((id) => game.state.objects[id].cardName === "Fractal Token")!;
    expect(counters(game, fractal)).toBe(2);
  });
});

describe("Ghost-Lit Drifter", () => {
  it("channel: X target creatures gain flying, the card discarded", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const drifter = toHand(game, "Ghost-Lit Drifter");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    activate(game, drifter, 1, { x: 2, targets: [{ kind: "object", object: one }, { kind: "object", object: two }] });
    expect(zone(game, drifter)).toBe("graveyard");
    expect(keywords(game, one).has("flying")).toBe(true);
    expect(keywords(game, two).has("flying")).toBe(true);
  });
});

describe("Fae Offering", () => {
  it("makes a Clue, a Food and a Treasure at the end step after a creature and a noncreature spell", () => {
    const { game } = table();
    spawn(game, "Fae Offering");
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    cast(game, toHand(game, "Divination"));
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Captain Ripley Vance", () => {
  it("on the third spell: a +1/+1 counter, then damage equal to its power", () => {
    const { game, a } = table();
    const ripley = spawn(game, "Captain Ripley Vance");
    lands(game, "Mountain", 3);
    pickTargets(a, B);
    for (let i = 0; i < 3; i += 1) {
      cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: B }] });
    }
    expect(counters(game, ripley)).toBe(1);
    expect(life(game, B)).toBe(20 - 9 - 4);
  });
});

describe("Feast of Sanity and Cabal Initiate", () => {
  it("discarding to the Initiate gives it lifelink, and the Feast pings and gains 1", () => {
    const { game, a } = table();
    spawn(game, "Feast of Sanity");
    const initiate = spawn(game, "Cabal Initiate");
    pickTargets(a, B);
    activate(game, initiate, 0);
    expect(keywords(game, initiate).has("lifelink")).toBe(true);
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(21);
  });
});
