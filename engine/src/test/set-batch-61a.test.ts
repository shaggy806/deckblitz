/**
 * The set walk, batch 61, part a (2026-10-12): Secrets of Strixhaven.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const PEST = "Pest Token (Attacks)";

/** The prepare spell copies in exile. */
const preparedCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);

const canActivate = (game: Game, source: ObjectId, index = 0, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);

describe("Practiced Offense", () => {
  it("puts a counter on each creature the target player controls, and the target creature gains the chosen keyword", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    const mine = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    cast(game, toHand(game, "Practiced Offense"), { targets: [ref(B), ref(mine)] });
    expect(theirs.map((id) => counters(game, id))).toEqual([1, 1]);
    expect(counters(game, mine)).toBe(0);
    expect(keywords(game, mine).has("lifelink")).toBe(true);
    expect(keywords(game, mine).has("double-strike")).toBe(false);
  });
});

describe("Abstract Paintmage", () => {
  it("adds {U}{R} at the beginning of your first main phase, spendable only on instants and sorceries", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Abstract Paintmage");
    toStep(game, "precombat-main");
    settle(game);
    const pool = game.state.players[A].manaPool;
    expect(pool.map((u) => u.type).sort()).toEqual(["R", "U"]);
    expect(pool.every((u) => u.restriction?.spell?.typesAnyOf?.includes("sorcery") === true)).toBe(true);
    // Not a creature spell: the restricted mana can't pay for one.
    const bear = toHand(game, "Raging Goblin");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === bear)).toBe(false);
  });
});

describe("Diary of Dreams", () => {
  it("turns a page per instant or sorcery cast, and each page takes {1} off the draw", () => {
    const { game } = table();
    const diary = spawn(game, "Diary of Dreams");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, diary, "page")).toBe(1);
    game.state.objects[diary].counters.page = 4;
    // {5} less four: the one Mountain is gone, so only {1} of a fresh land pays.
    expect(canActivate(game, diary)).toBe(false);
    lands(game, "Mountain", 1);
    const before = hand(game).length;
    activate(game, diary);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Essenceknit Scholar", () => {
  it("makes an attack-lifegain Pest, and draws at your end step only if a creature died under your control", () => {
    const { game, a } = table();
    enter(game, "Essenceknit Scholar");
    const [pest] = named(game, PEST);
    expect(pest).toBeDefined();
    expect(pt(game, pest)).toEqual({ power: 1, toughness: 1 });
    // An opponent's creature dying doesn't count.
    destroy(game, spawn(game, "Grizzly Bears", B), A);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);

    // Next turn: one of yours dies.
    toStep(game, "precombat-main");
    destroy(game, spawn(game, "Grizzly Bears"));
    const now = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(now + 1);
    void a;
  });

  it("the Pest gains you 1 life whenever it attacks", () => {
    const { game, a } = table();
    const pest = spawn(game, PEST);
    attack(game, a, [pest]);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(19);
  });
});

describe("Withering Curse", () => {
  it("gives -2/-2 without your lifegain, and destroys all creatures if you gained life this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 9);
    const giant = spawn(game, "Hill Giant", B);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Withering Curse"));
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });

    // Only *your* life gained counts: an opponent's is still -2/-2.
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    cast(game, toHand(game, "Withering Curse"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(pt(game, dreadmaw)).toEqual({ power: 4, toughness: 4 });

    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    cast(game, toHand(game, "Withering Curse"));
    expect(zone(game, dreadmaw)).toBe("graveyard");
  });
});

describe("Stirring Hopesinger", () => {
  it("puts a counter on each creature you control when you cast an instant or sorcery that targets a creature", () => {
    const { game } = table();
    const singer = spawn(game, "Stirring Hopesinger");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    // At a player: no trigger.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, singer)).toBe(0);
    // At an opponent's creature: yours get the counters, theirs doesn't.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(theirs)] });
    expect(counters(game, singer)).toBe(1);
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Geometer's Arthropod", () => {
  it("looks at the top X cards of the X spell cast, one to hand, the rest to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Geometer's Arthropod");
    lands(game, "Mountain", 4);
    const top = [toLibrary(game, "Island"), toLibrary(game, "Forest"), toLibrary(game, "Swamp")];
    const pick = top[1];
    const before = game.state.zones.perPlayer[A].library;
    const topIsEnd = before.indexOf(top[2]) === before.length - 1;
    const seen = pickFromZone(a, pick);
    cast(game, toHand(game, "Blaze"), { x: 3, targets: [ref(B)] });
    expect(seen.offered).toHaveLength(3);
    expect(zone(game, pick)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    // The other two are now the bottom two, under the Wastes.
    const bottom2 = topIsEnd ? library.slice(0, 2) : library.slice(-2);
    expect([...bottom2].sort()).toEqual([top[0], top[2]].sort());
    expect(life(game, B)).toBe(17);
  });
});

describe("Lluwen, Exchange Student // Pest Friend", () => {
  it("enters prepared; Pest Friend makes the Pest; exiling a creature card prepares it again, at sorcery speed", () => {
    const { game } = table();
    const lluwen = enter(game, "Lluwen, Exchange Student");
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Pest Friend");
    lands(game, "Swamp", 1);
    cast(game, copy, { via: "prepared" });
    expect(named(game, PEST)).toHaveLength(1);
    expect(game.state.objects[lluwen].prepared).toBeUndefined();

    // No creature card in the graveyard: nothing to pay with.
    toGraveyard(game, "Lightning Bolt");
    expect(canActivate(game, lluwen)).toBe(false);
    const corpse = toGraveyard(game, "Grizzly Bears");
    activate(game, lluwen);
    expect(zone(game, corpse)).toBe("exile");
    expect(game.state.objects[lluwen].prepared).toBeDefined();
    expect(preparedCopies(game)).toHaveLength(1);

    // Sorcery speed: not in combat.
    toGraveyard(game, "Hill Giant");
    toStep(game, "begin-combat");
    expect(canActivate(game, lluwen)).toBe(false);
  });
});

describe("Fix What's Broken", () => {
  it("returns each artifact and creature card with mana value exactly the life paid", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    const bear = toGraveyard(game, "Grizzly Bears");
    const signet = toGraveyard(game, "Arcane Signet");
    const giant = toGraveyard(game, "Hill Giant");
    const aura = toGraveyard(game, "Pacifism");
    const ogre = toGraveyard(game, "Gray Ogre");
    cast(game, toHand(game, "Fix What's Broken"), { x: 2 });
    expect(life(game, A)).toBe(18);
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, signet)).toBe("battlefield");
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, aura)).toBe("graveyard");
  });
});

describe("Pull from the Grave", () => {
  it("returns up to two creature cards and gains 2 life — with no targets, just the life", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const bear = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "Pull from the Grave"), { targets: [ref(bear), ref(giant)] });
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    expect(life(game, A)).toBe(22);
    cast(game, toHand(game, "Pull from the Grave"), { targets: [null, null] });
    expect(life(game, A)).toBe(24);
    void a;
  });
});

describe("Send in the Pest", () => {
  it("each opponent discards a card, and you create the attack-lifegain Pest", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 2);
    const before = [hand(game, B).length, hand(game, "carol" as PlayerId).length];
    cast(game, toHand(game, "Send in the Pest"));
    expect([hand(game, B).length, hand(game, "carol" as PlayerId).length]).toEqual(before.map((n) => n - 1));
    expect(named(game, PEST, A)).toHaveLength(1);
    expect(graveyard(game, B)).toHaveLength(1);
  });
});
