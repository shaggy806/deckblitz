/**
 * "It blocks each attacking creature this turn if able" (Blaze of Glory):
 * `must-block`'s `each`, one requirement per attacker the creature can block
 * (rule 509.1c), so with "can block any number of creatures" it has to block
 * every one it can. And "target creature defending player controls" finds
 * one before attackers are declared: every opponent of the attacking player
 * is a defending player through the combat phase (rules 506.2, 802.2).
 */

import { describe, expect, it } from "vitest";

import { blockingViolations, obeyingLure } from "../combat/blocking.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, D, blockOffer, cast, lands, ref, spawn, table, toHand, toStep } from "./harness.js";

function blazeOn(game: Game, target: ObjectId): void {
  toStep(game, "begin-combat");
  lands(game, "Plains", 1);
  cast(game, toHand(game, "Blaze of Glory"), { targets: [ref(target)] });
}

describe("Blaze of Glory", () => {
  it("can't be cast in a main phase", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Stone", B);
    lands(game, "Plains", 1);
    const blaze = toHand(game, "Blaze of Glory");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: blaze, targets: [ref(wall)] })).not.toBeNull();
  });

  it("targets a defending player's creature in the beginning of combat, not your own", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Stone", B);
    const mine = spawn(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    lands(game, "Plains", 1);
    const blaze = toHand(game, "Blaze of Glory");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: blaze, targets: [ref(mine)] })).toMatch(/target/i);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: blaze, targets: [ref(wall)] })).toBeNull();
  });

  it("the creature has to block every attacker it can", () => {
    const { game, a } = table();
    const wall = spawn(game, "Wall of Stone", B);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const crow = spawn(game, "Storm Crow");
    blazeOn(game, wall);
    const offer = blockOffer(game, a, [...bears, crow]);
    // It can't block the flyer, so that's no requirement.
    expect(offer.blockRequirements).toEqual(bears.map((attacker) => ({ blocker: wall, attacker })));
    expect(blockingViolations([{ blocker: wall, attacker: bears[0] }], offer).map((v) => v.kind)).toEqual(["block-requirement"]);
    expect(blockingViolations([], offer).map((v) => v.kind)).toEqual(["block-requirement"]);
    const all = bears.map((attacker) => ({ blocker: wall, attacker }));
    expect(blockingViolations(all, offer)).toEqual([]);
    // The bots' fix-up puts it on every one.
    expect(obeyingLure([], offer)).toEqual(all);
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: all.slice(0, 2) })).toThrow(/block/i);
    game.dispatch({ type: "declare-blockers", player: B, blocks: all });
    expect(game.state.objects[wall].blocking).toBeDefined();
  });

  it("with one attacker it just blocks that one", () => {
    const { game, a } = table();
    const wall = spawn(game, "Wall of Stone", B);
    const bear = spawn(game, "Grizzly Bears");
    blazeOn(game, wall);
    const offer = blockOffer(game, a, [bear]);
    expect(blockingViolations([], offer).map((v) => v.kind)).toEqual(["block-requirement"]);
    expect(blockingViolations([{ blocker: wall, attacker: bear }], offer)).toEqual([]);
  });

  it("in a four-player game, any opponent's creature can be the target before attacks", () => {
    const { game } = table({ players: 4 });
    const theirs = spawn(game, "Wall of Stone", D);
    toStep(game, "begin-combat");
    lands(game, "Plains", 1);
    const blaze = toHand(game, "Blaze of Glory");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: blaze, targets: [ref(theirs)] })).toBeNull();
  });
});
