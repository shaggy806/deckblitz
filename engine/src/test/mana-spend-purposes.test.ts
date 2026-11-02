/**
 * "Spend this mana only to …" naming something that isn't a spell or a
 * permanent's abilities by filter (rule 106.6 — `ManaSpendPurpose`): the
 * special actions, a disturb cost, equip and power-up abilities, a Class's
 * level bar and any cost with {X} in it. And one type of mana spent as a colour
 * it isn't (rule 609.4b — `SpendUnitAs`).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { defineCard } from "../cards/define.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import { parseManaCost } from "../mana.js";
import { pipsAsSpendable } from "../mana-payment.js";
import type { ObjectId } from "../primitives.js";
import { changeDefinitionText } from "../text-change.js";
import { A, B, cast, lands, pickTargets, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

const activatable = (game: Game, source: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === source);

describe("spending mana only on a special action", () => {
  it("Overgrown Zealot's two mana turns a morph face up, and casts nothing", () => {
    const { game } = table();
    const willbender = toHand(game, "Willbender");
    lands(game, "Wastes", 3);
    cast(game, willbender, { via: "face-down" });
    spawn(game, "Overgrown Zealot");
    const bears = toHand(game, "Grizzly Bears");
    // Its unrestricted ability is one mana, and its two can't cast a {1}{G}.
    expect(castable(game, bears)).toBe(false);
    expect(game.legalActions(A).some((a) => a.kind === "turn-face-up" && a.permanent === willbender)).toBe(true);
    game.dispatch({ type: "turn-face-up", player: A, permanent: willbender, morph: true } as Action);
    expect(game.state.objects[willbender].faceDown).toBeUndefined();
  });

  it("Creeping Peeper's mana casts an enchantment and unlocks a door, not a creature", () => {
    const { game, a } = table();
    pickTargets(a, spawn(game, "Grizzly Bears", B));
    const room = toHand(game, "Bottomless Pool // Locker Room");
    const merfolk = toHand(game, "Merfolk of the Pearl Trident");
    spawn(game, "Creeping Peeper");
    expect(castable(game, merfolk)).toBe(false);
    expect(castable(game, room)).toBe(true);
    cast(game, room, { face: 1, targets: [] });
    // Locker Room's {4}{U}: the {U} can only be the second Peeper's.
    const peeper2 = spawn(game, "Creeping Peeper");
    lands(game, "Wastes", 4);
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    expect(game.state.objects[peeper2].tapped).toBe(true);
    expect(game.state.objects[room].doors?.right).toBe(true);
  });

  it("mana not for a door doesn't unlock one", () => {
    const { game, a } = table();
    pickTargets(a, spawn(game, "Grizzly Bears", B));
    const room = toHand(game, "Bottomless Pool // Locker Room");
    lands(game, "Island", 1);
    cast(game, room, { face: 1, targets: [] });
    // Five sources, but the {U} only from the Observer: neither a disturb cost
    // nor an instant.
    spawn(game, "Unblinking Observer");
    lands(game, "Wastes", 4);
    expect(game.legalActions(A).some((x) => x.kind === "unlock-door")).toBe(false);
  });
});

describe("spending mana only on a disturb cost", () => {
  it("Unblinking Observer pays a disturb cost and an instant, not the same card from hand", () => {
    const { game } = table();
    spawn(game, "Unblinking Observer");
    lands(game, "Wastes", 1);
    const angler = toGraveyard(game, "Baithook Angler");
    const inHand = toHand(game, "Baithook Angler");
    const opt = toHand(game, "Opt");
    const merfolk = toHand(game, "Merfolk of the Pearl Trident");
    expect(castable(game, inHand)).toBe(false);
    expect(castable(game, merfolk)).toBe(false);
    expect(castable(game, opt)).toBe(true);
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === angler && a.via === "disturb")).toBe(true);
    cast(game, angler, { via: "disturb", face: 1 });
    expect(zone(game, angler)).toBe("battlefield");
  });
});

describe("spending mana only on equip and power-up abilities", () => {
  it("Freya Crescent casts an Equipment and equips, but casts nothing else", () => {
    const { game } = table();
    spawn(game, "Freya Crescent");
    const shock = toHand(game, "Shock");
    const splitter = toHand(game, "Bonesplitter");
    expect(castable(game, shock)).toBe(false);
    expect(castable(game, splitter)).toBe(true);

    const onBoard = table();
    spawn(onBoard.game, "Freya Crescent");
    const equipment = spawn(onBoard.game, "Bonesplitter");
    expect(activatable(onBoard.game, equipment)).toBe(true);
  });

  it("Quinjet Technician's two pay a power-up, and not a {1}{R} spell", () => {
    const { game } = table();
    const viv = spawn(game, "Viv Vision, Teen Synthezoid");
    spawn(game, "Quinjet Technician");
    const piker = toHand(game, "Goblin Piker");
    expect(castable(game, piker)).toBe(false);
    lands(game, "Wastes", 5);
    // Viv's {7}: five Wastes and the Technician's two.
    expect(activatable(game, viv)).toBe(true);
  });

  it("a level bar: only the ability that gains a level", () => {
    const dork = defineCard({
      name: "Level Dork",
      manaCost: "{1}",
      colors: [],
      types: ["creature"],
      power: 1,
      toughness: 1,
      text: "{T}: Add {U}{B}{U}. Spend this mana only to gain a Class level.",
      activated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: { all: ["U", "B", "U"] },
            amount: 1,
            spendOnly: { purposes: ["class-level"], text: "Spend this mana only to gain a Class level." },
          },
          resolve: null,
          text: "{T}: Add {U}{B}{U}. Spend this mana only to gain a Class level.",
        },
      ],
    });
    const game = Game.create({
      seed: 1,
      shuffle: false,
      rules: { skipFirstDraw: false, maxHandSize: 99, startingLife: 20 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
      registry: createDefaultRegistry().register(dork),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const rogue = game.debugSpawn("Rogue Class", A, "battlefield", { summoningSick: false });
    game.debugSpawn("Level Dork", A, "battlefield", { summoningSick: false });
    const merfolk = game.debugSpawn("Merfolk of the Pearl Trident", A, "hand");
    expect(castable(game, merfolk)).toBe(false);
    expect(activatable(game, rogue)).toBe(true);
  });
});

describe("spending mana only on costs that contain {X}", () => {
  it("Rosheen Meanderer pays a spell's whole cost with {X} in it, up to its four", () => {
    const { game } = table();
    spawn(game, "Rosheen Meanderer");
    const blaze = toHand(game, "Blaze");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    expect(castable(game, bears)).toBe(false);
    const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === blaze);
    expect(offer !== undefined && "xCost" in offer ? offer.xCost?.maxX : undefined).toBe(4);
  });

  it("an activated ability's cost with {X} too (Helix Pinnacle's)", () => {
    const { game } = table();
    spawn(game, "Rosheen Meanderer");
    const pinnacle = spawn(game, "Helix Pinnacle");
    const offer = game.legalActions(A).find((a) => a.kind === "activate-ability" && a.source === pinnacle);
    expect(offer !== undefined && "xCost" in offer ? offer.xCost?.maxX : undefined).toBe(4);
  });

  it("a cost asked for as something resolves, written with {X} (Esper Sentinel) and not (Force Spike)", () => {
    const sentinel = table();
    spawn(sentinel.game, "Esper Sentinel", B);
    spawn(sentinel.game, "Rosheen Meanderer");
    lands(sentinel.game, "Island", 1);
    cast(sentinel.game, toHand(sentinel.game, "Opt"), { settle: false });
    sentinel.game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.zones.shared.stack.length === 0);
    expect(sentinel.game.state.awaiting?.kind).toBe("choose-modes");

    const { game } = table();
    spawn(game, "Rosheen Meanderer");
    lands(game, "Island", 2);
    const opt = toHand(game, "Opt");
    cast(game, opt, { settle: false });
    cast(game, toHand(game, "Force Spike"), { targets: [ref(opt)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || s.zones.shared.stack.length === 0);
    // Rosheen's four can't pay the {1}, so the choice never comes.
    expect(game.state.awaiting).toBeNull();
    expect(zone(game, opt)).toBe("graveyard");
  });

  it("Elementalist's Palette charges on an {X} spell and spends its {C} on one", () => {
    const { game } = table();
    const palette = spawn(game, "Elementalist's Palette");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Blaze"), { x: 0, targets: [ref(B)] });
    expect(game.state.objects[palette].counters?.charge).toBe(2);
    const second = toHand(game, "Blaze");
    const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === second);
    // Two Mountains and the Palette's two: {R} and X = 3.
    expect(offer !== undefined && "xCost" in offer ? offer.xCost?.maxX : undefined).toBe(3);
    // A {3}{R} isn't a cost with {X}: two Mountains and the Palette's one
    // any-colour mana, not its two {C}.
    expect(castable(game, toHand(game, "Hill Giant"))).toBe(false);
  });
});

describe("one type of mana spent as a colour it isn't (rule 609.4b)", () => {
  it("widens a covered pip to a hybrid one, its own colour first, and leaves the rest", () => {
    const cost = pipsAsSpendable(parseManaCost("{1}{R}{U}"), [{ unit: "W", as: "R" }]);
    expect(cost.colored.U).toBe(1);
    expect(cost.colored.R).toBe(0);
    expect(cost.hybrid).toEqual([[{ kind: "color", color: "R" }, { kind: "color", color: "W" }]]);
    const printed = parseManaCost("{R}");
    expect(pipsAsSpendable(printed, undefined)).toBe(printed);
  });

  it("Sunglasses of Urza: white pays red, and only red", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const piker = toHand(game, "Goblin Piker");
    const merfolk = toHand(game, "Merfolk of the Pearl Trident");
    expect(castable(game, piker)).toBe(false);
    spawn(game, "Sunglasses of Urza");
    expect(castable(game, piker)).toBe(true);
    expect(castable(game, merfolk)).toBe(false);
    cast(game, piker);
    expect(zone(game, piker)).toBe("battlefield");
    expect(game.state.players[A].manaPool).toEqual([]);
  });

  it("Sunglasses of Urza's colours are words a text change reaches (rule 612.2)", () => {
    const { game } = table();
    const printed = game.registry.get("Sunglasses of Urza");
    const changed = changeDefinitionText(printed, [{ from: "white", to: "blue" }]);
    expect(changed.static[0].spendManaAs).toEqual({ as: { unit: "U", as: "R" } });
  });

  it("Sunglasses of Urza: a red source still pays its own pip, and a hybrid {R/G} takes white", () => {
    const { game } = table();
    spawn(game, "Sunglasses of Urza");
    lands(game, "Plains", 3);
    expect(castable(game, toHand(game, "Rosheen Meanderer"))).toBe(false);
    lands(game, "Plains", 1);
    expect(castable(game, toHand(game, "Rosheen Meanderer"))).toBe(true);
  });

  it("Abstruse Appropriation: colorless pays any colour for that spell alone", () => {
    const { game } = table();
    const elves = spawn(game, "Llanowar Elves", B);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    const appropriation = toHand(game, "Abstruse Appropriation");
    cast(game, appropriation, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("exile");
    // Three Wastes less two for the {2}: one left, for the Elves' {G}.
    const bears = toHand(game, "Merfolk of the Pearl Trident");
    expect(castable(game, bears)).toBe(false);
    expect(castable(game, elves)).toBe(true);
    cast(game, elves, { via: "impulse" });
    expect(zone(game, elves)).toBe("battlefield");
    expect(game.state.objects[elves].controller).toBe(A);
  });
});
