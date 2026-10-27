/**
 * "That player skips their next untap step" (rule 614.10 — the
 * `skip-untap-step` effect): the whole step goes by as though it didn't exist
 * (500.11), so nothing untaps in it; two such effects skip the next two
 * (614.10a); and what waits for "their next untap step" — a "doesn't untap
 * during its controller's next untap step" — waits for the first one that
 * isn't skipped. Savor the Moment's extra turn skips its own untap step.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, cast, lands, loyalty, nextTurn, ref, spawn, table, toHand } from "./harness.js";

const tapped = (game: Game, ids: readonly ObjectId[]): boolean[] => ids.map((id) => game.state.objects[id].tapped === true);
const activeIs = (game: Game): string => game.state.turnOrder[game.state.turn.activePlayerIndex];

describe("skip-untap-step", () => {
  it("Avizoa: its controller's next untap step is skipped, the one after isn't", () => {
    const { game } = table();
    const avizoa = spawn(game, "Avizoa");
    const forests = lands(game, "Forest", 2);
    for (const id of forests) game.state.objects[id].tapped = true;
    activate(game, avizoa);
    expect(game.state.players[A].untapStepsToSkip).toBe(1);
    nextTurn(game); // bob's
    nextTurn(game); // alice's: skipped
    expect(activeIs(game)).toBe(A);
    expect(tapped(game, forests)).toEqual([true, true]);
    expect(game.state.players[A].untapStepsToSkip).toBeUndefined();
    nextTurn(game);
    nextTurn(game); // her next one happens
    expect(tapped(game, forests)).toEqual([false, false]);
  });

  it("two skips skip the next two untap steps (614.10a)", () => {
    const { game } = table();
    const avizoa = spawn(game, "Avizoa");
    const forest = lands(game, "Forest", 1);
    game.state.objects[forest[0]].tapped = true;
    activate(game, avizoa);
    nextTurn(game); // bob's turn: once each turn, so again
    game.dispatch({ type: "pass-priority", player: B });
    activate(game, avizoa);
    expect(game.state.players[A].untapStepsToSkip).toBe(2);
    nextTurn(game); // alice: skipped
    nextTurn(game);
    nextTurn(game); // alice: skipped again
    expect(tapped(game, forest)).toEqual([true]);
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, forest)).toEqual([false]);
  });

  it("a 'doesn't untap during its controller's next untap step' waits past a skipped one", () => {
    const { game } = table();
    const dovin = spawn(game, "Dovin, Architect of Law");
    const avizoa = spawn(game, "Avizoa");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, dovin, -1, { targets: [ref(bears)] });
    activate(game, avizoa);
    nextTurn(game);
    nextTurn(game); // alice: skipped — bears stays tapped
    expect(tapped(game, [bears])).toEqual([true]);
    nextTurn(game);
    nextTurn(game); // her first untap step that happens: the bears' "next" one
    expect(tapped(game, [bears])).toEqual([true]);
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, [bears])).toEqual([false]);
  });

  it("Dovin's −9 taps everything target opponent controls, and they skip their next untap step", () => {
    const { game } = table();
    const dovin = spawn(game, "Dovin, Architect of Law");
    const theirs = [...lands(game, "Island", 2, B), spawn(game, "Grizzly Bears", B)];
    const mine = lands(game, "Plains", 1);
    loyalty(game, dovin, -9, { atLeast: 9, targets: [ref(B)] });
    expect(tapped(game, [...theirs, ...mine])).toEqual([true, true, true, false]);
    nextTurn(game); // bob's: skipped
    expect(activeIs(game)).toBe(B);
    expect(tapped(game, theirs)).toEqual([true, true, true]);
    nextTurn(game);
    nextTurn(game); // bob's next untaps
    expect(tapped(game, theirs)).toEqual([false, false, false]);
  });

  it("Savor the Moment: the extra turn's untap step is skipped, the next turn's isn't", () => {
    const { game } = table();
    const islands = lands(game, "Island", 3);
    cast(game, toHand(game, "Savor the Moment"));
    expect(tapped(game, islands)).toEqual([true, true, true]);
    nextTurn(game); // the extra turn: alice's again, nothing untaps
    expect(activeIs(game)).toBe(A);
    expect(game.state.turn.isExtra).toBe(true);
    expect(tapped(game, islands)).toEqual([true, true, true]);
    nextTurn(game);
    expect(activeIs(game)).toBe(B);
    nextTurn(game);
    expect(tapped(game, islands)).toEqual([false, false, false]);
  });
});
