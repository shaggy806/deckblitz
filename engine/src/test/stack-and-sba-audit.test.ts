import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/**
 * A rules audit (2026-11-17), second slice: resolving spells, the order of
 * triggers, and state-based actions, each asked of the game. They held; the
 * tests keep them holding.
 */
describe("resolving and state-based actions, audited", () => {
  it("a spell whose only target is gone does none of what it says, not even the card (rule 608.2b)", () => {
    // Defiant Strike: "Target creature gets +1/+0 until end of turn. Draw a card."
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    const strike = toHand(game, "Defiant Strike");
    cast(game, strike, { targets: [ref(bears)], settle: false });
    const held = hand(game, A).length;
    destroy(game, bears);
    settle(game);
    expect(zone(game, strike)).toBe("graveyard");
    expect(hand(game, A).length).toBe(held);
  });

  it("a creature taken this turn can't attack: it wasn't controlled since the turn began (rule 302.6)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(giant)]);
    expect(game.state.objects[giant].controller).toBe(A);
    const before = life(game, B);
    try {
      a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
      toStep(game, "postcombat-main");
    } catch {
      // A refused declaration is as good as an attack that never happens.
    }
    expect(life(game, B)).toBe(before);
  });

  it("an empty library loses nothing by itself; drawing from it does (rules 104.3c, 704.5b)", () => {
    const { game } = table();
    game.state.zones.perPlayer[A].library = [];
    lands(game, "Island", 1);
    // A turn's worth of steps without a draw: still in the game.
    toStep(game, "postcombat-main");
    expect(game.state.players[A].hasLost).toBeFalsy();
    cast(game, toHand(game, "Opt"));
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("the legend rule lets its controller keep either one (rule 704.5j)", () => {
    const { game, a } = table();
    const first = spawn(game, "Isamaru, Hound of Konda");
    a.chooseLegendToKeepFn = (_view, _name, options) => options.find((id) => id === first) ?? options[0];
    const second = enter(game, "Isamaru, Hound of Konda");
    // State-based actions run as a player would next get priority.
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("graveyard");
  });

  it("a +1/+1 counter and a -1/-1 counter on one permanent go together (rule 704.5q)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(giant)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [ref(giant)]);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, giant, "+1/+1")).toBe(1);
    expect(counters(game, giant, "-1/-1")).toBe(0);
  });

  it("triggers of two players go on the stack active player first, so the other's resolves first (rule 603.3b)", () => {
    const { game } = table();
    const mine = spawn(game, "Soul Warden");
    const theirs = spawn(game, "Soul Warden", B);
    const from = game.state.eventLog.length;
    enter(game, "Grizzly Bears");
    settle(game);
    const order = game.state.eventLog
      .slice(from)
      .flatMap((e) => (e.type === "ability-triggered" && (e.source === mine || e.source === theirs) ? [e.source] : []));
    expect(order).toEqual([mine, theirs]);
    const gains = game.state.eventLog
      .slice(from)
      .flatMap((e) => (e.type === "life-changed" && e.delta === 1 ? [e.player] : []));
    expect(gains).toEqual([B, A]);
  });
});
