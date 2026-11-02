/**
 * Amounts and conditions read from what has happened this turn: counters put
 * (`countersPutThisTurn`, `counters-put-this-turn`), the total mana value of
 * spells cast (`castThisTurn`'s `total` and `other`), cards discarded and lands
 * entered (`turnHistory`), a stat read per player (`turnStat`'s `who: "each"`),
 * a count of the players past a threshold, and the opponents attacked at any
 * combat of the turn (`"opponents-attacked"`).
 */
import { describe, expect, it } from "vitest";

import { countersPutThisTurn } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, activate, attack, cast, counters, destroy, enter, graveyard, hand, lands, life, named, nextTurn, pt, ref, settle, spawn, table, toHand, toStep, tokensNamed, zone } from "./harness.js";

/** Run to the end step of this turn, every trigger of it resolved. */
const toEndStep = (game: Game, player: PlayerId = A): void => {
  toStep(game, "end", player);
  settle(game);
};

/** `by` puts `amount` counters on `id`, as an effect of theirs. */
const put = (game: Game, by: PlayerId, id: ObjectId, counter = "+1/+1", amount = 1): void =>
  game.debugApplyEffect(by, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);

/** `player` discards `n` cards of their choice, off an effect. */
const discard = (game: Game, player: PlayerId, n: number): void => {
  game.debugApplyEffect(player, { kind: "discard", target: "you", amount: n });
  settle(game);
};

describe("counters put this turn", () => {
  it("Iridescent Hornbeetle: one token per +1/+1 counter you put on your creatures, a departed creature's too", () => {
    const { game } = table();
    spawn(game, "Iridescent Hornbeetle");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(bears)] });
    destroy(game, bears);
    toEndStep(game);
    expect(tokensNamed(game, "Insect Token", A)).toBe(2);
  });

  it("Iridescent Hornbeetle: another player's counter, one on another's creature, another kind and a noncreature don't count", () => {
    const { game } = table();
    spawn(game, "Iridescent Hornbeetle");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const walker = spawn(game, "Jace Beleren");
    put(game, A, theirs);
    put(game, B, mine);
    put(game, A, mine, "-1/-1");
    put(game, A, walker);
    toEndStep(game);
    expect(tokensNamed(game, "Insect Token", A)).toBe(0);
  });

  it("Iridescent Hornbeetle: a replacement's extra counters are put too", () => {
    const { game } = table();
    spawn(game, "Iridescent Hornbeetle");
    spawn(game, "Doubling Season");
    const bears = spawn(game, "Grizzly Bears");
    put(game, A, bears);
    expect(counters(game, bears)).toBe(2);
    toEndStep(game);
    // Doubling Season doubles the Insects too: two counters, four tokens.
    expect(tokensNamed(game, "Insect Token", A)).toBe(4);
  });

  it("Iridescent Hornbeetle: a counter on every token of a stack is that many counters", () => {
    const { game } = table();
    spawn(game, "Iridescent Hornbeetle");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 3 });
    settle(game);
    game.debugApplyEffect(A, { kind: "add-counter-all", filter: { subtype: "Soldier" }, counter: "+1/+1", amount: 1 });
    settle(game);
    toEndStep(game);
    expect(tokensNamed(game, "Insect Token", A)).toBe(3);
  });

  it("Fairgrounds Trumpeter: a +1/+1 counter on a permanent of yours, whoever put it", () => {
    const { game } = table();
    const trumpeter = spawn(game, "Fairgrounds Trumpeter");
    const mine = spawn(game, "Grizzly Bears");
    put(game, B, mine);
    toEndStep(game);
    expect(counters(game, trumpeter)).toBe(1);
  });

  it("Fairgrounds Trumpeter: not another player's permanent, not another kind, and a new turn is a new tally", () => {
    const { game } = table();
    const trumpeter = spawn(game, "Fairgrounds Trumpeter");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    put(game, A, theirs);
    put(game, A, mine, "-1/-1");
    toEndStep(game);
    expect(counters(game, trumpeter)).toBe(0);
    put(game, A, trumpeter);
    nextTurn(game);
    toEndStep(game, B);
    expect(counters(game, trumpeter)).toBe(1);
  });

  it("a creature that entered with counters had them put on it (rule 122.6), by its controller", () => {
    const { game } = table();
    const trumpeter = spawn(game, "Fairgrounds Trumpeter");
    spawn(game, "Renata, Called to the Hunt");
    enter(game, "Grizzly Bears");
    toEndStep(game);
    expect(counters(game, trumpeter)).toBe(1);
  });

  it("Lord Jyscal Guado: any counter you put on any creature, at each end step; not one someone else put", () => {
    const { game } = table();
    spawn(game, "Lord Jyscal Guado");
    const theirs = spawn(game, "Hill Giant", B);
    put(game, A, theirs, "-1/-1");
    toEndStep(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    nextTurn(game);
    put(game, B, theirs);
    toEndStep(game, B);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("Lord Jyscal Guado: a counter on a noncreature doesn't count", () => {
    const { game } = table();
    spawn(game, "Lord Jyscal Guado");
    put(game, A, spawn(game, "Jace Beleren"), "loyalty");
    toEndStep(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });

  it("the tally names no object: two tokens given a counter each still fold, and both counters count", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 10 });
    settle(game);
    const [stack] = named(game, "Soldier Token");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(stack)] });
    cast(game, toHand(game, "Battlegrowth"), { targets: [ref(stack)] });
    toStep(game, "postcombat-main");
    expect(named(game, "Soldier Token").length).toBe(2);
    expect(countersPutThisTurn(game.state, { onType: "creature" }, A)).toBe(2);
  });
});

