/**
 * Card batch 69, part a (2026-10-12): EDHREC ranks 6377–6948. Written on the
 * shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The seat casts the first card offered that's in `wanted` (each once),
 * free, with no targets; declines once none is left. Records what was
 * offered each time. */
function castFromOffers(seat: ScriptedController, wanted: readonly ObjectId[]): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  const left = [...wanted];
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    const pick = left.find((id) => offer.cards.includes(id));
    if (pick === undefined) return null;
    left.splice(left.indexOf(pick), 1);
    const way = offer.casts.find((c) => c.card === pick)!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: pick,
      targets: [],
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
  return seen;
}

/** Activate `source`'s ability `index`, sacrificing `sacrifice` for its cost. */
const activateSacrificing = (game: Game, source: ObjectId, index: number, sacrifice: ObjectId): void => {
  const action = { type: "activate-ability", player: A, source, abilityIndex: index, targets: [], sacrifice } as const;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
};

const redFloating = (game: Game): number => game.state.players[A].manaPool.filter((u) => u.type === "R").length;

describe("Ghost Town", () => {
  it("returns to its owner's hand only when it isn't your turn", () => {
    const { game } = table();
    const town = spawn(game, "Ghost Town");
    expect(() => activate(game, town, 1)).toThrow();
    // Bob's turn, alice's priority.
    game.advanceUntil((s) => s.turn.number === 2 && s.priority.holder === A);
    activate(game, town, 1);
    expect(zone(game, town)).toBe("hand");
  });
});

describe("Trelasarra, Moon Dancer", () => {
  it("grows and scries once per life gain", () => {
    const { game } = table();
    const elf = spawn(game, "Trelasarra, Moon Dancer");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    expect(counters(game, elf)).toBe(1);
  });
});

describe("Oath of Gideon", () => {
  it("makes two Kor Allies, and a planeswalker of yours enters with one more loyalty", () => {
    const { game } = table();
    spawn(game, "Oath of Gideon");
    lands(game, "Mountain", 4);
    const chandra = toHand(game, "Chandra, Torch of Defiance");
    cast(game, chandra);
    expect(counters(game, chandra, "loyalty")).toBe(5);
    enter(game, "Oath of Gideon");
    expect(tokensNamed(game, "Kor Ally Token", A)).toBe(2);
  });

  it("doesn't touch an opponent's planeswalker", () => {
    const { game } = table();
    spawn(game, "Oath of Gideon");
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    lands(game, "Mountain", 4, B);
    const chandra = toHand(game, "Chandra, Torch of Defiance", B);
    cast(game, chandra, { player: B });
    expect(counters(game, chandra, "loyalty")).toBe(4);
  });
});

describe("Svella, Ice Shaper", () => {
  it("makes a snow artifact token named Icy Manalith that taps for any color", () => {
    const { game } = table();
    const svella = spawn(game, "Svella, Ice Shaper");
    lands(game, "Wastes", 3);
    activate(game, svella, 0);
    const [manalith] = named(game, "Icy Manalith Token", A);
    expect(nameOf(game.state.objects[manalith])).toBe("Icy Manalith");
    expect(supertypes(game, manalith)).toContain("snow");
  });

  it("casts a spell from the top four free and bottoms the rest", () => {
    const { game, a } = table();
    const svella = spawn(game, "Svella, Ice Shaper");
    lands(game, "Mountain", 4);
    lands(game, "Forest", 4);
    const bears = toLibrary(game, "Grizzly Bears");
    const library = [...game.state.zones.perPlayer[A].library];
    const looked = library.slice(1, 4);
    const seen = castFromOffers(a, [bears]);
    activate(game, svella, 1);
    expect(seen.offered[0]).toContain(bears);
    expect(zone(game, bears)).toBe("battlefield");
    // The three other cards looked at went to the bottom.
    const after = game.state.zones.perPlayer[A].library;
    expect(after.length).toBe(library.length - 1);
    expect([...after.slice(-3)].sort()).toEqual([...looked].sort());
  });
});

describe("Ebondeath, Dracolich", () => {
  const graveyardOffer = (game: Game, card: ObjectId) =>
    game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card);

  it("is castable from the graveyard after another creature dies — a token counts — and enters tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const ebondeath = spawn(game, "Ebondeath, Dracolich");
    destroy(game, ebondeath);
    expect(zone(game, ebondeath)).toBe("graveyard");
    // Only an Ebondeath died.
    expect(graveyardOffer(game, ebondeath)).toBeUndefined();

    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const [soldier] = named(game, "Soldier Token", B);
    destroy(game, soldier, A);
    expect(graveyardOffer(game, ebondeath)).toBeDefined();
    game.dispatch({ type: "cast-spell", player: A, card: ebondeath, targets: [], via: "graveyard-permission" });
    settle(game);
    expect(zone(game, ebondeath)).toBe("battlefield");
    expect(game.state.objects[ebondeath].tapped).toBe(true);
  });
});

describe("Path of the Pyromancer", () => {
  it("adds {R} per card discarded and draws that many plus one", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const path = toHand(game, "Path of the Pyromancer");
    const kept = hand(game).filter((id) => id !== path);
    expect(kept.length).toBeGreaterThan(0);
    cast(game, path);
    for (const card of kept) expect(zone(game, card)).toBe("graveyard");
    expect(hand(game).length).toBe(kept.length + 1);
    expect(redFloating(game)).toBe(kept.length);
  });

  it("with an empty hand adds nothing and draws one", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    for (const card of [...hand(game)]) game.debugMove(card, "exile");
    cast(game, toHand(game, "Path of the Pyromancer"));
    expect(hand(game).length).toBe(1);
    expect(redFloating(game)).toBe(0);
  });
});

