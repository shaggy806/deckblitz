/**
 * Batch 257, group D: cards freed by the attack-restriction, chosen-by-other-player,
 * dealt-damage-dies, per-player condition, on-resolution choice, choose-permanent and
 * per-player count families. One focused test per card, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
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
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
  pt,
} from "./harness.js";
import type { ScriptedController } from "../controller.js";

/** `attacker` (alice's) attacks bob and `blocker` blocks it; damage is dealt. */
function attackBlocked(game: Game, seat: ScriptedController, bob: ScriptedController, attacker: ObjectId, blocker: ObjectId): void {
  bob.declareBlockersFn = () => [{ blocker, attacker }];
  attack(game, seat, [attacker]);
}

const tokens = (game: Game, name: string, n: number, player = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: n }, []);

describe("attack restrictions and defending-player reads", () => {
  it("Godhunter Octopus attacks only a player with an enchantment", () => {
    const t1 = table();
    const none = spawn(t1.game, "Godhunter Octopus");
    t1.a.declareAttackersFn = () => [{ attacker: none, defender: B }];
    t1.game.advanceUntil((s) => s.turn.step === "declare-attackers" || s.awaiting?.kind === "attackers");
    const offer = t1.game.legalActions(A).find((o) => o.kind === "declare-attackers");
    expect(offer === undefined || (offer.kind === "declare-attackers" && !offer.eligible.includes(none))).toBe(true);

    const t2 = table();
    const octopus = spawn(t2.game, "Godhunter Octopus");
    spawn(t2.game, "Glorious Anthem", B);
    attack(t2.game, t2.a, [octopus]);
    expect(life(t2.game, B)).toBe(15);
  });

  it("Sealock Monster's land becomes an Island in addition to its other types", () => {
    const { game, a } = table();
    const monster = spawn(game, "Sealock Monster");
    const plains = spawn(game, "Plains", B);
    lands(game, "Island", 7);
    a.chooseTargetsFn = () => [ref(plains)];
    activate(game, monster);
    expect(counters(game, monster)).toBe(3);
    expect(subtypes(game, plains)).toEqual(expect.arrayContaining(["Plains", "Island"]));
  });

  it("Bloodvial Purveyor gives the caster a Blood token and counts the defender's", () => {
    const { game, a } = table();
    const purveyor = spawn(game, "Bloodvial Purveyor");
    tokens(game, "Blood Token", 1, A); // mine: not counted
    tokens(game, "Blood Token", 2, B);
    settle(game);
    attack(game, a, [purveyor]);
    expect(life(game, B)).toBe(20 - 7);
  });

  it("Bloodvial Purveyor's token goes to the opponent who cast the spell", () => {
    const { game } = table();
    spawn(game, "Bloodvial Purveyor");
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    game.advanceUntil((s) => s.priority.holder === B);
    cast(game, shock, { player: B, targets: [ref(A)] });
    expect(tokensNamed(game, "Blood Token", B)).toBe(1);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
  });

  it("Coastline Marauders counts the lands of the player it attacks", () => {
    const { game, a } = table({ players: 3 });
    const marauders = spawn(game, "Coastline Marauders");
    lands(game, "Wastes", 2, B);
    lands(game, "Wastes", 5, C);
    attack(game, a, [marauders], C);
    expect(life(game, C)).toBe(15);
    expect(life(game, B)).toBe(20);
  });

  it("Generous Plunderer hits the defender for their artifacts, and shares its Treasure", () => {
    const { game, a } = table();
    const plunderer = spawn(game, "Generous Plunderer");
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    attack(game, a, [plunderer]);
    expect(life(game, B)).toBe(20 - 2 - 2);
    pickModes(a, 0);
    a.chooseTargetsFn = () => [ref(B)];
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    const theirs = named(game, "Treasure Token", B)[0];
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("Arctic Foxes can't be blocked by power 2 or more only while the defender has a snow land", () => {
    const { game, a } = table();
    const foxes = spawn(game, "Arctic Foxes");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    spawn(game, "Snow-Covered Island", B);
    const offer = blockOffer(game, a, [foxes]);
    expect(offer.eligible.find((e) => e.blocker === bears)?.canBlock ?? []).not.toContain(foxes);
    expect(offer.eligible.find((e) => e.blocker === elves)?.canBlock).toContain(foxes);

    const t2 = table();
    const foxes2 = spawn(t2.game, "Arctic Foxes");
    const bears2 = spawn(t2.game, "Grizzly Bears", B);
    const offer2 = blockOffer(t2.game, t2.a, [foxes2]);
    expect(offer2.eligible.find((e) => e.blocker === bears2)?.canBlock).toContain(foxes2);
  });

  it("Marjhan shrinks as it pings an attacker, and goes with its last Island", () => {
    const { game, a } = table();
    const marjhan = spawn(game, "Marjhan");
    const bears = spawn(game, "Grizzly Bears");
    const island = lands(game, "Island", 3)[0];
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    activate(game, marjhan, 1, { targets: [ref(bears)] });
    expect(pt(game, marjhan).power).toBe(7);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    const [, second, third] = named(game, "Island");
    destroy(game, island);
    destroy(game, second);
    expect(zone(game, marjhan)).toBe("battlefield");
    destroy(game, third);
    expect(zone(game, marjhan)).toBe("graveyard");
  });

  it("Spectral Force stays tapped unless the defender has a black permanent", () => {
    const { game, a } = table();
    const force = spawn(game, "Spectral Force");
    attack(game, a, [force]);
    nextTurn(game);
    toStep(game, "upkeep");
    expect(game.state.objects[force].tapped).toBe(true);

    const t2 = table();
    const force2 = spawn(t2.game, "Spectral Force");
    spawn(t2.game, "Vampire Nighthawk", B);
    attack(t2.game, t2.a, [force2]);
    nextTurn(t2.game);
    toStep(t2.game, "upkeep");
    expect(t2.game.state.objects[force2].tapped).toBe(false);
  });
});

describe("dealt damage by this creature", () => {
  it("Hawkeye draws only for a creature he damaged", () => {
    const { game } = table();
    const hawkeye = spawn(game, "Hawkeye, Avenging Archer");
    const hurt = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    activate(game, hawkeye, 0, { targets: [ref(hurt)] });
    const before = hand(game).length;
    destroy(game, other);
    expect(hand(game).length).toBe(before);
    destroy(game, hurt);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Wight makes a tapped Zombie and exiles the creature card", () => {
    const { game, a, b } = table();
    const wight = spawn(game, "Wight");
    game.state.objects[wight].tapped = false; // it enters tapped
    const bears = spawn(game, "Grizzly Bears", B);
    attackBlocked(game, a, b, wight, bears);
    expect(zone(game, bears)).toBe("exile");
    const zombie = named(game, "Zombie Token", A)[0];
    expect(game.state.objects[zombie].tapped).toBe(true);
  });

  it("Axelrod Gunnarson gains 1 and pings a player when his victim dies", () => {
    const { game, a, b } = table();
    const axelrod = spawn(game, "Axelrod Gunnarson");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(B)];
    attackBlocked(game, a, b, axelrod, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(21);
    expect(life(game, B)).toBe(20 - 3 - 1); // trample's 3 and the ping
  });

  it("Trophy Hunter grows only for a flier it damaged", () => {
    const { game } = table();
    const hunter = spawn(game, "Trophy Hunter");
    const bird = spawn(game, "Wind Drake", B);
    lands(game, "Forest", 2);
    activate(game, hunter, 0, { targets: [ref(bird)] });
    destroy(game, bird);
    expect(counters(game, hunter)).toBe(1);
  });

  it("Madame Vastra makes a Clue and a Food", () => {
    const { game, a, b } = table();
    const vastra = spawn(game, "Madame Vastra");
    const bears = spawn(game, "Grizzly Bears", B);
    attackBlocked(game, a, b, vastra, bears);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("cards in hand and on the battlefield", () => {
  it("Deathbringer Regent needs five others, and being cast from hand", () => {
    const { game } = table();
    const bears = [0, 1, 2, 3, 4].map(() => spawn(game, "Grizzly Bears", B));
    lands(game, "Swamp", 7);
    const regent = toHand(game, "Deathbringer Regent");
    cast(game, regent);
    expect(zone(game, regent)).toBe("battlefield");
    expect(bears.every((b) => zone(game, b) === "graveyard")).toBe(true);

    const t2 = table();
    const four = [0, 1, 2, 3].map(() => spawn(t2.game, "Grizzly Bears", B));
    lands(t2.game, "Swamp", 7);
    cast(t2.game, toHand(t2.game, "Deathbringer Regent"));
    expect(four.every((b) => zone(t2.game, b) === "battlefield")).toBe(true);

    const t3 = table();
    const five = [0, 1, 2, 3, 4].map(() => spawn(t3.game, "Grizzly Bears", B));
    enter(t3.game, "Deathbringer Regent");
    expect(five.every((b) => zone(t3.game, b) === "battlefield")).toBe(true);
  });

  it("Portcullis exiles the third creature, and returns it when it leaves", () => {
    const { game } = table();
    const portcullis = spawn(game, "Portcullis");
    enter(game, "Grizzly Bears", A);
    const second = enter(game, "Grizzly Bears", B);
    expect(zone(game, second)).toBe("battlefield"); // only one other
    const third = enter(game, "Hill Giant", B);
    expect(zone(game, third)).toBe("exile");
    destroy(game, portcullis);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });

  it("Portcullis does nothing to a creature gone by the time it resolves", () => {
    const { game } = table();
    spawn(game, "Portcullis");
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    const third = enter(game, "Hill Giant", B, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(third)]);
    settle(game);
    expect(graveyard(game, B)).toHaveLength(1); // still in the graveyard, not exiled
  });

  it("No Witnesses gives every tied player a Clue, then wipes the board", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "No Witnesses"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
    expect(tokensNamed(game, "Clue Token", C)).toBe(0);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
  });

  it("Fade from History gives a Bear to each player with an artifact or enchantment", () => {
    const { game } = table({ players: 3 });
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Fade from History"));
    expect(tokensNamed(game, "Bear Token", B)).toBe(1);
    expect(tokensNamed(game, "Bear Token", A)).toBe(0);
    expect(tokensNamed(game, "Bear Token", C)).toBe(0);
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("Tragic Arrogance: you choose what each player keeps", () => {
    const { game, a, b } = table();
    const big = spawn(game, "Hill Giant", B);
    const small = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    a.choosePermanentsFn = (_v, eligible) => (eligible.includes(small) ? [small] : eligible.slice(0, 1));
    b.choosePermanentsFn = () => {
      throw new Error("bob isn't asked");
    };
    cast(game, toHand(game, "Tragic Arrogance"));
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, small)).toBe("battlefield");
  });

  it("Master of Lake-town mills a life loser, and counts each big graveyard", () => {
    const { game } = table();
    const master = spawn(game, "The Master of Lake-town");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "each-opponent" }, []);
    settle(game);
    expect(graveyard(game, B)).toHaveLength(3);
    for (let i = 0; i < 4; i++) toGraveyard(game, "Wastes", B);
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes", A); // the Master makes it seven
    const before = hand(game).length;
    destroy(game, master);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("life totals", () => {
  it("Angel of Destiny: you and that player each gain it, and only those it attacked lose", () => {
    const { game, a } = table({ players: 3 });
    const angel = spawn(game, "Angel of Destiny");
    game.state.players[A].life = 40;
    attack(game, a, [angel]);
    // Double strike: 2 + 2 to bob, 2 + 2 gained by each.
    expect(life(game, B)).toBe(20 - 4 + 4);
    expect(life(game)).toBe(44);
    toStep(game, "end");
    settle(game);
    expect(game.state.players[B].hasLost).toBe(true);
    expect(game.state.players[C].hasLost ?? false).toBe(false);
    expect(game.state.players[A].hasLost ?? false).toBe(false);
  });

  it("Angel of Destiny leaving in response still reads who it attacked", () => {
    const { game, a } = table({ players: 3 });
    const angel = spawn(game, "Angel of Destiny");
    game.state.players[A].life = 40;
    attack(game, a, [angel]);
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length > 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(angel)]);
    settle(game);
    expect(zone(game, angel)).toBe("graveyard");
    expect(game.state.players[B].hasLost).toBe(true);
    expect(game.state.players[C].hasLost ?? false).toBe(false);
  });

  it("Angel of Destiny asks for 15 more than the starting life total", () => {
    const { game, a } = table();
    const angel = spawn(game, "Angel of Destiny");
    game.state.players[A].life = 30;
    attack(game, a, [angel]);
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(34); // 34 is short of 35
    expect(game.state.players[B].hasLost ?? false).toBe(false);
  });

  it("Cosmos Elixir draws above starting life, else gains 2", () => {
    const { game } = table();
    spawn(game, "Cosmos Elixir");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(22);
    expect(hand(game).length).toBe(before);
    nextTurn(game);
    toStep(game, "precombat-main");
    const held = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(22);
    expect(hand(game).length).toBe(held + 1);
  });

  it("Razor Pendulum burns only a player at 5 or less, at their own end step", () => {
    const { game } = table();
    spawn(game, "Razor Pendulum");
    game.state.players[A].life = 5;
    game.state.players[B].life = 4;
    toStep(game, "end");
    settle(game);
    expect(life(game)).toBe(3);
    expect(life(game, B)).toBe(4);
  });

  it("Lolth's emblem tops an opponent's loss up to 8, once", () => {
    const { game, a } = table();
    const lolth = spawn(game, "Lolth, Spider Queen");
    const giant = spawn(game, "Hill Giant");
    loyalty(game, lolth, -8, { atLeast: 8 });
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(12);
  });

  it("Lolth gets a loyalty counter as a creature you control dies", () => {
    const { game } = table();
    const lolth = spawn(game, "Lolth, Spider Queen");
    const bears = spawn(game, "Grizzly Bears");
    const before = counters(game, lolth, "loyalty");
    destroy(game, bears);
    expect(counters(game, lolth, "loyalty")).toBe(before + 1);
  });
});

describe("hand sizes", () => {
  it("Akuta returns from the graveyard for a Swamp, with the bigger hand", () => {
    const { game, a } = table({ openingHandSize: 0 });
    toGraveyard(game, "Akuta, Born of Ash");
    const swamp = spawn(game, "Swamp");
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    pickModes(a, 0);
    a.chooseSacrificesFn = (_v, eligible) => eligible.slice(0, 1);
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, swamp)).toBe("graveyard");
    expect(named(game, "Akuta, Born of Ash")).toHaveLength(1);
  });

  it("Death of a Thousand Stings returns only with more cards than each opponent", () => {
    const { game, a } = table({ players: 3, openingHandSize: 0 });
    const stings = toGraveyard(game, "Death of a Thousand Stings");
    pickModes(a, 0);
    // Alice holds her draw from turn 1; bob and carol draw one each by then.
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, stings)).toBe("graveyard"); // tied isn't more

    const t2 = table({ openingHandSize: 0 });
    const again = toGraveyard(t2.game, "Death of a Thousand Stings");
    toHand(t2.game, "Wastes");
    toHand(t2.game, "Wastes");
    pickModes(t2.a, 0);
    toStep(t2.game, "upkeep");
    settle(t2.game);
    expect(zone(t2.game, again)).toBe("hand");
  });

  it("Kitsune Bonesetter activates only with more cards than each opponent", () => {
    const { game } = table({ openingHandSize: 0 });
    const kitsune = spawn(game, "Kitsune Bonesetter");
    const bears = spawn(game, "Grizzly Bears");
    toHand(game, "Wastes", B); // one each
    expect(() => activate(game, kitsune, 0, { targets: [ref(bears)] })).toThrow();
    toHand(game, "Wastes");
    activate(game, kitsune, 0, { targets: [ref(bears)] });
    expect(game.state.objects[kitsune].tapped).toBe(true);
  });

  it("Joined Researchers becomes prepared at any end step an opponent has more cards", () => {
    const { game } = table({ openingHandSize: 0 });
    const researchers = spawn(game, "Joined Researchers");
    toHand(game, "Wastes", B);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[researchers].prepared).toBeUndefined(); // one each
    toHand(game, "Wastes", B);
    nextTurn(game, "end");
    settle(game);
    expect(game.state.objects[researchers].prepared).toBeDefined();
  });

  it("Teachings of the Archaics draws two, or three at four more", () => {
    const run = (theirs: number): number => {
      const { game } = table({ openingHandSize: 0 });
      lands(game, "Island", 3);
      for (let i = 0; i < theirs; i++) toHand(game, "Wastes", B);
      const before = hand(game).length;
      cast(game, toHand(game, "Teachings of the Archaics"));
      return hand(game).length - before;
    };
    expect(run(1)).toBe(0); // tied with alice's one
    expect(run(2)).toBe(2);
    expect(run(4)).toBe(2); // three more
    expect(run(5)).toBe(3); // four more
  });

  it("Nezumi Graverobber flips only as the graveyard empties", () => {
    const { game } = table();
    const rat = spawn(game, "Nezumi Graverobber");
    const first = toGraveyard(game, "Wastes", B);
    const second = toGraveyard(game, "Wastes", B);
    lands(game, "Swamp", 4);
    activate(game, rat, 0, { targets: [ref(first)] });
    expect(pt(game, rat).power).toBe(2);
    activate(game, rat, 0, { targets: [ref(second)] });
    expect(pt(game, rat).power).toBe(4);
  });

  it("Nezumi Shortfang flips when its target's hand empties, and Stabwhisker then bleeds them", () => {
    const { game } = table({ openingHandSize: 0 });
    const rat = spawn(game, "Nezumi Shortfang");
    toHand(game, "Wastes", B);
    lands(game, "Swamp", 2);
    activate(game, rat, 0, { targets: [ref(B)] });
    expect(pt(game, rat).power).toBe(3);
    toHand(game, "Wastes", B);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(18); // one card: two fewer than three
  });

  it("Shrieking Affliction and Misers' Cage read the active opponent's hand", () => {
    const { game } = table({ openingHandSize: 0 });
    spawn(game, "Shrieking Affliction");
    spawn(game, "Misers' Cage");
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(17);
    const t2 = table({ openingHandSize: 0 });
    spawn(t2.game, "Misers' Cage");
    for (let i = 0; i < 5; i++) toHand(t2.game, "Wastes", B);
    nextTurn(t2.game, "upkeep");
    settle(t2.game);
    expect(life(t2.game, B)).toBe(18);
  });

  it("Davriel burns a low-handed opponent, and its minus makes a player discard", () => {
    const { game } = table({ openingHandSize: 0 });
    const davriel = spawn(game, "Davriel, Rogue Shadowmage");
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    loyalty(game, davriel, -1, { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(1);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("Prickle Faeries, the transformed Siege, burns at two cards or fewer", () => {
    const { game, a } = table({ openingHandSize: 0 });
    a.chooseTargetsFn = () => [ref(B)];
    const invasion = enter(game, "Invasion of Eldraine");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(invasion)]);
    settle(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("Ghirapur Orrery draws three for an empty hand", () => {
    const { game } = table({ openingHandSize: 0 });
    spawn(game, "Ghirapur Orrery");
    nextTurn(game, "upkeep");
    settle(game);
    expect(hand(game, B)).toHaveLength(3);
  });

  it("Invasion of Eldraine discards two", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => [ref(B)];
    const before = hand(game, B).length;
    enter(game, "Invasion of Eldraine");
    expect(hand(game, B)).toHaveLength(before - 2);
  });

  it("Borrowed Knowledge's two modes", () => {
    const { game } = table({ openingHandSize: 0 });
    for (let i = 0; i < 3; i++) toHand(game, "Wastes", B);
    lands(game, "Plains", 2);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Borrowed Knowledge"), { modes: [0], targets: [ref(B)] });
    expect(hand(game)).toHaveLength(3);

    const t2 = table({ openingHandSize: 0 });
    toHand(t2.game, "Wastes");
    toHand(t2.game, "Wastes");
    lands(t2.game, "Plains", 2);
    lands(t2.game, "Mountain", 2);
    const held = hand(t2.game).length;
    cast(t2.game, toHand(t2.game, "Borrowed Knowledge"), { modes: [1] });
    expect(hand(t2.game)).toHaveLength(held);
  });

  it("Recurring Insight draws what the target holds, and rebounds", () => {
    const { game } = table({ openingHandSize: 0 });
    for (let i = 0; i < 4; i++) toHand(game, "Wastes", B);
    lands(game, "Island", 6);
    const before = hand(game).length;
    const insight = toHand(game, "Recurring Insight");
    cast(game, insight, { targets: [ref(B)] });
    expect(hand(game)).toHaveLength(before + 4);
    expect(zone(game, insight)).toBe("exile");
  });

  it("Pact of the Serpent counts the target's creatures of the chosen type", () => {
    const { game, a } = table({ openingHandSize: 0 });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    lands(game, "Swamp", 3);
    a.chooseCreatureTypeFn = () => "Bear";
    cast(game, toHand(game, "Pact of the Serpent"), { targets: [ref(B)] });
    expect(hand(game, B)).toHaveLength(2);
    expect(life(game, B)).toBe(18);
    expect(life(game)).toBe(20);
  });

  it("Sudden Insight counts different mana values among nonland cards", () => {
    const { game } = table({ openingHandSize: 0 });
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Shivan Dragon", B);
    lands(game, "Island", 6);
    const before = hand(game).length;
    cast(game, toHand(game, "Sudden Insight"));
    expect(hand(game)).toHaveLength(before + 2);
  });

  it("Spoils of Evil adds {C} and gains 1 for each artifact or creature card", () => {
    const { game } = table({ openingHandSize: 0 });
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Sol Ring", B);
    toGraveyard(game, "Wastes", B);
    toGraveyard(game, "Grizzly Bears", A);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Spoils of Evil"), { targets: [ref(B)] });
    expect(life(game)).toBe(22);
    expect(game.state.players[A].manaPool).toHaveLength(2);
  });
});

describe("choices as it resolves", () => {
  it("Skrelv: can't be blocked by the chosen color, and toxic", () => {
    const { game, a, b } = table();
    const skrelv = spawn(game, "Skrelv, Defector Mite");
    const bears = spawn(game, "Grizzly Bears");
    const green = spawn(game, "Grizzly Bears", B);
    const white = spawn(game, "Savannah Lions", B);
    lands(game, "Plains", 1);
    a.chooseCreatureTypeFn = (_v, _s, options) => options.find((o) => /green|^G$/i.test(o)) ?? options[0];
    activate(game, skrelv, 0, { targets: [ref(bears)] });
    expect(game.state.objects[skrelv].tapped).toBe(true);
    const offer = blockOffer(game, a, [bears]);
    expect(offer.eligible.find((e) => e.blocker === green)?.canBlock ?? []).not.toContain(bears);
    expect(offer.eligible.find((e) => e.blocker === white)?.canBlock).toContain(bears);
    b.declareBlockersFn = () => [];
    toStep(game, "postcombat-main");
    expect(game.state.players[B].counters?.poison ?? 0).toBe(1);
  });

  it("Skrelv's hexproof is from the chosen color only", () => {
    const { game, a } = table();
    const skrelv = spawn(game, "Skrelv, Defector Mite");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1, B);
    lands(game, "Swamp", 1, B);
    const shock = toHand(game, "Shock", B);
    const fatal = toHand(game, "Disfigure", B);
    a.chooseCreatureTypeFn = (_v, _s, options) => options.find((o) => /red|^R$/i.test(o)) ?? options[0];
    activate(game, skrelv, 0, { targets: [ref(bears)] });
    game.advanceUntil((s) => s.priority.holder === B);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: shock, targets: [ref(bears)] })).not.toBeNull();
    expect(game.canDispatch({ type: "cast-spell", player: B, card: fatal, targets: [ref(bears)] })).toBeNull();
  });

  it("Clockspinning adds or removes a counter of the chosen kind", () => {
    const { game, a } = table();
    const walker = spawn(game, "Lolth, Spider Queen");
    lands(game, "Island", 2);
    const loyaltyBefore = counters(game, walker, "loyalty");
    pickModes(a, 1);
    cast(game, toHand(game, "Clockspinning"), { targets: [ref(walker)] });
    expect(counters(game, walker, "loyalty")).toBe(loyaltyBefore + 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Clockspinning"), { targets: [ref(walker)] });
    expect(counters(game, walker, "loyalty")).toBe(loyaltyBefore);
  });

  it("Clockspinning reaches a suspended card", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const rift = toHand(game, "Rift Bolt");
    lands(game, "Mountain", 1);
    game.dispatch({ type: "suspend", player: A, card: rift } as never);
    settle(game);
    expect(zone(game, rift)).toBe("exile");
    expect(counters(game, rift, "time")).toBe(1);
    pickModes(a, 1);
    cast(game, toHand(game, "Clockspinning"), { targets: [ref(rift)] });
    expect(counters(game, rift, "time")).toBe(2);
  });

  it("The Caves of Androzani's chapter II offers each non-Saga permanent's counter", () => {
    const { game, a } = table();
    const walker = spawn(game, "Lolth, Spider Queen");
    const bearsTheirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[bearsTheirs].counters["+1/+1"] = 2;
    const plain = spawn(game, "Grizzly Bears");
    const before = counters(game, walker, "loyalty");
    enter(game, "The Caves of Androzani");
    pickModes(a, 0);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, bearsTheirs)).toBe(3);
    expect(counters(game, plain)).toBe(0);
    expect(counters(game, walker, "loyalty")).toBe(before + 1);
  });

  it("Calix copies a nonlegendary enchantment once a turn", () => {
    const { game, a } = table();
    const calix = spawn(game, "Calix, Guided by Fate");
    spawn(game, "Glorious Anthem");
    pickModes(a, 0);
    pickPermanents(a, ...named(game, "Glorious Anthem"));
    attack(game, a, [calix]);
    expect(named(game, "Glorious Anthem", A)).toHaveLength(2);
  });

  it("Calix fires for an enchanted creature you control, not a bare one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Calix, Guided by Fate");
    spawn(game, "Glorious Anthem");
    pickModes(a, 0);
    pickPermanents(a, ...named(game, "Glorious Anthem"));
    attack(game, a, [bears]);
    expect(named(game, "Glorious Anthem", A)).toHaveLength(1);
  });

  it("Guard Dogs prevents only if the colors match", () => {
    const run = (target: string, chooseTarget: boolean): number => {
      const { game, a } = table();
      const dogs = spawn(game, "Guard Dogs");
      const plains = lands(game, "Plains", 3);
      const attacker = spawn(game, target);
      pickPermanents(a, chooseTarget ? attacker : dogs);
      activate(game, dogs, 0, { targets: [ref(attacker)] });
      expect(game.state.objects[plains[0]].tapped).toBe(true);
      attack(game, a, [attacker]);
      return life(game, B);
    };
    expect(run("Grizzly Bears", true)).toBe(20); // shares green with itself
    expect(run("Grizzly Bears", false)).toBe(18); // white and green share nothing
    expect(run("Savannah Lions", false)).toBe(20); // white with the white Dogs
    expect(run("Steel Overseer", true)).toBe(19); // colorless shares no color, even with itself
  });

  it("Mist of Stagnation: nothing untaps but what each player chooses", () => {
    const { game, a } = table();
    spawn(game, "Mist of Stagnation");
    const tappedOne = spawn(game, "Grizzly Bears", A, { tapped: true });
    const tappedTwo = spawn(game, "Grizzly Bears", A, { tapped: true });
    toGraveyard(game, "Wastes");
    const seen = pickPermanents(a, tappedOne);
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(seen.offered.length).toBeGreaterThan(1);
    expect(game.state.objects[tappedOne].tapped).toBe(false);
    expect(game.state.objects[tappedTwo].tapped).toBe(true);
  });

  it("Silumgar's Scorn: unless {1}, or outright with a Dragon", () => {
    const withDragon = table();
    spawn(withDragon.game, "Shivan Dragon");
    lands(withDragon.game, "Forest", 3); // {1} for the bears' controller to pay with
    lands(withDragon.game, "Island", 2);
    const bears = toHand(withDragon.game, "Grizzly Bears");
    cast(withDragon.game, bears, { settle: false });
    pickModes(withDragon.a, 0);
    cast(withDragon.game, toHand(withDragon.game, "Silumgar's Scorn"), { targets: [ref(bears)] });
    expect(zone(withDragon.game, bears)).toBe("graveyard");

    const noDragon = table();
    lands(noDragon.game, "Forest", 3);
    lands(noDragon.game, "Island", 2);
    const bears2 = toHand(noDragon.game, "Grizzly Bears");
    cast(noDragon.game, bears2, { settle: false });
    pickModes(noDragon.a, 0);
    cast(noDragon.game, toHand(noDragon.game, "Silumgar's Scorn"), { targets: [ref(bears2)] });
    expect(zone(noDragon.game, bears2)).toBe("battlefield");
  });

  it("Eris costs {2} less per different mana value, and makes a Dragon on the second spell", () => {
    const { game } = table({ openingHandSize: 0 });
    toGraveyard(game, "Shock");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    lands(game, "Island", 3);
    lands(game, "Mountain", 3);
    const eris = toHand(game, "Eris, Roar of the Storm");
    cast(game, eris);
    expect(zone(game, eris)).toBe("battlefield"); // {8}{U}{R} less {2} twice: Shock and Bolt share 1
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Dragon Elemental Token", A)).toBe(1);
    expect(pt(game, eris).power).toBe(5);
    expect(keywords(game, eris).has("flying")).toBe(true);
  });

  it("Selvala adds one mana for each different power", () => {
    const { game } = table();
    const selvala = spawn(game, "Selvala, Eager Trailblazer");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    spawn(game, "Hill Giant");
    activate(game, selvala);
    const pool = game.state.players[A].manaPool;
    expect(pool).toHaveLength(3); // powers 4, 2 and 3
    expect(new Set(pool.map((u) => u.type)).size).toBe(1);
  });
});
