/**
 * Set walk batch 91, part a (2026-10-16): Murders at Karlov Manor (MKM) and Murders at Karlov Manor Commander (MKC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { goadersOf } from "../goad.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  C,
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
  named,
  pickModes,
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
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);
const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const makeToken = (game: Game, name: string, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
const faceDownCast = (game: Game, card: ObjectId): void => cast(game, card, { via: "face-down" });
const turnUp = (game: Game, permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
  settle(game);
};
const goadedBy = (game: Game, id: ObjectId): readonly PlayerId[] => goadersOf(game.state, game.registry, id);
/** Activate `source`'s ability `index`, sacrificing `sacrifice` for its cost. */
const activateSacrificing = (game: Game, source: ObjectId, index: number, sacrifice: ObjectId): void => {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [], sacrifice } as Action);
  settle(game);
};

/** The seat casts the first card offered that's in `wanted`, free, with no
 * targets; records what was offered. */
function castFromOffers(seat: ScriptedController, wanted: readonly ObjectId[]): { offered: (readonly ObjectId[])[] } {
  const seen = { offered: [] as (readonly ObjectId[])[] };
  const left = [...wanted];
  seat.chooseCastNowFn = (_view, offer) => {
    seen.offered.push(offer.cards);
    const pick = left.find((id) => offer.cards.includes(id));
    if (pick === undefined) return null;
    left.splice(left.indexOf(pick), 1);
    const way = offer.casts.find((c) => c.card === pick)!;
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: pick,
      targets: [],
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
  return seen;
}

describe("Havoc Eater", () => {
  it("goads up to one creature of each opponent and grows by their total power", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", C);
    pickTargets(a, giant, bears);
    const eater = enter(game, "Havoc Eater");
    expect(goadedBy(game, giant)).toEqual([A]);
    expect(goadedBy(game, bears)).toEqual([A]);
    expect(counters(game, eater)).toBe(5);
  });

  it("doesn't count a target gone by the time it resolves — it wasn't goaded", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", C);
    pickTargets(a, giant, bears);
    const eater = enter(game, "Havoc Eater", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(giant)]);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(goadedBy(game, bears)).toEqual([A]);
    expect(counters(game, eater)).toBe(2);
  });
});

