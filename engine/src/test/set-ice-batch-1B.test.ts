/**
 * Ice Age, group B (B136): Diabolic Vision, Márton Stromgald, Panic, Barbed
 * Sextant, Kjeldoran Dead, Thermokarst, River Delta, Dwarven Armory, Mistfolk,
 * Hot Springs, Red Scarab, Maddening Wind.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("ICE group B", () => {
  it("Diabolic Vision takes one of the top five and puts the other four back in the order chosen", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const top = ["Grizzly Bears", "Shock", "Island", "Swamp", "Forest"].reverse().map((n) => toLibrary(game, n));
    // top[4] is now the top card (Grizzly Bears), top[0] the fifth (Forest).
    const [forest, swamp, island, shock, bears] = top;
    let call = 0;
    a.chooseFromZoneFn = () => {
      call += 1;
      return call === 1 ? [shock] : [forest, island, bears, swamp];
    };
    cast(game, toHand(game, "Diabolic Vision"));
    expect(zone(game, shock)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(0, 4)).toEqual([forest, island, bears, swamp]);
  });

  it("Márton Stromgald pumps the other attackers by the number of other attackers", () => {
    const { game, a } = table();
    const marton = spawn(game, "Márton Stromgald");
    const bears = spawn(game, "Grizzly Bears");
    const bears2 = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [marton, bears, bears2].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, marton)).toEqual({ power: 1, toughness: 1 });
  });

  it("Panic is cast only in combat before blockers, and draws at the next upkeep", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Panic"), { targets: [ref(bears)] })).toThrow();
    toStep(game, "begin-combat");
    cast(game, toHand(game, "Panic"), { targets: [ref(bears)] });
    const before = hand(game, A).length;
    nextTurn(game, "draw");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Barbed Sextant is a mana ability, with its draw at the next turn's upkeep", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const sextant = spawn(game, "Barbed Sextant");
    const before = hand(game, A).length;
    activate(game, sextant, 0, { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(zone(game, sextant)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before);
    nextTurn(game, "draw");
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Kjeldoran Dead sacrifices itself with no other creature", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const dead = toHand(game, "Kjeldoran Dead");
    cast(game, dead);
    expect(zone(game, dead)).toBe("graveyard");
  });

  it("Thermokarst gains 1 life only for a snow land", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const snow = spawn(game, "Snow-Covered Island", B);
    const plain = spawn(game, "Island", B);
    cast(game, toHand(game, "Thermokarst"), { targets: [ref(plain)] });
    expect(zone(game, plain)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    cast(game, toHand(game, "Thermokarst"), { targets: [ref(snow)] });
    expect(zone(game, snow)).toBe("graveyard");
    expect(life(game, A)).toBe(21);
  });

  it("River Delta stays tapped while it has a depletion counter, losing one each upkeep", () => {
    const { game } = table();
    const delta = spawn(game, "River Delta");
    activate(game, delta, 0);
    expect(counters(game, delta, "depletion")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    // Alice's untap step left it tapped; her upkeep then took the counter off.
    expect(game.state.objects[delta].tapped).toBe(true);
    expect(counters(game, delta, "depletion")).toBe(0);
  });

  it("Dwarven Armory works only during an upkeep, for a +2/+2 counter", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const armory = spawn(game, "Dwarven Armory");
    const bears = spawn(game, "Grizzly Bears");
    const fodder = spawn(game, "Forest");
    expect(() => activate(game, armory, 0, { targets: [ref(bears)] })).toThrow();
    toStep(game, "upkeep");
    const action = { type: "activate-ability", player: A, source: armory, abilityIndex: 0, targets: [ref(bears)], sacrifice: fodder } as const;
    expect(game.canDispatch(action)).toBeNull();
    game.dispatch(action);
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(counters(game, bears, "+2/+2")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Mistfolk counters a spell that targets it", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    const mistfolk = spawn(game, "Mistfolk");
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(mistfolk)], settle: false });
    activate(game, mistfolk, 0, { targets: [ref(shock)] });
    expect(zone(game, mistfolk)).toBe("battlefield");
    expect(zone(game, shock)).toBe("graveyard");
  });

  it("Hot Springs gives the enchanted land a damage prevention", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const land = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, land);
    cast(game, toHand(game, "Hot Springs"), { targets: [ref(land)] });
    activate(game, land, 1, { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Red Scarab: +2/+2 only while an opponent controls a red permanent", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Red Scarab"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Mountain", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Goblin Piker", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Maddening Wind hurts the enchanted creature's controller in their upkeep", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Maddening Wind"), { targets: [ref(bears)] });
    nextTurn(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});
