/**
 * Champions of Kamigawa (CHK; B212), group E — the rest of the set. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("He Who Hungers", () => {
  it("sacrifices another Spirit to make the opponent discard the card its controller chooses", () => {
    const { game, a } = table();
    const hungers = spawn(game, "He Who Hungers");
    const kami = spawn(game, "Hearth Kami");
    lands(game, "Wastes", 1);
    toHand(game, "Grizzly Bears", B);
    const shock = toHand(game, "Shock", B);
    pickFromZone(a, shock);
    game.dispatch({ type: "activate-ability", player: A, source: hungers, abilityIndex: 0, targets: [ref(B)], sacrifice: kami });
    settle(game);
    expect(zone(game, kami)).toBe("graveyard");
    expect(zone(game, hungers)).toBe("battlefield");
    expect(zone(game, shock)).toBe("graveyard");
  });
});

describe("Sift Through Sands", () => {
  it("fetches The Unspeakable only after Peer Through Depths and Reach Through Mists this turn", () => {
    const { game, a } = table();
    const defaultZone = a.chooseFromZoneFn;
    const unspeakable = toLibrary(game, "The Unspeakable");
    for (let i = 0; i < 6; i++) toLibrary(game, "Wastes");
    lands(game, "Island", 6);
    pickModes(a, 0);
    pickFromZone(a, unspeakable);
    cast(game, toHand(game, "Sift Through Sands"));
    expect(zone(game, unspeakable)).toBe("library");

    a.chooseFromZoneFn = defaultZone;
    cast(game, toHand(game, "Peer Through Depths"));
    cast(game, toHand(game, "Reach Through Mists"));
    lands(game, "Island", 3);
    pickFromZone(a, unspeakable);
    cast(game, toHand(game, "Sift Through Sands"));
    expect(zone(game, unspeakable)).toBe("battlefield");
  });
});

describe("Petals of Insight", () => {
  it("puts the three cards on the bottom and returns to its owner's hand", () => {
    const { game, a } = table();
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Shock"), toLibrary(game, "Island")];
    lands(game, "Island", 5);
    const petals = toHand(game, "Petals of Insight");
    const before = hand(game).length;
    pickModes(a, 0);
    cast(game, petals);
    expect(zone(game, petals)).toBe("hand");
    expect(hand(game).length).toBe(before);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-3).sort()).toEqual([...top].sort());
  });

  it("otherwise draws three cards and goes to the graveyard", () => {
    const { game, a } = table();
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Shock"), toLibrary(game, "Island")];
    lands(game, "Island", 5);
    const petals = toHand(game, "Petals of Insight");
    pickModes(a);
    cast(game, petals);
    expect(graveyard(game)).toContain(petals);
    for (const id of top) expect(zone(game, id)).toBe("hand");
  });
});

describe("Akki Underminer", () => {
  it("makes the damaged player sacrifice a permanent", () => {
    const { game, a } = table();
    const underminer = spawn(game, "Akki Underminer");
    const land = spawn(game, "Wastes", B);
    attack(game, a, [underminer]);
    expect(zone(game, land)).toBe("graveyard");
  });
});

describe("Oni Possession", () => {
  it("makes the creature a 5/5 trampling Demon Spirit, and eats a creature each upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Oni Possession"), { targets: [ref(bears)] });
    expect([...subtypes(game, bears)].sort()).toEqual(["Demon", "Spirit"]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    toStep(game, "precombat-main");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Hearth Kami", () => {
  it("destroys the artifact whose mana value is X", () => {
    const { game } = table();
    const kami = spawn(game, "Hearth Kami");
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Wastes", 2);
    game.dispatch({ type: "activate-ability", player: A, source: kami, abilityIndex: 0, targets: [ref(stone)], xValue: 2 });
    settle(game);
    expect(zone(game, kami)).toBe("graveyard");
    expect(zone(game, stone)).toBe("graveyard");
  });
});

describe("Jade Idol", () => {
  it("becomes a 4/4 Spirit artifact creature when you cast an Arcane spell", () => {
    const { game } = table();
    const idol = enter(game, "Jade Idol");
    expect(types(game, idol)).not.toContain("creature");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Reach Through Mists"));
    expect(types(game, idol)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, idol)).toContain("Spirit");
    expect(pt(game, idol)).toEqual({ power: 4, toughness: 4 });
  });
});
