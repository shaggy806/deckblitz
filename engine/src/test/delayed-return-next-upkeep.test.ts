/**
 * A granted dies trigger that sets up a delayed return from the graveyard at
 * "the beginning of your next upkeep" (rule 603.7): Breathkeeper Seraph. The
 * card comes back only while it's still the same object in the graveyard
 * (rule 400.7), under its owner's control, if its controller chooses.
 */

import { describe, expect, it } from "vitest";

import { A, B, destroy, enter, nextTurn, pickModes, pickPermanents, settle, spawn, table, toStep, zone } from "./harness.js";

/** Alice's next upkeep, with what happens at its beginning resolved. */
const toAliceUpkeep = (game: ReturnType<typeof table>["game"]): void => {
  nextTurn(game);
  toStep(game, "upkeep", A);
  settle(game);
};

describe("Breathkeeper Seraph", () => {
  it("a paired creature that dies returns at its controller's next upkeep, not before", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    enter(game, "Breathkeeper Seraph");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    // Bob's upkeep isn't Alice's.
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    pickModes(a, 0);
    toAliceUpkeep(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("may be declined", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    enter(game, "Breathkeeper Seraph");
    destroy(game, bears);
    pickModes(a);
    toAliceUpkeep(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("the Seraph itself has it while paired", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    const seraph = enter(game, "Breathkeeper Seraph");
    destroy(game, seraph);
    pickModes(a, 0);
    toAliceUpkeep(game);
    expect(zone(game, seraph)).toBe("battlefield");
  });

  it("a card that left the graveyard since is a new object, and stays where it is", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    enter(game, "Breathkeeper Seraph");
    destroy(game, bears);
    game.debugMove(bears, "exile");
    game.debugMove(bears, "graveyard");
    pickModes(a, 0);
    toAliceUpkeep(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("an unpaired creature has nothing to return it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    enter(game, "Breathkeeper Seraph");
    destroy(game, bears);
    pickModes(a, 0);
    toAliceUpkeep(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
