/**
 * Looking at another player's library and arranging it: the caster looks at
 * a target player's top cards and orders them back (Ransack: some on the
 * bottom in any order, the rest on top in any order; Dimir Machinations:
 * some exiled, the rest on top in any order), and a target opponent looks at
 * and orders the top of **yours** (Tahngarth's Glare — `look-and-choose`'s
 * `chooser: "that-player"` on a library).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, table, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
/** `names` on top of `player`'s library, the first on top; their ids in that order. */
const onTop = (game: Game, names: readonly string[], player: PlayerId): ObjectId[] =>
  [...names]
    .reverse()
    .map((name) => toLibrary(game, name, player))
    .reverse();

describe("Ransack: the caster arranges both ends of the target player's library", () => {
  it("puts the picked cards on the bottom in the order picked, and the rest on top in the order asked next", () => {
    const { game, a, b } = table();
    lands(game, "Island", 4);
    const [bears, giant, wurm, elf, ox] = onTop(game, ["Grizzly Bears", "Hill Giant", "Craw Wurm", "Llanowar Elves", "Bad Moon"], B);
    const asked: { eligible: readonly ObjectId[]; min: number }[] = [];
    let call = 0;
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked.push({ eligible, min });
      call += 1;
      // First the bottom: Craw Wurm, then Bad Moon beneath it. Then the
      // order of the three left on top.
      return call === 1 ? [wurm, ox] : [elf, bears, giant];
    };
    let bAsked = 0;
    b.chooseFromZoneFn = (_view, eligible) => {
      bAsked += 1;
      return eligible;
    };
    cast(game, toHand(game, "Ransack"), { targets: [ref(B)] });
    expect(bAsked).toBe(0);
    expect(asked).toHaveLength(2);
    expect([...asked[0].eligible].sort()).toEqual([bears, giant, wurm, elf, ox].sort());
    expect(asked[0].min).toBe(0);
    expect(library(game, B).slice(0, 3)).toEqual([elf, bears, giant]);
    expect(library(game, B).slice(-2)).toEqual([wurm, ox]);
  });
});

describe("Dimir Machinations: exile any number of the target player's top three, the rest back in any order", () => {
  it("exiles the picked card and orders the other two on top", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const [bears, giant, wurm] = onTop(game, ["Grizzly Bears", "Hill Giant", "Craw Wurm"], B);
    let call = 0;
    a.chooseFromZoneFn = () => {
      call += 1;
      return call === 1 ? [giant] : [wurm, bears];
    };
    cast(game, toHand(game, "Dimir Machinations"), { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("exile");
    expect(library(game, B).slice(0, 2)).toEqual([wurm, bears]);
  });

  it("can exile nothing, only reordering", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const [bears, giant, wurm] = onTop(game, ["Grizzly Bears", "Hill Giant", "Craw Wurm"], B);
    let call = 0;
    a.chooseFromZoneFn = () => {
      call += 1;
      return call === 1 ? [] : [giant, wurm, bears];
    };
    cast(game, toHand(game, "Dimir Machinations"), { targets: [ref(B)] });
    expect(library(game, B).slice(0, 3)).toEqual([giant, wurm, bears]);
  });
});

describe("Tahngarth's Glare: you order their top three, then they order yours", () => {
  it("asks the caster about the opponent's library, then the opponent about the caster's", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 1);
    const theirs = onTop(game, ["Grizzly Bears", "Hill Giant", "Craw Wurm"], B);
    const mine = onTop(game, ["Llanowar Elves", "Bad Moon", "Glorious Anthem"], A);
    const order: string[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      order.push("a");
      expect([...eligible].sort()).toEqual([...theirs].sort());
      return [theirs[2], theirs[1], theirs[0]];
    };
    b.chooseFromZoneFn = (_view, eligible) => {
      order.push("b");
      expect([...eligible].sort()).toEqual([...mine].sort());
      return [mine[1], mine[2], mine[0]];
    };
    cast(game, toHand(game, "Tahngarth's Glare"), { targets: [ref(B)] });
    expect(order).toEqual(["a", "b"]);
    expect(library(game, B).slice(0, 3)).toEqual([theirs[2], theirs[1], theirs[0]]);
    expect(library(game, A).slice(0, 3)).toEqual([mine[1], mine[2], mine[0]]);
    // The opponent saw the caster's cards in their own view of the choice.
    expect(game.state.awaiting).toBeNull();
  });

  it("shows the caster's cards to the opponent choosing, as theirs to order", () => {
    const { game, b } = table();
    lands(game, "Mountain", 1);
    onTop(game, ["Grizzly Bears", "Hill Giant", "Craw Wurm"], B);
    const mine = onTop(game, ["Llanowar Elves", "Bad Moon", "Glorious Anthem"], A);
    let seen: readonly string[] = [];
    b.chooseFromZoneFn = (view, eligible) => {
      seen = eligible.map((id) => view.state.objects[id]?.cardName ?? "hidden");
      return eligible;
    };
    cast(game, toHand(game, "Tahngarth's Glare"), { targets: [ref(B)] });
    expect([...seen].sort()).toEqual(["Bad Moon", "Glorious Anthem", "Llanowar Elves"]);
    expect([...library(game, A).slice(0, 3)].sort()).toEqual([...mine].sort());
  });
});
