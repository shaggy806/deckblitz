/**
 * "If this creature would untap during your untap step, remove a +1/+1
 * counter from it instead. If you do, untap it" (Bewitching Leechcraft's
 * granted ability) and "if a permanent with a wind counter on it would untap
 * during its controller's untap step, remove all wind counters from it
 * instead" (Freyalise's Winds): the `would-untap-in-untap-step` replacement
 * (rules 502.3, 614.6), applied one at a time beside a stun counter (122.1d),
 * its controller choosing which goes first (616.1) and the rest applying to
 * the untap an "if you do, untap it" leaves (616.1f).
 */
import { describe, expect, it } from "vitest";

import type { ReplacementOrderOffer } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, cast, counters, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

/** Alice's Leechcraft on her own creature (so her untap step is the one). */
function leeched(counter: number): { game: Game; a: ReturnType<typeof table>["a"]; bears: ObjectId } {
  const { game, a } = table();
  const bears = spawn(game, "Grizzly Bears");
  if (counter > 0) game.state.objects[bears].counters["+1/+1"] = counter;
  lands(game, "Island", 2);
  cast(game, toHand(game, "Bewitching Leechcraft"), { targets: [ref(bears)] });
  return { game, a, bears };
}

describe("Bewitching Leechcraft", () => {
  it("taps the creature; in its controller's untap step a +1/+1 counter comes off and it untaps", () => {
    const { game, bears } = leeched(2);
    expect(tapped(game, bears)).toBe(true);
    nextTurn(game); // bob's: not its controller's untap step
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, bears)).toBe(2);
    nextTurn(game);
    expect(tapped(game, bears)).toBe(false);
    expect(counters(game, bears)).toBe(1);
  });

  it("with no +1/+1 counter to remove, it doesn't untap", () => {
    const { game, bears } = leeched(0);
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, bears)).toBe(true);
  });

  it("beside a stun counter its controller chooses: Leechcraft first, then the stun counter replaces the untap", () => {
    const { game, a, bears } = leeched(1);
    game.state.objects[bears].counters.stun = 1;
    const asked: ReplacementOrderOffer[] = [];
    a.chooseReplacementOrderFn = (_view, offer) => {
      asked.push(offer);
      // The granted ability is the creature's own.
      return offer.options.findIndex((o) => o.name === "Grizzly Bears");
    };
    nextTurn(game);
    nextTurn(game);
    expect(asked.length).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, bears, "stun")).toBe(0);
    expect(tapped(game, bears)).toBe(true);
  });

  it("…or the stun counter first, and the +1/+1 counter stays", () => {
    const { game, a, bears } = leeched(1);
    game.state.objects[bears].counters.stun = 1;
    a.chooseReplacementOrderFn = (_view, offer) => offer.options.findIndex((o) => o.name === "Stun counter");
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, bears, "stun")).toBe(0);
    expect(tapped(game, bears)).toBe(true);
  });

  it("two Leechcrafts each take a counter, none asked", () => {
    const { game, a, bears } = leeched(3);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Bewitching Leechcraft"), { targets: [ref(bears)] });
    const asked: ReplacementOrderOffer[] = [];
    a.chooseReplacementOrderFn = (_view, offer) => {
      asked.push(offer);
      return 0;
    };
    nextTurn(game);
    nextTurn(game);
    expect(asked.length).toBe(0);
    expect(counters(game, bears)).toBe(1);
    expect(tapped(game, bears)).toBe(false);
  });
});

describe("Freyalise's Winds", () => {
  it("a permanent that becomes tapped gets a wind counter; its next untap removes them all instead", () => {
    const { game } = table();
    spawn(game, "Freyalise's Winds");
    // Tapped for mana: it became tapped.
    const forest = lands(game, "Forest", 1)[0];
    cast(game, toHand(game, "Llanowar Elves"));
    expect(tapped(game, forest)).toBe(true);
    expect(counters(game, forest, "wind")).toBe(1);
    nextTurn(game); // bob's: hers stays tapped
    expect(counters(game, forest, "wind")).toBe(1);
    nextTurn(game);
    expect(tapped(game, forest)).toBe(true);
    expect(counters(game, forest, "wind")).toBe(0);
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, forest)).toBe(false);
  });

  it("beside a stun counter either applies, and it stays tapped", () => {
    const { game, a } = table();
    spawn(game, "Freyalise's Winds");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    game.state.objects[bears].counters.wind = 2;
    game.state.objects[bears].counters.stun = 1;
    a.chooseReplacementOrderFn = (_view, offer) => offer.options.findIndex((o) => o.name === "Freyalise's Winds");
    nextTurn(game);
    nextTurn(game);
    expect(tapped(game, bears)).toBe(true);
    expect(counters(game, bears, "wind")).toBe(0);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});