describe("the total mana value of other spells cast this turn", () => {
  const damageOf = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

  it("Call Forth the Tempest: its own mana value left out, what you cast before it counted, X and all", () => {
    const { game } = table();
    const tusker = spawn(game, "Krosan Tusker", B);
    const mine = spawn(game, "Krosan Tusker");
    lands(game, "Mountain", 12);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 2 }); // Mana value 3.
    cast(game, toHand(game, "Call Forth the Tempest"));
    expect(damageOf(game, tusker)).toBe(4);
    expect(damageOf(game, mine)).toBe(0);
  });

  it("Call Forth the Tempest: alone, it deals none", () => {
    const { game } = table();
    const tusker = spawn(game, "Krosan Tusker", B);
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Call Forth the Tempest"));
    expect(damageOf(game, tusker)).toBe(0);
  });

  it("an opponent's spells aren't yours, and the same card cast twice is two spells", () => {
    const { game } = table();
    nextTurn(game);
    lands(game, "Mountain", 2, B);
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(A)] });
    const total = { castThisTurn: {}, total: "mana-value", other: true } as const;
    const lifeBefore = life(game, A);
    game.debugApplyEffect(A, { kind: "gain-life", amount: total });
    expect(life(game, A)).toBe(lifeBefore);
    // Bob's Shock back in his hand and cast again: reading from it, the first still counts.
    game.debugMove(shock, "hand");
    cast(game, shock, { player: B, targets: [ref(A)] });
    const before = life(game, B);
    game.debugApplyEffect(B, { kind: "gain-life", amount: total }, [], { source: shock });
    expect(life(game, B)).toBe(before + 1);
  });
});

