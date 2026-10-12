/**
 * The set walk, batch 65, part b (2026-10-12): Marvel's Spider-Man.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
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
  types,
  zone,
} from "./harness.js";

/** `seat`'s player discards `card`. */
const discard = (game: Game, seat: ScriptedController, card: ObjectId): void => {
  seat.chooseDiscardsFn = () => [card];
  game.debugApplyEffect(seat.playerId, { kind: "discard", target: "you", amount: 1 });
  settle(game);
};
const discardN = (game: Game, player: PlayerId, amount: number): void => {
  game.debugApplyEffect(player, { kind: "discard", target: "you", amount });
  settle(game);
};
const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);

describe("The Spot's Portal", () => {
  it("puts the creature on the bottom of its library, and costs 2 life only without a Villain", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "The Spot's Portal"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    // The opposite end from a card put on top.
    const top = toLibrary(game, "Lightning Bolt", B);
    const library = game.state.zones.perPlayer[B].library;
    expect(library.indexOf(bears)).toBe(library.indexOf(top) === 0 ? library.length - 1 : 0);
    expect(life(game)).toBe(18);

    spawn(game, "Hobgoblin, Mantled Marauder");
    lands(game, "Swamp", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "The Spot's Portal"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("library");
    expect(life(game)).toBe(18);
  });
});

describe("Doctor Octopus, Master Planner", () => {
  it("pumps other Villains, refills to eight at your end step, and caps the hand at eight", () => {
    const { game } = table();
    const doc = spawn(game, "Doctor Octopus, Master Planner");
    const hob = spawn(game, "Hobgoblin, Mantled Marauder");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, doc)).toEqual({ power: 4, toughness: 8 });
    expect(pt(game, hob)).toEqual({ power: 3, toughness: 4 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });

    discardN(game, A, hand(game).length - 5);
    expect(hand(game).length).toBe(5);
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(8);

    // Next turn, ten in hand: no draw, and cleanup discards down to eight.
    toStep(game, "precombat-main");
    while (hand(game).length < 10) toHand(game, "Wastes");
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(10);
    toStep(game, "precombat-main", B);
    expect(hand(game, A).length).toBe(8);
  });
});

describe("Morlun, Devourer of Spiders", () => {
  it("enters with X counters and deals X damage to the target opponent", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    pickTargets(a, B);
    const morlun = toHand(game, "Morlun, Devourer of Spiders");
    cast(game, morlun, { x: 3 });
    expect(counters(game, morlun)).toBe(3);
    expect(pt(game, morlun)).toEqual({ power: 5, toughness: 4 });
    expect(life(game, B)).toBe(17);
  });
});

describe("Hobgoblin, Mantled Marauder", () => {
  it("gets +2/+0 for each card you discard", () => {
    const { game } = table();
    const hob = spawn(game, "Hobgoblin, Mantled Marauder");
    discardN(game, A, 2);
    expect(pt(game, hob)).toEqual({ power: 5, toughness: 2 });
    // An opponent's discard doesn't count.
    discardN(game, B, 1);
    expect(pt(game, hob)).toEqual({ power: 5, toughness: 2 });
  });
});

describe("Spider-Gwen, Free Spirit", () => {
  it("may rummage whenever she becomes tapped", () => {
    const { game, a } = table();
    const gwen = spawn(game, "Spider-Gwen, Free Spirit");
    pickModes(a, 0);
    const before = { hand: hand(game).length, yard: graveyard(game).length };
    attack(game, a, [gwen]);
    expect(hand(game).length).toBe(before.hand);
    expect(graveyard(game).length).toBe(before.yard + 1);
  });
});

