/**
 * Invasion (INV; B226) — group C: kicker, split cards, colour choices and
 * domain.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

describe("Empress Galina", () => {
  it("gains control of a legendary permanent for good", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const galina = spawn(game, "Empress Galina");
    const hound = spawn(game, "Isamaru, Hound of Konda", B);
    activate(game, galina, 0, { targets: [ref(hound)] });
    expect(controller(game, hound)).toBe(A);
    toStep(game, "precombat-main", A);
    expect(controller(game, hound)).toBe(A);
  });
});

describe("Breath of Darigaaz", () => {
  it("deals 1 unkicked and 4 kicked to each creature without flying and each player", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Breath of Darigaaz"));
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
    expect(zone(game, bears)).toBe("battlefield");
    cast(game, toHand(game, "Breath of Darigaaz"), { kicked: true });
    expect(life(game, A)).toBe(15);
    expect(life(game, B)).toBe(15);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
  });
});

describe("Spirit of Resistance", () => {
  it("prevents damage to you only while you control a permanent of each color", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Spirit of Resistance");
    spawn(game, "Coral Merfolk");
    spawn(game, "Scathe Zombies");
    spawn(game, "Raging Goblin");
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
    spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
  });
});

describe("Sway of Illusion", () => {
  it("makes every target the one chosen colour and draws a card", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    const before = hand(game).length;
    pickModes(a, 2);
    cast(game, toHand(game, "Sway of Illusion"), { targets: [ref(bears), ref(goblin)] });
    for (const id of [bears, goblin]) expect([...computeCharacteristics(game.state, game.registry, id).colors].sort()).toEqual(["B"]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Wax // Wane", () => {
  it("casts Wane to destroy an enchantment, Wax to pump", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Forest", 1);
    const pacifism = spawn(game, "Pacifism", B);
    cast(game, toHand(game, "Wax // Wane"), { face: 2, targets: [ref(pacifism)] });
    expect(zone(game, pacifism)).toBe("graveyard");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Wax // Wane"), { face: 1, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Spite // Malice", () => {
  it("casts Malice on a nonblack creature", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Spite // Malice"), { face: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Skizzik", () => {
  it("is sacrificed at the end step unless it was kicked", () => {
    const { game } = table();
    lands(game, "Mountain", 9);
    const plain = toHand(game, "Skizzik");
    cast(game, plain);
    const kicked = toHand(game, "Skizzik");
    cast(game, kicked, { kicked: true });
    toStep(game, "precombat-main", A);
    expect(zone(game, plain)).toBe("graveyard");
    expect(zone(game, kicked)).toBe("battlefield");
  });
});

describe("Overload", () => {
  it("destroys mana value 2 or less, or 5 or less kicked", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const powerstone = spawn(game, "Worn Powerstone", B);
    cast(game, toHand(game, "Overload"), { targets: [ref(powerstone)] });
    expect(zone(game, powerstone)).toBe("battlefield");
    cast(game, toHand(game, "Overload"), { targets: [ref(powerstone)], kicked: true });
    expect(zone(game, powerstone)).toBe("graveyard");
  });
});

describe("Addle", () => {
  it("discards a card of the colour chosen as it resolves", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const shock = toHand(game, "Shock", B);
    const bears = toHand(game, "Grizzly Bears", B);
    pickModes(a, 4);
    pickFromZone(a, bears);
    cast(game, toHand(game, "Addle"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, shock)).toBe("hand");
  });
});

describe("Worldly Counsel", () => {
  it("looks at one card per basic land type", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 1);
    toLibrary(game, "Grizzly Bears");
    const top = toLibrary(game, "Shock");
    const seen = pickFromZone(a, top);
    cast(game, toHand(game, "Worldly Counsel"));
    expect(seen.offered.length).toBe(2);
    expect(zone(game, top)).toBe("hand");
  });
});

describe("Kavu Titan", () => {
  it("kicked, enters with three counters and trample", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const kicked = toHand(game, "Kavu Titan");
    cast(game, kicked, { kicked: true });
    expect(counters(game, kicked)).toBe(3);
    expect(keywords(game, kicked).has("trample")).toBe(true);
    const plain = toHand(game, "Kavu Titan");
    cast(game, plain);
    expect(counters(game, plain)).toBe(0);
    expect(keywords(game, plain).has("trample")).toBe(false);
  });
});
