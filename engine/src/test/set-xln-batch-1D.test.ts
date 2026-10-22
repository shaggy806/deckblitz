/**
 * Ixalan and Commander 2017, group D: the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toGraveyard,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

describe("Deathgorge Scavenger", () => {
  it("exiling a creature card gains 2 life and no pump", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    const scavenger = enter(game, "Deathgorge Scavenger");
    expect(zone(game, bears)).toBe("exile");
    expect(life(game)).toBe(22);
    expect(pt(game, scavenger)).toEqual({ power: 3, toughness: 2 });
  });

  it("exiling a noncreature card pumps it and gains no life", () => {
    const { game, a } = table();
    const land = toGraveyard(game, "Wastes", B);
    pickTargets(a, land);
    pickModes(a, 0);
    const scavenger = enter(game, "Deathgorge Scavenger");
    expect(zone(game, land)).toBe("exile");
    expect(life(game)).toBe(20);
    expect(pt(game, scavenger)).toEqual({ power: 4, toughness: 3 });
  });

  it("declining the exile does nothing", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a);
    enter(game, "Deathgorge Scavenger");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(20);
  });
});

describe("Fell Flagship", () => {
  it("pumps Pirates, crews, and makes the player it hits discard", () => {
    const { game, a } = table();
    const flagship = spawn(game, "Fell Flagship");
    const castaways = spawn(game, "Desperate Castaways");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, castaways)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const crew: Action = { type: "activate-ability", player: A, source: flagship, abilityIndex: 0, targets: [], tap: [castaways] };
    expect(game.canDispatch(crew)).toBeNull();
    game.dispatch(crew);
    settle(game);
    const before = hand(game, B).length;
    attack(game, a, [flagship]);
    expect(life(game, B)).toBe(17);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Heartless Pillage", () => {
  it("makes a Treasure only if you attacked this turn", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Heartless Pillage"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);

    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    cast(game, toHand(game, "Heartless Pillage"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Deathless Ancient", () => {
  it("taps three Vampires you control to return from your graveyard to your hand", () => {
    const { game } = table();
    const ancient = toGraveyard(game, "Deathless Ancient");
    const vampires = [
      spawn(game, "Bloodcrazed Paladin"),
      spawn(game, "Bloodcrazed Paladin"),
      spawn(game, "Bloodcrazed Paladin", A, { sick: true }),
    ];
    const bears = spawn(game, "Grizzly Bears");
    const withBears: Action = {
      type: "activate-ability",
      player: A,
      source: ancient,
      abilityIndex: 0,
      targets: [],
      tap: [vampires[0], vampires[1], bears],
    };
    expect(game.canDispatch(withBears)).not.toBeNull();
    const action: Action = { type: "activate-ability", player: A, source: ancient, abilityIndex: 0, targets: [], tap: vampires };
    expect(game.canDispatch(action)).toBeNull();
    game.dispatch(action);
    settle(game);
    expect(zone(game, ancient)).toBe("hand");
    for (const v of vampires) expect(game.state.objects[v].tapped).toBe(true);
  });
});

describe("Kindred Boon", () => {
  it("counters only a creature you control of the chosen type, which then has indestructible", () => {
    const { game, a } = table();
    const boon = spawn(game, "Kindred Boon");
    game.state.objects[boon].chosenCreatureType = "Vampire";
    const paladin = spawn(game, "Bloodcrazed Paladin");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Bloodcrazed Paladin", B);
    lands(game, "Plains", 2);
    const seen = watchTargets(a, () => [paladin]);
    const action: Action = { type: "activate-ability", player: A, source: boon, abilityIndex: 0, targets: [ref(paladin)] };
    expect(game.canDispatch(action)).toBeNull();
    game.dispatch(action);
    settle(game);
    if (seen.asked > 0) expect(seen.offered[0]).toEqual([paladin]);
    expect(counters(game, paladin, "divinity")).toBe(1);
    expect(keywords(game, paladin).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    const onBears: Action = { type: "activate-ability", player: A, source: boon, abilityIndex: 0, targets: [ref(bears)] };
    expect(game.canDispatch(onBears)).not.toBeNull();
  });

  it("with no type chosen, it can't be activated", () => {
    const { game } = table();
    const boon = spawn(game, "Kindred Boon");
    const paladin = spawn(game, "Bloodcrazed Paladin");
    lands(game, "Plains", 2);
    const action: Action = { type: "activate-ability", player: A, source: boon, abilityIndex: 0, targets: [ref(paladin)] };
    expect(game.canDispatch(action)).not.toBeNull();
  });
});

describe("Wasitora, Nekoru Queen", () => {
  it("makes the player sacrifice a creature, or gives you a Cat Dragon if they can't", () => {
    const { game, a } = table();
    const wasitora = spawn(game, "Wasitora, Nekoru Queen");
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, a, [wasitora]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Cat Dragon Token", A)).toBe(0);
  });

  it("with no creature to sacrifice, you create a Cat Dragon", () => {
    const { game, a } = table();
    const wasitora = spawn(game, "Wasitora, Nekoru Queen");
    attack(game, a, [wasitora]);
    expect(tokensNamed(game, "Cat Dragon Token", A)).toBe(1);
  });
});

describe("Grim Captain's Call", () => {
  it("returns one card of each type it names, skipping a type with none", () => {
    const { game } = table();
    const pirate = toGraveyard(game, "Desperate Castaways");
    const vampire = toGraveyard(game, "Bloodcrazed Paladin");
    const dinosaur = toGraveyard(game, "Thrash of Raptors");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Grim Captain's Call"));
    for (const id of [pirate, vampire, dinosaur]) expect(zone(game, id)).toBe("hand");
    expect(graveyard(game)).toContain(bears);
  });
});

describe("Atzocan Archer", () => {
  it("may fight another target creature, not itself", () => {
    const { game, a } = table();
    const elves = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [elves]);
    pickModes(a, 0);
    const archer = enter(game, "Atzocan Archer");
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([elves, bears].sort());
    expect(zone(game, elves)).toBe("graveyard");
    expect(game.state.objects[archer].damageMarked).toBe(1);
  });
});

describe("Thrash of Raptors", () => {
  it("gets +2/+0 and trample only with another Dinosaur", () => {
    const { game } = table();
    const thrash = spawn(game, "Thrash of Raptors");
    expect(pt(game, thrash)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, thrash).has("trample")).toBe(false);
    spawn(game, "Thrash of Raptors");
    expect(pt(game, thrash)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, thrash).has("trample")).toBe(true);
  });
});

describe("Skulduggery", () => {
  it("pumps your creature and shrinks theirs", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Skulduggery"), { targets: [ref(mine), ref(theirs)] });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });
});
