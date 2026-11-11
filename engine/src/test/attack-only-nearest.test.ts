/**
 * "Choose left or right. Until your next turn, each player may attack only
 * the nearest opponent in the last chosen direction and planeswalkers
 * controlled by that opponent" — the `attack-only-nearest` combat record a
 * `restrict` makes over the game (Teyo, Geometric Tactician's −2), read by
 * `nearestOpponentRule` beside Pramikon's static: both directions, how long
 * it lasts, the last choice of one permanent against two permanents that
 * disagree, planeswalkers, and battles (never attackable under it).
 */
import { describe, expect, it } from "vitest";

import { nearestOpponentRule, whyCannotAttack } from "../combat/eligibility.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  C,
  D,
  cast,
  hand,
  keywords,
  lands,
  loyalty,
  named,
  pickModes,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
} from "./harness.js";

const TEYO = "Teyo, Geometric Tactician";

const may = (game: Game, player: PlayerId): readonly PlayerId[] | null =>
  nearestOpponentRule(game.state, registryOf(game), player);
const refused = (game: Game, player: PlayerId, creature: ObjectId, target: PlayerId | ObjectId): boolean =>
  whyCannotAttack(game.state, registryOf(game), player, creature, target) !== null;

const direct = (direction: "left" | "right"): EffectSpec => ({
  kind: "restrict",
  filter: {},
  restrictions: [{ kind: "attack-only-nearest", direction }],
  duration: "until-your-next-turn",
});
/** The −2's effect from `source`, without the loyalty cost or the once-a-turn limit. */
const choose = (game: Game, source: ObjectId, direction: "left" | "right", player: PlayerId = A): void => {
  game.debugApplyEffect(player, direct(direction), [], { source });
  settle(game);
};

describe("Teyo, Geometric Tactician", () => {
  it("enters with a 0/4 white Wall with defender and flying", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, TEYO));
    const [wall] = named(game, "Wall Token (Teyo, Geometric Tactician)", A);
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 4 });
    expect([...keywords(game, wall)].sort()).toEqual(["defender", "flying"]);
  });

  it("+1: you and target opponent each draw a card", () => {
    const { game } = table({ players: 3 });
    const teyo = spawn(game, TEYO);
    const before = [hand(game, A).length, hand(game, B).length, hand(game, C).length];
    loyalty(game, teyo, 1, { targets: [ref(C)] });
    expect([hand(game, A).length, hand(game, B).length, hand(game, C).length]).toEqual([
      before[0] + 1,
      before[1],
      before[2] + 1,
    ]);
  });

  it("−2 left: every player may attack only the next opponent in turn order, until your next turn", () => {
    const { game, a } = table({ players: 4 });
    const teyo = spawn(game, TEYO);
    const mine = spawn(game, "Grizzly Bears", A);
    const walker = spawn(game, "Teyo, the Shieldmage", B);
    const theirs = spawn(game, "Teyo, the Shieldmage", C);
    expect(may(game, A)).toBeNull();
    pickModes(a, 0);
    loyalty(game, teyo, -2);
    expect([may(game, A), may(game, B), may(game, C), may(game, D)]).toEqual([[B], [C], [D], [A]]);
    expect(refused(game, A, mine, B)).toBe(false);
    expect(refused(game, A, mine, walker)).toBe(false);
    expect(refused(game, A, mine, C)).toBe(true);
    expect(refused(game, A, mine, theirs)).toBe(true);
    expect(refused(game, A, mine, D)).toBe(true);
    // Through each opponent's turn, gone as yours begins.
    game.advanceUntil((s) => activePlayerOf(s) === D && s.turn.step === "precombat-main");
    expect(may(game, D)).toEqual([A]);
    game.advanceUntil((s) => activePlayerOf(s) === A && s.turn.step === "upkeep");
    expect(may(game, A)).toBeNull();
    expect(refused(game, A, mine, C)).toBe(false);
  });

  it("−2 right: the previous one, skipping a player who has left", () => {
    const { game, a } = table({ players: 4 });
    const teyo = spawn(game, TEYO);
    pickModes(a, 1);
    loyalty(game, teyo, -2);
    expect([may(game, A), may(game, B)]).toEqual([[D], [A]]);
    game.state.players[D].hasLost = true;
    expect(may(game, A)).toEqual([C]);
  });

  it("the last chosen direction of one Teyo is the one in force; two Teyos that disagree leave nobody to attack", () => {
    const { game } = table({ players: 4 });
    const teyo = spawn(game, TEYO);
    choose(game, teyo, "left");
    choose(game, teyo, "right");
    expect(may(game, A)).toEqual([D]);
    const other = spawn(game, TEYO, B);
    choose(game, other, "left", B);
    expect(may(game, A)).toEqual([]);
    const bears = spawn(game, "Grizzly Bears", A);
    expect(refused(game, A, bears, D)).toBe(true);
    // With two players left, both directions name the same opponent.
    game.state.players[C].hasLost = true;
    game.state.players[D].hasLost = true;
    expect(may(game, A)).toEqual([B]);
  });

  it("never a battle, even one the nearest opponent protects", () => {
    const { game } = table({ players: 4 });
    const teyo = spawn(game, TEYO);
    const bears = spawn(game, "Grizzly Bears", A);
    const battle = spawn(game, "Invasion of Zendikar", A);
    game.state.objects[battle].protector = B;
    game.state.objects[battle].counters.defense = 3;
    expect(refused(game, A, bears, battle)).toBe(false);
    choose(game, teyo, "left");
    expect(refused(game, A, bears, B)).toBe(false);
    expect(refused(game, A, bears, battle)).toBe(true);
  });
});
