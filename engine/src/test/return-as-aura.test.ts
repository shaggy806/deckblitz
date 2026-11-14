/**
 * "Return it to the battlefield. It's an Aura enchantment with enchant
 * Forest you control and …" (`EnterTypes.enchant` — Harold and Bob, First
 * Numens; Old-Growth Troll; Bronzehide Lion): the card returns an Aura
 * enchantment with that enchant ability, its controller choosing what it
 * enchants as it enters (rule 303.4f); with nothing to enchant it stays in the
 * graveyard (303.4g). On the battlefield its enchant ability is the one the
 * effect gave it, which the Aura state-based check reads (704.5m).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { playerCountersHeld } from "../state.js";

import { A, B, activate, controller, destroy, graveyard, ref, settle, spawn, subtypes, table, toStep, types, zone } from "./harness.js";

describe("returning as an Aura with a granted ability (EnterTypes.enchant)", () => {
  it("Harold and Bob comes back enchanting a chosen Forest, which taps for three of one colour and two rad counters", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    const other = spawn(game, "Forest");
    spawn(game, "Forest", B);
    const harold = spawn(game, "Harold and Bob, First Numens");
    let offered: readonly ObjectId[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      offered = options;
      return other;
    };
    destroy(game, harold);
    // Only the Forests alice controls.
    expect([...offered].sort()).toEqual([forest, other].sort());
    expect(zone(game, harold)).toBe("battlefield");
    const aura = game.state.objects[harold];
    expect(aura.attachedTo).toBe(other);
    expect(types(game, harold)).toEqual(["enchantment"]);
    expect(subtypes(game, harold)).toEqual(["Aura"]);
    // Its own abilities are gone: reach and vigilance, and the dies trigger.
    expect(game.state.objects[harold].controller).toBe(A);
    const before = playerCountersHeld(game.state, A, "rad");
    // Its own "{T}: Add {G}" first, then the granted one.
    activate(game, other, 1);
    expect(playerCountersHeld(game.state, A, "rad")).toBe(before + 2);
    const pool = game.state.players[A].manaPool;
    expect(pool.length).toBe(3);
    expect(new Set(pool.map((u) => u.type)).size).toBe(1);
  });

  it("dying as an Aura it stays in the graveyard: 'if it was a creature'", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    const harold = spawn(game, "Harold and Bob, First Numens");
    a.chooseEnchantFn = () => forest;
    destroy(game, harold);
    expect(game.state.objects[harold].attachedTo).toBe(forest);
    destroy(game, forest);
    // The state-based check (704.5m) runs as priority is next given.
    toStep(game, "postcombat-main");
    expect(zone(game, harold)).toBe("graveyard");
  });

  it("with no Forest to enchant it stays in the graveyard (rule 303.4g)", () => {
    const { game } = table();
    spawn(game, "Forest", B);
    const harold = spawn(game, "Harold and Bob, First Numens");
    destroy(game, harold);
    expect(zone(game, harold)).toBe("graveyard");
    expect(graveyard(game)).toContain(harold);
  });

  it("returns under its controller's control, not its owner's", () => {
    const { game, b } = table();
    const forest = spawn(game, "Forest", B);
    const harold = spawn(game, "Harold and Bob, First Numens");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(harold)]);
    settle(game);
    expect(controller(game, harold)).toBe(B);
    b.chooseEnchantFn = () => forest;
    destroy(game, harold, A);
    expect(zone(game, harold)).toBe("battlefield");
    expect(controller(game, harold)).toBe(B);
    expect(game.state.objects[harold].attachedTo).toBe(forest);
  });

  it("Old-Growth Troll keeps its other abilities, and its Forest makes a Troll Warrior", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    const troll = spawn(game, "Old-Growth Troll");
    a.chooseEnchantFn = () => forest;
    destroy(game, troll);
    expect(game.state.objects[troll].attachedTo).toBe(forest);
    expect(types(game, troll)).toEqual(["enchantment"]);
    spawn(game, "Wastes");
    activate(game, forest, 2);
    expect(zone(game, forest)).toBe("graveyard");
    // The Aura goes with its Forest (704.5m), and doesn't return: it died an Aura.
    expect(zone(game, troll)).toBe("graveyard");
    const token = game.battlefield.find((id) => game.state.objects[id].cardName === "Troll Warrior Token");
    expect(token).toBeDefined();
    expect(game.state.objects[token!].tapped).toBe(true);
  });

  it("Bronzehide Lion enchants a creature you control and grants it indestructible on demand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const lion = spawn(game, "Bronzehide Lion");
    let offered: readonly ObjectId[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      offered = options;
      return bears;
    };
    destroy(game, lion);
    expect(offered).toEqual([bears]);
    expect(game.state.objects[lion].attachedTo).toBe(bears);
    spawn(game, "Forest");
    spawn(game, "Plains");
    // The granted ability, after its lost printed one.
    activate(game, lion, 1);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("an Aura that can no longer enchant its host goes (704.5m): the Lion's creature changes hands", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const lion = spawn(game, "Bronzehide Lion");
    a.chooseEnchantFn = () => bears;
    destroy(game, lion);
    expect(game.state.objects[lion].attachedTo).toBe(bears);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    toStep(game, "postcombat-main");
    expect(zone(game, lion)).toBe("graveyard");
  });
});
