/**
 * "Pay enchanted creature's mana cost: … Only the controller of the enchanted
 * creature may activate this ability" (Merseine): `AbilityCost.manaCostOf:
 * "attached"` reads the enchanted permanent's mana cost as the ability is
 * offered and activated (601.2f via 602.2b), an {X} in it 0 (rule 107.3h),
 * and a permanent with none leaves the cost unpayable (118.6);
 * `onlyBy: "attached-controller"` is 602.1b's "only [a player]".
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, counters, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

const offered = (game: Game, player: PlayerId, source: ObjectId): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === source);

/** Alice casts Merseine on Bob's `creature`; the Aura's id. */
function enchant(game: Game, creature: ObjectId): ObjectId {
  lands(game, "Island", 4);
  const merseine = toHand(game, "Merseine");
  cast(game, merseine, { targets: [ref(creature)] });
  expect(game.state.objects[merseine].attachedTo).toBe(creature);
  return merseine;
}

describe("Merseine", () => {
  it("enters with three net counters and keeps the creature tapped while it has one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const merseine = enchant(game, bears);
    expect(counters(game, merseine, "net")).toBe(3);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("only the enchanted creature's controller may activate it, paying that creature's mana cost", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const merseine = enchant(game, bears);
    // Alice controls Merseine, but the ability isn't hers (602.1b).
    expect(offered(game, A, merseine)).toBe(false);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: merseine, abilityIndex: 0, targets: [] }),
    ).toMatch(/only one player may activate/);
    nextTurn(game);
    // Bob, with only {G}, can't pay {1}{G}.
    lands(game, "Forest", 1, B);
    expect(offered(game, B, merseine)).toBe(false);
    lands(game, "Forest", 1, B);
    expect(offered(game, B, merseine)).toBe(true);
    activate(game, merseine, 0, { player: B });
    expect(counters(game, merseine, "net")).toBe(2);
    expect(game.state.objects[merseine].controller).toBe(A);
  });

  it("a creature's {X} is paid as 0 (107.3h)", () => {
    const { game } = table();
    const endless = spawn(game, "Endless One", B);
    // A 0/0 on the battlefield: give it counters to live.
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(endless)]);
    const merseine = enchant(game, endless);
    nextTurn(game);
    // {X} with X 0: nothing to pay, so Bob may activate it with no lands.
    expect(offered(game, B, merseine)).toBe(true);
    activate(game, merseine, 0, { player: B });
    expect(counters(game, merseine, "net")).toBe(2);
  });

  it("a creature with no mana cost leaves the cost unpayable (118.6)", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor", B);
    const merseine = enchant(game, arbor);
    nextTurn(game);
    lands(game, "Forest", 5, B);
    expect(offered(game, B, merseine)).toBe(false);
    expect(
      game.canDispatch({ type: "activate-ability", player: B, source: merseine, abilityIndex: 0, targets: [] }),
    ).toMatch(/can't be paid/);
  });

  it("with no net counter left, the creature untaps as usual", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const merseine = enchant(game, bears);
    nextTurn(game);
    lands(game, "Forest", 6, B);
    for (let i = 0; i < 3; i += 1) activate(game, merseine, 0, { player: B });
    expect(counters(game, merseine, "net")).toBe(0);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});
