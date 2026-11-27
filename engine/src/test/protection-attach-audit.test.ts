import { describe, expect, it } from "vitest";

import { A, activate, cast, lands, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): protection gained by a creature with things
 * already attached (rules 702.16c-d): an Aura of that quality is put into
 * its owner's graveyard (704.5m), an Equipment becomes unattached (704.5n).
 */
describe("protection and what's attached, audited", () => {
  it("Rancor on a creature that gains protection from green goes to the graveyard, and back to hand (rules 702.16c, 704.5m)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const rancor = toHand(game, "Rancor");
    cast(game, rancor, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "grant-protection", target: 0, from: { colors: ["G"] }, duration: "end-of-turn" }, [ref(bears)]);
    toStep(game, "postcombat-main");
    expect(zone(game, rancor)).toBe("hand");
  });

  it("an Equipment on a creature that gains protection from artifacts falls off and stays (rules 702.16d, 704.5n)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Wastes", 1);
    activate(game, splitter, 0, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "grant-protection", target: 0, from: { types: ["artifact"] }, duration: "end-of-turn" }, [ref(bears)]);
    settle(game);
    toStep(game, "postcombat-main");
    expect(zone(game, splitter)).toBe("battlefield");
    expect(game.state.objects[splitter].attachedTo).toBe(null);
  });
});
