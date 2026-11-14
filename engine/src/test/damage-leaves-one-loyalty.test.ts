/**
 * Deification: "As this enchantment enters, choose a planeswalker type"
 * (rule 205.3j's list, `chooseOnEnter`, its own planeswalkers' types
 * suggested), hexproof for your planeswalkers of that type, and the
 * `damageLeavesOneLoyalty` replacement (rule 614.1a): damage that would remove
 * every loyalty counter from one of them removes all but one instead, while you
 * control a creature. The damage itself is all dealt (the ruling).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import { PLANESWALKER_TYPES } from "../subtypes.js";
import { A, B, cast, counters, keywords, lands, life, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

/** Alice's Deification, cast, naming `type` (and the menu it offered). */
function deify(type: string) {
  const t = table();
  const { a } = t;
  const offered: { options: readonly string[]; suggested: readonly string[] } = { options: [], suggested: [] };
  a.chooseCreatureTypeFn = (view, _source, options) => {
    const legal = view
      .legalActions()
      .find((x): x is Extract<LegalAction, { kind: "choose-creature-type" }> => x.kind === "choose-creature-type");
    offered.options = options;
    offered.suggested = legal?.suggested ?? [];
    return type;
  };
  return { ...t, offered };
}

const bolt = (game: ReturnType<typeof table>["game"], target: ObjectId, amount: number) =>
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [ref(target)]);

describe("Deification", () => {
  it("offers every planeswalker type, its controller's own first, and names the choice", () => {
    const { game, offered } = deify("Jace");
    spawn(game, "Jace Beleren");
    lands(game, "Plains", 2);
    const deification = toHand(game, "Deification");
    cast(game, deification);
    expect(offered.options).toEqual(PLANESWALKER_TYPES);
    expect(offered.suggested[0]).toBe("Jace");
    expect(game.state.objects[deification].chosenOnEnter).toBe("Jace");
  });

  it("gives planeswalkers of the chosen type hexproof, and no others", () => {
    const { game } = deify("Jace");
    const jace = spawn(game, "Jace Beleren");
    const chandra = spawn(game, "Chandra, Torch of Defiance");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Deification"));
    expect(keywords(game, jace).has("hexproof")).toBe(true);
    expect(keywords(game, chandra).has("hexproof")).toBe(false);
  });

  it("damage that would remove every loyalty counter leaves one, while you control a creature", () => {
    const { game } = deify("Jace");
    const jace = spawn(game, "Jace Beleren");
    spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Deification"));
    expect(counters(game, jace, "loyalty")).toBe(3);
    bolt(game, jace, 5);
    toStep(game, "postcombat-main");
    expect(zone(game, jace)).toBe("battlefield");
    expect(counters(game, jace, "loyalty")).toBe(1);
    // All of the damage was still dealt.
    const dealt = game.eventsOfType("damage-dealt").filter((e) => e.target.kind === "object" && e.target.object === jace);
    expect(dealt.at(-1)?.amount).toBe(5);
    // Damage that leaves some anyway is just removed.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "loyalty", amount: 3 }, [ref(jace)]);
    bolt(game, jace, 2);
    expect(counters(game, jace, "loyalty")).toBe(2);
  });

  it("does nothing without a creature, or for another type", () => {
    const { game } = deify("Jace");
    const jace = spawn(game, "Jace Beleren");
    const chandra = spawn(game, "Chandra, Torch of Defiance");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Deification"));
    bolt(game, jace, 3);
    toStep(game, "postcombat-main");
    expect(zone(game, jace)).toBe("graveyard");
    spawn(game, "Grizzly Bears");
    bolt(game, chandra, 4);
    toStep(game, "end");
    expect(zone(game, chandra)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });
});
