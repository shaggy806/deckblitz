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
import { A, B, activate, cast, lands, life, ref, registryOf, spawn, table, toHand, zone } from "./harness.js";

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

describe("Atalya, Samite Master — a modal {X}, {T} with only white mana on X", () => {
  it("gains X life, X counting only white mana", () => {
    const { game } = table();
    const atalya = spawn(game, "Atalya, Samite Master");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 3);
    expect(xOffer(game, atalya)?.xCost?.maxX).toBe(2);
    expect(() => activate(game, atalya, 0, { x: 3, modes: [1] })).toThrow(/pay/i);
    activate(game, atalya, 0, { x: 2, modes: [1] });
    expect(life(game, A)).toBe(22);
  });

  it("prevents the next X damage to target creature, the restriction holding in either mode", () => {
    const { game } = table();
    const atalya = spawn(game, "Atalya, Samite Master");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 3);
    expect(() => activate(game, atalya, 0, { x: 3, modes: [0], targets: [ref(bear)] })).toThrow(/pay/i);
    activate(game, atalya, 0, { x: 2, modes: [0], targets: [ref(bear)] });
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(bear)]);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].damageMarked).toBe(1);
  });
});

/** The cast offer for `card` with an X range, if there is one. */
const castXOffer = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }> | undefined => {
  for (const action of game.legalActions(A)) {
    if (action.kind === "cast-spell" && action.card === card && action.xCost !== undefined) return action;
  }
  return undefined;
};

describe("Consume Spirit — spend only black mana on X, on a spell (`CardDefinition.xSpendOnly`)", () => {
  it("offers X only as high as the black mana left after {1}{B}, and deals X and gains X", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    const spirit = toHand(game, "Consume Spirit");
    // {B} and two X from the Swamps, the {1} from a Mountain.
    expect(castXOffer(game, spirit)?.xCost?.maxX).toBe(2);
    expect(() => cast(game, spirit, { x: 3, targets: [ref(giant)] })).toThrow(/pay|mana/i);
    const before = life(game, A);
    cast(game, spirit, { x: 2, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(before + 2);
    // The Swamps paid, and a Mountain the {1}.
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Mountain" && !game.state.objects[id].tapped)).toHaveLength(1);
  });

  it("without black mana beyond its {B}, X is 0", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 4);
    const spirit = toHand(game, "Consume Spirit");
    expect(castXOffer(game, spirit)?.xCost?.maxX ?? 0).toBe(0);
    expect(() => cast(game, spirit, { x: 1, targets: [ref(B)] })).toThrow(/pay|mana/i);
    cast(game, spirit, { x: 0, targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(zone(game, spirit)).toBe("graveyard");
  });

  it("all black: five Swamps pay X = 3", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const spirit = toHand(game, "Consume Spirit");
    expect(castXOffer(game, spirit)?.xCost?.maxX).toBe(3);
    cast(game, spirit, { x: 3, targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});
