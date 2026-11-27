/**
 * A `putFromExile` cost remembers the card it put into its owner's graveyard
 * (`{ paid: "put-from-exile" }`), and the cards exiled face down with the
 * source that its controller may look at are picked themselves, not from a
 * pile at random (rule 406.3) — Jester's Scepter.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, enter, lands, pickFromZone, pickTargets, ref, settle, table, toHand, toLibrary, zone } from "./harness.js";

function scepterBoard() {
  const t = table();
  const { game, a } = t;
  const top: ObjectId[] = ["Forest", "Island", "Shock", "Opt", "Grizzly Bears"].map((name) => toLibrary(game, name, B));
  pickTargets(a, B);
  const scepter = enter(game, "Jester's Scepter");
  return { ...t, scepter, top };
}

describe("Jester's Scepter", () => {
  it("exiles the top five of the target's library face down, its controller alone looking", () => {
    const { game, top } = scepterBoard();
    for (const id of top) {
      expect(zone(game, id)).toBe("exile");
      expect(game.state.objects[id].exiledFaceDown?.lookers).toEqual([A]);
    }
  });

  it("counters a spell with the name of the card its cost put into the graveyard", () => {
    const { game, a, scepter, top } = scepterBoard();
    const exiledShock = top[2];
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    const seen = pickFromZone(a, exiledShock);
    activate(game, scepter, 0, { targets: [ref(shock)] });
    settle(game);
    // Every one of the five is offered by itself, none from a pile.
    expect([...seen.offered].sort()).toEqual([...top].sort());
    expect(zone(game, exiledShock)).toBe("graveyard");
    expect(zone(game, shock)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(20);
  });

  it("does nothing to a spell of another name", () => {
    const { game, a, scepter, top } = scepterBoard();
    const forest = top[0];
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    pickFromZone(a, forest);
    activate(game, scepter, 0, { targets: [ref(shock)] });
    settle(game);
    expect(zone(game, forest)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(18);
  });
});
