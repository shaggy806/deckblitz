/**
 * One-shot grants to the next (or first-each-turn) matching spell — the
 * `static:grant-abilities-to-spells` family's remaining group:
 *
 * - `grant-spells-this-turn` with `next`: the first matching spell cast after
 *   it resolves uses it up as it becomes cast (rule 601.2i) — cascade (Dark
 *   Apostle, Sloppity Bilepiper — 702.85a), can't be countered (Overmaster,
 *   Insist — 701.5f), convoke (Wand of the Worldsoul — 702.51a, judged while
 *   it's cast), and an additional +1/+1 counter beside a next-spell flash
 *   permission (Savage Summoning — 601.3b);
 * - `enters-with-counters`' `"sunburst"` from a next-spell delayed trigger
 *   (Solar Array — 702.44a);
 * - `grantsToSpells.firstEachTurn` over a `castFrom` or `manaSpent`'s `from` filter
 *   (Wild-Magic Sorcerer, Rain of Riches).
 */

import { describe, expect, it } from "vitest";

import { spellCantBeCountered } from "../characteristics.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  cast,
  counters,
  lands,
  nextTurn,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/** How many cascades have revealed cards so far. */
const cascades = (game: Game): number => game.eventsOfType("cascade-revealed").length;

const castsOf = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

/** Cast `card` the way the engine offers it (from exile under an impulse
 * permission, say). */
const castOffered = (game: Game, card: ObjectId): void => {
  const [offer] = castsOf(game, card);
  if (offer === undefined) throw new Error("not offered");
  cast(game, card, offer.via !== undefined ? { via: offer.via } : {});
};

/** Cast `card`, stopping with it on the stack (its cast triggers resolved
 * or not); whether it can't be countered there. */
const uncounterableOnStack = (game: Game, card: ObjectId): boolean => {
  cast(game, card, { settle: false });
  return spellCantBeCountered(game.state, registryOf(game), game.state.objects[card]);
};

describe("Dark Apostle — the next noncreature spell has cascade", () => {
  it("cascades from the next noncreature spell only, and only once", () => {
    const { game } = table();
    const apostle = spawn(game, "Dark Apostle");
    lands(game, "Mountain", 8);
    lands(game, "Island", 8);
    toLibrary(game, "Shock");
    activate(game, apostle);
    // A creature spell doesn't use it up.
    cast(game, toHand(game, "Hill Giant"));
    expect(cascades(game)).toBe(0);
    cast(game, toHand(game, "Divination"));
    expect(cascades(game)).toBe(1);
    // Used up: the next noncreature spell has no cascade.
    toLibrary(game, "Shock");
    cast(game, toHand(game, "Divination"));
    expect(cascades(game)).toBe(1);
  });

  it("ends with the turn", () => {
    const { game } = table();
    const apostle = spawn(game, "Dark Apostle");
    lands(game, "Island", 7);
    activate(game, apostle);
    nextTurn(game);
    nextTurn(game);
    toLibrary(game, "Shock");
    cast(game, toHand(game, "Divination"));
    expect(cascades(game)).toBe(0);
  });
});

describe("Sloppity Bilepiper — the next creature spell has cascade", () => {
  it("sacrifices a creature, then the next creature spell cascades", () => {
    const { game } = table();
    const piper = spawn(game, "Sloppity Bilepiper");
    const fodder = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 6);
    lands(game, "Island", 6);
    toLibrary(game, "Shock");
    game.dispatch({ type: "activate-ability", player: A, source: piper, abilityIndex: 0, targets: [], sacrifice: fodder });
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    cast(game, toHand(game, "Divination"));
    expect(cascades(game)).toBe(0);
    cast(game, toHand(game, "Hill Giant"));
    expect(cascades(game)).toBe(1);
  });
});

describe("Overmaster and Insist — the next matching spell can't be countered", () => {
  it("Overmaster: the next instant or sorcery, not a creature spell before it, nor the one after", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Overmaster"));
    expect(uncounterableOnStack(game, toHand(game, "Hill Giant"))).toBe(false);
    settle(game);
    expect(uncounterableOnStack(game, toHand(game, "Divination"))).toBe(true);
    settle(game);
    expect(uncounterableOnStack(game, toHand(game, "Divination"))).toBe(false);
  });

  it("Insist: the next creature spell, not an instant before it", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    lands(game, "Island", 3);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Insist"));
    expect(uncounterableOnStack(game, toHand(game, "Divination"))).toBe(false);
    settle(game);
    expect(uncounterableOnStack(game, toHand(game, "Hill Giant"))).toBe(true);
  });
});

