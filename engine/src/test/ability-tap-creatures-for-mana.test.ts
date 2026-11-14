/**
 * "For each mana in this ability's activation cost, you may tap an untapped
 * creature you control rather than pay that mana" (Heirloom Epic) —
 * `AbilityCost.tapCreaturesForMana`: waterbend's way of paying (rule 701.67a)
 * with creatures alone, offered as a `WaterbendOffer` marked `creaturesOnly`,
 * capped by the total cost's generic mana once increases apply (the rulings),
 * and no waterbending (701.67c).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, hand, lands, spawn, table } from "./harness.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const offerOf = (game: Game, source: ObjectId): ActivateOffer | undefined =>
  game.legalActions(A).find((a): a is ActivateOffer => a.kind === "activate-ability" && a.source === source);
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;
const bent = (game: Game): number => (game.state.journal?.entries ?? []).filter((e) => e.kind === "bent").length;

describe("Heirloom Epic: tap creatures rather than pay the ability's mana", () => {
  it("four creatures, one summoning sick, pay all of {4}: a card drawn, and nobody waterbent", () => {
    const { game } = table();
    const epic = spawn(game, "Heirloom Epic");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Ornithopter")];
    const sick = game.debugSpawn("Grizzly Bears", A, "battlefield", { summoningSick: true });
    const before = hand(game, A).length;
    const offer = offerOf(game, epic);
    expect(offer?.waterbend?.creaturesOnly).toBe(true);
    expect(offer?.waterbend?.max).toBe(4);
    activate(game, epic, 0, { waterbend: [...bears, sick] });
    expect(hand(game, A).length).toBe(before + 1);
    expect([...bears, sick, epic].every((id) => tapped(game, id))).toBe(true);
    expect(bent(game)).toBe(0);
  });

  it("creatures and mana together; a noncreature artifact can't tap for it", () => {
    const { game } = table();
    const epic = spawn(game, "Heirloom Epic");
    const book = spawn(game, "Spellbook");
    const bears = spawn(game, "Grizzly Bears");
    const [w1, w2, w3] = lands(game, "Wastes", 3);
    const offer = offerOf(game, epic);
    expect(offer?.waterbend?.choices).toEqual([bears]);
    expect(() => activate(game, epic, 0, { waterbend: [book] })).toThrow(/only a creature can tap/);
    activate(game, epic, 0, { waterbend: [bears] });
    expect([bears, w1, w2, w3].every((id) => tapped(game, id))).toBe(true);
    expect(tapped(game, book)).toBe(false);
  });

  it("isn't offered without enough creatures and mana together", () => {
    const { game } = table();
    const epic = spawn(game, "Heirloom Epic");
    spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    expect(offerOf(game, epic)).toBeUndefined();
  });

  it("a cost increase raises how many may tap (the rulings)", () => {
    const { game } = table();
    spawn(game, "Suppression Field");
    const epic = spawn(game, "Heirloom Epic");
    const creatures = Array.from({ length: 6 }, () => spawn(game, "Grizzly Bears"));
    const offer = offerOf(game, epic);
    expect(offer?.waterbend?.max).toBe(6);
    const before = hand(game, A).length;
    activate(game, epic, 0, { waterbend: creatures });
    expect(hand(game, A).length).toBe(before + 1);
    expect(creatures.every((id) => tapped(game, id))).toBe(true);
  });
});
