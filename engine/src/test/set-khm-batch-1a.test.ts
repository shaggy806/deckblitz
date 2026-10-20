/**
 * Kaldheim and Kaldheim Commander, group a: Ruthless Winnower, Harald, King of Skemfar, Calamity Bearer, Rampage of the Valkyries, Spectral Steel, Giant's Amulet, Surtland
 * Flinger, Waking the Trolls, Priest of the Haunted Edge, Arachnoform, Shepherd of the Cosmos,
 * Elven Bow, Path to the World Tree and Valor of the Worthy.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { EVERY_CREATURE_TYPE } from "../subtypes.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
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
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const onlyToken = (game: Game, name: string) => {
  const [id] = named(game, name, A);
  expect(id).toBeDefined();
  return id!;
};

describe("Ruthless Winnower", () => {
  it("at each player's upkeep, that player sacrifices a non-Elf creature", () => {
    const { game } = table();
    spawn(game, "Ruthless Winnower");
    const elves = spawn(game, "Llanowar Elves", B);
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Harald, King of Skemfar", () => {
  it("offers only an Elf, Warrior or Tyvar card among the top five", () => {
    const { game, a } = table();
    const elves = toLibrary(game, "Llanowar Elves");
    const seen = pickFromZone(a, elves);
    enter(game, "Harald, King of Skemfar");
    expect(seen.offered).toEqual([elves]);
    expect(zone(game, elves)).toBe("hand");
  });
});

describe("Calamity Bearer", () => {
  it("doubles a Giant's damage and not another creature's", () => {
    const { game, a } = table();
    spawn(game, "Calamity Bearer");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [giant, bears]);
    expect(life(game, B)).toBe(20 - 3 * 2 - 2);
  });
});

describe("Rampage of the Valkyries", () => {
  it("an Angel you control dying makes each other player sacrifice a creature", () => {
    const { game } = table();
    enter(game, "Rampage of the Valkyries");
    const angel = onlyToken(game, "4/4 Vigilant Angel Token");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, angel);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Spectral Steel", () => {
  it("exiles itself from the graveyard to return another Aura or Equipment card", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const steel = toGraveyard(game, "Spectral Steel");
    const splitter = toGraveyard(game, "Bonesplitter");
    toGraveyard(game, "Grizzly Bears");
    activate(game, steel, 0, { targets: [ref(splitter)] });
    expect(zone(game, splitter)).toBe("hand");
    expect(zone(game, steel)).toBe("exile");
  });
});

describe("Giant's Amulet", () => {
  it("paying {3}{U} makes a Giant Wizard wearing it: +0/+1, hexproof only while untapped", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    pickModes(a, 0);
    const amulet = enter(game, "Giant's Amulet");
    const giant = onlyToken(game, "Giant Wizard Token");
    expect(game.state.objects[amulet].attachedTo).toBe(giant);
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, giant).has("hexproof")).toBe(true);
    game.state.objects[giant].tapped = true;
    expect(keywords(game, giant).has("hexproof")).toBe(false);
  });

  it("declining makes nothing", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    pickModes(a);
    enter(game, "Giant's Amulet");
    expect(tokensNamed(game, "Giant Wizard Token")).toBe(0);
  });
});

describe("Surtland Flinger", () => {
  it("flings a sacrificed Giant for twice its power", () => {
    const { game, a } = table();
    const flinger = spawn(game, "Surtland Flinger");
    const giant = spawn(game, "Hill Giant");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [giant];
    pickTargets(a, B);
    attack(game, a, [flinger]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - 3 * 2 - 4);
  });

  it("flings a non-Giant for its power", () => {
    const { game, a } = table();
    const flinger = spawn(game, "Surtland Flinger");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bears];
    pickTargets(a, B);
    attack(game, a, [flinger]);
    expect(life(game, B)).toBe(20 - 2 - 4);
  });
});

describe("Waking the Trolls", () => {
  it("I destroys a land, II takes it from the graveyard, III makes a Troll for each land of difference", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const [mountain] = lands(game, "Mountain", 3, B);
    pickTargets(a, mountain!);
    const saga = enter(game, "Waking the Trolls");
    expect(zone(game, mountain!)).toBe("graveyard");
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, mountain!)).toBe("battlefield");
    expect(game.state.objects[mountain!].controller).toBe(A);
    // Five lands against two; the only opponent is the target.
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Troll Warrior Token", A)).toBe(3);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("III makes nothing against an opponent with as many lands", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 3, B);
    const saga = spawn(game, "Waking the Trolls");
    // A silent spawn still gets its first lore counter and chapter I; skip both.
    game.state.pendingTriggers = [];
    game.state.objects[saga].counters.lore = 2;
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Troll Warrior Token", A)).toBe(0);
  });
});

describe("Priest of the Haunted Edge", () => {
  it("gives -X/-X for each snow land you control", () => {
    const { game } = table();
    lands(game, "Snow-Covered Swamp", 2);
    lands(game, "Swamp", 1);
    const priest = spawn(game, "Priest of the Haunted Edge");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, priest, 0, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, priest)).toBe("graveyard");
  });
});

describe("Arachnoform", () => {
  it("+2/+2, reach and every creature type", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Arachnoform"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    expect(subtypes(game, bears)).toContain(EVERY_CREATURE_TYPE);
  });
});

describe("Shepherd of the Cosmos", () => {
  it("returns a permanent card with mana value 2 or less, never an instant", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const memnite = toGraveyard(game, "Memnite");
    const giant = toGraveyard(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [ring]);
    enter(game, "Shepherd of the Cosmos");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([ring, memnite]));
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(bolt);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Elven Bow", () => {
  it("paying {2} makes an Elf Warrior wearing it", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    pickModes(a, 0);
    const bow = enter(game, "Elven Bow");
    const elf = onlyToken(game, "Elf Warrior Token");
    expect(game.state.objects[bow].attachedTo).toBe(elf);
    expect(pt(game, elf)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, elf).has("reach")).toBe(true);
  });
});

describe("Path to the World Tree", () => {
  it("the five-colour sacrifice does all five things", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 1);
    lands(game, "Wastes", 2);
    const path = spawn(game, "Path to the World Tree");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    activate(game, path, 0, { targets: [ref(B), ref(bears)] });
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Bear Token", A)).toBe(1);
    expect(zone(game, path)).toBe("graveyard");
  });
});

describe("Valor of the Worthy", () => {
  it("a Spirit when the enchanted creature leaves the battlefield, not only when it dies", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Valor of the Worthy"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});
