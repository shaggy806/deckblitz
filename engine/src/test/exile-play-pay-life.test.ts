/**
 * Valgavoth, Terror Eater:
 *   - "If a card you didn't control would be put into an opponent's graveyard
 *     from anywhere, exile it instead": the graveyard-exile replacement filtered
 *     `{ ownedBy: "opponent", controlledBy: "opponent" }` — a card off the
 *     battlefield and the stack is its owner's to control (rule 108.4a) — and
 *     `linked` (rule 607.2b);
 *   - "During your turn, you may play cards exiled with Valgavoth. If you cast a
 *     spell this way, pay life equal to its mana value rather than pay its mana
 *     cost": a `playFromExile` static's `payLifeManaValue`, an alternative cost
 *     (rule 118.9) and the only one allowed — unless another permission also
 *     reaches the card.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, controller, destroy, graveyard, lands, life, ref, settle, spawn, table, toExile, toHand, toLibrary, toStep, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

const valgavoth = (game: Game): ObjectId => spawn(game, "Valgavoth, Terror Eater");
// Bob discards his whole hand (the card the test put there among them).

describe("Valgavoth, Terror Eater's replacement", () => {
  it("exiles with it an opponent's dying creature, discarded card and milled card", () => {
    const { game } = table();
    const v = valgavoth(game);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    const discarded = toHand(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "discard", target: "each-opponent", amount: 20 }, []);
    settle(game);
    const milled = toLibrary(game, "Llanowar Elves", B);
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 1 }, []);
    settle(game);
    for (const card of [bears, discarded, milled]) {
      expect(zone(game, card)).toBe("exile");
      expect(game.state.objects[card].exiledWith?.source).toBe(v);
    }
  });

  it("lets through its controller's own cards, an opponent's permanent its controller controls, and a token", () => {
    const { game } = table();
    valgavoth(game);
    const mine = spawn(game, "Grizzly Bears", A);
    destroy(game, mine);
    expect(zone(game, mine)).toBe("graveyard");
    const stolen = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    expect(controller(game, stolen)).toBe(A);
    destroy(game, stolen);
    expect(zone(game, stolen)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(stolen);
  });
});

describe("Valgavoth, Terror Eater's permission", () => {
  const exiledWith = () => {
    const t = table();
    const v = valgavoth(t.game);
    const bears = spawn(t.game, "Grizzly Bears", B);
    destroy(t.game, bears);
    return { ...t, v, bears };
  };

  it("casts a card exiled with it for life equal to its mana value, and no other way", () => {
    const { game, bears } = exiledWith();
    lands(game, "Forest", 2);
    const [offer, ...rest] = offers(game, bears);
    expect(rest).toEqual([]);
    expect(offer.via).toBe("impulse");
    expect(offer.altCost).toBe(true);
    expect(offer.altCostText).toBe("pay 2 life");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "impulse" })).not.toBeNull();
    cast(game, bears, { targets: [], via: "impulse", altCost: true });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(life(game, A)).toBe(18);
    // No mana was spent.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped)).toEqual([]);
  });

  it("plays a land exiled with it, for nothing", () => {
    const { game } = table();
    valgavoth(game);
    const forest = toHand(game, "Forest", B);
    game.debugApplyEffect(A, { kind: "discard", target: "each-opponent", amount: 20 }, []);
    settle(game);
    expect(zone(game, forest)).toBe("exile");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === forest)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
  });

  it("only during its controller's turn, and not a card exiled some other way", () => {
    const { game, bears } = exiledWith();
    const other = toExile(game, "Grizzly Bears", B);
    expect(offers(game, other)).toEqual([]);
    toStep(game, "precombat-main", B);
    expect(offers(game, bears)).toEqual([]);
  });

  it("a card its controller cast this way and that's countered goes to its owner's graveyard: they controlled it", () => {
    const { game } = table();
    valgavoth(game);
    const giant = toHand(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "discard", target: "each-opponent", amount: 20 }, []);
    settle(game);
    cast(game, giant, { targets: [], via: "impulse", altCost: true, settle: false });
    expect(life(game, A)).toBe(16);
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(giant)]);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(giant);
  });
});
