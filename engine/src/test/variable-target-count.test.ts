/**
 * Variable target counts on an "any number of target …" group (rule 601.2c):
 *
 * - a triggered or activated ability's `max` / `min` as any amount, read
 *   once as its targets are chosen — a trigger as it's put on the stack
 *   (603.3d), an activation before its costs are paid (601.2c, 602.2b) —
 *   and fixed from then on (Heroic Feast's "up to that many", Serra's
 *   Liturgy's verse counters, Lost in the Maze's "X target creatures");
 * - `maxTotalManaValue`, the members' total mana value capped (Patch Up),
 *   checked as they're chosen and again as it resolves;
 * - `differentManaValues` (Agadeem's Awakening).
 */

import { describe, expect, it } from "vitest";

import { stateTargetFacts } from "../targeting.js";
import { slotOptions, specsWithAmounts } from "../target.js";
import { fitModalXGroup } from "../target-count.js";
import type { TargetSpec } from "../target.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

describe("an amount as a group's bound", () => {
  it("reads it with `specsWithAmounts`, leaving numbers and unread amounts as they are", () => {
    const specs: TargetSpec[] = [
      "player",
      { kind: "any-number", of: "creature", max: { triggerValue: true }, min: 1, maxTotalManaValue: "x" },
    ];
    expect(specsWithAmounts(specs, (a) => (a === "x" ? undefined : 3))).toEqual([
      "player",
      { kind: "any-number", of: "creature", max: 3, min: 1, maxTotalManaValue: "x" },
    ]);
  });

  it("caps a trigger's group at its trigger value — Heroic Feast's 'up to that many'", () => {
    const { game, a } = table();
    spawn(game, "Heroic Feast");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      max = typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
      return bears.slice(0, 2).map(ref);
    };
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(max).toBe(2);
    expect(bears.map((id) => counters(game, id))).toEqual([1, 1, 0]);
  });

  it("refuses more targets than the trigger value allows", () => {
    const { game, a } = table();
    spawn(game, "Heroic Feast");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    pickTargets(a, ...bears);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    expect(() => settle(game)).toThrow(/at most 1/);
  });

  it("reads an activation's counters before the source is sacrificed — Serra's Liturgy", () => {
    const { game } = table();
    spawn(game, "Plains");
    const liturgy = spawn(game, "Serra's Liturgy");
    game.state.objects[liturgy].counters.verse = 2;
    const relics = [spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B)];
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === liturgy);
    const spec = offer?.kind === "activate-ability" ? offer.targetSpecs?.[0] : undefined;
    expect(typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined).toBe(2);
    expect(game.canDispatch({
      type: "activate-ability",
      player: A,
      source: liturgy,
      abilityIndex: 0,
      targets: relics.map(ref),
    })).toMatch(/at most 2/);
    activate(game, liturgy, 0, { targets: relics.slice(0, 2).map(ref) });
    expect(relics.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "battlefield"]);
    expect(zone(game, liturgy)).toBe("graveyard");
  });

  it("reads a permanent's own X for its enters ability — Lost in the Maze taps exactly X", () => {
    const { game, a } = table();
    for (let i = 0; i < 4; i += 1) spawn(game, "Island");
    const maze = toHand(game, "Lost in the Maze");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [mine, theirs]);
    let bounds: unknown;
    const inner = a.chooseTargetsFn;
    a.chooseTargetsFn = (view, name, specs, options) => {
      const spec = specs[0];
      bounds = typeof spec === "object" && spec.kind === "any-number" ? [spec.min, spec.max] : undefined;
      return inner!(view, name, specs, options);
    };
    cast(game, maze, { x: 2 });
    expect(seen.asked).toBe(1);
    expect(bounds).toEqual([2, 2]);
    expect(game.state.objects[mine].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, mine, "stun")).toBe(0);
    expect(counters(game, theirs, "stun")).toBe(1);
  });

  it("removes a trigger that needs more targets than there are (rule 603.3d)", () => {
    const { game } = table();
    for (let i = 0; i < 5; i += 1) spawn(game, "Island");
    const maze = toHand(game, "Lost in the Maze");
    spawn(game, "Grizzly Bears", B);
    cast(game, maze, { x: 3 });
    expect(zone(game, maze)).toBe("battlefield");
    expect(game.state.zones.shared.stack).toEqual([]);
  });
});

