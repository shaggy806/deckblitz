/**
 * Born of the Gods, batch 164 group D: the clause of each card most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Searing Blood", () => {
  it("deals 2 to the creature, then 3 to its controller when it dies this turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Searing Blood"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("a creature that survives deals no player damage", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Searing Blood"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });
});

describe("Champion of Stray Souls", () => {
  it("sacrifices X other creatures to return X creature cards", () => {
    const { game } = table();
    const champion = spawn(game, "Champion of Stray Souls");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const spare = spawn(game, "Grizzly Bears");
    const dead = [toGraveyard(game, "Hill Giant"), toGraveyard(game, "Hill Giant")];
    lands(game, "Swamp", 5);
    const action = {
      type: "activate-ability",
      player: A,
      source: champion,
      abilityIndex: 0,
      xValue: 2,
      targets: [ref(dead[0]), ref(dead[1])],
    } as const;
    expect(game.canDispatch(action)).toBeNull();
    game.dispatch(action);
    expect(game.state.awaiting?.kind).toBe("sacrifice");
    game.dispatch({ type: "sacrifice", player: A, permanents: bears });
    game.advanceUntil(quiet);
    for (const b of bears) expect(zone(game, b)).toBe("graveyard");
    expect(zone(game, spare)).toBe("battlefield");
    for (const d of dead) expect(zone(game, d)).toBe("battlefield");
    expect(zone(game, champion)).toBe("battlefield");
  });

  it("from the graveyard, puts itself on top of the library", () => {
    const { game } = table();
    const champion = toGraveyard(game, "Champion of Stray Souls");
    lands(game, "Swamp", 7);
    activate(game, champion, 1);
    expect(zone(game, champion)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0] === champion || library[library.length - 1] === champion).toBe(true);
    expect(graveyard(game)).not.toContain(champion);
  });
});

describe("Pain Seer", () => {
  it("inspired: the top card goes to hand and its mana value is lost", () => {
    const { game } = table();
    spawn(game, "Pain Seer", A, { tapped: true });
    const card = toLibrary(game, "Hill Giant");
    toStep(game, "upkeep");
    settle(game);
    expect(hand(game)).toContain(card);
    expect(life(game)).toBe(16);
  });
});

describe("Satyr Nyx-Smith", () => {
  it("inspired: paying {2}{R} makes a 3/1 haste Elemental", () => {
    const { game, a } = table();
    spawn(game, "Satyr Nyx-Smith", A, { tapped: true });
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "3/1 Red Enchantment Elemental Token (Haste)", A)).toBe(1);
  });
});

describe("Aerie Worshippers", () => {
  it("inspired: declining the payment makes nothing", () => {
    const { game, a } = table();
    spawn(game, "Aerie Worshippers", A, { tapped: true });
    lands(game, "Island", 3);
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "2/2 Blue Enchantment Bird Token (Flying)", A)).toBe(0);
  });
});

describe("Deepwater Hypnotist", () => {
  it("inspired: target creature an opponent controls gets -3/-0", () => {
    const { game, a } = table();
    spawn(game, "Deepwater Hypnotist", A, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    toStep(game, "upkeep");
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("Lightning Volley", () => {
  it("creatures you control gain a {T}: 1 damage ability", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Lightning Volley"));
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Claim of Erebos", () => {
  it("the enchanted creature drains 2 for {1}{B}, {T}", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Claim of Erebos"), { targets: [ref(bears)] });
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Aspect of Hydra", () => {
  it("X is your devotion to green", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Aspect of Hydra"), { targets: [ref(elves)] });
    expect(pt(game, elves)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Chromanticore", () => {
  it("bestowed, the creature gets +4/+4 and the five keywords", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes", "Wastes"]) spawn(game, land);
    cast(game, toHand(game, "Chromanticore"), { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    for (const k of ["flying", "first-strike", "vigilance", "trample", "lifelink"]) expect(keywords(game, bears).has(k)).toBe(true);
  });
});

describe("Noble Quarry", () => {
  it("bestowed, the creature gets +1/+1; alone it's a 1/1 creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Noble Quarry"), { overload: true, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const quarry = enter(game, "Noble Quarry");
    expect(pt(game, quarry)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Ashiok's Adept", () => {
  it("heroic: each opponent discards a card", () => {
    const { game } = table();
    const adept = spawn(game, "Ashiok's Adept");
    lands(game, "Forest", 1);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(adept)] });
    expect(hand(game, B)).toHaveLength(before - 1);
  });
});
