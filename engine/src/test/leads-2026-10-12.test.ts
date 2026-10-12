/**
 * The open leads from the set walk's batches (docs/card-blockers.md, "Open
 * leads"), rechecked and fixed:
 *
 * - Crawling Sensation's "for the first time each turn" was `oncePerTurn`,
 *   which fires again later in a turn whose first land card reached the
 *   graveyard before the enchantment was there — now `firstTimeEachTurn`,
 *   read off the turn's `descended` history.
 * - Vivi's Persistence was recorded as waiting on a graveyard trigger about
 *   your commander, which `fromGraveyard` already is (Endless Ranks of HYDRA).
 * - Fabricate offered its counters with the creature gone, for nothing; the
 *   ruling is that you make the Servos then (rule 702.123a).
 * - Profane Tutor (no mana cost, only ever cast through suspend) was recorded
 *   as unverified: it can't be cast from hand, and suspended it is a card cast
 *   free as the last time counter comes off.
 * - The scaffolder's whole-snapshot run: "return target … card from a
 *   graveyard to its owner's hand" left out `from: "graveyard"` and returned
 *   nothing (Pulse of Murasa) — the parser now writes it.
 * - Found by fuzzing the run's cards: a player whose commander died in the
 *   same state-based check that saw them lose was still asked the 903.9
 *   question, and the game stalled on a departed player (rule 800.4a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import { A, B, C, attack, cast, enter, lands, life, ref, toStep, nextTurn, pickModes, spawn, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";

/** Alice discards `name` (put into her graveyard from her hand). */
const discard = (game: Game, seat: ReturnType<typeof table>["a"], name: string): void => {
  const card = toHand(game, name);
  seat.chooseDiscardsFn = () => [card];
  game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
  game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
};

describe("Crawling Sensation", () => {
  it("the first land card into your graveyard each turn makes an Insect; the second doesn't; the next turn's does", () => {
    const { game, a } = table();
    spawn(game, "Crawling Sensation");
    discard(game, a, "Forest");
    expect(tokensNamed(game, "Insect Token", A)).toBe(1);
    discard(game, a, "Forest");
    expect(tokensNamed(game, "Insect Token", A)).toBe(1);
    nextTurn(game);
    nextTurn(game);
    discard(game, a, "Forest");
    expect(tokensNamed(game, "Insect Token", A)).toBe(2);
  });

  it("not when a land card already reached your graveyard this turn before it was on the battlefield", () => {
    const { game, a } = table();
    discard(game, a, "Forest");
    spawn(game, "Crawling Sensation");
    discard(game, a, "Forest");
    expect(tokensNamed(game, "Insect Token", A)).toBe(0);
  });

  it("a nonland card first doesn't count", () => {
    const { game, a } = table();
    spawn(game, "Crawling Sensation");
    discard(game, a, "Grizzly Bears");
    discard(game, a, "Forest");
    expect(tokensNamed(game, "Insect Token", A)).toBe(1);
  });
});

describe("Vivi's Persistence", () => {
  it("makes Kuja's Wizard, and returns from the graveyard for {2} when your commander attacks", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const vivi = toHand(game, "Vivi's Persistence");
    cast(game, vivi);
    expect(tokensNamed(game, "Wizard Token (Kuja)", A)).toBe(1);
    expect(zone(game, vivi)).toBe("graveyard");
    lands(game, "Mountain", 2);
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    pickModes(a, 0);
    attack(game, a, [commander], B);
    expect(zone(game, vivi)).toBe("hand");
  });

  it("does nothing from anywhere but the graveyard, nor for a creature that isn't your commander", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const vivi = toGraveyard(game, "Vivi's Persistence");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [bears], B);
    expect(zone(game, vivi)).toBe("graveyard");
  });
});

describe("fabricate", () => {
  it("with the creature still there, the choice: counters", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    const angel = enter(game, "Angel of Invention");
    expect(game.state.objects[angel].counters["+1/+1"]).toBe(2);
    expect(tokensNamed(game, "Servo Token", A)).toBe(0);
  });

  it("gone before it resolves, Servos — even for a player who'd have picked counters", () => {
    const { game, a } = table();
    a.chooseModesFn = () => [0];
    const angel = enter(game, "Angel of Invention", A, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: angel }]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, angel)).toBe("graveyard");
    expect(tokensNamed(game, "Servo Token", A)).toBe(2);
  });
});

describe("Profane Tutor", () => {
  it("can't be cast from hand; suspended, it's cast free as the last counter comes off, and tutors", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const tutor = toHand(game, "Profane Tutor");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === tutor)).toBe(false);
    game.dispatch({ type: "suspend", player: A, card: tutor });
    expect(zone(game, tutor)).toBe("exile");
    expect(game.state.objects[tutor].counters.time).toBe(2);
    let searched = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      searched = eligible.length;
      return eligible.slice(0, 1);
    };
    a.chooseCastNowFn = (_view, offer) =>
      offer.casts.length === 0
        ? null
        : { type: "cast-spell", player: A, card: offer.cards[0], targets: [], via: offer.casts[0].via, free: true };
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, tutor)).toBe("graveyard");
    expect(searched).toBeGreaterThan(0);
  });
});

describe("Pulse of Murasa", () => {
  it("returns a creature card from any graveyard to its owner's hand, and you gain 6", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Pulse of Murasa"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("hand");
    expect(game.state.zones.perPlayer[B].hand).toContain(theirs);
    expect(life(game)).toBe(26);
  });
});

describe("a commander's question after its owner has left", () => {
  it("isn't asked of a player who lost in the same check their commander died", () => {
    const { game } = table({ players: 3 });
    const commander = spawn(game, "Hill Giant", B);
    game.state.objects[commander].isCommander = true;
    game.state.players[B].life = 1;
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "lose-life", amount: 1, who: "each-opponent" },
      ],
    }, [ref(commander)]);
    // The next state-based check sees both at once.
    toStep(game, "begin-combat");
    expect(game.state.players[B].hasLost).toBe(true);
    expect(game.state.awaiting?.kind).not.toBe("commander-replacement");
    // The game goes on for those still in it.
    expect(game.state.players[C].hasLost).toBe(false);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(game.state.turn.number).toBe(2);
  });
});
