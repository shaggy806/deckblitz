/**
 * Set walk batch 89, part f (2026-10-16): the plot and crime cards of Outlaws of Thunder Junction (OTJ), its Commander decks (OTC) and The Big Score (BIG).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

/** Lightning Bolt at `target` — at an opponent, a crime (rule 700.13). */
const bolt = (game: Game, target: PlayerId | ObjectId, player: PlayerId = A): void => {
  lands(game, "Mountain", 1, player);
  cast(game, toHand(game, "Lightning Bolt", player), { player, targets: [ref(target)] });
};

const crimes = (game: Game, player: PlayerId = A): number => game.state.players[player].crimesThisTurn ?? 0;

const plot = (game: Game, card: ObjectId, player: PlayerId = A): void => {
  const why = game.canDispatch({ type: "plot", player, card });
  if (why !== null) throw new Error(why);
  game.dispatch({ type: "plot", player, card });
};

const plotOffer = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).find((a) => a.kind === "plot" && a.card === card);

/** Back to alice's next main phase. */
const aliceAgain = (game: Game): void => {
  nextTurn(game);
  nextTurn(game);
};

describe("At Knifepoint", () => {
  it("gives outlaws you control first strike during your turn only", () => {
    const { game } = table();
    spawn(game, "At Knifepoint");
    const rogue = spawn(game, "Blood Hustler");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Blood Hustler", B);
    expect(keywords(game, rogue).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(keywords(game, theirs).has("first-strike")).toBe(false);
    nextTurn(game);
    expect(keywords(game, rogue).has("first-strike")).toBe(false);
  });

  it("makes one Mercenary token for a crime, only once each turn", () => {
    const { game } = table();
    spawn(game, "At Knifepoint");
    bolt(game, A);
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(0);
    bolt(game, B);
    bolt(game, B);
    expect(crimes(game)).toBe(2);
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
    aliceAgain(game);
    bolt(game, B);
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(2);
  });
});

describe("Beastbond Outcaster", () => {
  it("draws only if you control a creature with power 4 or greater; plot {1}{G}", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    expect(plotOffer(game, toHand(game, "Beastbond Outcaster"))).toMatchObject({ cost: "{1}{G}" });
    const before = hand(game).length;
    enter(game, "Beastbond Outcaster");
    expect(hand(game).length).toBe(before);
    spawn(game, "Craw Wurm");
    enter(game, "Beastbond Outcaster");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Blacksnag Buzzard", () => {
  it("enters with a +1/+1 counter only if a creature died this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const first = toHand(game, "Blacksnag Buzzard");
    cast(game, first);
    expect(pt(game, first)).toEqual({ power: 2, toughness: 1 });
    destroy(game, spawn(game, "Grizzly Bears", B));
    const second = toHand(game, "Blacksnag Buzzard");
    cast(game, second);
    expect(pt(game, second)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, second).has("flying")).toBe(true);
  });
});

describe("Brimstone Roundup", () => {
  it("counts itself as the first spell; only the second spell makes a Mercenary", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Brimstone Roundup"));
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(0);
    bolt(game, B);
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
    bolt(game, B);
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
  });
});

