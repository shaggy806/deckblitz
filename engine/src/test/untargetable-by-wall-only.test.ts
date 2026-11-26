/**
 * "Can't be the target of spells that can target only Walls or of abilities
 * that can target only Walls" (Wall of Shadows): the `be-targeted`
 * prohibition's `aimingOnly` subtype. A spell is judged as a whole — its
 * ruling: a modal spell with a mode that can target a non-Wall isn't "a spell
 * that can target only Walls", so Chaos Charm's "destroy target Wall" may
 * still target it.
 */
import { describe, expect, it } from "vitest";

import { aimsOnlySubtype } from "../prohibitions.js";
import { A, B, activate, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("can't be the target of spells or abilities that can target only Walls", () => {
  it("a Wall-only spell can target another Wall but not Wall of Shadows", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const shadows = spawn(game, "Wall of Shadows", B);
    const vapor = spawn(game, "Wall of Vapor", B);
    const tunnel = toHand(game, "Tunnel");
    expect(() => cast(game, tunnel, { targets: [ref(shadows)] })).toThrow();
    cast(game, tunnel, { targets: [ref(vapor)] });
    expect(zone(game, vapor)).toBe("graveyard");
    expect(zone(game, shadows)).toBe("battlefield");
  });

  it("a Wall-only ability can't target it", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const shadows = spawn(game, "Wall of Shadows", B);
    const vapor = spawn(game, "Wall of Vapor", B);
    const ali = spawn(game, "Ali Baba", A);
    expect(() => activate(game, ali, 0, { targets: [ref(shadows)] })).toThrow();
    activate(game, ali, 0, { targets: [ref(vapor)] });
    expect(game.state.objects[vapor].tapped).toBe(true);
  });

  it("a modal spell with a mode that can target a non-Wall may target it in its Wall mode", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const shadows = spawn(game, "Wall of Shadows", B);
    spawn(game, "Grizzly Bears", B);
    const charm = toHand(game, "Chaos Charm");
    cast(game, charm, { modes: [0], targets: [ref(shadows)] });
    expect(zone(game, shadows)).toBe("graveyard");
  });

  it("reads a slot as Wall-only only when everything it could hold is a Wall", () => {
    expect(aimsOnlySubtype({ kind: "permanent", filter: { subtype: "Wall" } }, "Wall")).toBe(true);
    expect(aimsOnlySubtype({ kind: "optional", of: { kind: "permanent", filter: { type: "creature", subtype: "Wall" } } }, "Wall")).toBe(true);
    expect(aimsOnlySubtype({ kind: "permanent", filter: { subtypes: ["Wall", "Elf"] } }, "Wall")).toBe(false);
    expect(aimsOnlySubtype({ kind: "permanent", filter: { anyOf: [{ subtype: "Wall" }, { type: "artifact" }] } }, "Wall")).toBe(false);
    expect(aimsOnlySubtype("creature", "Wall")).toBe(false);
  });
});
