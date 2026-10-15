/**
 * Set walk batch 77, part a (2026-10-15): Teenage Mutant Ninja Turtles (TMT), the rest of the set.
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

type Table = ReturnType<typeof table>;

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player: PlayerId = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

/** Alice attacks bob with `attackers` and stops in the declare blockers step
 * (no blocks), with priority — sneak's window. */
const attackAndHold = (g: Table, attackers: ObjectId[]): void => {
  g.a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  toStep(g.game, "declare-blockers");
};

describe("Mutant Chain Reaction", () => {
  it("destroys a creature with flying and makes a Mutagen", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Mutant Chain Reaction"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(tokensNamed(game, "Mutagen Token", A)).toBe(1);
  });

  it("up to one: with no target it still makes the Mutagen, and a ground creature can't be chosen", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Mutant Chain Reaction");
    expect(() => cast(game, card, { targets: [ref(bears)] })).toThrow();
    cast(game, card, { targets: [null] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Mutagen Token", A)).toBe(1);
  });
});

describe("Mouser Foundry", () => {
  it("makes a Robot as it enters and another as it's sacrificed to deal 3 damage", () => {
    const { game } = table();
    const foundry = enter(game, "Mouser Foundry");
    expect(tokensNamed(game, "Robot Token (Big Mother Mouser)", A)).toBe(1);
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, foundry, 0, { targets: [ref(giant)] });
    expect(zone(game, foundry)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Robot Token (Big Mother Mouser)", A)).toBe(2);
  });
});

describe("Ice Cream Kitty", () => {
  it("sacrifices another creature or a noncreature token to draw, never itself, and only as a sorcery", () => {
    const g = table();
    const { game } = g;
    lands(game, "Swamp", 4);
    const kitty = spawn(game, "Ice Cream Kitty");
    const bears = spawn(game, "Grizzly Bears");
    const mutagen = makeToken(game, "Mutagen Token");
    const ingot = spawn(game, "Darksteel Ingot");
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === kitty && o.abilityIndex === 0);
    const choices = offer?.kind === "activate-ability" ? (offer.sacrifice?.choices ?? []) : [];
    expect([...choices].sort()).toEqual([bears, mutagen].sort());
    expect(choices).not.toContain(kitty);
    expect(choices).not.toContain(ingot);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: kitty, abilityIndex: 0, sacrifice: mutagen });
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Mutagen Token")).toBe(0);
    // Not in combat.
    toStep(game, "begin-combat");
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === kitty && o.abilityIndex === 0)).toBe(
      false,
    );
  });

  it("taps and sacrifices itself to gain 3 life", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const kitty = spawn(game, "Ice Cream Kitty");
    activate(game, kitty, 1);
    expect(life(game)).toBe(23);
    expect(zone(game, kitty)).toBe("graveyard");
  });
});

