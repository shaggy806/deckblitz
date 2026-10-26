/**
 * Damage redirection (rule 614.9 — the en-Kor creatures, Daughter of Autumn,
 * Hazduhr the Abbot, Zhalfirin Crusader, Jade Monolith): a one-shot shield
 * whose damage is dealt to another creature or player instead of prevented,
 * by the same source, and does nothing while that recipient is gone or no
 * longer a creature.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, activate, destroy, lands, life, pickPermanents, ref, spawn, table, zone } from "./harness.js";

/** `source` deals `amount` damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("damage redirection", () => {
  it("Warrior en-Kor sends the next 1 damage to it to another creature, once per activation", () => {
    const { game } = table();
    const warrior = spawn(game, "Warrior en-Kor");
    const wall = spawn(game, "Wall of Stone");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, warrior, 0, { targets: [ref(wall)] });
    activate(game, warrior, 0, { targets: [ref(wall)] });
    hit(game, goblin, ref(warrior), 3);
    expect(damage(game, wall)).toBe(2);
    expect(damage(game, warrior)).toBe(1);
    expect(game.state.preventionShields).toHaveLength(0);
  });

  it("can redirect to another en-Kor, more damage than its toughness with more damage than its toughness", () => {
    const { game } = table();
    const warrior = spawn(game, "Warrior en-Kor");
    const nomads = spawn(game, "Nomads en-Kor");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, warrior, 0, { targets: [ref(nomads)] });
    activate(game, warrior, 0, { targets: [ref(nomads)] });
    hit(game, goblin, ref(warrior), 2);
    expect(damage(game, nomads)).toBe(2);
    expect(damage(game, warrior)).toBe(0);
  });

  it("does nothing once the creature it sends to has left (614.9), and stays", () => {
    const { game } = table();
    const warrior = spawn(game, "Warrior en-Kor");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, warrior, 0, { targets: [ref(bears)] });
    destroy(game, bears);
    hit(game, goblin, ref(warrior), 1);
    expect(damage(game, warrior)).toBe(1);
  });

  it("a prevention shield is used before a redirection", () => {
    const { game } = table();
    const warrior = spawn(game, "Warrior en-Kor");
    const wall = spawn(game, "Wall of Stone");
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, warrior, 0, { targets: [ref(wall)] });
    game.debugApplyEffect(A, { kind: "prevent-damage", target: 0, amount: 1 }, [ref(warrior)]);
    hit(game, goblin, ref(warrior), 1);
    expect(damage(game, warrior)).toBe(0);
    expect(damage(game, wall)).toBe(0);
    expect(game.state.preventionShields).toHaveLength(1);
  });

  it("Shaman en-Kor takes all of a chosen source's next damage to the creature", () => {
    const { game, a } = table();
    const shaman = spawn(game, "Shaman en-Kor");
    const wall = spawn(game, "Wall of Stone");
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    activate(game, shaman, 1, { targets: [ref(wall)] });
    hit(game, goblin, ref(wall), 1);
    expect(damage(game, shaman)).toBe(1);
    expect(damage(game, wall)).toBe(0);
    // "The next time": the second hit stays.
    hit(game, goblin, ref(wall), 1);
    expect(damage(game, wall)).toBe(1);
  });

  it("Jade Monolith: the chosen source deals that damage to you instead", () => {
    const { game, a } = table();
    const monolith = spawn(game, "Jade Monolith");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    pickPermanents(a, goblin);
    activate(game, monolith, 0, { targets: [ref(bears)] });
    hit(game, goblin, ref(bears), 3);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(17);
  });

  it("Hazduhr the Abbot takes the next X damage to a white creature you control", () => {
    const { game } = table();
    const hazduhr = spawn(game, "Hazduhr the Abbot");
    const knight = spawn(game, "Savannah Lions");
    lands(game, "Wastes", 3);
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, hazduhr, 0, { targets: [ref(knight)], x: 3 });
    hit(game, goblin, ref(knight), 4);
    expect(damage(game, hazduhr)).toBe(3);
    expect(zone(game, knight)).toBe("battlefield");
    expect(damage(game, knight)).toBe(1);
  });

  it("Zhalfirin Crusader can send it to a player", () => {
    const { game } = table();
    const crusader = spawn(game, "Zhalfirin Crusader");
    lands(game, "Plains", 2);
    const goblin = spawn(game, "Raging Goblin", B);
    activate(game, crusader, 0, { targets: [ref(B)] });
    hit(game, goblin, ref(crusader), 2);
    expect(life(game, B)).toBe(19);
    expect(damage(game, crusader)).toBe(1);
  });
});
