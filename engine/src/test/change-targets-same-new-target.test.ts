/**
 * "Change the target of target spell that targets only this creature"
 * (Torchling): `change-targets` `sameNewTarget` — a spell aimed at it more
 * than once has every one of those targets changed to one new target, asked as
 * a single slot, legal for each (rule 115.7a); a spell that also targets
 * something else can't be targeted (Muck Drubb's `targets: { only }`).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, pt, ref, spawn, table, toHand, watchTargets, zone } from "./harness.js";

/** Alice's Torchling and Grizzly Bears, Bob's Llanowar Elves; Bob casts
 * `spell` at what `aim` names and passes, so Alice holds priority with it on
 * the stack. */
const setUp = (
  spell: string,
  aim: (torch: ObjectId, bears: ObjectId) => readonly ObjectId[],
  bobLands: readonly (readonly [string, number])[],
) => {
  const t = table();
  lands(t.game, "Mountain", 3);
  for (const [name, n] of bobLands) lands(t.game, name, n, B);
  const torch = spawn(t.game, "Torchling");
  const bears = spawn(t.game, "Grizzly Bears");
  const elves = spawn(t.game, "Llanowar Elves", B);
  t.game.dispatch({ type: "pass-priority", player: A });
  const card = toHand(t.game, spell, B);
  cast(t.game, card, { player: B, targets: aim(torch, bears).map(ref), settle: false });
  t.game.dispatch({ type: "pass-priority", player: B });
  expect(t.game.state.priority.holder).toBe(A);
  return { ...t, torch, bears, elves, card };
};

describe("Torchling", () => {
  it("changes a Shock aimed at it to another creature", () => {
    const { game, a, torch, elves } = setUp("Shock", (x) => [x], [["Mountain", 1]]);
    const seen = watchTargets(a, () => [elves]);
    const shock = game.state.zones.shared.stack[0];
    activate(game, torch, 2, { targets: [ref(shock)] });
    expect(seen.asked).toBe(1);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, torch)).toBe("battlefield");
  });

  it("changes every target of a spell aimed at it three times to the same one creature", () => {
    const { game, a, torch, bears, elves, card } = setUp("Seeds of Strength", (x) => [x, x, x], [
      ["Forest", 1],
      ["Plains", 1],
    ]);
    const seen = watchTargets(a, () => [bears]);
    activate(game, torch, 2, { targets: [ref(card)] });
    // One slot asked, not three; Torchling itself isn't offered (115.7a).
    expect(seen.offered.length).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, elves]));
    expect(seen.offered[0]).not.toContain(torch);
    expect(zone(game, card)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, torch)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, elves)).toEqual({ power: 1, toughness: 1 });
  });

  it("can't target a spell that targets something else too", () => {
    const { game, torch, card } = setUp("Seeds of Strength", (x, bears) => [x, bears, x], [
      ["Forest", 1],
      ["Plains", 1],
    ]);
    expect(() => activate(game, torch, 2, { targets: [ref(card)] })).toThrow();
  });
});
