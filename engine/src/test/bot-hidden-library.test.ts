import { describe, expect, it } from "vitest";

import { withHiddenLibraryOrder } from "../bot/determinize.js";
import { A, B, registryOf, spawn, table, toLibrary } from "./harness.js";

/**
 * What a bot's simulations may know of a library: its cards, not how they
 * lie (`withHiddenLibraryOrder`). A live game's turn changed with the hidden
 * order of the bot's own library (`docs/bot-misplays.md`, 2026-11-17).
 */
describe("a library's order, hidden from the bot", () => {
  const libraryOf = (state: ReturnType<typeof table>["game"]["state"], player = A) =>
    state.zones.perPlayer[player].library;

  it("is the same whichever way the real library lies", () => {
    const { game } = table();
    const registry = registryOf(game);
    for (const name of ["Shivan Dragon", "Opt", "Murder", "Grizzly Bears"]) toLibrary(game, name);
    const asItLies = withHiddenLibraryOrder(game.state, registry, A);
    const real = [...libraryOf(game.state)];
    game.state.zones.perPlayer[A].library = [...real].reverse();
    const upsideDown = withHiddenLibraryOrder(game.state, registry, A);
    expect(libraryOf(upsideDown)).toEqual(libraryOf(asItLies));
    // The same cards, and not in the order they really lie in.
    expect([...libraryOf(asItLies)].sort()).toEqual([...real].sort());
    expect(libraryOf(asItLies)).not.toEqual(real);
  });

  it("leaves the game's own state as it was, sharing everything but the libraries", () => {
    const { game } = table();
    const before = [...libraryOf(game.state)];
    const rng = game.state.rngState;
    const hidden = withHiddenLibraryOrder(game.state, registryOf(game), A);
    expect(libraryOf(game.state)).toEqual(before);
    expect(game.state.rngState).toBe(rng);
    expect(hidden).not.toBe(game.state);
    expect(hidden.objects).toBe(game.state.objects);
    expect(hidden.zones.perPlayer[A].hand).toBe(game.state.zones.perPlayer[A].hand);
    // A simulation's shuffles and coin flips aren't the real game's either.
    expect(hidden.rngState).not.toBe(rng);
  });

  it("hides the opponents' libraries too", () => {
    const { game } = table();
    const hidden = withHiddenLibraryOrder(game.state, registryOf(game), A);
    expect([...libraryOf(hidden, B)].sort()).toEqual([...libraryOf(game.state, B)].sort());
    expect(libraryOf(hidden, B)).not.toEqual(libraryOf(game.state, B));
  });

  it("keeps a top card the seat can see on top", () => {
    // Oracle of Mul Daya: "Play with the top card of your library revealed."
    const { game } = table();
    spawn(game, "Oracle of Mul Daya");
    const top = toLibrary(game, "Shivan Dragon");
    game.state.zones.perPlayer[A].library = [top, ...libraryOf(game.state).filter((id) => id !== top)];
    const hidden = withHiddenLibraryOrder(game.state, registryOf(game), A);
    expect(libraryOf(hidden)[0]).toBe(top);
    expect(libraryOf(hidden).slice(1)).not.toEqual(libraryOf(game.state).slice(1));
  });

  it("keeps one order through a turn, and makes up another for the next", () => {
    const { game } = table();
    const registry = registryOf(game);
    const first = libraryOf(withHiddenLibraryOrder(game.state, registry, A));
    // A later window of the same turn: the same order, so a plan still reads
    // the same and a window already passed on is known again.
    game.state.eventSeq += 7;
    expect(libraryOf(withHiddenLibraryOrder(game.state, registry, A))).toEqual(first);
    game.state.turn.number += 1;
    expect(libraryOf(withHiddenLibraryOrder(game.state, registry, A))).not.toEqual(first);
  });

  it("leaves the state alone while a resolution is waiting to go on", () => {
    const { game } = table();
    game.state.suspendedResolutions = [{}] as never;
    expect(withHiddenLibraryOrder(game.state, registryOf(game), A)).toBe(game.state);
  });
});
