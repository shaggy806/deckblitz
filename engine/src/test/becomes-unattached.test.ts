/**
 * "Whenever this Equipment becomes unattached from a permanent, sacrifice (destroy) that
 * permanent" (`becomes-unattached` — Grafted Exoskeleton, Grafted Wargear, Captain's Hook):
 * re-equipped, the Equipment itself leaving (read as it last existed, 603.10a), an effect
 * unattaching it; what it was on leaving fires it too, to no effect.
 */
import { describe, expect, it } from "vitest";

import { A, activate, destroy, keywords, lands, ref, settle, spawn, subtypes, table, toStep, zone } from "./harness.js";

describe("becomes unattached", () => {
  it("Grafted Exoskeleton destroyed: the creature it was on is sacrificed", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const exo = spawn(game, "Grafted Exoskeleton");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, exo, 0, { targets: [ref(bears)] });
    expect(game.state.objects[exo].attachedTo).toBe(bears);
    destroy(game, exo);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.eventsOfType("permanent-sacrificed").some((e) => e.object === bears)).toBe(true);
  });

  it("moved to another creature: the first is sacrificed, the second keeps it", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const exo = spawn(game, "Grafted Exoskeleton");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    activate(game, exo, 0, { targets: [ref(bears)] });
    activate(game, exo, 0, { targets: [ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[exo].attachedTo).toBe(giant);
  });

  it("an effect unattaching it fires it too", () => {
    const { game } = table();
    const wargear = spawn(game, "Grafted Wargear");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, wargear, 0, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "unattach", target: 0 } as never, [ref(wargear)]);
    settle(game);
    expect(game.state.objects[wargear].attachedTo).toBeNull();
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("the creature dying leaves the Equipment where it is", () => {
    const { game } = table();
    const wargear = spawn(game, "Grafted Wargear");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, wargear, 0, { targets: [ref(bears)] });
    destroy(game, bears);
    // The next state-based check unattaches it (704.5n).
    toStep(game, "begin-combat");
    expect(zone(game, wargear)).toBe("battlefield");
    expect(game.state.objects[wargear].attachedTo).toBeNull();
    expect(game.eventsOfType("permanent-unattached").some((e) => e.object === wargear && e.from === bears)).toBe(true);
  });

  it("Captain's Hook: a menace Pirate, destroyed when the Hook leaves", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const hook = spawn(game, "Captain's Hook");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, hook, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(subtypes(game, bears)).toContain("Pirate");
    destroy(game, hook);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.eventsOfType("permanent-destroyed").some((e) => e.object === bears)).toBe(true);
  });
});
