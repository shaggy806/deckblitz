/**
 * "You and planeswalkers you control gain protection from that player" (Eon
 * Frolicker): the player's own protection is a `player-effect`'s
 * `protectionFromPlayers` (rule 702.16k); the planeswalkers' a
 * `grant-protection` over them as it resolves (rule 611.2c) whose quality is
 * `fromPlayer` — the one player a ref names (here the target opponent), fixed
 * as it resolves. Guardian Archon's "the chosen player" is the same field.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { cardSource, legalTargets } from "../targeting.js";
import { A, B, C, attack, cast, enter, lands, life, nextTurn, pickTargets, ref, spawn, table, toHand, toStep } from "./harness.js";

const FROLICKER = "Eon Frolicker";

/** Whether `player`'s Lightning Bolt could target `at` now. */
function canBolt(game: Game, player: PlayerId, at: PlayerId | ObjectId): boolean {
  const bolt = toHand(game, "Lightning Bolt", player);
  const def = game.registry.get("Lightning Bolt");
  return legalTargets(game.state, game.registry, def.targets[0], player, cardSource(def, bolt)).some(
    (t) => (t.kind === "player" ? t.player : t.object) === at,
  );
}

describe("Eon Frolicker", () => {
  it("gives the target opponent an extra turn after this one", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Island", 4);
    pickTargets(a, C);
    cast(game, toHand(game, FROLICKER));
    nextTurn(game);
    // Carol's extra turn comes before Bob's.
    expect(activePlayerOf(game.state)).toBe(C);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("you and your planeswalkers have protection from that player — and only that player", () => {
    const { game, a } = table({ players: 3 });
    const walker = spawn(game, "Ajani, Caller of the Pride");
    lands(game, "Island", 4);
    pickTargets(a, C);
    cast(game, toHand(game, FROLICKER));
    // A planeswalker that arrives afterwards isn't one it protected.
    const late = spawn(game, "Ajani, Caller of the Pride");
    expect(canBolt(game, C, A)).toBe(false);
    expect(canBolt(game, C, walker)).toBe(false);
    expect(canBolt(game, C, late)).toBe(true);
    // Bob isn't that player.
    expect(canBolt(game, B, A)).toBe(true);
    expect(canBolt(game, B, walker)).toBe(true);
    // A real cast is refused for its target.
    toStep(game, "precombat-main", C);
    lands(game, "Mountain", 1, C);
    const bolt = toHand(game, "Lightning Bolt", C);
    expect(game.canDispatch({ type: "cast-spell", player: C, card: bolt, targets: [ref(A)] })).toMatch(/target/i);
  });

  // Its ruling: the creatures can still attack, but the damage is prevented.
  it("that player's creatures can attack you, but deal you no damage", () => {
    const { game, a, c } = table({ players: 3 });
    lands(game, "Island", 4);
    pickTargets(a, C);
    cast(game, toHand(game, FROLICKER));
    toStep(game, "precombat-main", C);
    const bears = spawn(game, "Grizzly Bears", C);
    const before = life(game, A);
    attack(game, c, [bears], A);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(life(game, A)).toBe(before);
  });

  it("lasts until your next turn", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Island", 4);
    pickTargets(a, C);
    cast(game, toHand(game, FROLICKER));
    // Carol's extra turn, then Bob's, then Alice's own.
    toStep(game, "precombat-main", B);
    expect(canBolt(game, C, A)).toBe(false);
    toStep(game, "precombat-main", A);
    expect(canBolt(game, C, A)).toBe(true);
  });

  it("the log names that player, not each of your opponents", () => {
    const { game, a } = table({ players: 4 });
    const walker = spawn(game, "Ajani, Caller of the Pride");
    lands(game, "Island", 4);
    pickTargets(a, C);
    cast(game, toHand(game, FROLICKER));
    const granted = game.eventsOfType("keyword-granted").filter((e) => e.object === walker);
    expect(granted.map((e) => e.keyword)).toEqual(["protection from Carol"]);
    expect(game.viewFor(A).objects[walker]?.text).toContain("Protection from Carol until your next turn");
  });

  it("put onto the battlefield without being cast, it does nothing", () => {
    const { game } = table({ players: 3 });
    enter(game, FROLICKER);
    expect(canBolt(game, C, A)).toBe(true);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
  });
});

describe("Guardian Archon's chosen player, through the same field", () => {
  it("the permanent it protects can't be targeted by the chosen player", () => {
    const { game } = table({ players: 3 });
    const archon = spawn(game, "Guardian Archon");
    game.state.objects[archon].chosenPlayer = C;
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(
      A,
      { kind: "grant-protection", target: 0, from: { fromPlayer: "chosen-player" }, duration: "end-of-turn" },
      [ref(bears)],
      { source: archon },
    );
    expect(canBolt(game, C, bears)).toBe(false);
    expect(canBolt(game, B, bears)).toBe(true);
    const granted = game.eventsOfType("keyword-granted").filter((e) => e.object === bears);
    expect(granted.map((e) => e.keyword)).toEqual(["protection from Carol"]);
  });

  it("each of your opponents still reads so at four players (Cliffside Rescuer)", () => {
    const { game } = table({ players: 4 });
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(
      A,
      { kind: "grant-protection", target: 0, from: { fromPlayers: "opponents" }, duration: "end-of-turn" },
      [ref(bears)],
    );
    const granted = game.eventsOfType("keyword-granted").filter((e) => e.object === bears);
    expect(granted.map((e) => e.keyword)).toEqual(["protection from each of your opponents"]);
  });
});
