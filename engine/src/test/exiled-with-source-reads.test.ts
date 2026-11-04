/**
 * What an object reads off the cards still exiled with it (rule 607.2a): how
 * many, as a condition (`exiled-with-source`'s `now`) and a mana amount; the
 * card types among them (`cardTypes`); and `sameNameWith: "exiled-with-source"`
 * in a trigger's filter, a prohibition and a target. A card exiled face down
 * has no characteristics (406.3a), so no type and no name.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

const offersActivation = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === source);

describe("Keen-Eyed Curator: card types among the cards exiled with it", () => {
  const exile = (game: Game, curator: ObjectId, name: string): ObjectId => {
    const card = toGraveyard(game, name, B);
    activate(game, curator, 0, { targets: [ref(card)] });
    return card;
  };

  it("four types is the count, however many cards, and only its own count", () => {
    const { game } = table();
    const curator = spawn(game, "Keen-Eyed Curator");
    lands(game, "Wastes", 6);
    exile(game, curator, "Grizzly Bears");
    exile(game, curator, "Elvish Mystic"); // a second creature adds no type
    exile(game, curator, "Lightning Bolt");
    exile(game, curator, "Divination");
    expect(pt(game, curator)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, curator).has("trample")).toBe(false);
    exile(game, curator, "Mountain");
    expect(pt(game, curator)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, curator).has("trample")).toBe(true);
  });

  it("a card with two types counts as both", () => {
    const { game } = table();
    const curator = spawn(game, "Keen-Eyed Curator");
    lands(game, "Wastes", 3);
    exile(game, curator, "Ornithopter"); // artifact creature
    exile(game, curator, "Lightning Bolt");
    exile(game, curator, "Mountain");
    expect(pt(game, curator).power).toBe(7);
  });

  it("leaving exile, a card takes its types with it", () => {
    const { game } = table();
    const curator = spawn(game, "Keen-Eyed Curator");
    lands(game, "Wastes", 3);
    exile(game, curator, "Ornithopter");
    const land = exile(game, curator, "Mountain");
    exile(game, curator, "Lightning Bolt");
    expect(pt(game, curator).power).toBe(7);
    game.debugApplyEffect(A, { kind: "return-exiled-by-source", linked: "hand", filter: { type: "land" } }, [], { source: curator });
    settle(game);
    expect(zone(game, land)).toBe("hand");
    expect(pt(game, curator).power).toBe(3);
  });

  it("a face-down card exiled with it has no type at all", () => {
    const { game } = table();
    const curator = spawn(game, "Keen-Eyed Curator");
    lands(game, "Wastes", 2);
    exile(game, curator, "Ornithopter");
    exile(game, curator, "Lightning Bolt");
    toLibrary(game, "Mountain");
    game.debugApplyEffect(A, { kind: "exile-from-library", amount: 1, faceDown: true, linked: true }, [], { source: curator });
    expect(pt(game, curator).power).toBe(3);
  });

  it("another Curator's cards aren't its", () => {
    const { game } = table();
    const one = spawn(game, "Keen-Eyed Curator");
    const two = spawn(game, "Keen-Eyed Curator");
    lands(game, "Wastes", 3);
    exile(game, one, "Ornithopter");
    exile(game, one, "Lightning Bolt");
    exile(game, one, "Mountain");
    expect(pt(game, one).power).toBe(7);
    expect(pt(game, two).power).toBe(3);
  });
});

describe("cards still exiled with it", () => {
  it("Veteran Survivor: tapped in your second main phase it exiles, and three still there are +3/+3 and hexproof", () => {
    const { game, a } = table();
    const survivor = spawn(game, "Veteran Survivor");
    const cards = ["Grizzly Bears", "Elvish Mystic", "Mountain"].map((name) => toGraveyard(game, name, B));
    expect(pt(game, survivor)).toEqual({ power: 2, toughness: 1 });
    for (const [i, card] of cards.entries()) {
      pickTargets(a, card);
      // Attacking taps it: the trigger's on the stack in the second main phase.
      attack(game, a, [survivor]);
      settle(game);
      expect(zone(game, card)).toBe("exile");
      expect(game.state.objects[card].exiledWith?.source).toBe(survivor);
      if (i < 2) expect(pt(game, survivor).power).toBe(2);
    }
    expect(pt(game, survivor)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, survivor).has("hexproof")).toBe(true);
    // Not "ever": one back out of exile and it's two.
    game.debugApplyEffect(A, { kind: "return-exiled-by-source", linked: "hand", filter: { type: "land" } }, [], { source: survivor });
    settle(game);
    expect(pt(game, survivor)).toEqual({ power: 2, toughness: 1 });
  });

  it("Veteran Survivor untapped: nothing", () => {
    const { game, a } = table();
    spawn(game, "Veteran Survivor");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    attack(game, a, []);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
  });

  it("Smirking Spelljacker: exiles a spell, casts it free attacking, and has no more to cast", () => {
    const { game, a } = table();
    const giant = toHand(game, "Hill Giant", B);
    lands(game, "Mountain", 4, B);
    const flash = toHand(game, "Smirking Spelljacker");
    lands(game, "Island", 5);
    nextTurn(game);
    cast(game, giant, { player: B, settle: false });
    game.advanceUntil((s) => s.priority.holder === A);
    pickTargets(a, giant);
    cast(game, flash);
    expect(zone(game, giant)).toBe("exile");
    expect(game.state.objects[giant].exiledWith?.source).toBe(flash);
    let asked = 0;
    a.chooseCastNowFn = (_view, offer) => {
      asked += 1;
      return { type: "cast-spell", player: A, card: offer.cards[0], targets: [], via: "effect", free: true };
    };
    attack(game, a, [flash]);
    settle(game);
    expect(asked).toBe(1);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
    expect(game.state.objects[giant].owner).toBe(B);
    // Out of exile, it's no longer exiled with it: the trigger doesn't happen again.
    attack(game, a, [flash]);
    settle(game);
    expect(asked).toBe(1);
  });

  it("Smirking Spelljacker with nothing exiled: its attack trigger doesn't happen", () => {
    const { game, a } = table();
    const jacker = spawn(game, "Smirking Spelljacker");
    attack(game, a, [jacker]);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("Ugin's Labyrinth: {C}{C} with a card under it, {C} without, and the card back", () => {
    const { game, a } = table();
    const titan = toHand(game, "Ulamog's Crusher");
    const small = toHand(game, "Ornithopter");
    const seen = pickFromZone(a, titan);
    const labyrinth = enter(game, "Ugin's Labyrinth");
    expect(seen.offered).toEqual([titan]); // colorless, mana value 7 or greater
    expect(hand(game)).toContain(small);
    expect(zone(game, titan)).toBe("exile");
    activate(game, labyrinth, 0);
    expect(game.state.players[A].manaPool.length).toBe(2);
    game.state.objects[labyrinth].tapped = false;
    activate(game, labyrinth, 1);
    expect(hand(game)).toContain(titan);
    game.state.objects[labyrinth].tapped = false;
    game.state.players[A].manaPool = [];
    activate(game, labyrinth, 0);
    expect(game.state.players[A].manaPool.length).toBe(1);
  });
});

describe("the same name as a card exiled with it", () => {
  it("Circle of Confinement: the exiled Vampire's name on a spell gains you 2, no other name or type does", () => {
    const { game, a } = table();
    const vampire = spawn(game, "Vampire Nighthawk", B);
    pickTargets(a, vampire);
    const circle = enter(game, "Circle of Confinement");
    expect(zone(game, vampire)).toBe("exile");
    expect(life(game)).toBe(20);
    lands(game, "Swamp", 6, B);
    nextTurn(game);
    cast(game, toHand(game, "Vampire Nighthawk", B), { player: B });
    expect(life(game)).toBe(22);
    cast(game, toHand(game, "Bloodghast", B), { player: B });
    expect(life(game)).toBe(22);
    // It leaves, and the Nighthawk comes back: nothing shares a name with nothing.
    destroy(game, circle);
    settle(game);
    expect(zone(game, vampire)).toBe("battlefield");
  });

  it("Circle of Confinement: only a Vampire spell", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Circle of Confinement");
    lands(game, "Forest", 2, B);
    nextTurn(game);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(life(game)).toBe(20);
  });

  it("Circu: a blue spell and a black spell each exile a top card, and its opponents can't cast that name", () => {
    const { game, a } = table();
    spawn(game, "Circu, Dimir Lobotomist");
    const top = toLibrary(game, "Lightning Bolt", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const myBolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    lands(game, "Mountain", 1, B);
    lands(game, "Island", 1);
    const opt = toHand(game, "Opt");
    expect(canCast(game, myBolt, A)).toBe(true);
    pickTargets(a, B);
    cast(game, opt);
    expect(zone(game, top)).toBe("exile");
    // Bob at his own priority: his copy's name is locked, Alice's isn't.
    game.advanceUntil((s) => s.priority.holder === B);
    expect(canCast(game, bolt, B)).toBe(false);
    expect(canCast(game, myBolt, A)).toBe(false); // not Alice's priority, and that's all it says
    game.advanceUntil((s) => s.priority.holder === A);
    expect(canCast(game, myBolt, A)).toBe(true);
  });

  it("Mindreaver: exiles by heroic, then counters only a spell of an exiled name, and from the graveyard its cost put it in", () => {
    const { game, a } = table();
    const reaver = spawn(game, "Mindreaver");
    for (let i = 0; i < 3; i += 1) toLibrary(game, i === 0 ? "Divination" : "Wastes", B);
    lands(game, "Island", 3);
    const pump = toHand(game, "Giant Growth");
    lands(game, "Forest", 1);
    pickTargets(a, B);
    cast(game, pump, { targets: [ref(reaver)] });
    const exiled = game.state.zones.shared.exile;
    expect(exiled).toHaveLength(3);
    expect(game.state.objects[exiled[0]].exiledWith?.source).toBe(reaver);

    const namesake = toHand(game, "Divination", B);
    const other = toHand(game, "Opt", B);
    lands(game, "Island", 4, B);
    nextTurn(game);
    cast(game, other, { player: B, settle: false });
    expect(zone(game, other)).toBe("stack");
    game.advanceUntil((s) => s.priority.holder === A);
    // Not a name exiled with it: nothing to aim at.
    expect(offersActivation(game, reaver)).toBe(false);
    settle(game);
    cast(game, namesake, { player: B, settle: false });
    expect(zone(game, namesake)).toBe("stack");
    game.advanceUntil((s) => s.priority.holder === A);
    expect(offersActivation(game, reaver)).toBe(true);
    activate(game, reaver, 0, { targets: [ref(namesake)] });
    expect(zone(game, reaver)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(namesake);
  });

  it("a card exiled face down has no name to share", () => {
    const { game } = table();
    const circu = spawn(game, "Circu, Dimir Lobotomist");
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    toLibrary(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "exile-from-library", amount: 1, faceDown: true, linked: true }, [], { source: circu });
    game.advanceUntil((s) => s.priority.holder === B);
    expect(canCast(game, bolt, B)).toBe(true);
  });
});
