/**
 * An "any number of target …" group that isn't its list's last slot (rule
 * 601.2c): two groups in one list — Filigree Vector's "a +1/+1 counter on
 * each of any number of target creatures and a charge counter on each of any
 * number of target artifacts" — or a group with a slot after it — Kamahl's
 * Will's lands with its second mode's creature. Such a group's members end
 * at an empty slot in the flat target list (`targetSpans`), which every check
 * of a choice reads through `concreteTargetSpecs`, and an effect reaches a
 * later group through `for-each-target`'s `group`.
 */
import { describe, expect, it } from "vitest";

import { targetCombos } from "../decisions/shared/target-combos.js";
import {
  concreteTargetSpecs,
  nextTargetSlot,
  slotOptions,
  targetSpans,
  targetsFillable,
} from "../target.js";
import type { TargetRef, TargetSpec } from "../target.js";
import { invalidTargetReason } from "../targeting.js";

import {
  A,
  B,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const TWO: readonly TargetSpec[] = [
  { kind: "any-number", of: "creature" },
  { kind: "any-number", of: "artifact" },
];
const obj = (id: string): TargetRef => ({ kind: "object", object: id as never });

describe("a group that isn't its list's last slot", () => {
  it("ends at an empty slot: each group's members, and the slots after it, where they sit", () => {
    const chosen = [obj("a"), obj("b"), null, obj("c")];
    expect(targetSpans(TWO, chosen)).toEqual([
      { start: 0, members: 2, closed: true },
      { start: 3, members: 1, closed: false },
    ]);
    expect(concreteTargetSpecs(TWO, chosen)).toEqual([
      "creature",
      { kind: "other", of: "creature", than: { slots: [0] } },
      { kind: "optional", of: "creature" },
      "artifact",
    ]);
    // A group before a plain slot (Kamahl's Will with both modes): the slot
    // after it, and an "other than" relation of its, follow it.
    const lands: readonly TargetSpec[] = [
      "player",
      { kind: "any-number", of: "land" },
      { kind: "other", of: "player", than: { slot: 0 } },
    ];
    expect(concreteTargetSpecs(lands, [ref(A), obj("l"), null, ref(B)])).toEqual([
      "player",
      "land",
      { kind: "optional", of: "land" },
      { kind: "other", of: "player", than: { slots: [0] } },
    ]);
    // A group that is the last slot reads as it always has.
    expect(concreteTargetSpecs(["player", { kind: "any-number", of: "creature" }], 3)).toEqual([
      "player",
      "creature",
      { kind: "other", of: "creature", than: { slots: [1] } },
    ]);
  });

  it("takes the next pick until it's ended, then the next slot", () => {
    expect(nextTargetSlot(TWO, [])).toEqual({ slot: 0, start: 0 });
    expect(nextTargetSlot(TWO, [obj("a")])).toEqual({ slot: 0, start: 0 });
    expect(nextTargetSlot(TWO, [obj("a"), null])).toEqual({ slot: 1, start: 2 });
    expect(nextTargetSlot(TWO, [obj("a"), null, obj("b")])).toEqual({ slot: 1, start: 2 });
    // The same object in both groups — two instances of "target" (rule
    // 115.3, Filigree Vector's ruling) — but once in one group.
    const options = [[obj("x"), obj("y")], [obj("x")]];
    expect(slotOptions(TWO, options, 1, [obj("x")])).toEqual([obj("y")]);
    expect(slotOptions(TWO, options, 2, [obj("x"), null])).toEqual([obj("x")]);
    expect(targetsFillable(TWO, [[], []])).toBe(true);
    expect(targetsFillable([{ kind: "any-number", of: "creature", min: 1 }, "player"], [[], [ref(A)]])).toBe(false);
  });

  it("is ended in a bot's combinations, each group its own", () => {
    const combos = targetCombos([[obj("x")], [obj("x")]], 20, TWO);
    expect(combos).toContainEqual([obj("x"), null, obj("x")]);
    expect(combos).toContainEqual([null]);
    expect(combos.every((c) => c.indexOf(null) >= 0)).toBe(true);
  });
});

describe("Filigree Vector", () => {
  it("puts a +1/+1 counter on each creature of the first group and a charge counter on each artifact of the second", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears", A);
    const thopter = spawn(game, "Ornithopter", A);
    const ring = spawn(game, "Sol Ring", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    // An artifact creature in both groups (the ruling).
    const seen = watchTargets(a, () => [bears, thopter, theirs, null, thopter, ring]);
    cast(game, toHand(game, "Filigree Vector"));
    expect(seen.asked).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
    expect(counters(game, thopter)).toBe(1);
    expect(counters(game, thopter, "charge")).toBe(1);
    expect(counters(game, ring, "charge")).toBe(1);
    expect(counters(game, ring)).toBe(0);
    expect(counters(game, bears, "charge")).toBe(0);
  });

  it("a creature gone before it resolves leaves the groups where they were (rule 608.2b)", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears", A);
    const thopter = spawn(game, "Ornithopter", A);
    const ring = spawn(game, "Sol Ring", A);
    pickTargets(a, bears, thopter, null, ring);
    cast(game, toHand(game, "Filigree Vector"), { settle: false });
    // Resolve the creature spell, its trigger now on the stack.
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id]?.kind === "ability"));
    destroy(game, bears);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    // The blanked first member isn't read as the end of the creatures.
    expect(counters(game, thopter)).toBe(1);
    expect(counters(game, thopter, "charge")).toBe(0);
    expect(counters(game, ring, "charge")).toBe(1);
  });

  it("refuses a choice whose first group isn't ended", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const why = invalidTargetReason(game.state, game.registry, TWO, [ref(bears)], A, "Filigree Vector");
    expect(why).toMatch(/isn't ended/);
    expect(invalidTargetReason(game.state, game.registry, TWO, [ref(bears), undefined], A, "Filigree Vector")).toBeNull();
  });
});

describe("Kamahl's Will", () => {
  it("with a commander, both modes: the lands animate, then every creature you control deals its power to the target", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 4);
    const commander = spawn(game, "Grizzly Bears", A);
    game.state.objects[commander].isCommander = true;
    const giant = spawn(game, "Hill Giant", B);
    const [one, two] = forests;
    cast(game, toHand(game, "Kamahl's Will"), { modes: [0, 1], targets: [ref(one), ref(two), null, ref(giant)] });
    expect(types(game, one)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, one)).toEqual({ power: 1, toughness: 1 });
    expect([...keywords(game, two)]).toEqual(expect.arrayContaining(["vigilance", "indestructible", "haste"]));
    expect(types(game, forests[2])).not.toContain("creature");
    // 2 from the commander and 1 from each animated land: 4 kills the 3/3.
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("one mode without a commander: the group is the last slot, with no end of its own", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 4);
    cast(game, toHand(game, "Kamahl's Will"), { modes: [0], targets: [ref(forests[0])] });
    expect(types(game, forests[0])).toContain("creature");
    expect(types(game, forests[1])).not.toContain("creature");
  });

  it("refuses both modes with the lands' group not ended", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 4);
    const commander = spawn(game, "Grizzly Bears", A);
    game.state.objects[commander].isCommander = true;
    const giant = spawn(game, "Hill Giant", B);
    const will = toHand(game, "Kamahl's Will");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: will, modes: [0, 1], targets: [ref(forests[0]), ref(giant)] }),
    ).not.toBeNull();
  });
});
