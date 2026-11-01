/**
 * `CopyOnEnter` past the battlefield and past a fixed exception: a copy of a
 * card in a graveyard or exile (rule 707.2, asked as a `choose-from-zone`), a
 * copy behind a condition (raid), the "when you do" written in the same
 * paragraph (rules 603.11, 707.9g), a counter only if you control what it
 * copied (707.9e), the copier's own P/T as an exception, and "it becomes your
 * choice of" as a copiable value (`BecomesOnEnter`, rule 707.2).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  attack,
  cast,
  lands,
  nextTurn,
  pickFromZone,
  pickPermanents,
  registryOf,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf, nameOf } from "../state.js";

const chars = (game: Game, id: ObjectId) => computeCharacteristics(game.state, registryOf(game), id);

describe("copying a card in a graveyard or exile", () => {
  it("offers every graveyard's cards as a zone choice, and enters as the chosen card (Body Double)", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Serra Angel", B);
    toGraveyard(game, "Island");
    const seen = pickFromZone(a, theirs);
    const double = toHand(game, "Body Double");
    cast(game, double);
    expect(seen.offered).toEqual([mine, theirs]);
    expect(game.state.objects[double].copyOf).toBe("Serra Angel");
    const c = chars(game, double);
    expect([c.power, c.toughness]).toEqual([4, 4]);
    expect(c.keywords.has("flying")).toBe(true);
    // The card it copied stays where it was: nothing moves.
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("declining is 'copy nothing': a 0/0 that dies (its ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    toGraveyard(game, "Grizzly Bears");
    pickFromZone(a);
    const double = toHand(game, "Body Double");
    cast(game, double);
    expect(zone(game, double)).toBe("graveyard");
  });

  it("with nothing to copy it never pauses", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const double = toHand(game, "Body Double");
    cast(game, double);
    expect(game.state.awaiting).toBeNull();
    expect(zone(game, double)).toBe("graveyard");
  });

  it("enters tapped only if it copies, with a type added (Echoing Deeps)", () => {
    const copying = table();
    const shock = toGraveyard(copying.game, "Forest");
    pickFromZone(copying.a, shock);
    const deeps = toHand(copying.game, "Echoing Deeps");
    copying.game.dispatch({ type: "play-land", player: A, card: deeps });
    settle(copying.game);
    expect(copying.game.state.objects[deeps].tapped).toBe(true);
    expect(chars(copying.game, deeps).subtypes).toEqual(expect.arrayContaining(["Forest", "Cave"]));

    const declining = table();
    toGraveyard(declining.game, "Forest");
    pickFromZone(declining.a);
    const own = toHand(declining.game, "Echoing Deeps");
    declining.game.dispatch({ type: "play-land", player: A, card: own });
    settle(declining.game);
    expect(declining.game.state.objects[own].tapped).toBe(false);
    expect(declining.game.state.objects[own].copyOf ?? null).toBeNull();
  });

  it("narrows by when the card got there (Activated Sleeper: from the battlefield this turn)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    toGraveyard(game, "Serra Angel"); // never on the battlefield this turn
    const died = spawn(game, "Grizzly Bears", B);
    game.debugMove(died, "graveyard");
    expect(zone(game, died)).toBe("graveyard");
    const seen = pickFromZone(a, died);
    const sleeper = toHand(game, "Activated Sleeper");
    cast(game, sleeper);
    expect(seen.offered).toEqual([died]);
    expect(game.state.objects[sleeper].copyOf).toBe("Grizzly Bears");
    expect(chars(game, sleeper).subtypes).toEqual(expect.arrayContaining(["Bear", "Phyrexian"]));
  });

  it("reads a card in exile, by its counter (The Master, Formed Anew)", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    const angel = spawn(game, "Serra Angel");
    toExile(game, "Grizzly Bears"); // no takeover counter
    pickPermanents(a, angel);
    const seen = pickFromZone(a, angel);
    const master = toHand(game, "The Master, Formed Anew");
    cast(game, master);
    expect(zone(game, angel)).toBe("exile");
    expect(game.state.objects[angel].counters["takeover"]).toBe(1);
    expect(seen.offered).toEqual([angel]);
    expect(game.state.objects[master].copyOf).toBe("Serra Angel");
    expect(chars(game, master).keywords.has("flying")).toBe(true);
  });
});

describe("a copy behind a condition", () => {
  it("isn't offered until you attacked this turn, and then is (Protean Raider)", () => {
    const quiet = table();
    lands(quiet.game, "Island", 2);
    lands(quiet.game, "Mountain", 1);
    spawn(quiet.game, "Serra Angel");
    const offered: unknown[] = [];
    quiet.a.chooseCopyFn = (_v, _s, options) => {
      offered.push(options);
      return options[0] ?? null;
    };
    const raider = toHand(quiet.game, "Protean Raider");
    cast(quiet.game, raider);
    expect(offered).toEqual([]);
    const c = chars(quiet.game, raider);
    expect([c.power, c.toughness]).toEqual([2, 2]);

    const raiding = table();
    lands(raiding.game, "Island", 2);
    lands(raiding.game, "Mountain", 1);
    const angel = spawn(raiding.game, "Serra Angel");
    raiding.a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    attack(raiding.game, raiding.a, [angel]);
    const second = toHand(raiding.game, "Protean Raider");
    cast(raiding.game, second);
    expect(raiding.game.state.objects[second].copyOf).toBe("Serra Angel");
  });
});

describe("'when you do' (rules 603.11, 707.9g)", () => {
  it("exiles the card once he's entered, with a chance to respond (Superior Spider-Man)", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    const spidey = toHand(game, "Superior Spider-Man");
    cast(game, spidey, { settle: false });
    // Answer the copy; the entry finishes, and the ability is on the stack.
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id].reflexiveTrigger !== undefined));
    expect(zone(game, spidey)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    const c = chars(game, spidey);
    expect(game.state.objects[spidey].copyOf).toBe("Hill Giant");
    expect(nameOf(game.state.objects[spidey])).toBe("Superior Spider-Man");
    expect([c.power, c.toughness]).toEqual([4, 4]);
    expect(c.subtypes).toEqual(expect.arrayContaining(["Giant", "Spider", "Human", "Hero"]));
  });

  it("doesn't trigger when declining", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a);
    const spidey = toHand(game, "Superior Spider-Man");
    cast(game, spidey);
    expect(zone(game, giant)).toBe("graveyard");
    const c = chars(game, spidey);
    expect([c.power, c.toughness]).toEqual([4, 4]);
  });

  it("taps the copied creature and keeps it tapped while you control the Wall (Wall of Stolen Identity)", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    const angel = spawn(game, "Serra Angel", B);
    a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    const wall = toHand(game, "Wall of Stolen Identity");
    cast(game, wall);
    const c = chars(game, wall);
    expect(c.keywords.has("defender")).toBe(true);
    expect(c.subtypes).toEqual(expect.arrayContaining(["Angel", "Wall"]));
    expect(game.state.objects[angel].tapped).toBe(true);
    nextTurn(game); // bob's untap step
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.objects[angel].tapped).toBe(true);
  });

  it("the Wall gone before it resolves: tapped, but it untaps as normal (its ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    const angel = spawn(game, "Serra Angel", B);
    a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    const wall = toHand(game, "Wall of Stolen Identity");
    cast(game, wall, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id].reflexiveTrigger !== undefined));
    game.debugMove(wall, "graveyard");
    settle(game);
    expect(game.state.objects[angel].tapped).toBe(true);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.objects[angel].tapped).toBe(false);
  });

  it("an object that moved on is a new one: nothing is exiled (rule 400.7)", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    const giant = toGraveyard(game, "Hill Giant");
    pickFromZone(a, giant);
    const spidey = toHand(game, "Superior Spider-Man");
    cast(game, spidey, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id].reflexiveTrigger !== undefined));
    // The card leaves the graveyard and comes back in response.
    game.debugMove(giant, "hand");
    game.debugMove(giant, "graveyard");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("a counter only if you control what it copied (Undercover Operative)", () => {
  it("gets a shield counter from your own creature, none from an opponent's", () => {
    const own = table();
    lands(own.game, "Island", 4);
    spawn(own.game, "Grizzly Bears");
    own.a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    const mine = toHand(own.game, "Undercover Operative");
    cast(own.game, mine);
    expect(own.game.state.objects[mine].counters["shield"]).toBe(1);

    const theirs = table();
    lands(theirs.game, "Island", 4);
    spawn(theirs.game, "Grizzly Bears", B);
    theirs.a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    const other = toHand(theirs.game, "Undercover Operative");
    cast(theirs.game, other);
    expect(theirs.game.state.objects[other].copyOf).toBe("Grizzly Bears");
    expect(theirs.game.state.objects[other].counters["shield"] ?? 0).toBe(0);
  });
});

describe("exceptions that change what it is", () => {
  it("a Vehicle artifact with crew 3 and no other card type or subtype (Imposter Mech)", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    spawn(game, "Grizzly Bears", B);
    const crewA = spawn(game, "Serra Angel");
    a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    const mech = toHand(game, "Imposter Mech");
    cast(game, mech);
    let c = chars(game, mech);
    expect(game.state.objects[mech].copyOf).toBe("Grizzly Bears");
    expect(c.types).toEqual(["artifact"]);
    expect(c.subtypes).toEqual(["Vehicle"]);
    // Crewed, it's a creature with the copied P/T — and still no Bear.
    game.dispatch({ type: "activate-ability", player: A, source: mech, abilityIndex: 0, targets: [], tap: [crewA] });
    settle(game);
    c = chars(game, mech);
    expect(c.types).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(c.subtypes).toEqual(["Vehicle"]);
    expect([c.power, c.toughness]).toEqual([2, 2]);
  });

  it("an enchantment in addition to its types, and a land to tap (Copy Land)", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    const copy = toHand(game, "Copy Land");
    cast(game, copy);
    const c = chars(game, copy);
    expect(c.types).toEqual(expect.arrayContaining(["land", "enchantment"]));
    expect(c.subtypes).toEqual(["Island"]);
  });

  it("its own P/T: the printed 7/7 or the prototype's 3/3 (Hulking Metamorph)", () => {
    const { game, a } = table();
    lands(game, "Island", 9);
    spawn(game, "Grizzly Bears");
    a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    const full = toHand(game, "Hulking Metamorph");
    cast(game, full);
    let c = chars(game, full);
    expect(game.state.objects[full].copyOf).toBe("Grizzly Bears");
    expect([c.power, c.toughness]).toEqual([7, 7]);
    expect(c.types).toEqual(expect.arrayContaining(["artifact", "creature"]));

    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    const small = toHand(game, "Hulking Metamorph");
    cast(game, small, { prototype: true });
    c = chars(game, small);
    expect(game.state.objects[small].copyOf).toBe("Grizzly Bears");
    expect([c.power, c.toughness]).toEqual([3, 3]);
  });
});

describe("'it becomes your choice of' (BecomesOnEnter, rule 707.2)", () => {
  it("is the chosen form on the battlefield, and 0/0 elsewhere (Corrupted Shapeshifter)", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Swamp", 1);
    a.chooseCreatureTypeFn = (_v, _s, options) => options[1];
    const shifter = toHand(game, "Corrupted Shapeshifter");
    const before = chars(game, shifter);
    expect([before.power, before.toughness]).toEqual([0, 0]);
    cast(game, shifter);
    const c = chars(game, shifter);
    expect([c.power, c.toughness]).toEqual([2, 5]);
    expect(c.keywords.has("vigilance")).toBe(true);
  });

  it("is copied, and a copy chooses over it: flying and defender at 1/6 (Primal Clay's ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 12);
    a.chooseCreatureTypeFn = (_v, _s, options) => options[1]; // the flyer
    const clay = toHand(game, "Primal Clay");
    cast(game, clay);
    expect(chars(game, clay).keywords.has("flying")).toBe(true);

    a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    a.chooseCreatureTypeFn = (_v, _s, options) => options[2]; // the Wall
    const clone = toHand(game, "Clone");
    cast(game, clone);
    const c = chars(game, clone);
    expect(game.state.objects[clone].copyOf).toBe("Primal Clay");
    expect([c.power, c.toughness]).toEqual([1, 6]);
    expect(c.keywords.has("flying")).toBe(true);
    expect(c.keywords.has("defender")).toBe(true);
    expect(c.subtypes).toEqual(expect.arrayContaining(["Shapeshifter", "Wall"]));
  });

  it("flips a coin with nothing to ask (Molten Sentry)", () => {
    const results = new Set<number>();
    for (let seed = 1; seed < 12; seed += 1) {
      const { game } = table({ seed });
      lands(game, "Mountain", 4);
      const sentry = toHand(game, "Molten Sentry");
      cast(game, sentry);
      const c = chars(game, sentry);
      results.add(c.power);
      if (c.power === 5) {
        expect(c.toughness).toBe(2);
        expect(c.keywords.has("haste")).toBe(true);
      } else {
        expect([c.power, c.toughness]).toEqual([2, 5]);
        expect(c.keywords.has("defender")).toBe(true);
      }
    }
    expect(results).toEqual(new Set([5, 2]));
  });
});
