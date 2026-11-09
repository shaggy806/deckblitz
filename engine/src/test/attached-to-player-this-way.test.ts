/**
 * "If you do" after attaching an Aura to a player: the this-way `attached`
 * read sees an attach to a player (rule 303.4), and doesn't see one that
 * didn't happen (701.3b) — Lynde, Cheerful Tormentor.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, destroy, hand, pickModes, pickPermanents, settle, spawn, table, toLibrary, toStep, zone } from "./harness.js";

const attachedCurse = (game: Game, to: PlayerId, controller: PlayerId = B): ObjectId => {
  const curse = spawn(game, "Curse of Verbosity", controller);
  game.state.objects[curse].attachedToPlayer = to;
  return curse;
};

describe("Lynde, Cheerful Tormentor", () => {
  it("attaches a Curse from you to the chosen opponent, and draws two", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Lynde, Cheerful Tormentor", A);
    const curse = attachedCurse(game, A);
    let asked = 0;
    a.chooseModesFn = () => [asked++ === 0 ? 0 : 1]; // yes, then carol
    pickPermanents(a, curse);
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Wastes", A);
    const before = hand(game, A).length;
    toStep(game, "upkeep", A);
    settle(game);
    expect(game.state.objects[curse].attachedToPlayer).toBe(C);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("doesn't draw when the attach didn't happen: protection from everything (rule 701.3b)", () => {
    const { game, a } = table();
    spawn(game, "Lynde, Cheerful Tormentor", A);
    const curse = attachedCurse(game, A);
    game.debugApplyEffect(B, { kind: "player-effect", duration: "permanent", protectionFromEverything: "you" }, [], { source: curse });
    pickModes(a, 0);
    pickPermanents(a, curse);
    const before = hand(game, A).length;
    toStep(game, "upkeep", A);
    settle(game);
    expect(game.state.objects[curse].attachedToPlayer).toBe(A);
    expect(hand(game, A).length).toBe(before);
  });

  it("A Curse put into your graveyard comes back attached to you at the next end step", () => {
    const { game } = table();
    spawn(game, "Lynde, Cheerful Tormentor", A);
    const curse = attachedCurse(game, B, A);
    destroy(game, curse);
    expect(zone(game, curse)).toBe("graveyard");
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, curse)).toBe("battlefield");
    expect(game.state.objects[curse].attachedToPlayer).toBe(A);
  });
});
