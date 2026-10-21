/**
 * Throne of Eldraine, batch 1F — and the earlier "doesn't untap" Auras and
 * Equipment it brings along.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  nextTurn,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const library = (game: ReturnType<typeof table>["game"], p: typeof A) => game.state.zones.perPlayer[p].library.length;

describe("ELD batch 1F", () => {
  it("Wintermoor Commander: toughness counts Knights you control; its attack makes another Knight indestructible", () => {
    const { game, a } = table();
    const commander = spawn(game, "Wintermoor Commander");
    expect(pt(game, commander)).toEqual({ power: 2, toughness: 1 });
    const knight = spawn(game, "Youthful Knight");
    expect(pt(game, commander)).toEqual({ power: 2, toughness: 2 });
    pickTargets(a, knight);
    attack(game, a, [commander]);
    expect(keywords(game, knight).has("indestructible")).toBe(true);
    expect(keywords(game, commander).has("indestructible")).toBe(false);
  });

  it("Eye Collector: combat damage to a player makes each player mill a card", () => {
    const { game, a } = table();
    const eye = spawn(game, "Eye Collector");
    const [mine, theirs] = [library(game, A), library(game, B)];
    attack(game, a, [eye]);
    expect(life(game, B)).toBe(19);
    expect(library(game, A)).toBe(mine - 1);
    expect(library(game, B)).toBe(theirs - 1);
  });

  it("Lucky Clover: an Adventure spell is copied — Bring Back makes four Humans", () => {
    const { game } = table();
    spawn(game, "Lucky Clover");
    lands(game, "Plains", 4);
    const ranger = toHand(game, "Oakhame Ranger");
    cast(game, ranger, { face: 1 });
    expect(tokensNamed(game, "Human Token", A)).toBe(4);
    expect(zone(game, ranger)).toBe("exile");
  });

  it("Tournament Grounds: its coloured mana casts a Knight but not another spell", () => {
    const { game } = table();
    lands(game, "Tournament Grounds", 2);
    expect(() => cast(game, toHand(game, "Elite Vanguard"))).toThrow();
    const knight = toHand(game, "Youthful Knight");
    cast(game, knight);
    expect(zone(game, knight)).toBe("battlefield");
  });

  it("Overwhelmed Apprentice: each opponent mills two", () => {
    const { game } = table({ players: 3 });
    const before = library(game, B);
    const own = library(game, A);
    enter(game, "Overwhelmed Apprentice");
    expect(library(game, B)).toBe(before - 2);
    expect(library(game, A)).toBe(own);
  });

  it("Workshop Elders: an artifact becomes a 0/0 creature with four +1/+1 counters, and flies", () => {
    const { game, a } = table();
    spawn(game, "Workshop Elders");
    const ring = spawn(game, "Sol Ring");
    pickTargets(a, ring);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, ring)).toContain("creature");
    expect(counters(game, ring)).toBe(4);
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, ring).has("flying")).toBe(true);
    nextTurn(game);
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
  });

  it("Rowan, Fearless Sparkmage −2: 1 damage to each of two creatures, and neither can block", () => {
    const { game, a } = table();
    const rowan = spawn(game, "Rowan, Fearless Sparkmage");
    game.state.objects[rowan].counters.loyalty = 5;
    const [x, y] = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    const free = spawn(game, "Grizzly Bears", B);
    loyalty(game, rowan, -2, { targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].damageMarked).toBe(1);
    expect(game.state.objects[y].damageMarked).toBe(1);
    const attacker = spawn(game, "Savannah Lions");
    const offer = blockOffer(game, a, [attacker]);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toEqual([free]);
  });

  it("Rowan −9: gain control of every creature, untapped, with haste", () => {
    const { game } = table();
    const rowan = spawn(game, "Rowan, Fearless Sparkmage");
    game.state.objects[rowan].counters.loyalty = 9;
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    loyalty(game, rowan, -9);
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(keywords(game, theirs).has("haste")).toBe(true);
  });

  it("Deathless Knight returns on the turn's first life gain, not a later one", () => {
    const { game } = table();
    const knight = toGraveyard(game, "Deathless Knight");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(hand(game)).toContain(knight);

    nextTurn(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    const late = toGraveyard(game, "Deathless Knight");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(graveyard(game)).toContain(late);
  });

  it("Sorcerer's Broom: sacrificing another permanent and paying {3} copies it", () => {
    const { game, a } = table();
    spawn(game, "Sorcerer's Broom");
    const food = spawn(game, "Food Token");
    lands(game, "Wastes", 5);
    pickModes(a, 0);
    activate(game, food, 0);
    expect(named(game, "Sorcerer's Broom", A)).toHaveLength(2);
    expect(life(game)).toBe(23);
  });

  it("Embereth Skyblazer: paying {2}{R} gives your creatures +X/+0, X the number of opponents", () => {
    const { game, a } = table({ players: 3 });
    const blazer = spawn(game, "Embereth Skyblazer");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    expect(keywords(game, blazer).has("flying")).toBe(true);
    pickModes(a, 0);
    attack(game, a, [blazer]);
    expect(pt(game, blazer)).toEqual({ power: 6, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });

  it("Oko's Hospitality: creatures you control have base 3/3", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 4);
    lands(game, "Island", 1);
    pickModes(a);
    cast(game, toHand(game, "Oko's Hospitality"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Bubble Snare taps the creature only when kicked, and keeps it from untapping", () => {
    const { game } = table();
    const [x, y] = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    lands(game, "Island", 5);
    cast(game, toHand(game, "Bubble Snare"), { targets: [ref(x)] });
    expect(game.state.objects[x].tapped).toBe(false);
    cast(game, toHand(game, "Bubble Snare"), { targets: [ref(y)], kicked: true });
    expect(game.state.objects[y].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[y].tapped).toBe(true);
  });

  it("Cement Shoes: +3/+3, taps the creature at its controller's end step, and it doesn't untap", () => {
    const { game } = table();
    const shoes = spawn(game, "Cement Shoes");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, shoes, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Sleep Magic taps the creature and is sacrificed when that creature is dealt damage", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    const aura = toHand(game, "Sleep Magic");
    cast(game, aura, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Sleep with the Fishes taps the creature and makes an unblockable Fish", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Sleep with the Fishes"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(tokensNamed(game, "Fish Token (Expendable Lackey)", A)).toBe(1);
  });
});
