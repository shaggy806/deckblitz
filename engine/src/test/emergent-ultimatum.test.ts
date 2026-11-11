/**
 * Emergent Ultimatum: "Search your library for up to three monocolored cards
 * with different names and exile them. An opponent chooses one of those
 * cards. Shuffle that card into your library. You may cast the other cards
 * without paying their mana costs. Exile Emergent Ultimatum."
 *
 * The finds are exiled before the opponent chooses (the choice is among cards
 * in exile, `look-and-choose`'s `"exiled-this-way"`), the library is shuffled
 * once whatever was found (rule 701.24d — the search owes it, `shufflesLater`),
 * and the others are cast only as this resolves, or stay exiled.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { GameEvent } from "../events.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, pickFromZone, table, toHand, toLibrary, zone } from "./harness.js";

type Cast = Extract<Action, { type: "cast-spell" }>;

const mana = (game: Game): void => {
  lands(game, "Swamp", 2);
  lands(game, "Forest", 3);
  lands(game, "Island", 2);
};

/** How many times alice's library has been shuffled since `from`. */
const shuffles = (game: Game, from: number): number =>
  game.state.eventLog.slice(from).filter((e: GameEvent) => e.type === "library-shuffled" && e.player === A).length;

const free = (card: ObjectId): Cast => ({ type: "cast-spell", player: A, card, targets: [], via: "effect", free: true });

describe("Emergent Ultimatum", () => {
  it("exiles the finds, an opponent shuffles one back, and the others may be cast free as it resolves", () => {
    const { game, a, b } = table();
    mana(game);
    const bears = toLibrary(game, "Grizzly Bears");
    const dragon = toLibrary(game, "Shivan Dragon");
    const opt = toLibrary(game, "Opt");
    const ring = toLibrary(game, "Sol Ring"); // colorless: not monocolored
    const growth = toLibrary(game, "Growth Spiral"); // two colours
    const searched = pickFromZone(a, bears, dragon, opt);
    let zonesAsChosen: string[] = [];
    let offered: readonly ObjectId[] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      zonesAsChosen = [bears, dragon, opt].map((id) => zone(game, id));
      return [dragon];
    };
    const from = game.state.eventLog.length;
    const ultimatum = toHand(game, "Emergent Ultimatum");
    cast(game, ultimatum, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "cast-now");

    // Only the monocolored cards could be found.
    expect(searched.offered).toContain(bears);
    expect(searched.offered).not.toContain(ring);
    expect(searched.offered).not.toContain(growth);
    // All three were in exile when bob chose among them.
    expect(zonesAsChosen).toEqual(["exile", "exile", "exile"]);
    expect([...offered].sort()).toEqual([bears, dragon, opt].sort());
    // His pick went back, with the one shuffle.
    expect(zone(game, dragon)).toBe("library");
    expect(shuffles(game, from)).toBe(1);

    // The other two may be cast, free, a creature card too (timing ignored).
    const offer = game.legalActions(A).find((o) => o.kind === "cast-now");
    expect(offer?.kind === "cast-now" && [...offer.cards].sort()).toEqual([bears, opt].sort());
    game.dispatch({ type: "cast-now", player: A, cast: free(bears) });
    game.advanceUntil((s) => s.awaiting?.kind === "cast-now");
    // Opt is still on offer; alice declines it.
    game.dispatch({ type: "cast-now", player: A, cast: null });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);

    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, opt)).toBe("exile");
    expect(zone(game, ultimatum)).toBe("exile");
    // No mana was spent on the Bears: all seven lands paid the Ultimatum.
    expect(shuffles(game, from)).toBe(1);
  });

  it("with one card found, the opponent must choose it, and nothing is left to cast", () => {
    const { game, a, b } = table();
    mana(game);
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    let asked = 0;
    b.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return [...eligible];
    };
    const from = game.state.eventLog.length;
    const ultimatum = toHand(game, "Emergent Ultimatum");
    cast(game, ultimatum);
    expect(zone(game, bears)).toBe("library");
    expect(asked).toBeLessThanOrEqual(1);
    expect(shuffles(game, from)).toBe(1);
    expect(zone(game, ultimatum)).toBe("exile");
  });

  it("finding nothing still shuffles the library once, and asks nobody", () => {
    const { game, a, b } = table();
    mana(game);
    toLibrary(game, "Grizzly Bears");
    pickFromZone(a);
    let asked = 0;
    b.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    const from = game.state.eventLog.length;
    const ultimatum = toHand(game, "Emergent Ultimatum");
    cast(game, ultimatum);
    expect(asked).toBe(0);
    expect(shuffles(game, from)).toBe(1);
    expect(zone(game, ultimatum)).toBe("exile");
  });

  it("two cards with the same name can't both be found", () => {
    const { game, a } = table();
    mana(game);
    const first = toLibrary(game, "Grizzly Bears");
    const second = toLibrary(game, "Grizzly Bears");
    let both: string | null = null;
    let one: string | null = "unasked";
    a.chooseFromZoneFn = () => {
      both = game.canDispatch({ type: "choose-from-zone", player: A, chosen: [first, second] });
      one = game.canDispatch({ type: "choose-from-zone", player: A, chosen: [second] });
      return [second];
    };
    cast(game, toHand(game, "Emergent Ultimatum"));
    expect(both).not.toBeNull();
    expect(one).toBeNull();
  });

  it("with several opponents, the caster picks which one chooses", () => {
    const { game, a, b, c } = table({ players: 3 });
    mana(game);
    const bears = toLibrary(game, "Grizzly Bears");
    const opt = toLibrary(game, "Opt");
    pickFromZone(a, bears, opt);
    let bobAsked = 0;
    b.chooseFromZoneFn = (_view, eligible) => {
      bobAsked += 1;
      return [eligible[0]];
    };
    let carolSaw: readonly ObjectId[] = [];
    c.chooseFromZoneFn = (_view, eligible) => {
      carolSaw = eligible;
      return [opt];
    };
    // Alice names carol: one mode per opponent, in turn order.
    let whoModes = 0;
    a.chooseModesFn = (_view, _min, _max, modes) => {
      whoModes = modes?.length ?? 0;
      return [1];
    };
    cast(game, toHand(game, "Emergent Ultimatum"), { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "cast-now" || (s.zones.shared.stack.length === 0 && s.awaiting === null));
    expect(whoModes).toBe(2);
    expect(bobAsked).toBe(0);
    expect([...carolSaw].sort()).toEqual([bears, opt].sort());
    expect(zone(game, opt)).toBe("library");
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.awaiting?.kind).toBe("cast-now");
  });
});
