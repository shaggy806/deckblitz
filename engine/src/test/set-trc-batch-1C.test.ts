/**
 * Star Trek Commander (TRC) — group C of the set's first batch: the Borg
 * Spacecraft and their station bands, seek out, battlefront, Federation's
 * Faerie counters, the Klingons, and the clauses each card turns on.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
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
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

/** Alice draws `n` cards (her turn's draw step already gave her one). */
function draw(game: Game, n: number): void {
  game.debugApplyEffect(A, { kind: "draw", amount: n });
  settle(game);
}

const charge = (game: Game, id: ObjectId, n: number): void => {
  game.state.objects[id].counters.charge = n;
};

/** Run to alice's turn-1 cleanup — past the end step's triggers. */
const toCleanup = (game: Game): void => game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "cleanup");

describe("Starship Enterprise", () => {
  it("gets four charge counters on landfall and is a 4/6 flier at 16", () => {
    const { game } = table();
    const ship = spawn(game, "Starship Enterprise");
    enter(game, "Forest");
    expect(counters(game, ship, "charge")).toBe(4);
    expect(types(game, ship)).not.toContain("creature");
    charge(game, ship, 16);
    expect(types(game, ship)).toContain("creature");
    expect(pt(game, ship)).toEqual({ power: 4, toughness: 6 });
    expect(keywords(game, ship).has("flying")).toBe(true);
  });
});

describe("One, Borg Evolved", () => {
  it("gives only your artifact creatures its keywords", () => {
    const { game } = table();
    spawn(game, "One, Borg Evolved");
    const borg = spawn(game, "Borg Token");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Ornithopter", B);
    for (const k of ["flying", "double-strike", "vigilance", "menace", "lifelink"]) {
      expect(keywords(game, borg).has(k)).toBe(true);
    }
    expect(keywords(game, bears).has("lifelink")).toBe(false);
    expect(keywords(game, theirs).has("lifelink")).toBe(false);
  });
});

describe("Battle of Wolf 359", () => {
  it("shrinks nonartifact creatures by the number of artifact creatures you control", () => {
    const { game } = table();
    spawn(game, "Borg Token");
    spawn(game, "Borg Token");
    spawn(game, "Ornithopter");
    const giant = spawn(game, "Hill Giant", B);
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Swamp", 5);
    const bigger = spawn(game, "Craw Wurm", B);
    const mine = named(game, "Borg Token", A)[0];
    cast(game, toHand(game, "Battle of Wolf 359"));
    // Three artifact creatures: -3/-3 to each nonartifact creature only.
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, bigger)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, thopter)).toEqual({ power: 0, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Borg Scout Sphere", () => {
  it("draws as it enters, and gives artifact creatures flying from 6 charge counters", () => {
    const { game } = table();
    const before = hand(game).length;
    const sphere = enter(game, "Borg Scout Sphere");
    expect(hand(game).length).toBe(before + 1);
    const borg = spawn(game, "Borg Token");
    charge(game, sphere, 5);
    expect(keywords(game, borg).has("flying")).toBe(false);
    charge(game, sphere, 6);
    expect(keywords(game, borg).has("flying")).toBe(true);
    expect(pt(game, sphere)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Class-4 Tactical Cube", () => {
  it("makes two Borg, and its anthem is part of the 7+ band", () => {
    const { game } = table();
    const cube = enter(game, "Class-4 Tactical Cube");
    expect(tokensNamed(game, "Borg Token", A)).toBe(2);
    const borg = named(game, "Borg Token", A)[0];
    charge(game, cube, 6);
    expect(pt(game, borg)).toEqual({ power: 1, toughness: 1 });
    charge(game, cube, 7);
    expect(pt(game, borg)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, cube)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, cube).has("flying")).toBe(true);
  });
});

describe("Extraction Integrant", () => {
  it("each creature blocking an artifact creature you control gets -1/-1", () => {
    const { game, a, b } = table();
    spawn(game, "Extraction Integrant");
    const borg = spawn(game, "Borg Token");
    expect(keywords(game, borg).has("menace")).toBe(true);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [
      { blocker: one, attacker: borg },
      { blocker: two, attacker: borg },
    ];
    attack(game, a, [borg]);
    // Both 1/1 now: the Borg's 1 damage killed one of them.
    const left = [one, two].filter((id) => zone(game, id) === "battlefield");
    expect(left).toHaveLength(1);
    expect(pt(game, left[0])).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Join the Collective", () => {
  it("makes a Borg for each nonartifact creature it destroyed", () => {
    const { game } = table();
    spawn(game, "Borg Token");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    spawn(game, "Ornithopter", B);
    lands(game, "Plains", 7);
    cast(game, toHand(game, "Join the Collective"));
    expect(tokensNamed(game, "Borg Token", A)).toBe(2);
    expect(named(game, "Ornithopter")).toHaveLength(0);
  });
});

describe("Seven of Nine, Tertiary Adjunct", () => {
  it("charges an artifact only when the discarded card is nonland", () => {
    const { game, a } = table();
    const seven = spawn(game, "Seven of Nine, Tertiary Adjunct");
    const ship = spawn(game, "Class-F Shuttlecraft");
    const wastes = hand(game)[0];
    a.chooseDiscardsFn = () => [wastes];
    pickTargets(a, ship);
    activate(game, seven);
    expect(counters(game, ship, "charge")).toBe(0);
    game.state.objects[seven].tapped = false;
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    activate(game, seven);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, ship, "charge")).toBe(2);
  });
});

describe("Deliver from Chaos", () => {
  it("exiles and makes Borg equal to the exiled permanent's mana value", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 3);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Deliver from Chaos"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Borg Token", A)).toBe(4);
  });
});

