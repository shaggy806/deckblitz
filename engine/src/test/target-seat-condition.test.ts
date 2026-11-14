/**
 * "For each opponent who has three or more poison counters as you cast this
 * spell, put up to one target creature card from that player's graveyard onto
 * the battlefield under your control" (Geth's Summons): a seat slot with
 * `onlyIf` — defined only for a seat whose player meets the condition as the
 * targets are chosen (rule 601.2c), and fixed from then on.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, cast, controller, lands, ref, settle, table, toGraveyard, toHand, zone } from "./harness.js";

const poison = (game: Game, player: PlayerId, n: number): void => {
  game.state.players[player].counters.poison = n;
};

const castOffer = (game: Game, card: ObjectId) => {
  const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === card);
  if (offer === undefined || offer.kind !== "cast-spell") throw new Error("no cast offered");
  return offer;
};

describe("Geth's Summons — a seat slot defined only for a poisoned opponent", () => {
  it("offers a target only in a graveyard whose player has three or more poison counters", () => {
    const { game } = table({ players: 4 });
    lands(game, "Swamp", 4);
    const summons = toHand(game, "Geth's Summons");
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const bobs = toGraveyard(game, "Hill Giant", B);
    const carols = toGraveyard(game, "Craw Wurm", C);
    const daves = toGraveyard(game, "Grizzly Bears", D);
    poison(game, B, 3);
    poison(game, C, 2);
    poison(game, D, 9);
    const offer = castOffer(game, summons);
    expect(offer.targetOptions[0]).toEqual([ref(mine)]);
    expect(offer.targetOptions[1]).toEqual([ref(bobs)]);
    expect(offer.targetOptions[2]).toEqual([]);
    expect(offer.targetOptions[3]).toEqual([ref(daves)]);
    // Carol's slot is no slot: naming her creature is refused.
    expect(() => cast(game, summons, { targets: [ref(mine), ref(bobs), ref(carols), ref(daves)] })).toThrow(/target/i);
    cast(game, summons, { targets: [ref(mine), ref(bobs), null, ref(daves)] });
    for (const id of [mine, bobs, daves]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(controller(game, id)).toBe(A);
    }
    expect(zone(game, carols)).toBe("graveyard");
  });

  it("with no poisoned opponent it's an ordinary up-to-one reanimation", () => {
    const { game } = table({ players: 2 });
    lands(game, "Swamp", 4);
    const summons = toHand(game, "Geth's Summons");
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const bobs = toGraveyard(game, "Hill Giant", B);
    const offer = castOffer(game, summons);
    expect(offer.targetOptions.slice(1).every((slot) => slot.length === 0)).toBe(true);
    cast(game, summons, { targets: [ref(mine), null, null, null] });
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, bobs)).toBe("graveyard");
  });

  it("is read as it's cast: losing the poison counters before it resolves changes nothing", () => {
    const { game } = table({ players: 2 });
    lands(game, "Swamp", 4);
    const summons = toHand(game, "Geth's Summons");
    const bobs = toGraveyard(game, "Hill Giant", B);
    poison(game, B, 3);
    cast(game, summons, { targets: [null, ref(bobs), null, null], settle: false });
    poison(game, B, 0);
    settle(game);
    expect(zone(game, bobs)).toBe("battlefield");
    expect(controller(game, bobs)).toBe(A);
  });
});
