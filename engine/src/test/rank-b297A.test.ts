/**
 * Batch B297, group A: cards whose blocked records were re-read. Each test is
 * on the clause the record said the engine couldn't run.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
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
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  quiet,
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

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const addCounters = (game: Game, id: ObjectId, counter: string, amount: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);
  settle(game);
};

/** Cast `card` from where it is, under whatever permission offers it. */
const castOffered = (game: Game, card: ObjectId): void => {
  const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card) as
    | Record<string, unknown>
    | undefined;
  if (offer === undefined) throw new Error("not offered");
  const extra = Object.fromEntries(
    ["via", "graveyardGrant", "face", "free"].filter((k) => offer[k] !== undefined).map((k) => [k, offer[k]]),
  );
  game.dispatch({ type: "cast-spell", player: A, card, targets: [], ...extra } as Action);
  settle(game);
};

/** Answer each `may` asked as Relentless Dead dies: the {X} one with `x`, the {B} one with no. */
const answerDead = (game: Game, x: number): void => {
  for (let i = 0; i < 2; i += 1) {
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" || quiet(s));
    if (game.state.awaiting?.kind !== "choose-modes") break;
    const offer = game.legalActions(A).find((o) => o.kind === "choose-modes") as { xCost?: unknown } | undefined;
    if (offer?.xCost !== undefined) game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: x } as Action);
    else game.dispatch({ type: "choose-modes", player: A, modes: [] } as Action);
  }
  settle(game);
};

/** Answer the `may` now asked with yes and this X. */
const payX = (game: Game, x: number): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
  game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: x } as Action);
};

describe("Wakka, Devoted Guardian", () => {
  it("puts counters on the others only if a counter was put on Wakka this turn", () => {
    const { game } = table();
    const wakka = spawn(game, "Wakka, Devoted Guardian");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(0);
    toStep(game, "precombat-main");
    addCounters(game, wakka, "+1/+1", 1);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, wakka)).toBe(1);
  });
});

describe("Relentless Dead", () => {
  const board = () => {
    const t = table();
    const dead = spawn(t.game, "Relentless Dead");
    const corpse = toGraveyard(t.game, "Walking Corpse");
    lands(t.game, "Swamp", 2);
    pickTargets(t.a, corpse);
    // The {B} ability is declined; the {X} one is answered by hand.
    t.a.orderTriggersFn = (_view, triggers) => triggers.map((_, i) => i);
    return { ...t, dead, corpse };
  };

  it("returns the target Zombie when the X paid is its mana value", () => {
    const { game, dead, corpse } = board();
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(dead)]);
    answerDead(game, 2);
    expect(zone(game, corpse)).toBe("battlefield");
    expect(named(game, "Swamp", A).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("returns nothing when the X paid isn't its mana value", () => {
    const { game, dead, corpse } = board();
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(dead)]);
    answerDead(game, 1);
    expect(zone(game, corpse)).toBe("graveyard");
    expect(zone(game, dead)).toBe("graveyard");
    // The {1} was paid all the same.
    expect(named(game, "Swamp", A).filter((id) => game.state.objects[id].tapped)).toHaveLength(1);
  });
});

describe("Gale, Waterdeep Prodigy", () => {
  it("an instant cast from hand lets you cast a sorcery card from your graveyard, exiled afterwards", () => {
    const { game, a } = table();
    spawn(game, "Gale, Waterdeep Prodigy");
    const divination = toGraveyard(game, "Divination");
    const instant = toGraveyard(game, "Opt");
    lands(game, "Island", 4);
    const seen = { offered: [] as readonly (ObjectId | PlayerId)[] };
    a.chooseTargetsFn = (_view, _source, _specs, legalOptions) => {
      seen.offered = legalOptions[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [ref(divination)];
    };
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: divination, targets: [], via: "effect" });
    const before = hand(game).length;
    cast(game, toHand(game, "Opt"));
    // Only the card of the other type was a target.
    expect(seen.offered).toContain(divination);
    expect(seen.offered).not.toContain(instant);
    expect(zone(game, divination)).toBe("exile");
    // Opt drew one, Divination two.
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Tend the Pests", () => {
  it("a copy makes as many Pests as the original's sacrificed creature had power", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const tend = toHand(game, "Tend the Pests");
    cast(game, tend, { sacrifice: giant, settle: false });
    game.debugApplyEffect(A, { kind: "copy-spell", target: 0 }, [ref(tend)]);
    settle(game);
    expect(tokensNamed(game, "Pest Token", A)).toBe(6);
  });
});

