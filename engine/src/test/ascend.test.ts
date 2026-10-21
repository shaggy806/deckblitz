/**
 * Ascend (rule 702.131): on a permanent, any time its controller controls ten
 * or more permanents they get the city's blessing for the rest of the game —
 * had before the game looks for triggers (702.131d), so the state-based
 * check grants it; on an instant or sorcery, the spell's first instruction as
 * it resolves (702.131a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, B, activate, cast, destroy, hand, keywords, lands, pt, spawn, table, toHand, toStep } from "./harness.js";

const blessed = (game: Game, player: PlayerId = A): boolean => game.state.players[player].citysBlessing === true;
/** Pass priority far enough for a state-based check. */
const check = (game: Game): void => toStep(game, "begin-combat");

describe("ascend on a permanent", () => {
  it("ten permanents with one that has ascend: the city's blessing, kept after the count falls", () => {
    const { game } = table();
    const charger = spawn(game, "Dusk Charger");
    const forests = lands(game, "Forest", 8);
    check(game);
    expect(blessed(game)).toBe(false);
    expect(pt(game, charger)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Forest", 1);
    toStep(game, "declare-attackers");
    expect(blessed(game)).toBe(true);
    expect(pt(game, charger)).toEqual({ power: 5, toughness: 5 });
    expect(game.viewFor(B).players[A].citysBlessing).toBe(true);
    // Had for the rest of the game (rule 702.131c), even with fewer permanents
    // and none with ascend.
    for (const forest of forests) destroy(game, forest);
    const skymarcher = spawn(game, "Skymarcher Aspirant");
    destroy(game, charger);
    check(game);
    expect(blessed(game)).toBe(true);
    expect(keywords(game, skymarcher).has("flying")).toBe(true);
  });

  it("ten permanents but none with ascend: no blessing (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 12);
    check(game);
    expect(blessed(game)).toBe(false);
  });

  it("counts each token of a stack, and only its controller's permanents", () => {
    const { game } = table();
    spawn(game, "Snubhorn Sentry");
    lands(game, "Plains", 9, B);
    check(game);
    expect(blessed(game)).toBe(false);
    expect(blessed(game, B)).toBe(false);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 9 });
    toStep(game, "declare-attackers");
    expect(blessed(game)).toBe(true);
  });

  it("Arch of Orazca: its draw can be activated only with the city's blessing", () => {
    const { game } = table();
    const arch = spawn(game, "Arch of Orazca");
    lands(game, "Island", 5);
    expect(() => activate(game, arch, 1)).toThrow();
    lands(game, "Island", 4);
    check(game);
    toStep(game, "postcombat-main");
    expect(blessed(game)).toBe(true);
    const before = hand(game).length;
    activate(game, arch, 1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("ascend on a sorcery", () => {
  it("Secrets of the Golden City: the tenth permanent's blessing is had for its own draw", () => {
    const { game } = table();
    lands(game, "Island", 9);
    const secrets = toHand(game, "Secrets of the Golden City");
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    cast(game, secrets);
    expect(blessed(game)).toBe(true);
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("with nine permanents it draws two and gives no blessing", () => {
    const { game } = table();
    lands(game, "Island", 9);
    const secrets = toHand(game, "Secrets of the Golden City");
    const before = hand(game).length;
    cast(game, secrets);
    expect(blessed(game)).toBe(false);
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});
