/**
 * Time counters that reach a suspended card in exile: adds and removes, a target
 * or a "each", and exiling a card with time counters as a spell resolves or from
 * a hand.
 *
 * Proving cards: Shivan Sand-Mage, Jhoira's Timebug, Pardic Dragon, Curse of the
 * Cabal, Dust of Moments, Charnel Serenade, Gandalf of the Secret Fire, Alaundo
 * the Seer.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

type G = ReturnType<typeof table>["game"];

/** `card` suspended the honest way: from a hand, for its suspend cost. */
const suspend = (game: G, name: string, cost: readonly [string, number], player: PlayerId = A): ObjectId => {
  const card = toHand(game, name, player);
  lands(game, cost[0], cost[1], player);
  game.dispatch({ type: "suspend", player, card } as Action);
  settle(game);
  expect(game.state.objects[card].suspended).toBe(true);
  return card;
};
const time = (game: G, id: ObjectId): number => game.state.objects[id].counters.time ?? 0;

describe("a target that reaches a suspended card", () => {
  it("Shivan Sand-Mage takes two off a suspended card, and casts it when the last comes off", () => {
    const { game, a } = table();
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    expect(time(game, dragon)).toBe(2);
    pickModes(a, 0);
    a.chooseTargetsFn = () => [ref(dragon)];
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: dragon, targets: [], via: "effect", free: true });
    enter(game, "Shivan Sand-Mage");
    expect(time(game, dragon)).toBe(0);
    expect(zone(game, dragon)).toBe("battlefield");
    // A creature cast from suspend has haste (rule 702.62a).
    expect(keywords(game, dragon).has("haste")).toBe(false);
    expect(game.state.objects[dragon].hastyUntilItLeaves).toBe(true);
  });

  it("Shivan Sand-Mage's other mode puts two on a suspended card or a permanent with a time counter", () => {
    const { game, a } = table();
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    pickModes(a, 1);
    a.chooseTargetsFn = () => [ref(dragon)];
    enter(game, "Shivan Sand-Mage");
    expect(time(game, dragon)).toBe(4);
    expect(game.state.objects[dragon].suspended).toBe(true);
  });

  it("Jhoira's Timebug adds or removes on a permanent or card with one, and asks nothing of one without", () => {
    const { game, a, b } = table();
    const bug = spawn(game, "Jhoira's Timebug");
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    activate(game, bug, 0, { targets: [ref(dragon)] });
    expect(time(game, dragon)).toBe(3);
    game.state.objects[bug].tapped = false;
    pickModes(a, 0);
    activate(game, bug, 0, { targets: [ref(dragon)] });
    expect(time(game, dragon)).toBe(2);
    game.state.objects[bug].tapped = false;
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    activate(game, bug, 0, { targets: [ref(bear)] });
    expect(asked).toBe(0);
    // Not a card an opponent owns: "suspended card you own".
    const theirs = toExile(game, "Pardic Dragon", B);
    game.state.objects[theirs].suspended = true;
    game.state.objects[theirs].counters.time = 2;
    game.state.objects[bug].tapped = false;
    expect(() => activate(game, bug, 0, { targets: [ref(theirs)] })).toThrow();
    void b;
  });
});

describe("a suspended card's own triggers put counters on it", () => {
  it("Pardic Dragon: the opponent who cast a spell may add one", () => {
    const { game, b } = table();
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    pickModes(b, 0);
    nextTurn(game);
    lands(game, "Island", 1, B);
    cast(game, toHand(game, "Opt", B), { player: B });
    expect(time(game, dragon)).toBe(3);
    pickModes(b);
    lands(game, "Island", 1, B);
    cast(game, toHand(game, "Opt", B), { player: B });
    expect(time(game, dragon)).toBe(3);
  });

  it("Pardic Dragon's own controller's spell doesn't trigger it", () => {
    const { game } = table();
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(time(game, dragon)).toBe(2);
  });

  it("Curse of the Cabal: a player may sacrifice in their own upkeep to add two", () => {
    const { game, a, b } = table();
    const curse = suspend(game, "Curse of the Cabal", ["Swamp", 4]);
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickModes(b, 0);
    b.chooseSacrificesFn = () => [bear];
    nextTurn(game, "draw");
    expect(zone(game, bear)).toBe("graveyard");
    expect(time(game, curse)).toBe(4);
  });

  it("Curse of the Cabal's spell: half rounded down, of what they choose", () => {
    const { game, b } = table();
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    lands(game, "Swamp", 10);
    b.chooseSacrificesFn = () => [bears[0]];
    cast(game, toHand(game, "Curse of the Cabal"), { targets: [ref(B)] });
    expect(bears.filter((id) => zone(game, id) === "graveyard")).toEqual([bears[0]]);
  });
});

