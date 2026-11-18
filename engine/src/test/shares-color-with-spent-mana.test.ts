/**
 * "A source of your choice that shares a color with the mana spent on this
 * activation cost" (Protective Sphere): `CardFilter.sharesColorWithMana:
 * "spent"`, bound as the ability resolves to the colors of the mana that
 * paid it (rule 602.2b) — colorless none (105.2c) — and rechecked by the
 * shield as the damage would be dealt (609.7b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, lands, life, pickPermanents, ref, spawn, table } from "./harness.js";

/** `source` deals 2 damage to each of its controller's opponents. */
const ping = (game: Game, source: ObjectId): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount: 2, who: "each-opponent" }, [], {
    source,
  });

describe("Protective Sphere", () => {
  it("paid with red mana: a red source may be chosen, a green one not, and the red one's damage is prevented", () => {
    const { game, a } = table();
    const sphere = spawn(game, "Protective Sphere", A);
    lands(game, "Mountain", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, goblin);
    activate(game, sphere, 0);
    expect(seen.offered).toContain(goblin);
    expect(seen.offered).not.toContain(bears);
    expect(life(game, A)).toBe(19);
    ping(game, goblin);
    expect(life(game, A)).toBe(19);
    ping(game, goblin);
    expect(life(game, A)).toBe(19);
    ping(game, bears);
    expect(life(game, A)).toBe(17);
  });

  it("paid with white mana: the red source isn't offered", () => {
    const { game, a } = table();
    const sphere = spawn(game, "Protective Sphere", A);
    lands(game, "Plains", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    const lions = spawn(game, "Savannah Lions", B);
    const seen = pickPermanents(a, lions);
    activate(game, sphere, 0);
    expect(seen.offered).not.toContain(goblin);
    expect(seen.offered).toContain(lions);
    ping(game, goblin);
    expect(life(game, A)).toBe(17);
  });

  it("paid with colorless mana: no source to choose, nothing prevented", () => {
    const { game, a } = table();
    const sphere = spawn(game, "Protective Sphere", A);
    lands(game, "Wastes", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    const seen = pickPermanents(a, goblin);
    activate(game, sphere, 0);
    expect(seen.offered).toEqual([]);
    expect(game.state.activeReplacements).toHaveLength(0);
    ping(game, goblin);
    expect(life(game, A)).toBe(17);
  });

  it("rechecks the source: one that stops sharing a color isn't stopped (609.7b)", () => {
    const { game, a } = table();
    const sphere = spawn(game, "Protective Sphere", A);
    lands(game, "Mountain", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    activate(game, sphere, 0);
    ping(game, goblin);
    expect(life(game, A)).toBe(19);
    // Thoughtlace's "becomes blue".
    game.debugApplyEffect(A, { kind: "become", target: 0, setColors: ["U"], duration: "permanent" }, [ref(goblin)]);
    ping(game, goblin);
    expect(life(game, A)).toBe(17);
  });
});
