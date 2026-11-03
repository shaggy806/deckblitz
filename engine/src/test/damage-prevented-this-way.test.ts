/**
 * "Damage prevented this way": what a resolution's own shields prevented. Right
 * after each hit it's a shield's `then` with `"x"` (rule 615.5 — Temper, Bone
 * Mask, Brace for Impact, Refraction Trap); read later, by the delayed ability
 * the same resolution set up, it's the `damagePreventedThisWay` amount (Sacred
 * Boon, Scars of the Veteran), off the `damage-prevented` events that name the
 * shield's resolution.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  lands,
  life,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });

describe("damage prevented this way, read by a delayed ability", () => {
  it("Sacred Boon counts every hit its shield stopped, and the counters wait for the end step", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Sacred Boon"), { targets: [ref(bears)] });
    hit(game, goblin, ref(bears), 1);
    hit(game, goblin, ref(bears), 1);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    // The shield's last 1, and 1 gets through.
    hit(game, goblin, ref(bears), 2);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(counters(game, bears, "+0/+1")).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears, "+0/+1")).toBe(3);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 5 });
  });

  it("is read as the ability resolves: a hit in response still counts", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Sacred Boon"), { targets: [ref(bears)] });
    hit(game, goblin, ref(bears), 1);
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length > 0 && s.priority.holder === A);
    hit(game, goblin, ref(bears), 2);
    settle(game);
    expect(counters(game, bears, "+0/+1")).toBe(3);
  });

  it("a shield that prevented nothing puts no counter on", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Sacred Boon"), { targets: [ref(bears)] });
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears, "+0/+1")).toBe(0);
  });

  it("each Boon reads its own shield, and nobody else's prevention counts", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const elephant = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Sacred Boon"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Sacred Boon"), { targets: [ref(elephant)] });
    // Another effect's shield prevents damage too, for nobody's Boon.
    game.debugApplyEffect(A, { kind: "prevent-damage", target: 0, amount: "all" }, [ref(goblin)]);
    hit(game, bears, ref(goblin), 5);
    hit(game, goblin, ref(bears), 1);
    hit(game, goblin, ref(elephant), 2);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears, "+0/+1")).toBe(1);
    expect(counters(game, elephant, "+0/+1")).toBe(2);
  });

  it("cast during an end step, the ability waits for the next one and still reads the shield", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    toStep(game, "end");
    cast(game, toHand(game, "Sacred Boon"), { targets: [ref(bears)] });
    hit(game, goblin, ref(bears), 3);
    expect(counters(game, bears, "+0/+1")).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears, "+0/+1")).toBe(3);
  });

  it("Scars of the Veteran: a creature gets its counters, for a white card from hand", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm");
    const goblin = spawn(game, "Raging Goblin", B);
    const lions = toHand(game, "Savannah Lions");
    cast(game, toHand(game, "Scars of the Veteran"), { targets: [ref(wurm)], altCost: true });
    expect(zone(game, lions)).toBe("exile");
    hit(game, goblin, ref(wurm), 9);
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    toStep(game, "end");
    settle(game);
    expect(counters(game, wurm, "+0/+1")).toBe(7);
  });

  it("Scars of the Veteran on a player prevents the damage and sets nothing up", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, toHand(game, "Scars of the Veteran"), { targets: [ref(A)] });
    expect(game.state.delayedTriggers).toEqual([]);
    const before = life(game);
    hit(game, goblin, ref(A), 4);
    expect(life(game)).toBe(before);
  });
});

describe("damage prevented this way, right after the hit", () => {
  it("Bone Mask exiles what it prevented, and only the chosen source's", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const mask = spawn(game, "Bone Mask");
    const goblin = spawn(game, "Raging Goblin", B);
    const other = spawn(game, "Grizzly Bears", B);
    const library = [1, 2, 3, 4, 5].map(() => toLibrary(game, "Wastes"));
    pickPermanents(a, goblin);
    activate(game, mask);
    const before = life(game);
    hit(game, other, ref(A), 1);
    expect(life(game)).toBe(before - 1);
    hit(game, goblin, ref(A), 3);
    expect(life(game)).toBe(before - 1);
    expect(library.filter((id) => zone(game, id) === "exile").length).toBe(3);
    // Used up.
    hit(game, goblin, ref(A), 2);
    expect(life(game)).toBe(before - 3);
    expect(library.filter((id) => zone(game, id) === "exile").length).toBe(3);
  });

  it("Bone Mask with too few cards still prevents all of it and exiles what's there", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const mask = spawn(game, "Bone Mask");
    const goblin = spawn(game, "Raging Goblin", B);
    game.state.zones.perPlayer[A].library.length = 0;
    const only = toLibrary(game, "Wastes");
    pickPermanents(a, goblin);
    activate(game, mask);
    const before = life(game);
    hit(game, goblin, ref(A), 4);
    expect(life(game)).toBe(before);
    expect(zone(game, only)).toBe("exile");
  });

  it("Brace for Impact: a multicolored creature only, a counter a damage, every hit this turn", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    const brace = toHand(game, "Brace for Impact");
    expect(() => cast(game, brace, { targets: [ref(bears)] })).toThrow();
    const gold = spawn(game, "Qasali Pridemage");
    const goblin = spawn(game, "Raging Goblin", B);
    cast(game, brace, { targets: [ref(gold)] });
    hit(game, goblin, ref(gold), 2);
    expect(counters(game, gold)).toBe(2);
    hit(game, goblin, ref(gold), 1);
    expect(counters(game, gold)).toBe(3);
    expect(game.state.objects[gold].damageMarked).toBe(0);
  });

  it("Chant of Vitu-Ghazi stops creatures' damage for the turn, life each time, and nothing else's", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const goblin = spawn(game, "Raging Goblin", B);
    const mask = spawn(game, "Bone Mask", B);
    cast(game, toHand(game, "Chant of Vitu-Ghazi"));
    const before = life(game);
    hit(game, goblin, ref(A), 3);
    expect(life(game)).toBe(before + 3);
    hit(game, goblin, ref(B), 2);
    expect(life(game)).toBe(before + 5);
    // An artifact isn't a creature: dealt, and no life.
    hit(game, mask, ref(A), 1);
    expect(life(game)).toBe(before + 4);
  });

  it("Refraction Trap deals what it prevented to its own target, not to the source chosen", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const mine = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    const bystander = spawn(game, "Craw Wurm", B);
    pickPermanents(a, goblin);
    cast(game, toHand(game, "Refraction Trap"), { targets: [ref(bystander)] });
    expect(zone(game, goblin)).toBe("battlefield");
    // Over a permanent of yours, and you: one shield, 3 in all.
    hit(game, goblin, ref(mine), 2);
    expect(game.state.objects[mine].damageMarked).toBe(0);
    expect(game.state.objects[bystander].damageMarked).toBe(2);
    const before = life(game);
    hit(game, goblin, ref(A), 3);
    expect(life(game)).toBe(before - 2);
    expect(game.state.objects[bystander].damageMarked).toBe(3);
    expect(graveyard(game, B)).not.toContain(goblin);
  });

  it("Refraction Trap's {W} is offered once an opponent has cast a red instant or sorcery", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const goblin = spawn(game, "Raging Goblin", B);
    const trap = toHand(game, "Refraction Trap");
    expect(() => cast(game, trap, { targets: [ref(goblin)], altCost: true })).toThrow();
    lands(game, "Mountain", 1, B);
    toStep(game, "upkeep", B);
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(spawn(game, "Grizzly Bears"))] });
    expect(zone(game, shock)).toBe("graveyard");
    game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.length === 0);
    // The source needn't be that spell (the ruling).
    pickPermanents(a, goblin);
    cast(game, trap, { targets: [ref(goblin)], altCost: true });
    expect(zone(game, trap)).toBe("graveyard");
  });
});
