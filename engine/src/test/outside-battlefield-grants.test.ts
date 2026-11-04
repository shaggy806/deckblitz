/**
 * Statics and one-shots that give cards outside the battlefield keyword
 * abilities (rule 604.1, a static reaching another zone as its text says):
 * `grantsToGraveyard.keywords` and `grant-graveyard-keyword` (unearth, encore,
 * embalm, harmonize, retrace, sneak), `grantsCyclingInHand`,
 * `grantsForetellInHand`, and `typesOutsideBattlefield`, the same reach for
 * layer 4.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { matchesFilter } from "../filter.js";
import { Game } from "../game.js";
import { withGenericReducedBy } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { hasSubtype } from "../subtypes.js";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  enter,
  subtypes,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

/** What `player` may activate on `card`, as its printed text. */
const abilities = (game: Game, card: ObjectId, player = A): string[] =>
  game
    .legalActions(player)
    .flatMap((a) => (a.kind === "activate-ability" && a.source === card ? [a.text] : []));

const castOffers = (game: Game, card: ObjectId, via: string) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === via);

/** The index a grant's ability is at: after the card's own. */
const grantedIndex = (game: Game, card: ObjectId, nth = 0): number =>
  game.registry.get(game.state.objects[card].cardName).activated.length + nth;

