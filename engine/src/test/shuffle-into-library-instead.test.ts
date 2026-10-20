/**
 * "If this would be put into a graveyard from anywhere, reveal it and shuffle it into its owner's
 * library instead" (`shufflesIntoLibraryInstead` — Blightsteel Colossus, Darksteel Colossus, Nexus
 * of Fate, Progenitus, Legacy Weapon): from the battlefield, a hand, a library or the stack; ahead
 * of Rest in Peace; not once the permanent has lost its abilities.
 */
import { describe, expect, it } from "vitest";

import { A, cast, graveyard, lands, ref, settle, spawn, table, toHand, toLibrary } from "./harness.js";

const libraryOf = (game: ReturnType<typeof table>["game"]) => game.state.zones.perPlayer[A].library;

describe("shuffled into its owner's library instead of a graveyard", () => {
  it("Darksteel Colossus sacrificed: into the library, shuffled, never the graveyard", () => {
    const { game } = table();
    const colossus = spawn(game, "Darksteel Colossus");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(colossus)]);
    settle(game);
    expect(game.state.objects[colossus].zone).toBe("library");
    expect(libraryOf(game)).toContain(colossus);
    expect(graveyard(game)).not.toContain(colossus);
    expect(game.eventsOfType("library-shuffled").some((e) => e.player === A)).toBe(true);
    expect(game.eventsOfType("cards-revealed").some((e) => e.objects.includes(colossus))).toBe(true);
  });

  it("Blightsteel Colossus discarded from a hand goes to the library", () => {
    const { game, a } = table();
    const blightsteel = toHand(game, "Blightsteel Colossus");
    a.chooseDiscardsFn = () => [blightsteel];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(game.state.objects[blightsteel].zone).toBe("library");
  });

  it("Nexus of Fate: an extra turn, and back into the library as it resolves", () => {
    const { game } = table();
    lands(game, "Island", 7);
    const nexus = toHand(game, "Nexus of Fate");
    cast(game, nexus);
    expect(game.state.objects[nexus].zone).toBe("library");
    expect(graveyard(game)).not.toContain(nexus);
    expect(game.state.extraTurns).toContain(A);
  });

  it("milled beside Rest in Peace, it's shuffled in rather than exiled", () => {
    const { game } = table();
    spawn(game, "Rest in Peace");
    const colossus = toLibrary(game, "Darksteel Colossus");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(game.state.objects[colossus].zone).toBe("library");
    expect(game.state.zones.shared.exile).not.toContain(colossus);
    expect(game.eventsOfType("library-shuffled").some((e) => e.player === A)).toBe(true);
  });

  it("a permanent that has lost its abilities goes to the graveyard", () => {
    const { game } = table();
    const colossus = spawn(game, "Darksteel Colossus");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Turn to Frog"), { targets: [ref(colossus)] });
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(colossus)]);
    settle(game);
    expect(game.state.objects[colossus].zone).toBe("graveyard");
  });
});