describe("Heroes' Hangout", () => {
  it("Date Night: exiles two, and only the chosen one may be played", () => {
    const { game, a } = table();
    const first = toLibrary(game, "Lightning Bolt");
    const second = toLibrary(game, "Lightning Bolt");
    lands(game, "Mountain", 2);
    pickFromZone(a, first);
    cast(game, toHand(game, "Heroes' Hangout"), { modes: [0] });
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    expect(canCast(game, first)).toBe(true);
    expect(canCast(game, second)).toBe(false);
  });

  it("Patrol Night: one or two targets each get +1/+0 and first strike", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Heroes' Hangout"), { modes: [1], targets: [ref(one), ref(two)] });
    expect(pt(game, one)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, two)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, one).has("first-strike")).toBe(true);
    expect(keywords(game, two).has("first-strike")).toBe(true);
  });
});

describe("The Death of Gwen Stacy", () => {
  it("destroys a creature, then each player discards or loses 3, then exiles chosen graveyards", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const saga = spawn(game, "The Death of Gwen Stacy");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");

    // Chapter II: alice discards; bob, with an empty hand, can't, and loses 3.
    game.debugApplyEffect(B, { kind: "discard-hand", who: "you" });
    settle(game);
    expect(hand(game, B).length).toBe(0);
    pickModes(a, 0);
    toStep(game, "precombat-main");
    // Bob drew nothing on alice's turn; his hand is still empty.
    settle(game);
    expect(counters(game, saga, "lore")).toBe(2);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);

    // Chapter III: only bob's graveyard.
    pickTargets(a, B);
    const myYard = graveyard(game, A).length;
    toStep(game, "precombat-main");
    settle(game);
    expect(graveyard(game, B).length).toBe(0);
    expect(graveyard(game, A).length).toBeGreaterThanOrEqual(myYard);
  });
});

describe("Biorganic Carapace", () => {
  it("attaches as it enters, and the equipped creature draws one per modified creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const counted = spawn(game, "Hill Giant");
    game.state.objects[counted].counters["-1/-1"] = 1;
    spawn(game, "Hill Giant"); // unmodified
    pickTargets(a, bears);
    const carapace = enter(game, "Biorganic Carapace");
    expect(game.state.objects[carapace].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const before = hand(game).length;
    attack(game, a, [bears]);
    // The equipped bears and the Giant with a counter: two.
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Doc Ock's Tentacles", () => {
  it("may attach to a creature with mana value 5 or more as it enters, and not to a smaller one", () => {
    const { game, a } = table();
    const tentacles = spawn(game, "Doc Ock's Tentacles");
    pickModes(a, 0);
    enter(game, "Grizzly Bears");
    expect(game.state.objects[tentacles].attachedTo).toBeNull();
    const big = enter(game, "Doctor Octopus, Master Planner");
    expect(game.state.objects[tentacles].attachedTo).toBe(big);
    expect(pt(game, big)).toEqual({ power: 8, toughness: 12 });
  });
});

describe("Rocket-Powered Goblin Glider", () => {
  it("cast with mayhem from your graveyard, it attaches as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const glider = toHand(game, "Rocket-Powered Goblin Glider");
    discard(game, a, glider);
    lands(game, "Wastes", 2);
    pickTargets(a, bears);
    cast(game, glider, { via: "mayhem" });
    expect(game.state.objects[glider].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("cast from your hand, it doesn't", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    pickTargets(a, bears);
    const glider = toHand(game, "Rocket-Powered Goblin Glider");
    cast(game, glider);
    expect(zone(game, glider)).toBe("battlefield");
    expect(game.state.objects[glider].attachedTo).toBeNull();
  });
});

describe("Sandman, Shifting Scoundrel", () => {
  it("counts your lands, and returns itself and a land card from your graveyard tapped", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const sandman = toGraveyard(game, "Sandman, Shifting Scoundrel");
    // The CDA works in the graveyard too (the ruling).
    expect(pt(game, sandman)).toEqual({ power: 5, toughness: 5 });
    const forest = toGraveyard(game, "Forest");
    activate(game, sandman, 0, { targets: [ref(forest)] });
    expect(zone(game, sandman)).toBe("battlefield");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[sandman].tapped).toBe(true);
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(pt(game, sandman)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Lizard, Connors's Curse", () => {
  it("turns another creature into a vanilla green 4/4 Lizard for good — an artifact creature stops being an artifact", () => {
    const { game, a } = table();
    const bot = spawn(game, "Spider-Bot", B);
    pickTargets(a, bot);
    enter(game, "Lizard, Connors's Curse");
    expect(pt(game, bot)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, bot)).toEqual(["creature"]);
    expect(subtypes(game, bot)).toEqual(["Lizard"]);
    expect(keywords(game, bot).has("reach")).toBe(false);
    toStep(game, "precombat-main", B);
    expect(pt(game, bot)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, bot)).toEqual(["Lizard"]);
  });
});

describe("Secret Identity", () => {
  it("Conceal makes a 1/1 hexproof Citizen of it, and only of that creature type, until end of turn", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const gwen = spawn(game, "Spider-Gwen, Free Spirit");
    cast(game, toHand(game, "Secret Identity"), { modes: [0], targets: [ref(gwen)] });
    expect(pt(game, gwen)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, gwen)).toEqual(["Citizen"]);
    expect(types(game, gwen)).toEqual(["creature"]);
    expect(keywords(game, gwen).has("hexproof")).toBe(true);
    expect(keywords(game, gwen).has("reach")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(pt(game, gwen)).toEqual({ power: 2, toughness: 3 });
    expect(subtypes(game, gwen)).toEqual(["Spider", "Human", "Hero"]);
  });
});

describe("J. Jonah Jameson", () => {
  it("suspects up to one creature, and a creature of yours with menace attacking makes a Treasure", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const plain = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    enter(game, "J. Jonah Jameson");
    expect(game.state.objects[bears].suspectedAt).toBeDefined();
    expect(keywords(game, bears).has("menace")).toBe(true);
    attack(game, a, [bears, plain]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Spider-Man Noir", () => {
  it("a lone attacker gets a counter, then you surveil once per counter of any kind on it", () => {
    const { game, a } = table();
    spawn(game, "Spider-Man Noir");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters.shield = 1;
    let looked = 0;
    a.chooseScryFn = (_view, cards) => {
      looked = cards.length;
      return [];
    };
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
    expect(looked).toBe(2);
  });

  it("not when two attack", () => {
    const { game, a } = table();
    const noir = spawn(game, "Spider-Man Noir");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [noir, bears]);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, noir)).toBe(0);
  });
});

