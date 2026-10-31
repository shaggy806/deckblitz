/**
 * Distributing counters. Among targets (rule 601.2d), the division is
 * announced as the spell is cast or the ability put on the stack, and its
 * total may be any amount read then: Undercity Upheaval's creature cards in
 * the graveyard "as you cast this spell", Quirion Beastcaller's counters it
 * died with, Broodlord's X. Among permanents chosen as it resolves (rule
 * 608.2d — the `counters-distributed` effect: Vastwood Hydra, Feast of the
 * Victorious Dead, Blessing of Frost), the effect's controller chooses which
 * get any as it resolves — not targets — then how many each, at least one
 * each and the whole total among them.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import type { TargetRef } from "../target.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const obj = (object: ObjectId): TargetRef => ({ kind: "object", object });
const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;

/** Alice's main phase with Forests, Swamps and Plains — no seat answers, so
 * every decision waits on `awaiting`. */
const setUp = () => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    decks: [
      { player: A, cards: Array<string>(40).fill("Island") },
      { player: B, cards: Array<string>(40).fill("Island") },
    ],
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  for (const land of ["Forest", "Forest", "Forest", "Forest", "Forest", "Forest", "Plains", "Swamp"]) {
    game.debugSpawn(land, A, "battlefield");
  }
  return game;
};
const ready = (game: Game, name: string, who: PlayerId = A): ObjectId => {
  const id = game.debugSpawn(name, who, "battlefield");
  game.state.objects[id].summoningSick = false;
  return id;
};
const plus = (game: Game, id: ObjectId): number => game.state.objects[id].counters["+1/+1"] ?? 0;
const castOffer = (game: Game, card: ObjectId) =>
  game.legalActions(A).find((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);
const waitFor = (game: Game, kind: string) => game.advanceUntil((s) => s.awaiting?.kind === kind || quiet(s));
const choosePermanents = (game: Game, permanents: readonly ObjectId[]) =>
  game.dispatch({ type: "choose-permanents", player: A, permanents });
const chooseNumber = (game: Game, number: number) => game.dispatch({ type: "choose-number", player: A, number });

describe("a divided total that is an amount, among targets (rule 601.2d)", () => {
  it("Undercity Upheaval: the creature cards in the graveyard as it's cast", () => {
    const game = setUp();
    const [bears, giant] = [ready(game, "Grizzly Bears"), ready(game, "Hill Giant")];
    for (let i = 0; i < 3; i += 1) game.debugSpawn("Grizzly Bears", A, "graveyard");
    game.debugSpawn("Forest", A, "graveyard");
    const card = game.debugSpawn("Undercity Upheaval", A, "hand");
    expect(castOffer(game, card)?.divide).toMatchObject({ total: 3, slot: 0 });
    game.dispatch({ type: "cast-spell", player: A, card, targets: [obj(bears), obj(giant)], division: [1, 2] });
    game.advanceUntil(quiet);
    expect([plus(game, bears), plus(game, giant)]).toEqual([1, 2]);
  });

  it("Quirion Beastcaller: the +1/+1 counters it died with", () => {
    const game = setUp();
    const caller = ready(game, "Quirion Beastcaller");
    const [bears, giant] = [ready(game, "Grizzly Bears"), ready(game, "Hill Giant")];
    game.state.objects[caller].counters["+1/+1"] = 3;
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [obj(caller)]);
    waitFor(game, "choose-targets");
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-targets" ? awaiting.divide : undefined).toMatchObject({ total: 3, slot: 0 });
    game.dispatch({ type: "choose-targets", player: A, targets: [obj(bears), obj(giant)], division: [2, 1] });
    game.advanceUntil(quiet);
    expect([plus(game, bears), plus(game, giant)]).toEqual([2, 1]);
  });

  it("Broodlord: its X among other creatures you control, never itself", () => {
    const game = setUp();
    const bears = ready(game, "Grizzly Bears");
    const card = game.debugSpawn("Broodlord", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [], xValue: 2 });
    waitFor(game, "choose-targets");
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-targets" ? awaiting.divide : undefined).toMatchObject({ total: 2, slot: 0 });
    expect(() => game.dispatch({ type: "choose-targets", player: A, targets: [obj(card)], division: [2] })).toThrow();
    game.dispatch({ type: "choose-targets", player: A, targets: [obj(bears)], division: [2] });
    game.advanceUntil(quiet);
    expect(plus(game, bears)).toBe(2);
    // Ravenous: it entered with X counters of its own.
    expect(plus(game, card)).toBe(2);
  });
});

