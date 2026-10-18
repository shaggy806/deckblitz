/**
 * March of the Machine (MOM/MOC), batch 1, group g (2026-10-17). Each test
 * written from the card's Oracle text and rulings, on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack, whyCannotBlock } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
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
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const canActivate = (game: Game, source: ObjectId, index = 0): boolean =>
  game.canDispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [] }) === null;

describe("Flywheel Racer", () => {
  it("taps for any colour only while it's a creature", () => {
    const { game } = table();
    const racer = spawn(game, "Flywheel Racer");
    expect(canActivate(game, racer, 0)).toBe(false);
    game.debugApplyEffect(
      A,
      { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      [ref(racer)],
    );
    expect(canActivate(game, racer, 0)).toBe(true);
  });
});

describe("Glistening Deluge", () => {
  it("gives every creature -1/-1 and green and/or white ones -3/-3, fixed as it resolves", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Glistening Deluge"));
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    const later = spawn(game, "Serra Angel", B);
    expect(pt(game, later)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Ichor Drinker", () => {
  it("exiles itself from the graveyard to incubate 2", () => {
    const { game } = table();
    const drinker = toGraveyard(game, "Ichor Drinker");
    lands(game, "Swamp", 1);
    activate(game, drinker, 0);
    expect(zone(game, drinker)).toBe("exile");
    const [incubator] = named(game, "Incubator Token", A);
    expect(counters(game, incubator)).toBe(2);
  });
});

describe("Karsus Depthguard", () => {
  it("can attack only while its power is 5 or greater", () => {
    const { game } = table();
    const guard = spawn(game, "Karsus Depthguard");
    expect(whyCannotAttack(game.state, game.registry, A, guard, B)).toMatch(/defender/);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(guard)]);
    expect(whyCannotAttack(game.state, game.registry, A, guard, B)).toBeNull();
  });
});

describe("Kroxa and Kunoros", () => {
  it("exiles five cards from your graveyard to return a creature card, targeted only then", () => {
    const { game, a } = table();
    const junk = Array.from({ length: 5 }, () => toGraveyard(game, "Wastes"));
    const angel = toGraveyard(game, "Serra Angel");
    pickModes(a, 0);
    pickFromZone(a, ...junk);
    pickTargets(a, angel);
    enter(game, "Kroxa and Kunoros");
    expect(zone(game, angel)).toBe("battlefield");
    for (const id of junk) expect(zone(game, id)).toBe("exile");
  });

  it("returns nothing when you decline to exile", () => {
    const { game, a } = table();
    for (let i = 0; i < 5; i += 1) toGraveyard(game, "Wastes");
    const angel = toGraveyard(game, "Serra Angel");
    pickModes(a);
    enter(game, "Kroxa and Kunoros");
    expect(zone(game, angel)).toBe("graveyard");
    expect(graveyard(game)).toHaveLength(6);
  });

  it("with fewer than five cards in your graveyard, it isn't offered and nothing is exiled", () => {
    const { game, a } = table();
    for (let i = 0; i < 4; i += 1) toGraveyard(game, "Wastes");
    pickModes(a, 0);
    enter(game, "Kroxa and Kunoros");
    expect(graveyard(game)).toHaveLength(4);
  });
});

describe("Mistmeadow Vanisher", () => {
  it("becoming tapped by attacking exiles a nonland, nontoken permanent until the next end step", () => {
    const { game, a } = table();
    const vanisher = spawn(game, "Mistmeadow Vanisher");
    const angel = spawn(game, "Serra Angel", B);
    const land = spawn(game, "Plains", B);
    const seen = watchTargets(a, () => [angel]);
    attack(game, a, [vanisher]);
    expect(seen.offered[0]).not.toContain(land);
    expect(zone(game, angel)).toBe("exile");
    game.advanceUntil((s) => s.turn.number === 2);
    settle(game);
    expect(named(game, "Serra Angel", B)).toHaveLength(1);
  });
});

describe("Schema Thief", () => {
  it("copies an artifact the damaged player controls, under your control", () => {
    const { game, a } = table();
    const thief = spawn(game, "Schema Thief");
    const ring = spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring");
    pickTargets(a, ring);
    attack(game, a, [thief]);
    expect(life(game, B)).toBe(17);
    expect(tokensNamed(game, "Sol Ring", A)).toBe(1);
    expect(tokensNamed(game, "Sol Ring", B)).toBe(0);
  });
});

describe("Xerex Strobe-Knight", () => {
  it("makes a Knight only once you've cast two or more spells this turn", () => {
    const { game } = table();
    const knight = spawn(game, "Xerex Strobe-Knight");
    cast(game, toHand(game, "Ornithopter"));
    expect(canActivate(game, knight, 0)).toBe(false);
    cast(game, toHand(game, "Ornithopter"));
    activate(game, knight, 0);
    expect(tokensNamed(game, "Knight Token (Chivalric Alliance)", A)).toBe(1);
  });
});

describe("Oracle of Tragedy", () => {
  it("when it dies, can shuffle up to four cards with mana value 3 or greater from your graveyard into your library", () => {
    const { game, a } = table();
    const oracle = spawn(game, "Oracle of Tragedy");
    const angel = toGraveyard(game, "Serra Angel");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 1);
    const seen = watchTargets(a, () => [angel]);
    destroy(game, oracle);
    expect(seen.offered[0]).toContain(angel);
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(oracle);
    expect(zone(game, angel)).toBe("library");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("when it enters, can loot", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Oracle of Tragedy");
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Polukranos Reborn // Polukranos, Engine of Ruin", () => {
  const transformed = (game: Game): ObjectId => {
    const polukranos = spawn(game, "Polukranos Reborn");
    lands(game, "Plains", 7);
    activate(game, polukranos, 0);
    expect(printedCardName(game.state.objects[polukranos])).toBe("Polukranos, Engine of Ruin");
    return polukranos;
  };

  it("the front face makes nothing as it dies", () => {
    const { game } = table();
    const polukranos = spawn(game, "Polukranos Reborn");
    destroy(game, polukranos);
    expect(tokensNamed(game, "Phyrexian Hydra Token (Reach)")).toBe(0);
  });

  it("when Polukranos dies, a 3/3 reach Hydra and a 3/3 lifelink Hydra", () => {
    const { game } = table();
    const polukranos = transformed(game);
    destroy(game, polukranos);
    expect(tokensNamed(game, "Phyrexian Hydra Token (Reach)", A)).toBe(1);
    expect(tokensNamed(game, "Phyrexian Hydra Token (Lifelink)", A)).toBe(1);
  });

  it("another nontoken Hydra dying counts; a token Hydra doesn't", () => {
    const { game } = table();
    transformed(game);
    const brood = spawn(game, "Hydra Broodmaster");
    // A 0/0 Hydra token, dying to state-based actions as it's made.
    game.debugApplyEffect(A, { kind: "create-token", token: "Hydra Token", count: 1 }, []);
    settle(game);
    expect(graveyard(game)).toHaveLength(0);
    expect(tokensNamed(game, "Phyrexian Hydra Token (Reach)")).toBe(0);
    destroy(game, brood);
    expect(tokensNamed(game, "Phyrexian Hydra Token (Reach)", A)).toBe(1);
    expect(tokensNamed(game, "Phyrexian Hydra Token (Lifelink)", A)).toBe(1);
  });
});

describe("Skyclave Aerialist // Skyclave Invader", () => {
  it("transforming puts a land from the top onto the battlefield if you choose", () => {
    const { game, a } = table();
    const merfolk = spawn(game, "Skyclave Aerialist");
    lands(game, "Forest", 5);
    const top = toLibrary(game, "Forest");
    pickFromZone(a, top);
    activate(game, merfolk, 0);
    expect(zone(game, top)).toBe("battlefield");
  });

  it("puts a nonland top card into your hand", () => {
    const { game, a } = table();
    const merfolk = spawn(game, "Skyclave Aerialist");
    lands(game, "Forest", 5);
    const top = toLibrary(game, "Grizzly Bears");
    pickFromZone(a);
    activate(game, merfolk, 0);
    expect(zone(game, top)).toBe("hand");
  });
});

describe("Searing Barb", () => {
  it("2 damage; a creature dealt it can't block this turn; incubate 1", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Searing Barb"), { targets: [ref(angel)] });
    expect(game.state.objects[angel].damageMarked).toBe(2);
    expect(whyCannotBlock(game.state, game.registry, B, angel, bears)).not.toBeNull();
    const [incubator] = named(game, "Incubator Token", A);
    expect(counters(game, incubator)).toBe(1);
  });

  it("at a player: the damage and the Incubator", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Searing Barb"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(named(game, "Incubator Token", A)).toHaveLength(1);
  });
});

describe("Vengeant Earth", () => {
  it("a land becomes a 4/4 Elemental creature with haste, still a land", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Vengeant Earth"), { targets: [ref(forest)] });
    expect(pt(game, forest)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, forest)).toEqual(expect.arrayContaining(["Forest", "Elemental"]));
    expect(keywords(game, forest).has("haste")).toBe(true);
  });

  it("a creature's +1/+1 counters still apply over the 4/4", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Vengeant Earth"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Elemental"]));
  });

  it("can't target an opponent's creature", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    expect(() => cast(game, toHand(game, "Vengeant Earth"), { targets: [ref(theirs)] })).toThrow();
  });
});

describe("Voldaren Thrillseeker", () => {
  it("backup 2 grants the sacrifice ability; it deals damage equal to the sacrificed creature's last power", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    pickTargets(a, bears);
    cast(game, toHand(game, "Voldaren Thrillseeker"));
    expect(counters(game, bears)).toBe(2);
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === bears);
    expect(offer).toBeDefined();
    const index = offer !== undefined && offer.kind === "activate-ability" ? offer.abilityIndex : -1;
    activate(game, bears, index, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });
});
