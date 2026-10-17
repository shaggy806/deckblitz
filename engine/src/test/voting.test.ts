/**
 * Voting (rule 701.38): the `vote` effect — named options, permanents and
 * players; open ("starting with you") and secret council; additional votes
 * (701.38d); "gets more votes" and ties; `for-each-vote` / `for-each-voted`;
 * and "whenever players finish voting". Each test written from the card's
 * Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import type { GameEvent } from "../events.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

/** Two of each basic land for alice: enough for any spell here. */
function mana(game: Parameters<typeof lands>[0]): void {
  for (const basic of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, basic, 2);
}

const finished = (log: readonly GameEvent[]): Extract<GameEvent, { type: "votes-finished" }>[] =>
  log.filter((e): e is Extract<GameEvent, { type: "votes-finished" }> => e.type === "votes-finished");

describe("a vote for named options", () => {
  it("Plea for Power: time wins outright for an extra turn", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 0);
    const before = hand(game).length;
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(game.state.eventLog.some((e) => e.type === "extra-turn-queued" && e.player === A)).toBe(true);
    expect(hand(game).length).toBe(before);
  });

  it("Plea for Power: a tie draws three, not the extra turn", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const plea = toHand(game, "Plea for Power");
    const before = hand(game).length;
    mana(game);
    cast(game, plea);
    expect(game.state.eventLog.some((e) => e.type === "extra-turn-queued")).toBe(false);
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("an open vote is seen as it's cast, starting with the caster", () => {
    const { game, a, b, c } = table({ players: 3 });
    pickModes(a, 1);
    pickModes(b, 0);
    pickModes(c, 1);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    const casts = game.state.eventLog.filter((e) => e.type === "vote-cast");
    expect(casts.map((e) => (e.type === "vote-cast" ? e.vote.voter : null))).toEqual([A, B, C]);
    const [done] = finished(game.state.eventLog);
    expect(done.secret).toBe(false);
    expect(done.votes.map((v) => ("option" in v.choice ? v.choice.text : ""))).toEqual(["knowledge", "time", "knowledge"]);
  });
});

describe("additional votes (rule 701.38d)", () => {
  it("Tivit's controller votes twice; each evidence vote investigates, each bribery vote makes a Treasure", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    enter(game, "Tivit, Seller of Secrets");
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("the additional vote may be declined", () => {
    const { game, a, b } = table();
    let asked = 0;
    a.chooseModesFn = (_view, minModes) => {
      asked += 1;
      return minModes === 0 ? [] : [0];
    };
    pickModes(b, 0);
    enter(game, "Tivit, Seller of Secrets");
    expect(asked).toBe(2);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });
});

describe("secret council", () => {
  it("Truth or Consequences: no vote is shown until all are revealed together", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const spell = toHand(game, "Truth or Consequences");
    const before = hand(game).length;
    mana(game);
    cast(game, spell);
    const log = game.state.eventLog;
    expect(log.some((e) => e.type === "vote-cast")).toBe(false);
    expect(log.some((e) => e.type === "modes-chosen" && e.source === spell)).toBe(false);
    const [done] = finished(log);
    expect(done.secret).toBe(true);
    expect(done.votes).toHaveLength(2);
    // One truth vote: a card. One consequences vote: 3 damage to the only opponent.
    expect(hand(game).length).toBe(before - 1 + 1);
    expect(life(game, B)).toBe(17);
  });

  it("Trap the Trespassers: a stun counter per vote on each creature voted for, then it's tapped", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, bears);
    pickPermanents(b, bears);
    mana(game);
    cast(game, toHand(game, "Trap the Trespassers"));
    expect(counters(game, bears, "stun")).toBe(2);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, other, "stun")).toBe(0);
    expect(game.state.objects[other].tapped).toBe(false);
  });

  it("Vault 11: with no creature voted for, each player draws; otherwise the most-voted creature is destroyed", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const vault = spawn(game, "Vault 11: Voter's Dilemma");
    game.state.objects[vault].counters = { lore: 1 };
    pickPermanents(a);
    pickPermanents(b);
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "begin-combat");
    // Chapter II on turn 3: nobody voted, so each player drew (on top of the draw steps).
    expect(hand(game).length).toBe(mine + 1 + 1);
    expect(hand(game, B).length).toBe(theirs + 1 + 1);
    expect(zone(game, bears)).toBe("battlefield");
    pickPermanents(a, bears);
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "begin-combat");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("a vote for permanents", () => {
  it("Council's Judgment exiles the permanent with the most votes, without targeting it", () => {
    const { game, a, b, c } = table({ players: 3 });
    const shroud = spawn(game, "Gladecover Scout", B);
    const other = spawn(game, "Grizzly Bears", C);
    pickPermanents(a, shroud);
    pickPermanents(b, other);
    pickPermanents(c, shroud);
    mana(game);
    cast(game, toHand(game, "Council's Judgment"));
    expect(zone(game, shroud)).toBe("exile");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("a vote for a token of a stack is a vote for one token, which alone is exiled", () => {
    const { game, a, b, c } = table({ players: 3 });
    game.debugApplyEffect(B, { kind: "create-token", token: "Goblin Token", count: 10 });
    const stack = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].stackCount === 10);
    if (stack === undefined) throw new Error("no stack of ten Goblins");
    const other = spawn(game, "Grizzly Bears", C);
    pickPermanents(a, stack);
    pickPermanents(b, other);
    // carol votes for a Goblin of the stack too: whichever is offered as the stack.
    c.choosePermanentsFn = (_view, eligible) => eligible.filter((id) => id !== other && game.state.objects[id].controller === B).slice(0, 1);
    mana(game);
    cast(game, toHand(game, "Council's Judgment"));
    // Two votes for Goblins, but each is its own token: one vote each, tied
    // with the Bears — all three of them exiled, eight Goblins left.
    expect(tokensNamed(game, "Goblin Token", B)).toBe(8);
    expect(zone(game, other)).toBe("exile");
  });

  it("Council's Judgment exiles every permanent tied for the most votes", () => {
    const { game, a, b } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Gladecover Scout", B);
    pickPermanents(a, one);
    pickPermanents(b, two);
    mana(game);
    cast(game, toHand(game, "Council's Judgment"));
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
  });
});

