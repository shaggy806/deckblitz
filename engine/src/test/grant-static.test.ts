/**
 * Granting a permanent a static ability (the `grant-static` effect — Full
 * Steam Ahead's "gains 'This creature can't be blocked by more than one
 * creature'", Earthbind's "this Aura gains 'Enchanted creature loses
 * flying'"), and the `restrict` effect's "can't be blocked by [filter] this
 * turn" (Ghirapur Guide), which is a rule about the creature rather than an
 * ability it gains.
 */

import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, blockOffer, keywords, life, pt, settle, spawn, table } from "./harness.js";

const run = (game: Game, effect: EffectSpec, target?: ObjectId, player: PlayerId = A, source?: ObjectId): void => {
  game.debugApplyEffect(player, effect, target === undefined ? [] : [{ kind: "object", object: target }], { source });
  settle(game);
};
const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

const SMALL_CANT_BLOCK: EffectSpec = {
  kind: "restrict",
  target: 0,
  restrictions: [],
  cantBeBlockedBy: { type: "creature", power: { op: "lte", n: 2 } },
};

describe("restrict: can't be blocked by [filter] this turn", () => {
  it("a creature with power 2 or less can't block it; a bigger one can", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const theirGiant = spawn(game, "Hill Giant", B);
    run(game, SMALL_CANT_BLOCK, giant);
    const offer = blockOffer(game, a, [giant]);
    expect(canBlock(offer, bears)).toEqual([]);
    expect(canBlock(offer, theirGiant)).toEqual([giant]);
  });

  it("isn't an ability: a later loss of all abilities doesn't end it", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B); // so B is asked to block at all
    run(game, SMALL_CANT_BLOCK, giant);
    run(game, { kind: "lose-abilities", target: 0, duration: "end-of-turn" }, giant);
    expect(canBlock(blockOffer(game, a, [giant]), bears)).toEqual([]);
  });

  it("\"except by\" is the filter's negation", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Wall of Air", B);
    run(game, { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { not: { subtype: "Wall" } } }, giant);
    const offer = blockOffer(game, a, [giant]);
    expect(canBlock(offer, bears)).toEqual([]);
    expect(canBlock(offer, wall)).toEqual([giant]);
  });

  it("as a turn-wide rule, it binds a creature that comes under your control later (rule 611.2c)", () => {
    const { game, a } = table();
    run(game, {
      kind: "restrict",
      filter: { type: "creature", controlledBy: "you" },
      restrictions: [],
      cantBeBlockedBy: { type: "creature", power: { op: "lte", n: 2 } },
    });
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    expect(canBlock(blockOffer(game, a, [giant]), bears)).toEqual([]);
  });
});