describe("Cowabunga!", () => {
  it("offers only a Mutant, Ninja, Turtle or land card from the top four, the rest to the bottom", () => {
    const g = table({ deck: "Lightning Bolt" });
    const { game } = g;
    lands(game, "Forest", 1);
    const mountain = toLibrary(game, "Mountain");
    const bears = toLibrary(game, "Grizzly Bears");
    const shark = toLibrary(game, "Shark Shredder, Killer Clone");
    const leo = toLibrary(game, "Leonardo, Big Brother");
    const fifth = library(game)[4];
    const seen = pickFromZone(g.a, leo);
    cast(game, toHand(game, "Cowabunga!"));
    expect([...seen.offered].sort()).toEqual([mountain, shark, leo].sort());
    expect(zone(game, leo)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
    expect(library(game)[0]).toBe(fifth);
  });
});

describe("Venus, Torn Between Worlds", () => {
  it("puts a +1/+1 counter on herself for each damage she survives", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const venus = spawn(game, "Venus, Torn Between Worlds");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(venus)] });
    expect(counters(game, venus)).toBe(3);
    expect(pt(game, venus)).toEqual({ power: 8, toughness: 8 });
  });

  it("a creature you control with a counter deals combat damage: pay {U} to draw", () => {
    const g = table();
    const { game } = g;
    spawn(game, "Venus, Torn Between Worlds");
    const [island] = lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    game.state.objects[bears].counters = { ...game.state.objects[bears].counters, "+1/+1": 1 };
    pickModes(g.a, 0);
    const before = hand(game).length;
    attack(game, g.a, [bears, elves]);
    // Only the Bears had a counter: one trigger, one {U}, one card.
    expect(hand(game).length).toBe(before + 1);
    expect(game.state.objects[island].tapped).toBe(true);
    expect(life(game, B)).toBe(20 - 3 - 1);
  });

  it("declining the payment draws nothing", () => {
    const g = table();
    const { game } = g;
    spawn(game, "Venus, Torn Between Worlds");
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { ...game.state.objects[bears].counters, "+1/+1": 1 };
    pickModes(g.a);
    const before = hand(game).length;
    attack(game, g.a, [bears]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Tenderize", () => {
  it("your creature deals damage equal to its power to the opponent's, and takes none back", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Tenderize"), { targets: [ref(giant), ref(angel)] });
    expect(zone(game, angel)).toBe("battlefield");
    expect(game.state.objects[angel].damageMarked).toBe(3);
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("deals nothing once your creature is gone (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Tenderize"), { targets: [ref(giant), ref(bears)], settle: false });
    destroy(game, giant);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Leonardo, Leader in Blue", () => {
  it("sneaked in, creatures you control get +2/+0 until end of turn", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const leo = toHand(game, "Leonardo, Leader in Blue");
    attackAndHold(g, [bears, elves]);
    game.dispatch({ type: "cast-spell", player: A, card: leo, targets: [], via: "sneak", sneakReturn: bears });
    settle(game);
    expect(zone(game, leo)).toBe("battlefield");
    expect(pt(game, leo)).toEqual({ power: 4, toughness: 1 });
    expect(pt(game, elves)).toEqual({ power: 3, toughness: 1 });
    toStep(game, "postcombat-main");
    // Leonardo 4 and the Elves 3 connected.
    expect(life(game, B)).toBe(13);
  });

  it("cast for his mana cost, the enters ability doesn't trigger", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const elves = spawn(game, "Llanowar Elves");
    const leo = toHand(game, "Leonardo, Leader in Blue");
    cast(game, leo);
    expect(pt(game, leo)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, elves)).toEqual({ power: 1, toughness: 1 });
  });

  it("{1}{W}: first strike until end of turn", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const leo = spawn(game, "Leonardo, Leader in Blue");
    activate(game, leo, 0);
    expect(keywords(game, leo).has("first-strike")).toBe(true);
  });
});

describe("Dimensional Exile", () => {
  it("enchants only a basic land you control, and exiles an opponent's creature until it leaves", () => {
    const { game } = table();
    const [plains] = lands(game, "Plains", 2);
    const bobsPlains = spawn(game, "Plains", B);
    const tower = spawn(game, "Command Tower");
    const giant = spawn(game, "Hill Giant", B);
    const aura = toHand(game, "Dimensional Exile");
    expect(() => cast(game, aura, { targets: [ref(bobsPlains)] })).toThrow();
    expect(() => cast(game, aura, { targets: [ref(tower)] })).toThrow();
    cast(game, aura, { targets: [ref(plains)] });
    expect(game.state.objects[aura].attachedTo).toBe(plains);
    expect(zone(game, giant)).toBe("exile");
    destroy(game, aura);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });
});

