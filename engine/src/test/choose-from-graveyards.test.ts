/**
 * The untargeted picks from graveyards and exile: `look-and-choose` over every
 * graveyard (Cemetery Gatekeeper, Cemetery Desecrator, The Deck of Many
 * Things), over one player's (Dreams of Steel and Oil, Breach the Multiverse's
 * "for each player"), over a player's or anyone's exile (Binding Negotiation,
 * Sengir Nosferatu's Bat), and `cast-now` over each opponent's graveyard,
 * one spell a graveyard (Jetsam). None of them is a target (rule 115.1).
 */
import { describe, expect, it } from "vitest";

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
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";
import { lastRollIn } from "../random-results.js";

describe("a card from any graveyard", () => {
  it("Cemetery Gatekeeper: exiles from any player's, and its damage asks about what's played or cast", () => {
    const { game, a } = table({ players: 3 });
    const mine = toGraveyard(game, "Hill Giant", A);
    const theirs = toGraveyard(game, "Hill Giant", B);
    const third = toGraveyard(game, "Forest", C);
    const seen = pickFromZone(a, theirs);
    enter(game, "Cemetery Gatekeeper");
    expect(new Set(seen.offered)).toEqual(new Set([mine, theirs, third]));
    expect(zone(game, theirs)).toBe("exile");

    // A creature shares a type with the exiled creature card; a land doesn't.
    const bolt = toHand(game, "Grizzly Bears", A);
    lands(game, "Forest", 2);
    cast(game, bolt);
    expect(life(game, A)).toBe(18);
    const land = toHand(game, "Forest", A);
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });

  it("Cemetery Gatekeeper: a land exiled makes a land played hurt whoever played it", () => {
    const { game, a } = table();
    const forest = toGraveyard(game, "Forest", B);
    pickFromZone(a, forest);
    enter(game, "Cemetery Gatekeeper");
    expect(zone(game, forest)).toBe("exile");
    const land = toHand(game, "Forest", A);
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(life(game, A)).toBe(18);
  });

  it("Cemetery Desecrator: its X is the exiled card's mana value, the mode chosen after the exile", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B); // mana value 2
    const target = spawn(game, "Craw Wurm", B); // 6/4
    pickFromZone(a, bears);
    pickModes(a, 1);
    pickTargets(a, target);
    enter(game, "Cemetery Desecrator");
    expect(zone(game, bears)).toBe("exile");
    expect(pt(game, target)).toEqual({ power: 4, toughness: 2 });
  });

  it("Cemetery Desecrator: removes X counters of the kinds chosen", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B); // mana value 2
    const target = spawn(game, "Grizzly Bears", B);
    game.state.objects[target].counters = { "+1/+1": 3 };
    pickFromZone(a, bears);
    pickModes(a, 0);
    pickTargets(a, target);
    enter(game, "Cemetery Desecrator");
    expect(counters(game, target)).toBe(1);
  });

  it("Cemetery Desecrator: dying, it can't exile itself, and with nothing else exiled nothing triggers", () => {
    const { game, a } = table();
    const mine = spawn(game, "Cemetery Desecrator");
    const target = spawn(game, "Craw Wurm", B);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    a.chooseModesFn = () => {
      throw new Error("no card exiled, so no reflexive ability");
    };
    destroy(game, mine);
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(asked).toBe(0);
    expect(pt(game, target).power).toBe(6);
  });

  it("Cemetery Desecrator: dying with another card there, it exiles that and stays itself", () => {
    const { game, a } = table();
    const mine = spawn(game, "Cemetery Desecrator");
    const other = toGraveyard(game, "Grizzly Bears", B);
    const target = spawn(game, "Craw Wurm", B);
    const seen = pickFromZone(a, other);
    pickModes(a, 1);
    pickTargets(a, target);
    destroy(game, mine);
    settle(game);
    expect(seen.offered).toEqual([other]);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, other)).toBe("exile");
    expect(pt(game, target).power).toBe(4);
  });
});

