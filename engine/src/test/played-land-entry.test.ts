/**
 * The filter's `played` — a land that entered by being played (rule 305.1),
 * `EntryRecord.played`. Deep Gnome Terramancer's "lands enter under an
 * opponent's control without being played": a played land doesn't fire it,
 * one an effect puts there does, and only once each turn.
 */
import { describe, expect, it } from "vitest";

import { activePlayerOf } from "../state.js";
import { A, B, nextTurn, settle, spawn, table, toHand, toLibrary } from "./harness.js";

const plainsOnField = (game: ReturnType<typeof table>["game"]): number =>
  game.battlefield.filter((id) => game.state.objects[id].cardName === "Plains" && game.state.objects[id].controller === A).length;

describe("played — Deep Gnome Terramancer", () => {
  it("ignores a played land, fires for one put onto the battlefield, once a turn", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    spawn(game, "Deep Gnome Terramancer");
    toLibrary(game, "Plains");
    toLibrary(game, "Plains");
    nextTurn(game); // Bob's turn.
    expect(activePlayerOf(game.state)).toBe(B);
    const forest = toHand(game, "Forest", B);
    game.dispatch({ type: "play-land", player: B, card: forest });
    settle(game);
    expect(plainsOnField(game)).toBe(0);
    game.debugApplyEffect(B, { kind: "search-library", filter: { type: "land" }, destination: "battlefield", min: 1, max: 1 }, []);
    settle(game);
    expect(plainsOnField(game)).toBe(1);
    game.debugApplyEffect(B, { kind: "search-library", filter: { type: "land" }, destination: "battlefield", min: 1, max: 1 }, []);
    settle(game);
    expect(plainsOnField(game)).toBe(1);
  });
});
