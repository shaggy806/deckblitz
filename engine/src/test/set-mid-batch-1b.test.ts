/**
 * Innistrad: Midnight Hunt, group b. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const face = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const offers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

describe("Burn Down the House", () => {
  it("first mode: 5 damage to each creature and each planeswalker", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant", B);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const sorin = spawn(game, "Sorin the Mirthless", B);
    cast(game, toHand(game, "Burn Down the House"), { modes: [0] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, sorin)).toBe("graveyard");
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("second mode: three Devils that have haste this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Burn Down the House"), { modes: [1] });
    expect(tokensNamed(game, "Devil Token", A)).toBe(3);
    const devils = game.battlefield.filter((id) => game.state.objects[id].cardName === "Devil Token");
    expect(keywords(game, devils[0]).has("haste")).toBe(true);
  });
});

describe("Bloodline Culling", () => {
  it("first mode: target creature gets -5/-5", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Bloodline Culling"), { modes: [0], targets: [ref(dreadmaw)] });
    expect(pt(game, dreadmaw)).toEqual({ power: 1, toughness: 1 });
  });

  it("second mode: only creature tokens get -2/-2", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    game.debugApplyEffect(B, { kind: "create-token", token: "Zombie Token", count: 2 });
    const bears = spawn(game, "Grizzly Bears", B);
    expect(tokensNamed(game, "Zombie Token", B)).toBe(2);
    cast(game, toHand(game, "Bloodline Culling"), { modes: [1] });
    expect(tokensNamed(game, "Zombie Token", B)).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Abandon the Post", () => {
  it("flashback: up to two target creatures can't block this turn, then it's exiled", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const post = toGraveyard(game, "Abandon the Post");
    const attacker = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const free = spawn(game, "Memnite", B);
    cast(game, post, { via: "flashback", targets: [ref(bears), ref(elves)] });
    expect(zone(game, post)).toBe("exile");
    const offer = blockOffer(game, a, [attacker]);
    const canBlock = (id: ObjectId): readonly ObjectId[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(bears)).toEqual([]);
    expect(canBlock(elves)).toEqual([]);
    expect(canBlock(free)).toEqual([attacker]);
  });
});

describe("Defenestrate", () => {
  it("can target only a creature without flying", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const card = toHand(game, "Defenestrate");
    expect(game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(angel)] })).not.toBeNull();
    cast(game, card, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Crossroads Candleguide", () => {
  it("exiles up to one target card from a graveyard as it enters", () => {
    const { game, a } = table();
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const kept = toGraveyard(game, "Hill Giant", B);
    pickTargets(a, theirs);
    enter(game, "Crossroads Candleguide");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, kept)).toBe("graveyard");
  });
});

describe("Lunar Frenzy", () => {
  it("+X/+0, first strike and trample on a creature you control", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Lunar Frenzy");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(theirs)], xValue: 3 }),
    ).not.toBeNull();
    cast(game, card, { x: 3, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Patrician Geist", () => {
  it("pumps other Spirits only", () => {
    const { game } = table();
    const geist = spawn(game, "Patrician Geist");
    const spirit = spawn(game, "Kindly Ancestor");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, geist)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, spirit)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("spells cast from your graveyard cost {1} less", () => {
    const { game } = table();
    spawn(game, "Patrician Geist");
    lands(game, "Island", 2);
    const twice = toGraveyard(game, "Think Twice");
    const before = hand(game).length;
    cast(game, twice, { via: "flashback" });
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, twice)).toBe("exile");
  });
});

describe("Avacyn's Memorial", () => {
  it("other legendary permanents you control have indestructible", () => {
    const { game } = table();
    const memorial = spawn(game, "Avacyn's Memorial");
    const kenrith = spawn(game, "Kenrith, the Returned King");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Kenrith, the Returned King", B);
    expect(keywords(game, memorial).has("indestructible")).toBe(true);
    expect(keywords(game, kenrith).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
  });
});

describe("Winterthorn Blessing", () => {
  it("counter on yours; theirs is tapped and skips its next untap", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Winterthorn Blessing"), { targets: [ref(mine), ref(theirs)] });
    expect(counters(game, mine)).toBe(1);
    expect(game.state.objects[theirs].tapped).toBe(true);
    toStep(game, "precombat-main", B);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("either target may be left out", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const theirs = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Winterthorn Blessing"), { targets: [null, ref(theirs)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Mystic Skull // Mystic Monstrosity", () => {
  it("{5}, {T} transforms it, and then lands you control tap for any color", () => {
    const { game } = table();
    const skull = spawn(game, "Mystic Skull");
    lands(game, "Wastes", 7);
    activate(game, skull, 1);
    expect(face(game, skull)).toBe("Mystic Monstrosity");
    expect(pt(game, skull)).toEqual({ power: 5, toughness: 6 });
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Hound Tamer // Untamed Pup", () => {
  it("{3}{G} puts a +1/+1 counter on target creature", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const tamer = spawn(game, "Hound Tamer");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, tamer, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
  });

  it("at night, the Pup gives other Wolves and Werewolves trample", () => {
    const { game } = table();
    const tamer = spawn(game, "Hound Tamer");
    const other = spawn(game, "Harvesttide Infiltrator");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "day-night", value: "day" });
    game.debugApplyEffect(A, { kind: "day-night", value: "night" });
    settle(game);
    expect(face(game, tamer)).toBe("Untamed Pup");
    expect(pt(game, tamer)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, other).has("trample")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(false);
  });
});

describe("Covetous Castaway // Ghostly Castigator", () => {
  it("mills three when it dies", () => {
    const { game } = table();
    const castaway = spawn(game, "Covetous Castaway");
    const before = library(game).length;
    destroy(game, castaway);
    expect(library(game).length).toBe(before - 3);
  });

  it("disturbed, it shuffles graveyard cards into the library, and is exiled when it would die", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const castaway = toGraveyard(game, "Covetous Castaway");
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Hill Giant");
    const kept = toGraveyard(game, "Memnite");
    pickTargets(a, one, two);
    pickModes(a, 0);
    cast(game, castaway, { via: "disturb", face: 1 });
    expect(face(game, castaway)).toBe("Ghostly Castigator");
    expect(zone(game, one)).toBe("library");
    expect(zone(game, two)).toBe("library");
    expect(zone(game, kept)).toBe("graveyard");
    destroy(game, castaway);
    expect(zone(game, castaway)).toBe("exile");
  });
});

describe("Grizzly Ghoul", () => {
  it("enters with a counter for each creature that died this turn, whoever controlled it", () => {
    const { game } = table();
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Hill Giant", B));
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const ghoul = toHand(game, "Grizzly Ghoul");
    cast(game, ghoul);
    expect(counters(game, ghoul)).toBe(2);
    expect(pt(game, ghoul)).toEqual({ power: 6, toughness: 5 });
  });
});

describe("Bereaved Survivor // Dauntless Avenger", () => {
  it("two creatures dying at once transform it only once (the ruling)", () => {
    const { game } = table();
    const survivor = spawn(game, "Bereaved Survivor");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature", name: "Grizzly Bears" } });
    settle(game);
    expect(face(game, survivor)).toBe("Dauntless Avenger");
  });

  it("the Avenger returns a creature card with mana value 2 or less tapped and attacking", () => {
    const { game, a } = table();
    const survivor = spawn(game, "Bereaved Survivor");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(face(game, survivor)).toBe("Dauntless Avenger");
    // The Giant (mana value 4) isn't a legal target, so the Bears is the only one.
    const giant = toGraveyard(game, "Hill Giant");
    attack(game, a, [survivor]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(life(game, B)).toBe(15);
  });
});

describe("Gavony Dawnguard", () => {
  it("becomes day as it enters; a day/night change digs for a creature with mana value 3 or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Gavony Dawnguard"));
    expect(game.state.dayNight).toBe("day");
    const dreadmaw = toLibrary(game, "Colossal Dreadmaw");
    const bears = toLibrary(game, "Grizzly Bears");
    // First the pick (only the Bears is eligible), then the order of the rest.
    const asked: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push(eligible);
      return asked.length === 1 ? [bears] : eligible;
    };
    game.debugApplyEffect(A, { kind: "day-night", value: "night" });
    settle(game);
    expect(asked[0]).toContain(bears);
    expect(asked[0]).not.toContain(dreadmaw);
    expect(zone(game, bears)).toBe("hand");
    expect(library(game).slice(-3)).toContain(dreadmaw);
  });
});

describe("Augur of Autumn", () => {
  it("plays lands from the top; creatures only with coven", () => {
    const { game } = table();
    spawn(game, "Augur of Autumn"); // 2/3
    lands(game, "Forest", 6);
    const forest = toLibrary(game, "Forest");
    expect(offers(game, forest).some((o) => o.kind === "play-land")).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");

    const bears = toLibrary(game, "Grizzly Bears");
    expect(offers(game, bears)).toHaveLength(0);
    spawn(game, "Memnite"); // 1/1
    spawn(game, "Hill Giant"); // 3/3 — three different powers
    expect(offers(game, bears)).toHaveLength(1);
    game.dispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "library-top" });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(graveyard(game)).toHaveLength(0);
  });
});