describe("Bigger on the Inside", () => {
  it("the target player gets the mana and their next spell has cascade", () => {
    const { game } = table();
    const ring = spawn(game, "Darksteel Relic");
    lands(game, "Mountain", 3);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Bigger on the Inside"), { targets: [ref(ring)] });
    lands(game, "Island", 1, B);
    const opt = toHand(game, "Opt", B);
    activate(game, ring, 0, { targets: [ref(B)] });
    const pool = (p: PlayerId): number => game.state.players[p].manaPool.length;
    expect(pool(B)).toBe(2);
    expect(pool(A)).toBe(0);
    game.advanceUntil((s) => s.priority.holder === B);
    cast(game, opt, { player: B, settle: false });
    // Bob's Opt and its cascade trigger.
    expect(game.state.zones.shared.stack.length + game.state.pendingTriggers.length).toBe(2);
  });
});

describe("South Pole Voyager", () => {
  it("its own entry and another Ally's are the same ability's two resolutions", () => {
    const { game } = table();
    enter(game, "South Pole Voyager");
    expect(life(game)).toBe(21);
    const before = hand(game).length;
    enter(game, "Oran-Rief Survivalist");
    expect(life(game)).toBe(22);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Gemcutter Buccaneer", () => {
  it("a Treasure is Equipment with equip Pirate {1} and gives +2/+0", () => {
    const { game } = table();
    const buccaneer = enter(game, "Gemcutter Buccaneer");
    const treasure = named(game, "Treasure Token", A)[0];
    expect(game.state.objects[treasure].tapped).toBe(true);
    expect(subtypes(game, treasure)).toContain("Equipment");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    // Equip Pirate can't reach a non-Pirate.
    expect(() => activate(game, treasure, 1, { targets: [ref(bears)] })).toThrow(/target/i);
    activate(game, treasure, 1, { targets: [ref(buccaneer)] });
    expect(pt(game, buccaneer)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("The Myriad Pools", () => {
  it("another permanent you control becomes a copy of the spell cast with its mana", () => {
    const { game, a } = table();
    const well = spawn(game, "The Everflowing Well");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(well)]);
    settle(game);
    const ring = spawn(game, "Darksteel Relic");
    pickTargets(a, ring);
    cast(game, toHand(game, "Flying Men"));
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game);
    expect(types(game, ring)).not.toContain("creature");
  });
});

describe("Shredder, Shadow Master", () => {
  it("a nonlegendary copy attacks each other opponent and is sacrificed at end of combat", () => {
    const { game, a } = table({ players: 3 });
    const shredder = spawn(game, "Shredder, Shadow Master");
    attack(game, a, [shredder], B);
    // 5 combat damage, then half of the 15 left, rounded up — to each.
    expect(life(game, B)).toBe(7);
    expect(life(game, C)).toBe(7);
    expect(named(game, "Shredder, Shadow Master")).toEqual([shredder]);
  });
});

describe("Doomsday Excruciator", () => {
  it("cast, it leaves each library its bottom six cards, the rest exiled face down", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bottom = library(game, B).slice(0, 1)[0];
    cast(game, toHand(game, "Doomsday Excruciator"));
    expect(library(game, A)).toHaveLength(6);
    expect(library(game, B)).toHaveLength(6);
    const exiled = game.state.zones.shared.exile.map((id) => game.state.objects[id]);
    expect(exiled.length).toBeGreaterThan(40);
    expect(exiled.every((o) => o.exiledFaceDown !== undefined)).toBe(true);
    expect(bottom).toBeDefined();
  });

  it("put onto the battlefield without being cast, it exiles nothing", () => {
    const { game } = table();
    const size = library(game, B).length;
    enter(game, "Doomsday Excruciator");
    expect(library(game, B)).toHaveLength(size);
  });
});

describe("Rampant Frogantua", () => {
  it("gets +10/+10 for a player who has lost", () => {
    const { game } = table({ players: 3 });
    const frog = spawn(game, "Rampant Frogantua");
    expect(pt(game, frog)).toEqual({ power: 3, toughness: 3 });
    game.debugApplyEffect(A, { kind: "lose-game", target: 0 }, [ref(C)]);
    settle(game);
    expect(pt(game, frog)).toEqual({ power: 13, toughness: 13 });
  });

  it("mills that many and puts any number of the lands among them onto the battlefield tapped", () => {
    const { game, a } = table();
    const frog = spawn(game, "Rampant Frogantua");
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    attack(game, a, [frog], B);
    const wastes = named(game, "Wastes", A);
    expect(wastes).toHaveLength(3);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Szat's Will", () => {
  it("makes a Thrull for the greatest power among the creature cards exiled", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Craw Wurm", A);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Szat's Will"), { modes: [1] });
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Thrull Token", A)).toBe(3);
  });
});

describe("Greymond, Avacyn's Stalwart", () => {
  it("Humans have the chosen pair, and +2/+2 with four Humans", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const greymond = toHand(game, "Greymond, Avacyn's Stalwart");
    cast(game, greymond);
    const chosen = game.state.objects[greymond].chosenOnEnter;
    expect(["first strike and vigilance", "first strike and lifelink", "vigilance and lifelink"]).toContain(chosen);
    const vanguard = spawn(game, "Elite Vanguard");
    spawn(game, "Elite Vanguard");
    const has = ["first-strike", "vigilance", "lifelink"].filter((k) => keywords(game, vanguard).has(k));
    expect(has.join(" and ").replace("first-strike", "first strike")).toBe(chosen);
    expect(pt(game, vanguard)).toEqual({ power: 2, toughness: 1 });
    spawn(game, "Elite Vanguard");
    expect(pt(game, vanguard)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, greymond)).toEqual({ power: 5, toughness: 6 });
  });
});

