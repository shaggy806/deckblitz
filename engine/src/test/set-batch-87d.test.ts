/**
 * Set walk batch 87, part d (2026-10-15): Modern Horizons 3 (MH3) and Modern Horizons 3 Commander (M3C), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const energy = (game: Game, player = A): number => game.state.players[player].energy;
const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const draw = (game: Game, n = 1): void => {
  game.debugApplyEffect(A, { kind: "draw", amount: n });
  settle(game);
};

describe("Horrid Shadowspinner", () => {
  it("attacking, you may draw cards equal to its power, then discard that many", () => {
    const { game, a } = table();
    const spinner = spawn(game, "Horrid Shadowspinner");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(spinner)]);
    pickModes(a, 0);
    const handBefore = hand(game).length;
    const libraryBefore = library(game).length;
    const graveBefore = graveyard(game).length;
    attack(game, a, [spinner]);
    // Power 3: three drawn, three discarded.
    expect(library(game).length).toBe(libraryBefore - 3);
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(graveBefore + 3);
    // Lifelink: its 3 combat damage gained alice 3.
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });

  it("declined, nothing is drawn or discarded", () => {
    const { game, a } = table();
    const spinner = spawn(game, "Horrid Shadowspinner");
    pickModes(a);
    const handBefore = hand(game).length;
    const libraryBefore = library(game).length;
    attack(game, a, [spinner]);
    expect(library(game).length).toBe(libraryBefore);
    expect(hand(game).length).toBe(handBefore);
  });
});

describe("Wurmcoil Larva", () => {
  it("dying, makes a 1/2 deathtouch and a 2/1 lifelink black Phyrexian Wurm together", () => {
    const { game } = table();
    spawn(game, "Marneus Calgar");
    const larva = spawn(game, "Wurmcoil Larva");
    const handBefore = hand(game).length;
    destroy(game, larva);
    settle(game);
    const [dt] = named(game, "Phyrexian Wurm Token (Wurmcoil Larva, Deathtouch)");
    const [ll] = named(game, "Phyrexian Wurm Token (Wurmcoil Larva, Lifelink)");
    expect(pt(game, dt)).toEqual({ power: 1, toughness: 2 });
    expect(keywords(game, dt).has("deathtouch")).toBe(true);
    expect(pt(game, ll)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, ll).has("lifelink")).toBe(true);
    // One instruction, one entry: "whenever one or more tokens you control
    // enter" draws once, not twice.
    expect(hand(game).length).toBe(handBefore + 1);
  });
});

describe("Hope-Ender Coatl", () => {
  /** Bob casts Lightning Bolt at alice on her turn, then passes priority to her. */
  function boltOnTheStack(game: Game): ObjectId {
    game.dispatch({ type: "pass-priority", player: A });
    const bolt = toHand(game, "Lightning Bolt", B);
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    return bolt;
  }

  it("cast, it counters an opponent's spell unless they pay {1}", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2, B);
    b.chooseModesFn = () => [];
    const bolt = boltOnTheStack(game);
    cast(game, toHand(game, "Hope-Ender Coatl"));
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    const [coatl] = named(game, "Hope-Ender Coatl");
    expect(zone(game, coatl)).toBe("battlefield");
    expect(keywords(game, coatl).has("flying")).toBe(true);
  });

  it("paid for, the spell resolves", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2, B);
    b.chooseModesFn = (_view, _min, _max, texts) => [texts.indexOf("Pay {1}")];
    boltOnTheStack(game);
    cast(game, toHand(game, "Hope-Ender Coatl"));
    expect(life(game, A)).toBe(17);
  });
});

describe("Phyrexian Ironworks", () => {
  it("gets one energy per attack, however many attack", () => {
    const { game, a } = table();
    spawn(game, "Phyrexian Ironworks");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, bears);
    expect(energy(game)).toBe(1);
  });

  it("taps and pays three energy for a 3/3 Golem, as a sorcery", () => {
    const { game } = table();
    const works = spawn(game, "Phyrexian Ironworks");
    game.state.players[A].energy = 4;
    activate(game, works);
    expect(tokensNamed(game, "Phyrexian Golem Token", A)).toBe(1);
    expect(energy(game)).toBe(1);
    expect(isTapped(game, works)).toBe(true);
  });

  it("can't be activated on an opponent's turn", () => {
    const { game } = table();
    const works = spawn(game, "Phyrexian Ironworks");
    game.state.players[A].energy = 3;
    toStep(game, "upkeep", B);
    expect(() => activate(game, works)).toThrow();
  });
});

describe("Mindless Conscription", () => {
  it("amasses Zombies 3 as it enters and on your third draw each turn, once", () => {
    const { game } = table();
    enter(game, "Mindless Conscription");
    const [army] = named(game, "Army Token");
    expect(counters(game, army)).toBe(3);
    // The turn's draw step was the first; two more make the third.
    draw(game);
    expect(counters(game, army)).toBe(3);
    draw(game);
    expect(counters(game, army)).toBe(6);
    draw(game);
    expect(counters(game, army)).toBe(6);
  });
});

