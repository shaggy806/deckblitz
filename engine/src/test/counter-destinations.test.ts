/**
 * Where a countered spell goes (rule 701.5a), and Guile's replacement of the
 * counter. `counter`'s `into` takes the top or the bottom of its owner's library
 * (Memory Lapse, Spell Crumple, Hinder), and exile with time counters (Delay,
 * rule 702.62b); a would-counter replacement exiles the spell and offers it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, counters, destroy, graveyard, lands, pickModes, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** `name` cast by `player`, who holds priority, on a board with mana for it. */
function spellOnStack(game: Game, name: string, player: PlayerId = A): ObjectId {
  lands(game, "Forest", 8, player);
  const spell = toHand(game, name, player);
  cast(game, spell, { player, settle: false, targets: [] });
  return spell;
}

/** `name` cast by Alice at `spell`, then everything resolved. */
function counterWith(game: Game, name: string, spell: ObjectId): ObjectId {
  lands(game, "Island", 4);
  const counter = toHand(game, name);
  cast(game, counter, { targets: [ref(spell)] });
  return counter;
}

/** Abrupt Decay, which can't be countered, on the stack aimed at Bob's Bears. */
function uncounterable(game: Game): { readonly decay: ObjectId; readonly bears: ObjectId } {
  lands(game, "Bayou", 2);
  const bears = spawn(game, "Grizzly Bears", B);
  const decay = toHand(game, "Abrupt Decay");
  cast(game, decay, { targets: [ref(bears)], settle: false });
  return { decay, bears };
}