describe("grantsToGraveyard: unearth", () => {
  it("Sedris: a creature card in your graveyard has unearth {2}{B}, returns with haste, and is exiled at the end step", () => {
    const { game } = table();
    spawn(game, "Sedris, the Traitor King");
    lands(game, "Swamp", 3);
    const giant = toGraveyard(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    expect(abilities(game, giant)).toEqual(["Unearth {2}{B}"]);
    expect(abilities(game, bolt)).toEqual([]);
    expect(abilities(game, theirs, B)).toEqual([]);
    activate(game, giant, grantedIndex(game, giant));
    expect(zone(game, giant)).toBe("battlefield");
    expect(keywords(game, giant).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(zone(game, giant)).toBe("exile");
  });

  it("only as a sorcery, and only while Sedris is there", () => {
    const { game } = table();
    const sedris = spawn(game, "Sedris, the Traitor King");
    lands(game, "Swamp", 3);
    const giant = toGraveyard(game, "Hill Giant");
    game.advanceUntil((s) => activePlayerOf(s) === B && s.priority.holder === A);
    expect(abilities(game, giant)).toEqual([]);
    game.advanceUntil((s) => activePlayerOf(s) === A && s.turn.step === "precombat-main" && s.priority.holder === A);
    expect(abilities(game, giant)).toHaveLength(1);
    destroy(game, sedris);
    expect(abilities(game, giant)).toEqual([]);
  });

  it("an ability already activated carries on once the grant is gone", () => {
    const { game } = table();
    const sedris = spawn(game, "Sedris, the Traitor King");
    lands(game, "Swamp", 3);
    const giant = toGraveyard(game, "Hill Giant");
    activate(game, giant, grantedIndex(game, giant), { settle: false });
    // It's on the stack: the grant goes before it resolves.
    destroy(game, sedris);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("Solemn Doomguide narrows to Clerics, Rogues, Warriors and Wizards", () => {
    const { game } = table();
    spawn(game, "Solemn Doomguide");
    lands(game, "Swamp", 2);
    const rogue = toGraveyard(game, "Merfolk Looter");
    const giant = toGraveyard(game, "Hill Giant");
    expect(abilities(game, rogue)).toEqual(["Unearth {1}{B}"]);
    expect(abilities(game, giant)).toEqual([]);
  });

  it("two grants at one cost are one offer; a card's own unearth stays beside a grant", () => {
    const { game } = table();
    spawn(game, "Sedris, the Traitor King");
    spawn(game, "Sedris, the Traitor King");
    lands(game, "Swamp", 3);
    const giant = toGraveyard(game, "Hill Giant");
    expect(abilities(game, giant)).toHaveLength(1);
  });
});

describe("grantsToGraveyard: encore", () => {
  it("Wire Surgeons: an artifact creature card's encore costs its mana cost, and exiling it is the cost", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Wire Surgeons");
    const thopter = toGraveyard(game, "Ornithopter");
    const giant = toGraveyard(game, "Hill Giant");
    expect(abilities(game, thopter)).toEqual(["Encore {0}"]);
    expect(abilities(game, giant)).toEqual([]);
    activate(game, thopter, grantedIndex(game, thopter));
    expect(zone(game, thopter)).toBe("exile");
    // One token copy for each opponent, with haste.
    const tokens = named(game, "Ornithopter").filter((id) => zone(game, id) === "battlefield");
    expect(tokens).toHaveLength(2);
    expect(keywords(game, tokens[0]).has("haste")).toBe(true);
  });

  it("Graywater's Fixer: encore {X} where X is the card's mana value — a fixed cost, no X to choose", () => {
    const { game } = table();
    spawn(game, "Graywater's Fixer");
    lands(game, "Mountain", 3);
    const fixer = toGraveyard(game, "Graywater's Fixer");
    const rogue = toGraveyard(game, "Merfolk Looter");
    const giant = toGraveyard(game, "Hill Giant");
    // Three lands: the Rogue's {2} is there, the Mercenary's {4} isn't.
    expect(abilities(game, rogue)).toEqual(["Encore {2}"]);
    expect(abilities(game, fixer)).toEqual([]);
    expect(abilities(game, giant)).toEqual([]);
    lands(game, "Mountain", 1);
    expect(abilities(game, fixer)).toEqual(["Encore {4}"]);
  });
});

describe("grant-graveyard-keyword", () => {
  it("Cursecloth Wrappings: the target gains embalm at its mana cost, making a white Zombie token copy", () => {
    const { game } = table();
    const wrappings = spawn(game, "Cursecloth Wrappings");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    expect(abilities(game, bears)).toEqual([]);
    activate(game, wrappings, 0, { targets: [ref(bears)] });
    expect(abilities(game, bears)).toEqual(["Embalm {1}{G}"]);
    expect(abilities(game, giant)).toEqual([]);
    activate(game, bears, grantedIndex(game, bears));
    expect(zone(game, bears)).toBe("exile");
    const [token] = named(game, "Grizzly Bears").filter((id) => zone(game, id) === "battlefield");
    expect(game.state.objects[token].isToken).toBe(true);
    expect(subtypes(game, token)).toContain("Zombie");
    // The Wrappings' own anthem reads it.
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
  });

  it("ends at end of turn, and with any change of zone", () => {
    const { game } = table();
    const wrappings = spawn(game, "Cursecloth Wrappings");
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, wrappings, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].grantedGraveyardKeywords).toHaveLength(1);
    nextTurn(game);
    expect(game.state.objects[bears].grantedGraveyardKeywords).toBeUndefined();
    expect(abilities(game, bears)).toEqual([]);
  });

  it("Songcrafter Mage: the target gains harmonize at its mana cost; cast from the graveyard, it's then exiled", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bolt = toGraveyard(game, "Lightning Bolt");
    expect(castOffers(game, bolt, "harmonize")).toHaveLength(0);
    pickTargets(a, bolt);
    enter(game, "Songcrafter Mage");
    expect(castOffers(game, bolt, "harmonize").length).toBeGreaterThan(0);
    cast(game, bolt, { via: "harmonize", targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
  });

  it("the mass form gives each matching card it at that moment, not one put there later", () => {
    // The shape of Ghost Ark's "each artifact creature card in your graveyard gains unearth {3} until end of turn".
    const registry = createDefaultRegistry();
    registry.register(
      defineCard({
        name: "Test Ark",
        manaCost: "{0}",
        types: ["artifact"],
        text: "{T}: Each artifact creature card in your graveyard gains unearth {3} until end of turn.",
        activated: [
          {
            cost: { mana: null, tap: true },
            targets: [],
            effect: {
              kind: "grant-graveyard-keyword",
              filter: { types: ["artifact", "creature"] },
              grant: { keyword: "unearth", cost: "{3}" },
            },
            resolve: null,
            text: "{T}: Each artifact creature card in your graveyard gains unearth {3} until end of turn.",
          },
        ],
      }),
    );
    const game = Game.create({
      seed: 1,
      shuffle: false,
      startingPlayer: A,
      registry,
      rules: { maxLandsPerTurn: 99, skipFirstDraw: false, maxHandSize: 99 },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === A);
    const ark = spawn(game, "Test Ark");
    lands(game, "Mountain", 3);
    const thopter = toGraveyard(game, "Ornithopter");
    const giant = toGraveyard(game, "Hill Giant");
    const theirs = toGraveyard(game, "Ornithopter", B);
    activate(game, ark);
    const later = toGraveyard(game, "Ornithopter");
    expect(abilities(game, thopter)).toEqual(["Unearth {3}"]);
    expect(abilities(game, giant)).toEqual([]);
    expect(abilities(game, later)).toEqual([]);
    expect(abilities(game, theirs, B)).toEqual([]);
    activate(game, thopter, grantedIndex(game, thopter));
    expect(zone(game, thopter)).toBe("battlefield");
    expect(keywords(game, thopter).has("haste")).toBe(true);
  });
});

describe("grantsToGraveyard: retrace", () => {
  it("Deeproot Historian: a Druid card is cast from the graveyard for its mana cost and a land discarded", () => {
    const { game } = table();
    spawn(game, "Deeproot Historian");
    lands(game, "Forest", 1);
    const mystic = toGraveyard(game, "Elvish Mystic");
    const giant = toGraveyard(game, "Hill Giant");
    expect(castOffers(game, mystic, "retrace").length).toBeGreaterThan(0);
    expect(castOffers(game, giant, "retrace")).toHaveLength(0);
    const inHand = hand(game).length;
    cast(game, mystic, { via: "retrace" });
    expect(zone(game, mystic)).toBe("battlefield");
    // A land card from the hand paid for it.
    expect(hand(game).length).toBe(inHand - 1);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(1);
  });

  it("Six: only during your turn, and only nonland permanent cards", () => {
    const { game } = table();
    spawn(game, "Six");
    lands(game, "Mountain", 4);
    toHand(game, "Forest");
    const giant = toGraveyard(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    expect(castOffers(game, giant, "retrace").length).toBeGreaterThan(0);
    expect(castOffers(game, bolt, "retrace")).toHaveLength(0);
    // A flash creature could be cast on Bob's turn, but the condition is off.
    const mage = toGraveyard(game, "Songcrafter Mage");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    expect(castOffers(game, mage, "retrace").length).toBeGreaterThan(0);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.priority.holder === A);
    expect(castOffers(game, mage, "retrace")).toHaveLength(0);
  });

  it("Wrenn and Six's emblem works from the command zone, whatever becomes of her", () => {
    const { game } = table();
    const wrenn = spawn(game, "Wrenn and Six");
    lands(game, "Mountain", 1);
    toHand(game, "Forest");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const giant = toGraveyard(game, "Hill Giant");
    expect(castOffers(game, bolt, "retrace")).toHaveLength(0);
    loyalty(game, wrenn, -7, { atLeast: 7 });
    expect(game.state.emblems).toHaveLength(1);
    destroy(game, wrenn);
    expect(castOffers(game, bolt, "retrace").length).toBeGreaterThan(0);
    expect(castOffers(game, giant, "retrace")).toHaveLength(0);
    cast(game, bolt, { via: "retrace", targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    // Retrace doesn't exile it: back to the graveyard (rule 702.81a).
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Ninja Teen: sneak from the graveyard", () => {
  const levelThree = (game: Game): ObjectId => {
    const teen = spawn(game, "Ninja Teen");
    lands(game, "Swamp", 3);
    activate(game, teen, 0);
    activate(game, teen, 1);
    return teen;
  };

  it("at level 3 a creature card in your graveyard is cast with sneak, tapped and attacking", () => {
    const g = table();
    const { game } = g;
    const bears = spawn(game, "Grizzly Bears");
    levelThree(game);
    lands(game, "Swamp", 4);
    const giant = toGraveyard(game, "Hill Giant");
    g.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(castOffers(game, giant, "sneak")).toHaveLength(1);
    game.dispatch({ type: "cast-spell", player: A, card: giant, targets: [], via: "sneak", sneakReturn: bears });
    expect(zone(game, bears)).toBe("hand");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].attacking).toBe(B);
  });

  it("not below level 3, and a creature card with its own sneak has both costs", () => {
    const g = table();
    const { game } = g;
    const bears = spawn(game, "Grizzly Bears");
    const teen = spawn(game, "Ninja Teen");
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 3);
    const giant = toGraveyard(game, "Hill Giant");
    const raph = toGraveyard(game, "Raphael, the Nightwatcher");
    g.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(castOffers(game, giant, "sneak")).toHaveLength(0);
    game.state.objects[teen].classLevel = 3;
    expect(castOffers(game, giant, "sneak")).toHaveLength(1);
    expect(castOffers(game, raph, "sneak")).toHaveLength(2);
  });
});

describe("grantsCyclingInHand", () => {
  it("Rhet-Tomb Mystic: a creature card in hand has cycling {1}{U}: discard it, draw, and it's cycling to everything watching", () => {
    const { game } = table();
    spawn(game, "Rhet-Tomb Mystic");
    spawn(game, "Drannith Healer");
    lands(game, "Island", 2);
    const giant = toHand(game, "Hill Giant");
    const bolt = toHand(game, "Lightning Bolt");
    expect(abilities(game, giant)).toEqual(["Cycling {1}{U}"]);
    expect(abilities(game, bolt)).toEqual([]);
    const before = hand(game).length;
    activate(game, giant, grantedIndex(game, giant));
    expect(zone(game, giant)).toBe("graveyard");
    // The Giant went, a card came.
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(21);
    expect(game.state.eventLog.some((e) => e.type === "card-cycled" && e.object === giant)).toBe(true);
  });

  it("Tectonic Reformation: a land card has its own cycling beside the printed; a card with its own keeps both", () => {
    const { game } = table();
    spawn(game, "Tectonic Reformation");
    lands(game, "Mountain", 2);
    const land = toHand(game, "Forest");
    const own = toHand(game, "Tectonic Reformation");
    expect(abilities(game, land)).toEqual(["Cycling {R}"]);
    // Its own cycling is the plain action, and it's no land.
    expect(game.legalActions(A).some((a) => a.kind === "cycle" && a.card === own)).toBe(true);
    expect(abilities(game, own)).toEqual([]);
  });

  it("Homing Sliver reaches every player's hand, and searches for a Sliver", () => {
    const { game, b } = table();
    spawn(game, "Homing Sliver");
    lands(game, "Mountain", 3, B);
    const sliver = toHand(game, "Homing Sliver", B);
    const giant = toHand(game, "Hill Giant", B);
    const found = toLibrary(game, "Homing Sliver", B);
    game.advanceUntil((s) => s.turn.step === "upkeep" && s.priority.holder === B);
    expect(abilities(game, sliver, B)).toEqual(["Typecycling {3}"]);
    expect(abilities(game, giant, B)).toEqual([]);
    pickFromZone(b, found);
    activate(game, sliver, grantedIndex(game, sliver), { player: B });
    expect(zone(game, sliver)).toBe("graveyard");
    expect(zone(game, found)).toBe("hand");
  });
});

describe("grantsForetellInHand", () => {
  it("reduces only generic mana (rule 118.7a)", () => {
    expect(withGenericReducedBy("{4}{W}{U}", 2)).toBe("{2}{W}{U}");
    expect(withGenericReducedBy("{1}{W}", 2)).toBe("{W}");
    expect(withGenericReducedBy("{W}{W}", 2)).toBe("{W}{W}");
    expect(withGenericReducedBy("{2}", 2)).toBe("{0}");
    expect(withGenericReducedBy("{X}{1}{R}", 2)).toBe("{X}{R}");
  });

  it("Dream Devourer: a nonland card is foretold for {2}, pumps her, and keeps its reduced cost after she's gone", () => {
    const { game } = table();
    const devourer = spawn(game, "Dream Devourer");
    lands(game, "Mountain", 2);
    const giant = toHand(game, "Hill Giant"); // {3}{R}
    const land = toHand(game, "Forest");
    const offers = game.legalActions(A).filter((a) => a.kind === "foretell");
    expect(offers.map((a) => (a.kind === "foretell" ? a.card : null))).toEqual([giant]);
    expect(land).toBeDefined();
    game.dispatch({ type: "foretell", player: A, card: giant });
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    expect(pt(game, devourer)).toEqual({ power: 2, toughness: 3 });
    expect(castOffers(game, giant, "foretell")).toHaveLength(0); // not the turn it was foretold
    destroy(game, devourer);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[giant].foretoldReducedBy).toBe(2);
    expect(castOffers(game, giant, "foretell").length).toBeGreaterThan(0);
    cast(game, giant, { via: "foretell" });
    expect(zone(game, giant)).toBe("battlefield");
    // Two of the Mountains paid for it.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped)).toHaveLength(2);
  });

  it("a card with foretell of its own uses that cost, and an opponent's Devourer gives you nothing", () => {
    const { game } = table();
    const theirs = spawn(game, "Dream Devourer", B);
    lands(game, "Mountain", 2);
    const giant = toHand(game, "Hill Giant");
    expect(game.legalActions(A).some((a) => a.kind === "foretell" && a.card === giant)).toBe(false);
    expect(theirs).toBeDefined();
    spawn(game, "Dream Devourer");
    const printed = toHand(game, "Doomskar");
    game.dispatch({ type: "foretell", player: A, card: printed });
    settle(game);
    expect(game.state.objects[printed].foretoldReducedBy).toBeUndefined();
  });
});

describe("typesOutsideBattlefield", () => {
  const choose = (game: Game, id: ObjectId, type: string): void => {
    game.state.objects[id].chosenCreatureType = type;
  };

  it("Ashes of the Fallen: only creature cards in your graveyard get the chosen type", () => {
    const { game } = table();
    const ashes = spawn(game, "Ashes of the Fallen");
    choose(game, ashes, "Elf");
    const mine = toGraveyard(game, "Hill Giant");
    const theirs = toGraveyard(game, "Hill Giant", B);
    const inHand = toHand(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const onBoard = spawn(game, "Hill Giant");
    expect(subtypes(game, mine)).toEqual(expect.arrayContaining(["Giant", "Elf"]));
    expect(subtypes(game, theirs)).not.toContain("Elf");
    expect(subtypes(game, inHand)).not.toContain("Elf");
    expect(subtypes(game, bolt)).not.toContain("Elf");
    expect(subtypes(game, onBoard)).not.toContain("Elf");
    expect(subtypes(game, ashes)).not.toContain("Elf");
  });

  it("Arcane Adaptation: creatures, creature spells and creature cards in every zone but the battlefield", () => {
    const { game } = table();
    const adaptation = spawn(game, "Arcane Adaptation");
    choose(game, adaptation, "Elf");
    lands(game, "Mountain", 4);
    const permanent = spawn(game, "Hill Giant");
    const inHand = toHand(game, "Hill Giant");
    const inLibrary = toLibrary(game, "Hill Giant");
    const inExile = toExile(game, "Hill Giant");
    const inGraveyard = toGraveyard(game, "Hill Giant");
    for (const id of [permanent, inHand, inLibrary, inExile, inGraveyard]) {
      expect(subtypes(game, id)).toEqual(expect.arrayContaining(["Giant", "Elf"]));
    }
    expect(subtypes(game, toHand(game, "Hill Giant", B))).not.toContain("Elf");
    // On the stack.
    cast(game, inHand, { settle: false });
    expect(zone(game, inHand)).toBe("stack");
    expect(subtypes(game, inHand)).toContain("Elf");
  });

  it("a filter reads it, and the card keeps its card types", () => {
    const { game } = table();
    const adaptation = spawn(game, "Arcane Adaptation");
    choose(game, adaptation, "Elf");
    const giant = toHand(game, "Hill Giant");
    expect(types(game, giant)).toEqual(["creature"]);
    expect(matchesFilter(game.state, game.registry, giant, { subtype: "Elf" }, { you: A })).toBe(true);
    expect(matchesFilter(game.state, game.registry, giant, { subtype: "Goblin" }, { you: A })).toBe(false);
  });

  it("Conspiracy replaces creature types, on the battlefield and off it", () => {
    const { game } = table();
    const conspiracy = spawn(game, "Conspiracy");
    choose(game, conspiracy, "Elf");
    const permanent = spawn(game, "Hill Giant");
    const inHand = toHand(game, "Hill Giant");
    expect(subtypes(game, permanent)).toEqual(["Elf"]);
    expect(subtypes(game, inHand)).toEqual(["Elf"]);
  });

  it("Maskwood Nexus: every creature type, and nothing once it's gone", () => {
    const { game } = table();
    const nexus = spawn(game, "Maskwood Nexus");
    const inHand = toHand(game, "Hill Giant");
    expect(hasSubtype(subtypes(game, inHand), "Goblin")).toBe(true);
    expect(matchesFilter(game.state, game.registry, inHand, { subtype: "Goblin" }, { you: A })).toBe(true);
    destroy(game, nexus);
    expect(hasSubtype(subtypes(game, inHand), "Goblin")).toBe(false);
  });
});
