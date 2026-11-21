/**
 * "… becomes unprepared" (rule 722.3b): the `become-unprepared` effect —
 * Biblioplex Tomekeeper's two modes and Infinite Coursework's enters trigger.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, enter, lands, pickModes, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const copyOf = (game: Game, id: ObjectId): ObjectId | undefined => game.state.objects[id].prepared?.copy;
const prepared = (game: Game, id: ObjectId): boolean => game.state.objects[id].prepared !== undefined;

describe("become-unprepared", () => {
  it("Biblioplex Tomekeeper's second mode unprepares a prepared creature, and its copy goes (704.5e)", () => {
    const { game, a } = table();
    const singer = spawn(game, "Blazing Firesinger", B);
    const copy = copyOf(game, singer)!;
    expect(zone(game, copy)).toBe("exile");
    pickModes(a, 1);
    pickTargets(a, singer);
    enter(game, "Biblioplex Tomekeeper");
    settle(game);
    expect(prepared(game, singer)).toBe(false);
    expect(game.state.zones.shared.exile.includes(copy)).toBe(false);
  });

  it("its first mode prepares a creature with a prepare spell", () => {
    const { game, a } = table();
    const singer = spawn(game, "Blazing Firesinger");
    // Unprepare it first, through the effect itself.
    game.debugApplyEffect(A, { kind: "become-unprepared", target: 0 }, [ref(singer)]);
    settle(game);
    expect(prepared(game, singer)).toBe(false);
    pickModes(a, 0);
    pickTargets(a, singer);
    enter(game, "Biblioplex Tomekeeper");
    settle(game);
    expect(prepared(game, singer)).toBe(true);
    expect(game.state.objects[copyOf(game, singer)!].cardName).toBe("Seething Song");
  });

  it("does nothing to a creature that isn't prepared, and may choose no mode", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    pickTargets(a, bears);
    enter(game, "Biblioplex Tomekeeper");
    settle(game);
    expect(prepared(game, bears)).toBe(false);
    const singer = spawn(game, "Blazing Firesinger");
    pickModes(a);
    enter(game, "Biblioplex Tomekeeper");
    settle(game);
    expect(prepared(game, singer)).toBe(true);
  });

  it("Infinite Coursework taps the enchanted creature and unprepares it", () => {
    const { game } = table();
    const singer = spawn(game, "Blazing Firesinger", B);
    const copy = copyOf(game, singer)!;
    const aura = toHand(game, "Infinite Coursework");
    lands(game, "Island", 3);
    cast(game, aura, { targets: [ref(singer)] });
    settle(game);
    expect(game.state.objects[aura].attachedTo).toBe(singer);
    expect(game.state.objects[singer].tapped).toBe(true);
    expect(prepared(game, singer)).toBe(false);
    expect(game.state.zones.shared.exile.includes(copy)).toBe(false);
  });
});