describe("a group's total mana value", () => {
  it("offers only what still fits, and returns what was chosen — Patch Up", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) spawn(game, "Plains");
    const patch = toHand(game, "Patch Up");
    const one = toGraveyard(game, "Savannah Lions");
    const two = toGraveyard(game, "Grizzly Bears");
    const three = toGraveyard(game, "Hill Giant");
    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === patch);
    expect(offer?.kind === "cast-spell" ? offer.targetOptions[0].length : 0).toBe(3);
    const specs = offer?.kind === "cast-spell" ? offer.targetSpecs : [];
    const options = offer?.kind === "cast-spell" ? offer.targetOptions : [];
    // With the 2-drop taken, only the 1-drop still fits under 3.
    expect(slotOptions(specs, options, 1, [ref(two)], stateTargetFacts(game.state, game.registry))).toEqual([
      ref(one),
    ]);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: patch, targets: [ref(two), ref(three)] }),
    ).toMatch(/mana value/);
    cast(game, patch, { targets: [ref(one), ref(two)] });
    expect([zone(game, one), zone(game, two), zone(game, three)]).toEqual(["battlefield", "battlefield", "graveyard"]);
  });
});

describe("different mana values", () => {
  it("refuses two targets that share one, and returns a set that doesn't — Agadeem's Awakening", () => {
    const { game } = table();
    for (let i = 0; i < 5; i += 1) spawn(game, "Swamp");
    const awakening = toHand(game, "Agadeem's Awakening");
    const bears = toGraveyard(game, "Grizzly Bears");
    const otherBears = toGraveyard(game, "Grizzly Bears");
    const lions = toGraveyard(game, "Savannah Lions");
    const giant = toGraveyard(game, "Hill Giant");
    expect(
      game.canDispatch({
        type: "cast-spell",
        player: A,
        card: awakening,
        xValue: 2,
        targets: [ref(bears), ref(otherBears)],
      }),
    ).toMatch(/mana value/);
    cast(game, awakening, { x: 2, targets: [ref(bears), ref(lions)] });
    expect([zone(game, bears), zone(game, lions)]).toEqual(["battlefield", "battlefield"]);
    expect(graveyard(game)).toContain(otherBears);
    expect(graveyard(game)).toContain(giant);
  });
});

describe("a group in a modal spell's mode", () => {
  it("is fixed at the X cast with — Heliod's Intervention destroys exactly X", () => {
    const { game } = table();
    for (let i = 0; i < 5; i += 1) spawn(game, "Plains");
    const card = toHand(game, "Heliod's Intervention");
    const rings = [spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B)];
    const at = (n: number) => ({ type: "cast-spell" as const, player: A, card, xValue: 2, modes: [0], targets: rings.slice(0, n).map(ref) });
    expect(game.canDispatch(at(3))).toMatch(/at most 2/);
    expect(game.canDispatch(at(1))).toMatch(/at least 2/);
    cast(game, card, { x: 2, modes: [0], targets: rings.slice(0, 2).map(ref) });
    expect(rings.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "battlefield"]);
  });

  it("fits a driver's picks to an X — `fitModalXGroup`", () => {
    const exact: TargetSpec[] = [{ kind: "any-number", of: "permanent", min: "x", max: "x" }];
    const upTo: TargetSpec[] = [{ kind: "any-number", of: "permanent", max: "x" }];
    const picks = ["o1", "o2", "o3"].map((object) => ({ kind: "object" as const, object: object as never }));
    expect(fitModalXGroup(exact, picks, { maxX: 2 })).toEqual({ targets: picks.slice(0, 2), xValue: 2 });
    expect(fitModalXGroup(exact, picks.slice(0, 1), { maxX: 4 }, 4)).toEqual({ targets: picks.slice(0, 1), xValue: 1 });
    expect(fitModalXGroup(upTo, picks.slice(0, 1), { maxX: 4 }, 0)).toEqual({ targets: picks.slice(0, 1), xValue: 1 });
    expect(fitModalXGroup(exact, [], { maxX: 4, minX: 1 })).toBeNull();
  });
});
