/**
 * Saviors of Kamigawa (SOK; B197), group E. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  pickModes,
  pickPermanents,
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

describe("Promise of Bunrei", () => {
  it("makes only four Spirits when two creatures die at once", () => {
    const { game } = table();
    const promise = spawn(game, "Promise of Bunrei");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(zone(game, promise)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(4);
  });
});

describe("Overwhelming Intellect", () => {
  it("counters a creature spell and draws its mana value", () => {
    const { game } = table();
    lands(game, "Island", 6);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const intellect = toHand(game, "Overwhelming Intellect");
    const before = hand(game).length;
    cast(game, intellect, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Arashi, the Sky Asunder", () => {
  it("channels X damage to each creature with flying", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const arashi = toHand(game, "Arashi, the Sky Asunder");
    const birds = spawn(game, "Birds of Paradise", B);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, arashi, 1, { x: 1 });
    expect(zone(game, arashi)).toBe("graveyard");
    expect(zone(game, birds)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Celestial Kirin", () => {
  it("destroys every permanent with the Spirit spell's mana value", () => {
    const { game } = table();
    spawn(game, "Celestial Kirin");
    lands(game, "Forest", 2);
    const two = spawn(game, "Grizzly Bears", B);
    const four = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Shinen of Life's Roar"));
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, four)).toBe("battlefield");
  });

  it("counts an Arcane spell's X", () => {
    const { game } = table();
    spawn(game, "Celestial Kirin");
    lands(game, "Swamp", 4);
    const four = spawn(game, "Hill Giant", B);
    const two = spawn(game, "Grizzly Bears", B);
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant")];
    cast(game, toHand(game, "Death Denied"), { x: 2, targets: cards.map((id) => ref(id)) });
    expect([zone(game, two), zone(game, four)]).toEqual(["battlefield", "graveyard"]);
    expect(cards.map((id) => zone(game, id))).toEqual(["hand", "hand"]);
  });
});

describe("Barrel Down Sokenzan", () => {
  it("deals twice the number of Mountains returned", () => {
    const { game, a } = table();
    const mountains = lands(game, "Mountain", 5);
    const arashi = spawn(game, "Arashi, the Sky Asunder", B);
    const spell = toHand(game, "Barrel Down Sokenzan");
    const before = hand(game).length;
    pickPermanents(a, mountains[0], mountains[1], mountains[2]);
    cast(game, spell, { targets: [ref(arashi)] });
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(zone(game, arashi)).toBe("graveyard");
  });

  it("deals nothing with no Mountain returned", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(a);
    cast(game, toHand(game, "Barrel Down Sokenzan"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Trusted Advisor", () => {
  it("returns a blue creature, never a green one, at upkeep", () => {
    const { game } = table();
    const advisor = spawn(game, "Trusted Advisor");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, advisor)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Kemuri-Onna", () => {
  it("may return itself when you cast a Spirit spell", () => {
    const { game, a } = table();
    const onna = spawn(game, "Kemuri-Onna");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Shinen of Life's Roar"));
    expect(zone(game, onna)).toBe("hand");
  });
});

describe("Kitsune Loreweaver", () => {
  it("gets +0/+X for the cards in hand", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const fox = spawn(game, "Kitsune Loreweaver");
    const n = hand(game).length;
    activate(game, fox, 0);
    expect(pt(game, fox)).toEqual({ power: 2, toughness: 1 + n });
  });
});

describe("Soramaro, First to Dream", () => {
  it("is as big as your hand", () => {
    const { game } = table();
    const soramaro = spawn(game, "Soramaro, First to Dream");
    const n = hand(game).length;
    expect(pt(game, soramaro)).toEqual({ power: n, toughness: n });
    expect(graveyard(game).length).toBe(0);
  });
});
