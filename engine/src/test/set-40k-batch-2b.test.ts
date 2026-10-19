/**
 * The set walk, Warhammer 40,000 Commander batch 2, group b (2026-10-19):
 * the bottom half's cards the engine runs exactly. Written on the shared
 * table in `harness.ts`.
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
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const canActivate = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source);

describe("Hormagaunt Horde", () => {
  it("enters with X counters and draws at X 5", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const before = hand(game).length;
    const horde = toHand(game, "Hormagaunt Horde");
    cast(game, horde, { x: 5 });
    expect(counters(game, horde)).toBe(5);
    expect(pt(game, horde)).toEqual({ power: 6, toughness: 6 });
    // The Horde left the hand; the ravenous draw replaced it.
    expect(hand(game).length).toBe(before + 1);
  });

  it("returns from the graveyard to hand when a land enters and {2}{G} is paid", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const horde = toGraveyard(game, "Hormagaunt Horde");
    pickModes(a, 0);
    enter(game, "Forest");
    expect(zone(game, horde)).toBe("hand");
  });

  it("stays in the graveyard when the payment is declined", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const horde = toGraveyard(game, "Hormagaunt Horde");
    pickModes(a);
    enter(game, "Forest");
    expect(zone(game, horde)).toBe("graveyard");
  });
});

describe("Inquisitor Greyfax", () => {
  it("gives other creatures +1/+0 and vigilance, and taps a creature to investigate", () => {
    const { game } = table();
    const greyfax = spawn(game, "Inquisitor Greyfax");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, greyfax)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);

    const giant = spawn(game, "Hill Giant", B);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Wastes", 1);
    activate(game, greyfax, 0, { targets: [{ kind: "object", object: giant }] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Szarekh, the Silent King", () => {
  it("mills three as it attacks and offers only an artifact creature or Vehicle card from them", () => {
    const { game, a } = table();
    const szarekh = spawn(game, "Szarekh, the Silent King");
    const bears = toLibrary(game, "Grizzly Bears");
    const scythe = toLibrary(game, "Night Scythe");
    const thopter = toLibrary(game, "Ornithopter");
    const seen = pickFromZone(a, thopter);
    attack(game, a, [szarekh]);
    expect([...seen.offered].sort()).toEqual([scythe, thopter].sort());
    expect(zone(game, thopter)).toBe("hand");
    expect(zone(game, scythe)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("For the Emperor!", () => {
  it("gives creatures you control +2/+2, vigilance and lifelink until end of turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "For the Emperor!"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, giant).has("lifelink")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Tyranid Prime", () => {
  it("evolves itself and gives other creatures you control evolve", () => {
    const { game } = table();
    const prime = spawn(game, "Tyranid Prime");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const giant = enter(game, "Hill Giant");
    expect(counters(game, prime)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Space Marine Scout", () => {
  it("fetches a Plains tapped when an opponent controls more lands", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2, B);
    const plains = toLibrary(game, "Plains");
    pickModes(a, 0);
    pickFromZone(a, plains);
    enter(game, "Space Marine Scout");
    expect(zone(game, plains)).toBe("battlefield");
    expect(game.state.objects[plains].tapped).toBe(true);
  });

  it("doesn't trigger when no opponent controls more lands", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2, B);
    lands(game, "Wastes", 2, A);
    const plains = toLibrary(game, "Plains");
    pickModes(a, 0);
    pickFromZone(a, plains);
    enter(game, "Space Marine Scout");
    expect(zone(game, plains)).toBe("library");
  });
});

describe("Pink Horror", () => {
  it("deals 2 when you cast an instant, and splits into two Blue Horrors that each deal 1", () => {
    const { game, a } = table();
    const horror = spawn(game, "Pink Horror");
    lands(game, "Island", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Opt"));
    expect(life(game, B)).toBe(18);

    destroy(game, horror);
    expect(tokensNamed(game, "Blue Horror", A)).toBe(2);
    cast(game, toHand(game, "Opt"));
    expect(life(game, B)).toBe(16);
  });
});

describe("Necron Monolith", () => {
  it("makes a Necron Warrior for each creature card it mills as it attacks", () => {
    const { game, a } = table();
    const monolith = spawn(game, "Necron Monolith");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    toLibrary(game, "Hill Giant");
    activate(game, monolith);
    attack(game, a, [monolith]);
    expect(tokensNamed(game, "Necron Warrior Token", A)).toBe(2);
  });
});

describe("Exterminatus", () => {
  it("destroys opponents' indestructible nonland permanents, not yours, and no lands", () => {
    const { game } = table();
    const mine = spawn(game, "Darksteel Myr");
    const theirs = spawn(game, "Darksteel Myr", B);
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring", B);
    const land = spawn(game, "Wastes", B);
    lands(game, "Plains", 5);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Exterminatus"));
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Chaos Terminator Lord", () => {
  it("gives another creature you control double strike at the beginning of combat", () => {
    const { game, a } = table();
    const lord = spawn(game, "Chaos Terminator Lord");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "begin-combat");
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(seen.offered[0]).not.toContain(lord);
    expect(keywords(game, bears).has("double-strike")).toBe(true);
  });
});

describe("Defenders of Humanity", () => {
  it("makes X Warriors as it enters, and exiles itself for X more only with no creatures on your turn", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const defenders = toHand(game, "Defenders of Humanity");
    cast(game, defenders, { x: 2 });
    expect(tokensNamed(game, "Astartes Warrior Token", A)).toBe(2);
    // Mana for the activation, so only its restrictions can refuse it.
    lands(game, "Plains", 3);
    expect(canActivate(game, defenders)).toBe(false);

    for (const id of named(game, "Astartes Warrior Token", A)) destroy(game, id);
    expect(tokensNamed(game, "Astartes Warrior Token", A)).toBe(0);
    nextTurn(game);
    // Bob's turn: not during alice's turn.
    expect(canActivate(game, defenders)).toBe(false);
    nextTurn(game);
    lands(game, "Plains", 1);
    expect(canActivate(game, defenders)).toBe(true);
    activate(game, defenders, 0, { x: 3 });
    expect(zone(game, defenders)).toBe("exile");
    expect(tokensNamed(game, "Astartes Warrior Token", A)).toBe(3);
  });
});

describe("Deathleaper, Terror Weapon", () => {
  it("gives your creatures that entered this turn double strike, until the turn ends", () => {
    const { game } = table();
    const deathleaper = enter(game, "Deathleaper, Terror Weapon");
    const bears = enter(game, "Grizzly Bears");
    const theirs = enter(game, "Grizzly Bears", B);
    expect(keywords(game, deathleaper).has("double-strike")).toBe(true);
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(keywords(game, theirs).has("double-strike")).toBe(false);
    nextTurn(game);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
  });
});

describe("Purestrain Genestealer", () => {
  it("enters with two counters and trades one for a basic land as it attacks", () => {
    const { game, a } = table();
    const genestealer = enter(game, "Purestrain Genestealer");
    expect(pt(game, genestealer)).toEqual({ power: 3, toughness: 3 });
    const forest = toLibrary(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, forest);
    attack(game, a, [genestealer]);
    expect(counters(game, genestealer)).toBe(1);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("doesn't search when it has no counter to remove", () => {
    const { game, a } = table();
    const genestealer = enter(game, "Purestrain Genestealer");
    game.state.objects[genestealer].counters["+1/+1"] = 0;
    const forest = toLibrary(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, forest);
    attack(game, a, [genestealer]);
    expect(zone(game, forest)).toBe("library");
  });
});

describe("Malanthrope", () => {
  it("exiles a graveyard and gets a counter per creature card exiled", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Wastes", B);
    pickTargets(a, B);
    const malanthrope = enter(game, "Malanthrope");
    expect(graveyard(game, B).length).toBe(0);
    expect(counters(game, malanthrope)).toBe(2);
  });
});

describe("Trygon Prime", () => {
  it("puts a counter on itself and another attacker, which can't be blocked", () => {
    const { game, a } = table();
    const trygon = spawn(game, "Trygon Prime");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [trygon, bears]);
    expect(counters(game, trygon)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(keywords(game, trygon).has("unblockable")).toBe(false);
  });

  it("still counters itself with no other target, and doesn't make itself unblockable", () => {
    const { game, a } = table();
    const trygon = spawn(game, "Trygon Prime");
    pickTargets(a, null);
    attack(game, a, [trygon]);
    expect(counters(game, trygon)).toBe(1);
    expect(keywords(game, trygon).has("unblockable")).toBe(false);
  });
});

describe("Sister of Silence", () => {
  it("is flashed in on an opponent's sorcery and counters it as it enters", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const sister = toHand(game, "Sister of Silence");
    lands(game, "Island", 3, B);
    const divination = toHand(game, "Divination", B);
    nextTurn(game);
    const before = hand(game, B).length;
    cast(game, divination, { player: B, settle: false });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    pickTargets(a, divination);
    cast(game, sister);
    expect(zone(game, sister)).toBe("battlefield");
    expect(zone(game, divination)).toBe("graveyard");
    // Divination left bob's hand and drew nothing.
    expect(hand(game, B).length).toBe(before - 1);
  });});

describe("Tallyman of Nurgle", () => {
  it("draws one and loses 1 if a creature died, seven and 7 if seven did", () => {
    const { game } = table();
    spawn(game, "Tallyman of Nurgle");
    destroy(game, spawn(game, "Grizzly Bears", B));
    let before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);

    nextTurn(game);
    nextTurn(game);
    for (let i = 0; i < 7; i++) destroy(game, spawn(game, "Grizzly Bears", B));
    before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 7);
    expect(life(game)).toBe(12);
  });

  it("does nothing at end step when no creature died", () => {
    const { game } = table();
    spawn(game, "Tallyman of Nurgle");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20);
  });
});
