/**
 * Batch 257, group B: cards freed by the attack-restriction, chosen-by-other-player,
 * dealt-damage-dies, per-player condition, on-resolution choice, choose-permanent and
 * per-player count families. One test for the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  attack,
  B,
  blockOffer,
  C,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const loseLife = (game: Game, player: PlayerId, n: number): void =>
  game.debugApplyEffect(A, { kind: "lose-life", amount: n, target: 0 }, [ref(player)]);
const castable = (game: Game, card: ObjectId, targets: readonly (PlayerId | ObjectId)[] = []): boolean =>
  game.canDispatch({ type: "cast-spell", player: A, card, targets: targets.map(ref) } as Action) === null;

/** Why alice can't cast this exiled Bolt at bob under its permission, or `null` if she can. */
const impulse = (game: Game, bolt: ObjectId): string | null =>
  game.canDispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "impulse" } as Action);

describe("Manta Ray", () => {
  it("is blocked only by blue creatures", () => {
    const { game, a } = table();
    spawn(game, "Island");
    const ray = spawn(game, "Manta Ray");
    spawn(game, "Island", B);
    const drake = spawn(game, "Air Elemental", B);
    const bears = spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [ray]);
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: bears, attacker: ray }] } as Action)).not.toBeNull();
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: drake, attacker: ray }] } as Action)).toBeNull();
  });
});

