/**
 * B338, combat-targeting lane: Season of the Witch — "destroy all untapped
 * creatures that didn't attack this turn, except for creatures that couldn't
 * attack", read from the `could-attack` journal entries made as each declare
 * attackers step begins (rule 508.1a).
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import { A, B, attack, cast, lands, nextTurn, ref, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

describe("Season of the Witch", () => {
  it("destroys the untapped creatures that could have attacked and didn't, and only those", () => {
    const { game, a } = table();
    spawn(game, "Season of the Witch");
    const attacker = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Grizzly Bears");
    const sick = spawn(game, "Llanowar Elves", A, { sick: true });
    const wall = spawn(game, "Wall of Stone");
    const bobs = spawn(game, "Grizzly Bears", B);
    attack(game, a, [attacker]);
    // Entered after the declaration: it couldn't have attacked this turn.
    const late = spawn(game, "Grizzly Bears");
    nextTurn(game);
    expect(zone(game, idle)).toBe("graveyard");
    for (const spared of [attacker, sick, wall, bobs, late]) expect(zone(game, spared)).toBe("battlefield");
  });

  it("spares a creature tapped as attackers were declared, untapped since", () => {
    const { game, a } = table();
    spawn(game, "Season of the Witch");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const idle = spawn(game, "Grizzly Bears");
    attack(game, a, []);
    game.state.objects[tapped].tapped = false;
    invalidateComputedCache();
    nextTurn(game);
    expect(zone(game, tapped)).toBe("battlefield");
    expect(zone(game, idle)).toBe("graveyard");
  });

  it("destroys a token split off a stack that could have attacked, as it does the rest of the stack", () => {
    const { game, a } = table();
    spawn(game, "Season of the Witch");
    lands(game, "Forest", 1);
    const stack = spawn(game, "Goblin Token");
    game.state.objects[stack].stackCount = 3;
    game.state.objects[stack].isToken = true;
    invalidateComputedCache();
    attack(game, a, []);
    // After the declaration, one Goblin singled out: split off the stack.
    expect(game.state.turn.step).toBe("postcombat-main");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(stack)] });
    expect(tokensNamed(game, "Goblin Token", A)).toBe(3);
    nextTurn(game);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(0);
  });

  it("spares everything on a turn whose player had nothing able to attack", () => {
    const { game } = table();
    spawn(game, "Season of the Witch");
    const sick = spawn(game, "Grizzly Bears", A, { sick: true });
    const bobs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    expect(zone(game, sick)).toBe("battlefield");
    expect(zone(game, bobs)).toBe("battlefield");
  });
});
