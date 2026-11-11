/**
 * "As long as you're the monarch, damage doesn't cause you to lose life"
 * (Archon of Coronation): a `lose-life` prohibition `from: "damage"`. Rule
 * 120.3a's result alone doesn't happen: the damage is dealt in full, with its
 * other results (lifelink, poison from infect, the monarch's own trigger),
 * and life is still lost to an effect or paid as a cost.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, enter, lands, life, ref, settle, spawn, table, toHand } from "./harness.js";

const bolt = (t: ReturnType<typeof table>, by = A, at = A): void => {
  lands(t.game, "Mountain", 1, by);
  cast(t.game, toHand(t.game, "Lightning Bolt", by), { player: by, targets: [ref(at)] });
};

describe("Archon of Coronation", () => {
  it("makes its controller the monarch, and damage then costs them no life though it's dealt", () => {
    const t = table();
    enter(t.game, "Archon of Coronation");
    expect(t.game.state.monarch).toBe(A);
    bolt(t);
    expect(life(t.game)).toBe(20);
    expect(t.game.eventsOfType("damage-dealt").some((e) => e.amount === 3 && e.target.kind === "player")).toBe(true);
  });

  it("is off while its controller isn't the monarch", () => {
    const t = table();
    spawn(t.game, "Archon of Coronation");
    expect(t.game.state.monarch).not.toBe(A);
    bolt(t);
    expect(life(t.game)).toBe(17);
  });

  it("does nothing for another player", () => {
    const t = table();
    enter(t.game, "Archon of Coronation");
    bolt(t, A, B);
    expect(life(t.game, B)).toBe(17);
  });

  it("lets a loss of life through (it's only damage)", () => {
    const t = table();
    enter(t.game, "Archon of Coronation");
    lands(t.game, "Swamp", 2);
    cast(t.game, toHand(t.game, "Sign in Blood"), { targets: [ref(A)] });
    expect(life(t.game)).toBe(18);
  });

  it("still has combat damage make the attacker's controller the monarch, and then the next damage costs life", () => {
    const t = table();
    enter(t.game, "Archon of Coronation");
    const raider = spawn(t.game, "Grizzly Bears", B);
    t.b.declareAttackersFn = () => [{ attacker: raider, defender: A }];
    // The Archon stays home: the Bears get through.
    t.game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "combat-damage" && s.zones.shared.stack.length > 0);
    expect(life(t.game)).toBe(20);
    settle(t.game);
    expect(t.game.state.monarch).toBe(B);
    bolt(t, B, A);
    expect(life(t.game)).toBe(17);
  });

  it("leaves lifelink and infect's poison as they were", () => {
    const t = table();
    enter(t.game, "Archon of Coronation");
    const lifelinker = spawn(t.game, "Vampire Nighthawk", B);
    const infecter = spawn(t.game, "Plague Stinger", B);
    t.b.declareAttackersFn = () => [
      { attacker: lifelinker, defender: A },
      { attacker: infecter, defender: A },
    ];
    t.game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "combat-damage" && s.zones.shared.stack.length > 0);
    expect(life(t.game)).toBe(20);
    expect(life(t.game, B)).toBe(22);
    expect(t.game.state.players[A].counters?.poison ?? 0).toBe(1);
  });
});
