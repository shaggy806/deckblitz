/**
 * More "spend this mana only to …" (rule 106.6): a spell of the chosen type or
 * another filter (`orSpell` — The Ringhart Crest), foretelling (Karfell
 * Harbinger), a cost with {C} in it (Cultivator Drone), kicked spells (Throne of
 * Makindi), and cumulative upkeep (Adarkar Unicorn), that last on a triggered
 * mana ability's own mana too, which is the player's to decline (Snowfall).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const activatable = (game: Game, source: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === source);
const foretellable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "foretell" && a.card === card);
const pool = (game: Game, player = A): readonly string[] => game.state.players[player].manaPool.map((u) => u.type);

describe("a spell of the chosen type, or another filter", () => {
  /** Cast as its back face, naming `type`; the two Forests that paid are tapped. */
  const crest = (game: Game, type: string | null): ObjectId => {
    const id = toHand(game, "Kolvori, God of Kinship");
    lands(game, "Forest", 2);
    cast(game, id, { face: 1, settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
    game.dispatch({ type: "choose-creature-type", player: A, creatureType: type ?? "Elf" });
    settle(game);
    expect(zone(game, id)).toBe("battlefield");
    if (type === null) game.state.objects[id].chosenCreatureType = undefined;
    return id;
  };

  it("The Ringhart Crest's {G} casts a creature of the chosen type, and no other", () => {
    const { game } = table();
    crest(game, "Elf");
    expect(castable(game, toHand(game, "Llanowar Elves"))).toBe(true);
    lands(game, "Forest", 1);
    expect(castable(game, toHand(game, "Grizzly Bears"))).toBe(false);
  });

  it("or a legendary creature spell of any type", () => {
    const { game } = table();
    crest(game, "Elf");
    lands(game, "Forest", 3);
    const kolvori = toHand(game, "Kolvori, God of Kinship");
    expect(castable(game, kolvori)).toBe(true);
    cast(game, kolvori);
    expect(zone(game, kolvori)).toBe("battlefield");
    expect(pool(game)).toEqual([]);
  });

  it("with no type chosen, only the legendary half", () => {
    const { game } = table();
    crest(game, null);
    expect(castable(game, toHand(game, "Llanowar Elves"))).toBe(false);
    lands(game, "Forest", 3);
    expect(castable(game, toHand(game, "Kolvori, God of Kinship"))).toBe(true);
  });
});

describe("Kolvori, God of Kinship", () => {
  it("gets +4/+2 and vigilance with three legendary creatures, counting itself and not an opponent's", () => {
    const { game } = table();
    const kolvori = spawn(game, "Kolvori, God of Kinship");
    spawn(game, "Isamaru, Hound of Konda");
    spawn(game, "Esika, God of the Tree", B);
    expect(pt(game, kolvori)).toMatchObject({ power: 2, toughness: 4 });
    expect(keywords(game, kolvori).has("vigilance")).toBe(false);
    spawn(game, "Esika, God of the Tree");
    expect(pt(game, kolvori)).toMatchObject({ power: 6, toughness: 6 });
    expect(keywords(game, kolvori).has("vigilance")).toBe(true);
  });

  it("looks at six, a legendary creature to hand, the rest on the bottom", () => {
    const { game, a } = table();
    const kolvori = spawn(game, "Kolvori, God of Kinship");
    lands(game, "Forest", 2);
    const legend = toLibrary(game, "Isamaru, Hound of Konda");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, legend);
    activate(game, kolvori, 0);
    expect(seen.offered).toEqual([legend]);
    expect(hand(game)).toContain(legend);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(bears)).toBeGreaterThan(library.length - 7);
    expect(library.indexOf(bears)).toBeGreaterThanOrEqual(0);
  });
});

describe("foretelling", () => {
  it("Karfell Harbinger's {U} foretells and casts an instant, and casts no creature", () => {
    const { game } = table();
    const one = spawn(game, "Karfell Harbinger");
    const two = spawn(game, "Karfell Harbinger");
    const behold = toHand(game, "Behold the Multiverse");
    expect(foretellable(game, behold)).toBe(true);
    expect(castable(game, toHand(game, "Azure Mage"))).toBe(false);
    expect(castable(game, toHand(game, "Opt"))).toBe(true);
    game.dispatch({ type: "foretell", player: A, card: behold });
    expect(zone(game, behold)).toBe("exile");
    expect(game.state.objects[one].tapped).toBe(true);
    expect(game.state.objects[two].tapped).toBe(true);
  });

  it("one Harbinger alone isn't the {2}, and it pays beside a land", () => {
    const { game } = table();
    spawn(game, "Karfell Harbinger");
    const behold = toHand(game, "Behold the Multiverse");
    expect(foretellable(game, behold)).toBe(false);
    lands(game, "Wastes", 1);
    expect(foretellable(game, behold)).toBe(true);
  });
});