describe("Savage Summoning — flash, can't be countered and a counter, all on the next creature spell", () => {
  it("lets the next creature spell be cast at instant speed, uncounterable, with an extra +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    toStep(game, "upkeep");
    cast(game, toHand(game, "Savage Summoning"));
    const bears = toHand(game, "Grizzly Bears");
    expect(castsOf(game, bears).length).toBeGreaterThan(0);
    expect(uncounterableOnStack(game, bears)).toBe(true);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
    // All used up: a second creature spell gets none of it.
    const giant = toHand(game, "Hill Giant");
    expect(castsOf(game, giant)).toEqual([]);
  });

  it("is used up by a creature spell cast when it could have been anyway", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Savage Summoning"));
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(1);
    const giant = toHand(game, "Hill Giant");
    expect(uncounterableOnStack(game, giant)).toBe(false);
    settle(game);
    expect(counters(game, giant)).toBe(0);
  });
});

describe("Wand of the Worldsoul — the next spell has convoke", () => {
  it("offers convoke to the next spell only", () => {
    const { game } = table();
    const wand = spawn(game, "Wand of the Worldsoul");
    // It enters tapped: wait for the untap step.
    nextTurn(game);
    nextTurn(game);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Island", 1);
    const divination = toHand(game, "Divination");
    expect(castsOf(game, divination)).toEqual([]);
    activate(game, wand, 1);
    const [offer] = castsOf(game, divination);
    expect(offer?.convoke?.candidates).toEqual(expect.arrayContaining(bears));
    cast(game, divination, { convoke: bears.map((creature) => ({ creature })) });
    expect(zone(game, divination)).toBe("graveyard");
    // Used up.
    const second = toHand(game, "Divination");
    spawn(game, "Grizzly Bears");
    expect(castsOf(game, second).every((a) => a.convoke === undefined)).toBe(true);
  });
});

describe("Solar Array — the next artifact spell gains sunburst", () => {
  it("a noncreature artifact enters with a charge counter for each color spent", () => {
    const { game } = table();
    const array = spawn(game, "Solar Array");
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    // {T}: add one mana of any color — then the colors paid for a Mind Stone.
    activate(game, array, 0);
    const stone = toHand(game, "Mind Stone");
    cast(game, stone);
    expect(zone(game, stone)).toBe("battlefield");
    const colors = Object.values(game.state.objects[stone].counters ?? {}).reduce((n, c) => n + (c ?? 0), 0);
    expect(counters(game, stone, "charge")).toBe(colors);
    expect(counters(game, stone, "charge")).toBeGreaterThanOrEqual(1);
  });

  it("an artifact creature gets +1/+1 counters, and a later artifact spell nothing", () => {
    const { game } = table();
    const array = spawn(game, "Solar Array");
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 4);
    activate(game, array, 0);
    const golem = toHand(game, "Bronze Sable");
    cast(game, golem);
    expect(counters(game, golem)).toBeGreaterThanOrEqual(1);
    const stone = toHand(game, "Mind Stone");
    cast(game, stone);
    expect(counters(game, stone, "charge")).toBe(0);
  });
});

describe("Wild-Magic Sorcerer — the first spell cast from exile each turn has cascade", () => {
  it("ignores spells cast from the hand, and cascades from the first one cast from exile only", () => {
    const { game } = table();
    spawn(game, "Wild-Magic Sorcerer");
    lands(game, "Mountain", 14);
    // Reckless Impulse exiles the top two — two Hill Giants — playable this
    // turn and next; then a Shock to cascade into.
    toLibrary(game, "Shock");
    toLibrary(game, "Shock");
    const giants = [toLibrary(game, "Hill Giant"), toLibrary(game, "Hill Giant")];
    cast(game, toHand(game, "Hill Giant"));
    cast(game, toHand(game, "Reckless Impulse"));
    expect(cascades(game)).toBe(0);
    expect(giants.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    castOffered(game, giants[0]);
    expect(cascades(game)).toBe(1);
    castOffered(game, giants[1]);
    expect(cascades(game)).toBe(1);
  });
});

describe("Rain of Riches — the first spell each turn paid for with Treasure mana has cascade", () => {
  it("makes two Treasures; a spell paid without one has no cascade, the first one paid with one does", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Rain of Riches"));
    const treasures = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Treasure Token");
    expect(treasures).toHaveLength(2);
    toLibrary(game, "Shock");
    // Four fresh Mountains pay for the Hill Giant: no Treasure mana, no cascade.
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Hill Giant"));
    expect(cascades(game)).toBe(0);
    // Only the Treasures are left to pay for the Grizzly Bears.
    cast(game, toHand(game, "Grizzly Bears"));
    expect(treasures.every((id) => game.state.objects[id]?.zone !== "battlefield")).toBe(true);
    expect(cascades(game)).toBe(1);
});
});
