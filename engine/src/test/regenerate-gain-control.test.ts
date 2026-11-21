/**
 * A regeneration shield that carries an effect "if it regenerates this way"
 * (the `regenerate` effect's `ifRegenerates`, rule 701.19a): Debt of
 * Loyalty — "Regenerate target creature. You gain control of that creature if
 * it regenerates this way." The effect runs only when that shield is the one
 * used; beside a plain shield, the creature's controller chooses (616.1).
 */
import { describe, expect, it } from "vitest";

import type { ReplacementOrderOffer } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, controller, destroy, lands, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

const debt = (game: Game, target: ObjectId): void => {
  lands(game, "Plains", 3);
  cast(game, toHand(game, "Debt of Loyalty"), { targets: [ref(target)] });
};

const doomBlade = (game: Game, target: ObjectId): void => {
  lands(game, "Swamp", 2);
  cast(game, toHand(game, "Doom Blade"), { targets: [ref(target)] });
};

describe("Debt of Loyalty", () => {
  it("destroyed, the creature regenerates and its caster gains control of it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    debt(game, bears);
    expect(controller(game, bears)).toBe(B);
    expect(game.state.objects[bears].regenerationShields).toBe(1);
    doomBlade(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].regenerationShields).toBeUndefined();
    expect(game.state.objects[bears].regenerationRiders).toBeUndefined();
    // The control effect lasts past the turn.
    nextTurn(game);
    expect(controller(game, bears)).toBe(A);
  });

  it("lethal damage's destruction (704.5g) regenerates it this way too", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    debt(game, bears);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(controller(game, bears)).toBe(A);
  });

  it("a shield never used gives nothing, and is gone at cleanup", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    debt(game, bears);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
    expect(game.state.objects[bears].regenerationRiders).toBeUndefined();
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("\"can't be regenerated\" gets past it, and no control changes", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    debt(game, bears);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Terminate"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[bears].owner).toBe(B);
  });

  it("beside a plain shield, the creature's controller chooses which applies (616.1)", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].regenerationShields = 1;
    debt(game, bears);
    expect(game.state.objects[bears].regenerationShields).toBe(2);
    const asked: ReplacementOrderOffer[] = [];
    b.chooseReplacementOrderFn = (_view, offer) => {
      asked.push(offer);
      return offer.options.findIndex((o) => o.name === "Regeneration");
    };
    doomBlade(game, bears);
    expect(asked).toHaveLength(1);
    expect(asked[0].options.map((o) => o.name)).toEqual(["Regeneration", "Debt of Loyalty"]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    // Debt's shield is still there for the next destruction.
    expect(game.state.objects[bears].regenerationShields).toBe(1);
    expect(game.state.objects[bears].regenerationRiders).toHaveLength(1);
    doomBlade(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });

  it("its controller can take the Debt's shield instead", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].regenerationShields = 1;
    debt(game, bears);
    b.chooseReplacementOrderFn = (_view, offer) => offer.options.findIndex((o) => o.name === "Debt of Loyalty");
    doomBlade(game, bears);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].regenerationShields).toBe(1);
    expect(game.state.objects[bears].regenerationRiders).toBeUndefined();
  });

  it("on alice's own creature, she simply keeps it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    debt(game, bears);
    doomBlade(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});
