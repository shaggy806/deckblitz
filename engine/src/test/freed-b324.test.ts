// Batch 324 (author-freed): the cards freed by the chosen-player mana,
// mana-ability reveal, per-opponent target, graveyard-or-permanent target,
// tokens-created-with-source and trigger-from-exile families.

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  lands,
  loyalty,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toExile,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
  controller,
} from "./harness.js";

const pool = (game: Game, player = A): readonly ManaType[] => game.state.players[player].manaPool.map((u) => u.type);

describe("Sacellum Godspeaker: reveal big creatures from hand for {G} each", () => {
  const setup = () => {
    const { game } = table();
    const elf = spawn(game, "Sacellum Godspeaker");
    const wurm = toHand(game, "Craw Wurm");
    const giant = toHand(game, "Hill Giant");
    const bear = toHand(game, "Grizzly Bears");
    return { game, elf, wurm, giant, bear };
  };
  const tap = (game: Game, id: ObjectId): void => {
    game.dispatch({ type: "activate-ability", player: A, source: id, abilityIndex: 0, targets: [] });
  };

  it("offers only creature cards with power 5 or greater, and adds {G} for each revealed", () => {
    const { game, elf, wurm, giant, bear } = setup();
    tap(game, elf);
    const asked = game.state.awaiting;
    expect(asked?.kind).toBe("choose-from-zone");
    if (asked?.kind !== "choose-from-zone") return;
    expect(asked.eligible).toEqual([wurm]);
    expect(asked.eligible).not.toContain(giant);
    expect(asked.eligible).not.toContain(bear);
    expect(asked.min).toBe(0);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [wurm] });
    expect(pool(game)).toEqual(["G"]);
    expect(zone(game, wurm)).toBe("hand");
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("may reveal none, for no mana", () => {
    const { game, elf } = setup();
    tap(game, elf);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    expect(pool(game)).toEqual([]);
  });
});

describe("Valleymaker", () => {
  it("sacrifices a Forest for {G}{G}{G} to the player chosen as it's activated", () => {
    const { game } = table();
    const giant = spawn(game, "Valleymaker");
    const [forest] = lands(game, "Forest", 1);
    const offers = game
      .legalActions(A)
      .filter((a) => a.kind === "activate-ability" && a.source === giant && a.abilityIndex === 1)
      .map((a) => (a.kind === "activate-ability" ? a.manaFor : undefined));
    expect(offers).toEqual([A, B]);
    game.dispatch({ type: "activate-ability", player: A, source: giant, abilityIndex: 1, targets: [], manaFor: B, sacrifice: forest });
    expect(pool(game, B)).toEqual(["G", "G", "G"]);
    expect(pool(game, A)).toEqual([]);
    expect(zone(game, forest)).toBe("graveyard");
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("sacrifices a Mountain to deal 3 damage to target creature", () => {
    const { game } = table();
    const giant = spawn(game, "Valleymaker");
    const [mountain] = lands(game, "Mountain", 1);
    const ogre = spawn(game, "Gray Ogre", B);
    game.dispatch({ type: "activate-ability", player: A, source: giant, abilityIndex: 0, targets: [ref(ogre)], sacrifice: mountain });
    settle(game);
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, mountain)).toBe("graveyard");
  });

  it("isn't tapped by the auto-payer: its cost sacrifices another land", () => {
    const { game } = table();
    spawn(game, "Valleymaker");
    lands(game, "Forest", 1);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow(/cannot pay/);
  });
});

