/**
 * Set walk batch 89, part h (2026-10-16): the plot and crime cards of Outlaws of Thunder Junction (OTJ), its Commander decks (OTC) and The Big Score (BIG).
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
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
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
  zone,
} from "./harness.js";

/** Commit a crime: Alice's Lightning Bolt at `target` (Bob by default). */
const bolt = (game: Game, target: PlayerId | ObjectId = B): ObjectId => {
  lands(game, "Mountain", 1);
  const card = toHand(game, "Lightning Bolt");
  cast(game, card, { targets: [ref(target)] });
  return card;
};

const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

/** The seat answers each mode question in turn with the next of `answers`
 * (a `may` is a mode question too: `[0]` is yes, `[]` no). */
const answerModes = (seat: ScriptedController, ...answers: number[][]): void => {
  const queue = [...answers];
  seat.chooseModesFn = () => queue.shift() ?? [];
};

describe("Marchesa, Dealer of Death", () => {
  it("on a crime, pay {1}: one of the top two into your hand, the other into your graveyard", () => {
    const { game, a } = table();
    spawn(game, "Marchesa, Dealer of Death");
    lands(game, "Island", 1);
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Craw Wurm");
    pickModes(a, 0);
    pickFromZone(a, second);
    bolt(game);
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, first)).toBe("graveyard");
  });

  it("declined, or not a crime, nothing moves", () => {
    const { game, a } = table();
    spawn(game, "Marchesa, Dealer of Death");
    lands(game, "Island", 1);
    const top = toLibrary(game, "Craw Wurm");
    pickModes(a);
    bolt(game);
    expect(zone(game, top)).toBe("library");
    // Bolting her own creature isn't a crime: not even asked.
    pickModes(a, 0);
    bolt(game, spawn(game, "Grizzly Bears"));
    expect(zone(game, top)).toBe("library");
  });
});

describe("Railway Brawler", () => {
  it("puts X +1/+1 counters on another creature you control as it enters, X its power", () => {
    const { game } = table();
    const brawler = spawn(game, "Railway Brawler");
    const wurm = enter(game, "Craw Wurm");
    expect(counters(game, wurm)).toBe(6);
    expect(pt(game, wurm)).toEqual({ power: 12, toughness: 10 });
    expect(counters(game, brawler)).toBe(0);
    // An opponent's creature: nothing.
    const theirs = enter(game, "Grizzly Bears", B);
    expect(counters(game, theirs)).toBe(0);
  });

  it("can be plotted for {3}{G}", () => {
    const { game } = table();
    const brawler = toHand(game, "Railway Brawler");
    lands(game, "Forest", 4);
    const offer = game.legalActions(A).find((a) => a.kind === "plot" && a.card === brawler);
    expect(offer).toMatchObject({ cost: "{3}{G}" });
    game.dispatch({ type: "plot", player: A, card: brawler });
    settle(game);
    expect(zone(game, brawler)).toBe("exile");
    expect(game.state.objects[brawler].plottedOnTurn).toBe(game.state.turn.number);
  });
});