describe("Cunning Coyote", () => {
  it("pumps and hastes another creature you control, not itself", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    lands(game, "Mountain", 2);
    const coyote = toHand(game, "Cunning Coyote");
    cast(game, coyote);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(pt(game, coyote)).toEqual({ power: 2, toughness: 2 });
    aliceAgain(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Dust Animus", () => {
  it("enters with two +1/+1 counters and a lifelink counter with five untapped lands left", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    const animus = toHand(game, "Dust Animus");
    cast(game, animus); // two tapped to pay, five untapped
    expect(counters(game, animus)).toBe(2);
    expect(counters(game, animus, "lifelink")).toBe(1);
    expect(keywords(game, animus).has("lifelink")).toBe(true);
    expect(pt(game, animus)).toEqual({ power: 4, toughness: 5 });
  });

  it("enters with nothing with only four untapped lands", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    spawn(game, "Plains", A, { tapped: true });
    const animus = toHand(game, "Dust Animus");
    cast(game, animus);
    expect(counters(game, animus)).toBe(0);
    expect(counters(game, animus, "lifelink")).toBe(0);
    expect(pt(game, animus)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Freestrider Commando", () => {
  it("gets no counters when cast for mana", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const commando = toHand(game, "Freestrider Commando");
    cast(game, commando);
    expect(counters(game, commando)).toBe(0);
  });

  it("gets two counters when cast from plot without paying mana", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const commando = toHand(game, "Freestrider Commando");
    plot(game, commando);
    aliceAgain(game);
    cast(game, commando, { via: "plot", free: true });
    expect(zone(game, commando)).toBe("battlefield");
    expect(counters(game, commando)).toBe(2);
  });

  it("gets two counters when put onto the battlefield without being cast", () => {
    const { game } = table();
    const commando = enter(game, "Freestrider Commando");
    expect(counters(game, commando)).toBe(2);
  });
});

describe("Intimidation Campaign", () => {
  it("drains each opponent for 1 and draws on entering", () => {
    const { game } = table({ players: 3 });
    const before = hand(game).length;
    enter(game, "Intimidation Campaign");
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(21);
    expect(hand(game).length).toBe(before + 1);
  });

  it("may return to its owner's hand when you commit a crime", () => {
    const { game, a } = table();
    const campaign = spawn(game, "Intimidation Campaign");
    pickModes(a); // decline
    bolt(game, B);
    expect(zone(game, campaign)).toBe("battlefield");
    pickModes(a, 0);
    bolt(game, B);
    expect(zone(game, campaign)).toBe("hand");
  });
});

describe("Irascible Wolverine", () => {
  it("exiles the top card, playable until end of turn only", () => {
    const { game } = table();
    const top = toLibrary(game, "Lightning Bolt");
    enter(game, "Irascible Wolverine");
    expect(zone(game, top)).toBe("exile");
    lands(game, "Mountain", 1);
    const castable = (): boolean =>
      game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === top);
    expect(castable()).toBe(true);
    aliceAgain(game);
    expect(castable()).toBe(false);
  });
});

describe("Loan Shark", () => {
  it("draws only if it's at least your second spell this turn", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const before = hand(game).length;
    cast(game, toHand(game, "Loan Shark"));
    expect(hand(game).length).toBe(before);
    cast(game, toHand(game, "Loan Shark"));
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Nimble Brigand", () => {
  it("can be blocked until you commit a crime", () => {
    const { game, a } = table();
    const brigand = spawn(game, "Nimble Brigand");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const offer = blockOffer(game, a, [brigand, bears]);
    expect(offer.eligible.find((e) => e.blocker === wall)?.canBlock ?? []).toContain(brigand);
  });

  it("can't be blocked once you've committed a crime, and draws on combat damage", () => {
    const { game, a } = table();
    const brigand = spawn(game, "Nimble Brigand");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    bolt(game, B);
    const offer = blockOffer(game, a, [brigand, bears]);
    const canBlock = offer.eligible.find((e) => e.blocker === wall)?.canBlock ?? [];
    expect(canBlock).not.toContain(brigand);
    expect(canBlock).toContain(bears);
  });

  it("draws a card when it deals combat damage to a player", () => {
    const { game, a } = table();
    const brigand = spawn(game, "Nimble Brigand");
    const before = hand(game).length;
    attack(game, a, [brigand]);
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Omenport Vigilante", () => {
  it("has double strike only once you've committed a crime this turn", () => {
    const { game } = table();
    const vigilante = spawn(game, "Omenport Vigilante");
    bolt(game, A);
    expect(keywords(game, vigilante).has("double-strike")).toBe(false);
    bolt(game, B);
    expect(keywords(game, vigilante).has("double-strike")).toBe(true);
    aliceAgain(game);
    expect(keywords(game, vigilante).has("double-strike")).toBe(false);
  });
});

describe("Outlaw Stitcher", () => {
  it("makes a plain 2/2 Zombie Rogue as the first spell of the turn", () => {
    const { game } = table();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Outlaw Stitcher"));
    const [token] = named(game, "Zombie Rogue Token", A);
    expect(counters(game, token)).toBe(0);
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
  });

  it("puts two counters on it for each spell this turn other than the first, itself included", () => {
    const { game } = table();
    bolt(game, B);
    bolt(game, B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Outlaw Stitcher"));
    const [token] = named(game, "Zombie Rogue Token", A);
    expect(counters(game, token)).toBe(4);
    expect(pt(game, token)).toEqual({ power: 6, toughness: 6 });
  });
});
