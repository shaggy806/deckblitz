/**
 * Urza's Saga (USG; B198), group A. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Veiled Sentry", () => {
  it("an opponent's spell makes it an Illusion creature with P/T equal to that spell's mana value", () => {
    const { game } = table();
    const sentry = spawn(game, "Veiled Sentry");
    nextTurn(game);
    lands(game, "Forest", 3, B);
    const giant = toHand(game, "Hill Giant", B);
    lands(game, "Mountain", 1, B);
    cast(game, giant, { player: B });
    expect(types(game, sentry)).toEqual(["creature"]);
    expect(subtypes(game, sentry)).toEqual(["Illusion"]);
    expect(pt(game, sentry)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Bereavement", () => {
  it("a green creature dying makes its controller discard; a nongreen one doesn't", () => {
    const { game } = table();
    spawn(game, "Bereavement");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const before = hand(game, B).length;
    destroy(game, giant, A);
    expect(hand(game, B).length).toBe(before);
    destroy(game, bears, A);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Reclusive Wight", () => {
  it("stays alone in your upkeep, and is sacrificed once you control another nonland permanent", () => {
    const { game } = table();
    const wight = spawn(game, "Reclusive Wight");
    lands(game, "Swamp", 2);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, wight)).toBe("battlefield");
    spawn(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, wight)).toBe("graveyard");
  });
});

describe("War Dance", () => {
  it("sacrificed, it gives +X/+X for the verse counters it had", () => {
    const { game } = table();
    const dance = enter(game, "War Dance");
    game.state.objects[dance].counters.verse = 3;
    expect(counters(game, dance, "verse")).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, dance, 0, { targets: [ref(bears)] });
    expect(zone(game, dance)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});
