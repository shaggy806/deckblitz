/**
 * Recheck R3, group A (B237): cards whose old blockers were built since triage — Armored
 * Skyhunter and Cursed Totem, on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { A, attack, lands, pickFromZone, pickPermanents, ref, spawn, table, toLibrary, zone } from "./harness.js";

describe("Armored Skyhunter", () => {
  it("puts an Equipment from the top six onto the battlefield and may attach it to a creature you control", () => {
    const { game, a } = table();
    const sword = toLibrary(game, "Bonesplitter");
    const hunter = spawn(game, "Armored Skyhunter");
    const bear = spawn(game, "Grizzly Bears");
    pickFromZone(a, sword);
    const choice = pickPermanents(a, bear);
    attack(game, a, [hunter]);
    expect(zone(game, sword)).toBe("battlefield");
    expect(choice.offered).toContain(bear);
    expect(game.state.objects[sword].attachedTo).toBe(bear);
  });

  it("leaves the Equipment unattached when no creature is chosen, the rest on the bottom", () => {
    const { game, a } = table();
    const sword = toLibrary(game, "Bonesplitter");
    const hunter = spawn(game, "Armored Skyhunter");
    pickFromZone(a, sword);
    pickPermanents(a);
    attack(game, a, [hunter]);
    expect(zone(game, sword)).toBe("battlefield");
    expect(game.state.objects[sword].attachedTo ?? null).toBeNull();
  });
});

describe("Cursed Totem", () => {
  it("stops a creature's mana ability, but not once the Totem is gone", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves");
    const action = { type: "activate-ability", player: A, source: elves, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch(action)).toBeNull();
    spawn(game, "Cursed Totem");
    expect(game.canDispatch(action)).not.toBeNull();
  });

  it("leaves an artifact's activated ability alone", () => {
    const { game } = table();
    spawn(game, "Cursed Totem");
    const sword = spawn(game, "Bonesplitter");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const equip = { type: "activate-ability", player: A, source: sword, abilityIndex: 0, targets: [ref(bear)] } as const;
    expect(game.canDispatch(equip)).toBeNull();
  });
});
