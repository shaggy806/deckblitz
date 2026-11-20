/**
 * Day of the Dragons: "When this enchantment enters, exile all creatures you
 * control. Then create that many 5/5 red Dragon creature tokens with flying.
 * When this enchantment leaves the battlefield, sacrifice all Dragons you
 * control. Then return the exiled cards to the battlefield under your
 * control."
 *
 * Worldgorger Dragon's linked pair (rule 607.2a — `exile-all`'s `linked`,
 * `return-exiled-by-source`'s `linked: "battlefield"`) with `under: "you"`:
 * the cards come back under the effect's controller (rule 110.2a), another
 * player's card too. A token counts toward "that many" but doesn't come back
 * (rule 111.7); leaving before the enters trigger resolves exiles the
 * creatures for good (the rulings).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, controller, destroy, enter, lands, ref, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

/** Alice takes Bob's Hill Giant for the turn (Act of Treason). */
function stealGiant(game: Game): ObjectId {
  const giant = spawn(game, "Hill Giant", B);
  lands(game, "Mountain", 3);
  cast(game, toHand(game, "Act of Treason"), { targets: [ref(giant)] });
  expect(controller(game, giant)).toBe(A);
  return giant;
}

describe("Day of the Dragons", () => {
  it("exiles every creature you control for that many Dragons, a token counting; leaving, it sacrifices your Dragons and returns the cards under your control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    const giant = stealGiant(game);
    const shivan = spawn(game, "Shivan Dragon");
    const bobDragon = spawn(game, "Shivan Dragon", B);
    const day = enter(game, "Day of the Dragons");
    // Shivan Dragon is a creature you control too: four exiled, four Dragons.
    for (const id of [bears, giant, shivan]) expect(zone(game, id)).toBe("exile");
    expect(tokensNamed(game, "Soldier Token")).toBe(0);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(4);
    expect(zone(game, bobDragon)).toBe("battlefield");

    destroy(game, day);
    expect(tokensNamed(game, "Dragon Token")).toBe(0);
    // Every card back, under Alice's control — Bob's Giant included.
    for (const id of [bears, giant, shivan]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(controller(game, id)).toBe(A);
    }
    expect(game.state.objects[giant].owner).toBe(B);
    // The token doesn't come back.
    expect(tokensNamed(game, "Soldier Token")).toBe(0);
    // Bob's Dragon isn't Alice's to sacrifice.
    expect(zone(game, bobDragon)).toBe("battlefield");
  });

  it("sacrifices the Dragons you control when it leaves, a nontoken one too, before the cards return", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const day = enter(game, "Day of the Dragons");
    expect(tokensNamed(game, "Dragon Token", A)).toBe(1);
    // A Dragon that arrives later is sacrificed too.
    const shivan = spawn(game, "Shivan Dragon");
    destroy(game, day);
    expect(zone(game, shivan)).toBe("graveyard");
    expect(tokensNamed(game, "Dragon Token")).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("leaving before its enters trigger resolves exiles your creatures for good, leaving the Dragons", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const day = enter(game, "Day of the Dragons", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, day);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Dragon Token", A)).toBe(1);
  });
});

/**
 * Synod Sanctum: "{2}, {T}: Exile target permanent you control. {2},
 * Sacrifice this artifact: Return all cards exiled with this artifact to the
 * battlefield under your control." The cards come back under the controller
 * of the sacrificing ability (rule 110.2a), though the cost sacrificed the
 * artifact: the ability refers to the stint it was activated from (607.2a).
 */
describe("Synod Sanctum", () => {
  it("returns every card exiled with it under your control, a card another player owns too", () => {
    const { game } = table();
    const sanctum = spawn(game, "Synod Sanctum");
    const bears = spawn(game, "Grizzly Bears");
    const giant = stealGiant(game);
    lands(game, "Plains", 6);
    activate(game, sanctum, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(sanctum)]);
    activate(game, sanctum, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    activate(game, sanctum, 1);
    expect(zone(game, sanctum)).toBe("graveyard");
    for (const id of [bears, giant]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(controller(game, id)).toBe(A);
    }
    expect(game.state.objects[giant].owner).toBe(B);
  });

  it("can't exile a permanent another player controls", () => {
    const { game } = table();
    const sanctum = spawn(game, "Synod Sanctum");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    expect(() => activate(game, sanctum, 0, { targets: [ref(theirs)] })).toThrow();
  });
});
