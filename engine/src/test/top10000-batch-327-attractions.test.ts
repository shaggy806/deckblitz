/**
 * Batch 327's Attractions and the cards that open them: one focused test per
 * card whose clause could be wrong. The subsystem itself — the Attraction
 * deck, opening, rolling to visit, the junkyard, claiming the prize — is
 * `attractions.test.ts`'s. An Attraction is visited here by lighting it up on
 * every number (`lightUp`) and letting its controller's precombat main phase
 * roll (rule 717.4), or by Line Cutter's roll.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  lightUp,
  named,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const ALL = [1, 2, 3, 4, 5, 6] as const;

/** `name` on `player`'s battlefield, lit up on every number. */
function attraction(game: Game, name: string, player: PlayerId = A): ObjectId {
  const id = spawn(game, name, player);
  lightUp(game, id, ALL);
  return id;
}

/** Alice's next precombat main phase, its roll to visit resolved. */
function visitNextTurn(game: Game): void {
  toStep(game, "precombat-main");
  settle(game);
}

const rollsToVisit = (game: Game): number[] =>
  game.state.eventLog.flatMap((e) => (e.type === "rolled-to-visit" ? [e.result] : []));

describe("the Attractions", () => {
  it("Balloon Stand: a 1/1 red flying Balloon, or sacrifice a Balloon to give flying", () => {
    const { game, a } = table();
    attraction(game, "Balloon Stand");
    pickModes(a, 0);
    visitNextTurn(game);
    const [balloon] = named(game, "Balloon Token", A);
    expect(balloon).toBeDefined();
    expect(pt(game, balloon)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, balloon).has("flying")).toBe(true);
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, bear);
    visitNextTurn(game);
    expect(named(game, "Balloon Token", A)).toHaveLength(0);
    expect(keywords(game, bear).has("flying")).toBe(true);
  });

  it("Balloon Stand: no Balloon to sacrifice, no flying", () => {
    const { game, a } = table();
    attraction(game, "Balloon Stand");
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, bear);
    visitNextTurn(game);
    expect(keywords(game, bear).has("flying")).toBe(false);
  });

  it("Bounce Chamber: the lowest-toughness creature you don't control, your choice among the tied", () => {
    const { game, a } = table();
    attraction(game, "Bounce Chamber");
    const mine = spawn(game, "Llanowar Elves");
    const small = spawn(game, "Grizzly Bears", B);
    const tied = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    const seen = pickPermanents(a, tied);
    visitNextTurn(game);
    expect([...seen.offered].sort()).toEqual([small, tied].sort());
    expect(zone(game, tied)).toBe("hand");
    expect(zone(game, small)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("Bumper Cars: target creature must be blocked this turn if able", () => {
    const { game, a } = table();
    attraction(game, "Bumper Cars");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    visitNextTurn(game);
    const restrictions = game.state.playerEffects?.flatMap((e) => e.combat ?? []) ?? [];
    const modifiers = game.state.objects[bear].modifiers.flatMap((m) => m.restrictions ?? []);
    expect([...restrictions, ...modifiers]).toContain("must-be-blocked-if-able");
  });

  it("Clown Extruder and Concession Stand make their tokens", () => {
    const { game } = table();
    attraction(game, "Clown Extruder");
    attraction(game, "Concession Stand");
    visitNextTurn(game);
    expect(tokensNamed(game, "Clown Robot Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("Foam Weapons Kiosk: a +1/+1 counter and vigilance on target creature you control", () => {
    const { game, a } = table();
    attraction(game, "Foam Weapons Kiosk");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    visitNextTurn(game);
    expect(counters(game, bear)).toBe(1);
    expect(keywords(game, bear).has("vigilance")).toBe(true);
  });

  it("Fortune Teller scries 1", () => {
    const { game } = table();
    attraction(game, "Fortune Teller");
    visitNextTurn(game);
    expect(game.state.eventLog.some((e) => e.type === "scried" && e.player === A)).toBe(true);
  });

  it("Hall of Mirrors: each other creature you control a non-legendary copy until end of turn", () => {
    const { game, a } = table();
    attraction(game, "Hall of Mirrors");
    const legend = spawn(game, "Thalia, Guardian of Thraben");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, legend);
    visitNextTurn(game);
    // A 2/1 first striker like Thalia, but not legendary: both stay.
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, bear).has("first-strike")).toBe(true);
    expect(supertypes(game, bear)).not.toContain("legendary");
    expect(zone(game, legend)).toBe("battlefield");
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Haunted House: back from your graveyard with haste, exiled at your next end step", () => {
    const { game, a } = table();
    attraction(game, "Haunted House");
    const dead = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, dead);
    visitNextTurn(game);
    expect(zone(game, dead)).toBe("battlefield");
    expect(keywords(game, dead).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, dead)).toBe("exile");
  });

  it("Kiddie Coaster and Roller Coaster pump your creatures until end of turn", () => {
    const { game } = table();
    attraction(game, "Kiddie Coaster");
    attraction(game, "Roller Coaster");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    visitNextTurn(game);
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Merry-Go-Round: horsemanship for your creatures with power 2 or less", () => {
    const { game } = table();
    attraction(game, "Merry-Go-Round");
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    visitNextTurn(game);
    expect(keywords(game, bear).has("horsemanship")).toBe(true);
    expect(keywords(game, giant).has("horsemanship")).toBe(false);
  });

  it("Spinny Ride taps target creature an opponent controls", () => {
    const { game, a } = table();
    attraction(game, "Spinny Ride");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    visitNextTurn(game);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("Storybook Ride: exiled cards playable this turn go to the bottom at the next end step", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    attraction(game, "Storybook Ride");
    visitNextTurn(game);
    const exiled = game.state.zones.shared.exile.filter((id) => game.state.objects[id].owner === A);
    expect(exiled).toHaveLength(1);
    toStep(game, "end");
    settle(game);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(exiled[0]);
  });

  it("Trash Bin: mill two, then a card at random back to your hand", () => {
    const { game } = table();
    attraction(game, "Trash Bin");
    const before = hand(game).length;
    visitNextTurn(game);
    // The draw step's card and the returned one; one of the two milled stays.
    expect(hand(game).length).toBe(before + 2);
    expect(graveyard(game)).toHaveLength(1);
  });

  it("Pick-a-Beeble: luck counters equal to the roll and a Treasure", () => {
    const { game } = table();
    const beeble = attraction(game, "Pick-a-Beeble");
    visitNextTurn(game);
    const rolled = game.state.eventLog.filter((e) => e.type === "dice-rolled").map((e) => (e.type === "dice-rolled" ? e.results[0] : 0));
    // The roll to visit, then its own die.
    expect(rolled).toHaveLength(2);
    const luck = counters(game, beeble, "luck");
    if (luck < 6) {
      expect(luck).toBe(rolled[1]);
      expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    } else {
      expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
    }
  });
});