describe("a vote for players", () => {
  it("Círdan: each player draws per vote received; one who got none may put a permanent card onto the battlefield", () => {
    const { game, a, b, c } = table({ players: 3 });
    const bVotes = { a: 1, b: 0, c: 1 } as const;
    // Modes offered are each player still in the game, in turn order: alice, bob, carol.
    pickModes(a, bVotes.a);
    pickModes(b, 0);
    pickModes(c, bVotes.c);
    const bear = toHand(game, "Grizzly Bears", C);
    pickFromZone(c, bear);
    const handA = hand(game).length;
    const handB = hand(game, B).length;
    enter(game, "Círdan the Shipwright");
    expect(hand(game).length).toBe(handA + 1);
    expect(hand(game, B).length).toBe(handB + 2);
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].controller).toBe(C);
  });
});

describe("whenever players finish voting", () => {
  it("Erestor: opponents who voted with you make a Treasure; scry per opponent who didn't; draw", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Erestor of the Council");
    pickModes(a, 1);
    pickModes(b, 1);
    pickModes(c, 0);
    let scried = -1;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    const before = hand(game).length;
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", C)).toBe(0);
    expect(scried).toBe(1);
    // Plea's knowledge won (3 cards) and Erestor drew one.
    expect(hand(game).length).toBe(before + 3 + 1);
  });

  it("Model of Unity: you and each opponent who voted with you may scry 2", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Model of Unity");
    pickModes(a, 0);
    pickModes(b, 0);
    pickModes(c, 1);
    const scry = { a: 0, b: 0, c: 0 };
    a.chooseScryFn = (_view, cards) => ((scry.a = cards.length), []);
    b.chooseScryFn = (_view, cards) => ((scry.b = cards.length), []);
    c.chooseScryFn = (_view, cards) => ((scry.c = cards.length), []);
    mana(game);
    cast(game, toHand(game, "Plea for Power"));
    expect(scry).toEqual({ a: 2, b: 2, c: 0 });
  });
});

describe("LotR council cards", () => {
  it("Travel Through Caradhras: a basic land per Redhorn Pass vote, a card back per Mines of Moria vote, then exiled", () => {
    const { game, a, b } = table();
    const land = toLibrary(game, "Forest");
    const back = toGraveyard(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === land || id === back);
    pickModes(a, 0);
    pickModes(b, 1);
    const travel = toHand(game, "Travel Through Caradhras");
    mana(game);
    const onField = (): ObjectId[] => named(game, "Forest").filter((id) => zone(game, id) === "battlefield");
    const before = onField();
    cast(game, travel);
    const fetched = onField().filter((id) => !before.includes(id));
    expect(fetched.length).toBe(1);
    expect(game.state.objects[fetched[0]].tapped).toBe(true);
    expect(zone(game, back)).toBe("hand");
    expect(zone(game, travel)).toBe("exile");
  });

  it("Sail into the West: return wins — each player returns up to two cards, then it's exiled", () => {
    const { game, a, b } = table();
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickModes(b, 0);
    pickFromZone(a, mine);
    pickFromZone(b, theirs);
    const sail = toHand(game, "Sail into the West");
    mana(game);
    cast(game, sail);
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
    expect(zone(game, sail)).toBe("exile");
  });

  it("Sail into the West: a tie — each player may discard their hand and draw seven", () => {
    const { game, a, b } = table();
    toHand(game, "Grizzly Bears", B);
    // Votes: a return, b embark; then a declines the wheel, b takes it.
    let aAsked = 0;
    a.chooseModesFn = (_view, minModes) => (aAsked++ === 0 ? [0] : minModes === 0 ? [] : [0]);
    let bAsked = 0;
    b.chooseModesFn = () => (bAsked++ === 0 ? [1] : [0]);
    const sail = toHand(game, "Sail into the West");
    const mine = hand(game).length;
    mana(game);
    cast(game, sail);
    expect(hand(game).length).toBe(mine - 1);
    expect(hand(game, B).length).toBe(7);
    expect(graveyard(game)).toContain(sail);
  });

  it("Galadriel, Elven-Queen: with another Elf entered this turn, dominion tempts you and pumps the Ring-bearer", () => {
    const { game, a, b } = table();
    const galadriel = spawn(game, "Galadriel, Elven-Queen");
    enter(game, "Llanowar Elves");
    pickModes(a, 0);
    pickModes(b, 0);
    a.choosePermanentsFn = (_view, eligible) => eligible.filter((id) => id === galadriel);
    game.advanceUntil((s) => s.turn.step === "declare-attackers" || s.turn.step === "end");
    expect(counters(game, galadriel)).toBe(1);
  });
});
