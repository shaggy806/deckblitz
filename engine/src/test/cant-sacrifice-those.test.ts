/**
 * "You can't sacrifice those creatures this turn" (Call for Aid) — the
 * `cant-be-sacrificed` effect's `filter` and `by`: a rule over one player and
 * the permanents an effect names as it resolves (rule 611.2c), not an ability
 * they gain. Rule 701.21a: only a permanent's controller sacrifices it. The
 * card's rulings: asked to sacrifice one, you can't and it stays; with another
 * creature to give, you must give that one; none of them pays a sacrifice
 * cost. And "you can't attack that player this turn".
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  keywords,
  lands,
  life,
  nextTurn,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

function stolen(players: 2 | 3 = 2) {
  const t = table({ players });
  const { game } = t;
  lands(game, "Mountain", 5);
  lands(game, "Swamp", 2);
  const bears = spawn(game, "Grizzly Bears", B);
  const giant = spawn(game, "Hill Giant", B, { tapped: true });
  const seer = spawn(game, "Viscera Seer", A);
  cast(game, toHand(game, "Call for Aid"), { targets: [ref(B)] });
  return { ...t, bears, giant, seer };
}

describe("Call for Aid", () => {
  it("takes every creature the target opponent controls, untapped and hasty", () => {
    const { game, bears, giant } = stolen();
    for (const id of [bears, giant]) {
      expect(controller(game, id)).toBe(A);
      expect(game.state.objects[id].tapped).toBe(false);
      expect(keywords(game, id).has("haste")).toBe(true);
    }
  });

  it("none of them pays a sacrifice cost, though another creature does", () => {
    const { game, bears, seer } = stolen();
    expect(() => activate(game, seer, 0, { sacrifice: bears })).toThrow();
    expect(zone(game, bears)).toBe("battlefield");
    activate(game, seer, 0, { sacrifice: seer });
    expect(zone(game, seer)).toBe("graveyard");
  });

  it("an edict takes another creature, and nothing when those are all you have", () => {
    const { game, bears, giant, seer } = stolen();
    // The Seer is the one creature she can give, so nothing is asked.
    cast(game, toHand(game, "Innocent Blood"));
    expect(zone(game, seer)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    // Only the stolen creatures left: told to sacrifice one, you can't.
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Innocent Blood"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("names the player, not an ability of the creature, and ends with the turn", () => {
    const { game, bears } = stolen();
    expect(game.state.objects[bears].modifiers.some((m) => m.cantBeSacrificedBy === A)).toBe(true);
    expect(game.state.objects[bears].modifiers.some((m) => m.cantBeSacrificed === true)).toBe(false);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
    expect(game.state.objects[bears].modifiers.some((m) => m.cantBeSacrificedBy !== undefined)).toBe(false);
    // Back with bob, who may sacrifice it.
    const seer = spawn(game, "Viscera Seer", B);
    activate(game, seer, 0, { player: B, sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("you can't attack that player this turn, but another opponent is open", () => {
    const first = stolen(3);
    expect(() => attack(first.game, first.a, [first.bears], B)).toThrow();
    const second = stolen(3);
    attack(second.game, second.a, [second.bears, second.giant], C);
    expect(life(second.game, C)).toBe(15);
    expect(life(second.game, B)).toBe(20);
  });
});
