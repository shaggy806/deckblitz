/**
 * The set walk, batch 62, part c (2026-10-12): Teenage Mutant Ninja Turtles.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const manaOf = (game: Game, type: string, player: PlayerId = A): number =>
  game.state.players[player].manaPool.filter((u) => u.type === type).length;

describe("Agent Bishop, Man in Black", () => {
  it("puts a +1/+1 counter on each of up to two target creatures, an opponent's included", () => {
    const { game, a } = table();
    spawn(game, "Agent Bishop, Man in Black");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, mine, theirs);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
  });
});

describe("Armaggon, Future Shark", () => {
  it("destroys up to three target creatures as it enters", () => {
    const { game, a } = table();
    const victims = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B), spawn(game, "Grizzly Bears", B)];
    const spared = spawn(game, "Grizzly Bears", B);
    pickTargets(a, ...victims);
    const shark = enter(game, "Armaggon, Future Shark");
    expect(victims.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    expect(zone(game, spared)).toBe("battlefield");
    expect(zone(game, shark)).toBe("battlefield");
  });
});

describe("Bebop & Rocksteady", () => {
  it("attacking: you may discard a card instead of sacrificing a permanent", () => {
    const { game, a } = table();
    const duo = spawn(game, "Bebop & Rocksteady");
    const land = spawn(game, "Swamp");
    const card = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [card];
    attack(game, a, [duo]);
    expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, duo)).toBe("battlefield");
  });

  it("…or you choose to sacrifice a permanent instead", () => {
    const { game, a } = table();
    const duo = spawn(game, "Bebop & Rocksteady");
    const land = spawn(game, "Swamp");
    const card = toHand(game, "Grizzly Bears");
    // Declined: the card stays, a permanent of your choice goes.
    pickModes(a);
    a.chooseSacrificesFn = () => [land];
    attack(game, a, [duo]);
    expect(zone(game, card)).toBe("hand");
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, duo)).toBe("battlefield");
  });

  it("blocking triggers it too, and with an empty hand there's nothing to discard", () => {
    const { game, a, b } = table();
    const duo = spawn(game, "Bebop & Rocksteady", B);
    const land = spawn(game, "Forest", B);
    game.debugApplyEffect(B, { kind: "discard-hand", who: "you" }, []);
    settle(game);
    expect(hand(game, B)).toHaveLength(0);
    const giant = spawn(game, "Hill Giant");
    // Bob would discard if he could: he isn't offered it, so he sacrifices.
    pickModes(b, 0);
    b.chooseSacrificesFn = () => [land];
    b.declareBlockersFn = () => [{ blocker: duo, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, duo)).toBe("battlefield");
  });
});

describe("Don & Leo, Problem Solvers", () => {
  it("blinks up to one artifact and up to one creature you control at your end step", () => {
    const { game, a } = table();
    spawn(game, "Don & Leo, Problem Solvers");
    const bear = spawn(game, "Grizzly Bears");
    game.state.objects[bear].counters["+1/+1"] = 2;
    const rock = spawn(game, "Mind Stone", A, { tapped: true });
    const opposing = spawn(game, "Grizzly Bears", B);
    pickTargets(a, rock, bear);
    toStep(game, "end");
    settle(game);
    const [back] = named(game, "Grizzly Bears", A);
    expect(back).toBeDefined();
    // A new object: the counters are gone.
    expect(counters(game, back)).toBe(0);
    // The Mind Stone came back too, untapped.
    const stones = named(game, "Mind Stone", A);
    expect(stones).toHaveLength(1);
    expect(game.state.objects[stones[0]].tapped).toBe(false);
    expect(game.state.zones.shared.exile).toHaveLength(0);
    expect(zone(game, opposing)).toBe("battlefield");
  });
});

describe("Groundchuck & Dirtbag", () => {
  it("adds an extra {G} whenever you tap a land for mana, whatever it made", () => {
    const { game } = table();
    spawn(game, "Groundchuck & Dirtbag");
    const swamp = spawn(game, "Swamp");
    activate(game, swamp, 0);
    expect(manaOf(game, "B")).toBe(1);
    expect(manaOf(game, "G")).toBe(1);
  });
});

describe("Leader's Talent", () => {
  it("level 2: a creature of yours leaving with a counter on it gains you 2 life; one without, nothing", () => {
    const { game } = table();
    const talent = spawn(game, "Leader's Talent");
    lands(game, "Plains", 3);
    activate(game, talent, 0);
    expect(game.state.objects[talent].classLevel).toBe(2);
    const plain = spawn(game, "Grizzly Bears");
    destroy(game, plain);
    expect(life(game)).toBe(20);
    const grown = spawn(game, "Grizzly Bears");
    game.state.objects[grown].counters["+1/+1"] = 1;
    destroy(game, grown);
    expect(life(game)).toBe(22);
    // An opponent's creature with a counter doesn't count.
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    destroy(game, theirs, A);
    expect(life(game)).toBe(22);
  });

  it("level 1 alone has no leave trigger", () => {
    const { game } = table();
    spawn(game, "Leader's Talent");
    const grown = spawn(game, "Grizzly Bears");
    game.state.objects[grown].counters["+1/+1"] = 1;
    destroy(game, grown);
    expect(life(game)).toBe(20);
  });
});

describe("Madame Null, Power Broker", () => {
  it("pays life equal to the entering creature's power for that many +1/+1 counters", () => {
    const { game, a } = table();
    spawn(game, "Madame Null, Power Broker");
    pickModes(a, 0);
    const giant = enter(game, "Hill Giant");
    expect(life(game)).toBe(17);
    expect(counters(game, giant)).toBe(3);
    pickModes(a);
    const bear = enter(game, "Grizzly Bears");
    expect(life(game)).toBe(17);
    expect(counters(game, bear)).toBe(0);
  });
});

describe("Prehistoric Pet", () => {
  it("returns another creature you control only during your turn", () => {
    const { game } = table();
    const pet = spawn(game, "Prehistoric Pet");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    activate(game, pet, 0, { targets: [{ kind: "object", object: bear }] });
    expect(zone(game, bear)).toBe("hand");
  });
});

describe("Raph & Leo, Sibling Rivals", () => {
  it("in the first combat, untaps two attackers and adds one more combat — and only one", () => {
    const { game, a } = table();
    const duo = spawn(game, "Raph & Leo, Sibling Rivals");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, duo, bear);
    attack(game, a, [duo, bear]);
    // Two combats of 2 + 2: the second one's trigger finds it isn't the first
    // combat phase, so there's no third.
    expect(life(game, B)).toBe(12);
  });
});

describe("Raphael, Ninja Destroyer", () => {
  it("adds {R} for the damage dealt to him, which lasts through the turn's steps", () => {
    const { game, a, b } = table();
    const raph = spawn(game, "Raphael, Ninja Destroyer");
    const blockers = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    b.declareBlockersFn = () => blockers.map((blocker) => ({ blocker, attacker: raph }));
    attack(game, a, [raph]);
    expect(zone(game, raph)).toBe("graveyard");
    // 2 + 2 damage at once, still in the pool in postcombat main.
    expect(manaOf(game, "R")).toBe(4);
  });
});

describe("Sally Pride, Lioness Leader", () => {
  it("makes a 2/2 Mutant for each nontoken creature you control, herself included", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Mutant Token");
    spawn(game, "Grizzly Bears", B);
    enter(game, "Sally Pride, Lioness Leader");
    // The Bears and Sally: two nontoken creatures; the token and bob's don't count.
    expect(tokensNamed(game, "Mutant Token", A)).toBe(3);

  });
});
