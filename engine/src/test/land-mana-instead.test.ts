/**
 * A land tapped for mana producing another type instead (rules 106.12,
 * 614.1a): for a turn, its controller's own (Deep Water — a `player-effect`'s
 * `landManaInstead`), every land (Infernal Darkness) or every land of a type
 * (Reality Twist — `StaticAbility.landManaInstead`). The amount is kept; the
 * auto-payer and the offered activations see the new type.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, hand, spawn, table, toHand, nextTurn } from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string =>
  game.state.players[player].manaPool
    .map((u) => u.type)
    .sort()
    .join("");

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;
/** Taps a land for mana by hand, the way a player does. */
const tapForMana = (game: Game, land: ObjectId, player: PlayerId = A): void => {
  const offer = game
    .legalActions(player)
    .find((a): a is Activate => a.kind === "activate-ability" && a.source === land);
  if (offer === undefined) throw new Error("no mana ability offered");
  game.dispatch({
    type: "activate-ability",
    player,
    source: land,
    abilityIndex: offer.abilityIndex,
    targets: [],
    ...(offer.manaColors !== undefined ? { manaColors: offer.manaColors } : {}),
  });
};

describe("Deep Water", () => {
  it("for the turn, your lands tap for {U} — the auto-payer pays blue with a Forest", () => {
    const { game } = table();
    const water = spawn(game, "Deep Water");
    spawn(game, "Island");
    const forest = spawn(game, "Forest");
    const forest2 = spawn(game, "Forest");
    activate(game, water);
    // Island paid for the activation; Opt's {U} is paid by a Forest.
    const opt = toHand(game, "Opt");
    cast(game, opt);
    expect(hand(game)).not.toContain(opt);
    expect([forest, forest2].filter((id) => game.state.objects[id].tapped)).toHaveLength(1);
    const left = [forest, forest2].find((id) => !game.state.objects[id].tapped)!;
    tapForMana(game, left);
    expect(pool(game)).toBe("U");
  });

  it("only its controller's taps of their own lands, and only this turn", () => {
    const { game } = table();
    const water = spawn(game, "Deep Water");
    spawn(game, "Island");
    const bobs = spawn(game, "Forest", B);
    activate(game, water);
    nextTurn(game); // bob's
    tapForMana(game, bobs, B);
    expect(pool(game, B)).toBe("G");
    nextTurn(game); // alice's: the effect has ended
    const forest = spawn(game, "Forest");
    tapForMana(game, forest);
    expect(pool(game)).toBe("G");
  });
});

describe("a land produces another type, whoever taps it", () => {
  it("Infernal Darkness: every land's mana is {B}, the amount kept", () => {
    const { game } = table();
    spawn(game, "Infernal Darkness");
    const forest = spawn(game, "Forest");
    const temple = spawn(game, "Ancient Tomb");
    tapForMana(game, forest);
    tapForMana(game, temple);
    expect(pool(game)).toBe("BBB");
    nextTurn(game); // bob's lands too
    const bobs = spawn(game, "Island", B);
    tapForMana(game, bobs, B);
    expect(pool(game, B)).toBe("B");
  });

  it("Reality Twist: Plains make {R}, Forests {B}; an Island is untouched", () => {
    const { game } = table();
    spawn(game, "Reality Twist");
    tapForMana(game, spawn(game, "Plains"));
    tapForMana(game, spawn(game, "Forest"));
    tapForMana(game, spawn(game, "Island"));
    expect(pool(game)).toBe("BRU");
  });

  it("the offered activation names the new type", () => {
    const { game } = table();
    spawn(game, "Reality Twist");
    const mountain = spawn(game, "Mountain");
    const offer = game
      .legalActions(A)
      .find((a): a is Activate => a.kind === "activate-ability" && a.source === mountain);
    expect(offer).toBeDefined();
    tapForMana(game, mountain);
    expect(pool(game)).toBe("W");
  });
});
