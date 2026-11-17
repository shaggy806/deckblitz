/**
 * Undead Sprinter: "You may cast this card from your graveyard if a non-Zombie
 * creature died this turn. If you do, this creature enters with a +1/+1
 * counter on it."
 *
 * The card's own permission (`mayPlaySelf`, rule 113.6f) with an `if` read
 * from the journal (the creature as it last existed), and "if you do" its
 * `entersWith` — a rider of that permission alone. Cast from the graveyard
 * under another permission that reaches it (Gisa and Geralf's: it's a Zombie
 * — the player names which, rule 601.3), it enters with no counter.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, destroy, lands, pt, spawn, table, toGraveyard, zone } from "./harness.js";

const graveyardOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "graveyard-permission");

describe("Undead Sprinter", () => {
  it("can't be cast from the graveyard before a non-Zombie creature has died this turn", () => {
    const { game } = table();
    lands(game, "Badlands", 2);
    const sprinter = toGraveyard(game, "Undead Sprinter");
    expect(graveyardOffers(game, sprinter)).toHaveLength(0);
    // A Zombie dying isn't enough.
    destroy(game, spawn(game, "Gravecrawler", B));
    expect(graveyardOffers(game, sprinter)).toHaveLength(0);
  });

  it("once a non-Zombie creature died, it's cast from the graveyard and enters with a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Badlands", 2);
    const sprinter = toGraveyard(game, "Undead Sprinter");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(graveyardOffers(game, sprinter)).toHaveLength(1);
    cast(game, sprinter, { via: "graveyard-permission" });
    expect(zone(game, sprinter)).toBe("battlefield");
    expect(counters(game, sprinter)).toBe(1);
    expect(pt(game, sprinter)).toEqual({ power: 3, toughness: 3 });
  });

  it("cast from the hand, it enters with no counter", () => {
    const { game } = table();
    lands(game, "Badlands", 2);
    destroy(game, spawn(game, "Grizzly Bears", B));
    const sprinter = game.debugSpawn("Undead Sprinter", A, "hand");
    cast(game, sprinter);
    expect(zone(game, sprinter)).toBe("battlefield");
    expect(counters(game, sprinter)).toBe(0);
  });

  it("cast under Gisa and Geralf's permission, it enters with no counter", () => {
    const { game } = table();
    const gisa = spawn(game, "Gisa and Geralf");
    lands(game, "Badlands", 2);
    const sprinter = toGraveyard(game, "Undead Sprinter");
    // With no non-Zombie dead, only Gisa and Geralf's reaches it.
    expect(graveyardOffers(game, sprinter)).toHaveLength(1);
    destroy(game, spawn(game, "Grizzly Bears", B));
    // Now both do: an offer under each.
    expect(graveyardOffers(game, sprinter)).toHaveLength(2);
    cast(game, sprinter, { via: "graveyard-permission", graveyardGrant: { source: gisa } });
    expect(zone(game, sprinter)).toBe("battlefield");
    expect(counters(game, sprinter)).toBe(0);
  });

  it("under its own beside Gisa and Geralf's, it gets the counter", () => {
    const { game } = table();
    spawn(game, "Gisa and Geralf");
    lands(game, "Badlands", 2);
    const sprinter = toGraveyard(game, "Undead Sprinter");
    destroy(game, spawn(game, "Grizzly Bears", B));
    cast(game, sprinter, { via: "graveyard-permission", graveyardGrant: { source: sprinter } });
    expect(counters(game, sprinter)).toBe(1);
  });
});
