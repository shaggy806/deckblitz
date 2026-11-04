/**
 * What a flicker does once the card's back — `flicker`'s `returnThen` on a
 * delayed return, a `sequence` on an immediate one, either reading the return
 * through `this-way`'s `"put-onto-battlefield"`: Phelia, Exuberant Shepherd's
 * "if it entered under your control", Hallowed Respite's "otherwise, tap it",
 * Obzedat, Ghost Council's "it gains haste".
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { A, B, attack, cast, destroy, lands, life, pickTargets, settle, spawn, table, toStep, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

type G = ReturnType<typeof table>["game"];
const plus = (game: G, id: ObjectId): number => game.state.objects[id].counters["+1/+1"] ?? 0;
const keywords = (game: G, id: ObjectId): readonly string[] => [
  ...computeCharacteristics(game.state, game.registry, id).keywords,
];

describe("Phelia, Exuberant Shepherd", () => {
  it("returns your own permanent at the next end step, and puts a +1/+1 counter on Phelia", () => {
    const { game, a } = table();
    const phelia = spawn(game, "Phelia, Exuberant Shepherd", A);
    const bears = spawn(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    attack(game, a, [phelia]);
    expect(zone(game, bears)).toBe("exile");
    expect(plus(game, phelia)).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(plus(game, phelia)).toBe(1);
  });

  it("returns an opponent's permanent under its owner's control, with no counter", () => {
    const { game, a } = table();
    const phelia = spawn(game, "Phelia, Exuberant Shepherd", A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    attack(game, a, [phelia]);
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
    expect(plus(game, phelia)).toBe(0);
  });

  it("can exile nothing, and a land or Phelia herself isn't a legal target", () => {
    const { game, a } = table();
    const phelia = spawn(game, "Phelia, Exuberant Shepherd", A);
    const forest = spawn(game, "Forest", B);
    let offered: readonly string[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, options) => {
      offered = (options[0] ?? []).flatMap((ref) => (ref.kind === "object" ? [ref.object] : []));
      return [null];
    };
    attack(game, a, [phelia]);
    expect(offered).not.toContain(forest);
    expect(offered).not.toContain(phelia);
    toStep(game, "end");
    settle(game);
    expect(plus(game, phelia)).toBe(0);
  });

  it("a token exiled is gone: nothing returns and no counter", () => {
    const { game, a } = table();
    const phelia = spawn(game, "Phelia, Exuberant Shepherd", A);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    const token = game.battlefield.find((id) => game.state.objects[id].isToken);
    if (token === undefined) throw new Error("no token");
    pickTargets(a, token);
    attack(game, a, [phelia]);
    expect(game.state.objects[token]?.zone === "battlefield").toBe(false);
    toStep(game, "end");
    settle(game);
    expect(plus(game, phelia)).toBe(0);
  });

  it("the card returns with Phelia gone, and her graveyard card gets no counter", () => {
    const { game, a } = table();
    const phelia = spawn(game, "Phelia, Exuberant Shepherd", A);
    const bears = spawn(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    attack(game, a, [phelia]);
    destroy(game, phelia);
    expect(zone(game, phelia)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(plus(game, phelia)).toBe(0);
  });
});

describe("Hallowed Respite", () => {
  it("your creature returns with a +1/+1 counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Tundra", 2);
    const respite = game.debugSpawn("Hallowed Respite", A, "hand");
    cast(game, respite, { targets: [{ kind: "object", object: bears }] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(plus(game, bears)).toBe(1);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("someone else's returns tapped under its owner's control, with no counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Tundra", 2);
    const respite = game.debugSpawn("Hallowed Respite", A, "hand");
    cast(game, respite, { targets: [{ kind: "object", object: bears }] });
    expect(game.state.objects[bears].controller).toBe(B);
    expect(plus(game, bears)).toBe(0);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("can't target a legendary creature", () => {
    const { game } = table();
    const legend = spawn(game, "Phelia, Exuberant Shepherd", A);
    lands(game, "Tundra", 2);
    const respite = game.debugSpawn("Hallowed Respite", A, "hand");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: respite, targets: [{ kind: "object", object: legend }] })).not.toBeNull();
  });
});

describe("Obzedat, Ghost Council", () => {
  it("drains on entering, may leave at your end step, and returns at your next upkeep with haste", () => {
    const { game, a } = table();
    const obzedat = spawn(game, "Obzedat, Ghost Council", A);
    a.chooseModesFn = () => [0];
    toStep(game, "end");
    settle(game);
    expect(zone(game, obzedat)).toBe("exile");
    // Bob's turn passes with it gone.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "end");
    expect(zone(game, obzedat)).toBe("exile");
    // Back at Alice's next upkeep, with its entering drain.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "upkeep");
    settle(game);
    expect(zone(game, obzedat)).toBe("battlefield");
    expect(keywords(game, obzedat)).toContain("haste");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    // Haste lasts: it isn't an until-end-of-turn effect. (It stays this time.)
    a.chooseModesFn = () => [];
    game.advanceUntil((s) => s.turn.number === 4 && s.turn.step === "precombat-main");
    expect(keywords(game, obzedat)).toContain("haste");
  });
});
