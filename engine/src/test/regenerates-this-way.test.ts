/**
 * "When it regenerates this way, …" — a triggered ability the regeneration
 * sets off (a reflexive one, rule 603.12), carried on the shield as its `ifRegenerates`
 * reflexive trigger, with "that player" kept by the `regenerate` effect's
 * `thatPlayer`: Matopi Golem's "{1}: Regenerate this creature. When it
 * regenerates this way, put a -1/-1 counter on it" and Soldevi Sentry's
 * "{1}: Choose target opponent. Regenerate this creature. When it
 * regenerates this way, that player may draw a card."
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, counters, destroy, hand, lands, pickModes, pt, ref, settle, spawn, table, zone } from "./harness.js";

describe("Matopi Golem", () => {
  it("destroyed, it regenerates, then the trigger puts a -1/-1 counter on it", () => {
    const { game } = table();
    const golem = spawn(game, "Matopi Golem");
    lands(game, "Wastes", 1);
    activate(game, golem);
    expect(game.state.objects[golem].regenerationShields).toBe(1);
    expect(counters(game, golem, "-1/-1")).toBe(0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(golem)]);
    // The regeneration is done; the trigger waits for the stack.
    expect(zone(game, golem)).toBe("battlefield");
    expect(game.state.objects[golem].tapped).toBe(true);
    expect(counters(game, golem, "-1/-1")).toBe(0);
    expect(game.state.pendingTriggers.length + game.state.zones.shared.stack.length).toBe(1);
    settle(game);
    expect(counters(game, golem, "-1/-1")).toBe(1);
    expect(pt(game, golem)).toEqual({ power: 2, toughness: 2 });
    // No shield left: the next destruction sticks.
    destroy(game, golem, B);
    expect(zone(game, golem)).toBe("graveyard");
  });

  it("each shield used puts one counter; an unused shield puts none", () => {
    const { game } = table();
    const golem = spawn(game, "Matopi Golem");
    lands(game, "Wastes", 3);
    activate(game, golem);
    activate(game, golem);
    destroy(game, golem, B);
    expect(zone(game, golem)).toBe("battlefield");
    expect(counters(game, golem, "-1/-1")).toBe(1);
    expect(game.state.objects[golem].regenerationShields).toBe(1);
  });
});

describe("Soldevi Sentry", () => {
  it("the targeted opponent may draw when it regenerates this way, not another", () => {
    const { game, b, c } = table({ players: 3, openingHandSize: 0 });
    const sentry = spawn(game, "Soldevi Sentry");
    lands(game, "Wastes", 1);
    activate(game, sentry, 0, { targets: [ref(C)] });
    const before = { a: hand(game, A).length, b: hand(game, B).length, c: hand(game, C).length };
    pickModes(b, 0);
    pickModes(c, 0);
    destroy(game, sentry, B);
    expect(zone(game, sentry)).toBe("battlefield");
    expect(hand(game, C).length - before.c).toBe(1);
    expect(hand(game, B).length - before.b).toBe(0);
    expect(hand(game, A).length - before.a).toBe(0);
  });

  it("that player may decline; a shield never used draws nothing", () => {
    const { game, c } = table({ players: 3, openingHandSize: 0 });
    const sentry = spawn(game, "Soldevi Sentry");
    lands(game, "Wastes", 2);
    activate(game, sentry, 0, { targets: [ref(C)] });
    pickModes(c);
    const before = hand(game, C).length;
    destroy(game, sentry, B);
    expect(zone(game, sentry)).toBe("battlefield");
    expect(hand(game, C).length).toBe(before);
    // A second shield, not used this turn: nothing drawn at cleanup either.
    activate(game, sentry, 0, { targets: [ref(C)] });
    pickModes(c, 0);
    expect(hand(game, C).length).toBe(before);
  });
});