describe("U.S.S. Enterprise-E, Sovereign", () => {
  it("destroys only tapped creatures as it enters", () => {
    const { game } = table();
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Hill Giant", B);
    enter(game, "U.S.S. Enterprise-E, Sovereign");
    expect(zone(game, tapped)).toBe("graveyard");
    expect(zone(game, untapped)).toBe("battlefield");
  });
});

describe("U.S.S. Stargazer, Here and There", () => {
  it("attacks with a 4/3 flying Illusion that is exiled at end of combat", () => {
    const { game, a } = table();
    const ship = spawn(game, "U.S.S. Stargazer, Here and There");
    charge(game, ship, 6);
    attack(game, a, [ship]);
    expect(life(game, B)).toBe(12);
    expect(tokensNamed(game, "Spacecraft Illusion Token")).toBe(0);
  });
});

describe("U.S.S. Enterprise-C, Time-Tossed", () => {
  it("as it enters and as it dies, trades the whole hand for as many cards", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = hand(game).length;
    const ship = enter(game, "U.S.S. Enterprise-C, Time-Tossed");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(before);
    destroy(game, ship);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(2 * before + 1);
  });
});

describe("Chief Miles O'Brien", () => {
  it("doubles the counters on your artifact or creature on your second draw", () => {
    const { game, a } = table();
    spawn(game, "Chief Miles O'Brien");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    pickTargets(a, bears);
    draw(game, 1);
    expect(counters(game, bears)).toBe(4);
  });
});

describe("U.S.S. Defiant, Mirror Migrant", () => {
  it("phases out itself and up to one creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    const ship = enter(game, "U.S.S. Defiant, Mirror Migrant");
    expect(zone(game, ship)).toBe("phased-out");
    expect(zone(game, bears)).toBe("phased-out");
    expect(zone(game, other)).toBe("battlefield");
  });
});

