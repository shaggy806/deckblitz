// Batch 326 (author-freed): the cards freed by the exile-a-spell, cast-from-
// linked-exile, pay-life-as-enters, first-draw-reveal, can't-attack-you and
// exiled-card-gains-a-trigger families — and the cap on the life paid as it
// enters (`payLife: { atMost }`) that Nameless Race needed.

import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { ChooseNumberOffer, ScriptedController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  destroy,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  setTurnTotal,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The seat casts the first card of each offer, `max` in all, targeting
 * `targets`; what it was offered, by name, offer by offer. */
function castAll(
  seat: ScriptedController,
  targets: readonly ReturnType<typeof ref>[] = [],
  max = Infinity,
): { offers: string[][] } {
  const seen = { offers: [] as string[][], cast: 0 };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offers.push(offer.casts.map((c) => c.cardName));
    const way = offer.casts[0];
    if (way === undefined || seen.cast >= max) return null;
    seen.cast += 1;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: way.card,
      targets: [...targets],
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
  return seen;
}

/** `player`'s library, top first. */
function stackLibrary(game: Game, player: PlayerId, top: readonly ObjectId[]): void {
  const lib = game.state.zones.perPlayer[player].library;
  game.state.zones.perPlayer[player].library = [...top, ...lib.filter((id) => !top.includes(id))];
}

const canAttack = (game: Game, player: PlayerId, creature: ObjectId, target: PlayerId | ObjectId): boolean =>
  whyCannotAttack(game.state, registryOf(game), player, creature, target) === null;

describe("Eye of the Storm", () => {
  it("exiles each instant or sorcery card cast, and its caster casts copies of every card it holds", () => {
    const { game, a } = table();
    spawn(game, "Eye of the Storm");
    lands(game, "Mountain", 2);
    const seen = castAll(a, [ref(B)]);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    // The card never resolves; its copy does — and the copy doesn't trigger it again.
    expect(zone(game, bolt)).toBe("exile");
    expect(seen.offers[0]).toEqual(["Lightning Bolt"]);
    expect(life(game, B)).toBe(17);
    expect(seen.offers).toEqual([["Lightning Bolt"]]);
    const again = castAll(a, [ref(B)]);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    // Both cards exiled with it are copied, each once: 3 + 2 more.
    expect(zone(game, shock)).toBe("exile");
    expect([...again.offers[0]].sort()).toEqual(["Lightning Bolt", "Shock"]);
    expect(again.offers[1]).toHaveLength(1);
    expect(life(game, B)).toBe(12);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("another player's cast copies every card exiled with it, whoever owns it", () => {
    const { game, a, b } = table();
    spawn(game, "Eye of the Storm");
    lands(game, "Mountain", 1);
    castAll(a, [ref(B)]);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const seen = castAll(b, [ref(A)]);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(seen.offers.flat()).toContain("Lightning Bolt");
    expect(life(game, A)).toBe(15);
  });
});

describe("Rod of Absorption", () => {
  it("exiles instants and sorceries as they resolve, then casts them free up to total mana value X", () => {
    const { game, a } = table();
    const rod = spawn(game, "Rod of Absorption");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].exiledWith?.source).toBe(rod);
    lands(game, "Island", 3);
    const divination = toHand(game, "Divination");
    cast(game, divination);
    expect(zone(game, divination)).toBe("exile");
    // X = 1: Bolt fits, Divination (3) doesn't.
    lands(game, "Wastes", 1);
    const seen = castAll(a, [ref(B)]);
    activate(game, rod, 0, { x: 1 });
    expect(zone(game, rod)).toBe("graveyard");
    expect(seen.offers.flat()).toContain("Lightning Bolt");
    expect(seen.offers.flat()).not.toContain("Divination");
    expect(life(game, B)).toBe(14);
    expect(zone(game, divination)).toBe("exile");
  });

  it("doesn't exile a countered spell", () => {
    const { game } = table();
    spawn(game, "Rod of Absorption");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    lands(game, "Island", 2, B);
    cast(game, toHand(game, "Counterspell", B), { player: B, targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Spell Queller", () => {
  it("exiles a spell of mana value 4 or less, and its owner may cast it free when Queller leaves", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    lands(game, "Plains", 1, B);
    lands(game, "Island", 2, B);
    pickTargets(b, bears);
    const queller = toHand(game, "Spell Queller", B);
    cast(game, queller, { player: B });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, queller)).toBe("battlefield");
    const seen = castAll(a);
    destroy(game, queller, A);
    settle(game);
    expect(seen.offers.flat()).toEqual(["Grizzly Bears"]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("can't target a spell of mana value 5", () => {
    const { game, b } = table();
    lands(game, "Island", 5);
    const elemental = toHand(game, "Air Elemental");
    cast(game, elemental, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    lands(game, "Plains", 1, B);
    lands(game, "Island", 2, B);
    pickTargets(b, elemental);
    cast(game, toHand(game, "Spell Queller", B), { player: B });
    // Air Elemental is mana value 5: no legal target, so it resolves.
    expect(zone(game, elemental)).toBe("battlefield");
  });
});

describe("Lady Loki, Agent of Chaos", () => {
  it("exiles your first instant, exiles until a nonland card, deals the mana value difference and casts that card free", () => {
    const { game, a } = table();
    spawn(game, "Lady Loki, Agent of Chaos");
    lands(game, "Mountain", 1);
    const mountain = toLibrary(game, "Mountain");
    const bears = toLibrary(game, "Grizzly Bears");
    stackLibrary(game, A, [mountain, bears]);
    const seen = castAll(a);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, mountain)).toBe("exile");
    // |1 - 2| = 1 to each opponent; Bolt itself never resolved.
    expect(life(game, B)).toBe(19);
    expect(seen.offers).toEqual([["Grizzly Bears"]]);
    expect(zone(game, bears)).toBe("battlefield");
    // A second instant this turn doesn't trigger it.
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("reads an X spell's mana value as it was cast", () => {
    const { game, a } = table();
    spawn(game, "Lady Loki, Agent of Chaos");
    lands(game, "Mountain", 4);
    const bears = toLibrary(game, "Grizzly Bears");
    stackLibrary(game, A, [bears]);
    a.chooseCastNowFn = () => null;
    const blaze = toHand(game, "Blaze");
    cast(game, blaze, { targets: [ref(B)], x: 3 });
    // Blaze with X = 3 is mana value 4: |4 - 2| = 2.
    expect(zone(game, blaze)).toBe("exile");
    expect(life(game, B)).toBe(18);
    // Not cast: it stays exiled.
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Minion of the Wastes and Nameless Race", () => {
  it("Minion of the Wastes is as big as the life paid as it entered", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    a.chooseNumberFn = () => 5;
    const minion = toHand(game, "Minion of the Wastes");
    cast(game, minion);
    expect(life(game, A)).toBe(15);
    expect(pt(game, minion)).toEqual({ power: 5, toughness: 5 });
  });

  it("Nameless Race can't pay more than the opponents' white nontoken permanents plus white cards in their graveyards", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Savannah Lions", B);
    spawn(game, "Serra Angel", C);
    spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Savannah Lions", C);
    // Not counted: your own white card, a black card in theirs.
    toGraveyard(game, "Savannah Lions", A);
    spawn(game, "Serra Angel", A);
    toGraveyard(game, "Duress", B);
    lands(game, "Swamp", 4);
    const offers: ChooseNumberOffer[] = [];
    a.chooseNumberFn = (_view, offer) => {
      offers.push(offer);
      return offer.max ?? 0;
    };
    const race = toHand(game, "Nameless Race");
    cast(game, race);
    expect(offers.map((o) => [o.min, o.max])).toEqual([[0, 3]]);
    expect(life(game, A)).toBe(17);
    expect(pt(game, race)).toEqual({ power: 3, toughness: 3 });
  });

  it("Nameless Race with nothing white across the table pays nothing and dies", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    let asked = 0;
    a.chooseNumberFn = () => {
      asked += 1;
      return 0;
    };
    const race = toHand(game, "Nameless Race");
    cast(game, race);
    expect(asked).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(zone(game, race)).toBe("graveyard");
  });
});

describe("Inquisitor Eisenhorn", () => {
  /** `player` draws one as an effect, as their first draw this turn. */
  const draw = (game: Game, player: PlayerId): void => {
    setTurnTotal(game.state, player, "card-drawn", 0);
    const effect: EffectSpec = { kind: "draw", amount: 1 };
    game.debugApplyEffect(player, effect);
    settle(game);
  };

  it("a revealed first-drawn instant makes Cherubael; kept hidden, nothing", () => {
    const { game, a } = table();
    spawn(game, "Inquisitor Eisenhorn");
    const bolt = toLibrary(game, "Lightning Bolt");
    stackLibrary(game, A, [bolt]);
    a.revealMiracleFn = () => true;
    draw(game, A);
    expect(zone(game, bolt)).toBe("hand");
    expect(tokensNamed(game, "Cherubael Token", A)).toBe(1);
    const shock = toLibrary(game, "Shock");
    stackLibrary(game, A, [shock]);
    a.revealMiracleFn = () => false;
    draw(game, A);
    expect(tokensNamed(game, "Cherubael Token", A)).toBe(1);
  });

  it("a revealed creature makes nothing", () => {
    const { game, a } = table();
    spawn(game, "Inquisitor Eisenhorn");
    const bears = toLibrary(game, "Grizzly Bears");
    stackLibrary(game, A, [bears]);
    a.revealMiracleFn = () => true;
    draw(game, A);
    expect(tokensNamed(game, "Cherubael Token", A)).toBe(0);
  });
});

describe("Web of Inertia", () => {
  it("a player who doesn't exile a card from their graveyard can't attack you this turn, but can attack others", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Web of Inertia");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game, "begin-combat");
    settle(game);
    // An empty graveyard: nothing to exile.
    expect(canAttack(game, B, bears, A)).toBe(false);
    expect(canAttack(game, B, bears, C)).toBe(true);
    // A creature they get later this turn is bound too.
    const later = spawn(game, "Grizzly Bears", B);
    expect(canAttack(game, B, later, A)).toBe(false);
  });

  it("exiling a card from their graveyard leaves the attack open", () => {
    const { game, b } = table();
    spawn(game, "Web of Inertia");
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toGraveyard(game, "Duress", B);
    pickModes(b, 0);
    pickFromZone(b, card);
    nextTurn(game, "begin-combat");
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(canAttack(game, B, bears, A)).toBe(true);
  });

  it("declining with cards in the graveyard binds them", () => {
    const { game, b } = table();
    spawn(game, "Web of Inertia");
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toGraveyard(game, "Duress", B);
    pickModes(b);
    nextTurn(game, "begin-combat");
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(canAttack(game, B, bears, A)).toBe(false);
  });
});

describe("Uvilda, Dean of Perfection // Nassari, Dean of Expression", () => {
  it("exiles an instant or sorcery with three refine counters; off the last, you may cast it for {4} less", () => {
    const { game, a } = table();
    const uvilda = spawn(game, "Uvilda, Dean of Perfection");
    const divination = toHand(game, "Divination");
    toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, divination);
    activate(game, uvilda, 0);
    expect(seen.offered).toEqual([divination]);
    expect(zone(game, divination)).toBe("exile");
    expect(counters(game, divination, "refine")).toBe(3);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, divination, "refine")).toBe(2);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, divination, "refine")).toBe(1);
    // {2}{U} for {4} less is {U}: one Island pays it.
    const [island] = lands(game, "Island", 1);
    const cast = castAll(a);
    const library = game.state.zones.perPlayer[A].library.length;
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, divination, "refine")).toBe(0);
    expect(cast.offers).toEqual([["Divination"]]);
    expect(zone(game, divination)).toBe("graveyard");
    expect(game.state.objects[island].tapped).toBe(true);
    // Its two cards, and the draw step's one.
    expect(game.state.zones.perPlayer[A].library.length).toBe(library - 3);
  });

  it("may exile nothing", () => {
    const { game, a } = table();
    const uvilda = spawn(game, "Uvilda, Dean of Perfection");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseFromZoneFn = () => [];
    activate(game, uvilda, 0);
    expect(zone(game, bolt)).toBe("hand");
  });

  it("Nassari exiles each opponent's top card for you to cast this turn, and grows when you cast from exile", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 5);
    const nassari = toHand(game, "Uvilda, Dean of Perfection");
    cast(game, nassari, { face: 1 });
    expect(zone(game, nassari)).toBe("battlefield");
    // Carol's turn, the others' draws behind them.
    toStep(game, "end", C);
    const bobs = toLibrary(game, "Lightning Bolt", B);
    stackLibrary(game, B, [bobs]);
    const carols = toLibrary(game, "Grizzly Bears", C);
    stackLibrary(game, C, [carols]);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bobs)).toBe("exile");
    expect(zone(game, carols)).toBe("exile");
    toStep(game, "precombat-main");
    // Any color: a Swamp pays Bolt's {R}.
    lands(game, "Swamp", 1);
    const offer = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === bobs);
    if (offer?.kind !== "cast-spell") throw new Error("Bob's Bolt isn't castable from exile");
    expect(game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === carols)).toBe(true);
    cast(game, bobs, { targets: [ref(B)], ...(offer.via !== undefined ? { via: offer.via } : {}) });
    expect(life(game, B)).toBe(17);
    expect(counters(game, nassari, "+1/+1")).toBe(1);
  });
});
