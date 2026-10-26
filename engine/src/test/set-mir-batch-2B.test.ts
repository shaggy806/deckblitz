/**
 * Mirage (MIR; B169), group B. One test per card whose behaviour is more than
 * a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const priorityIn = (game: Game, step: Game["state"]["turn"]["step"], holder: typeof A): void =>
  game.advanceUntil((s) => s.turn.step === step && s.priority.holder === holder);

describe("Rashida Scalebane", () => {
  it("destroys an attacking Dragon and gains life equal to its power", () => {
    const { game, b } = table();
    const rashida = spawn(game, "Rashida Scalebane");
    const dragon = spawn(game, "Shivan Dragon", B);
    nextTurn(game, "upkeep");
    b.declareAttackersFn = () => [{ attacker: dragon, defender: A }];
    priorityIn(game, "declare-attackers", A);
    activate(game, rashida, 0, { targets: [ref(dragon)] });
    expect(zone(game, dragon)).toBe("graveyard");
    expect(life(game, A)).toBe(25);
  });
});

describe("Mist Dragon", () => {
  it("gains and loses flying indefinitely, the latest one winning", () => {
    const { game } = table();
    const dragon = spawn(game, "Mist Dragon");
    activate(game, dragon, 0);
    expect(keywords(game, dragon).has("flying")).toBe(true);
    activate(game, dragon, 1);
    expect(keywords(game, dragon).has("flying")).toBe(false);
    activate(game, dragon, 0);
    nextTurn(game);
    expect(keywords(game, dragon).has("flying")).toBe(true);
  });
});

describe("Canopy Dragon", () => {
  it("trades trample for flying until end of turn", () => {
    const { game } = table();
    const dragon = spawn(game, "Canopy Dragon");
    lands(game, "Forest", 2);
    activate(game, dragon, 0);
    expect(keywords(game, dragon).has("flying")).toBe(true);
    expect(keywords(game, dragon).has("trample")).toBe(false);
    nextTurn(game);
    expect(keywords(game, dragon).has("trample")).toBe(true);
    expect(keywords(game, dragon).has("flying")).toBe(false);
  });
});

describe("Purraj of Urborg", () => {
  it("may pay {B} for a counter when a player casts a black spell", () => {
    const { game, a } = table();
    const purraj = spawn(game, "Purraj of Urborg");
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Dark Ritual"));
    expect(counters(game, purraj)).toBe(1);
  });
});

describe("Ventifact Bottle", () => {
  it("taps and empties itself at your first main phase for {C} per counter", () => {
    const { game } = table();
    const bottle = spawn(game, "Ventifact Bottle");
    lands(game, "Wastes", 4);
    activate(game, bottle, 0, { x: 3 });
    expect(counters(game, bottle, "charge")).toBe(3);
    // Not on Bob's turn.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.zones.shared.stack.length === 0);
    expect(counters(game, bottle, "charge")).toBe(3);
    game.advanceUntil(
      (s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0,
    );
    expect(counters(game, bottle, "charge")).toBe(0);
    expect(game.state.objects[bottle].tapped).toBe(true);
    expect(poolCounts(game.state.players[A].manaPool).C).toBe(3);
  });
});

describe("Kaervek's Hex", () => {
  it("deals 2 to a nonblack green creature, 1 to a black-green one, none to a black one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const shaman = spawn(game, "Deathrite Shaman", B);
    const nighthawk = spawn(game, "Vampire Nighthawk", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Kaervek's Hex"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(game.state.objects[shaman].damageMarked).toBe(1);
    expect(game.state.objects[nighthawk].damageMarked).toBe(0);
  });
});

describe("Divine Retribution", () => {
  it("deals damage equal to the number of attacking creatures only", () => {
    const { game, a } = table();
    const courser = spawn(game, "Centaur Courser");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2, B);
    const retribution = toHand(game, "Divine Retribution", B);
    a.declareAttackersFn = () => [
      { attacker: courser, defender: B },
      { attacker: bears, defender: B },
    ];
    priorityIn(game, "declare-attackers", B);
    cast(game, retribution, { player: B, targets: [ref(courser)] });
    expect(game.state.objects[courser].damageMarked).toBe(2);
    expect(zone(game, courser)).toBe("battlefield");
  });
});

describe("Zombie Mob", () => {
  it("enters with a counter per creature card in your graveyard, then exiles them", () => {
    const { game } = table();
    const c1 = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    const ritual = toGraveyard(game, "Dark Ritual");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const mob = enter(game, "Zombie Mob");
    expect(counters(game, mob)).toBe(2);
    expect(zone(game, mob)).toBe("battlefield");
    expect(zone(game, c1)).toBe("exile");
    expect(graveyard(game, A)).toEqual([ritual]);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Flame Elemental", () => {
  it("is sacrificed to deal damage equal to its power", () => {
    const { game } = table();
    const elemental = spawn(game, "Flame Elemental");
    const courser = spawn(game, "Centaur Courser", B);
    lands(game, "Mountain", 1);
    activate(game, elemental, 0, { targets: [ref(courser)] });
    expect(zone(game, elemental)).toBe("graveyard");
    expect(zone(game, courser)).toBe("graveyard");
  });
});

describe("Vaporous Djinn", () => {
  it("phases out at your upkeep when you don't pay {U}{U}", () => {
    const { game } = table();
    const djinn = spawn(game, "Vaporous Djinn");
    nextTurn(game);
    expect(zone(game, djinn)).toBe("battlefield");
    nextTurn(game, "draw");
    expect(zone(game, djinn)).toBe("phased-out");
  });
});

describe("Lead Golem", () => {
  it("doesn't untap during your next untap step after it attacks", () => {
    const { game, a } = table();
    const golem = spawn(game, "Lead Golem");
    a.declareAttackersFn = () => [{ attacker: golem, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    settle(game);
    expect(game.state.objects[golem].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[golem].tapped).toBe(true);
  });
});
