/**
 * `WardCost.waterbend` — "Ward—Waterbend {4}" (The Unagi of Kyoshi Island):
 * the targeting player may tap their untapped artifacts and creatures for the
 * {4} (rule 701.67a), as an "unless you waterbend" `choose-modes` does; one
 * who can't pay it even so has the spell countered unasked.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { A, B, cast, hand, lands, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";

type ModesOffer = Extract<LegalAction, { kind: "choose-modes" }>;
const offerFor = (game: Game): ModesOffer | undefined =>
  game.legalActions(B).find((a): a is ModesOffer => a.kind === "choose-modes");

describe("The Unagi of Kyoshi Island", () => {
  it("Bob pays the ward by tapping four creatures and artifacts, and his spell resolves", () => {
    const { game, b } = table();
    const unagi = spawn(game, "The Unagi of Kyoshi Island");
    const tappers = [
      spawn(game, "Grizzly Bears", B),
      spawn(game, "Grizzly Bears", B),
      spawn(game, "Darksteel Relic", B),
      spawn(game, "Ornithopter", B),
    ];
    lands(game, "Mountain", 1, B);
    pickTargets(b, unagi);
    game.state.priority.holder = B;
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(unagi)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.zones.shared.stack.length === 0);
    const offer = offerFor(game);
    expect(offer?.waterbend?.max).toBe(4);
    expect(offer?.waterbend?.choices).toEqual(expect.arrayContaining(tappers));
    game.dispatch({ type: "choose-modes", player: B, modes: [0], waterbend: tappers });
    settle(game);
    expect(tappers.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(game.state.objects[unagi].damageMarked).toBe(2);
  });

  it("with nothing to tap and no mana, the spell is countered", () => {
    const { game, b } = table();
    const unagi = spawn(game, "The Unagi of Kyoshi Island");
    lands(game, "Mountain", 1, B);
    pickTargets(b, unagi);
    game.state.priority.holder = B;
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(unagi)] });
    expect(zone(game, shock)).toBe("graveyard");
    expect(game.state.objects[unagi].damageMarked).toBe(0);
  });

  it("an opponent's second draw each turn draws Alice two", () => {
    const { game } = table();
    spawn(game, "The Unagi of Kyoshi Island");
    const before = hand(game, A).length;
    game.debugApplyEffect(B, { kind: "draw", amount: 2 });
    settle(game);
    expect(hand(game, A).length).toBe(before + 2);
  });
});
