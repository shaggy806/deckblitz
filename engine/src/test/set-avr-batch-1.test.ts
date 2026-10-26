/**
 * Avacyn Restored batch 1 (B182) — the miracle cards beyond `miracle.test.ts`'s
 * Thunderous Wrath and Bonfire: a self-exiling sorcery, X in a miracle cost
 * making tokens, a miracle creature's own enters trigger.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, counters, ref, spawn, toHand, hand, lands, named, settle, table, toGraveyard, toLibrary, tokensNamed, zone } from "./harness.js";

/** The seat casts what its miracle offers, with these targets and this X. */
function castMiracle(seat: ScriptedController, targets: readonly ObjectId[] = [], xValue?: number): void {
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts[0]!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: way.card,
      targets: targets.map((object) => ({ kind: "object" as const, object })),
      via: way.via,
      ...(xValue !== undefined ? { xValue } : {}),
    };
  };
}

const drawFirst = (game: Game, player: PlayerId = A): void => {
  game.state.players[player].cardsDrawnThisTurn = 0;
  game.debugApplyEffect(player, { kind: "draw", amount: 1 });
  settle(game);
};

describe("Avacyn Restored batch 1 — miracle cards, and the scoping fix", () => {
  it("Temporal Mastery for {1}{U}: an extra turn, and it's exiled", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const mastery = toLibrary(game, "Temporal Mastery");
    castMiracle(a);
    drawFirst(game);
    expect(zone(game, mastery)).toBe("exile");
    expect(game.state.extraTurns.length).toBe(1);
  });

  it("Entreat the Angels for {X}{W}{W} with X = 2: two 4/4 Angels", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    toLibrary(game, "Entreat the Angels");
    castMiracle(a, [], 2);
    drawFirst(game);
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(2);
  });

  it("Metamorphosis Fanatic for {1}{B} returns a creature card with a lifelink counter", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const fanatic = toLibrary(game, "Metamorphosis Fanatic");
    castMiracle(a);
    a.chooseTargetsFn = () => [{ kind: "object", object: bears }];
    drawFirst(game);
    expect(zone(game, fanatic)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "lifelink")).toBe(1);
    expect(hand(game)).not.toContain(fanatic);
    expect(named(game, "Metamorphosis Fanatic", A)).toHaveLength(1);
  });

  it("Chandra's Fury (M13) at a planeswalker deals 1 to each creature its controller controls", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const walker = spawn(game, "Ajani, Caller of the Pride", B);
    game.state.objects[walker].counters = { loyalty: 5 };
    const elf = spawn(game, "Llanowar Elves", B);
    const mine = spawn(game, "Llanowar Elves", A);
    cast(game, toHand(game, "Chandra's Fury"), { targets: [ref(walker)] });
    expect(game.state.objects[walker].counters?.loyalty).toBe(1);
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});