describe("Ley Line", () => {
  it("the active player chooses the target as it triggers, and whether to put the counter", () => {
    const { game, b } = table();
    spawn(game, "Ley Line");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    const seen = watchTargets(b, () => [bears]);
    b.chooseModesFn = () => [0];
    nextTurn(game, "draw");
    expect(seen.asked).toBe(1);
    expect(counters(game, bears)).toBe(1);
  });

  it("they may decline", () => {
    const { game, b } = table();
    spawn(game, "Ley Line");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(b, bears);
    b.chooseModesFn = () => [];
    nextTurn(game, "draw");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Baron Sengir", () => {
  it("grows by a +2/+2 counter when a creature it damaged dies, and can't regenerate itself", () => {
    const { game, a, b } = table();
    const baron = spawn(game, "Baron Sengir");
    const bird = spawn(game, "Air Elemental", B);
    b.declareBlockersFn = () => [{ blocker: bird, attacker: baron }];
    attack(game, a, [baron]);
    expect(zone(game, bird)).toBe("graveyard");
    expect(pt(game, baron)).toEqual({ power: 7, toughness: 7 });
    expect(game.canDispatch({ type: "activate-ability", player: A, source: baron, abilityIndex: 0, targets: [ref(baron)] } as Action)).not.toBeNull();
  });
});

describe("Zurgo Helmsmasher", () => {
  it("has indestructible only during its controller's turn", () => {
    const { game } = table();
    const zurgo = spawn(game, "Zurgo Helmsmasher");
    expect(keywords(game, zurgo).has("indestructible")).toBe(true);
    nextTurn(game);
    expect(keywords(game, zurgo).has("indestructible")).toBe(false);
  });
});

describe("Hour of Revelation", () => {
  it("costs {3} less with ten nonland permanents on the battlefield, whoever's, and destroys them", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const spell = toHand(game, "Hour of Revelation");
    const ours = Array.from({ length: 5 }, () => spawn(game, "Grizzly Bears", A));
    for (let i = 0; i < 4; i += 1) spawn(game, "Grizzly Bears", B);
    expect(castable(game, spell)).toBe(false);
    spawn(game, "Sol Ring", B);
    expect(castable(game, spell)).toBe(true);
    cast(game, spell);
    expect(zone(game, ours[0])).toBe("graveyard");
    expect(named(game, "Plains")).toHaveLength(3);
    expect(named(game, "Sol Ring")).toHaveLength(0);
  });
});

describe("Kjeldoran Guard", () => {
  const offer = (game: Game, guard: ObjectId): boolean =>
    game.canDispatch({ type: "activate-ability", player: A, source: guard, abilityIndex: 0, targets: [ref(guard)] } as Action) === null;

  it("only during combat", () => {
    const { game } = table();
    const guard = spawn(game, "Kjeldoran Guard");
    expect(offer(game, guard)).toBe(false);
    toStep(game, "begin-combat");
    expect(offer(game, guard)).toBe(true);
  });

  it("not if the defending player controls a snow land", () => {
    const { game } = table({ step: "begin-combat" });
    const guard = spawn(game, "Kjeldoran Guard");
    spawn(game, "Snow-Covered Plains", B);
    expect(offer(game, guard)).toBe(false);
  });

  it("reads the active player's opponents, so the Guard's own snow land stops it on an opponent's turn", () => {
    const { game } = table();
    const guard = spawn(game, "Kjeldoran Guard");
    spawn(game, "Snow-Covered Plains", A);
    game.advanceUntil((s) => s.turn.step === "begin-combat" && activePlayerOf(s) === B && s.priority.holder === A);
    expect(offer(game, guard)).toBe(false);
  });

  it("with several defending players, one with no snow lands is enough (rule 802.2a)", () => {
    const { game } = table({ players: 3, step: "begin-combat" });
    const guard = spawn(game, "Kjeldoran Guard");
    spawn(game, "Snow-Covered Plains", B);
    expect(offer(game, guard)).toBe(true);
    spawn(game, "Snow-Covered Plains", C);
    expect(offer(game, guard)).toBe(false);
  });
});

describe("Ajani, Strength of the Pride", () => {
  it("+1 counts creatures plus planeswalkers", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani, Strength of the Pride");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    loyalty(game, ajani, 1);
    expect(life(game)).toBe(23);
  });

  it("0 exiles Ajani and each opposing artifact and creature, at 15 over starting life", () => {
    const { game } = table({ life: 35 });
    game.state.players[A].life = 50;
    const ajani = spawn(game, "Ajani, Strength of the Pride");
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    const land = spawn(game, "Island", B);
    loyalty(game, ajani, 0);
    for (const id of [ajani, bears, ring]) expect(zone(game, id)).toBe("exile");
    for (const id of [mine, land]) expect(zone(game, id)).toBe("battlefield");
  });

  it("0 does nothing a life short", () => {
    const { game } = table({ life: 35 });
    game.state.players[A].life = 49;
    const ajani = spawn(game, "Ajani, Strength of the Pride");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, ajani, 0);
    expect(zone(game, ajani)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("-2 makes the token", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani, Strength of the Pride");
    loyalty(game, ajani, -2);
    expect(tokensNamed(game, "Ajani's Pridemate Token", A)).toBe(1);
  });
});

describe("Doctor Strange, Surgeon", () => {
  it("doubles life gained, and pumps at each combat at 10 over starting life", () => {
    const { game } = table();
    spawn(game, "Doctor Strange, Surgeon");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 5 }, []);
    expect(life(game)).toBe(30);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
  });

  it("not a life short", () => {
    const { game } = table();
    spawn(game, "Doctor Strange, Surgeon");
    const bears = spawn(game, "Grizzly Bears");
    game.state.players[A].life = 29;
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Exile into Darkness", () => {
  it("takes a creature of mana value 3 or less only, and comes back with more cards in hand than each opponent", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const spell = toHand(game, "Exile into Darkness");
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(zone(game, spell)).toBe("graveyard");
    for (let i = 0; i < 4; i += 1) toHand(game, "Wastes");
    a.chooseModesFn = () => [0];
    toStep(game, "draw");
    settle(game);
    expect(zone(game, spell)).toBe("hand");
  });

  it("stays in the graveyard with no more cards than an opponent", () => {
    const { game, a } = table();
    const spell = toGraveyard(game, "Exile into Darkness");
    for (let i = 0; i < 4; i += 1) toHand(game, "Wastes", B);
    a.chooseModesFn = () => [0];
    toStep(game, "draw");
    settle(game);
    expect(zone(game, spell)).toBe("graveyard");
  });
});

