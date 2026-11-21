/**
 * "The owner of target nonland permanent puts it into their library second
 * from the top or on the bottom" (Deem Inferior): `put-on-library`'s
 * `{ ownerChooses: [{ fromTop: 2 }, "bottom"] }`, the owner asked as it
 * resolves.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, settle, spawn, table, toHand } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

describe("Deem Inferior", () => {
  it("costs {1} less per card drawn this turn; the owner picks second from the top", () => {
    const { game, b } = table();
    lands(game, "Island", 2);
    const spell = toHand(game, "Deem Inferior");
    const angel = spawn(game, "Serra Angel", B);
    expect(castOffers(game, spell)).toHaveLength(0);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    let asked: readonly string[] = [];
    b.chooseModesFn = (_view, _min, _max, texts) => {
      asked = texts;
      return [0];
    };
    cast(game, spell, { targets: [ref(angel)] });
    expect(asked).toEqual(["Put it second from the top of your library", "Put it on the bottom of your library"]);
    expect(library(game, B)[1]).toBe(angel);
  });

  it("the owner may pick the bottom", () => {
    const { game, b } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    b.chooseModesFn = () => [1];
    cast(game, toHand(game, "Deem Inferior"), { targets: [ref(bears)] });
    const lib = library(game, B);
    expect(lib[lib.length - 1]).toBe(bears);
  });

  it("can't target a land", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const [land] = lands(game, "Forest", 1, B);
    expect(() => cast(game, toHand(game, "Deem Inferior"), { targets: [ref(land!)] })).toThrow();
  });
});
