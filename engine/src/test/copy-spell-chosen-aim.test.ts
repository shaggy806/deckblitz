import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { B, C, D, activate, cast, lands, life, pt, ref, spawn, table as openTable, toHand, zone } from "./harness.js";

// `copy-spell`'s `retargetToChosen` (rule 707.10e): a copy of the trigger's
// spell whose every target is one its controller chooses as it resolves among
// the other opponents' — Zevlor, Elturel Exile's "for each other opponent,
// choose that player or a permanent they control, copy that spell, and the
// copy targets the chosen player or permanent", and Exterminator Magmarch's
// "if another opponent controls one or more nonland permanents that spell
// could target, choose one of those permanents. Copy that spell."

function table(): ReturnType<typeof openTable> {
  const seated = openTable({ players: 4 });
  for (const player of seated.players) seated.game.state.zones.perPlayer[player].hand = [];
  return seated;
}

const stackCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.stack.filter((id) => game.state.objects[id]?.isCopy === true);

describe("Zevlor, Elturel Exile", () => {
  it("copies a Bolt at one opponent for each other opponent, at that player or a permanent they control", () => {
    const { game, a } = table();
    const zevlor = spawn(game, "Zevlor, Elturel Exile");
    const carolsBears = spawn(game, "Grizzly Bears", C);
    lands(game, "Mountain", 3);
    activate(game, zevlor, 0);
    const offers: (readonly TargetRef[])[] = [];
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      offers.push(offer.eligible);
      return ref(carolsBears);
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    // Carol is asked between herself and her Bears; Dave has only himself, so
    // his copy is made unasked. Bob, the one it targets, gets no copy.
    expect(offers).toEqual([[ref(C), ref(carolsBears)]]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, carolsBears)).toBe("graveyard");
    expect(life(game, C)).toBe(20);
    expect(life(game, D)).toBe(17);
  });

  it("makes no copy for an opponent when the one chosen isn't a legal target", () => {
    const { game, a } = table();
    const zevlor = spawn(game, "Zevlor, Elturel Exile");
    const carolsForest = spawn(game, "Forest", C);
    lands(game, "Mountain", 3);
    activate(game, zevlor, 0);
    let asked = 0;
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      asked += 1;
      // Any permanent of theirs may be chosen (the ruling), the land too.
      expect(offer.eligible).toContainEqual(ref(carolsForest));
      return ref(carolsForest);
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    // Everyone passes: the delayed trigger resolves, Carol's choice is asked.
    game.advanceUntil((s) => s.awaiting === null && stackCopies(game).length > 0);
    expect(asked).toBe(1);
    expect(stackCopies(game).map((id) => game.state.objects[id].targets?.[0])).toEqual([ref(D)]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
    expect(life(game, D)).toBe(17);
    expect(zone(game, carolsForest)).toBe("battlefield");
  });

  it("copies a spell at a permanent an opponent controls, leaving that opponent out", () => {
    const { game, a } = table();
    const zevlor = spawn(game, "Zevlor, Elturel Exile");
    const bobsBears = spawn(game, "Grizzly Bears", B);
    const carolsBears = spawn(game, "Grizzly Bears", C);
    const davesBears = spawn(game, "Grizzly Bears", D);
    lands(game, "Mountain", 3);
    activate(game, zevlor, 0);
    const offers: (readonly TargetRef[])[] = [];
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      offers.push(offer.eligible);
      return offer.eligible.find((t) => t.kind === "object") ?? offer.eligible[0];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bobsBears)] });
    expect(offers).toEqual([
      [ref(C), ref(carolsBears)],
      [ref(D), ref(davesBears)],
    ]);
    expect(zone(game, bobsBears)).toBe("graveyard");
    expect(zone(game, carolsBears)).toBe("graveyard");
    expect(zone(game, davesBears)).toBe("graveyard");
  });

  it("waits for a spell aimed at a single opponent's thing, and only this turn's", () => {
    const { game } = table();
    const zevlor = spawn(game, "Zevlor, Elturel Exile");
    const mine = spawn(game, "Grizzly Bears");
    const bobsBears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 9);
    activate(game, zevlor, 0);
    // At her own creature: no copies, and the trigger still waits.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(life(game, C)).toBe(20);
    // Two different targets: still not one.
    cast(game, toHand(game, "Arc Trail"), { targets: [ref(bobsBears), ref(B)] });
    expect(life(game, C)).toBe(20);
    expect(life(game, D)).toBe(20);
    // A single opponent at last.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, C)).toBe(17);
    expect(life(game, D)).toBe(17);
    // Used up: the next one is copied no more.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, C)).toBe(17);
  });
});

describe("Exterminator Magmarch", () => {
  it("copies a spell at one opponent's nonland permanent at another opponent's that it could target", () => {
    const { game, a } = table();
    spawn(game, "Exterminator Magmarch");
    const bobsBears = spawn(game, "Grizzly Bears", B);
    const carolsBears = spawn(game, "Grizzly Bears", C);
    spawn(game, "Forest", C);
    const davesBears = spawn(game, "Grizzly Bears", D);
    spawn(game, "Gladecover Scout", D);
    lands(game, "Mountain", 1);
    const offers: (readonly TargetRef[])[] = [];
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      offers.push(offer.eligible);
      return ref(davesBears);
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bobsBears)] });
    // Not players, lands, Bob's own, or a hexproof creature it can't target.
    expect(offers).toEqual([[ref(carolsBears), ref(davesBears)]]);
    expect(zone(game, bobsBears)).toBe("graveyard");
    expect(zone(game, davesBears)).toBe("graveyard");
    expect(zone(game, carolsBears)).toBe("battlefield");
  });

  it("doesn't trigger when no other opponent has a nonland permanent the spell could target", () => {
    const { game } = table();
    spawn(game, "Exterminator Magmarch");
    const bobsBears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Forest", C);
    spawn(game, "Gladecover Scout", D);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bobsBears)], settle: false });
    // The Bolt alone: the intervening "if" (rule 603.4) kept the trigger off.
    expect(game.state.zones.shared.stack.length).toBe(1);
  });

  it("doesn't trigger on a spell at a player", () => {
    const { game } = table();
    spawn(game, "Exterminator Magmarch");
    spawn(game, "Grizzly Bears", C);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
  });
});

// `of: "you"`: among the copier's own permanents, other than the source.
describe("Beamsplitter Mage", () => {
  it("copies a spell aimed at it at another creature you control that you choose", () => {
    const { game, a } = table();
    const mage = spawn(game, "Beamsplitter Mage");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    const offers: (readonly TargetRef[])[] = [];
    a.choosePermanentOrPlayerFn = (_view, offer) => {
      offers.push(offer.eligible);
      return ref(elves);
    };
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(mage)] });
    // Not the Mage itself, nor an opponent's creature.
    expect(offers).toEqual([[ref(bears), ref(elves)]]);
    expect(pt(game, mage)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, elves)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("makes the copy unasked when there's one other creature, and doesn't trigger with none", () => {
    const { game, a } = table();
    const mage = spawn(game, "Beamsplitter Mage");
    lands(game, "Forest", 2);
    a.choosePermanentOrPlayerFn = () => {
      throw new Error("nothing to ask");
    };
    // No other creature: the intervening "if" is false, so no trigger.
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(mage)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(mage)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });

  it("doesn't trigger on a spell aimed at another creature", () => {
    const { game } = table();
    spawn(game, "Beamsplitter Mage");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
  });
});
