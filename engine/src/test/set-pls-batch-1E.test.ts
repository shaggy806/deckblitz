/**
 * Planeshift (PLS; B221), group E. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
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
  pickFromZone,
  pickModes,
  pickPermanents,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Rith's Grove", () => {
  it("returns a chosen non-Lair land, or is sacrificed with none", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    const seen = pickPermanents(a, forest);
    const grove = enter(game, "Rith's Grove");
    expect(seen.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, grove)).toBe("battlefield");

    pickPermanents(a);
    const second = enter(game, "Rith's Grove");
    expect(zone(game, second)).toBe("graveyard");
    expect(zone(game, grove)).toBe("battlefield");
  });
});

describe("Cavern Harpy", () => {
  it("offers only blue or black creatures you control, itself included", () => {
    const { game, a } = table();
    const blue = spawn(game, "Coral Merfolk");
    spawn(game, "Grizzly Bears");
    spawn(game, "Coral Merfolk", B);
    const seen = pickPermanents(a, blue);
    const harpy = enter(game, "Cavern Harpy");
    expect([...seen.offered].sort()).toEqual([blue, harpy].sort());
    expect(zone(game, blue)).toBe("hand");
    expect(zone(game, harpy)).toBe("battlefield");
  });
});

describe("Shivan Wurm", () => {
  it("returns itself when it's the only red or green creature", () => {
    const { game, a } = table();
    spawn(game, "Coral Merfolk");
    const seen = { offered: [] as readonly string[] };
    a.choosePermanentsFn = (_view, eligible) => {
      seen.offered = eligible;
      return eligible;
    };
    const wurm = enter(game, "Shivan Wurm");
    expect(seen.offered).toEqual([wurm]);
    expect(zone(game, wurm)).toBe("hand");
  });
});

describe("Cloud Cover", () => {
  it("may return another permanent an opponent's spell targets", () => {
    const { game, a } = table();
    spawn(game, "Cloud Cover");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Urza's Guilt", () => {
  it("each player draws two, discards three, loses 4", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const guilt = toHand(game, "Urza's Guilt");
    const before = { a: hand(game, A).length, b: hand(game, B).length };
    cast(game, guilt);
    expect(hand(game, A).length).toBe(before.a - 1 + 2 - 3);
    expect(hand(game, B).length).toBe(before.b + 2 - 3);
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(16);
  });
});

describe("Forsaken City", () => {
  it("doesn't untap, but exiling a card from hand at upkeep untaps it", () => {
    const { game, a } = table();
    const city = spawn(game, "Forsaken City", A, { tapped: true });
    toStep(game, "precombat-main", B);
    pickFromZone(a);
    toStep(game, "precombat-main", A);
    expect(game.state.objects[city].tapped).toBe(true);
    const card = hand(game, A)[0];
    pickFromZone(a, card);
    toStep(game, "precombat-main", A);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[city].tapped).toBe(false);
  });
});

describe("Root Greevil", () => {
  it("destroys only enchantments of the chosen colour", () => {
    const { game, a } = table();
    const greevil = spawn(game, "Root Greevil");
    lands(game, "Forest", 3);
    const white = spawn(game, "Cloud Cover", B);
    const blue = spawn(game, "Shifting Sky", B);
    pickModes(a, 0);
    activate(game, greevil);
    expect(zone(game, white)).toBe("graveyard");
    expect(zone(game, blue)).toBe("battlefield");
    expect(zone(game, greevil)).toBe("graveyard");
  });
});

describe("Samite Pilgrim", () => {
  it("prevents damage equal to the basic land types you control", () => {
    const { game } = table();
    const pilgrim = spawn(game, "Samite Pilgrim");
    lands(game, "Plains", 2);
    spawn(game, "Mountain");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, pilgrim, 0, { targets: [ref(giant)] });
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(giant)]);
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });
});

describe("Malicious Advice", () => {
  it("taps X artifacts, creatures and lands and costs X life", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    cast(game, toHand(game, "Malicious Advice"), { x: 2, targets: [ref(bears), ref(land)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[land].tapped).toBe(true);
    expect(life(game, A)).toBe(18);
  });
});

describe("Shifting Sky", () => {
  it("makes every nonland permanent the chosen colour, lands untouched", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    const sky = toHand(game, "Shifting Sky");
    game.dispatch({ type: "cast-spell", player: A, card: sky, targets: [] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "B" });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect([...game.characteristics(bears).colors]).toEqual(["B"]);
    expect([...game.characteristics(sky).colors]).toEqual(["B"]);
    expect([...game.characteristics(forest).colors]).toEqual([]);
  });
});

describe("Bog Down", () => {
  it("kicked, sacrifices two lands and the player discards three, not five", () => {
    const { game } = table();
    const mine = lands(game, "Swamp", 5);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Bog Down"), { targets: [{ kind: "player", player: B }], kicked: true });
    expect(hand(game, B).length).toBe(before - 3);
    expect(mine.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
    expect(graveyard(game, B).length).toBe(3);
  });

  it("unkicked, the player discards two", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Bog Down"), { targets: [{ kind: "player", player: B }] });
    expect(hand(game, B).length).toBe(before - 2);
  });
});
