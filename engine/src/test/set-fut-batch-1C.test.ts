/**
 * Future Sight, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Storm Entity", () => {
  it("cast, it counts the other spells cast this turn, not itself", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const entity = toHand(game, "Storm Entity");
    cast(game, entity);
    expect(zone(game, entity)).toBe("battlefield");
    expect(counters(game, entity)).toBe(1);
  });

  it("put onto the battlefield without being cast, it counts every spell", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const entity = enter(game, "Storm Entity");
    expect(counters(game, entity)).toBe(1);
  });
});

describe("Patrician's Scorn", () => {
  it("is free only after another white spell this turn", () => {
    const { game } = table();
    const scorn = toHand(game, "Patrician's Scorn");
    const aura = spawn(game, "Pacifism", B);
    expect(() => cast(game, scorn, { free: true })).toThrow(/refused/);
    lands(game, "Plains", 1);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(bear)] });
    cast(game, scorn, { free: true });
    expect(zone(game, aura)).toBe("graveyard");
  });
});

describe("Grave Peril", () => {
  it("a nonblack creature entering costs it the enchantment and its life", () => {
    const { game } = table();
    const peril = spawn(game, "Grave Peril");
    const bear = enter(game, "Grizzly Bears", B);
    expect(zone(game, peril)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("ignores a black creature", () => {
    const { game } = table();
    const peril = spawn(game, "Grave Peril");
    const zombie = enter(game, "Walking Corpse", B);
    expect(zone(game, peril)).toBe("battlefield");
    expect(zone(game, zombie)).toBe("battlefield");
  });
});

describe("Emberwilde Augur", () => {
  it("activates only during your upkeep", () => {
    const { game } = table();
    const augur = spawn(game, "Emberwilde Augur");
    expect(() => activate(game, augur, 0, { targets: [ref(B)] })).toThrow(/refused/);
    toStep(game, "upkeep", A);
    activate(game, augur, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(graveyard(game)).toContain(augur);
  });
});

describe("Kavu Primarch", () => {
  it("kicked, it enters with four +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const kavu = toHand(game, "Kavu Primarch");
    cast(game, kavu, { kicked: true });
    expect(counters(game, kavu)).toBe(4);
  });
});

describe("Cloudseeder", () => {
  it("discards a card to make a Cloud Sprite", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const seeder = spawn(game, "Cloudseeder");
    const before = hand(game).length;
    activate(game, seeder, 0);
    expect(hand(game).length).toBe(before - 1);
    expect(tokensNamed(game, "Cloud Sprite Token", A)).toBe(1);
  });
});
