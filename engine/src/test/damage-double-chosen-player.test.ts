/**
 * Damage doubled to the chosen player's side (`would-deal-damage`'s `to:
 * "chosen-player-side"` — Sawhorn Nemesis): the player chosen as the
 * permanent entered (rule 614.1c, `choosePlayerOnEnter`) and the permanents
 * that player controls are dealt double damage, from any source; nobody else.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, C, cast, destroy, lands, life, named, ref, spawn, table, toHand } from "./harness.js";

/** `source` deals `amount` damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("damage doubled to the chosen player and their permanents", () => {
  it("Sawhorn Nemesis doubles damage to the chosen player and what they control, from any source, and nobody else", () => {
    const { game, a } = table({ players: 3 });
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return B;
    };
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Sawhorn Nemesis"));
    // "Choose a player": you are among them.
    expect(offered).toContain(A);
    const [nemesis] = named(game, "Sawhorn Nemesis");
    expect(game.state.objects[nemesis].chosenPlayer).toBe(B);
    const goblin = spawn(game, "Raging Goblin", A);
    const theirGoblin = spawn(game, "Raging Goblin", B);
    const theirWall = spawn(game, "Wall of Stone", B);
    const carolsWall = spawn(game, "Wall of Stone", C);
    const myWall = spawn(game, "Wall of Stone", A);
    hit(game, goblin, ref(B), 3);
    expect(life(game, B)).toBe(14);
    // Their own source too.
    hit(game, theirGoblin, ref(theirWall), 3);
    expect(damage(game, theirWall)).toBe(6);
    hit(game, goblin, ref(C), 3);
    expect(life(game, C)).toBe(17);
    hit(game, goblin, ref(carolsWall), 3);
    expect(damage(game, carolsWall)).toBe(3);
    hit(game, theirGoblin, ref(myWall), 2);
    expect(damage(game, myWall)).toBe(2);
    hit(game, theirGoblin, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });

  it("stops once Sawhorn Nemesis leaves, its choice gone with it (rule 400.7)", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => B;
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Sawhorn Nemesis"));
    const [nemesis] = named(game, "Sawhorn Nemesis");
    const goblin = spawn(game, "Raging Goblin", A);
    hit(game, goblin, ref(B), 2);
    expect(life(game, B)).toBe(16);
    destroy(game, nemesis);
    hit(game, goblin, ref(B), 2);
    expect(life(game, B)).toBe(14);
  });

  it("choosing yourself doubles the damage dealt to you", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => A;
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Sawhorn Nemesis"));
    const goblin = spawn(game, "Raging Goblin", B);
    hit(game, goblin, ref(A), 2);
    expect(life(game, A)).toBe(16);
    hit(game, goblin, ref(B), 2);
    expect(life(game, B)).toBe(18);
  });
});

/**
 * Damage doubled between two chosen players (`to: "between-chosen-players"`
 * — Bitter Feud): a source one of them controls, to the other or a permanent
 * the other controls; nobody else's, and not to its own side.
 */
describe("Bitter Feud: damage between the two chosen players is doubled", () => {
  /** Alice casts Bitter Feud, choosing `first` then `second`. */
  const feud = (game: Game, a: ReturnType<typeof table>["a"], first: string, second: string): ObjectId => {
    const picks = [first, second];
    let asked = 0;
    a.chooseCreatureTypeFn = () => picks[asked++] ?? picks[1];
    lands(game, "Mountain", 5);
    const card = toHand(game, "Bitter Feud");
    cast(game, card);
    return card;
  };

  it("either way between them, to the player or what they control, and nobody else", () => {
    const { game, a } = table({ players: 3 });
    const card = feud(game, a, B, C);
    expect(game.state.objects[card].chosenPlayer).toBe(B);
    expect(game.state.objects[card].otherChosenPlayer).toBe(C);
    const bobs = spawn(game, "Raging Goblin", B);
    const carols = spawn(game, "Raging Goblin", C);
    const mine = spawn(game, "Raging Goblin", A);
    const bobsWall = spawn(game, "Wall of Stone", B);
    const carolsWall = spawn(game, "Wall of Stone", C);
    hit(game, bobs, ref(C), 3);
    expect(life(game, C)).toBe(14);
    hit(game, carols, ref(bobsWall), 3);
    expect(damage(game, bobsWall)).toBe(6);
    hit(game, carols, ref(B), 2);
    expect(life(game, B)).toBe(16);
    // A source of the same side, or nobody's chosen, isn't doubled.
    hit(game, bobs, ref(bobsWall), 1);
    expect(damage(game, bobsWall)).toBe(7);
    hit(game, mine, ref(C), 2);
    expect(life(game, C)).toBe(12);
    hit(game, mine, ref(carolsWall), 2);
    expect(damage(game, carolsWall)).toBe(2);
    hit(game, bobs, ref(A), 2);
    expect(life(game, A)).toBe(18);
  });

  it("a spell its controller casts is a source they control (yourself chosen)", () => {
    const { game, a } = table();
    feud(game, a, A, B);
    expect(life(game, B)).toBe(20);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    const bobs = spawn(game, "Raging Goblin", B);
    hit(game, bobs, ref(A), 3);
    expect(life(game, A)).toBe(14);
  });

  it("two on the same pair double it twice (the ruling)", () => {
    const { game, a } = table();
    feud(game, a, A, B);
    feud(game, a, B, A);
    const mine = spawn(game, "Raging Goblin", A);
    hit(game, mine, ref(B), 1);
    expect(life(game, B)).toBe(16);
  });
});
