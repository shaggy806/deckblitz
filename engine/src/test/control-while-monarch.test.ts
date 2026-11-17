import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, controller, enter, lands, pt, ref, settle, spawn, table, toHand, watchTargets, zone } from "./harness.js";

// "Gain control of target creature that player controls for as long as
// they're the monarch" — `gain-control`'s `whileMonarch` (Garland, Royal
// Kidnapper): the player read as it resolves, ended for good the first moment
// they aren't the monarch (rule 725.3), nothing at all if they already
// weren't (611.2b).

const crown = (game: Game, player: PlayerId): void => game.debugApplyEffect(player, { kind: "become-monarch", who: "you" });

/** Alice's seat makes `opponent` the monarch with Garland's enters trigger,
 * then takes `creature` with the second. */
function kidnap(game: Game, a: Parameters<typeof watchTargets>[0], opponent: PlayerId, creature: ObjectId): ObjectId {
  watchTargets(a, (offered) => [offered[0].includes(opponent) ? opponent : creature]);
  return enter(game, "Garland, Royal Kidnapper");
}

describe("Garland, Royal Kidnapper", () => {
  it("makes an opponent the monarch, takes their creature while they are, and pumps it", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Gray Ogre", B); // 2/2
    kidnap(game, a, B, ogre);
    expect(game.state.monarch).toBe(B);
    expect(controller(game, ogre)).toBe(A);
    expect(pt(game, ogre)).toEqual({ power: 4, toughness: 4 });
    // Alice becomes the monarch: Bob isn't, so it goes back.
    crown(game, A);
    settle(game);
    expect(controller(game, ogre)).toBe(B);
    expect(pt(game, ogre)).toEqual({ power: 2, toughness: 2 });
  });

  it("ends as the crown passes to a third player, and doesn't come back with it", () => {
    const { game, a } = table({ players: 3 });
    const ogre = spawn(game, "Gray Ogre", B);
    const garland = kidnap(game, a, B, ogre);
    expect(controller(game, ogre)).toBe(A);
    // Garland gone, so nothing steals it anew when Bob is the monarch again.
    game.debugMove(garland, "graveyard");
    crown(game, C);
    settle(game);
    expect(controller(game, ogre)).toBe(B);
    crown(game, B);
    settle(game);
    expect(controller(game, ogre)).toBe(B);
  });

  it("a creature you control but don't own can't be sacrificed: one you own goes instead", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Gray Ogre", B);
    const garland = kidnap(game, a, B, ogre);
    lands(game, "Swamp", 2);
    watchTargets(a, () => [A]);
    cast(game, toHand(game, "Diabolic Edict"), { targets: [ref(A)] });
    expect(zone(game, garland)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
    expect(controller(game, ogre)).toBe(A);
  });

  it("takes nothing if that player is no longer the monarch as it resolves (the ruling)", () => {
    const { game, a } = table();
    const ogre = spawn(game, "Gray Ogre", B);
    spawn(game, "Garland, Royal Kidnapper");
    watchTargets(a, () => [ogre]);
    // Bob becomes the monarch; before the trigger resolves, alice does.
    crown(game, B);
    expect(game.state.zones.shared.stack.length).toBe(1);
    crown(game, A);
    settle(game);
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(controller(game, ogre)).toBe(B);
  });
});
