import { describe, expect, it } from "vitest";
import { EvalBotController } from "../bot/index.js";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import { A, B, C, hand, life, pickFromZone, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/**
 * The `guess` effect (rule 608.2d — a choice another player makes as the
 * effect resolves): a yes or no about one card of the controller's, asked as
 * a `choose-modes` that carries `guess`, then `ifRight` or `ifWrong`.
 * Gollum, Scheming Guide (the top card of the library, the kind chosen
 * first, revealed) and Master of Predicaments (a card chosen secretly from
 * the hand, never revealed).
 */

const viewFor = (game: Game) => ({ player: B, state: game.state, legalActions: () => game.legalActions(B) });

/** Gollum attacks bob; alice answers land (0) or nonland (1), bob yes (0)
 * or no (1). The game runs to the guess, then on. */
function gollumAttacks(kind: number, guess: number, top = "Wastes", players: 2 | 3 = 2) {
  const t = table({ players });
  const { game } = t;
  const gollum = spawn(game, "Gollum, Scheming Guide");
  toLibrary(game, top);
  const asked: string[][] = [];
  t.a.chooseModesFn = (_view, _min, _max, texts) => {
    asked.push([...texts]);
    return texts[0]?.startsWith("Choose ") === true && texts.some((x) => x === "Choose land") ? [kind] : [0];
  };
  t.b.chooseModesFn = (_view, _min, _max, texts) => {
    asked.push([...texts]);
    return [guess];
  };
  t.a.declareAttackersFn = () => [{ attacker: gollum, defender: B }];
  return { ...t, gollum, asked };
}

describe("guess — Gollum, Scheming Guide", () => {
  it("a right guess removes Gollum from combat, after the top card is revealed", () => {
    const t = gollumAttacks(0, 0);
    const { game } = t;
    const handBefore = hand(game).length;
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" && s.awaiting.player === B);
    expect(game.state.awaiting).toMatchObject({ guess: { owner: A, about: "library-top" } });
    const seq = game.state.eventLog.length;
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    // Land chosen, bob said yes, the top card is Wastes: right.
    expect(t.asked[0]).toEqual(["Choose land", "Choose nonland"]);
    expect(t.asked[1]).toEqual(["Guess the top card of its controller's library is a land", "Guess it isn't a land"]);
    expect(game.state.eventLog.slice(seq).some((e) => e.type === "cards-revealed")).toBe(true);
    expect(life(game, B)).toBe(20);
    expect(hand(game).length).toBe(handBefore);
  });

  it("a wrong guess draws a card and makes Gollum unblockable this turn", () => {
    const t = gollumAttacks(0, 1);
    const { game } = t;
    const blocker = spawn(game, "Grizzly Bears", B);
    t.b.declareBlockersFn = () => [{ blocker, attacker: t.gollum }];
    const handBefore = hand(game).length;
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(hand(game).length).toBe(handBefore + 1);
    expect(life(game, B)).toBe(18);
    expect(zone(game, blocker)).toBe("battlefield");
  });

  it("nonland chosen: 'no' about a land on top is right", () => {
    const t = gollumAttacks(1, 1);
    t.game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(t.asked[1]).toEqual(["Guess the top card of its controller's library is a nonland card", "Guess it isn't a nonland card"]);
    expect(life(t.game, B)).toBe(20);
  });

  it("nonland chosen, a nonland on top, 'yes' is right", () => {
    const t = gollumAttacks(1, 0, "Lightning Bolt");
    t.game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(life(t.game, B)).toBe(20);
  });

  it("with no library no guess is right: Gollum's controller draws from it (its ruling)", () => {
    const t = gollumAttacks(0, 0);
    const { game } = t;
    game.state.zones.perPlayer[A].library = [];
    game.advanceUntil((s) => s.players[A].hasLost || s.turn.step === "postcombat-main");
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("a bot guesses from what it could know: land, with a library of lands, whatever is on top", () => {
    for (const make of [
      (game: Game) => new HeuristicBotController(B, game.registry),
      (game: Game) => new EvalBotController(B, game.registry, { maxSimulations: 8 }),
    ]) {
      // Alice chooses land; the top card is a Lightning Bolt. Playing both
      // answers out would see it — and see Gollum's 2 damage either way.
      const t = gollumAttacks(0, 0, "Lightning Bolt");
      const { game } = t;
      game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" && s.awaiting.player === B);
      expect(make(game).act(viewFor(game))).toMatchObject({ modes: [0] });
    }
  });

  it("at three players, the opponent alice chooses guesses", () => {
    const t = gollumAttacks(0, 1, "Wastes", 3);
    const { game } = t;
    // Alice's choose-opponent: carol (the second option).
    t.a.chooseModesFn = (_view, _min, _max, texts) => (texts.length === 2 && texts.includes("Choose land") ? [0] : [1]);
    let guesser: string | undefined;
    t.c.chooseModesFn = () => {
      guesser = C;
      return [1];
    };
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(guesser).toBe(C);
    expect(life(game, B)).toBe(18);
  });
});

/** Master of Predicaments deals combat damage to bob, alice choosing `card`
 * from her hand and bob answering `guess` (0 greater than 4, 1 not). */
function masterHits(card: string, guess: number, castIt = true, deck?: string) {
  const t = table(deck === undefined ? {} : { deck });
  const { game } = t;
  const master = spawn(game, "Master of Predicaments");
  const chosen = toHand(game, card);
  const other = toHand(game, "Lightning Bolt");
  pickFromZone(t.a, chosen);
  t.b.chooseModesFn = () => [guess];
  t.a.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts.find((c) => c.card === chosen);
    return !castIt || way === undefined
      ? null
      : { type: "cast-spell", player: A, card: chosen, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  t.a.declareAttackersFn = () => [{ attacker: master, defender: B }];
  return { ...t, master, chosen, other };
}

describe("guess — Master of Predicaments", () => {
  it("guessed wrong: alice may cast the chosen card free", () => {
    const t = masterHits("Shivan Dragon", 1);
    t.game.advanceUntil((s) => s.turn.step === "postcombat-main");
    settle(t.game);
    expect(zone(t.game, t.chosen)).toBe("battlefield");
    expect(zone(t.game, t.other)).toBe("hand");
  });

  it("guessed right: nothing is cast, and the card isn't revealed", () => {
    const t = masterHits("Shivan Dragon", 0);
    const { game } = t;
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" && s.awaiting.player === B);
    expect(game.state.awaiting).toMatchObject({ guess: { owner: A, about: "chosen-this-way" } });
    const seq = game.state.eventLog.length;
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, t.chosen)).toBe("hand");
    expect(game.state.eventLog.slice(seq).some((e) => e.type === "cards-revealed")).toBe(false);
  });

  it("a card of mana value 4 or less: 'greater than 4' is the wrong guess", () => {
    const t = masterHits("Grizzly Bears", 0);
    t.game.advanceUntil((s) => s.turn.step === "postcombat-main");
    settle(t.game);
    expect(zone(t.game, t.chosen)).toBe("battlefield");
  });

  it("alice may decline the free cast", () => {
    const t = masterHits("Shivan Dragon", 1, false);
    t.game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(t.game, t.chosen)).toBe("hand");
  });

  it("The Seventh Doctor: against the artifacts alice controls, and a Clue when nothing is cast", () => {
    const run = (artifacts: number, guess: number, castIt: boolean) => {
      const t = table();
      const { game } = t;
      const doctor = spawn(game, "The Seventh Doctor");
      for (let i = 0; i < artifacts; i += 1) spawn(game, "Ornithopter");
      const chosen = toHand(game, "Grizzly Bears");
      pickFromZone(t.a, chosen);
      t.b.chooseModesFn = () => [guess];
      t.a.chooseCastNowFn = (_view, offer) => {
        const way = offer.casts.find((c) => c.card === chosen);
        return !castIt || way === undefined
          ? null
          : { type: "cast-spell", player: A, card: chosen, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
      };
      t.a.declareAttackersFn = () => [{ attacker: doctor, defender: B }];
      game.advanceUntil((s) => s.turn.step === "postcombat-main");
      settle(game);
      return { game, chosen, clues: game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Clue Token").length };
    };
    // Mana value 2 against one artifact: "greater" is right — a Clue.
    let r = run(1, 0, true);
    expect([zone(r.game, r.chosen), r.clues]).toEqual(["hand", 1]);
    // Against two artifacts, "greater" is wrong: cast, no Clue.
    r = run(2, 0, true);
    expect([zone(r.game, r.chosen), r.clues]).toEqual(["battlefield", 0]);
    // Wrong but declined: a Clue.
    r = run(2, 0, false);
    expect([zone(r.game, r.chosen), r.clues]).toEqual(["hand", 1]);
  });

  it("a bot guesses from what it could know, not the card", () => {
    // Alice's hand and library are mostly lands and cheap spells: a bot says
    // "4 or less" even about the Shivan Dragon.
    for (const make of [
      (game: Game) => new HeuristicBotController(B, game.registry),
      (game: Game) => new EvalBotController(B, game.registry, { maxSimulations: 8 }),
    ]) {
      const t = masterHits("Shivan Dragon", 0);
      const { game } = t;
      game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" && s.awaiting.player === B);
      expect(make(game).act(viewFor(game))).toMatchObject({ modes: [1] });
      // …and "greater than 4" when most of what it can't see is.
      const u = masterHits("Lightning Bolt", 0, true, "Shivan Dragon");
      u.game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" && s.awaiting.player === B);
      expect(make(u.game).act(viewFor(u.game))).toMatchObject({ modes: [0] });
    }
  });
});
