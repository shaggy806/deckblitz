/**
 * "Its owner puts it on their choice of the top or bottom of their library"
 * (`put-on-library`'s `{ ownerChooses }`): the owner of the target, not its
 * controller, picks as the spell resolves.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, spawn, table, toHand } from "./harness.js";

describe("put-on-library with the owner's choice", () => {
  it("the owner picks the bottom", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    let asked: readonly string[] = [];
    b.chooseModesFn = (_view, _min, _max, texts) => {
      asked = texts;
      return [1];
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Misleading Motes"), { targets: [ref(bears)] });
    expect(asked).toEqual(["Put it on top of your library", "Put it on the bottom of your library"]);
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1]).toBe(bears);
  });

  it("a stolen creature's owner chooses, not its controller", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].controller = A;
    let aAsked = false;
    a.chooseModesFn = (_view, min) => {
      aAsked = true;
      return min > 0 ? [0] : [];
    };
    b.chooseModesFn = () => [0];
    lands(game, "Island", 4);
    cast(game, toHand(game, "Misleading Motes"), { targets: [ref(bears)] });
    expect(aAsked).toBe(false);
    expect(game.state.zones.perPlayer[B].library[0]).toBe(bears);
  });
});