describe("a countered spell put into its owner's library", () => {
  it("Memory Lapse: on top, not in the graveyard, and it's a counter", () => {
    const { game } = table();
    const bears = spellOnStack(game, "Grizzly Bears");
    const lapse = counterWith(game, "Memory Lapse", bears);
    expect(library(game)[0]).toBe(bears);
    expect(graveyard(game)).toEqual([lapse]);
    expect(game.state.eventLog.some((e) => e.type === "spell-countered" && e.object === bears)).toBe(true);
  });

  it("Memory Lapse does nothing to a spell that can't be countered", () => {
    const { game } = table();
    const { decay, bears } = uncounterable(game);
    counterWith(game, "Memory Lapse", decay);
    expect(zone(game, decay)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Spell Crumple: both to the bottom, the target first", () => {
    const { game } = table();
    const bears = spellOnStack(game, "Grizzly Bears");
    const crumple = counterWith(game, "Spell Crumple", bears);
    expect(library(game).slice(-2)).toEqual([bears, crumple]);
    expect(graveyard(game)).toEqual([]);
  });

  it("Spell Crumple goes to the bottom even when the spell can't be countered (its ruling)", () => {
    const { game } = table();
    const { decay } = uncounterable(game);
    const crumple = counterWith(game, "Spell Crumple", decay);
    expect(zone(game, decay)).toBe("graveyard");
    expect(library(game).at(-1)).toBe(crumple);
  });

  it("a copy of a spell ceases to exist rather than going to a library (rule 707.10a)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickTargets(a, B);
    cast(game, toHand(game, "Reverberate"), { targets: [ref(bolt)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 2 && s.objects[s.zones.shared.stack[1]].isCopy === true && s.priority.holder === A);
    const copy = game.state.zones.shared.stack.at(-1)!;
    expect(game.state.objects[copy].isCopy).toBe(true);
    const before = library(game).length;
    lands(game, "Island", 2);
    cast(game, toHand(game, "Memory Lapse"), { targets: [ref(copy)] });
    expect(game.state.objects[copy]).toBeUndefined();
    expect(library(game).length).toBe(before);
  });

  it("Hinder: its controller chooses top or bottom, not the spell's", () => {
    for (const [mode, where] of [
      [0, "top"],
      [1, "bottom"],
    ] as const) {
      const { game, b } = table();
      const bears = spellOnStack(game, "Grizzly Bears");
      game.dispatch({ type: "pass-priority", player: A });
      lands(game, "Island", 3, B);
      pickModes(b, mode);
      const hinder = toHand(game, "Hinder", B);
      cast(game, hinder, { player: B, targets: [ref(bears)] });
      // Alice's library, whoever countered it.
      expect(where === "top" ? library(game)[0] : library(game).at(-1)).toBe(bears);
      expect(zone(game, hinder)).toBe("graveyard");
    }
  });
});

describe("Delay: exiled with three time counters, and suspended", () => {
  it("a card with no suspend of its own gains it, and comes back free", () => {
    const { game, a } = table();
    const bears = spellOnStack(game, "Grizzly Bears");
    counterWith(game, "Delay", bears);
    const object = game.state.objects[bears];
    expect(object.zone).toBe("exile");
    expect(object.counters.time).toBe(3);
    expect(object.suspended).toBe(true);
    // Her next three upkeeps take the three off, and the last lets her cast it.
    let offered = false;
    a.chooseCastNowFn = (_view, offer) => {
      offered = true;
      expect(offer.cards).toEqual([bears]);
      return { type: "cast-spell", player: A, card: bears, targets: [], via: "effect", free: true };
    };
    game.advanceUntil(() => offered);
    expect(game.state.turn.number).toBe(7);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("nothing happens to a spell that can't be countered", () => {
    const { game } = table();
    const { decay } = uncounterable(game);
    counterWith(game, "Delay", decay);
    expect(zone(game, decay)).toBe("graveyard");
    expect(game.state.objects[decay].counters.time ?? 0).toBe(0);
  });
});

describe("Guile: instead of countering, exile and offer", () => {
  it("exiles the spell, and the counterspell's controller casts it free", () => {
    const { game, a } = table();
    spawn(game, "Guile");
    const bears = spellOnStack(game, "Grizzly Bears", A);
    a.chooseCastNowFn = (_view, offer) => {
      expect(offer.cards).toEqual([bears]);
      return { type: "cast-spell", player: A, card: bears, targets: [], via: "effect", free: true };
    };
    counterWith(game, "Cancel", bears);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("a declined offer leaves it exiled for good, and nothing was countered", () => {
    const { game } = table();
    spawn(game, "Guile");
    const bears = spellOnStack(game, "Grizzly Bears");
    counterWith(game, "Memory Lapse", bears);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.eventLog.some((e) => e.type === "spell-countered" && e.object === bears)).toBe(false);
  });

  it("Delay's time counters don't come along: it was never countered", () => {
    const { game } = table();
    spawn(game, "Guile");
    const bears = spellOnStack(game, "Grizzly Bears");
    counterWith(game, "Delay", bears);
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[bears].counters.time ?? 0).toBe(0);
    expect(game.state.objects[bears].suspended ?? false).toBe(false);
  });

  it("an opponent's counterspell isn't replaced: only yours", () => {
    const { game } = table();
    spawn(game, "Guile", B);
    const bears = spellOnStack(game, "Grizzly Bears");
    counterWith(game, "Cancel", bears);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a spell that can't be countered resolves (its ruling)", () => {
    const { game } = table();
    spawn(game, "Guile");
    const { decay, bears } = uncounterable(game);
    counterWith(game, "Cancel", decay);
    expect(zone(game, decay)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("is an ability of Guile: lost, the counter counters", () => {
    const { game } = table();
    spawn(game, "Guile");
    spawn(game, "Humility");
    const bears = spellOnStack(game, "Grizzly Bears");
    counterWith(game, "Cancel", bears);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a ward its controller's opponent can't pay is the same counter: exiled, and offered", () => {
    const { game, b } = table();
    spawn(game, "Guile");
    const warded = spawn(game, "Adrix and Nev, Twincasters");
    game.dispatch({ type: "pass-priority", player: A });
    lands(game, "Swamp", 1, B);
    pickTargets(b, warded);
    const disfigure = toHand(game, "Disfigure", B);
    cast(game, disfigure, { player: B, targets: [ref(warded)] });
    expect(zone(game, disfigure)).toBe("exile");
    expect(zone(game, warded)).toBe("battlefield");
  });

  describe("with Transcendent Dragon's own offer", () => {
    /** Bob's Bolt on the stack, and Alice's cast Dragon's trigger aimed at it;
     * how many times Alice is offered it, declining each. */
    function dragonAtBolt(withGuile: boolean): { readonly game: Game; readonly bolt: ObjectId; readonly offers: number } {
      const { game, a } = table();
      if (withGuile) spawn(game, "Guile");
      lands(game, "Island", 6);
      lands(game, "Mountain", 1, B);
      let offers = 0;
      a.chooseCastNowFn = () => {
        offers += 1;
        return null;
      };
      game.dispatch({ type: "pass-priority", player: A });
      const bolt = toHand(game, "Lightning Bolt", B);
      cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
      game.dispatch({ type: "pass-priority", player: B });
      pickTargets(a, bolt);
      cast(game, toHand(game, "Transcendent Dragon"));
      settle(game);
      return { game, bolt, offers };
    }

    it("Dragon alone: offered once, and declined it stays exiled", () => {
      const { game, bolt, offers } = dragonAtBolt(false);
      expect(offers).toBe(1);
      expect(zone(game, bolt)).toBe("exile");
      expect(game.state.eventLog.some((e) => e.type === "spell-countered" && e.object === bolt)).toBe(true);
    });

    it("with Guile: only Guile's offer, and declined stays declined", () => {
      const { game, bolt, offers } = dragonAtBolt(true);
      expect(offers).toBe(1);
      expect(zone(game, bolt)).toBe("exile");
      expect(game.state.eventLog.some((e) => e.type === "spell-countered" && e.object === bolt)).toBe(false);
    });
  });

  it("shuffles itself back from a graveyard", () => {
    const { game } = table();
    const guile = spawn(game, "Guile");
    destroy(game, guile);
    settle(game);
    expect(zone(game, guile)).toBe("library");
  });
});

describe("a countered spell's card put onto the battlefield (Desertion)", () => {
  /** Bob's Desertion at Alice's `spell`, which she holds priority over. */
  function desert(game: Game, spell: ObjectId): ObjectId {
    lands(game, "Island", 5, B);
    game.dispatch({ type: "pass-priority", player: A });
    const desertion = toHand(game, "Desertion", B);
    cast(game, desertion, { player: B, targets: [ref(spell)] });
    return desertion;
  }

  it("a creature spell: countered, and its card is Bob's permanent, still Alice's card", () => {
    const { game } = table();
    const bears = spellOnStack(game, "Grizzly Bears");
    const desertion = desert(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
    expect(game.state.objects[bears].owner).toBe(A);
    expect(graveyard(game, B)).toEqual([desertion]);
    expect(graveyard(game)).toEqual([]);
    expect(game.state.eventLog.some((e) => e.type === "spell-countered" && e.object === bears)).toBe(true);
    // It wasn't cast onto the battlefield (rule 400.7).
    expect(game.state.objects[bears].entry?.cast).toBeUndefined();
    destroy(game, bears);
    settle(game);
    expect(graveyard(game)).toEqual([bears]);
  });

  it("an artifact spell too", () => {
    const { game } = table();
    const ring = spellOnStack(game, "Sol Ring");
    desert(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.objects[ring].controller).toBe(B);
  });

  it("any other spell goes to its owner's graveyard", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const divination = spellOnStack(game, "Divination");
    const before = game.state.zones.perPlayer[A].hand.length;
    desert(game, divination);
    expect(graveyard(game)).toEqual([divination]);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before);
  });

  it("a kicked creature isn't kicked on the battlefield: a new object", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const victim = spawn(game, "Grizzly Bears");
    const gatekeeper = toHand(game, "Gatekeeper of Malakir");
    cast(game, gatekeeper, { kicked: true, settle: false });
    desert(game, gatekeeper);
    expect(zone(game, gatekeeper)).toBe("battlefield");
    expect(game.state.objects[gatekeeper].controller).toBe(B);
    expect(game.state.objects[gatekeeper].enteredKicked).toBe(false);
    expect(zone(game, victim)).toBe("battlefield");
  });

  it("a spell's X is 0 on the battlefield (rule 107.3i)", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const ballista = toHand(game, "Walking Ballista");
    cast(game, ballista, { x: 3, settle: false });
    desert(game, ballista);
    // A 0/0 with no counters: it dies, to its owner's graveyard.
    expect(graveyard(game)).toEqual([ballista]);
    expect(counters(game, ballista)).toBe(0);
  });

  it("its as-enters choice is the new controller's (rule 614.12)", () => {
    const { game, a, b } = table();
    const angel = spawn(game, "Serra Angel");
    a.chooseCopyFn = () => {
      throw new Error("Alice isn't the one putting it onto the battlefield");
    };
    b.chooseCopyFn = () => angel;
    lands(game, "Island", 1);
    const clone = spellOnStack(game, "Clone");
    desert(game, clone);
    expect(zone(game, clone)).toBe("battlefield");
    expect(game.state.objects[clone].controller).toBe(B);
    expect(game.state.objects[clone].copyOf).toBe("Serra Angel");
  });

  it("a spell that can't be countered resolves", () => {
    const { game } = table();
    const revenge = spellOnStack(game, "Gaea's Revenge");
    desert(game, revenge);
    expect(zone(game, revenge)).toBe("battlefield");
    expect(game.state.objects[revenge].controller).toBe(A);
    expect(game.state.objects[revenge].entry?.cast?.by).toBe(A);
  });
});
