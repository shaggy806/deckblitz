/**
 * The set walk, batch 67, part d (2026-10-12): Aetherdrift's speed cards —
 * start your engines! and max speed (rules 702.178–702.179), built for them.
 * Written on the shared table in `harness.ts`; the mechanic itself is
 * `speed.test.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

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
  nextTurn,
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

/** Give `player` speed `n` the way an effect would (rule 702.179c). */
const setSpeed = (game: Game, n: number, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "increase-speed", amount: n - (game.state.players[player].speed ?? 0) });
const canActivate = (game: Game, source: ObjectId, index = 0, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);
const sacrificeChoices = (game: Game, source: ObjectId, index = 0): readonly ObjectId[] => {
  const offer = game
    .legalActions(A)
    .find((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);
  return offer?.kind === "activate-ability" ? (offer.sacrifice?.choices ?? []) : [];
};
const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);
const libraryOf = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const pool = (game: Game, player: PlayerId = A): number => game.state.players[player].manaPool.length;

describe("the Raceways", () => {
  it("Amonkhet Raceway gives haste only at max speed", () => {
    const { game } = table();
    const raceway = spawn(game, "Amonkhet Raceway");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    expect(canActivate(game, raceway, 1)).toBe(false);
    setSpeed(game, 4);
    expect(canActivate(game, raceway, 1)).toBe(true);
    activate(game, raceway, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("Avishkar Raceway loots for {3} at max speed", () => {
    const { game, a } = table();
    const raceway = spawn(game, "Avishkar Raceway");
    lands(game, "Wastes", 3);
    const junk = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [junk];
    setSpeed(game, 3);
    expect(canActivate(game, raceway, 1)).toBe(false);
    setSpeed(game, 4);
    const before = hand(game).length;
    activate(game, raceway, 1);
    expect(zone(game, junk)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });
});

describe("max speed keywords and bonuses", () => {
  it("Burnout Bashtronaut has double strike, Gastal Thrillseeker deathtouch and haste, Swiftwing Assailant +0/+1 and vigilance, Nesting Bot +1/+0", () => {
    const { game } = table();
    const bashtronaut = spawn(game, "Burnout Bashtronaut");
    const thrillseeker = spawn(game, "Gastal Thrillseeker");
    const swiftwing = spawn(game, "Swiftwing Assailant");
    const bot = spawn(game, "Nesting Bot");
    expect(keywords(game, bashtronaut).has("double-strike")).toBe(false);
    expect(keywords(game, thrillseeker).has("deathtouch")).toBe(false);
    setSpeed(game, 4);
    expect(keywords(game, bashtronaut).has("double-strike")).toBe(true);
    expect(keywords(game, bashtronaut).has("menace")).toBe(true);
    expect(keywords(game, thrillseeker).has("deathtouch")).toBe(true);
    expect(keywords(game, thrillseeker).has("haste")).toBe(true);
    expect(pt(game, swiftwing)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, swiftwing).has("vigilance")).toBe(true);
    expect(pt(game, bot)).toEqual({ power: 2, toughness: 1 });
  });

  it("Gastal Thrillseeker's entry deals 1 to an opponent and gains 1", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Gastal Thrillseeker");
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(21);
  });

  it("Nesting Bot leaves a Servo", () => {
    const { game } = table();
    const bot = spawn(game, "Nesting Bot");
    destroy(game, bot);
    expect(tokensNamed(game, "Servo Token")).toBe(1);
  });
});

describe("Aether Syphon", () => {
  it("draws for {2}, and at max speed each draw mills each opponent two", () => {
    const { game } = table();
    const syphon = spawn(game, "Aether Syphon");
    lands(game, "Wastes", 4);
    const before = libraryOf(game, B).length;
    activate(game, syphon);
    expect(libraryOf(game, B).length).toBe(before);
    setSpeed(game, 4);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(libraryOf(game, B).length).toBe(before - 4);
  });
});

describe("Embalmed Ascendant", () => {
  it("makes a Zombie, and at max speed drains for each creature of yours that dies — itself too", () => {
    const { game } = table();
    const ascendant = enter(game, "Embalmed Ascendant");
    expect(tokensNamed(game, "Zombie Token")).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(life(game, B)).toBe(20);
    setSpeed(game, 4);
    destroy(game, named(game, "Zombie Token")[0]);
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(21);
    destroy(game, ascendant);
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(22);
  });
});

describe("Endrider Catalyzer and Endrider Spikespitter", () => {
  it("the Catalyzer taps for {R}{R} at max speed", () => {
    const { game } = table();
    const catalyzer = spawn(game, "Endrider Catalyzer");
    expect(canActivate(game, catalyzer)).toBe(false);
    setSpeed(game, 4);
    activate(game, catalyzer);
    expect(pool(game)).toBe(2);
  });

  it("the Spikespitter exiles the top card each upkeep at max speed, playable that turn", () => {
    const { game } = table();
    spawn(game, "Endrider Spikespitter");
    setSpeed(game, 4);
    const top = toLibrary(game, "Mountain");
    nextTurn(game); // bob's
    expect(zone(game, top)).toBe("library");
    nextTurn(game); // alice's
    expect(zone(game, top)).toBe("exile");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === top)).toBe(true);
  });
});