describe("Yasharn, Implacable Earth", () => {
  it("stops a nonland sacrifice or life as a cost, and lets a land be sacrificed", () => {
    const { game } = table();
    const greed = spawn(game, "Greed");
    const altar = spawn(game, "Ashnod's Altar");
    const bears = spawn(game, "Grizzly Bears");
    const tower = spawn(game, "Crystal Vein");
    lands(game, "Swamp", 1);
    spawn(game, "Yasharn, Implacable Earth", B);
    expect(() => activate(game, greed, 0)).toThrow();
    expect(() => activate(game, altar, 0, { sacrifice: bears })).toThrow();
    // Crystal Vein: "{T}, Sacrifice this land: Add {C}{C}."
    activate(game, tower, 1);
    expect(zone(game, tower)).toBe("graveyard");
  });
});

describe("Agatha of the Vile Cauldron", () => {
  it("takes her power off a creature's activation cost, never below one mana", () => {
    const { game } = table();
    const agatha = spawn(game, "Agatha of the Vile Cauldron");
    lands(game, "Mountain", 3);
    lands(game, "Forest", 1);
    // Power 1: {4}{R}{G} costs {3}{R}{G}, more than four lands.
    expect(() => activate(game, agatha, 0)).toThrow();
    addCounters(game, agatha, "+1/+1", 1);
    // Power 2: {2}{R}{G}.
    activate(game, agatha, 0);
    const untapped = named(game, "Mountain", A).concat(named(game, "Forest", A)).filter((id) => !game.state.objects[id].tapped);
    expect(untapped).toHaveLength(0);
  });
});