describe("The Deck of Many Things", () => {
  /** The first seed from 1 whose natural d20, less `cards` in hand, is in the range. */
  function rolled(cards: number, min: number, max: number, setup?: (game: Game, a: ReturnType<typeof table>["a"]) => void) {
    for (let seed = 1; seed < 400; seed += 1) {
      const t = table({ seed });
      const deck = spawn(t.game, "The Deck of Many Things");
      lands(t.game, "Wastes", 2);
      for (const id of [...hand(t.game)]) t.game.debugMove(id, "library");
      for (let i = 0; i < cards; i += 1) toHand(t.game, "Forest", A);
      setup?.(t.game, t.a);
      activate(t.game, deck);
      const result = lastRollIn(t.game.state)?.total ?? Number.NaN;
      if (result >= min && result <= max) return { ...t, deck, result };
    }
    throw new Error("no seed rolled it");
  }

  it("subtracts the cards in hand, discarding the hand at 0 or less", () => {
    const { game, result } = rolled(5, -10, 0);
    expect(result).toBeLessThanOrEqual(0);
    expect(hand(game)).toEqual([]);
    expect(graveyard(game).length).toBe(5);
  });

  it("1-9 returns a card at random from your graveyard", () => {
    const { game, result } = rolled(0, 1, 9, (g) => {
      toGraveyard(g, "Hill Giant", A);
    });
    expect(result).toBeLessThan(10);
    expect(hand(game)).toHaveLength(1);
    expect(graveyard(game)).toEqual([]);
  });

  it("10-19 draws two", () => {
    const { game } = rolled(1, 10, 19);
    expect(hand(game)).toHaveLength(3);
  });

  it("20: a creature card from any graveyard, whose death costs its owner the game", () => {
    let giant = "" as ObjectId;
    const { game } = rolled(0, 20, 20, (g, a) => {
      giant = toGraveyard(g, "Hill Giant", B);
      pickFromZone(a, giant);
    });
    expect(game.state.objects[giant].controller).toBe(A);
    expect(zone(game, giant)).toBe("battlefield");
    destroy(game, giant);
    settle(game);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(game.state.players[A].hasLost).toBe(false);
  });
});

describe("one player's graveyard", () => {
  it("Dreams of Steel and Oil: one from the hand, then one from the graveyard, both exiled", () => {
    const { game, a } = table();
    const inHand = toHand(game, "Grizzly Bears", B);
    const landInHand = toHand(game, "Forest", B);
    const inYard = toGraveyard(game, "Hill Giant", B);
    const instant = toGraveyard(game, "Lightning Bolt", B);
    toGraveyard(game, "Hill Giant", A);
    const offers: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offers.push(eligible);
      return offers.length === 1 ? [inHand] : [inYard];
    };
    const spell = toHand(game, "Dreams of Steel and Oil", A);
    lands(game, "Swamp", 1);
    cast(game, spell, { targets: [ref(B)] });
    expect(offers).toEqual([[inHand], [inYard]]);
    expect(zone(game, inHand)).toBe("exile");
    expect(zone(game, inYard)).toBe("exile");
    expect(zone(game, landInHand)).toBe("hand");
    expect(zone(game, instant)).toBe("graveyard");
  });

  it("Dreams of Steel and Oil: with no such card in the hand, the graveyard's is still chosen", () => {
    const { game, a } = table();
    toHand(game, "Forest", B);
    const inYard = toGraveyard(game, "Hill Giant", B);
    a.chooseFromZoneFn = (_view, eligible) => (eligible.includes(inYard) ? [inYard] : []);
    const spell = toHand(game, "Dreams of Steel and Oil", A);
    lands(game, "Swamp", 1);
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, inYard)).toBe("exile");
  });

  it("Breach the Multiverse: one card a graveyard, entering together under your control, then Phyrexians", () => {
    const { game, a } = table({ players: 3 });
    for (const p of [A, B, C] as PlayerId[]) for (let i = 0; i < 10; i += 1) toLibrary(game, "Forest", p);
    const old = spawn(game, "Grizzly Bears", A);
    const mine = toGraveyard(game, "Hill Giant", A);
    const bobs = toGraveyard(game, "Craw Wurm", B);
    const carols = toGraveyard(game, "Grizzly Bears", C);
    const carolsLand = toGraveyard(game, "Forest", C);
    const asked: { offered: readonly ObjectId[]; zones: string[] }[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push({ offered: eligible, zones: [mine, bobs, carols].map((id) => zone(game, id)) });
      const pick = [mine, bobs, carols].find((id) => eligible.includes(id));
      return pick === undefined ? [] : [pick];
    };
    const spell = toHand(game, "Breach the Multiverse", A);
    lands(game, "Swamp", 7);
    cast(game, spell);
    // In turn order, each only that player's, nothing entered yet.
    expect(asked.map((q) => q.offered)).toEqual([[mine], [bobs], [carols]]);
    expect(asked[2].zones).toEqual(["graveyard", "graveyard", "graveyard"]);
    for (const id of [mine, bobs, carols]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].controller).toBe(A);
    }
    expect(zone(game, carolsLand)).toBe("graveyard");
    // Each creature you control, the old one too.
    for (const id of [old, mine, bobs, carols]) expect(subtypes(game, id)).toContain("Phyrexian");
    // Ten cards milled apiece.
    expect(graveyard(game, B).length).toBe(10);
  });

  it("Breach the Multiverse: a card just milled may be chosen, and a graveyard with none is skipped", () => {
    const { game, a } = table();
    for (let i = 0; i < 9; i += 1) toLibrary(game, "Forest", B);
    const milled = toLibrary(game, "Hill Giant", B);
    for (let i = 0; i < 10; i += 1) toLibrary(game, "Forest", A);
    const offers: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offers.push(eligible);
      return eligible.length > 0 ? [milled] : [];
    };
    const spell = toHand(game, "Breach the Multiverse", A);
    lands(game, "Swamp", 7);
    cast(game, spell);
    expect(offers).toEqual([[milled]]);
    expect(zone(game, milled)).toBe("battlefield");
    expect(game.state.objects[milled].controller).toBe(A);
  });
});

