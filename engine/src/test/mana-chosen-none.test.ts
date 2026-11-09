import { describe, expect, it } from "vitest";
import { A, activate, spawn, table } from "./harness.js";

/**
 * "Add one mana of the chosen color" from an object with no colour chosen
 * adds nothing — not a colour of the player's choice (Shimmerwilds Growth's
 * and Gauntlet of Power's rulings). Only an object that never entered in the
 * way that asks can be here: a copy made some other way, an object becoming one.
 */
describe("the chosen colour, with none chosen", () => {
  it("an effect on the stack adds no mana", () => {
    const { game } = table();
    const banner = spawn(game, "Heraldic Banner");
    expect(game.state.objects[banner].chosenOnEnter ?? null).toBeNull();
    game.debugApplyEffect(A, { kind: "add-mana", mana: "chosen", amount: 1 }, [], {
      source: banner,
    });
    expect(game.state.awaiting ?? null).toBeNull();
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("Shimmerwilds Growth's trigger adds nothing beside the land's own mana", () => {
    const { game } = table();
    const land = spawn(game, "Wastes");
    const growth = spawn(game, "Shimmerwilds Growth");
    game.state.objects[growth].attachedTo = land;
    const action = game.legalActions(A).find((x) => x.kind === "activate-ability" && x.source === land);
    if (action === undefined || action.kind !== "activate-ability") throw new Error("no mana ability");
    activate(game, land, action.abilityIndex);
    expect(game.state.awaiting ?? null).toBeNull();
    expect(game.state.players[A].manaPool.map((unit) => unit.type)).toEqual(["C"]);
  });

  it("a chosen colour still adds that colour", () => {
    const { game } = table();
    const banner = spawn(game, "Heraldic Banner");
    game.state.objects[banner].chosenOnEnter = "R";
    game.debugApplyEffect(A, { kind: "add-mana", mana: "chosen", amount: 1 }, [], {
      source: banner,
    });
    expect(game.state.players[A].manaPool.map((unit) => unit.type)).toEqual(["R"]);
  });
});
