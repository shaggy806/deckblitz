/**
 * Set walk batch 89, part a (2026-10-16): The Big Score (BIG), Outlaws of Thunder Junction Commander (OTC) and Outlaws of Thunder Junction (OTJ), the rest of the sets.
 * Written on the shared table in `harness.ts`.
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
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
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
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string[] =>
  game.state.players[player].manaPool.map((unit) => unit.type).sort();
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const makeToken = (game: Game, name: string, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });

describe("Ancient Cornucopia", () => {
  it("gains 1 life for each of the spell's colours, only once a turn", () => {
    const { game, a } = table();
    spawn(game, "Ancient Cornucopia", A, { tapped: true });
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Watchwolf"));
    expect(life(game)).toBe(22);
    cast(game, toHand(game, "Savannah Lions"));
    expect(life(game)).toBe(22);
  });

  it("a colourless spell doesn't trigger it, and declining doesn't use up the turn's gain", () => {
    const { game, a } = table();
    spawn(game, "Ancient Cornucopia", A, { tapped: true });
    lands(game, "Plains", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return asked === 1 ? [] : [0];
    };
    cast(game, toHand(game, "Ornithopter"));
    expect(asked).toBe(0);
    cast(game, toHand(game, "Savannah Lions"));
    expect(asked).toBe(1);
    expect(life(game)).toBe(20);
    cast(game, toHand(game, "Watchwolf"));
    expect(life(game)).toBe(22);
  });
});

describe("Bristlebud Farmer", () => {
  it("enters with two Food; attacking, a sacrificed Food mills three and keeps a permanent card", () => {
    const { game, a } = table();
    const farmer = enter(game, "Bristlebud Farmer");
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Lightning Bolt");
    pickModes(a, 0);
    const seen = pickFromZone(a, bears);
    attack(game, a, [farmer]);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(graveyard(game).length).toBe(2);
    expect(life(game, B)).toBe(15);
  });

  it("mills nothing when no Food is sacrificed", () => {
    const { game, a } = table();
    const farmer = enter(game, "Bristlebud Farmer");
    pickModes(a);
    attack(game, a, [farmer]);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Tarnation Vista", () => {
  it("enters tapped", () => {
    const { game } = table();
    const vista = enter(game, "Tarnation Vista");
    expect(isTapped(game, vista)).toBe(true);
  });

  it("{1}, {T}: one mana of each colour among monocoloured permanents you control", () => {
    const { game } = table();
    const vista = spawn(game, "Tarnation Vista");
    game.state.objects[vista].tapped = false;
    lands(game, "Wastes", 1);
    spawn(game, "Llanowar Elves");
    spawn(game, "Savannah Lions");
    spawn(game, "Savannah Lions");
    spawn(game, "Watchwolf"); // green and white, but two colours
    spawn(game, "Ornithopter"); // colourless
    spawn(game, "Lightning Greaves", B);
    spawn(game, "Raging Goblin", B); // an opponent's red
    activate(game, vista, 1);
    expect(pool(game)).toEqual(["G", "W"]);
  });

  it("a multicoloured permanent alone makes nothing", () => {
    const { game } = table();
    const vista = spawn(game, "Tarnation Vista");
    game.state.objects[vista].tapped = false;
    lands(game, "Wastes", 1);
    spawn(game, "Watchwolf");
    activate(game, vista, 1);
    expect(pool(game)).toEqual([]);
  });
});

describe("Sandstorm Salvager", () => {
  it("makes a 3/3 Golem; {2}, {T} puts a counter on each creature token you control and gives them trample", () => {
    const { game } = table();
    const salvager = enter(game, "Sandstorm Salvager");
    const [golem] = tokensOf(game, "Golem Token");
    expect(pt(game, golem)).toEqual({ power: 3, toughness: 3 });
    makeToken(game, "Mercenary Token");
    const [merc] = tokensOf(game, "Mercenary Token");
    const bears = spawn(game, "Grizzly Bears");
    makeToken(game, "Mercenary Token", B);
    const [theirs] = tokensOf(game, "Mercenary Token", B);
    lands(game, "Wastes", 2);
    activate(game, salvager);
    expect(pt(game, golem)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, merc)).toBe(1);
    expect(keywords(game, golem).has("trample")).toBe(true);
    expect(keywords(game, merc).has("trample")).toBe(true);
    expect(counters(game, bears)).toBe(0);
    expect(keywords(game, bears).has("trample")).toBe(false);
    expect(counters(game, theirs)).toBe(0);
    expect(keywords(game, theirs).has("trample")).toBe(false);
    expect(counters(game, salvager)).toBe(0);
  });
});

describe("Loot, the Key to Everything", () => {
  it("exiles one card per card type among your other nonland permanents, playable this turn", () => {
    const { game } = table();
    spawn(game, "Loot, the Key to Everything");
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves"); // a second creature counts once
    spawn(game, "Sol Ring");
    spawn(game, "Anthem of Champions");
    spawn(game, "Darksteel Citadel"); // an artifact land: lands don't count
    spawn(game, "Dryad Arbor");
    spawn(game, "Sol Ring", B);
    spawn(game, "Anthem of Champions", B);
    const exiledBefore = game.state.zones.shared.exile.length;
    toStep(game, "upkeep");
    settle(game);
    const exiled = game.state.zones.shared.exile.filter((id) => game.state.objects[id].owner === A);
    expect(exiled.length - exiledBefore).toBe(3);
    // A Wastes exiled this way can be played in the main phase.
    toStep(game, "precombat-main");
    expect(game.legalActions(A).some((o) => o.kind === "play-land" && exiled.includes(o.card))).toBe(true);
  });

  it("doesn't count itself", () => {
    const { game } = table();
    spawn(game, "Loot, the Key to Everything");
    spawn(game, "Darksteel Citadel");
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.zones.shared.exile).toHaveLength(0);
  });
});

describe("Lotus Ring", () => {
  it("equipped creature gets +3/+3, vigilance, and sacrifices itself for three mana of one colour", () => {
    const { game } = table();
    const ring = spawn(game, "Lotus Ring");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, ring, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    game.dispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: 0, targets: [], manaColors: ["R"] });
    expect(pool(game)).toEqual(["R", "R", "R"]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Hostile Investigator", () => {
  it("makes an opponent discard, and investigates once a turn however many discards", () => {
    const { game, a } = table();
    const bobHand = hand(game, B).length;
    enter(game, "Hostile Investigator");
    expect(hand(game, B).length).toBe(bobHand - 1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("any player's discard triggers it", () => {
    const { game } = table();
    spawn(game, "Hostile Investigator");
    game.debugApplyEffect(B, { kind: "discard", target: "you", amount: 1 });
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Greed's Gambit", () => {
  it("enters: draw three, gain 6, three 2/1 flying Bats; leaving: discard three, lose 6, sacrifice three creatures", () => {
    const { game } = table();
    const before = hand(game).length;
    const gambit = enter(game, "Greed's Gambit");
    expect(hand(game).length).toBe(before + 3);
    expect(life(game)).toBe(26);
    const bats = tokensOf(game, "Bat Token (Greed's Gambit)");
    expect(bats).toHaveLength(3);
    expect(pt(game, bats[0])).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, bats[0]).has("flying")).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, gambit);
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(20);
    // Three of the four creatures go.
    expect(tokensOf(game, "Bat Token (Greed's Gambit)").length + (zone(game, bears) === "battlefield" ? 1 : 0)).toBe(1);
  });

  it("at your end step: discard a card, lose 2 life, sacrifice a creature", () => {
    const { game } = table();
    enter(game, "Greed's Gambit");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before - 1);
    expect(life(game)).toBe(24);
    expect(tokensOf(game, "Bat Token (Greed's Gambit)")).toHaveLength(2);
  });
});

describe("Harvester of Misery", () => {
  it("entering, gives the other creatures there -2/-2 until end of turn — not ones that enter later", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const wolf = spawn(game, "Watchwolf", B);
    const harvester = enter(game, "Harvester of Misery");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(pt(game, wolf)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, harvester)).toEqual({ power: 5, toughness: 4 });
    const late = spawn(game, "Grizzly Bears");
    expect(pt(game, late)).toEqual({ power: 2, toughness: 2 });
  });

  it("{1}{B}, discard it from your hand: target creature gets -2/-2", () => {
    const { game } = table();
    const wolf = spawn(game, "Watchwolf", B);
    lands(game, "Swamp", 2);
    const harvester = toHand(game, "Harvester of Misery");
    activate(game, harvester, 0, { targets: [ref(wolf)] });
    expect(zone(game, harvester)).toBe("graveyard");
    expect(pt(game, wolf)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Pest Control", () => {
  it("destroys every nonland permanent with mana value 1 or less, tokens included", () => {
    const { game } = table();
    const memnite = spawn(game, "Memnite");
    const elves = spawn(game, "Llanowar Elves", B);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    makeToken(game, "Clue Token");
    const wastes = spawn(game, "Wastes", B);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Pest Control"));
    expect(zone(game, memnite)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token")).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, wastes)).toBe("battlefield");
  });
});

describe("Territory Forge", () => {
  it("cast, exiles target artifact and has its activated abilities, naming the Forge", () => {
    const { game, a } = table();
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Mountain", 5);
    const forge = toHand(game, "Territory Forge");
    pickTargets(a, stone);
    cast(game, forge);
    expect(zone(game, stone)).toBe("exile");
    // "{T}: Add {C}" and "{1}, {T}, Sacrifice Mind Stone: Draw a card" — on the Forge.
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    activate(game, forge, 1);
    expect(zone(game, forge)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("put onto the battlefield without being cast, exiles nothing", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone", B);
    enter(game, "Territory Forge");
    expect(zone(game, stone)).toBe("battlefield");
  });
});

describe("Angelic Sell-Sword", () => {
  it("makes a Mercenary when it or another nontoken creature you control enters, not for a token", () => {
    const { game } = table();
    enter(game, "Angelic Sell-Sword");
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
    enter(game, "Grizzly Bears");
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(2);
    enter(game, "Grizzly Bears", B);
    makeToken(game, "Golem Token");
    settle(game);
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(2);
  });

  it("draws when it attacks with power 6 or greater", () => {
    const { game, a } = table();
    const sword = spawn(game, "Angelic Sell-Sword");
    const before = hand(game).length;
    attack(game, a, [sword]);
    expect(hand(game).length).toBe(before);
    const { game: game2, a: a2 } = table();
    const sword2 = spawn(game2, "Angelic Sell-Sword");
    game2.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(sword2)]);
    const before2 = hand(game2).length;
    attack(game2, a2, [sword2]);
    expect(hand(game2).length).toBe(before2 + 1);
  });
});

describe("Crackling Spellslinger", () => {
  it("cast, gives the next instant or sorcery storm", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    cast(game, toHand(game, "Crackling Spellslinger"));
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    // One spell cast before the Bolt this turn: one copy.
    expect(life(game, B)).toBe(14);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(11);
  });

  it("put onto the battlefield without being cast, does nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    enter(game, "Crackling Spellslinger");
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("Discreet Retreat", () => {
  it("enchanted land taps for two mana of one colour, spent only on outlaws", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const forest = spawn(game, "Forest");
    cast(game, toHand(game, "Discreet Retreat"), { targets: [ref(forest)] });
    game.dispatch({ type: "activate-ability", player: A, source: forest, abilityIndex: 1, targets: [], manaColors: ["B"] });
    expect(pool(game)).toEqual(["B", "B"]);
    const assassin = toHand(game, "Agate-Blade Assassin");
    const stone = toHand(game, "Mind Stone");
    expect(canCast(game, stone)).toBe(false);
    expect(canCast(game, assassin)).toBe(true);
  });

  it("draws a card and loses 1 life on your first outlaw spell each turn", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Discreet Retreat"), { targets: [ref(forest)] });
    lands(game, "Forest", 2);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game)).toBe(20);
    const before = hand(game).length;
    cast(game, toHand(game, "Agate-Blade Assassin"));
    expect(life(game)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
    cast(game, toHand(game, "Changeling Outcast"));
    expect(life(game)).toBe(19);
  });
});

describe("Vengeful Regrowth", () => {
  it("returns the target lands tapped and makes that many 4/2 reach Plant Warriors", () => {
    const { game, a } = table();
    const graveLands = [toGraveyard(game, "Forest"), toGraveyard(game, "Forest"), toGraveyard(game, "Wastes")];
    lands(game, "Forest", 6);
    pickTargets(a, ...graveLands);
    const regrowth = toHand(game, "Vengeful Regrowth");
    cast(game, regrowth, { targets: graveLands.map(ref), settle: false });
    // One of them leaves the graveyard in response: one land and one token fewer.
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(graveLands[2])]);
    settle(game);
    expect(zone(game, graveLands[0])).toBe("battlefield");
    expect(isTapped(game, graveLands[0])).toBe(true);
    expect(isTapped(game, graveLands[1])).toBe(true);
    const plants = tokensOf(game, "Plant Warrior Token");
    expect(tokensNamed(game, "Plant Warrior Token", A)).toBe(2);
    expect(pt(game, plants[0])).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, plants[0]).has("reach")).toBe(true);
  });
});

describe("Dead Before Sunrise", () => {
  it("outlaw creatures you control get +1/+0 and a tap ability dealing damage equal to their power", () => {
    const { game } = table();
    const rogue = spawn(game, "Hostile Investigator");
    const bears = spawn(game, "Grizzly Bears");
    const wolf = spawn(game, "Watchwolf", B);
    const theirRogue = spawn(game, "Hostile Investigator", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Dead Before Sunrise"));
    expect(pt(game, rogue)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirRogue)).toEqual({ power: 4, toughness: 3 });
    expect(game.legalActions(A).some((o) => o.kind === "activate-ability" && o.source === bears)).toBe(false);
    activate(game, rogue, 0, { targets: [ref(wolf)] });
    expect(zone(game, wolf)).toBe("graveyard");
    toStep(game, "precombat-main", B);
    expect(pt(game, rogue)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Kirri, Talented Sprout", () => {
  it("other Plants and Treefolk you control get +2/+0", () => {
    const { game } = table();
    const kirri = spawn(game, "Kirri, Talented Sprout");
    const farmer = spawn(game, "Bristlebud Farmer");
    const oak = spawn(game, "Battlewand Oak");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Battlewand Oak", B);
    expect(pt(game, kirri)).toEqual({ power: 0, toughness: 3 });
    expect(pt(game, farmer)).toEqual({ power: 7, toughness: 5 });
    expect(pt(game, oak)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 3 });
  });

  it("returns a Plant, Treefolk or land card from your graveyard at your postcombat main phase", () => {
    const { game, a } = table();
    spawn(game, "Kirri, Talented Sprout");
    const forest = toGraveyard(game, "Forest");
    const oak = toGraveyard(game, "Battlewand Oak");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [oak]);
    toStep(game, "postcombat-main");
    settle(game);
    expect(seen.offered[0]).toContain(forest);
    expect(seen.offered[0]).toContain(oak);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, oak)).toBe("hand");
  });
});

describe("Charred Graverobber", () => {
  it("returns an outlaw card from your graveyard", () => {
    const { game, a } = table();
    const rogue = toGraveyard(game, "Hostile Investigator");
    const bears = toGraveyard(game, "Grizzly Bears");
    // The rogue is the only legal target, so it's chosen without asking.
    const seen = watchTargets(a, () => [rogue]);
    enter(game, "Charred Graverobber");
    expect(seen.asked).toBe(0);
    expect(zone(game, rogue)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("escapes for {3}{B}{B} and four other cards, with a +1/+1 counter", () => {
    const { game } = table();
    const robber = toGraveyard(game, "Charred Graverobber");
    const others = ["Grizzly Bears", "Lightning Bolt", "Opt", "Wastes"].map((name) => toGraveyard(game, name));
    lands(game, "Swamp", 5);
    game.dispatch({ type: "cast-spell", player: A, card: robber, targets: [], via: "escape", escapeExile: others });
    settle(game);
    expect(zone(game, robber)).toBe("battlefield");
    expect(counters(game, robber)).toBe(1);
    for (const id of others) expect(zone(game, id)).toBe("exile");
  });
});

describe("Leyline Dowser", () => {
  it("mills a card and may keep an instant or sorcery; a legendary creature tapped untaps it", () => {
    const { game, a } = table();
    const dowser = spawn(game, "Leyline Dowser");
    lands(game, "Wastes", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, bolt);
    activate(game, dowser, 0);
    expect(zone(game, bolt)).toBe("hand");
    expect(isTapped(game, dowser)).toBe(true);
    const kirri = spawn(game, "Kirri, Talented Sprout", A, { sick: true });
    activate(game, dowser, 1);
    expect(isTapped(game, dowser)).toBe(false);
    expect(isTapped(game, kirri)).toBe(true);
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a);
    activate(game, dowser, 0);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
