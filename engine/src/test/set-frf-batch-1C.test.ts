/**
 * The set walk: Fate Reforged (FRF), batch 156, group C.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
} from "./harness.js";

describe("Fate Reforged, group C", () => {
  it("Mardu Strike Leader makes a 2/1 black Warrior when it attacks", () => {
    const { game, a } = table();
    const leader = spawn(game, "Mardu Strike Leader");
    attack(game, a, [leader]);
    expect(tokensNamed(game, "Black Warrior Token", A)).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("Harsh Sustenance deals and gains X, the creatures you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Harsh Sustenance"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });

  it("Ainok Guide's first mode puts a +1/+1 counter on it", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const guide = enter(game, "Ainok Guide");
    expect(counters(game, guide)).toBe(1);
    expect(pt(game, guide)).toEqual({ power: 2, toughness: 2 });
  });

  it("Daghatar enters with four counters and moves one to a second creature", () => {
    const { game } = table();
    const daghatar = enter(game, "Daghatar the Adamant");
    expect(counters(game, daghatar)).toBe(4);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    activate(game, daghatar, 0, { targets: [ref(daghatar), ref(bears)] });
    expect(counters(game, daghatar)).toBe(3);
    expect(counters(game, bears)).toBe(1);
  });

  it("Mardu Runemark grants first strike only while you control a white or black permanent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Mardu Runemark"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    spawn(game, "Vampire Nighthawk", B);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    spawn(game, "Vampire Nighthawk");
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });

  it("Bloodfire Enforcers needs an instant and a sorcery in your own graveyard", () => {
    const { game } = table();
    const enforcers = spawn(game, "Bloodfire Enforcers");
    toGraveyard(game, "Shock");
    expect(keywords(game, enforcers).has("first-strike")).toBe(false);
    toGraveyard(game, "Divination", B);
    expect(keywords(game, enforcers).has("trample")).toBe(false);
    toGraveyard(game, "Divination");
    expect(keywords(game, enforcers).has("first-strike")).toBe(true);
    expect(keywords(game, enforcers).has("trample")).toBe(true);
  });

  it("Wandering Champion loots only if you control a blue or red permanent", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const champion = spawn(game, "Wandering Champion");
    attack(game, a, [champion]);
    expect(graveyard(game)).toHaveLength(0);

    const other = table();
    pickModes(other.a, 0);
    const champ = spawn(other.game, "Wandering Champion");
    spawn(other.game, "Wind Drake");
    const before = hand(other.game).length;
    attack(other.game, other.a, [champ]);
    expect(graveyard(other.game)).toHaveLength(1);
    expect(hand(other.game)).toHaveLength(before);
  });
});
