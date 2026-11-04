// Sylvan Library: "At the beginning of your draw step, you may draw two
// additional cards. If you do, choose two cards in your hand drawn this turn.
// For each of those cards, pay 4 life or put the card on top of your library."
// What's new: `GameObject.drawnOnTurn` / `CardFilter.drawnThisTurn`, the `may`'s
// `aboutTarget` and the `look-and-choose`'s `prompt` and `givesUp`.

import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/eval-bot.js";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import { A, B, enter, hand, life, settle, table, toGraveyard, toHand, toLibrary, toStep } from "./harness.js";

const drawQuestion = (s: GameState): boolean =>
  s.turn.step === "draw" && s.awaiting?.kind === "choose-modes" && s.awaiting.player === A && s.awaiting.dredgeFor === undefined;

/** Alice's next draw step with the Library on the table and `top` on top of
 * her library, first card first: the normal draw is done and "Draw two
 * additional cards?" is being asked. */
function atDrawStep(top: readonly string[], opts: { life?: number; libraries?: number } = {}) {
  const { game } = table({ life: opts.life ?? 20 });
  for (let i = 0; i < (opts.libraries ?? 1); i += 1) enter(game, "Sylvan Library", A);
  for (const name of [...top].reverse()) toLibrary(game, name, A);
  const heldBefore = toHand(game, "Grizzly Bears", A);
  game.advanceUntil(drawQuestion);
  return { game, heldBefore };
}

const answer = (game: Game, yes: boolean): void => {
  game.dispatch({ type: "choose-modes", player: A, modes: yes ? [0] : [] });
};

const zoneChoice = (game: Game) => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-from-zone") throw new Error(`expected a zone choice, got ${awaiting?.kind}`);
  return awaiting;
};

const names = (game: Game, ids: readonly ObjectId[]): string[] => ids.map((id) => game.state.objects[id].cardName);

const top = (game: Game, n: number): readonly ObjectId[] => game.state.zones.perPlayer[A].library.slice(0, n);

