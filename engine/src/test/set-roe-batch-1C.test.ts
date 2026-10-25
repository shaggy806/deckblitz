/**
 * Rise of the Eldrazi, group C: the clauses most likely to be wrong in each
 * card that's more than a stat line.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  supertypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Rise of the Eldrazi, group C", () => {
  it("Keening Stone: the target player mills as many cards as are in their graveyard", () => {
    const { game } = table();
    lands(game, "Wastes", 5);
    const stone = spawn(game, "Keening Stone");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Wastes", B);
    toGraveyard(game, "Wastes", A);
    activate(game, stone, 0, { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(6);
    expect(graveyard(game, A)).toHaveLength(1);
  });

  it("Consuming Vapors: gains life equal to the sacrificed creature's toughness, then rebounds", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const wall = spawn(game, "Wall of Omens", B);
    const vapors = toHand(game, "Consuming Vapors");
    cast(game, vapors, { targets: [ref(B)] });
    expect(zone(game, wall)).toBe("graveyard");
    expect(life(game, A)).toBe(24);
    expect(zone(game, vapors)).toBe("exile");
  });

  it("Enclave Cryptologist: no tap ability unleveled, loots at level 1-2, draws at level 3+", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const crypt = spawn(game, "Enclave Cryptologist");
    expect(() => activate(game, crypt, 1)).toThrow();
    activate(game, crypt, 0);
    expect(counters(game, crypt, "level")).toBe(1);
    expect(() => activate(game, crypt, 2)).toThrow();
    const before = hand(game).length;
    activate(game, crypt, 1);
    expect(hand(game).length).toBe(before); // drew one, discarded one
    expect(graveyard(game)).toHaveLength(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: 2 }, [ref(crypt)]);
    game.state.objects[crypt].tapped = false;
    expect(() => activate(game, crypt, 1)).toThrow();
    activate(game, crypt, 2);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Vengevine returns on the second creature spell of the turn, not the first or on a noncreature", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const vine = toGraveyard(game, "Vengevine");
    pickModes(a, 0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(spawn(game, "Grizzly Bears"))] });
    cast(game, toHand(game, "Llanowar Elves"));
    expect(zone(game, vine)).toBe("graveyard");
    cast(game, toHand(game, "Llanowar Elves"));
    expect(zone(game, vine)).toBe("battlefield");
  });

  it("Vengevine: a third creature spell doesn't fire it", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    pickModes(a, 0);
    cast(game, toHand(game, "Llanowar Elves"));
    cast(game, toHand(game, "Llanowar Elves"));
    const vine = toGraveyard(game, "Vengevine");
    cast(game, toHand(game, "Llanowar Elves"));
    expect(zone(game, vine)).toBe("graveyard");
  });

  it("Angelheart Vial: you may put a charge counter per damage dealt to you, and cash four in", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const vial = spawn(game, "Angelheart Vial");
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "damage", amount: 4, target: 0 }, [ref(A)]);
    settle(game);
    expect(counters(game, vial, "charge")).toBe(4);
    const before = hand(game).length;
    activate(game, vial, 0);
    expect(counters(game, vial, "charge")).toBe(0);
    expect(life(game, A)).toBe(18);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Narcolepsy taps the enchanted creature at the beginning of each upkeep", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Narcolepsy"), { targets: [ref(bears)] });
    nextTurn(game, "draw");
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Devastating Summons: sacrificing X lands makes two X/X red Elementals", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Devastating Summons"), { x: 3 });
    expect(named(game, "Mountain")).toHaveLength(1);
    const tokens = named(game, "X/X Red Elemental Token");
    expect(tokensNamed(game, "X/X Red Elemental Token")).toBe(2);
    expect(pt(game, tokens[0])).toEqual({ power: 3, toughness: 3 });
  });

  it("Harmless Assault prevents the attackers' combat damage but not the blockers'", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 4);
    const ogre = spawn(game, "Gray Ogre");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Harmless Assault"));
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [ogre, bears]);
    expect(life(game, B)).toBe(20);
    expect(zone(game, blocker)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Tuktuk the Explorer leaves Tuktuk the Returned, a legendary 5/5 artifact", () => {
    const { game } = table();
    const tuktuk = spawn(game, "Tuktuk the Explorer");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(tuktuk)]);
    settle(game);
    const [returned] = named(game, "Tuktuk the Returned");
    expect(pt(game, returned)).toEqual({ power: 5, toughness: 5 });
    expect(supertypes(game, returned)).toContain("legendary");
  });

  it("Vent Sentinel deals damage equal to the creatures you control with defender", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const sentinel = spawn(game, "Vent Sentinel");
    spawn(game, "Wall of Omens");
    spawn(game, "Grizzly Bears");
    activate(game, sentinel, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});
