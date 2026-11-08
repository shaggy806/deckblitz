/**
 * The filter clause `triggerBatch`, "those creatures": the attackers that
 * counted for the attack trigger that fired, bound as an effect applies, kept
 * by a delayed trigger, and read through one that fires later. Sabotage
 * Strategist, Lightmine Field, Love on the Battlefield, Creepy Puppeteer and
 * Garruk, Curse Breaker.
 */
import { describe, expect, it } from "vitest";
import { matchesFilter } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, attack, cast, counters, enter, hand, keywords, lands, life, loyalty, nextTurn, pickModes, pt, registryOf, spawn, table, toHand, tokensNamed } from "./harness.js";

/** The moment the declaration's triggers have gone on the stack. */
const toTriggers = (game: Game): void =>
  game.advanceUntil(
    (s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length > 0 && s.priority.holder === A,
  );

const stackEmpty = (game: Game): void =>
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.priority.holder === A);

describe("those creatures, of one player's attackers", () => {
  it("Sabotage Strategist shrinks only what attacks its controller, until end of turn", () => {
    const { game, b } = table({ players: 3, life: 100 });
    spawn(game, "Sabotage Strategist");
    const atMe = spawn(game, "Hill Giant", B);
    const atC = spawn(game, "Hill Giant", B);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: atMe, defender: A },
      { attacker: atC, defender: C },
    ];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(pt(game, atMe)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, atC)).toEqual({ power: 3, toughness: 3 });
    expect(life(game, A)).toBe(98);
    expect(life(game, C)).toBe(97);
    nextTurn(game);
    expect(pt(game, atMe)).toEqual({ power: 3, toughness: 3 });
  });

  it("doesn't reach a creature that attacks its planeswalker", () => {
    const { game, b } = table({ life: 100 });
    spawn(game, "Sabotage Strategist");
    const walker = spawn(game, "Jace Beleren");
    const giant = spawn(game, "Hill Giant", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: giant, defender: walker }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(pt(game, giant).power).toBe(3);
  });

  it("nor one the attacker holds back", () => {
    const { game, b } = table({ life: 100 });
    spawn(game, "Sabotage Strategist");
    const home = spawn(game, "Hill Giant", B);
    const away = spawn(game, "Hill Giant", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: away, defender: A }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(pt(game, away).power).toBe(2);
    expect(pt(game, home).power).toBe(3);
  });
});

describe("Lightmine Field", () => {
  it("hits each attacker, its own controller's too, for how many attack", () => {
    const { game, a } = table({ life: 100 });
    spawn(game, "Lightmine Field");
    const x = spawn(game, "Hill Giant");
    const y = spawn(game, "Hill Giant");
    const home = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [
      { attacker: x, defender: B },
      { attacker: y, defender: B },
    ];
    toTriggers(game);
    stackEmpty(game);
    expect(game.state.objects[x].damageMarked).toBe(2);
    expect(game.state.objects[y].damageMarked).toBe(2);
    expect(game.state.objects[home].damageMarked).toBe(0);
  });

  it("a creature removed from combat is still dealt damage, but not counted", () => {
    const { game, a } = table({ life: 100 });
    spawn(game, "Lightmine Field");
    const reconnaissance = spawn(game, "Reconnaissance");
    const x = spawn(game, "Hill Giant");
    const y = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [
      { attacker: x, defender: B },
      { attacker: y, defender: B },
    ];
    toTriggers(game);
    activate(game, reconnaissance, 0, { targets: [{ kind: "object", object: x }], settle: false });
    // Reconnaissance first, then the Field.
    stackEmpty(game);
    expect(game.state.objects[x].attacking).toBe(null);
    expect(game.state.objects[x].damageMarked).toBe(1);
    expect(game.state.objects[y].damageMarked).toBe(1);
  });

  it("a creature that has left and come back isn't one of them", () => {
    const { game, a } = table({ life: 100 });
    spawn(game, "Lightmine Field");
    const x = spawn(game, "Hill Giant");
    const y = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [
      { attacker: x, defender: B },
      { attacker: y, defender: B },
    ];
    toTriggers(game);
    // A new object (rule 400.7), as a flicker in response would leave it.
    game.state.objects[x].zoneChangeCount = (game.state.objects[x].zoneChangeCount ?? 0) + 1;
    stackEmpty(game);
    expect(game.state.objects[x].damageMarked).toBe(0);
    expect(game.state.objects[y].damageMarked).toBe(2);
  });

  it("two tokens of a stack of twenty are its attackers: the others stay clear", () => {
    const { game, a } = table({ life: 100 });
    spawn(game, "Lightmine Field");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 20 });
    const stack = game.battlefield.find((id) => game.state.objects[id].cardName === "Soldier Token")!;
    expect(game.state.objects[stack].stackCount).toBe(20);
    game.state.objects[stack].summoningSick = false;
    a.declareAttackersFn = () => [{ attacker: stack, defender: B, count: 2 }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    // Each attacker took 2 and died; none of them reached Bob.
    expect(life(game, B)).toBe(100);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(18);
  });
});

