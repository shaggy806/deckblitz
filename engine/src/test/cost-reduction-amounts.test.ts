/**
 * What a cost reduction can read and take (rules 601.2c, 601.2f, 118.7): more
 * counts (every counter, colours among permanents, "other", a sum, a card's
 * namesakes, this turn's history across players, a permanent's power, a
 * commander's mana value), coloured reductions and several independent ones on
 * a spell's own text, a reduction tied to a flashback cost, and costs keyed to
 * a spell's chosen targets — a spell's own increase, a static's reduction, and
 * a tax for targeting a player.
 */
import { describe, expect, it } from "vitest";
import { appendJournal } from "../journal.js";
import type { LegalAction } from "../actions.js";
import { createDefaultRegistry, defineCard } from "../cards.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  cast,
  destroy,
  lands,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const offered = (game: Game, card: ObjectId, player: PlayerId = A): boolean => offers(game, card, player).length > 0;
/** Every object or player its first offer may target. */
const optionsOf = (game: Game, card: ObjectId, player: PlayerId = A): readonly unknown[] =>
  (offers(game, card, player)[0]?.targetOptions ?? []).flat().map((r) => (r.kind === "object" ? r.object : r.kind === "player" ? r.player : r));

describe("new counts", () => {
  it("every counter among players and permanents (Lumbering Megasloth)", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const sloth = toHand(game, "Lumbering Megasloth");
    expect(offered(game, sloth)).toBe(false);
    // {10}{G}{G} on 7 lands wants 5 counters.
    game.state.players[A].energy = 1;
    game.state.players[B].counters.poison = 1;
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 2;
    expect(offered(game, sloth)).toBe(false);
    game.state.objects[bears].counters["charge"] = 1;
    expect(offered(game, sloth)).toBe(true);
    cast(game, sloth);
    expect(zone(game, sloth)).toBe("battlefield");
    expect(game.state.objects[sloth].tapped).toBe(true);
  });

  it("colors among permanents you control, each once, and only yours (Wildvine Pummeler)", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const pummeler = toHand(game, "Wildvine Pummeler");
    spawn(game, "Lightning Angel", B);
    expect(offered(game, pummeler)).toBe(false);
    // Green twice over is still one colour: {6}{G} less 1 on five lands.
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves", A, { sick: true });
    expect(offered(game, pummeler)).toBe(false);
    spawn(game, "Goblin Piker");
    expect(offered(game, pummeler)).toBe(true);
  });

  it("each other artifact: the source isn't one of them (Tamiyo's Logbook)", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const logbook = spawn(game, "Tamiyo's Logbook");
    const canActivate = (): boolean =>
      game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === logbook);
    expect(canActivate()).toBe(false);
    spawn(game, "Ornithopter", B);
    expect(canActivate()).toBe(false);
    spawn(game, "Ornithopter");
    expect(canActivate()).toBe(true);
    activate(game, logbook, 0);
    settle(game);
    expect(game.state.objects[logbook].tapped).toBe(true);
  });

  it("the same name in your graveyard, not another card's (Locket of Yesterdays)", () => {
    const { game } = table();
    spawn(game, "Locket of Yesterdays");
    lands(game, "Island", 2);
    toGraveyard(game, "Divination", B);
    toGraveyard(game, "Opt");
    const divination = toHand(game, "Divination");
    // {2}{U} on two lands.
    expect(offered(game, divination)).toBe(false);
    toGraveyard(game, "Divination");
    expect(offered(game, divination)).toBe(true);
  });

  it("a card cast from the graveyard doesn't count itself (rule 601.2a)", () => {
    const { game } = table();
    spawn(game, "Locket of Yesterdays");
    lands(game, "Swamp", 5);
    lands(game, "Forest", 1);
    // Diregraf Rebirth's flashback, {5}{B}{G}, on six lands: nothing off it.
    const rebirth = toGraveyard(game, "Diregraf Rebirth");
    toGraveyard(game, "Grizzly Bears");
    expect(offered(game, rebirth)).toBe(false);
    toGraveyard(game, "Diregraf Rebirth");
    expect(offered(game, rebirth)).toBe(true);
  });

  it("adds up a sum (Gargantuan Leech)", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const leech = toHand(game, "Gargantuan Leech");
    expect(offered(game, leech)).toBe(false);
    toGraveyard(game, "Hidden Necropolis");
    spawn(game, "Hidden Necropolis", B);
    // {7}{B} less the one in the graveyard, on six lands.
    expect(offered(game, leech)).toBe(false);
    spawn(game, "Hidden Necropolis", A, { tapped: true });
    expect(offered(game, leech)).toBe(true);
  });
});

