/**
 * Undaunted (rule 702.125a): "This spell costs {1} less to cast for each
 * opponent you have" — `selfCostReduction`'s `{ opponents: true }`. Players
 * who have left the game don't count (702.125b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, C, D, cast, graveyard, hand, lands, ref, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

describe("undaunted", () => {
  it("costs {1} less per opponent: {6}{W} is {3}{W} with three opponents", () => {
    const { game } = table({ players: 4 });
    lands(game, "Plains", 4);
    const card = toHand(game, "Sublime Exhalation");
    expect(castable(game, card)).toBe(true);
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", C), spawn(game, "Grizzly Bears", D)];
    cast(game, card);
    expect(bears.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
  });

  it("counts only the opponents still in the game", () => {
    const { game } = table({ players: 4 });
    lands(game, "Plains", 4);
    const card = toHand(game, "Sublime Exhalation");
    game.state.players[D].hasLost = true;
    expect(castable(game, card)).toBe(false);
    lands(game, "Plains", 1);
    expect(castable(game, card)).toBe(true);
  });

  it("takes off one in a two-player game", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const card = toHand(game, "Coastal Breach");
    expect(castable(game, card)).toBe(false);
    lands(game, "Island", 1);
    const relic = spawn(game, "Darksteel Relic", B);
    cast(game, card);
    expect(zone(game, relic)).toBe("hand");
  });
});

describe("the undaunted cards", () => {
  it("Curtains' Call destroys two target creatures", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Curtains' Call"), { targets: [ref(x), ref(y)] });
    expect([zone(game, x), zone(game, y)]).toEqual(["graveyard", "graveyard"]);
  });

  it("Seeds of Renewal returns up to two cards and exiles itself", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const a = toGraveyard(game, "Grizzly Bears");
    const b = toGraveyard(game, "Island");
    const seeds = toHand(game, "Seeds of Renewal");
    cast(game, seeds, { targets: [ref(a), ref(b)] });
    expect(hand(game)).toEqual(expect.arrayContaining([a, b]));
    expect(zone(game, seeds)).toBe("exile");
  });

  it("Divergent Transformations replaces each exiled creature — twice for a player who controlled both", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    const first = toLibrary(game, "Craw Wurm", B);
    const second = toLibrary(game, "Serra Angel", B);
    cast(game, toHand(game, "Divergent Transformations"), { targets: [ref(x), ref(y)] });
    expect([zone(game, x), zone(game, y)]).toEqual(["exile", "exile"]);
    expect([zone(game, first), zone(game, second)]).toEqual(["battlefield", "battlefield"]);
    expect(graveyard(game, A)).toHaveLength(1);
  });

  it("Divergent Transformations replaces one for each of two players", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const myWurm = toLibrary(game, "Craw Wurm", A);
    const theirWurm = toLibrary(game, "Craw Wurm", B);
    cast(game, toHand(game, "Divergent Transformations"), { targets: [ref(mine), ref(theirs)] });
    expect([zone(game, myWurm), zone(game, theirWurm)]).toEqual(["battlefield", "battlefield"]);
    expect(game.state.objects[myWurm].controller).toBe(A);
    expect(game.state.objects[theirWurm].controller).toBe(B);
  });
});