describe("Robber of the Rich", () => {
  it("exiles the top card of a defending player with more cards in hand; castable only on a turn you attacked with a Rogue, with any mana", () => {
    const { game, a, b } = table();
    const robber = spawn(game, "Robber of the Rich");
    spawn(game, "Island");
    for (let i = 0; i < 3; i += 1) toHand(game, "Wastes", B);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    attack(game, a, [robber]);
    expect(zone(game, bolt)).toBe("exile");
    a.declareAttackersFn = () => [];
    // Another player's Rogue attacking on their turn is no use to you.
    nextTurn(game);
    const theirRogue = spawn(game, "Robber of the Rich", B);
    b.declareAttackersFn = () => [{ attacker: theirRogue, defender: A }];
    game.advanceUntil((s) => s.turn.step === "end" && s.priority.holder === A);
    expect(game.state.players[B].turnHistory?.attackers?.length).toBe(1);
    expect(impulse(game, bolt)).not.toBeNull();
    b.declareAttackersFn = () => [];
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(impulse(game, bolt)).not.toBeNull();
    const piker = spawn(game, "Goblin Piker");
    attack(game, a, [piker]);
    expect(impulse(game, bolt)).not.toBeNull();
    a.declareAttackersFn = () => [];
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [robber]);
    // Its Rogue attacked this turn: the Island pays for the Bolt.
    expect(impulse(game, bolt)).toBeNull();
    const before = life(game, B);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(before - 3);
  });

  it("exiles nothing when the defending player hasn't more cards", () => {
    const { game, a } = table();
    const robber = spawn(game, "Robber of the Rich");
    for (let i = 0; i < 3; i += 1) toHand(game, "Wastes", A);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    attack(game, a, [robber]);
    expect(zone(game, bolt)).toBe("library");
  });
});

describe("Wild Mammoth", () => {
  it("goes to the player with the most creatures, and stays on a tie", () => {
    const { game } = table();
    const mammoth = spawn(game, "Wild Mammoth");
    spawn(game, "Grizzly Bears", B);
    toStep(game, "draw");
    settle(game);
    expect(controller(game, mammoth)).toBe(A);
    spawn(game, "Grizzly Bears", B);
    toStep(game, "draw");
    settle(game);
    expect(controller(game, mammoth)).toBe(B);
  });
});

describe("Disorder", () => {
  it("2 damage to each white creature and once to each player controlling one", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 2);
    const lions = [spawn(game, "Savannah Lions", B), spawn(game, "Savannah Lions", B)];
    const bears = spawn(game, "Grizzly Bears", C);
    cast(game, toHand(game, "Disorder"));
    for (const id of lions) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(20);
    expect(life(game, A)).toBe(20);
  });
});

describe("Thornbow Archer", () => {
  it("each opponent without an Elf loses 1", () => {
    const { game, a } = table({ players: 3 });
    const archer = spawn(game, "Thornbow Archer");
    spawn(game, "Llanowar Elves", B);
    attack(game, a, [archer], C);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(18);
  });
});

describe("Hellfire Mongrel", () => {
  it("only at two or fewer cards", () => {
    const small = table({ openingHandSize: 2 });
    spawn(small.game, "Hellfire Mongrel");
    nextTurn(small.game, "draw");
    expect(life(small.game, B)).toBe(18);
    const big = table({ openingHandSize: 3 });
    spawn(big.game, "Hellfire Mongrel");
    nextTurn(big.game, "draw");
    expect(life(big.game, B)).toBe(20);
  });
});