describe("counters distributed among permanents chosen as it resolves (rule 608.2d)", () => {
  /** Vastwood Hydra with `n` counters, dying, its may answered yes. */
  const hydraDies = (n: number) => {
    const game = setUp();
    const hydra = ready(game, "Vastwood Hydra");
    game.state.objects[hydra].counters["+1/+1"] = n;
    const mine = [ready(game, "Grizzly Bears"), ready(game, "Hill Giant"), ready(game, "Grizzly Bears")];
    const theirs = ready(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [obj(hydra)]);
    waitFor(game, "choose-modes");
    if (game.state.awaiting?.kind === "choose-modes") game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    waitFor(game, "choose-permanents");
    return { game, mine, theirs };
  };

  it("Vastwood Hydra: its counters as it died, chosen among your creatures only, then a share for each but the last", () => {
    const { game, mine, theirs } = hydraDies(5);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-permanents");
    if (awaiting?.kind !== "choose-permanents") return;
    expect([...awaiting.eligible].sort()).toEqual([...mine].sort());
    expect(awaiting.eligible).not.toContain(theirs);
    expect(awaiting.max).toBe(3);
    choosePermanents(game, [mine[0], mine[1], mine[2]]);
    // First share: at least 1, leaving one each for the other two.
    const first = game.state.awaiting;
    expect(first?.kind === "choose-number" ? [first.min, first.max] : undefined).toEqual([1, 3]);
    chooseNumber(game, 3);
    // Second: 2 left for two creatures — no choice, 1 each.
    game.advanceUntil(quiet);
    expect(mine.map((id) => plus(game, id))).toEqual([3, 1, 1]);
  });

  it("Vastwood Hydra: two chosen, the second takes what's left; and none chosen puts none", () => {
    const { game, mine } = hydraDies(4);
    choosePermanents(game, [mine[1], mine[0]]);
    const first = game.state.awaiting;
    expect(first?.kind === "choose-number" ? [first.min, first.max] : undefined).toEqual([1, 3]);
    chooseNumber(game, 1);
    game.advanceUntil(quiet);
    expect([plus(game, mine[0]), plus(game, mine[1])]).toEqual([3, 1]);

    const other = hydraDies(4);
    choosePermanents(other.game, []);
    other.game.advanceUntil(quiet);
    expect(other.mine.map((id) => plus(other.game, id))).toEqual([0, 0, 0]);
  });

  it("a token stack's tokens are each a permanent to choose: two picked of three get their own shares", () => {
    const game = setUp();
    const hydra = ready(game, "Vastwood Hydra");
    game.state.objects[hydra].counters["+1/+1"] = 3;
    const soldiers = ready(game, "Soldier Token");
    game.state.objects[soldiers].isToken = true;
    game.state.objects[soldiers].stackCount = 3;
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [obj(hydra)]);
    waitFor(game, "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0] });
    waitFor(game, "choose-permanents");
    choosePermanents(game, [soldiers, soldiers]);
    chooseNumber(game, 2);
    game.advanceUntil(quiet);
    const tokens = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Soldier Token");
    const counts = tokens.flatMap((id) => Array<number>(game.state.objects[id].stackCount ?? 1).fill(plus(game, id))).sort();
    expect(counts).toEqual([0, 1, 2]);
  });

  it("among the permanents a target player controls (`controlledByTarget` — Invoke Justice's shape)", () => {
    const game = setUp();
    ready(game, "Grizzly Bears");
    const theirs = [ready(game, "Grizzly Bears", B), ready(game, "Hill Giant", B)];
    game.debugApplyEffect(
      A,
      {
        kind: "counters-distributed",
        counter: "+1/+1",
        total: 4,
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        among: "creatures target player controls",
      },
      [{ kind: "player", player: B }],
    );
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-permanents" ? [...awaiting.eligible].sort() : undefined).toEqual([...theirs].sort());
    choosePermanents(game, [theirs[1]]);
    game.advanceUntil(quiet);
    expect(plus(game, theirs[1])).toBe(4);
  });

  it("can't choose more permanents than there are counters", () => {
    const { game, mine } = hydraDies(2);
    expect(() => choosePermanents(game, mine)).toThrow();
    choosePermanents(game, [mine[2]]);
    game.advanceUntil(quiet);
    expect(plus(game, mine[2])).toBe(2);
  });

  it("Feast of the Victorious Dead: that much life and that many counters, at your end step after creatures died", () => {
    const game = setUp();
    ready(game, "Feast of the Victorious Dead");
    const bears = ready(game, "Grizzly Bears");
    const giant = ready(game, "Hill Giant");
    const victims = [ready(game, "Grizzly Bears", B), ready(game, "Grizzly Bears", B)];
    for (const v of victims) game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [obj(v)]);
    game.advanceUntil(quiet);
    const life = game.state.players[A].life;
    game.advanceUntil((s) => s.awaiting?.kind === "choose-permanents");
    expect(game.state.turn.step).toBe("end");
    choosePermanents(game, [giant, bears]);
    // Two counters for two creatures: one each, nothing to ask.
    expect(game.state.awaiting?.kind).not.toBe("choose-number");
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);
    expect(game.state.players[A].life).toBe(life + 2);
    expect([plus(game, giant), plus(game, bears)]).toEqual([1, 1]);
  });

  it("Blessing of Frost: no snow mana spent distributes nothing, but still draws for the big creatures", () => {
    const game = setUp();
    const giant = ready(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1;
    const hand = game.state.zones.perPlayer[A].hand.length;
    const card = game.debugSpawn("Blessing of Frost", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    game.advanceUntil(quiet);
    expect(plus(game, giant)).toBe(1);
    // The Giant is 4/4: one card drawn.
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand + 1);
  });

  it("Blessing of Frost: the {S} spent is distributed first, then the draw counts the creatures it grew", () => {
    const game = setUp();
    for (let i = 0; i < 4; i += 1) game.debugSpawn("Snow-Covered Forest", A, "battlefield");
    // Only snow lands left untapped.
    for (const id of game.state.zones.shared.battlefield) {
      const name = game.state.objects[id].cardName;
      if (name === "Forest" || name === "Plains" || name === "Swamp") game.state.objects[id].tapped = true;
    }
    const bears = ready(game, "Grizzly Bears");
    const hand = game.state.zones.perPlayer[A].hand.length;
    const card = game.debugSpawn("Blessing of Frost", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
    waitFor(game, "choose-permanents");
    choosePermanents(game, [bears]);
    game.advanceUntil(quiet);
    expect(plus(game, bears)).toBe(4);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand + 1);
  });
});
