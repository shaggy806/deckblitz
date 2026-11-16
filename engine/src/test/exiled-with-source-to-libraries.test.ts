/**
 * `put-on-libraries` of `what: { exiledWithSource }`: every card exiled with
 * the effect's source (rule 607.2a), those it exiled "until it leaves"
 * included (rule 610.3), on the bottom of their owners' libraries at once,
 * each owner arranging their own (rule 401.4). Trial of a Time Lord's IV,
 * written from its Oracle text and ruling.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  enter,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  watchTargets,
  zone,
} from "./harness.js";

/** One more lore counter on the Saga, its chapter ability resolved. */
function lore(game: Game, saga: ObjectId): void {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
  settle(game);
}

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Trial of a Time Lord", () => {
  it("I–III exile a nontoken creature an opponent controls each, until the Saga leaves", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant);
    const saga = enter(game, "Trial of a Time Lord");
    expect(zone(game, giant)).toBe("exile");
    pickTargets(a, bears);
    lore(game, saga);
    expect(zone(game, bears)).toBe("exile");
  });

  it("IV, guilty gets more votes: each owner's cards go to the bottom of their library, in the order they pick", () => {
    const { game, a, b, c } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", C);
    pickTargets(a, giant);
    const saga = enter(game, "Trial of a Time Lord");
    pickTargets(a, bears);
    lore(game, saga);
    pickTargets(a, ogre);
    lore(game, saga);
    expect([giant, bears, ogre].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    // Guilty is option 1: alice and carol for it, bob against.
    pickModes(a, 1);
    pickModes(b, 0);
    pickModes(c, 1);
    const asked = pickFromZone(b, bears, giant);
    lore(game, saga);
    expect(asked.offered).toEqual(expect.arrayContaining([giant, bears]));
    expect(library(game, B).slice(-2)).toEqual([bears, giant]);
    expect(library(game, C).at(-1)).toBe(ogre);
    // Sacrificed after IV, with nothing left exiled to return (the ruling).
    expect(zone(game, saga)).toBe("graveyard");
    expect(named(game, "Hill Giant", B)).toEqual([]);
    expect(named(game, "Gray Ogre", C)).toEqual([]);
  });

  it("the owner's order is theirs: the other order puts them the other way round", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, giant);
    const saga = enter(game, "Trial of a Time Lord");
    pickTargets(a, bears);
    lore(game, saga);
    lore(game, saga);
    pickModes(a, 1);
    pickModes(b, 1);
    pickFromZone(b, giant, bears);
    lore(game, saga);
    expect(library(game, B).slice(-2)).toEqual([giant, bears]);
  });

  it("IV, a tie: nothing goes to a library, and the cards return as the Saga is sacrificed", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const saga = enter(game, "Trial of a Time Lord");
    lore(game, saga);
    lore(game, saga);
    pickModes(a, 1);
    pickModes(b, 0);
    lore(game, saga);
    expect(zone(game, saga)).toBe("graveyard");
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
    expect(library(game, B)).not.toContain(giant);
  });

  it("a token can't be targeted", () => {
    const { game, a } = table();
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const [soldier] = named(game, "Soldier Token", B);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [giant]);
    enter(game, "Trial of a Time Lord");
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([giant, bears].sort());
    expect(zone(game, soldier)).toBe("battlefield");
  });
});
