/**
 * Innistrad: Midnight Hunt (and Midnight Hunt Commander), group f. One test
 * (or two) per card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
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

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const exile = (game: Game): readonly ObjectId[] => game.state.zones.shared.exile;
const pool = (game: Game, player: PlayerId = A): string[] => game.state.players[player].manaPool.map((u) => u.type);
/** Bob loses `n` life (the "an opponent lost life this turn" gate). */
const bobLoses = (game: Game, n = 1): void => {
  game.debugApplyEffect(A, { kind: "lose-life", amount: n, who: "each-opponent" });
  settle(game);
};

describe("Kessig Naturalist // Lord of the Ulvenwald", () => {
  it("attacking adds {R} or {G}, the attacker's pick, kept through combat", () => {
    const { game, a } = table();
    const naturalist = spawn(game, "Kessig Naturalist");
    pickModes(a, 1);
    attack(game, a, [naturalist]);
    expect(pool(game)).toEqual(["G"]);
  });

  it("the mana is gone once the turn ends", () => {
    const { game, a } = table();
    const naturalist = spawn(game, "Kessig Naturalist");
    pickModes(a, 0);
    attack(game, a, [naturalist]);
    expect(pool(game)).toEqual(["R"]);
    toStep(game, "upkeep", B);
    expect(pool(game)).toEqual([]);
  });

  it("at night the Lord pumps other Wolves and Werewolves, not itself or others", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "day-night", value: "night" });
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Kessig Naturalist"));
    const [lord] = named(game, "Kessig Naturalist");
    expect(printedCardName(game.state.objects[lord])).toBe("Lord of the Ulvenwald");
    expect(pt(game, lord)).toEqual({ power: 3, toughness: 3 });
    const wolf = spawn(game, "Ambush Wolf");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, wolf)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Necrosynthesis", () => {
  it("the enchanted creature grows when another creature dies, any player's", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Necrosynthesis"), { targets: [ref(bears)] });
    destroy(game, spawn(game, "Hill Giant", B));
    expect(counters(game, bears)).toBe(1);
  });

  it("when it dies, look at the top X (its last power), one to hand, the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Necrosynthesis"), { targets: [ref(bears)] });
    destroy(game, spawn(game, "Memnite", B));
    expect(pt(game, bears).power).toBe(3);
    const deep = toLibrary(game, "Craw Wurm");
    const third = toLibrary(game, "Lightning Bolt");
    const second = toLibrary(game, "Divination");
    const top = toLibrary(game, "Hill Giant");
    const seen = pickFromZone(a, second);
    destroy(game, bears);
    expect([...seen.offered].sort()).toEqual([top, second, third].sort());
    expect(zone(game, second)).toBe("hand");
    expect(library(game)[0]).toBe(deep);
    expect(library(game).slice(-2).sort()).toEqual([top, third].sort());
  });
});

describe("Willow Geist", () => {
  it("grows when cards leave your graveyard, and gains its last power in life as it dies", () => {
    const { game } = table();
    const geist = spawn(game, "Willow Geist");
    const card = toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(card)]);
    settle(game);
    expect(counters(game, geist)).toBe(1);
    destroy(game, geist);
    expect(life(game, A)).toBe(22);
  });
});

describe("Stromkirk Bloodthief", () => {
  it("at your end step, if an opponent lost life, a counter on a target Vampire you control", () => {
    const { game, a } = table();
    spawn(game, "Stromkirk Bloodthief");
    const whisperer = spawn(game, "Bat Whisperer");
    bobLoses(game);
    pickTargets(a, whisperer);
    toStep(game, "end");
    settle(game);
    expect(counters(game, whisperer)).toBe(1);
  });

  it("doesn't trigger when no opponent lost life", () => {
    const { game } = table();
    const thief = spawn(game, "Stromkirk Bloodthief");
    toStep(game, "end");
    settle(game);
    expect(counters(game, thief)).toBe(0);
  });
});

