/**
 * Star Trek Commander (TRC), group A — the cards whose behaviour is more than
 * a stat line, one focused test each on the clause most likely to be wrong.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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

const charge = (game: Game, id: ObjectId, n: number): void => {
  game.debugApplyEffect(controller(game, id), { kind: "add-counter", target: 0, counter: "charge", amount: n }, [ref(id)]);
  settle(game);
};

const draw = (game: Game, n: number, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "draw", amount: n }, []);
  settle(game);
};

/** A real token (a spawned one isn't), created for `player`. */
const borgToken = (game: Game, player: PlayerId = A): ObjectId => {
  game.debugApplyEffect(player, { kind: "create-token", token: "Borg Token", count: 1 }, []);
  settle(game);
  return named(game, "Borg Token", player).at(-1)!;
};

/** The seat casts `wanted` when offered, free, with no targets; declines otherwise. */
function castWhenOffered(seat: ScriptedController, wanted: ObjectId): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    if (!offer.cards.includes(wanted)) return null;
    const way = offer.casts.find((c) => c.card === wanted)!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: wanted,
      targets: [],
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
  return seen;
}

/** Attack with each pair's creature at its defender, and run to postcombat main. */
function attackEach(game: Game, seat: ScriptedController, pairs: readonly (readonly [ObjectId, PlayerId])[]): void {
  seat.declareAttackersFn = () => pairs.map(([attacker, defender]) => ({ attacker, defender }));
  toStep(game, "postcombat-main", seat.playerId);
}

describe("Borg grants", () => {
  it("Locutus of Borg: artifact creatures you control make a Borg on combat damage to a player; others don't", () => {
    const { game, a } = table();
    const locutus = spawn(game, "Locutus of Borg");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [locutus, bears]);
    expect(tokensNamed(game, "Borg Token", A)).toBe(1);
    expect(life(game, A)).toBe(23);
  });

  it("Supplementation Node: an artifact creature that connects gets a +1/+1 counter; a nonartifact one doesn't", () => {
    const { game, a } = table();
    const node = spawn(game, "Supplementation Node");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [node, bears]);
    expect(counters(game, node)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });

  it("Jurati, Cordial Queen: artifact creatures connecting copy target artifact token you control", () => {
    const { game, a } = table();
    const jurati = spawn(game, "Jurati, Cordial Queen");
    const borg = borgToken(game);
    pickTargets(a, borg);
    attack(game, a, [jurati]);
    expect(tokensNamed(game, "Borg Token", A)).toBe(2);
  });

  it("Emergency Regeneration: only artifacts you control gain hexproof and indestructible", () => {
    const { game } = table();
    const locutus = spawn(game, "Locutus of Borg");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Supplementation Node", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Emergency Regeneration"));
    expect(keywords(game, locutus).has("indestructible")).toBe(true);
    expect(keywords(game, locutus).has("hexproof")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
  });

  it("Borg Incursion: two Borg tokens, then artifact creatures gain protection", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Borg Incursion"));
    expect(tokensNamed(game, "Borg Token", A)).toBe(2);
  });

  it("Reclamation Specialist: sacrifice an artifact creature to draw", () => {
    const { game } = table();
    const specialist = spawn(game, "Reclamation Specialist");
    const borg = borgToken(game);
    expect(tokensNamed(game, "Borg Token", A)).toBe(1);
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    activate(game, specialist, 0, { sacrifice: borg });
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Borg Token", A)).toBe(0);
  });

  it("Optimization Annex: one more charge counter on an artifact you control, not on a nonartifact", () => {
    const { game } = table();
    spawn(game, "Optimization Annex");
    const diamond = spawn(game, "Queen's Diamond");
    const bears = spawn(game, "Grizzly Bears");
    charge(game, diamond, 2);
    charge(game, bears, 2);
    expect(counters(game, diamond, "charge")).toBe(3);
    expect(counters(game, bears, "charge")).toBe(2);
  });
});

