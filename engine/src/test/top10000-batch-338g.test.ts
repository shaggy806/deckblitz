/**
 * B338g (author-top-cards overnight, lane replacements-copies).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const on = (game: Game, id: ObjectId): ObjectId | null => game.state.objects[id].attachedTo ?? null;

describe("Storm Herald: Auras returned, exiled at your end step or if they'd leave", () => {
  it("returns only the Auras chosen, each onto a creature you control", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const rancor = toGraveyard(game, "Rancor");
    const pacifism = toGraveyard(game, "Pacifism");
    const theirs = spawn(game, "Hill Giant", B);
    const seen = pickFromZone(a, rancor);
    let hosts: readonly unknown[] = [];
    a.chooseEnchantFn = (_view, _source, options) => {
      hosts = options;
      return options.find((o) => o === bears) ?? options[0];
    };
    cast(game, toHand(game, "Storm Herald"));
    settle(game);
    expect(seen.offered).toEqual(expect.arrayContaining([rancor, pacifism]));
    expect(hosts).toContain(bears);
    expect(hosts).not.toContain(theirs);
    expect(on(game, rancor)).toBe(bears);
    expect(zone(game, pacifism)).toBe("graveyard");
  });

  it("an Aura that would go to the graveyard is exiled instead (Rancor never returns to hand)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Grizzly Bears");
    const rancor = toGraveyard(game, "Rancor");
    pickFromZone(a, rancor);
    cast(game, toHand(game, "Storm Herald"));
    settle(game);
    expect(zone(game, rancor)).toBe("battlefield");
    destroy(game, rancor);
    expect(zone(game, rancor)).toBe("exile");
    expect(hand(game)).not.toContain(rancor);
  });

  it("exiles those Auras at the beginning of your next end step", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const rancor = toGraveyard(game, "Rancor");
    pickFromZone(a, rancor);
    cast(game, toHand(game, "Storm Herald"));
    settle(game);
    expect(on(game, rancor)).not.toBeNull();
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, rancor)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Suncleanser: no counters while it remains", () => {
  const counter = (game: Game, id: ObjectId, n = 1): void => {
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: n }, [ref(id)]);
    settle(game);
  };

  it("removes all counters from the creature, which then can't get any until Suncleanser leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    counter(game, bears, 2);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "stun", amount: 1 }, [ref(bears)]);
    lands(game, "Plains", 2);
    pickModes(a, 0);
    pickTargets(a, bears);
    const cleanser = toHand(game, "Suncleanser");
    cast(game, cleanser);
    settle(game);
    expect(Object.values(game.state.objects[bears].counters).filter((n) => n > 0)).toEqual([]);
    counter(game, bears);
    expect(counters(game, bears)).toBe(0);
    destroy(game, cleanser);
    counter(game, bears);
    expect(counters(game, bears)).toBe(1);
  });

  it("the opponent loses all counters, and can't get counters while it remains", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 3, who: { target: 0 } }, [ref(B)]);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 2, who: { target: 0 } }, [ref(B)]);
    settle(game);
    expect(game.state.players[B].counters.poison).toBe(3);
    expect(game.state.players[B].energy).toBe(2);
    lands(game, "Plains", 2);
    pickModes(a, 1);
    pickTargets(a, B);
    const cleanser = toHand(game, "Suncleanser");
    cast(game, cleanser);
    settle(game);
    expect(game.state.players[B].counters.poison ?? 0).toBe(0);
    expect(game.state.players[B].energy).toBe(0);
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 2, who: { target: 0 } }, [ref(B)]);
    settle(game);
    expect(game.state.players[B].counters.poison ?? 0).toBe(0);
    // You can still get them.
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 1 });
    settle(game);
    expect(game.state.players[A].counters.poison).toBe(1);
    destroy(game, cleanser);
    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "poison", amount: 2, who: { target: 0 } }, [ref(B)]);
    settle(game);
    expect(game.state.players[B].counters.poison).toBe(2);
  });
});

describe("Lich", () => {
  const nontoken = (game: Game): number =>
    game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === A && !game.state.objects[id].isToken).length;

  it("you lose life equal to your life total as it enters, and don't lose for 0 life", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    expect(life(game)).toBe(20);
    cast(game, toHand(game, "Lich"));
    settle(game);
    expect(zone(game, named(game, "Lich")[0])).toBe("battlefield");
    expect(life(game)).toBe(0);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("draws that many cards instead of gaining life", () => {
    const { game } = table();
    spawn(game, "Lich");
    const before = { life: life(game), hand: hand(game).length };
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 });
    settle(game);
    expect(life(game)).toBe(before.life);
    expect(hand(game).length).toBe(before.hand + 2);
  });

  it("dealt damage: sacrifices that many nontoken permanents", () => {
    const { game, a } = table();
    const lich = spawn(game, "Lich");
    const bears = [0, 1, 2].map(() => spawn(game, "Grizzly Bears"));
    lands(game, "Mountain", 1);
    expect(nontoken(game)).toBe(5);
    const seen = { offered: [] as readonly ObjectId[] };
    a.chooseSacrificesFn = (_view, eligible) => {
      seen.offered = eligible;
      return bears;
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    settle(game);
    expect(seen.offered).toContain(lich);
    expect(bears.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    expect(zone(game, lich)).toBe("battlefield");
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("dealt more damage than it has nontoken permanents: sacrifices them all and loses", () => {
    const { game } = table();
    spawn(game, "Lich");
    spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    settle(game);
    expect(nontoken(game)).toBe(0);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("a nontoken permanent that can't be sacrificed doesn't count toward 'that many': it loses as the trigger resolves", () => {
    // Lich and two Hithlain Ropes are three nontoken permanents, but only
    // Lich can be sacrificed: dealt 3, it can't sacrifice three, so the loss
    // is the damage trigger's own, not just Lich's when it reaches a graveyard.
    const { game } = table();
    const lich = spawn(game, "Lich");
    const ropes = [spawn(game, "Hithlain Rope"), spawn(game, "Hithlain Rope")];
    expect(nontoken(game)).toBe(3);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    game.advanceUntil((s) => s.objects[lich].zone !== "battlefield" || s.players[A].hasLost);
    expect(zone(game, lich)).toBe("graveyard");
    expect(ropes.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("loses the game when it's put into a graveyard, whatever the life total", () => {
    const { game } = table();
    const lich = spawn(game, "Lich");
    game.state.players[A].life = 20;
    destroy(game, lich);
    expect(game.state.players[A].hasLost).toBe(true);
  });
});
