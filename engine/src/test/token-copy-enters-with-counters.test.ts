/**
 * `create-token-copy`'s `withCounters`: the copies enter with counters the
 * effect names, beside whatever else they enter with (rule 122.6) — an
 * additional effect of the copy effect, not a copiable value (707.9e).
 * Littjara Mirrorlake's "except it enters with an additional +1/+1 counter
 * on it" and Ochre Jelly's "the token enters with half that many +1/+1
 * counters on it, rounded down".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, activate, cast, counters, destroy, lands, named, nextTurn, pt, ref, spawn, table, toHand, zone } from "./harness.js";

/** The tokens named `name` alice controls. */
const tokens = (game: Game, name: string): ObjectId[] => named(game, name, A).filter((id) => game.state.objects[id].isToken === true);

/** A Mirrorlake with the lands to pay for it, at alice's main phase. */
function mirrorlake(game: Game): ObjectId {
  lands(game, "Forest", 3);
  lands(game, "Island", 2);
  const lake = spawn(game, "Littjara Mirrorlake");
  game.state.objects[lake].tapped = false; // it entered tapped
  return lake;
}

describe("Littjara Mirrorlake", () => {
  it("makes a copy that enters with a +1/+1 counter, and is sacrificed for it", () => {
    const { game } = table();
    const lake = mirrorlake(game);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, lake, 1, { targets: [ref(bears)] });
    expect(zone(game, lake)).toBe("graveyard");
    const [token] = tokens(game, "Grizzly Bears");
    expect(counters(game, token)).toBe(1);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(counters(game, bears)).toBe(0);
    // One placement, as it entered.
    const put = game.events.filter((e) => e.type === "counter-added" && e.object === token);
    expect(put).toHaveLength(1);
  });

  it("adds to what the copy enters with of its own, as one placement a replacement sees", () => {
    const { game } = table();
    const lake = mirrorlake(game);
    spawn(game, "Hardened Scales");
    const shimmerer = spawn(game, "Adaptive Shimmerer"); // silently: no counters of its own
    activate(game, lake, 1, { targets: [ref(shimmerer)] });
    const [token] = tokens(game, "Adaptive Shimmerer");
    // Three of its own and the additional one, plus Hardened Scales' one.
    expect(counters(game, token)).toBe(5);
    expect(game.events.filter((e) => e.type === "counter-added" && e.object === token)).toHaveLength(1);
  });

  it("a copy that chooses as it enters still gets the counter", () => {
    const { game, a } = table();
    const lake = mirrorlake(game);
    const automaton = spawn(game, "Adaptive Automaton");
    a.chooseCreatureTypeFn = () => "Elf";
    activate(game, lake, 1, { targets: [ref(automaton)] });
    const [token] = tokens(game, "Adaptive Automaton");
    expect(game.state.objects[token].chosenCreatureType).toBe("Elf");
    expect(counters(game, token)).toBe(1);
  });

  it("isn't a copiable value: a copy of the token enters with none", () => {
    const { game } = table();
    const lake = mirrorlake(game);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, lake, 1, { targets: [ref(bears)] });
    const [token] = tokens(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(token)]);
    const second = tokens(game, "Grizzly Bears").find((id) => id !== token);
    expect(second).toBeDefined();
    expect(counters(game, second as ObjectId)).toBe(0);
  });

  it("is only at sorcery speed", () => {
    const { game } = table({ step: "upkeep" });
    const lake = mirrorlake(game);
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, lake, 1, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Ochre Jelly", () => {
  it("splits at the next end step into a copy with half its counters, rounded down, again and again", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const jelly = toHand(game, "Ochre Jelly");
    cast(game, jelly, { x: 5 });
    expect(counters(game, jelly)).toBe(5);
    destroy(game, jelly);
    expect(tokens(game, "Ochre Jelly")).toHaveLength(0);

    nextTurn(game);
    const [first] = tokens(game, "Ochre Jelly");
    expect(counters(game, first)).toBe(2);
    expect(pt(game, first)).toEqual({ power: 2, toughness: 2 });

    // The token, which ceases to exist as it dies, splits too: two is enough.
    destroy(game, first);
    nextTurn(game);
    const [second] = tokens(game, "Ochre Jelly");
    expect(second).not.toBe(first);
    expect(counters(game, second)).toBe(1);

    // One counter isn't two or more.
    destroy(game, second);
    nextTurn(game);
    expect(tokens(game, "Ochre Jelly")).toHaveLength(0);
  });

  it("with fewer than two counters it doesn't split", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const jelly = toHand(game, "Ochre Jelly");
    cast(game, jelly, { x: 1 });
    destroy(game, jelly);
    nextTurn(game);
    expect(tokens(game, "Ochre Jelly")).toHaveLength(0);
  });
});
