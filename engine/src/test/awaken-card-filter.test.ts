/**
 * "Target card with awaken from your graveyard" (Halimar Tidecaller): the
 * `hasKeyword: "awaken"` card filter, read off a definition's awaken cost
 * (`overload.keyword`, rule 702.113a) on a card in a graveyard. Its other
 * line, "land creatures you control have flying", is a static grant over
 * permanents that are both a land and a creature.
 */
import { describe, expect, it } from "vitest";

import { A, B, enter, graveyard, hand, keywords, pickModes, ref, spawn, table, toGraveyard, watchTargets, zone } from "./harness.js";

describe("Halimar Tidecaller", () => {
  it("may return a card with awaken from your graveyard, and only one with awaken", () => {
    const { game, a } = table();
    const path = toGraveyard(game, "Ruinous Path");
    const discovery = toGraveyard(game, "Coastal Discovery");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Ruinous Path", B);
    const seen = watchTargets(a, () => [path]);
    pickModes(a, 0);
    enter(game, "Halimar Tidecaller");
    expect(seen.asked).toBe(1);
    // Two awaken cards of alice's: not the plain sorcery, not bob's.
    expect([...seen.offered[0]].sort()).toEqual([path, discovery].sort());
    expect(zone(game, path)).toBe("hand");
    expect(zone(game, discovery)).toBe("graveyard");
  });

  it("declined, the card stays in the graveyard", () => {
    const { game, a } = table();
    const path = toGraveyard(game, "Ruinous Path");
    toGraveyard(game, "Coastal Discovery");
    watchTargets(a, () => [path]);
    pickModes(a);
    const before = hand(game).length;
    enter(game, "Halimar Tidecaller");
    expect(zone(game, path)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toContain(path);
  });

  it("with no card with awaken in your graveyard, nothing is asked", () => {
    const { game, a } = table();
    toGraveyard(game, "Divination");
    const seen = watchTargets(a);
    enter(game, "Halimar Tidecaller");
    expect(seen.asked).toBe(0);
  });

  it("land creatures you control have flying; other creatures, other lands and an opponent's don't", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor");
    const theirs = spawn(game, "Dryad Arbor", B);
    const bears = spawn(game, "Grizzly Bears");
    const factory = spawn(game, "Mishra's Factory");
    expect(keywords(game, arbor).has("flying")).toBe(false);
    spawn(game, "Halimar Tidecaller", A);
    expect(keywords(game, arbor).has("flying")).toBe(true);
    expect(keywords(game, theirs).has("flying")).toBe(false);
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(keywords(game, factory).has("flying")).toBe(false);
    // Animated, the Factory is a land creature too.
    game.debugApplyEffect(A, { kind: "become", target: 0, power: 2, toughness: 2, addTypes: ["creature"], duration: "end-of-turn" }, [
      ref(factory),
    ]);
    expect(keywords(game, factory).has("flying")).toBe(true);
  });
});