describe("a cost that contains {C}", () => {
  const TINTED_SPELL = defineCard({
    name: "Tinted Spell",
    manaCost: "{C}{G}",
    colors: ["G"],
    types: ["sorcery"],
    text: "Draw a card.",
    targets: [],
    effect: { kind: "draw", amount: 1 },
  });
  const TINTED_CREATURE = defineCard({
    name: "Tinted Creature",
    manaCost: "{G}",
    colors: ["G"],
    types: ["creature"],
    power: 1,
    toughness: 1,
    text: "{1}: You gain 1 life.\n{C}: You gain 2 life.",
    activated: [
      {
        cost: { mana: "{1}", tap: false },
        targets: [],
        effect: { kind: "gain-life", amount: 1 },
        resolve: null,
        text: "{1}: You gain 1 life.",
      },
      {
        cost: { mana: "{C}", tap: false },
        targets: [],
        effect: { kind: "gain-life", amount: 2 },
        resolve: null,
        text: "{C}: You gain 2 life.",
      },
    ],
  });
  const tinted = (): Game => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      rules: { skipFirstDraw: false, maxHandSize: 99, startingLife: 20 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
      registry: createDefaultRegistry().register(TINTED_SPELL).register(TINTED_CREATURE),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    return game;
  };
  const onBoard = (game: Game, name: string): ObjectId =>
    game.debugSpawn(name, A, "battlefield", { summoningSick: false });

  it("Cultivator Drone's {C} casts a colorless spell, and no coloured one", () => {
    const { game } = table();
    spawn(game, "Cultivator Drone");
    expect(castable(game, toHand(game, "Sol Ring"))).toBe(true);
    lands(game, "Forest", 1);
    expect(castable(game, toHand(game, "Grizzly Bears"))).toBe(false);
  });

  it("all of a coloured spell's cost with {C} in it", () => {
    const game = tinted();
    onBoard(game, "Cultivator Drone");
    onBoard(game, "Forest");
    expect(castable(game, game.debugSpawn("Tinted Spell", A, "hand"))).toBe(true);
  });

  it("an ability of a colorless permanent", () => {
    const { game } = table();
    for (let i = 0; i < 4; i += 1) spawn(game, "Cultivator Drone");
    expect(activatable(game, spawn(game, "Walking Ballista"))).toBe(true);
  });

  it("a coloured permanent's ability only with {C} in its cost", () => {
    const game = tinted();
    onBoard(game, "Cultivator Drone");
    const creature = onBoard(game, "Tinted Creature");
    const offers = game
      .legalActions(A)
      .filter((a) => a.kind === "activate-ability" && a.source === creature)
      .map((a) => (a.kind === "activate-ability" ? a.abilityIndex : -1));
    expect(offers).toEqual([1]);
  });

  it("Eldrazi Displacer's {2}{C}: the whole of a cost with {C} in it", () => {
    const { game } = table();
    spawn(game, "Cultivator Drone");
    spawn(game, "Cultivator Drone");
    spawn(game, "Cultivator Drone");
    expect(activatable(game, spawn(game, "Eldrazi Displacer"))).toBe(true);
  });
});

describe("kicked spells", () => {
  it("Throne of Makindi: a charge counter for {1}, then two of one colour for a kicked spell only", () => {
    const { game } = table();
    const throne = spawn(game, "Throne of Makindi");
    lands(game, "Forest", 1);
    activate(game, throne, 1);
    expect(counters(game, throne, "charge")).toBe(1);
    expect(game.state.objects[throne].tapped).toBe(true);
    game.state.objects[throne].tapped = false;
    game.dispatch({ type: "activate-ability", player: A, source: throne, abilityIndex: 2, targets: [], manaColors: ["G", "G"] });
    expect(pool(game)).toEqual(["G", "G"]);
    expect(counters(game, throne, "charge")).toBe(0);
    const titan = toHand(game, "Kavu Titan");
    expect(castable(game, titan)).toBe(false);
    lands(game, "Forest", 3);
    cast(game, titan, { kicked: true });
    expect(pool(game)).toEqual([]);
    expect(counters(game, titan)).toBe(3);
  });

  it("its first ability is plain {C}", () => {
    const { game } = table();
    spawn(game, "Throne of Makindi");
    expect(castable(game, toHand(game, "Sol Ring"))).toBe(true);
  });
});