describe("Go Ninja Go", () => {
  it("both modes: blinks your creature, then deals the greatest power among your creatures", () => {
    const g = table();
    const { game } = g;
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    game.state.objects[bears].counters = { ...game.state.objects[bears].counters, "+1/+1": 2 };
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Go Ninja Go"), { modes: [0, 1], targets: [ref(bears), ref(angel)] });
    // The Bears came back a new 2/2 without its counters, so the Giant's 3 is
    // the greatest: not enough for the Angel's 4 toughness.
    const [newBears] = named(game, "Grizzly Bears", A);
    expect(counters(game, newBears)).toBe(0);
    expect(zone(game, angel)).toBe("battlefield");
    expect(game.state.objects[angel].damageMarked).toBe(3);
  });

  it("the damage mode alone", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    spawn(game, "Serra Angel");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Go Ninja Go"), { modes: [1], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Bespoke Bō", () => {
  it("bounces up to one other nonland permanent as it enters; equipped gets +2/+1 and vigilance", () => {
    const g = table();
    const { game } = g;
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 6);
    pickTargets(g.a, angel);
    const bo = toHand(game, "Bespoke Bō");
    cast(game, bo);
    expect(zone(game, angel)).toBe("hand");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, bo, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });
});

describe("Foot Elite", () => {
  it("attacking, another creature you control gets +1/+0 and indestructible", () => {
    const g = table();
    const { game } = g;
    const elite = spawn(game, "Foot Elite");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(g.a, bears);
    g.a.declareAttackersFn = () => [{ attacker: elite, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, elite).has("indestructible")).toBe(false);
  });
});

describe("Casey Jones, Jury-Rig Justiciar", () => {
  it("as he enters, may take an artifact card from the top four", () => {
    const g = table({ deck: "Lightning Bolt" });
    const { game } = g;
    toLibrary(game, "Grizzly Bears");
    const ring = toLibrary(game, "Sol Ring");
    toLibrary(game, "Mountain");
    toLibrary(game, "Hill Giant");
    const seen = pickFromZone(g.a, ring);
    enter(game, "Casey Jones, Jury-Rig Justiciar");
    expect(seen.offered).toEqual([ring]);
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("Manhole Missile", () => {
  it("3 damage, then a card from hand to the bottom draws a card", () => {
    const g = table({ deck: "Lightning Bolt" });
    const { game } = g;
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    const bears = toHand(game, "Grizzly Bears");
    const missile = toHand(game, "Manhole Missile");
    const before = hand(game).length;
    const seen = pickFromZone(g.a, bears);
    cast(game, missile, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(seen.offered).toContain(bears);
    expect(library(game).at(-1)).toBe(bears);
    // The Missile and the Bears left, one card was drawn.
    expect(hand(game)).toHaveLength(before - 1);
    expect(game.state.objects[hand(game).at(-1)!].cardName).toBe("Lightning Bolt");
  });

  it("putting nothing on the bottom draws nothing", () => {
    const g = table();
    const { game } = g;
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    const bears = toHand(game, "Grizzly Bears");
    const missile = toHand(game, "Manhole Missile");
    const before = hand(game).length;
    pickFromZone(g.a);
    cast(game, missile, { targets: [ref(giant)] });
    expect(hand(game)).toHaveLength(before - 1);
    expect(hand(game)).toContain(bears);
  });
});

describe("Paramecia Coloniex", () => {
  it("mills three as it enters", () => {
    const { game } = table();
    enter(game, "Paramecia Coloniex");
    expect(graveyard(game)).toHaveLength(3);
  });

  it("dying, may exile itself; when it does, a creature card from your graveyard goes on top of your library", () => {
    const g = table();
    const { game } = g;
    const worm = spawn(game, "Paramecia Coloniex");
    const giant = toGraveyard(game, "Hill Giant");
    pickModes(g.a, 0);
    pickTargets(g.a, giant);
    destroy(game, worm);
    expect(zone(game, worm)).toBe("exile");
    expect(library(game)[0]).toBe(giant);
  });

  it("not exiled, nothing goes on top", () => {
    const g = table();
    const { game } = g;
    const worm = spawn(game, "Paramecia Coloniex");
    const giant = toGraveyard(game, "Hill Giant");
    pickModes(g.a);
    destroy(game, worm);
    expect(zone(game, worm)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
