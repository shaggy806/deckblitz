/**
 * A cost reduction on the next matching spell (rule 601.2f): the
 * `grant-spells-this-turn` effect's `reduceGeneric` (Hardened Berserker, Kaza,
 * Roil Chaser, Maelstrom Muse — {N} or {X} fixed as it resolves) and
 * `affinityFor` (Don & Raph — rule 702.41a, counted as the spell is cast), used
 * up by that spell as it becomes cast (601.2i), several all at once; and a
 * `player-effect`'s `reduceSpells` lasting until the controller's next turn
 * (Ral, Leyline Prodigy's +1).
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, attack, cast, lands, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);


describe("the next spell you cast this turn costs {N} less", () => {
  it("Hardened Berserker: the next spell costs {1} less, and only that one", () => {
    const { game, a } = table();
    const berserker = spawn(game, "Hardened Berserker");
    const first = toHand(game, "Grizzly Bears");
    const second = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(canCast(game, first)).toBe(false);
    attack(game, a, [berserker]);
    // {1}{G} less {1}: the one Forest pays.
    expect(canCast(game, first)).toBe(true);
    expect(canCast(game, second)).toBe(true);
    cast(game, first);
    expect(zone(game, first)).toBe("battlefield");
    lands(game, "Forest", 1);
    // Used up: the next Bears costs its whole {1}{G}, and one land won't do.
    expect(canCast(game, second)).toBe(false);
  });

  it("Hardened Berserker: it can't touch colored mana, and it's gone at end of turn", () => {
    const { game, a } = table();
    const berserker = spawn(game, "Hardened Berserker");
    const counter = toHand(game, "Counterspell");
    lands(game, "Island", 1);
    attack(game, a, [berserker]);
    // {U}{U} has no generic to take off.
    expect(canCast(game, counter)).toBe(false);
    nextTurn(game);
    expect(game.state.spellGrantsThisTurn ?? []).toEqual([]);
    nextTurn(game);
    // Next turn it's gone: one land doesn't pay for a Bears.
    expect(canCast(game, toHand(game, "Grizzly Bears"))).toBe(false);
  });

  it("two instances reach the one next spell, and both are spent on it", () => {
    const { game, a } = table();
    const one = spawn(game, "Hardened Berserker");
    const two = spawn(game, "Hardened Berserker");
    attack(game, a, [one, two]);
    expect((game.state.spellGrantsThisTurn ?? []).length).toBe(2);
    const giant = toHand(game, "Hill Giant");
    lands(game, "Mountain", 2);
    // {3}{R} less {2}: two Mountains pay it.
    expect(canCast(game, giant)).toBe(true);
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
    expect((game.state.spellGrantsThisTurn ?? []).every((g) => g.usedBy?.id === giant)).toBe(true);
  });

  it("a spell with nothing to reduce still uses it up", () => {
    const { game } = table();
    const next: EffectSpec = { kind: "grant-spells-this-turn", next: true, reduceGeneric: 1 };
    game.debugApplyEffect(A, next, []);
    const ornithopter = toHand(game, "Ornithopter");
    cast(game, ornithopter);
    expect(game.state.spellGrantsThisTurn?.[0]?.usedBy?.id).toBe(ornithopter);
  });
});

describe("{X} less, read as it resolves", () => {
  it("Kaza: X is the Wizards you control as the ability resolves, and later Wizards change nothing", () => {
    const { game } = table();
    const kaza = spawn(game, "Kaza, Roil Chaser");
    spawn(game, "Prodigal Sorcerer");
    spawn(game, "Grizzly Bears");
    activate(game, kaza, 0);
    expect(game.state.spellGrantsThisTurn?.[0]?.reduceGeneric).toBe(2);
    spawn(game, "Prodigal Sorcerer");
    expect(game.state.spellGrantsThisTurn?.[0]?.reduceGeneric).toBe(2);
    // Instant or sorcery only: the Bears isn't reduced, and doesn't use it up.
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    expect(canCast(game, bears)).toBe(false);
    lands(game, "Forest", 1);
    cast(game, bears);
    expect(game.state.spellGrantsThisTurn?.[0]?.usedBy).toBeUndefined();
    // Lava Axe, {4}{R} less 2, needs three lands.
    const axe = toHand(game, "Lava Axe");
    lands(game, "Mountain", 2);
    expect(canCast(game, axe)).toBe(false);
    lands(game, "Mountain", 1);
    expect(canCast(game, axe)).toBe(true);
    cast(game, axe, { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(15);
    expect(game.state.spellGrantsThisTurn?.[0]?.usedBy?.id).toBe(axe);
  });

  it("Kaza reads an Adventure as it's cast: the instant half is reduced, the creature half isn't", () => {
    const { game } = table();
    const kaza = spawn(game, "Kaza, Roil Chaser");
    activate(game, kaza, 0);
    const giant = toHand(game, "Bonecrusher Giant");
    lands(game, "Mountain", 1);
    const offers = game
      .legalActions(A)
      .filter((a): a is Extract<typeof a, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === giant);
    // Stomp is {1}{R}, less Kaza's 1: one Mountain. The Giant is {2}{R}.
    expect(offers.length).toBe(1);
    expect(offers[0].face ?? 0).not.toBe(0);
  });

  it("Maelstrom Muse: X is its power as the trigger resolves", () => {
    const { game, a } = table();
    const muse = spawn(game, "Maelstrom Muse");
    attack(game, a, [muse]);
    expect(game.state.spellGrantsThisTurn?.[0]?.reduceGeneric).toBe(2);
    const axe = toHand(game, "Lava Axe");
    lands(game, "Mountain", 3);
    expect(canCast(game, axe)).toBe(true);
    cast(game, axe, { targets: [ref(B)] });
    expect(zone(game, axe)).toBe("graveyard");
  });
});

describe("the next spell has affinity", () => {
  it("Don & Raph: {1} less for each artifact you control as the spell is cast, noncreature only", () => {
    const { game, a } = table();
    const turtles = spawn(game, "Don & Raph, Hard Science");
    spawn(game, "Sol Ring", B); // An opponent's isn't counted.
    attack(game, a, [turtles]);
    const axe = toHand(game, "Lava Axe");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    expect(canCast(game, axe)).toBe(false);
    // Counted live: artifacts arriving after the trigger resolved count.
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    expect(canCast(game, axe)).toBe(true);
    // A creature spell isn't reduced: {1}{G} still wants a green source.
    expect(canCast(game, bears)).toBe(false);
    cast(game, axe, { targets: [ref(B)] });
    expect(game.state.spellGrantsThisTurn?.[0]?.usedBy?.id).toBe(axe);
    // Don & Raph's 2 in combat, and the Axe's 5.
    expect(game.state.players[B].life).toBe(13);
  });

  it("instances are cumulative (the Don & Raph ruling)", () => {
    const { game } = table();
    const affinity: EffectSpec = {
      kind: "grant-spells-this-turn",
      next: true,
      filter: { notTypes: ["creature"] },
      affinityFor: { type: "artifact", controlledBy: "you" },
    };
    game.debugApplyEffect(A, affinity, []);
    game.debugApplyEffect(A, affinity, []);
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    const axe = toHand(game, "Lava Axe");
    lands(game, "Mountain", 1);
    // {4}{R} less two for each of two artifacts.
    expect(canCast(game, axe)).toBe(true);
    cast(game, axe, { targets: [ref(B)] });
    expect((game.state.spellGrantsThisTurn ?? []).every((g) => g.usedBy?.id === axe)).toBe(true);
  });
});

describe("a reduction until your next turn", () => {
  const RAL: EffectSpec = {
    kind: "player-effect",
    duration: "until-your-next-turn",
    reduceSpells: { applies: { typesAnyOf: ["instant", "sorcery"] }, reduceGeneric: 1 },
  };

  it("Ral's +1: every instant and sorcery until your next turn, and instances add up", () => {
    const { game } = table();
    game.debugApplyEffect(A, RAL, []);
    game.debugApplyEffect(A, RAL, []);
    const axe = toHand(game, "Lava Axe");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    expect(canCast(game, axe)).toBe(true);
    expect(canCast(game, bears)).toBe(false);
    nextTurn(game);
    expect(game.state.playerEffects?.length).toBe(2);
    nextTurn(game);
    expect(game.state.playerEffects).toEqual([]);
    expect(canCast(game, axe)).toBe(false);
  });
});
