/**
 * Setting a land's land types to basic ones (rule 305.7): Blood Moon's
 * "nonbasic lands are Mountains", a type chosen as an Aura enters (Convincing
 * Mirage's "enchanted land is the chosen type") or as a spell resolves
 * (Tideshaper Mystic's "the basic land type of your choice"). The land loses
 * the abilities its rules text gave it, keeps what other effects granted, and
 * gains its new types' intrinsic mana abilities; a land's own static that set
 * types depends on the setter (613.8a — Urborg, Tomb of Yawgmoth under Blood
 * Moon), and a land entering under one has none of its own entering
 * abilities (614.12 — it doesn't enter tapped).
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import { Game } from "../game.js";
import { BASIC_LAND_TYPE_CHOICES } from "../subtypes.js";
import type { ObjectId } from "../primitives.js";
import { intrinsicManaColors } from "../characteristics.js";
import { A, B, settle, subtypes } from "./harness.js";

const MOON = "Test Moon";
const MIRAGE = "Test Mirage";

const registry = createDefaultRegistry()
  .register(
    defineCard({
      name: MOON,
      manaCost: "{0}",
      types: ["enchantment"],
      text: "Nonbasic lands are Mountains.",
      static: [
        {
          affects: { scope: "filter", filter: { type: "land", notSupertype: "basic" } },
          setSubtypes: ["Mountain"],
          text: "Nonbasic lands are Mountains.",
        },
      ],
    }),
  )
  .register(
    defineCard({
      name: MIRAGE,
      manaCost: "{0}",
      types: ["enchantment"],
      subtypes: ["Aura"],
      text: "Enchant land\nAs this Aura enters, choose a basic land type.\nEnchanted land is the chosen type.",
      chooseOnEnter: BASIC_LAND_TYPE_CHOICES,
      static: [{ affects: { scope: "attached" }, setsChosenLandType: true, text: "Enchanted land is the chosen type." }],
    }),
  );

const setUp = () => {
  const seats = { [A]: new ScriptedController(A), [B]: new ScriptedController(B) };
  const game = Game.create({
    seed: 1,
    shuffle: false,
    registry,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: seats,
    decks: [
      { player: A, cards: Array<string>(40).fill("Wastes") },
      { player: B, cards: Array<string>(40).fill("Wastes") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  return { game, a: seats[A] };
};
const put = (game: Game, name: string): ObjectId => game.debugSpawn(name, A, "battlefield", { summoningSick: false });
const abilities = (game: Game, id: ObjectId): string[] =>
  game
    .legalActions(A)
    .flatMap((action) => (action.kind === "activate-ability" && action.source === id ? [action.text] : []));
const colors = (game: Game, id: ObjectId) => intrinsicManaColors(game.state, registry, game.state.objects[id]);

describe("rule 305.7: a land set to a basic land type", () => {
  it("loses its rules-text abilities and gains the type's mana ability; a basic land is untouched", () => {
    const { game } = setUp();
    const wilds = put(game, "Evolving Wilds");
    const forest = put(game, "Forest");
    expect(abilities(game, wilds).length).toBe(1);
    put(game, MOON);
    expect(subtypes(game, wilds)).toEqual(["Mountain"]);
    expect(colors(game, wilds)).toEqual(["R"]);
    expect(abilities(game, wilds).every((text) => !/Sacrifice/.test(text))).toBe(true);
    expect(abilities(game, wilds).length).toBe(1);
    expect(colors(game, forest)).toEqual(["G"]);
  });

  it("keeps an ability another effect granted it, before or after", () => {
    const { game } = setUp();
    const cove = put(game, "Tranquil Cove");
    const grant: EffectSpec = {
      kind: "grant-activated",
      target: 0,
      ability: {
        cost: { mana: "{0}", tap: false },
        targets: [],
        effect: { kind: "gain-life", amount: 1 },
        resolve: null,
        text: "{0}: You gain 1 life.",
      },
      duration: "end-of-turn",
    };
    game.debugApplyEffect(A, grant, [{ kind: "object", object: cove }]);
    settle(game);
    put(game, MOON);
    expect(abilities(game, cove)).toContain("{0}: You gain 1 life.");
    expect(colors(game, cove)).toEqual(["R"]);
  });

  it("Urborg's own 'each land is a Swamp' doesn't exist under it, whatever the timestamps (613.8a)", () => {
    const { game } = setUp();
    put(game, MOON);
    const urborg = put(game, "Urborg, Tomb of Yawgmoth");
    const wastes = put(game, "Wastes");
    expect(subtypes(game, urborg)).toEqual(["Mountain"]);
    expect(subtypes(game, wastes)).not.toContain("Swamp");
    expect(colors(game, urborg)).toEqual(["R"]);
  });

  it("a land entering under it has none of its own entering abilities: it doesn't enter tapped (614.12)", () => {
    const { game } = setUp();
    put(game, MOON);
    const cove = put(game, "Tranquil Cove");
    expect(game.state.objects[cove].tapped).toBe(false);
  });

  it("an Aura's chosen type replaces the land's types; nothing changes before a choice", () => {
    const { game } = setUp();
    const coast = put(game, "Yavimaya Coast");
    const aura = put(game, MIRAGE);
    game.state.objects[aura].attachedTo = coast;
    expect(subtypes(game, coast)).toEqual([]);
    game.state.objects[aura].chosenOnEnter = "Island";
    game.debugApplyEffect(A, { kind: "gain-life", amount: 0 });
    expect(subtypes(game, coast)).toEqual(["Island"]);
    expect(colors(game, coast)).toEqual(["U"]);
    expect(abilities(game, coast).length).toBe(1);
  });
});

describe("the basic land type of your choice, on resolution", () => {
  it("offers the five, and the land becomes the chosen one until end of turn", () => {
    const { game, a } = setUp();
    const coast = put(game, "Yavimaya Coast");
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "Swamp";
    };
    game.debugApplyEffect(
      A,
      {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "Choose a basic land type",
        then: { kind: "add-types", target: 0, setSubtypes: ["$chosen"], duration: "end-of-turn" },
      },
      [{ kind: "object", object: coast }],
    );
    settle(game);
    expect(offered).toEqual(["Plains", "Island", "Swamp", "Mountain", "Forest"]);
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(colors(game, coast)).toEqual(["B"]);
    expect(abilities(game, coast).length).toBe(1);
  });
});
