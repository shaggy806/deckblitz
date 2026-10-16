/**
 * Craft (rule 702.167a): "Craft with [materials] [cost]" — [Cost], exile this
 * permanent, exile the materials from among permanents you control and/or
 * cards in your graveyard: return this card to the battlefield transformed
 * under its owner's control, only as a sorcery. A type without "card" means
 * either a permanent or a graveyard card (702.167b), and the exiled materials
 * stay linked to what it becomes (702.167c). Oteclan Landmark crafts with an
 * artifact.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

import { A, activate, lands, pickFromZone, spawn, table, toGraveyard, toStep, tokensNamed, zone } from "./harness.js";

const craftOffered = (game: Game, landmark: ObjectId): boolean =>
  game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === landmark);

describe("craft", () => {
  it("needs a material: another artifact, on the battlefield or in the graveyard", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const landmark = spawn(game, "Oteclan Landmark");
    expect(craftOffered(game, landmark)).toBe(false);
    toGraveyard(game, "Ornithopter");
    expect(craftOffered(game, landmark)).toBe(true);
  });

  it("exiles it and the material, then returns it transformed, the material linked to it", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const landmark = spawn(game, "Oteclan Landmark");
    const onBoard = spawn(game, "Ornithopter");
    const inYard = toGraveyard(game, "Ornithopter");
    const seen = pickFromZone(a, inYard);
    activate(game, landmark, 0);
    expect(seen.offered).toEqual(expect.arrayContaining([onBoard, inYard]));
    expect(seen.offered).not.toContain(landmark);
    expect(zone(game, landmark)).toBe("battlefield");
    expect(printedCardName(game.state.objects[landmark])).toBe("Oteclan Levitator");
    expect(zone(game, inYard)).toBe("exile");
    expect(zone(game, onBoard)).toBe("battlefield");
    expect(game.state.objects[inYard].exiledWith).toEqual({
      source: landmark,
      zoneChangeCount: game.state.objects[landmark].zoneChangeCount ?? 0,
    });
  });

  it("only as a sorcery", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const landmark = spawn(game, "Oteclan Landmark");
    toGraveyard(game, "Ornithopter");
    toStep(game, "begin-combat");
    expect(craftOffered(game, landmark)).toBe(false);
  });

  it("takes one token from a stack of identical ones", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const landmark = spawn(game, "Oteclan Landmark");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 3 });
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
    a.chooseFromZoneFn = (_view, offered) => [offered[0]];
    activate(game, landmark, 0);
    expect(printedCardName(game.state.objects[landmark])).toBe("Oteclan Levitator");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("isn't crafted back if it left exile before the ability resolved", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const landmark = spawn(game, "Oteclan Landmark");
    const material = toGraveyard(game, "Ornithopter");
    pickFromZone(a, material);
    activate(game, landmark, 0, { settle: false });
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length > 0);
    // Out of exile and back: a new object (rule 400.7).
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "exile" }, [{ kind: "object", object: landmark }]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, landmark)).toBe("hand");
  });
});
