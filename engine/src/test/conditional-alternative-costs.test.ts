/**
 * Alternative costs (rule 118.9) that say more than mana: a keyword-shaped
 * non-mana part (`alternativeCost.also`), an availability condition, and a
 * spell reading which cost it was cast for (`self-alternative-cost-paid`).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** The cast-spell variants offered for `card`. */
const offers = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

const altOffer = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }> | undefined =>
  offers(game, card).find((a) => a.altCost === true);

const discardOne = (game: Game, seat: ScriptedController, card: ObjectId): void => {
  seat.chooseDiscardsFn = () => [card];
  game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
  settle(game);
};

/** The seat casts the madness card it's offered with this X and these targets. */
function castMadness(seat: ScriptedController, x: number, targets: readonly ObjectId[] = []): void {
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts[0]!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: way.card,
      targets: targets.map((object) => ({ kind: "object" as const, object })),
      via: way.via,
      xValue: x,
    };
  };
}

describe("an alternative cost's non-mana part (`also`)", () => {
  it("Stalwart Valkyrie: pays {1}{W} and exiles the creature card chosen, as the cost is paid", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 2);
    const valkyrie = toHand(game, "Stalwart Valkyrie");
    const bears = toGraveyard(game, "Grizzly Bears");
    const wurm = toGraveyard(game, "Craw Wurm");
    toGraveyard(game, "Shock");

    expect(altOffer(game, valkyrie)?.altCostText).toBe("pay {1}{W}, exile a creature card from your graveyard");
    const seen = pickFromZone(a, wurm);
    cast(game, valkyrie, { altCost: true });

    expect(seen.offered).toEqual(expect.arrayContaining([bears, wurm]));
    expect(seen.offered).toHaveLength(2);
    expect(zone(game, wurm)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, valkyrie)).toBe("battlefield");
    expect(plains.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(keywords(game, valkyrie).has("flying")).toBe(true);
  });

  it("isn't offered without a creature card in the graveyard, and the mana cost still is", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const valkyrie = toHand(game, "Stalwart Valkyrie");
    toGraveyard(game, "Shock");

    expect(altOffer(game, valkyrie)).toBeUndefined();
    expect(offers(game, valkyrie).length).toBeGreaterThan(0);
    expect(() => cast(game, valkyrie, { altCost: true })).toThrow(/graveyard/);
  });

  it("cast for its mana cost, nothing is exiled", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const valkyrie = toHand(game, "Stalwart Valkyrie");
    const bears = toGraveyard(game, "Grizzly Bears");

    cast(game, valkyrie);

    expect(zone(game, valkyrie)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("an alternative cost's condition", () => {
  it("Blasphemous Edict: {B} only with thirteen creatures among all players", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const edict = toHand(game, "Blasphemous Edict");
    const mine: ObjectId[] = [];
    for (let i = 0; i < 7; i += 1) mine.push(spawn(game, "Grizzly Bears", A));
    for (let i = 0; i < 5; i += 1) spawn(game, "Grizzly Bears", B);

    expect(altOffer(game, edict)).toBeUndefined();

    spawn(game, "Grizzly Bears", B);
    expect(altOffer(game, edict)).toBeDefined();

    cast(game, edict, { altCost: true });
    // Thirteen each, so all of them: seven and six.
    expect(mine.every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
  });

  it("Asmoranomardicadaistinaculdacar: no mana cost, so castable only once a card was discarded (118.6a)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const wizard = toHand(game, "Asmoranomardicadaistinaculdacar");
    const other = toHand(game, "Shock");

    expect(offers(game, wizard)).toEqual([]);
    expect(() => cast(game, wizard)).toThrow(/no mana cost/);

    discardOne(game, a, other);
    expect(offers(game, wizard).map((o) => o.altCost)).toEqual([true]);
    pickModes(a);
    cast(game, wizard, { altCost: true });
    expect(zone(game, wizard)).toBe("battlefield");
  });

  it("Asmoranomardicadaistinaculdacar finds the Cookbook, and two Foods make a creature burn itself", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const wizard = toHand(game, "Asmoranomardicadaistinaculdacar");
    discardOne(game, a, toHand(game, "Shock"));
    const cookbook = game.debugSpawn("The Underworld Cookbook", A, "library");
    pickModes(a, 0);
    pickFromZone(a, cookbook);
    cast(game, wizard, { altCost: true });
    expect(hand(game)).toContain(cookbook);

    const foods = [spawn(game, "Food Token", A), spawn(game, "Food Token", A)];
    const wurm = spawn(game, "Craw Wurm", B);
    activate(game, wizard, 0, { targets: [ref(wurm)] });
    expect(foods.every((id) => game.state.objects[id] === undefined || game.state.objects[id].zone !== "battlefield")).toBe(true);
    // A 6/4 dealing itself 6.
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("if the alternative cost was paid", () => {
  it("Fervent Mastery for {2}{R}{R}: the opponent chosen loots, then you tutor three and discard three at random", () => {
    const { game, a, b } = table({ players: 3 });
    lands(game, "Mountain", 4);
    const mastery = toHand(game, "Fervent Mastery");
    const theirs = [toHand(game, "Shock", B), toHand(game, "Shock", B)];
    const keep = toHand(game, "Shock", C);
    const handBefore = hand(game, B).length;
    // Asked which of two opponents, as it resolves: not a target.
    let asked: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked = texts;
      return [texts.findIndex((text) => /bob/i.test(text))];
    };
    b.chooseDiscardsFn = () => theirs;
    const tutors = [game.debugSpawn("Shock", A, "library"), game.debugSpawn("Shock", A, "library"), game.debugSpawn("Shock", A, "library")];
    pickFromZone(a, ...tutors);
    const mine = hand(game).length;

    cast(game, mastery, { altCost: true });

    expect(asked).toHaveLength(2);
    expect(theirs.every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(hand(game, B)).toHaveLength(handBefore);
    expect(zone(game, keep)).toBe("hand");
    // Less the spell, three found, three discarded at random; the spell too.
    expect(hand(game)).toHaveLength(mine - 1);
    expect(graveyard(game)).toHaveLength(4);
  });

  it("Fervent Mastery for its mana cost: the opponent loots nothing", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 5);
    const mastery = toHand(game, "Fervent Mastery");
    const theirs = toHand(game, "Shock", B);
    let asked = false;
    b.chooseDiscardsFn = () => {
      asked = true;
      return [theirs];
    };
    pickFromZone(a);
    cast(game, mastery);
    expect(asked).toBe(false);
    expect(zone(game, theirs)).toBe("hand");
  });

  it("Ingenious Mastery for {2}{U}: three cards, then the opponent's Treasures and scry", () => {
    const { game, b } = table();
    lands(game, "Island", 3);
    const mastery = toHand(game, "Ingenious Mastery");
    const before = hand(game).length;
    let scried = 0;
    b.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    cast(game, mastery, { altCost: true });
    expect(hand(game)).toHaveLength(before - 1 + 3);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    expect(scried).toBe(2);
  });

  it("Ingenious Mastery for its mana cost draws X", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const mastery = toHand(game, "Ingenious Mastery");
    const before = hand(game).length;
    cast(game, mastery, { x: 2 });
    expect(hand(game)).toHaveLength(before - 1 + 2);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });

  it("a cost another effect offers isn't the card's own (Jodah)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    spawn(game, "Jodah, Archmage Eternal", A);
    const mastery = toHand(game, "Ingenious Mastery");
    const before = hand(game).length;
    const jodah = offers(game, mastery).filter((o) => o.altCost === true).find((o) => o.altCostIndex === 1);
    expect(jodah).toBeDefined();
    cast(game, mastery, { altCost: true, altCostIndex: 1, x: 0 });
    // Neither three cards nor Treasures: "if that cost wasn't paid", X is 0.
    expect(hand(game)).toHaveLength(before - 1);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });
});

