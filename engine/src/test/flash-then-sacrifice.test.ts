/**
 * The Mirage block's "You may cast this spell as though it had flash. If you
 * cast it any time a sorcery couldn't have been cast, the controller of the
 * permanent it becomes sacrifices it at the beginning of the next cleanup
 * step" (`CardDefinition.flashThenSacrifice`), and the cleanup step's
 * priority window it needs (rule 514.3a).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, nextTurn, pickFromZone, pt, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("flash, then sacrificed at the next cleanup step", () => {
  it("cast in the end step: it's there until the cleanup step, then sacrificed", () => {
    const { game } = table({ step: "end" });
    spawn(game, "Forest", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const climb = toHand(game, "Spider Climb");
    cast(game, climb, { targets: [ref(bear)] });
    expect(zone(game, climb)).toBe("battlefield");
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 5 });
    // The delayed trigger goes on the stack in the cleanup step, and the
    // active player gets priority there (rule 514.3a).
    game.advanceUntil((s) => s.turn.step === "cleanup" && s.zones.shared.stack.length > 0);
    expect(zone(game, climb)).toBe("battlefield");
    expect(game.state.priority.holder).toBe(A);
    settle(game);
    expect(zone(game, climb)).toBe("graveyard");
    // Another cleanup step, then the next turn as usual.
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
  });

  it("cast on an opponent's turn, it's sacrificed at that turn's cleanup", () => {
    const { game } = table();
    spawn(game, "Forest", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const climb = toHand(game, "Spider Climb");
    toStep(game, "upkeep", B);
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.priority.holder === A);
    cast(game, climb, { targets: [ref(bear)] });
    expect(zone(game, climb)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, climb)).toBe("graveyard");
  });

  it("cast when a sorcery could have been, it stays", () => {
    const { game } = table();
    spawn(game, "Forest", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const climb = toHand(game, "Spider Climb");
    cast(game, climb, { targets: [ref(bear)] });
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, climb)).toBe("battlefield");
  });

  it("cast through another effect's flash, it stays (the ruling)", () => {
    const { game } = table({ step: "end" });
    spawn(game, "Vedalken Orrery", A);
    spawn(game, "Plains", A);
    spawn(game, "Plains", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const parapet = toHand(game, "Parapet");
    cast(game, parapet);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 3 });
    nextTurn(game);
    expect(zone(game, parapet)).toBe("battlefield");
  });
});

describe("a delayed trigger at the beginning of the next cleanup step", () => {
  it("Thawing Glaciers returns to hand in the cleanup step, after fetching a land", () => {
    const { game, a } = table({ deck: "Forest" });
    spawn(game, "Wastes", A);
    const glaciers = spawn(game, "Thawing Glaciers", A);
    game.state.objects[glaciers].tapped = false;
    pickFromZone(a, game.state.zones.perPlayer[A].library[0]);
    activate(game, glaciers);
    expect(zone(game, glaciers)).toBe("battlefield");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Forest")).toHaveLength(1);
    toStep(game, "end", A);
    expect(zone(game, glaciers)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, glaciers)).toBe("hand");
  });
});
