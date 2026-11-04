/**
 * `counters-put`'s `orPlayer`: "whenever you put one or more counters on a
 * permanent or player" (All Will Be One), a player's counters (rule 122.1) and
 * energy (rule 107.14) among them, and once per player for a simultaneous
 * placement (two toxic creatures connecting at once: its ruling).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, attack, B, C, counters, enter, life, pickTargets, ref, settle, spawn, table } from "./harness.js";

/** All Will Be One, its triggers aimed at Bob, each trigger counted: Bob's
 * Bears make the target a choice, so that each is asked. */
function allWillBeOne(game: Game, seat: ScriptedController): { readonly asked: () => number } {
  spawn(game, "All Will Be One");
  spawn(game, "Grizzly Bears", B);
  let asked = 0;
  seat.chooseTargetsFn = () => {
    asked += 1;
    return [ref(B)];
  };
  return { asked: () => asked };
}

describe("All Will Be One", () => {
  it("counters Alice puts on a permanent, that many damage", () => {
    const { game, a } = table();
    allWillBeOne(game, a);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(bears)]);
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("counters on an opponent's permanent are still ones she put", () => {
    const { game, a } = table();
    allWillBeOne(game, a);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(life(game, B)).toBe(19);
  });

  it("not counters Bob puts", () => {
    const { game, a } = table();
    const { asked } = allWillBeOne(game, a);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(bears)]);
    settle(game);
    expect(asked()).toBe(0);
    expect(life(game, B)).toBe(20);
  });

  it("a poison counter she gives a player", () => {
    const { game, a } = table();
    allWillBeOne(game, a);
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 2, target: 0 }, [ref(B)]);
    settle(game);
    expect(game.state.players[B].counters.poison).toBe(2);
    expect(life(game, B)).toBe(18);
  });

  it("energy she gets", () => {
    const { game, a } = table();
    allWillBeOne(game, a);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 3 }, []);
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("each player's counters are their own event", () => {
    const { game, a } = table({ players: 3 });
    const { asked } = allWillBeOne(game, a);
    enter(game, "Ichor Rats");
    // Alice, Bob and Carol: three players, three triggers of 1.
    expect(asked()).toBe(3);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
  });

  it("two toxic creatures connecting at once put their counters as one event: one trigger", () => {
    const { game, a } = table();
    const { asked } = allWillBeOne(game, a);
    const contaminators: readonly ObjectId[] = [spawn(game, "Bloated Contaminator"), spawn(game, "Bloated Contaminator")];
    // Their own proliferates add nothing.
    a.chooseProliferateFn = () => [];
    attack(game, a, contaminators);
    expect(game.state.players[B].counters.poison).toBe(2);
    expect(asked()).toBe(1);
    expect(life(game, B)).toBe(20 - 8 - 2);
  });

  it("proliferating a player's two kinds at once is one trigger of 2", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "get-energy", amount: 1 }, []);
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 1, who: "you" }, []);
    settle(game);
    const { asked } = allWillBeOne(game, a);
    a.chooseProliferateFn = () => [ref(A)];
    game.debugApplyEffect(A, { kind: "proliferate" }, []);
    settle(game);
    expect(asked()).toBe(1);
    expect(life(game, B)).toBe(18);
  });

  it("proliferating a permanent's two kinds at once is one trigger of 2, and two permanents two", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    for (const id of [one, other]) {
      game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);
    }
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "charge", amount: 1 }, [ref(one)]);
    settle(game);
    const { asked } = allWillBeOne(game, a);
    a.chooseProliferateFn = () => [ref(one)];
    game.debugApplyEffect(A, { kind: "proliferate" }, []);
    settle(game);
    expect(asked()).toBe(1);
    expect(life(game, B)).toBe(18);
    a.chooseProliferateFn = () => [ref(one), ref(other)];
    game.debugApplyEffect(A, { kind: "proliferate" }, []);
    settle(game);
    expect(asked()).toBe(3);
    expect(life(game, B)).toBe(15);
  });

  it("a planeswalker entering with loyalty", () => {
    const { game, a } = table();
    allWillBeOne(game, a);
    const walker = enter(game, "Chandra, Fire Artisan");
    expect(counters(game, walker, "loyalty")).toBe(4);
    expect(life(game, B)).toBe(16);
  });

  it("its target can be a creature or planeswalker an opponent controls, not her own", () => {
    const { game, a } = table();
    spawn(game, "All Will Be One");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(a, theirs);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(mine)]);
    settle(game);
    expect(game.state.objects[theirs].zone).toBe("graveyard");
    expect(game.state.objects[mine].zone).toBe("battlefield");
  });
});
