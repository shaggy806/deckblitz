/**
 * Counting spells for a cast trigger.
 *
 * - The timing wrapper's `orLater`: "a spell **other than the first** spell
 *   they cast each turn" (Curse of Shaken Faith) is `nthEachTurn: 2,
 *   orLater: true`, counted per caster, spells cast before the source
 *   arrived included. With `orCopy` the wrapper narrows the casts alone: a
 *   copy is never cast (rule 707.10), so "…or copies a spell" fires for every
 *   copy, and `who: "attached"` reads the copy's controller as the enchanted
 *   player.
 * - "The fourth spell **of a turn**" (Erayo, Soratami Ascendant): every
 *   player's spells together, a `whileCondition` (rule 603.1) counting them,
 *   as Nullstone Gargoyle's "the first noncreature spell of a turn".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { nameOf } from "../state.js";

import { A, B, cast, lands, life, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const bears = (game: Game, player: PlayerId, settleAfter = true): ObjectId => {
  const card = toHand(game, "Grizzly Bears", player);
  cast(game, card, { player, settle: settleAfter });
  return card;
};

const curse = (game: Game, on: PlayerId): ObjectId => {
  const card = toHand(game, "Curse of Shaken Faith");
  cast(game, card, { targets: [{ kind: "player", player: on }] });
  return card;
};

describe("Curse of Shaken Faith", () => {
  it("the enchanted player's second spell and every later one, not the first", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    curse(game, B);
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 6, B);
    bears(game, B);
    expect(life(game, B)).toBe(20);
    bears(game, B);
    expect(life(game, B)).toBe(18);
    bears(game, B);
    expect(life(game, B)).toBe(16);
  });

  it("another player's spells don't count", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 4);
    curse(game, B);
    bears(game, A);
    bears(game, A);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("a spell cast before it arrived counts: the Curse itself was its caster's first", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    curse(game, A);
    expect(life(game, A)).toBe(20);
    bears(game, A);
    expect(life(game, A)).toBe(18);
  });

  it("every copy the enchanted player makes, even beside their first spell", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    curse(game, B);
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 2, B);
    const first = bears(game, B, false);
    game.debugApplyEffect(B, { kind: "copy-spell", target: 0 }, [{ kind: "object", object: first }]);
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("Erayo, Soratami Ascendant", () => {
  it("flips on the fourth spell of a turn, every player's counted together", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    lands(game, "Island", 1, B);
    const erayo = spawn(game, "Erayo, Soratami Ascendant");
    bears(game, A);
    bears(game, A);
    expect(game.state.objects[erayo].flipped).toBeUndefined();
    // Alice's third, and Bob's Opt in response: the turn's fourth.
    const third = toHand(game, "Grizzly Bears");
    cast(game, third, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    const opt = toHand(game, "Opt", B);
    cast(game, opt, { player: B });
    expect(game.state.objects[erayo].flipped).toBe(true);
    expect(nameOf(game.state.objects[erayo])).toBe("Erayo's Essence");
  });

  it("not on the third, nor the fifth: exactly the fourth", () => {
    const { game } = table();
    lands(game, "Forest", 10);
    const erayo = spawn(game, "Erayo, Soratami Ascendant");
    bears(game, A);
    bears(game, A);
    bears(game, A);
    expect(game.state.objects[erayo].flipped).toBeUndefined();
    bears(game, A);
    expect(game.state.objects[erayo].flipped).toBe(true);
  });

  it("Erayo's Essence counters each opponent's first spell each turn, not their second", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const erayo = spawn(game, "Erayo, Soratami Ascendant");
    for (let i = 0; i < 4; i += 1) bears(game, A);
    expect(game.state.objects[erayo].flipped).toBe(true);
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 4, B);
    const first = bears(game, B);
    expect(zone(game, first)).toBe("graveyard");
    const second = bears(game, B);
    expect(zone(game, second)).toBe("battlefield");
  });
});
