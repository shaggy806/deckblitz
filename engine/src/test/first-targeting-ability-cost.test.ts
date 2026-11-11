/**
 * "The first activated ability you activate during your turn that targets a
 * creature you control costs {2} less to activate" — `abilityCostModification`
 * with a reducing `targeting` and `firstEachTurn` (rules 602.2b, 601.2c before
 * 601.2f) — and "whenever one or more creatures you control become the target
 * of an activated ability", `becomes-target`'s `abilityOnly: "activated"`.
 * Professor Hojo.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, counters, enter, hand, lands, nextTurn, pickTargets, ref, spawn, table, toHand } from "./harness.js";

const offers = (game: Game, player: PlayerId, source: ObjectId) =>
  game.legalActions(player).flatMap((o) => (o.kind === "activate-ability" && o.source === source ? [o] : []));
const untapped = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => !game.state.objects[id].tapped).length;
const can = (game: Game, source: ObjectId, target: ObjectId, player: PlayerId = A): string | null =>
  game.canDispatch({ type: "activate-ability", player, source, abilityIndex: 0, targets: [ref(target)] });

describe("the first activated ability you activate during your turn that targets a creature you control — Professor Hojo", () => {
  it("costs {2} less, and only the first", () => {
    const { game } = table();
    const hojo = spawn(game, "Professor Hojo");
    const bear = spawn(game, "Grizzly Bears");
    const hammer = spawn(game, "Loxodon Warhammer"); // Equip {3}
    const pool = lands(game, "Wastes", 3);
    activate(game, hammer, 0, { targets: [ref(hojo)] });
    expect(game.state.objects[hammer].attachedTo).toBe(hojo);
    expect(untapped(game, pool)).toBe(2);
    // The second such ability this turn pays in full: {3}, with two lands left.
    expect(can(game, hammer, bear)).toMatch(/cannot pay/);
    expect(offers(game, A, hammer)).toHaveLength(0);
    // A new turn of yours, a new first.
    nextTurn(game);
    nextTurn(game);
    activate(game, hammer, 0, { targets: [ref(bear)] });
    expect(game.state.objects[hammer].attachedTo).toBe(bear);
    expect(untapped(game, pool)).toBe(2);
  });

  it("only generic mana comes off, and never below {0}", () => {
    const { game } = table();
    const hojo = spawn(game, "Professor Hojo");
    const sword = spawn(game, "Short Sword"); // Equip {1}
    activate(game, sword, 0, { targets: [ref(hojo)] });
    expect(game.state.objects[sword].attachedTo).toBe(hojo);
  });

  it("is offered, when only the reduction pays for it, with just the targets that earn it", () => {
    const { game } = table();
    const hojo = spawn(game, "Professor Hojo");
    const theirs = spawn(game, "Grizzly Bears", B);
    const icy = spawn(game, "Icy Manipulator"); // {1}, {T}: Tap target artifact, creature, or land.
    const offered = offers(game, A, icy);
    expect(offered).toHaveLength(1);
    expect(offered[0].targetOptions[0]).toEqual([ref(hojo)]);
    expect(can(game, icy, theirs)).toMatch(/cannot pay/);
    expect(can(game, icy, hojo)).toBeNull();
  });

  it("a second target that earns nothing is still offered beside one that does", () => {
    const { game } = table();
    const hojo = spawn(game, "Professor Hojo");
    const theirs = spawn(game, "Grizzly Bears", B);
    // "{2}, Sacrifice this artifact: Target creature you control fights
    // target creature an opponent controls."
    const triangle = spawn(game, "Triangle of War");
    const offered = offers(game, A, triangle);
    expect(offered).toHaveLength(1);
    expect(offered[0].targetOptions).toEqual([[ref(hojo)], [ref(theirs)]]);
    activate(game, triangle, 0, { targets: [ref(hojo), ref(theirs)] });
    expect(game.state.objects[triangle].zone).toBe("graveyard");
    expect(game.state.objects[hojo].zone).toBe("graveyard");
  });

  it("an ability that targeted someone else's creature isn't that first one", () => {
    const { game } = table();
    const hojo = spawn(game, "Professor Hojo");
    const theirs = spawn(game, "Grizzly Bears", B);
    const icy = spawn(game, "Icy Manipulator");
    const hammer = spawn(game, "Loxodon Warhammer");
    const pool = lands(game, "Wastes", 2);
    activate(game, icy, 0, { targets: [ref(theirs)] });
    expect(untapped(game, pool)).toBe(1);
    activate(game, hammer, 0, { targets: [ref(hojo)] });
    expect(game.state.objects[hammer].attachedTo).toBe(hojo);
    expect(untapped(game, pool)).toBe(0);
  });

  it("an ability activated before Hojo arrived was the turn's first", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const icy = spawn(game, "Icy Manipulator");
    const hammer = spawn(game, "Loxodon Warhammer");
    const pool = lands(game, "Wastes", 2);
    activate(game, icy, 0, { targets: [ref(bear)] });
    expect(untapped(game, pool)).toBe(1);
    spawn(game, "Professor Hojo");
    expect(can(game, hammer, bear)).toMatch(/cannot pay/);
  });

  it("does nothing on another player's turn, or for another player's abilities", () => {
    const { game } = table();
    const hojo = spawn(game, "Professor Hojo");
    const icy = spawn(game, "Icy Manipulator");
    const theirIcy = spawn(game, "Icy Manipulator", B);
    const theirs = spawn(game, "Grizzly Bears", B);
    // Bob's ability, on Alice's turn, at his own creature or hers: full price.
    expect(can(game, theirIcy, theirs, B)).not.toBeNull();
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === A);
    expect(can(game, icy, hojo)).toMatch(/cannot pay/);
  });
});

describe("whenever one or more creatures you control become the target of an activated ability — Professor Hojo", () => {
  it("draws for an activated ability, anyone's, once each turn", () => {
    const { game } = table();
    const hojo = spawn(game, "Professor Hojo");
    const bear = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Short Sword");
    const theirIcy = spawn(game, "Icy Manipulator", B);
    lands(game, "Wastes", 2);
    lands(game, "Wastes", 2, B);
    const before = hand(game).length;
    activate(game, sword, 0, { targets: [ref(bear)] });
    expect(hand(game).length).toBe(before + 1);
    // Once each turn.
    activate(game, sword, 0, { targets: [ref(hojo)] });
    expect(hand(game).length).toBe(before + 1);
    // An opponent's activated ability, on their turn (the turn's draw is theirs).
    nextTurn(game);
    const then = hand(game).length;
    activate(game, theirIcy, 0, { player: B, targets: [ref(hojo)] });
    expect(hand(game).length).toBe(then + 1);
  });

  it("not for a spell or a triggered ability, nor for someone else's creature", () => {
    const { game, a } = table();
    const hojo = spawn(game, "Professor Hojo");
    const theirs = spawn(game, "Grizzly Bears", B);
    const icy = spawn(game, "Icy Manipulator");
    lands(game, "Forest", 3);
    const before = hand(game).length;
    // A spell.
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hojo)] });
    expect(hand(game).length).toBe(before);
    // A triggered ability: Bond Beetle's "put a +1/+1 counter on target creature".
    pickTargets(a, hojo);
    enter(game, "Bond Beetle");
    expect(counters(game, hojo)).toBe(1);
    expect(hand(game).length).toBe(before);
    // An activated ability at an opponent's creature.
    activate(game, icy, 0, { targets: [ref(theirs)] });
    expect(hand(game).length).toBe(before);
  });
});
