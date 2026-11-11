/**
 * "Spend only black mana on X" on an activated ability (`AbilityCost.xSpendOnly`
 * — Crypt Rats, Crimson Hellkite): the X in the cost is paid with mana of that
 * colour alone, each X one mana of it as a coloured symbol is (rule 107.4a).
 * The X offered, the activation and the payment all price the same cost
 * (`Game.activatedAbilityManaCost`); a generic reduction still lowers it
 * (rules 601.2f, 602.2b); and the colour is a word a text change reaches
 * (rule 612.2).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { changeDefinitionText } from "../text-change.js";
import { A, B, activate, lands, life, ref, registryOf, spawn, table, zone } from "./harness.js";

const xOffer = (game: Game, source: ObjectId): Extract<LegalAction, { kind: "activate-ability" }> | undefined => {
  for (const action of game.legalActions(A)) {
    if (action.kind === "activate-ability" && action.source === source && action.xCost !== undefined) return action;
  }
  return undefined;
};

describe("Crypt Rats — spend only black mana on X", () => {
  it("offers X only as high as the black mana, and deals X to each creature and each player", () => {
    const { game } = table();
    const rats = spawn(game, "Crypt Rats");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 3);

    expect(xOffer(game, rats)?.xCost?.maxX).toBe(2);
    expect(() => activate(game, rats, 0, { x: 3 })).toThrow(/pay/i);

    activate(game, rats, 0, { x: 2 });
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
    expect(zone(game, rats)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    // The Swamps paid: the Mountains are still untapped.
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Mountain" && !game.state.objects[id].tapped)).toHaveLength(3);
  });

  it("can't be paid at all without black mana, but X = 0 is free", () => {
    const { game } = table();
    const rats = spawn(game, "Crypt Rats");
    lands(game, "Mountain", 3);
    expect(xOffer(game, rats)?.xCost?.maxX).toBe(0);
    activate(game, rats, 0, { x: 0 });
    expect(zone(game, rats)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("a generic reduction lowers what's paid for X (Heartstone), the rest still black", () => {
    const { game } = table();
    const rats = spawn(game, "Crypt Rats");
    spawn(game, "Heartstone");
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 3);
    // {X} costs {1} less, never less than one mana: X = 3 for two black.
    expect(xOffer(game, rats)?.xCost?.maxX).toBe(3);
    activate(game, rats, 0, { x: 3 });
    expect(life(game, B)).toBe(17);
  });

  it("the colour is a word of its text: made red, X takes red mana", () => {
    const def = registryOf(table().game).get("Crypt Rats");
    const changed = changeDefinitionText(def, [{ from: "black", to: "red" }]);
    expect(changed.activated[0].cost.xSpendOnly).toBe("R");
    expect(changed.activated[0].text).toContain("Spend only red mana on X");
  });
});

describe("Crimson Hellkite — {X}, {T} with only red mana on X", () => {
  it("counts only red mana toward X", () => {
    const { game } = table();
    const hellkite = spawn(game, "Crimson Hellkite");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 3);
    lands(game, "Swamp", 4);
    expect(xOffer(game, hellkite)?.xCost?.maxX).toBe(3);
    expect(() => activate(game, hellkite, 0, { x: 4, targets: [ref(giant)] })).toThrow(/pay/i);
    activate(game, hellkite, 0, { x: 3, targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[hellkite].tapped).toBe(true);
  });
});
