/**
 * "If a creature you control would explore, instead it explores, then it
 * explores again" (Topography Tracker): the `would-explore` replacement. Each
 * exploration is whole (rule 701.44a) — its own reveal, its own choice, its
 * own "whenever a creature you control explores" (701.44b) — and the
 * replacement applies once to each instruction, not to the explorations it
 * makes (rule 614.5), so two Trackers make four.
 */
import { describe, expect, it } from "vitest";

import { A, B, counters, destroy, enter, hand, pickModes, pt, ref, settle, spawn, table, toLibrary, tokensNamed, zone } from "./harness.js";

describe("if a creature you control would explore, instead it explores, then it explores again", () => {
  it("Topography Tracker makes a Map token as it enters", () => {
    const { game } = table();
    enter(game, "Topography Tracker");
    expect(tokensNamed(game, "Map Token", A)).toBe(1);
  });

  it("explores twice: two reveals, each its own result", () => {
    const { game, a } = table();
    spawn(game, "Topography Tracker");
    // Top first: a land (to hand), then a nonland (a counter, binned).
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(forest);
    pickModes(a, 0);
    const scout = enter(game, "Cenote Scout");
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, scout)).toBe(1);
  });

  it("reveals the same card again when it's left on top, and each exploration triggers", () => {
    const { game, a } = table();
    spawn(game, "Topography Tracker");
    const diver = spawn(game, "Merfolk Cave-Diver");
    const before = pt(game, diver).power;
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a); // leave it on top both times
    const scout = enter(game, "Cenote Scout");
    expect(counters(game, scout)).toBe(2);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bears);
    expect(pt(game, diver).power).toBe(before + 2);
  });

  it("two of them make four explorations, and 'explores, then explores again' eight", () => {
    const { game, a } = table();
    spawn(game, "Topography Tracker");
    spawn(game, "Topography Tracker");
    toLibrary(game, "Grizzly Bears");
    pickModes(a);
    const scout = enter(game, "Cenote Scout");
    expect(counters(game, scout)).toBe(4);
    const ranger = enter(game, "Jadelight Ranger");
    expect(counters(game, ranger)).toBe(8);
  });

  it("leaves an opponent's creature's exploring alone", () => {
    const { game, b } = table();
    spawn(game, "Topography Tracker", A);
    toLibrary(game, "Grizzly Bears", B);
    pickModes(b);
    const scout = enter(game, "Cenote Scout", B);
    expect(counters(game, scout)).toBe(1);
  });

  it("a creature that has left still explores twice, as it last was", () => {
    const { game, a } = table();
    spawn(game, "Topography Tracker");
    const diver = spawn(game, "Merfolk Cave-Diver");
    const before = pt(game, diver).power;
    const first = toLibrary(game, "Forest");
    const second = toLibrary(game, "Forest");
    const cards = hand(game).length;
    pickModes(a);
    const scout = enter(game, "Cenote Scout", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, scout);
    settle(game);
    expect(zone(game, scout)).toBe("graveyard");
    expect([zone(game, first), zone(game, second)]).toEqual(["hand", "hand"]);
    expect(hand(game).length).toBe(cards + 2);
    expect(pt(game, diver).power).toBe(before + 2);
  });

  it("stops when the Tracker has lost its abilities", () => {
    const { game, a } = table();
    const tracker = spawn(game, "Topography Tracker");
    game.debugApplyEffect(B, { kind: "become", loseAbilities: true, target: 0, duration: "end-of-turn" }, [ref(tracker)]);
    toLibrary(game, "Grizzly Bears");
    pickModes(a);
    const scout = enter(game, "Cenote Scout");
    expect(counters(game, scout)).toBe(1);
  });
});
