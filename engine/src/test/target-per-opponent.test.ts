import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, D, cast, controller, destroy, enter, lands, settle, spawn, table, toHand, tokensNamed, watchTargets, zone } from "./harness.js";

/**
 * Grasp of Fate: "for each opponent, exile up to one target nonland permanent
 * that player controls until this enchantment leaves the battlefield" — one
 * optional target slot per seat, each bound to that opponent.
 */

/** Each slot takes whichever of `ids` it offers, or stays empty. */
const choosing = (seat: ScriptedController, ...ids: readonly ObjectId[]) =>
  watchTargets(seat, (offered) => offered.map((slot) => ids.find((id) => slot.includes(id)) ?? null));

describe("Grasp of Fate", () => {
  it("offers each opponent's nonland permanents in that opponent's slot, and exiles one of each", () => {
    const t = table({ players: 4 });
    const bears = spawn(t.game, "Grizzly Bears", B);
    const ring = spawn(t.game, "Sol Ring", C);
    const giant = spawn(t.game, "Hill Giant", D);
    const island = spawn(t.game, "Island", B);
    const angel = spawn(t.game, "Serra Angel", A);
    const seen = choosing(t.a, bears, ring, giant);
    const grasp = enter(t.game, "Grasp of Fate");
    expect(zone(t.game, grasp)).toBe("battlefield");
    expect(seen.offered).toEqual([[bears], [ring], [giant]]);
    expect(seen.offered.flat()).not.toContain(island);
    expect(seen.offered.flat()).not.toContain(angel);
    for (const id of [bears, ring, giant]) expect(zone(t.game, id)).toBe("exile");
  });

  it("each is up to one: a seat may be left empty", () => {
    const t = table({ players: 4 });
    const bears = spawn(t.game, "Grizzly Bears", B);
    const giant = spawn(t.game, "Hill Giant", D);
    choosing(t.a, giant);
    enter(t.game, "Grasp of Fate");
    expect(zone(t.game, bears)).toBe("battlefield");
    expect(zone(t.game, giant)).toBe("exile");
  });

  it("they return under their owners' control the moment it leaves", () => {
    const t = table({ players: 3 });
    const bears = spawn(t.game, "Grizzly Bears", B);
    const giant = spawn(t.game, "Hill Giant", C);
    choosing(t.a, bears, giant);
    const grasp = enter(t.game, "Grasp of Fate");
    expect(zone(t.game, bears)).toBe("exile");
    destroy(t.game, grasp);
    expect(zone(t.game, bears)).toBe("battlefield");
    expect(zone(t.game, giant)).toBe("battlefield");
    expect(controller(t.game, bears)).toBe(B);
    expect(controller(t.game, giant)).toBe(C);
  });

  it("gone before its trigger resolves, nothing is exiled (the ruling)", () => {
    const t = table();
    const bears = spawn(t.game, "Grizzly Bears", B);
    choosing(t.a, bears);
    const grasp = enter(t.game, "Grasp of Fate", A, { settle: false });
    destroy(t.game, grasp);
    settle(t.game);
    expect(zone(t.game, grasp)).toBe("graveyard");
    expect(zone(t.game, bears)).toBe("battlefield");
  });

  it("a token exiled doesn't come back (the ruling), cast from hand", () => {
    const t = table();
    lands(t.game, "Plains", 3);
    const grasp = toHand(t.game, "Grasp of Fate");
    const token = spawn(t.game, "Soldier Token", B);
    choosing(t.a, token);
    cast(t.game, grasp);
    expect(tokensNamed(t.game, "Soldier Token", B)).toBe(0);
    destroy(t.game, grasp);
    expect(tokensNamed(t.game, "Soldier Token", B)).toBe(0);
  });
});