describe("Sylvan Library", () => {
  it("draws two more on a yes, and offers only this turn's draws: the normal draw and those", () => {
    const { game, heldBefore } = atDrawStep(["Forest", "Island", "Swamp"]);
    expect(game.state.turn.step).toBe("draw");
    // The normal draw comes before the ability (the ruling).
    expect(names(game, hand(game))).toContain("Forest");
    answer(game, true);
    const asked = zoneChoice(game);
    expect(asked.destination).toBe("stay");
    expect([asked.min, asked.max]).toEqual([2, 2]);
    // Not last turn's draw, nor the opening hand, nor a card put there.
    expect(names(game, asked.eligible).sort()).toEqual(["Forest", "Island", "Swamp"]);
    expect(asked.eligible).not.toContain(heldBefore);
    expect(game.legalActions(A)).toMatchObject([{ kind: "choose-from-zone", givesUp: true }]);
  });

  it("on a no, nothing more happens", () => {
    const { game } = atDrawStep(["Forest", "Island", "Swamp"]);
    const held = hand(game).length;
    answer(game, false);
    settle(game);
    expect(hand(game)).toHaveLength(held);
    expect(life(game)).toBe(20);
    expect(names(game, top(game, 2))).toEqual(["Island", "Swamp"]);
  });

  it("asks of each chosen card, naming it: 4 life keeps it, otherwise it goes on top", () => {
    const { game } = atDrawStep(["Forest", "Island", "Swamp"]);
    answer(game, true);
    const [first, second] = zoneChoice(game).eligible;
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [first, second] });

    expect(game.state.awaiting).toMatchObject({ kind: "choose-modes", player: A, aboutCard: first });
    expect(game.legalActions(A)).toMatchObject([{ kind: "choose-modes", aboutCard: first }]);
    answer(game, true);
    expect(life(game)).toBe(16);
    expect(game.state.objects[first].zone).toBe("hand");

    expect(game.state.awaiting).toMatchObject({ kind: "choose-modes", player: A, aboutCard: second });
    answer(game, false);
    expect(life(game)).toBe(16);
    expect(game.state.objects[second].zone).toBe("library");
    expect(top(game, 1)).toEqual([second]);
  });

  it("zero put back is fine (the ruling): both kept for 8 life", () => {
    const { game } = atDrawStep(["Forest", "Island", "Swamp"]);
    answer(game, true);
    const [first, second] = zoneChoice(game).eligible;
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [first, second] });
    answer(game, true);
    answer(game, true);
    expect(life(game)).toBe(12);
    expect(names(game, [first, second]).every((_, i) => game.state.objects[[first, second][i]].zone === "hand")).toBe(true);
  });

  it("two put back: the second picked is on top, so the pick is the order", () => {
    const { game } = atDrawStep(["Forest", "Island", "Swamp"]);
    answer(game, true);
    const [first, second] = zoneChoice(game).eligible;
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [first, second] });
    answer(game, false);
    answer(game, false);
    expect(top(game, 2)).toEqual([second, first]);
    expect(game.state.objects[first].drawnOnTurn).toBeUndefined();
  });

  it("at 7 life one can be paid for, and then the other has no question: it goes on top (rule 119.4)", () => {
    const { game } = atDrawStep(["Forest", "Island", "Swamp"], { life: 7 });
    answer(game, true);
    const [first, second] = zoneChoice(game).eligible;
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [first, second] });
    answer(game, true);
    expect(life(game)).toBe(3);
    expect(game.state.objects[second].zone).toBe("library");
    expect(top(game, 1)).toEqual([second]);
  });

  it("a card drawn in the upkeep can be chosen (the ruling), and it goes back as any other", () => {
    const { game } = table({ life: 20 });
    enter(game, "Sylvan Library", A);
    toStep(game, "upkeep", A);
    for (const name of ["Forest", "Island", "Swamp", "Plains"]) toLibrary(game, name, A);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    game.advanceUntil(drawQuestion);
    answer(game, true);
    expect(zoneChoice(game).eligible).toHaveLength(4);
  });

  describe("with draws replaced (the ruling)", () => {
    /** Alice's draw step asking whether to dredge, `dredgers` of them in her
     * graveyard. */
    function dredging(dredgers: number) {
      const { game } = table({ life: 20 });
      enter(game, "Sylvan Library", A);
      for (let i = 0; i < dredgers; i += 1) toGraveyard(game, "Dakmor Salvage", A);
      const isDredge = (s: GameState): boolean => s.awaiting?.kind === "choose-modes" && s.awaiting.dredgeFor !== undefined;
      game.advanceUntil((s) => s.turn.number === 3 && isDredge(s));
      return { game, isDredge };
    }

    it("only one actually drawn: that one is chosen", () => {
      const { game, isDredge } = dredging(2);
      game.dispatch({ type: "choose-modes", player: A, modes: [1] });
      game.advanceUntil(drawQuestion);
      answer(game, true);
      expect(isDredge(game.state)).toBe(true);
      game.dispatch({ type: "choose-modes", player: A, modes: [1] });
      // The second draw has no dredger left, and is a draw.
      const asked = zoneChoice(game);
      expect([asked.min, asked.max, asked.eligible.length]).toEqual([1, 1, 1]);
    });

    it("none actually drawn: the rest of the ability has no effect", () => {
      const { game, isDredge } = dredging(3);
      game.dispatch({ type: "choose-modes", player: A, modes: [1] });
      game.advanceUntil(drawQuestion);
      const held = hand(game).length;
      answer(game, true);
      game.dispatch({ type: "choose-modes", player: A, modes: [1] });
      expect(isDredge(game.state)).toBe(true);
      game.dispatch({ type: "choose-modes", player: A, modes: [1] });
      expect(game.state.awaiting?.kind === "choose-from-zone").toBe(false);
      expect(hand(game)).toHaveLength(held + 2);
      expect(life(game)).toBe(20);
    });
  });

  it("two Libraries resolve one after the other (the ruling)", () => {
    const { game } = atDrawStep(["Forest", "Island", "Swamp", "Plains", "Mountain"], { libraries: 2 });
    answer(game, true);
    const [first, second] = zoneChoice(game).eligible;
    expect(zoneChoice(game).eligible).toHaveLength(3);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [first, second] });
    answer(game, false);
    answer(game, false);
    // The cards just put back aren't drawn this turn any more, and the second
    // asks with one left, then draws them again.
    game.advanceUntil(drawQuestion);
    answer(game, true);
    expect(zoneChoice(game).eligible).toHaveLength(3);
  });

  it("what the other players see names no card in alice's hand", () => {
    const { game } = atDrawStep(["Forest", "Island", "Swamp"]);
    answer(game, true);
    const [first, second] = zoneChoice(game).eligible;
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [first, second] });
    const seen = game.viewFor(B);
    expect(JSON.stringify(seen.awaiting)).not.toMatch(/Forest|Island|Swamp/);
    expect(seen.objects[first]).toBeUndefined();
    const hers = game.viewFor(A);
    expect(hers.objects[first]?.cardName).toBe(game.state.objects[first].cardName);
  });

  it("v1 draws, puts its worst at stake, and answers every question", () => {
    const { game } = atDrawStep(["Craw Wurm", "Forest", "Island"]);
    const view = () => ({ player: A, state: game.state, legalActions: () => game.legalActions(A) });
    const bot = new HeuristicBotController(A, game.registry);
    const draws = bot.act(view());
    expect(draws).toMatchObject({ type: "choose-modes", modes: [0] });
    game.dispatch(draws);
    const stake = bot.act(view());
    if (stake.type !== "choose-from-zone") throw new Error("expected the zone choice");
    expect(stake.chosen).toHaveLength(2);
    expect(names(game, stake.chosen)).toContain("Craw Wurm");
    game.dispatch(stake);
    game.dispatch(bot.act(view()));
    game.dispatch(bot.act(view()));
    expect(game.state.awaiting?.kind).not.toBe("choose-modes");
  });

  it("v2 answers every question too", () => {
    const { game } = atDrawStep(["Craw Wurm", "Forest", "Island"]);
    const view = () => ({ player: A, state: game.state, legalActions: () => game.legalActions(A) });
    const bot = new EvalBotController(A, game.registry);
    for (let i = 0; i < 4 && game.state.awaiting !== null; i += 1) game.dispatch(bot.act(view()));
    expect(game.state.awaiting).toBeNull();
    expect(game.state.turn.step).toBe("draw");
  });
});
