/**
 * "Lands you control don't untap during your next untap step" (the Gods'
 * Last cards — the `skip-next-untap` effect): read at that untap step, so a
 * land that arrives after the spell resolves stays tapped too (the rulings),
 * and the untap step after it untaps as usual. Two such spells wear off in
 * the same step.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, controller, lands, nextTurn, ref, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const tapped = (game: ReturnType<typeof table>["game"], ids: readonly string[]): boolean[] =>
  ids.map((id) => game.state.objects[id as never].tapped === true);

describe("skip-next-untap", () => {
  it("Rhonas's Last Stand: lands there and lands that arrive later stay tapped through one untap step", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 2);
    cast(game, toHand(game, "Rhonas's Last Stand"));
    expect(tokensNamed(game, "5/4 Snake Token", A)).toBe(1);
    const later = spawn(game, "Forest", A, { tapped: true });
    nextTurn(game); // bob's turn: his own untap step, nothing of alice's
    nextTurn(game); // alice's: none of her lands untap
    expect(tapped(game, [...forests, later])).toEqual([true, true, true]);
    nextTurn(game);
    nextTurn(game); // and the step after, they do
    expect(tapped(game, [...forests, later])).toEqual([false, false, false]);
  });

  it("holds only the caster's lands, and only lands", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bobs = spawn(game, "Forest", B, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Rhonas's Last Stand"));
    nextTurn(game); // bob untaps his land
    expect(game.state.objects[bobs].tapped).toBe(false);
    nextTurn(game); // alice's creature untaps
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("Kefnet's Last Word takes the permanent for good; Bontu's Last Reckoning destroys every creature", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 3);
    const stolen = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Kefnet's Last Word"), { targets: [ref(stolen)] });
    expect(controller(game, stolen)).toBe(A);
    nextTurn(game);
    expect(controller(game, stolen)).toBe(A);
    nextTurn(game);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Bontu's Last Reckoning"));
    expect([zone(game, stolen), zone(game, theirs)]).toEqual(["graveyard", "graveyard"]);
  });
});
