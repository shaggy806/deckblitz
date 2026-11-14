import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, cast, hand, lands, table, toHand, toLibrary } from "./harness.js";

/**
 * Picks taking turns over one revealed pile (`effect:alternating-picks-from-revealed`):
 * Memories Returning — you take one, the opponent you then choose bottoms
 * one, you take one, they bottom one, the last is yours. Each pick is a
 * `look-and-choose` of the library's top in order (rule 608.2c), the
 * opponent's with `chooser: "that-player"`.
 */

const FIVE = ["Lightning Bolt", "Grizzly Bears", "Shivan Dragon", "Hill Giant", "Craw Wurm"];

/** The seat picks, in order, the first card offered with each name. */
function picksInOrder(seat: ScriptedController, game: Game, names: string[]): { offered: string[][] } {
  const seen = { offered: [] as string[][] };
  const queue = [...names];
  seat.chooseFromZoneFn = (_view, eligible) => {
    seen.offered.push(eligible.map((id) => game.state.objects[id].cardName));
    const want = queue.shift();
    const id = eligible.find((e) => game.state.objects[e].cardName === want);
    return id === undefined ? [] : [id];
  };
  return seen;
}

function memories(players: 2 | 3, library: string[] | null) {
  const t = table({ players });
  const { game } = t;
  if (library !== null) {
    game.state.zones.perPlayer[A].library = [];
    for (const name of [...library].reverse()) toLibrary(game, name);
  }
  const card = toHand(game, "Memories Returning");
  lands(game, "Island", 4);
  return { ...t, card };
}

const names = (game: Game, ids: readonly string[]): string[] => ids.map((id) => game.state.objects[id as never].cardName);
const libraryOf = (game: Game, player: PlayerId = A): string[] => names(game, game.state.zones.perPlayer[player].library);

describe("alternating picks — Memories Returning", () => {
  it("you take one, they bottom one, you take one, they bottom one, the last is yours", () => {
    const t = memories(2, [...FIVE, "Wastes", "Wastes"]);
    const { game } = t;
    const mine = picksInOrder(t.a, game, ["Shivan Dragon", "Craw Wurm"]);
    const theirs = picksInOrder(t.b, game, ["Lightning Bolt", "Grizzly Bears"]);
    const before = hand(game).length;
    const seq = game.state.eventLog.length;
    cast(game, t.card);
    // The log says Bob bottomed his picks, not that he took them.
    expect(
      game.state.eventLog.slice(seq).filter((e) => e.type === "cards-chosen-from-zone" && e.player === B).map((e) => ("to" in e ? e.to : undefined)),
    ).toEqual(["library-bottom", "library-bottom"]);
    expect(mine.offered).toEqual([FIVE, ["Grizzly Bears", "Hill Giant", "Craw Wurm"]]);
    expect(theirs.offered).toEqual([
      ["Lightning Bolt", "Grizzly Bears", "Hill Giant", "Craw Wurm"],
      ["Grizzly Bears", "Hill Giant"],
    ]);
    // Three into the hand (the spell itself left it), two on the bottom in
    // the order they went.
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(names(game, hand(game))).toEqual(expect.arrayContaining(["Shivan Dragon", "Craw Wurm", "Hill Giant"]));
    expect(libraryOf(game)).toEqual(["Wastes", "Wastes", "Lightning Bolt", "Grizzly Bears"]);
  });

  it("the five are revealed to everyone", () => {
    const t = memories(2, [...FIVE, "Wastes"]);
    const { game } = t;
    const seq = game.state.eventLog.length;
    cast(game, t.card);
    const revealed = game.state.eventLog.slice(seq).find((e) => e.type === "cards-revealed");
    expect(revealed !== undefined && "objects" in revealed ? revealed.objects.length : 0).toBe(5);
  });

  it("a library of three: a bottomed card is never offered again", () => {
    const t = memories(2, ["Lightning Bolt", "Grizzly Bears", "Shivan Dragon"]);
    const { game } = t;
    const mine = picksInOrder(t.a, game, ["Shivan Dragon", "Grizzly Bears"]);
    picksInOrder(t.b, game, ["Lightning Bolt"]);
    cast(game, t.card);
    expect(mine.offered).toEqual([["Lightning Bolt", "Grizzly Bears", "Shivan Dragon"], ["Grizzly Bears"]]);
    expect(libraryOf(game)).toEqual(["Lightning Bolt"]);
  });

  it("at three players, the opponent you choose makes their picks", () => {
    const t = memories(3, [...FIVE, "Wastes"]);
    const { game } = t;
    picksInOrder(t.a, game, ["Shivan Dragon", "Craw Wurm"]);
    // Choose Carol, the second opponent offered.
    t.a.chooseModesFn = () => [1];
    const bob = picksInOrder(t.b, game, []);
    const carol = picksInOrder(t.c, game, ["Lightning Bolt", "Grizzly Bears"]);
    cast(game, t.card);
    expect(bob.offered).toEqual([]);
    expect(carol.offered.length).toBe(2);
    expect(libraryOf(game)).toEqual(["Wastes", "Lightning Bolt", "Grizzly Bears"]);
    void C;
    void B;
  });
});