describe("Spacecraft", () => {
  it("Queen's Diamond: at 8+ a 5/5 flying, vigilance, haste creature", () => {
    const { game } = table();
    const diamond = spawn(game, "Queen's Diamond");
    charge(game, diamond, 7);
    expect(types(game, diamond)).not.toContain("creature");
    charge(game, diamond, 1);
    expect(types(game, diamond)).toContain("creature");
    expect(pt(game, diamond)).toEqual({ power: 5, toughness: 5 });
    const kw = keywords(game, diamond);
    expect(kw.has("flying") && kw.has("vigilance") && kw.has("haste")).toBe(true);
  });

  it("U.S.S. Prometheus: at 8+ combat damage to an opponent is dealt to each other opponent", () => {
    const { game, a } = table({ players: 3 });
    const ship = spawn(game, "U.S.S. Prometheus, Prototype");
    charge(game, ship, 8);
    attack(game, a, [ship], B);
    expect(life(game, B)).toBe(14);
    expect(life(game, C)).toBe(14);
    expect(life(game, A)).toBe(20);
  });

  it("U.S.S. Prometheus: at 4-7 it's a flier with no assault mode", () => {
    const { game, a } = table({ players: 3 });
    const ship = spawn(game, "U.S.S. Prometheus, Prototype");
    charge(game, ship, 4);
    expect(keywords(game, ship).has("flying")).toBe(true);
    attack(game, a, [ship], B);
    expect(life(game, B)).toBe(14);
    expect(life(game, C)).toBe(20);
  });

  it("Captain Kirk, Boldly Going: Spacecraft creatures you control get +3/+3", () => {
    const { game } = table();
    spawn(game, "Captain Kirk, Boldly Going");
    const diamond = spawn(game, "Queen's Diamond");
    charge(game, diamond, 8);
    expect(pt(game, diamond)).toEqual({ power: 8, toughness: 8 });
  });

  it("Captain Kirk, Boldly Going: entering searches the library for a basic land", () => {
    const { game, a } = table();
    const top = game.state.zones.perPlayer[A].library[0];
    pickModes(a, 1);
    pickFromZone(a, top);
    const before = hand(game).length;
    enter(game, "Captain Kirk, Boldly Going");
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, top)).toBe("hand");
  });

  it("K't'inga-Class Battle Cruiser: entering gives a target Klingon flying", () => {
    const { game, a } = table();
    const martok = spawn(game, "Martok, Hero of the Empire");
    pickTargets(a, martok, null);
    enter(game, "K't'inga-Class Battle Cruiser");
    expect(keywords(game, martok).has("flying")).toBe(true);
  });
});

describe("Seek out", () => {
  it("Rom and Leeta: the second draw makes two tapped Treasures, the third none", () => {
    const { game } = table();
    spawn(game, "Rom and Leeta, Unlikely Pair");
    // The table's turn 1 already had its draw-step draw: this is the second.
    draw(game, 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    draw(game, 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(named(game, "Treasure Token", A).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("Worf, Son of Mogh: the second draw makes an Officer, which gets +1/+1", () => {
    const { game } = table();
    const worf = spawn(game, "Worf, Son of Mogh");
    draw(game, 2);
    const [officer] = named(game, "Officer Token", A);
    expect(pt(game, officer)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, worf)).toEqual({ power: 3, toughness: 3 });
  });

  it("Beverly Crusher: the second draw puts a counter on each of up to three target creatures", () => {
    const { game, a } = table();
    spawn(game, "Beverly Crusher, Ship's Doctor");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    pickTargets(a, one, two);
    draw(game, 2);
    expect(counters(game, one)).toBe(1);
    expect(counters(game, two)).toBe(1);
  });

  it("Data, Exploring Humanity: the second draw discovers 4", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    spawn(game, "Data, Exploring Humanity");
    const before = hand(game).length;
    draw(game, 2);
    const found = named(game, "Grizzly Bears", A).length + (hand(game).length - before - 2);
    expect(found).toBe(1);
  });

  it("Troi, Winging It: an opponent drawing during your turn makes a Faerie; on their turn it doesn't", () => {
    const { game } = table();
    spawn(game, "Troi, Winging It");
    draw(game, 1, B);
    expect(tokensNamed(game, "Faerie Token", A)).toBe(1);
    toStep(game, "precombat-main", B);
    expect(tokensNamed(game, "Faerie Token", A)).toBe(1);
  });
});

describe("Battlefront", () => {
  it("Korok: creatures you control get +X/+X, X the opponents attacked", () => {
    const { game, a } = table({ players: 3 });
    const korok = spawn(game, "Korok, Liberated Rage");
    const bears = spawn(game, "Grizzly Bears");
    attackEach(game, a, [
      [korok, B],
      [bears, C],
    ]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Martok: a counter on each of up to X target creatures you control", () => {
    const { game, a } = table({ players: 3 });
    const martok = spawn(game, "Martok, Hero of the Empire");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, martok, bears);
    attackEach(game, a, [
      [martok, B],
      [bears, C],
    ]);
    expect(counters(game, martok)).toBe(1);
    expect(counters(game, bears)).toBe(1);
  });

  it("Rite of Ascension: a tapped and attacking Klingon Warrior for each opponent attacked", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Rite of Ascension");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    attackEach(game, a, [
      [one, B],
      [two, C],
    ]);
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(2);
    expect(life(game, B) + life(game, C)).toBe(40 - 4 - 4);
  });
});

