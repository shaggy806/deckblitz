/**
 * Cards exiled with a source (rule 607.2a) put onto the battlefield: a
 * `look-and-choose` over `zone: "exiled-with-source"` — one of them, chosen,
 * under the chooser's control (110.2a), with the usual riders (Nautiloid
 * Ship, whose `exile-graveyard { linked }` exiles them; Chaos Shrine's Black
 * Crystal's finality counter) — and `return-exiled-by-source`'s linked
 * battlefield return, `under: "you"` for a "put" (Underworld Sentinel) and
 * `others` with a `filter` for "all other permanent cards" (Mirror of Life
 * Trapping).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  controller,
  counters,
  destroy,
  lands,
  pickTargets,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  enter,
  zone,
} from "./harness.js";

const crewWith = (game: Game, vehicle: ObjectId, tap: readonly ObjectId[]): void => {
  const action: Action = { type: "activate-ability", player: A, source: vehicle, abilityIndex: 0, targets: [], tap };
  expect(game.canDispatch(action)).toBeNull();
  game.dispatch(action);
  settle(game);
};

describe("a card chosen from those exiled with the source, onto the battlefield", () => {
  it("Nautiloid Ship: the graveyard it exiled is linked to it, and its hit puts one of those creatures under your control", () => {
    const { game, a } = table();
    const theirs = [toGraveyard(game, "Serra Angel", B), toGraveyard(game, "Shock", B)];
    pickTargets(a, B);
    const ship = enter(game, "Nautiloid Ship");
    expect(theirs.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(theirs.every((id) => game.state.objects[id].exiledWith?.source === ship)).toBe(true);
    // A creature card exiled by something else is never offered.
    const stranger = game.debugSpawn("Grizzly Bears", B, "exile");
    const ogre = spawn(game, "Hill Giant");
    crewWith(game, ship, [ogre]);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.slice(0, 1);
    };
    attack(game, a, [ship]);
    expect(offered).toEqual([theirs[0]]);
    expect(zone(game, theirs[0])).toBe("battlefield");
    expect(controller(game, theirs[0])).toBe(A);
    expect(game.state.objects[theirs[0]].owner).toBe(B);
    expect(zone(game, theirs[1])).toBe("exile");
    expect(zone(game, stranger)).toBe("exile");
  });

  it("Nautiloid Ship: the hit is a may — choosing none leaves them exiled", () => {
    const { game, a } = table();
    const angel = toGraveyard(game, "Serra Angel", B);
    pickTargets(a, B);
    const ship = enter(game, "Nautiloid Ship");
    crewWith(game, ship, [spawn(game, "Hill Giant")]);
    a.chooseFromZoneFn = () => [];
    attack(game, a, [ship]);
    expect(zone(game, angel)).toBe("exile");
  });

  it("Chaos Shrine's Black Crystal: a nontoken creature that dies is exiled with it, and returns at upkeep with a finality counter", () => {
    const { game, a } = table();
    spawn(game, "Chaos Shrine's Black Crystal");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    a.chooseFromZoneFn = (_view, eligible) => [...eligible];
    toStep(game, "end");
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(counters(game, bears, "finality")).toBe(1);
  });
});

describe("the cards exiled with the source, all put onto the battlefield", () => {
  it("Underworld Sentinel: when it dies, the cards it exiled enter under its controller's control", () => {
    const { game, a } = table();
    const sentinel = spawn(game, "Underworld Sentinel");
    const angel = toGraveyard(game, "Serra Angel");
    pickTargets(a, angel);
    attack(game, a, [sentinel]);
    expect(zone(game, angel)).toBe("exile");
    expect(game.state.objects[angel].exiledWith?.source).toBe(sentinel);
    destroy(game, sentinel);
    expect(zone(game, angel)).toBe("battlefield");
    expect(controller(game, angel)).toBe(A);
  });

  it("Underworld Sentinel controlled by another player puts its cards under that player's control", () => {
    const { game, a } = table();
    const sentinel = spawn(game, "Underworld Sentinel");
    const angel = toGraveyard(game, "Serra Angel");
    pickTargets(a, angel);
    attack(game, a, [sentinel]);
    // Bob takes control of it; its dies trigger is then Bob's (rule 110.2a).
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [{ kind: "object", object: sentinel }]);
    settle(game);
    expect(controller(game, sentinel)).toBe(B);
    destroy(game, sentinel, A);
    expect(zone(game, angel)).toBe("battlefield");
    expect(controller(game, angel)).toBe(B);
    expect(game.state.objects[angel].owner).toBe(A);
  });

  it("Mirror of Life Trapping: a cast creature is exiled with it, and the one exiled before comes back under its owner's control", () => {
    const { game } = table();
    spawn(game, "Mirror of Life Trapping");
    lands(game, "Forest", 4);
    const first = toHand(game, "Grizzly Bears");
    cast(game, first);
    expect(zone(game, first)).toBe("exile");
    const second = toHand(game, "Grizzly Bears");
    cast(game, second);
    expect(zone(game, second)).toBe("exile");
    expect(zone(game, first)).toBe("battlefield");
    expect(controller(game, first)).toBe(A);
    // A creature put onto the battlefield without being cast isn't touched.
    const spawned = game.debugSpawn("Hill Giant", B, "battlefield", { announceEntry: true });
    settle(game);
    expect(zone(game, spawned)).toBe("battlefield");
    expect(zone(game, second)).toBe("exile");
  });

  it("Mirror of Life Trapping returns only permanent cards: an instant exiled with it stays", () => {
    const { game } = table();
    const mirror = spawn(game, "Mirror of Life Trapping");
    const bolt = game.debugSpawn("Lightning Bolt", A, "exile");
    game.state.objects[bolt].exiledWith = { source: mirror, zoneChangeCount: game.state.objects[mirror].zoneChangeCount ?? 0 };
    const bear = game.debugSpawn("Grizzly Bears", B, "exile");
    game.state.objects[bear].exiledWith = { source: mirror, zoneChangeCount: game.state.objects[mirror].zoneChangeCount ?? 0 };
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, bear)).toBe("battlefield");
    expect(controller(game, bear)).toBe(B);
    expect(zone(game, bolt)).toBe("exile");
  });
});

