/**
 * Prevention over the permanents a filter matches as the spell resolves — a
 * fixed set (the ruling; rule 611.2c for the grants beside it), not a rule
 * asked of whatever matches as damage would be dealt (615.1): a
 * `for-each-permanent` putting an "all" prevention shield (`prevent-damage`)
 * on each. Mutational Advantage: "Permanents you control with counters on
 * them gain hexproof and indestructible until end of turn. Prevent all damage
 * that would be dealt to those permanents this turn. Proliferate."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, keywords, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

const addCounter = (game: Game, id: ObjectId, counter = "+1/+1"): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount: 1 }, [ref(id)]);
const removeCounter = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);
const damage = (game: Game, id: ObjectId, amount: number): void =>
  game.debugApplyEffect(B, { kind: "damage", target: 0, amount }, [ref(id)]);
const marked = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Mutational Advantage", () => {
  it("protects the permanents you control with counters as it resolves, then proliferates", () => {
    const t = table();
    const { game } = t;
    const countered = spawn(game, "Grizzly Bears");
    addCounter(game, countered);
    const plain = spawn(game, "Gray Ogre");
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounter(game, theirs);
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    t.a.chooseProliferateFn = (_view, eligible) => eligible;
    cast(game, toHand(game, "Mutational Advantage"));

    expect(keywords(game, countered).has("hexproof")).toBe(true);
    expect(keywords(game, countered).has("indestructible")).toBe(true);
    expect(keywords(game, plain).has("hexproof")).toBe(false);
    expect(keywords(game, theirs).has("hexproof")).toBe(false);
    // Proliferated: both with counters got another.
    expect(game.state.objects[countered].counters["+1/+1"]).toBe(2);
    expect(game.state.objects[theirs].counters["+1/+1"]).toBe(2);

    damage(game, countered, 5);
    expect(marked(game, countered)).toBe(0);
    damage(game, plain, 1);
    expect(marked(game, plain)).toBe(1);
    damage(game, theirs, 1);
    expect(marked(game, theirs)).toBe(1);
  });

  it("covers a noncreature permanent with counters too", () => {
    const t = table();
    const { game } = t;
    const walker = spawn(game, "Chandra, Torch of Defiance");
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    const loyalty = game.state.objects[walker].counters.loyalty;
    t.a.chooseProliferateFn = () => [];
    cast(game, toHand(game, "Mutational Advantage"));
    expect(keywords(game, walker).has("hexproof")).toBe(true);
    damage(game, walker, 3);
    expect(game.state.objects[walker].counters.loyalty).toBe(loyalty);
  });

  it("the set is fixed as it resolves: a later counter adds nothing, a lost one takes nothing away", () => {
    const t = table();
    const { game } = t;
    const keeps = spawn(game, "Grizzly Bears");
    addCounter(game, keeps);
    const later = spawn(game, "Gray Ogre");
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    // Proliferate nothing, so the counters stay as they were.
    t.a.chooseProliferateFn = () => [];
    cast(game, toHand(game, "Mutational Advantage"));

    removeCounter(game, keeps);
    expect(game.state.objects[keeps].counters["+1/+1"] ?? 0).toBe(0);
    damage(game, keeps, 3);
    expect(marked(game, keeps)).toBe(0);

    addCounter(game, later);
    damage(game, later, 1);
    expect(marked(game, later)).toBe(1);
  });

  it("the prevention ends with the turn", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    addCounter(game, bear);
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    t.a.chooseProliferateFn = () => [];
    cast(game, toHand(game, "Mutational Advantage"));
    nextTurn(game);
    damage(game, bear, 1);
    expect(marked(game, bear)).toBe(1);
  });
});
