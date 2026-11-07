import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, C, activate, attack, counters, enter, keywords, lands, pickPermanents, pt, ref, spawn, table, watchTargets } from "./harness.js";

// "Tap target creature defending player controls" on an attack trigger whose
// source isn't the attacker — an Equipment's "whenever equipped creature
// attacks" (Captain America's Shield) or "whenever a creature you control …
// attacks" (Elite Scaleguard): defending player is the triggering attack's
// player (`whose: "trigger-player"`), not the source's.

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Captain America's Shield", () => {
  it("gives +0/+8 and vigilance, and taps a creature the equipped creature's defending player controls", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const shield = spawn(game, "Captain America's Shield");
    lands(game, "Wastes", 2);
    activate(game, shield, 0, { targets: [ref(bears)] });
    expect(game.state.objects[shield].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 10 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, shield).has("indestructible")).toBe(true);
    const theirs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    // Two of Carol's, so the target is asked rather than settled.
    const carolsOther = spawn(game, "Grizzly Bears", C);
    const seen = watchTargets(a, () => [carols]);
    attack(game, a, [bears], C);
    expect(seen.offered[0]).toContain(carols);
    expect(seen.offered[0]).toContain(carolsOther);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(seen.offered[0]).not.toContain(bears);
    expect(isTapped(game, carols)).toBe(true);
    expect(isTapped(game, bears)).toBe(false);
    expect(isTapped(game, theirs)).toBe(false);
  });

  it("taps a creature of the attacked player", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const shield = spawn(game, "Captain America's Shield");
    lands(game, "Wastes", 2);
    activate(game, shield, 0, { targets: [ref(bears)] });
    const theirs = spawn(game, "Hill Giant", B);
    watchTargets(a, () => [theirs]);
    attack(game, a, [bears], B);
    expect(isTapped(game, theirs)).toBe(true);
  });
});

describe("Elite Scaleguard", () => {
  it("bolsters 2, then taps a creature defending player controls whenever a countered creature attacks", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    pickPermanents(a, bears);
    const scaleguard = enter(game, "Elite Scaleguard");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, scaleguard)).toBe(0);
    const bobs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    spawn(game, "Grizzly Bears", C);
    const seen = watchTargets(a, () => [carols]);
    // The giant has no counter: only the bears' attack triggers it.
    attack(game, a, [bears, giant], C);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(carols);
    expect(seen.offered[0]).not.toContain(bobs);
    expect(isTapped(game, carols)).toBe(true);
  });
});
