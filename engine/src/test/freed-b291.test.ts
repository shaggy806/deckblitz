/**
 * Batch 291's lead cards: the two the scaffolder finished whole. Pixie Guide's
 * extra die (rule 706, `would-roll-dice`) and Johann's once-a-turn cast from the
 * top of the library, a `mayPlay` with `from: "library-top"`.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";
import { entriesThisTurn } from "../journal.js";
import { cast, spawn, subtypes, table, toHand } from "./harness.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const quiet = (game: Game) =>
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);

function apply(game: Game, effect: EffectSpec, player = A): void {
  const source = game.debugSpawn("Wastes", player, "battlefield");
  game.debugApplyEffect(player, effect, [], { source });
  quiet(game);
}

const lands = (game: Game, n: number) => {
  for (let i = 0; i < n; i += 1) game.debugSpawn("Volcanic Island", A, "battlefield");
};

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);

describe("Pixie Guide", () => {
  it("rolls one more die and ignores the lowest, for its controller only", () => {
    const { game } = table({ seed: 9 });
    spawn(game, "Pixie Guide");
    apply(game, { kind: "roll-dice", sides: 20, count: 1 });
    const [mine] = game.eventsOfType("dice-rolled");
    expect(mine.results).toHaveLength(1);
    expect(mine.ignored).toHaveLength(1);
    expect(mine.ignored[0]).toBeLessThanOrEqual(mine.results[0]);

    apply(game, { kind: "roll-dice", sides: 20, count: 1 }, B);
    const theirs = game.eventsOfType("dice-rolled")[1];
    expect(theirs.results).toHaveLength(1);
    expect(theirs.ignored ?? []).toHaveLength(0);
  });
});

describe("what the review of this batch found", () => {
  it("the journal keeps a permanent as the counter just made it, not as the cache last read it", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "Sludge Monster", B);
    const giant = spawn(game, "Hill Giant");
    game.legalActions(A); // reads every permanent's abilities: the memo is warm
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "slime", amount: 1 }, [
      { kind: "object", object: giant },
    ]);
    quiet(game);
    const put = entriesThisTurn(game.state, "counters-put").find((e) => e.object === giant);
    expect(put?.was?.lostAbilities).toBe(true);
  });

  it("Inscription of Insight, kicked, may be cast with no modes at all (rule 107.1c)", () => {
    const { game } = table({ seed: 1 });
    lands(game, 9);
    const card = toHand(game, "Inscription of Insight");
    const graveyardBefore = game.state.zones.perPlayer[A].graveyard.length;
    cast(game, card, { kicked: true, modes: [], targets: [] });
    expect(game.state.objects[card].zone).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(graveyardBefore + 1);
  });

  it("Arterial Alchemy makes Blood tokens Equipment, not a nontoken copy of one", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "Arterial Alchemy");
    apply(game, { kind: "create-token", token: "Blood Token", count: 1 });
    const token = game.battlefield.find((id) => game.state.objects[id].cardName === "Blood Token")!;
    expect(game.state.objects[token].isToken).toBe(true);
    expect(subtypes(game, token)).toContain("Equipment");
    const card = spawn(game, "Blood Token");
    expect(game.state.objects[card].isToken ?? false).toBe(false);
    expect(subtypes(game, card)).not.toContain("Equipment");
  });
});

describe("Johann, Apprentice Sorcerer", () => {
  it("casts one instant or sorcery a turn from the top, and no creature", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "Johann, Apprentice Sorcerer");
    lands(game, 6);

    const bears = game.debugSpawn("Grizzly Bears", A, "library");
    expect(offers(game, bears)).toHaveLength(0);

    const second = game.debugSpawn("Divination", A, "library");
    const first = game.debugSpawn("Divination", A, "library");
    const offer = offers(game, first);
    expect(offer).toHaveLength(1);
    expect(offer[0].kind === "cast-spell" && offer[0].via).toBe("library-top");

    game.dispatch({ type: "cast-spell", player: A, card: first, targets: [], via: "library-top" });
    quiet(game);
    expect(game.state.objects[first].zone).toBe("graveyard");

    // Divination drew the two cards above; put another on top: the permission is used.
    const third = game.debugSpawn("Divination", A, "library");
    expect(second).not.toBe(third);
    expect(offers(game, third)).toHaveLength(0);
  });

  it("gives nothing to the opponent of its controller", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "Johann, Apprentice Sorcerer", B);
    lands(game, 3);
    const top = game.debugSpawn("Divination", A, "library");
    expect(offers(game, top)).toHaveLength(0);
  });
});
