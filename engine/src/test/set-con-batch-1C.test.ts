/**
 * Conflux and Shards of Alara (B171), group C. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  loyalty,
  pickModes,
  pickTargets,
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

describe("Cradle of Vitality", () => {
  it("paying {1}{W} puts a counter on the target for each 1 life gained", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 2);
    spawn(game, "Cradle of Vitality");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, toHand(game, "Nourish"));
    expect(life(game, A)).toBe(26);
    expect(counters(game, bears)).toBe(6);
  });
});

describe("Scourglass", () => {
  it("can't be activated outside your upkeep", () => {
    const { game } = table();
    const glass = spawn(game, "Scourglass");
    expect(() => activate(game, glass, 0)).toThrow();
  });

  it("in your upkeep destroys everything but artifacts and lands", () => {
    const { game } = table();
    const glass = spawn(game, "Scourglass");
    const bears = spawn(game, "Grizzly Bears", B);
    const homunculus = spawn(game, "Court Homunculus");
    const cradle = spawn(game, "Cradle of Vitality");
    const [land] = lands(game, "Plains", 1);
    toStep(game, "upkeep");
    activate(game, glass, 0);
    expect(zone(game, glass)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, cradle)).toBe("graveyard");
    expect(zone(game, homunculus)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Voices from the Void", () => {
  it("makes the target discard one card per basic land type you control", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Voices from the Void"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 3);
  });
});

describe("Mirror-Sigil Sergeant", () => {
  it("copies itself in your upkeep only while you control a blue permanent", () => {
    const { game, a } = table();
    spawn(game, "Mirror-Sigil Sergeant");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Mirror-Sigil Sergeant").length).toBe(1);
    spawn(game, "Coiling Oracle");
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Mirror-Sigil Sergeant").length).toBe(2);
  });
});

describe("Hissing Iguanar", () => {
  it("triggers when it dies alongside another creature", () => {
    const { game, a } = table();
    spawn(game, "Hissing Iguanar");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    pickTargets(a, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Wrath of God"));
    expect(life(game, B)).toBe(19);
  });
});

describe("Extractor Demon", () => {
  it("has the target player mill two when another creature leaves the battlefield", () => {
    const { game, a } = table();
    spawn(game, "Extractor Demon");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    pickModes(a, 0);
    destroy(game, bears);
    expect(graveyard(game, B).length).toBe(3);
  });
});

describe("Charnelhoard Wurm", () => {
  it("returns a card from your graveyard when it deals combat damage to an opponent", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Charnelhoard Wurm");
    const card = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, card);
    pickModes(a, 0);
    attack(game, a, [wurm]);
    expect(life(game, B)).toBe(14);
    expect(zone(game, card)).toBe("hand");
  });
});

describe("Court Homunculus", () => {
  it("gets +1/+1 only with another artifact", () => {
    const { game } = table();
    const homunculus = spawn(game, "Court Homunculus");
    expect(pt(game, homunculus)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Scourglass");
    expect(pt(game, homunculus)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Salvage Slasher", () => {
  it("gets +1/+0 for each artifact card in your graveyard", () => {
    const { game } = table();
    const slasher = spawn(game, "Salvage Slasher");
    toGraveyard(game, "Scourglass");
    toGraveyard(game, "Scourglass");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Scourglass", B);
    expect(pt(game, slasher)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Sarkhan Vol", () => {
  it("−6 makes five 4/4 flying Dragons", () => {
    const { game } = table();
    const sarkhan = spawn(game, "Sarkhan Vol");
    loyalty(game, sarkhan, -6, { atLeast: 6 });
    expect(tokensNamed(game, "Dragon Token (Dragonback Assault)", A)).toBe(5);
  });
});
