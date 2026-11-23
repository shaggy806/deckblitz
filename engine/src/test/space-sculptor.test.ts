/**
 * Space sculptor (rule 702.158 — Space Beleren): sector designations, chosen
 * as a state-based action with opponents first (704.5u), kept until no player
 * controls a permanent with space sculptor, the +1's same-sector blocking and
 * the "sector of your choice" abilities (702.158d).
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { Sector } from "../state.js";
import { A, B, blockOffer, cast, counters, destroy, enter, lands, loyalty, pickModes, settle, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";

/** Space Beleren cast and resolved, as it enters in play: the state-based
 * check runs as it resolves. */
function castBeleren(game: Game): ObjectId {
  lands(game, "Plains", 2);
  lands(game, "Island", 2);
  const card = toHand(game, "Space Beleren");
  cast(game, card);
  return card;
}

/** A spell cast and resolved: something that checks state-based actions,
 * which the harness's debug entries and destructions don't. */
const checkNow = (game: Game): void => cast(game, toHand(game, "Mox Opal"));

const sectorOf = (game: Game, id: ObjectId): Sector | undefined => game.state.objects[id].sector;

/** Each seat answers a sector question from `answers` (by creature), and
 * records the order it was asked in. */
function answerSectors(seats: readonly ScriptedController[], answers: Map<ObjectId, string>, asked: ObjectId[]): void {
  for (const seat of seats) {
    seat.chooseCreatureTypeFn = (_view, source, options) => {
      asked.push(source);
      return answers.get(source) ?? options[0];
    };
  }
}

describe("space sculptor", () => {
  it("assigns every creature a sector, opponents first, and new creatures as they come", () => {
    const { game, a: seatA, b: seatB } = table();
    const seats = [seatA, seatB];
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    const asked: ObjectId[] = [];
    answerSectors(seats, new Map([[mine, "beta"], [theirs, "gamma"]]), asked);
    castBeleren(game);
    // Bob controls no permanent with space sculptor: he assigns first though
    // it's Alice's turn (704.5u).
    expect(asked).toEqual([theirs, mine]);
    expect(sectorOf(game, mine)).toBe("beta");
    expect(sectorOf(game, theirs)).toBe("gamma");
    const late = enter(game, "Llanowar Elves", B);
    checkNow(game);
    expect(sectorOf(game, late)).toBe("alpha");
    expect(asked).toHaveLength(3);
  });

  it("ends the designations once no one controls a permanent with space sculptor", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const beleren = castBeleren(game);
    expect(sectorOf(game, bears)).toBe("alpha");
    destroy(game, beleren);
    checkNow(game);
    expect(zone(game, beleren)).toBe("graveyard");
    expect(sectorOf(game, bears)).toBeUndefined();
  });

  it("a token stack's tokens may go to different sectors, or all to one", () => {
    const { game, a: seatA, b: seatB } = table();
    const seats = [seatA, seatB];
    const goblins = spawn(game, "Goblin Token", B);
    game.state.objects[goblins].stackCount = 3;
    let n = 0;
    // One token to gamma, then the other two together to beta.
    seats[1].chooseCreatureTypeFn = (_view, _source, options) => {
      n += 1;
      expect(options).toContain("all alpha");
      return n === 1 ? "gamma" : "all beta";
    };
    castBeleren(game);
    const tokens = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Goblin Token");
    const bySector = tokens.map((id) => [sectorOf(game, id), game.state.objects[id].stackCount ?? 1]);
    expect(bySector).toContainEqual(["gamma", 1]);
    expect(bySector).toContainEqual(["beta", 2]);
    expect(n).toBe(2);
  });

  it("−1 puts a +1/+1 counter on each creature in the chosen sector only", () => {
    const { game, a: seatA, b: seatB } = table();
    const seats = [seatA, seatB];
    const ours = spawn(game, "Grizzly Bears", A);
    const b = spawn(game, "Grizzly Bears", B);
    const c = spawn(game, "Grizzly Bears", B);
    answerSectors(seats, new Map([[ours, "beta"], [b, "beta"], [c, "gamma"]]), []);
    const beleren = castBeleren(game);
    pickModes(seats[0], 1);
    loyalty(game, beleren, -1);
    settle(game);
    expect([counters(game, ours), counters(game, b), counters(game, c)]).toEqual([1, 1, 0]);
  });

  it("−5 from exactly five loyalty still finds its sector after Space Beleren dies to the cost", () => {
    const { game, a: seatA, b: seatB } = table();
    const seats = [seatA, seatB];
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    answerSectors(seats, new Map([[mine, "alpha"], [theirs, "gamma"]]), []);
    const beleren = castBeleren(game);
    pickModes(seats[0], 2);
    loyalty(game, beleren, -5, { atLeast: 5 });
    settle(game);
    expect(zone(game, beleren)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    // And with the ability gone, the designations end (702.158b).
    expect(sectorOf(game, mine)).toBeUndefined();
  });

  it("+1: a creature in a sector can be blocked only by creatures in the same sector", () => {
    const { game, a: seatA, b: seatB } = table();
    const seats = [seatA, seatB];
    const attacker = spawn(game, "Grizzly Bears", A);
    const same = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    answerSectors(seats, new Map([[attacker, "beta"], [same, "beta"], [other, "alpha"]]), []);
    const beleren = castBeleren(game);
    loyalty(game, beleren, 1);
    settle(game);
    const offer = blockOffer(game, seats[0], [attacker]);
    const canBlock = (id: ObjectId): boolean =>
      offer.eligible.find((e) => e.blocker === id)?.canBlock.includes(attacker) === true;
    expect(canBlock(same)).toBe(true);
    expect(canBlock(other)).toBe(false);
  });

  it("without the +1, sectors don't limit blocks", () => {
    const { game, a: seatA, b: seatB } = table();
    const seats = [seatA, seatB];
    const attacker = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Grizzly Bears", B);
    answerSectors(seats, new Map([[attacker, "beta"], [other, "alpha"]]), []);
    castBeleren(game);
    const offer = blockOffer(game, seats[0], [attacker]);
    expect(offer.eligible.find((e) => e.blocker === other)?.canBlock).toContain(attacker);
  });
});
