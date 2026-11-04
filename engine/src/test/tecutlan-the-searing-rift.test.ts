/**
 * Brass's Tunnel-Grinder // Tecutlan, the Searing Rift: discard any number and
 * draw that many plus one; a bore counter at each end step you descended, three
 * of them transforming it; and the back's cast trigger, keyed to mana from this
 * very permanent (`manaFrom.fromSource`), discovering the spell's mana value.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, cast, counters, enter, graveyard, hand, lands, nextTurn, quiet, ref, settle, spawn, subtypes, table, toHand, toLibrary, toStep, types, zone } from "./harness.js";

/** The Tunnel-Grinder on its back face. */
function tecutlanOn(game: Game): ObjectId {
  const id = spawn(game, "Brass's Tunnel-Grinder");
  game.state.objects[id].face = 1;
  return id;
}

/** Top of the library, first to last. */
function stack(game: Game, ...names: readonly string[]): ObjectId[] {
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}

/** Run on, declining every discover's cast; the cards offered. */
function declineOffers(game: Game): ObjectId[] {
  const offered: ObjectId[] = [];
  for (let i = 0; i < 500 && !quiet(game.state); i += 1) {
    const a = game.state.awaiting;
    if (a?.kind === "cast-now") {
      offered.push(...a.cards);
      game.dispatch({ type: "cast-now", player: A, cast: null });
    } else if (a !== null) {
      throw new Error(`unexpected ${a.kind}`);
    } else {
      game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
    }
  }
  return offered;
}

describe("Brass's Tunnel-Grinder", () => {
  it("discards any number and draws that many plus one; none draws one", () => {
    const { game, a } = table();
    toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    const size = hand(game).length;
    a.chooseDiscardsFn = (cards) => cards.slice(0, 2).map((c) => c.id);
    enter(game, "Brass's Tunnel-Grinder");
    expect(graveyard(game, A)).toHaveLength(2);
    expect(hand(game)).toHaveLength(size + 1);

    const none = table();
    const before = hand(none.game).length;
    none.a.chooseDiscardsFn = () => [];
    enter(none.game, "Brass's Tunnel-Grinder");
    expect(graveyard(none.game, A)).toHaveLength(0);
    expect(hand(none.game)).toHaveLength(before + 1);
  });

  it("gains a bore counter only at an end step you descended, and transforms on the third", () => {
    const { game } = table();
    const grinder = spawn(game, "Brass's Tunnel-Grinder");
    toStep(game, "end");
    expect(counters(game, grinder, "bore")).toBe(0);

    // A mill of a permanent card is the descend (`toGraveyard` is a test
    // placement, not the event).
    const descend = (): void => {
      stack(game, "Grizzly Bears");
      game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 }, []);
    };
    for (let turn = 1; turn <= 2; turn += 1) {
      nextTurn(game);
      nextTurn(game);
      descend();
      descend();
      toStep(game, "end");
      settle(game);
      // Once a step, however many times you descended.
      expect(counters(game, grinder, "bore")).toBe(turn);
      expect(game.state.objects[grinder].face ?? 0).toBe(0);
    }

    nextTurn(game);
    nextTurn(game);
    descend();
    toStep(game, "end");
    settle(game);
    expect(counters(game, grinder, "bore")).toBe(0);
    expect(game.state.objects[grinder].face).toBe(1);
    expect(types(game, grinder)).toEqual(["land"]);
    expect(subtypes(game, grinder)).toEqual(["Cave"]);
  });
});

describe("Tecutlan, the Searing Rift", () => {
  it("a permanent spell using its mana discovers that spell's mana value", () => {
    const { game } = table();
    tecutlanOn(game);
    lands(game, "Mountain", 1);
    // Mana value 2: Hill Giant (4) is passed over, the Elves are found.
    const [giant, elves] = stack(game, "Hill Giant", "Llanowar Elves");
    const stone = toHand(game, "Mind Stone");
    cast(game, stone, { settle: false });
    expect(declineOffers(game)).toEqual([elves]);
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, giant)).toBe("library");
    expect(zone(game, stone)).toBe("battlefield");
  });

  it("uses the value chosen for X", () => {
    const { game } = table();
    tecutlanOn(game);
    lands(game, "Forest", 4);
    // Endless One is {X}: X = 5 finds a mana value 4 card.
    const [giant] = stack(game, "Hill Giant");
    cast(game, toHand(game, "Endless One"), { x: 5, settle: false });
    expect(declineOffers(game)).toEqual([giant]);
  });

  it("not another source's mana, and not an instant or sorcery with its own", () => {
    // Forests alone pay: Tecutlan's mana isn't spent.
    const other = table().game;
    const tapped = tecutlanOn(other);
    other.state.objects[tapped].tapped = true;
    lands(other, "Forest", 2);
    const [elves] = stack(other, "Llanowar Elves");
    cast(other, toHand(other, "Grizzly Bears"), { settle: false });
    expect(declineOffers(other)).toEqual([]);
    expect(zone(other, elves)).toBe("library");

    // Its mana on a non-permanent spell: no discover.
    const instant = table().game;
    tecutlanOn(instant);
    const victim = spawn(instant, "Grizzly Bears", B);
    const [bolted] = stack(instant, "Llanowar Elves");
    cast(instant, toHand(instant, "Lightning Bolt"), { targets: [ref(victim)], settle: false });
    expect(declineOffers(instant)).toEqual([]);
    expect(zone(instant, bolted)).toBe("library");
  });

  it("its mana floated first still counts", () => {
    const { game } = table();
    const tecutlan = tecutlanOn(game);
    lands(game, "Mountain", 1);
    const [elves] = stack(game, "Llanowar Elves");
    activate(game, tecutlan, 0, { settle: false });
    cast(game, toHand(game, "Mind Stone"), { settle: false });
    expect(declineOffers(game)).toEqual([elves]);
  });
});
