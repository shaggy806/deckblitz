/**
 * "Becomes a [type]" as a one-shot effect — `add-types` with `setTypes` /
 * `setSubtypes`, which replace its card types or its subtypes of a kind
 * (rule 205.1a) and touch nothing else, unlike `animate`; and "the creature
 * type of your choice" (`choose-creature-type` then `add-types`), with
 * `exclude` for "other than Wall".
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, lands, nextTurn, pt, ref, settle, spawn, subtypes, table, types } from "./harness.js";
import { CREATURE_TYPES } from "../creature-types.js";
import type { Game } from "../game.js";

const answerType = (game: Game, creatureType: string): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
  game.dispatch({ type: "choose-creature-type", player: A, creatureType });
  settle(game);
};

describe("becomes the creature type of your choice", () => {
  it("Mistform Stalker is only the chosen type until end of turn", () => {
    const { game } = table();
    const stalker = spawn(game, "Mistform Stalker", A);
    lands(game, "Island", 1);
    activate(game, stalker, 0, { settle: false });
    answerType(game, "Goblin");
    expect(subtypes(game, stalker)).toEqual(["Goblin"]);
    nextTurn(game);
    expect(subtypes(game, stalker)).toEqual(["Illusion"]);
  });

  it("Imagecrafter's choice leaves Wall out, and still offers the catalogue", () => {
    const { game } = table();
    const crafter = spawn(game, "Imagecrafter", A);
    game.state.objects[crafter].summoningSick = false;
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, crafter, 0, { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-creature-type" && awaiting.catalog).toBe(true);
    expect(awaiting?.kind === "choose-creature-type" && awaiting.options.includes("Wall")).toBe(false);
    expect(awaiting?.kind === "choose-creature-type" && awaiting.options.length).toBe(CREATURE_TYPES.length - 1);
    expect(game.canDispatch({ type: "choose-creature-type", player: A, creatureType: "Wall" })).toMatch(/not one of/);
    answerType(game, "Elf");
    expect(subtypes(game, bears)).toEqual(["Elf"]);
  });
});

describe("becomes a [type], no P/T", () => {
  it("Ursine Champion is a Bear Berserker, no longer a Human, with its P/T otherwise untouched", () => {
    const { game } = table();
    const champion = spawn(game, "Ursine Champion", A);
    lands(game, "Forest", 6);
    activate(game, champion, 0);
    expect(subtypes(game, champion)).toEqual(["Bear", "Berserker"]);
    expect(pt(game, champion)).toEqual({ power: 5, toughness: 5 });
    expect(types(game, champion)).toEqual(["creature"]);
  });

  it("a later type change outranks it", () => {
    const { game } = table();
    const champion = spawn(game, "Ursine Champion", A);
    lands(game, "Forest", 6);
    activate(game, champion, 0);
    game.debugApplyEffect(A, { kind: "add-types", target: 0, addSubtypes: ["Elf"], duration: "end-of-turn" }, [
      ref(champion),
    ]);
    expect(subtypes(game, champion)).toEqual(["Bear", "Berserker", "Elf"]);
  });

  it("setTypes replaces its card types (205.1a)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "add-types", target: 0, setTypes: ["enchantment"], duration: "permanent" }, [
      ref(bears),
    ]);
    expect(types(game, bears)).toEqual(["enchantment"]);
    expect(subtypes(game, bears)).toEqual([]);
  });
});
