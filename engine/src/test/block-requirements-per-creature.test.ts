/**
 * Block requirements and prohibitions on one blocker (rules 509.1b-c):
 * "target creature can't block this creature this turn" (`restrict`'s
 * `cantBlockAttacker` — Kozilek's Pathfinder, Auriok Siege Sled), "blocks
 * this creature this turn if able" (`block-if-able` with `attacker:
 * "source"`), and "blocks each combat if able" as a static (the
 * `"must-block"` restriction — Razorgrass Screen, Iron Golem, Grand Melee),
 * which joins the blockers offer's `blockRequirements`.
 */

import { describe, expect, it } from "vitest";

import { blockingViolations } from "../combat/blocking.js";
import { defendersForAttacker } from "../combat/eligibility.js";
import { A, B, activate, blockOffer, lands, spawn, table } from "./harness.js";

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: string) =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("target creature can't block this creature this turn", () => {
  it("Kozilek's Pathfinder: the target may block another attacker, not it", () => {
    const { game, a } = table();
    const pathfinder = spawn(game, "Kozilek's Pathfinder", A);
    const other = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Wall of Wood", B);
    spawn(game, "Sol Ring", A);
    activate(game, pathfinder, 0, { targets: [{ kind: "object", object: wall }] });
    const offer = blockOffer(game, a, [pathfinder, other]);
    expect(canBlock(offer, wall)).toEqual([other]);
  });

  it("…only the Pathfinder it was: once it leaves and returns, the target may block it", () => {
    const { game } = table();
    const pathfinder = spawn(game, "Kozilek's Pathfinder", A);
    const wall = spawn(game, "Wall of Wood", B);
    spawn(game, "Sol Ring", A);
    activate(game, pathfinder, 0, { targets: [{ kind: "object", object: wall }] });
    const modifier = game.state.objects[wall].modifiers.find((m) => m.cantBlock !== undefined);
    expect(modifier?.cantBlock).toEqual([
      { object: pathfinder, zoneChangeCount: game.state.objects[pathfinder].zoneChangeCount ?? 0 },
    ]);
    expect(modifier?.untilEndOfTurn).toBe(true);
  });

  it("Auriok Siege Sled: one artifact creature must block it, another can't", () => {
    const { game, a } = table();
    const sled = spawn(game, "Auriok Siege Sled", A);
    const [lured, barred] = [0, 1].map(() => spawn(game, "Ornithopter", B));
    lands(game, "Plains", 2, A);
    activate(game, sled, 0, { targets: [{ kind: "object", object: lured }] });
    activate(game, sled, 1, { targets: [{ kind: "object", object: barred }] });
    const offer = blockOffer(game, a, [sled]);
    expect(canBlock(offer, barred)).toEqual([]);
    expect(offer.blockRequirements).toEqual([{ blocker: lured, attacker: sled }]);
  });
});

describe("blocks each combat if able", () => {
  it("Razorgrass Screen has to block when it can", () => {
    const { game, a } = table();
    const screen = spawn(game, "Razorgrass Screen", B);
    const attacker = spawn(game, "Grizzly Bears", A);
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.blockRequirements).toEqual([{ blocker: screen }]);
    expect(blockingViolations([], offer)).toEqual([{ kind: "block-requirement", blocker: screen }]);
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: [] })).toThrow(/must block if able/);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: screen, attacker }] });
    expect(game.state.objects[screen].blocking).not.toBeNull();
  });

  it("…but not one it can't block: no requirement is listed", () => {
    const { game, a } = table();
    const screen = spawn(game, "Razorgrass Screen", B);
    spawn(game, "Ornithopter", B); // so bob is asked at all
    const flyer = spawn(game, "Ornithopter", A);
    const offer = blockOffer(game, a, [flyer]);
    expect(canBlock(offer, screen)).toEqual([]);
    expect(offer.blockRequirements).toBeUndefined();
  });

  it("Iron Golem attacks on its controller's turn and blocks on another's", () => {
    const { game, a } = table();
    const golem = spawn(game, "Iron Golem", B);
    const mine = spawn(game, "Iron Golem", A);
    expect(defendersForAttacker(game.state, game.registry, A, mine)).toEqual([B]);
    const offer = blockOffer(game, a, [mine]);
    expect(offer.blockRequirements).toEqual([{ blocker: golem }]);
  });

  it("Grand Melee: every creature blocks if able", () => {
    const { game, a } = table();
    spawn(game, "Grand Melee", A);
    const [x, y] = [0, 1].map(() => spawn(game, "Grizzly Bears", B));
    const attacker = spawn(game, "Hill Giant", A);
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.blockRequirements).toEqual([{ blocker: x }, { blocker: y }]);
  });
});
