// Batch 318: the top 5000's next cards by EDHREC rank (4075–), each on the
// feature it needed.

import { describe, expect, it } from "vitest";

import { A, B, activate, destroy, hand, life, settle, spawn, table, zone } from "./harness.js";

describe("Hushbringer: creatures entering or dying don't cause abilities to trigger", () => {
  it("a creature dying causes no dies trigger, its own or another's", () => {
    const { game } = table();
    spawn(game, "Hushbringer");
    const cutthroat = spawn(game, "Zulaport Cutthroat");
    const bear = spawn(game, "Grizzly Bears");
    destroy(game, bear);
    destroy(game, cutthroat);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("without it the same deaths drain (the control)", () => {
    const { game } = table();
    spawn(game, "Zulaport Cutthroat");
    const bear = spawn(game, "Grizzly Bears");
    destroy(game, bear);
    expect(life(game, B)).toBe(19);
  });

  it("a Hushbringer dying at the same time still bars them", () => {
    const { game } = table();
    spawn(game, "Hushbringer");
    spawn(game, "Zulaport Cutthroat");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(life(game, B)).toBe(20);
  });

  it("the event that caused the death still triggers: a sacrifice", () => {
    const { game } = table();
    spawn(game, "Hushbringer");
    spawn(game, "Smothering Abomination");
    const seer = spawn(game, "Viscera Seer");
    const bear = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    activate(game, seer, 0, { sacrifice: bear });
    expect(zone(game, bear)).toBe("graveyard");
    // Smothering Abomination's draw; Viscera Seer's scry still resolves.
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("a 'from anywhere' graveyard trigger sees a Hushbringer that died with the creature gone", () => {
    const { game } = table();
    spawn(game, "Profane Memento");
    spawn(game, "Hushbringer", B);
    spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    // Two creature cards of B's: the Bears and Hushbringer itself.
    expect(life(game, A)).toBe(22);
  });

  it("a 'from anywhere' trigger is barred while Hushbringer stays", () => {
    const { game } = table();
    spawn(game, "Profane Memento");
    spawn(game, "Hushbringer");
    const bear = spawn(game, "Grizzly Bears", B);
    destroy(game, bear);
    expect(life(game, A)).toBe(20);
  });
});
