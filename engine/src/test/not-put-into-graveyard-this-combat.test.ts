/**
 * "Target … card in your graveyard **that wasn't put there this combat**"
 * (Storrev, Devkarin Lich): the journal's `to-graveyard` entries carry the
 * combat phase they happened in (rule 506.1: its five steps), so a `not` of a
 * `journaled` clause with `thisCombat` leaves out every card put into the
 * graveyard during this combat — by combat damage or any other way, from any
 * zone (the ruling) — and keeps one put there earlier, this turn or before.
 */
import { describe, expect, it } from "vitest";

import { A, B, destroy, hand, life, spawn, table, toGraveyard, toHand, toStep, watchTargets, zone } from "./harness.js";

describe("Storrev, Devkarin Lich", () => {
  it("returns a creature card put into your graveyard before combat, even this turn", () => {
    const t = table();
    const { game } = t;
    const storrev = spawn(game, "Storrev, Devkarin Lich");
    const old = toGraveyard(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    destroy(game, elves);
    toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(t.a, (offered) => [offered[0].includes(elves) ? elves : null]);
    t.a.declareAttackersFn = () => [{ attacker: storrev, defender: B }];
    t.b.declareBlockersFn = () => [];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(15);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([elves, old].sort());
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, old)).toBe("graveyard");
  });

  it("can't target a creature that died in this combat's damage, or a card put there during combat from elsewhere", () => {
    const t = table();
    const { game } = t;
    const storrev = spawn(game, "Storrev, Devkarin Lich");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const before = toGraveyard(game, "Llanowar Elves");
    // A second card from before combat, so the seat is asked (a required slot
    // with one option is auto-picked).
    const alsoBefore = toGraveyard(game, "Grizzly Bears");
    const discarded = toHand(game, "Serra Angel");
    t.a.declareAttackersFn = () => [
      { attacker: storrev, defender: B },
      { attacker: bears, defender: B },
    ];
    t.b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    // A card put into the graveyard from the hand during the combat phase.
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    game.debugMove(discarded, "graveyard");
    expect(hand(game)).not.toContain(discarded);
    const seen = watchTargets(t.a, () => [before]);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect([...seen.offered[0]].sort()).toEqual([before, alsoBefore].sort());
    expect(zone(game, before)).toBe("hand");
    expect(zone(game, discarded)).toBe("graveyard");
  });

  it("with only this combat's dead in the graveyard, the trigger has no target and does nothing", () => {
    const t = table();
    const { game } = t;
    const storrev = spawn(game, "Storrev, Devkarin Lich");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    t.a.declareAttackersFn = () => [
      { attacker: storrev, defender: B },
      { attacker: bears, defender: B },
    ];
    t.b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    const seen = watchTargets(t.a);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(seen.asked).toBe(0);
    expect(life(game, B)).toBe(15);
  });

  it("still triggers when it dies to the same combat damage (the ruling), trampling over its blocker", () => {
    const t = table();
    const { game } = t;
    const storrev = spawn(game, "Storrev, Devkarin Lich");
    const angel = spawn(game, "Serra Angel", B);
    const old = toGraveyard(game, "Grizzly Bears");
    const older = toGraveyard(game, "Llanowar Elves");
    const seen = watchTargets(t.a, () => [old]);
    t.a.declareAttackersFn = () => [{ attacker: storrev, defender: B }];
    t.b.declareBlockersFn = () => [{ blocker: angel, attacker: storrev }];
    toStep(game, "postcombat-main");
    expect(zone(game, storrev)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(seen.asked).toBe(1);
    // Storrev itself was put there this combat: not offered.
    expect([...seen.offered[0]].sort()).toEqual([old, older].sort());
    expect(zone(game, old)).toBe("hand");
  });

  it("triggers on combat damage to a planeswalker too", () => {
    const t = table();
    const { game } = t;
    const storrev = spawn(game, "Storrev, Devkarin Lich");
    const walker = spawn(game, "Jace Beleren", B);
    const old = toGraveyard(game, "Grizzly Bears");
    t.a.declareAttackersFn = () => [{ attacker: storrev, defender: walker }];
    t.b.declareBlockersFn = () => [];
    toStep(game, "postcombat-main");
    expect(zone(game, walker)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(zone(game, old)).toBe("hand");
  });
});
