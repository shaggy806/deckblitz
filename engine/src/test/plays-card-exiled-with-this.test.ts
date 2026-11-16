/**
 * `plays-card`'s `exiledWithThis`: "whenever a player plays a card exiled
 * with ~" (Prowl, Stoic Strategist) — a land played or a spell cast whose card
 * was in exile linked to this permanent's present stint (rule 607.2a; either
 * face's abilities linked, 607.1b), read off the `land-played` / `spell-cast`
 * event's `exiledWith`, recorded before the card moved. Prowl's back face,
 * Prowl, Pursuit Vehicle, converts on the second resolution of its enters
 * trigger in a turn.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickTargets,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const FRONT = "Prowl, Stoic Strategist";

const isVehicle = (game: Game, id: ObjectId): boolean => subtypes(game, id).includes("Vehicle");

/** Prowl attacks and its trigger exiles `victim`. */
function exileWithProwl(game: Game, seat: Parameters<typeof attack>[1], prowl: ObjectId, victim: ObjectId): void {
  pickTargets(seat, victim);
  attack(game, seat, [prowl]);
  settle(game);
  expect(zone(game, victim)).toBe("exile");
}

describe("Prowl, Stoic Strategist — whenever a player plays a card exiled with Prowl", () => {
  it("exiles a tapped creature as it attacks; its owner casting it draws Prowl's controller a card and converts Prowl", () => {
    const { game, a } = table();
    const prowl = spawn(game, FRONT, A);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 2, B);
    exileWithProwl(game, a, prowl, bears);
    expect(isVehicle(game, prowl)).toBe(false);
    toStep(game, "precombat-main", B);
    const before = hand(game, A).length;
    cast(game, bears, { player: B, via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
    expect(hand(game, A).length).toBe(before + 1);
    expect(isVehicle(game, prowl)).toBe(true);
  });

  it("a land exiled with it (Dryad Arbor), played by its owner, triggers it too", () => {
    const { game, a } = table();
    const prowl = spawn(game, FRONT, A);
    const arbor = spawn(game, "Dryad Arbor", B, { tapped: true });
    exileWithProwl(game, a, prowl, arbor);
    toStep(game, "precombat-main", B);
    const before = hand(game, A).length;
    game.dispatch({ type: "play-land", player: B, card: arbor });
    settle(game);
    expect(zone(game, arbor)).toBe("battlefield");
    expect(hand(game, A).length).toBe(before + 1);
    expect(isVehicle(game, prowl)).toBe(true);
  });

  it("a card exiled with Prowl in an earlier stint doesn't trigger the Prowl that came back (rule 400.7)", () => {
    const { game, a } = table();
    const prowl = spawn(game, FRONT, A);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 2, B);
    exileWithProwl(game, a, prowl, bears);
    game.debugMove(prowl, "exile");
    game.debugMove(prowl, "battlefield");
    toStep(game, "precombat-main", B);
    const before = hand(game, A).length;
    // Its owner may still play it: the permission lasts while it's exiled.
    cast(game, bears, { player: B, via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game, A).length).toBe(before);
    expect(isVehicle(game, prowl)).toBe(false);
  });

  it("converted and back again, a card exiled while it was the front face still triggers it (rule 607.1b)", () => {
    const { game, a } = table();
    const prowl = spawn(game, FRONT, A);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 2, B);
    exileWithProwl(game, a, prowl, bears);
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(prowl)]);
    settle(game);
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(prowl)]);
    settle(game);
    expect(isVehicle(game, prowl)).toBe(false);
    toStep(game, "precombat-main", B);
    const before = hand(game, A).length;
    cast(game, bears, { player: B, via: "impulse" });
    expect(hand(game, A).length).toBe(before + 1);
    expect(isVehicle(game, prowl)).toBe(true);
  });

  it("as Prowl, Pursuit Vehicle, playing a card exiled with it triggers nothing (the ruling)", () => {
    const { game, a } = table();
    const prowl = spawn(game, FRONT, A);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 2, B);
    exileWithProwl(game, a, prowl, bears);
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(prowl)]);
    settle(game);
    toStep(game, "precombat-main", B);
    const before = hand(game, A).length;
    cast(game, bears, { player: B, via: "impulse" });
    expect(hand(game, A).length).toBe(before);
    expect(isVehicle(game, prowl)).toBe(true);
  });
});

describe("Voltaic Visionary — when you play a card exiled with this creature", () => {
  it("deals 2 to you and exiles the top card for this turn; playing it transforms the Visionary", () => {
    const { game } = table();
    const visionary = spawn(game, "Voltaic Visionary");
    const top = toLibrary(game, "Mountain");
    activate(game, visionary, 0);
    expect(life(game, A)).toBe(18);
    expect(zone(game, top)).toBe("exile");
    expect(subtypes(game, visionary)).toContain("Wizard");
    game.dispatch({ type: "play-land", player: A, card: top });
    settle(game);
    expect(zone(game, top)).toBe("battlefield");
    expect(subtypes(game, visionary)).toContain("Berserker");
  });

  it("a spell cast from its exile transforms it before the spell resolves (the ruling)", () => {
    const { game } = table();
    const visionary = spawn(game, "Voltaic Visionary");
    lands(game, "Mountain", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    activate(game, visionary, 0);
    cast(game, bolt, { via: "impulse", targets: [ref(B)], settle: false });
    // The trigger resolves first, the Bolt still on the stack.
    game.advanceUntil((s) => subtypes(game, visionary).includes("Berserker") || s.zones.shared.stack.length === 0);
    expect(zone(game, bolt)).toBe("stack");
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(subtypes(game, visionary)).toContain("Berserker");
  });

  it("a card another permanent exiled, played, doesn't transform it", () => {
    const { game } = table();
    const visionary = spawn(game, "Voltaic Visionary");
    const reservoir = spawn(game, "Geistflame Reservoir");
    lands(game, "Mountain", 2);
    const top = toLibrary(game, "Forest");
    activate(game, reservoir, 1);
    expect(zone(game, top)).toBe("exile");
    game.dispatch({ type: "play-land", player: A, card: top });
    settle(game);
    expect(zone(game, top)).toBe("battlefield");
    expect(subtypes(game, visionary)).toContain("Wizard");
  });
});

describe("Prowl, Pursuit Vehicle", () => {
  it("a counter for each other creature or Vehicle you control entering, converting on the second this turn", () => {
    const { game } = table();
    const prowl = spawn(game, FRONT, A);
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(prowl)]);
    settle(game);
    expect(isVehicle(game, prowl)).toBe(true);
    enter(game, "Grizzly Bears");
    expect(counters(game, prowl)).toBe(1);
    expect(isVehicle(game, prowl)).toBe(true);
    // Not an opponent's.
    enter(game, "Grizzly Bears", B);
    expect(counters(game, prowl)).toBe(1);
    enter(game, "Smuggler's Copter");
    expect(counters(game, prowl)).toBe(2);
    expect(isVehicle(game, prowl)).toBe(false);
  });
});