describe("Arcane Infusion", () => {
  it("offers only instants and sorceries from the top four; the rest go to the bottom", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    const fifth = toLibrary(game, "Divination");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const memnite = toLibrary(game, "Memnite");
    const seen = pickFromZone(a, bolt);
    cast(game, toHand(game, "Arcane Infusion"));
    expect(seen.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("hand");
    expect(library(game)[0]).toBe(fifth);
    expect(library(game).slice(-3).sort()).toEqual([bears, giant, memnite].sort());
  });
});

describe("Eccentric Farmer", () => {
  it("mills three, then may return a land card from the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const seen = pickFromZone(a, forest);
    cast(game, toHand(game, "Eccentric Farmer"));
    expect(seen.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Rotten Reunion", () => {
  it("exiles up to one target card from a graveyard and makes a decayed Zombie", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rotten Reunion"), { targets: [ref(theirs)] });
    expect(exile(game)).toContain(theirs);
    const [zombie] = named(game, "Zombie Token (Crowded Crypt)");
    expect(keywords(game, zombie).has("decayed")).toBe(true);
  });

  it("with no target it still makes the Zombie; flashback from the graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const reunion = toGraveyard(game, "Rotten Reunion");
    cast(game, reunion, { targets: [null], via: "flashback" });
    expect(tokensNamed(game, "Zombie Token (Crowded Crypt)")).toBe(1);
    expect(zone(game, reunion)).toBe("exile");
  });
});

describe("Voldaren Ambusher", () => {
  it("if an opponent lost life, deals X (Vampires you control) to up to one target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    spawn(game, "Bat Whisperer");
    const wurm = spawn(game, "Craw Wurm", B);
    bobLoses(game);
    pickTargets(a, wurm);
    cast(game, toHand(game, "Voldaren Ambusher"));
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("no life lost, no trigger", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const wurm = spawn(game, "Craw Wurm", B);
    const seen = watchTargets(a, () => [wurm]);
    cast(game, toHand(game, "Voldaren Ambusher"));
    expect(seen.asked).toBe(0);
    expect(game.state.objects[wurm].damageMarked ?? 0).toBe(0);
  });
});

describe("Ecstatic Awakener // Awoken Demon", () => {
  it("sacrificing another creature (never itself) draws, then transforms into a vanilla 4/4", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const awakener = spawn(game, "Ecstatic Awakener");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    const sacrificing = (what: ObjectId) =>
      ({ type: "activate-ability", player: A, source: awakener, abilityIndex: 0, targets: [], sacrifice: what }) as const;
    expect(game.canDispatch(sacrificing(awakener))).not.toBeNull();
    game.dispatch(sacrificing(bears));
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(printedCardName(game.state.objects[awakener])).toBe("Awoken Demon");
    expect(pt(game, awakener)).toEqual({ power: 4, toughness: 4 });
    expect(game.canDispatch(sacrificing(other))).not.toBeNull();
  });
});

describe("Storm Skreelix", () => {
  it("instants and sorceries cost {1} less, and each one pumps it +2/+0", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const skreelix = spawn(game, "Storm Skreelix");
    cast(game, toHand(game, "Divination"));
    expect(pt(game, skreelix)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Hungry for More", () => {
  it("makes a 3/1 trample lifelink haste Vampire, sacrificed at the next end step", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Hungry for More"));
    const [vampire] = named(game, "Vampire Token (Hungry for More)");
    expect(pt(game, vampire)).toEqual({ power: 3, toughness: 1 });
    expect([...keywords(game, vampire)].sort()).toEqual(["haste", "lifelink", "trample"]);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Vampire Token (Hungry for More)")).toBe(0);
  });
});

describe("Bloodtithe Collector", () => {
  it("if an opponent lost life this turn, each opponent discards", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    bobLoses(game);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Bloodtithe Collector"));
    expect(hand(game, B).length).toBe(before - 1);
  });

  it("no life lost, no discard", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Bloodtithe Collector"));
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Bat Whisperer", () => {
  it("makes a Bat only if an opponent lost life this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    cast(game, toHand(game, "Bat Whisperer"));
    expect(tokensNamed(game, "Bat Token")).toBe(0);
    bobLoses(game);
    cast(game, toHand(game, "Bat Whisperer"));
    expect(tokensNamed(game, "Bat Token")).toBe(1);
  });
});

