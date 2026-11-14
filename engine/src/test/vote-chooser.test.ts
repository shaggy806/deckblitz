/**
 * "You choose how each player votes this turn" (Illusion of Choice): every
 * vote's result (rule 701.38) is the chooser's to pick for the rest of the
 * turn, the last such effect to resolve working; whether to cast an
 * additional vote (701.38d) stays the voter's (the Ballot Broker ruling); an
 * "each player chooses" (rule 101.4) isn't a vote and stays each player's.
 * Written from the card's Oracle text and rulings.
 *
 * Alice's seat answers bob's votes through the controller it stands in for
 * bob with (`standInFn`), as the game's controller loop asks it to.
 */
import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { answeringPlayer, isVoteQuestion, voteChooser } from "../player-control.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, cast, hand, lands, nextTurn, pickModes, pickPermanents, spawn, table, toHand, zone } from "./harness.js";

/** Two of each basic land for alice: enough for any spell here. */
function mana(game: Game): void {
  for (const basic of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, basic, 2);
}

const priorityTo = (game: Game, player: PlayerId): void => {
  while (game.state.priority.holder !== player) {
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
  }
};

const never = (): never => {
  throw new Error("asked a question someone else answers");
};

const voters = (game: Game): readonly PlayerId[] => {
  const done = game.state.eventLog.find((e) => e.type === "votes-finished");
  return done?.type === "votes-finished" ? done.votes.map((v) => v.voter) : [];
};

describe("Illusion of Choice", () => {
  it("draws a card, and alice then picks bob's vote: time wins outright", () => {
    const { game, a, b } = table();
    mana(game);
    const before = hand(game).length;
    cast(game, toHand(game, "Illusion of Choice"));
    expect(hand(game).length).toBe(before + 1);
    expect(voteChooser(game.state, B)).toBe(A);
    expect(voteChooser(game.state, A)).toBeNull();
    pickModes(a, 0);
    b.chooseModesFn = never;
    const asBob = new ScriptedController(B);
    let forBob = 0;
    asBob.chooseModesFn = () => {
      forBob += 1;
      // Asked of bob, answered by alice.
      expect(isVoteQuestion(game.state)).toBe(true);
      expect(answeringPlayer(game.state, B)).toBe(A);
      return [0];
    };
    a.standInFn = () => asBob;
    cast(game, toHand(game, "Plea for Power"));
    expect(forBob).toBe(1);
    expect(game.state.eventLog.some((e) => e.type === "extra-turn-queued" && e.player === A)).toBe(true);
    // Bob's vote is still bob's: he cast it, alice chose it.
    expect(voters(game)).toEqual([A, B]);
  });

  it("a vote for a permanent: alice picks every voter's permanent", () => {
    const { game, a, b, c } = table({ players: 3 });
    mana(game);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", C);
    cast(game, toHand(game, "Illusion of Choice"));
    pickPermanents(a, bears);
    b.choosePermanentsFn = never;
    c.choosePermanentsFn = never;
    a.standInFn = (player) => {
      const stand = new ScriptedController(player);
      pickPermanents(stand, bears);
      return stand;
    };
    cast(game, toHand(game, "Council's Judgment"));
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("bob decides whether to take Ballot Broker's additional vote; alice picks its result", () => {
    const { game, a, b } = table();
    mana(game);
    spawn(game, "Ballot Broker", B);
    cast(game, toHand(game, "Illusion of Choice"));
    pickModes(a, 0);
    // Bob is asked only whether to take his additional vote — and takes it.
    let bobAsked = 0;
    b.chooseModesFn = (_view, _min, _max, texts) => {
      bobAsked += 1;
      expect(texts).toEqual(["Vote an additional time", "Don't vote an additional time"]);
      return [0];
    };
    const asBob = new ScriptedController(B);
    let forBob = 0;
    asBob.chooseModesFn = (_view, minModes) => {
      forBob += 1;
      // The additional vote, once taken, isn't optional.
      expect(minModes).toBe(1);
      return [0];
    };
    a.standInFn = () => asBob;
    cast(game, toHand(game, "Plea for Power"));
    expect(bobAsked).toBe(1);
    expect(forBob).toBe(2);
    expect(voters(game)).toEqual([A, B, B]);
  });

  it("bob may decline his additional vote", () => {
    const { game, a, b } = table();
    mana(game);
    spawn(game, "Ballot Broker", B);
    cast(game, toHand(game, "Illusion of Choice"));
    b.chooseModesFn = () => [1];
    pickModes(a, 1);
    const asBob = new ScriptedController(B);
    pickModes(asBob, 1);
    a.standInFn = () => asBob;
    const plea = toHand(game, "Plea for Power");
    const before = hand(game).length;
    cast(game, plea);
    expect(voters(game)).toEqual([A, B]);
    // Knowledge won: three cards.
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("alice's own Ballot Broker: hers is asked as without Illusion of Choice", () => {
    const { game, a, b } = table();
    mana(game);
    spawn(game, "Ballot Broker", A);
    cast(game, toHand(game, "Illusion of Choice"));
    let asked = 0;
    a.chooseModesFn = (_view, minModes) => {
      asked += 1;
      return minModes === 0 ? [] : [0];
    };
    b.chooseModesFn = never;
    const asBob = new ScriptedController(B);
    pickModes(asBob, 0);
    a.standInFn = () => asBob;
    cast(game, toHand(game, "Plea for Power"));
    // Her vote and her optional additional one (declined).
    expect(asked).toBe(2);
    expect(voters(game)).toEqual([A, B]);
  });

  it("an \"each player chooses\" isn't a vote: bob still chooses his own", () => {
    const { game, a, b } = table();
    mana(game);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Illusion of Choice"));
    pickPermanents(a, mine);
    pickPermanents(b, other);
    a.standInFn = never;
    cast(game, toHand(game, "Divine Reckoning"));
    expect(zone(game, other)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("the last one to resolve chooses; it ends with the turn", () => {
    const { game } = table();
    mana(game);
    cast(game, toHand(game, "Illusion of Choice"));
    lands(game, "Island", 1, B);
    priorityTo(game, B);
    cast(game, toHand(game, "Illusion of Choice", B), { player: B });
    expect(voteChooser(game.state, A)).toBe(B);
    expect(voteChooser(game.state, B)).toBeNull();
    nextTurn(game);
    expect(voteChooser(game.state, A)).toBeNull();
  });
});
