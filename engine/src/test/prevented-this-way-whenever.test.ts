import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, lands, life, nextTurn, ref, settle, spawn, table, toHand, zone } from "./harness.js";

// "Whenever damage from a creature is prevented this way, …" — a triggered
// ability a prevention spell's resolution created (rule 603.7a), triggering
// each time the rule prevents a creature's damage: a `damage-rule` split by
// whether the source is a creature, the creature rule's `then` a
// `reflexive-trigger` (Judgment of Alexander).

const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

function judged(): { game: Game; b: ReturnType<typeof table>["b"]; giant: ObjectId; bears: ObjectId } {
  const { game, b } = table();
  lands(game, "Plains", 3);
  const giant = spawn(game, "Hill Giant"); // 3/3
  game.state.objects[giant].isCommander = true;
  const bears = spawn(game, "Grizzly Bears"); // not a commander
  return { game, b, giant, bears };
}

describe("Judgment of Alexander", () => {
  it("prevents an opponent's creature's damage to you; each commander creature you control then deals its power to it, on the stack", () => {
    const { game } = judged();
    const ogre = spawn(game, "Gray Ogre", B); // 2/2
    cast(game, toHand(game, "Judgment of Alexander"));
    hit(game, ogre, ref(A), 2);
    expect(life(game, A)).toBe(20);
    // Not yet: the triggered ability waits to be put on the stack.
    expect(damage(game, ogre)).toBe(0);
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.zones.shared.stack.length).toBe(1);
    settle(game);
    expect(zone(game, ogre)).toBe("graveyard");
  });

  it("a noncreature source's damage is prevented and triggers nothing", () => {
    const { game } = judged();
    const wastes = spawn(game, "Wastes", B);
    cast(game, toHand(game, "Judgment of Alexander"));
    hit(game, wastes, ref(A), 3);
    expect(life(game, A)).toBe(20);
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.zones.shared.stack.length).toBe(0);
  });

  it("damage from your own creature, or to your creatures, isn't prevented", () => {
    const { game, bears } = judged();
    const ogre = spawn(game, "Gray Ogre", B);
    cast(game, toHand(game, "Judgment of Alexander"));
    hit(game, bears, ref(A), 2);
    expect(life(game, A)).toBe(18);
    hit(game, ogre, ref(bears), 1);
    expect(damage(game, bears)).toBe(1);
    settle(game);
    expect(damage(game, ogre)).toBe(0);
  });

  it("two attacking creatures prevented: two triggers, each dealt the commander's power", () => {
    const { game, b } = judged();
    const ogre1 = spawn(game, "Gray Ogre", B);
    const ogre2 = spawn(game, "Gray Ogre", B);
    const judgment = toHand(game, "Judgment of Alexander");
    nextTurn(game, "upkeep");
    // Bob passes in his upkeep; alice casts it with her priority.
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, judgment, { player: A });
    b.declareAttackersFn = () => [ogre1, ogre2].map((attacker) => ({ attacker, defender: A }));
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, A)).toBe(20);
    expect(zone(game, ogre1)).toBe("graveyard");
    expect(zone(game, ogre2)).toBe("graveyard");
  });
});

// The same per source for prevention's additional effect (rule 615.5) when
// it's about the damage's source: it was done once for the whole event, to
// the first source alone.
describe("a follow-up about the damage's source, in one simultaneous event", () => {
  it("Comeuppance deals each attacking creature the damage it was prevented from dealing", () => {
    const { game, b } = table();
    lands(game, "Plains", 4);
    const ogre1 = spawn(game, "Gray Ogre", B); // 2/2
    const ogre2 = spawn(game, "Gray Ogre", B);
    const comeuppance = toHand(game, "Comeuppance");
    nextTurn(game, "upkeep");
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, comeuppance, { player: A });
    b.declareAttackersFn = () => [ogre1, ogre2].map((attacker) => ({ attacker, defender: A }));
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(game, A)).toBe(20);
    expect(zone(game, ogre1)).toBe("graveyard");
    expect(zone(game, ogre2)).toBe("graveyard");
  });
});