describe("Outcaster Trailblazer", () => {
  it("adds one mana of any color as it enters", () => {
    const { game, a } = table();
    pickModes(a, 4);
    enter(game, "Outcaster Trailblazer");
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G"]);
  });

  it("draws for another creature you control with power 4 or greater, not itself or a smaller one", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Outcaster Trailblazer");
    expect(hand(game).length).toBe(before);
    enter(game, "Grizzly Bears");
    expect(hand(game).length).toBe(before);
    enter(game, "Craw Wurm");
    expect(hand(game).length).toBe(before + 1);
    enter(game, "Craw Wurm", B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Highway Robbery", () => {
  it("discard a card: draw two", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const robbery = toHand(game, "Highway Robbery");
    const fodder = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [fodder];
    const before = hand(game).length;
    answerModes(a, [0], [0]);
    cast(game, robbery);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 2 + 2);
  });

  it("sacrifice a land: draw two", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const robbery = toHand(game, "Highway Robbery");
    const before = hand(game).length;
    answerModes(a, [0], [1]);
    cast(game, robbery);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Mountain"))
      .toHaveLength(2);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Mountain")).toHaveLength(1);
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("declined: no draw", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const robbery = toHand(game, "Highway Robbery");
    const before = hand(game).length;
    answerModes(a, []);
    cast(game, robbery);
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Lock and Load", () => {
  it("draws one alone", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const load = toHand(game, "Lock and Load");
    const before = hand(game).length;
    cast(game, load);
    expect(hand(game).length).toBe(before - 1 + 1);
  });

  it("draws one more for each other instant and sorcery spell cast this turn, not creatures", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    bolt(game);
    bolt(game);
    cast(game, toHand(game, "Grizzly Bears"));
    const load = toHand(game, "Lock and Load");
    const before = hand(game).length;
    cast(game, load);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});

describe("Pitiless Carnage", () => {
  it("sacrifices any number of your permanents, then draws that many", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const kept = spawn(game, "Craw Wurm");
    const seen = pickPermanents(a, ...bears);
    const carnage = toHand(game, "Pitiless Carnage");
    const before = hand(game).length;
    cast(game, carnage);
    expect(seen.offered).toContain(kept);
    expect(bears.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(zone(game, kept)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("zero is a choice: nothing sacrificed, nothing drawn", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bear = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    const carnage = toHand(game, "Pitiless Carnage");
    const before = hand(game).length;
    cast(game, carnage);
    expect(zone(game, bear)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("Demonic Ruckus", () => {
  it("gives +1/+1, menace and trample, and draws when it goes to the graveyard from the battlefield", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bear = spawn(game, "Grizzly Bears");
    const ruckus = toHand(game, "Demonic Ruckus");
    cast(game, ruckus, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("menace")).toBe(true);
    expect(keywords(game, bear).has("trample")).toBe(true);
    const before = hand(game).length;
    // The creature dies to a Bolt; the Aura goes with it (state-based).
    bolt(game, bear);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, ruckus)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Magda, the Hoardmaster", () => {
  it("makes one tapped Treasure for a crime, once each turn", () => {
    const { game } = table();
    spawn(game, "Magda, the Hoardmaster");
    bolt(game);
    bolt(game);
    const treasures = tokensOf(game, "Treasure Token");
    expect(treasures).toHaveLength(1);
    expect(isTapped(game, treasures[0])).toBe(true);
    nextTurn(game);
    nextTurn(game);
    bolt(game);
    expect(tokensOf(game, "Treasure Token")).toHaveLength(2);
  });

  it("sacrifices three Treasures for a 4/4 flying, hasty Scorpion Dragon, as a sorcery", () => {
    const { game } = table();
    const magda = spawn(game, "Magda, the Hoardmaster");
    for (let i = 0; i < 3; i += 1) game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    expect(() => activate(game, magda)).toThrow();
    nextTurn(game);
    nextTurn(game);
    activate(game, magda);
    expect(tokensOf(game, "Treasure Token")).toHaveLength(0);
    const [dragon] = tokensOf(game, "Scorpion Dragon Token");
    expect(pt(game, dragon)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, dragon).has("flying")).toBe(true);
    expect(keywords(game, dragon).has("haste")).toBe(true);
  });

  it("two Treasures aren't enough", () => {
    const { game } = table();
    const magda = spawn(game, "Magda, the Hoardmaster");
    for (let i = 0; i < 2; i += 1) game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    expect(() => activate(game, magda)).toThrow();
  });
});

describe("Forsaken Miner", () => {
  it("returns from your graveyard when you commit a crime and pay {B}", () => {
    const { game, a } = table();
    const miner = toGraveyard(game, "Forsaken Miner");
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    bolt(game);
    expect(zone(game, miner)).toBe("battlefield");
  });

  it("declined, or not a crime, it stays", () => {
    const { game, a } = table();
    const miner = toGraveyard(game, "Forsaken Miner");
    lands(game, "Swamp", 1);
    pickModes(a);
    bolt(game);
    expect(zone(game, miner)).toBe("graveyard");
    pickModes(a, 0);
    bolt(game, A);
    expect(zone(game, miner)).toBe("graveyard");
  });

  it("sacrificed to pay the cost of the spell that is the crime, it still triggers (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 1);
    const miner = spawn(game, "Forsaken Miner");
    pickModes(a, 0);
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: toHand(game, "Fling"),
      targets: [{ kind: "player", player: B }],
      sacrifice: miner,
    });
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(zone(game, miner)).toBe("battlefield");
  });
});

describe("Gisa, the Hellraiser", () => {
  it("makes two tapped 2/2 Zombie Rogues for a crime, once each turn; your Skeletons and Zombies get +1/+1 and menace", () => {
    const { game } = table();
    spawn(game, "Gisa, the Hellraiser");
    bolt(game);
    bolt(game);
    const zombies = tokensOf(game, "Zombie Rogue Token");
    expect(zombies).toHaveLength(2);
    for (const zombie of zombies) {
      expect(isTapped(game, zombie)).toBe(true);
      expect(pt(game, zombie)).toEqual({ power: 3, toughness: 3 });
      expect(keywords(game, zombie).has("menace")).toBe(true);
    }
    const skeleton = spawn(game, "Forsaken Miner");
    expect(pt(game, skeleton)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, skeleton).has("menace")).toBe(true);
    // Not an opponent's, and not a non-Zombie.
    const theirs = spawn(game, "Forsaken Miner", B);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    const bear = spawn(game, "Grizzly Bears");
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
  });

  it("has ward—{2}, pay 2 life", () => {
    const { game } = table();
    const gisa = spawn(game, "Gisa, the Hellraiser");
    nextTurn(game);
    // Bob can't pay {2}: his Bolt is countered.
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(gisa)] });
    expect(game.state.objects[gisa].damageMarked).toBe(0);
  });
});

describe("Bandit's Haul", () => {
  it("gets a loot counter for a crime, once each turn; {2}, {T}, remove two: draw", () => {
    const { game } = table();
    const haul = spawn(game, "Bandit's Haul");
    bolt(game);
    bolt(game);
    expect(counters(game, haul, "loot")).toBe(1);
    expect(() => activate(game, haul, 1)).toThrow();
    nextTurn(game);
    nextTurn(game);
    bolt(game);
    expect(counters(game, haul, "loot")).toBe(2);
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    activate(game, haul, 1);
    expect(counters(game, haul, "loot")).toBe(0);
    expect(hand(game).length).toBe(before + 1);
    expect(isTapped(game, haul)).toBe(true);
  });

  it("taps for one mana of any color", () => {
    const { game } = table();
    const haul = spawn(game, "Bandit's Haul");
    game.dispatch({ type: "activate-ability", player: A, source: haul, abilityIndex: 0, targets: [], manaColors: ["B"] });
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["B"]);
  });
});

