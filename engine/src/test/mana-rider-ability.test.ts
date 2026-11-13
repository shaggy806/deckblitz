/**
 * A mana rider that fires for an activated ability as well as a spell —
 * `add-mana`'s `whenSpent.orAbility` (Sunken Palace: "When you spend this
 * mana to cast a spell or activate an ability, copy that spell or
 * ability"). The mana is paid before the ability is put on the stack, so the
 * rider waits for it (`PendingTrigger.awaitsActivation`) and copies that
 * one; a mana ability it pays for still triggers it, with nothing on the
 * stack to copy (rules 605.3b, 707.10).
 */
import { describe, expect, it } from "vitest";

import { A, activate, cast, hand, lands, settle, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** It enters tapped. */
function untapped(game: Game, id: ObjectId): ObjectId {
  game.state.objects[id].tapped = false;
  return id;
}

/** Sunken Palace with seven cards in alice's graveyard and the two lands its
 * {1}{U} needs; its second ability activated, its {U} floating. */
function palaceMana(game: Game): ObjectId {
  const palace = untapped(game, spawn(game, "Sunken Palace"));
  for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
  lands(game, "Island", 2);
  activate(game, palace, 1);
  return palace;
}

describe("Sunken Palace", () => {
  it("its mana, spent to activate an ability, copies that ability", () => {
    const { game } = table();
    for (let i = 0; i < 5; i += 1) toLibrary(game, "Wastes");
    const syphon = spawn(game, "Aether Syphon");
    const palace = palaceMana(game);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "U").length).toBe(1);
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(0);
    expect(game.state.objects[palace].tapped).toBe(true);
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    activate(game, syphon, 0, { settle: false });
    // The rider sits above the ability it copies, bound to it.
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });

  it("its mana, spent to cast a spell, copies that spell", () => {
    const { game } = table();
    palaceMana(game);
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Wastes");
    lands(game, "Island", 2);
    const divination = toHand(game, "Divination");
    const before = hand(game).length;
    cast(game, divination);
    // Divination's two cards, and its copy's two (the card itself left the hand).
    expect(hand(game).length).toBe(before - 1 + 4);
  });

  it("spent on a mana ability's cost, it triggers but copies nothing", () => {
    const { game } = table();
    palaceMana(game);
    // A second Palace pays its {1}{U} with the first's {U} and an Island:
    // that's a mana ability, never on the stack.
    const second = untapped(game, spawn(game, "Sunken Palace"));
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
    lands(game, "Island", 1);
    activate(game, second, 1);
    settle(game);
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "U").length).toBe(1);
    expect(game.state.pendingTriggers.some((t) => t.awaitsActivation === true)).toBe(false);
  });

  it("its plain {T}: Add {U} has no rider", () => {
    const { game } = table();
    const palace = untapped(game, spawn(game, "Sunken Palace"));
    const syphon = spawn(game, "Aether Syphon");
    for (let i = 0; i < 5; i += 1) toLibrary(game, "Wastes");
    lands(game, "Island", 1);
    activate(game, palace, 0);
    const before = hand(game).length;
    activate(game, syphon, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, palace)).toBe("battlefield");
  });
});