describe("an optional additional cost that isn't kicker", () => {
  const combat = (game: Game) => {
    const bear = spawn(game, "Grizzly Bears", A);
    const goblin = spawn(game, "Raging Goblin", A);
    return { bear, goblin };
  };

  it("Undergrowth unpaid prevents all combat damage", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const { bear, goblin } = combat(game);
    const fog = toHand(game, "Undergrowth");
    cast(game, fog);
    attack(game, a, [bear, goblin]);
    expect(life(game, B)).toBe(20);
  });

  it("Undergrowth paid lets red creatures through, and isn't a kicked spell", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Mountain", 3);
    const { bear, goblin } = combat(game);
    const hallar = spawn(game, "Hallar, the Firefletcher", A);
    const fog = toHand(game, "Undergrowth");
    expect(offers(game, fog).find((o) => o.kicked === true)?.kickerKeyword).toBe("additional cost");
    cast(game, fog, { kicked: true });
    expect(counters(game, hallar)).toBe(0);
    attack(game, a, [bear, goblin]);
    // The Goblin's 1, the Bears' 2 prevented.
    expect(life(game, B)).toBe(19);
  });
});

describe("if this spell's madness cost was paid", () => {
  it("From Under the Floorboards, discarded: X tapped Zombies and X life for {X}{B}{B}", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const card = toHand(game, "From Under the Floorboards");
    castMadness(a, 2);
    discardOne(game, a, card);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
    expect(life(game)).toBe(22);
    const zombies = named(game, "Zombie Token", A);
    expect(zombies.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("cast for its mana cost: three, and 3 life", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "From Under the Floorboards"));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(3);
    expect(life(game)).toBe(23);
  });

  it("Welcome to the Fold, discarded: a toughness of X or less, not of 2", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const card = toHand(game, "Welcome to the Fold");
    const wurm = spawn(game, "Craw Wurm", B);
    castMadness(a, 4, [wurm]);
    discardOne(game, a, card);
    expect(controller(game, wurm)).toBe(A);
  });

  it("Welcome to the Fold, discarded for too small an X, takes nothing", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const card = toHand(game, "Welcome to the Fold");
    const bears = spawn(game, "Grizzly Bears", B);
    castMadness(a, 1, [bears]);
    discardOne(game, a, card);
    // Toughness 2 and X of 1: 2 or less is the spell's other sentence.
    expect(controller(game, bears)).toBe(B);
  });

  it("Welcome to the Fold for its mana cost reads 2", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Welcome to the Fold"), { targets: [{ kind: "object", object: bears }] });
    expect(controller(game, bears)).toBe(A);
    cast(game, toHand(game, "Welcome to the Fold"), { targets: [{ kind: "object", object: wurm }] });
    expect(controller(game, wurm)).toBe(B);
  });
});

describe("of several granted alternative costs, the caster picks one (rule 118.9a)", () => {
  it("Jodah's and Nissa's are both offered, told apart, and the one chosen is what's paid", () => {
    const { game } = table();
    game.state.players[A].energy = 8;
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    spawn(game, "Jodah, Archmage Eternal", A);
    spawn(game, "Nissa, Worldsoul Speaker", A);
    const bears = toHand(game, "Grizzly Bears");
    const granted = offers(game, bears).filter((o) => o.altCost === true);
    expect(granted).toHaveLength(2);
    expect(new Set(granted.map((o) => o.altCostText)).size).toBe(2);
    const energy = granted.find((o) => o.altCostIndex === 1);
    expect(energy).toBeDefined();
    cast(game, bears, { altCost: true, altCostIndex: 1 });
    expect(game.state.players[A].energy).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