describe("a spell from each opponent's graveyard", () => {
  function jetsam(game: Game, a: ReturnType<typeof table>["a"], order: readonly ObjectId[]): (readonly ObjectId[])[] {
    const offers: (readonly ObjectId[])[] = [];
    let at = 0;
    a.chooseCastNowFn = (_view, offer) => {
      offers.push(offer.casts.map((way) => way.card));
      const card = order[at];
      at += 1;
      const way = offer.casts.find((w) => w.card === card);
      if (way === undefined) return null;
      return {
        type: "cast-spell",
        player: A,
        card: way.card,
        targets: [],
        via: way.via,
        ...(offer.free ? { free: true } : {}),
      };
    };
    const spell = toHand(game, "Flotsam // Jetsam", A);
    lands(game, "Island", 6);
    cast(game, spell, { face: 2 });
    return offers;
  }

  it("Jetsam: one spell a graveyard, in the caster's order, each free and exiled after", () => {
    const { game, a } = table({ players: 3 });
    const bobs = toGraveyard(game, "Divination", B);
    const bobsOther = toGraveyard(game, "Grizzly Bears", B);
    const carols = toGraveyard(game, "Grizzly Bears", C);
    toGraveyard(game, "Hill Giant", A);
    const offers = jetsam(game, a, [carols, bobs]);
    expect(offers).toHaveLength(2);
    expect(offers[0]).toEqual(expect.arrayContaining([bobs, bobsOther, carols]));
    // Carol's has gone; only Bob's are left, and not Alice's own.
    expect(offers[1]).toEqual(expect.arrayContaining([bobs, bobsOther]));
    expect(offers[1]).not.toContain(carols);
    expect(zone(game, bobs)).toBe("exile");
    // A permanent spell cast this way is yours and stays.
    expect(zone(game, carols)).toBe("battlefield");
    expect(game.state.objects[carols].controller).toBe(A);
    expect(zone(game, bobsOther)).toBe("graveyard");
  });

  it("Jetsam: mills each opponent three first, and may be declined", () => {
    const { game, a } = table();
    const milled = toLibrary(game, "Grizzly Bears", B);
    const offers = jetsam(game, a, []);
    expect(offers[0]).toContain(milled);
    expect(graveyard(game, B).length).toBe(3);
    expect(graveyard(game, A).length).toBe(1); // Jetsam itself
    expect(zone(game, milled)).toBe("graveyard");
  });

  it("Flotsam: mills three and investigates", () => {
    const { game } = table();
    const spell = toHand(game, "Flotsam // Jetsam", A);
    lands(game, "Forest", 2);
    cast(game, spell, { face: 1 });
    expect(graveyard(game).length).toBe(4);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("half the permanents, rounded up", () => {
  it("Split the Party: the caster chooses which of that player's, all of them chosen at once", () => {
    const { game, a } = table({ players: 3 });
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    const three = spawn(game, "Craw Wurm", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const asked: { offered: readonly ObjectId[]; min: number; max: number }[] = [];
    a.choosePermanentsFn = (_view, eligible, min, max) => {
      asked.push({ offered: eligible, min, max });
      return [one, three];
    };
    const spell = toHand(game, "Split the Party", A);
    lands(game, "Island", 5);
    cast(game, spell, { targets: [ref(B)] });
    expect(asked).toEqual([{ offered: [one, two, three], min: 2, max: 2 }]);
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, three)).toBe("hand");
    expect(zone(game, two)).toBe("battlefield");
    expect(zone(game, carols)).toBe("battlefield");
  });

  it("Vona's Hunger: one creature, or with the city's blessing half of each opponent's, sacrificed at once", () => {
    const hunger = (blessed: boolean): number => {
      const { game, b } = table();
      for (let i = 0; i < 5; i += 1) spawn(game, "Grizzly Bears", B);
      b.chooseSacrificesFn = (_view, eligible, count) => eligible.slice(0, count);
      if (blessed) game.state.players[A].citysBlessing = true;
      const spell = toHand(game, "Vona's Hunger", A);
      lands(game, "Swamp", 3);
      cast(game, spell);
      return graveyard(game, B).length;
    };
    expect(hunger(false)).toBe(1);
    expect(hunger(true)).toBe(3);
  });
});

describe("the land played is what an intervening if asks about", () => {
  it("Horn of Greed: \"that player\" is who played the land", () => {
    const { game } = table();
    spawn(game, "Horn of Greed", B);
    const before = hand(game, A).length;
    const land = toHand(game, "Forest", A);
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Cemetery Protector: a land shares a type with an exiled land", () => {
    const { game, a } = table();
    const forest = toGraveyard(game, "Forest", B);
    pickFromZone(a, forest);
    enter(game, "Cemetery Protector");
    const land = toHand(game, "Forest", A);
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(tokensNamed(game, "Human Token", A)).toBe(1);
  });
});

describe("a card in exile", () => {
  it("Binding Negotiation: a card chosen is discarded, and nothing else happens", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const exiled = toExile(game, "Hill Giant", B);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [bears];
    };
    const spell = toHand(game, "Binding Negotiation", A);
    lands(game, "Swamp", 2);
    cast(game, spell, { targets: [ref(B)] });
    expect(asked).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, exiled)).toBe("exile");
  });

  it("Binding Negotiation: otherwise, a face-up exiled card they own, into their graveyard", () => {
    const { game, a } = table({ players: 3 });
    toHand(game, "Forest", B);
    const theirs = toExile(game, "Hill Giant", B);
    const faceDown = toExile(game, "Grizzly Bears", B);
    game.state.objects[faceDown].exiledFaceDown = { lookers: [B] };
    const carols = toExile(game, "Hill Giant", C);
    const offers: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offers.push(eligible);
      return eligible.includes(theirs) ? [theirs] : [];
    };
    const spell = toHand(game, "Binding Negotiation", A);
    lands(game, "Swamp", 2);
    cast(game, spell, { targets: [ref(B)] });
    expect(offers.at(-1)).toEqual([theirs]);
    expect(graveyard(game, B)).toContain(theirs);
    expect(zone(game, carols)).toBe("exile");
    expect(zone(game, faceDown)).toBe("exile");
  });

  it("Binding Negotiation: declining a nonland card may still move an exiled one, or nothing", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const exiled = toExile(game, "Hill Giant", B);
    pickFromZone(a);
    const spell = toHand(game, "Binding Negotiation", A);
    lands(game, "Swamp", 2);
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, exiled)).toBe("exile");
  });

  it("Sengir Nosferatu: exiles itself for a Bat, which returns any exiled Nosferatu under its owner's control", () => {
    const { game, a } = table();
    const vamp = spawn(game, "Sengir Nosferatu");
    lands(game, "Swamp", 4);
    activate(game, vamp);
    expect(zone(game, vamp)).toBe("exile");
    expect(tokensNamed(game, "Bat Token (Sengir Nosferatu)", A)).toBe(1);
    const [bat] = named(game, "Bat Token (Sengir Nosferatu)", A);
    const bobs = toExile(game, "Sengir Nosferatu", B);
    const other = toExile(game, "Hill Giant", B);
    const seen = pickFromZone(a, bobs);
    activate(game, bat);
    expect(new Set(seen.offered)).toEqual(new Set([vamp, bobs]));
    expect(zone(game, bobs)).toBe("battlefield");
    expect(game.state.objects[bobs].controller).toBe(B);
    expect(zone(game, other)).toBe("exile");
    expect(zone(game, vamp)).toBe("exile");
  });
});
