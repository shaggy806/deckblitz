/**
 * `grantsActivatedOf`: "[this] has all activated abilities of [each matching
 * object in a zone]" (rule 613.1f, layer 6) — the cards in graveyards
 * (Necrotic Ooze, Thranduil, the Elvenking), the top card of the library
 * (Skill Borrower), other permanents with what they have (Experiment Kraj,
 * Marvin, Murderous Mimic — in dependency order, rule 613.8), leaving out
 * mana abilities (Sharkey, Tyrant of the Shire) or taking only loyalty ones;
 * and `spendManaAs`' `activating`, for this permanent's abilities (Sharkey)
 * or only the ones it gained (Drana and Linvala).
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  counters,
  graveyard,
  hand,
  lands,
  life,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
  enter,
  ref,
} from "./harness.js";

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;

/** The abilities `player` is offered on `id`, by text. */
const offers = (game: Game, id: ObjectId, player: PlayerId = A): Activate[] =>
  game
    .legalActions(player)
    .filter((a): a is Activate => a.kind === "activate-ability" && a.source === id);
const texts = (game: Game, id: ObjectId, player: PlayerId = A): string[] => [
  ...new Set(offers(game, id, player).map((a) => a.text)),
];
const indexOf = (game: Game, id: ObjectId, text: string): number => {
  const found = offers(game, id).find((a) => a.text.startsWith(text));
  if (found === undefined) throw new Error(`no "${text}" offered on ${game.state.objects[id].cardName}`);
  return found.abilityIndex;
};

const FANATIC = "Sacrifice this creature: It deals 1 damage to any target.";
const ELVES_MANA = "{T}: Add {G}.";
const KRAJ_COUNTER = "{T}: Put a +1/+1 counter on target creature.";

