/**
 * Assist (rule 702.132a): "If the total cost to cast a spell with assist
 * includes a generic mana component, before you activate mana abilities
 * while casting it, you may choose another player. … Before you begin to pay
 * the total cost of the spell, the player you chose may pay for any amount of
 * the generic mana in the spell's total cost."
 *
 * The cast names that player (`assist`, echoed from an assist offer); the
 * cast then waits on their `choose-number` (0 up to all their mana pays), and
 * the caster pays the rest — or the cast is reversed when they can't (rule
 * 733.1), the caster keeping priority (733.2). Proved on Charging Binox,
 * Gang Up ({X}) and Out of Bounds (an instant).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { HeuristicBotController, RandomController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { viewFor } from "../view.js";
import { A, B, C, cast, hand, lands, named, ref, settle, spawn, table, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const castOffers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

const tappedCount = (game: Game, ids: readonly ObjectId[]): number =>
  ids.filter((id) => game.state.objects[id].tapped).length;

const answer = (game: Game, player: PlayerId, number: number): void => {
  const why = game.canDispatch({ type: "choose-number", player, number });
  if (why !== null) throw new Error(why);
  game.dispatch({ type: "choose-number", player, number });
};

const eventsOf = (game: Game, type: string) => game.state.eventLog.filter((e) => e.type === type);

describe("assist (rule 702.132a)", () => {
  it("offers an assist variant per player whose mana could help, castable only with their help", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 4);
    lands(game, "Island", 4, B);
    // Carol has nothing untapped: no variant asks her.
    lands(game, "Swamp", 2, C).forEach((id) => (game.state.objects[id].tapped = true));
    const binox = toHand(game, "Charging Binox");
    const offers = castOffers(game, binox);
    // Four Forests alone can't pay {7}{G}; with Bob's four Islands they can.
    expect(offers.map((o) => o.assist)).toEqual([B]);
    expect(offers[0].assistMax).toBe(4);
    // Without naming him, the cast is refused.
    expect(game.canDispatch({ type: "cast-spell", player: A, card: binox, targets: [] })).not.toBeNull();
  });

  it("asks the chosen player, who pays part of the generic mana; the caster pays the rest", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 4);
    const islands = lands(game, "Island", 5, B);
    const binox = toHand(game, "Charging Binox");
    cast(game, binox, { assist: B, settle: false });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-number");
    if (awaiting?.kind !== "choose-number") return;
    expect(awaiting.player).toBe(B);
    expect(awaiting.min).toBe(0);
    // Up to all of the generic he can pay ({5} of {7}); Alice can pay {3}
    // and the {G}, so he must pay at least 4.
    expect(awaiting.max).toBe(5);
    expect(awaiting.assist?.need).toBe(4);
    expect(eventsOf(game, "assist-requested")).toHaveLength(1);
    // The spell being cast is shown to everyone while he decides (601.2a).
    expect(viewFor(game.state, game.registry, B).objects[binox]?.cardName).toBe("Charging Binox");
    // Nothing is paid yet.
    expect(tappedCount(game, [...forests, ...islands])).toBe(0);
    answer(game, B, 4);
    expect(zone(game, binox)).toBe("stack");
    expect(tappedCount(game, islands)).toBe(4);
    expect(tappedCount(game, forests)).toBe(4);
    // All of it mana spent to cast it, the helper's colours included.
    expect(game.state.objects[binox].manaSpent).toBe(8);
    expect(game.state.objects[binox].manaSpentColors).toEqual(["U", "G"]);
    // The caster gets priority after casting (rule 601.2i).
    expect(game.state.priority.holder).toBe(A);
    settle(game);
    expect(zone(game, binox)).toBe("battlefield");
    expect(game.state.objects[binox].controller).toBe(A);
  });

  it("reverses the whole cast when the helper pays too little for the caster to pay the rest (rule 733.1)", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 4);
    const islands = lands(game, "Island", 5, B);
    const binox = toHand(game, "Charging Binox");
    cast(game, binox, { assist: B, settle: false });
    answer(game, B, 2);
    expect(eventsOf(game, "cast-reversed")).toHaveLength(1);
    expect(hand(game)).toContain(binox);
    // No payment stands — neither player's mana.
    expect(tappedCount(game, [...forests, ...islands])).toBe(0);
    // The caster keeps priority (733.2) and may cast it again.
    expect(game.state.awaiting).toBeNull();
    expect(game.state.priority.holder).toBe(A);
    expect(castOffers(game, binox).map((o) => o.assist)).toEqual([B]);
  });

  it("lets the helper pay nothing when the caster can pay it all, and no more than the generic", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 8);
    const islands = lands(game, "Island", 9, B);
    const binox = toHand(game, "Charging Binox");
    // Both ways are offered: alone first, then asking Bob.
    expect(castOffers(game, binox).map((o) => o.assist)).toEqual([undefined, B]);
    cast(game, binox, { assist: B, settle: false });
    // Only the generic {7} is his to pay (the rulings: never the {G}).
    expect(game.canDispatch({ type: "choose-number", player: B, number: 8 })).not.toBeNull();
    answer(game, B, 0);
    expect(zone(game, binox)).toBe("stack");
    expect(tappedCount(game, forests)).toBe(8);
    expect(tappedCount(game, islands)).toBe(0);
  });

  it("v1 answers an assist request by paying nothing", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    lands(game, "Island", 7, B);
    const binox = toHand(game, "Charging Binox");
    cast(game, binox, { assist: B, settle: false });
    const bot = new HeuristicBotController(B, game.registry);
    const view = { player: B, state: game.state, legalActions: () => game.legalActions(B) };
    const offer = game.legalActions(B).find((a) => a.kind === "choose-number");
    if (offer?.kind !== "choose-number") throw new Error("no offer");
    expect(bot.chooseNumber(view as never, offer)).toBe(0);
  });

  it("v2 answers an assist request legally, and never asks for help itself", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 5, B);
    const binox = toHand(game, "Charging Binox");
    // Castable only with Bob's help: v2 doesn't ask.
    const asker = new EvalBotController(A, game.registry, { maxSimulations: 8 });
    const own = asker.act({ state: game.state, player: A, legalActions: () => game.legalActions(A) });
    expect(own).not.toMatchObject({ type: "cast-spell", card: binox });
    cast(game, binox, { assist: B, settle: false });
    const helper = new EvalBotController(B, game.registry, { maxSimulations: 8 });
    const answerOf = helper.act({ state: game.state, player: B, legalActions: () => game.legalActions(B) });
    expect(answerOf.type).toBe("choose-number");
    expect(game.canDispatch(answerOf)).toBeNull();
    game.dispatch(answerOf);
    expect(game.state.awaiting).toBeNull();
  });

  it("the fuzzer's controller casts an assist variant naming its helper", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 5, B);
    const binox = toHand(game, "Charging Binox");
    const offers = castOffers(game, binox);
    const view = { player: A, state: game.state, legalActions: () => offers };
    const action = new RandomController(A, () => 0).act(view as never);
    expect(action).toMatchObject({ type: "cast-spell", card: binox, assist: B });
    game.dispatch(action);
    expect(game.state.awaiting?.player).toBe(B);
  });

  it("helps pay X: the most X with help, the generic paid by the helper, and none at X=0", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 2);
    const islands = lands(game, "Island", 3, B);
    const ogre = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Gray Ogre", B);
    const thopter = spawn(game, "Ornithopter", B);
    const gangUp = toHand(game, "Gang Up");
    const offers = castOffers(game, gangUp);
    // Offered X by X, as the target's power reads X. Alice alone reaches
    // X=1; with Bob's three Islands, X=4. At X=0 there's no generic for him
    // to pay, so no variant asks him then.
    const xs = (assist?: PlayerId) => offers.filter((o) => o.assist === assist).map((o) => o.xCost?.maxX);
    expect(xs()).toEqual([0, 1]);
    expect(xs(B)).toEqual([1, 2, 3, 4]);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: gangUp, targets: [ref(thopter)], xValue: 0, assist: B }),
    ).toMatch(/no generic mana/);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: gangUp, targets: [ref(thopter)], xValue: 0 })).toBeNull();
    // Craw Wurm is a 6/4: X=4 doesn't reach it.
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: gangUp, targets: [ref(ogre)], xValue: 4, assist: B }),
    ).not.toBeNull();
    cast(game, gangUp, { targets: [ref(bears)], x: 3, assist: B, settle: false });
    answer(game, B, 3);
    expect(tappedCount(game, islands)).toBe(3);
    // The {B} alone is Alice's.
    expect(tappedCount(game, swamps)).toBe(1);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("asks any other player at instant speed, and the caster keeps priority after", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    const islands = lands(game, "Island", 3, C);
    const bears = toHand(game, "Grizzly Bears");
    const outOfBounds = toHand(game, "Out of Bounds");
    cast(game, bears, { settle: false });
    expect(game.state.priority.holder).toBe(A);
    // One Island left can't pay {3}{U}; Carol can pay the {3}.
    const offers = castOffers(game, outOfBounds);
    expect(offers.map((o) => o.assist)).toEqual([C]);
    cast(game, outOfBounds, { targets: [ref(bears)], assist: C, settle: false });
    expect(game.state.awaiting?.player).toBe(C);
    answer(game, C, 3);
    expect(tappedCount(game, islands)).toBe(3);
    expect(zone(game, outOfBounds)).toBe("stack");
    expect(game.state.priority.holder).toBe(A);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });

  it("refuses assist on a spell without it, and naming the caster", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Forest", 4, B);
    const bears = toHand(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], assist: B })).toMatch(
      /doesn't have assist/,
    );
    const binox = toHand(game, "Charging Binox");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: binox, targets: [], assist: A })).not.toBeNull();
  });
});
