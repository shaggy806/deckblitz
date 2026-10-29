/**
 * B253 group A: cards freed by granted statics, "can't be blocked by [X]
 * this turn", rule 305.7's land-type setting and exchange of control.
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics, intrinsicManaColors } from "../characteristics.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  hand,
  keywords,
  life,
  loyalty,
  named,
  pickModes,
  pt,
  ref,
  registryOf,
  spawn,
  enter,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("B253 group A", () => {
  it("Song of the Dryads: the enchanted creature is a colorless Forest land with only {T}: Add {G}", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    for (let i = 0; i < 3; i++) spawn(game, "Forest", A);
    cast(game, toHand(game, "Song of the Dryads"), { targets: [ref(angel)] });
    expect(types(game, angel)).toEqual(["land"]);
    expect(subtypes(game, angel)).toEqual(["Forest"]);
    expect(computeCharacteristics(game.state, registryOf(game), angel).colors.size).toBe(0);
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(keywords(game, angel).has("vigilance")).toBe(false);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[angel])).toEqual(["G"]);
  });

  it("Carnage: the returned creature is sacrificed after it deals combat damage to a player", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears", A);
    const giant = toGraveyard(game, "Hill Giant", A);
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      const options = legal[0] ?? [];
      return [options.find((t) => t.kind === "object" && game.state.objects[t.object].cardName === "Grizzly Bears") ?? null];
    };
    enter(game, "Carnage, Crimson Chaos", A);
    const bears = named(game, "Grizzly Bears", A).find((id) => zone(game, id) === "battlefield");
    expect(bears).toBeDefined();
    expect(zone(game, giant)).toBe("graveyard");
    toStep(game, "precombat-main");
    attack(game, a, [bears!]);
    expect(life(game, B)).toBe(18);
    expect(named(game, "Grizzly Bears", A).some((id) => zone(game, id) === "battlefield")).toBe(false);
  });

  it("Modify Memory: exchanging two other players' creatures draws three; one of yours doesn't", () => {
    const { game } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    for (let i = 0; i < 10; i++) spawn(game, "Island", A);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Modify Memory"), { targets: [ref(bobs), ref(carols)] });
    expect(controller(game, bobs)).toBe(C);
    expect(controller(game, carols)).toBe(B);
    expect(hand(game, A).length).toBe(before + 3);

    const mine = spawn(game, "Grizzly Bears", A);
    const after = hand(game, A).length;
    cast(game, toHand(game, "Modify Memory"), { targets: [ref(mine), ref(bobs)] });
    expect(controller(game, mine)).toBe(C);
    expect(controller(game, bobs)).toBe(A);
    expect(hand(game, A).length).toBe(after);
  });

  it("Ashiok's −11 takes every creature the target opponent controls, and nothing else", () => {
    const { game } = table({ players: 3 });
    const ashiok = spawn(game, "Ashiok, Sculptor of Fears", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Grizzly Bears", C);
    loyalty(game, ashiok, -11, { atLeast: 11, targets: [ref(B)] });
    expect(controller(game, bears)).toBe(A);
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, carols)).toBe(C);
  });

  it("Run for Your Life: both creatures can be blocked only by creatures with haste", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears", A);
    const two = spawn(game, "Hill Giant", A);
    spawn(game, "Island", A);
    spawn(game, "Mountain", A);
    const plain = spawn(game, "Grizzly Bears", B);
    const hasty = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Run for Your Life"), { targets: [ref(one), ref(two)] });
    expect(keywords(game, two).has("haste")).toBe(true);
    const offer = blockOffer(game, a, [one, two]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(plain)).toEqual([]);
    expect([...eligible(hasty)].sort()).toEqual([one, two].sort());
  });

  it("Thelonite Monk: the land is a Forest for good, paid with a green creature", () => {
    const { game } = table();
    const monk = spawn(game, "Thelonite Monk", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: monk,
      abilityIndex: 0,
      targets: [ref(coast)],
      sacrifice: bears,
    } as Parameters<typeof game.dispatch>[0]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(subtypes(game, coast)).toEqual(["Forest"]);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(subtypes(game, coast)).toEqual(["Forest"]);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[coast])).toEqual(["G"]);
  });

  it("Rhonas's Stalwart: exerted, it's 3/3 and power-2 creatures can't block it", () => {
    const { game, a } = table();
    const stalwart = spawn(game, "Rhonas's Stalwart", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    const offer = blockOffer(game, a, [stalwart]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(pt(game, stalwart)).toEqual({ power: 3, toughness: 3 });
    expect(eligible(bears)).toEqual([]);
    expect(eligible(giant)).toEqual([stalwart]);
  });

  it("Grixis Illusionist: a land you control becomes the chosen type until end of turn", () => {
    const { game, a } = table();
    const illusionist = spawn(game, "Grixis Illusionist", A);
    const coast = spawn(game, "Yavimaya Coast", A);
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("Swamp") ? "Swamp" : options[0]);
    activate(game, illusionist, 0, { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[coast])).toEqual(["B"]);
  });
});
