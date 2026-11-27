/**
 * `damagedThisTurnBy: { combat }` — what damaged a permanent this turn, told
 * apart by combat and noncombat damage (rule 120.2a): each `DamageHistory`
 * source carries `combat` when it was combat damage. Grisly Sigil's "if it
 * was dealt noncombat damage this turn".
 */

import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, cast, lands, life, ref, registryOf, settle, spawn, table, toHand } from "./harness.js";
import type { Game } from "../game.js";

const noncombat = (game: Game, id: ObjectId): boolean =>
  matchesFilter(game.state, registryOf(game), id, { damagedThisTurnBy: { combat: false } }, { you: A });
const combat = (game: Game, id: ObjectId): boolean =>
  matchesFilter(game.state, registryOf(game), id, { damagedThisTurnBy: { combat: true } }, { you: A });

describe("dealt noncombat damage this turn", () => {
  it("a spell's damage is noncombat; a blocker's is combat", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(noncombat(game, giant)).toBe(true);
    expect(combat(game, giant)).toBe(false);

    const bears = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    attack(game, a, [bears]);
    expect(combat(game, wall)).toBe(true);
    expect(noncombat(game, wall)).toBe(false);
  });

  it("Grisly Sigil: 1 damage and 1 life to a creature not dealt noncombat damage", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Grisly Sigil"), { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(life(game)).toBe(21);
  });

  it("Grisly Sigil: 3 damage and 3 life once it was dealt noncombat damage", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 1);
    const wurm = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(wurm)] });
    cast(game, toHand(game, "Grisly Sigil"), { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(5);
    expect(life(game)).toBe(23);
  });

  it("Grisly Sigil: combat damage alone doesn't count", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", A);
    const wurm = spawn(game, "Craw Wurm", B);
    b.declareBlockersFn = () => [{ blocker: wurm, attacker: bears }];
    attack(game, a, [bears]);
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    cast(game, toHand(game, "Grisly Sigil"), { targets: [ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    expect(life(game)).toBe(21);
  });

  it("Grisly Sigil with casualty: the copy's 1 damage makes the original's 3 (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", A);
    const wurm = spawn(game, "Colossal Dreadmaw", B);
    a.choosePermanentsFn = () => [bears];
    cast(game, toHand(game, "Grisly Sigil"), { targets: [ref(wurm)], settle: false });
    settle(game);
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(4);
    expect(life(game)).toBe(24);
  });
});
