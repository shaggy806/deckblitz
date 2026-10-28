/**
 * The grant-protection family, group C: protection granted until end of turn
 * on cards whose other parts are already built — an optional colour over a
 * filter (Kabira Evangel), "artifacts or the color of your choice" (Jeweled
 * Spirit), a fixed colour among keyword modes (Jodah's Avenger), a tap-a-flier
 * cost (Radiant), and protection from creatures plus explore on an attack
 * trigger's target (Seasoned Dungeoneer).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, attack, counters, enter, hand, pickModes, pickTargets, pt, registryOf, spawn, table, zone } from "./harness.js";

const colorsFrom = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).protectionFrom.colors].sort();
const typesFrom = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).protectionFrom.types].sort();

describe("grant-protection family — group C", () => {
  it("Kabira Evangel: Allies you control gain the chosen colour; declining grants nothing", () => {
    const { game, a } = table();
    const cleric = spawn(game, "Ondu Cleric");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Ondu Cleric", B);
    let offered: readonly string[] = [];
    let min = -1;
    a.chooseModesFn = (_view, mn, _max, texts) => {
      if (texts.length === 5) {
        offered = texts;
        min = mn;
        return [3];
      }
      return [];
    };
    const evangel = enter(game, "Kabira Evangel");
    expect(offered[3]).toBe("Protection from red");
    expect(min).toBe(0);
    expect(colorsFrom(game, evangel)).toEqual(["R"]);
    expect(colorsFrom(game, cleric)).toEqual(["R"]);
    expect(colorsFrom(game, bears)).toEqual([]);
    expect(colorsFrom(game, theirs)).toEqual([]);
    // Another Ally enters: "you may" — choosing nothing grants nothing.
    pickModes(a);
    const later = enter(game, "Ondu Cleric");
    expect(colorsFrom(game, later)).toEqual([]);
  });

  it("Jeweled Spirit: sacrifices two lands and offers artifacts before the colours", () => {
    const { game, a } = table();
    const spirit = spawn(game, "Jeweled Spirit");
    const [l1, l2] = [spawn(game, "Plains"), spawn(game, "Plains")];
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [0];
    };
    activate(game, spirit, 0);
    expect(zone(game, l1)).toBe("graveyard");
    expect(zone(game, l2)).toBe("graveyard");
    expect(offered[0]).toBe("Protection from artifacts");
    expect(offered).toHaveLength(6);
    expect(typesFrom(game, spirit)).toEqual(["artifact"]);
  });

  it("Jodah's Avenger: -1/-1 and protection from red as the chosen mode", () => {
    const { game, a } = table();
    const avenger = spawn(game, "Jodah's Avenger");
    pickModes(a, 1);
    activate(game, avenger, 0);
    expect(pt(game, avenger)).toEqual({ power: 3, toughness: 3 });
    expect(colorsFrom(game, avenger)).toEqual(["R"]);
  });

  it("Radiant: needs another untapped flier, which is tapped for the cost", () => {
    const { game, a } = table();
    const radiant = spawn(game, "Radiant, Serra Archangel");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, radiant, 0)).toThrow();
    const hawk = spawn(game, "Suntail Hawk");
    pickModes(a, 2);
    game.dispatch({ type: "activate-ability", player: A, source: radiant, abilityIndex: 0, targets: [], tap: [hawk] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(game.state.objects[hawk].tapped).toBe(true);
    expect(game.state.objects[radiant].tapped).toBe(false);
    expect(colorsFrom(game, radiant)).toEqual(["B"]);
  });

  it("Seasoned Dungeoneer: the attacking Warrior gains protection from creatures, then explores", () => {
    const { game, a } = table();
    const dungeoneer = spawn(game, "Seasoned Dungeoneer");
    pickTargets(a, dungeoneer);
    const before = hand(game).length;
    attack(game, a, [dungeoneer]);
    expect(typesFrom(game, dungeoneer)).toEqual(["creature"]);
    // The library is Wastes: a land, so it goes to hand and no counter.
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, dungeoneer)).toBe(0);
  });
});
