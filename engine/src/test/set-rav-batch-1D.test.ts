/**
 * Ravnica: City of Guilds (RAV) — group D of the set walk: Tolsimir's two
 * lord lines, Stoneshaker Shaman's untapped-land sacrifice, Dogpile, Belltower Sphinx, Hunted Lammasu,
 * Psychic Drain and Grozoth's mana-value-9 search.
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
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
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
  zone,
} from "./harness.js";

describe("Tolsimir Wolfblood", () => {
  it("gives Voja +2/+2 for being both green and white, and a mono-green creature +1/+1", () => {
    const { game } = table();
    const tolsimir = spawn(game, "Tolsimir Wolfblood");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, tolsimir);
    const [voja] = named(game, "Voja");
    expect(pt(game, voja)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, tolsimir)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Stoneshaker Shaman", () => {
  it("makes the player whose end step it is sacrifice an untapped land, never a tapped one", () => {
    const { game } = table();
    spawn(game, "Stoneshaker Shaman");
    const tapped = spawn(game, "Forest", A, { tapped: true });
    const untapped = spawn(game, "Forest");
    const bobLand = spawn(game, "Forest", B);
    toStep(game, "end");
    settle(game);
    expect(zone(game, untapped)).toBe("graveyard");
    expect(zone(game, tapped)).toBe("battlefield");
    expect(zone(game, bobLand)).toBe("battlefield");
  });
});

describe("Dogpile", () => {
  it("deals damage equal to the attacking creatures you control", () => {
    const { game, a } = table();
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    spawn(game, "Grizzly Bears"); // stays home
    lands(game, "Mountain", 4);
    const dogpile = toHand(game, "Dogpile");
    a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    cast(game, dogpile, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Belltower Sphinx", () => {
  it("mills the damage source's controller that many cards", () => {
    const { game } = table();
    const sphinx = spawn(game, "Belltower Sphinx");
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    const before = graveyard(game, A).length;
    cast(game, shock, { targets: [ref(sphinx)] });
    // Shock itself plus the two milled cards.
    expect(graveyard(game, A).length).toBe(before + 3);
    expect(graveyard(game, B).length).toBe(0);
  });
});

describe("Hunted Lammasu", () => {
  it("gives the targeted opponent a 4/4 Horror", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Hunted Lammasu");
    expect(tokensNamed(game, "Horror Token (4/4)", B)).toBe(1);
    expect(tokensNamed(game, "Horror Token (4/4)", A)).toBe(0);
  });
});

describe("Psychic Drain", () => {
  it("mills the target player X and gains you X life", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 4);
    const drain = toHand(game, "Psychic Drain");
    cast(game, drain, { targets: [ref(B)], x: 3 });
    expect(graveyard(game, B).length).toBe(3);
    expect(life(game, A)).toBe(23);
  });
});

describe("Grozoth", () => {
  it("may search for every card of mana value 9 and nothing else", () => {
    const { game, a } = table();
    const nine = toLibrary(game, "Grozoth");
    toLibrary(game, "Grizzly Bears");
    const before = hand(game).length;
    pickModes(a, 0);
    const offer = pickFromZone(a, nine);
    enter(game, "Grozoth");
    expect(zone(game, nine)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    expect(offer.offered).toEqual([nine]);
  });
});
