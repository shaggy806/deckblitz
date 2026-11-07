/**
 * Flagged "Build ASAP" cards, B274 agent A: Heroic Sacrifice — a turn-long
 * redirection of all damage to you and creatures you control onto a chosen
 * creature (rule 614.9), and a delayed "when that creature dies this turn"
 * with a target of its own (rule 603.7c) putting its counters on another.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, counters, destroy, hand, lands, life, nextTurn, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

function board() {
  const t = table();
  const { game } = t;
  const giant = spawn(game, "Hill Giant");
  const bears = spawn(game, "Grizzly Bears");
  const enemy = spawn(game, "Grizzly Bears", B);
  lands(game, "Plains", 2);
  cast(game, toHand(game, "Heroic Sacrifice"), { targets: [ref(giant)] });
  return { ...t, giant, bears, enemy };
}

describe("Heroic Sacrifice", () => {
  it("sends damage to you and your other creatures to the chosen creature this turn", () => {
    const { game, giant, bears, enemy } = board();
    hit(game, enemy, ref(A), 1);
    expect(life(game)).toBe(20);
    expect(damage(game, giant)).toBe(1);
    hit(game, enemy, ref(bears), 1);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, giant)).toBe(2);
    // An opponent's creature isn't covered.
    hit(game, bears, ref(enemy), 1);
    expect(damage(game, enemy)).toBe(1);
  });

  it("does nothing once the chosen creature has left, and ends with the turn", () => {
    const { game, giant, enemy } = board();
    destroy(game, giant);
    hit(game, enemy, ref(A), 2);
    expect(life(game)).toBe(18);

    const second = board();
    nextTurn(second.game);
    hit(second.game, second.enemy, ref(A), 2);
    expect(life(second.game)).toBe(18);
    expect(damage(second.game, second.giant)).toBe(0);
  });

  it("when the chosen creature dies, puts its counters on up to one target creature you control and draws", () => {
    const { game, a, giant, bears } = board();
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(giant)]);
    const before = hand(game).length;
    pickTargets(a, bears);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, bears)).toBe(2);
    expect(hand(game).length).toBe(before + 1);
  });

  it("still draws with no creature chosen for the counters", () => {
    const { game, a, giant, bears } = board();
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(giant)]);
    const before = hand(game).length;
    pickTargets(a, null);
    destroy(game, giant);
    expect(counters(game, bears)).toBe(0);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't trigger when the chosen creature dies on a later turn", () => {
    const { game, a, giant, bears } = board();
    nextTurn(game);
    const before = hand(game).length;
    pickTargets(a, bears);
    destroy(game, giant);
    expect(hand(game).length).toBe(before);
  });
});
