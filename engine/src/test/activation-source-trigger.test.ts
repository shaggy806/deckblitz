/**
 * "Whenever an artifact becomes tapped or a player activates an artifact's
 * ability without {T} in its activation cost, this enchantment deals 1
 * damage to that artifact's controller" (Haunting Wind): `activates-ability`
 * with `who: "any"` (any player's activation) and `objectIsSource` (the
 * trigger object is the ability's source, the artifact, read as it last
 * existed when its own cost sacrificed it — rules 113.7a, 608.2h).
 */
import { describe, expect, it } from "vitest";
import { A, B, activate, lands, life, named, ref, settle, spawn, table } from "./harness.js";

describe("Haunting Wind", () => {
  it("deals 1 to each tapped artifact's controller, and not again for a {T} ability", () => {
    const { game } = table();
    spawn(game, "Haunting Wind", B);
    lands(game, "Wastes", 1);
    const icy = spawn(game, "Icy Manipulator", A, { sick: false });
    const stone = spawn(game, "Mind Stone", B);
    activate(game, icy, 0, { targets: [ref(stone)] });
    // Icy tapped for its cost (alice), Mind Stone tapped by Icy (bob); Icy's
    // activation has {T} in its cost, so the second half doesn't see it.
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });

  it("sees any player's activation without {T}: the controller of a Clue sacrificed for its own cost", () => {
    const { game } = table();
    spawn(game, "Haunting Wind", B);
    lands(game, "Wastes", 2, A);
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 }, []);
    settle(game);
    const [clue] = named(game, "Clue Token", A);
    activate(game, clue);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
  });

  it("names the artifact, not the ability: an Ashnod's Altar activation damages its controller", () => {
    const { game } = table();
    spawn(game, "Haunting Wind", B);
    const altar = spawn(game, "Ashnod's Altar", A);
    const bears = spawn(game, "Grizzly Bears", A);
    activate(game, altar, 0, { sacrifice: bears });
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
  });
});
