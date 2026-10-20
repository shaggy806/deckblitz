/**
 * "Counters can't be put on …" and "players can't get counters" (`preventsCounters` — Solemnity;
 * Melira, Sylvok Outcast): none are put, a cost that would put them can't be paid, a permanent
 * enters without them, infect gives nothing, and cards in exile (not permanents) still get them.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, counters, destroy, enter, grant, keywords, lands, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Solemnity", () => {
  it("makes Devoted Druid's untap cost unpayable", () => {
    const { game } = table();
    spawn(game, "Solemnity");
    const druid = spawn(game, "Devoted Druid", A, { tapped: true });
    expect(() => activate(game, druid, 1)).toThrow(/counters can't be put/);
  });

  it("a persisting Kitchen Finks returns with no -1/-1 counter, so it persists again", () => {
    const { game } = table();
    spawn(game, "Solemnity");
    const finks = spawn(game, "Kitchen Finks");
    destroy(game, finks);
    settle(game);
    expect(zone(game, finks)).toBe("battlefield");
    expect(counters(game, finks, "-1/-1")).toBe(0);
    destroy(game, finks);
    settle(game);
    expect(zone(game, finks)).toBe("battlefield");
  });

  it("an effect puts no counters on a creature, and a player gets no energy", () => {
    const { game } = table();
    spawn(game, "Solemnity");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [{ kind: "object", object: bears }]);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 3 });
    expect(counters(game, bears)).toBe(0);
    expect(game.state.players[A].energy).toBe(0);
  });

  it("infect damage gives the player no poison and takes no life", () => {
    const { game, a } = table();
    spawn(game, "Solemnity", B);
    const agent = spawn(game, "Blighted Agent");
    attack(game, a, [agent]);
    expect(game.state.players[B].counters.poison ?? 0).toBe(0);
    expect(game.state.players[B].life).toBe(20);
  });

  it("a Saga gets no lore counter, so no chapter triggers", () => {
    const { game } = table();
    spawn(game, "Solemnity");
    const saga = enter(game, "History of Benalia");
    expect(counters(game, saga, "lore")).toBe(0);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Knight Token")).toHaveLength(0);
  });

  it("a suspended card in exile still gets its time counters", () => {
    const { game } = table();
    spawn(game, "Solemnity");
    lands(game, "Mountain", 1);
    const rift = toHand(game, "Rift Bolt");
    game.dispatch({ type: "suspend", player: A, card: rift });
    expect(game.state.objects[rift].counters.time).toBe(1);
  });
});

describe("Melira, Sylvok Outcast", () => {
  it("an opponent's creature loses infect: its damage is ordinary", () => {
    const { game, a } = table();
    spawn(game, "Melira, Sylvok Outcast", B);
    const agent = spawn(game, "Blighted Agent");
    expect(keywords(game, agent).has("infect")).toBe(false);
    attack(game, a, [agent]);
    expect(game.state.players[B].counters.poison ?? 0).toBe(0);
    expect(game.state.players[B].life).toBe(19);
  });

  it("infect regained later (timestamp order) gives Melira's controller no poison, and takes no life", () => {
    const { game, a } = table();
    spawn(game, "Melira, Sylvok Outcast", B);
    const agent = spawn(game, "Blighted Agent");
    grant(game, agent, "infect");
    expect(keywords(game, agent).has("infect")).toBe(true);
    attack(game, a, [agent]);
    expect(game.state.players[B].counters.poison ?? 0).toBe(0);
    expect(game.state.players[B].life).toBe(20);
  });

  it("creatures you control can't have -1/-1 counters put on them; an opponent's can", () => {
    const { game } = table();
    spawn(game, "Melira, Sylvok Outcast");
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [{ kind: "object", object: mine }]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [{ kind: "object", object: theirs }]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [{ kind: "object", object: mine }]);
    expect(counters(game, mine, "-1/-1")).toBe(0);
    expect(counters(game, mine, "+1/+1")).toBe(1);
    expect(counters(game, theirs, "-1/-1")).toBe(1);
  });
});
