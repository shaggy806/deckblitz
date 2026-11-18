/**
 * "Reveal the top ten cards of your library. Starting with the next opponent
 * in turn order, each opponent chooses a different nonland card from among
 * them. Put the chosen cards into your hand and the rest on the bottom of your
 * library in a random order." (Manifold Insights — need key
 * effect:each-opponent-picks-from-shared-reveal): `look-and-choose`'s
 * `eachChooses`. One reveal; each opponent in turn from the next one picks
 * from what the ones before left (`pickersAfter`, rule 101.4); once the last
 * has chosen — or nothing is left that may be — every pick goes into the
 * caster's hand together and the rest to the bottom.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, hand, lands, table, toHand, toLibrary } from "./harness.js";

const TEN = [
  "Lightning Bolt",
  "Island",
  "Counterspell",
  "Island",
  "Grizzly Bears",
  "Island",
  "Hill Giant",
  "Island",
  "Island",
  "Island",
];

/** Alice's library, top first, and Manifold Insights in hand with the mana. */
function setUp(game: Game, library: readonly string[]): ObjectId {
  game.state.zones.perPlayer[A].library = [];
  for (const name of [...library].reverse()) toLibrary(game, name);
  lands(game, "Island", 3);
  return toHand(game, "Manifold Insights");
}

/** The seat picks the first card offered with this name, and records what it
 * was offered and when. */
function picks(seat: ScriptedController, game: Game, name: string, log: string[][], who: string): void {
  seat.chooseFromZoneFn = (_view, eligible) => {
    log.push([who, ...eligible.map((id) => game.state.objects[id].cardName).sort()]);
    const id = eligible.find((e) => game.state.objects[e].cardName === name);
    return id === undefined ? [] : [id];
  };
}

const names = (game: Game, ids: readonly ObjectId[]): string[] => ids.map((id) => game.state.objects[id].cardName).sort();
/** What has come into the player's hand since `before`, by name. */
const gained = (game: Game, before: readonly ObjectId[], player: PlayerId = A): string[] =>
  names(game, hand(game, player).filter((id) => !before.includes(id)));
const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Manifold Insights", () => {
  it("each opponent in turn from the next picks a different nonland card; the picks go into your hand, the rest to the bottom", () => {
    const { game, b, c, d } = table({ players: 4 });
    const card = setUp(game, [...TEN, "Shivan Dragon"]);
    const before = [...hand(game)];
    const log: string[][] = [];
    picks(b, game, "Hill Giant", log, "bob");
    picks(c, game, "Grizzly Bears", log, "carol");
    picks(d, game, "Counterspell", log, "dave");
    cast(game, card);
    expect(log).toEqual([
      ["bob", "Counterspell", "Grizzly Bears", "Hill Giant", "Lightning Bolt"],
      ["carol", "Counterspell", "Grizzly Bears", "Lightning Bolt"],
      ["dave", "Counterspell", "Lightning Bolt"],
    ]);
    expect(gained(game, before)).toEqual(["Counterspell", "Grizzly Bears", "Hill Giant"]);
    // The eleventh card is on top now; the seven not chosen are at the bottom.
    expect(game.state.objects[library(game)[0]].cardName).toBe("Shivan Dragon");
    expect(names(game, library(game).slice(1))).toEqual(["Island", "Island", "Island", "Island", "Island", "Island", "Lightning Bolt"]);
    // One reveal of the ten, not one a picker.
    expect(game.eventsOfType("cards-revealed")).toHaveLength(1);
  });

  it("puts every nonland card into your hand when there are fewer than opponents, asking nobody with nothing left", () => {
    const { game, b, c } = table({ players: 3 });
    const card = setUp(game, ["Island", "Lightning Bolt", "Island", "Island"]);
    const before = [...hand(game)];
    const log: string[][] = [];
    picks(b, game, "Lightning Bolt", log, "bob");
    picks(c, game, "Lightning Bolt", log, "carol");
    cast(game, card);
    expect(log).toEqual([["bob", "Lightning Bolt"]]);
    expect(gained(game, before)).toEqual(["Lightning Bolt"]);
    expect(library(game)).toHaveLength(3);
  });

  it("asks nobody when nothing revealed is nonland", () => {
    const { game, b } = table();
    const card = setUp(game, ["Island", "Island"]);
    const before = hand(game).length;
    let asked = false;
    b.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    cast(game, card);
    expect(asked).toBe(false);
    expect(hand(game)).toHaveLength(before - 1);
    expect(library(game)).toHaveLength(2);
  });

  it("with one opponent, they choose the one card you get", () => {
    const { game, b } = table();
    const card = setUp(game, TEN);
    const before = [...hand(game)];
    const log: string[][] = [];
    picks(b, game, "Grizzly Bears", log, "bob");
    cast(game, card);
    expect(log).toHaveLength(1);
    expect(gained(game, before)).toEqual(["Grizzly Bears"]);
    // The log says who chose it, and that it went into Alice's hand.
    const chosen = game.eventsOfType("cards-chosen-from-zone");
    expect(chosen.map((e) => e.player)).toEqual([B, A]);
  });

  it("starts with the next opponent after its controller, round the table", () => {
    const { game, a, b, d } = table({ players: 4 });
    game.state.zones.perPlayer[C].library = [];
    for (const name of [...TEN].reverse()) toLibrary(game, name, C);
    const before = [...hand(game, C)];
    const order: string[] = [];
    const seat = (s: ScriptedController, who: string) => {
      s.chooseFromZoneFn = (_view, eligible) => {
        order.push(who);
        return eligible.slice(0, 1);
      };
    };
    seat(a, "alice");
    seat(b, "bob");
    seat(d, "dave");
    const effect = game.registry.get("Manifold Insights").effect;
    if (effect === undefined || effect === null) throw new Error("no effect");
    game.debugApplyEffect(C, effect, []);
    game.advanceUntil((s) => s.awaiting === null);
    expect(order).toEqual(["dave", "alice", "bob"]);
    expect(gained(game, before, C)).toHaveLength(3);
  });
});
