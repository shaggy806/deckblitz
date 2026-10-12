/**
 * The set walk, batch 57, part d (2026-10-11): the cards two engine fixes
 * unblocked — a creature that has left still connives (rule 701.50b), and an
 * announced "choose one that hasn't been chosen this turn" modal written as
 * two trigger entries keeps one tally (`sameAbilityAs`).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, graveyard, hand, lands, life, pt, settle, spawn, table, toHand, tokensNamed } from "./harness.js";

describe("M.O.D.O.K.", () => {
  it("killed in response, still connives: its controller draws and discards (701.50b)", () => {
    const { game, a } = table();
    const modok = spawn(game, "M.O.D.O.K.");
    const shock = toHand(game, "Shock");
    a.chooseDiscardsFn = () => [shock];
    const handBefore = hand(game).length;
    activate(game, modok, 0, { settle: false });
    expect(life(game)).toBe(17);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: modok }]);
    settle(game);
    expect(game.state.objects[modok].zone).toBe("graveyard");
    expect(graveyard(game)).toContain(shock);
    expect(hand(game).length).toBe(handBefore);
  });

  it("shrinks the opponents' creatures, not yours", () => {
    const { game } = table();
    spawn(game, "M.O.D.O.K.");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Baron Strucker, HYDRA Overlord", () => {
  it("has another Villain connive once each turn, and Villain spells cost {1} less", () => {
    const { game, a } = table();
    // Yes to each "you may have it connive".
    a.chooseModesFn = () => [0];
    spawn(game, "Baron Strucker, HYDRA Overlord");
    lands(game, "Swamp", 2);
    const handBefore = hand(game).length;
    // Songbird ({1}{B}) for {B}, which leaves a Swamp for the next one.
    cast(game, toHand(game, "Songbird, Sonic Screamer"));
    // Drew one, discarded one: the hand is back where it was.
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(1);
    cast(game, toHand(game, "Undead Hand Ninja"));
    // Once each turn: the second Villain doesn't connive.
    expect(graveyard(game).length).toBe(1);
  });
});

describe("The Fantastic Four", () => {
  it("entering and a cast trigger share one 'hasn't been chosen this turn' tally", () => {
    const { game, a } = table();
    const offered: number[] = [];
    a.chooseModesFn = (view) => {
      const awaiting = view.state.awaiting;
      offered.push(awaiting?.kind === "choose-modes" ? awaiting.modes.length : 0);
      return [0];
    };
    for (const land of ["Mountain", "Forest", "Plains", "Island"]) spawn(game, land);
    cast(game, toHand(game, "The Fantastic Four"));
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(1);
    lands(game, "Mountain", 4);
    // Hill Giant: mana value 4.
    cast(game, toHand(game, "Hill Giant"));
    expect(offered).toEqual([4, 3]);
  });
});
