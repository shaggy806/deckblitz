/**
 * A player who gains protection from a quality for a while (rule 702.16 —
 * 702.16b targets, 702.16c Auras, 702.16e damage): `grant-protection`'s
 * `players`, a `PlayerEffect.protection` read by `playerProtectionBlocks`.
 * Seht's Tiger's "you gain protection from the color of your choice until end
 * of turn"; Faith's Shield's fateful hour, "you and each permanent you control
 * gain protection from the color of your choice" — one color for all.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { cardSource, legalTargets } from "../targeting.js";
import { A, B, attack, cast, enter, lands, life, nextTurn, pickModes, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

/** The color modes, in the order a protection choice offers them. */
const RED = 3;
const GREEN = 4;

/** Whether `player`'s copy of `spell` could target `at` now. */
function canTarget(game: Game, player: PlayerId, spell: string, at: PlayerId | ObjectId): boolean {
  const card = toHand(game, spell, player);
  const def = game.registry.get(spell);
  return legalTargets(game.state, game.registry, def.targets[0], player, cardSource(def, card)).some(
    (t) => (t.kind === "player" ? t.player : t.object) === at,
  );
}

describe("Seht's Tiger — you gain protection from the color of your choice", () => {
  it("red spells can't target you; others still can", () => {
    const { game, a } = table();
    pickModes(a, RED);
    enter(game, "Seht's Tiger");
    expect(canTarget(game, B, "Lightning Bolt", A)).toBe(false);
    expect(canTarget(game, B, "Lightning Bolt", B)).toBe(true);
    // Not a color it has: Bob's black spell may.
    expect(canTarget(game, B, "Sign in Blood", A)).toBe(true);
  });

  it("damage from a red source is prevented, from another color it isn't", () => {
    const { game, a, b } = table();
    // Flash: on Bob's turn, before his attack.
    toStep(game, "precombat-main", B);
    pickModes(a, RED);
    enter(game, "Seht's Tiger");
    const goblin = spawn(game, "Raging Goblin", B);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].summoningSick = false;
    const before = life(game, A);
    attack(game, b, [goblin, bears], A);
    // Bears' 2 only.
    expect(life(game, A)).toBe(before - 2);
  });

  it("a red Curse can't enchant you", () => {
    const { game, a } = table();
    const curse = spawn(game, "Curse of the Pierced Heart", B);
    game.state.objects[curse].attachedToPlayer = A;
    pickModes(a, RED);
    enter(game, "Seht's Tiger");
    expect(zone(game, curse)).toBe("graveyard");
  });

  it("lasts until end of turn", () => {
    const { game, a } = table();
    pickModes(a, RED);
    enter(game, "Seht's Tiger");
    nextTurn(game);
    expect(canTarget(game, B, "Lightning Bolt", A)).toBe(true);
  });

  it("is only its controller's, not its creatures'", () => {
    const { game, a } = table();
    pickModes(a, RED);
    const tiger = enter(game, "Seht's Tiger");
    expect(canTarget(game, B, "Lightning Bolt", tiger)).toBe(true);
  });
});

describe("Faith's Shield", () => {
  it("above 5 life: only the target permanent gains it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    pickModes(a, RED);
    cast(game, toHand(game, "Faith's Shield"), { targets: [ref(bears)] });
    expect(canTarget(game, B, "Lightning Bolt", bears)).toBe(false);
    expect(canTarget(game, B, "Lightning Bolt", other)).toBe(true);
    expect(canTarget(game, B, "Lightning Bolt", A)).toBe(true);
  });

  it("fateful hour: you and each permanent you control, one color for all", () => {
    const { game, a } = table();
    game.state.players[A].life = 5;
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    pickModes(a, RED);
    cast(game, toHand(game, "Faith's Shield"), { targets: [ref(bears)] });
    expect(canTarget(game, B, "Lightning Bolt", A)).toBe(false);
    expect(canTarget(game, B, "Lightning Bolt", bears)).toBe(false);
    expect(canTarget(game, B, "Lightning Bolt", other)).toBe(false);
    expect(canTarget(game, B, "Sign in Blood", A)).toBe(true);
    // A permanent of an opponent's doesn't gain it.
    expect(canTarget(game, A, "Lightning Bolt", theirs)).toBe(true);
  });

  it("fateful hour: the protection stops damage to you, as a permanent's would", () => {
    const { game, a } = table();
    game.state.players[A].life = 5;
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    pickModes(a, GREEN);
    cast(game, toHand(game, "Faith's Shield"), { targets: [ref(bears)] });
    // A green source deals each player 2: not Alice.
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, who: "each-player" }, [], { source: theirs });
    expect(life(game, A)).toBe(5);
    expect(life(game, B)).toBe(18);
  });
});
