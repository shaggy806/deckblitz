/**
 * A spell that, as it resolves, exiles itself and is put onto the battlefield
 * transformed (rules 400.7j, 712.14a): Esper Origins' "If this spell was cast
 * from a graveyard, exile it, then put it onto the battlefield transformed
 * under its owner's control with a finality counter on it" — `exile` of
 * "source" taking the resolving spell off the stack, then
 * `put-onto-battlefield` of "source" `transformed` — and its back face,
 * Summon: Esper Maduin.
 */

import { describe, expect, it } from "vitest";

import { nameOf } from "../state.js";
import {
  A,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Esper Origins", () => {
  it("cast from hand: surveil 2 and 2 life, then the graveyard as usual", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const origins = toHand(game, "Esper Origins");
    cast(game, origins);
    expect(life(game)).toBe(22);
    expect(zone(game, origins)).toBe("graveyard");
  });

  it("flashed back: exiles itself, then enters as Summon: Esper Maduin with a finality counter", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const origins = toGraveyard(game, "Esper Origins");
    cast(game, origins, { via: "flashback" });
    expect(life(game)).toBe(22);
    expect(zone(game, origins)).toBe("battlefield");
    expect(nameOf(game.state.objects[origins])).toBe("Summon: Esper Maduin");
    expect(game.state.objects[origins].controller).toBe(A);
    expect(counters(game, origins, "finality")).toBe(1);
    expect(pt(game, origins)).toEqual({ power: 4, toughness: 4 });
    // Through exile on the way, and never into the graveyard.
    expect(graveyard(game)).not.toContain(origins);
    // A Saga entering gets its first lore counter, and chapter I has resolved:
    // the top card, a Wastes, is a permanent card and went to hand.
    expect(counters(game, origins, "lore")).toBe(1);
  });

  it("dies with its finality counter and is exiled instead", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const origins = toGraveyard(game, "Esper Origins");
    cast(game, origins, { via: "flashback" });
    destroy(game, origins);
    expect(zone(game, origins)).toBe("exile");
  });
});

describe("Summon: Esper Maduin", () => {
  it("I — a permanent card on top goes to hand; a sorcery stays on top", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const before = hand(game).length;
    const origins = toGraveyard(game, "Esper Origins");
    const top = toLibrary(game, "Wastes");
    cast(game, origins, { via: "flashback" });
    expect(hand(game)).toContain(top);
    expect(hand(game).length).toBe(before + 1);

    const { game: g2 } = table();
    lands(g2, "Forest", 4);
    const o2 = toGraveyard(g2, "Esper Origins");
    const sorcery = toLibrary(g2, "Esper Origins");
    cast(g2, o2, { via: "flashback" });
    expect(zone(g2, sorcery)).toBe("library");
    expect(g2.state.zones.perPlayer[A].library[0]).toBe(sorcery);
  });

  it("II adds {G}{G}; III pumps the other creatures and gives them trample", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const origins = toGraveyard(game, "Esper Origins");
    const bear = spawn(game, "Grizzly Bears");
    cast(game, origins, { via: "flashback" });
    nextTurn(game); // bob's
    nextTurn(game); // alice's: chapter II after her draw step
    settle(game);
    expect(counters(game, origins, "lore")).toBe(2);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "G").length).toBe(2);
    nextTurn(game);
    nextTurn(game); // chapter III, then it's sacrificed — exiled by its finality counter
    settle(game);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bear).has("trample")).toBe(true);
    expect(zone(game, origins)).toBe("exile");
  });
});
