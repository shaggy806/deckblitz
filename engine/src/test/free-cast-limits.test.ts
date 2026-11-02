/**
 * Free casts from among exiled or copied cards under a limit: `cast-now`'s
 * `upTo` (Collected Conjuring, Doom Reigns Supreme, Ashiok, Nightmare Muse) and
 * `totalManaValue` (Primeval Spawn, Uldaros Theorix) — each spell its own offer,
 * the running count or total on the offer, a spell that no longer fits not
 * offered. And `EnterInstead`'s `exileUnless` (Primeval Spawn).
 */

import { describe, expect, it } from "vitest";
import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  loyalty,
  named,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

type Offer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

/** The seat casts `want` in turn, by name, then declines, recording each offer. */
function casting(seat: ScriptedController, want: readonly string[]): Offer[] {
  const offers: Offer[] = [];
  const left = [...want];
  seat.chooseCastNowFn = (_view, offer): Cast | null => {
    offers.push(offer);
    const name = left.shift();
    if (name === undefined) return null;
    const way = offer.casts.find((c) => c.cardName === name);
    if (way === undefined) throw new Error(`${name} isn't on offer: ${offer.casts.map((c) => c.cardName).join(", ")}`);
    return { type: "cast-spell", player: A, card: way.card, targets: [], via: "effect", free: true };
  };
  return offers;
}

const offeredNames = (offer: Offer): readonly string[] => [...new Set(offer.casts.map((c) => c.cardName))].sort();

/** Puts `names` on top of `player`'s library, first name on top. */
function stacked(game: Game, names: readonly string[], player = A): ObjectId[] {
  const ids = names.map((name) => toLibrary(game, name, player));
  const library = game.state.zones.perPlayer[player].library;
  game.state.zones.perPlayer[player].library = [...ids, ...library.filter((id) => !ids.includes(id))];
  return ids;
}

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** A land of each colour, `n` times. */
function rainbow(game: Game, n: number): void {
  for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, n);
}

describe("Collected Conjuring — up to two, under a filter, the rest to the bottom", () => {
  const top = ["Divination", "Night's Whisper", "Preordain", "Wrath of God", "Lightning Bolt", "Grizzly Bears"];

  it("offers only what the filter allows, and stops after two", () => {
    const { game, a } = table();
    rainbow(game, 1);
    const [divination, whisper, preordain, wrath, bolt, bears] = stacked(game, top);
    const offers = casting(a, ["Divination", "Night's Whisper"]);
    cast(game, toHand(game, "Collected Conjuring"));
    expect(offers).toHaveLength(2);
    // Wrath of God is mana value 4, Bolt an instant, Bears a creature.
    expect(offeredNames(offers[0])).toEqual(["Divination", "Night's Whisper", "Preordain"]);
    expect(offeredNames(offers[1])).toEqual(["Night's Whisper", "Preordain"]);
    expect(offers.map((o) => o.castsLeft)).toEqual([2, 1]);
    expect(graveyard(game)).toEqual(expect.arrayContaining([divination, whisper]));
    // The other four on the bottom: Preordain was never offered a third time.
    expect([...library(game).slice(-4)].sort()).toEqual([preordain, wrath, bolt, bears].sort());
  });

  it("declining the first ends it, and all six go to the bottom", () => {
    const { game, a } = table();
    rainbow(game, 1);
    const cards = stacked(game, top);
    const offers = casting(a, []);
    cast(game, toHand(game, "Collected Conjuring"));
    expect(offers).toHaveLength(1);
    expect([...library(game).slice(-6)].sort()).toEqual([...cards].sort());
  });
});