describe("the cards that open them", () => {
  it("Rad Rascal, Petting Zookeeper, Seasoned Buttoneer, Deadbeat Attendant each open one as they enter", () => {
    for (const name of ["Rad Rascal", "Petting Zookeeper", "Seasoned Buttoneer", "Deadbeat Attendant"]) {
      const { game } = table({ attractions: ["Information Booth", "Trash Bin"] });
      enter(game, name);
      expect(named(game, "Information Booth", A)).toHaveLength(1);
      expect(game.state.players[A].attractionDeck).toHaveLength(1);
    }
  });

  it("Coming Attraction: a basic land onto the battlefield tapped, then an Attraction", () => {
    const { game, a } = table({ deck: "Forest", attractions: ["Information Booth"] });
    const paid = lands(game, "Forest", 3);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Coming Attraction"));
    const forests = named(game, "Forest", A);
    expect(forests).toHaveLength(4);
    const [fetched] = forests.filter((id) => !paid.includes(id));
    expect(game.state.objects[fetched].tapped).toBe(true);
    expect(named(game, "Information Booth", A)).toHaveLength(1);
  });

  it("Squirrel Squatters: a tapped attacking Squirrel per Attraction visited this turn", () => {
    const { game, a } = table({ attractions: ["Information Booth"] });
    const squatters = enter(game, "Squirrel Squatters");
    const [booth] = named(game, "Information Booth", A);
    lightUp(game, booth, ALL);
    attraction(game, "Fortune Teller");
    toStep(game, "precombat-main");
    settle(game);
    attack(game, a, [squatters]);
    // Two visited, so two Squirrels, which attacked too.
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
    expect(game.state.players[B].life).toBe(20 - 4 - 2);
  });

  it("The Most Dangerous Gamer opens one as it attacks", () => {
    const { game, a } = table({ attractions: ["Information Booth", "Trash Bin"] });
    const gamer = spawn(game, "The Most Dangerous Gamer");
    attack(game, a, [gamer]);
    expect(named(game, "Information Booth", A)).toHaveLength(1);
    expect(counters(game, gamer)).toBe(1);
  });

  it("Complaints Clerk: a Clown Robot whenever you roll a 1, a roll to visit included", () => {
    let ones = 0;
    let others = 0;
    for (let seed = 1; seed <= 40 && (ones === 0 || others === 0); seed += 1) {
      const { game } = table({ seed });
      spawn(game, "Complaints Clerk");
      enter(game, "Line Cutter");
      const [result] = rollsToVisit(game);
      expect(tokensNamed(game, "Clown Robot Token", A)).toBe(result === 1 ? 1 : 0);
      if (result === 1) ones += 1;
      else others += 1;
    }
    expect(ones).toBeGreaterThan(0);
    expect(others).toBeGreaterThan(0);
  });

  it("Spinnerette, Arachnobat: +2/+0 and menace with three or more Attractions", () => {
    const { game } = table();
    const spinnerette = spawn(game, "Spinnerette, Arachnobat");
    spawn(game, "Information Booth");
    spawn(game, "Trash Bin");
    expect(pt(game, spinnerette)).toEqual({ power: 2, toughness: 4 });
    spawn(game, "Fortune Teller");
    expect(pt(game, spinnerette)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, spinnerette).has("menace")).toBe(true);
  });

  it("\"Lifetime\" Pass Holder: enters tapped, opens one as it dies, returns from the graveyard on a 6", () => {
    const { game } = table({ attractions: ["Information Booth", "Trash Bin"] });
    const holder = enter(game, "\"Lifetime\" Pass Holder");
    expect(game.state.objects[holder].tapped).toBe(true);
    destroy(game, holder);
    settle(game);
    expect(named(game, "Information Booth", A)).toHaveLength(1);
    let sixes = 0;
    let others = 0;
    for (let seed = 1; seed <= 40 && (sixes === 0 || others === 0); seed += 1) {
      const t = table({ seed });
      const card = toGraveyard(t.game, "\"Lifetime\" Pass Holder");
      pickModes(t.a, 0);
      enter(t.game, "Line Cutter");
      const [result] = rollsToVisit(t.game);
      expect(zone(t.game, card)).toBe(result === 6 ? "battlefield" : "graveyard");
      if (result === 6) sixes += 1;
      else others += 1;
    }
    expect(sixes).toBeGreaterThan(0);
    expect(others).toBeGreaterThan(0);
  });

  it("Discourtesy Clerk: at your end step with three or more Attractions, draw and lose 1", () => {
    const { game } = table();
    spawn(game, "Discourtesy Clerk");
    spawn(game, "Information Booth");
    spawn(game, "Trash Bin");
    lightUp(game, spawn(game, "Fortune Teller"), []);
    lightUp(game, named(game, "Information Booth", A)[0], []);
    lightUp(game, named(game, "Trash Bin", A)[0], []);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(game.state.players[A].life).toBe(19);
  });

  it("Discourtesy Clerk: not with two", () => {
    const { game } = table();
    spawn(game, "Discourtesy Clerk");
    lightUp(game, spawn(game, "Information Booth"), []);
    toStep(game, "end");
    settle(game);
    expect(game.state.players[A].life).toBe(20);
  });

  it("Quick Fixer opens one as it deals combat damage to a player", () => {
    const { game, a } = table({ attractions: ["Information Booth"] });
    const fixer = spawn(game, "Quick Fixer");
    attack(game, a, [fixer]);
    expect(named(game, "Information Booth", A)).toHaveLength(1);
  });

  it("Black Hole without a visit destroys one creature", () => {
    const { game } = table();
    const [x, y] = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    lands(game, "Swamp", 4);
    expect(() => cast(game, toHand(game, "Black Hole"), { targets: [ref(x), ref(y)] })).toThrow(/refused/);
  });
});