describe("Sylvan Primordial", () => {
  it("destroys one noncreature permanent of each opponent, then finds that many Forests tapped", () => {
    const { game, a } = table({ players: 3 });
    const ringB = spawn(game, "Sol Ring", B);
    const ringC = spawn(game, "Sol Ring", C);
    const forests = [toLibrary(game, "Forest"), toLibrary(game, "Forest"), toLibrary(game, "Forest")];
    a.chooseTargetsFn = (_view, _source, specs, legal) => specs.map((_s, i) => legal[i]?.[0] ?? null);
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    enter(game, "Sylvan Primordial");
    expect(zone(game, ringB)).toBe("graveyard");
    expect(zone(game, ringC)).toBe("graveyard");
    const found = forests.filter((f) => zone(game, f) === "battlefield");
    expect(found).toHaveLength(2);
    for (const f of found) expect(game.state.objects[f].tapped).toBe(true);
  });

  it("can't target a creature, and an indestructible one doesn't count toward X", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const ingot = spawn(game, "Darksteel Ingot", B);
    toLibrary(game, "Forest");
    let offered: readonly (readonly unknown[])[] = [];
    a.chooseTargetsFn = (_view, _source, specs, legal) => {
      offered = legal;
      return specs.map((_s, i) => legal[i]?.[0] ?? null);
    };
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    enter(game, "Sylvan Primordial");
    expect(JSON.stringify(offered)).not.toContain(bear);
    expect(zone(game, ingot)).toBe("battlefield");
    expect(zone(game, bear)).toBe("battlefield");
    // Nothing was destroyed this way, so X is 0 and the Forest stays put.
    expect(game.state.zones.perPlayer[A].library.some((id) => game.state.objects[id].cardName === "Forest")).toBe(true);
  });

  it("is removed when an opponent still in the game has no noncreature permanent (rule 603.3d)", () => {
    const { game } = table({ players: 3 });
    const ring = spawn(game, "Sol Ring", B);
    spawn(game, "Grizzly Bears", C);
    enter(game, "Sylvan Primordial");
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Nahiri's Sacrifice: X from the sacrifice's mana value", () => {
  const setup = () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const ring = spawn(game, "Sol Ring"); // mana value 1
    const ogre = spawn(game, "Gray Ogre"); // mana value 3
    const card = toHand(game, "Nahiri's Sacrifice");
    return { game, ring, ogre, card };
  };
  type CastOffer = Extract<ReturnType<Game["legalActions"]>[number], { kind: "cast-spell" }>;
  const offers = (game: Game, card: ObjectId): CastOffer[] =>
    game.legalActions(A).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

  it("is offered once per mana value there is to sacrifice, each with only those permanents", () => {
    const { game, ring, ogre, card } = setup();
    const byX = offers(game, card).map((o) => [o.xCost?.minX, o.xCost?.maxX, o.sacrifice?.choices]);
    expect(byX).toEqual([
      [1, 1, [ring]],
      [3, 3, [ogre]],
    ]);
  });

  it("deals X damage divided among up to X target creatures", () => {
    const { game, ogre, card } = setup();
    const bear = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, card, { x: 3, sacrifice: ogre, targets: [ref(bear), ref(giant)], division: [2, 1] });
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });

  it("refuses a sacrifice whose mana value isn't the X announced", () => {
    const { game, ring, card } = setup();
    const bear = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, card, { x: 3, sacrifice: ring, targets: [ref(bear)], division: [3] })).toThrow(
      /cannot pay/,
    );
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Daretti, Ingenious Iconoclast", () => {
  it("+1 makes a 1/1 Construct with defender", () => {
    const { game } = table();
    const daretti = spawn(game, "Daretti, Ingenious Iconoclast");
    loyalty(game, daretti, 1);
    expect(tokensNamed(game, "Construct Token (Defender)", A)).toBe(1);
  });

  it("−1: sacrificing an artifact destroys the target", () => {
    const { game, a } = table();
    const daretti = spawn(game, "Daretti, Ingenious Iconoclast");
    const ring = spawn(game, "Sol Ring");
    const ogre = spawn(game, "Gray Ogre", B);
    a.chooseSacrificesFn = () => [ring];
    pickModes(a, 0);
    loyalty(game, daretti, -1, { targets: [ref(ogre)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("graveyard");
  });

  it("−1: declining the sacrifice destroys nothing", () => {
    const { game, a } = table();
    const daretti = spawn(game, "Daretti, Ingenious Iconoclast");
    const ring = spawn(game, "Sol Ring");
    const ogre = spawn(game, "Gray Ogre", B);
    a.chooseSacrificesFn = () => [];
    loyalty(game, daretti, -1, { targets: [ref(ogre)] });
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, ogre)).toBe("battlefield");
  });

  it("−6 copies an artifact card in an opponent's graveyard three times", () => {
    const { game } = table();
    const daretti = spawn(game, "Daretti, Ingenious Iconoclast");
    const card = toGraveyard(game, "Sol Ring", B);
    loyalty(game, daretti, -6, { atLeast: 6, targets: [ref(card)] });
    expect(tokensNamed(game, "Sol Ring", A)).toBe(3);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("−6 copies an artifact on the battlefield, but not a creature card in a graveyard", () => {
    const { game } = table();
    const daretti = spawn(game, "Daretti, Ingenious Iconoclast");
    const ring = spawn(game, "Sol Ring", B);
    const bear = toGraveyard(game, "Grizzly Bears", B);
    expect(() => loyalty(game, daretti, -6, { atLeast: 6, targets: [ref(bear)] })).toThrow();
    loyalty(game, daretti, -6, { atLeast: 6, targets: [ref(ring)] });
    expect(tokensNamed(game, "Sol Ring", A)).toBe(3);
  });

  it("−6 does nothing once its battlefield target has gone to the graveyard (rule 400.7)", () => {
    const { game } = table();
    const daretti = spawn(game, "Daretti, Ingenious Iconoclast");
    const ring = spawn(game, "Sol Ring", B);
    loyalty(game, daretti, -6, { atLeast: 6, targets: [ref(ring)], settle: false });
    destroy(game, ring);
    settle(game);
    expect(tokensNamed(game, "Sol Ring", A)).toBe(0);
  });
});

describe("Tetravus", () => {
  it("enters with three +1/+1 counters, splits them into Tetravites, and gathers them back", () => {
    const { game, a } = table();
    const tetravus = enter(game, "Tetravus");
    expect(counters(game, tetravus)).toBe(3);
    // The first upkeep: two counters become Tetravites; none exiled yet.
    a.chooseCounterRemovalsFn = (_view, offer) => {
      expect(offer.min).toBe(0);
      return [{ object: tetravus, kind: "+1/+1", count: 2 }];
    };
    a.choosePermanentsFn = () => [];
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, tetravus)).toBe(1);
    expect(tokensNamed(game, "Tetravite Token", A)).toBe(2);
    // The next: none split off, both Tetravites exiled back as counters.
    a.chooseCounterRemovalsFn = () => [];
    a.choosePermanentsFn = (_view, eligible) => [...eligible];
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Tetravite Token", A)).toBe(0);
    expect(counters(game, tetravus)).toBe(3);
  });

  it("gathers only its own Tetravites, and they can't be enchanted", () => {
    const { game, a } = table();
    const first = enter(game, "Tetravus");
    const second = enter(game, "Tetravus");
    // Each splits one counter off on the first upkeep, gathering nothing.
    a.chooseCounterRemovalsFn = (_view, offer) => [{ object: offer.eligible[0].object, kind: "+1/+1", count: 1 }];
    a.choosePermanentsFn = () => [];
    toStep(game, "upkeep");
    settle(game);
    const tetravites = (): ObjectId[] =>
      game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Tetravite Token");
    expect(tetravites()).toHaveLength(2);
    expect(new Set(tetravites().map((id) => game.state.objects[id].createdWith?.source))).toEqual(new Set([first, second]));
    // The next upkeep, each gather is offered one Tetravite: its own.
    const offers: (readonly ObjectId[])[] = [];
    a.chooseCounterRemovalsFn = () => [];
    a.choosePermanentsFn = (_view, eligible) => {
      offers.push(eligible);
      return [];
    };
    toStep(game, "upkeep");
    settle(game);
    expect(offers).toHaveLength(2);
    for (const offer of offers) expect(offer).toHaveLength(1);
    expect(offers[0][0]).not.toBe(offers[1][0]);
    lands(game, "Plains", 1);
    expect(() => cast(game, toHand(game, "Holy Strength"), { targets: [ref(tetravites()[0])] })).toThrow();
  });
});

describe("All Hallow's Eve", () => {
  it("exiles itself with two scream counters, then returns every graveyard's creatures on the second upkeep", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const eve = toHand(game, "All Hallow's Eve");
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Gray Ogre", B);
    cast(game, eve);
    expect(zone(game, eve)).toBe("exile");
    expect(counters(game, eve, "scream")).toBe(2);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, eve, "scream")).toBe(1);
    expect(zone(game, mine)).toBe("graveyard");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, eve)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(controller(game, theirs)).toBe(B);
    expect(graveyard(game, A)).toContain(eve);
  });

  it("does nothing from exile without a scream counter (the intervening if)", () => {
    const { game } = table();
    toExile(game, "All Hallow's Eve");
    const bear = toGraveyard(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
  });
});
