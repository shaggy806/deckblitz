import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, pickFromZone, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

/**
 * "Returned this way" counts a commander whose owner sent it to the command
 * zone instead (rule 903.9b): Flood of Tears' ruling — "if a permanent would
 * be returned to your hand but ends up in another zone … Flood of Tears
 * counts it". The commander's move waits for its owner's answer, and the
 * rest of the spell waits with it.
 */

function commander(game: Game, name: string, owner: PlayerId = A): ObjectId {
  const id = spawn(game, name, owner);
  game.state.objects[id].isCommander = true;
  return id;
}

describe("Flood of Tears", () => {
  it("returns every nonland permanent, and with four of yours puts a permanent card from your hand onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const ring = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Grizzly Bears", B);
    const angel = toHand(game, "Serra Angel");
    const pick = pickFromZone(a, angel);
    cast(game, toHand(game, "Flood of Tears"));
    for (const id of [...bears, ring]) expect(zone(game, id)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
    // A permanent card from the hand — one returned this way among them.
    expect(pick.offered).toContain(ring);
    expect(pick.offered).toContain(angel);
    expect(zone(game, angel)).toBe("battlefield");
  });

  it("doesn't count tokens or an opponent's permanents", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Sol Ring");
    spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 });
    const angel = toHand(game, "Serra Angel");
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [angel];
    };
    cast(game, toHand(game, "Flood of Tears"));
    expect(asked).toBe(false);
    expect(zone(game, angel)).toBe("hand");
  });

  for (const toCommandZone of [true, false]) {
    it(`counts your commander ${toCommandZone ? "sent to the command zone instead" : "returned to your hand"}`, () => {
      const { game, a } = table();
      lands(game, "Island", 6);
      const krenko = commander(game, "Krenko, Mob Boss");
      spawn(game, "Grizzly Bears");
      spawn(game, "Grizzly Bears");
      spawn(game, "Sol Ring");
      a.commanderReplacementFn = () => toCommandZone;
      const angel = toHand(game, "Serra Angel");
      const pick = pickFromZone(a, toCommandZone ? angel : krenko);
      cast(game, toHand(game, "Flood of Tears"));
      expect(pick.offered).toContain(angel);
      if (toCommandZone) {
        expect(zone(game, krenko)).toBe("command");
        expect(zone(game, angel)).toBe("battlefield");
      } else {
        // The commander is in the hand by the time the choice is made, so it
        // can be the card put back (the third ruling).
        expect(pick.offered).toContain(krenko);
        expect(zone(game, krenko)).toBe("battlefield");
        expect(hand(game)).toContain(angel);
      }
    });
  }
});
