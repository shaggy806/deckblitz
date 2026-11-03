/**
 * Mana abilities whose costs exile from another zone (rule 605.1a asks nothing
 * of where an ability works from or what it costs, only that no card moves to
 * or from a library): from the hand (Spirit Guides), from the graveyard
 * (Jack-o'-Lantern), and "exile a card from your graveyard" or "collect evidence"
 * off a permanent, a choice the mana waits for with nothing on the stack (605.3b).
 */
import { describe, expect, it } from "vitest";

import { isManaAbility } from "../abilities.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;

const offers = (game: Game, source: ObjectId, index = 0): Offer[] =>
  game.legalActions(A).filter((a): a is Offer => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);

const pool = (game: Game): ManaType[] => game.state.players[A].manaPool.map((unit) => unit.type);

describe("a mana ability from the hand", () => {
  it("Simian Spirit Guide: exiled from the hand for {R}, off the stack", () => {
    const { game } = table();
    const guide = toHand(game, "Simian Spirit Guide");
    expect(isManaAbility(registryOf(game).get("Simian Spirit Guide").activated[0])).toBe(true);
    expect(offers(game, guide)[0]?.manaAbility).toBe(true);

    activate(game, guide);

    expect(zone(game, guide)).toBe("exile");
    expect(graveyard(game)).toEqual([]);
    expect(pool(game)).toEqual(["R"]);
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.priority.holder).toBe(A);
  });

  it("Elvish Spirit Guide: its mana pays for a spell cast after it", () => {
    const { game } = table();
    const guide = toHand(game, "Elvish Spirit Guide");
    const bears = toHand(game, "Llanowar Elves");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === bears)).toBe(false);
    activate(game, guide);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(pool(game)).toEqual([]);
  });

  it("the auto-payer never reaches for it", () => {
    const { game } = table();
    const guide = toHand(game, "Elvish Spirit Guide");
    const elves = toHand(game, "Llanowar Elves");
    expect(() => cast(game, elves)).toThrow();
    expect(zone(game, guide)).toBe("hand");
  });

  it("works at instant speed, under split second, whenever its owner has priority", () => {
    const { game } = table();
    const guide = toHand(game, "Simian Spirit Guide");
    lands(game, "Mountain", 3);
    const sudden = toHand(game, "Sudden Shock");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, sudden, { targets: [ref(bears)], settle: false });
    expect(game.state.zones.shared.stack.length).toBe(1);
    activate(game, guide, 0, { settle: false });
    expect(pool(game)).toEqual(["R"]);
    expect(game.state.zones.shared.stack.length).toBe(1);
  });

  it("it isn't offered on the battlefield, or to another player, or from the graveyard", () => {
    const { game } = table();
    const onBoard = spawn(game, "Simian Spirit Guide");
    const buried = toGraveyard(game, "Simian Spirit Guide");
    expect(offers(game, onBoard)).toEqual([]);
    expect(offers(game, buried)).toEqual([]);
    // On the battlefield it's no mana source either.
    const elves = toHand(game, "Goblin Piker");
    expect(() => cast(game, elves)).toThrow();
    const theirs = toHand(game, "Simian Spirit Guide", B);
    expect(offers(game, theirs)).toEqual([]);
    expect(() => activate(game, theirs)).toThrow();
  });
});

