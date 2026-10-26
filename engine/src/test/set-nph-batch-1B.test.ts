import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  toHand,
  toStep,
  zone,
  table,
} from "./harness.js";

describe("War Report", () => {
  it("counts an artifact creature twice", () => {
    const { game } = table();
    spawn(game, "Ornithopter");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Sol Ring", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "War Report"));
    // Creatures: Ornithopter, Bears (2); artifacts: Ornithopter, Sol Ring (2).
    expect(life(game, A)).toBe(24);
  });
});

describe("Whispering Specter", () => {
  it("sacrificed after combat damage, the player discards a card for each poison counter", () => {
    const { game, a } = table();
    const specter = spawn(game, "Whispering Specter");
    game.state.players[B].counters.poison = 3;
    const before = hand(game, B).length;
    pickModes(a, 0);
    attack(game, a, [specter]);
    settle(game);
    expect(zone(game, specter)).toBe("graveyard");
    expect(game.state.players[B].counters.poison).toBe(4);
    expect(hand(game, B).length).toBe(before - 4);
  });
});

describe("Basandra, Battle Seraph", () => {
  it("stops spells during combat but not after it", () => {
    const { game } = table();
    spawn(game, "Basandra, Battle Seraph");
    lands(game, "Swamp", 2);
    const ritual = toHand(game, "Dark Ritual");
    const castIt = { type: "cast-spell", player: A, card: ritual, targets: [] } as const;
    toStep(game, "begin-combat");
    expect(game.canDispatch(castIt)).not.toBeNull();
    toStep(game, "postcombat-main");
    expect(game.canDispatch(castIt)).toBeNull();
  });
});

describe("Greenhilt Trainee", () => {
  it("activates only at power 4 or greater", () => {
    const { game } = table();
    const trainee = spawn(game, "Greenhilt Trainee");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, trainee, 0, { targets: [{ kind: "object", object: bears }] })).toThrow();
    game.state.objects[trainee].counters["+1/+1"] = 2;
    activate(game, trainee, 0, { targets: [{ kind: "object", object: bears }] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Shrine of Limitless Power", () => {
  it("charges on a black spell and on your upkeep, then makes a player discard that many", () => {
    const { game } = table();
    const shrine = spawn(game, "Shrine of Limitless Power");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Dark Ritual"));
    expect(counters(game, shrine, "charge")).toBe(1);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, shrine, "charge")).toBe(2);
    toStep(game, "precombat-main");
    lands(game, "Wastes", 4);
    const before = hand(game, B).length;
    activate(game, shrine, 0, { targets: [{ kind: "player", player: B }] });
    expect(zone(game, shrine)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Ruthless Invasion", () => {
  it("nonartifact creatures can't block; artifact creatures can", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirBears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Ruthless Invasion"));
    const offer = blockOffer(game, a, [bears]);
    const can = (id: string): boolean => offer.eligible.some((e) => e.blocker === id && e.canBlock.length > 0);
    expect(can(theirBears)).toBe(false);
    expect(can(thopter)).toBe(true);
  });
});

describe("Numbing Dose", () => {
  it("keeps the permanent tapped and drains its controller on their upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Island", 5);
    cast(game, toHand(game, "Numbing Dose"), { targets: [{ kind: "object", object: bears }] });
    nextTurn(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Brutalizer Exarch", () => {
  it("puts a noncreature permanent on the bottom of its owner's library", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a, 1);
    pickTargets(a, ring);
    enter(game, "Brutalizer Exarch");
    expect(zone(game, ring)).toBe("library");
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1]).toBe(ring);
  });
});
