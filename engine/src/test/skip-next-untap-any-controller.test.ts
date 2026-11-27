/**
 * "Creatures don't untap during target player's next untap step" (Blinding
 * Beam — the `skip-next-untap` effect's `anyController`): every creature that
 * would untap during that step stays tapped, another player's that Seedborn
 * Muse untaps then included (rule 502.3's "unless an effect allows
 * otherwise"); "creatures they control" (Imaginary Threats) holds only that
 * player's.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

const tapped = (game: ReturnType<typeof table>["game"], ids: readonly string[]): boolean[] =>
  ids.map((id) => game.state.objects[id as never].tapped === true);

describe("skip-next-untap anyController (Blinding Beam)", () => {
  it("holds the target's creatures and a Seedborn Muse player's, not their lands", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const muse = spawn(game, "Seedborn Muse", A, { tapped: true });
    const myLand = spawn(game, "Forest", A, { tapped: true });
    cast(game, toHand(game, "Blinding Beam"), { modes: [1], targets: [ref(B)] });
    nextTurn(game); // bob's untap step: no creature untaps, alice's Forest does
    expect(tapped(game, [theirs, mine, muse, myLand])).toEqual([true, true, true, false]);
    nextTurn(game); // alice's own: hers untap
    expect(tapped(game, [mine, muse])).toEqual([false, false]);
    nextTurn(game); // bob's next: worn off
    expect(tapped(game, [theirs])).toEqual([false]);
  });

  it("\"creatures they control\" (Imaginary Threats) leaves the Seedborn player's alone", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Seedborn Muse", A);
    cast(game, toHand(game, "Imaginary Threats"), { targets: [ref(B)] });
    nextTurn(game);
    expect(tapped(game, [theirs, mine])).toEqual([true, false]);
  });

  it("entwined: taps two creatures and holds them through that player's untap step", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Blinding Beam"), { kicked: true, modes: [0, 1], targets: [ref(one), ref(two), ref(B)] });
    expect(tapped(game, [one, two])).toEqual([true, true]);
    nextTurn(game);
    expect(tapped(game, [one, two])).toEqual([true, true]);
  });
});
