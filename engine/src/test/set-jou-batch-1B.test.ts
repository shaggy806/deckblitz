/**
 * Journey into Nyx, group B: strive, constellation, the sacrificed
 * creature's power and the rest — the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Eidolon of the Great Revel", () => {
  it("deals 2 damage to a player who casts a spell of mana value 3 or less, not more", () => {
    const { game } = table();
    spawn(game, "Eidolon of the Great Revel", B);
    lands(game, "Forest", 8);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(18);
    cast(game, toHand(game, "Craw Wurm"));
    expect(life(game, A)).toBe(18);
  });
});

describe("Harness by Force", () => {
  it("steals, untaps and hastes each target, {2}{R} more for the second", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    const mountains = lands(game, "Mountain", 6);
    cast(game, toHand(game, "Harness by Force"), { targets: [ref(bears), ref(giant)] });
    expect(mountains.every((id) => game.state.objects[id].tapped)).toBe(true);
    for (const id of [bears, giant]) {
      expect(controller(game, id)).toBe(A);
      expect(game.state.objects[id].tapped).toBe(false);
      expect(keywords(game, id).has("haste")).toBe(true);
    }
  });
});

describe("Mortal Obstinacy", () => {
  it("sacrificing it after combat damage destroys the target enchantment", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const font = spawn(game, "Font of Ire", B);
    lands(game, "Plains", 1);
    const aura = toHand(game, "Mortal Obstinacy");
    cast(game, aura, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    pickTargets(a, font);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, font)).toBe("graveyard");
  });
});

describe("Tormented Thoughts", () => {
  it("the target discards as many cards as the sacrificed creature's power", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Swamp", 3);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Tormented Thoughts"), { targets: [ref(B)], sacrifice: giant });
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 3);
  });
});

describe("Ritual of the Returned", () => {
  it("makes a Zombie the exiled card's size", () => {
    const { game } = table();
    const wurm = toGraveyard(game, "Craw Wurm");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Ritual of the Returned"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("exile");
    const [zombie] = named(game, "Zombie Token (Black 0/0)");
    expect(pt(game, zombie)).toEqual({ power: 6, toughness: 4 });
  });
});

describe("Knowledge and Power", () => {
  it("whenever you scry, paying {2} deals 2 damage to the target", () => {
    const { game, a } = table();
    spawn(game, "Knowledge and Power");
    lands(game, "Island", 3);
    pickTargets(a, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Opt"));
    expect(life(game, B)).toBe(18);
  });
});

describe("Thoughtrender Lamia", () => {
  it("another enchantment entering makes each opponent discard", () => {
    const { game } = table();
    spawn(game, "Thoughtrender Lamia");
    const before = hand(game, B).length;
    enter(game, "Font of Ire");
    settle(game);
    expect(hand(game, B).length).toBe(before - 1);
    expect(graveyard(game, B).length).toBe(1);
  });
});

describe("Spawn of Thraxes", () => {
  it("deals damage equal to the Mountains you control", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    pickTargets(a, B);
    enter(game, "Spawn of Thraxes");
    expect(life(game, B)).toBe(17);
  });
});
