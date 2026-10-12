/**
 * Airbend (rule 701.65a): "To airbend one or more permanents and/or spells,
 * that player exiles those objects. For each card exiled this way, for as long
 * as it remains exiled, its owner may cast it by paying {2} rather than paying
 * its mana cost." The rulings: an alternative cost, so no other one goes with
 * it but additional costs (kicker) are paid on top; X is 0; a token exiled
 * ceases to exist; a land can't be played from there.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const airbendOffers = (game: Game, card: ObjectId, player: PlayerId = B) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "airbend");

const castOffers = (game: Game, card: ObjectId, player: PlayerId) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);

/** Alice airbends `target` with Airbending Lesson. */
const airbend = (game: Game, target: ObjectId): void => {
  lands(game, "Plains", 3);
  cast(game, toHand(game, "Airbending Lesson"), { targets: [ref(target)] });
};

describe("airbend", () => {
  it("exiles the permanent, and its owner — not the airbender — may cast it for {2}", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    airbend(game, giant);
    expect(zone(game, giant)).toBe("exile");
    expect(game.state.objects[giant].airbended).toBe(true);
    expect(airbendOffers(game, giant, A)).toHaveLength(0);
    nextTurn(game);
    // Two colorless pays for a {3}{R} creature.
    lands(game, "Wastes", 2, B);
    const offers = airbendOffers(game, giant);
    expect(offers).toHaveLength(1);
    expect(castOffers(game, giant, B)).toHaveLength(1);
    cast(game, giant, { player: B, via: "airbend" });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(B);
    expect(game.state.objects[giant].airbended).toBeUndefined();
  });

  it("is a normal cast: a creature waits for its owner's main phase", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 2, B);
    airbend(game, giant);
    // Alice's turn: bob may not cast a creature at instant speed.
    expect(airbendOffers(game, giant)).toHaveLength(0);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: giant, targets: [], via: "airbend" })).not.toBeNull();
  });

  it("a token airbended ceases to exist, with nothing to cast", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Raise the Alarm"));
    const soldier = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken)!;
    airbend(game, soldier);
    expect(game.state.objects[soldier]?.zone ?? "gone").not.toBe("battlefield");
    expect(game.state.zones.shared.exile.filter((id) => game.state.objects[id]?.airbended === true)).toHaveLength(0);
  });

  it("a land card airbended can't be played from exile", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Avatar's Wrath"), { targets: [null] });
    expect(zone(game, arbor)).toBe("exile");
    expect(game.state.objects[arbor].airbended).toBe(true);
    nextTurn(game);
    expect(
      game.legalActions(B).filter((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === arbor),
    ).toHaveLength(0);
  });

  it("X is 0: cast for {2}, an X creature enters with no counters", () => {
    const { game } = table();
    const endless = spawn(game, "Endless One", B);
    game.state.objects[endless].counters["+1/+1"] = 3;
    airbend(game, endless);
    nextTurn(game);
    lands(game, "Wastes", 5, B);
    const [offer] = airbendOffers(game, endless);
    expect(offer).toBeDefined();
    expect(offer.kind === "cast-spell" && offer.xCost).toBeFalsy();
    cast(game, endless, { player: B, via: "airbend", x: 3 });
    // A 0/0 with no counters: put into the graveyard.
    expect(graveyard(game, B)).toContain(endless);
  });

  it("additional costs are paid on top (multikicker), alternative costs aren't offered (evoke)", () => {
    const { game } = table();
    const chalice = spawn(game, "Everflowing Chalice", B);
    const mulldrifter = spawn(game, "Mulldrifter", B);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Airbending Lesson"), { targets: [ref(chalice)] });
    cast(game, toHand(game, "Airbending Lesson"), { targets: [ref(mulldrifter)] });
    nextTurn(game);
    lands(game, "Wastes", 4, B);
    // Mulldrifter: the {2} cast only — no evoke beside it (rule 118.9a).
    const drifts = castOffers(game, mulldrifter, B);
    expect(drifts).toHaveLength(1);
    expect(drifts[0]).toMatchObject({ via: "airbend" });
    expect(drifts[0].kind === "cast-spell" && drifts[0].evoke).toBeFalsy();
    expect(
      game.canDispatch({ type: "cast-spell", player: B, card: mulldrifter, targets: [], via: "airbend", evoke: true }),
    ).not.toBeNull();
    // Chalice kicked once: {2} + {2}.
    const kicked = airbendOffers(game, chalice).filter((a) => a.kind === "cast-spell" && a.kicked === true);
    expect(kicked.length).toBeGreaterThan(0);
    cast(game, chalice, { player: B, via: "airbend", kicked: true, kickCount: 1 });
    expect(zone(game, chalice)).toBe("battlefield");
    expect(counters(game, chalice, "charge")).toBe(1);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === B && game.state.objects[id].tapped)).toHaveLength(4);
  });

  it("ends when the card leaves exile", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    airbend(game, bears);
    expect(game.state.objects[bears].airbended).toBe(true);
    game.debugMove(bears, "hand");
    expect(hand(game, B)).toContain(bears);
    expect(game.state.objects[bears].airbended).toBeUndefined();
  });

  it("airbending your own permanent lets you recast it for {2}", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    airbend(game, bears);
    lands(game, "Wastes", 2);
    expect(airbendOffers(game, bears, A)).toHaveLength(1);
    cast(game, bears, { via: "airbend" });
    expect(zone(game, bears)).toBe("battlefield");
    settle(game);
  });
});
