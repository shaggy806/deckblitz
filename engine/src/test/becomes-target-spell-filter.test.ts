/**
 * `becomes-target`'s `spellFilter`: only a spell matching it, read as it is
 * on the stack, triggers — "becomes the target of an instant or sorcery
 * spell". Proved on Silverfur Partisan and Wild Defiance.
 */
import { describe, expect, it } from "vitest";

import { A, activate, cast, lands, pt, ref, spawn, table, tokensNamed, toHand } from "./harness.js";

describe("Silverfur Partisan", () => {
  it("makes a Wolf when an instant targets a Wolf you control, itself included", () => {
    const { game } = table();
    const partisan = spawn(game, "Silverfur Partisan", A);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(partisan)] });
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
    expect(pt(game, partisan)).toEqual({ power: 5, toughness: 5 });
  });

  it("doesn't trigger for an Aura spell, an ability, or a non-Wolf", () => {
    const { game } = table();
    const partisan = spawn(game, "Silverfur Partisan", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Rancor"), { targets: [ref(partisan)] });
    const sorcerer = spawn(game, "Prodigal Sorcerer", A);
    activate(game, sorcerer, 0, { targets: [ref(partisan)] });
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Wolf Token", A)).toBe(0);
  });
});

describe("Wild Defiance", () => {
  it("gives a creature you control +3/+3 when an instant or sorcery targets it, not an ability", () => {
    const { game } = table();
    spawn(game, "Wild Defiance", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const sorcerer = spawn(game, "Prodigal Sorcerer", A);
    activate(game, sorcerer, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    // Given +3/+3 as Shock is cast, it survives 3 damage in all.
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(game.state.objects[bears].damageMarked).toBe(3);
  });
});
