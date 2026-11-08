/**
 * B278 (need-key themes, step 4): the generic `{ on: "event" }` trigger
 * (trigger-events.ts), the timing wrapper on every trigger, and the flagged
 * cards that prove them — the connive cards (Glorious Purpose; Ultron,
 * Unlimited; Iron Monger, Sadistic Tycoon; Leader, Super-Genius), Elrond,
 * Moon-Reader, Way of the Mind Sculptor and Tamiyo, Upriser Crowned.
 */

import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { appendJournal } from "../journal.js";
import {
  A,
  B,
  attack,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  loyalty,
  named,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** `id` connives, by an effect of `A`'s. */
function connive(game: Game, id: ObjectId): void {
  game.debugApplyEffect(A, { kind: "connive", target: 0 }, [ref(id)]);
  settle(game);
}

describe("connive triggers", () => {
  it("Iron Monger: a creature you control conniving puts a counter on each Villain you control", () => {
    const { game, a } = table();
    enter(game, "Iron Monger, Sadistic Tycoon");
    const bears = spawn(game, "Grizzly Bears");
    const villain = spawn(game, "Baron Strucker, HYDRA Overlord");
    const theirs = spawn(game, "Baron Strucker, HYDRA Overlord", B);
    const giant = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giant];
    connive(game, bears);
    expect(counters(game, bears)).toBe(1); // the connive's own counter
    expect(counters(game, villain)).toBe(1);
    expect(counters(game, named(game, "Iron Monger, Sadistic Tycoon")[0])).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });

  it("Iron Monger: an opponent's creature conniving doesn't count", () => {
    const { game } = table();
    enter(game, "Iron Monger, Sadistic Tycoon");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "connive", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(counters(game, named(game, "Iron Monger, Sadistic Tycoon")[0])).toBe(0);
  });

  it("Ultron connives as he attacks, and pays {1} for a Robot Villain", () => {
    const { game, a } = table();
    const ultron = enter(game, "Ultron, Unlimited");
    lands(game, "Island", 1);
    const giant = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giant];
    a.chooseModesFn = () => [0];
    attack(game, a, [ultron]);
    expect(counters(game, ultron)).toBe(1);
    expect(tokensNamed(game, "Robot Villain Token", A)).toBe(1);
  });

  it("Ultron: declining the {1} makes no token", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Ultron, Unlimited");
    lands(game, "Island", 1);
    a.chooseModesFn = () => [];
    connive(game, bears);
    expect(tokensNamed(game, "Robot Villain Token", A)).toBe(0);
  });

  it("Glorious Purpose: each connive grows that creature and adds a plan counter", () => {
    const { game } = table();
    const purpose = enter(game, "Glorious Purpose");
    const bears = spawn(game, "Grizzly Bears");
    toHand(game, "Forest");
    connive(game, bears); // discards the Forest: no connive counter
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, purpose, "plan")).toBe(1);
  });

  it("Glorious Purpose: the sixth plan counter sacrifices it, the spells cast free and the rest to hand", () => {
    const { game, a } = table();
    const purpose = enter(game, "Glorious Purpose");
    game.state.objects[purpose].counters = { plan: 5 };
    const bears = spawn(game, "Grizzly Bears");
    const top = [toLibrary(game, "Forest"), toLibrary(game, "Llanowar Elves"), toLibrary(game, "Island"), toLibrary(game, "Hill Giant")];
    a.chooseDiscardsFn = (h, n) => h.slice(0, n).map((o) => o.id);
    // Cast the Elves free; the rest stay in exile until put into the hand.
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => game.state.objects[c.card]?.cardName === "Llanowar Elves");
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    connive(game, bears);
    expect(zone(game, purpose)).toBe("graveyard");
    // The connive drew one of the six; of the other four, the Elves were cast.
    expect(named(game, "Llanowar Elves", A).some((id) => zone(game, id) === "battlefield")).toBe(true);
    const inHand = top.filter((id) => zone(game, id) === "hand").length;
    expect(inHand).toBeGreaterThanOrEqual(2);
    expect(top.filter((id) => zone(game, id) === "exile")).toEqual([]);
  });

  it("Leader: a creature you control conniving draws a card first, once per Leader", () => {
    const { game, a } = table();
    enter(game, "Leader, Super-Genius");
    enter(game, "Leader, Super-Genius");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseDiscardsFn = (h, n) => h.slice(0, n).map((o) => o.id);
    a.chooseLegendToKeepFn = (_view, _name, options) => options[0];
    settle(game);
    const leaders = named(game, "Leader, Super-Genius", A).filter((id) => zone(game, id) === "battlefield").length;
    const before = hand(game).length;
    connive(game, bears);
    // Drew `leaders` + 1, discarded 1.
    expect(hand(game).length).toBe(before + leaders);
  });

  it("Leader: an opponent's creature conniving draws them nothing extra", () => {
    const { game } = table();
    enter(game, "Leader, Super-Genius");
    const theirs = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    game.debugApplyEffect(B, { kind: "connive", target: 0 }, [ref(theirs)]);
    settle(game);
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Elrond, Moon-Reader", () => {
  it("draws when a creature's mana ability pays for a spell, once each turn", () => {
    const { game } = table();
    enter(game, "Elrond, Moon-Reader");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves");
    const before = hand(game).length;
    const first = toHand(game, "Giant Growth");
    const second = toHand(game, "Giant Growth");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "cast-spell", player: A, card: first, targets: [ref(bears)] });
    settle(game);
    game.dispatch({ type: "cast-spell", player: A, card: second, targets: [ref(bears)] });
    settle(game);
    // Two Growths left the hand; one card drawn.
    expect(hand(game).length).toBe(before + 1);
  });

  it("a land's mana ability isn't a creature's", () => {
    const { game } = table();
    enter(game, "Elrond, Moon-Reader");
    lands(game, "Forest", 1);
    const growth = toHand(game, "Giant Growth");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    game.dispatch({ type: "cast-spell", player: A, card: growth, targets: [ref(bears)] });
    settle(game);
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Way of the Mind Sculptor", () => {
  it("empowers Jace 5, and draws when a loyalty ability removes two or more", () => {
    const { game } = table();
    enter(game, "Way of the Mind Sculptor");
    const jace = named(game, "Jace Token", A)[0];
    expect(jace).toBeDefined();
    expect(counters(game, jace, "loyalty")).toBe(5);
    const before = hand(game).length;
    loyalty(game, jace, -3);
    settle(game);
    // Jace's own draw and the Way's.
    expect(hand(game).length).toBe(before + 2);
  });

  it("a [−1] removes only one: no draw", () => {
    const { game } = table();
    enter(game, "Way of the Mind Sculptor");
    const jace = named(game, "Jace Token", A)[0];
    const before = hand(game).length;
    loyalty(game, jace, -1);
    settle(game);
    expect(hand(game).length).toBe(before);
  });
});