describe("Love on the Battlefield: those creatures, kept by a delayed trigger", () => {
  const board = (): ReturnType<typeof table> & { x: ObjectId; y: ObjectId } => {
    const t = table({ life: 100 });
    spawn(t.game, "Love on the Battlefield");
    return { ...t, x: spawn(t.game, "Hill Giant"), y: spawn(t.game, "Hill Giant") };
  };

  it("first strike, a card, and a counter on each that connects", () => {
    const { game, a, x, y } = board();
    const before = hand(game).length;
    const home = spawn(game, "Hill Giant");
    attack(game, a, [x, y]);
    expect(hand(game).length).toBe(before + 1);
    expect(keywords(game, x).has("first-strike")).toBe(true);
    expect(keywords(game, y).has("first-strike")).toBe(true);
    expect(keywords(game, home).has("first-strike")).toBe(false);
    expect(counters(game, x)).toBe(1);
    expect(counters(game, y)).toBe(1);
    expect(counters(game, home)).toBe(0);
  });

  it("doesn't fire on three attackers", () => {
    const { game, a, x, y } = board();
    const before = hand(game).length;
    const z = spawn(game, "Hill Giant");
    attack(game, a, [x, y, z]);
    expect(hand(game).length).toBe(before);
    expect(keywords(game, x).has("first-strike")).toBe(false);
    expect(counters(game, x)).toBe(0);
  });

  it("a blocked one gets no counter", () => {
    const { game, a, b, x, y } = board();
    const wall = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: x }];
    attack(game, a, [x, y]);
    expect(counters(game, x)).toBe(0);
    expect(counters(game, y)).toBe(1);
  });

  it("isn't some other creature's damage, and lapses with the combat", () => {
    const { game, a, x, y } = board();
    const third = spawn(game, "Grizzly Bears");
    attack(game, a, [x, y]);
    expect(counters(game, x)).toBe(1);
    // A second combat this turn, one of them and another: exactly two again
    // would fire it anew, so three: no new watcher, and the first has lapsed.
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Relentless Assault"));
    a.declareAttackersFn = () => [
      { attacker: x, defender: B },
      { attacker: y, defender: B },
      { attacker: third, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "end" && s.priority.holder === A);
    expect(game.state.turn.combatPhases).toBe(2);
    expect(counters(game, x)).toBe(1);
    expect(counters(game, y)).toBe(1);
    expect(counters(game, third)).toBe(0);
    expect(life(game, B)).toBe(100 - 3 - 3 - 4 - 4 - 2);
  });
});

