/**
 * Vengeful Pharaoh: "Whenever combat damage is dealt to you or a planeswalker
 * you control, if this card is in your graveyard, destroy target attacking
 * creature, then put this card on top of your library." The batched damage
 * trigger's `orPlaneswalker`: once per recipient in a damage event — several
 * creatures hitting you at once is one trigger, you and a planeswalker of
 * yours two (the card's rulings), the second doing nothing once the first
 * has put the card on top (rule 603.4).
 */

import { describe, expect, it } from "vitest";

import { B, graveyard, ref, spawn, table, toGraveyard, toStep, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

const PHARAOH = "Vengeful Pharaoh";

describe("Vengeful Pharaoh", () => {
  it("fires once for several attackers dealing combat damage to you, destroying one and going on top", () => {
    const { game, a, b } = table();
    const pharaoh = toGraveyard(game, PHARAOH, B);
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    let asked = 0;
    b.chooseTargetsFn = () => {
      asked += 1;
      return [ref(giant)];
    };
    a.declareAttackersFn = () => [
      { attacker: bear, defender: B },
      { attacker: giant, defender: B },
    ];
    toStep(game, "postcombat-main");
    expect(asked).toBe(1);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.zones.perPlayer[B].library[0]).toBe(pharaoh);
    expect(graveyard(game, B)).not.toContain(pharaoh);
  });

  it("fires for you and a planeswalker of yours separately; the second does nothing", () => {
    const { game, a, b } = table();
    const pharaoh = toGraveyard(game, PHARAOH, B);
    const walker = spawn(game, "Liliana of the Veil", B);
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const picks: ObjectId[] = [bear, giant];
    b.chooseTargetsFn = () => [ref(picks.shift()!)];
    a.declareAttackersFn = () => [
      { attacker: bear, defender: B },
      { attacker: giant, defender: walker },
    ];
    toStep(game, "postcombat-main");
    expect(picks).toEqual([]);
    const destroyed = [bear, giant].filter((id) => zone(game, id) === "graveyard");
    expect(destroyed).toHaveLength(1);
    expect(game.state.zones.perPlayer[B].library[0]).toBe(pharaoh);
  });

  it("doesn't fire for damage to an opponent or an opponent's planeswalker", () => {
    const { game, a } = table();
    const pharaoh = toGraveyard(game, PHARAOH);
    const walker = spawn(game, "Liliana of the Veil", B);
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(bear)];
    };
    a.declareAttackersFn = () => [
      { attacker: bear, defender: B },
      { attacker: giant, defender: walker },
    ];
    toStep(game, "postcombat-main");
    expect(asked).toBe(0);
    expect(zone(game, bear)).toBe("battlefield");
    expect(zone(game, pharaoh)).toBe("graveyard");
  });
});
