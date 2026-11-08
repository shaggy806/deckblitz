/**
 * B278: the cards proving the theme-2 keys the generic `{ on: "event" }`
 * trigger and the timing wrapper built — one or two a key, the rest left for
 * `author-freed`.
 */

import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  counters,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const addCounter = (game: Game, id: ObjectId, counter = "+1/+1", by = A): void => {
  game.debugApplyEffect(by, { kind: "add-counter", target: 0, counter, amount: 1 }, [ref(id)]);
  settle(game);
};

const loseLife = (game: Game, amount: number, player = A): void => {
  game.debugApplyEffect(player, { kind: "lose-life", amount, who: "you" });
  settle(game);
};

describe("trigger:activates-mana-ability", () => {
  it("Ceaseless Searblades: an Elemental's mana ability, activated by hand, is +1/+0", () => {
    const { game } = table();
    const blades = enter(game, "Ceaseless Searblades");
    const embercat = spawn(game, "Chandra's Embercat");
    game.dispatch({ type: "activate-ability", player: A, source: embercat, abilityIndex: 0, targets: [] });
    settle(game);
    expect(pt(game, blades).power).toBe(3);
  });

  it("Ceaseless Searblades: a non-Elemental's isn't", () => {
    const { game } = table();
    const blades = enter(game, "Ceaseless Searblades");
    const elves = spawn(game, "Llanowar Elves");
    game.dispatch({ type: "activate-ability", player: A, source: elves, abilityIndex: 0, targets: [] });
    settle(game);
    expect(pt(game, blades).power).toBe(2);
  });
});

