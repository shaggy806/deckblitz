/**
 * "It **gains** 'If this creature would leave the battlefield, exile it instead of putting it
 * anywhere else'" (Geth, Thane of Contracts; Llanowar Greenwidow) is an ability, granted in layer
 * 6 — so losing all abilities afterwards takes it away (rule 613.1f) — while Whip of Erebos's "If
 * it would leave the battlefield, exile it instead" is a replacement effect of the resolution,
 * which no loss of abilities touches.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import { A, activate, cast, destroy, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const frog = (game: ReturnType<typeof table>["game"], target: ObjectId): void => {
  lands(game, "Island", 2);
  cast(game, toHand(game, "Turn to Frog"), { targets: [ref(target)] });
};

describe("the exile-if-it-would-leave ability (613.1f)", () => {
  it("granted as an ability: exiled when it leaves", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, exileIfItWouldLeave: "ability" }, [ref(giant)]);
    settle(game);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("exile");
  });

  it("granted as an ability: lost to a later loss of all abilities (Turn to Frog), so it dies", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, exileIfItWouldLeave: "ability" }, [ref(giant)]);
    settle(game);
    frog(game, giant);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Whip of Erebos's effect is no ability: exiled even after Turn to Frog", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, exileIfItWouldLeave: true }, [ref(giant)]);
    settle(game);
    frog(game, giant);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("exile");
  });

  it("Llanowar Greenwidow returns from the graveyard tapped, domain-discounted, and is exiled when it leaves", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    // Five basic land types: {7}{G} becomes {2}{G}.
    lands(game, "Forest", 2);
    const widow = toGraveyard(game, "Llanowar Greenwidow");
    activate(game, widow);
    expect(zone(game, widow)).toBe("battlefield");
    expect(game.state.objects[widow].tapped).toBe(true);
    destroy(game, widow);
    expect(zone(game, widow)).toBe("exile");
  });

  it("Geth's returned creature carries the ability", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const geth = spawn(game, "Geth, Thane of Contracts");
    const giant = toGraveyard(game, "Hill Giant");
    activate(game, geth, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].exileIfItWouldLeave).toBeUndefined();
    destroy(game, giant);
    expect(zone(game, giant)).toBe("exile");
  });
});
