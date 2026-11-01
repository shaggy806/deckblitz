/**
 * Statics acting on a player: the player a Curse enchants, as what they control, the damage
 * dealt to them and the life they gain, and the inverse of Platinum Angel (rules 104.2a, 104.3a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  cast,
  destroy,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

/** A Curse cast by alice on `player`, with the mana for it. */
function curse(game: Game, name: string, player: PlayerId): void {
  const swampy = name === "Grievous Wound" || name === "Curse of Death's Hold";
  lands(game, "Wastes", 3);
  lands(game, swampy ? "Swamp" : "Mountain", 2);
  cast(game, toHand(game, name), { targets: [ref(player)] });
}

describe("what the enchanted player controls (controlledBy)", () => {
  it("shrinks that player's creatures and nobody else's, whoever controls the Curse", () => {
    const { game } = table({ players: 3 });
    const bobBears = spawn(game, "Grizzly Bears", B);
    const carolBears = spawn(game, "Grizzly Bears", C);
    const aliceBears = spawn(game, "Grizzly Bears", A);
    curse(game, "Curse of Death's Hold", B);
    expect(pt(game, bobBears)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, carolBears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, aliceBears)).toEqual({ power: 2, toughness: 2 });
  });

  it("reaches a creature arriving later, and stops with the Curse", () => {
    const { game } = table();
    curse(game, "Curse of Death's Hold", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    destroy(game, named(game, "Curse of Death's Hold")[0]);
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("sets base P/T and takes creature types, past a legendary creature (Curse of Conformity)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const legend = spawn(game, "Isamaru, Hound of Konda", B);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Curse of Conformity"), { targets: [ref(B)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, bears)).not.toContain("Bear");
    expect(types(game, bears)).toContain("creature");
    expect(pt(game, legend)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, legend)).toContain("Dog");
  });

  it("makes that player's creatures attack, and only theirs", () => {
    const attackOffer = (cursed: PlayerId) => {
      const { game } = table();
      const bears = spawn(game, "Grizzly Bears", A, { sick: false });
      curse(game, "Curse of the Nightly Hunt", cursed);
      game.dispatch({ type: "pass-priority", player: A });
      game.advanceUntil((s) => s.awaiting?.kind === "attackers");
      const offer = game.legalActions(A).find((o) => o.kind === "declare-attackers");
      return { bears, must: offer?.kind === "declare-attackers" ? offer.mustAttack : undefined };
    };
    const onAlice = attackOffer(A);
    expect(onAlice.must).toEqual([onAlice.bears]);
    expect(attackOffer(B).must ?? []).toEqual([]);
  });
});

describe("damage to the enchanted player (Curse of Bloodletting)", () => {
  it("doubles what they're dealt, not what anyone else is", () => {
    const { game } = table({ players: 3 });
    curse(game, "Curse of Bloodletting", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(C)] });
    expect(life(game, C)).toBe(17);
  });
});

describe("Grievous Wound", () => {
  it("stops that player gaining life, and not anyone else", () => {
    const { game } = table({ players: 3 });
    curse(game, "Grievous Wound", B);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 3 });
    expect(life(game, B)).toBe(20);
    game.debugApplyEffect(C, { kind: "gain-life", amount: 3 });
    expect(life(game, C)).toBe(23);
  });

  it("has them lose half their life, rounded up, when dealt damage", () => {
    const { game } = table({ players: 3, life: 21 });
    curse(game, "Grievous Wound", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    // 21 - 3 = 18, then half of 18.
    expect(life(game, B)).toBe(9);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(C)] });
    expect(life(game, C)).toBe(18);
  });

  it("rounds an odd life total up", () => {
    const { game } = table({ life: 20 });
    curse(game, "Grievous Wound", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    // 20 - 2 = 18, half is 9. Then 18 less 9: an odd one next.
    expect(life(game, B)).toBe(9);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    // 9 - 2 = 7, half rounded up is 4.
    expect(life(game, B)).toBe(3);
  });
});

describe("Abyssal Persecutor", () => {
  it("keeps an opponent at 0 life in the game, until it leaves", () => {
    const { game } = table();
    const demon = spawn(game, "Abyssal Persecutor");
    game.state.players[B].life = 0;
    toStep(game, "postcombat-main");
    expect(game.state.players[B].hasLost).toBe(false);
    destroy(game, demon);
    toStep(game, "end");
    expect(game.state.players[B].hasLost).toBe(true);
    expect(zone(game, demon)).toBe("graveyard");
  });

  it("doesn't save its own controller", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Abyssal Persecutor");
    game.state.players[A].life = 0;
    toStep(game, "postcombat-main", B);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("stops its controller winning by an effect, and not an opponent", () => {
    const { game } = table();
    spawn(game, "Abyssal Persecutor");
    game.debugApplyEffect(A, { kind: "win-game" });
    expect(game.state.result.over).toBe(false);
    game.debugApplyEffect(B, { kind: "win-game" });
    expect(game.state.result).toMatchObject({ over: true, winner: B });
  });

  it("stops an opponent losing by an effect, and not by conceding (rule 104.3a)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Abyssal Persecutor");
    game.debugApplyEffect(B, { kind: "lose-game" });
    expect(game.state.players[B].hasLost).toBe(false);
    game.concede(B);
    expect(game.state.players[B].hasLost).toBe(true);
  });
});