describe("Quest for the Nihil Stone", () => {
  it("counts discards one at a time, and reads its counters as it last existed if it's gone by resolution", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const quest = spawn(game, "Quest for the Nihil Stone");
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    a.chooseModesFn = () => [0];
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 2 }, [ref(B)]);
    settle(game);
    expect(counters(game, quest, "quest")).toBe(2);
    game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === B && s.zones.shared.stack.length > 0);
    destroy(game, quest, A);
    expect(zone(game, quest)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
  });

  it("not with a card in hand", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const quest = spawn(game, "Quest for the Nihil Stone");
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    a.chooseModesFn = () => [0];
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 2 }, [ref(B)]);
    settle(game);
    expect(counters(game, quest, "quest")).toBe(2);
    toHand(game, "Wastes", B);
    nextTurn(game, "draw");
    expect(life(game, B)).toBe(20);
  });
});

describe("Davros, Dalek Creator", () => {
  it("a Dalek if an opponent lost 3, and only those opponents face the choice", () => {
    const { game, a, b, c } = table({ players: 3 });
    a.chooseModesFn = () => {
      throw new Error("alice isn't asked");
    };
    c.chooseModesFn = () => {
      throw new Error("carol lost only 2");
    };
    spawn(game, "Davros, Dalek Creator");
    loseLife(game, B, 3);
    loseLife(game, C, 2);
    b.chooseModesFn = () => [1];
    const cards = hand(game, B).length;
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Dalek Token", A)).toBe(1);
    expect(hand(game, B)).toHaveLength(cards - 1);
  });

  it("the other side: you draw", () => {
    const { game, b } = table();
    spawn(game, "Davros, Dalek Creator");
    loseLife(game, B, 3);
    b.chooseModesFn = () => [0];
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game, A)).toHaveLength(mine + 1);
    expect(hand(game, B)).toHaveLength(theirs);
  });

  it("nothing with no opponent at 3", () => {
    const { game } = table();
    spawn(game, "Davros, Dalek Creator");
    loseLife(game, B, 2);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Dalek Token", A)).toBe(0);
  });
});

describe("Aven Courier", () => {
  it("copies a kind of counter on a permanent you control, unless the target has one", () => {
    const { game, a } = table();
    const courier = spawn(game, "Aven Courier");
    const holder = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Sol Ring", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "oil", amount: 1 }, [ref(holder)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "stun", amount: 1 }, [ref(theirs)]);
    pickTargets(a, target);
    a.chooseCreatureTypeFn = (_v, _s, options) => {
      expect(options).toEqual(["oil"]);
      return options[0];
    };
    attack(game, a, [courier]);
    expect(counters(game, target, "oil")).toBe(1);
    expect(counters(game, holder, "oil")).toBe(1);
    // It has one now: nothing more.
    toStep(game, "precombat-main");
    pickTargets(a, target);
    attack(game, a, [courier]);
    expect(counters(game, target, "oil")).toBe(1);
  });
});

describe("Mindblaze", () => {
  const setUp = (number: number): { game: Game; library: readonly ObjectId[] } => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Grizzly Bears", B);
    a.chooseCardNameFn = () => "Grizzly Bears";
    a.chooseNumberFn = () => number;
    cast(game, toHand(game, "Mindblaze"), { targets: [ref(B)] });
    return { game, library: game.state.zones.perPlayer[B].library };
  };

  it("8 damage for exactly the chosen number, and the cards go back", () => {
    const { game, library } = setUp(2);
    expect(life(game, B)).toBe(12);
    expect(library.filter((id) => game.state.objects[id].cardName === "Grizzly Bears")).toHaveLength(2);
  });

  it("nothing for another number", () => {
    const { game } = setUp(1);
    expect(life(game, B)).toBe(20);
  });
});

