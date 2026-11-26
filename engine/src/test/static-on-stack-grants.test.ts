/**
 * A spell's static that works only while it's on the stack (`StaticAbility
 * .onStack`, rule 113.6b), granting each creature an activated ability that
 * names the spell (`"granter"`, rule 201.5a) — Torrent of Lava: "Torrent of
 * Lava deals X damage to each creature without flying. As long as Torrent of
 * Lava is on the stack, each creature has '{T}: Prevent the next 1 damage that
 * would be dealt to this creature by Torrent of Lava this turn.'"
 *
 * The granted ability's shield is `prevent-damage` `from: "granter"`: only the
 * spell's damage is prevented.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const grantedOffers = (game: Game, player: PlayerId, creature: ObjectId): number =>
  game.legalActions(player).filter((x) => x.kind === "activate-ability" && x.source === creature).length;

/** Alice casts Torrent of Lava for X = 2, and Bob gets priority with it on the stack. */
function torrent(game: Game): ObjectId {
  lands(game, "Mountain", 4);
  const spell = toHand(game, "Torrent of Lava");
  cast(game, spell, { x: 2, settle: false });
  game.advanceUntil((s) => s.priority.holder === B);
  return spell;
}

describe("Torrent of Lava", () => {
  it("gives each creature the ability only while it's on the stack", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const own = spawn(game, "Grizzly Bears", A);
    expect(grantedOffers(game, B, bears)).toBe(0);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Torrent of Lava"), { x: 2, settle: false });
    // Alice's own creature has it too.
    expect(grantedOffers(game, A, own)).toBe(1);
    game.advanceUntil((s) => s.priority.holder === B);
    expect(grantedOffers(game, B, bears)).toBe(1);
    settle(game);
    expect(zone(game, own)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("prevents 1 of the spell's damage to a creature that taps for it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    torrent(game);
    activate(game, bears, 0, { player: B, settle: false });
    expect(game.state.objects[bears].tapped).toBe(true);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(grantedOffers(game, B, bears)).toBe(0);
  });

  it("prevents no other source's damage", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    torrent(game);
    activate(game, bears, 0, { player: B });
    // Torrent resolved: 2 damage less the 1 prevented. A Shock now isn't Torrent.
    expect(game.state.objects[bears].damageMarked).toBe(1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("does nothing to a creature with flying, which still has the ability", () => {
    const { game } = table();
    const bird = spawn(game, "Storm Crow", B);
    torrent(game);
    expect(grantedOffers(game, B, bird)).toBe(1);
    settle(game);
    expect(zone(game, bird)).toBe("battlefield");
    expect(game.state.objects[bird].damageMarked ?? 0).toBe(0);
  });
});