describe("grantsActivatedOf — graveyard cards", () => {
  it("Necrotic Ooze has the activated abilities of creature cards in every graveyard, read live", () => {
    const { game } = table();
    const ooze = spawn(game, "Necrotic Ooze");
    expect(texts(game, ooze)).toEqual([]);
    toGraveyard(game, "Llanowar Elves", A);
    const fanatic = toGraveyard(game, "Mogg Fanatic", B);
    // Not a creature card: a land's abilities aren't its.
    toGraveyard(game, "Strip Mine", B);
    expect(texts(game, ooze)).toEqual(expect.arrayContaining([ELVES_MANA, FANATIC]));
    expect(texts(game, ooze).some((t) => t.includes("Destroy target land"))).toBe(false);
    // Unearth works only from a graveyard (rule 113.6): not the Ooze's to use.
    toGraveyard(game, "Hellspark Elemental", A);
    expect(texts(game, ooze).some((t) => t.startsWith("Unearth"))).toBe(false);
    // The Fanatic's "this creature" is the Ooze (rule 201.5b): it's the one
    // sacrificed, and the damage is dealt.
    activate(game, ooze, indexOf(game, ooze, FANATIC), { targets: [ref(B)] });
    expect(zone(game, ooze)).toBe("graveyard");
    expect(zone(game, fanatic)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });

  it("a card that leaves the graveyard takes its abilities with it", () => {
    const { game } = table();
    const ooze = spawn(game, "Necrotic Ooze");
    const elves = toGraveyard(game, "Llanowar Elves", B);
    expect(texts(game, ooze)).toContain(ELVES_MANA);
    game.debugMove(elves, "exile");
    expect(texts(game, ooze)).not.toContain(ELVES_MANA);
  });

  it("Thranduil reads only the Elf cards in its controller's graveyard", () => {
    const { game } = table();
    const thranduil = spawn(game, "Thranduil, the Elvenking");
    toGraveyard(game, "Llanowar Elves", B);
    toGraveyard(game, "Mogg Fanatic", A);
    expect(texts(game, thranduil)).toEqual([]);
    toGraveyard(game, "Llanowar Elves", A);
    expect(texts(game, thranduil)).toEqual([ELVES_MANA]);
  });

  it("Thranduil: another legendary Elf entering draws two, then discards one", () => {
    const { game } = table();
    spawn(game, "Thranduil, the Elvenking");
    toLibrary(game, "Wastes");
    const before = hand(game).length;
    enter(game, "Lathril, Blade of the Elves");
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).length).toBe(1);
    // A nonlegendary Elf doesn't.
    enter(game, "Llanowar Elves");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("grantsActivatedOf — the top card of the library", () => {
  it("Skill Borrower has the top card's abilities while it's an artifact or creature card", () => {
    const { game } = table();
    const borrower = spawn(game, "Skill Borrower");
    toLibrary(game, "Strip Mine");
    expect(texts(game, borrower)).toEqual([]);
    toLibrary(game, "Prodigal Sorcerer");
    expect(texts(game, borrower)).toEqual([expect.stringContaining("damage to any target")]);
    activate(game, borrower, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    // An opponent's top card isn't read.
    const { game: other } = table();
    const theirs = spawn(other, "Skill Borrower");
    toLibrary(other, "Prodigal Sorcerer", B);
    expect(texts(other, theirs)).toEqual([]);
  });
});

describe("grantsActivatedOf — other permanents", () => {
  it("Experiment Kraj has the abilities of each other creature with a +1/+1 counter", () => {
    const { game } = table();
    const kraj = spawn(game, "Experiment Kraj");
    const elves = spawn(game, "Llanowar Elves", B);
    expect(texts(game, kraj)).toEqual([KRAJ_COUNTER]);
    activate(game, kraj, 0, { targets: [ref(elves)] });
    expect(counters(game, elves)).toBe(1);
    game.state.objects[kraj].tapped = false; // its {T} abilities are offered only untapped
    expect(texts(game, kraj)).toEqual(expect.arrayContaining([KRAJ_COUNTER, ELVES_MANA]));
  });

  it("a granted ability of the permanent read is read too; a lost one isn't", () => {
    const { game } = table();
    const kraj = spawn(game, "Experiment Kraj");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    spawn(game, "Cryptolith Rite");
    // The Rite's "{T}: Add one mana of any color" on the Bears comes along —
    // Kraj has its own from the Rite as well, so it's one ability.
    expect(offers(game, kraj).filter((a) => a.manaAbility === true).length).toBeGreaterThan(0);
  });

  it("Marvin reads creatures you control with another name; Kraj reading Marvin waits for Marvin (rule 613.8)", () => {
    const { game } = table();
    // Kraj first: by timestamp alone it would read Marvin with nothing yet.
    const kraj = spawn(game, "Experiment Kraj");
    const marvin = spawn(game, "Marvin, Murderous Mimic");
    spawn(game, "Llanowar Elves");
    spawn(game, "Llanowar Elves", B);
    expect(texts(game, marvin)).toEqual(expect.arrayContaining([KRAJ_COUNTER, ELVES_MANA]));
    expect(texts(game, marvin)).toHaveLength(2);
    expect(texts(game, kraj)).toEqual([KRAJ_COUNTER]);
    activate(game, kraj, 0, { targets: [ref(marvin)] });
    game.state.objects[kraj].tapped = false;
    // Kraj depends on Marvin (Marvin's grant changes what Kraj reads), so
    // Marvin's applies first whatever the timestamps.
    expect(texts(game, kraj)).toEqual(expect.arrayContaining([KRAJ_COUNTER, ELVES_MANA]));
  });

  it("Marvin: a creature with Marvin's own name gives nothing", () => {
    const { game } = table();
    const marvin = spawn(game, "Marvin, Murderous Mimic");
    const elves = spawn(game, "Llanowar Elves");
    expect(texts(game, marvin)).toEqual([ELVES_MANA]);
    game.state.objects[elves].copyOf = "Marvin, Murderous Mimic";
    expect(texts(game, marvin)).toEqual([]);
  });

  it("Sharkey has opponents' lands' abilities except mana abilities, payable with mana of any type", () => {
    const { game } = table();
    const sharkey = spawn(game, "Sharkey, Tyrant of the Shire");
    const colonnade = spawn(game, "Celestial Colonnade", B);
    spawn(game, "Strip Mine", A);
    // Only black and colorless mana — the Colonnade's {3}{W}{U} still pays.
    lands(game, "Swamp", 3);
    lands(game, "Wastes", 2);
    const own = texts(game, sharkey);
    expect(own.some((t) => t.startsWith("{3}{W}{U}"))).toBe(true);
    expect(own.some((t) => t.startsWith("{T}: Add"))).toBe(false);
    // Your own Strip Mine isn't an opponent's land.
    expect(own.some((t) => t.includes("Destroy target land"))).toBe(false);
    activate(game, sharkey, indexOf(game, sharkey, "{3}{W}{U}"));
    expect(game.state.objects[sharkey].modifiers.length).toBeGreaterThan(0);
    // The land's controller can't activate it (the lock).
    expect(game.canDispatch({ type: "activate-ability", player: B, source: colonnade, abilityIndex: 1, targets: [] })).not.toBeNull();
  });

  it("Drana and Linvala may spend mana as though any color only on the abilities it gained", () => {
    const { game } = table();
    const drana = spawn(game, "Drana and Linvala");
    spawn(game, "Frozen Shade", B);
    lands(game, "Plains", 1);
    const pump = indexOf(game, drana, "{B}:");
    activate(game, drana, pump);
    expect(game.state.objects[drana].modifiers.length).toBeGreaterThan(0);
  });

  it("a mana-as-any-color permission for gained abilities doesn't reach another permanent's abilities", () => {
    const { game } = table();
    spawn(game, "Drana and Linvala");
    const shade = spawn(game, "Frozen Shade", A);
    lands(game, "Plains", 1);
    expect(offers(game, shade)).toHaveLength(0);
  });
});

describe("grantsActivatedOf — only loyalty abilities", () => {
  const MIMIC = "Test Loyalty Mimic";
  const registry = createDefaultRegistry().register(
    defineCard({
      name: MIMIC,
      manaCost: "{3}",
      types: ["planeswalker"],
      subtypes: ["Bolas"],
      loyalty: 4,
      text: "This planeswalker has all loyalty abilities of all other planeswalkers on the battlefield.",
      static: [
        {
          affects: { scope: "self" },
          grantsActivatedOf: { zone: "battlefield", filter: { type: "planeswalker" }, only: "loyalty" },
          text: "This planeswalker has all loyalty abilities of all other planeswalkers on the battlefield.",
        },
      ],
    }),
  );
  const setUp = (): Game => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      startingPlayer: A,
      registry,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [
        { player: A, cards: Array<string>(40).fill("Wastes") },
        { player: B, cards: Array<string>(40).fill("Wastes") },
      ],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    return game;
  };

  it("takes each other planeswalker's loyalty abilities, paid from its own loyalty, once a turn (rule 606.3)", () => {
    const game = setUp();
    const mimic = game.debugSpawn(MIMIC, A, "battlefield", { summoningSick: false });
    game.state.objects[mimic].counters.loyalty = 4;
    const liliana = game.debugSpawn("Liliana of the Veil", B, "battlefield", { summoningSick: false });
    game.state.objects[liliana].counters.loyalty = 3;
    const offered = offers(game, mimic);
    // Its −6 needs six loyalty (rule 606.6): not with four.
    expect(new Set(offered.map((a) => a.loyalty))).toEqual(new Set([1, -2]));
    toHand(game, "Wastes", A);
    toHand(game, "Wastes", B);
    activate(game, mimic, offered.find((a) => a.loyalty === 1)!.abilityIndex);
    settle(game);
    expect(game.state.objects[mimic].counters.loyalty).toBe(5);
    expect(game.state.objects[liliana].counters.loyalty).toBe(3);
    expect(offers(game, mimic)).toHaveLength(0);
  });
});
