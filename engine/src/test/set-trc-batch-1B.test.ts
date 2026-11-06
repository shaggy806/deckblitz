/**
 * Star Trek Commander (TRC) — group B of the first batch: the Borg artifact
 * creatures' granted abilities, Spacecraft stations, seek out, battlefront and
 * the set's counts, choices and copies.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

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
  types,
  watchTargets,
  zone,
} from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string[] =>
  game.state.players[player].manaPool.map((unit) => unit.type).sort();
const draw = (game: Game, n = 1): void => {
  game.debugApplyEffect(A, { kind: "draw", amount: n }, []);
  settle(game);
};
const toAttackersPriority = (game: Game, player: PlayerId): void =>
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === player);

describe("Type-03 Borg Vessel", () => {
  it("makes artifact spells cost {1} less; at 7+ a flying creature that makes a Borg for each spell cast", () => {
    const { game } = table();
    const vessel = spawn(game, "Type-03 Borg Vessel");
    cast(game, toHand(game, "Sol Ring"));
    expect(named(game, "Sol Ring", A)).toHaveLength(1);
    // The cast trigger is part of the 7+ station ability (rule 721.2).
    expect(tokensNamed(game, "Borg Token", A)).toBe(0);
    expect(types(game, vessel)).not.toContain("creature");
    game.state.objects[vessel].counters.charge = 7;
    expect(types(game, vessel)).toContain("creature");
    expect(keywords(game, vessel).has("flying")).toBe(true);
    cast(game, toHand(game, "Sol Ring"));
    expect(tokensNamed(game, "Borg Token", A)).toBe(1);
  });
});

describe("Co-Option Adjutant", () => {
  it("gives an artifact creature you control a draw on combat damage", () => {
    const { game, a } = table();
    const adjutant = spawn(game, "Co-Option Adjutant");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [adjutant, bears]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Ambulatory Reactor", () => {
  it("lets artifact creatures tap for mana that pays for an artifact spell", () => {
    const { game } = table();
    spawn(game, "Ambulatory Reactor");
    cast(game, toHand(game, "Sol Ring"));
    expect(named(game, "Sol Ring", A)).toHaveLength(1);
  });
});

describe("Bio-Asset Allocator", () => {
  it("drains 1 for each artifact creature you attack with, and not for others", () => {
    const { game, a } = table();
    const allocator = spawn(game, "Bio-Asset Allocator");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [allocator, bears]);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(20 - 1 - 3 - 2);
  });
});

describe("Collective Override", () => {
  it("draws a card for each attacking creature, and allows only one mode without a commander", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    a.declareAttackersFn = () => [giant, bears].map((attacker) => ({ attacker, defender: B }));
    toAttackersPriority(game, A);
    const card = toHand(game, "Collective Override");
    expect(() => cast(game, card, { modes: [0, 1] })).toThrow();
    const before = hand(game).length;
    cast(game, card, { modes: [1] });
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(tokensNamed(game, "Borg Token", A)).toBe(0);
  });

  it("may choose both with a commander", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].isCommander = true;
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toAttackersPriority(game, A);
    const card = toHand(game, "Collective Override");
    const before = hand(game).length;
    cast(game, card, { modes: [0, 1] });
    expect(tokensNamed(game, "Borg Token", A)).toBe(1);
    expect(hand(game).length).toBe(before - 1 + 1);
  });
});

describe("Maturation Chamber", () => {
  it("charges on artifact spells and makes a Borg per charge counter", () => {
    const { game } = table();
    const chamber = spawn(game, "Maturation Chamber");
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Sol Ring"));
    expect(counters(game, chamber, "charge")).toBe(1);
    game.state.objects[chamber].counters.charge = 3;
    lands(game, "Wastes", 4);
    activate(game, chamber, 0);
    expect(tokensNamed(game, "Borg Token", A)).toBe(3);
  });
});

describe("Reconnaissance Partition", () => {
  it("enters with two charge counters and spends one to draw", () => {
    const { game } = table();
    const partition = enter(game, "Reconnaissance Partition");
    expect(counters(game, partition, "charge")).toBe(2);
    const before = hand(game).length;
    activate(game, partition, 0, { modes: [1] });
    expect(counters(game, partition, "charge")).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("U.S.S. Defiant, Tough Little Ship", () => {
  it("destroys up to one artifact as it enters, and flies with hexproof at 5+", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    const defiant = enter(game, "U.S.S. Defiant, Tough Little Ship");
    expect(zone(game, ring)).toBe("graveyard");
    game.state.objects[defiant].counters.charge = 5;
    expect(pt(game, defiant)).toEqual({ power: 7, toughness: 4 });
    expect(keywords(game, defiant).has("hexproof")).toBe(true);
  });
});

describe("Transwarp Hub", () => {
  it("mills five and puts up to two of the milled artifacts into hand; at 3+ it makes a creature unblockable", () => {
    const { game, a } = table();
    const ring = toLibrary(game, "Sol Ring");
    const stone = toLibrary(game, "Mind Stone");
    const old = toGraveyard(game, "Ornithopter");
    const seen = pickFromZone(a, ring, stone);
    const hub = enter(game, "Transwarp Hub");
    expect(seen.offered).not.toContain(old);
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, stone)).toBe("hand");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[hub].counters.charge = 3;
    activate(game, hub, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });
});

describe("Stratagem Emulator", () => {
  it("makes as many Borgs as its power when it dies", () => {
    const { game } = table();
    const emulator = spawn(game, "Stratagem Emulator");
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" }, [
      ref(emulator),
    ]);
    settle(game);
    destroy(game, emulator);
    expect(tokensNamed(game, "Borg Token", A)).toBe(3);
  });
});

describe("Starfleet Communicator", () => {
  it("copies itself, and draws X for the other creatures with a Communicator", () => {
    const { game, a } = table();
    lands(game, "Wastes", 5);
    cast(game, toHand(game, "Starfleet Communicator"));
    const [first, second] = named(game, "Starfleet Communicator", A);
    expect(second).toBeDefined();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, first, 0, { targets: [ref(giant)] });
    activate(game, second, 0, { targets: [ref(bears)] });
    const landCard = toHand(game, "Forest");
    pickFromZone(a, landCard);
    const before = hand(game).length;
    attack(game, a, [giant]);
    expect(hand(game).length).toBe(before + 1 - 1);
    expect(zone(game, landCard)).toBe("battlefield");
    expect(game.state.objects[landCard].tapped).toBe(true);
  });

  it("draws nothing when no other creature has a Communicator", () => {
    const { game, a } = table();
    lands(game, "Wastes", 5);
    cast(game, toHand(game, "Starfleet Communicator"));
    const [first, second] = named(game, "Starfleet Communicator", A);
    const giant = spawn(game, "Hill Giant");
    activate(game, first, 0, { targets: [ref(giant)] });
    activate(game, second, 0, { targets: [ref(giant)] });
    const before = hand(game).length;
    attack(game, a, [giant]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Shuttlecraft Galileo", () => {
  it("makes an Officer on landfall", () => {
    const { game } = table();
    spawn(game, "Shuttlecraft Galileo");
    enter(game, "Forest");
    expect(tokensNamed(game, "Officer Token", A)).toBe(1);
  });

  it("at 6+, its attack gives attacking creatures flying (part of the 6+ ability, rule 721.2)", () => {
    const { game, a } = table();
    const galileo = spawn(game, "Shuttlecraft Galileo");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[galileo].counters.charge = 6;
    const seen = watchTargets(a, (offered) => offered.map((slot) => (slot.includes(bears) ? bears : null)));
    attack(game, a, [galileo, bears]);
    expect(seen.asked).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Koloth, Tribble Hunter", () => {
  it("gives each player two Tribbles at your end step, each +1/+0", () => {
    const { game } = table();
    spawn(game, "Koloth, Tribble Hunter");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Tribble Token", A)).toBe(2);
    expect(tokensNamed(game, "Tribble Token", B)).toBe(2);
    expect(pt(game, named(game, "Tribble Token", B)[0])).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Command Chair", () => {
  it("enters tapped, and taps for mana equal to your commander's mana value", () => {
    const { game } = table();
    const entered = enter(game, "Command Chair");
    expect(game.state.objects[entered].tapped).toBe(true);
    const chair = spawn(game, "Command Chair");
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(chair)]);
    settle(game);
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].isCommander = true;
    activate(game, chair, 1);
    expect(pool(game)).toHaveLength(4);
    expect(new Set(pool(game)).size).toBe(1);
  });
});

describe("K'Vort-Class Raider", () => {
  it("gives your creatures hexproof only during your turn", () => {
    const { game } = table();
    spawn(game, "K'Vort-Class Raider");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(keywords(game, theirs).has("hexproof")).toBe(false);
    toStep(game, "upkeep", B);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
  });
});

describe("Julian Bashir, Frontier Doctor", () => {
  it("returns only a creature card with mana value up to his power", () => {
    const { game, a } = table();
    const julian = spawn(game, "Julian Bashir, Frontier Doctor");
    const bears = toGraveyard(game, "Grizzly Bears");
    const lions = toGraveyard(game, "Savannah Lions");
    pickTargets(a, lions);
    attack(game, a, [julian]);
    expect(zone(game, lions)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't return a creature card costing more than his power", () => {
    const { game, a } = table();
    const julian = spawn(game, "Julian Bashir, Frontier Doctor");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a);
    attack(game, a, [julian]);
    expect(seen.offered[0] ?? []).not.toContain(bears);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("grows on your second draw each turn", () => {
    const { game } = table();
    const julian = spawn(game, "Julian Bashir, Frontier Doctor");
    draw(game);
    expect(counters(game, julian)).toBe(1);
  });
});

describe("Christine Chapel, Combat Medic", () => {
  it("gains life for each differently named land, then grows from the life gained", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    const christine = enter(game, "Christine Chapel, Combat Medic");
    expect(life(game, A)).toBe(22);
    expect(counters(game, christine)).toBe(2);
  });
});

describe("Geordi La Forge, Innovator", () => {
  it("can't be blocked only while you control a Spacecraft", () => {
    const { game } = table();
    const geordi = spawn(game, "Geordi La Forge, Innovator");
    expect(keywords(game, geordi).has("unblockable")).toBe(false);
    spawn(game, "Transwarp Hub");
    expect(keywords(game, geordi).has("unblockable")).toBe(true);
  });
});

describe("Tom Paris, Risk-Taker", () => {
  it("gives your creatures flying, double strike, vigilance and haste on your second draw", () => {
    const { game } = table();
    spawn(game, "Tom Paris, Risk-Taker");
    const bears = spawn(game, "Grizzly Bears");
    draw(game);
    for (const k of ["flying", "double-strike", "vigilance", "haste"]) expect(keywords(game, bears).has(k)).toBe(true);
  });
});

describe("Ambassador K'Ehleyr", () => {
  it("counts the nonland cards revealed at the beginning of combat, and each player draws", () => {
    const { game } = table();
    const amb = spawn(game, "Ambassador K'Ehleyr");
    toLibrary(game, "Grizzly Bears", A);
    toLibrary(game, "Wastes", B);
    const [mine, theirs] = [hand(game, A).length, hand(game, B).length];
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, amb)).toBe(1);
    expect(hand(game, A).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirs + 1);
  });
});

describe("Jefferies Tube", () => {
  it("draws and may put a land from hand onto the battlefield tapped", () => {
    const { game, a } = table();
    const tube = spawn(game, "Jefferies Tube");
    lands(game, "Wastes", 4);
    const forest = toHand(game, "Forest");
    pickFromZone(a, forest);
    const before = hand(game).length;
    activate(game, tube, 2);
    expect(hand(game).length).toBe(before + 1 - 1);
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Kurn, Son of Mogh", () => {
  it("draws and loses life for each opponent attacked", () => {
    const { game, a } = table({ players: 3 });
    const kurn = spawn(game, "Kurn, Son of Mogh");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    a.declareAttackersFn = () => [
      { attacker: kurn, defender: B },
      { attacker: bears, defender: C },
    ];
    toStep(game, "postcombat-main");
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, A)).toBe(18);
  });
});

describe("Janice Rand, Essential Aide", () => {
  it("puts a counter on your attacking commander and finds a land", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    spawn(game, "Janice Rand, Essential Aide");
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].isCommander = true;
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    attack(game, a, [giant]);
    expect(counters(game, giant)).toBe(1);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Worf, Defiant Commander", () => {
  it("makes a Klingon Warrior and exiles one card per opponent attacked", () => {
    const { game, a } = table();
    const worf = enter(game, "Worf, Defiant Commander");
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(1);
    const top = toLibrary(game, "Grizzly Bears");
    attack(game, a, [worf]);
    expect(zone(game, top)).toBe("exile");
  });
});

describe("Unification", () => {
  it("chapter I: the creature's owner draws two, then shuffles it into their library", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    pickTargets(a, theirs);
    enter(game, "Unification");
    expect(hand(game, B).length).toBe(before + 2);
    expect(zone(game, theirs)).toBe("library");
  });
});

describe("Worf, Still Not Merry", () => {
  it("makes an attacking Faerie for each attacking non-Faerie creature", () => {
    const { game, a } = table();
    const worf = spawn(game, "Worf, Still Not Merry");
    const bears = spawn(game, "Grizzly Bears");
    const faerie = spawn(game, "Spellstutter Sprite");
    a.declareAttackersFn = () => [worf, bears, faerie].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Faerie Token", A)).toBe(2);
    expect(life(game, B)).toBe(20 - 5 - 2 - 1 - 2);
  });
});

describe("Own the Day", () => {
  it("costs {1} less for the opponent attacked and untaps the attackers", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(game.state.objects[bears].tapped).toBe(true);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Own the Day"));
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Fleet Captain Christopher Pike", () => {
  it("Yes untaps two other creatures; No taps two", () => {
    const { game } = table();
    const pike = spawn(game, "Fleet Captain Christopher Pike");
    const x = spawn(game, "Grizzly Bears", A, { tapped: true });
    const y = spawn(game, "Hill Giant", A, { tapped: true });
    lands(game, "Island", 1);
    activate(game, pike, 0, { targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].tapped).toBe(false);
    expect(game.state.objects[y].tapped).toBe(false);
  });
});

describe("Tuvok, Chief Tactical Officer", () => {
  it("entering during declare attackers, reselects what a target attacker attacks", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Island", 3);
    const tuvok = toHand(game, "Tuvok, Chief Tactical Officer");
    toAttackersPriority(game, A);
    a.chooseAttackTargetsFn = (_view, creatures) => creatures.map((c) => ({ object: c.object, target: C }));
    pickTargets(a, giant, null);
    cast(game, tuvok);
    expect(game.state.objects[giant].attacking).toBe(C);
  });
});

describe("Vic Fontaine, One Night Only", () => {
  it("gives two creatures +2/+0 and lifelink on your second draw", () => {
    const { game, a } = table();
    spawn(game, "Vic Fontaine, One Night Only");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Hill Giant");
    pickTargets(a, x, y);
    draw(game);
    expect(pt(game, x).power).toBe(4);
    expect(pt(game, y).power).toBe(5);
    expect(keywords(game, y).has("lifelink")).toBe(true);
  });
});

describe("McCoy, Not a Bricklayer", () => {
  it("counters each creature as a Doctor enters, and those with counters have lifelink", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const mccoy = enter(game, "McCoy, Not a Bricklayer");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, mccoy)).toBe(1);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    const giant = spawn(game, "Hill Giant");
    expect(keywords(game, giant).has("lifelink")).toBe(false);
    enter(game, "Julian Bashir, Frontier Doctor");
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Alexander, Ship's Fool", () => {
  it("deals the greatest revealed mana value to an opponent after everyone draws", () => {
    const { game } = table();
    const alexander = spawn(game, "Alexander, Ship's Fool");
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Grizzly Bears", B);
    const [mine, theirs] = [hand(game, A).length, hand(game, B).length];
    activate(game, alexander, 0);
    expect(hand(game, A).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirs + 1);
    expect(life(game, B)).toBe(16);
  });
});

describe("Kes, Evolving Telepath", () => {
  it("draws one per time counter and is sacrificed at nine", () => {
    const { game } = table();
    const kes = spawn(game, "Kes, Evolving Telepath");
    game.state.objects[kes].counters.time = 8;
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 9);
    expect(zone(game, kes)).toBe("graveyard");
  });
});

describe("Kirk, Man of Action", () => {
  it("pumps your other Officers and the like, not other creatures", () => {
    const { game } = table();
    const kirk = spawn(game, "Kirk, Man of Action");
    const crew = spawn(game, "Shuttle Crew");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, crew)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, kirk)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("B'Elanna Torres, Scrapper", () => {
  it("draws on a revealed artifact", () => {
    const { game, a } = table();
    const belanna = spawn(game, "B'Elanna Torres, Scrapper");
    lands(game, "Wastes", 2);
    toLibrary(game, "Sol Ring");
    pickModes(a, 0);
    const before = hand(game).length;
    activate(game, belanna, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, belanna)).toBe(0);
  });

  it("gets two counters when it doesn't reveal", () => {
    const { game, a } = table();
    const belanna = spawn(game, "B'Elanna Torres, Scrapper");
    lands(game, "Wastes", 2);
    toLibrary(game, "Sol Ring");
    pickModes(a);
    const before = hand(game).length;
    activate(game, belanna, 0);
    expect(hand(game).length).toBe(before);
    expect(counters(game, belanna)).toBe(2);
  });
});

describe("Gnarling Targ", () => {
  it("pumps your Klingons and Warriors when you attack", () => {
    const { game, a } = table();
    spawn(game, "Gnarling Targ");
    const klingon = spawn(game, "Qo'noS Quartermaster");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, klingon).power).toBe(4);
    expect(keywords(game, klingon).has("trample")).toBe(true);
    expect(pt(game, bears).power).toBe(2);
  });
});

describe("Uhura, Xenolinguist", () => {
  it("pays {1} to draw when an opponent's non-Human creature enters", () => {
    const { game, a } = table();
    spawn(game, "Uhura, Xenolinguist");
    lands(game, "Island", 1);
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Grizzly Bears", B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Spock, Voice of Reason", () => {
  it("draws for each nontoken permanent you control that entered this turn", () => {
    const { game } = table();
    const spock = spawn(game, "Spock, Voice of Reason");
    lands(game, "Island", 2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Borg Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Borg Token", A)).toBe(1);
    const before = hand(game).length;
    activate(game, spock, 0);
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("T'Pol, Vulcan Representative", () => {
  it("taps an opponent's creature and puts two stun counters on it", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    enter(game, "T'Pol, Vulcan Representative");
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(2);
  });
});

describe("Ceti Eel", () => {
  it("mills two and counts artifact and creature cards in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Sol Ring");
    toLibrary(game, "Grizzly Bears");
    const eel = enter(game, "Ceti Eel");
    expect(counters(game, eel)).toBe(2);
  });
});

describe("Chekov and McCoy", () => {
  it("draws that many on your first +1/+1 counters each turn only", () => {
    const { game, a } = table();
    const cm = spawn(game, "Chekov and McCoy");
    pickModes(a, 0);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(cm)]);
    settle(game);
    expect(hand(game).length).toBe(before + 2);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(cm)]);
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Smoke: the rest", () => {
  it("vanilla bodies, Gin'tak Charge, Shuttle Crew, Sam Kirk and Klingon Strike Force", () => {
    const { game, a } = table();
    expect(keywords(game, spawn(game, "Head of Security")).has("first-strike")).toBe(true);
    expect(keywords(game, spawn(game, "Exocomp")).has("flying")).toBe(true);
    expect(keywords(game, spawn(game, "Gumato")).has("vigilance")).toBe(true);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Gin'tak Charge"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    pickTargets(a, tapped);
    enter(game, "Shuttle Crew");
    expect(zone(game, tapped)).toBe("graveyard");
    spawn(game, "Sam Kirk, Xenoanthropologist");
    const force = spawn(game, "Klingon Strike Force");
    destroy(game, force);
    expect(life(game, B)).toBe(16);
  });
});
