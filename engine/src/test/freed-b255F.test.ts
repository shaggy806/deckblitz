/**
 * Batch 255, group F: cards freed by the chosen-player, per-player-count,
 * hand-exile and target's-controller families. Each test holds the clause the
 * card most easily gets wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const battlefieldOf = (game: Game, player: typeof A): number =>
  game.battlefield.filter((id) => game.state.objects[id].controller === player).length;

const emptyHand = (game: Game, player: typeof A): void => {
  for (const card of [...hand(game, player)]) game.debugMove(card, "library");
};

describe("freed B255 group F", () => {
  it("Stuffy Doll deals that much damage to the chosen player, and pings itself", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => C;
    lands(game, "Wastes", 5);
    const doll = toHand(game, "Stuffy Doll");
    cast(game, doll);
    expect(game.state.objects[doll].chosenPlayer).toBe(C);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(doll)]);
    settle(game);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 20, 17]);
    expect(zone(game, doll)).toBe("battlefield");
    toStep(game, "precombat-main");
    activate(game, doll);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 20, 16]);
  });

  it("Sunspine Lynx: each player's own nonbasic lands, and no life gained even by setting it", () => {
    const { game } = table({ players: 3 });
    lands(game, "Command Tower", 1, A);
    lands(game, "Command Tower", 2, B);
    lands(game, "Wastes", 3, C);
    enter(game, "Sunspine Lynx");
    // Wastes is basic: Carol takes nothing.
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([19, 18, 20]);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 5 }, []);
    game.debugApplyEffect(A, { kind: "set-life-total", who: "you", amount: 40 }, []);
    settle(game);
    expect(life(game, A)).toBe(19);
  });

  it("Nicol Bolas's −9 at a planeswalker hits that planeswalker's controller", () => {
    const { game } = table({ players: 3 });
    const bolas = spawn(game, "Nicol Bolas, Planeswalker");
    const chandra = enter(game, "Chandra Nalaar", C);
    lands(game, "Wastes", 9, C);
    const bobs = hand(game, B).length;
    const carols = hand(game, C).length;
    const onBoard = battlefieldOf(game, C);
    loyalty(game, bolas, -9, { atLeast: 9, targets: [ref(chandra)] });
    expect(life(game, C)).toBe(20);
    expect(hand(game, C).length).toBe(Math.max(0, carols - 7));
    expect(battlefieldOf(game, C)).toBeLessThanOrEqual(onBoard - 7);
    expect(hand(game, B).length).toBe(bobs);
  });

  it("Nicol Bolas's −9 at a player: damage, then their discard and sacrifice", () => {
    const { game } = table();
    const bolas = spawn(game, "Nicol Bolas, Planeswalker");
    lands(game, "Wastes", 8, B);
    const bobs = hand(game, B).length;
    loyalty(game, bolas, -9, { atLeast: 9, targets: [ref(B)] });
    expect(life(game, B)).toBe(13);
    expect(hand(game, B).length).toBe(Math.max(0, bobs - 7));
    expect(battlefieldOf(game, B)).toBe(1);
  });

  it("Blim: the gift goes over, then each player pays for everything they control but don't own", () => {
    const { game, a } = table({ players: 3 });
    const blim = spawn(game, "Blim, Comedic Genius");
    const gift = spawn(game, "Hill Giant");
    const stolen = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(C, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    settle(game);
    const hands = [hand(game, A).length, hand(game, B).length, hand(game, C).length];
    pickTargets(a, gift);
    attack(game, a, [blim]);
    expect(controller(game, gift)).toBe(B);
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 15, 19]);
    expect([hand(game, A).length, hand(game, B).length, hand(game, C).length]).toEqual([hands[0], hands[1] - 1, hands[2] - 1]);
  });

  it("Nin draws for the creature's controller, X cards", () => {
    const { game } = table();
    const nin = spawn(game, "Nin, the Pain Artist");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 1);
    lands(game, "Mountain", 3);
    const before = [hand(game, A).length, hand(game, B).length];
    activate(game, nin, 0, { targets: [ref(giant)], x: 2 });
    expect([hand(game, A).length, hand(game, B).length]).toEqual([before[0], before[1] + 2]);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("Early Winter: exile a target creature, or the opponent exiles an enchantment of their choice", () => {
    const { game, b } = table({ players: 3 });
    const anthem = spawn(game, "Glorious Anthem", B);
    const moon = spawn(game, "Bad Moon", B);
    const carols = spawn(game, "Bad Moon", C);
    const seen = pickPermanents(b, moon);
    lands(game, "Swamp", 10);
    cast(game, toHand(game, "Early Winter"), { modes: [1], targets: [ref(B)] });
    expect(seen.offered).toEqual([anthem, moon]);
    expect([zone(game, anthem), zone(game, moon), zone(game, carols)]).toEqual(["battlefield", "exile", "battlefield"]);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Early Winter"), { modes: [0], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("Wing Storm: twice each player's own fliers", () => {
    const { game } = table();
    spawn(game, "Wind Drake", A);
    spawn(game, "Wind Drake", B);
    spawn(game, "Wind Drake", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Wing Storm"));
    expect([life(game, A), life(game, B)]).toEqual([18, 16]);
  });

  it("Unscythe exiles what the equipped creature damaged, for a Zombie", () => {
    const { game, a } = table();
    const pinger = spawn(game, "Prodigal Sorcerer");
    const scythe = spawn(game, "Unscythe, Killer of Kings");
    const elves = spawn(game, "Llanowar Elves", B);
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    activate(game, scythe, 0, { targets: [ref(pinger)] });
    expect(pt(game, pinger)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, pinger).has("first-strike")).toBe(true);
    activate(game, pinger, 0, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("Unscythe reads the creature it's on now, whenever that creature dealt the damage", () => {
    const { game, a } = table();
    const first = spawn(game, "Prodigal Sorcerer");
    const second = spawn(game, "Prodigal Sorcerer");
    const scythe = spawn(game, "Unscythe, Killer of Kings");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Wastes", 4);
    pickModes(a, 0);
    // The first pings the bears before it's equipped: that damage counts.
    activate(game, first, 0, { targets: [ref(bears)] });
    activate(game, scythe, 0, { targets: [ref(first)] });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    // The second pings the giant, then the Equipment moves off the first to
    // something else: only the creature it's on now is checked.
    activate(game, second, 0, { targets: [ref(giant)] });
    destroy(game, giant);
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("Unscythe makes no Zombie for a token, which can't be exiled as a card", () => {
    const { game, a } = table();
    const pinger = spawn(game, "Prodigal Sorcerer");
    const scythe = spawn(game, "Unscythe, Killer of Kings");
    game.debugApplyEffect(B, { kind: "create-token", token: "Zombie Token", count: 1 }, []);
    settle(game);
    const token = game.battlefield.find((id) => game.state.objects[id].cardName === "Zombie Token")!;
    expect(game.state.objects[token].isToken).toBe(true);
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    activate(game, scythe, 0, { targets: [ref(pinger)] });
    activate(game, pinger, 0, { targets: [ref(token)] });
    destroy(game, token);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });

  it("Unscythe makes no Zombie for a card that has left the graveyard in response", () => {
    const { game, a } = table();
    const pinger = spawn(game, "Prodigal Sorcerer");
    const scythe = spawn(game, "Unscythe, Killer of Kings");
    const elves = spawn(game, "Llanowar Elves", B);
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    activate(game, scythe, 0, { targets: [ref(pinger)] });
    activate(game, pinger, 0, { targets: [ref(elves)], settle: false });
    game.advanceUntil((s) => zone(game, elves) === "graveyard" && s.zones.shared.stack.length > 0);
    game.debugMove(elves, "hand");
    settle(game);
    expect(zone(game, elves)).toBe("hand");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });

  it("Torrent of Souls does what the colours spent say", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const body = toGraveyard(game, "Hill Giant");
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Torrent of Souls"), { targets: [ref(body), ref(B)] });
    expect(zone(game, body)).toBe("battlefield");
    expect(pt(game, bears).power).toBe(2);

    const red = table();
    const bobs = spawn(red.game, "Grizzly Bears", B);
    const mine = spawn(red.game, "Llanowar Elves", A);
    const stays = toGraveyard(red.game, "Hill Giant");
    lands(red.game, "Mountain", 5);
    cast(red.game, toHand(red.game, "Torrent of Souls"), { targets: [ref(stays), ref(B)] });
    expect(zone(red.game, stays)).toBe("graveyard");
    expect(pt(red.game, bobs).power).toBe(4);
    expect(keywords(red.game, bobs).has("haste")).toBe(true);
    expect(pt(red.game, mine).power).toBe(1);

    const both = table();
    const again = toGraveyard(both.game, "Hill Giant");
    lands(both.game, "Swamp", 4);
    lands(both.game, "Mountain", 1);
    cast(both.game, toHand(both.game, "Torrent of Souls"), { targets: [ref(again), ref(A)] });
    expect(zone(both.game, again)).toBe("battlefield");
    expect(pt(both.game, again).power).toBe(5);
    expect(keywords(both.game, again).has("haste")).toBe(true);
  });

  it("Torrent of Souls can leave its graveyard slot empty", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Torrent of Souls"), { targets: [null, ref(B)] });
    expect(pt(game, bears).power).toBe(4);
  });

  it("Hunted Nightmare: the target opponent chooses which creature takes the counter", () => {
    const { game, a, b } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    const seen = pickPermanents(b, giant);
    pickTargets(a, B);
    enter(game, "Hunted Nightmare");
    expect(seen.offered).toEqual([bears, giant]);
    expect([counters(game, bears, "deathtouch"), counters(game, giant, "deathtouch"), counters(game, carols, "deathtouch")]).toEqual([0, 1, 0]);
    expect(keywords(game, giant).has("deathtouch")).toBe(true);
  });

  it("Hunted Nightmare does nothing to an opponent with no creature", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    pickTargets(a, B);
    enter(game, "Hunted Nightmare");
    expect(counters(game, mine, "deathtouch")).toBe(0);
  });

  it("Aim for the Head: a Zombie, or two cards, or the one card held", () => {
    const { game, b } = table();
    const zombie = spawn(game, "Zombie Token", B);
    lands(game, "Swamp", 9);
    emptyHand(game, B);
    const keep = toHand(game, "Grizzly Bears", B);
    const one = toHand(game, "Hill Giant", B);
    const two = toHand(game, "Wind Drake", B);
    const seen = pickFromZone(b, one, two);
    cast(game, toHand(game, "Aim for the Head"), { modes: [1], targets: [ref(B)] });
    expect(seen.offered).toEqual(expect.arrayContaining([keep, one, two]));
    expect([zone(game, keep), zone(game, one), zone(game, two)]).toEqual(["hand", "exile", "exile"]);
    pickFromZone(b, keep);
    cast(game, toHand(game, "Aim for the Head"), { modes: [1], targets: [ref(B)] });
    expect(zone(game, keep)).toBe("exile");
    const notAZombie = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Aim for the Head"), { modes: [0], targets: [ref(zombie)] });
    expect(tokensNamed(game, "Zombie Token", B)).toBe(0);
    expect(zone(game, notAZombie)).toBe("battlefield");
  });

  it("Stern Judge: each player's own Swamps", () => {
    const { game } = table();
    const judge = spawn(game, "Stern Judge");
    lands(game, "Swamp", 2, A);
    lands(game, "Swamp", 3, B);
    lands(game, "Island", 2, B);
    activate(game, judge);
    expect([life(game, A), life(game, B)]).toEqual([18, 17]);
  });

  it("Searing Rays counts the chosen colour on each player's side", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "G";
    spawn(game, "Llanowar Elves", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Llanowar Elves", B);
    spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Searing Rays"));
    expect([life(game, A), life(game, B)]).toEqual([19, 18]);
  });

  it("Agonizing Memories puts the two on top in the order the caster picks", () => {
    const { game, a } = table();
    emptyHand(game, B);
    const first = toHand(game, "Grizzly Bears", B);
    const second = toHand(game, "Hill Giant", B);
    const left = toHand(game, "Wind Drake", B);
    lands(game, "Swamp", 8);
    pickFromZone(a, second, first);
    cast(game, toHand(game, "Agonizing Memories"), { targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].library.slice(0, 2)).toEqual([second, first]);
    expect(zone(game, left)).toBe("hand");
    // Only one in hand: that one.
    pickFromZone(a, left);
    cast(game, toHand(game, "Agonizing Memories"), { targets: [ref(B)] });
    expect(game.state.zones.perPlayer[B].library[0]).toBe(left);
    expect(graveyard(game, B).length).toBe(0);
  });

  it("Haunting Apparition counts green creature cards in the chosen opponent's graveyard", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => C;
    lands(game, "Wastes", 3);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const apparition = toHand(game, "Haunting Apparition");
    cast(game, apparition);
    expect(game.state.objects[apparition].chosenPlayer).toBe(C);
    expect(pt(game, apparition)).toEqual({ power: 1, toughness: 2 });
    toGraveyard(game, "Llanowar Elves", C);
    toGraveyard(game, "Grizzly Bears", C);
    toGraveyard(game, "Hill Giant", C);
    toGraveyard(game, "Forest", C);
    toGraveyard(game, "Llanowar Elves", B);
    toGraveyard(game, "Llanowar Elves", A);
    expect(pt(game, apparition)).toEqual({ power: 3, toughness: 2 });
    // The choice stays with the permanent when it changes hands.
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(apparition)]);
    settle(game);
    expect(pt(game, apparition)).toEqual({ power: 3, toughness: 2 });
    game.concede(C);
    settle(game);
    expect(pt(game, apparition)).toEqual({ power: 1, toughness: 2 });
  });
});
