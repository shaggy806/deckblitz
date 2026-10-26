/**
 * Echo (rule 702.30 — the `echo(cost)` helper, on the
 * `source-came-under-control-since-last-upkeep` condition): "At the
 * beginning of your upkeep, if this permanent came under your control since
 * the beginning of your last upkeep, sacrifice it unless you pay [cost]." It
 * asks once after the permanent enters, and once more after each change of
 * control. Urza's Saga's Goblin Patrol ({R}), Ravnica Remastered's Rakdos
 * Headliner (discard a card).
 */
import { describe, expect, it } from "vitest";
import { A, B, cast, hand, lands, nextTurn, pickModes, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

describe("echo", () => {
  it("asks once, at the first upkeep after it enters — paid, it stays and isn't asked again", () => {
    const { game, a } = table();
    const patrol = spawn(game, "Goblin Patrol");
    const [mountain] = lands(game, "Mountain", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, patrol)).toBe("battlefield");
    expect(game.state.objects[mountain].tapped).toBe(true); // tapped to pay, after the untap step
    // The next upkeep: it hasn't come under alice's control since her last
    // upkeep, so echo doesn't trigger — declining would sacrifice it.
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    nextTurn(game);
    nextTurn(game);
    expect(asked).toBe(0);
    expect(zone(game, patrol)).toBe("battlefield");
  });

  it("is sacrificed when its controller doesn't pay", () => {
    const { game, a } = table();
    const patrol = spawn(game, "Goblin Patrol");
    lands(game, "Mountain", 1);
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, patrol)).toBe("graveyard");
  });

  it("asks again of a player who gains control of it, at their next upkeep", () => {
    const { game, a, b } = table();
    const patrol = spawn(game, "Goblin Patrol");
    lands(game, "Mountain", 1);
    lands(game, "Island", 4, B);
    pickModes(a, 0);
    nextTurn(game); // bob's turn: alice hasn't had her upkeep yet
    nextTurn(game); // alice pays
    expect(zone(game, patrol)).toBe("battlefield");
    nextTurn(game); // bob's main: he takes it
    pickTargets(b, patrol);
    cast(game, toHand(game, "Control Magic", B), { player: B, targets: [ref(patrol)] });
    expect(game.state.objects[patrol].controller).toBe(B);
    pickModes(b);
    nextTurn(game);
    nextTurn(game); // bob's upkeep: it came under his control since his last — he declines
    expect(zone(game, patrol)).toBe("graveyard");
  });

  it("a non-mana echo cost: Rakdos Headliner's discard", () => {
    const { game, a } = table();
    const headliner = spawn(game, "Rakdos Headliner");
    pickModes(a, 0);
    nextTurn(game);
    const before = hand(game).length;
    nextTurn(game);
    expect(zone(game, headliner)).toBe("battlefield");
    // Drew one in the draw step, discarded one in the upkeep.
    expect(hand(game).length).toBe(before);
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(1);
  });
});