describe("cumulative upkeep", () => {
  it("Adarkar Unicorn pays it, and casts nothing", () => {
    const { game, a } = table();
    const wall = spawn(game, "Illusionary Wall");
    spawn(game, "Adarkar Unicorn");
    expect(castable(game, toHand(game, "Merfolk of the Pearl Trident"))).toBe(false);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, wall, "age")).toBe(1);
    expect(zone(game, wall)).toBe("battlefield");
  });

  it("its two outputs, by hand: {U}, or {C}{U}", () => {
    const { game } = table();
    const unicorn = spawn(game, "Adarkar Unicorn");
    activate(game, unicorn, 1);
    expect(pool(game)).toEqual(["C", "U"]);
    expect(game.state.players[A].manaPool.every((u) => u.restriction?.purposes?.includes("cumulative-upkeep"))).toBe(true);
  });
});

describe("Snowfall: a triggered mana ability's own restricted mana, the player's to take", () => {
  it("an Island tapped by hand: an offer with the extra {U}, and one without", () => {
    const { game } = table();
    spawn(game, "Snowfall");
    const [island] = lands(game, "Island", 1);
    const offers = game.legalActions(A).flatMap((x) => (x.kind === "activate-ability" && x.source === island ? [x] : []));
    expect(offers.map((x) => x.manaColors)).toEqual([["U"], ["W"]]);
    game.dispatch({ type: "activate-ability", player: A, source: island, abilityIndex: 0, targets: [], manaColors: ["W"] });
    expect(pool(game)).toEqual(["U"]);
    expect(game.state.players[A].manaPool[0].restriction).toBeUndefined();
  });

  it("taken, the extra {U} is restricted and the land's own isn't", () => {
    const { game } = table();
    spawn(game, "Snowfall");
    const [island] = lands(game, "Island", 1);
    game.dispatch({ type: "activate-ability", player: A, source: island, abilityIndex: 0, targets: [], manaColors: ["U"] });
    expect(pool(game)).toEqual(["U", "U"]);
    const units = game.state.players[A].manaPool;
    expect(units[0].restriction).toBeUndefined();
    expect(units[1].restriction?.purposes).toEqual(["cumulative-upkeep"]);
    expect(castable(game, toHand(game, "Merfolk of the Pearl Trident"))).toBe(true);
    expect(castable(game, toHand(game, "Azure Mage"))).toBe(false);
  });

  it("a snow Island: {U}{U} instead", () => {
    const { game } = table();
    spawn(game, "Snowfall");
    const [snow] = lands(game, "Snow-Covered Island", 1);
    game.dispatch({ type: "activate-ability", player: A, source: snow, abilityIndex: 0, targets: [], manaColors: ["U"] });
    expect(pool(game)).toEqual(["U", "U", "U"]);
  });

  it("paying a spell, the extra is declined: it pays nothing and nothing floats", () => {
    const { game } = table();
    spawn(game, "Snowfall");
    lands(game, "Island", 1);
    const merfolk = toHand(game, "Merfolk of the Pearl Trident");
    expect(castable(game, toHand(game, "Azure Mage"))).toBe(false);
    cast(game, merfolk);
    expect(zone(game, merfolk)).toBe("battlefield");
    expect(pool(game)).toEqual([]);
  });

  it("paying its own cumulative upkeep, one Island pays {U}{U}", () => {
    const { game, a } = table();
    const snowfall = spawn(game, "Snowfall");
    game.state.objects[snowfall].counters.age = 1;
    lands(game, "Island", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, snowfall, "age")).toBe(2);
    expect(zone(game, snowfall)).toBe("battlefield");
  });

  it("any player's Island, and not a Swamp", () => {
    const { game } = table();
    spawn(game, "Snowfall");
    const [swamp] = lands(game, "Swamp", 1);
    activate(game, swamp, 0);
    expect(pool(game)).toEqual(["B"]);
    nextTurn(game);
    const [island] = lands(game, "Island", 1, B);
    expect(game.legalActions(B).filter((x) => x.kind === "activate-ability" && x.source === island)).toHaveLength(2);
  });
});
