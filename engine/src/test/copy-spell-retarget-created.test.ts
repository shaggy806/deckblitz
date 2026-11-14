/**
 * A spell copy aimed at the token the same effect just created (rule 707.10e
 * — `copy-spell`'s `retargetTo: "created"`): Frontline Heroism's "create a
 * 1/1 red Soldier creature token with haste, then copy that spell. The copy
 * targets that token." Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, enter, lands, pt, ref, spawn, table, toHand, tokensNamed } from "./harness.js";

const SOLDIER = "1/1 Red Soldier Token";
const soldiers = (game: Game): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].isToken === true && game.state.objects[id].cardName === SOLDIER);

// A spell whose target the new 1/1 can't be: no copy.
const BIG = "Test Big Blessing";
const bigBlessing = defineCard({
  name: BIG,
  manaCost: "{0}",
  types: ["instant"],
  text: "Target creature you control with power 2 or greater gets +3/+3 until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 2 } } }],
  effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
});

describe("Frontline Heroism", () => {
  it("makes a 1/1 red Soldier with haste as it enters", () => {
    const { game } = table();
    enter(game, "Frontline Heroism");
    expect(tokensNamed(game, SOLDIER, A)).toBe(1);
  });

  it("a spell targeting only your creature: a new Soldier, and a copy of the spell aimed at it", () => {
    const { game } = table();
    enter(game, "Frontline Heroism");
    const [first] = soldiers(game);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    const made = soldiers(game).filter((id) => id !== first);
    expect(made).toHaveLength(1);
    expect(pt(game, made[0])).toEqual({ power: 4, toughness: 4 });
    // The Soldier already there isn't the one the copy targets.
    expect(pt(game, first)).toEqual({ power: 1, toughness: 1 });
  });

  it("a spell targeting an opponent's creature doesn't trigger it", () => {
    const { game } = table();
    spawn(game, "Frontline Heroism");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(soldiers(game)).toHaveLength(0);
    expect(pt(game, theirs)).toEqual({ power: 5, toughness: 5 });
  });

  it("when the token can't be the copy's target, there's no copy — the token stays", () => {
    const { game } = table({ ownRegistry: true });
    game.registry.register(bigBlessing);
    spawn(game, "Frontline Heroism");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, BIG), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    const made = soldiers(game);
    expect(made).toHaveLength(1);
    expect(pt(game, made[0])).toEqual({ power: 1, toughness: 1 });
  });
});
