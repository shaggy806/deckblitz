/**
 * Preparation cards (rule 722): a permanent with a prepare spell that becomes
 * prepared (722.3a) — or enters prepared — makes a copy of that spell in exile
 * (722.3c), which its controller may cast while it stays on the battlefield
 * and prepared; casting it unprepares it (601.2i), and the copy ceases to
 * exist once the link ends (704.5e).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, graveyard, lands, named, pickFromZone, settle, spawn, table, toLibrary, toStep } from "./harness.js";

/** The prepare spell copies in exile. */
const copies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);
/** The cast offers for `copy`. */
const offers = (game: Game, copy: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === copy);
const enterPrepared = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = game.debugSpawn(name, player, "battlefield", { announceEntry: true, summoningSick: false });
  settle(game);
  return id;
};

describe("prepare", () => {
  it("enters prepared: a copy of its prepare spell waits in exile, castable by its controller", () => {
    const { game } = table();
    const year = enterPrepared(game, "Studious First-Year");
    expect(game.state.objects[year].prepared).toBeDefined();
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Rampant Growth");
    expect(game.state.objects[copy].isCopy).toBe(true);
    // It isn't swept away as a stray copy (the exception to 704.5e).
    settle(game);
    expect(game.state.objects[copy]?.zone).toBe("exile");
    lands(game, "Forest", 2);
    expect(offers(game, copy)).toHaveLength(1);
    expect(offers(game, copy, B)).toHaveLength(0);
    expect(game.viewFor(A).objects[year]?.preparedSpell).toBe(copy);
  });

  it("casting the copy unprepares it, and the copy resolves and ceases to exist", () => {
    const { game, a } = table();
    const year = enterPrepared(game, "Studious First-Year");
    const [copy] = copies(game);
    lands(game, "Forest", 2);
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    cast(game, copy, { via: "prepared", settle: false });
    // Unprepared as it becomes cast (601.2i).
    expect(game.state.objects[year].prepared).toBeUndefined();
    settle(game);
    expect(game.state.objects[forest].zone).toBe("battlefield");
    expect(game.state.objects[copy]).toBeUndefined();
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Rampant Growth")).toBe(false);
    expect(copies(game)).toHaveLength(0);
  });

  it("the copy keeps its type's timing: a sorcery isn't offered on an opponent's turn", () => {
    const { game } = table();
    enterPrepared(game, "Studious First-Year");
    const [copy] = copies(game);
    lands(game, "Forest", 2);
    toStep(game, "precombat-main", B);
    expect(offers(game, copy)).toHaveLength(0);
  });

  it("leaving the battlefield ends it: the copy ceases to exist, and back again it's a new object", () => {
    const { game } = table();
    const year = enterPrepared(game, "Studious First-Year");
    const [copy] = copies(game);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [{ kind: "object", object: year }]);
    // Not castable from the moment the link ends…
    expect(offers(game, copy)).toHaveLength(0);
    // …and gone with the next state-based check (704.5e).
    toStep(game, "begin-combat");
    expect(game.state.objects[copy]).toBeUndefined();
    expect(game.state.objects[year].prepared).toBeUndefined();
  });

  it("only the prepared permanent's current controller may cast the copy", () => {
    const { game } = table();
    const year = enterPrepared(game, "Studious First-Year");
    const [copy] = copies(game);
    lands(game, "Forest", 2, B);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [
      { kind: "object", object: year },
    ]);
    settle(game);
    expect(game.state.objects[year].prepared?.copy).toBe(copy);
    expect(offers(game, copy)).toHaveLength(0);
    toStep(game, "precombat-main", B);
    expect(offers(game, copy, B)).toHaveLength(1);
  });

  it("becomes prepared only with a prepare spell, and never twice", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const year = spawn(game, "Studious First-Year");
    const prepare = (id: ObjectId) =>
      game.debugApplyEffect(A, { kind: "become-prepared", target: 0 }, [{ kind: "object", object: id }]);
    prepare(bears);
    expect(game.state.objects[bears].prepared).toBeUndefined();
    prepare(year);
    prepare(year);
    settle(game);
    expect(copies(game)).toHaveLength(1);
  });

  it("losing its abilities doesn't unprepare it (the ruling)", () => {
    const { game } = table();
    const year = enterPrepared(game, "Studious First-Year");
    game.debugApplyEffect(B, { kind: "lose-abilities", target: 0, duration: "permanent" }, [
      { kind: "object", object: year },
    ]);
    settle(game);
    expect(game.state.objects[year].prepared).toBeDefined();
    expect(copies(game)).toHaveLength(1);
  });

  it("a prepare spell that is no card of its own (Enroot) is cast all the same", () => {
    const { game, a } = table();
    enterPrepared(game, "Carnivorous Cultivator");
    const [copy] = copies(game);
    expect(game.state.objects[copy].cardName).toBe("Enroot");
    lands(game, "Forest", 1);
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    cast(game, copy, { via: "prepared" });
    expect(game.state.objects[forest].zone).toBe("graveyard");
  });

  it("a token copy of a preparation creature enters prepared with a copy of its own", () => {
    const { game } = table();
    const year = enterPrepared(game, "Studious First-Year");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 2 }, [{ kind: "object", object: year }]);
    settle(game);
    const tokens = named(game, "Studious First-Year").filter((id) => game.state.objects[id].isToken);
    // Each prepared token is its own object with its own copy.
    expect(tokens).toHaveLength(2);
    expect(copies(game)).toHaveLength(3);
  });
});
