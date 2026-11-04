/**
 * A planeswalker that's an Equipment, and "can't be attacked" (rule 508.1c): it
 * attaches by its own +1, is attacked and loses loyalty as a planeswalker while
 * unattached, and while attached is offered to no attacker declaring. A creature
 * already attacking it stays (the ruling), and one put onto the battlefield
 * attacking may choose it (rule 508.4c).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  counters,
  destroy,
  hand,
  life,
  loyalty,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toStep,
  zone,
} from "./harness.js";

const NAME = "The Aetherspark";
const loyal = (game: Game, id: ObjectId): number => counters(game, id, "loyalty");
const hostOf = (game: Game, id: ObjectId): ObjectId | null | undefined => game.state.objects[id].attachedTo;

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

function attackOffer(game: Game, player: PlayerId): AttackOffer {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === player);
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error(`${player} wasn't asked to attack`);
  return offer;
}

/** Alice's Aetherspark on a Grizzly Bears, by its +1: loyalty 5, the Bears 3/3. */
function equipped(game: Game): { spark: ObjectId; bears: ObjectId } {
  const spark = spawn(game, NAME);
  const bears = spawn(game, "Grizzly Bears");
  loyalty(game, spark, 1, { targets: [ref(bears)] });
  return { spark, bears };
}

describe("The Aetherspark", () => {
  it("+1 attaches it and puts a +1/+1 counter on that creature", () => {
    const { game } = table();
    const { spark, bears } = equipped(game);
    expect(hostOf(game, spark)).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(loyal(game, spark)).toBe(5);
  });

  it("+1 moves it, and with no target does neither thing and leaves it where it is", () => {
    const { game } = table();
    const { spark, bears } = equipped(game);
    const lions = spawn(game, "Savannah Lions");
    toStep(game, "precombat-main");
    loyalty(game, spark, 1, { targets: [ref(lions)] });
    expect(hostOf(game, spark)).toBe(lions);
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
    toStep(game, "precombat-main");
    loyalty(game, spark, 1, { targets: [null] });
    expect(hostOf(game, spark)).toBe(lions);
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(loyal(game, spark)).toBe(7);
  });

  it("can be attacked while unattached, and takes the damage as loyalty", () => {
    const { game, b } = table();
    const spark = spawn(game, NAME);
    const attacker = spawn(game, "Grizzly Bears", B);
    const offer = attackOffer(game, B);
    expect(offer.defenders).toContain(spark);
    expect(offer.defendersFor[attacker]).toContain(spark);
    b.declareAttackersFn = () => [{ attacker, defender: spark }];
    toStep(game, "postcombat-main", B);
    expect(loyal(game, spark)).toBe(2);
    expect(life(game)).toBe(20);
  });

  it("can't be attacked while attached: not offered, and refused if declared", () => {
    const { game } = table();
    const { spark } = equipped(game);
    const attacker = spawn(game, "Grizzly Bears", B);
    const offer = attackOffer(game, B);
    expect(offer.defenders).not.toContain(spark);
    expect(offer.defendersFor[attacker]).toEqual([A]);
    expect(
      game.canDispatch({ type: "declare-attackers", player: B, attackers: [{ attacker, defender: spark }] }),
    ).toMatch(/can't be attacked/);
  });

  it("can be attacked again once its creature is gone", () => {
    const { game } = table();
    const { spark, bears } = equipped(game);
    const attacker = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    const offer = attackOffer(game, B);
    expect(zone(game, spark)).toBe("battlefield");
    expect(hostOf(game, spark) ?? null).toBe(null);
    expect(offer.defendersFor[attacker]).toContain(spark);
  });

  it("stays attacked when it becomes attached mid-combat (the ruling)", () => {
    const { game, b } = table();
    const spark = spawn(game, NAME);
    const bears = spawn(game, "Grizzly Bears");
    const attacker = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker, defender: spark }];
    game.advanceUntil((s) => s.objects[attacker].attacking !== null && s.awaiting === null);
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: "source" }, [ref(bears)], { source: spark });
    expect(hostOf(game, spark)).toBe(bears);
    expect(game.state.objects[attacker].attacking).toBe(spark);
    toStep(game, "postcombat-main", B);
    expect(loyal(game, spark)).toBe(2);
    expect(life(game)).toBe(20);
  });

  it("a creature put onto the battlefield attacking may still choose it (rule 508.4c)", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    const sparkOfCarol = spawn(game, NAME, C);
    const hers = spawn(game, "Grizzly Bears", C);
    game.debugApplyEffect(C, { kind: "attach", target: 0, attachment: "source" }, [ref(hers)], { source: sparkOfCarol });
    expect(hostOf(game, sparkOfCarol)).toBe(hers);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    let options: readonly unknown[] = [];
    a.chooseAttackTargetsFn = (_view, creatures) => {
      options = creatures[0].options;
      return creatures.map((cr) => ({ object: cr.object, target: sparkOfCarol }));
    };
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1, tapped: true, attacking: "choose" });
    settle(game);
    expect(options).toContain(sparkOfCarol);
    const token = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Soldier Token") as ObjectId;
    expect(game.state.objects[token].attacking).toBe(sparkOfCarol);
  });

  it("gets that many loyalty when the creature connects on your turn", () => {
    const { game, a } = table();
    const { spark, bears } = equipped(game);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(loyal(game, spark)).toBe(8);
  });

  it("counts all the creature deals at once as one event: a double block is one trigger for the total", () => {
    const { game, a, b } = table();
    const { spark, bears } = equipped(game);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: bears },
      { blocker: two, attacker: bears },
    ];
    attack(game, a, [bears]);
    expect(loyal(game, spark)).toBe(8);
  });

  it("gets nothing from combat damage on another player's turn", () => {
    const { game, b, a } = table();
    const { spark, bears } = equipped(game);
    const attacker = spawn(game, "Savannah Lions", B);
    b.declareAttackersFn = () => [{ attacker, defender: A }];
    a.declareBlockersFn = () => [{ blocker: bears, attacker }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, attacker)).toBe("graveyard");
    expect(loyal(game, spark)).toBe(5);
  });

  it("gets nothing while unattached, from a creature that isn't equipped", () => {
    const { game, a } = table();
    const spark = spawn(game, NAME);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(loyal(game, spark)).toBe(4);
  });

  it("−5 draws two, and at 0 loyalty it's put into the graveyard", () => {
    const { game } = table();
    const spark = spawn(game, NAME);
    game.state.objects[spark].counters.loyalty = 5;
    const before = hand(game).length;
    loyalty(game, spark, -5);
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, spark)).toBe("graveyard");
  });

  it("−10 uses the stack (rule 605.1a), and you choose the one color as it resolves", () => {
    const { game, a } = table();
    const spark = spawn(game, NAME);
    loyalty(game, spark, -10, { atLeast: 11, settle: false });
    expect(game.state.zones.shared.stack).toHaveLength(1);
    expect(game.state.players[A].manaPool).toHaveLength(0);
    pickModes(a, 3);
    settle(game);
    const pool = game.state.players[A].manaPool;
    expect(pool).toHaveLength(10);
    expect(new Set(pool.map((unit) => unit.type))).toEqual(new Set(["R"]));
    expect(loyal(game, spark)).toBe(1);
  });
});