describe("Spot, Felis catus", () => {
  it("makes Food for itself and other nontoken legendaries, and eats one to destroy an artifact", () => {
    const { game } = table();
    enter(game, "Spot, Felis catus");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    enter(game, "The Beacon of Kahless");
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    enter(game, "Grizzly Bears");
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    const spot = named(game, "Spot, Felis catus")[0];
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Plains", 4);
    activate(game, spot, 0, { targets: [ref(thopter)], sacrifice: named(game, "Food Token", A)[0] });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("seek out", () => {
  it("Ro Laren burns each opponent, Data makes two Faeries, Dr. Pulaski gains 4", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Ro Laren, Double Agent");
    spawn(game, "Data, Professor of Humanities");
    spawn(game, "Dr. Pulaski, Cynical Clinician");
    draw(game, 1);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(tokensNamed(game, "Faerie Token", A)).toBe(2);
    expect(life(game, A)).toBe(24);
  });

  it("Reg Barclay copies another creature as a hasty nonlegendary Illusion artifact until the end step", () => {
    const { game, a } = table();
    spawn(game, "Reg Barclay, Fidgety Fantasist");
    const pelia = spawn(game, "Pelia, Immortal Innovator");
    pickTargets(a, pelia);
    draw(game, 1);
    const copies = named(game, "Pelia, Immortal Innovator", A).filter((id) => game.state.objects[id].isToken);
    expect(copies).toHaveLength(1);
    const copy = copies[0];
    expect(types(game, copy)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, copy)).toContain("Illusion");
    expect(supertypes(game, copy)).not.toContain("legendary");
    expect(keywords(game, copy).has("haste")).toBe(true);
    toCleanup(game);
    expect(named(game, "Pelia, Immortal Innovator", A)).toEqual([pelia]);
  });
});

describe("Ro Laren and Commander William Riker", () => {
  it("Riker draws two for you and two for the opponent", () => {
    const { game } = table();
    const riker = spawn(game, "Commander William Riker");
    lands(game, "Plains", 1);
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    activate(game, riker, 0, { targets: [ref(B)] });
    expect(hand(game, A).length).toBe(mine + 2);
    expect(hand(game, B).length).toBe(theirs + 2);
  });
});

describe("Cryogenic Stasis", () => {
  it("taps, stuns and draws", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Cryogenic Stasis"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Benjamin Sisko, Besieged", () => {
  it("casts creature spells from the top of the library, and only those", () => {
    const { game } = table();
    spawn(game, "Benjamin Sisko, Besieged");
    lands(game, "Mountain", 3);
    const shock = toLibrary(game, "Shock");
    expect(() => cast(game, shock, { targets: [ref(B)], via: "library-top" })).toThrow();
    game.state.zones.perPlayer[A].library.splice(game.state.zones.perPlayer[A].library.indexOf(shock), 1);
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, bears, { via: "library-top" });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Temporal Tribulation", () => {
  it("needs two targets, and returns both at the next end step", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Island", 3);
    const card = toHand(game, "Temporal Tribulation");
    expect(() => cast(game, card, { targets: [ref(bears)] })).toThrow();
    cast(game, card, { targets: [ref(bears), ref(giant)] });
    expect([zone(game, bears), zone(game, giant)]).toEqual(["exile", "exile"]);
    toCleanup(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(named(game, "Hill Giant", A)).toHaveLength(1);
  });
});

describe("Merciful Mandate", () => {
  it("untaps your creatures and may end the combat phase", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.zones.shared.stack.length === 0);
    expect(game.state.objects[bears].tapped).toBe(true);
    pickModes(a, 0);
    cast(game, toHand(game, "Merciful Mandate"));
    // The combat phase ended with the spell: straight to the second main phase, no damage dealt.
    expect(game.state.turn.step).toBe("postcombat-main");
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(life(game, B)).toBe(20);
  });

  it("outside combat only untaps", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Merciful Mandate"));
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("S.S. Botany Bay", () => {
  it("exiles from graveyards and returns the creature cards you own on combat damage", () => {
    const { game, a } = table();
    const ship = spawn(game, "S.S. Botany Bay");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const mine = toGraveyard(game, "Hill Giant", A);
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === mine);
    activate(game, ship);
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("exile");
    toStep(game, "precombat-main");
    charge(game, ship, 8);
    attack(game, a, [ship]);
    expect(named(game, "Hill Giant", A)).toHaveLength(1);
    expect(zone(game, theirs)).toBe("exile");
  });
});

describe("Q, Your Illustrious Host", () => {
  it("taps three Faeries to cast the first nonland card exiled for free", () => {
    const { game, a } = table();
    const q = spawn(game, "Q, Your Illustrious Host");
    const faeries = [spawn(game, "Faerie Token"), spawn(game, "Faerie Token"), spawn(game, "Faerie Token")];
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bears);
      return way === undefined ? null : { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, free: true };
    };
    activate(game, q);
    expect(zone(game, bears)).toBe("battlefield");
    expect(faeries.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Gagh Slinger", () => {
  it("makes Klingon spells cheaper and pings on each other Klingon or Warrior", () => {
    const { game } = table();
    spawn(game, "Gagh Slinger");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Warship Flight Crew"));
    expect(named(game, "Warship Flight Crew", A)).toHaveLength(1);
    expect(life(game, B)).toBe(19);
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(19);
  });
});

describe("I.K.S. Negh'Var, Imperial Flagship", () => {
  it("gives Klingons and Warriors vigilance, and is a 6/6 flier at 10", () => {
    const { game } = table();
    const ship = spawn(game, "I.K.S. Negh'Var, Imperial Flagship");
    const klingon = spawn(game, "Warship Flight Crew");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, klingon).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    charge(game, ship, 10);
    expect(pt(game, ship)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, ship).has("flying")).toBe(true);
  });
});

describe("The Beacon of Kahless", () => {
  it("adds mana equal to the number of opponents you attacked this turn", () => {
    const { game, a } = table({ players: 3 });
    const beacon = spawn(game, "The Beacon of Kahless");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: one, defender: B },
      { attacker: two, defender: C },
    ];
    toStep(game, "postcombat-main");
    activate(game, beacon, 1);
    expect(game.state.players[A].manaPool).toHaveLength(2);
  });
});

describe("Jean-Luc, Mon Capitaine", () => {
  it("Faeries enter with a counter for each creature type among your non-Borg creatures", () => {
    const { game } = table();
    spawn(game, "Jean-Luc, Mon Capitaine");
    spawn(game, "Hill Giant");
    spawn(game, "Borg Token");
    game.debugApplyEffect(A, { kind: "create-token", token: "Faerie Token", count: 1 });
    settle(game);
    const faerie = named(game, "Faerie Token", A)[0];
    // Human, Officer, Giant — not Borg, nor the Faerie itself.
    expect(counters(game, faerie)).toBe(3);
  });
});

describe("Colossal Clone Master", () => {
  it("copies a creature, not legendary, its size the number of differently named lands", () => {
    const { game, a } = table();
    const pelia = spawn(game, "Pelia, Immortal Innovator", B);
    lands(game, "Island", 3);
    lands(game, "Forest", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    a.chooseCopyFn = () => pelia;
    const clone = toHand(game, "Colossal Clone Master");
    cast(game, clone);
    expect(zone(game, clone)).toBe("battlefield");
    expect(subtypes(game, clone)).toContain("Lanthanite");
    expect(supertypes(game, clone)).not.toContain("legendary");
    expect(pt(game, clone)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Kirk, Enterprising Captain", () => {
  it("exiles the top card only while your creatures' total power is 8 or more", () => {
    const { game, a } = table();
    const kirk = spawn(game, "Kirk, Enterprising Captain");
    attack(game, a, [kirk]);
    expect(game.state.zones.shared.exile).toHaveLength(0);
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main");
    attack(game, a, [kirk]);
    expect(game.state.zones.shared.exile).toHaveLength(1);
  });
});

describe("Lt. Arex, Ever-Adapting", () => {
  it("draws three, puts up to three lands down tapped, and counts differently named lands", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const before = hand(game).length;
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 3);
    const arex = enter(game, "Lt. Arex, Ever-Adapting");
    expect(hand(game).length).toBe(before + 3 - 3);
    expect(named(game, "Wastes", A).every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(named(game, "Wastes", A)).toHaveLength(3);
    expect(pt(game, arex)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kor, Cause of Vengeance", () => {
  it("sacrifices another creature as you attack to draw and pump Klingons and Warriors", () => {
    const { game, a } = table();
    const kor = spawn(game, "Kor, Cause of Vengeance");
    const bears = spawn(game, "Grizzly Bears");
    const klingon = spawn(game, "Warship Flight Crew");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    const before = hand(game).length;
    attack(game, a, [kor]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(pt(game, klingon)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, kor)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Glory to the Empire!", () => {
  it("makes a Klingon Warrior per opponent and gives your creatures melee", () => {
    const { game, a } = table({ players: 3 });
    enter(game, "Glory to the Empire!");
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(2);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: one, defender: B },
      { attacker: two, defender: C },
    ];
    toStep(game, "postcombat-main");
    expect(pt(game, one)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Amanda Grayson, Logic's Link", () => {
  it("costs {1} less for each Vulcan, and landfall puts two counters on a creature", () => {
    const { game, a } = table();
    spawn(game, "Kolinahr Priest");
    spawn(game, "Kolinahr Priest");
    lands(game, "Forest", 2);
    const amanda = toHand(game, "Amanda Grayson, Logic's Link");
    cast(game, amanda);
    expect(zone(game, amanda)).toBe("battlefield");
    pickTargets(a, amanda);
    enter(game, "Forest");
    expect(counters(game, amanda)).toBe(2);
  });
});

describe("The Promise of Kahless", () => {
  it("returns every other Klingon and Warrior creature card, not the one sacrificed", () => {
    const { game, a } = table();
    const sacrificed = spawn(game, "Defense Force Aggressor");
    toGraveyard(game, "Warship Flight Crew");
    toGraveyard(game, "Defense Force Aggressor");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [sacrificed];
    cast(game, toHand(game, "The Promise of Kahless"));
    expect(named(game, "Warship Flight Crew", A)).toHaveLength(1);
    expect(named(game, "Defense Force Aggressor", A)).toHaveLength(1);
    expect(named(game, "Defense Force Aggressor", A)).not.toContain(sacrificed);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Defense Force Aggressor")).toHaveLength(1);
  });

  it("returns nothing if you don't sacrifice", () => {
    const { game, a } = table();
    spawn(game, "Defense Force Aggressor");
    toGraveyard(game, "Warship Flight Crew");
    lands(game, "Swamp", 5);
    pickModes(a);
    cast(game, toHand(game, "The Promise of Kahless"));
    expect(named(game, "Warship Flight Crew", A)).toHaveLength(0);
  });
});

describe("Lieutenant Hikaru Sulu", () => {
  it("explores as he becomes tapped", () => {
    const { game, a } = table();
    const sulu = spawn(game, "Lieutenant Hikaru Sulu");
    toLibrary(game, "Grizzly Bears");
    attack(game, a, [sulu]);
    expect(counters(game, sulu)).toBe(1);
  });
});

describe("Curzon Dax, Bound by Blood", () => {
  it("pings when another Klingon or Warrior dies, and drops a cheap creature as he dies", () => {
    const { game, a } = table();
    const dax = spawn(game, "Curzon Dax, Bound by Blood");
    destroy(game, spawn(game, "Warship Flight Crew"));
    expect(life(game, B)).toBe(19);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(19);
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === bears);
    destroy(game, dax);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
  });
});

describe("Ferocious Colonist and Kruge, Genesis Seeker", () => {
  it("melee grows the Colonist; Kruge pumps attacking Klingons", () => {
    const { game, a } = table();
    const colonist = spawn(game, "Ferocious Colonist");
    const kruge = spawn(game, "Kruge, Genesis Seeker");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [colonist, kruge, bears]);
    // Colonist: 0/1 +1/+1 melee +1/+1 Kruge, double strike.
    expect(pt(game, colonist)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, kruge)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(life(game, B)).toBe(20 - 4 - 3 - 2);
  });
});

describe("Galvanizing Tenor", () => {
  it("goads up to as many creatures as opponents you attacked", () => {
    const { game, a } = table({ players: 3 });
    const tenor = spawn(game, "Galvanizing Tenor");
    const first = spawn(game, "Grizzly Bears", C);
    const second = spawn(game, "Hill Giant", C);
    // X is 1 (bob alone attacked) as the targets are chosen.
    pickTargets(a, first);
    attack(game, a, [tenor]);
    expect(game.state.objects[first].goadedBy ?? []).toContain(A);
    expect(game.state.objects[second].goadedBy ?? []).toHaveLength(0);
  });
});

describe("Badgey, Malicious Glitch", () => {
  it("drains each opponent as it becomes tapped", () => {
    const { game, a } = table();
    const badgey = spawn(game, "Badgey, Malicious Glitch");
    attack(game, a, [badgey]);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(20 - 1 - 4);
  });
});

describe("Scotty, Chief Engineer", () => {
  it("taps an untapped artifact to make a creature unblockable", () => {
    const { game } = table();
    const scotty = spawn(game, "Scotty, Chief Engineer");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, scotty, 0, { targets: [ref(bears)] });
    expect(game.state.objects[thopter].tapped).toBe(true);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });
});

describe("the plain bodies", () => {
  it("carry their keywords", () => {
    const { game } = table();
    expect(keywords(game, spawn(game, "Sickbay Orderly")).has("lifelink")).toBe(true);
    expect(keywords(game, spawn(game, "Gorn Captain")).has("trample")).toBe(true);
    expect(keywords(game, spawn(game, "Kolinahr Priest")).has("flash")).toBe(true);
    expect(pt(game, spawn(game, "Defense Force Aggressor"))).toEqual({ power: 2, toughness: 1 });
  });
});