describe("Primeval Spawn", () => {
  /** A Spawn cast for its mana, on the battlefield. */
  function spawnInPlay(game: Game): ObjectId {
    rainbow(game, 2);
    const card = toHand(game, "Primeval Spawn");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    return card;
  }
  const wastes = (n: number): string[] => Array<string>(n).fill("Wastes");

  it("keeps a running total: a spell over what's left isn't offered", () => {
    const { game, a } = table();
    const spawned = spawnInPlay(game);
    stacked(game, ["Wrath of God", "Divination", "Preordain", "Grizzly Bears", "Pelakka Wurm", ...wastes(5)]);
    const offers = casting(a, ["Pelakka Wurm", "Divination"]);
    destroy(game, spawned);
    settle(game);
    expect(offers[0].manaValueLeft).toBe(10);
    expect(offeredNames(offers[0])).toEqual(["Divination", "Grizzly Bears", "Pelakka Wurm", "Preordain", "Wrath of God"]);
    // 7 spent: Wrath of God (4) no longer fits.
    expect(offers[1].manaValueLeft).toBe(3);
    expect(offeredNames(offers[1])).toEqual(["Divination", "Grizzly Bears", "Preordain"]);
    // 10 spent: no spell left that fits, so no third offer.
    expect(offers).toHaveLength(2);
    expect(named(game, "Pelakka Wurm", A)).toHaveLength(1);
  });

  it("a spell of mana value 0 still fits a total used up", () => {
    const { game, a } = table();
    const spawned = spawnInPlay(game);
    stacked(game, ["Pelakka Wurm", "Divination", "Ornithopter", ...wastes(7)]);
    const offers = casting(a, ["Pelakka Wurm", "Divination", "Ornithopter"]);
    destroy(game, spawned);
    settle(game);
    expect(offers.map((o) => o.manaValueLeft)).toEqual([10, 3, 0]);
    expect(offeredNames(offers[2])).toEqual(["Ornithopter"]);
    expect(named(game, "Ornithopter", A)).toHaveLength(1);
  });

  it("is exiled instead of entering when it wasn't cast, and so never leaves", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const dead = toGraveyard(game, "Primeval Spawn");
    const offers = casting(a, []);
    const before = library(game).length;
    cast(game, toHand(game, "Reanimate"), { targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("exile");
    expect(library(game).length).toBe(before);
    expect(offers).toHaveLength(0);
  });

  it("is exiled instead of entering when no mana was spent to cast it", () => {
    const { game, a } = table();
    const ashiok = spawn(game, "Ashiok, Nightmare Muse");
    const card = toExile(game, "Primeval Spawn", B);
    casting(a, ["Primeval Spawn"]);
    loyalty(game, ashiok, -7, { atLeast: 7 });
    settle(game);
    expect(game.state.objects[card].zone).toBe("exile");
    expect(named(game, "Primeval Spawn")).toHaveLength(0);
    expect(game.state.eventLog.some((e) => e.type === "spell-cast" && e.object === card)).toBe(true);
  });

  it("no token copy is made: a token is never cast", () => {
    const { game } = table();
    const spawned = spawnInPlay(game);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Cackling Counterpart"), { targets: [ref(spawned)] });
    expect(named(game, "Primeval Spawn", A)).toEqual([spawned]);
  });
});

describe("Uldaros Theorix — copies, under a total", () => {
  /** Cast Uldaros for his mana, picking `picks` for his eight target slots. */
  function castUldaros(game: Game, a: ScriptedController, picks: readonly ObjectId[]): ObjectId {
    rainbow(game, 2);
    // Only the slots with something to choose are asked.
    a.chooseTargetsFn = (_view, _name, _specs, options) => {
      const left = [...picks];
      return options.map((slot) => {
        const at = left.findIndex((id) => slot.some((t) => t.kind === "object" && t.object === id));
        return at < 0 ? null : ref(left.splice(at, 1)[0]);
      });
    };
    const card = toHand(game, "Uldaros Theorix");
    cast(game, card);
    return card;
  }

  it("exiles the targets, casts copies under the total, and a permanent copy is a token", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const wrath = toGraveyard(game, "Wrath of God");
    const offers = casting(a, ["Wrath of God", "Grizzly Bears"]);
    castUldaros(game, a, [bears, wrath]);
    expect(offers.map((o) => o.manaValueLeft)).toEqual([6, 2]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, wrath)).toBe("exile");
    // Wrath's copy is beneath the bears' on the stack, so the token entered and
    // was destroyed; a copy of a card never reaches a graveyard, and the cards
    // stay exiled.
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(0);
    expect(graveyard(game)).not.toContain(wrath);
  });

  it("the copy of a permanent card becomes a token", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    casting(a, ["Grizzly Bears"]);
    castUldaros(game, a, [bears]);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    expect(zone(game, bears)).toBe("exile");
  });

  it("a copy over the total isn't offered, and one not cast ceases to exist", () => {
    const { game, a } = table();
    const wurm = toGraveyard(game, "Pelakka Wurm");
    const offers = casting(a, []);
    castUldaros(game, a, [wurm]);
    expect(zone(game, wurm)).toBe("exile");
    // Mana value 7 against a total of 6: no offer.
    expect(offers).toHaveLength(0);
    const copies = game.state.zones.shared.exile.filter((id) => game.state.objects[id].isCopy === true);
    expect(copies).toHaveLength(0);
  });

  it("one card fills one slot however many types it has", () => {
    const { game, a } = table();
    const construct = toGraveyard(game, "Ornithopter");
    const offers = casting(a, ["Ornithopter"]);
    rainbow(game, 2);
    const seen: (readonly TargetRef[])[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, options) => {
      seen.push(...options);
      return options.map((_, i) => (i === 0 ? ref(construct) : null));
    };
    cast(game, toHand(game, "Uldaros Theorix"));
    // Offered for the artifact and the creature slot alike; chosen for one.
    expect(seen).toHaveLength(2);
    for (const slot of seen) expect(slot).toContainEqual(ref(construct));
    expect(offers).toHaveLength(1);
    expect(tokensNamed(game, "Ornithopter", A)).toBe(1);
  });

  it("refuses the same card for two slots (rule 115.3)", () => {
    const { game, a } = table();
    const construct = toGraveyard(game, "Ornithopter");
    rainbow(game, 2);
    a.chooseTargetsFn = (_view, _name, _specs, options) => options.map(() => ref(construct));
    expect(() => cast(game, toHand(game, "Uldaros Theorix"))).toThrow();
  });

  it("doesn't trigger if he wasn't cast", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const offers = casting(a, []);
    enter(game, "Uldaros Theorix");
    settle(game);
    expect(offers).toHaveLength(0);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Ashiok, Nightmare Muse", () => {
  it("−7: up to three, only face-up cards opponents own", () => {
    const { game, a } = table({ players: 4 });
    const ashiok = spawn(game, "Ashiok, Nightmare Muse");
    toExile(game, "Divination", B);
    toExile(game, "Night's Whisper", C);
    toExile(game, "Preordain", B);
    toExile(game, "Grizzly Bears", C);
    toExile(game, "Wrath of God", A); // Alice's own: not on offer.
    const offers = casting(a, ["Divination", "Night's Whisper", "Grizzly Bears"]);
    loyalty(game, ashiok, -7, { atLeast: 7 });
    settle(game);
    expect(offeredNames(offers[0])).toEqual(["Divination", "Grizzly Bears", "Night's Whisper", "Preordain"]);
    expect(offers.map((o) => o.castsLeft)).toEqual([3, 2, 1]);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });

  it("−7 leaves out a face-down card", () => {
    const { game, a } = table();
    const ashiok = spawn(game, "Ashiok, Nightmare Muse");
    const hidden = toExile(game, "Divination", B);
    game.state.objects[hidden].exiledFaceDown = { source: ashiok, zoneChangeCount: 0 } as never;
    toExile(game, "Night's Whisper", B);
    const offers = casting(a, []);
    loyalty(game, ashiok, -7, { atLeast: 7 });
    expect(offeredNames(offers[0])).toEqual(["Night's Whisper"]);
  });

  it("+1: the Nightmare exiles two from each opponent when it attacks", () => {
    const { game, a } = table({ players: 3 });
    const ashiok = spawn(game, "Ashiok, Nightmare Muse");
    loyalty(game, ashiok, 1);
    expect(counters(game, ashiok, "loyalty")).toBe(6);
    const [nightmare] = named(game, "Nightmare Token (Ashiok)", A);
    expect(nightmare).toBeDefined();
    toStep(game, "precombat-main");
    const before = [library(game, B).length, library(game, C).length];
    attack(game, a, [nightmare]);
    expect([library(game, B).length, library(game, C).length]).toEqual([before[0] - 2, before[1] - 2]);
  });

  it("−3: bounces, then the owner exiles a card of their choice from hand", () => {
    const { game, b } = table();
    const ashiok = spawn(game, "Ashiok, Nightmare Muse");
    const bears = spawn(game, "Grizzly Bears", B);
    const kept = toHand(game, "Divination", B);
    b.chooseFromZoneFn = (_view, eligible) => [eligible.find((id) => id === bears) ?? eligible[0]];
    loyalty(game, ashiok, -3, { targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game, B)).toContain(kept);
  });
});

describe("Doom Reigns Supreme", () => {
  it("the fifth counter: sacrifice, then target opponent's top five, up to two free", () => {
    const { game, a } = table();
    const doom = spawn(game, "Doom Reigns Supreme");
    stacked(game, ["Divination", "Night's Whisper", "Preordain", "Wastes", "Wastes"], B);
    game.state.objects[doom].counters = { plan: 4 };
    const offers = casting(a, ["Divination", "Night's Whisper"]);
    pickTargets(a, B);
    const bLife = life(game, B);
    enter(game, "Powerful Broker");
    settle(game);
    expect(life(game, B)).toBe(bLife - 1);
    expect(zone(game, doom)).toBe("graveyard");
    expect(offers.map((o) => o.castsLeft)).toEqual([2, 1]);
    expect(offeredNames(offers[0])).toEqual(["Divination", "Night's Whisper", "Preordain"]);
  });

  it("no plan counter for a creature that isn't a Villain", () => {
    const { game } = table();
    const doom = spawn(game, "Doom Reigns Supreme");
    enter(game, "Grizzly Bears");
    settle(game);
    expect(counters(game, doom, "plan")).toBe(0);
  });
});