describe("Consuming Tide", () => {
  it("each keeps one, the rest go back together, and you draw for each opponent with more cards", () => {
    const { game, a, b } = table({ openingHandSize: 0 });
    lands(game, "Island", 4);
    const mine = [spawn(game, "Grizzly Bears", A), spawn(game, "Hill Giant", A)];
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B), spawn(game, "Craw Wurm", B)];
    for (let i = 0; i < 3; i += 1) toHand(game, "Wastes", B);
    pickPermanents(a, mine[0]);
    pickPermanents(b, theirs[0]);
    const spell = toHand(game, "Consuming Tide");
    const myHand = hand(game, A).length - 1;
    const theirHand = hand(game, B).length;
    cast(game, spell);
    expect(zone(game, mine[0])).toBe("battlefield");
    expect(zone(game, theirs[0])).toBe("battlefield");
    expect(zone(game, mine[1])).toBe("hand");
    expect(zone(game, theirs[1])).toBe("hand");
    expect(named(game, "Island")).toHaveLength(4);
    expect(hand(game, B)).toHaveLength(theirHand + 2);
    // One back, one drawn for bob's bigger hand.
    expect(hand(game, B).length).toBeGreaterThan(myHand + 1);
    expect(hand(game, A)).toHaveLength(myHand + 2);
  });

  it("no card with no opponent holding more", () => {
    const { game, a } = table({ openingHandSize: 0 });
    lands(game, "Island", 4);
    const mine = [spawn(game, "Grizzly Bears", A), spawn(game, "Hill Giant", A)];
    pickPermanents(a, mine[0]);
    const spell = toHand(game, "Consuming Tide");
    const myHand = hand(game, A).length - 1;
    cast(game, spell);
    expect(hand(game, A)).toHaveLength(myHand + 1);
  });
});

