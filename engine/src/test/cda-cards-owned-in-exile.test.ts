import { describe, expect, it } from "vitest";

import { A, B, pt, spawn, table, toExile, toHand } from "./harness.js";

// A characteristic-defining ability counting the cards its controller owns in
// exile (rule 604.3: in every zone, its owner's off the battlefield) — the
// `aggregate` `count` `in: "exile"` with `ownedBy: "you"`: Cosmogoyf.

describe("Cosmogoyf", () => {
  it("is as big as the cards you own in exile, plus one toughness", () => {
    const { game } = table();
    const goyf = spawn(game, "Cosmogoyf");
    expect(pt(game, goyf)).toEqual({ power: 0, toughness: 1 });
    toExile(game, "Grizzly Bears");
    toExile(game, "Lightning Bolt");
    toExile(game, "Grizzly Bears", B);
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 3 });
  });

  it("counts a card you own exiled face down, and not a card an opponent owns that you exiled", () => {
    const { game } = table();
    const goyf = spawn(game, "Cosmogoyf");
    const hidden = toExile(game, "Grizzly Bears");
    game.state.objects[hidden].exiledFaceDown = { lookers: [A] };
    const theirs = toExile(game, "Grizzly Bears", B);
    game.state.objects[theirs].controller = A;
    expect(pt(game, goyf)).toEqual({ power: 1, toughness: 2 });
  });

  it("works in every zone: in a hand for its owner, and counts itself in exile (the ruling)", () => {
    const { game } = table();
    toExile(game, "Grizzly Bears");
    const inHand = toHand(game, "Cosmogoyf");
    expect(pt(game, inHand)).toEqual({ power: 1, toughness: 2 });
    const exiled = toExile(game, "Cosmogoyf");
    expect(pt(game, exiled)).toEqual({ power: 2, toughness: 3 });
    const bobs = toHand(game, "Cosmogoyf", B);
    expect(pt(game, bobs)).toEqual({ power: 0, toughness: 1 });
  });
});