describe("Aether Refinery", () => {
  it("doubles the {E} you get", () => {
    const { game } = table();
    const refinery = spawn(game, "Aether Refinery");
    activate(game, refinery, 0, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    expect(game.canDispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 } as Action)).not.toBeNull();
    payX(game, 2);
    settle(game);
    const token = named(game, "Aetherborn Token", A)[0];
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Raul, Trouble Shooter", () => {
  it("lets you cast a card milled this turn, not one that was already there", () => {
    const { game } = table();
    const raul = spawn(game, "Raul, Trouble Shooter");
    const old = toGraveyard(game, "Grizzly Bears");
    const top = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    activate(game, raul, 0);
    expect(zone(game, top)).toBe("graveyard");
    expect(() => castOffered(game, old)).toThrow(/not offered/);
    castOffered(game, top);
    expect(zone(game, top)).toBe("battlefield");
  });
});

describe("Serra the Benevolent", () => {
  it("the emblem keeps your life at 1 only while you control a creature", () => {
    const { game } = table();
    const serra = spawn(game, "Serra the Benevolent");
    loyalty(game, serra, -6, { atLeast: 6 });
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "damage", amount: 30, target: 0 }, [ref(A)]);
    expect(life(game)).toBe(1);
    game.debugMove(bears, "graveyard");
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(A)]);
    expect(life(game)).toBe(-4);
  });
});

describe("The Lost and the Damned", () => {
  it("a land from the library makes a Spawn; a spell or a land from hand doesn't", () => {
    const { game, a } = table();
    spawn(game, "The Lost and the Damned");
    lands(game, "Forest", 2);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Rampant Growth"));
    expect(tokensNamed(game, "Spawn Token", A)).toBe(1);
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Forest") });
    settle(game);
    expect(tokensNamed(game, "Spawn Token", A)).toBe(1);
  });
});

describe("Thada Adel, Acquisitor", () => {
  it("exiles an artifact from that player's library, playable this turn", () => {
    const { game, a } = table();
    const thada = spawn(game, "Thada Adel, Acquisitor");
    const ring = toLibrary(game, "Sol Ring", B);
    lands(game, "Island", 1);
    pickFromZone(a, ring);
    attack(game, a, [thada], B);
    expect(zone(game, ring)).toBe("exile");
    castOffered(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.objects[ring].controller).toBe(A);
  });
});

describe("Display of Power", () => {
  it("copies each target spell", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bolt = toHand(game, "Lightning Bolt");
    const shock = toHand(game, "Shock");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Display of Power"), { targets: [ref(bolt), ref(shock)] });
    expect(life(game, B)).toBe(10);
  });
});

describe("Raphael, Fiendish Savior", () => {
  it("makes a Devil at the end step of a turn a creature card went to your graveyard", () => {
    const { game } = table();
    spawn(game, "Raphael, Fiendish Savior");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Devil Token", A)).toBe(0);
    toStep(game, "precombat-main");
    destroy(game, bears);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Devil Token", A)).toBe(1);
  });
});

