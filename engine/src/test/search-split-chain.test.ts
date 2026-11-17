import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import { A, B, C, cast, lands, pickModes, quiet, table, toHand, toLibrary, zone } from "./harness.js";

/**
 * A `search-library` whose `instead` is a list: several splits of the finds,
 * one after another, each over what the ones before it left — Verdant
 * Mastery's "Put one of them onto the battlefield tapped under an opponent's
 * control if the {3}{G} cost was paid. Put two of them onto the battlefield
 * tapped under your control and the rest into your hand" — and a split's
 * `under: "an-opponent"`, the opponent the caster's choice as it resolves
 * (the card's ruling).
 */

/** The seat answers its choose-from-zone decisions in turn, recording each
 * one's eligible cards and prompt. */
function answerInTurn(
  seat: ScriptedController,
  ...answers: readonly (readonly ObjectId[])[]
): { eligible: readonly ObjectId[]; prompt: string | undefined }[] {
  const offered: { eligible: readonly ObjectId[]; prompt: string | undefined }[] = [];
  let next = 0;
  seat.chooseFromZoneFn = (view, eligible) => {
    const awaiting = view.state.awaiting;
    offered.push({ eligible, prompt: awaiting?.kind === "choose-from-zone" ? awaiting.prompt : undefined });
    const answer = answers[next] ?? [];
    next += 1;
    return answer;
  };
  return offered;
}

function basics(game: Parameters<typeof toLibrary>[0]): { forest: ObjectId; island: ObjectId; swamp: ObjectId; plains: ObjectId } {
  return {
    forest: toLibrary(game, "Forest"),
    island: toLibrary(game, "Island"),
    swamp: toLibrary(game, "Swamp"),
    plains: toLibrary(game, "Plains"),
  };
}

describe("Verdant Mastery", () => {
  it("cast for its mana cost: two finds enter tapped under your control, the rest go to your hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const { forest, island, swamp, plains } = basics(game);
    const offered = answerInTurn(a, [forest, island, swamp, plains], [island, swamp]);
    const before = game.events.length;
    cast(game, toHand(game, "Verdant Mastery"), { settle: false });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(2);
    expect([...offered[1].eligible].sort()).toEqual([forest, island, swamp, plains].sort());
    for (const id of [island, swamp]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].controller).toBe(A);
      expect(game.state.objects[id].tapped).toBe(true);
    }
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, plains)).toBe("hand");
    const events = game.events.slice(before);
    expect(events.filter((e) => e.type === "library-shuffled" && e.player === A)).toHaveLength(1);
  });

  it("with {3}{G} paid: one find enters tapped under the opponent's control, two under yours, the rest to hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const { forest, island, swamp, plains } = basics(game);
    const offered = answerInTurn(a, [forest, island, swamp, plains], [plains], [island, swamp]);
    const before = game.events.length;
    cast(game, toHand(game, "Verdant Mastery"), { altCost: true, settle: false });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(3);
    // One opponent: nobody is asked which.
    expect(offered[1].prompt).toBe("Choose one to put onto the battlefield tapped under Bob's control");
    // The second split is over what the first left.
    expect([...offered[2].eligible].sort()).toEqual([forest, island, swamp].sort());
    expect(zone(game, plains)).toBe("battlefield");
    expect(game.state.objects[plains].controller).toBe(B);
    expect(game.state.objects[plains].owner).toBe(A);
    expect(game.state.objects[plains].tapped).toBe(true);
    for (const id of [island, swamp]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].controller).toBe(A);
      expect(game.state.objects[id].tapped).toBe(true);
    }
    expect(zone(game, forest)).toBe("hand");
    const events = game.events.slice(before);
    expect(events.filter((e) => e.type === "cards-revealed")).toHaveLength(1);
    // Shuffled once, after the last split.
    expect(events.filter((e) => e.type === "library-shuffled" && e.player === A)).toHaveLength(1);
  });

  it("with three players, the caster chooses which opponent gets the land, as it resolves", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Forest", 4);
    const { forest, island, swamp, plains } = basics(game);
    const offered = answerInTurn(a, [forest, island, swamp, plains], [forest], [island, swamp]);
    // The second mode: Carol.
    pickModes(a, 1);
    cast(game, toHand(game, "Verdant Mastery"), { altCost: true, settle: false });
    game.advanceUntil(quiet);
    expect(offered[1].prompt).toBe("Choose one to put onto the battlefield tapped under Carol's control");
    expect(game.state.objects[forest].controller).toBe(C);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, plains)).toBe("hand");
    expect(game.state.objects[island].controller).toBe(A);
  });

  it("with {3}{G} paid and one find, that find is the opponent's, unasked (rule 609.3)", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const { island } = basics(game);
    const offered = answerInTurn(a, [island]);
    cast(game, toHand(game, "Verdant Mastery"), { altCost: true, settle: false });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(1);
    expect(zone(game, island)).toBe("battlefield");
    expect(game.state.objects[island].controller).toBe(B);
  });

  it("with {3}{G} paid and two finds, one goes to the opponent and the other enters under your control", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const { island, swamp } = basics(game);
    const offered = answerInTurn(a, [island, swamp], [swamp]);
    cast(game, toHand(game, "Verdant Mastery"), { altCost: true, settle: false });
    game.advanceUntil(quiet);
    expect(offered).toHaveLength(2);
    expect(game.state.objects[swamp].controller).toBe(B);
    expect(game.state.objects[island].controller).toBe(A);
    expect(zone(game, island)).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(true);
  });
});