describe("each suspended card", () => {
  it("Dust of Moments takes two off each, and off each permanent", () => {
    const { game, a } = table();
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    const hers = suspend(game, "Curse of the Cabal", ["Swamp", 4]);
    game.state.objects[hers].counters.time = 5;
    a.chooseCastNowFn = () => null;
    pickModes(a, 0);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Dust of Moments"), { modes: [0] });
    expect(time(game, hers)).toBe(3);
    expect(time(game, dragon)).toBe(0);
  });

  it("Dust of Moments puts two on each suspended card, and a permanent only with one", () => {
    const { game, a } = table();
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    const bear = spawn(game, "Grizzly Bears");
    const vanishing = spawn(game, "Grizzly Bears");
    game.state.objects[vanishing].counters.time = 1;
    pickModes(a, 1);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Dust of Moments"), { modes: [1] });
    expect(time(game, dragon)).toBe(4);
    expect(time(game, vanishing)).toBe(3);
    expect(time(game, bear)).toBe(0);
  });
});

describe("exiled with time counters", () => {
  it("Charnel Serenade exiles itself with three, suspended, after its finality return", () => {
    const { game, a } = table();
    const bear = toGraveyard(game, "Grizzly Bears");
    const serenade = toHand(game, "Charnel Serenade");
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(bear) ? [bear] : []);
    lands(game, "Swamp", 6);
    cast(game, serenade);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].counters.finality).toBe(1);
    expect(zone(game, serenade)).toBe("exile");
    expect(graveyard(game)).not.toContain(serenade);
    expect(time(game, serenade)).toBe(3);
    expect(game.state.objects[serenade].suspended).toBe(true);
  });

  it("Gandalf: an instant from hand on an opponent's turn is exiled with three and gains suspend", () => {
    const { game } = table();
    spawn(game, "Gandalf of the Secret Fire");
    nextTurn(game);
    game.dispatch({ type: "pass-priority", player: B } as Action);
    lands(game, "Island", 1);
    const opt = toHand(game, "Opt");
    cast(game, opt);
    expect(zone(game, opt)).toBe("exile");
    expect(time(game, opt)).toBe(3);
    expect(game.state.objects[opt].suspended).toBe(true);
  });

  it("Gandalf: not on your own turn", () => {
    const { game } = table();
    spawn(game, "Gandalf of the Secret Fire");
    lands(game, "Island", 1);
    const opt = toHand(game, "Opt");
    cast(game, opt);
    expect(zone(game, opt)).toBe("graveyard");
  });

  it("Alaundo draws, exiles with counters equal to mana value, and takes one off each other card", () => {
    const { game, a } = table();
    const alaundo = spawn(game, "Alaundo the Seer");
    const giant = toHand(game, "Hill Giant");
    const dragon = suspend(game, "Pardic Dragon", ["Mountain", 2]);
    const start = hand(game).length;
    pickFromZone(a, giant);
    activate(game, alaundo, 0);
    expect(zone(game, giant)).toBe("exile");
    expect(time(game, giant)).toBe(4);
    // A card drawn, a card exiled.
    expect(hand(game).length).toBe(start);
    expect(time(game, dragon)).toBe(1);
    // Hill Giant has no suspend: not suspended, so no upkeep takes one off it.
    expect(game.state.objects[giant].suspended).not.toBe(true);
    expect(game.state.objects[giant].timeCast).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(time(game, giant)).toBe(4);
  });

  it("the last counter off Alaundo's card offers the free cast, haste until end of turn", () => {
    const { game, a } = table();
    const alaundo = spawn(game, "Alaundo the Seer");
    const first = toHand(game, "Grizzly Bears");
    pickFromZone(a, first);
    activate(game, alaundo, 0);
    expect(time(game, first)).toBe(2);
    const others = [toHand(game, "Grizzly Bears"), toHand(game, "Grizzly Bears")];
    game.state.objects[alaundo].tapped = false;
    pickFromZone(a, others[0]);
    activate(game, alaundo, 0);
    expect(time(game, first)).toBe(1);
    game.state.objects[alaundo].tapped = false;
    pickFromZone(a, others[1]);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: first, targets: [], via: "effect", free: true });
    activate(game, alaundo, 0);
    expect(zone(game, first)).toBe("battlefield");
    expect(keywords(game, first).has("haste")).toBe(true);
    // Until end of turn, not for as long as it stays.
    expect(game.state.objects[first].hastyUntilItLeaves).not.toBe(true);
    nextTurn(game);
    expect(keywords(game, first).has("haste")).toBe(false);
  });

  it("a mana value of 0 gets no counter and no ability", () => {
    const { game, a } = table();
    const alaundo = spawn(game, "Alaundo the Seer");
    const thopter = toHand(game, "Ornithopter");
    pickFromZone(a, thopter);
    activate(game, alaundo, 0);
    expect(zone(game, thopter)).toBe("exile");
    expect(time(game, thopter)).toBe(0);
    expect(game.state.objects[thopter].timeCast).not.toBe(true);
  });
});
