/**
 * Control "for as long as it [matches]" (rule 611.2b; `gain-control`'s
 * `whileIt`): a control effect lasting while the permanent whose control
 * changed still matches a filter — Shield Broker's "for as long as it has a
 * shield counter on it", Rootwater Matriarch's "for as long as that creature
 * is enchanted". It never starts if the permanent doesn't match as it would
 * begin, ends for good the first moment it stops, and ends as the permanent
 * phases out (rule 702.26f).
 */

import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import {
  A,
  B,
  activate,
  controller,
  counters,
  destroy,
  enter,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  watchTargets,
  zone,
} from "./harness.js";

describe("Shield Broker — control for as long as it has a shield counter on it", () => {
  it("puts a shield counter on an opponent's creature and takes it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Shield Broker", A);
    expect(counters(game, bears, "shield")).toBe(1);
    expect(controller(game, bears)).toBe(A);
  });

  it("hands it back as damage takes the last shield counter off — for good", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Shield Broker", A);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(bears)]);
    settle(game);
    expect(counters(game, bears, "shield")).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    // A new shield counter doesn't bring the old effect back.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "shield", amount: 1 }, [ref(bears)]);
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("hands it back as a destroy takes the counter instead", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Shield Broker", A);
    destroy(game, bears, B);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
  });

  it("keeps it while a second shield counter is left", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "shield", amount: 1 }, [ref(bears)]);
    pickTargets(a, bears);
    enter(game, "Shield Broker", A);
    expect(counters(game, bears, "shield")).toBe(2);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(bears)]);
    settle(game);
    expect(counters(game, bears, "shield")).toBe(1);
    expect(controller(game, bears)).toBe(A);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(bears)]);
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("outlasts Shield Broker itself", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const broker = enter(game, "Shield Broker", A);
    destroy(game, broker, B);
    expect(zone(game, broker)).toBe("graveyard");
    expect(controller(game, bears)).toBe(A);
  });

  it("targets only noncommander creatures it doesn't control", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const also = spawn(game, "Grizzly Bears", B);
    const commander = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    game.state.objects[commander].isCommander = true;
    invalidateComputedCache();
    const seen = watchTargets(a, () => [theirs]);
    enter(game, "Shield Broker", A);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([theirs, also].sort());
    expect(seen.offered[0]).not.toContain(commander);
    expect(seen.offered[0]).not.toContain(mine);
    expect(controller(game, theirs)).toBe(A);
  });
});

describe("Rootwater Matriarch — control for as long as that creature is enchanted", () => {
  function enchant(game: ReturnType<typeof table>["game"], creature: string, owner: typeof A) {
    const host = spawn(game, creature, owner);
    const aura = spawn(game, "Pacifism", owner);
    game.debugApplyEffect(owner, { kind: "attach", target: 0, attachment: 1 }, [ref(host), ref(aura)]);
    settle(game);
    expect(game.state.objects[aura].attachedTo).toBe(host);
    return { host, aura };
  }

  it("does nothing to an unenchanted creature (its ruling)", () => {
    const { game } = table();
    const matriarch = spawn(game, "Rootwater Matriarch", A);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, matriarch, 0, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(B);
    // Enchanting it afterwards starts nothing.
    const aura = spawn(game, "Pacifism", B);
    game.debugApplyEffect(B, { kind: "attach", target: 0, attachment: 1 }, [ref(bears), ref(aura)]);
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("takes an enchanted creature until the last Aura comes off, even once it has left", () => {
    const { game } = table();
    const matriarch = spawn(game, "Rootwater Matriarch", A);
    const { host, aura } = enchant(game, "Grizzly Bears", B);
    activate(game, matriarch, 0, { targets: [ref(host)] });
    expect(controller(game, host)).toBe(A);
    destroy(game, matriarch, B);
    expect(controller(game, host)).toBe(A);
    destroy(game, aura, B);
    expect(zone(game, aura)).toBe("graveyard");
    expect(controller(game, host)).toBe(B);
  });

  it("ends as the creature phases out (rule 702.26f)", () => {
    const { game } = table();
    const matriarch = spawn(game, "Rootwater Matriarch", A);
    const { host } = enchant(game, "Grizzly Bears", B);
    activate(game, matriarch, 0, { targets: [ref(host)] });
    expect(controller(game, host)).toBe(A);
    game.debugApplyEffect(A, { kind: "phase-out", target: 0 }, [ref(host)]);
    settle(game);
    expect(zone(game, host)).toBe("phased-out");
    expect(game.state.objects[host].controlEffects).toBeUndefined();
    expect(game.state.whileItControlIds).toBeUndefined();
  });
});
