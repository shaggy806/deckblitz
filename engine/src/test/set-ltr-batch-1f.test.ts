/**
 * The Lord of the Rings: Tales of Middle-earth (LTR) and its Commander set
 * (LTC), batch 1, the lead's group (2026-10-17): the cards the features built
 * for this set unblocked that aren't tested with their feature. Each test
 * from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  attack,
  cast,
  lands,
  named,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
} from "./harness.js";

describe("Galadriel of Lothlórien", () => {
  it("scries 3 when the Ring tempts you and you choose another creature, not when you choose her", () => {
    const { game, a } = table();
    const galadriel = spawn(game, "Galadriel of Lothlórien");
    const bears = spawn(game, "Grizzly Bears");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    a.chooseModesFn = () => [];
    a.choosePermanentsFn = () => [galadriel];
    game.debugApplyEffect(A, { kind: "the-ring-tempts-you" });
    settle(game);
    expect(scried).toBe(0);
    a.choosePermanentsFn = () => [bears];
    game.debugApplyEffect(A, { kind: "the-ring-tempts-you" });
    settle(game);
    expect(scried).toBe(3);
  });

  it("whenever you scry, you may reveal the top card and put a land onto the battlefield tapped", () => {
    const { game, a } = table();
    spawn(game, "Galadriel of Lothlórien");
    const forest = toLibrary(game, "Forest");
    a.chooseModesFn = (_view, minModes) => (minModes === 0 ? [0] : [0]);
    game.debugApplyEffect(A, { kind: "scry", amount: 1 });
    settle(game);
    expect(game.state.objects[forest].zone).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Faramir, Field Commander", () => {
  it("makes a Human Soldier when the Ring tempts you and you choose another creature", () => {
    const { game, a } = table();
    const faramir = spawn(game, "Faramir, Field Commander");
    const bears = spawn(game, "Grizzly Bears");
    a.choosePermanentsFn = () => [faramir];
    game.debugApplyEffect(A, { kind: "the-ring-tempts-you" });
    settle(game);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);
    a.choosePermanentsFn = () => [bears];
    game.debugApplyEffect(A, { kind: "the-ring-tempts-you" });
    settle(game);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });
});

describe("Arboreal Alliance", () => {
  it("makes an X/X Treefolk, and attacking with an Elf populates a copy of it at X/X", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Arboreal Alliance"), { x: 3 });
    const [treefolk] = named(game, "Treefolk Token (Sylvan Offering)", A);
    expect(pt(game, treefolk)).toEqual({ power: 3, toughness: 3 });
    const elf = spawn(game, "Llanowar Elves");
    attack(game, a, [elf]);
    const all = named(game, "Treefolk Token (Sylvan Offering)", A);
    expect(tokensNamed(game, "Treefolk Token (Sylvan Offering)", A)).toBe(2);
    for (const t of all) expect(pt(game, t)).toEqual({ power: 3, toughness: 3 });
  });
});
