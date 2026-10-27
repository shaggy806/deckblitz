/**
 * Ravnica: City of Guilds (RAV), batch 2, group A (2026-10-27). Written on
 * the shared table in `harness.ts`, each from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  activate,
  cast,
  counters,
  hand,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

const librarySize = (game: ReturnType<typeof table>["game"], player = A): number =>
  game.state.zones.perPlayer[player].library.length;

describe("Induce Paranoia", () => {
  it("with {B} spent, the countered spell's controller mills its mana value", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    lands(game, "Island", 3);
    lands(game, "Swamp", 1);
    const before = librarySize(game);
    cast(game, toHand(game, "Induce Paranoia"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(librarySize(game)).toBe(before - 2);
  });

  it("with no {B} spent, it only counters", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    lands(game, "Island", 4);
    const before = librarySize(game);
    cast(game, toHand(game, "Induce Paranoia"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(librarySize(game)).toBe(before);
  });
});

describe("Plague Boiler", () => {
  it("offers removal only with a counter on it, and at three it wipes nonland permanents", () => {
    const { game, a } = table();
    const boiler = spawn(game, "Plague Boiler");
    const bears = spawn(game, "Grizzly Bears");
    const land = lands(game, "Swamp", 3).concat(lands(game, "Forest", 3), lands(game, "Wastes", 3));
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    activate(game, boiler, 0);
    expect(asked).toBe(0);
    expect(counters(game, boiler, "plague")).toBe(1);
    activate(game, boiler, 0);
    expect(asked).toBe(1);
    expect(counters(game, boiler, "plague")).toBe(2);
    activate(game, boiler, 0);
    expect(zone(game, boiler)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(land.every((l) => zone(game, l) === "battlefield")).toBe(true);
  });
});

describe("Bloodletter Quill", () => {
  it("draws, then loses life for each blood counter", () => {
    const { game } = table();
    const quill = spawn(game, "Bloodletter Quill");
    lands(game, "Wastes", 2);
    const handBefore = hand(game).length;
    activate(game, quill, 0);
    expect(counters(game, quill, "blood")).toBe(1);
    expect(hand(game).length).toBe(handBefore + 1);
    expect(life(game)).toBe(19);
  });
});

describe("Woodwraith Corrupter", () => {
  it("turns a Forest into a 4/4 creature land for good", () => {
    const { game } = table();
    const corrupter = spawn(game, "Woodwraith Corrupter");
    const forest = spawn(game, "Forest");
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    activate(game, corrupter, 0, { targets: [ref(forest)] });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, forest)).toEqual({ power: 4, toughness: 4 });
  });
});
