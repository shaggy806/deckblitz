/**
 * "If an Assassin crewed it this turn" (Adrestia): the journal's `crewed-by`
 * entries, each crewer kept as it was tapped to pay the crew cost (rule
 * 702.122b-c; the rulings), read by `turn-history`'s `ofSelf` over the
 * `crewers` view — though the crewer has left or changed since.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, attack, destroy, hand, ref, settle, spawn, subtypes, table } from "./harness.js";

const crewWith = (game: Game, vehicle: ObjectId, tap: readonly ObjectId[]): void => {
  const action: Action = { type: "activate-ability", player: A, source: vehicle, abilityIndex: 0, targets: [], tap };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
};

describe("Adrestia", () => {
  it("crewed by an Assassin: attacking draws a card and it becomes an Assassin", () => {
    const { game, a } = table();
    const adrestia = spawn(game, "Adrestia");
    const assassin = spawn(game, "Royal Assassin");
    crewWith(game, adrestia, [assassin]);
    const before = hand(game).length;
    attack(game, a, [adrestia]);
    expect(hand(game)).toHaveLength(before + 1);
    expect(subtypes(game, adrestia)).toContain("Assassin");
  });

  it("crewed by a non-Assassin: nothing", () => {
    const { game, a } = table();
    const adrestia = spawn(game, "Adrestia");
    const bears = spawn(game, "Grizzly Bears");
    crewWith(game, adrestia, [bears]);
    const before = hand(game).length;
    attack(game, a, [adrestia]);
    expect(hand(game)).toHaveLength(before);
    expect(subtypes(game, adrestia)).not.toContain("Assassin");
  });

  it("the Assassin counts though it has died since", () => {
    const { game, a } = table();
    const adrestia = spawn(game, "Adrestia");
    const assassin = spawn(game, "Royal Assassin");
    crewWith(game, adrestia, [assassin]);
    destroy(game, assassin);
    const before = hand(game).length;
    attack(game, a, [adrestia]);
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("read as each crewer was tapped: one made an Assassin afterwards doesn't count", () => {
    const { game, a } = table();
    const adrestia = spawn(game, "Adrestia");
    const bears = spawn(game, "Grizzly Bears");
    crewWith(game, adrestia, [bears]);
    game.debugApplyEffect(A, { kind: "become", target: 0, addSubtypes: ["Assassin"], duration: "end-of-turn" }, [ref(bears)]);
    settle(game);
    expect(subtypes(game, bears)).toContain("Assassin");
    const before = hand(game).length;
    attack(game, a, [adrestia]);
    expect(hand(game)).toHaveLength(before);
  });

  it("an Assassin that crewed another Vehicle doesn't count", () => {
    const { game, a } = table();
    const adrestia = spawn(game, "Adrestia");
    const copter = spawn(game, "Smuggler's Copter");
    const assassin = spawn(game, "Royal Assassin");
    const bears = spawn(game, "Grizzly Bears");
    crewWith(game, copter, [assassin]);
    crewWith(game, adrestia, [bears]);
    const before = hand(game).length;
    a.chooseModesFn = () => [];
    attack(game, a, [adrestia]);
    expect(hand(game)).toHaveLength(before);
  });
});