describe("what a spell prints on itself", () => {
  it("takes coloured mana per unit (Khalni Hydra)", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const hydra = toHand(game, "Khalni Hydra");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(offered(game, hydra)).toBe(false);
    spawn(game, "Goblin Piker");
    expect(offered(game, hydra)).toBe(false);
    spawn(game, "Grizzly Bears");
    expect(offered(game, hydra)).toBe(true);
  });

  it("takes a coloured pip under a condition (Ertai's Scorn)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const scorn = toHand(game, "Ertai's Scorn");
    cast(game, toHand(game, "Opt"), { settle: false });
    // {1}{U}{U} with two Islands left: only at {1}{U}.
    expect(offered(game, scorn)).toBe(false);
    game.state.players[B].spellsCastThisTurn = 1;
    expect(offered(game, scorn)).toBe(false);
    game.state.players[B].spellsCastThisTurn = 2;
    expect(offered(game, scorn)).toBe(true);
  });

  it("takes generic and coloured together (Stormwing Entity)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const entity = toHand(game, "Stormwing Entity");
    expect(offered(game, entity)).toBe(false);
    cast(game, toHand(game, "Opt"));
    // {3}{U}{U} less {2}{U} is {1}{U}: the two Islands Opt left.
    expect(offered(game, entity)).toBe(true);
    cast(game, entity);
    expect(zone(game, entity)).toBe("battlefield");
  });

  it("judges two conditions apart (Assassin's Ink)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const ink = toHand(game, "Assassin's Ink");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(offered(game, ink)).toBe(false);
    spawn(game, "Ornithopter");
    expect(offered(game, ink)).toBe(false);
    spawn(game, "Sphere of Safety");
    expect(offered(game, ink)).toBe(true);
    cast(game, ink, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("creatures that died this turn, anyone's (Diregraf Rebirth)", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Swamp", 2);
    toGraveyard(game, "Grizzly Bears");
    const rebirth = toHand(game, "Diregraf Rebirth");
    expect(offered(game, rebirth)).toBe(false);
    const theirs = spawn(game, "Goblin Piker", B);
    const mine = spawn(game, "Goblin Piker");
    destroy(game, theirs);
    expect(offered(game, rebirth)).toBe(false);
    destroy(game, mine);
    expect(offered(game, rebirth)).toBe(true);
  });

  it("permanents sacrificed this turn, anyone's (The Balrog, Durin's Bane)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const balrog = toHand(game, "The Balrog, Durin's Bane");
    expect(offered(game, balrog)).toBe(false);
    const fanatic = spawn(game, "Mogg Fanatic");
    activate(game, fanatic, 0, { targets: [ref(B)] });
    settle(game);
    expect(offered(game, balrog)).toBe(false);
    // Three more of the other player's: {5}{B}{R} less 4, on three lands.
    const theirs = spawn(game, "Grizzly Bears", B);
    appendJournal(game.state, { kind: "sacrificed", player: B, object: theirs, count: 3 });
    expect(offered(game, balrog)).toBe(true);
  });

  it("the power of the permanent reducing, only what its filter takes (The Scarlet Witch)", () => {
    const { game } = table();
    const witch = spawn(game, "The Scarlet Witch");
    lands(game, "Island", 2);
    // Inspiration is {3}{U}, mana value 4: the Witch's 2 power pays the rest.
    const inspiration = toHand(game, "Inspiration");
    const divination = toHand(game, "Divination");
    expect(offered(game, inspiration)).toBe(true);
    // Mana value 3 is below her line.
    expect(offered(game, divination)).toBe(false);
    game.state.objects[witch].counters["-1/-1"] = 1;
    expect(offered(game, inspiration)).toBe(false);
  });

  it("a flashback reduced this way: by a commander on the battlefield or in the command zone", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const visions = toGraveyard(game, "Visions of Glory");
    expect(offered(game, visions)).toBe(false);
    const commander = spawn(game, "Serra Angel");
    game.state.objects[commander].isCommander = true;
    // Mana value 5 off {8}{W}{W}, two lands short.
    expect(offered(game, visions)).toBe(false);
    lands(game, "Plains", 2);
    expect(offered(game, visions)).toBe(true);
  });

  it("only the flashback: its printed cost from hand isn't reduced", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const inHand = toHand(game, "Visions of Glory");
    const commander = spawn(game, "Serra Angel");
    game.state.objects[commander].isCommander = true;
    expect(offered(game, inHand)).toBe(false);
  });
});