describe("cards discarded this turn", () => {
  it("The Raven Man: a Bird at each end step a player discarded, whoever it was; none otherwise", () => {
    const { game } = table();
    spawn(game, "The Raven Man");
    toEndStep(game);
    expect(tokensNamed(game, "1/1 Black Bird Token (The Raven Man)", A)).toBe(0);
    nextTurn(game);
    discard(game, B, 1);
    toEndStep(game, B);
    expect(tokensNamed(game, "1/1 Black Bird Token (The Raven Man)", A)).toBe(1);
  });

  it("The Raven Man's activation makes each opponent discard", () => {
    const { game } = table({ players: 3 });
    const raven = spawn(game, "The Raven Man", A, { sick: false });
    lands(game, "Swamp", 4);
    activate(game, raven, 0);
    settle(game);
    expect(graveyard(game, B).length).toBe(1);
    expect(graveyard(game, C).length).toBe(1);
    expect(graveyard(game).length).toBe(0);
  });

  it("Dream Salvage: the cards that target opponent discarded this turn", () => {
    const { game } = table({ players: 3 });
    discard(game, B, 2);
    discard(game, C, 1);
    lands(game, "Island", 1);
    const salvage = toHand(game, "Dream Salvage");
    const before = hand(game).length;
    cast(game, salvage, { targets: [ref(B)] });
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("Hollow One: {2} less for each card you discarded this turn, a cycled one among them", () => {
    const { game } = table();
    const hollow = toHand(game, "Hollow One");
    const another = toHand(game, "Hollow One");
    const lands2 = lands(game, "Island", 2);
    game.dispatch({ type: "cycle", player: A, card: another });
    settle(game);
    expect(() => cast(game, hollow)).toThrow(); // {3} to find, no land left to pay it.
    const lands3 = lands(game, "Island", 3);
    cast(game, hollow);
    expect(zone(game, hollow)).toBe("battlefield");
    expect([...lands2, ...lands3].filter((id) => game.state.objects[id].tapped).length).toBe(5);
  });

  it("Hollow One: three discarded takes all of its {5}", () => {
    const { game } = table();
    const hollow = toHand(game, "Hollow One");
    discard(game, A, 3);
    cast(game, hollow);
    expect(zone(game, hollow)).toBe("battlefield");
  });
});

describe("lands entered this turn", () => {
  it("Bioengineered Future: each creature gets a counter for each land that entered, one since gone included", () => {
    const { game } = table();
    spawn(game, "Bioengineered Future");
    const land = enter(game, "Forest");
    enter(game, "Forest");
    destroy(game, land);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Bioengineered Future: an opponent's lands don't count, nor last turn's, and an opponent's creature gets nothing", () => {
    const { game } = table();
    spawn(game, "Bioengineered Future");
    enter(game, "Forest");
    enter(game, "Forest", B);
    expect(counters(game, enter(game, "Grizzly Bears", B))).toBe(0);
    expect(counters(game, enter(game, "Grizzly Bears"))).toBe(1);
    nextTurn(game);
    expect(counters(game, enter(game, "Grizzly Bears"))).toBe(0);
  });

  it("Bioengineered Future's own Lander", () => {
    const { game } = table();
    enter(game, "Bioengineered Future");
    expect(tokensNamed(game, "Lander Token", A)).toBe(1);
  });
});

describe("a stat read per player", () => {
  it("Wound Reflection: each opponent loses what they themselves lost, you nothing", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Wound Reflection");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(C)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    toEndStep(game);
    expect(life(game, B)).toBe(14);
    expect(life(game, C)).toBe(16);
    expect(life(game, A)).toBe(18);
  });

  it("Smuggler's Share: a card for each opponent who drew two, a Treasure for each who had two lands enter", () => {
    const { game } = table({ players: 4 });
    spawn(game, "Smuggler's Share");
    game.state.players[B].cardsDrawnThisTurn = 2;
    game.state.players[C].cardsDrawnThisTurn = 1;
    game.state.players[D].cardsDrawnThisTurn = 3;
    enter(game, "Forest", C);
    enter(game, "Forest", C);
    enter(game, "Forest", D);
    // Your own don't count: you aren't an opponent.
    game.state.players[A].cardsDrawnThisTurn = 5;
    enter(game, "Forest");
    enter(game, "Forest");
    const before = hand(game).length;
    toEndStep(game);
    expect(hand(game).length).toBe(before + 2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("the opponents attacked this turn", () => {
  it("Militant Angel after combat: a Knight for each opponent attacked, once each, no planeswalker's controller", () => {
    const { game, a } = table({ players: 4 });
    const one = spawn(game, "Grizzly Bears", A, { sick: false });
    const two = spawn(game, "Grizzly Bears", A, { sick: false });
    const three = spawn(game, "Grizzly Bears", A, { sick: false });
    const walker = spawn(game, "Jace Beleren", D);
    a.declareAttackersFn = () => [
      { attacker: one, defender: B },
      { attacker: two, defender: B },
      { attacker: three, defender: walker },
    ];
    toStep(game, "postcombat-main");
    enter(game, "Militant Angel");
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
  });

  it("Militant Angel before any attack: none", () => {
    const { game } = table();
    enter(game, "Militant Angel");
    expect(tokensNamed(game, "Knight Token", A)).toBe(0);
  });

  it("Rose, Cutthroat Raider: a Junk for each opponent attacked; none on a turn you didn't attack", () => {
    const { game, a } = table({ players: 3 });
    const rose = spawn(game, "Rose, Cutthroat Raider", A, { sick: false });
    const bears = spawn(game, "Grizzly Bears", A, { sick: false });
    a.declareAttackersFn = () => [
      { attacker: rose, defender: B },
      { attacker: bears, defender: C },
    ];
    toStep(game, "postcombat-main");
    settle(game);
    expect(tokensNamed(game, "Junk Token", A)).toBe(2);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    a.declareAttackersFn = () => [];
    toStep(game, "postcombat-main");
    settle(game);
    expect(tokensNamed(game, "Junk Token", A)).toBe(2);
  });

  it("Rose: sacrificing a Junk adds {R}", () => {
    const { game } = table();
    spawn(game, "Rose, Cutthroat Raider");
    const junk = enter(game, "Junk Token");
    activate(game, junk, 0);
    settle(game);
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "R").length).toBe(1);
  });

  it("the tally is of players attacked, each once, and stays after combat", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A, { sick: false });
    attack(game, a, [bears]);
    expect(game.state.players[A].turnHistory?.attackedPlayers).toEqual([B]);
  });
});