describe("Commander Spock", () => {
  it("a land on top may go onto the battlefield tapped, and then nothing is drawn", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Commander Spock");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(hand(game).length).toBe(before);
  });

  it("a land declined is still on top, so it's drawn", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    pickModes(a);
    enter(game, "Commander Spock");
    expect(zone(game, forest)).toBe("hand");
  });

  it("a spell costing more than the differently named lands can't be cast, so it's drawn", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = castWhenOffered(a, bears);
    enter(game, "Commander Spock");
    expect(seen.offered.flat()).not.toContain(bears);
    expect(zone(game, bears)).toBe("hand");
  });

  it("a spell within the differently named lands may be cast free, and then nothing is drawn", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    castWhenOffered(a, bears);
    const before = hand(game).length;
    enter(game, "Commander Spock");
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });
});

describe("Officers", () => {
  it("Planet Killer: a +1/+1 counter for each land the damaged player controls", () => {
    const { game, a } = table();
    const killer = spawn(game, "Planet Killer");
    lands(game, "Wastes", 3, B);
    lands(game, "Wastes", 5, A);
    attack(game, a, [killer]);
    expect(counters(game, killer)).toBe(3);
  });

  it("Ensign Harry Kim: a counter only when the entering creature has greater power", () => {
    const { game } = table();
    const kim = spawn(game, "Ensign Harry Kim, Operations");
    enter(game, "Grizzly Bears");
    expect(counters(game, kim)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(counters(game, kim)).toBe(1);
  });

  it("Picard, Steadfast Captain: two counters on another target creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Picard, Steadfast Captain");
    expect(counters(game, bears)).toBe(2);
  });

  it("Captain Janeway: Officers connecting draw a card and make an Officer", () => {
    const { game, a } = table();
    const janeway = spawn(game, "Captain Janeway, Endgame");
    const before = hand(game).length;
    attack(game, a, [janeway]);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Officer Token", A)).toBe(1);
  });

  it("Captain Janeway: tapping another creature makes her unblockable this turn", () => {
    const { game, a } = table();
    const janeway = spawn(game, "Captain Janeway, Endgame");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    game.dispatch({ type: "activate-ability", player: A, source: janeway, abilityIndex: 0, targets: [], tap: [bears] });
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[janeway].tapped).toBe(false);
    spawn(game, "Grizzly Bears", B);
    expect(restrictionsOf(game.state, game.registry, janeway).has("cant-be-blocked")).toBe(true);
    // With no legal block, bob is never asked: combat runs straight to damage.
    a.declareAttackersFn = () => [{ attacker: janeway, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.turn.step === "postcombat-main");
    expect(game.state.turn.number).toBe(1);
    expect(game.state.turn.step).toBe("postcombat-main");
    expect(life(game, B)).toBe(17);
  });

  it("On the Shoulders of Giants: only historic creatures you control fly", () => {
    const { game } = table();
    spawn(game, "On the Shoulders of Giants");
    const gorkon = spawn(game, "Chancellor Gorkon");
    const borg = spawn(game, "Borg Token");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Chancellor Gorkon", B);
    expect(keywords(game, gorkon).has("flying")).toBe(true);
    expect(keywords(game, borg).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(keywords(game, theirs).has("flying")).toBe(false);
  });

  it("M'Ress: landfall makes two Officers", () => {
    const { game } = table();
    spawn(game, "M'Ress, Crew Coordinator");
    enter(game, "Forest");
    expect(tokensNamed(game, "Officer Token", A)).toBe(2);
  });

  it("Lieutenant Nyota Uhura: exiles X of an opponent's library, casts an instant or sorcery free, bottoms the rest", () => {
    const { game, a } = table();
    const uhura = spawn(game, "Lieutenant Nyota Uhura");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const divination = toLibrary(game, "Divination", B);
    const seen = castWhenOffered(a, divination);
    const before = hand(game).length;
    activate(game, uhura, 0, { targets: [ref(B)] });
    expect(seen.offered[0]).toContain(divination);
    expect(seen.offered[0]).not.toContain(bears);
    expect(hand(game).length).toBe(before + 2);
    const library = game.state.zones.perPlayer[B].library;
    expect(library.slice(-3)).toContain(bears);
    // 33 after bob's opening seven, two put on top, Divination cast from exile.
    expect(library.length).toBe(40 - 7 + 2 - 1);
  });
});

