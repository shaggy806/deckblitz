/**
 * B338, combat-targeting lane: Seasinger — "target creature whose controller
 * controls an Island" (`CardFilter.controllerControls`), held for as long as
 * you control Seasinger and it remains tapped.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, controller, lands, ref, settle, spawn, table, zone } from "./harness.js";

describe("Seasinger", () => {
  it("targets only creatures whose controller controls an Island", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 1);
    const singer = spawn(game, "Seasinger");
    const islanders = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1, B);
    const dry = spawn(game, "Grizzly Bears", C);
    lands(game, "Forest", 1, C);
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === singer);
    if (offer?.kind !== "activate-ability") throw new Error("Seasinger's ability wasn't offered");
    const options = offer.targetOptions[0].map((t) => (t.kind === "object" ? t.object : t.player));
    expect(options).toContain(islanders);
    expect(options).toContain(singer);
    expect(options).not.toContain(dry);
    activate(game, singer, 0, { targets: [ref(islanders)] });
    expect(controller(game, islanders)).toBe(A);
  });

  it("keeps the creature while tapped, though its old controller has no Island any more", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const singer = spawn(game, "Seasinger");
    const bears = spawn(game, "Grizzly Bears", B);
    const island = lands(game, "Island", 1, B)[0];
    activate(game, singer, 0, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    game.debugMove(island, "graveyard");
    settle(game);
    expect(controller(game, bears)).toBe(A);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(singer)]);
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("is sacrificed when its controller controls no Islands", () => {
    const { game } = table();
    const [island] = lands(game, "Island", 1);
    const singer = spawn(game, "Seasinger");
    game.debugMove(island, "graveyard");
    settle(game);
    expect(zone(game, singer)).toBe("graveyard");
  });
});
