/**
 * Reconfigure (rule 702.151): two sorcery-speed abilities — attach to another creature you
 * control, unattach while attached — that let an Equipment creature equip (301.5c); attached,
 * it isn't a creature (702.151b), creature types and power and toughness gone, until it's
 * unattached from that creature, which an effect of the attaching rather than an ability
 * keeps true even if it loses its abilities.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, destroy, lands, pt, ref, spawn, subtypes, table, toStep, types } from "./harness.js";

describe("reconfigure (rule 702.151)", () => {
  it("attaches to another creature you control and stops being a creature until it's unattached", () => {
    const { game } = table();
    const boar = spawn(game, "Bronzeplate Boar");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 10);
    expect(types(game, boar)).toContain("creature");
    activate(game, boar, 0, { targets: [ref(bears)] });
    expect(game.state.objects[boar].attachedTo).toBe(bears);
    expect(types(game, boar)).not.toContain("creature");
    expect(types(game, boar)).toContain("artifact");
    expect(subtypes(game, boar)).toEqual(["Equipment"]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 4 });
    activate(game, boar, 1);
    expect(game.state.objects[boar].attachedTo).toBeNull();
    expect(types(game, boar)).toContain("creature");
    expect(subtypes(game, boar)).toContain("Boar");
  });

  it("can't attach to itself, and can't unattach while not attached", () => {
    const { game } = table();
    const boar = spawn(game, "Bronzeplate Boar");
    lands(game, "Mountain", 10);
    expect(() => activate(game, boar, 0, { targets: [ref(boar)] })).toThrow();
    expect(() => activate(game, boar, 1)).toThrow();
  });

  it("is a sorcery-speed ability", () => {
    const { game } = table();
    const boar = spawn(game, "Bronzeplate Boar");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    toStep(game, "upkeep", B);
    expect(() => activate(game, boar, 0, { targets: [ref(bears)] })).toThrow();
  });

  it("is a creature again once the creature it equips leaves", () => {
    const { game } = table();
    const boar = spawn(game, "Bronzeplate Boar");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    activate(game, boar, 0, { targets: [ref(bears)] });
    destroy(game, bears);
    // State-based actions unattach it (rule 704.5n) as a player would get priority.
    toStep(game, "postcombat-main");
    expect(game.state.objects[boar].attachedTo).toBeNull();
    expect(types(game, boar)).toContain("creature");
  });

  it("stays attached and not a creature if it loses its abilities (an effect of the attaching)", () => {
    const { game } = table();
    const boar = spawn(game, "Bronzeplate Boar");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    activate(game, boar, 0, { targets: [ref(bears)] });
    game.state.timestampSeq += 1;
    game.state.objects[boar].modifiers.push({
      power: 0,
      toughness: 0,
      keywords: [],
      untilEndOfTurn: false,
      loseAbilities: true,
      timestamp: game.state.timestampSeq,
    });
    toStep(game, "postcombat-main");
    expect(game.state.objects[boar].attachedTo).toBe(bears);
    expect(types(game, boar)).not.toContain("creature");
  });

  it("can't attack or block while attached, not being a creature", () => {
    const { game } = table();
    const boar = spawn(game, "Bronzeplate Boar");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    activate(game, boar, 0, { targets: [ref(bears)] });
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const offer = game.legalActions(A).find((a) => a.kind === "declare-attackers");
    expect(offer).toMatchObject({ eligible: [bears] });
  });

  it("moves from one creature to another", () => {
    const { game } = table();
    const boar = spawn(game, "Bronzeplate Boar");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 10);
    activate(game, boar, 0, { targets: [ref(x)] });
    activate(game, boar, 0, { targets: [ref(y)] });
    expect(game.state.objects[boar].attachedTo).toBe(y);
    expect(types(game, boar)).not.toContain("creature");
    expect(pt(game, x)).toEqual({ power: 2, toughness: 2 });
  });

  it("falls off if something makes it a creature again while attached (the March of the Machines ruling)", () => {
    const { game } = table();
    const boar = spawn(game, "Bronzeplate Boar");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    activate(game, boar, 0, { targets: [ref(bears)] });
    game.state.timestampSeq += 1;
    game.state.objects[boar].modifiers.push({
      power: 0,
      toughness: 0,
      keywords: [],
      untilEndOfTurn: false,
      addTypes: ["creature"],
      timestamp: game.state.timestampSeq,
    });
    toStep(game, "postcombat-main");
    expect(game.state.objects[boar].attachedTo).toBeNull();
  });
});