describe("Brotherhood Headquarters", () => {
  it("its coloured mana pays for a spell that has freerunning, and not for another", () => {
    const { game } = table();
    spawn(game, "Brotherhood Headquarters");
    lands(game, "Wastes", 4);
    expect(() => cast(game, toHand(game, "Divination"))).toThrow();
    const before = hand(game).length;
    cast(game, toHand(game, "Eagle Vision"));
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Price of Glory", () => {
  it("destroys a land tapped for mana on another player's turn only", () => {
    const { game } = table();
    spawn(game, "Price of Glory");
    const mine = spawn(game, "Forest");
    const theirs = spawn(game, "Forest", B);
    activate(game, mine, 0);
    expect(zone(game, mine)).toBe("battlefield");
    game.advanceUntil((s) => s.priority.holder === B);
    activate(game, theirs, 0, { player: B });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Ephara, God of the Polis", () => {
  it("draws at the upkeep after a turn another creature entered under your control", () => {
    const { game } = table();
    spawn(game, "Ephara, God of the Polis");
    enter(game, "Grizzly Bears");
    const before = hand(game).length;
    nextTurn(game); // Bob's turn: a creature entered last turn.
    expect(hand(game).length).toBe(before + 1);
    nextTurn(game); // Alice's: none entered during Bob's — only her draw step's card.
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Dream Harvest", () => {
  it("lets you cast the exiled cards without paying, this turn", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears", B);
    const angel = toLibrary(game, "Serra Angel", B);
    lands(game, "Island", 7);
    cast(game, toHand(game, "Dream Harvest"));
    // Serra Angel's 5 reaches the total: the Bears under it stay.
    expect(zone(game, angel)).toBe("exile");
    expect(game.state.zones.shared.exile).toHaveLength(1);
    expect(named(game, "Island", A).every((id) => game.state.objects[id].tapped)).toBe(true);
    castOffered(game, angel);
    expect(zone(game, angel)).toBe("battlefield");
    expect(game.state.objects[angel].controller).toBe(A);
  });
});

describe("Life // Death", () => {
  it("Life makes your lands 1/1 creatures until end of turn", () => {
    const { game } = table();
    const forest = lands(game, "Forest", 2)[1];
    cast(game, toHand(game, "Life // Death"), { face: 1 });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, forest)).toEqual({ power: 1, toughness: 1 });
  });

  it("Death returns a creature card and costs life equal to its mana value", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Life // Death"), { face: 2, targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game)).toBe(16);
  });
});

describe("Response // Resurgence", () => {
  it("Resurgence in a main phase adds a combat phase", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Response // Resurgence"), { face: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    game.advanceUntil((s) => s.turn.step !== "postcombat-main");
    expect(game.state.turn.number).toBe(1);
    expect(game.state.turn.step).not.toBe("end");
  });
});

describe("Valkyrie's Call", () => {
  it("the creature returns as an Angel with flying and a +1/+1 counter", () => {
    const { game } = table();
    spawn(game, "Valkyrie's Call");
    destroy(game, spawn(game, "Grizzly Bears"));
    const back = named(game, "Grizzly Bears", A);
    expect(back).toHaveLength(1);
    expect(counters(game, back[0])).toBe(1);
    expect(subtypes(game, back[0])).toEqual(expect.arrayContaining(["Bear", "Angel"]));
    expect(keywords(game, back[0]).has("flying")).toBe(true);
    // An Angel now: it stays dead the next time.
    destroy(game, back[0]);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(graveyard(game)).toContain(back[0]);
  });
});

describe("Nissa of Shadowed Boughs", () => {
  it("−5 takes a creature card from the hand or the graveyard, by mana value", () => {
    const { game, a } = table();
    const nissa = spawn(game, "Nissa of Shadowed Boughs");
    lands(game, "Forest", 2);
    const inHand = toHand(game, "Grizzly Bears");
    const inYard = toGraveyard(game, "Grizzly Bears");
    const tooBig = toGraveyard(game, "Craw Wurm");
    pickModes(a, 0);
    const seen = pickFromZone(a, inHand);
    loyalty(game, nissa, -5, { atLeast: 5 });
    expect(seen.offered).toEqual(expect.arrayContaining([inHand, inYard]));
    expect(seen.offered).not.toContain(tooBig);
    expect(zone(game, inHand)).toBe("battlefield");
    expect(counters(game, inHand)).toBe(2);
  });
});

describe("Mercurial Spelldancer", () => {
  it("removing two oil counters copies the next instant or sorcery", () => {
    const { game, a } = table();
    const dancer = spawn(game, "Mercurial Spelldancer");
    addCounters(game, dancer, "oil", 2);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    attack(game, a, [dancer], B);
    expect(counters(game, dancer, "oil")).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
  });

  it("with one oil counter there is nothing to remove and no copy", () => {
    const { game, a } = table();
    const dancer = spawn(game, "Mercurial Spelldancer");
    addCounters(game, dancer, "oil", 1);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    attack(game, a, [dancer], B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(counters(game, dancer, "oil")).toBe(2);
  });
});
