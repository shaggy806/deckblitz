/**
 * `doubleTriggersOf`'s `spells`: a triggered ability of a spell triggers an
 * additional time too, Echoes of Eternity's "a colorless spell you control or
 * another colorless permanent you control", with its copying of colorless
 * spells (rule 707.10: a copy of a permanent spell becomes a token).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, destroy, enter, hand, lands, pickModes, ref, settle, spawn, table, toGraveyard, tokensNamed, toHand, zone } from "./harness.js";

const castWithMana = (game: Game, name: string, mana: number): void => {
  lands(game, "Wastes", mana);
  cast(game, toHand(game, name));
};

describe("Echoes of Eternity: triggers of colorless things", () => {
  it("a colorless permanent's trigger triggers an additional time", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Echoes of Eternity");
    const solemn = spawn(game, "Solemn Simulacrum");
    const before = hand(game).length;
    destroy(game, solemn);
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });

  it("a colored permanent's doesn't", () => {
    const { game } = table();
    spawn(game, "Echoes of Eternity");
    const before = hand(game).length;
    enter(game, "Elvish Visionary");
    expect(hand(game).length).toBe(before + 1);
  });

  it("nor does an opponent's colorless one", () => {
    const { game, b } = table();
    pickModes(b, 0);
    spawn(game, "Echoes of Eternity");
    const solemn = spawn(game, "Solemn Simulacrum", B);
    const before = hand(game, B).length;
    destroy(game, solemn);
    settle(game);
    expect(hand(game, B).length).toBe(before + 1);
  });

  it("a colorless spell's cast trigger triggers an additional time: Kozilek draws eight", () => {
    const { game } = table();
    spawn(game, "Echoes of Eternity");
    lands(game, "Wastes", 10);
    const before = hand(game).length;
    cast(game, toHand(game, "Kozilek, Butcher of Truth"));
    expect(hand(game).length).toBe(before + 8);
  });

  it("each instance chooses its own target (its ruling)", () => {
    const { game, a } = table();
    spawn(game, "Echoes of Eternity");
    const first = toGraveyard(game, "Grizzly Bears");
    const second = toGraveyard(game, "Grizzly Bears");
    const picks = [first, second];
    a.chooseTargetsFn = () => [ref(picks.shift() ?? first)];
    a.chooseModesFn = () => [0];
    castWithMana(game, "Artisan of Kozilek", 9);
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
  });

  it("without `spells` a spell's trigger isn't reached: Fractured Realm", () => {
    const { game } = table();
    spawn(game, "Fractured Realm");
    lands(game, "Wastes", 10);
    const before = hand(game).length;
    cast(game, toHand(game, "Kozilek, Butcher of Truth"));
    expect(hand(game).length).toBe(before + 4);
  });
});

describe("Echoes of Eternity: copying", () => {
  it("copies a colorless spell you cast, a permanent spell's copy a token", () => {
    const { game } = table();
    spawn(game, "Echoes of Eternity");
    castWithMana(game, "Ulamog's Crusher", 8);
    expect(tokensNamed(game, "Ulamog's Crusher", A)).toBe(1);
  });

  it("not a colored spell", () => {
    const { game } = table();
    spawn(game, "Echoes of Eternity");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(0);
  });

  it("not an opponent's", () => {
    const { game } = table();
    spawn(game, "Echoes of Eternity", B);
    castWithMana(game, "Ulamog's Crusher", 8);
    expect(tokensNamed(game, "Ulamog's Crusher")).toBe(0);
  });

  it("two copies of it: four copies of the spell (its ruling)", () => {
    const { game } = table();
    spawn(game, "Echoes of Eternity");
    spawn(game, "Echoes of Eternity");
    castWithMana(game, "Ulamog's Crusher", 8);
    expect(tokensNamed(game, "Ulamog's Crusher", A)).toBe(4);
  });

  it("two copies of it: another colorless permanent's trigger three times (its ruling)", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Echoes of Eternity");
    spawn(game, "Echoes of Eternity");
    const solemn = spawn(game, "Solemn Simulacrum");
    const before = hand(game).length;
    destroy(game, solemn);
    settle(game);
    expect(hand(game).length).toBe(before + 3);
  });

  it("the copy isn't cast, so its cast trigger doesn't fire for it (its ruling)", () => {
    const { game } = table();
    spawn(game, "Echoes of Eternity");
    lands(game, "Wastes", 10);
    const before = hand(game).length;
    cast(game, toHand(game, "Kozilek, Butcher of Truth"));
    // The spell's own trigger twice, none for its copy.
    expect(hand(game).length).toBe(before + 8);
  });
});