describe("grant-static", () => {
  it("a granted block limit holds for the creatures there as it resolves, not one arriving later", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A);
    run(game, {
      kind: "grant-static",
      filter: { type: "creature", controlledBy: "you" },
      ability: { affects: { scope: "self" }, blockedByAtMostOne: true, text: "This creature can't be blocked by more than one creature." },
      duration: "end-of-turn",
    });
    const later = spawn(game, "Hill Giant", A);
    const b1 = spawn(game, "Grizzly Bears", B);
    const b2 = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [giant, later]);
    const double = (attacker: ObjectId) => [
      { blocker: b1, attacker },
      { blocker: b2, attacker },
    ];
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: double(giant) })).toThrow();
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: double(later) })).not.toThrow();
  });

  it("works from its holder: an Aura's granted 'Enchanted creature loses flying'", () => {
    const { game } = table();
    const drake = spawn(game, "Wind Drake", B);
    const aura = game.debugSpawn("Pacifism", A, "battlefield");
    game.state.objects[aura].attachedTo = drake;
    expect(keywords(game, drake).has("flying")).toBe(true);
    run(game, {
      kind: "grant-static",
      target: "source",
      ability: { affects: { scope: "attached" }, loseKeywords: ["flying"], text: "Enchanted creature loses flying." },
      duration: "permanent",
    }, undefined, A, aura);
    expect(keywords(game, drake).has("flying")).toBe(false);
  });

  it("is lost to a later loss of all abilities, kept after an earlier one (rule 613.7)", () => {
    const pump: EffectSpec = {
      kind: "grant-static",
      target: 0,
      ability: { affects: { scope: "self" }, grantPt: [2, 2], text: "This creature gets +2/+2." },
      duration: "end-of-turn",
    };
    const lose: EffectSpec = { kind: "lose-abilities", target: 0, duration: "end-of-turn" };
    const first = table();
    const bears = spawn(first.game, "Grizzly Bears", A);
    run(first.game, pump, bears);
    expect(pt(first.game, bears)).toEqual({ power: 4, toughness: 4 });
    run(first.game, lose, bears);
    expect(pt(first.game, bears)).toEqual({ power: 2, toughness: 2 });

    const second = table();
    const other = spawn(second.game, "Grizzly Bears", A);
    run(second.game, lose, other);
    run(second.game, pump, other);
    expect(pt(second.game, other)).toEqual({ power: 4, toughness: 4 });
  });

  it("a granted 'base power is equal to …' is a layer-7b set by timestamp, not a CDA (rule 604.3a)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    for (let i = 0; i < 5; i++) game.debugSpawn("Wastes", A, "hand");
    const handPower: EffectSpec = {
      kind: "grant-static",
      target: 0,
      ability: {
        affects: { scope: "self" },
        setBasePtFromCount: { countOf: "cards-in-your-hand", only: "power", plusPower: 0, plusToughness: 0 },
        text: "This creature's base power is equal to the number of cards in your hand.",
      },
      duration: "end-of-turn",
    };
    const hand = game.state.zones.perPlayer[A].hand.length;
    run(game, handPower, bears);
    expect(pt(game, bears)).toEqual({ power: hand, toughness: 2 });
    // A later "becomes 1/1" sets over it.
    run(game, { kind: "animate", target: 0, power: 1, toughness: 1, addTypes: [], addSubtypes: [], duration: "end-of-turn" }, bears);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });

  it("a granted 'doesn't untap … if it has a fungus counter on it' holds in its controller's untap step", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    run(game, {
      kind: "grant-static",
      target: 0,
      ability: {
        affects: { scope: "self" },
        condition: { kind: "self-counters", counter: "fungus", compare: { op: "gte", n: 1 } },
        doesntUntap: true,
        text: "This creature doesn't untap during your untap step if it has a fungus counter on it.",
      },
      duration: "permanent",
    }, bears);
    run(game, { kind: "add-counter", target: 0, counter: "fungus", amount: 1 }, bears);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("a granted 'Creatures you control have …' gives them an activated ability they can use", () => {
    const { game } = table();
    const saga = spawn(game, "Wastes", A);
    const bears = spawn(game, "Grizzly Bears", A);
    run(
      game,
      {
        kind: "grant-static",
        target: 0,
        ability: {
          affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
          grantsActivated: [
            { cost: { mana: null, tap: true }, targets: [], effect: { kind: "gain-life", amount: 1 }, resolve: null, text: "{T}: You gain 1 life." },
          ],
          text: 'Creatures you control have "{T}: You gain 1 life."',
        },
        duration: "permanent",
      },
      saga,
    );
    const offered = game
      .legalActions(A)
      .filter((action) => action.kind === "activate-ability" && action.source === bears);
    expect(offered.length).toBe(1);
    activate(game, bears, (offered[0] as { abilityIndex: number }).abilityIndex);
    expect(life(game, A)).toBe(21);
  });

  it("a granted 'You can't lose the game' keeps its controller in at 0 life", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", A);
    run(game, {
      kind: "grant-static",
      target: 0,
      ability: { affects: { scope: "self" }, cantLoseGame: true, text: "You can't lose the game." },
      duration: "permanent",
    }, angel);
    run(game, { kind: "lose-life", who: "you", amount: 25 });
    expect(life(game, A)).toBeLessThanOrEqual(0);
    expect(game.state.players[A].hasLost).toBe(false);
  });
});