describe("Summon: Valefor", () => {
  it("each opponent chooses among their greatest mana value; those go back together", () => {
    const { game, b, c } = table({ players: 3 });
    const bigB = spawn(game, "Craw Wurm", B);
    const smallB = spawn(game, "Grizzly Bears", B);
    const tiedC = [spawn(game, "Grizzly Bears", C), spawn(game, "Grizzly Bears", C)];
    const offerB = pickPermanents(b, bigB);
    pickPermanents(c, tiedC[1]);
    const mine = spawn(game, "Grizzly Bears");
    enter(game, "Summon: Valefor");
    expect(offerB.offered).not.toContain(smallB);
    expect(zone(game, bigB)).toBe("hand");
    expect(zone(game, smallB)).toBe("battlefield");
    expect(zone(game, tiedC[1])).toBe("hand");
    expect(zone(game, tiedC[0])).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("II taps and stuns up to one target creature", () => {
    const { game, a } = table();
    const valefor = enter(game, "Summon: Valefor");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, valefor, "lore")).toBe(2);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});

describe("Hokori, Dust Drinker", () => {
  it("lands stay tapped through the untap step, and the active player untaps one of their own", () => {
    const { game, a, b } = table();
    a.chooseTargetsFn = () => [];
    spawn(game, "Hokori, Dust Drinker");
    const theirs = [spawn(game, "Wastes", B, { tapped: true }), spawn(game, "Wastes", B, { tapped: true })];
    const mine = spawn(game, "Wastes", A, { tapped: true });
    const picked = pickPermanents(b, theirs[1]);
    nextTurn(game, "draw");
    expect(picked.offered).not.toContain(mine);
    expect(game.state.objects[theirs[1]].tapped).toBe(false);
    expect(game.state.objects[theirs[0]].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(true);
  });
});

describe("Descendant of Masumaro", () => {
  it("nets your hand less the target opponent's", () => {
    const { game } = table({ openingHandSize: 0 });
    const descendant = spawn(game, "Descendant of Masumaro");
    for (let i = 0; i < 4; i += 1) toHand(game, "Wastes", A);
    toHand(game, "Wastes", B);
    game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === A && s.turn.number > 1);
    const net = hand(game, A).length - hand(game, B).length;
    settle(game);
    expect(net).toBeGreaterThan(0);
    expect(counters(game, descendant)).toBe(net);
  });

  it("removes them all at most, and it survives on its printed 1/1", () => {
    const { game } = table({ openingHandSize: 0 });
    const descendant = spawn(game, "Descendant of Masumaro");
    for (let i = 0; i < 4; i += 1) toHand(game, "Wastes", B);
    game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === A && s.turn.number > 1);
    settle(game);
    expect(counters(game, descendant)).toBe(0);
    expect(zone(game, descendant)).toBe("battlefield");
  });
});

describe("Killmonger, Ruthless Usurper", () => {
  it("+1/+0 for each artifact the defending player controls; damage takes one and makes a Treasure", () => {
    const { game, a } = table({ players: 3 });
    const killmonger = spawn(game, "Killmonger, Ruthless Usurper");
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", C);
    spawn(game, "Sol Ring", A);
    attack(game, a, [killmonger]);
    expect(pt(game, killmonger).power).toBe(5);
    expect(life(game, B)).toBe(15);
    expect(named(game, "Sol Ring", B)).toHaveLength(1);
    expect(named(game, "Sol Ring", C)).toHaveLength(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("attacking a planeswalker, its controller is the defending player", () => {
    const { game, a } = table();
    const killmonger = spawn(game, "Killmonger, Ruthless Usurper");
    const walker = spawn(game, "Liliana, Death Mage", B);
    spawn(game, "Sol Ring", B);
    attack(game, a, [killmonger], walker);
    expect(pt(game, killmonger).power).toBe(4);
  });
});

describe("Oskar, Rubbish Reclaimer", () => {
  it("costs {1} less for each different mana value in your graveyard, a land's 0 among them", () => {
    const { game } = table();
    spawn(game, "Island");
    spawn(game, "Swamp");
    const oskar = toHand(game, "Oskar, Rubbish Reclaimer");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    expect(castable(game, oskar)).toBe(false);
    toGraveyard(game, "Wastes");
    expect(castable(game, oskar)).toBe(true);
  });

  it("may cast a discarded nonland card from the graveyard, paying for it", () => {
    const { game, a } = table();
    spawn(game, "Oskar, Rubbish Reclaimer");
    spawn(game, "Mountain");
    const bolt = toHand(game, "Lightning Bolt");
    const land = toHand(game, "Wastes");
    let asked = 0;
    a.chooseCastNowFn = (_v, offer) => {
      asked += 1;
      return { type: "cast-spell", player: A, card: offer.cards[0], targets: [{ kind: "player", player: B }], via: "effect" };
    };
    a.chooseDiscardsFn = () => [bolt];
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 1 }, [ref(A)]);
    settle(game);
    expect(asked).toBe(1);
    expect(life(game, B)).toBe(17);
    expect(graveyard(game, A)).toContain(bolt);
    a.chooseDiscardsFn = () => [land];
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 1 }, [ref(A)]);
    settle(game);
    expect(asked).toBe(1);
  });
});

describe("Liliana, Death Mage", () => {
  it("-7 for each creature card in the target opponent's graveyard", () => {
    const { game, a } = table();
    const liliana = spawn(game, "Liliana, Death Mage");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Lightning Bolt", B);
    toGraveyard(game, "Grizzly Bears", A);
    pickTargets(a, B);
    loyalty(game, liliana, -7, { atLeast: 7, targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });

  it("+1 may name no card", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana, Death Mage");
    const bears = toGraveyard(game, "Grizzly Bears");
    loyalty(game, liliana, 1, { targets: [null] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, liliana, "loyalty")).toBe(5);
  });
});

describe("Call the Coppercoats", () => {
  it("costs {1}{W} more per extra target and counts every target's creatures", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Call the Coppercoats"), { targets: [ref(B), ref(C)] });
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(3);
  });

  it("a second target needs the extra mana", () => {
    const { game } = table({ players: 3 });
    lands(game, "Plains", 3);
    const spell = toHand(game, "Call the Coppercoats");
    expect(castable(game, spell, [B, C])).toBe(false);
    expect(castable(game, spell, [B])).toBe(true);
  });
});
