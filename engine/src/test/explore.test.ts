/**
 * Explore (rule 701.44): the explorer's controller reveals the top card of
 * their library; a land card goes to their hand, otherwise the explorer gets
 * a +1/+1 counter and they may put the card into their graveyard (701.44a).
 * It has explored whatever was possible (701.44b) — "whenever a creature you
 * control explores" — and one that has left explores as it last existed, with
 * no counter (701.44c, the rulings). Map tokens (rule 111.10s) make a target
 * creature you control explore.
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
  graveyard,
  hand,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("explore", () => {
  it("a land card goes to its controller's hand, and nothing gets a counter", () => {
    const { game } = table();
    const land = toLibrary(game, "Forest");
    const handBefore = hand(game).length;
    const scout = enter(game, "Cenote Scout");
    expect(zone(game, land)).toBe("hand");
    expect(hand(game).length).toBe(handBefore + 1);
    expect(counters(game, scout)).toBe(0);
  });

  it("otherwise a +1/+1 counter, then the revealed card into the graveyard or left on top", () => {
    const { game, a } = table();
    const kept = toLibrary(game, "Grizzly Bears");
    pickModes(a); // leave it on top
    const first = enter(game, "Cenote Scout");
    expect(counters(game, first)).toBe(1);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(kept);

    pickModes(a, 0); // into the graveyard
    const second = enter(game, "Cenote Scout");
    expect(counters(game, second)).toBe(1);
    expect(zone(game, kept)).toBe("graveyard");
  });

  it("with an empty library nothing is revealed and the counter is still put", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 40 });
    expect(game.state.zones.perPlayer[A].library).toHaveLength(0);
    const scout = enter(game, "Cenote Scout");
    expect(counters(game, scout)).toBe(1);
  });

  it("one that has left still explores: no counter, the card may still go, and it has explored", () => {
    const { game, a } = table();
    const diver = spawn(game, "Merfolk Cave-Diver");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    const scout = enter(game, "Cenote Scout", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, scout);
    settle(game);
    expect(zone(game, scout)).toBe("graveyard");
    expect(counters(game, scout)).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
    // "Whenever a creature you control explores" saw it, as it last was.
    expect(pt(game, diver).power).toBe(3);
  });

  it("explores X times, revealing a card left on top again", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    toLibrary(game, "Grizzly Bears");
    pickModes(a); // leave it each time
    const spelunker = toHand(game, "Jadelight Spelunker");
    cast(game, spelunker, { x: 2 });
    expect(zone(game, spelunker)).toBe("battlefield");
    expect(counters(game, spelunker)).toBe(2);
  });

  it("whenever a creature you control explores: +1/+0 and can't be blocked, once per exploration", () => {
    const { game, a } = table();
    const diver = spawn(game, "Merfolk Cave-Diver");
    toLibrary(game, "Forest");
    toLibrary(game, "Forest");
    pickModes(a);
    enter(game, "Cenote Scout");
    enter(game, "Cenote Scout", B); // not hers
    expect(pt(game, diver).power).toBe(3);
    expect(keywords(game, diver).has("unblockable")).toBe(true);
    enter(game, "Cenote Scout");
    expect(pt(game, diver).power).toBe(4);
  });

  it("a Map token: {1}, {T}, sacrifice it — target creature you control explores, as a sorcery", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    cast(game, toHand(game, "Spyglass Siren"));
    const map = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Map Token");
    expect(map).toBeDefined();
    const bear = spawn(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    pickModes(a, 0);
    activate(game, map!, 0, { targets: [ref(bear)] });
    expect(game.state.objects[map!]?.zone).not.toBe("battlefield");
    expect(counters(game, bear)).toBe(1);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Hill Giant")).toBe(true);
  });

  it("a dying Miner's Guidewing has a target creature you control explore", () => {
    const { game, a } = table();
    const wing = spawn(game, "Miner's Guidewing");
    const bear = spawn(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    pickModes(a);
    pickTargets(a, bear);
    destroy(game, wing);
    settle(game);
    expect(counters(game, bear)).toBe(1);
  });
});