describe("Creepy Puppeteer", () => {
  it("makes the one other attacker a 4/3, not itself", () => {
    const { game, a } = table({ life: 100 });
    const puppeteer = spawn(game, "Creepy Puppeteer");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [puppeteer, bears]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, puppeteer)).toEqual({ power: 4, toughness: 3 });
    expect(life(game, B)).toBe(92);
  });

  it("is a may", () => {
    const { game, a } = table({ life: 100 });
    const puppeteer = spawn(game, "Creepy Puppeteer");
    const bears = spawn(game, "Grizzly Bears");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    attack(game, a, [puppeteer, bears]);
    expect(asked).toBe(1);
    expect(pt(game, bears).power).toBe(2);
  });

  it("a counter still counts on the new base", () => {
    const { game, a } = table({ life: 100 });
    const puppeteer = spawn(game, "Creepy Puppeteer");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 1 };
    pickModes(a, 0);
    attack(game, a, [puppeteer, bears]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 4 });
  });

  it("not with two other attackers", () => {
    const { game, a } = table({ life: 100 });
    const puppeteer = spawn(game, "Creepy Puppeteer");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    pickModes(a, 0);
    attack(game, a, [puppeteer, ...bears]);
    for (const one of bears) expect(pt(game, one).power).toBe(2);
  });

  it("not when it stays home: two others are exactly two, but not with it", () => {
    const { game, a } = table({ life: 100 });
    spawn(game, "Creepy Puppeteer");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    pickModes(a, 0);
    attack(game, a, bears);
    for (const one of bears) expect(pt(game, one).power).toBe(2);
  });
});

describe("Garruk, Curse Breaker's −4: those creatures, read as the delayed trigger fires", () => {
  it("each attack on one of his controller's opponents, once per player attacked", () => {
    const { game, a, b } = table({ players: 3, life: 100 });
    const garruk = spawn(game, "Garruk, Curse Breaker");
    loyalty(game, garruk, -4);
    expect(game.state.objects[garruk].counters.loyalty).toBe(1);
    // Alice's own attack, one creature at each opponent: each pumped once.
    const mine = [spawn(game, "Hill Giant"), spawn(game, "Hill Giant")];
    const home = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [
      { attacker: mine[0], defender: B },
      { attacker: mine[1], defender: C },
    ];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(pt(game, mine[0])).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, mine[1])).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, mine[0]).has("trample")).toBe(true);
    expect(pt(game, home)).toEqual({ power: 3, toughness: 3 });
    // Bob's turn: one at Alice isn't pumped, one at Carol is.
    const atAlice = spawn(game, "Hill Giant", B);
    const atCarol = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [
      { attacker: atAlice, defender: A },
      { attacker: atCarol, defender: C },
    ];
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "postcombat-main");
    expect(pt(game, atAlice).power).toBe(3);
    expect(pt(game, atCarol).power).toBe(5);
    expect(keywords(game, atCarol).has("trample")).toBe(true);
  });

  it("is over as its controller's next turn begins", () => {
    const { game, a } = table({ life: 100 });
    const garruk = spawn(game, "Garruk, Curse Breaker");
    loyalty(game, garruk, -4);
    const giant = spawn(game, "Hill Giant");
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(pt(game, giant).power).toBe(3);
  });

  it("his other abilities: a Beast, two lands untapped, and a card for a big creature", () => {
    const { game } = table({ life: 100, deck: "Wastes" });
    const garruk = spawn(game, "Garruk, Curse Breaker");
    loyalty(game, garruk, -3);
    expect(tokensNamed(game, "Beast Token (Garruk, Veiled Butcher)", A)).toBe(1);
    const before = hand(game).length;
    enter(game, "Hill Giant");
    expect(hand(game).length).toBe(before);
    enter(game, "Craw Wurm");
    expect(hand(game).length).toBe(before + 1);
    const [one, two] = lands(game, "Wastes", 2);
    game.state.objects[one].tapped = true;
    game.state.objects[two].tapped = true;
    nextTurn(game);
    nextTurn(game);
    game.state.objects[one].tapped = true;
    game.state.objects[two].tapped = true;
    activate(game, garruk, 0, {
      targets: [
        { kind: "object", object: one },
        { kind: "object", object: two },
      ],
    });
    expect(game.state.objects[one].tapped).toBe(false);
    expect(game.state.objects[two].tapped).toBe(false);
  });
});

describe("an unbound clause", () => {
  it("names nothing outside a resolution", () => {
    const { game } = table({ life: 100 });
    const giant = spawn(game, "Hill Giant");
    const ctx = { you: A };
    expect(matchesFilter(game.state, registryOf(game), giant, { inSet: "trigger-batch" }, ctx)).toBe(false);
    expect(matchesFilter(game.state, registryOf(game), giant, {}, ctx)).toBe(true);
  });
});