describe("Freestrider Lookout", () => {
  it("on a crime, once each turn, may put a land from the top five onto the battlefield tapped; the rest to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Freestrider Lookout");
    const spells = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Craw Wurm")];
    const forest = toLibrary(game, "Forest");
    const seen = pickFromZone(a, forest);
    bolt(game);
    expect(seen.offered).toContain(forest);
    for (const id of spells) expect(seen.offered).not.toContain(id);
    expect(zone(game, forest)).toBe("battlefield");
    expect(isTapped(game, forest)).toBe(true);
    const library = game.state.zones.perPlayer[A].library;
    // The rest (two spells, two Wastes) are now the bottom four.
    for (const id of spells) expect(library.slice(-4)).toContain(id);
    // Once each turn.
    const next = toLibrary(game, "Forest");
    pickFromZone(a, next);
    bolt(game);
    expect(zone(game, next)).toBe("library");
  });
});

describe("Kaervek, the Punisher", () => {
  it("on a crime, exiles a black card from your graveyard and you may cast a copy, paying its cost and 2 life", () => {
    const { game, a } = table();
    spawn(game, "Kaervek, the Punisher");
    const nighthawk = toGraveyard(game, "Vampire Nighthawk");
    lands(game, "Swamp", 3);
    pickTargets(a, nighthawk);
    const offered: ObjectId[][] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push([...offer.cards]);
      const way = offer.casts[0];
      return way === undefined ? null : { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via };
    };
    bolt(game);
    expect(offered).toHaveLength(1);
    expect(offered[0]).not.toContain(nighthawk);
    expect(zone(game, nighthawk)).toBe("exile");
    // The copy resolved as a token; its {1}{B}{B} was paid; 2 life lost.
    const copies = tokensOf(game, "Vampire Nighthawk");
    expect(copies).toHaveLength(1);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Swamp" && !isTapped(game, id)))
      .toHaveLength(0);
    expect(life(game)).toBe(18);
  });

  it("can't cast the copy without the mana: no life lost; declined, the card stays exiled", () => {
    const { game, a } = table();
    spawn(game, "Kaervek, the Punisher");
    const nighthawk = toGraveyard(game, "Vampire Nighthawk");
    pickTargets(a, nighthawk);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      return way === undefined ? null : { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via };
    };
    bolt(game);
    expect(zone(game, nighthawk)).toBe("exile");
    expect(tokensOf(game, "Vampire Nighthawk")).toHaveLength(0);
    expect(life(game)).toBe(20);
  });

  it("only black cards from your own graveyard", () => {
    const { game, a } = table();
    spawn(game, "Kaervek, the Punisher");
    const black = toGraveyard(game, "Vampire Nighthawk");
    const green = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Vampire Nighthawk", B);
    let options: readonly (ObjectId | PlayerId)[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      options = legal[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [null];
    };
    bolt(game);
    expect(options).toContain(black);
    expect(options).not.toContain(green);
    expect(options).not.toContain(theirs);
    expect(zone(game, black)).toBe("graveyard");
  });
});