describe("Unshakable Tail", () => {
  it("investigates once when several creature cards are milled together, not for a noncreature", () => {
    const { game } = table();
    spawn(game, "Unshakable Tail");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 2 });
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    toLibrary(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("surveils as it enters and at your upkeep", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseScryFn = (_view, cards) => cards.filter((id) => id === bears);
    enter(game, "Unshakable Tail");
    // Surveilled into the graveyard: a creature card from the library, so a Clue.
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    const giant = toLibrary(game, "Hill Giant");
    a.chooseScryFn = (_view, cards) => cards.filter((id) => id === giant);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });

  it("returns from the graveyard to your hand for {2} and a Clue", () => {
    const { game } = table();
    const tail = toGraveyard(game, "Unshakable Tail");
    makeToken(game, "Clue Token");
    lands(game, "Wastes", 2);
    activateSacrificing(game, tail, 0, tokensOf(game, "Clue Token")[0]);
    expect(zone(game, tail)).toBe("hand");
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Final-Word Phantom", () => {
  it("lets you cast a sorcery-speed spell in an opponent's end step, and only then", () => {
    const { game } = table();
    spawn(game, "Final-Word Phantom");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    game.advanceUntil((s) => s.turn.step === "end" && activePlayerOf(s) === A && s.priority.holder === A);
    expect(canCast(game, bears)).toBe(false);
    // An opponent's turn, but not its end step.
    game.advanceUntil((s) => s.turn.step === "draw" && activePlayerOf(s) === B && s.priority.holder === A);
    expect(canCast(game, bears)).toBe(false);
    game.advanceUntil((s) => s.turn.step === "end" && activePlayerOf(s) === B && s.priority.holder === A);
    expect(canCast(game, bears)).toBe(true);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Experiment Twelve", () => {
  it("turned face up itself, doubles its power in counters", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const twelve = toHand(game, "Experiment Twelve");
    faceDownCast(game, twelve);
    lands(game, "Forest", 5);
    turnUp(game, twelve);
    expect(counters(game, twelve)).toBe(4);
    expect(pt(game, twelve)).toEqual({ power: 8, toughness: 8 });
  });

  it("puts counters equal to its power on another creature you turn face up", () => {
    const { game } = table();
    const twelve = spawn(game, "Experiment Twelve");
    lands(game, "Wastes", 3);
    const alchemist = toHand(game, "Aphetto Alchemist");
    faceDownCast(game, alchemist);
    lands(game, "Island", 1);
    turnUp(game, alchemist);
    // Aphetto Alchemist is a 1/2: one counter.
    expect(counters(game, alchemist)).toBe(1);
    expect(pt(game, alchemist)).toEqual({ power: 2, toughness: 3 });
    expect(counters(game, twelve)).toBe(0);
  });
});

describe("Counterpoint", () => {
  it("counters a spell and casts a card from your graveyard with mana value up to the spell's, its X included", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    lands(game, "Island", 3);
    lands(game, "Swamp", 2);
    const giant = toGraveyard(game, "Hill Giant");
    const angel = toGraveyard(game, "Serra Angel");
    const fireball = toHand(game, "Fireball");
    cast(game, fireball, { x: 3, targets: [ref(B)], settle: false });
    const seen = castFromOffers(a, [giant]);
    cast(game, toHand(game, "Counterpoint"), { targets: [ref(fireball)] });
    expect(zone(game, fireball)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    // Fireball cast for X = 3 has mana value 4: the Giant (4) is offered, the Angel (5) isn't.
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(angel);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Sophia, Dogged Detective", () => {
  it("makes Tiny, and grows each Dog for {1} and an artifact token", () => {
    const { game } = table();
    enter(game, "Sophia, Dogged Detective");
    const [tiny] = tokensOf(game, "Tiny");
    expect(tiny).toBeDefined();
    expect(pt(game, tiny)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, tiny).has("trample")).toBe(true);
    makeToken(game, "Clue Token");
    lands(game, "Wastes", 1);
    const sophia = named(game, "Sophia, Dogged Detective", A)[0];
    activateSacrificing(game, sophia, 0, tokensOf(game, "Clue Token")[0]);
    expect(counters(game, tiny)).toBe(1);
    expect(counters(game, sophia)).toBe(0);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });

  it("a Dog's combat damage to a player makes a Food, then a Clue", () => {
    const { game, a } = table();
    spawn(game, "Sophia, Dogged Detective");
    const dog = spawn(game, "Tiny");
    attack(game, a, [dog]);
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("True Identity", () => {
  it("draws when it or another permanent you control turns face up, once a turn", () => {
    const { game, a } = table();
    lands(game, "Wastes", 6);
    const identity = toHand(game, "True Identity");
    const alchemist = toHand(game, "Aphetto Alchemist");
    faceDownCast(game, identity);
    faceDownCast(game, alchemist);
    const before = hand(game).length;
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    a.chooseFromZoneFn = () => [];
    turnUp(game, identity);
    expect(types(game, identity)).toEqual(["enchantment"]);
    expect(hand(game).length).toBe(before + 1);
    turnUp(game, alchemist);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Copy Catchers", () => {
  it("whenever you surveil, pays {1}{U} for a token copy of itself", () => {
    const { game, a } = table();
    spawn(game, "Copy Catchers");
    lands(game, "Island", 2);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "surveil", amount: 1 });
    settle(game);
    expect(tokensOf(game, "Copy Catchers")).toHaveLength(1);
    pickModes(a);
    game.debugApplyEffect(A, { kind: "surveil", amount: 1 });
    settle(game);
    expect(tokensOf(game, "Copy Catchers")).toHaveLength(1);
  });
});

describe("Doorkeeper Thrull", () => {
  it("artifacts and creatures entering trigger nothing; an enchantment still does", () => {
    const { game } = table();
    spawn(game, "Doorkeeper Thrull");
    enter(game, "Drownyard Explorers");
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    enter(game, "Fleeting Memories");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Slice from the Shadows", () => {
  it("gives -X/-X, and ward can't counter it", () => {
    const { game } = table();
    const abuelo = spawn(game, "Abuelo, Ancestral Echo", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Slice from the Shadows"), { x: 2, targets: [ref(abuelo)] });
    expect(zone(game, abuelo)).toBe("graveyard");
  });
});

describe("Public Thoroughfare", () => {
  it("enters tapped and stays when you tap an untapped land for it", () => {
    const { game, a } = table();
    const [wastes] = lands(game, "Wastes", 1);
    const seen = pickPermanents(a, wastes);
    const thoroughfare = enter(game, "Public Thoroughfare");
    expect(seen.offered).toContain(wastes);
    expect(isTapped(game, thoroughfare)).toBe(true);
    expect(isTapped(game, wastes)).toBe(true);
    expect(zone(game, thoroughfare)).toBe("battlefield");
  });

  it("is sacrificed when nothing is tapped for it", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    pickPermanents(a);
    const thoroughfare = enter(game, "Public Thoroughfare");
    expect(zone(game, thoroughfare)).toBe("graveyard");
  });
});

describe("Branch of Vitu-Ghazi", () => {
  it("cast face down, turned up for {3}: two mana of one colour that lasts the turn", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const branch = toHand(game, "Branch of Vitu-Ghazi");
    faceDownCast(game, branch);
    expect(zone(game, branch)).toBe("battlefield");
    turnUp(game, branch);
    expect(types(game, branch)).toEqual(["land"]);
    const pool = game.state.players[A].manaPool.map((unit) => unit.type);
    expect(pool).toHaveLength(2);
    expect(pool[0]).toBe(pool[1]);
    expect(["W", "U", "B", "R", "G"]).toContain(pool[0]);
    toStep(game, "begin-combat");
    expect(game.state.players[A].manaPool).toHaveLength(2);
  });
});

describe("Wispdrinker Vampire", () => {
  it("drains when another creature with power 2 or less enters", () => {
    const { game } = table();
    spawn(game, "Wispdrinker Vampire");
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    enter(game, "Hill Giant");
    expect(life(game, B)).toBe(19);
  });

  it("{5}{W}{B} gives deathtouch and lifelink to your small creatures only", () => {
    const { game } = table();
    const vampire = spawn(game, "Wispdrinker Vampire");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 6);
    lands(game, "Swamp", 1);
    activate(game, vampire, 0);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(keywords(game, vampire).has("lifelink")).toBe(true);
    expect(keywords(game, giant).has("deathtouch")).toBe(false);
    expect(keywords(game, theirs).has("deathtouch")).toBe(false);
  });
});

describe("Krenko, Baron of Tin Street", () => {
  it("pays {R} for a hasty Goblin when any artifact goes to a graveyard, and taps to grow Goblins", () => {
    const { game, a } = table();
    const krenko = spawn(game, "Krenko, Baron of Tin Street");
    lands(game, "Mountain", 2);
    const theirs = spawn(game, "Ornithopter", B);
    pickModes(a, 0);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(theirs)]);
    settle(game);
    const goblins = tokensOf(game, "Goblin Token");
    expect(goblins).toHaveLength(1);
    expect(keywords(game, goblins[0]).has("haste")).toBe(true);
    const thopter = spawn(game, "Ornithopter");
    activateSacrificing(game, krenko, 0, thopter);
    // The sacrificed Ornithopter triggers it too: a second Goblin before the counters.
    expect(tokensNamed(game, "Goblin Token", A)).toBe(2);
    expect(counters(game, krenko)).toBe(1);
    for (const goblin of tokensOf(game, "Goblin Token")) expect(counters(game, goblin)).toBe(1);
  });

  it("the Goblin's haste lasts only the turn", () => {
    const { game, a } = table();
    spawn(game, "Krenko, Baron of Tin Street");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    const mine = spawn(game, "Ornithopter");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(mine)]);
    settle(game);
    const [goblin] = tokensOf(game, "Goblin Token");
    toStep(game, "precombat-main", B);
    expect(keywords(game, goblin).has("haste")).toBe(false);
  });
});

describe("Officious Interrogation", () => {
  it("costs {W}{U} more per extra target and investigates once per creature those players control", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", A);
    const islands = lands(game, "Island", 2);
    const plains = lands(game, "Plains", 2);
    cast(game, toHand(game, "Officious Interrogation"), { targets: [ref(B), ref(C)] });
    expect(tokensNamed(game, "Clue Token", A)).toBe(3);
    for (const land of [...islands, ...plains]) expect(isTapped(game, land)).toBe(true);
  });

  it("can't take a second target without the extra {W}{U}", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    const spell = toHand(game, "Officious Interrogation");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [ref(B), ref(C)] } as Action)).not.toBeNull();
    cast(game, spell, { targets: [ref(A)] });
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Veiled Ascension", () => {
  it("entering, puts a flying counter on each face-down creature you control", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const first = toHand(game, "Aphetto Alchemist");
    faceDownCast(game, first);
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Veiled Ascension");
    expect(counters(game, first, "flying")).toBe(1);
    expect(keywords(game, first).has("flying")).toBe(true);
    expect(counters(game, bears, "flying")).toBe(0);
  });

  it("face-down creatures enter with a flying counter, and it may cloak each upkeep", () => {
    const { game, a } = table();
    spawn(game, "Veiled Ascension");
    lands(game, "Wastes", 3);
    const alchemist = toHand(game, "Aphetto Alchemist");
    faceDownCast(game, alchemist);
    expect(counters(game, alchemist, "flying")).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    expect(counters(game, bears, "flying")).toBe(0);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    const cloaked = game.battlefield.filter(
      (id) => game.state.objects[id].faceDown !== undefined && id !== alchemist,
    );
    expect(cloaked).toHaveLength(1);
    expect(counters(game, cloaked[0], "flying")).toBe(1);
    expect(graveyard(game)).toHaveLength(0);
  });
});