describe("Tamiyo, Upriser Crowned", () => {
  it("makes you the monarch, and stuns the creatures that deal you combat damage", () => {
    const { game, b } = table();
    enter(game, "Tamiyo, Upriser Crowned");
    expect(game.state.monarch).toBe(A);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const idle = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    attack(game, b, [bears, giant], A);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
    expect(counters(game, giant, "stun")).toBe(1);
    expect(counters(game, idle, "stun")).toBe(0);
  });

  it("not while someone else is the monarch", () => {
    const { game, b } = table();
    enter(game, "Tamiyo, Upriser Crowned");
    game.debugApplyEffect(B, { kind: "become-monarch" });
    settle(game);
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    attack(game, b, [bears], A);
    expect(counters(game, bears, "stun")).toBe(0);
    expect(graveyard(game, B)).toEqual([]);
  });
});

describe("Avatar Aang", () => {
  it("draws when you earthbend", () => {
    const { game } = table();
    enter(game, "Avatar Aang");
    const forest = spawn(game, "Forest");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "earthbend", target: 0, amount: 1 }, [ref(forest)]);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(game.state.objects[named(game, "Avatar Aang", A)[0]]?.face ?? 0).toBe(0);
  });

  it("firebends as he attacks: the firebending resolving draws a card", () => {
    const { game, a } = table();
    const aang = enter(game, "Avatar Aang");
    const before = hand(game).length;
    attack(game, a, [aang]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("transforms once all four were done this turn, those before he arrived included", () => {
    const { game } = table();
    for (const how of ["water", "fire", "air"] as const) appendJournal(game.state, { kind: "bent", player: A, how });
    const aang = enter(game, "Avatar Aang");
    const forest = spawn(game, "Forest");
    game.debugApplyEffect(A, { kind: "earthbend", target: 0, amount: 1 }, [ref(forest)]);
    settle(game);
    expect(game.state.objects[aang].face).toBe(1);
  });

  it("Aang, Master of Elements: transforming back at an upkeep gains 4, draws 4, grows and burns", () => {
    const { game, a } = table();
    const aang = enter(game, "Avatar Aang");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(aang)]);
    settle(game);
    expect(game.state.objects[aang].face).toBe(1);
    a.chooseModesFn = () => [0];
    const before = hand(game).length;
    toStep(game, "upkeep", B);
    settle(game);
    expect(game.state.objects[aang].face ?? 0).toBe(0);
    expect(counters(game, aang)).toBe(4);
    expect(hand(game).length).toBe(before + 4);
    expect(game.state.players[A].life).toBe(24);
    expect(game.state.players[B].life).toBe(16);
  });
});
