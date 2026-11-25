// Death by Dragons: each player but the target creates a 5/5 flying Dragon of
// their own — `create-token` over `{ otherThan: { target: 0 } }`.

import { describe, expect, it } from "vitest";

import { slotPolarities } from "../target-polarity.js";
import { A, B, C, D, cast, lands, ref, table, toHand, tokensNamed } from "./harness.js";

describe("Death by Dragons", () => {
  it("gives every player but the target a Dragon they control, the caster included", () => {
    const { game } = table({ players: 4, step: "precombat-main" });
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Death by Dragons"), { targets: [ref(B)] });
    expect([A, B, C, D].map((p) => tokensNamed(game, "Dragon Token", p))).toEqual([1, 0, 1, 1]);
    const dragon = game.battlefield.map((id) => game.state.objects[id]).find((o) => o.cardName === "Dragon Token");
    expect(dragon?.owner).toBe(dragon?.controller);
  });

  it("targeting yourself gives each opponent one and you none", () => {
    const { game } = table({ players: 4, step: "precombat-main" });
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Death by Dragons"), { targets: [ref(A)] });
    expect([A, B, C, D].map((p) => tokensNamed(game, "Dragon Token", p))).toEqual([0, 1, 1, 1]);
  });

  it("the bots read the player left out as an opponent's slot", () => {
    const { game } = table();
    const def = game.registry.get("Death by Dragons");
    expect(slotPolarities(def?.effect, 1)).toEqual(["harm"]);
  });
});
