/**
 * Set walk batch 89, part b (2026-10-16): The Big Score (BIG), Outlaws of Thunder Junction Commander (OTC) and Outlaws of Thunder Junction (OTJ), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
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
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

type SacrificeOffer = Extract<LegalAction, { kind: "sacrifice" }>;

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const makeTokens = (game: Game, name: string, count: number, player: PlayerId = A): ObjectId[] => {
  const before = new Set(game.state.zones.shared.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count });
  return game.state.zones.shared.battlefield.filter((id) => !before.has(id));
};
const manaPool = (game: Game): string[] => game.state.players[A].manaPool.map((unit) => unit.type).sort();
const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Malcolm, the Eyes", () => {
  it("investigates on your second spell each turn, not the first", () => {
    const { game } = table();
    spawn(game, "Malcolm, the Eyes");
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Hellspur Posse Boss", () => {
  it("makes two Mercenaries, which have haste; it and non-outlaws don't", () => {
    const { game } = table();
    const boss = enter(game, "Hellspur Posse Boss");
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(2);
    for (const merc of tokensOf(game, "Mercenary Token")) {
      expect(keywords(game, merc).has("haste")).toBe(true);
      expect(pt(game, merc)).toEqual({ power: 1, toughness: 1 });
    }
    expect(keywords(game, boss).has("haste")).toBe(false);
    expect(keywords(game, spawn(game, "Grizzly Bears")).has("haste")).toBe(false);
    // An opponent's outlaw isn't yours.
    expect(keywords(game, spawn(game, "Nezumi Linkbreaker", B)).has("haste")).toBe(false);
    expect(keywords(game, spawn(game, "Nezumi Linkbreaker")).has("haste")).toBe(true);
  });
});

describe("Wylie Duke, Atiin Hero", () => {
  it("gains 1 life and draws whenever it becomes tapped", () => {
    const { game } = table();
    const wylie = spawn(game, "Wylie Duke, Atiin Hero");
    const before = hand(game).length;
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(wylie)]);
    settle(game);
    expect(life(game)).toBe(21);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Slick Sequence", () => {
  it("deals 2 and draws when you've cast another spell this turn", () => {
    const { game } = table();
    lands(game, "Volcanic Island", 2);
    cast(game, toHand(game, "Ornithopter"));
    const before = hand(game).length;
    cast(game, toHand(game, "Slick Sequence"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before + 1);
  });

  it("deals 2 and doesn't draw as the turn's only spell", () => {
    const { game } = table();
    lands(game, "Volcanic Island", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Slick Sequence"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before);
  });
});

describe("Breeches, the Blastmaker", () => {
  it("sacrificing an artifact flips: a win copies the second spell, a loss deals its mana value", () => {
    const outcomes = new Set<boolean>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, a } = table({ seed });
      spawn(game, "Breeches, the Blastmaker");
      const ring = spawn(game, "Sol Ring");
      lands(game, "Forest", 2);
      cast(game, toHand(game, "Ornithopter"));
      pickModes(a, 0);
      pickTargets(a, B);
      cast(game, toHand(game, "Grizzly Bears"));
      expect(zone(game, ring)).toBe("graveyard");
      const flips = game.eventsOfType("coin-flipped");
      expect(flips).toHaveLength(1);
      const won = flips[0].won;
      outcomes.add(won);
      // The copy of a creature spell resolves as a token Grizzly Bears.
      expect(tokensOf(game, "Grizzly Bears")).toHaveLength(won ? 1 : 0);
      expect(named(game, "Grizzly Bears", A)).toHaveLength(won ? 2 : 1);
      // Grizzly Bears' mana value is 2.
      expect(life(game, B)).toBe(won ? 20 : 18);
    }
    expect(outcomes).toEqual(new Set([true, false]));
  });

  it("doesn't flip without a sacrifice, nor on the first spell", () => {
    const { game, a } = table();
    spawn(game, "Breeches, the Blastmaker");
    const ring = spawn(game, "Sol Ring");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    expect(zone(game, ring)).toBe("battlefield");
    pickModes(a);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.eventsOfType("coin-flipped")).toHaveLength(0);
  });
});

describe("Geyser Drake", () => {
  it("makes your spells {1} cheaper during other players' turns only", () => {
    const { game } = table();
    spawn(game, "Geyser Drake");
    lands(game, "Mountain", 1);
    const strike = toHand(game, "Lightning Strike");
    expect(() => cast(game, strike, { targets: [ref(B)] })).toThrow();
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    cast(game, strike, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Rustler Rampage", () => {
  it("both modes: untaps every creature target player controls, and grants double strike", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const mine = [spawn(game, "Grizzly Bears", A, { tapped: true }), spawn(game, "Hill Giant", A, { tapped: true })];
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const target = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rustler Rampage"), { modes: [0, 1], targets: [ref(A), ref(target)] });
    expect(mine.map((id) => isTapped(game, id))).toEqual([false, false]);
    expect(isTapped(game, theirs)).toBe(true);
    expect(keywords(game, target).has("double-strike")).toBe(true);
  });

  it("one mode costs {W}{1}", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Rustler Rampage"), { modes: [1], targets: [ref(bears)] });
    expect(keywords(game, bears).has("double-strike")).toBe(true);
  });
});

describe("This Town Ain't Big Enough", () => {
  it("costs {3} less targeting a permanent you control, and returns both", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const ring = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "This Town Ain't Big Enough"), { targets: [ref(ring), ref(bears)] });
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B)).toContain(bears);
  });

  it("costs full price targeting only an opponent's permanent", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "This Town Ain't Big Enough"), { targets: [ref(bears), null] })).toThrow();
    lands(game, "Island", 3);
    cast(game, toHand(game, "This Town Ain't Big Enough"), { targets: [ref(bears), null] });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Kraum, Violent Cacophony", () => {
  it("grows and draws on your second spell each turn", () => {
    const { game } = table();
    const kraum = spawn(game, "Kraum, Violent Cacophony");
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, kraum)).toBe(0);
    const before = hand(game).length;
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, kraum)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    expect(pt(game, kraum)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Holy Cow", () => {
  it("gains 2 life as it enters", () => {
    const { game } = table();
    enter(game, "Holy Cow");
    expect(life(game)).toBe(22);
  });
});

describe("Nezumi Linkbreaker", () => {
  it("leaves a Mercenary when it dies", () => {
    const { game } = table();
    const rat = spawn(game, "Nezumi Linkbreaker");
    destroy(game, rat);
    settle(game);
    const [merc] = tokensOf(game, "Mercenary Token");
    expect(merc).toBeDefined();
    expect(pt(game, merc)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Jolene, Plundering Pugilist", () => {
  it("makes a Treasure when you attack with a power-4 creature, and pings by sacrificing one", () => {
    const { game, a } = table();
    const jolene = spawn(game, "Jolene, Plundering Pugilist");
    attack(game, a, [jolene]);
    expect(life(game, B)).toBe(16);
    const [treasure] = tokensOf(game, "Treasure Token");
    expect(treasure).toBeDefined();
    lands(game, "Mountain", 2);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: jolene,
      abilityIndex: 0,
      targets: [ref(B)],
      sacrifice: treasure,
    });
    settle(game);
    expect(life(game, B)).toBe(15);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("makes nothing for an attack without a creature of power 4 or greater", () => {
    const { game, a } = table();
    spawn(game, "Jolene, Plundering Pugilist");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Ghired, Mirror of the Wilds", () => {
  it("gives nontoken creatures a {T} copy of a token that entered this turn", () => {
    const { game } = table();
    const ghired = spawn(game, "Ghired, Mirror of the Wilds");
    const bears = spawn(game, "Grizzly Bears");
    const [merc] = makeTokens(game, "Mercenary Token", 1);
    activate(game, bears, 0, { targets: [ref(merc)] });
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(2);
    expect(isTapped(game, bears)).toBe(true);
    // Ghired has it too, and haste.
    activate(game, ghired, 0, { targets: [ref(merc)] });
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(3);
  });

  it("not on a token, nor targeting one that entered on an earlier turn", () => {
    const { game } = table();
    spawn(game, "Ghired, Mirror of the Wilds");
    const bears = spawn(game, "Grizzly Bears");
    const [merc] = makeTokens(game, "Mercenary Token", 1);
    nextTurn(game);
    nextTurn(game);
    // Alice's next turn: the Mercenary entered two turns ago.
    expect(() => activate(game, bears, 0, { targets: [ref(merc)] })).toThrow();
    // The token, no longer summoning sick, has only its own ability.
    const tokenOffers = game
      .legalActions(A)
      .filter((o) => o.kind === "activate-ability" && "source" in o && o.source === merc);
    expect(tokenOffers.map((o) => (o as { abilityIndex: number }).abilityIndex)).toEqual([0]);
    // A new token is fine.
    const [fresh] = makeTokens(game, "Mercenary Token", 1);
    activate(game, bears, 0, { targets: [ref(fresh)] });
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(3);
  });
});

describe("Gold Rush", () => {
  it("makes a Treasure, then +2/+2 for each Treasure you control, the new one included", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    makeTokens(game, "Treasure Token", 1);
    makeTokens(game, "Treasure Token", 1, B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Gold Rush"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });

  it("still makes the Treasure with no target", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Gold Rush"), { targets: [null] });
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Vial Smasher, Gleeful Grenadier", () => {
  it("pings the opponent whenever another outlaw you control enters", () => {
    const { game } = table();
    spawn(game, "Vial Smasher, Gleeful Grenadier");
    enter(game, "Nezumi Linkbreaker");
    expect(life(game, B)).toBe(19);
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(19);
    enter(game, "Nezumi Linkbreaker", B);
    expect(life(game, B)).toBe(19);
    makeTokens(game, "Mercenary Token", 1);
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("Intrepid Stablemaster", () => {
  it("taps for {G}, or two mana of one color only for Mount or Vehicle spells", () => {
    const { game } = table();
    const master = spawn(game, "Intrepid Stablemaster");
    game.dispatch({ type: "activate-ability", player: A, source: master, abilityIndex: 1, targets: [], manaColors: ["B"] });
    expect(manaPool(game)).toEqual(["B", "B"]);
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
    const copter = toHand(game, "Smuggler's Copter");
    cast(game, copter);
    expect(zone(game, copter)).toBe("battlefield");
  });

  it("its {G} pays for anything", () => {
    const { game } = table();
    spawn(game, "Intrepid Stablemaster");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Tomb Trawler", () => {
  it("puts a card from your graveyard on the bottom of your library", () => {
    const { game } = table();
    const trawler = spawn(game, "Tomb Trawler");
    lands(game, "Wastes", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, trawler, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    expect(library(game).at(-1)).toBe(bears);
    expect(graveyard(game)).not.toContain(bears);
  });
});

describe("Akul the Unrepentant", () => {
  it("sacrifices three other creatures to put a creature card from your hand onto the battlefield", () => {
    const { game, a } = table();
    const akul = spawn(game, "Akul the Unrepentant");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    spawn(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    activate(game, akul, 0, { settle: false });
    const offer = game.legalActions(A).find((o): o is SacrificeOffer => o.kind === "sacrifice");
    expect(offer?.count).toBe(3);
    expect(offer?.eligible).not.toContain(akul);
    game.dispatch({ type: "sacrifice", player: A, permanents: bears });
    pickFromZone(a, giant);
    settle(game);
    expect(bears.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, akul)).toBe("battlefield");
    // Only once each turn.
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, akul, 0, { settle: false })).toThrow();
  });

  it("can't use itself as one of the three, and only as a sorcery", () => {
    const { game } = table();
    const akul = spawn(game, "Akul the Unrepentant");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, akul, 0, { settle: false })).toThrow();
    const upkeep = table({ step: "upkeep" }).game;
    const other = spawn(upkeep, "Akul the Unrepentant");
    for (let i = 0; i < 3; i++) spawn(upkeep, "Grizzly Bears");
    expect(() => activate(upkeep, other, 0, { settle: false })).toThrow();
  });
});
