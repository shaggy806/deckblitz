/**
 * Reincarnation: "When that creature dies this turn, return a creature card
 * from its owner's graveyard to the battlefield under the control of that
 * creature's owner." A delayed trigger's `look-and-choose` from
 * `{ ownerOf: "trigger-object" }`'s graveyard, `under: "owners"`; the
 * spell's controller chooses, and the card needn't be the one that died.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, controller, destroy, lands, named, pickFromZone, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Reincarnation", () => {
  it("returns a creature card the caster picks from the dead creature's owner's graveyard, under that owner", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Llanowar Elves", A);
    const seen = pickFromZone(a, giant);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Reincarnation"), { targets: [ref(bears)] });
    destroy(game, bears, A);
    settle(game);
    // Offered B's creature cards only, the dead Bears among them.
    expect(seen.offered.length).toBe(2);
    expect([zone(game, giant), controller(game, giant)]).toEqual(["battlefield", B]);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
  });

  it("can return the creature that died, under its owner though another player controlled it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    settle(game);
    expect(controller(game, bears)).toBe(A);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Reincarnation"), { targets: [ref(bears)] });
    destroy(game, bears, B);
    settle(game);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });

  it("does nothing if the creature doesn't die this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Reincarnation"), { targets: [ref(bears)] });
    expect(named(game, "Hill Giant")).toHaveLength(0);
  });
});
