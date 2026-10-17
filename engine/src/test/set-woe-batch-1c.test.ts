/**
 * Wilds of Eldraine (WOE), batch 1, part c (2026-10-17). Written on the
 * shared table in `harness.ts`, each test from the card's Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
  counters,
  enter,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** Alice holds priority in Bob's upkeep — an opponent's turn. */
const toOpponentsTurn = (game: Game): void =>
  game.advanceUntil(
    (s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A && s.zones.shared.stack.length === 0,
  );

/** Where an object is — `undefined` for a token that has ceased to exist. */
const whereIs = (game: Game, id: ObjectId): string | undefined => game.state.objects[id]?.zone;

/** The next lore counter: alice's next precombat main, settled. */
const nextChapter = (game: Game): void => {
  toStep(game, "precombat-main");
  settle(game);
};

describe("Discerning Financier", () => {
  it("makes a Treasure in your upkeep only while an opponent has more lands", () => {
    const { game } = table();
    spawn(game, "Discerning Financier");
    lands(game, "Wastes", 2);
    lands(game, "Wastes", 2, B);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    lands(game, "Wastes", 1, B);
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("gives target Treasure you control to another player, and you draw", () => {
    const { game } = table();
    const financier = spawn(game, "Discerning Financier");
    lands(game, "Plains", 3);
    const treasure = spawn(game, "Treasure Token");
    const before = hand(game).length;
    activate(game, financier, 0, { targets: [ref(treasure)] });
    expect(controller(game, treasure)).toBe(B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Welcome to Sweettooth", () => {
  it("III puts one plus the number of Foods you control counters on the target", () => {
    const { game, a } = table();
    spawn(game, "Welcome to Sweettooth");
    settle(game);
    const [human] = named(game, "Human Token", A);
    expect(human).toBeDefined();
    nextChapter(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    spawn(game, "Food Token");
    spawn(game, "Food Token", B);
    pickTargets(a, human);
    nextChapter(game);
    expect(counters(game, human)).toBe(3);
  });
});

describe("Faerie Slumber Party", () => {
  it("bounces every creature, then two Faeries per opponent who lost one", () => {
    const { game } = table({ players: 4 });
    lands(game, "Island", 6);
    const mine = spawn(game, "Grizzly Bears");
    const bobs = [spawn(game, "Grizzly Bears", B), spawn(game, "Llanowar Elves", B)];
    const daves = spawn(game, "Grizzly Bears", D);
    spawn(game, "Wastes", C);
    cast(game, toHand(game, "Faerie Slumber Party"));
    for (const id of [mine, ...bobs, daves]) expect(zone(game, id)).toBe("hand");
    // Bob (two creatures) and Dave count once each; Carol had none; your own doesn't count.
    expect(tokensNamed(game, "Faerie Token (Faerie Slumber Party)", A)).toBe(4);
    expect(tokensNamed(game, "Faerie Token (Faerie Slumber Party)", C)).toBe(0);
  });
});

describe("Questing Druid // Seek the Beast", () => {
  it("grows for a white, blue, black or red spell, not a green one — its own red Adventure included", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Forest", 1);
    const druid = spawn(game, "Questing Druid");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(druid)] });
    expect(counters(game, druid)).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, druid)).toBe(1);
    const exileBefore = game.state.zones.shared.exile.length;
    const card = toHand(game, "Questing Druid");
    cast(game, card, { face: 1 });
    expect(counters(game, druid)).toBe(2);
    // The two cards from the library, and the adventurer card itself.
    expect(game.state.zones.shared.exile.length).toBe(exileBefore + 3);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("The Huntsman's Redemption", () => {
  it("II: sacrifice a creature to search for a creature or basic land card", () => {
    const { game, a } = table();
    toLibrary(game, "Sol Ring");
    const wurm = toLibrary(game, "Craw Wurm");
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Wastes"); // drawn in the draw step before chapter II
    spawn(game, "The Huntsman's Redemption");
    settle(game);
    const [beast] = named(game, "3/3 Beast Token", A);
    expect(beast).toBeDefined();
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [beast];
    const seen = pickFromZone(a, wurm);
    nextChapter(game);
    expect(whereIs(game, beast)).not.toBe("battlefield");
    expect(seen.offered).toContain(wurm);
    expect(seen.offered).toContain(forest);
    expect(seen.offered.some((id) => game.state.objects[id].cardName === "Sol Ring")).toBe(false);
    expect(zone(game, wurm)).toBe("hand");
  });

  it("II: declining the sacrifice searches nothing", () => {
    const { game, a } = table();
    const wurm = toLibrary(game, "Craw Wurm");
    spawn(game, "The Huntsman's Redemption");
    settle(game);
    pickModes(a);
    const seen = pickFromZone(a, wurm);
    nextChapter(game);
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(1);
    expect(seen.offered).toEqual([]);
  });
});

describe("The Apprentice's Folly", () => {
  it("copies a creature as a nonlegendary hasty Reflection, never one sharing a token's name, then sacrifices the Reflections", () => {
    const { game, a } = table();
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    pickTargets(a, isamaru);
    spawn(game, "The Apprentice's Folly");
    settle(game);
    const token = named(game, "Isamaru, Hound of Konda").find((id) => game.state.objects[id].isToken)!;
    expect(token).toBeDefined();
    expect(supertypes(game, token)).not.toContain("legendary");
    expect(subtypes(game, token)).toContain("Reflection");
    expect(subtypes(game, token)).toContain("Dog");
    expect(keywords(game, token).has("haste")).toBe(true);
    expect(zone(game, isamaru)).toBe("battlefield");

    const seen = watchTargets(a, () => [bears]);
    nextChapter(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, elves]));
    expect(seen.offered[0]).not.toContain(isamaru);
    // A token is never a legal target.
    expect(seen.offered[0]).toHaveLength(2);
    expect(named(game, "Grizzly Bears")).toHaveLength(2);

    nextChapter(game);
    expect(named(game, "Isamaru, Hound of Konda")).toEqual([isamaru]);
    expect(named(game, "Grizzly Bears")).toEqual([bears]);
  });
});

describe("Archon of the Wild Rose", () => {
  it("makes other creatures you control enchanted by your Auras base 4/4 fliers", () => {
    const { game } = table();
    const archon = spawn(game, "Archon of the Wild Rose");
    const mine = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Holy Strength");
    game.state.objects[aura].attachedTo = mine;
    const other = spawn(game, "Grizzly Bears");
    const theirAura = spawn(game, "Holy Strength", B);
    game.state.objects[theirAura].attachedTo = other;
    const bare = spawn(game, "Grizzly Bears");
    // Base 4/4, then Holy Strength's +1/+2.
    expect(pt(game, mine)).toEqual({ power: 5, toughness: 6 });
    expect(keywords(game, mine).has("flying")).toBe(true);
    // An opponent's Aura doesn't count.
    expect(pt(game, other)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, other).has("flying")).toBe(false);
    expect(pt(game, bare)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, archon)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Succumb to the Cold", () => {
  it("taps two creatures an opponent controls and stuns each, already tapped or not", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Succumb to the Cold"), { targets: [ref(one), ref(two)] });
    for (const id of [one, two]) {
      expect(game.state.objects[id].tapped).toBe(true);
      expect(counters(game, id, "stun")).toBe(1);
    }
  });
});

describe("Korvold and the Noble Thief", () => {
  it("makes two Treasures, then exiles the top three of an opponent's library for you to play this turn", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    spawn(game, "Korvold and the Noble Thief");
    settle(game);
    nextChapter(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    toStep(game, "upkeep");
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickTargets(a, B);
    nextChapter(game);
    expect(zone(game, bears)).toBe("exile");
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("The Princess Takes Flight", () => {
  it("exiles a creature with I and returns it to its owner with III", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, angel);
    const saga = spawn(game, "The Princess Takes Flight");
    settle(game);
    expect(zone(game, angel)).toBe("exile");
    pickTargets(a, bears);
    nextChapter(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextChapter(game);
    expect(zone(game, angel)).toBe("battlefield");
    expect(controller(game, angel)).toBe(B);
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Break the Spell", () => {
  it("draws for your own enchantment or a token, not an opponent's nontoken one", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const draws = (target: string, owner: PlayerId): number => {
      // A token made as tokens are, so it really is one.
      const enchantment = target.endsWith("Token")
        ? (game.debugApplyEffect(owner, { kind: "create-token", token: target, count: 1 }, []),
          named(game, target, owner)[0])
        : spawn(game, target, owner);
      expect(game.state.objects[enchantment].isToken === true).toBe(target.endsWith("Token"));
      const before = hand(game).length;
      cast(game, toHand(game, "Break the Spell"), { targets: [ref(enchantment)] });
      expect(whereIs(game, enchantment)).not.toBe("battlefield");
      return hand(game).length - before;
    };
    expect(draws("Glorious Anthem", B)).toBe(0);
    expect(draws("Glorious Anthem", A)).toBe(1);
    expect(draws("Glimmer Token", B)).toBe(1);
  });
});

describe("Witchstalker Frenzy", () => {
  it("costs {1} less for each creature that attacked this turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const wurm = spawn(game, "Craw Wurm", B);
    expect(() => cast(game, toHand(game, "Witchstalker Frenzy"), { targets: [ref(wurm)] })).toThrow();
    attack(game, a, [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")]);
    cast(game, toHand(game, "Witchstalker Frenzy"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Rotisserie Elemental", () => {
  it("exiles as many cards as the skewer counters it was sacrificed with", () => {
    const { game, a } = table();
    const elemental = spawn(game, "Rotisserie Elemental");
    game.state.objects[elemental].counters.skewer = 1;
    pickModes(a, 0);
    const exileBefore = game.state.zones.shared.exile.length;
    attack(game, a, [elemental]);
    expect(zone(game, elemental)).toBe("graveyard");
    expect(game.state.zones.shared.exile.length).toBe(exileBefore + 2);
  });

  it("keeps its counter when you don't sacrifice it", () => {
    const { game, a } = table();
    const elemental = spawn(game, "Rotisserie Elemental");
    pickModes(a);
    attack(game, a, [elemental]);
    expect(zone(game, elemental)).toBe("battlefield");
    expect(counters(game, elemental, "skewer")).toBe(1);
    expect(game.state.zones.shared.exile).toHaveLength(0);
  });
});

describe("Dream Spoilers", () => {
  it("shrinks an opponent's creature only for a spell cast on an opponent's turn", () => {
    const { game, a } = table();
    spawn(game, "Dream Spoilers");
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Opt"));
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    toOpponentsTurn(game);
    cast(game, toHand(game, "Opt"));
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Devouring Sugarmaw", () => {
  it("taps itself in your upkeep unless you sacrifice an artifact, enchantment or token", () => {
    const { game, a } = table();
    const maw = spawn(game, "Devouring Sugarmaw");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[maw].tapped).toBe(true);

    const food = spawn(game, "Food Token");
    const anthem = spawn(game, "Glorious Anthem");
    pickModes(a, 0);
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [food];
    };
    toStep(game, "upkeep");
    settle(game);
    expect(offered).toEqual(expect.arrayContaining([food, anthem]));
    expect(offered).not.toContain(bears);
    expect(offered).not.toContain(maw);
    expect(whereIs(game, food)).not.toBe("battlefield");
    expect(game.state.objects[maw].tapped).toBe(false);
  });
});

describe("Graceful Takedown", () => {
  it("each enchanted creature and one other creature you control deal damage equal to their power", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const enchanted = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    for (const id of enchanted) game.state.objects[spawn(game, "Pacifism")].attachedTo = id;
    const elves = spawn(game, "Llanowar Elves");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const takedown = toHand(game, "Graceful Takedown");
    // An unenchanted creature can't be one of the group, nor can the "other" creature.
    expect(() => cast(game, takedown, { targets: [null, ref(dreadmaw), ref(elves)] })).toThrow();
    expect(() =>
      cast(game, takedown, { targets: [ref(enchanted[0]), ref(dreadmaw), ref(enchanted[0])] }),
    ).toThrow();
    cast(game, takedown, { targets: [ref(elves), ref(dreadmaw), ...enchanted.map(ref)] });
    // 2 + 2 from the enchanted Bears, 1 from the Elves.
    expect(game.state.objects[dreadmaw].damageMarked).toBe(5);
    expect(zone(game, dreadmaw)).toBe("battlefield");
  });
});

describe("Ox Drover", () => {
  it("gives the target opponent a 2/4 Ox and draws on entering and attacking; Oxen can't block it", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const before = hand(game).length;
    const drover = enter(game, "Ox Drover");
    expect(tokensNamed(game, "Ox Token (Ox Drover)", B)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    const [ox] = named(game, "Ox Token (Ox Drover)", B);
    expect(pt(game, ox)).toEqual({ power: 2, toughness: 4 });
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [drover]);
    expect(tokensNamed(game, "Ox Token (Ox Drover)", B)).toBe(2);
    const canBlock = (blocker: ObjectId): readonly ObjectId[] => offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(bears)).toContain(drover);
    for (const id of named(game, "Ox Token (Ox Drover)", B)) expect(canBlock(id)).not.toContain(drover);
  });
});
