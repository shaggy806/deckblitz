/**
 * "For each player, choose friend or foe" (Battlebond): one question per
 * player, all the caster's, as the spell resolves, through the same `vote`
 * and `choose-modes` the other choices use; the scopes `"each-friend"` and
 * `"each-foe"` read the answers.
 */

import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { HeuristicBotController } from "../controller.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, D, cast, graveyard, hand, lands, life, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

/** The caster answers friend for `friends`, foe for the rest; returns who was asked about, in order. */
function answering(seat: ScriptedController, friends: readonly string[]): string[] {
  const asked: string[] = [];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    const about = texts[0].split(":")[0].toLowerCase();
    asked.push(about);
    return [friends.includes(about) ? 0 : 1];
  };
  return asked;
}

describe("friend or foe", () => {
  it("asks the caster once per player, starting with the caster, in a four-player game", () => {
    const { game, a } = table({ players: 4 });
    lands(game, "Swamp", 3);
    const asked = answering(a, [A]);
    cast(game, toHand(game, "Virtus's Maneuver"));
    expect(asked).toEqual([A, B, C, D]);
  });

  it("each friend and foe text names the player, and only the two answers are offered", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const seen: string[][] = [];
    a.chooseModesFn = (_view, min, max, texts) => {
      expect([min, max]).toEqual([1, 1]);
      seen.push([...texts]);
      return [0];
    };
    cast(game, toHand(game, "Virtus's Maneuver"));
    expect(seen).toEqual([
      ["Alice: friend", "Alice: foe"],
      ["Bob: friend", "Bob: foe"],
    ]);
  });

  it("Virtus's Maneuver: each friend returns a creature card, each foe sacrifices", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 3);
    const mine = toGraveyard(game, "Grizzly Bears");
    const hers = toGraveyard(game, "Hill Giant", C);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", C);
    const safe = spawn(game, "Hill Giant", A);
    answering(a, [A]);
    cast(game, toHand(game, "Virtus's Maneuver"));
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, hers)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, safe)).toBe("battlefield");
  });

  it("anyone may be a friend: an opponent gets the friend half, and you the foe half", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const yours = spawn(game, "Hill Giant", A);
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    answering(a, [B]);
    cast(game, toHand(game, "Virtus's Maneuver"));
    expect(zone(game, yours)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("hand");
  });

  it("Pir's Whim: a friend's land enters tapped; a foe loses an artifact or enchantment", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    answering(a, [A]);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Pir's Whim"));
    const fetched = game.state.zones.shared.battlefield.filter(
      (id) => game.state.objects[id].cardName === "Wastes" && game.state.objects[id].controller === A,
    );
    expect(fetched).toHaveLength(1);
    expect(game.state.objects[fetched[0]].tapped).toBe(true);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Khorvath's Fury: a friend discards the hand and draws one more; a foe's damage is that foe's own hand", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 5);
    toHand(game, "Hill Giant");
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", C);
    const bob = life(game, B);
    const carol = life(game, C);
    const handBob = hand(game, B).length;
    const handCarol = hand(game, C).length;
    const held = hand(game, A).length;
    answering(a, [A]);
    cast(game, toHand(game, "Khorvath's Fury"));
    expect(graveyard(game, A)).toHaveLength(held + 1); // the hand, and the Fury itself
    expect(hand(game, A)).toHaveLength(held + 1);
    expect(handBob).not.toBe(handCarol);
    expect(life(game, B)).toBe(bob - handBob);
    expect(life(game, C)).toBe(carol - handCarol);
  });

  it("Khorvath's Fury: each friend's count is that friend's own, and no friend is dealt damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    toHand(game, "Grizzly Bears", B);
    answering(a, [A, B]);
    const bob = life(game, B);
    const mine = hand(game, A).length;
    const handBob = hand(game, B).length;
    cast(game, toHand(game, "Khorvath's Fury"));
    expect(hand(game, A)).toHaveLength(mine + 1);
    expect(hand(game, B)).toHaveLength(handBob + 1);
    expect(life(game, B)).toBe(bob);
    expect(life(game, A)).toBe(20);
  });

  it("the bots: itself a friend, each opponent a foe", () => {
    for (const bot of [new HeuristicBotController(A, createDefaultRegistry()), new EvalBotController(A, createDefaultRegistry(), { horizon: "stack" })]) {
      const { game, a } = table({ players: 3 });
      lands(game, "Swamp", 3);
      toGraveyard(game, "Grizzly Bears");
      spawn(game, "Hill Giant", B);
      spawn(game, "Hill Giant", C);
      const answers: string[] = [];
      a.chooseModesFn = (view, min, max, texts) => {
        const modes = bot.chooseModes(view, min, max, texts);
        answers.push(texts[modes[0]]);
        return modes;
      };
      cast(game, toHand(game, "Virtus's Maneuver"));
      expect(answers).toEqual(["Alice: friend", "Bob: foe", "Carol: foe"]);
    }
  });

  it("everyone a foe: friends' half does nothing", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const yours = toGraveyard(game, "Hill Giant", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    answering(a, []);
    cast(game, toHand(game, "Virtus's Maneuver"));
    expect(zone(game, yours)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
