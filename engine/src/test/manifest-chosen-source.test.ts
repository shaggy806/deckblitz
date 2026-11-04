/**
 * Manifest or cloak with a choosable source: a card from a hand, some of a
 * library's top cards, a shuffled pile of exiled cards.
 *
 * Proving cards: Scroll of Fate, Vannifar, Hide in Plain Sight, Become
 * Anonymous, Expose the Culprit.
 */

import { describe, expect, it } from "vitest";

import type { GameEvent } from "../events.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

type G = ReturnType<typeof table>["game"];

const faceDown = (game: G, player = A) =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].faceDown !== undefined && game.state.objects[id].controller === player,
  );
const events = (game: G, type: GameEvent["type"]): GameEvent[] => game.state.eventLog.filter((e) => e.type === type);

describe("manifest from a hand", () => {
  it("Scroll of Fate manifests the card chosen from the hand, a sorcery as well", () => {
    const { game, a } = table();
    const sorcery = toHand(game, "Lightning Bolt");
    const bear = toHand(game, "Grizzly Bears");
    const scroll = spawn(game, "Scroll of Fate");
    const seen = pickFromZone(a, sorcery);
    activate(game, scroll, 0);
    expect(seen.offered).toContain(bear);
    expect(game.state.objects[sorcery].faceDown?.kind).toBe("manifest");
    expect(pt(game, sorcery)).toEqual({ power: 2, toughness: 2 });
    expect(hand(game)).toContain(bear);
    expect(hand(game)).not.toContain(sorcery);
    // Nobody else learns what it is (rule 708.5), and its owner can't turn a
    // sorcery face up (701.40g).
    expect(game.viewFor(B).objects[sorcery]?.cardName).not.toBe("Lightning Bolt");
    expect(game.viewFor(A).objects[sorcery]?.faceDown?.card).toBe("Lightning Bolt");
  });

  it("a card from the hand keeps its enters abilities out of it (rule 708.3)", () => {
    const { game, a } = table();
    const elf = toHand(game, "Elvish Visionary");
    const scroll = spawn(game, "Scroll of Fate");
    const before = hand(game).length;
    pickFromZone(a, elf);
    activate(game, scroll, 0);
    expect(zone(game, elf)).toBe("battlefield");
    // No "draw a card": one card left the hand and none came back.
    expect(hand(game).length).toBe(before - 1);
  });

  it("Vannifar cloaks a card from the hand", () => {
    const { game, a } = table();
    spawn(game, "Vannifar, Evolved Enigma");
    const bear = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, bear);
    toStep(game, "declare-attackers");
    expect(game.state.objects[bear].faceDown?.kind).toBe("cloak");
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    expect(game.viewFor(B).objects[bear]?.text).toBe("Ward {2}");
  });

  it("Vannifar's other mode counters each colorless creature you control, a face-down one too", () => {
    const { game, a } = table();
    const vannifar = spawn(game, "Vannifar, Evolved Enigma");
    const thopter = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Ornithopter", B);
    const inHand = toHand(game, "Grizzly Bears");
    const scroll = spawn(game, "Scroll of Fate");
    pickFromZone(a, inHand);
    activate(game, scroll, 0);
    pickModes(a, 1);
    toStep(game, "declare-attackers");
    expect(counters(game, thopter)).toBe(1);
    expect(counters(game, inHand)).toBe(1);
    expect(counters(game, vannifar)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("cloak some of what's looked at", () => {
  it("Hide in Plain Sight cloaks two of the top five and bottoms the rest", () => {
    const { game, a } = table();
    const top = game.state.zones.perPlayer[A].library.slice(0, 5);
    pickFromZone(a, top[1], top[3]);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Hide in Plain Sight"));
    expect(faceDown(game).sort()).toEqual([top[1], top[3]].sort());
    for (const id of [top[1], top[3]]) expect(game.state.objects[id].faceDown?.kind).toBe("cloak");
    const library = game.state.zones.perPlayer[A].library;
    expect([...library.slice(-3)].sort()).toEqual([top[0], top[2], top[4]].sort());
  });

  it("each is announced as cloaked of its own (rule 701.58e)", () => {
    const { game, a } = table();
    const top = game.state.zones.perPlayer[A].library.slice(0, 5);
    pickFromZone(a, top[0], top[1]);
    const before = events(game, "card-manifested").length;
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Hide in Plain Sight"));
    expect(events(game, "card-manifested").length - before).toBe(2);
  });
});

describe("cloak a shuffled exiled pile", () => {
  it("Become Anonymous exiles the creature and two cards and cloaks all three tapped", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const top = game.state.zones.perPlayer[A].library.slice(0, 2);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Become Anonymous"), { targets: [ref(bear)] });
    const down = faceDown(game);
    expect([...down].sort()).toEqual([bear, ...top].sort());
    for (const id of down) {
      const object = game.state.objects[id];
      expect(object.faceDown?.kind).toBe("cloak");
      expect(object.tapped).toBe(true);
      expect(object.exiledFaceDown).toBeUndefined();
      expect(pt(game, id)).toEqual({ power: 2, toughness: 2 });
    }
    // Its exile is a real one: "whenever a creature leaves" sees it.
    expect(events(game, "permanent-exiled").some((e) => "object" in e && e.object === bear)).toBe(true);
  });

  it("the pile's order isn't the order it was named in, across seeds", () => {
    const orders = new Set<string>();
    for (let seed = 1; seed <= 8; seed += 1) {
      const { game } = table({ seed });
      const bear = spawn(game, "Grizzly Bears");
      const top = game.state.zones.perPlayer[A].library.slice(0, 2);
      lands(game, "Island", 4);
      cast(game, toHand(game, "Become Anonymous"), { targets: [ref(bear)] });
      orders.add(faceDown(game).map((id) => (id === bear ? "c" : id === top[0] ? "1" : "2")).join(""));
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it("Become Anonymous can't target a creature you don't own", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    expect(() => cast(game, toHand(game, "Become Anonymous"), { targets: [ref(theirs)] })).toThrow();
  });

  it("Expose the Culprit offers only face-up creatures you control with disguise", () => {
    const { game, a } = table();
    const arno = spawn(game, "Arno Dorian");
    spawn(game, "Arno Dorian", B);
    spawn(game, "Grizzly Bears");
    const seen = pickPermanents(a, arno);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Expose the Culprit"), { modes: [1] });
    expect(seen.offered).toEqual([arno]);
    expect(game.state.objects[arno].faceDown?.kind).toBe("cloak");
    expect(keywords(game, arno).has("deathtouch")).toBe(false);
    // No library card in this pile.
    expect(faceDown(game)).toEqual([arno]);
  });

  it("Expose the Culprit does both, and nothing chosen does nothing", () => {
    const { game, a } = table();
    const hidden = toHand(game, "Serra Angel");
    const scroll = spawn(game, "Scroll of Fate");
    pickFromZone(a, hidden);
    activate(game, scroll, 0);
    const first = spawn(game, "Forum Familiar");
    const second = spawn(game, "Hunted Bonebrute");
    pickPermanents(a, first, second);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Expose the Culprit"), { modes: [0, 1], targets: [ref(hidden)] });
    expect(game.state.objects[hidden].faceDown).toBeUndefined();
    expect(pt(game, hidden)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[first].faceDown?.kind).toBe("cloak");
    expect(game.state.objects[second].faceDown?.kind).toBe("cloak");

    const third = spawn(game, "Forum Familiar");
    pickPermanents(a);
    cast(game, toHand(game, "Expose the Culprit"), { modes: [1] });
    expect(game.state.objects[third].faceDown).toBeUndefined();
    expect(zone(game, third)).toBe("battlefield");
  });
});
