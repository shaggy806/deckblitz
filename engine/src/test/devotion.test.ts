/**
 * Devotion (rule 700.5) as a condition, an amount and a CDA count, and the
 * conditional layer-4 type changes a permanent makes to itself (rule 205.1a,
 * 613.1d) — the Theros Gods' "as long as your devotion to white is less than
 * five, Heliod isn't a creature", Arixmethes' "it's a land", Altar of the
 * Pantheon's "increased by one". Cards are the pool's.
 */
import { describe, expect, it } from "vitest";

import { devotionOf } from "../characteristics.js";
import { B, A, attack, destroy, enter, life, pt, ref, registryOf, spawn, subtypes, supertypes, table, types } from "./harness.js";

const devotion = (game: ReturnType<typeof table>["game"], colors: readonly ("W" | "U" | "B" | "R" | "G")[], player = A) =>
  devotionOf(game.state, registryOf(game), player, colors);

describe("devotion (rule 700.5)", () => {
  it("counts the coloured symbols among the mana costs of permanents you control, hybrid ones once for two colours", () => {
    const { game } = table();
    spawn(game, "Aerial Responder"); // {1}{W}{W}
    spawn(game, "Abigale, Eloquent First-Year"); // {W/B}{W/B}
    spawn(game, "Aerial Responder", B); // an opponent's
    expect(devotion(game, ["W"])).toBe(4);
    expect(devotion(game, ["B"])).toBe(2);
    // 700.5: "[color 1] and [color 2]" — a {W/B} is one symbol, counted once.
    expect(devotion(game, ["W", "B"])).toBe(4);
    expect(devotion(game, ["G"])).toBe(0);
    expect(devotion(game, ["W"], B)).toBe(2);
  });

  it("Altar of the Pantheon increases every devotion by one (700.5a)", () => {
    const { game } = table();
    spawn(game, "Altar of the Pantheon");
    expect(devotion(game, ["R"])).toBe(1);
    expect(devotion(game, ["W", "B"])).toBe(1);
    expect(devotion(game, ["G"], B)).toBe(0);
  });
});

describe("a God that isn't a creature (rules 700.5, 205.1a)", () => {
  it("is a legendary enchantment and no God below the devotion, a God creature at it — its own pips counting", () => {
    const { game } = table();
    const heliod = spawn(game, "Heliod, God of the Sun");
    expect(types(game, heliod)).toEqual(["enchantment"]);
    expect(subtypes(game, heliod)).toEqual([]);
    expect(supertypes(game, heliod)).toEqual(["legendary"]);
    spawn(game, "Aerial Responder");
    spawn(game, "Aerial Responder");
    // {W} + {W}{W} + {W}{W}: five.
    expect(types(game, heliod)).toContain("creature");
    expect(subtypes(game, heliod)).toEqual(["God"]);
    expect(pt(game, heliod)).toEqual({ power: 5, toughness: 6 });
  });

  it("still isn't a creature once it has lost its abilities (layer 4 before 6 — the ruling); a later effect making it one wins (613.7)", () => {
    const { game } = table();
    const heliod = spawn(game, "Heliod, God of the Sun");
    game.debugApplyEffect(B, { kind: "lose-abilities", target: 0, duration: "end-of-turn" }, [ref(heliod)]);
    expect(types(game, heliod)).toEqual(["enchantment"]);
    game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["creature"], duration: "end-of-turn" }, [ref(heliod)]);
    expect(types(game, heliod)).toEqual(["enchantment", "creature"]);
  });

  it("an attacking God that stops being a creature is removed from combat (rule 506.4)", () => {
    const { game, a } = table();
    const heliod = spawn(game, "Heliod, God of the Sun");
    const responder = spawn(game, "Aerial Responder");
    spawn(game, "Aerial Responder");
    a.declareAttackersFn = () => [{ attacker: heliod, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    expect(game.state.objects[heliod].attacking).toBe(B);
    destroy(game, responder);
    expect(types(game, heliod)).not.toContain("creature");
    game.advanceUntil((s) => s.turn.step === "combat-damage" && s.priority.holder === A);
    expect(game.state.objects[heliod].attacking).toBeNull();
    attack(game, a, []);
    // It dealt no combat damage.
    expect(life(game, B)).toBe(20);
  });

  it("judges itself entering without its own pips (614.12): an opponent's 'creatures enter tapped' misses it", () => {
    const { game } = table();
    spawn(game, "Authority of the Consuls", B); // creatures your opponents control enter tapped
    spawn(game, "Aerial Responder");
    spawn(game, "Aerial Responder");
    // Four without Heliod's own {W}: not a creature as it enters, so untapped.
    const heliod = enter(game, "Heliod, God of the Sun");
    expect(game.state.objects[heliod].tapped).toBe(false);
    // Once it's there, its {W} counts.
    expect(types(game, heliod)).toContain("creature");
  });

  it("enters tapped as a creature when devotion without it already reaches the bar", () => {
    const { game } = table();
    spawn(game, "Authority of the Consuls", B);
    for (let i = 0; i < 3; i += 1) spawn(game, "Aerial Responder");
    const heliod = enter(game, "Heliod, God of the Sun");
    expect(game.state.objects[heliod].tapped).toBe(true);
  });

  it("a creature-entering trigger sees it with its own pips counted (the rulings)", () => {
    const { game } = table();
    spawn(game, "Purphoros, God of the Forge"); // another creature you control enters: 2 to each opponent
    spawn(game, "Aerial Responder");
    spawn(game, "Aerial Responder");
    // Heliod's {W} makes five: it entered as a creature.
    enter(game, "Heliod, God of the Sun");
    expect(life(game, B)).toBe(18);
  });
});