describe("a mana ability from the graveyard", () => {
  it("Jack-o'-Lantern: {1} and exiled from the graveyard: one mana of the colour chosen", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const jack = toGraveyard(game, "Jack-o'-Lantern");
    const offered = offers(game, jack, 1);
    expect(offered.every((o) => o.manaAbility === true)).toBe(true);
    game.dispatch({ type: "activate-ability", player: A, source: jack, abilityIndex: 1, targets: [], manaColors: ["U"] });
    settle(game);
    expect(zone(game, jack)).toBe("exile");
    expect(pool(game)).toEqual(["U"]);
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.players[A].usedGraveyardThisTurn).toBe(true);
  });

  it("Jack-o'-Lantern: no {1}, no mana; and on the battlefield it pays for nothing that way", () => {
    const { game } = table();
    const jack = toGraveyard(game, "Jack-o'-Lantern");
    expect(offers(game, jack, 1)).toEqual([]);

    const onBoard = spawn(game, "Jack-o'-Lantern");
    lands(game, "Wastes", 1);
    expect(offers(game, onBoard, 1)).toEqual([]);
    // {1} converted to {U} would pay; a battlefield copy has no such source.
    const merfolk = toHand(game, "Merfolk of the Pearl Trident");
    expect(() => cast(game, merfolk)).toThrow();
  });

  it("Jack-o'-Lantern: sacrifice it to exile up to one card from a graveyard and draw", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const jack = spawn(game, "Jack-o'-Lantern");
    const dead = toGraveyard(game, "Grizzly Bears", B);
    const before = hand(game).length;
    activate(game, jack, 0, { targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("exile");
    expect(zone(game, jack)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Jack-o'-Lantern: with no target, still draws", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const jack = spawn(game, "Jack-o'-Lantern");
    const before = hand(game).length;
    activate(game, jack, 0, { targets: [null] });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("exile from a graveyard as a mana ability's cost", () => {
  it("Molt Tender: the only card goes unasked; {T} too; any colour", () => {
    const { game } = table();
    const tender = spawn(game, "Molt Tender");
    const card = toGraveyard(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: tender, abilityIndex: 1, targets: [], manaColors: ["B"] });
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[tender].tapped).toBe(true);
    expect(pool(game)).toEqual(["B"]);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("Molt Tender: a choice waits, nothing on the stack, nobody with priority, and the mana comes with the answer", () => {
    const { game } = table();
    const tender = spawn(game, "Molt Tender");
    const keep = toGraveyard(game, "Grizzly Bears");
    const take = toGraveyard(game, "Goblin Piker");
    game.dispatch({ type: "activate-ability", player: A, source: tender, abilityIndex: 1, targets: [], manaColors: ["G"] });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    expect(game.state.objects[tender].tapped).toBe(true);
    expect(pool(game)).toEqual([]);
    expect(game.state.zones.shared.stack).toEqual([]);

    game.dispatch({ type: "choose-from-zone", player: A, chosen: [take] });
    settle(game);
    expect(zone(game, take)).toBe("exile");
    expect(zone(game, keep)).toBe("graveyard");
    expect(pool(game)).toEqual(["G"]);
    expect(game.state.priority.holder).toBe(A);
  });

  it("Molt Tender: an empty graveyard refuses it; {T}: Mill a card is its other ability", () => {
    const { game } = table();
    const tender = spawn(game, "Molt Tender");
    expect(offers(game, tender, 1)).toEqual([]);
    activate(game, tender, 0);
    expect(graveyard(game).length).toBe(1);
  });

  it("Molt Tender: never spent by the auto-payer", () => {
    const { game } = table();
    spawn(game, "Molt Tender");
    toGraveyard(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    expect(() => cast(game, elves)).toThrow();
  });

  it("Rubble Rouser: the mana now, the reflexive 1 damage to each opponent on the stack after", () => {
    const { game } = table({ players: 3 });
    const rouser = spawn(game, "Rubble Rouser");
    toGraveyard(game, "Grizzly Bears");
    activate(game, rouser, 0, { settle: false });
    expect(pool(game)).toEqual(["R"]);
    // The reflexive ability uses the stack; the mana ability didn't.
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(game.state.priority.holder).toBe(A);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("Rubble Rouser: through a choice, the same", () => {
    const { game } = table();
    const rouser = spawn(game, "Rubble Rouser");
    toGraveyard(game, "Grizzly Bears");
    const take = toGraveyard(game, "Goblin Piker");
    activate(game, rouser, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    expect(life(game, B)).toBe(20);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [take] });
    expect(pool(game)).toEqual(["R"]);
    expect(game.state.zones.shared.stack.length).toBe(1);
    settle(game);
    expect(life(game, B)).toBe(19);
  });

  it("Rubble Rouser: may discard to draw as it enters", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    const before = hand(game).length;
    enter(game, "Rubble Rouser");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });

  it("Titans' Nest: {C} only for a coloured spell", () => {
    const { game } = table();
    const nest = spawn(game, "Titans' Nest");
    toGraveyard(game, "Grizzly Bears");
    activate(game, nest);
    const [unit] = game.state.players[A].manaPool;
    expect(unit.type).toBe("C");

    // A colourless spell can't use it.
    const walker = toHand(game, "Ornithopter of Paradise");
    lands(game, "Wastes", 1);
    expect(() => cast(game, walker)).toThrow();
    expect(game.state.players[A].manaPool.length).toBe(1);

    // A coloured one can: {1}{G}, the rest from the Forest.
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(pool(game)).toEqual([]);
  });

  it("Titans' Nest: not for a spell with {X} in its mana cost", () => {
    const { game } = table();
    const nest = spawn(game, "Titans' Nest");
    toGraveyard(game, "Grizzly Bears");
    activate(game, nest);
    lands(game, "Mountain", 1);
    const fireball = toHand(game, "Fireball");
    expect(() => cast(game, fireball, { targets: [ref(B)], x: 1 })).toThrow();
    expect(pool(game)).toEqual(["C"]);
  });

  it("Titans' Nest: surveil 1 at the beginning of your upkeep", () => {
    const { game } = table();
    spawn(game, "Titans' Nest");
    nextTurn(game); // Bob's: no trigger.
    expect(game.eventsOfType("scried").length).toBe(0);
    nextTurn(game); // Alice's.
    expect(game.eventsOfType("scried").map((e) => [e.mode, e.looked])).toEqual([["surveil", 1]]);
  });
});

describe("collect evidence as a mana ability's cost", () => {
  it("Cryptex: evidence of 3 pays for one mana of any colour and an unlock counter", () => {
    const { game } = table();
    const cryptex = spawn(game, "Cryptex");
    const three = toGraveyard(game, "Hill Giant"); // {3}{R}: mana value 4
    const small = toGraveyard(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: cryptex, abilityIndex: 0, targets: [], manaColors: ["W"] });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    expect(game.state.objects[cryptex].tapped).toBe(true);
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(pool(game)).toEqual([]);

    game.dispatch({ type: "choose-from-zone", player: A, chosen: [three] });
    settle(game);
    expect(zone(game, three)).toBe("exile");
    expect(zone(game, small)).toBe("graveyard");
    expect(pool(game)).toEqual(["W"]);
    expect(counters(game, cryptex, "unlock")).toBe(1);
    expect(game.eventsOfType("evidence-collected").length).toBe(1);
  });

  it("Cryptex: not enough mana value in the graveyard, no activation (rule 701.59b)", () => {
    const { game } = table();
    const cryptex = spawn(game, "Cryptex");
    toGraveyard(game, "Grizzly Bears");
    expect(offers(game, cryptex, 0)).toEqual([]);
  });

  it("Cryptex: five unlock counters to crack it, for surveil 3 and three cards", () => {
    const { game } = table();
    const cryptex = spawn(game, "Cryptex");
    expect(offers(game, cryptex, 1)).toEqual([]);
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "unlock", amount: 5 }, [], { source: cryptex });
    expect(offers(game, cryptex, 1).length).toBe(1);
    const before = hand(game).length;
    activate(game, cryptex, 1);
    expect(zone(game, cryptex)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 3);
  });
});
