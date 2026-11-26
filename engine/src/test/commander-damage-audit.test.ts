import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, C, cast, lands, ref, settle, table, toHand, toStep } from "./harness.js";

/**
 * A rules audit (2026-11-26): what counts as commander damage (rule
 * 903.10a) — combat damage dealt by a commander, whoever controls it, and
 * never by a copy of one, which isn't a commander (903.3).
 */
const KIKI = "Kiki-Jiki, Mirror Breaker";

/** Alice's commander, Kiki-Jiki, on the battlefield, able to attack. */
function kikiOut(players: 2 | 3 = 2): ReturnType<typeof table> & { kiki: ObjectId } {
  const t = table({ commanders: [KIKI], players });
  const kiki = t.game.state.zones.shared.command.find((id) => t.game.state.objects[id].cardName === KIKI)!;
  expect(t.game.debugMove(kiki, "battlefield")).toBe(true);
  t.game.state.objects[kiki].summoningSick = false;
  settle(t.game);
  return { ...t, kiki };
}

const taken = (game: Game, player: typeof B): Record<string, number> => game.state.players[player].commanderDamageTaken;

describe("commander damage, audited", () => {
  it("the commander's own combat damage counts (control)", () => {
    const { game, a, kiki } = kikiOut();
    a.declareAttackersFn = () => [{ attacker: kiki, defender: B }];
    toStep(game, "postcombat-main");
    expect(taken(game, B)).toEqual({ [kiki]: 2 });
  });

  it("a Clone of a commander isn't a commander: its damage isn't commander damage (rules 903.3, 903.10a)", () => {
    const { game, a, kiki } = kikiOut();
    // Bob holds alice's Kiki-Jiki, so her Clone of it isn't a second legend of hers.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(kiki)]);
    a.chooseCopyFn = (_view, _source, options) => (options.includes(kiki) ? kiki : null);
    lands(game, "Island", 4);
    const clone = toHand(game, "Clone");
    cast(game, clone);
    settle(game);
    expect(game.state.objects[clone].isCommander).toBe(false);
    game.state.objects[clone].summoningSick = false;
    a.declareAttackersFn = () => [{ attacker: clone, defender: B }];
    const before = game.state.players[B].life;
    toStep(game, "postcombat-main");
    expect(game.state.players[B].life).toBe(before - 2);
    expect(taken(game, B)).toEqual({});
  });

  it("a commander another player has stolen still deals commander damage, counted to that commander (rule 903.10a)", () => {
    const { game, b, kiki } = kikiOut(3);
    // Bob takes Kiki-Jiki and attacks carol with it on his turn.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(kiki)]);
    expect(game.state.objects[kiki].controller).toBe(B);
    toStep(game, "end");
    toStep(game, "precombat-main", B);
    b.declareAttackersFn = () => [{ attacker: kiki, defender: C }];
    toStep(game, "postcombat-main", B);
    expect(taken(game, C)).toEqual({ [kiki]: 2 });
  });
});