describe("Unstable Experiment", () => {
  it("the target player draws, then your creature connives", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    toHand(game, "Lightning Bolt");
    const bobHand = hand(game, B).length;
    const yard = graveyard(game).length;
    // Discards the front of the hand: a Wastes (a land), so no counter.
    cast(game, toHand(game, "Unstable Experiment"), { targets: [ref(B), ref(bears)] });
    expect(hand(game, B).length).toBe(bobHand + 1);
    expect(graveyard(game).length).toBe(yard + 2); // the discard and the spell
    expect(counters(game, bears)).toBe(0);
  });

  it("a nonland discard puts the counter on", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    cast(game, toHand(game, "Unstable Experiment"), { targets: [ref(A), ref(bears)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Symbiote Spider-Man", () => {
  it("digs that many on combat damage, and from the graveyard gives a creature a counter and that ability", () => {
    const { game, a } = table();
    const symbiote = spawn(game, "Symbiote Spider-Man");
    const top = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, top);
    const yard = graveyard(game).length;
    attack(game, a, [symbiote]);
    // Two damage: two cards looked at, the Bolt kept, the other binned.
    expect(zone(game, top)).toBe("hand");
    expect(graveyard(game).length).toBe(yard + 1);

    toStep(game, "precombat-main", B);
    toStep(game, "precombat-main");
    const dead = toGraveyard(game, "Symbiote Spider-Man");
    const host = spawn(game, "Hill Giant");
    lands(game, "Island", 3);
    activate(game, dead, 0, { targets: [ref(host)] });
    expect(zone(game, dead)).toBe("exile");
    expect(counters(game, host)).toBe(1);
    const bolt = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, bolt);
    attack(game, a, [host]);
    expect(zone(game, bolt)).toBe("hand");
  });
});