describe("Klingons", () => {
  it("The Sword of Kahless: equipped creature gets +2/+2 and puts a Klingon or Warrior from the top five onto the battlefield", () => {
    const { game, a } = table();
    const sword = spawn(game, "The Sword of Kahless");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, sword, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const berserker = toLibrary(game, "Mek'leth Berserker");
    pickFromZone(a, berserker);
    attack(game, a, [bears]);
    expect(zone(game, berserker)).toBe("battlefield");
  });

  it("Grilka: steals, untaps and hastes a creature, which makes tapped Treasures on combat damage", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, bears);
    enter(game, "Grilka, Widowed Warrior");
    expect(controller(game, bears)).toBe(A);
    expect(keywords(game, bears).has("trample")).toBe(true);
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("Indelicate Healer: another Klingon entering gives creatures you control lifelink", () => {
    const { game } = table();
    spawn(game, "Indelicate Healer");
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Grizzly Bears");
    expect(keywords(game, bears).has("lifelink")).toBe(false);
    enter(game, "Martok, Hero of the Empire");
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });

  it("Kang: goads itself and the target; goaded attackers put a counter on target creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const kang = enter(game, "Kang, Suspicious Captain");
    pickTargets(a, kang);
    attack(game, a, [kang]);
    expect(counters(game, kang)).toBe(1);
  });

  it("Kang: an attack with no goaded creature puts no counter", () => {
    const { game, a } = table();
    const kang = spawn(game, "Kang, Suspicious Captain");
    pickTargets(a, kang);
    attack(game, a, [kang]);
    expect(counters(game, kang)).toBe(0);
  });

  it("Voq, Torchbearer: enters as a copy of a graveyard creature card, a Klingon Spy with menace", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    lands(game, "Swamp", 4);
    const voq = toHand(game, "Voq, Torchbearer");
    cast(game, voq);
    expect(pt(game, voq)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, voq)).toEqual(expect.arrayContaining(["Bear", "Klingon", "Spy"]));
    expect(keywords(game, voq).has("menace")).toBe(true);
    expect(supertypes(game, voq)).not.toContain("legendary");
  });

  it("Right of Vengeance: a creature that deals you combat damage this turn is destroyed and you get a Klingon Warrior", () => {
    const { game, b } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    game.advanceUntil((s) => s.priority.holder === A);
    cast(game, toHand(game, "Right of Vengeance"));
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(1);
  });

  it("Sins of the Father: chapters II and III — a Klingon per opponent, then life lost per creature card exiled", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Sins of the Father");
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(1);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Forest", B);
    pickTargets(a, B);
    const lifeBefore = life(game, B);
    toStep(game, "precombat-main");
    settle(game);
    // Two creature cards exiled: the sacrificed Bears and the new one.
    expect(life(game, B)).toBe(lifeBefore - 2);
    expect(game.state.zones.perPlayer[B].graveyard.length).toBe(0);
  });

  it("Balance of Terror: chapter I destroys up to one other artifact or enchantment", () => {
    const { game, a } = table();
    const pistol = spawn(game, "Disruptor Pistol", B);
    pickTargets(a, pistol);
    enter(game, "Balance of Terror");
    expect(zone(game, pistol)).toBe("graveyard");
  });

  it("Chancellor Gorkon: dying exiles up to two target creatures", () => {
    const { game, a } = table();
    const gorkon = spawn(game, "Chancellor Gorkon");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    pickTargets(a, one, two);
    destroy(game, gorkon);
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
  });

  it("Blood-Sport Champion: kicked, other creatures you control gain deathtouch", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Blood-Sport Champion"), { kicked: true });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });

  it("Chief Kyle: landfall flickers another creature you control at the next end step", () => {
    const { game, a } = table();
    spawn(game, "Chief Kyle, Transporter Tech");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Forest");
    expect(named(game, "Grizzly Bears", A).length).toBe(0);
    toStep(game, "precombat-main", B);
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
  });

  it("Imperial Hullbreachers: battle cry pumps each other attacker", () => {
    const { game, a } = table();
    const hull = spawn(game, "Imperial Hullbreachers");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [hull, bears]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, hull)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Others", () => {
  it("Shore Leave Planet: becomes a nonlegendary Robot artifact copy of your creature until end of turn", () => {
    const { game } = table();
    const planet = spawn(game, "Shore Leave Planet");
    const gorkon = spawn(game, "Chancellor Gorkon");
    lands(game, "Island", 5);
    activate(game, planet, 1, { targets: [ref(gorkon)] });
    expect(types(game, planet)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(types(game, planet)).not.toContain("land");
    expect(subtypes(game, planet)).toEqual(expect.arrayContaining(["Robot", "Klingon"]));
    expect(supertypes(game, planet)).not.toContain("legendary");
    expect(pt(game, planet)).toEqual({ power: 5, toughness: 3 });
    toStep(game, "precombat-main", B);
    expect(types(game, planet)).toContain("land");
  });

  it("Tribble Cluster: grows at combat, and dies into Tribbles equal to its power", () => {
    const { game } = table();
    const cluster = spawn(game, "Tribble Cluster");
    toStep(game, "postcombat-main");
    expect(counters(game, cluster)).toBe(1);
    destroy(game, cluster);
    expect(tokensNamed(game, "Tribble Token", A)).toBe(2);
  });

  it("Giant Space Amoeba: attacking shrinks a defender's creature, then copies itself", () => {
    const { game, a } = table();
    const amoeba = spawn(game, "Giant Space Amoeba");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [amoeba]);
    expect(pt(game, bears).power).toBe(-1);
    expect(named(game, "Giant Space Amoeba", A).length).toBe(2);
  });

  it("Operations Officer and Tenacious Tosk: enters to draw; attacks and connects for counters", () => {
    const { game, a } = table();
    const before = hand(game).length;
    const officer = enter(game, "Operations Officer");
    expect(hand(game).length).toBe(before + 1);
    const tosk = spawn(game, "Tenacious Tosk");
    attack(game, a, [officer, tosk]);
    expect(counters(game, officer)).toBe(1);
    expect(counters(game, tosk)).toBe(1);
  });

  it("Will Riker: a counter on another target creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Will Riker, Assuming Command");
    expect(counters(game, bears)).toBe(1);
  });

  it("the plain bodies are what they print", () => {
    const { game } = table();
    const bodies: readonly [string, number, number, string?][] = [
      ["Starfleet Crew", 2, 3],
      ["Talarian Hook Spider", 2, 2, "reach"],
      ["Mek'leth Berserker", 4, 3, "menace"],
      ["Trelane, Squire of Gothos", 4, 5, "unblockable"],
      ["La Forge, Perceptive Engineer", 1, 4, "vigilance"],
    ];
    for (const [name, power, toughness, keyword] of bodies) {
      const id = spawn(game, name);
      expect(pt(game, id)).toEqual({ power, toughness });
      if (keyword !== undefined) expect(keywords(game, id).has(keyword)).toBe(true);
    }
  });
});
