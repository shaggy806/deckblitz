/**
 * Card batch 69, part b (2026-10-12): ranks 6950–6991. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Marching Duodrone", () => {
  it("has every player create a Treasure when it attacks", () => {
    const { game, a } = table({ players: 3 });
    const drone = spawn(game, "Marching Duodrone");
    attack(game, a, [drone]);
    expect([tokensNamed(game, "Treasure Token", A), tokensNamed(game, "Treasure Token", B), tokensNamed(game, "Treasure Token", C)]).toEqual([1, 1, 1]);
  });
});

describe("Justiciar's Portal", () => {
  it("gives first strike to the card that came back, a new object without its counters, and nothing else", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    const other = spawn(game, "Memnite");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Justiciar's Portal"), { targets: [ref(bears)] });
    const [back] = named(game, "Grizzly Bears", A);
    expect(zone(game, back)).toBe("battlefield");
    expect(counters(game, back)).toBe(0);
    expect(keywords(game, back).has("first-strike")).toBe(true);
    expect(keywords(game, other).has("first-strike")).toBe(false);
  });

  it("gives nothing first strike when the creature was a token, which doesn't come back", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Zombie Token", count: 1 });
    settle(game);
    const [zombie] = named(game, "Zombie Token", A);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Justiciar's Portal"), { targets: [ref(zombie)] });
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });
});

describe("Geralf, the Fleshwright", () => {
  it("makes a Zombie Rogue for each spell after your first this turn, counting spells cast before it arrived", () => {
    const { game } = table();
    cast(game, toHand(game, "Memnite"));
    spawn(game, "Geralf, the Fleshwright");
    cast(game, toHand(game, "Memnite"));
    expect(tokensNamed(game, "Zombie Rogue Token", A)).toBe(1);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Zombie Rogue Token", A)).toBe(2);
  });

  it("doesn't trigger on your first spell of the turn", () => {
    const { game } = table();
    spawn(game, "Geralf, the Fleshwright");
    cast(game, toHand(game, "Memnite"));
    expect(tokensNamed(game, "Zombie Rogue Token", A)).toBe(0);
  });

  it("counts every other Zombie that entered under your control this turn, the ones entering alongside included", () => {
    const { game } = table();
    spawn(game, "Geralf, the Fleshwright");
    const first = enter(game, "Gravecrawler");
    expect(counters(game, first)).toBe(0);
    const second = enter(game, "Gravecrawler");
    expect(counters(game, second)).toBe(1);
    // Two together: each sees both Gravecrawlers and the other token.
    game.debugApplyEffect(A, { kind: "create-token", token: "Zombie Token", count: 2, separate: true });
    settle(game);
    const tokens = named(game, "Zombie Token", A);
    expect(tokens.map((t) => counters(game, t))).toEqual([3, 3]);
    // An opponent's Zombie isn't counted.
    enter(game, "Gravecrawler", B);
    const third = enter(game, "Gravecrawler");
    expect(counters(game, third)).toBe(4);
  });
});

describe("Abundant Harvest", () => {
  it("reveals until a card of the chosen kind and puts the rest on the bottom", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    lands(game, "Forest", 1);
    pickModes(a, 1);
    cast(game, toHand(game, "Abundant Harvest"));
    expect(zone(game, bears)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(forest)).toBe(library.length - 1);
  });

  it("or a land", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Abundant Harvest"));
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Oath of Nissa", () => {
  it("lets you spend mana as though it were any color on planeswalker spells only", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const ajani = toHand(game, "Ajani Resolute");
    expect(() => cast(game, ajani)).toThrow();
    spawn(game, "Oath of Nissa");
    expect(() => cast(game, toHand(game, "Opt"))).toThrow();
    cast(game, ajani);
    expect(zone(game, ajani)).toBe("battlefield");
  });
});

describe("Scrap Mastery", () => {
  it("swaps each player's artifacts on the battlefield for the ones in their graveyard", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    const stone = toGraveyard(game, "Mind Stone");
    const relic = toGraveyard(game, "Darksteel Relic", B);
    const bobStone = spawn(game, "Mind Stone", B);
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Scrap Mastery"));
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, stone)).toBe("battlefield");
    expect(zone(game, relic)).toBe("battlefield");
    expect(controller(game, relic)).toBe(B);
    expect(zone(game, bobStone)).toBe("graveyard");
  });
});

describe("Taborax, Hope's Demise", () => {
  it("grows on a nontoken death, and for a Cleric offers a draw that costs 1 life", () => {
    const { game, a } = table();
    const taborax = spawn(game, "Taborax, Hope's Demise");
    const priest = spawn(game, "Abzan Battle Priest");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(counters(game, taborax)).toBe(1);
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20);

    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(priest)]);
    settle(game);
    expect(counters(game, taborax)).toBe(2);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
  });

  it("has lifelink only with five or more +1/+1 counters", () => {
    const { game } = table();
    const taborax = spawn(game, "Taborax, Hope's Demise");
    game.state.objects[taborax].counters["+1/+1"] = 4;
    expect(keywords(game, taborax).has("lifelink")).toBe(false);
    game.state.objects[taborax].counters["+1/+1"] = 5;
    expect(keywords(game, taborax).has("lifelink")).toBe(true);
  });
});

describe("Zoanthrope", () => {
  it("enters with X counters and deals X damage to any target", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    pickTargets(a, B);
    const zo = toHand(game, "Zoanthrope");
    cast(game, zo, { x: 2 });
    expect(counters(game, zo)).toBe(2);
    expect(life(game, B)).toBe(18);
  });
});

describe("Tomik, Wielder of Law", () => {
  it("drains the attacking opponent 3 and draws when two or more creatures attack you", () => {
    const { game, b } = table();
    spawn(game, "Tomik, Wielder of Law");
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    nextTurn(game);
    const before = hand(game).length;
    attack(game, b, bears, A);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before + 1);
  });

  it("does nothing for one attacker", () => {
    const { game, b } = table();
    spawn(game, "Tomik, Wielder of Law");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    const before = hand(game).length;
    attack(game, b, [bears], A);
    expect(life(game, B)).toBe(20);
    expect(hand(game).length).toBe(before);
  });
});

describe("Frogtosser Banneret", () => {
  it("takes {1} off a Goblin Rogue spell once, and nothing off other spells", () => {
    const { game } = table();
    spawn(game, "Frogtosser Banneret");
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Arms Dealer"))).toThrow();
    lands(game, "Mountain", 1);
    const dealer = toHand(game, "Arms Dealer");
    cast(game, dealer);
    expect(zone(game, dealer)).toBe("battlefield");
    lands(game, "Forest", 1);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
  });
});

describe("Paradoxical Outcome", () => {
  it("draws only for the cards returned to your own hand", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const stone = spawn(game, "Mind Stone");
    const memnite = spawn(game, "Memnite", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(memnite)]);
    expect(controller(game, memnite)).toBe(A);
    lands(game, "Island", 4);
    const outcome = toHand(game, "Paradoxical Outcome");
    const before = hand(game).length;
    cast(game, outcome, { targets: [ref(bears), ref(stone), ref(memnite)] });
    expect(zone(game, memnite)).toBe("hand");
    expect(hand(game, B)).toContain(memnite);
    // Outcome left the hand; the two returned cards and two draws came in.
    expect(hand(game).length).toBe(before - 1 + 2 + 2);
  });
});

describe("By Force", () => {
  it("destroys exactly X target artifacts", () => {
    const { game } = table();
    const rings = [spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B)];
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "By Force"), { x: 2, targets: rings.map(ref) });
    expect(rings.map((r) => zone(game, r))).toEqual(["graveyard", "graveyard"]);
  });

  it("can't be cast with fewer targets than X", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 3);
    expect(() => cast(game, toHand(game, "By Force"), { x: 2, targets: [ref(ring)] })).toThrow();
  });
});

describe("Bazaar Trader", () => {
  it("gives target player control of a permanent you control for good", () => {
    const { game } = table();
    const trader = spawn(game, "Bazaar Trader");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, trader, 0, { targets: [ref(B), ref(bears)] });
    expect(controller(game, bears)).toBe(B);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Duke Ulder Ravengard", () => {
  it("gives another creature haste and myriad at the beginning of combat", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Duke Ulder Ravengard");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, bears).has("haste")).toBe(true);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
  });
});

describe("Sigarda's Summons", () => {
  it("makes your creatures with +1/+1 counters 4/4 flying Angels before the counters", () => {
    const { game } = table();
    spawn(game, "Sigarda's Summons");
    const bears = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 1;
    game.state.objects[theirs].counters["+1/+1"] = 1;
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Angel"]));
    expect(pt(game, plain)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Clout of the Dominus", () => {
  it("gives a blue creature +1/+1 and shroud and a red one +1/+1 and haste", () => {
    const { game } = table();
    const crab = spawn(game, "Ancient Crab");
    const goblin = spawn(game, "Arms Dealer");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Clout of the Dominus"), { targets: [ref(goblin)] });
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, goblin).has("haste")).toBe(true);
    expect(keywords(game, goblin).has("shroud")).toBe(false);
    cast(game, toHand(game, "Clout of the Dominus"), { targets: [ref(crab)] });
    expect(keywords(game, crab).has("shroud")).toBe(true);
    expect(keywords(game, crab).has("haste")).toBe(false);
    expect(graveyard(game).length).toBe(0);
  });
});