describe("Sunstreak Phoenix", () => {
  it("makes it day as it enters", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Sunstreak Phoenix"));
    expect(game.state.dayNight).toBe("day");
  });

  it("from the graveyard, day becoming night lets you pay {1}{R} to return it tapped", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    game.debugApplyEffect(A, { kind: "day-night", value: "day" });
    const phoenix = toGraveyard(game, "Sunstreak Phoenix");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "day-night", value: "night" });
    settle(game);
    const [back] = named(game, "Sunstreak Phoenix");
    expect(back).toBeDefined();
    expect(game.state.objects[back].tapped).toBe(true);
    expect(graveyard(game)).not.toContain(phoenix);
  });

  it("the first 'it becomes day' (from neither) doesn't fire it", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const phoenix = toGraveyard(game, "Sunstreak Phoenix");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "day-night", value: "day" });
    settle(game);
    expect(zone(game, phoenix)).toBe("graveyard");
  });
});

describe("Component Collector", () => {
  it("when day becomes night, may tap or untap target nonland permanent", () => {
    const { game, a } = table();
    spawn(game, "Component Collector");
    game.debugApplyEffect(A, { kind: "day-night", value: "day" });
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    const seen = watchTargets(a, () => [bears]);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "day-night", value: "night" });
    settle(game);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(forest);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Revenge of the Drowned", () => {
  it("the creature's owner picks top or bottom, and you get a decayed Zombie", () => {
    const { game, b } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(b, 1);
    cast(game, toHand(game, "Revenge of the Drowned"), { targets: [ref(giant)] });
    const lib = library(game, B);
    expect(lib[lib.length - 1]).toBe(giant);
    expect(tokensNamed(game, "Zombie Token (Crowded Crypt)", A)).toBe(1);
  });
});

describe("Might of the Old Ways", () => {
  it("coven is checked after the pump (the ruling's two 2/2s and a big one)", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm");
    const before = hand(game).length;
    cast(game, toHand(game, "Might of the Old Ways"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(hand(game).length).toBe(before + 1);
  });

  it("pumping into a shared power loses coven", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const memnite = spawn(game, "Memnite");
    spawn(game, "Hill Giant");
    spawn(game, "Craw Wurm");
    const before = hand(game).length;
    cast(game, toHand(game, "Might of the Old Ways"), { targets: [ref(memnite)] });
    expect(hand(game).length).toBe(before);
  });
});

describe("Silver Bolt", () => {
  it("deals 3 damage and destroys a Werewolf it damaged", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const bolt = spawn(game, "Silver Bolt");
    const tovolar = spawn(game, "Tovolar, Dire Overlord", B);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 0, toughness: 3, duration: "end-of-turn" }, [
      ref(tovolar),
    ]);
    activate(game, bolt, 0, { targets: [ref(tovolar)] });
    expect(zone(game, tovolar)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("a non-Werewolf that survives the damage stays", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const bolt = spawn(game, "Silver Bolt");
    const collector = spawn(game, "Component Collector", B);
    activate(game, bolt, 0, { targets: [ref(collector)] });
    expect(zone(game, collector)).toBe("battlefield");
    expect(game.state.objects[collector].damageMarked).toBe(3);
  });
});

describe("Redemption Choir", () => {
  it("with coven, entering returns a permanent card with mana value 3 or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    spawn(game, "Memnite");
    spawn(game, "Grizzly Bears");
    const bears = toGraveyard(game, "Grizzly Bears");
    const wastes = toGraveyard(game, "Wastes");
    const giant = toGraveyard(game, "Hill Giant"); // mana value 4
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Redemption Choir"));
    expect([...seen.offered[0]].sort()).toEqual([bears, wastes].sort());
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(bolt);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("attacking with coven returns one too", () => {
    const { game, a } = table();
    const choir = spawn(game, "Redemption Choir");
    spawn(game, "Memnite");
    spawn(game, "Grizzly Bears");
    const bears = toGraveyard(game, "Grizzly Bears");
    attack(game, a, [choir]);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("without three different powers, nothing returns", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Redemption Choir"));
    expect(zone(game, bears)).toBe("graveyard");
  });
});
