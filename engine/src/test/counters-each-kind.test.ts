/**
 * The loop over each kind of counter on one object or player: double each kind
 * (Vorel of the Hull Clade), one more of each (Powerful Broker, Maulfist
 * Revolutionary — proliferate's step, rule 701.34a, on one thing with nothing
 * to choose), one more or one fewer, chosen kind by kind (Quarry Hauler,
 * Dramatist's Puppet).
 */

import { describe, expect, it } from "vitest";
import {
  B,
  activate,
  counters,
  destroy,
  enter,
  lands,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
} from "./harness.js";

describe("Vorel of the Hull Clade — double each kind", () => {
  it("doubles every kind on the target, and leaves other permanents alone", () => {
    const { game } = table();
    const vorel = spawn(game, "Vorel of the Hull Clade");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 2, stun: 1 };
    game.state.objects[other].counters = { "+1/+1": 2 };
    activate(game, vorel, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(4);
    expect(counters(game, bears, "stun")).toBe(2);
    expect(counters(game, other)).toBe(2);
  });

  it("can't target an enchantment", () => {
    const { game } = table();
    const vorel = spawn(game, "Vorel of the Hull Clade");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    const enchantment = spawn(game, "Glorious Anthem");
    expect(() => activate(game, vorel, 0, { targets: [ref(enchantment)] })).toThrow();
  });
});

describe("Powerful Broker — another counter of each kind", () => {
  it("adds one of each kind to a permanent", () => {
    const { game } = table();
    const broker = spawn(game, "Powerful Broker");
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters = { "+1/+1": 3, flying: 1 };
    activate(game, broker, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(4);
    expect(counters(game, bears, "flying")).toBe(2);
  });

  it("gives a player one of each kind they have, energy too", () => {
    const { game } = table();
    const broker = spawn(game, "Powerful Broker");
    game.state.players[B].counters = { poison: 3 };
    game.state.players[B].energy = 2;
    activate(game, broker, 0, { targets: [ref(B)] });
    expect(game.state.players[B].counters.poison).toBe(4);
    expect(game.state.players[B].energy).toBe(3);
    // No kind they didn't already have.
    expect(game.state.players[B].counters.experience ?? 0).toBe(0);
  });

  it("does nothing to a permanent with no counters", () => {
    const { game } = table();
    const broker = spawn(game, "Powerful Broker");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, broker, 0, { targets: [ref(bears)] });
    expect(Object.values(game.state.objects[bears].counters).reduce((n, c) => n + c, 0)).toBe(0);
  });

  it("goes through addCounter, so a Doubling Season applies", () => {
    const { game } = table();
    const broker = spawn(game, "Powerful Broker");
    spawn(game, "Doubling Season");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 1 };
    activate(game, broker, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(3);
  });

  it("is sorcery speed only", () => {
    const { game } = table({ step: "begin-combat" });
    const broker = spawn(game, "Powerful Broker");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, broker, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Maulfist Revolutionary — enters or dies", () => {
  it("fires on entering and again on dying", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 1 };
    pickTargets(a, bears);
    const maulfist = enter(game, "Maulfist Revolutionary");
    settle(game);
    expect(counters(game, bears)).toBe(2);
    destroy(game, maulfist);
    settle(game);
    expect(counters(game, bears)).toBe(3);
  });
});

describe("Quarry Hauler, Dramatist's Puppet — another or one fewer, kind by kind", () => {
  it("asks per kind: one chosen up and the other down", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 2, stun: 2 };
    pickTargets(a, bears);
    const asked: string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(texts[0]);
      return [asked.length === 1 ? 0 : 1];
    };
    enter(game, "Quarry Hauler");
    settle(game);
    expect(asked).toEqual(["Put another +1/+1 counter on it.", "Put another stun counter on it."]);
    expect(counters(game, bears)).toBe(3);
    expect(counters(game, bears, "stun")).toBe(1);
  });

  it("removing the last of a kind leaves none, and asks nothing with no counters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters = { "+1/+1": 1 };
    pickTargets(a, bears);
    pickModes(a, 1);
    enter(game, "Dramatist's Puppet");
    settle(game);
    expect(counters(game, bears)).toBe(0);

    const bare = spawn(game, "Grizzly Bears");
    pickTargets(a, bare);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    enter(game, "Dramatist's Puppet");
    settle(game);
    expect(asked).toBe(0);
  });
});