describe("Reaper's Scythe", () => {
  it("equips a Hero, and stores a soul counter per player who lost life this turn", () => {
    const { game } = table({ players: 3 });
    const scythe = enter(game, "Reaper's Scythe");
    const [hero] = named(game, "Hero Token (Black Mage's Rod)", A);
    expect(game.state.objects[scythe].attachedTo).toBe(hero);
    expect(subtypes(game, hero)).toContain("Assassin");
    expect(pt(game, hero)).toEqual({ power: 1, toughness: 1 });

    game.debugApplyEffect(B, { kind: "lose-life", amount: 2 }, []);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1 }, []);
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(counters(game, scythe, "soul")).toBe(2);
    expect(pt(game, hero)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Kari Zev's Expertise", () => {
  it("steals, untaps and hastes a creature, then offers a free spell of mana value 2 or less", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true, sick: true });
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const seen = castFromOffers(a, [bears]);
    cast(game, toHand(game, "Kari Zev's Expertise"), { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(keywords(game, theirs).has("haste")).toBe(true);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Underdark Rift", () => {
  it("puts the target just beneath the top X cards of its owner's library, X the d10's result", () => {
    const { game } = table();
    const rift = spawn(game, "Underdark Rift");
    lands(game, "Wastes", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, rift, 1, { targets: [ref(bears)] });
    expect(zone(game, rift)).toBe("exile");
    const x = game.state.lastRoll!.total;
    expect(x).toBeGreaterThanOrEqual(1);
    expect(game.state.zones.perPlayer[B].library.indexOf(bears)).toBe(x);
  });
});

describe("Rust Elemental", () => {
  it("eats another artifact each upkeep, and taps and costs 4 life when there's none", () => {
    const { game } = table();
    const rust = spawn(game, "Rust Elemental");
    const ring = spawn(game, "Sol Ring");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, rust)).toBe("battlefield");
    expect(life(game)).toBe(20);

    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, rust)).toBe("battlefield");
    expect(game.state.objects[rust].tapped).toBe(true);
    expect(life(game)).toBe(16);
  });
});

describe("Iroh, Dragon of the West", () => {
  it("gives firebending 2 only to creatures with a counter as combat begins; mentor's counter comes too late", () => {
    const { game, a } = table();
    const iroh = spawn(game, "Iroh, Dragon of the West");
    const countered = spawn(game, "Grizzly Bears");
    game.state.objects[countered].counters.shield = 1;
    const plain = spawn(game, "Grizzly Bears");
    a.chooseTargetsFn = (_view, _source, _specs, legal) => legal.map((slot) => slot.find((t) => t.kind === "object" && t.object === plain) ?? null);
    a.declareAttackersFn = () => [iroh, countered, plain].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    expect(counters(game, plain)).toBe(1);
    expect(redFloating(game)).toBe(2);
  });
});

describe("Nissa, Steward of Elements", () => {
  it("enters with X loyalty, and her 0 puts a creature with mana value up to her loyalty onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 2);
    const nissa = toHand(game, "Nissa, Steward of Elements");
    cast(game, nissa, { x: 2 });
    expect(counters(game, nissa, "loyalty")).toBe(2);
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    loyalty(game, nissa, 0);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("leaves a creature whose mana value is above her loyalty on top", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const nissa = toHand(game, "Nissa, Steward of Elements");
    cast(game, nissa, { x: 1 });
    expect(counters(game, nissa, "loyalty")).toBe(1);
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a);
    loyalty(game, nissa, 0);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, bears)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(bears);
  });

  it("−6 untaps up to two lands you control and makes them 5/5 flying, haste Elementals", () => {
    const { game } = table();
    const nissa = spawn(game, "Nissa, Steward of Elements");
    const [forest, island] = [spawn(game, "Forest", A, { tapped: true }), spawn(game, "Island", A, { tapped: true })];
    loyalty(game, nissa, -6, { atLeast: 6, targets: [ref(forest), ref(island)] });
    for (const land of [forest, island]) {
      expect(game.state.objects[land].tapped).toBe(false);
      expect(pt(game, land)).toEqual({ power: 5, toughness: 5 });
      expect(keywords(game, land).has("flying")).toBe(true);
      expect(subtypes(game, land)).toContain("Elemental");
    }
  });
});

describe("Skullport Merchant", () => {
  it("draws for a Treasure or another creature, never itself", () => {
    const { game } = table();
    const merchant = enter(game, "Skullport Merchant");
    const [treasure] = named(game, "Treasure Token", A);
    lands(game, "Swamp", 4);
    expect(() => activateSacrificing(game, merchant, 0, merchant)).toThrow();
    const before = hand(game).length;
    activateSacrificing(game, merchant, 0, treasure);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Big Apple, 3 a.m.", () => {
  it("makes a Rat for each opponent", () => {
    const { game } = table({ players: 3 });
    const apple = spawn(game, "Big Apple, 3 a.m.");
    game.state.objects[apple].tapped = false;
    lands(game, "Wastes", 5);
    activate(game, apple, 1);
    expect(tokensNamed(game, "Rat Token", A)).toBe(2);
    expect(tokensNamed(game, "Rat Token", C)).toBe(0);
  });
});
