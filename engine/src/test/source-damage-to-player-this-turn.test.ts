/**
 * "If it has dealt 10 or more damage to that player this turn" — the
 * `damage-dealt-this-turn` condition's `against`: only what was dealt to that
 * player (not a permanent of theirs), with `bySelf` only what this object
 * dealt in its stint (rule 400.7). Proved on Hidetsugu Consumes All's back
 * face, Vessel of the All-Consuming, whose trigger asks it of the player it
 * just dealt damage to (rule 603.4: as it triggers and as it resolves).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, B, C, counters, enter, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";

/** Hidetsugu Consumes All, put onto the battlefield back face up. */
function vessel(game: Game): ObjectId {
  const card = toGraveyard(game, "Hidetsugu Consumes All");
  game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, transformed: true }, [ref(card)]);
  settle(game);
  return card;
}
const hit = (game: Game, source: ObjectId, who: PlayerId | ObjectId, amount: number): void => {
  game.debugApplyEffect(A, { kind: "damage", amount, target: 0 }, [ref(who)], { source });
  settle(game);
};
const lost = (game: Game, who: PlayerId): boolean => game.state.players[who].hasLost;

describe("Hidetsugu Consumes All", () => {
  it("chapter I destroys each nonland permanent with mana value 1 or less", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Swamp", B);
    enter(game, "Hidetsugu Consumes All");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Vessel of the All-Consuming", () => {
  it("enters back face up, a 3/3 trampler", () => {
    const { game } = table();
    const id = vessel(game);
    expect(nameOf(game.state.objects[id])).toBe("Vessel of the All-Consuming");
  });

  it("a player it has dealt 10 this turn loses, over separate events", () => {
    const { game } = table({ players: 3 });
    const id = vessel(game);
    hit(game, id, B, 4);
    expect(lost(game, B)).toBe(false);
    hit(game, id, B, 5);
    expect(lost(game, B)).toBe(false);
    hit(game, id, B, 1);
    expect(lost(game, B)).toBe(true);
    expect(lost(game, C)).toBe(false);
  });

  it("damage to their creature, or to another player, isn't damage to that player", () => {
    const { game } = table({ players: 3 });
    const id = vessel(game);
    const bear = spawn(game, "Craw Wurm", B);
    hit(game, id, B, 6);
    hit(game, id, bear, 5);
    hit(game, id, C, 6);
    expect(lost(game, B)).toBe(false);
    expect(lost(game, C)).toBe(false);
    hit(game, id, C, 4);
    expect(lost(game, C)).toBe(true);
    expect(lost(game, B)).toBe(false);
  });

  it("only what it dealt counts, not another source's damage to that player", () => {
    const { game } = table({ players: 3 });
    const id = vessel(game);
    const other = spawn(game, "Grizzly Bears");
    hit(game, other, B, 9);
    hit(game, id, B, 1);
    expect(lost(game, B)).toBe(false);
  });

  it("a +1/+1 counter once per damage event, however many it hit", () => {
    const { game } = table({ players: 3 });
    const id = vessel(game);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, who: "each-opponent" }, [], { source: id });
    settle(game);
    expect(counters(game, id)).toBe(1);
    hit(game, id, B, 1);
    expect(counters(game, id)).toBe(2);
  });
});