describe("Drownyard Lurker and Warped Tusker", () => {
  it("cast, Drownyard Lurker makes an Eldrazi Spawn", () => {
    const { game } = table();
    lands(game, "Wastes", 7);
    const lurker = toHand(game, "Drownyard Lurker");
    cast(game, lurker);
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(1);
    expect(zone(game, lurker)).toBe("battlefield");
    expect(keywords(game, lurker).has("vigilance")).toBe(true);
  });

  it("cycled, Warped Tusker makes an Eldrazi Spawn and draws", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const tusker = toHand(game, "Warped Tusker");
    const handBefore = hand(game).length;
    game.dispatch({ type: "cycle", player: A, card: tusker });
    settle(game);
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(1);
    expect(zone(game, tusker)).toBe("graveyard");
    expect(hand(game).length).toBe(handBefore);
  });

  it("put onto the battlefield without being cast, nothing triggers", () => {
    const { game } = table();
    enter(game, "Warped Tusker");
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(0);
  });
});

describe("Scurry of Gremlins", () => {
  it("makes two Gremlins, then energy equal to the creatures you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    enter(game, "Scurry of Gremlins");
    expect(tokensNamed(game, "Gremlin Token", A)).toBe(2);
    expect(energy(game)).toBe(3);
  });

  it("four energy: creatures you control get +1/+0 and haste until end of turn", () => {
    const { game } = table();
    const scurry = spawn(game, "Scurry of Gremlins");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.players[A].energy = 4;
    activate(game, scurry);
    expect(energy(game)).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    // A creature arriving after it resolved isn't affected.
    const late = spawn(game, "Grizzly Bears");
    expect(pt(game, late)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Pyretic Rebirth", () => {
  it("returns the card and deals its mana value to up to one creature or planeswalker", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const golem = toGraveyard(game, "Phyrexian Triniform");
    const victim = spawn(game, "Phyrexian Triniform", B);
    cast(game, toHand(game, "Pyretic Rebirth"), { targets: [ref(golem), ref(victim)] });
    expect(zone(game, golem)).toBe("hand");
    // Phyrexian Triniform has mana value 9: lethal to the 9/9.
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("with no second target, just returns the card", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Pyretic Rebirth"), { targets: [ref(bears), null] });
    expect(zone(game, bears)).toBe("hand");
  });

  it("deals no damage when the graveyard card has gone (the ruling)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const victim = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Pyretic Rebirth"), { targets: [ref(bears), ref(victim)], settle: false });
    game.debugMove(bears, "exile");
    settle(game);
    expect(zone(game, victim)).toBe("battlefield");
    expect(game.state.objects[victim].damageMarked).toBe(0);
  });
});

describe("Wing It", () => {
  it("gives +2/+2 until end of turn and a lasting flying counter, then scries 1", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Wing It"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, bears, "flying")).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
    toStep(game, "upkeep", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Drossclaw", () => {
  it("living weapon: a 1/1 Germ that drains each opponent for 1 when it attacks", () => {
    const { game, a } = table({ players: 3 });
    enter(game, "Drossclaw");
    const [germ] = named(game, "Phyrexian Germ Token");
    expect(pt(game, germ)).toEqual({ power: 1, toughness: 1 });
    // The Germ is new: as if it had been there since the turn began.
    game.state.objects[germ].summoningSick = false;
    attack(game, a, [germ]);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(19);
  });
});

describe("Obstinate Gargoyle", () => {
  it("flies only while modified, and persist brings it back flying", () => {
    const { game } = table();
    const gargoyle = spawn(game, "Obstinate Gargoyle");
    expect(keywords(game, gargoyle).has("flying")).toBe(false);
    destroy(game, gargoyle);
    settle(game);
    const [back] = named(game, "Obstinate Gargoyle");
    expect(zone(game, back)).toBe("battlefield");
    expect(counters(game, back, "-1/-1")).toBe(1);
    expect(pt(game, back)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, back).has("flying")).toBe(true);
    // With its -1/-1 counter, it doesn't persist again.
    destroy(game, back);
    settle(game);
    expect(zone(game, back)).toBe("graveyard");
  });
});

describe("Sneaky Snacker", () => {
  it("returns from your graveyard tapped on your third draw in a turn", () => {
    const { game } = table();
    const snacker = toGraveyard(game, "Sneaky Snacker");
    draw(game);
    expect(zone(game, snacker)).toBe("graveyard");
    draw(game);
    const [back] = named(game, "Sneaky Snacker");
    expect(zone(game, back)).toBe("battlefield");
    expect(isTapped(game, back)).toBe(true);
  });

  it("does nothing from the battlefield", () => {
    const { game } = table();
    const snacker = spawn(game, "Sneaky Snacker");
    draw(game, 2);
    expect(zone(game, snacker)).toBe("battlefield");
    expect(isTapped(game, snacker)).toBe(false);
  });
});

describe("Sarpadian Simulacrum", () => {
  it("sacrificed, it deals 4 damage to target creature", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const sim = spawn(game, "Sarpadian Simulacrum", A, { sick: true });
    expect(keywords(game, sim).has("haste")).toBe(true);
    const victim = spawn(game, "Serra Angel", B);
    spawn(game, "Grizzly Bears", B);
    activate(game, sim, 0, { targets: [ref(victim)] });
    expect(zone(game, sim)).toBe("graveyard");
    expect(zone(game, victim)).toBe("graveyard");
  });
});
