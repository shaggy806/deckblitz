/**
 * A static that takes all abilities away (rule 613.1f, layer 6) —
 * `StaticAbility.loseAllAbilities`: an Aura's "Enchanted creature loses all
 * abilities" (Lignify, Deep Freeze, Imprisoned in the Moon), Humility's "All
 * creatures lose all abilities", Toxicrene's lands. What the same static
 * grants beside the loss stays (613.7); a static whose own permanent loses its
 * abilities is gone first (613.8a); the static's own layer-4 and layer-5
 * parts beside it (`setTypes`, `loseLandTypes`, `addColors`,
 * `setsChosenColor`).
 */
import { describe, expect, it } from "vitest";

import { effectiveColors } from "../characteristics.js";
import { A, B, cast, destroy, enter, hand, keywords, lands, life, pt, ref, registryOf, settle, spawn, subtypes, table, toHand, types } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** The texts of the abilities `id`'s controller (alice) may activate now. */
const activatable = (game: Game, id: ObjectId): string[] => [
  ...new Set(
    game
      .legalActions(A)
      .flatMap((action) =>
        action.kind === "activate-ability" && action.source === id ? [action.text.replace(/ \(add \{.\}\)$/, "")] : [],
      ),
  ),
];

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...effectiveColors(game.state, registryOf(game), game.state.objects[id])].sort();

describe("an Aura's loss of all abilities", () => {
  it("Lignify: the creature is a 0/4 Treefolk with no abilities", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Lignify"), { targets: [ref(angel)] });
    expect([...keywords(game, angel)]).toEqual([]);
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 4 });
    expect(subtypes(game, angel)).toEqual(["Treefolk"]);
  });

  it("an ability granted after the Aura stays", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Lignify"), { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" }, [
      ref(bears),
    ]);
    expect(keywords(game, bears)).toContain("flying");
  });

  it("Deep Freeze: defender from the same static stays, flying goes, blue is added", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Deep Freeze"), { targets: [ref(angel)] });
    expect([...keywords(game, angel)]).toEqual(["defender"]);
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 4 });
    expect(colorsOf(game, angel)).toEqual(["U", "W"]);
    expect(subtypes(game, angel)).toEqual(expect.arrayContaining(["Angel", "Wall"]));
  });

  it("Imprisoned in the Moon: a creature is a colourless land tapping for {C} alone", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves", A);
    game.state.objects[elves].summoningSick = false;
    lands(game, "Island", 3);
    cast(game, toHand(game, "Imprisoned in the Moon"), { targets: [ref(elves)] });
    expect(types(game, elves)).toEqual(["land"]);
    expect(subtypes(game, elves)).toEqual([]);
    expect(colorsOf(game, elves)).toEqual([]);
    expect(activatable(game, elves)).toEqual(["{T}: Add {C}."]);
  });

  it("Imprisoned in the Moon: a Plains is still a Plains but taps only for {C}", () => {
    const { game } = table();
    const plains = spawn(game, "Plains", A);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Imprisoned in the Moon"), { targets: [ref(plains)] });
    game.state.objects[plains].tapped = false; // it may have paid for the Aura
    expect(subtypes(game, plains)).toEqual(["Plains"]);
    expect(activatable(game, plains)).toEqual(["{T}: Add {C}."]);
  });

  it("Lithoform Blight: a Forest loses its land type and taps for {C} or, for 1 life, any colour", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", A);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Lithoform Blight"), { targets: [ref(forest)] });
    game.state.objects[forest].tapped = false; // it may have paid for the Aura
    expect(subtypes(game, forest)).toEqual([]);
    expect(activatable(game, forest)).toEqual(["{T}: Add {C}.", "{T}, Pay 1 life: Add one mana of any color."]);
  });

  it("the creature's own static stops: Lignify on a lord", () => {
    const { game } = table();
    const lord = spawn(game, "Lord of Atlantis", B);
    const merfolk = spawn(game, "Merfolk of the Pearl Trident", B);
    expect(pt(game, merfolk)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Lignify"), { targets: [ref(lord)] });
    expect(pt(game, merfolk)).toEqual({ power: 1, toughness: 1 });
    expect([...keywords(game, merfolk)]).toEqual([]);
  });

  it("the Aura gone, the creature is itself again", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Forest", 2);
    const aura = toHand(game, "Lignify");
    cast(game, aura, { targets: [ref(angel)] });
    destroy(game, aura);
    expect([...keywords(game, angel)]).toEqual(expect.arrayContaining(["flying", "vigilance"]));
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("a static over many permanents", () => {
  it("Humility: every creature a 1/1 with no abilities, the enchantment's anthem untouched", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    spawn(game, "Glorious Anthem", A);
    const bears = spawn(game, "Grizzly Bears", A);
    spawn(game, "Humility", A);
    expect([...keywords(game, angel)]).toEqual([]);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Dress Down: a creature entering under it has no enters trigger", () => {
    const { game } = table();
    spawn(game, "Dress Down", A);
    const before = hand(game).length;
    enter(game, "Elvish Visionary", A);
    expect(hand(game).length).toBe(before);
  });

  it("Dress Down: a creature's triggered ability doesn't trigger", () => {
    const { game } = table();
    spawn(game, "Soul Warden", A);
    spawn(game, "Dress Down", A);
    const before = life(game);
    enter(game, "Grizzly Bears", B);
    expect(life(game)).toBe(before);
  });

  it("Toxicrene: every land taps for any colour and nothing else", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", A);
    spawn(game, "Toxicrene", A);
    expect(activatable(game, forest)).toEqual(["{T}: Add one mana of any color."]);
  });

  it("a loss reaching another such static's permanent takes that static away first (613.8a)", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", A);
    const toxicrene = spawn(game, "Toxicrene", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Lignify"), { targets: [ref(toxicrene)] });
    game.state.objects[forest].tapped = false; // it may have paid for the Aura
    expect([...keywords(game, toxicrene)]).toEqual([]);
    expect(activatable(game, forest)).toEqual(["{T}: Add {G}."]);
  });

  it("Humility made a creature still applies to itself and the rest", () => {
    // Its own static doesn't depend on itself (613.8a): Opalescence's ruling.
    const { game } = table();
    const humility = spawn(game, "Humility", A);
    game.debugApplyEffect(
      A,
      { kind: "animate", target: 0, power: 4, toughness: 4, addTypes: ["creature"], addSubtypes: [], duration: "permanent" },
      [ref(humility)],
    );
    const angel = spawn(game, "Serra Angel", B);
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect([...keywords(game, angel)]).toEqual([]);
  });
});

describe("the colour parts beside it", () => {
  it("Alloy Golem is the colour chosen as it enters", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const golem = toHand(game, "Alloy Golem");
    game.dispatch({ type: "cast-spell", player: A, card: golem, targets: [] });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type" || s.result.over);
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: "R" });
    settle(game);
    expect(colorsOf(game, golem)).toEqual(["R"]);
    expect(types(game, golem)).toEqual(["artifact", "creature"]);
  });
});
