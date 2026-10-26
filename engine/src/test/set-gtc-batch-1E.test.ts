/**
 * Gatecrash (GTC), batch 1, group E (2026-10-26). Written on the shared
 * table in `harness.ts`, each test from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("Armored Transport", () => {
  it("takes no combat damage from a creature blocking it", () => {
    const { game, a, b } = table();
    const transport = spawn(game, "Armored Transport");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: transport }];
    attack(game, a, [transport]);
    expect(zone(game, transport)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("still takes damage from the creature it blocks", () => {
    const { game, a, b } = table();
    const transport = spawn(game, "Armored Transport");
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareBlockersFn = () => [{ blocker: transport, attacker: bears }];
    attack(game, b, [bears], A);
    expect(zone(game, transport)).toBe("graveyard");
  });
});

describe("Devour Flesh", () => {
  it("the target player sacrifices and gains life equal to its toughness", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Devour Flesh"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(22);
    expect(life(game, A)).toBe(20);
  });
});

describe("Dying Wish", () => {
  it("drains the target player by the enchanted creature's power when it dies", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Dying Wish"), { targets: [ref(giant)] });
    pickTargets(a, B);
    destroy(game, giant);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Gideon, Champion of Justice", () => {
  it("+1 adds a loyalty counter per creature the target opponent controls", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon, Champion of Justice");
    game.state.objects[gideon].counters.loyalty = 4;
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    loyalty(game, gideon, 1, { targets: [ref(B)] });
    expect(counters(game, gideon, "loyalty")).toBe(7);
  });

  it("0 makes him a creature with P/T equal to his loyalty, set as it resolves", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon, Champion of Justice");
    game.state.objects[gideon].counters.loyalty = 6;
    loyalty(game, gideon, 0);
    expect(types(game, gideon)).toContain("creature");
    expect(types(game, gideon)).toContain("planeswalker");
    expect(pt(game, gideon)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, gideon).has("indestructible")).toBe(true);
    game.state.objects[gideon].counters.loyalty = 2;
    expect(pt(game, gideon)).toEqual({ power: 6, toughness: 6 });
  });

  it("−15 exiles every other permanent", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon, Champion of Justice");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Swamp", B);
    loyalty(game, gideon, -15, { atLeast: 16 });
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, gideon)).toBe("battlefield");
  });
});

describe("Gridlock", () => {
  it("taps X target nonland permanents", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Armored Transport", B);
    cast(game, toHand(game, "Gridlock"), { targets: [ref(one), ref(two)], x: 2 });
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
  });
});

describe("Wight of Precinct Six", () => {
  it("counts only creature cards in opponents' graveyards", () => {
    const { game } = table();
    const wight = spawn(game, "Wight of Precinct Six");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Swamp", B);
    toGraveyard(game, "Grizzly Bears", A);
    expect(pt(game, wight)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Nav Squad Commandos", () => {
  it("battalion: +1/+1 and untaps it", () => {
    const { game, a } = table();
    const commandos = spawn(game, "Nav Squad Commandos");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    attack(game, a, [commandos, x, y]);
    expect(game.state.objects[commandos].tapped).toBe(false);
    expect(pt(game, commandos)).toEqual({ power: 4, toughness: 6 });
    expect(life(game, B)).toBe(20 - 8);
  });
});

describe("Firemane Avenger", () => {
  it("battalion deals 3 to any target and gains 3", () => {
    const { game, a } = table();
    const avenger = spawn(game, "Firemane Avenger");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [avenger, x, y]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });

  it("doesn't trigger with only one other attacker", () => {
    const { game, a } = table();
    const avenger = spawn(game, "Firemane Avenger");
    const x = spawn(game, "Grizzly Bears");
    attack(game, a, [avenger, x]);
    expect(life(game, A)).toBe(20);
  });
});

describe("Foundry Champion", () => {
  it("deals damage equal to the creatures you control, itself included", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    enter(game, "Foundry Champion");
    expect(life(game, B)).toBe(18);
  });
});