describe("Far Fortune, End Boss", () => {
  it("pings each opponent as you attack, and at max speed adds 1 to your sources' damage to them", () => {
    const { game, a } = table({ players: 3 });
    const fortune = spawn(game, "Far Fortune, End Boss");
    attack(game, a, [fortune]);
    expect(life(game, B)).toBe(20 - 1 - 4);
    expect(life(game, C)).toBe(19);
    const { game: g2, a: a2 } = table({ players: 3 });
    const f2 = spawn(g2, "Far Fortune, End Boss");
    setSpeed(g2, 4);
    attack(g2, a2, [f2]);
    expect(life(g2, B)).toBe(20 - 2 - 5);
    expect(life(g2, C)).toBe(18);
  });
});

describe("Gas Guzzler", () => {
  it("enters tapped; at max speed {B} and another creature or Vehicle draw a card, never itself", () => {
    const { game } = table();
    const guzzler = enter(game, "Gas Guzzler");
    expect(game.state.objects[guzzler].tapped).toBe(true);
    lands(game, "Swamp", 2);
    expect(canActivate(game, guzzler)).toBe(false);
    setSpeed(game, 4);
    expect(canActivate(game, guzzler)).toBe(false); // nothing else to sacrifice
    const bears = spawn(game, "Grizzly Bears");
    expect(canActivate(game, guzzler)).toBe(true);
    const sacrifice = (what: ObjectId) =>
      ({ type: "activate-ability", player: A, source: guzzler, abilityIndex: 0, targets: [], sacrifice: what }) as const;
    expect(sacrificeChoices(game, guzzler)).toEqual([bears]);
    const before = hand(game).length;
    game.dispatch(sacrifice(bears));
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("the Surveyors", () => {
  it("exile themselves from the graveyard for {3} to draw, only at max speed", () => {
    for (const name of ["Goblin Surveyor", "Glitch Ghost Surveyor", "Leonin Surveyor", "Loxodon Surveyor"]) {
      const { game } = table();
      lands(game, "Wastes", 3);
      const card = toGraveyard(game, name);
      expect(canActivate(game, card), name).toBe(false);
      setSpeed(game, 4);
      const before = hand(game).length;
      activate(game, card);
      expect(zone(game, card), name).toBe("exile");
      expect(hand(game), name).toHaveLength(before + 1);
    }
  });

  it("Mutant Surveyor's graveyard ability is its second", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const card = toGraveyard(game, "Mutant Surveyor");
    setSpeed(game, 4);
    activate(game, card, 1);
    expect(zone(game, card)).toBe("exile");
  });

  it("Leonin Surveyor has first strike only during your turn", () => {
    const { game } = table();
    const leonin = spawn(game, "Leonin Surveyor");
    expect(keywords(game, leonin).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, leonin).has("first-strike")).toBe(false);
  });
});

describe("Hazoret, Godseeker", () => {
  it("can't attack below max speed, and can at it", () => {
    const eligibleAttackers = (game: Game): readonly ObjectId[] => {
      game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
      const offer = game.legalActions(A).find((x) => x.kind === "declare-attackers");
      return offer?.kind === "declare-attackers" ? offer.eligible : [];
    };
    const { game } = table();
    const hazoret = spawn(game, "Hazoret, Godseeker");
    const bears = spawn(game, "Grizzly Bears");
    setSpeed(game, 3);
    const eligible = eligibleAttackers(game);
    expect(eligible).toContain(bears);
    expect(eligible).not.toContain(hazoret);
    const { game: g2, a: a2 } = table();
    const h2 = spawn(g2, "Hazoret, Godseeker");
    setSpeed(g2, 4);
    attack(g2, a2, [h2]);
    expect(life(g2, B)).toBe(15);
  });

  it("makes a small creature unblockable", () => {
    const { game } = table();
    const hazoret = spawn(game, "Hazoret, Godseeker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    activate(game, hazoret, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });
});

describe("Hour of Victory", () => {
  it("makes a Zombie, and at max speed sacrifices to tutor at sorcery speed", () => {
    const { game, a } = table();
    enter(game, "Hour of Victory");
    expect(tokensNamed(game, "Zombie Token")).toBe(1);
    const hour = spawn(game, "Hour of Victory");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Swamp", 2);
    expect(canActivate(game, hour)).toBe(false);
    setSpeed(game, 4);
    const wanted = toLibrary(game, "Sol Ring");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === wanted);
    activate(game, hour);
    expect(zone(game, hour)).toBe("graveyard");
    expect(zone(game, wanted)).toBe("hand");
  });
});

describe("Howlsquad Heavy", () => {
  it("makes a hasty attacking Goblin each combat, and at max speed taps for {R} per Goblin", () => {
    const { game } = table();
    const heavy = spawn(game, "Howlsquad Heavy");
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Goblin Token")).toBe(1);
    expect(life(game, B)).toBe(19); // it had to attack, and could: haste
    const goblin = named(game, "Goblin Token")[0];
    expect(keywords(game, goblin).has("haste")).toBe(true);
    expect(keywords(game, heavy).has("haste")).toBe(false);
    // Bob losing life on alice's turn raised her speed (rule 702.179d).
    expect(game.state.players[A].speed).toBe(2);
    setSpeed(game, 4);
    activate(game, heavy);
    expect(pool(game)).toBe(2);
  });
});

describe("Kickoff Celebrations", () => {
  it("may loot on entering; at max speed sacrifices to give creatures haste", () => {
    const { game, a } = table();
    const junk = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [junk];
    pickModes(a, 0);
    const before = hand(game).length;
    const kickoff = enter(game, "Kickoff Celebrations");
    expect(zone(game, junk)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    expect(canActivate(game, kickoff)).toBe(false);
    setSpeed(game, 4);
    activate(game, kickoff);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Lightwheel Enhancements", () => {
  it("+1/+1 and vigilance, castable from the graveyard only at max speed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    const aura = toGraveyard(game, "Lightwheel Enhancements");
    expect(canCast(game, aura)).toBe(false);
    setSpeed(game, 4);
    expect(canCast(game, aura)).toBe(true);
    pickTargets(a, bears);
    cast(game, aura, { targets: [ref(bears)], via: "graveyard-permission" });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });
});

describe("Mendicant Core, Guidelight", () => {
  it("counts artifacts for power, and at max speed copies an artifact spell for {1}", () => {
    const { game, a } = table();
    const core = spawn(game, "Mendicant Core, Guidelight");
    expect(pt(game, core).power).toBe(1);
    lands(game, "Wastes", 2);
    setSpeed(game, 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Sol Ring"));
    expect(named(game, "Sol Ring")).toHaveLength(2);
    expect(pt(game, core).power).toBe(3);
  });
});

describe("Momentum Breaker", () => {
  it("each opponent sacrifices a creature or Vehicle, and one who can't discards", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    toHand(game, "Mountain", C);
    const cHand = hand(game, C).length;
    const bHand = hand(game, B).length;
    enter(game, "Momentum Breaker");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, C)).toHaveLength(cHand - 1);
    expect(graveyard(game, C)).toHaveLength(1);
    expect(hand(game, B)).toHaveLength(bHand);
    expect(graveyard(game, B)).toHaveLength(1);
  });

  it("sacrifices for life equal to your speed", () => {
    const { game } = table();
    const breaker = spawn(game, "Momentum Breaker");
    lands(game, "Wastes", 2);
    setSpeed(game, 3);
    activate(game, breaker);
    expect(life(game)).toBe(23);
  });
});

describe("Outpace Oblivion", () => {
  it("deals 5 to up to one creature, then 2 to each player without max speed", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const outpace = enter(game, "Outpace Oblivion");
    expect(zone(game, giant)).toBe("graveyard");
    lands(game, "Wastes", 2);
    setSpeed(game, 4);
    setSpeed(game, 2, C);
    activate(game, outpace);
    expect(life(game)).toBe(20);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
  });
});

describe("Perilous Snare", () => {
  it("exiles an opponent's nonland permanent until it leaves; at max speed taps for a counter", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    const snare = enter(game, "Perilous Snare");
    expect(zone(game, ring)).toBe("exile");
    nextTurn(game);
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears");
    setSpeed(game, 4);
    activate(game, snare, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    destroy(game, snare);
    expect(named(game, "Sol Ring", B)).toHaveLength(1);
  });
});

describe("Point the Way", () => {
  it("fetches up to X basic lands, X its controller's speed", () => {
    const { game, a } = table();
    const point = spawn(game, "Point the Way");
    lands(game, "Forest", 4);
    const forests = [toLibrary(game, "Forest"), toLibrary(game, "Forest"), toLibrary(game, "Forest")];
    setSpeed(game, 2);
    let offeredMax = -1;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      offeredMax = max;
      return eligible.filter((id) => forests.includes(id)).slice(0, max);
    };
    activate(game, point);
    expect(offeredMax).toBe(2);
    expect(forests.filter((id) => zone(game, id) === "battlefield")).toHaveLength(2);
  });
});

describe("Pride of the Road", () => {
  it("gives a creature you control double strike each combat at max speed", () => {
    const { game, a } = table();
    spawn(game, "Pride of the Road");
    const bears = spawn(game, "Grizzly Bears");
    setSpeed(game, 4);
    pickTargets(a, bears);
    toStep(game, "declare-attackers");
    expect(keywords(game, bears).has("double-strike")).toBe(true);
  });
});

describe("Racers' Scoreboard", () => {
  it("loots two on entering, and at max speed spells cost {1} less", () => {
    const { game, a } = table();
    a.chooseDiscardsFn = (h) => [h[0].id];
    const before = hand(game).length;
    enter(game, "Racers' Scoreboard");
    expect(hand(game)).toHaveLength(before + 1);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Wastes", 1);
    const signet = toHand(game, "Mind Stone"); // {2}
    expect(canCast(game, signet)).toBe(false);
    setSpeed(game, 4);
    expect(canCast(game, signet)).toBe(true);
  });
});

describe("Risen Necroregent", () => {
  it("makes a Zombie at your end step at max speed", () => {
    const { game } = table();
    spawn(game, "Risen Necroregent");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Zombie Token")).toBe(0);
    nextTurn(game);
    nextTurn(game);
    setSpeed(game, 4);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Zombie Token")).toBe(1);
  });
});

describe("Samut, the Driving Force", () => {
  it("other creatures get +X/+0 and noncreature spells cost {X} less, X your speed", () => {
    const { game } = table();
    const samut = spawn(game, "Samut, the Driving Force");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "declare-attackers");
    expect(game.state.players[A].speed).toBe(1);
    expect(pt(game, bears).power).toBe(3);
    expect(pt(game, samut).power).toBe(4);
    setSpeed(game, 3);
    expect(pt(game, bears).power).toBe(5);
    nextTurn(game);
    nextTurn(game);
    const stone = toHand(game, "Mind Stone"); // {2}
    expect(canCast(game, stone)).toBe(true);
  });
});

describe("Slick Imitator", () => {
  it("at max speed sacrifices to copy a spell you control", () => {
    const { game, a } = table();
    const imitator = spawn(game, "Slick Imitator");
    lands(game, "Mountain", 2);
    setSpeed(game, 4);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    const bolt = game.state.zones.shared.stack[0];
    activate(game, imitator, 0, { targets: [ref(bolt)] });
    expect(zone(game, imitator)).toBe("graveyard");
    expect(life(game, B)).toBe(14);
  });
});

describe("Starting Column", () => {
  it("taps for any colour, and at max speed sacrifices to draw two and discard one", () => {
    const { game, a } = table();
    const column = spawn(game, "Starting Column");
    expect(canActivate(game, column, 1)).toBe(false);
    setSpeed(game, 4);
    a.chooseDiscardsFn = (h) => [h[0].id];
    const before = hand(game).length;
    activate(game, column, 1);
    expect(zone(game, column)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("The Speed Demon", () => {
  it("draws X and loses X life at your end step, X your speed", () => {
    const { game } = table();
    spawn(game, "The Speed Demon");
    toStep(game, "declare-attackers");
    setSpeed(game, 3);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game)).toHaveLength(before + 3);
    expect(life(game)).toBe(17);
  });
});

describe("Vnwxt, Verbose Host", () => {
  it("doubles each draw at max speed", () => {
    const { game } = table();
    spawn(game, "Vnwxt, Verbose Host");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    expect(hand(game)).toHaveLength(before + 1);
    setSpeed(game, 4);
    game.debugApplyEffect(A, { kind: "draw", amount: 3 });
    expect(hand(game)).toHaveLength(before + 7);
  });
});

describe("Walking Sarcophagus and Streaking Oilgorger", () => {
  it("+1/+2, and lifelink, at max speed", () => {
    const { game, a } = table();
    const oilgorger = spawn(game, "Streaking Oilgorger");
    setSpeed(game, 4);
    attack(game, a, [oilgorger]);
    expect(life(game)).toBe(23);
  });
});

describe("Zahur, Glory's Past", () => {
  it("sacrifices another creature to surveil once a turn; at max speed a nontoken creature dying makes a tapped Zombie", () => {
    const { game } = table();
    const zahur = spawn(game, "Zahur, Glory's Past");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const sacrifice = (what: ObjectId) =>
      ({ type: "activate-ability", player: A, source: zahur, abilityIndex: 0, targets: [], sacrifice: what }) as const;
    expect(sacrificeChoices(game, zahur)).not.toContain(zahur);
    game.dispatch(sacrifice(bears));
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(canActivate(game, zahur)).toBe(false);
    expect(tokensNamed(game, "Zombie Token")).toBe(0);
    setSpeed(game, 4);
    const other = named(game, "Grizzly Bears")[0];
    destroy(game, other);
    expect(tokensNamed(game, "Zombie Token")).toBe(1);
    const zombie = named(game, "Zombie Token")[0];
    expect(game.state.objects[zombie].tapped).toBe(true);
    destroy(game, zombie);
    expect(tokensNamed(game, "Zombie Token")).toBe(0);
  });
});
