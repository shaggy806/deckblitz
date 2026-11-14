/**
 * "Reselect the targets at random" (`change-targets`'s `"random"`) — Chef's
 * Kiss: "Gain control of target spell that targets only a single permanent or
 * player. Copy it, then reselect the targets at random for the spell and the
 * copy. The new targets can't be you or a permanent you control."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, graveyard, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

/** Alice casts `name` at `target`, then passes priority to Bob. */
function aliceCasts(game: Game, name: string, land: string, n: number, target: ObjectId | PlayerId): ObjectId {
  lands(game, land, n);
  const spell = toHand(game, name);
  cast(game, spell, { settle: false, targets: [ref(target)] });
  game.dispatch({ type: "pass-priority", player: A });
  return spell;
}

const kiss = (game: Game, spell: ObjectId, opts: { settle?: boolean } = {}): void => {
  lands(game, "Mountain", 3, B);
  cast(game, toHand(game, "Chef's Kiss", B), { player: B, targets: [ref(spell)], settle: opts.settle ?? true });
};

describe("Chef's Kiss", () => {
  it("takes the spell, copies it, and aims both away from you and yours", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const shock = aliceCasts(game, "Shock", "Mountain", 1, bears);
    kiss(game, shock);
    // The only target that isn't Bob or his: Alice, for the spell and the copy.
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("battlefield");
    expect(graveyard(game, A)).toContain(shock);
  });

  it("draws each target at random among the legal ones left", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 12; seed += 1) {
      const { game } = table({ seed });
      spawn(game, "Grizzly Bears", B);
      const ogre = spawn(game, "Hill Giant", A);
      const shock = aliceCasts(game, "Shock", "Mountain", 1, B);
      kiss(game, shock, { settle: false });
      // Chef's Kiss resolves: both Shocks are on the stack, Bob's, aimed.
      game.dispatch({ type: "pass-priority", player: B });
      game.dispatch({ type: "pass-priority", player: A });
      const shocks = game.state.zones.shared.stack.filter((id) => game.state.objects[id].cardName === "Shock");
      expect(shocks).toHaveLength(2);
      for (const id of shocks) {
        expect(game.state.objects[id].controller).toBe(B);
        const t = game.state.objects[id].targets?.[0];
        const key = t?.kind === "player" ? t.player : t?.kind === "object" ? game.state.objects[t.object].cardName : "none";
        expect([A, "Hill Giant"]).toContain(key);
        seen.add(key);
      }
      settle(game);
      // Bob and his Bears were never picked.
      expect(life(game, B)).toBe(20);
      void ogre;
    }
    // Both were drawn at some point.
    expect(seen).toEqual(new Set([A, "Hill Giant"]));
  });

  it("a token of a stack drawn as the new target is peeled off and targeted alone", () => {
    let tokenPicked = false;
    for (let seed = 1; seed <= 12 && !tokenPicked; seed += 1) {
      const { game } = table({ seed });
      game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 3 });
      const shock = aliceCasts(game, "Shock", "Mountain", 1, B);
      kiss(game, shock, { settle: false });
      game.dispatch({ type: "pass-priority", player: B });
      game.dispatch({ type: "pass-priority", player: A });
      for (const id of game.state.zones.shared.stack) {
        const t = game.state.objects[id].targets?.[0];
        if (t?.kind !== "object") continue;
        tokenPicked = true;
        // One token, not the stack of them.
        expect(game.state.objects[t.object].stackCount ?? 1).toBe(1);
      }
      settle(game);
      const goblins = game.state.zones.shared.battlefield
        .filter((id) => game.state.objects[id].cardName === "Goblin Token")
        .reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
      // Each Shock kills at most the one Goblin it aimed at.
      expect(goblins).toBeGreaterThanOrEqual(1);
    }
    expect(tokenPicked).toBe(true);
  });

  it("with nothing it may pick, the targets stay as they were (the hexproof ruling)", () => {
    const { game } = table();
    spawn(game, "Leyline of Sanctity", A);
    const shock = aliceCasts(game, "Shock", "Mountain", 1, B);
    kiss(game, shock);
    // Alice can't be targeted by Bob's spells; Bob is excluded: both hit Bob.
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });

  it("can't target a spell with two different targets", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    const trail = toHand(game, "Arc Trail");
    cast(game, trail, { settle: false, targets: [ref(B), ref(bears)] });
    game.dispatch({ type: "pass-priority", player: A });
    expect(() => kiss(game, trail, { settle: false })).toThrow();
  });
});