describe("costs read off the spell's chosen targets", () => {
  it("a coloured reduction, for a spell that earns it (Brush Off)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const brush = toHand(game, "Brush Off");
    const opt = toHand(game, "Opt");
    cast(game, opt, { settle: false });
    expect(offered(game, brush)).toBe(true);
    cast(game, brush, { targets: [ref(opt)] });
    expect(zone(game, brush)).toBe("graveyard");
    expect(zone(game, opt)).toBe("graveyard");
  });

  it("a creature spell doesn't earn it (Brush Off)", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const brush = toHand(game, "Brush Off");
    cast(game, toHand(game, "Grizzly Bears"), { settle: false });
    expect(offered(game, brush)).toBe(false);
  });

  it("an increase only for a target that matches, not offered beyond the mana (Dragon's Prey)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const prey = toHand(game, "Dragon's Prey");
    const bears = spawn(game, "Grizzly Bears", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    expect(optionsOf(game, prey)).toEqual([bears]);
    lands(game, "Swamp", 2);
    expect(optionsOf(game, prey)).toEqual(expect.arrayContaining([bears, dragon]));
    cast(game, prey, { targets: [ref(dragon)] });
    expect(zone(game, dragon)).toBe("graveyard");
  });

  it("refuses a target its mana can't pay for (Dragon's Prey)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const prey = toHand(game, "Dragon's Prey");
    spawn(game, "Grizzly Bears", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    expect(() => cast(game, prey, { targets: [ref(dragon)] })).toThrow();
  });

  it("isn't castable at all when every target is too dear (Vanish into Eternity)", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const vanish = toHand(game, "Vanish into Eternity");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(offered(game, vanish)).toBe(false);
    const sphere = spawn(game, "Sphere of Safety", B);
    expect(optionsOf(game, vanish)).toEqual([sphere]);
    lands(game, "Plains", 3);
    expect(optionsOf(game, vanish)).toEqual(expect.arrayContaining([bears, sphere]));
  });

  it("a static's reduction, for a matching target only (Killian, Ink Duelist)", () => {
    const { game } = table();
    spawn(game, "Killian, Ink Duelist");
    lands(game, "Swamp", 1);
    const terror = toHand(game, "Terror");
    const creature = spawn(game, "Grizzly Bears", B);
    expect(offered(game, terror)).toBe(true);
    cast(game, terror, { targets: [ref(creature)] });
    expect(zone(game, creature)).toBe("graveyard");
  });

  it("short of the full price, a target that doesn't earn it isn't offered (Killian)", () => {
    const { game } = table();
    spawn(game, "Killian, Ink Duelist");
    lands(game, "Mountain", 1);
    // Lightning Strike is {1}{R}, any target; on one land, only a creature.
    const strike = toHand(game, "Lightning Strike");
    const creature = spawn(game, "Grizzly Bears", B);
    expect(optionsOf(game, strike)).toContain(creature);
    expect(optionsOf(game, strike)).not.toContain(B);
    lands(game, "Mountain", 1);
    expect(optionsOf(game, strike)).toContain(B);
  });

  it("only spells that target this creature, whoever casts them (Spellwild Ouphe)", () => {
    const { game } = table();
    const ouphe = spawn(game, "Spellwild Ouphe", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    const terror = toHand(game, "Terror");
    expect(optionsOf(game, terror)).toEqual([ouphe]);
    cast(game, terror, { targets: [ref(ouphe)] });
    expect(zone(game, ouphe)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("per creature targeted, a player not counting (Battlefield Thaumaturge)", () => {
    const { game } = table();
    spawn(game, "Battlefield Thaumaturge");
    lands(game, "Swamp", 1);
    const terror = toHand(game, "Terror");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(offered(game, terror)).toBe(true);
    cast(game, terror, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a tax for targeting a player or what they control (Monastery Siege)", () => {
    const { game } = table();
    const siege = spawn(game, "Monastery Siege");
    game.state.objects[siege].chosenOnEnter = "Dragons";
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const hers = spawn(game, "Goblin Piker", B);
    const options = optionsOf(game, bolt, B);
    expect(options).toContain(hers);
    expect(options).not.toContain(A);
    expect(options).not.toContain(bears);
    lands(game, "Mountain", 2, B);
    const richer = optionsOf(game, bolt, B);
    expect(richer).toContain(A);
    expect(richer).toContain(bears);
    cast(game, bolt, { player: B, targets: [ref(A)] });
    expect(game.state.players[A].life).toBe(17);
  });

  it("Khans leaves targets alone (Monastery Siege)", () => {
    const { game } = table();
    const siege = spawn(game, "Monastery Siege");
    game.state.objects[siege].chosenOnEnter = "Khans";
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(optionsOf(game, bolt, B)).toContain(A);
  });

  it("the Regent taps and holds, and taxes who targets it (Icefall Regent)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    pickTargets(a, bears);
    const regent = toHand(game, "Icefall Regent");
    cast(game, regent);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    lands(game, "Swamp", 2, B);
    const terror = toHand(game, "Terror", B);
    const piker = spawn(game, "Goblin Piker", A);
    expect(optionsOf(game, terror, B)).toContain(piker);
    expect(optionsOf(game, terror, B)).not.toContain(regent);
    lands(game, "Swamp", 2, B);
    expect(optionsOf(game, terror, B)).toContain(regent);
  });
});

describe("counts with no proving card on this board", () => {
  const TWICE = "Test Domain Twice";
  const TYPES = "Test Sacrificed Types";
  const BLADE = "Test Attached Power";
  const ENERGY = "Test Energy Hulk";
  const WARDEN = "Test Interrupter";
  const BURNER = "Test Energy Burner";
  const MYR = "Test Sacrificial Myr";
  const always = { kind: "controls", filter: {}, atLeast: 0 } as const;
  const POWER_TEXT = "Instant and sorcery spells you cast cost {X} less to cast, where X is equipped creature's power.";
  const WARDEN_TEXT = "Spells your opponents cast from graveyards or from exile cost {2} more to cast.";
  const registry = createDefaultRegistry()
    .register(
      defineCard({
        name: TWICE,
        manaCost: "{10}",
        types: ["artifact"],
        selfCostReduction: { condition: always, reduceGeneric: { scaled: { basicLandTypes: "you" }, by: 2 } },
        text: "This spell costs {2} less to cast for each basic land type among lands you control.",
      }),
    )
    .register(
      defineCard({
        name: TYPES,
        manaCost: "{5}",
        types: ["artifact"],
        selfCostReduction: { condition: always, reduceGeneric: { turnHistory: "sacrificed", cardTypes: true } },
        text: "This spell costs {1} less to cast for each card type among permanents you've sacrificed this turn.",
      }),
    )
    .register(
      defineCard({
        name: BLADE,
        manaCost: "{0}",
        types: ["artifact"],
        subtypes: ["Equipment"],
        text: POWER_TEXT,
        static: [
          {
            affects: { scope: "self" },
            costModification: {
              applies: { typesAnyOf: ["instant", "sorcery"] },
              caster: "you",
              reduceGeneric: { powerOf: "attached" },
            },
            text: POWER_TEXT,
          },
        ],
      }),
    )
    .register(
      defineCard({
        name: ENERGY,
        manaCost: "{4}",
        types: ["artifact"],
        selfCostReduction: { condition: always, reduceGeneric: { turnStat: "energy-paid-or-lost", who: "you" } },
        text: "This spell costs {1} less to cast for each {E} you've paid or lost this turn.",
      }),
    )
    .register(
      defineCard({
        name: WARDEN,
        manaCost: "{0}",
        types: ["enchantment"],
        text: WARDEN_TEXT,
        static: [
          {
            affects: { scope: "self" },
            costModification: {
              applies: {},
              caster: "opponent",
              castFrom: ["graveyard", "exile"],
              castFromAnyones: true,
              increaseGeneric: 2,
            },
            text: WARDEN_TEXT,
          },
        ],
      }),
    )
    .register(
      defineCard({
        name: BURNER,
        manaCost: "{0}",
        types: ["artifact"],
        text: "Pay {E}{E}: You gain 1 life.",
        activated: [
          {
            cost: { mana: null, tap: false, payEnergy: 2 },
            targets: [],
            effect: { kind: "gain-life", amount: 1 },
            resolve: null,
            text: "Pay {E}{E}: You gain 1 life.",
          },
        ],
      }),
    )
    .register(
      defineCard({
        name: MYR,
        manaCost: "{0}",
        types: ["artifact", "creature"],
        subtypes: ["Myr"],
        power: 1,
        toughness: 1,
        text: "Sacrifice this creature: You gain 1 life.",
        activated: [
          {
            cost: { mana: null, tap: false, sacrifice: "self" },
            targets: [],
            effect: { kind: "gain-life", amount: 1 },
            resolve: null,
            text: "Sacrifice this creature: You gain 1 life.",
          },
        ],
      }),
    );
  const fresh = (): Game => {
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

  it("scales a count (Draco's {2} a type)", () => {
    const game = fresh();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const card = toHand(game, TWICE);
    // {10} less 4, on two lands.
    expect(offered(game, card)).toBe(false);
    lands(game, "Swamp", 1);
    // {10} less 6, on three.
    expect(offered(game, card)).toBe(false);
    lands(game, "Mountain", 1);
    // {10} less 8, on four.
    expect(offered(game, card)).toBe(true);
  });

  it("each card type among what you sacrificed, once (Korvold)", () => {
    const game = fresh();
    lands(game, "Plains", 2);
    const card = toHand(game, TYPES);
    activate(game, spawn(game, MYR), 0);
    activate(game, spawn(game, MYR), 0);
    settle(game);
    // An artifact creature, twice: two types off {5}, on two lands.
    expect(offered(game, card)).toBe(false);
    lands(game, "Plains", 1);
    expect(offered(game, card)).toBe(true);
  });

  it("the equipped creature's power, and none unattached (Glamdring)", () => {
    const game = fresh();
    const blade = spawn(game, BLADE);
    lands(game, "Swamp", 1);
    const terror = toHand(game, "Terror");
    spawn(game, "Grizzly Bears", B);
    expect(offered(game, terror)).toBe(false);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[blade].attachedTo = bears;
    expect(offered(game, terror)).toBe(true);
  });

  it("energy paid or lost this turn, not gained (Blaster Hulk)", () => {
    const game = fresh();
    lands(game, "Plains", 2);
    const card = toHand(game, ENERGY);
    const burner = spawn(game, BURNER);
    game.state.players[A].energy = 5;
    expect(offered(game, card)).toBe(false);
    activate(game, burner, 0);
    settle(game);
    expect(game.state.players[A].energy).toBe(3);
    expect(offered(game, card)).toBe(true);
  });

  it("from any graveyard or exile, opponents only (Aven Interrupter)", () => {
    const game = fresh();
    spawn(game, WARDEN, B);
    lands(game, "Swamp", 4);
    lands(game, "Forest", 3);
    const rebirth = toGraveyard(game, "Diregraf Rebirth");
    toGraveyard(game, "Grizzly Bears");
    // {5}{B}{G} and {2} more: seven lands aren't nine. From the hand, no more.
    expect(offered(game, rebirth)).toBe(false);
    const fromHand = toHand(game, "Diregraf Rebirth");
    expect(offered(game, fromHand)).toBe(true);
    lands(game, "Forest", 2);
    expect(offered(game, rebirth)).toBe(true);
  });
});
