/**
 * B253's lead cards, one per feature built: Ghirapur Guide ("can't be blocked
 * by [filter] this turn"), Full Steam Ahead (a granted static), Blood Moon and
 * Tideshaper Mystic (rule 305.7's land-type setting, fixed and chosen on
 * resolution), Switcheroo (exchange of control, rule 701.12).
 */

import { describe, expect, it } from "vitest";

import { intrinsicManaColors } from "../characteristics.js";
import { A, B, C, activate, blockOffer, cast, controller, keywords, named, pt, ref, registryOf, settle, spawn, subtypes, table, toHand } from "./harness.js";

describe("B253 lead cards", () => {
  it("Ghirapur Guide: target creature can't be blocked by power 2 or less this turn", () => {
    const { game, a } = table();
    const guide = spawn(game, "Ghirapur Guide", A);
    spawn(game, "Forest", A);
    spawn(game, "Forest", A);
    spawn(game, "Forest", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, guide, 0, { targets: [ref(guide)] });
    const offer = blockOffer(game, a, [guide]);
    const eligible = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(eligible(bears)).toEqual([]);
    expect(eligible(giant)).toEqual([guide]);
  });

  it("Full Steam Ahead: +2/+2, trample, and no more than one blocker each", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    for (let i = 0; i < 5; i++) spawn(game, "Forest", A);
    cast(game, toHand(game, "Full Steam Ahead"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const b1 = spawn(game, "Grizzly Bears", B);
    const b2 = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [bears]);
    expect(() =>
      game.dispatch({
        type: "declare-blockers",
        player: B,
        blocks: [
          { blocker: b1, attacker: bears },
          { blocker: b2, attacker: bears },
        ],
      }),
    ).toThrow();
  });

  it("Blood Moon: a nonbasic land is a Mountain that taps only for {R}", () => {
    const { game } = table();
    const coast = spawn(game, "Yavimaya Coast", A);
    for (let i = 0; i < 3; i++) spawn(game, "Mountain", A);
    cast(game, toHand(game, "Blood Moon"));
    expect(subtypes(game, coast)).toEqual(["Mountain"]);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[coast])).toEqual(["R"]);
    const coastAbilities = game
      .legalActions(A)
      .filter((action) => action.kind === "activate-ability" && action.source === coast);
    expect(coastAbilities.length).toBe(1);
  });

  it("Tideshaper Mystic: the land becomes the chosen basic type until end of turn", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Tideshaper Mystic", A);
    const coast = spawn(game, "Yavimaya Coast", B);
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("Swamp") ? "Swamp" : options[0]);
    activate(game, mystic, 0, { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(subtypes(game, coast)).toEqual([]);
  });

  it("Switcheroo: two creatures change hands", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    for (let i = 0; i < 5; i++) spawn(game, "Island", A);
    cast(game, toHand(game, "Switcheroo"), { targets: [ref(mine), ref(theirs)] });
    expect(controller(game, mine)).toBe(B);
    expect(controller(game, theirs)).toBe(A);
  });

  it("Glaciers: a land made a Mountain later is still a Plains", () => {
    const { game } = table();
    spawn(game, "Glaciers", A);
    const forest = spawn(game, "Forest", A);
    game.debugApplyEffect(A, { kind: "add-types", target: 0, setSubtypes: ["Mountain"], duration: "end-of-turn" }, [ref(forest)]);
    settle(game);
    expect(subtypes(game, forest)).toEqual(["Plains"]);
  });

  it("Conversion: Mountains are Plains, and it asks for {W}{W} at upkeep", () => {
    const { game } = table();
    spawn(game, "Conversion", A);
    const mountain = spawn(game, "Mountain", A);
    expect(subtypes(game, mountain)).toEqual(["Plains"]);
    expect(intrinsicManaColors(game.state, registryOf(game), game.state.objects[mountain])).toEqual(["W"]);
  });

  it("Earthbind: 2 damage to a flyer, which then loses flying", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    spawn(game, "Mountain", A);
    cast(game, toHand(game, "Earthbind"), { targets: [ref(angel)] });
    expect(game.state.objects[angel].damageMarked).toBe(2);
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(keywords(game, angel).has("vigilance")).toBe(true);
  });

  it("Earthbind: on a creature without flying, nothing happens", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Mountain", A);
    cast(game, toHand(game, "Earthbind"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("Reins of Power: only you and the target opponent swap, with haste; carol's stay", () => {
    const { game } = table({ players: 3 });
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    const bobs = spawn(game, "Hill Giant", B, { tapped: true });
    const carols = spawn(game, "Hill Giant", C, { tapped: true });
    for (let i = 0; i < 4; i++) spawn(game, "Island", A);
    cast(game, toHand(game, "Reins of Power"), { targets: [ref(B)] });
    expect(controller(game, mine)).toBe(B);
    expect(controller(game, bobs)).toBe(A);
    expect(game.state.objects[bobs].tapped).toBe(false);
    expect(keywords(game, bobs).has("haste")).toBe(true);
    expect(keywords(game, mine).has("haste")).toBe(true);
    expect(controller(game, carols)).toBe(C);
    expect(game.state.objects[carols].tapped).toBe(true);
    expect(keywords(game, carols).has("haste")).toBe(false);
  });

  it("Roar of the Fifth People: two Dinosaurs, then they tap for mana", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Poet of Unity", A);
    for (let i = 0; i < 3; i++) spawn(game, "Forest", A);
    for (let i = 0; i < 2; i++) spawn(game, "Plains", A);
    activate(game, huatli);
    const saga = game.battlefield.find((id) => game.state.objects[id].owner === A && subtypes(game, id).includes("Saga"))!;
    const dinos = named(game, "3/3 Dinosaur Token", A);
    expect(dinos.length).toBeGreaterThan(0);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    const dino = dinos[0];
    game.state.objects[dino].summoningSick = false;
    const offered = game.legalActions(A).filter((action) => action.kind === "activate-ability" && action.source === dino);
    expect(offered.length).toBe(3); // one per colour: {R}, {G} or {W}
  });
});
