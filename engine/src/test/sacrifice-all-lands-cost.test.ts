/**
 * "Sacrifice all lands you control" as part of an activation cost (rule
 * 602.2b, 601.2h) — `AbilityCost.do` of `sacrifice-all`, the source land
 * among them — and a mana ability's damage only without an Ogre: Tomb of
 * Urami.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, lands, life, spawn, table, zone } from "./harness.js";

const permanentsNamed = (game: ReturnType<typeof table>["game"], name: string) =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name);

describe("Tomb of Urami", () => {
  it("taps for {B}, dealing 1 damage to you without an Ogre", () => {
    const { game } = table();
    const tomb = spawn(game, "Tomb of Urami");
    activate(game, tomb, 0);
    expect(game.state.players[A].manaPool.map((unit) => unit.type)).toEqual(["B"]);
    expect(life(game, A)).toBe(19);
  });

  it("deals no damage while you control an Ogre", () => {
    const { game } = table();
    spawn(game, "Gray Ogre");
    const tomb = spawn(game, "Tomb of Urami");
    activate(game, tomb, 0);
    expect(life(game, A)).toBe(20);
  });

  it("an opponent's Ogre doesn't count", () => {
    const { game } = table();
    spawn(game, "Gray Ogre", B);
    const tomb = spawn(game, "Tomb of Urami");
    activate(game, tomb, 0);
    expect(life(game, A)).toBe(19);
  });

  it("sacrifices every land you control, itself too, to create Urami", () => {
    const { game } = table();
    const swamps = lands(game, "Swamp", 4);
    const extra = lands(game, "Forest", 2);
    const theirs = lands(game, "Island", 2, B);
    const tomb = spawn(game, "Tomb of Urami");
    activate(game, tomb, 1);
    for (const id of [...swamps, ...extra, tomb]) expect(zone(game, id)).toBe("graveyard");
    for (const id of theirs) expect(zone(game, id)).toBe("battlefield");
    const urami = permanentsNamed(game, "Urami");
    expect(urami).toHaveLength(1);
    const object = game.state.objects[urami[0]!];
    expect(object.controller).toBe(A);
  });
});