describe("trigger:counters-put-first-time-each-turn", () => {
  it("Axgard Artisan: the first +1/+1 counters each turn make a Treasure, the second don't", () => {
    const { game } = table();
    const artisan = enter(game, "Axgard Artisan");
    addCounter(game, artisan);
    addCounter(game, artisan);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    nextTurn(game);
    addCounter(game, artisan);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("Axgard Artisan: another kind of counter first doesn't use it up", () => {
    const { game } = table();
    const artisan = enter(game, "Axgard Artisan");
    addCounter(game, artisan, "shield");
    addCounter(game, artisan);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("Stalwart Successor: each creature's first counters of the turn, once", () => {
    const { game } = table();
    enter(game, "Stalwart Successor");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    // Its own counter is the second on the Bears: nothing more.
    expect(counters(game, bears)).toBe(2);
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(3);
    addCounter(game, other);
    expect(counters(game, other)).toBe(2);
  });

  it("Stalwart Successor: counters before it arrived count", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    enter(game, "Stalwart Successor");
    addCounter(game, bears);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("trigger:player-loses-game-trigger", () => {
  it("Blood Tyrant: five counters when a player loses the game", () => {
    const { game } = table({ players: 3 });
    const tyrant = enter(game, "Blood Tyrant");
    game.concede(B);
    settle(game);
    expect(counters(game, tyrant)).toBe(5);
  });

  it("Blood Tyrant: each player loses 1 in your upkeep, a counter each", () => {
    const { game } = table({ players: 3 });
    const tyrant = enter(game, "Blood Tyrant");
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, tyrant)).toBe(3);
    expect(life(game, A)).toBe(19);
  });
});

describe("trigger:proliferate-trigger", () => {
  it("Ezuri: proliferating twice draws two, even choosing nothing", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    a.chooseModesFn = () => [0];
    a.chooseProliferateFn = () => [];
    const before = hand(game).length;
    enter(game, "Ezuri, Stalker of Spheres");
    expect(hand(game).length).toBe(before + 2);
  });

  it("Scheming Aspirant: an opponent's proliferate doesn't count", () => {
    const { game, b } = table();
    enter(game, "Scheming Aspirant");
    b.chooseProliferateFn = () => [];
    game.debugApplyEffect(B, { kind: "proliferate" });
    settle(game);
    expect(life(game, B)).toBe(20);
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("trigger:becomes-crewed-trigger", () => {
  it("Mobilizer Mech: as its crew ability resolves, another Vehicle becomes a creature", () => {
    const { game, a } = table();
    const mech = spawn(game, "Mobilizer Mech");
    const other = spawn(game, "Mobilizer Mech");
    const crew = spawn(game, "Hill Giant");
    pickTargets(a, other);
    const action: Action = { type: "activate-ability", player: A, source: mech, abilityIndex: 0, targets: [], tap: [crew] };
    game.dispatch(action);
    settle(game);
    expect(game.state.objects[crew].tapped).toBe(true);
    expect(types(game, mech)).toContain("creature");
    expect(types(game, other)).toContain("creature");
  });
});

describe("trigger:becomes-monarch", () => {
  it("Custodi Lich: becoming the monarch makes the target player sacrifice a creature", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    enter(game, "Custodi Lich");
    expect(game.state.monarch).toBe(A);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Custodi Lich: already the monarch, it doesn't become it again", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "become-monarch" });
    settle(game);
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    enter(game, "Custodi Lich");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("trigger:phases-in", () => {
  it("Warping Wurm: phasing in, it gets a +1/+1 counter", () => {
    const { game } = table();
    const wurm = spawn(game, "Warping Wurm");
    nextTurn(game); // bob's
    nextTurn(game); // alice's: phasing takes it out (702.26a)
    expect(zone(game, wurm)).toBe("phased-out");
    nextTurn(game);
    nextTurn(game); // alice's again: it phases in
    settle(game);
    expect(counters(game, wurm)).toBe(1);
  });

  it("Shimmering Efreet: phasing in phases out target creature", () => {
    const { game, a } = table();
    const efreet = spawn(game, "Shimmering Efreet");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "phase-out", target: 0 }, [ref(efreet)]);
    settle(game);
    pickTargets(a, theirs);
    nextTurn(game); // bob's
    nextTurn(game); // alice's: the Efreet phases in
    settle(game);
    expect(zone(game, efreet)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("phased-out");
  });
});

describe("trigger:you-tap-opponent-creature", () => {
  it("Solitary Sanctuary: its own tap counts, and grows your creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = (_view, _source, specs) =>
      specs.map((spec) => (spec === "creature-you-control" ? ref(bears) : ref(theirs)));
    enter(game, "Solitary Sanctuary");
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(1);
    expect(counters(game, bears)).toBe(1);
  });

  it("Solitary Sanctuary: an opponent tapping their own creature doesn't count", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugSpawn("Solitary Sanctuary", A, "battlefield");
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(counters(game, bears)).toBe(0);
  });

  it("Sharae: one or more tapped, one card, once each turn", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    game.debugSpawn("Sharae of Numbing Depths", A, "battlefield");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } });
    settle(game);
    expect(game.state.objects[one].tapped && game.state.objects[two].tapped).toBe(true);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("stat:once-per-turn-trigger", () => {
  it("Nykthos Paragon: once done, gaining life again doesn't trigger it (rule 603.2h)", () => {
    const { game, a } = table();
    const paragon = enter(game, "Nykthos Paragon");
    a.chooseModesFn = () => [0];
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 });
    settle(game);
    expect(counters(game, paragon)).toBe(2);
    const stack = game.state.zones.shared.stack.length;
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    expect(game.state.zones.shared.stack.length).toBe(stack);
    settle(game);
    expect(counters(game, paragon)).toBe(2);
  });

  it("Nykthos Paragon: declined, it may still do it later that turn", () => {
    const { game, a } = table();
    const paragon = enter(game, "Nykthos Paragon");
    let answers = 0;
    a.chooseModesFn = () => (answers++ === 0 ? [] : [0]);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 });
    settle(game);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    settle(game);
    expect(counters(game, paragon)).toBe(3);
  });

  it("Earth Kingdom General: you putting +1/+1 counters gains that much life, once each turn", () => {
    const { game, a } = table();
    spawn(game, "Forest");
    a.chooseModesFn = () => [0];
    enter(game, "Earth Kingdom General"); // earthbend 2: two counters by you
    expect(life(game)).toBe(22);
    const bears = spawn(game, "Grizzly Bears");
    addCounter(game, bears);
    expect(life(game)).toBe(22);
  });
});

describe("trigger:loses-life-first-time-each-turn", () => {
  it("Vengeful Warchief: the first loss each turn, however much, one counter", () => {
    const { game } = table();
    const warchief = enter(game, "Vengeful Warchief");
    loseLife(game, 3);
    loseLife(game, 1);
    expect(counters(game, warchief)).toBe(1);
    nextTurn(game);
    loseLife(game, 1);
    expect(counters(game, warchief)).toBe(2);
  });

  it("Vengeful Warchief: a loss before it arrived uses it up", () => {
    const { game } = table();
    loseLife(game, 2);
    const warchief = enter(game, "Vengeful Warchief");
    loseLife(game, 1);
    expect(counters(game, warchief)).toBe(0);
  });

  it("Gonti's Machinations: one energy a turn; {E}{E} and sacrifice drains each opponent 3", () => {
    const { game } = table();
    const gonti = enter(game, "Gonti's Machinations");
    loseLife(game, 1);
    loseLife(game, 1);
    expect(game.state.players[A].energy).toBe(1);
    nextTurn(game);
    loseLife(game, 1);
    expect(game.state.players[A].energy).toBe(2);
    nextTurn(game);
    game.dispatch({ type: "activate-ability", player: A, source: gonti, abilityIndex: 0, targets: [] });
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
    expect(zone(game, gonti)).toBe("graveyard");
  });
});
