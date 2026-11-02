/**
 * The Oracle parser behind `npm run card:scaffold` (`scripts/oracle-parse.mjs`).
 *
 * - Templates: a sample of Oracle lines and the structure each becomes — and
 *   the lines that must *not* match, since a half-read sentence is the one
 *   mistake the parser can't be allowed to make.
 * - A parsed card plays: a definition built from Oracle text alone, handed to
 *   `defineCard` and used in a real game.
 * - Ground truth: every ability the parser claims complete, for every card in
 *   the pool, agrees with the hand-authored one (`scripts/oracle-parse-check.mjs`
 *   — `npm run card:parse-check -w engine` prints the full report).
 */

import { describe, expect, it } from "vitest";

import { POOL_CARDS, createDefaultRegistry, defineCard } from "../cards.js";
import { learn, soulbond } from "../cards/helpers.js";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
// @ts-expect-error — a plain .mjs script, typed only at runtime.
import { parseEffect, parseFace, parseTrigger, parseCost, parseSentence, parseTypePhrase } from "../../scripts/oracle-parse.mjs";
// @ts-expect-error — as above.
import { checkPool } from "../../scripts/oracle-parse-check.mjs";

describe("an opponent's spell or ability causing you to discard", () => {
  const read = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Card", type_line, oracle_text, power: "3", toughness: "3" }, { tokenFor: (d: string) => d });
  it("put it onto the battlefield instead, with counters or without", () => {
    const baloth = read(
      "Creature — Beast",
      "If a spell or ability an opponent controls causes you to discard this card, put it onto the battlefield instead of putting it into your graveyard.",
    );
    expect(baloth.complete).toBe(true);
    expect(baloth.discardedByOpponentEnters).toEqual({});
    expect(
      read(
        "Artifact Creature — Golem",
        "If a spell or ability an opponent controls causes you to discard this card, put it onto the battlefield with two +1/+1 counters on it instead of putting it into your graveyard.",
      ).discardedByOpponentEnters,
    ).toEqual({ withCounters: { kind: "+1/+1", amount: 2 } });
  });
  it("whenever it causes you to discard a card, once per card", () => {
    expect(
      read("Enchantment", "Whenever a spell or ability an opponent controls causes you to discard a card, you gain 2 life.").triggered[0].trigger,
    ).toEqual({ on: "discards", who: "you", byOpponent: true, perCard: true });
  });
});

describe("each player paying or bidding an amount of their choosing", () => {
  const read = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Card", type_line, oracle_text, power: "5", toughness: "5" }, { tokenFor: (d: string) => d });
  const join = "Join forces — Starting with you, each player may pay any amount of mana. ";
  const pays = { kind: "players-pay-any-amount", resource: "mana", startingWithYou: true };
  it("join forces: the total, read by what follows", () => {
    expect(read("Sorcery", `${join}Each player draws X cards, where X is the total amount of mana paid this way.`).effect).toEqual({
      ...pays,
      then: { kind: "draw", amount: "x", who: "each-player" },
    });
    expect(read("Sorcery", `${join}Each player mills X cards, where X is the total amount of mana paid this way.`).effect).toEqual({
      ...pays,
      then: { kind: "mill", target: "each-player", amount: "x" },
    });
    expect(read("Sorcery", `${join}Each player creates X 1/1 white Soldier creature tokens, where X is the total amount of mana paid this way.`).effect).toEqual({
      ...pays,
      then: { kind: "create-token", token: "1/1 white Soldier creature token", count: "x", who: "each-player" },
    });
    const dragon = read(
      "Creature — Dragon",
      "Join forces — Whenever this creature attacks or blocks, each player starting with you may pay any amount of mana. This creature gets +X/+0 until end of turn, where X is the total amount of mana paid this way.",
    );
    expect(dragon.complete).toBe(true);
    expect(dragon.triggered.map((t: { trigger: { on: string } }) => t.trigger.on)).toEqual(["attacks", "blocks"]);
    expect(dragon.triggered[1].effect).toEqual({
      ...pays,
      then: { kind: "modify-pt", target: "source", power: "x", toughness: 0, duration: "end-of-turn" },
    });
  });
  it("what each paid: mana from the active player, life round and round", () => {
    const liege = read(
      "Creature — Spirit",
      "When this creature dies, each player may pay any amount of mana. Then each player creates a number of 1/1 green Squirrel creature tokens equal to the amount of mana they paid this way.",
    );
    expect(liege.triggered[0].effect).toEqual({
      kind: "players-pay-any-amount",
      resource: "mana",
      each: { kind: "create-token", token: "1/1 green Squirrel creature token", count: "x", who: "that-player" },
    });
    expect(
      read(
        "Sorcery",
        "Starting with you, each player may pay any amount of life. Repeat this process until no one pays life. Each player creates a 1/1 black Rat creature token for each 1 life they paid this way.",
      ).effect,
    ).toMatchObject({ kind: "players-pay-any-amount", resource: "life", untilNoOnePays: true });
  });
  it("bidding life: who bids, the opening bid and what winning does", () => {
    const rules =
      "In turn order, each player may top the high bid. The bidding ends if the high bid stands. The high bidder loses life equal to the high bid";
    const auction = read(
      "Sorcery",
      `Each player may bid life for control of target creature. You start the bidding with a bid of 0. ${rules} and gains control of the creature. (This effect lasts indefinitely.)`,
    );
    expect(auction.targets).toHaveLength(1);
    expect(auction.effect).toMatchObject({ kind: "bid-life", who: "each-player", opening: 0 });
    expect(
      read("Sorcery", `Each player may bid life. You start the bidding with a bid of any number. ${rules} and draws four cards.`).effect,
    ).toMatchObject({ kind: "bid-life", opening: "any" });
    expect(
      read("Instant", `You and target spell's controller bid life. You start the bidding with a bid of 1. ${rules}. If you win the bidding, counter that spell.`).effect,
    ).toEqual({
      kind: "bid-life",
      who: { youAndControllerOfTarget: 0 },
      opening: 1,
      then: { kind: "lose-life", amount: "x", who: "that-player" },
      ifYouWin: { kind: "counter", target: 0 },
    });
  });
});

describe("what a permanent has dealt damage to", () => {
  const read = (type_line: string, oracle_text: string, power?: string) =>
    parseFace({ name: "Card", type_line, oracle_text, ...(power ? { power, toughness: power } : {}) }, { tokenFor: () => null });
  it("a filter on a creature that dealt damage this turn, to you or at all", () => {
    expect(read("Instant", "Exile target creature that dealt damage to you this turn.").targets[0].filter).toEqual({
      type: "creature",
      dealtDamageThisTurn: { to: "you" },
    });
    expect(read("Instant", "Destroy all creatures that dealt damage to you this turn.").effect.filter).toEqual({
      type: "creature",
      dealtDamageThisTurn: { to: "you" },
    });
    expect(read("Instant", "Destroy target creature that dealt damage this turn.").targets[0].filter).toEqual({
      type: "creature",
      dealtDamageThisTurn: true,
    });
  });
  it("hexproof until it has dealt damage, or combat damage", () => {
    expect(read("Creature — Dragon", "This creature has hexproof as long as it hasn't dealt damage yet.", "1").static[0]).toMatchObject({
      condition: { kind: "self-hasnt-dealt-damage" },
      grantKeywords: ["hexproof"],
    });
    expect(read("Creature — Ogre", "This creature has hexproof as long as they haven't dealt combat damage yet.", "1").static[0]).toMatchObject({
      condition: { kind: "self-hasnt-dealt-damage", combat: true },
    });
  });
});

describe("would-create-token replacements", () => {
  const read = (oracle_text: string) => {
    const face = parseFace(
      { name: "Card", type_line: "Creature — Elf", oracle_text, power: "1", toughness: "1" },
      { tokenFor: (desc: string) => `${/(\w+)(?: creature| artifact)*( with .*)?$/.exec(desc)?.[1]} Token` },
    );
    return face.static[0]?.replacement;
  };
  it("those tokens plus an additional one, of any token or some", () => {
    expect(
      read(
        'If you would create one or more tokens, instead create those tokens plus an additional Food token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")',
      ),
    ).toEqual({ event: "would-create-token", plusOneToken: "Food Token" });
    expect(
      read("If you would create one or more Treasure tokens, instead create those tokens plus an additional Treasure token."),
    ).toEqual({ event: "would-create-token", plusOneToken: "Treasure Token", ofTokens: { subtypesAnyOf: ["Treasure"] } });
    expect(
      read(
        "If one or more artifact tokens would be created under your control, those tokens plus an additional 1/1 colorless Thopter artifact creature token with flying are created instead.",
      ),
    ).toEqual({ event: "would-create-token", plusOneToken: "Thopter Token", ofTokens: { type: "artifact" } });
    expect(
      read("If one or more creature tokens would be created under your control, those tokens plus a 1/1 white Soldier creature token are created instead."),
    ).toEqual({ event: "would-create-token", plusOneToken: "Soldier Token", ofTokens: { type: "creature" } });
    expect(
      read("If one or more tokens would be created under your control, those tokens plus that many 1/1 green Squirrel creature tokens are created instead."),
    ).toEqual({ event: "would-create-token", plusTokens: "Squirrel Token" });
  });
  it("other tokens instead, and one of each", () => {
    expect(
      read("If one or more artifact tokens would be created under your control, that many 5/5 red Dragon creature tokens with flying are created instead."),
    ).toEqual({ event: "would-create-token", tokensInstead: "Dragon Token", ofTokens: { type: "artifact" } });
    expect(read("If you would create a Fish token, create a 3/3 blue Shark creature token instead.")).toEqual({
      event: "would-create-token",
      tokensInstead: "Shark Token",
      ofTokens: { subtypesAnyOf: ["Fish"] },
    });
    expect(read("If you would create a Clue, Food, or Treasure token, instead create one of each.")).toEqual({
      event: "would-create-token",
      oneOfEach: ["Clue Token", "Food Token", "Treasure Token"],
      ofTokens: { subtypesAnyOf: ["Clue", "Food", "Treasure"] },
    });
  });
  it("not a replacement the player may choose", () => {
    expect(
      read("If you would create one or more tokens, you may instead create that many 2/2 green Cat creature tokens with haste or that many 3/1 green Dog creature tokens with vigilance."),
    ).toBeUndefined();
  });
});

describe("when a spell may be cast or an ability activated", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Card", type_line, oracle_text, mana_cost: "{7}", colors: [], cmc: 7 } as never) as unknown as Record<string, unknown> & {
      static?: Record<string, unknown>[];
      activated?: Record<string, unknown>[];
    };
  const staticOf = (text: string): Record<string, unknown> | undefined => face("Artifact", text).static?.[0];

  it("reads flash for an extra cost, and a condition on being countered", () => {
    expect(face("Sorcery", "You may cast this spell as though it had flash if you pay {2} more to cast it. (You may cast it any time you could cast an instant.)").kicker).toEqual({
      cost: "{2}",
      keyword: "flash",
      flash: true,
    });
    expect(face("Sorcery", "Spell mastery — If there are two or more instant and/or sorcery cards in your graveyard, this spell can't be countered.").cantBeCountered).toEqual({
      kind: "cards-in-graveyard",
      atLeast: 2,
      filter: { typesAnyOf: ["instant", "sorcery"] },
    });
  });

  it("reads only your opponents activating", () => {
    const ability = face("Enchantment", "{3}: Destroy this enchantment. Only your opponents may activate this ability and only as a sorcery.").activated?.[0];
    expect(ability?.anyPlayer).toBe(true);
    expect(ability?.onlyOpponents).toBe(true);
    expect(ability?.sorcerySpeed).toBe(true);
  });

  it("reads the statics of timing, haste and loyalty", () => {
    expect(staticOf("Each opponent can cast spells only any time they could cast a sorcery.")?.prohibits).toEqual({
      who: "opponents",
      castOnlyAsSorcery: true,
    });
    expect(staticOf("You may activate abilities of creatures you control as though those creatures had haste.")?.activateAsThoughHaste).toEqual({ type: "creature" });
    expect(staticOf("You may activate the loyalty abilities of planeswalkers you control twice each turn rather than only once.")?.loyaltyActivationsEachTurn).toBe(2);
    expect(staticOf("Players can't activate planeswalkers' loyalty abilities.")?.prohibits).toEqual({
      who: "each-player",
      abilitiesOf: { type: "planeswalker" },
      onlyLoyaltyAbilities: true,
    });
    expect(staticOf("Enchanted player can't activate abilities that aren't mana abilities or loyalty abilities.")?.prohibits).toEqual({
      who: "enchanted-player",
      abilitiesOf: {},
      anyZone: true,
      exceptManaAbilities: true,
      exceptLoyaltyAbilities: true,
    });
  });
});

describe("what a spell costs: amounts, colours and targets", () => {
  const always = { kind: "controls", filter: {}, atLeast: 0 };
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Card", type_line, oracle_text, mana_cost: "{7}", colors: [], cmc: 7 } as never) as unknown as Record<string, unknown> & {
      static?: { costModification?: unknown; targetedBySpellsCost?: unknown }[];
      activated?: { costReduction?: unknown }[];
    };
  const self = (text: string): unknown => face("Sorcery", text).selfCostReduction;

  it("reads a count of what a spell costs less for", () => {
    expect(self("This spell costs {1} less to cast for each counter among players and permanents.")).toEqual({
      condition: always,
      reduceGeneric: { allCounters: true },
    });
    expect(self("Vivid — This spell costs {1} less to cast for each color among permanents you control.")).toEqual({
      condition: always,
      reduceGeneric: { colorsAmong: { controlledBy: "you" } },
    });
    expect(self("This spell costs {1} less to cast for each Cave you control and each Cave card in your graveyard.")).toEqual({
      condition: always,
      reduceGeneric: { sum: [{ countOf: { subtype: "Cave", controlledBy: "you" } }, { cardsInGraveyard: { subtype: "Cave" } }] },
    });
    expect(self("This spell costs {2} less to cast for each creature that died this turn.")).toEqual({
      condition: always,
      reduceGeneric: { turnHistory: "died", who: "any-player", filter: { type: "creature" }, times: 2 },
    });
    expect(self("Domain — This spell costs {2} less to cast for each basic land type among lands you control.")).toEqual({
      condition: always,
      reduceGeneric: { scaled: { basicLandTypes: "you" }, by: 2 },
    });
  });

  it("reads coloured reductions and two conditions", () => {
    expect(self("This spell costs {G} less to cast for each green creature you control.")).toEqual({
      condition: always,
      reduceColored: "{G}",
      reduceColoredTimes: { countOf: { type: "creature", colors: ["G"], controlledBy: "you" } },
    });
    expect(self("This spell costs {U} less to cast if an opponent cast two or more spells this turn.")).toEqual({
      condition: { kind: "turn-stat", stat: "spells-cast", who: "opponent", atLeast: 2 },
      reduceColored: "{U}",
    });
    expect(self("This spell costs {2}{U} less to cast if you've cast an instant or sorcery spell this turn.")).toEqual({
      condition: { kind: "cast-this-turn", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      reduceGeneric: 2,
      reduceColored: "{U}",
    });
    expect(self("This spell costs {1} less to cast if you control an artifact and {1} less to cast if you control an enchantment.")).toEqual([
      { condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 }, reduceGeneric: 1 },
      { condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 }, reduceGeneric: 1 },
    ]);
  });

  it("reads a spell's own price by target", () => {
    expect(face("Instant", "This spell costs {2} more to cast if it targets a Dragon.").targetCostIncrease).toEqual({
      filter: { subtype: "Dragon" },
      increaseGeneric: 2,
    });
    expect(face("Instant", "This spell costs {1}{U} less to cast if it targets an instant or sorcery spell.").targetCostReduction).toEqual({
      filter: { typesAnyOf: ["instant", "sorcery"] },
      reduceGeneric: 1,
      reduceColored: "{U}",
    });
  });

  it("reads a flashback reduced this way", () => {
    const visions = face(
      "Sorcery",
      "Flashback {8}{W}{W}. This spell costs {X} less to cast this way, where X is the greatest mana value of a commander you own on the battlefield or in the command zone. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    );
    expect(visions.flashback).toEqual({ cost: "{8}{W}{W}" });
    expect(visions.selfCostReduction).toEqual({
      condition: always,
      thisWay: "flashback",
      reduceGeneric: { commanderManaValue: "battlefield-or-command-zone" },
    });
  });

  it("reads statics keyed to a spell's targets, zone, namesakes and a power", () => {
    const creature = "Creature — Human";
    const staticOf = (text: string): unknown => face(creature, text).static?.[0]?.costModification;
    expect(staticOf("Spells you cast that target a creature cost {2} less to cast.")).toEqual({
      applies: {},
      caster: "you",
      targeting: { type: "creature" },
      reduceGeneric: 2,
    });
    expect(staticOf("Spells that target this creature cost {2} less to cast.")).toEqual({
      applies: {},
      targetingSource: true,
      reduceGeneric: 2,
    });
    expect(staticOf("Each instant and sorcery spell you cast costs {1} less to cast for each creature it targets.")).toEqual({
      applies: { typesAnyOf: ["instant", "sorcery"] },
      caster: "you",
      perTarget: true,
      targeting: { type: "creature" },
      reduceGeneric: 1,
    });
    expect(staticOf("Spells you cast cost {1} less to cast for each card with the same name as that spell in your graveyard.")).toEqual({
      applies: {},
      caster: "you",
      reduceGeneric: { cardsInGraveyard: {}, sameNameAsSpell: true },
    });
    expect(staticOf("Spells your opponents cast from graveyards or from exile cost {2} more to cast.")).toEqual({
      applies: {},
      caster: "opponent",
      castFrom: ["graveyard", "exile"],
      castFromAnyones: true,
      increaseGeneric: 2,
    });
    expect(staticOf("Instant and sorcery spells you cast with mana value 4 or greater cost {X} less to cast, where X is this creature's power.")).toEqual({
      applies: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "gte", n: 4 } },
      caster: "you",
      reduceGeneric: { powerOf: "source" },
    });
    expect(face(creature, "Spells your opponents cast that target you or a permanent you control cost {2} more to cast.").static?.[0]?.targetedBySpellsCost).toEqual({
      payGeneric: 2,
      targetingYou: true,
      targeting: { controlledBy: "you" },
    });
  });

  it("reads an ability's own reduction", () => {
    const logbook = face(
      "Artifact",
      "{5}{U}, {T}: Draw a card. This ability costs {1} less to activate for each other artifact you control.",
    );
    expect(logbook.activated?.[0].costReduction).toEqual({
      reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" }, excludeSelf: true },
    });
  });
});

type Ctx = { targets: unknown[]; target: (spec: unknown) => number; tokenFor: () => string | null; onStack?: boolean };
const ctx = (overrides: Partial<Ctx> = {}): Ctx => {
  const targets: unknown[] = [];
  return { targets, target: (spec) => targets.push(spec) - 1, tokenFor: () => null, ...overrides };
};

describe("pack tactics", () => {
  it("reads the attackers' total power as an intervening-if, under the ability word", () => {
    const gnoll = parseFace(
      {
        name: "Test Gnoll",
        type_line: "Creature — Gnoll",
        mana_cost: "{1}",
        oracle_text: "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, put a +1/+1 counter on this creature.",
      },
      { tokenFor: () => null },
    );
    expect(gnoll.complete).toBe(true);
    expect(gnoll.triggered[0].condition).toEqual({ kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 });
    expect(gnoll.triggered[0].effect).toEqual({ kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 });
  });
});

describe("skipping a turn and what's said about an extra one", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Medomai the Test", type_line, mana_cost: "{1}", oracle_text }, { tokenFor: () => null });

  it.each([
    ["You skip your next turn.", { kind: "skip-turn", who: "you" }],
    ["Skip your next turn.", { kind: "skip-turn", who: "you" }],
    ["You skip your next two turns.", { kind: "skip-turn", who: "you", count: 2 }],
    ["Each opponent skips their next turn.", { kind: "skip-turn", who: "each-opponent" }],
  ])("%s", (text, effect) => {
    const spell = face("Sorcery", text);
    expect(spell.complete).toBe(true);
    expect(spell.effect).toEqual(effect);
  });

  it("a targeted skip takes a slot", () => {
    const spell = face("Sorcery", "Target opponent skips their next turn.");
    expect(spell.effect).toEqual({ kind: "skip-turn", who: 0 });
    expect(spell.targets).toHaveLength(1);
  });

  it("an extra turn alone, and with what's said about that turn", () => {
    expect(face("Sorcery", "Take an extra turn after this one.").effect).toEqual({ kind: "take-extra-turn" });
    expect(face("Sorcery", "Target player takes an extra turn after this one.").effect).toEqual({ kind: "take-extra-turn", target: 0 });
    expect(face("Sorcery", "Take an extra turn after this one. Skip the untap step of that turn.").effect).toEqual({
      kind: "take-extra-turn",
      skipUntapStep: true,
    });
    const lose = { effect: { kind: "lose-game" }, text: "At the beginning of that turn's end step, you lose the game." };
    expect(face("Sorcery", "Take an extra turn after this one. At the beginning of that turn's end step, you lose the game.").effect).toEqual({
      kind: "take-extra-turn",
      thatTurn: { atEndStep: lose },
    });
    expect(
      face("Sorcery", "Take an extra turn after this one. During that turn, damage can't be prevented. At the beginning of that turn's end step, you lose the game.").effect,
    ).toEqual({ kind: "take-extra-turn", thatTurn: { damageCantBePrevented: true, atEndStep: lose } });
    // What it doesn't know about that turn, it doesn't read.
    expect(face("Sorcery", "Take an extra turn after this one. During that turn, power-up abilities can't be activated.").complete).toBe(false);
  });

  it("can't attack during extra turns", () => {
    const sphinx = face("Legendary Creature — Sphinx", "Medomai can't attack during extra turns.");
    expect(sphinx.complete).toBe(true);
    expect(sphinx.static[0]).toMatchObject({ affects: { scope: "self" }, condition: { kind: "extra-turn" }, restrictions: ["cant-attack"] });
  });
});

describe("an activated ability's own reduction, under a condition", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test", type_line, mana_cost: "{1}", oracle_text }, { tokenFor: () => null });

  it.each([
    ["during your turn", { kind: "your-turn" }],
    ["if you're the monarch", { kind: "monarch", who: "you" }],
    ["if you have one or fewer cards in hand", { kind: "hand-size", atMost: 1 }],
    ["if you've drawn three or more cards this turn", { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 3 }],
    ["if you control a legendary creature", { kind: "controls", filter: { type: "creature", supertype: "legendary" }, atLeast: 1 }],
  ])("costs {2} less to activate %s", (clause, condition) => {
    const thing = face("Artifact", `{3}, {T}: Draw a card. This ability costs {2} less to activate ${clause}.`);
    expect(thing.activated[0].costReduction).toEqual({ reduceGeneric: 2, condition });
    expect(thing.activated[0].effect).toEqual({ kind: "draw", amount: 1 });
  });

  it("the coloured part, before an 'Activate only'", () => {
    const kami = face(
      "Creature — Spirit",
      "{4}{B}: Draw a card. This ability costs {4}{B} less to activate if you've drawn three or more cards this turn. Activate only once each turn.",
    );
    expect(kami.activated[0].costReduction).toMatchObject({ reduceGeneric: 4, reduceColored: "{B}" });
    expect(kami.activated[0].oncePerTurn).toBe(true);
  });

  it("an equip, and a condition it can't read stays for a person", () => {
    const shield = face("Artifact — Equipment", "Equip {4}. This ability costs {3} less to activate if you're the monarch.");
    expect(shield.activated[0].cost.mana).toBe("{4}");
    expect(shield.activated[0].costReduction).toEqual({ reduceGeneric: 3, condition: { kind: "monarch", who: "you" } });
    const odd = face("Artifact", "{3}: Draw a card. This ability costs {2} less to activate if the moon is full.");
    expect(odd.activated.length === 0 || odd.activated[0].costReduction === undefined).toBe(true);
    expect(odd.complete).toBe(false);
  });
});

describe("the players a sentence names by another target, the Aura's host and the trigger", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test", type_line, mana_cost: "{1}", oracle_text }, { tokenFor: () => null });
  const CREATURE = "Creature — Human";

  it("a second target tied to the first's player, the word twice", () => {
    const blaze = face(
      "Creature — Avatar",
      "When this creature enters, this creature deals 2 damage to target opponent or planeswalker and 2 damage to up to one target creature that player or that planeswalker's controller controls.",
    );
    expect(blaze.triggered[0].targets).toEqual([
      "opponent-or-planeswalker",
      { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 }, sameController: true, sameObjectAllowed: true } },
    ]);
    expect(blaze.triggered[0].effect).toEqual({
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: 2, target: 0 },
        { kind: "damage", amount: 2, target: 1 },
      ],
    });
    expect(
      face("Sorcery", "Test deals 4 damage to target player or planeswalker and each creature that player or that planeswalker's controller controls.").effect,
    ).toEqual({
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: 4, target: 0 },
        { kind: "damage-all", filter: { type: "creature" }, amount: 4, controlledByTarget: 0 },
      ],
    });
  });

  it("a group tied to a player an earlier sentence targeted, and not without one", () => {
    const yosei = face(CREATURE, "When this creature dies, target player skips their next untap step. Tap up to five target permanents that player controls.");
    expect(yosei.triggered[0].targets).toEqual(["player", { kind: "any-number", of: "permanent", max: 5, sameController: { slot: 0 } }]);
    expect(yosei.triggered[0].effect.effects[1]).toEqual({ kind: "for-each-target", from: 1, simultaneous: true, effect: { kind: "tap", target: 1 } });
    expect(face(CREATURE, "When this creature dies, tap up to five target permanents that player controls.").triggered[0].complete).toBeFalsy();
  });

  it("the Aura's host's controller, and the upkeep that's theirs", () => {
    const aura = "Enchantment — Aura";
    const gremlin = face(aura, "Enchant artifact\nAt the beginning of your end step, this Aura deals 2 damage to enchanted artifact's controller.");
    expect(gremlin.triggered[0].effect).toEqual({ kind: "damage", amount: 2, who: "attached-controller" });
    const smart = face(aura, "Enchant creature\nAt the beginning of the upkeep of enchanted creature's controller, that player draws a card.");
    expect(smart.triggered[0].trigger).toEqual({ on: "step-begins", step: "upkeep", who: "attached" });
    expect(smart.triggered[0].effect).toEqual({ kind: "draw", amount: 1, who: "active-player" });
  });

  it("that player's step: a creature they control", () => {
    const siege = face("Enchantment", "At the beginning of combat on each opponent's turn, tap target creature that player controls.");
    expect(siege.triggered[0].trigger).toEqual({ on: "step-begins", step: "begin-combat", who: "opponent" });
    expect(siege.triggered[0].targets).toEqual([{ kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } }]);
  });

  it("the opponents of whoever the trigger is about", () => {
    const stand = face("Enchantment", "When a player casts a spell, sacrifice this enchantment. If you do, each of that player's opponents draws three cards.");
    expect(stand.triggered[0].effect).toEqual({
      kind: "sacrifice-source",
      then: { kind: "draw", amount: 3, who: "opponents-of-trigger-controller" },
    });
    const wood = face(CREATURE, "Whenever a player casts a noncreature spell, each of that player's opponents may draw a card.");
    expect(wood.triggered[0].effect.who).toBe("opponents-of-trigger-controller");
    const board = parseSentence("Each of its controller's opponents draws a card and gains 2 life.", ctx());
    expect(board.effects[1]).toEqual({ kind: "gain-life", amount: 2, who: "opponents-of-trigger-controller" });
  });

  it("each player who can't, found before the instruction", () => {
    const grim = face(CREATURE, "When this creature enters, each opponent discards a card. For each opponent who can't, you gain 4 life.");
    expect(grim.triggered[0].effect).toMatchObject({
      kind: "for-each-player",
      who: "each-opponent",
      before: { kind: "discard", target: "each-opponent", amount: 1 },
      effect: { kind: "gain-life", amount: 4 },
    });
    const craft = face(CREATURE, "When this creature enters, each player sacrifices a creature or planeswalker of their choice. Each player who can't discards a card.");
    expect(craft.triggered[0].effect).toMatchObject({ choicesHeld: true, effect: { kind: "discard", target: "that-player" } });
    // Nothing about "can't", the plain discard.
    expect(face(CREATURE, "When this creature enters, each opponent discards a card.").triggered[0].effect.kind).toBe("discard");
  });

  it("a defending player's creatures, and base power and toughness over a target player's", () => {
    const dragon = face(CREATURE, "Whenever this creature attacks, creatures defending player controls get -1/-1 until end of turn.");
    expect(dragon.triggered[0].effect).toMatchObject({ kind: "modify-pt-all", controlledByPlayer: "trigger-player", power: -1 });
    expect(face("Sorcery", "Until your next turn, creatures target player controls have base power and toughness 1/1.").effect).toEqual({
      kind: "animate-all",
      filter: { type: "creature", controlledBy: "you" },
      controlledByTarget: 0,
      power: 1,
      toughness: 1,
      duration: "until-your-next-turn",
    });
  });
});

describe("reveal until, and where the rest goes", () => {
  const nonland = { notTypes: ["land"] };
  const spell = (oracle_text: string) =>
    parseFace({ name: "Test", type_line: "Sorcery", mana_cost: "{1}", oracle_text }, { tokenFor: () => null });

  it.each([
    [
      "Reveal cards from the top of your library until you reveal a nonland card, then put all cards revealed this way into your hand.",
      [],
      { kind: "reveal-until", filter: nonland, rest: "hand" },
    ],
    [
      "Reveal cards from the top of your library until you reveal a creature card. Put that card into your hand and the rest on the bottom of your library in any order.",
      [],
      { kind: "reveal-until", filter: { type: "creature" }, put: "hand", rest: "bottom-any-order" },
    ],
    [
      "Reveal cards from the top of your library until you reveal a land card. Put that card onto the battlefield tapped and the rest on the bottom of your library in a random order.",
      [],
      { kind: "reveal-until", filter: { type: "land" }, put: "battlefield", tapped: true, rest: "bottom-random" },
    ],
    [
      "Choose any target. Reveal cards from the top of your library until you reveal a nonland card. Test deals damage equal to that card's mana value to that permanent or player. Put the revealed cards on the bottom of your library in any order.",
      ["any-target"],
      {
        kind: "reveal-until",
        filter: nonland,
        then: { kind: "damage", target: 1, amount: { manaValueOf: 0 } },
        thenKeepsTargets: true,
        rest: "bottom-any-order",
      },
    ],
    [
      "Choose any target. Reveal cards from the top of your library until you reveal a nonland card. Test deals damage equal to that card's mana value to that permanent or player. Put the nonland card into your hand and the rest on the bottom of your library in any order.",
      ["any-target"],
      {
        kind: "reveal-until",
        filter: nonland,
        put: "hand",
        then: { kind: "damage", target: 1, amount: { manaValueOf: 0 } },
        thenKeepsTargets: true,
        rest: "bottom-any-order",
      },
    ],
    [
      "Choose target creature. Reveal cards from the top of your library until you reveal a nonland card. That creature gets +X/-X until end of turn, where X is that card's mana value. Put all cards revealed this way on the bottom of your library in any order.",
      ["creature"],
      {
        kind: "reveal-until",
        filter: nonland,
        then: {
          kind: "modify-pt",
          target: 1,
          power: { manaValueOf: 0 },
          toughness: { product: [{ manaValueOf: 0 }, -1] },
          duration: "end-of-turn",
        },
        thenKeepsTargets: true,
        rest: "bottom-any-order",
      },
    ],
    [
      "Reveal cards from the top of your library until you reveal three nonland cards. Put the nonland cards revealed this way into your hand, then put the rest of the revealed cards on the bottom of your library in any order.",
      [],
      { kind: "reveal-until-count", filter: nonland, count: 3, put: "hand", rest: "bottom-any-order" },
    ],
  ])("%s", (text, targets, effect) => {
    const parsed = spell(text);
    expect(parsed.complete).toBe(true);
    expect(parsed.effect).toEqual(effect);
    expect(parsed.targets).toEqual(targets);
  });

  it("the shapes it doesn't know stay unread", () => {
    expect(
      spell(
        "Reveal cards from the top of your library until you reveal a nonland card. Put the revealed cards on the bottom of your library in any order.",
      ).complete,
    ).toBe(false);
    expect(
      spell(
        "Choose any target. Reveal cards from the top of your library until you reveal a nonland card. Put that card into your hand and the rest on the bottom of your library in any order.",
      ).complete,
    ).toBe(false);
  });
});

describe("an emblem's static abilities", () => {
  const self = { scope: "self" };
  it.each([
    ['You get an emblem with "You have no maximum hand size."', { affects: self, noMaxHandSize: true }],
    [
      "You get an emblem with \"You may activate loyalty abilities of planeswalkers you control on any player's turn any time you could cast an instant.\"",
      { affects: self, loyaltyAtInstantSpeed: true },
    ],
    [
      'You get an emblem with "Artifacts, creatures, enchantments, and lands you control have indestructible."',
      {
        affects: { scope: "filter", filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"], controlledBy: "you" } },
        grantKeywords: ["indestructible"],
      },
    ],
    [
      'You get an emblem with "If a source would deal damage to you or a planeswalker you control, prevent all but 1 of that damage."',
      {
        affects: self,
        replacement: { event: "would-deal-damage", to: "your-side", toFilter: { type: "planeswalker" }, preventAllBut: 1 },
      },
    ],
    [
      "You get an emblem with \"As long as you control a Gideon planeswalker, you can't lose the game and your opponents can't win the game.\"",
      {
        affects: self,
        condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Gideon" }, atLeast: 1 },
        cantLoseGame: true,
        opponentsCantWinGame: true,
      },
    ],
    [
      'You get an emblem with "You may cast instant and sorcery spells from your graveyard. If a spell cast this way would be put into your graveyard, exile it instead."',
      { affects: self, castFromGraveyard: { filter: { typesAnyOf: ["instant", "sorcery"] }, exileAfterwards: true } },
    ],
    [
      'You get an emblem with "You may cast spells from your hand without paying their mana costs."',
      { affects: self, alternativeCostForSpells: { mana: "{0}", fromHand: true } },
    ],
    [
      "You get an emblem with \"Your opponents can't cast noncreature spells.\"",
      { affects: self, prohibits: { who: "opponents", spells: { notTypes: ["creature"] } } },
    ],
  ])("%s", (line, expected) => {
    const parsed = parseSentence(line, ctx());
    expect(parsed.kind).toBe("create-emblem");
    expect(parsed.static).toMatchObject(expected);
  });

  it("a quoted triggered ability, or a line no reader takes, stays unread", () => {
    expect(parseSentence('You get an emblem with "Whenever you cast a spell, draw a card."', ctx())).toBeNull();
    expect(
      parseSentence(
        'You get an emblem with "You have no maximum hand size" and "Whenever a card is put into your graveyard from anywhere, you may return it to your hand."',
        ctx(),
      ),
    ).toBeNull();
    expect(parseSentence("You get an emblem with \"Islands you control have '{T}: Draw a card.'\"", ctx())).toBeNull();
  });
});

describe("effect templates", () => {
  it.each([
    ["Draw two cards.", { kind: "draw", amount: 2 }],
    ["You control target player during that player's next turn.", { kind: "control-player", target: 0 }],
    ["You control target opponent during their next turn.", { kind: "control-player", target: 0 }],
    ["You control target opponent during their next combat phase.", { kind: "control-player", target: 0, during: "next-combat" }],
    ["You choose which creatures attack this turn.", { kind: "choose-combat", attackers: true }],
    ["You choose which creatures block this turn and how those creatures block.", { kind: "choose-combat", blocks: "all" }],
    [
      "Creatures your opponents control block this turn if able, and you choose how those creatures block.",
      { kind: "choose-combat", blocks: "opponents", blockIfAble: true },
    ],
    ["You gain 3 life.", { kind: "gain-life", amount: 3 }],
    ["Each opponent loses 1 life.", { kind: "lose-life", amount: 1, who: "each-opponent" }],
    ["~ deals 3 damage to any target.", { kind: "damage", amount: 3, target: 0 }],
    ["Destroy target nonland permanent.", { kind: "destroy", target: 0 }],
    ["Scry 2.", { kind: "scry", amount: 2 }],
    ["~ gets +1/+0 until end of turn.", { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" }],
    ["Target creature gains flying until end of turn.", { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" }],
    [
      "Target creature you control gains protection from the color of your choice until end of turn.",
      { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
    ],
    [
      "Target creature gains protection from artifacts or from the color of your choice until end of turn.",
      {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color", or: [{ text: "artifacts", from: { types: ["artifact"] } }] },
        duration: "end-of-turn",
      },
    ],
    [
      "~ gains protection from black and from red until end of turn.",
      { kind: "grant-protection", target: "source", from: { colors: ["B", "R"] }, duration: "end-of-turn" },
    ],
    [
      "Target creature gains protection from each color until your next turn.",
      { kind: "grant-protection", target: 0, from: { colors: ["W", "U", "B", "R", "G"] }, duration: "until-your-next-turn" },
    ],
    [
      "Creatures you control gain protection from artifacts until end of turn.",
      { kind: "grant-protection", filter: { type: "creature", controlledBy: "you" }, from: { types: ["artifact"] }, duration: "end-of-turn" },
    ],
    [
      "Target creature can't be blocked by creatures with power 2 or less this turn.",
      { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { power: { op: "lte", n: 2 } } },
    ],
    [
      "~ can't be blocked this turn except by creatures with haste.",
      { kind: "restrict", target: "source", restrictions: [], cantBeBlockedBy: { notKeyword: "haste" } },
    ],
    ["Target creature can't be blocked by Walls this turn.", { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { subtype: "Wall" } }],
    ["Exchange control of target creature you control and target creature an opponent controls.", { kind: "exchange-control", objects: [0, 1] }],
    ["Exchange control of ~ and target nonland permanent.", { kind: "exchange-control", objects: ["source", 0] }],
    ["Add {G}.", { kind: "add-mana", mana: "G", amount: 1 }],
    ["Add {R} or {G}.", { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 }],
    ["Each opponent skips their next untap step.", { kind: "skip-untap-step", who: "each-opponent" }],
    ["Target player skips their next untap step.", { kind: "skip-untap-step", who: 0 }],
    ["Discard a land card.", { kind: "discard", target: "you", amount: 1, filter: { type: "land" } }],
    [
      "Discard any number of creature cards.",
      { kind: "discard", target: "you", amount: 0, anyNumber: true, filter: { type: "creature" } },
    ],
    [
      "Target player reveals their hand and discards all nonland cards.",
      { kind: "discard-hand", who: 0, filter: { notTypes: ["land"] }, reveal: true },
    ],
    [
      "Target opponent reveals their hand and discards all colorless nonland cards.",
      { kind: "discard-hand", who: 0, filter: { colorless: true, notTypes: ["land"] }, reveal: true },
    ],
    [
      "Look at the top three cards of target player's library, then put them back in any order.",
      {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 3,
        min: 3,
        max: 3,
        destination: "library-top",
        leftover: "stay",
      },
    ],
    [
      "Target opponent reveals their hand and discards all multicolored cards.",
      { kind: "discard-hand", who: 0, filter: { multicolored: true }, reveal: true },
    ],
  ])("%s", (sentence, expected) => {
    expect(parseSentence(sentence, ctx())).toEqual(expected);
  });

  it("names the target a sentence takes", () => {
    const c = ctx();
    parseSentence("~ deals 2 damage to target creature an opponent controls.", c);
    expect(c.targets).toEqual(["creature-an-opponent-controls"]);
  });

  it("a colour choice in an ability that uses the stack is written as modes", () => {
    const effect = parseSentence("Add one mana of any color.", ctx({ onStack: true }));
    expect(effect.kind).toBe("modal");
    expect(effect.modes).toHaveLength(5);
  });

  it.each([
    // An amount defined by a rule of its own.
    "Create X 1/1 white Vampire creature tokens with lifelink, where X is ~'s power.",
    "You gain 1 life for each creature you control.",
    // Two different tokens, and a token with a quoted ability.
    "Create a Food token or a Treasure token.",
    'Create a 0/1 black Wizard creature token with "Whenever you cast a noncreature spell, this token deals 1 damage to each opponent." Then if you control four or more Wizards, transform ~.',
    // A sentence no template covers.
    "Return a permanent you control to its owner's hand.",
    // "The chosen color" with no "choose a color" before it is a colour
    // chosen earlier (Floating Shield's, as it entered) — not this one's.
    "Target creature gains protection from the chosen color until end of turn.",
    "Creatures you control gain protection from the chosen color until end of turn.",
  ])("leaves alone: %s", (sentence) => {
    expect(parseSentence(sentence, ctx({ tokenFor: () => "Some Token" }))).toBeNull();
  });
});

describe("costs and triggers", () => {
  it("costs", () => {
    expect(parseCost("{2}{G}, {T}, Sacrifice ~")).toEqual({
      cost: { mana: "{2}{G}", tap: true, sacrifice: "self" },
      extra: {},
    });
    expect(parseCost("Sacrifice another creature").extra).toEqual({ otherOnly: true });
    expect(parseCost("Tap two untapped Elves you control").cost.tapOthers).toEqual({
      count: 2,
      filter: { subtype: "Elf", controlledBy: "you" },
      includeSelf: true,
    });
    // "Discard a card", "Discard a creature card": chosen as it's paid.
    expect(parseCost("{1}, Discard a card")?.cost).toEqual({ mana: "{1}", tap: false, discard: { count: 1 } });
    expect(parseCost("{1}{B}, Discard a creature card")?.cost).toEqual({
      mana: "{1}{B}",
      tap: false,
      discard: { count: 1, filter: { type: "creature" } },
    });
    // Exert as a cost (rule 701.43 — Steward of Solidarity).
    expect(parseCost("{T}, Exert ~").cost).toEqual({ mana: null, tap: true, exertSelf: true });
    expect(parseCost("{2}, Exile the top card of your library").cost).toEqual({ mana: "{2}", tap: false, exileTop: 1 });
    expect(parseCost("{3}, Exile the top four cards of your library").cost).toEqual({ mana: "{3}", tap: false, exileTop: 4 });
  });

  it("sacrifice costs matched against the source", () => {
    // "This creature and …": an `each` with the source first; "… and this
    // artifact" with it last.
    expect(parseCost("{W}{W}{B}, {T}, Sacrifice ~ and a creature you control").cost.sacrifice).toEqual({
      each: [{ isSource: true }, { type: "creature" }],
    });
    expect(parseCost("{T}, Sacrifice two lands and ~").cost.sacrifice).toEqual({
      each: [{ type: "land" }, { type: "land" }, { isSource: true }],
    });
    expect(parseCost("Sacrifice enchanted creature").cost.sacrifice).toEqual({ filter: { hostOfSource: true } });
    // "Another" on one branch only.
    expect(parseCost("{1}, Sacrifice another creature or an artifact")).toEqual({
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { anyOf: [{ type: "creature", isSource: false }, { type: "artifact" }] } } },
      extra: {},
    });
    expect(parseCost("{2}, Sacrifice an artifact or another creature").cost.sacrifice).toEqual({
      filter: { anyOf: [{ type: "artifact" }, { type: "creature", isSource: false }] },
    });
    expect(parseCost("{3}, {T}, Sacrifice a creature of the chosen type").cost.sacrifice).toEqual({
      filter: { type: "creature", ofChosenType: true },
    });
    // What it can't read whole is left to a person.
    expect(parseCost("Sacrifice ~ and a creature named Spitting Drake")).toBeNull();
  });

  it("reads a tap cost of X and of creatures that share a creature type", () => {
    expect(parseCost("{2}, {T}, Tap X untapped artifacts you control").cost.tapOthers).toEqual({
      count: "x",
      filter: { type: "artifact", controlledBy: "you" },
    });
    expect(parseCost("Tap two untapped creatures you control that share a creature type").cost.tapOthers).toEqual({
      count: 2,
      filter: { type: "creature", controlledBy: "you" },
      shareCreatureType: true,
      includeSelf: true,
    });
  });

  it("reads a sacrifice cost of a number of permanents, X, any number and with different names", () => {
    expect(parseCost("Sacrifice three Foods").cost.sacrifice).toEqual({ filter: { subtype: "Food" }, count: 3 });
    expect(parseCost("{T}, Sacrifice X Goats").cost.sacrifice).toEqual({ filter: { subtype: "Goat" }, count: "x" });
    expect(parseCost("{T}, Sacrifice one or more artifacts")).toEqual({
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" }, count: "x" } },
      extra: { minX: 1 },
    });
    expect(parseCost("Sacrifice any number of lands").cost.sacrifice).toEqual({ filter: { type: "land" }, count: "x" });
    expect(parseCost("{3}, {T}, Sacrifice three artifact tokens with different names").cost.sacrifice).toEqual({
      filter: { type: "artifact", token: true },
      count: 3,
      differentNames: true,
    });
    expect(parseCost("{T}, Sacrifice ~ and any number of other non-Eldrazi creatures").cost.sacrifice).toEqual({
      parts: [
        { filter: { isSource: true }, count: 1 },
        { filter: { type: "creature", notSubtypes: ["Eldrazi"], isSource: false }, count: "x" },
      ],
    });
    const blitz = parseFace({
      name: "Firecat Blitz",
      mana_cost: "{X}{R}{R}",
      type_line: "Sorcery",
      oracle_text: "Flashback—{R}{R}, Sacrifice X Mountains. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    });
    expect(blitz.flashback).toEqual({ cost: "{R}{R}", sacrifice: { filter: { subtype: "Mountain" }, count: "x" } });
  });

  it("reads parley's three sentences as one reveal-top, the effect scaled by the cards revealed", () => {
    const rousing = parseFace(
      {
        name: "Rousing of Souls",
        type_line: "Sorcery",
        oracle_text:
          "Parley — Each player reveals the top card of their library. For each nonland card revealed this way, you create a 1/1 white Spirit creature token with flying. Then each player draws a card.",
      },
      { tokenFor: () => "Spirit Token" },
    );
    expect(rousing.complete).toBe(true);
    expect(rousing.effect).toEqual({
      kind: "reveal-top",
      who: "each-player",
      then: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Spirit Token", count: { thisWay: "revealed", filter: { notTypes: ["land"] } } },
          { kind: "draw", amount: 1, who: "each-player" },
        ],
      },
    });
  });

  it("reads a wish as a search outside the game (rule 701.23j)", () => {
    const burning = parseFace({
      name: "Burning Wish",
      type_line: "Sorcery",
      oracle_text: "You may reveal a sorcery card you own from outside the game and put it into your hand. Exile Burning Wish.",
    });
    expect(burning.complete).toBe(true);
    expect(burning.exileOnResolve).toBe(true);
    expect(burning.effect).toEqual({
      kind: "search-library",
      filter: { type: "sorcery" },
      destination: "hand",
      min: 0,
      max: 1,
      reveal: true,
      outside: "only",
    });
    const coax = parseFace({
      name: "Coax from the Blind Eternities",
      type_line: "Sorcery",
      oracle_text:
        "You may reveal an Eldrazi card you own from outside the game or choose a face-up Eldrazi card you own in exile. Put that card into your hand.",
    });
    expect(coax.complete).toBe(true);
    expect(coax.effect).toEqual({
      kind: "search-library",
      filter: { subtype: "Eldrazi" },
      destination: "hand",
      min: 0,
      max: 1,
      reveal: true,
      outside: "only",
      faceUpExile: true,
    });
    const raven = parseSentence("You may put a card you own from outside the game on top of your library.", ctx());
    expect(raven).toEqual({ kind: "search-library", filter: {}, destination: "library-top", min: 0, max: 1, outside: "only" });
  });

  it("reads a search of another player's zones, with its shuffle, as one search-library", () => {
    const memoricide = parseFace({
      name: "Lost Legacy",
      type_line: "Sorcery",
      oracle_text:
        "Choose a nonartifact, nonland card name. Search target player's graveyard, hand, and library for any number of cards with that name and exile them. That player shuffles, then draws a card for each card exiled from their hand this way.",
    });
    expect(memoricide.complete).toBe(true);
    expect(memoricide.targets).toEqual(["player"]);
    expect(memoricide.effect).toEqual({
      kind: "choose-card-name",
      filter: { notTypes: ["artifact", "land"] },
      then: {
        kind: "search-library",
        whose: { target: 0 },
        zones: "graveyard-hand-library",
        filter: { hasName: "$chosenName" },
        destination: "exile",
        min: 0,
        max: 99,
        then: { kind: "draw", who: "that-player", amount: { thisWay: "exiled-from-hand" } },
      },
    });
    const splinter = parseFace({
      name: "Splinter",
      type_line: "Sorcery",
      oracle_text:
        "Exile target artifact. Search its controller's graveyard, hand, and library for all cards with the same name as that artifact and exile them. Then that player shuffles.",
    });
    expect(splinter.complete).toBe(true);
    expect(splinter.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "exile", target: 0 },
        {
          kind: "search-library",
          whose: { controllerOfTarget: 0 },
          zones: "graveyard-hand-library",
          filter: { sameNameAsTarget: 0 },
          destination: "exile",
          all: true,
          min: 0,
          max: 99,
        },
      ],
    });
    const bribery = parseFace({
      name: "Bribery",
      type_line: "Sorcery",
      oracle_text:
        "Search target opponent's library for a creature card and put that card onto the battlefield under your control. Then that player shuffles.",
    });
    expect(bribery.effect).toEqual({
      kind: "search-library",
      whose: { target: 0 },
      filter: { type: "creature" },
      destination: "battlefield",
      min: 0,
      max: 1,
    });
    // A search with no shuffle sentence after it isn't this template.
    const lone = parseFace({
      name: "Lone",
      type_line: "Sorcery",
      oracle_text: "Search target player's library for a card and exile it.",
    });
    expect(lone.complete).toBe(false);
  });

  it("reads \"target X and all other Xs with the same name as that X\" as one -all effect", () => {
    const truth = parseFace({
      name: "Echoing Truth",
      type_line: "Instant",
      oracle_text:
        "Return target nonland permanent and all other permanents with the same name as that permanent to their owners' hands.",
    });
    expect(truth.complete).toBe(true);
    expect(truth.targets).toEqual(["nonland-permanent"]);
    expect(truth.effect).toEqual({ kind: "return-to-hand-all", filter: { sameNameAsTarget: 0 } });
    const decay = parseFace({
      name: "Echoing Decay",
      type_line: "Instant",
      oracle_text: "Target creature and all other creatures with the same name as that creature get -2/-2 until end of turn.",
    });
    expect(decay.effect).toEqual({
      kind: "modify-pt-all",
      filter: { type: "creature", sameNameAsTarget: 0 },
      power: -2,
      toughness: -2,
      duration: "end-of-turn",
    });
    const ruin = parseFace({
      name: "Echoing Ruin",
      type_line: "Sorcery",
      oracle_text: "Destroy target artifact and all other artifacts with the same name as that artifact.",
    });
    expect(ruin.effect).toEqual({ kind: "destroy-all", filter: { type: "artifact", sameNameAsTarget: 0 } });
  });

  it("reads radiance's \"target X and each other X that shares a color with it\" as one -all effect", () => {
    const trace = parseFace({
      name: "Leave No Trace",
      type_line: "Instant",
      oracle_text: "Radiance — Destroy target enchantment and each other enchantment that shares a color with it.",
    });
    expect(trace.complete).toBe(true);
    expect(trace.targets).toEqual(["enchantment"]);
    expect(trace.effect).toEqual({ kind: "destroy-all", filter: { type: "enchantment", sharesColorWithTarget: 0 } });
    const beam = parseFace({
      name: "Cleansing Beam",
      type_line: "Instant",
      oracle_text: "Radiance — Cleansing Beam deals 2 damage to target creature and each other creature that shares a color with it.",
    });
    expect(beam.effect).toEqual({ kind: "damage-all", amount: 2, filter: { type: "creature", sharesColorWithTarget: 0 } });
    const siren = parseFace({
      name: "Wojek Siren",
      type_line: "Instant",
      oracle_text: "Radiance — Target creature and each other creature that shares a color with it get +1/+1 until end of turn.",
    });
    expect(siren.effect).toEqual({
      kind: "modify-pt-all",
      filter: { type: "creature", sharesColorWithTarget: 0 },
      power: 1,
      toughness: 1,
      duration: "end-of-turn",
    });
  });

  it("reads damage to the source: itself, beside a target, from a flip, or from the artifact it destroyed", () => {
    const entity = parseFace({
      name: "Psionic Entity",
      type_line: "Creature — Illusion",
      power: "2",
      toughness: "2",
      oracle_text: "{T}: This creature deals 2 damage to any target and 3 damage to itself.",
    });
    expect(entity.complete).toBe(true);
    expect(entity.activated[0].effect).toEqual({
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: 2, target: 0 },
        { kind: "damage", amount: 3, target: "source" },
      ],
    });

    const bangchuckers = parseFace({
      name: "Goblin Bangchuckers",
      type_line: "Creature — Goblin Warrior",
      power: "2",
      toughness: "2",
      oracle_text:
        "{T}: Flip a coin. If you win the flip, this creature deals 2 damage to any target. If you lose the flip, this creature deals 2 damage to itself.",
    });
    expect(bangchuckers.complete).toBe(true);
    expect(bangchuckers.activated[0].targets).toEqual(["any-target"]);
    expect(bangchuckers.activated[0].effect).toEqual({
      kind: "flip-coin",
      won: { kind: "damage", amount: 2, target: 0 },
      lost: { kind: "damage", amount: 2, target: "source" },
    });

    const tinkerer = parseFace({
      name: "Goblin Tinkerer",
      type_line: "Creature — Goblin Artificer",
      power: "1",
      toughness: "2",
      oracle_text: "{R}, {T}: Destroy target artifact. That artifact deals damage equal to its mana value to this creature.",
    });
    expect(tinkerer.complete).toBe(true);
    expect(tinkerer.activated[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "damage", amount: { manaValueOf: 0 }, target: "source", from: { target: 0 } },
      ],
    });
  });

  it("reads a spell named like a card in a graveyard, a creature that died, another permanent and an imprinted card", () => {
    const kolaghanLine = parseFace({
      name: "Test",
      type_line: "Enchantment",
      oracle_text:
        "Whenever an opponent casts a creature or planeswalker spell with the same name as a card in their graveyard, that player loses 10 life.",
    });
    expect(kolaghanLine.complete).toBe(true);
    expect(kolaghanLine.triggered[0].trigger).toEqual({
      on: "cast-spell",
      who: "opponent",
      filter: { typesAnyOf: ["creature", "planeswalker"], sameNameWith: { graveyard: {}, itsController: true } },
    });
    expect(kolaghanLine.triggered[0].effect).toEqual({ kind: "lose-life", amount: 10, who: "trigger-controller" });

    const yourGraveyard = parseFace({
      name: "Test",
      type_line: "Enchantment",
      oracle_text:
        "Whenever you cast an instant or sorcery spell that has the same name as a card in your graveyard, you may put a quest counter on this enchantment.",
    });
    expect(yourGraveyard.triggered[0].trigger.filter.sameNameWith).toEqual({ graveyard: { ownedBy: "you" } });

    const bazaar = parseFace({
      name: "Bazaar of Wonders",
      type_line: "World Enchantment",
      oracle_text:
        "When this enchantment enters, exile all graveyards.\nWhenever a player casts a spell, counter it if a card with the same name is in a graveyard or a nontoken permanent with the same name is on the battlefield.",
    });
    expect(bazaar.complete).toBe(true);
    expect(bazaar.triggered[1].effect.kind).toBe("conditional");

    const remembrance = parseFace({
      name: "Remembrance",
      type_line: "Enchantment",
      oracle_text:
        "Whenever a nontoken creature you control dies, you may search your library for a card with the same name as that creature, reveal it, put it into your hand, then shuffle.",
    });
    expect(remembrance.complete).toBe(true);
    expect(remembrance.triggered[0].effect.effect.filter).toEqual({ sameNameAsTriggerObject: true });

    const succession = parseFace({
      name: "Verdant Succession",
      type_line: "Enchantment",
      oracle_text:
        "Whenever a green nontoken creature dies, that creature's controller may search their library for a card with the same name as that creature, put it onto the battlefield, then shuffle.",
    });
    expect(succession.complete).toBe(true);
    expect(succession.triggered[0].effect).toMatchObject({ kind: "each-player-may", who: "trigger-controller" });

    const eye = parseFace({
      name: "Eye of Singularity",
      type_line: "World Enchantment",
      oracle_text:
        "When this enchantment enters, destroy each permanent with the same name as another permanent, except for basic lands. They can't be regenerated.\nWhenever a permanent other than a basic land enters, destroy all other permanents with that name. They can't be regenerated.",
    });
    expect(eye.complete).toBe(true);
    expect(eye.triggered[0].effect).toEqual({
      kind: "destroy-all",
      filter: { sameNameAsAnother: {}, notSupertype: "basic" },
      cantBeRegenerated: true,
    });
    expect(eye.triggered[1].effect).toEqual({
      kind: "destroy-all",
      filter: { sameNameAsTriggerObject: true },
      exceptTriggerObject: true,
      cantBeRegenerated: true,
    });

    const parasite = parseFace({
      name: "Invader Parasite",
      type_line: "Creature — Phyrexian Insect",
      power: "3",
      toughness: "2",
      oracle_text:
        "Imprint — When this creature enters, exile target land.\nWhenever a land an opponent controls with the same name as the exiled card enters, this creature deals 2 damage to that player.",
    });
    expect(parasite.complete).toBe(true);
    expect(parasite.triggered[0].effect).toEqual({ kind: "exile", target: 0, linked: true });
    expect(parasite.triggered[1].trigger.filter).toEqual({ type: "land", controlledBy: "opponent", sameNameWith: "exiled-with-source" });

    const lens = parseFace({
      name: "Extraplanar Lens",
      type_line: "Artifact",
      oracle_text:
        "Imprint — When this artifact enters, you may exile target land you control.\nWhenever a land with the same name as the exiled card is tapped for mana, its controller adds one mana of any type that land produced.",
    });
    expect(lens.complete).toBe(true);
    expect(lens.triggered[1].effect).toEqual({ kind: "add-mana", mana: "produced", amount: 1 });

    const scythe = parseFace({
      name: "Strata Scythe",
      type_line: "Artifact — Equipment",
      oracle_text:
        "Imprint — When this Equipment enters, search your library for a land card, exile it, then shuffle.\nEquipped creature gets +1/+1 for each land on the battlefield with the same name as the exiled card.\nEquip {3}",
    });
    expect(scythe.complete).toBe(true);
    expect(scythe.triggered[0].effect).toMatchObject({ destination: "exile", linked: true });
    expect(scythe.static[0].grantPtPerCount).toEqual({ filter: { type: "land", sameNameWith: "exiled-with-source" }, pt: [1, 1] });
  });

  it("reads \"with the same name as\" a reference object", () => {
    const ritual = parseFace({
      name: "Exclusion Ritual",
      type_line: "Enchantment",
      oracle_text:
        "Imprint — When this enchantment enters, exile target nonland permanent.\nPlayers can't cast spells with the same name as the exiled card.",
    });
    expect(ritual.complete).toBe(true);
    // The exile is linked to the lock that reads it (rule 607.2a).
    expect(ritual.triggered[0].effect).toEqual({ kind: "exile", target: 0, linked: true });
    expect(ritual.static[0].prohibits).toEqual({ who: "each-player", spells: { sameNameWith: "exiled-with-source" } });
    const market = parseFace({
      name: "Cornered Market",
      type_line: "Enchantment",
      oracle_text:
        "Players can't cast spells with the same name as a nontoken permanent.\nPlayers can't play nonbasic lands with the same name as a nontoken permanent.",
    });
    expect(market.complete).toBe(true);
    expect(market.static.map((s: { prohibits: unknown }) => s.prohibits)).toEqual([
      { who: "each-player", spells: { sameNameWith: { permanents: { token: false } } } },
      { who: "each-player", lands: { notSupertype: "basic", sameNameWith: { permanents: { token: false } } } },
    ]);
    const singer = parseFace({
      name: "Cylian Sunsinger",
      type_line: "Creature — Elf Shaman",
      oracle_text: "{R}{G}{W}: This creature and each other creature with the same name as it get +3/+3 until end of turn.",
    });
    expect(singer.activated[0].effect).toEqual({
      kind: "modify-pt-all",
      filter: { type: "creature", sameNameWith: "source" },
      power: 3,
      toughness: 3,
      duration: "end-of-turn",
    });
  });

  it("reads \"shares a creature / land type with\" a reference object", () => {
    const killer = parseFace({
      name: "Killer",
      type_line: "Sorcery",
      oracle_text: "Killer deals 3 damage to target creature and each other creature that shares a creature type with it.",
    });
    expect(killer.complete).toBe(true);
    expect(killer.effect).toEqual({ kind: "damage-all", amount: 3, filter: { type: "creature", sharesCreatureTypeWith: 0 } });
    const crown = parseFace({
      name: "Crown of Vigor",
      type_line: "Enchantment — Aura",
      oracle_text:
        "Enchant creature\nEnchanted creature gets +1/+1.\nSacrifice this Aura: Enchanted creature and other creatures that share a creature type with it get +1/+1 until end of turn.",
    });
    expect(crown.activated[0].effect).toEqual({
      kind: "modify-pt-all",
      filter: { type: "creature", sharesCreatureTypeWith: "attached" },
      power: 1,
      toughness: 1,
      duration: "end-of-turn",
    });
    const plague = parseFace({
      name: "Endemic Plague",
      type_line: "Sorcery",
      oracle_text:
        "As an additional cost to cast this spell, sacrifice a creature.\nDestroy all creatures that share a creature type with the sacrificed creature. They can't be regenerated.",
    });
    expect(plague.complete).toBe(true);
    expect(plague.effect).toEqual({
      kind: "destroy-all",
      filter: { type: "creature", sharesCreatureTypeWith: "sacrificed" },
      cantBeRegenerated: true,
    });
    expect(
      parseEffect(
        "Search your library for a basic land card that doesn't share a land type with a land you control, put that card onto the battlefield, then shuffle.",
        ctx(),
      ).effect,
    ).toEqual({
      kind: "search-library",
      filter: { type: "land", supertype: "basic", not: { sharesLandTypeWith: { controlled: { type: "land" } } } },
      destination: "battlefield",
      min: 0,
      max: 1,
    });
  });

  it("reads a Scent's reveal from hand, the next sentence scaled by the cards revealed", () => {
    const jasmine = parseFace({
      name: "Scent of Jasmine",
      type_line: "Instant",
      oracle_text: "Reveal any number of white cards in your hand. You gain 2 life for each card revealed this way.",
    });
    expect(jasmine.complete).toBe(true);
    expect(jasmine.effect).toEqual({
      kind: "sequence",
      effects: [
        {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: { cardsInHand: "you" },
          filter: { colors: ["W"] },
          destination: "reveal",
          leftover: "stay",
        },
        { kind: "gain-life", amount: { product: [2, { thisWay: "revealed", who: "you" }] } },
      ],
    });
    // "Where X is the number of cards revealed this way" isn't read: left to author.
    const ivy = parseFace({
      name: "Scent of Ivy",
      type_line: "Instant",
      oracle_text:
        "Reveal any number of green cards in your hand. Target creature gets +X/+X until end of turn, where X is the number of cards revealed this way.",
    });
    expect(ivy.complete).toBe(false);
  });

  it("reads a Leyline's opening-hand line (rule 103.6a)", () => {
    const leyline = parseFace({
      name: "Leyline of Sanctity",
      type_line: "Enchantment",
      oracle_text: "If this card is in your opening hand, you may begin the game with it on the battlefield.",
    });
    expect(leyline.beginsOnBattlefield).toBe(true);
    expect(leyline.complete).toBe(true);
    const quicksilver = parseFace({
      name: "Quicksilver, Brash Blur",
      type_line: "Legendary Creature — Mutant Hero",
      oracle_text: "If Quicksilver, Brash Blur is in your opening hand, you may begin the game with him on the battlefield.",
    });
    expect(quicksilver.beginsOnBattlefield).toBe(true);
    // Gemstone Caverns' version does more than begin on the battlefield.
    const caverns = parseFace({
      name: "Gemstone Caverns",
      type_line: "Legendary Land",
      oracle_text:
        "If Gemstone Caverns is in your opening hand and you're not the starting player, you may begin the game with Gemstone Caverns on the battlefield with a luck counter on it. If you do, exile a card from your hand.",
    });
    expect(caverns.beginsOnBattlefield).toBeUndefined();
  });

  it("reads an ability that acts while its holder could mulligan (rule 103.5b)", () => {
    const powder = parseFace({
      name: "Serum Powder",
      type_line: "Artifact",
      oracle_text:
        "{T}: Add {C}.\nAny time you could mulligan and this card is in your hand, you may exile all the cards from your hand, then draw that many cards. (You can do this in addition to taking mulligans.)",
    });
    expect(powder.mulliganHandAbility).toBe("exile-hand-draw-that-many");
    expect(powder.complete).toBe(true);
  });

  it("reads a reveal from the opening hand, either way round (rule 103.6b)", () => {
    const reveal = (oracle_text: string) => parseFace({ name: "Some Card", type_line: "Sorcery", oracle_text });
    const providence = reveal(
      "You may reveal this card from your opening hand. If you do, at the beginning of the first upkeep, your life total becomes 26.",
    );
    expect(providence.openingHandReveal).toMatchObject({
      at: "next-upkeep",
      effect: { kind: "set-life-total", who: "you", amount: 26 },
    });
    expect(providence.complete).toBe(true);
    // An effect the parser can't read whole leaves the line to a person.
    const devourer = reveal(
      "You may reveal this card from your opening hand. If you do, at the beginning of your first upkeep, look at the top four cards of your library. You may put one of those cards back on top of your library. Exile the rest.",
    );
    expect(devourer.openingHandReveal).toBeUndefined();
    expect(devourer.complete).toBe(false);
    const sphinx = reveal("You may reveal this card from your opening hand. If you do, scry 3 at the beginning of your first upkeep.");
    expect(sphinx.openingHandReveal).toMatchObject({ at: "your-next-upkeep", effect: { kind: "scry", amount: 3 } });
    const tangle = reveal(
      "You may reveal this card from your opening hand. If you do, at the beginning of your first main phase of the game, add {G}.",
    );
    expect(tangle.openingHandReveal).toMatchObject({ at: "your-next-main-phase" });
    // A moment no delayed timing covers stays a person's (Chancellor of the Annex).
    const annex = reveal(
      "You may reveal this card from your opening hand. If you do, when each opponent casts their first spell of the game, counter that spell unless that player pays {1}.",
    );
    expect(annex.openingHandReveal).toBeUndefined();
    expect(annex.complete).toBe(false);
  });

  it("lines the scaffolder must leave to a person, and what it must get right (the 2026-10-12 review)", () => {
    // Two typecyclings on one line are two abilities; `cycling` holds one.
    const rannet = parseFace({ name: "Valley Rannet", type_line: "Creature — Mount", oracle_text: "Mountaincycling {2}, forestcycling {2}" });
    expect(rannet.cycling).toBeUndefined();
    expect(rannet.complete).toBe(false);
    // Morph on a land: the engine offers no face-down cast for a land.
    const cavern = parseFace({ name: "Zoetic Cavern", type_line: "Land", oracle_text: "Morph {2}" });
    expect(cavern.morph).toBeUndefined();
    expect(cavern.complete).toBe(false);
    // A card returned from a graveyard comes from there.
    const pulse = parseFace({
      name: "Pulse of Murasa",
      type_line: "Instant",
      oracle_text: "Return target creature or land card from a graveyard to its owner's hand. You gain 6 life.",
    });
    expect(pulse.effect.effects[0]).toEqual({ kind: "return-to-hand", target: 0, from: "graveyard" });
    // The discard-to-draw question says how many.
    const loot = parseFace({
      name: "Looter",
      type_line: "Creature — Human",
      oracle_text: "When ~ enters, you may discard a card. If you do, draw two cards.",
    });
    expect(loot.triggered[0].effect.prompt).toBe("Discard a card to draw two cards?");
  });

  it("the Nth counter put on this", () => {
    expect(parseTrigger("When the fourth plan counter is put on this enchantment")).toEqual([
      { on: "counters-put", who: "self", counter: "plan", nth: 4 },
    ]);
    expect(parseTrigger("When the tenth +1/+1 counter is put on ~")).toEqual([
      { on: "counters-put", who: "self", counter: "+1/+1", nth: 10 },
    ]);
  });

  it("triggers", () => {
    expect(parseTrigger("When ~ enters")).toEqual([{ on: "enters-battlefield", who: "self" }]);
    expect(parseTrigger("Whenever ~ enters or attacks")).toHaveLength(2);
    expect(parseTrigger("Whenever you cast a spell that has convoke")).toEqual([
      { on: "cast-spell", who: "you", filter: { hasConvoke: true } },
    ]);
    expect(parseTrigger("Whenever ~ deals combat damage to a player or battle")).toEqual([
      { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
    ]);
    expect(parseTrigger("Whenever another Zombie you control enters")).toEqual([
      { on: "enters-battlefield", who: "you-control", filter: { subtype: "Zombie" }, otherOnly: true },
    ]);
    expect(parseTrigger("At the beginning of combat on your turn")).toEqual([
      { on: "step-begins", step: "begin-combat", who: "you" },
    ]);
    expect(parseTrigger("At the beginning of enchanted player's upkeep")).toEqual([
      { on: "step-begins", step: "upkeep", who: "attached" },
    ]);
    expect(parseTrigger("Whenever you cast an instant or sorcery spell")).toEqual([
      { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
    ]);
    expect(parseTrigger("Whenever you cycle or discard another card")).toBeNull();
    expect(parseTrigger("When you sacrifice this Aura")).toEqual([{ on: "sacrifice", who: "you", selfOnly: true }]);
  });

  it("an 'or' between whole phrases isn't one filter", () => {
    expect(parseTypePhrase("creature or planeswalker")).toEqual({ typesAnyOf: ["creature", "planeswalker"] });
    // (artifact creature) or (Vehicle) — Canoptek Spyder. Read as one filter it
    // came out as "an artifact creature that's a Vehicle".
    expect(parseTypePhrase("nontoken artifact creature or Vehicle")).toBeNull();
    expect(parseTypePhrase("artifact creature or enchantment")).toBeNull();
    // Ice Cream Kitty's "another creature or token" is a creature or any
    // token; read as one filter it was a creature token.
    expect(parseTypePhrase("creature or token")).toBeNull();
    // Whether a word before the "or" reaches past it is the card's to say.
    expect(parseTypePhrase("nontoken creature or planeswalker")).toBeNull();
  });

  it("what a mana ability does besides the mana rides on `also`", () => {
    // The Great Henge: a sequence with a non-mana step isn't a mana ability
    // (rule 605.1a), so the ability would have used the stack.
    const parsed = parseFace(
      { name: "Test Henge", type_line: "Artifact", oracle_text: "{T}: Add {G}{G}. You gain 2 life." },
      { tokenFor: () => null },
    );
    expect(parsed.activated[0].effect).toEqual({
      kind: "add-mana",
      mana: "G",
      amount: 2,
      also: { kind: "gain-life", amount: 2 },
    });
    // Chromatic Sphere draws: moving a card from a library makes it no mana
    // ability at all (rule 605.1a), so it uses the stack and is left to author.
    const sphere = parseFace(
      {
        name: "Test Sphere",
        type_line: "Artifact",
        oracle_text: "{1}, {T}, Sacrifice this artifact: Add one mana of any color. Draw a card.",
      },
      { tokenFor: () => null },
    );
    expect(sphere.complete).toBe(false);
  });

  it("a delayed trigger for the rest of the turn, and one with a target of its own", () => {
    // Glimpse of Nature, Subira's "until end of turn, whenever …" and Origin
    // of Thor's chapter II (rule 603.7c). The delayed ability's target is its
    // own, not the creating ability's.
    expect(parseSentence("Whenever you cast a creature spell this turn, draw a card.", ctx())).toEqual({
      kind: "delayed-trigger",
      at: { whenever: { on: "cast-spell", who: "you", filter: { type: "creature" } } },
      effect: { kind: "draw", amount: 1 },
      text: "Whenever you cast a creature spell this turn, draw a card.",
    });
    expect(
      parseSentence("Until your next turn, whenever a creature you control deals combat damage to a player, draw a card.", ctx()),
    ).toMatchObject({ at: { until: "your-next-turn", whenever: { on: "deals-combat-damage-to-player" } } });
    const outer = ctx();
    expect(
      parseSentence("Whenever you cast a spell this turn, put a +1/+1 counter on target creature you control.", outer),
    ).toEqual({
      kind: "delayed-trigger",
      at: { whenever: { on: "cast-spell", who: "you" }, targets: ["creature-you-control"] },
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      text: "Whenever you cast a spell this turn, put a +1/+1 counter on target creature you control.",
    });
    expect(outer.targets).toEqual([]);
  });

  it("a spell is bounced from the stack", () => {
    // Take It Back: without `from: "stack"` the bounce would look for a
    // permanent and do nothing to the spell.
    expect(parseSentence("Return target spell to its owner's hand.", ctx())).toEqual({
      kind: "return-to-hand",
      target: 0,
      from: "stack",
    });
  });

  it("several mana of any one color: any-color x N in a mana ability, a mode per colour on the stack", () => {
    // Any-color with an amount is all of one colour (Gilded Lotus).
    expect(parseSentence("Add two mana of any one color.", ctx())).toEqual({
      kind: "add-mana",
      mana: "any-color",
      amount: 2,
    });
    expect(parseSentence("Add two mana of any one color.", ctx({ onStack: true }))?.kind).toBe("modal");
  });

  it("a subtype that ends in s in the singular keeps it", () => {
    // Kor Cartographer's "search your library for a Plains card" came out as
    // subtype "Plain", which no land has.
    expect(parseTypePhrase("Plains", { cards: true })).toEqual({ subtype: "Plains" });
    expect(parseTypePhrase("Cyclops")).toEqual({ subtype: "Cyclops" });
    expect(parseTypePhrase("Goblins")).toEqual({ subtype: "Goblin" });
  });

  it("a dash label that means something isn't dropped like an ability word", () => {
    const face = (oracle_text: string) =>
      parseFace({ name: "Test Label", type_line: "Artifact Creature — Construct", oracle_text }, { tokenFor: () => null });
    // Camera Launcher: without the flag, its once-only ability could be
    // activated every turn.
    const exhaust = face("Exhaust — {3}: Put a +1/+1 counter on this creature.");
    expect(exhaust.complete).toBe(true);
    expect(exhaust.activated[0].exhaust).toBe(true);
    const boast = face("Boast — {1}{R}: This creature deals 1 damage to any target.");
    expect(boast.activated[0].boast).toBe(true);
    // Forecast (rule 702.57): an ability of the card in the hand, revealed,
    // in its owner's upkeep only and once each turn — the `forecast()` shape.
    const forecast = face(
      "Forecast — {W}, Reveal this card from your hand: Target creature gets +1/+1 until end of turn. (Activate only during your upkeep and only once each turn.)",
    );
    expect(forecast.complete).toBe(true);
    expect(forecast.activated[0]).toMatchObject({
      cost: { mana: "{W}", tap: false },
      zone: "hand",
      staysInZone: true,
      oncePerTurn: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
    });
    // A forecast cost that doesn't reveal the card isn't read.
    expect(face("Forecast — {W}: Target creature gets +1/+1 until end of turn.").complete).toBe(false);
    // An ability word still goes.
    expect(face("Landfall — Whenever a land you control enters, you gain 1 life.").complete).toBe(true);
    // Power-up (once only, cheaper the turn it entered) isn't modeled, and a
    // villainous choice's dash follows the trigger itself.
    expect(face("Power-up — {5}{U}: Put three +1/+1 counters on this creature.").complete).toBe(false);
    expect(
      face("When this creature enters, each opponent faces a villainous choice — They lose 2 life, or you draw a card.")
        .complete,
    ).toBe(false);
  });

  it("'other creatures you control' excludes the source only when nothing else is named", () => {
    const face = (type_line: string, oracle_text: string) =>
      parseFace({ name: "Test Other", type_line, oracle_text }, { tokenFor: () => null });
    const lord = face("Creature — Knight", "Whenever this creature attacks, other creatures you control get +1/+1 until end of turn.");
    expect(lord.triggered[0].effect.exceptSource).toBe(true);
    // Exhilarating Elocution: the one "other" leaves out is the target, and
    // a spell was never a creature to leave out.
    const spell = face(
      "Sorcery",
      "Put two +1/+1 counters on target creature you control. Other creatures you control get +1/+1 until end of turn.",
    );
    expect(spell.complete).toBe(false);
  });

  it("an edict reads its player from the first target", () => {
    // The engine's `who: "target"` is target 0, so Grave Exchange (a card,
    // then a player) would make the card sacrifice.
    const face = (oracle_text: string) =>
      parseFace({ name: "Test Edict", type_line: "Sorcery", oracle_text }, { tokenFor: () => null });
    expect(face("Target player sacrifices a creature of their choice.").complete).toBe(true);
    expect(
      face(
        "Return target creature card from your graveyard to your hand. Target player sacrifices a creature of their choice.",
      ).complete,
    ).toBe(false);
  });

  it("an Aura card returned to the battlefield is left to author", () => {
    // It would enter attached to nothing, and stay that way (Rise to Glory).
    expect(parseSentence("Return target Aura card from your graveyard to the battlefield.", ctx())).toBeNull();
    expect(parseSentence("Return target creature card from your graveyard to the battlefield.", ctx())?.kind).toBe(
      "put-onto-battlefield",
    );
  });

  it("a 'permanent card' is one that isn't an instant or sorcery", () => {
    // Revive the Shire's "target permanent card from your graveyard" was read
    // as any card at all. On the battlefield the word says nothing.
    expect(parseTypePhrase("permanent", { cards: true })).toEqual({ notTypes: ["instant", "sorcery"] });
    expect(parseTypePhrase("permanent")).toEqual({});
  });
});

describe("a card parsed from its Oracle text plays", () => {
  const face = {
    name: "Test Parsed Pinger",
    mana_cost: "{2}{R}",
    type_line: "Creature — Human Wizard",
    power: "1",
    toughness: "1",
    oracle_text:
      "Flying\nWhen this creature enters, you gain 2 life.\n{T}: This creature deals 1 damage to any target.",
  };

  it("parses completely", () => {
    const parsed = parseFace(face, { tokenFor: () => null });
    expect(parsed.complete).toBe(true);
    expect(parsed.keywords).toEqual(["flying"]);
  });

  it("and the definition works in a game", () => {
    const parsed = parseFace(face, { tokenFor: () => null });
    const registry = createDefaultRegistry().register(
      defineCard({
        name: face.name,
        manaCost: face.mana_cost,
        colors: ["R"],
        types: ["creature"],
        subtypes: ["Human", "Wizard"],
        power: 1,
        toughness: 1,
        keywords: parsed.keywords,
        text: face.oracle_text,
        triggered: parsed.triggered,
        activated: parsed.activated,
      } as Parameters<typeof defineCard>[0]),
    );
    const A = asPlayerId("alice");
    const B = asPlayerId("bob");
    const game = Game.create({
      seed: 1,
      shuffle: false,
      registry,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: new ScriptedController(A), [B]: new ScriptedController(B) },
      decks: [
        { player: A, cards: Array<string>(40).fill("Island") },
        { player: B, cards: Array<string>(40).fill("Island") },
      ],
    });
    const quiet = (s: GameState) =>
      s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
    const pinger = game.debugSpawn(face.name, A, "battlefield", { summoningSick: false, announceEntry: true });
    game.advanceUntil(quiet);
    expect(game.state.players[A].life).toBe(22);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: pinger,
      abilityIndex: 0,
      targets: [{ kind: "player", player: B }],
    });
    game.advanceUntil(quiet);
    expect(game.state.players[B].life).toBe(19);
  });
});

describe("templates for features built since the parser began (2026-10-11)", () => {
  const face = (oracle_text: string, type_line = "Creature — Human", extra: Record<string, unknown> = {}) =>
    parseFace({ name: "Test Card", type_line, oracle_text, ...extra }, { tokenFor: () => "Servo Token" });

  it.each([
    ["Destroy target tapped creature.", { kind: "permanent", filter: { tapped: true, type: "creature" } }],
    ["Destroy target creature with flying.", { kind: "permanent", filter: { keyword: "flying", type: "creature" } }],
    ["Destroy target creature with power 4 or greater.", { kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
    ["Destroy target nonbasic land.", { kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
    ["Destroy target attacking creature you control.", { kind: "permanent", whose: "you", filter: { attacking: true, type: "creature" } }],
  ])("a target with modifiers — %s", (sentence, spec) => {
    const c = ctx();
    expect(parseSentence(sentence, c)).toEqual({ kind: "destroy", target: 0 });
    expect(c.targets).toEqual([spec]);
  });

  it("a preparation card's \"enters prepared\" line is its own entering replacement (rule 722.3a)", () => {
    const parsed = face("This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)");
    expect(parsed.complete).toBe(true);
    expect(parsed.static[0]).toMatchObject({ replacement: { event: "enters-battlefield", prepared: true } });
  });

  it("becoming a copy (rules 707.2, 707.9a): for good or until end of turn, \"another\" target, and \"this ability\" named by its place", () => {
    const stage = face("{T}: Add {C}.\n{2}, {T}: This land becomes a copy of target land, except it has this ability.", "Land");
    expect(stage.complete).toBe(true);
    expect(stage.activated[1]).toMatchObject({
      targets: ["land"],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        exceptions: { thisAbility: { card: "Test Card", activated: 1 } },
      },
    });
    const c = ctx();
    expect(parseSentence("~ becomes a copy of target artifact until end of turn.", c)).toEqual({
      kind: "become-copy",
      target: "source",
      of: 0,
      until: "end-of-turn",
    });
    expect(c.targets).toEqual(["artifact"]);
    const plasm = face(
      "At the beginning of your upkeep, you may have this creature become a copy of another target creature, except it has this ability.",
    );
    expect(plasm.complete).toBe(true);
    expect(plasm.triggered[0].targets).toEqual([{ kind: "other", of: "creature" }]);
    expect(plasm.triggered[0].effect).toMatchObject({
      kind: "may",
      prompt: "Have Test Card become a copy of another target creature, except it has this ability?",
      effect: { kind: "become-copy", target: "source", of: 0, exceptions: { thisAbility: { card: "Test Card", triggered: 0 } } },
    });
    // Any other exception is a person's.
    expect(face("{2}: This creature becomes a copy of target creature, except its name is Test Card.").complete).toBe(false);
  });

  it("\"your first noncreature spell each turn\" counts noncreature spells (Valeria Richards)", () => {
    const parsed = face("Whenever you cast your first noncreature spell each turn, draw a card.");
    expect(parsed.triggered[0]?.trigger).toMatchObject({ on: "cast-spell", firstEachTurn: true, filter: { notTypes: ["creature"] } });
    expect(parsed.triggered[0]?.trigger).not.toHaveProperty("noncreatureOnly");
  });

  it("a target with a word it doesn't know isn't read", () => {
    expect(face("Destroy target creature with the greatest power.", "Sorcery").complete).toBe(false);
    expect(face("Destroy target sparkling creature.", "Sorcery").complete).toBe(false);
  });

  it.each([
    ["You lose 2 life.", { kind: "lose-life", amount: 2 }],
    ["Each player loses 1 life.", { kind: "lose-life", amount: 1, who: "each-player" }],
    ["~ deals 1 damage to you.", { kind: "damage", amount: 1, who: "you" }],
    ["Regenerate ~.", { kind: "regenerate", target: "source" }],
    ["Transform ~.", { kind: "transform", target: "source" }],
    ["Flip ~.", { kind: "flip", target: "source" }],
    ["Flip it.", { kind: "flip", target: "source" }],
    ["The Ring tempts you.", { kind: "the-ring-tempts-you" }],
    ["Empower Jace 2.", { kind: "empower-jace", amount: 2 }],
    ["~ becomes prepared.", { kind: "become-prepared", target: "source" }],
    ["Each creature you control becomes prepared.", { kind: "become-prepared", filter: { type: "creature", controlledBy: "you" } }],
    [
      "~ deals 3 damage to any target and 1 damage to you.",
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
    ],
    [
      "Draw a card at the beginning of the next turn's upkeep.",
      { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." },
    ],
  ])("%s", (sentence, expected) => {
    expect(parseSentence(sentence, ctx())).toEqual(expected);
  });

  it("'it' is the source in a trigger about the source, the trigger's object in one about another, and nothing after a first sentence", () => {
    const self = face("When ~ dies, it deals 2 damage to any target.");
    expect(self.complete).toBe(true);
    expect(self.triggered[0].effect).toEqual({ kind: "damage", amount: 2, target: 0 });
    const other = face("Whenever a creature you control attacks, it gets +1/+0 until end of turn.");
    expect(other.triggered[0].effect).toEqual({ kind: "modify-pt", target: "trigger-object", power: 1, toughness: 0, duration: "end-of-turn" });
    // After "create a token", "it" is the token: not read.
    const token = face("When ~ enters, create a 1/1 colorless Servo artifact creature token. Put a +1/+1 counter on it.");
    expect(token.complete).toBe(false);
    // A trigger about a step has no "it".
    expect(face("At the beginning of your upkeep, it deals 1 damage to any target.").complete).toBe(false);
  });

  it("keyword lines a helper or a card field stands for", () => {
    const vehicle = face("Crew 3", "Artifact — Vehicle");
    expect(vehicle.activated[0].cost.tapOthers).toEqual({ count: 0, totalPower: 3, filter: { type: "creature" } });
    expect(face("Morph {2}{G}").morph).toEqual({ keyword: "morph", cost: "{2}{G}" });
    // A morph cost that isn't mana: `also`, with the printed cost to show.
    expect(face("Morph—Sacrifice two Mountains.").morph).toEqual({
      keyword: "morph",
      cost: "",
      also: { sacrifice: { filter: { subtype: "Mountain" }, count: 2 } },
      text: "Sacrifice two Mountains",
    });
    expect(face("Morph—Pay 5 life.").morph?.also).toEqual({ payLife: 5 });
    expect(face("Morph—Reveal a blue card in your hand.").morph).toEqual({
      keyword: "morph",
      cost: "",
      also: { reveal: { count: 1, filter: { colors: ["U"] }, text: "blue card" } },
      text: "Reveal a blue card in your hand",
    });
    expect(face("All morph costs cost {2} more.").static?.[0]?.morphCostIncrease).toBe(2);
    expect(face("Morph—Discard a Zombie card.").morph?.also).toEqual({ discard: { count: 1, filter: { subtype: "Zombie" } } });
    expect(face("Morph—Return a Bird you control to its owner's hand.").morph?.also).toEqual({
      returnToHand: { count: 1, filter: { subtype: "Bird" } },
    });
    expect(face("Convoke", "Instant", {}).convoke).toBe(true);
    expect(face("Improvise", "Sorcery", {}).improvise).toBe(true);
    // Assist (rule 702.132a), its reminder text stripped.
    expect(face("Assist (Another player can pay up to {5} of this spell's cost.)", "Sorcery", {}).assist).toBe(true);
    expect(face("Undaunted", "Sorcery", {}).selfCostReduction?.reduceGeneric).toEqual({ opponents: true });
    // Mayhem: a cost, or none on a land (played from the graveyard).
    expect(face("Mayhem {4}{R}").mayhem).toEqual({ cost: "{4}{R}" });
    expect(face("Mayhem", "Land").mayhem).toEqual({});
    expect(face("Rebound", "Instant", {}).rebound).toBe(true);
    expect(face("Cipher", "Sorcery", {}).cipher).toBe(true);
    expect(face("Teamwork 4", "Instant", {}).kicker).toEqual({ cost: "", keyword: "teamwork", teamwork: 4 });
    expect(face("Sneak {1}{R}{R}").sneak).toEqual({ cost: "{1}{R}{R}" });
    // Plot (rule 702.170a), its reminder text stripped, and "when this card
    // becomes plotted" (from exile, this card alone).
    expect(
      face(
        "Plot {1}{G} (You may pay {1}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)",
      ).plot,
    ).toEqual({ cost: "{1}{G}" });
    expect(face("When this card becomes plotted, draw a card.").triggered[0].trigger).toEqual({ on: "this-plotted" });
    // Squad (rule 702.157a): a multikicker by another name and its trigger.
    const squad = face(
      "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)",
    );
    expect(squad.kicker).toEqual({ cost: "{2}", multi: true, keyword: "squad" });
    expect(squad.triggered[0].effect).toEqual({ kind: "create-token-copy", of: "source", count: 1, perTimeKicked: true });
    // Replicate (rule 702.56a): a multikicker the engine copies the spell for.
    expect(
      face(
        "Replicate {1}{R} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)",
        "Instant",
        {},
      ).kicker,
    ).toEqual({ cost: "{1}{R}", keyword: "replicate", multi: true });
    // Haunt (rule 702.55a): the dies trigger, or the resolved spell's.
    expect(face("Haunt (When this creature dies, exile it haunting target creature.)").triggered[0]).toMatchObject({
      trigger: { on: "dies", who: "self" },
      effect: { kind: "exile", target: "trigger-object", haunting: 0 },
    });
    expect(
      face("Haunt (When this spell card is put into a graveyard after resolving, exile it haunting target creature.)", "Sorcery", {})
        .triggered[0].trigger,
    ).toEqual({ on: "this-resolved-into-graveyard" });
    // Rad counters (rule 728).
    expect(face("When this creature enters, target player gets two rad counters.").triggered[0].effect).toEqual({
      kind: "add-player-counters",
      counter: "rad",
      amount: 2,
      target: 0,
    });
    // Collect evidence (rule 701.59).
    expect(
      face(
        "As an additional cost to cast this spell, you may collect evidence 6. (Exile cards with total mana value 6 or greater from your graveyard.)",
        "Instant",
        {},
      ).kicker,
    ).toEqual({ cost: "", keyword: "collect-evidence", collectEvidence: 6 });
    // Bargain (rule 702.166): the keyword, its cost reduction, "if this spell
    // was bargained" closing a spell, and "if it was bargained" on a creature.
    const BARGAIN = "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)";
    expect(
      face(`${BARGAIN}\nThis spell costs {1} less to cast if it's bargained.\nCounter target spell.`, "Instant", {}).kicker,
    ).toEqual({ cost: "", keyword: "bargain", reduceGeneric: 1 });
    const glory = face(
      `${BARGAIN}\nTarget creature gets +2/+2 until end of turn. If this spell was bargained, you gain 3 life.`,
      "Instant",
      {},
    );
    expect(glory.effect).toEqual({ kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" });
    expect(glory.kicker).toEqual({
      cost: "",
      keyword: "bargain",
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "gain-life", amount: 3 },
        ],
      },
    });
    const negotiator = face(`${BARGAIN}\nWhen this creature enters, if it was bargained, you gain 3 life.`);
    expect(negotiator.kicker).toEqual({ cost: "", keyword: "bargain" });
    expect(negotiator.triggered[0].condition).toEqual({ kind: "self-kicked" });
    expect(face("Whenever you collect evidence, draw a card.").triggered[0].trigger).toEqual({
      on: "evidence-collected",
      who: "you",
    });
    // Committing a crime (rule 700.13).
    expect(face("Whenever you commit a crime, draw a card.").triggered[0].trigger).toEqual({
      on: "crime-committed",
      who: "you",
    });
    expect(face("Whenever an opponent commits a crime, draw a card.").triggered[0].trigger).toEqual({
      on: "crime-committed",
      who: "opponent",
    });
    // Web-slinging (rule 702.188a): the line, its reminder text stripped.
    const slinger = face(
      "Web-slinging {R}{G} (You may cast this spell for {R}{G} if you also return a tapped creature you control to its owner's hand.)",
    );
    expect(slinger.webSlinging).toEqual({ cost: "{R}{G}" });
    expect(slinger.complete).toBe(true);
    // The Innistrad werewolves' transforms: the previous turn's spells.
    expect(face("At the beginning of each upkeep, if no spells were cast last turn, transform this creature.").triggered[0].condition).toEqual({
      kind: "spells-cast-last-turn",
      none: true,
    });
    expect(
      face("At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.").triggered[0]
        .condition,
    ).toEqual({ kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 });
    // Emerge (rule 702.119a), and emerge from [quality] (702.119b).
    const emerger = face(
      "Emerge {5}{U} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)",
    );
    expect(emerger.emerge).toEqual({ cost: "{5}{U}" });
    expect(emerger.complete).toBe(true);
    expect(
      face(
        "Emerge from artifact {5}{B}{B} (You may cast this spell by sacrificing an artifact and paying the emerge cost reduced by that artifact's mana value.)",
      ).emerge,
    ).toEqual({ cost: "{5}{B}{B}", from: { type: "artifact" } });
    // Bestow (rule 702.103a).
    const bestower = face(
      "Bestow {3}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)",
    );
    expect(bestower.bestow).toBe("{3}{B}");
    expect(bestower.complete).toBe(true);
    // Its afterlife triggers as an Aura too: "put into a graveyard from the
    // battlefield" (rule 702.135a), not "dies" (Indebted Spirit).
    const spirit = face(
      "Bestow {2}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nAfterlife 1 (When this permanent is put into a graveyard from the battlefield, create a 1/1 white and black Spirit creature token with flying.)",
    );
    expect(spirit.triggered[0].trigger).toEqual({ on: "leaves-battlefield", who: "self", to: ["graveyard"] });
    // Dash (rule 702.109a).
    const dasher = face(
      "Dash {2}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
    );
    expect(dasher.dash).toEqual({ cost: "{2}{R}" });
    expect(dasher.complete).toBe(true);
    // The Mirage block's "as though it had flash … sacrifices it at the
    // beginning of the next cleanup step" (Spider Climb).
    const climb = face(
      "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nCreatures you control get +0/+1.",
    );
    expect(climb.flashThenSacrifice).toBe(true);
    // Impending N—[cost] (rule 702.176a): the cost, and its two abilities — not a
    // creature while it has a time counter, and the end step's removal.
    const overlord = face(
      "Impending 4—{2}{W}{W} (If you cast this spell for its impending cost, it enters with four time counters and isn't a creature until the last is removed. At the beginning of your end step, remove a time counter from it.)",
    );
    expect(overlord.impending).toEqual({ count: 4, cost: "{2}{W}{W}" });
    expect(overlord.static[0]).toMatchObject({ condition: { kind: "impending" }, removeTypes: ["creature"] });
    expect(overlord.triggered[0]).toMatchObject({
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "impending" },
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
    });
    expect(overlord.complete).toBe(true);
    // Freerunning [cost] (rule 702.173a), expend N (700.14), "whenever you forage" (701.61a).
    expect(
      face(
        "Freerunning {1}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)",
      ).freerunning,
    ).toEqual({ cost: "{1}{B}" });
    expect(
      face(
        "Whenever you expend 4, this creature gains indestructible until end of turn. (You expend 4 as you spend your fourth total mana to cast spells during a turn.)",
      ).triggered[0].trigger,
    ).toEqual({ on: "expend", who: "you", amount: 4 });
    expect(face("Whenever you forage, put a +1/+1 counter on this creature.").triggered[0].trigger).toEqual({
      on: "forages",
      who: "you",
    });
    expect(face("Basic landcycling {1}").cycling).toEqual({ cost: "{1}", search: { supertype: "basic", type: "land" } });
    // Cycling's cost as a variant: mana with an X, life, a sacrifice.
    expect(face("Cycling {X}{1}{U} ({X}{1}{U}, Discard this card: Draw a card.)").cycling).toEqual({ cost: "{X}{1}{U}" });
    expect(face("Cycling—Pay 2 life. (Pay 2 life, Discard this card: Draw a card.)").cycling).toEqual({
      cost: "",
      also: { payLife: 2 },
      costText: "Pay 2 life",
    });
    expect(face("Cycling—Sacrifice a land. (Sacrifice a land, Discard this card: Draw a card.)").cycling).toEqual({
      cost: "",
      also: { sacrifice: { filter: { type: "land" } } },
      costText: "Sacrifice a land",
    });
    expect(face("You may pay {0} rather than pay the cycling cost of the first card you cycle each turn.").static[0].alternativeCyclingCost)
      .toEqual({ mana: "{0}", firstEachTurn: true });
    const perspectives = face("As long as you have seven or more cards in hand, you may pay {0} rather than pay cycling costs.").static[0];
    expect(perspectives.alternativeCyclingCost).toEqual({ mana: "{0}" });
    expect(perspectives.condition).toEqual({ kind: "hand-size", atLeast: 7 });
    expect(parseTrigger("When you cycle this card")).toEqual([{ on: "this-cycled" }]);
    // Reading the X of its cycling cost is `triggerValue`, a person's.
    expect(face("When you cycle this card, draw X cards.").triggered).toEqual([]);
    expect(face("Undying").triggered[0].trigger).toEqual({ on: "dies", who: "self" });
    // Increment (rule 702.191a): the helper's cast trigger and intervening-if.
    const incremented = face(
      "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)",
    );
    expect(incremented.complete).toBe(true);
    expect(incremented.triggered[0].condition).toEqual({ kind: "increment" });
    const fab = face("Fabricate 2").triggered[0];
    // The choice only while it's still there; gone, the Servos (rule 702.123a's ruling).
    expect(fab.effect.condition).toEqual({ kind: "source-on-battlefield" });
    expect(fab.effect.then.modes.map((m: { effect: { kind: string } }) => m.effect.kind)).toEqual(["add-counter", "create-token"]);
    expect(fab.effect.else).toEqual({ kind: "create-token", token: "Servo Token", count: 2 });
    // "Cards exiled with this creature" (rule 607.2a): the card's exile is linked to it.
    const rioter = parseFace(
      {
        name: "Test Card",
        type_line: "Creature — Human",
        oracle_text: "{2}: Exile target card from a graveyard.\nWhenever this creature attacks, you gain 1 life for each card exiled with this creature.",
      },
      { tokenFor: () => "Servo Token" },
    );
    expect(rioter.activated[0].effect).toMatchObject({ kind: "exile", linked: true });
    expect(face("{2}: Exile target card from a graveyard.").activated[0].effect.linked).toBeUndefined();
    // A keyword the engine doesn't run leaves the line to a person.
    expect(face("Splice onto Arcane—Exile four cards from your graveyard.").complete).toBe(false);
  });

  it("the intervening-ifs it knows become the ability's condition; others stay a TODO", () => {
    const raid = face("At the beginning of your end step, if you attacked this turn, draw a card.");
    expect(raid.triggered[0].condition).toEqual({ kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 });
    expect(raid.complete).toBe(true);
    expect(face("At the beginning of your end step, if you gained life this turn, draw a card.").complete).toBe(false);
    // How the permanent's spell was cast (rule 702.188a — Spiders-Man, Heroic Horde).
    const slung = face("When ~ enters, if they were cast using web-slinging, you gain 3 life.");
    expect(slung.triggered[0].condition).toEqual({ kind: "source", filter: { castVia: "web-slinging" } });
    expect(slung.complete).toBe(true);
  });

  it("player-state intervening-ifs: that player's hand or poison, comparisons, starting life, everyone's permanents", () => {
    // "That player" of an opponent's upkeep is the active player.
    const muse = face(
      "At the beginning of each opponent's upkeep, if that player has two or fewer cards in hand, ~ deals 3 damage to that player.",
    );
    expect(muse.triggered[0].condition).toEqual({
      kind: "of-player",
      player: "active-player",
      condition: { kind: "hand-size", atMost: 2 },
    });
    // An attack trigger's defending player.
    const rats = face("Whenever ~ attacks, if defending player is poisoned, it gets +1/+1 until end of turn.");
    expect(rats.triggered[0].condition).toEqual({
      kind: "of-player",
      player: "that-player",
      condition: { kind: "player-counters", counter: "poison", who: "you", atLeast: 1 },
    });
    expect(rats.complete).toBe(true);
    const akuta = face(
      "At the beginning of your upkeep, if you have more cards in hand than each opponent, you gain 1 life.",
    );
    expect(akuta.triggered[0].condition).toEqual({ kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" });
    const linvala = face("When ~ enters, if an opponent has more life than you, you gain 5 life.");
    expect(linvala.triggered[0].condition).toEqual({ kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" });
    expect(linvala.complete).toBe(true);
    const greener = face(
      "At the beginning of each player's upkeep, if that player controls more lands than each other player, ~ deals 2 damage to that player.",
    );
    expect(greener.triggered[0].condition).toEqual({
      kind: "of-player",
      player: "active-player",
      condition: { kind: "player-compare", stat: { controls: { type: "land" } }, compare: "more", than: "each-opponent" },
    });
    const elixir = face("At the beginning of your end step, if your life total is greater than your starting life total, draw a card.");
    expect(elixir.triggered[0].condition).toEqual({ kind: "life-total", atLeast: { startingPlus: 1 } });
    const collapse = face("At the beginning of your upkeep, if there are four or more creatures on the battlefield, draw a card.");
    expect(collapse.triggered[0].condition).toEqual({
      kind: "controls",
      filter: { type: "creature" },
      atLeast: 4,
      anyController: true,
    });
    // A static's defending player: the one it attacks (rule 802.2a).
    const beebles = face("~ can't be blocked as long as defending player controls an artifact.");
    expect(beebles.static[0].condition).toEqual({
      kind: "of-player",
      player: "defending-player",
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
    });
    expect(beebles.complete).toBe(true);
    // "That player" no trigger here names: left to a person.
    expect(
      face("When ~ enters, if that player has no cards in hand, draw a card.").triggered[0].condition,
    ).toBeUndefined();
  });

  it("void and revolt (and disappear): the `left` turn history and a warped spell", () => {
    // Void (Edge of Eternities): anyone's nonland permanent, or a spell cast
    // for its warp cost (rule 702.185c). The ability word is dropped.
    const voided = face(
      "Void — At the beginning of your end step, if a nonland permanent left the battlefield this turn or a spell was warped this turn, put a +1/+1 counter on this creature.",
    );
    expect(voided.triggered[0].condition).toEqual({
      kind: "any",
      of: [
        { kind: "turn-history", what: "left", who: "any-player", filter: { notTypes: ["land"] } },
        { kind: "cast-this-turn", who: "any", filter: { castVia: "warp" } },
      ],
    });
    expect(voided.complete).toBe(true);
    // Revolt / disappear, and the "you controlled" wording (Vrock, Lulu).
    const revolt = { kind: "turn-history", what: "left" };
    for (const text of [
      "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, draw a card.",
      "Disappear — At the beginning of your end step, if a permanent left the battlefield under your control this turn, draw a card.",
      "At the beginning of your end step, if a permanent you controlled left the battlefield this turn, each opponent loses 3 life.",
    ]) {
      const parsed = face(text);
      expect(parsed.triggered[0].condition).toEqual(revolt);
      expect(parsed.complete).toBe(true);
    }
    // Not the "unless" or "instead" forms, which a person writes.
    expect(
      face(
        "Void — At the beginning of your end step, sacrifice this Aura unless a nonland permanent left the battlefield this turn or a spell was warped this turn.",
      ).complete,
    ).toBe(false);
  });

  it("celebration: the `entered` turn history, as an intervening if and as a static's trailing 'as long as'", () => {
    const celebration = { kind: "turn-history", what: "entered", filter: { notTypes: ["land"] }, atLeast: 2 };
    const pests = face(
      "Celebration — At the beginning of combat on your turn, if two or more nonland permanents entered the battlefield under your control this turn, put a +1/+1 counter on this creature.",
    );
    expect(pests.triggered[0].condition).toEqual(celebration);
    expect(pests.complete).toBe(true);
    const guest = face(
      "Celebration — ~ gets +1/+1 and has trample as long as two or more nonland permanents entered the battlefield under your control this turn.",
    );
    expect(guest.static[0]).toMatchObject({ affects: { scope: "self" }, grantPt: [1, 1], grantKeywords: ["trample"], condition: celebration });
    expect(guest.complete).toBe(true);
    const pie = face(
      "Celebration — ~ has double strike as long as two or more nonland permanents entered the battlefield under your control this turn.",
    );
    expect(pie.static[0]).toMatchObject({ grantKeywords: ["double-strike"], condition: celebration });
    // A static the rest of the line doesn't read stays a person's.
    expect(
      face(
        "Celebration — ~ can't be countered as long as two or more nonland permanents entered the battlefield under your control this turn.",
      ).complete,
    ).toBe(false);
  });

  it("web-slinging's returned creature: its mana value, as Scarlet Spider's counters", () => {
    const save = face(
      "Sensational Save — If ~ was cast using web-slinging, he enters with X +1/+1 counters on him, where X is the mana value of the returned creature.",
    );
    expect(save.static[0].replacement).toEqual({
      event: "enters-battlefield",
      counters: { kind: "+1/+1", amount: "web-slinging-mana-value" },
    });
    expect(save.complete).toBe(true);
  });

  it("'you may discard a card. If you do, draw a card' draws only if a card was discarded", () => {
    const loot = face("When ~ enters, you may discard a card. If you do, draw a card.");
    expect(loot.triggered[0].effect).toEqual({
      kind: "may",
      prompt: "Discard a card to draw a card?",
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
        ],
      },
    });
  });

  it("bolster (rule 701.39a): an effect", () => {
    expect(parseSentence("Bolster 2.", ctx())).toEqual({ kind: "bolster", amount: 2 });
    const scaleguard = face("When this creature enters, bolster 2.");
    expect(scaleguard.triggered[0].effect).toEqual({ kind: "bolster", amount: 2 });
    expect(scaleguard.complete).toBe(true);
  });

  it("blight (rule 701.68a): a cost, a choice of costs, an optional cost, an effect and 'you may blight N. If you do, …'", () => {
    expect(parseCost("{T}, Blight 1").cost).toEqual({ mana: null, tap: true, blight: 1 });
    expect(parseSentence("Each opponent blights 1.", ctx())).toEqual({ kind: "blight", amount: 1, who: "each-opponent" });
    expect(parseSentence("Blight 2.", ctx())).toEqual({ kind: "blight", amount: 2 });
    const embrace = face("As an additional cost to cast this spell, blight 1 or pay {3}.\nExile target creature.", "Sorcery", {});
    expect(embrace.additionalCost).toEqual({
      options: [{ text: "Blight 1", blight: 1 }, { text: "Pay {3}", mana: "{3}" }],
    });
    expect(embrace.complete).toBe(true);
    const curiosity = face("As an additional cost to cast this spell, you may blight 1.\nExile the top two cards of your library.", "Sorcery", {});
    expect(curiosity.kicker).toEqual({ cost: "", keyword: "blight", blight: 1 });
    const scrounger = face("At the beginning of your first main phase, you may blight 1. If you do, draw a card.");
    expect(scrounger.triggered[0].effect).toEqual({
      kind: "may",
      prompt: "Blight 1?",
      effect: { kind: "blight", amount: 1 },
      then: { kind: "draw", amount: 1 },
    });
    expect(scrounger.complete).toBe(true);
    // "The blighted creature" (701.68c) is the blight's own `then`: a person's.
    expect(face("Whenever ~ attacks, you may blight 1. If you do, the blighted creature gains flying until end of turn.").complete).toBe(false);
    // A mandatory additional blight isn't a choice of costs.
    expect(face("As an additional cost to cast this spell, blight 2.\nDraw a card.", "Sorcery", {}).complete).toBe(false);
  });

  it("revealing from the hand as a cost (rule 701.20a): 'or pay {3}', 'you may reveal a Dragon card' with its bonus, 'Reveal X white cards'", () => {
    const stalwart = face("As an additional cost to cast this spell, reveal a Kithkin card from your hand or pay {3}.");
    expect(stalwart.additionalCost).toEqual({
      options: [
        { text: "Reveal a Kithkin card", behold: { filter: { subtype: "Kithkin" }, text: "a Kithkin card", fromHand: true } },
        { text: "Pay {3}", mana: "{3}" },
      ],
    });
    expect(stalwart.complete).toBe(true);
    // "If you revealed a Dragon card or controlled a Dragon as you cast this
    // spell" closes the spell: the kicked cast, which controlling a Dragon
    // also gives (`orControls`).
    const roar = face(
      "As an additional cost to cast this spell, you may reveal a Dragon card from your hand.\nThis spell deals 3 damage to target creature. If you revealed a Dragon card or controlled a Dragon as you cast this spell, this spell deals 3 damage to that creature's controller.",
      "Instant",
    );
    expect(roar.kicker).toEqual({
      cost: "",
      keyword: "reveal",
      behold: { filter: { subtype: "Dragon" }, text: "a Dragon card", fromHand: true },
      orControls: { subtype: "Dragon" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "damage", amount: 3, toControllerOfTarget: 0 },
        ],
      },
    });
    expect(roar.complete).toBe(true);
    // The Martyrs' activated cost: X announced, a colour of card.
    expect(parseCost("{1}, Reveal X white cards from your hand, Sacrifice ~")?.cost).toEqual({
      mana: "{1}",
      tap: false,
      reveal: { count: "x", filter: { colors: ["W"] }, text: "white cards" },
      sacrifice: "self",
    });
  });

  it("behold (rule 701.4a): a choice of costs, an optional cost and its 'if … was beheld', 'and exile it' with its return, flashback, a land, an effect", () => {
    const dragon = { filter: { subtype: "Dragon" }, text: "a Dragon" };
    expect(parseSentence("Target opponent blights 2.", ctx())).toEqual({ kind: "blight", amount: 2, who: { target: 0 } });
    expect(parseSentence("Behold a Gamma creature.", ctx())).toEqual({
      kind: "behold",
      filter: { type: "creature", subtype: "Gamma" },
      text: "a Gamma creature",
    });
    // Any spell's, a creature's too.
    const mudbutton = face("As an additional cost to cast this spell, behold a Goblin or pay {2}.\nThis creature can't block.");
    expect(mudbutton.additionalCost).toEqual({
      options: [{ text: "Behold a Goblin", behold: { filter: { subtype: "Goblin" }, text: "a Goblin" } }, { text: "Pay {2}", mana: "{2}" }],
    });
    expect(mudbutton.complete).toBe(true);
    // "If a Dragon was beheld" closes the spell: the kicked cast does it too.
    const osseous = face(
      "As an additional cost to cast this spell, you may behold a Dragon.\nThis spell deals 5 damage to target attacking or blocking creature. If a Dragon was beheld, you gain 2 life.",
      "Instant",
    );
    expect(osseous.kicker).toEqual({
      cost: "",
      keyword: "behold",
      behold: dragon,
      effect: { kind: "sequence", effects: [{ kind: "damage", amount: 5, target: 0 }, { kind: "gain-life", amount: 2 }] },
    });
    expect(osseous.effect).toEqual({ kind: "damage", amount: 5, target: 0 });
    expect(osseous.complete).toBe(true);
    // "… instead" rewrites the spell: a person's.
    expect(
      face(
        "As an additional cost to cast this spell, you may behold a Dragon.\nCounter target spell unless its controller pays {2}. If a Dragon was beheld, counter that spell unless its controller pays {4} instead.",
        "Instant",
      ).complete,
    ).toBe(false);
    // "Behold … and exile it" and the linked return (rule 607.2q).
    const champion = face(
      "As an additional cost to cast this spell, behold an Elf and exile it.\nWhen this creature leaves the battlefield, return the exiled card to its owner's hand.",
    );
    expect(champion.additionalCost).toEqual({ behold: { filter: { subtype: "Elf" }, text: "an Elf", exile: true } });
    expect(champion.triggered[0].effect).toEqual({ kind: "return-exiled-by-source", linked: "hand" });
    expect(champion.complete).toBe(true);
    // The return is read only beside the exile it's linked to.
    expect(face("When this creature leaves the battlefield, return the exiled card to its owner's hand.").complete).toBe(false);
    expect(face("Draw a card.\nFlashback—{1}{R}, Behold three Elementals.", "Sorcery").flashback).toEqual({
      cost: "{1}{R}",
      behold: { filter: { subtype: "Elemental" }, text: "three Elementals", count: 3 },
    });
    const sanctum = face("As this land enters, you may behold a Jace. If you don't, this land enters tapped.", "Land");
    expect(sanctum.static[0].replacement).toEqual({
      event: "enters-battlefield",
      tappedUnlessBehold: { filter: { subtype: "Jace" }, text: "a Jace" },
    });
    const sarkhan = face("When this creature enters, you may behold a Dragon. If you do, create a Treasure token.");
    expect(sarkhan.triggered[0].effect).toEqual({
      kind: "may",
      prompt: "Behold a Dragon?",
      effect: { kind: "behold", ...dragon },
      then: { kind: "create-token", token: "Servo Token", count: 1 },
    });
    expect(sarkhan.complete).toBe(true);
    // "That land" reaches back past the may: a person's.
    expect(
      face(
        "{T}, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. You may behold an Elf. If you do, untap that land.",
        "Land",
      ).complete,
    ).toBe(false);
  });

  it("X target groups and a total mana value cap (rule 601.2c)", () => {
    const face = (type_line: string, oracle_text: string) =>
      parseFace({ name: "Test Group", type_line, oracle_text }, { tokenFor: () => null });
    // "Tap X target creatures": exactly X (Word of Binding's shape).
    const tap = face("Sorcery", "Tap X target creatures.");
    expect(tap.targets).toEqual([{ kind: "any-number", of: "creature", min: "x", max: "x" }]);
    expect(tap.effect).toEqual({ kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } });
    // "Destroy up to X target artifacts": at most X, destroyed together.
    const destroy = face("Sorcery", "Destroy up to X target artifacts.");
    expect(destroy.targets).toEqual([{ kind: "any-number", of: "artifact", max: "x" }]);
    expect(destroy.effect).toEqual({
      kind: "for-each-target",
      from: 0,
      simultaneous: true,
      effect: { kind: "destroy", target: 0 },
    });
    // Patch Up: up to three, their total mana value capped.
    const patch = face(
      "Sorcery",
      "Return up to three target creature cards with total mana value 3 or less from your graveyard to the battlefield.",
    );
    expect(patch.targets).toEqual([
      {
        kind: "any-number",
        of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
        max: 3,
        maxTotalManaValue: 3,
      },
    ]);
    expect(patch.effect).toEqual({
      kind: "for-each-target",
      from: 0,
      simultaneous: true,
      effect: { kind: "put-onto-battlefield", target: 0 },
    });
    // An X a rule defines ("where X is …") is a person's to read.
    expect(face("Sorcery", "Destroy up to X target artifacts, where X is the number of Vampires you control.").complete).toBe(false);
    // "From a single graveyard" (Decompose), "from an opponent's graveyard"
    // (one opponent's): a group sharing a graveyard.
    const decompose = face("Sorcery", "Exile up to three target cards from a single graveyard.");
    expect(decompose.targets).toEqual([
      { kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 3, sameController: true },
    ]);
    expect(decompose.effect).toEqual({ kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0 } });
    expect(face("Sorcery", "Exile X target cards from a single graveyard.").targets).toEqual([
      { kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, min: "x", max: "x", sameController: true },
    ]);
    expect(face("Instant", "Exile two target cards from an opponent's graveyard.").targets).toEqual([
      { kind: "any-number", of: { kind: "card-in-graveyard", whose: "opponent" }, min: 2, max: 2, sameController: true },
    ]);
  });

  it("airbend (rule 701.65a): each quantity of target, all other creatures, 'that creature', and the hand-only lock", () => {
    const airbend = (target: unknown) => ({ kind: "exile", target, airbend: true });
    const yours = { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } };
    const aang = face("When this creature enters, airbend up to one other target nonland permanent.");
    expect(aang.triggered[0].targets).toEqual([{ kind: "optional", of: { kind: "other", of: "nonland-permanent" } }]);
    expect(aang.triggered[0].effect).toEqual(airbend(0));
    expect(aang.complete).toBe(true);
    expect(face("When this creature enters, airbend another target creature.").triggered[0].targets).toEqual([
      { kind: "other", of: "creature" },
    ]);
    const appa = face("When this creature enters, airbend any number of other target nonland permanents you control.");
    expect(appa.triggered[0].targets).toEqual([{ kind: "any-number", of: { kind: "other", of: yours } }]);
    expect(appa.triggered[0].effect).toEqual({ kind: "for-each-target", from: 0, simultaneous: true, effect: airbend(0) });
    // "Up to two": one instance of "target" over two slots, exiled together.
    const two = face("Airbend up to two target creatures.", "Instant");
    expect(two.targets).toEqual([
      { kind: "optional", of: "creature" },
      { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
    ]);
    expect(two.effect).toEqual({ kind: "sequence", simultaneous: true, effects: [airbend(0), airbend(1)] });
    expect(face("Airbend target nonland permanent.\nDraw a card.", "Instant").complete).toBe(true);
    // A spell has no "other" to be other than: a person's.
    expect(face("Airbend another target creature.", "Instant").complete).toBe(false);
    const gyatso = face(
      "Whenever another creature you control becomes the target of a spell or ability, you may airbend that creature.",
    );
    expect(gyatso.triggered[0].trigger).toEqual({
      on: "becomes-target",
      who: "you-control",
      filter: { type: "creature" },
      otherOnly: true,
    });
    expect(gyatso.triggered[0].effect).toEqual({ kind: "may", prompt: "Airbend that creature?", effect: airbend("trigger-object") });
    expect(parseSentence("Choose up to one target creature, then airbend all other creatures.", ctx())).toEqual({
      kind: "exile-all",
      filter: { type: "creature" },
      airbend: true,
      exceptTarget: 0,
    });
    expect(
      parseSentence("Until your next turn, your opponents can't cast spells from anywhere other than their hands.", ctx()),
    ).toEqual({ kind: "player-effect", duration: "until-your-next-turn", castOnlyFromHand: "each-opponent" });
  });

  it("phasing out (rule 702.26b): a target, up to one, any number, the source, the equipped creature, all you control, 'it'", () => {
    const out = (target: unknown) => ({ kind: "phase-out", target });
    const haystack = face(
      "{2}, {T}: Target creature you control phases out. (Treat it and anything attached to it as though they don't exist until your next turn.)",
      "Artifact",
    );
    expect(haystack.activated[0].targets).toEqual(["creature-you-control"]);
    expect(haystack.activated[0].effect).toEqual(out(0));
    expect(haystack.complete).toBe(true);
    const gates = face("When this land enters, up to one target creature phases out.", "Land — Gate");
    expect(gates.triggered[0].targets).toEqual([{ kind: "optional", of: "creature" }]);
    expect(gates.triggered[0].effect).toEqual(out(0));
    const guardian = face("When this creature enters, any number of other target creatures you control phase out.");
    expect(guardian.triggered[0].targets).toEqual([{ kind: "any-number", of: { kind: "other", of: "creature-you-control" } }]);
    expect(guardian.triggered[0].effect).toEqual({ kind: "for-each-target", from: 0, simultaneous: true, effect: out(0) });
    expect(parseSentence("~ phases out.", ctx())).toEqual(out("source"));
    expect(parseSentence("Equipped creature phases out.", ctx())).toEqual({ kind: "phase-out", attachedToSource: true });
    expect(parseSentence("All permanents you control phase out.", ctx())).toEqual({
      kind: "phase-out",
      filter: { controlledBy: "you" },
    });
    // "It" after the sentence that targeted: that target.
    const slip = face("Put a +1/+1 counter on target creature. It phases out.", "Instant");
    expect(slip.effect).toEqual({
      kind: "sequence",
      effects: [{ kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, out(0)],
    });
    // "…until ~ leaves the battlefield" (rule 610.4) is a person's.
    expect(
      face("When this enchantment enters, target creature phases out until this enchantment leaves the battlefield.", "Enchantment")
        .complete,
    ).toBe(false);
  });

  it("a processor's 'put a card an opponent owns from exile into that player's graveyard': a cost, an additional cost, a may with 'if you do'", () => {
    expect(parseCost("{1}{G}, Put a card an opponent owns from exile into that player's graveyard").cost).toEqual({
      mana: "{1}{G}",
      tap: false,
      putFromExile: 1,
    });
    const assault = face(
      "As an additional cost to cast this spell, put a card an opponent owns from exile into that player's graveyard.\nThis spell deals 5 damage to target creature.",
      "Sorcery",
      {},
    );
    expect(assault.additionalCost).toEqual({ putFromExile: 1 });
    const choose = (n: number) => ({
      kind: "look-and-choose",
      zone: "exile",
      filter: { ownedBy: "opponent" },
      min: n,
      max: n,
      ...(n === 2 ? { needsMin: true } : {}),
      destination: "graveyard",
      leftover: "stay",
    });
    const strangler = face(
      "When this creature enters, you may put a card an opponent owns from exile into that player's graveyard. If you do, target creature gets -3/-3 until end of turn.",
    );
    expect(strangler.complete).toBe(true);
    expect(strangler.triggered[0].effect.effect.effects).toEqual([
      choose(1),
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "chosen" },
        then: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      },
    ]);
    const nullifier = face(
      "When this creature enters, you may put two cards your opponents own from exile into their owners' graveyards. If you do, counter target spell.",
    );
    expect(nullifier.triggered[0].effect.effect.effects[0]).toEqual(choose(2));
    expect(nullifier.triggered[0].effect.effect.effects[1].condition).toEqual({ kind: "this-way", what: "chosen", atLeast: 2 });
  });

  it("waterbend (rule 701.67a): an ability's cost, a spell's additional cost ({N} or {X}), and an optional one", () => {
    expect(parseCost("Waterbend {4}").cost).toEqual({ mana: "{4}", tap: false, waterbend: true });
    expect(parseCost("Waterbend {X}").cost).toEqual({ mana: "{X}", tap: false, waterbend: true });
    expect(parseCost("Waterbend {3}, {T}").cost).toEqual({ mana: "{3}", tap: true, waterbend: true });
    // One mana cost to a cost: a waterbend beside another mana part is a person's.
    expect(parseCost("{1}, Waterbend {2}")).toBeNull();
    const leaper = face("Waterbend {4}: Draw a card, then discard a card.");
    expect(leaper.activated[0].cost).toEqual({ mana: "{4}", tap: false, waterbend: true });
    expect(leaper.complete).toBe(true);
    const whip = face("As an additional cost to cast this spell, waterbend {5}.\nDraw two cards.", "Sorcery — Lesson", {});
    expect(whip.additionalCost).toEqual({ waterbend: 5 });
    expect(whip.complete).toBe(true);
    // The Skaabs' "exile N [creature] cards from your graveyard".
    const goliath = face("As an additional cost to cast this spell, exile two creature cards from your graveyard.\nTrample");
    expect(goliath.additionalCost).toEqual({ exileFromGraveyard: { count: 2, filter: { type: "creature" } } });
    expect(goliath.complete).toBe(true);
    expect(face("As an additional cost to cast this spell, exile six cards from your graveyard.\nFlying").additionalCost).toEqual({
      exileFromGraveyard: { count: 6 },
    });
    // Harvest Pyre's X, announced as it's cast; Corpse Explosion's "the exiled card".
    const pyre = face(
      "As an additional cost to cast this spell, exile X cards from your graveyard.\nThis spell deals X damage to target creature.",
      "Instant",
      {},
    );
    expect(pyre.additionalCost).toEqual({ exileFromGraveyard: { count: "x" } });
    const explosion = face(
      "As an additional cost to cast this spell, exile a creature card from your graveyard.\nThis spell deals damage equal to the exiled card's power to each creature and each planeswalker.",
      "Sorcery",
      {},
    );
    expect(explosion.additionalCost).toEqual({ exileFromGraveyard: { count: 1, filter: { type: "creature" } } });
    expect(explosion.effect).toEqual({
      kind: "damage-all",
      filter: { typesAnyOf: ["creature", "planeswalker"] },
      amount: { powerOf: "exiled-as-cost" },
    });
    expect(explosion.complete).toBe(true);
    // "Discard a card / N cards / X cards [at random]" (Sickening Dreams'
    // X is the discard's, the mana cost having none).
    const thrill = face("As an additional cost to cast this spell, discard a card.\nDraw two cards.", "Instant", {});
    expect(thrill.additionalCost).toEqual({ discard: 1 });
    expect(thrill.complete).toBe(true);
    expect(face("As an additional cost to cast this spell, discard X cards.\nDraw two cards.", "Sorcery", {}).additionalCost).toEqual({
      discard: "x",
    });
    expect(
      face("As an additional cost to cast this spell, discard X cards at random.\nDraw two cards.", "Sorcery", {}).additionalCost,
    ).toEqual({ discard: "x", discardAtRandom: true });
    // Any spell's, a creature's too; "{X}" makes it an X spell.
    expect(face("As an additional cost to cast this spell, waterbend {X}.\nFlying").additionalCost).toEqual({
      waterbend: "x",
    });
    // "You may waterbend {N}" is a kicker by another name, its "if this
    // spell's additional cost was paid" closing the spell read with it.
    const optional = face(
      "As an additional cost to cast this spell, you may waterbend {4}.\nDraw a card. If this spell's additional cost was paid, you gain 2 life.",
      "Sorcery",
      {},
    );
    expect(optional.kicker).toEqual({
      cost: "{4}",
      keyword: "waterbend",
      effect: { kind: "sequence", effects: [{ kind: "draw", amount: 1 }, { kind: "gain-life", amount: 2 }] },
    });
    expect(optional.effect).toEqual({ kind: "draw", amount: 1 });
    // "Unless you waterbend" and ward's waterbend aren't built: a person's.
    expect(face("Draw three cards. Then discard a card unless you waterbend {2}.", "Sorcery", {}).complete).toBe(false);
    expect(face("Ward—Waterbend {4}.").complete).toBe(false);
  });

  it("enlist (rule 702.154): the keyword and 'whenever this creature enlists a creature'", () => {
    const guardian = face(
      "Enlist (As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn.)\nWhenever this creature enlists a creature, scry 2.",
      "Creature — Human Soldier",
    );
    expect(guardian.static[0]).toMatchObject({ affects: { scope: "self" }, enlist: true });
    expect(guardian.triggered[0].trigger).toEqual({ on: "enlists", who: "self" });
    expect(guardian.triggered[0].effect).toEqual({ kind: "scry", amount: 2 });
    expect(guardian.complete).toBe(true);
    // The bare keyword (Keldon Flamesage prints it without reminder text).
    expect(face("Enlist").static[0]).toMatchObject({ enlist: true });
  });

  it("crewing and saddling (rules 702.122b-d, 702.171c): 'crews a Vehicle' triggers, 'that crewed it this turn', 'can't crew Vehicles'", () => {
    const fanatic = face("Haste\nWhenever this creature crews a Vehicle, that Vehicle gains haste until end of turn.", "Creature — Human Pilot");
    expect(fanatic.triggered[0].trigger).toEqual({ on: "crews-or-saddles", who: "self", as: ["crew"] });
    expect(fanatic.triggered[0].effect).toEqual({ kind: "grant-keyword", target: "trigger-object", keyword: "haste", duration: "end-of-turn" });
    expect(fanatic.complete).toBe(true);
    const vaulter = face(
      "Whenever this creature saddles a Mount or crews a Vehicle during your main phase, that Mount or Vehicle gains flying until end of turn.",
      "Creature — Kor Pilot",
    );
    expect(vaulter.triggered[0].trigger).toEqual({ on: "crews-or-saddles", who: "self", as: ["crew", "saddle"] });
    expect(vaulter.triggered[0].condition).toEqual({
      kind: "all",
      of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] }],
    });
    expect(vaulter.complete).toBe(true);
    // "During your main phase" on any other trigger is a person's.
    expect(face("Whenever this creature attacks during your main phase, draw a card.").complete).toBe(false);
    const schooner = face("Whenever this Vehicle attacks, target creature that crewed it this turn explores.\nCrew 1", "Artifact — Vehicle");
    expect(schooner.triggered[0].targets).toEqual([{ kind: "permanent", filter: { type: "creature", crewedSource: true } }]);
    expect(schooner.complete).toBe(true);
    expect(face("Enchant creature\nEnchanted creature can't attack, block, or crew Vehicles.", "Enchantment — Aura").static[0]).toEqual({
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block", "cant-crew"],
      text: "Enchanted creature can't attack, block, or crew Vehicles.",
    });
  });

  it("saddle (rule 702.171): the keyword, 'attacks while saddled', 'becomes saddled' and the effect", () => {
    const lagac = face(
      "Deathtouch\nWhenever this creature attacks while saddled, it gets +0/+3 until end of turn.\nSaddle 2 (Tap any number of other creatures you control with total power 2 or more: This Mount becomes saddled until end of turn. Saddle only as a sorcery.)",
      "Creature — Lizard Mount",
    );
    expect(lagac.activated[0]).toMatchObject({
      cost: { mana: null, tap: false, tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } } },
      effect: { kind: "become-saddled", target: "source" },
      sorcerySpeed: true,
      saddle: true,
    });
    // Saddled is part of the trigger condition (603.1), not an intervening "if".
    expect(lagac.triggered[0].trigger).toEqual({ on: "attacks", who: "self" });
    expect(lagac.triggered[0].whileCondition).toEqual({ kind: "source", filter: { saddled: true } });
    expect(lagac.triggered[0].condition).toBeUndefined();
    expect(lagac.complete).toBe(true);
    // Only an attack trigger of its own: anything else "while saddled" is a person's.
    expect(face("Whenever ~ blocks while saddled, draw a card.").complete).toBe(false);
    const fiend = face("Whenever this creature becomes saddled for the first time each turn, draw a card.");
    expect(fiend.triggered[0].trigger).toEqual({ on: "becomes-saddled", who: "self", firstTimeEachTurn: true });
    expect(face("Whenever this creature becomes saddled, draw a card.").triggered[0].trigger).toEqual({
      on: "becomes-saddled",
      who: "self",
    });
    // Kolodin's "it": the Mount whose entering fired the trigger.
    const kolodin = face("Whenever a creature you control enters, it becomes saddled until end of turn.");
    expect(kolodin.triggered[0].effect).toEqual({ kind: "become-saddled", target: "trigger-object" });
    const c = ctx();
    expect(parseSentence("Target creature you control becomes saddled until end of turn.", c)).toEqual({
      kind: "become-saddled",
      target: 0,
    });
    expect(c.targets).toEqual(["creature-you-control"]);
  });

  it("a Pilot's crew bonus (rules 702.122a, 702.171a): 'as though its power were N greater' and 'using its toughness', saddle only when it says so", () => {
    const diver = face("This creature saddles Mounts and crews Vehicles as though its power were 2 greater.", "Creature — Goblin Pilot");
    expect(diver.static).toEqual([
      {
        affects: { scope: "self" },
        crewsAs: { plus: 2, saddles: true },
        text: "This creature saddles Mounts and crews Vehicles as though its power were 2 greater.",
      },
    ]);
    expect(diver.complete).toBe(true);
    expect(face("This creature crews Vehicles as though its power were 2 greater.").static[0].crewsAs).toEqual({ plus: 2 });
    expect(face("This creature crews Vehicles using its toughness rather than its power.").static[0].crewsAs).toEqual({
      toughness: true,
    });
    expect(
      face("This creature saddles Mounts and crews Vehicles using its toughness rather than its power.").static[0].crewsAs,
    ).toEqual({ toughness: true, saddles: true });
    // A token's own line ("This token …") reads the same.
    expect(face("This token crews Vehicles as though its power were 2 greater.", "Token Creature — Pilot").static[0].crewsAs).toEqual({
      plus: 2,
    });
    // Anything else about crewing is a person's.
    expect(face("This creature crews Vehicles as though its power were 2 greater and can't block.").complete).toBe(false);
    expect(face("Creatures you control crew Vehicles as though their power were 2 greater.").complete).toBe(false);
    // The crew keyword marks its ability as crew's, which is what the bonus reads.
    expect(face("Crew 3", "Artifact — Vehicle", { power: "4", toughness: "4" }).activated[0]).toMatchObject({ crew: true });
  });

  it("speed (rules 702.178–702.179): start your engines!, and each kind of max speed line", () => {
    const MAX = { kind: "speed", atLeast: 4 };
    const engines =
      "Start your engines! (If you have no speed, it starts at 1. It increases once on each of your turns when an opponent loses life. Max speed is 4.)";
    expect(face(engines).keywords).toEqual(["start-your-engines"]);
    expect(face("Start your engines!").keywords).toEqual(["start-your-engines"]);
    // Horsemanship (rule 702.31), Portal Three Kingdoms' evasion keyword.
    expect(face("Horsemanship (This creature can't be blocked except by creatures with horsemanship.)").keywords).toEqual([
      "horsemanship",
    ]);
    // Banding (rule 702.22), and "bands with other" granted, lost, and read.
    expect(face("Flying; banding (Any creatures with banding, and up to one without, can attack in a band.)").keywords).toEqual([
      "flying",
      "banding",
    ]);
    expect(face('Red legendary creatures you control have "bands with other legendary creatures."').static).toEqual([
      {
        affects: { scope: "filter", filter: { type: "creature", supertype: "legendary", colors: ["R"], controlledBy: "you" } },
        bandsWithOther: { type: "creature", supertype: "legendary" },
        text: 'Red legendary creatures you control have "bands with other legendary creatures."',
      },
    ]);
    expect(
      face('{T}: Target creature loses banding and all "bands with other" abilities until end of turn.').activated[0].effect,
    ).toEqual({ kind: "lose-keywords", target: 0, keywords: ["banding", "bands-with-other"], duration: "end-of-turn" });
    expect(face("{3}: Attacking creatures banded with this creature gain trample until end of turn.").activated[0].effect).toEqual({
      kind: "grant-keyword-all",
      filter: { type: "creature", attacking: true, bandedWithSource: true },
      keyword: "trample",
      duration: "end-of-turn",
    });
    // A bonus of its own: the static, given the condition.
    const raider = face(`${engines}\nMax speed — This creature gets +1/+1 and has menace.`);
    expect(raider.static).toEqual([
      {
        affects: { scope: "self" },
        grantPt: [1, 1],
        grantKeywords: ["menace"],
        condition: MAX,
        text: "Max speed — This creature gets +1/+1 and has menace.",
      },
    ]);
    expect(raider.complete).toBe(true);
    expect(face("Max speed — This creature has double strike.").static[0]).toEqual({
      affects: { scope: "self" },
      grantKeywords: ["double-strike"],
      condition: MAX,
      text: "Max speed — This creature has double strike.",
    });
    // An activated or triggered ability: a static granting it.
    const raceway = face("{T}: Add {C}.\nMax speed — {T}: Add {C}{C}.", "Land");
    expect(raceway.activated).toHaveLength(1);
    expect(raceway.static).toHaveLength(1);
    expect(raceway.static[0].condition).toEqual(MAX);
    expect(raceway.static[0].grantsActivated[0].effect).toEqual({ kind: "add-mana", mana: "C", amount: 2 });
    expect(raceway.static[0].text).toBe("Max speed — {T}: Add {C}{C}.");
    const regent = face("Max speed — At the beginning of your end step, create a 2/2 black Zombie creature token.");
    expect(regent.static[0].grantsTriggered[0].trigger).toEqual({ on: "step-begins", step: "end", who: "you" });
    // One that works from the graveyard keeps its place, with the condition
    // (rule 702.178b).
    const surveyor = face("Max speed — {3}, Exile this card from your graveyard: Draw a card.");
    expect(surveyor.static).toEqual([]);
    expect(surveyor.activated[0]).toMatchObject({ zone: "graveyard", condition: MAX, effect: { kind: "draw", amount: 1 } });
    expect(surveyor.complete).toBe(true);
    // "You may cast this card from your graveyard."
    expect(face("Max speed — You may cast this card from your graveyard.", "Enchantment — Aura").castFromGraveyardIf).toEqual(MAX);
    // "Unless you have max speed" (Hazoret, Godseeker).
    expect(face("Hazoret can't attack or block unless you have max speed.").static).toEqual([]);
    expect(
      parseFace(
        { name: "Hazoret, Godseeker", type_line: "Legendary Creature — God", oracle_text: "Hazoret can't attack or block unless you have max speed." },
        { tokenFor: () => null },
      ).static[0],
    ).toMatchObject({ condition: { kind: "speed", atMost: 3 }, restrictions: ["cant-attack", "cant-block"] });
    // A line it can't read stays a person's, never half-gated.
    expect(face("Max speed — Whenever you cast a spell with mana value 7 or greater, you win the game.").complete).toBe(false);
  });

  it("devotion (rule 700.5): a God's 'isn't a creature', a Demigod's power, Altar's bonus, a devotion intervening-if", () => {
    const god = face(
      "As long as your devotion to white and black is less than seven, Test Card isn't a creature.",
      "Legendary Enchantment Creature — God",
    );
    expect(god.static).toEqual([
      {
        affects: { scope: "self" },
        condition: { kind: "devotion", colors: ["W", "B"], atMost: 6 },
        removeTypes: ["creature"],
        text: "As long as your devotion to white and black is less than seven, Test Card isn't a creature.",
      },
    ]);
    expect(god.complete).toBe(true);
    // The reminder text stays printed and is read past.
    expect(
      face(
        "As long as your devotion to red is less than five, Test Card isn't a creature. (Each {R} in the mana costs of permanents you control counts toward your devotion to red.)",
      ).static[0].condition,
    ).toEqual({ kind: "devotion", colors: ["R"], atMost: 4 });
    expect(face("Test Card's power is equal to your devotion to green.").static[0].setBasePtFromCount).toEqual({
      countOf: { devotionTo: ["G"] },
      plusPower: 0,
      plusToughness: 0,
      only: "power",
    });
    expect(face("Your devotion to each color and each combination of colors is increased by one.", "Artifact").static[0]).toMatchObject({
      devotionBonus: 1,
    });
    const march = face(
      "At the beginning of your upkeep, if your devotion to white and black is seven or greater, create a 4/3 white and black Vampire Demon creature token with flying.",
      "Enchantment",
    );
    expect(march.triggered[0].condition).toEqual({ kind: "devotion", colors: ["W", "B"], atLeast: 7 });
    // A comparison it doesn't know stays a person's.
    expect(face("As long as your devotion to blue is five or more, Test Card has flying.").complete).toBe(false);
  });

  it("domain (an ability word, rule 207.2c): Nishoba Brawler's power is the basic land types among your lands", () => {
    const brawler = face(
      "Trample\nDomain — Test Card's power is equal to the number of basic land types among lands you control.",
      "Creature — Cat Warrior",
    );
    expect(brawler.static[0].setBasePtFromCount).toEqual({
      countOf: { basicLandTypes: "you" },
      plusPower: 0,
      plusToughness: 0,
      only: "power",
    });
    expect(brawler.complete).toBe(true);
  });

  it("\"enchanted creature doesn't untap\" is the doesnt-untap restriction (rule 502.3)", () => {
    const grasp = face("Enchant creature\nEnchanted creature doesn't untap during its controller's untap step.", "Enchantment — Aura");
    expect(grasp.static[0]).toMatchObject({ affects: { scope: "attached" }, restrictions: ["doesnt-untap"] });
    expect(grasp.complete).toBe(true);
    const chill = face(
      "Enchant creature\nWhen this Aura enters, tap enchanted creature.\nEnchanted creature doesn't untap during its controller's untap step.",
      "Enchantment — Aura",
    );
    expect(chill.triggered[0].effect).toEqual({ kind: "tap", target: "attached" });
    expect(chill.complete).toBe(true);
  });

  it("unleash is a keyword line and detain a targeted effect (rules 702.98a, 701.35a)", () => {
    const cackler = face("Unleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)", "Creature — Devil");
    expect(cackler.keywords).toContain("unleash");
    expect(cackler.complete).toBe(true);
    const arrester = face(
      "When this creature enters, detain target creature an opponent controls. (Until your next turn, that creature can't attack or block and its activated abilities can't be activated.)",
      "Creature — Human Soldier",
    );
    expect(arrester.triggered[0].effect).toEqual({ kind: "detain", target: 0 });
    expect(arrester.complete).toBe(true);
  });

  it("\"enchanted creature\" in an Aura's trigger is the attached permanent (Starlit Mantle)", () => {
    const mantle = face(
      "Enchant creature you control\nWhen this Aura enters, enchanted creature gains hexproof until end of turn.\nEnchanted creature gets +1/+1.",
      "Enchantment — Aura",
    );
    expect(mantle.triggered[0].effect).toEqual({
      kind: "grant-keyword",
      target: "attached",
      keyword: "hexproof",
      duration: "end-of-turn",
    });
    expect(mantle.complete).toBe(true);
  });

  it("party (rule 700.8): Archpriest of Iona's power, and {1} less for each creature in your party", () => {
    const reminder = "(Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)";
    const archpriest = face(`Test Card's power is equal to the number of creatures in your party. ${reminder}`, "Creature — Human Cleric");
    expect(archpriest.static[0].setBasePtFromCount).toEqual({ countOf: { partySize: "you" }, plusPower: 0, plusToughness: 0, only: "power" });
    expect(archpriest.complete).toBe(true);
    const always = { kind: "controls", filter: {}, atLeast: 0 };
    const alliance = face(
      `This spell costs {1} less to cast for each creature in your party. ${reminder}\nDestroy target creature or planeswalker.`,
      "Instant",
    );
    expect(alliance.selfCostReduction).toEqual({ condition: always, reduceGeneric: { partySize: "you" } });
    expect(alliance.complete).toBe(true);
    const domain = face("This spell costs {1} less to cast for each basic land type among lands you control.", "Sorcery");
    expect(domain.selfCostReduction).toEqual({ condition: always, reduceGeneric: { basicLandTypes: "you" } });
    const drag = face(
      "This spell costs {X} less to cast, where X is your devotion to black. (Each {B} in the mana costs of permanents you control counts toward your devotion to black.)\nDestroy target creature.",
      "Instant",
    );
    expect(drag.selfCostReduction).toEqual({ condition: always, reduceGeneric: { devotionTo: ["B"] } });
    expect(drag.complete).toBe(true);
    const linvala = face(
      "At the beginning of combat on your turn, if you have a full party, target creature gets +1/+1 and gains flying until end of turn.",
      "Creature — Human Cleric",
    );
    expect(linvala.triggered[0].condition).toEqual({ kind: "full-party" });
    expect(linvala.complete).toBe(true);
    expect(parseTrigger("Whenever you cycle another card")).toEqual([{ on: "cycles", who: "you", otherOnly: true }]);
    expect(parseTrigger("Whenever ~ mutates")).toEqual([{ on: "mutates", who: "self" }]);
    const veteran = face("Test Card is also a Cleric, Rogue, Warrior, and Wizard.\nVigilance", "Creature — Human");
    expect(veteran.alsoSubtypes).toEqual(["Cleric", "Rogue", "Warrior", "Wizard"]);
    expect(veteran.complete).toBe(true);
  });

  it("the initiative (rule 726): 'you take the initiative'", () => {
    expect(parseSentence("You take the initiative.", ctx())).toEqual({ kind: "take-initiative" });
    const scout = face("When Test Card enters, you take the initiative.", "Creature — Bird Rogue");
    expect(scout.triggered[0].effect).toEqual({ kind: "take-initiative" });
    expect(scout.complete).toBe(true);
  });

  it("pitch costs (rule 118.9): exile a card of a colour from your hand rather than pay, and evoke", () => {
    const will = face(
      "You may pay 1 life and exile a blue card from your hand rather than pay this spell's mana cost.\nCounter target spell.",
      "Instant",
    );
    expect(will.alternativeCost).toEqual({
      mana: "{0}",
      payLife: 1,
      exileFromHand: { filter: { colors: ["U"] }, text: "a blue card" },
    });
    expect(will.complete).toBe(true);
    const virtue = face(
      "If it's not your turn, you may exile a white card from your hand rather than pay this spell's mana cost.",
      "Enchantment",
    );
    expect(virtue.alternativeCost).toEqual({
      mana: "{0}",
      exileFromHand: { filter: { colors: ["W"] }, text: "a white card" },
      condition: { kind: "not", of: { kind: "your-turn" } },
    });
    const horde = face("You may exile two red cards from your hand rather than pay this spell's mana cost.", "Sorcery");
    expect(horde.alternativeCost?.exileFromHand).toEqual({ filter: { colors: ["R"] }, count: 2, text: "two red cards" });
    expect(face("Evoke {2}{U}", "Creature — Elemental").evoke).toEqual({ cost: "{2}{U}" });
    expect(face("Evoke—Exile a green card from your hand.", "Creature — Elemental Incarnation").evoke).toEqual({
      cost: "",
      exileFromHand: { filter: { colors: ["G"] }, text: "a green card" },
    });
  });

  it("costs that exile a chosen object: Food Chain, Cadaverous Bloom, Night Soil, Nivmagus, Necrotic Fumes", () => {
    expect(parseCost("Exile a creature you control").cost).toMatchObject({
      sacrifice: { filter: { type: "creature", controlledBy: "you" } },
      exilesSacrifice: true,
    });
    expect(parseCost("Exile another nontoken artifact creature you control").extra.otherOnly).toBe(true);
    expect(parseCost("Exile a card from your hand").cost.exileFromHand).toEqual({ count: 1 });
    expect(parseCost("{1}, Exile two creature cards from a single graveyard").cost.exileFromGraveyard).toEqual({
      count: 2,
      filter: { type: "creature" },
      singleGraveyard: true,
    });
    expect(parseCost("Exile an instant or sorcery spell you control").cost.exileSpell).toEqual({
      filter: { typesAnyOf: ["instant", "sorcery"] },
    });
    expect(parseCost("Exile a spell you control").cost.exileSpell).toEqual({});
    expect(face("As an additional cost to cast this spell, exile a creature you control.\nExile target creature or planeswalker.", "Sorcery").additionalCost).toEqual({
      sacrifice: { type: "creature" },
      exilesSacrifice: true,
    });
  });

  it("a life change rather than pay (rule 118.9): Snuff Out, Invigorate, Reverent Silence, the Demon, the Bloodcaster", () => {
    const forest = { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 };
    expect(face("If you control a Swamp, you may pay 4 life rather than pay this spell's mana cost.", "Instant").alternativeCost).toEqual({
      mana: "{0}",
      payLife: 4,
      condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
    });
    expect(face("If you control a Forest, rather than pay this spell's mana cost, you may have an opponent gain 3 life.", "Instant").alternativeCost).toEqual({
      mana: "{0}",
      othersGainLife: { amount: 3, who: "an-opponent" },
      condition: forest,
    });
    expect(face("If you control a Forest, rather than pay this spell's mana cost, you may have each other player gain 6 life.", "Sorcery").alternativeCost).toEqual({
      mana: "{0}",
      othersGainLife: { amount: 6, who: "each-other-player" },
      condition: forest,
    });
    const demon = face("Once during each of your turns, you may cast an enchantment spell by paying life equal to its mana value rather than paying its mana cost.", "Creature — Demon");
    expect(demon.static[0].alternativeCostForSpells).toEqual({
      mana: "{0}",
      filter: { type: "enchantment" },
      payLifeManaValue: true,
      oncePerTurn: true,
      yourTurnOnly: true,
    });
    const grantOf = (line: string) => face(line, "Enchantment").static[0].alternativeCostForSpells;
    expect(grantOf("You may cast spells from your hand without paying their mana costs.")).toEqual({ mana: "{0}", fromHand: true });
    expect(grantOf("You may cast spells with mana value less than or equal to the number of creatures you control from your hand without paying their mana costs.")).toEqual({
      mana: "{0}",
      fromHand: true,
      filter: { manaValue: { op: "lte", n: { amount: { countOf: { type: "creature", controlledBy: "you" } } } } },
    });
    expect(grantOf("Any player may cast creature spells with mana value 3 or less without paying their mana costs and as though they had flash.")).toEqual({
      mana: "{0}",
      anyPlayer: true,
      flash: true,
      filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
    });
    expect(grantOf("Once during each of your turns, you may cast an instant or sorcery spell from your hand without paying its mana cost.")).toEqual({
      mana: "{0}",
      oncePerTurn: true,
      yourTurnOnly: true,
      fromHand: true,
      filter: { typesAnyOf: ["instant", "sorcery"] },
    });
    expect(grantOf("Once during each of your turns, you may cast a spell from your hand or the top of your library without paying its mana cost.")).toEqual({
      mana: "{0}",
      oncePerTurn: true,
      yourTurnOnly: true,
      fromHand: true,
      fromZones: ["library"],
    });
    expect(grantOf("Once each turn, you may pay {0} rather than pay the mana cost for a creature spell you cast from exile.")).toEqual({
      mana: "{0}",
      oncePerTurn: true,
      fromZones: ["exile"],
      filter: { type: "creature" },
    });
    expect(grantOf("Once each turn, you may pay {0} rather than pay the mana cost for a spell you cast with mana value X or less, where X is the number of time counters on this enchantment.")).toEqual({
      mana: "{0}",
      oncePerTurn: true,
      filter: { manaValue: { op: "lte", n: { amount: { countersOn: "source", counter: "time" } } } },
    });
    const maze = face("Once during each of your turns, you may cast a spell from your hand by paying life equal to its mana value rather than paying its mana cost.", "Enchantment — Room");
    expect(maze.static[0].alternativeCostForSpells.fromHand).toBe(true);
    const bloodcaster = face("{1}{B}, {T}: Rather than pay the mana cost of the next spell you cast this turn, you may pay life equal to that spell's mana value.", "Creature — Vampire Warlock");
    expect(bloodcaster.activated[0].effect).toEqual({ kind: "grant-spells-this-turn", next: true, payLifeManaValue: true });
  });

  it("sacrifice or return lands rather than pay (rule 118.9): Crash, Thwart, the Borderposts", () => {
    expect(face("You may sacrifice a Mountain rather than pay this spell's mana cost.\nDestroy target artifact.", "Instant").alternativeCost).toEqual({
      mana: "{0}",
      sacrifice: { filter: { type: "land", subtype: "Mountain" }, text: "a Mountain" },
    });
    expect(face("You may sacrifice two Mountains rather than pay this spell's mana cost.", "Instant").alternativeCost?.sacrifice).toEqual({
      filter: { type: "land", subtype: "Mountain" },
      count: 2,
      text: "two Mountains",
    });
    expect(
      face("You may return three Islands you control to their owner's hand rather than pay this spell's mana cost.", "Instant").alternativeCost,
    ).toEqual({
      mana: "{0}",
      returnToHand: { filter: { type: "land", subtype: "Island" }, count: 3, text: "three Islands you control" },
    });
    expect(
      face("You may pay {1} and return a basic land you control to its owner's hand rather than pay this spell's mana cost.", "Artifact").alternativeCost,
    ).toEqual({
      mana: "{1}",
      returnToHand: { filter: { type: "land", supertype: "basic" }, text: "a basic land you control" },
    });
  });

  it("afterlife, spectacle and adapt (rules 702.135, 702.137, 701.46)", () => {
    const priest = face("Afterlife 2 (When this creature dies, create two 1/1 white and black Spirit creature tokens with flying.)", "Creature — Human Cleric");
    expect(priest.triggered[0].effect).toEqual({ kind: "create-token", token: "Spirit Token (White-Black)", count: 2 });
    expect(priest.complete).toBe(true);
    const demon = face("Spectacle {3}{B}{R}\nWhen ~ enters, if its spectacle cost was paid, each opponent discards a card.", "Creature — Demon");
    expect(demon.alternativeCost).toEqual({
      mana: "{3}{B}{R}",
      keyword: "spectacle",
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
    });
    expect(demon.triggered[0].condition).toEqual({ kind: "self-spectacle-paid" });
    const eel = face("{2}{U}: Adapt 2.", "Creature — Fish");
    expect(eel.activated[0].effect).toEqual({
      kind: "conditional",
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
      then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
    });
  });

  it("tribute (rule 702.104): the keyword and its \"if tribute wasn't paid\" trigger", () => {
    const giant = face(
      "Tribute 2 (As this creature enters, an opponent of your choice may put two +1/+1 counters on it.)\nWhen this creature enters, if tribute wasn't paid, this creature deals 5 damage to each opponent.",
      "Creature — Giant",
    );
    expect(giant.tribute).toBe(2);
    expect(giant.triggered[0].condition).toEqual({ kind: "tribute-not-paid" });
    expect(giant.complete).toBe(true);
  });

  it("awaken (rule 702.113a): the spell's own targets and effect, then the land's", () => {
    const clutch = face(
      "Return target creature to its owner's hand.\nAwaken 3—{4}{U} (If you cast this spell for {4}{U}, also put three +1/+1 counters on target land you control and it becomes a 0/0 Elemental creature with haste. It's still a land.)",
      "Sorcery",
    );
    expect(clutch.complete).toBe(true);
    expect(clutch.targets).toEqual(["creature"]);
    expect(clutch.overload).toEqual({
      cost: "{4}{U}",
      keyword: "awaken",
      targets: ["creature", "land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 3 },
          {
            kind: "animate",
            target: 1,
            power: 0,
            toughness: 0,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            keywords: ["haste"],
            duration: "permanent",
          },
        ],
      },
    });
    // A spell not read whole leaves its awaken line to a person too.
    const unread = face("Frobnicate the widgets.\nAwaken 2—{4}{W} (reminder)", "Instant");
    expect(unread.overload).toBeUndefined();
    expect(unread.todo).toContain("Awaken 2—{4}{W}");
  });

  it("prowl (rule 702.76a) and kinship (Morningtide's ability word)", () => {
    const faerie = face(
      "Flying\nProwl {2}{U} (reminder)\nWhen ~ enters, if its prowl cost was paid, draw a card.",
      "Creature — Faerie Rogue",
    );
    expect(faerie.alternativeCost).toEqual({ mana: "{2}{U}", keyword: "prowl", condition: { kind: "prowl" } });
    expect(faerie.triggered[0].condition).toEqual({ kind: "self-prowl-paid" });
    const clanger = face(
      "Kinship — At the beginning of your upkeep, you may look at the top card of your library. If it shares a creature type with this creature, you may reveal it. If you do, this creature gets +1/+1 until end of turn.",
      "Creature — Goblin Warrior",
    );
    expect(clanger.todo).toEqual([]);
    expect(clanger.triggered[0].trigger).toEqual({ on: "step-begins", step: "upkeep", who: "you" });
    expect(clanger.triggered[0].effect).toMatchObject({
      kind: "look-and-choose",
      filter: { sharesCreatureTypeWith: "source" },
      destination: "library-top",
      then: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
    });
    // "Play that card" isn't read: the line is a person's.
    const elder = face(
      "Kinship — At the beginning of your upkeep, you may look at the top card of your library. If it shares a creature type with this creature, you may reveal it. If you do, you may play that card without paying its mana cost.",
      "Creature — Treefolk Shaman",
    );
    expect(elder.triggered).toEqual([]);
    expect(elder.todo).toHaveLength(1);
  });

  it("champion (rule 702.72a): its two linked triggers", () => {
    const hero = face("Champion a creature (reminder)\nLifelink", "Creature — Shapeshifter");
    expect(hero.todo).toEqual([]);
    expect(hero.triggered.map((t: { trigger: unknown }) => t.trigger)).toEqual([
      { on: "enters-battlefield", who: "self" },
      { on: "leaves-battlefield", who: "self" },
    ]);
    expect(hero.triggered[0].effect).toMatchObject({ kind: "conditional", condition: { filter: { type: "creature" } } });
    const chaser = face("Trample\nChampion an Elemental (reminder)", "Creature — Elemental Warrior");
    expect(chaser.triggered[0].effect).toMatchObject({ condition: { filter: { subtype: "Elemental" } } });
  });

  it("surge (rule 702.117a) and 'if that creature would die this turn, exile it instead' (rule 614.1a)", () => {
    const tyrant = face("Surge {3}{R}{R}\nFlying\nWhen ~ enters, if its surge cost was paid, it deals 3 damage to any target.", "Creature — Dragon");
    expect(tyrant.alternativeCost).toEqual({
      mana: "{3}{R}{R}",
      keyword: "surge",
      condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
    });
    expect(tyrant.triggered[0].condition).toEqual({ kind: "self-surge-paid" });
    const bolt = face(
      "~ deals 4 damage to target creature or planeswalker. If that creature or planeswalker would die this turn, exile it instead.",
      "Instant",
    );
    expect(bolt.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 4, target: 0 },
        { kind: "exile-if-dies-this-turn", target: 0 },
      ],
    });
    expect(face("~ deals 3 damage to each creature. If a creature dealt damage this way would die this turn, exile it instead.", "Sorcery").effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "damage-all", amount: 3, filter: { type: "creature" } },
        { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
      ],
    });
    // Not after a sentence with no target of its own to point at.
    expect(face("If that creature would die this turn, exile it instead.", "Instant").complete).toBe(false);
  });

  it("ascend and the city's blessing (rule 702.131)", () => {
    const reminder = "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)";
    const charger = face(`${reminder}\n~ gets +2/+2 as long as you have the city's blessing.`, "Creature — Horse");
    expect(charger.keywords).toEqual(["ascend"]);
    expect(charger.static[0]).toMatchObject({ grantPt: [2, 2], condition: { kind: "citys-blessing" } });
    expect(charger.complete).toBe(true);
    const griffin = face(`${reminder}\nWhenever ~ attacks, if you have the city's blessing, put a +1/+1 counter on it.`, "Creature — Griffin");
    expect(griffin.triggered[0].condition).toEqual({ kind: "citys-blessing" });
    const arch = face(`${reminder}\n{5}, {T}: Draw a card. Activate only if you have the city's blessing.`, "Land");
    expect(arch.activated[0].condition).toEqual({ kind: "citys-blessing" });
  });

  it("kicker on a permanent (rule 702.33): the cost, and 'if it was kicked' on its enters trigger", () => {
    const knight = face(
      "Kicker {2}{B} (You may pay an additional {2}{B} as you cast this spell.)\nWhen this creature enters, if it was kicked, target player discards two cards.",
      "Creature — Human Knight",
    );
    expect(knight.kicker).toEqual({ cost: "{2}{B}" });
    expect(knight.triggered[0].condition).toEqual({ kind: "self-kicked" });
    // A spell's kicker carries what kicking changes: not read here.
    expect(face("Kicker {4}\nDeal 2 damage.", "Instant").kicker).toBeUndefined();
  });

  it("two kicker costs (rule 702.33b, f): 'kicked with its [A] kicker' and 'kicked twice'", () => {
    const mage = face(
      "Kicker {2}{U} and/or {1}{B} (You may pay an additional {2}{U} and/or {1}{B} as you cast this spell.)\nWhen this creature enters, if it was kicked with its {2}{U} kicker, target player discards three cards.\nWhen this creature enters, if it was kicked with its {1}{B} kicker, target player discards three cards.",
      "Creature — Human Wizard",
    );
    expect(mage.kicker).toEqual({ cost: "{2}{U}", second: "{1}{B}" });
    expect(mage.triggered[0].condition).toEqual({ kind: "self-kicked", with: "first" });
    expect(mage.triggered[1].condition).toEqual({ kind: "self-kicked", with: "second" });
    const angel = face(
      "Kicker {B} and/or {R}\nWhen this creature enters, if it was kicked twice, it deals 2 damage to any target.",
      "Creature — Angel",
    );
    expect(angel.triggered[0].condition).toEqual({ kind: "self-kicked", with: "both" });
  });

  it("jump-start and mentor (rules 702.133, 702.134)", () => {
    const idea = face("Draw a card.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)", "Instant", { mana_cost: "{1}{U}" });
    expect(idea.flashback).toEqual({ cost: "{1}{U}", discard: 1, keyword: "jump-start" });
    expect(idea.complete).toBe(true);
    const stalwart = face("First strike\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)", "Creature — Human Soldier");
    expect(stalwart.triggered[0].trigger).toEqual({ on: "attacks", who: "self" });
    expect(stalwart.complete).toBe(true);
  });

  it("retrace and the untap symbol (rules 702.81, 107.6)", () => {
    const crime = face("Target player discards a card.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)", "Sorcery");
    expect(crime.retrace).toBe(true);
    expect(crime.complete).toBe(true);
    expect(parseCost("{1}{W}, {Q}").cost).toEqual({ mana: "{1}{W}", tap: false, untap: true });
  });

  it("a card at random from a hand, or from the cards exiled with ~ (Urza's Bauble, Hired Torturer, Skyship Weatherlight)", () => {
    expect(parseEffect("Look at a card at random in target player's hand.", ctx()).effect).toEqual({
      kind: "choose-random-card",
      zone: "hand",
      whose: 0,
      show: "look",
    });
    expect(parseEffect("Target opponent reveals a card at random from their hand.", ctx()).effect).toEqual({
      kind: "choose-random-card",
      zone: "hand",
      whose: 0,
      show: "reveal",
    });
    const pick = { kind: "choose-random-card", zone: "exiled-with-source", then: { kind: "return-to-hand", target: 0, from: "exile" } };
    const skyship = face(
      "{4}, {T}: Choose a card at random that was exiled with ~. Put that card into its owner's hand.",
      "Legendary Artifact",
    );
    expect(skyship.activated[0].effect).toEqual(pick);
    expect(parseEffect("Choose a card at random exiled with ~ and put that card into its owner's hand.", ctx()).effect).toEqual(pick);
    // A reveal whose card is then used is a different sentence, not this one.
    expect(parseEffect("Target player reveals a card at random from their hand, then loses life equal to that card's mana value.", ctx()).effect?.kind).not.toBe("choose-random-card");
  });

  it("cards exiled with ~ put onto the battlefield (Nautiloid Ship, Sisters of Stone Death, Underworld Sentinel)", () => {
    const ship = face(
      "When this Vehicle enters, exile target player's graveyard.\nWhenever this Vehicle deals combat damage to a player, you may put a creature card exiled with this Vehicle onto the battlefield under your control.",
      "Artifact — Vehicle",
    );
    expect(ship.triggered[0].effect).toEqual({ kind: "exile-graveyard", target: 0, linked: true });
    expect(ship.triggered[1].effect).toEqual({
      kind: "look-and-choose",
      zone: "exiled-with-source",
      min: 0,
      max: 1,
      filter: { type: "creature" },
      destination: "battlefield",
      leftover: "stay",
    });
    expect(parseEffect("Put a creature card exiled with ~ onto the battlefield under your control.", ctx()).effect).toMatchObject({
      zone: "exiled-with-source",
      min: 1,
    });
    expect(parseEffect("Put all cards exiled with it onto the battlefield.", ctx()).effect).toEqual({
      kind: "return-exiled-by-source",
      linked: "battlefield",
      under: "you",
    });
    // "Under their owners' control" is a return, not this put.
    expect(parseEffect("Put all cards exiled with it onto the battlefield under their owners' control.", ctx()).effect?.under).toBeUndefined();
  });

  it("look at target player's hand (Glasses of Urza, Sorcerous Sight)", () => {
    const glasses = face("{T}: Look at target player's hand.", "Artifact");
    expect(glasses.activated[0].targets).toEqual(["player"]);
    expect(glasses.activated[0].effect).toEqual({ kind: "look-at-hand", target: 0 });
    expect(glasses.complete).toBe(true);
    const sight = face("Look at target opponent's hand.\nDraw a card.", "Sorcery");
    expect(sight.complete).toBe(true);
  });

  it("conspire (rule 702.78)", () => {
    const trail = face("Target player mills four cards.\nConspire (As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy.)", "Sorcery");
    expect(trail.conspire).toBe(true);
    expect(trail.complete).toBe(true);
  });

  it("a redirection (rule 614.9) — the en-Kor creatures and Daughter of Autumn", () => {
    const warrior = face("{0}: The next 1 damage that would be dealt to this creature this turn is dealt to target creature you control instead.", "Creature — Kor Warrior Knight");
    expect(warrior.activated[0].targets).toEqual(["creature-you-control"]);
    expect(warrior.activated[0].effect).toEqual({ kind: "prevent-damage", target: "source", amount: 1, redirectTo: 0 });
    expect(warrior.complete).toBe(true);
    const daughter = face("{W}: The next 1 damage that would be dealt to target creature this turn is dealt to this creature instead.", "Creature — Avatar");
    expect(daughter.activated[0].effect).toEqual({ kind: "prevent-damage", target: 0, amount: 1, redirectTo: "source" });
  });

  it("a damage rule (rule 615) and damage that can't be prevented (615.12)", () => {
    const haven = face("{1}{W}, {T}: Prevent all combat damage that would be dealt by target attacking creature this turn.", "Legendary Land");
    expect(haven.activated[0].effect).toEqual({ kind: "damage-rule", by: { target: 0 }, combat: true });
    expect(haven.complete).toBe(true);
    const geist = face("{3}{W}: Prevent all combat damage that would be dealt to and dealt by this creature this turn.", "Creature — Spirit");
    expect(geist.activated[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "damage-rule", to: { target: "source" }, combat: true },
        { kind: "damage-rule", by: { target: "source" }, combat: true },
      ],
    });
    const fighter = face("Sacrifice this creature: Prevent all combat damage target creature would deal this turn.", "Creature — Human Soldier");
    expect(fighter.activated[0].effect).toEqual({ kind: "damage-rule", by: { target: 0 }, combat: true });
    const pain = face("Damage can't be prevented this turn.", "Instant");
    expect(pain.effect).toEqual({ kind: "damage-cant-be-prevented" });
    expect(pain.complete).toBe(true);
  });

  it("protection whose quality isn't a colour (rule 702.16): players, everything, spells, subtypes, exiled types", () => {
    const self = { affects: { scope: "self" } };
    const qualities = (text: string, type = "Creature — Human", extra: Record<string, unknown> = {}) => face(text, type, extra);
    expect(qualities("Protection from everything").static[0]).toMatchObject({ ...self, protection: { filter: {} } });
    expect(qualities("Protection from each of your opponents").static[0]).toMatchObject({ ...self, protection: { fromPlayers: "opponents" } });
    expect(qualities("Flying, protection from spells that are one or more colors").static[0]).toMatchObject({ ...self, protection: { filter: { isSpell: true, colorless: false } } });
    expect(qualities("Protection from spells and from permanents that were cast this turn").static[0]).toMatchObject({
      ...self,
      protection: { filter: { anyOf: [{ isSpell: true }, { isSpell: false, cast: true, enteredThisTurn: true }] } },
    });
    expect(qualities("Protection from Zombies").static[0]).toMatchObject({ ...self, protection: { filter: { subtype: "Zombie" } } });
    expect(qualities("Flying, first strike, lifelink, protection from Demons and from Dragons").static[0]).toMatchObject({
      ...self,
      protection: { filter: { anyOf: [{ subtype: "Demon" }, { subtype: "Dragon" }] } },
    });
    // Words that aren't a subtype stay a person's.
    expect(qualities("Protection from snow").complete).toBe(false);
    expect(qualities("You have protection from each of your opponents.").static[0]).toMatchObject({ playerProtection: { fromPlayers: "opponents" } });
    expect(qualities("As this creature enters, choose a player.\nThis creature has protection from the chosen player.").static[0]).toMatchObject({ protection: { fromPlayers: "chosen" } });
    expect(qualities("Aegis of the Emperor — Commanders you control have protection from everything.").static[0]).toMatchObject({
      affects: { scope: "filter", filter: { isCommander: true, controlledBy: "you" } },
      protection: { filter: {} },
    });
    expect(qualities("As this creature enters, choose a creature type.\nHuman creatures you control have protection from creatures of the chosen type.").static[0]).toMatchObject({
      affects: { scope: "creatures-you-control", subtype: "Human" },
      protection: { filter: { type: "creature", ofChosenType: true } },
    });
    expect(qualities("This creature has protection from each of the exiled card's card types.").static[0]).toMatchObject({ protection: { exiledCardTypes: true } });
    expect(qualities("Enchant creature\nEnchanted creature gets +1/+1 and has protection from enchantments. This effect doesn't remove this Aura.", "Enchantment — Aura").static[0]).toMatchObject({
      affects: { scope: "attached" },
      grantPt: [1, 1],
      protection: { types: ["enchantment"], doesntRemoveSource: true },
    });
    const grant = (quality: string) =>
      qualities(`{T}: Target permanent you control gains protection from ${quality} until end of turn.`).activated[0].effect;
    expect(grant("each of your opponents")).toMatchObject({ kind: "grant-protection", from: { fromPlayers: "opponents" }, duration: "end-of-turn" });
    expect(grant("instant spells and from sorcery spells")).toMatchObject({
      from: { filter: { anyOf: [{ isSpell: true, type: "instant" }, { isSpell: true, type: "sorcery" }] } },
    });
    expect(grant("everything")).toMatchObject({ from: { filter: {} } });
  });

  it("a source of your choice (rule 609.7) and a colour set (layer 5) — Alpha's Circles and Laces", () => {
    const circle = face("{1}: The next time a red source of your choice would deal damage to you this turn, prevent that damage.", "Enchantment");
    expect(circle.activated[0].effect).toEqual({
      kind: "prevent-damage-from-chosen-source",
      filter: { colors: ["R"] },
      to: "you",
      amount: "next-time",
    });
    expect(circle.complete).toBe(true);
    // Other recipients and durations: all its damage, its next damage to
    // anything, a redirection, and life from only some sources.
    const chosen = { kind: "prevent-damage-from-chosen-source" };
    expect(face("{4}{W}{U}, {T}: Prevent all damage a source of your choice would deal this turn.", "Land").activated[0].effect).toEqual({ ...chosen, to: "any", amount: "all" });
    expect(face("Sacrifice this creature: Prevent all damage a red source of your choice would deal this turn.", "Creature").activated[0].effect).toEqual({ ...chosen, filter: { colors: ["R"] }, to: "any", amount: "all" });
    expect(face("{W}, Sacrifice this creature: Prevent all damage a source of your choice would deal to you this turn.", "Creature").activated[0].effect).toEqual({ ...chosen, to: "you", amount: "all" });
    expect(face("{W}, Sacrifice this creature: The next time a black source of your choice would deal damage this turn, prevent that damage.", "Creature").activated[0].effect).toEqual({ ...chosen, filter: { colors: ["B"] }, to: "any", amount: "next-time" });
    expect(face("{T}: The next time a source of your choice would deal damage this turn, that damage is dealt to Opal-Eye instead.", "Legendary Creature — Fox Samurai", { name: "Opal-Eye, Konda's Yojimbo" }).activated[0].effect).toEqual({ ...chosen, to: "any", amount: "next-time", redirectTo: "source" });
    expect(face("Prevent all damage that would be dealt to you this turn by a source of your choice. Whenever damage from a black or red source is prevented this way this turn, you gain that much life.", "Instant").effect).toEqual({
      ...chosen,
      to: "you",
      amount: "all",
      gainLifePrevented: true,
      gainLifeFrom: { anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
    });
    expect(face("The next time a source of your choice would deal damage to you and/or creatures you control this turn, prevent that damage. If damage from a black source is prevented this way, you gain that much life.", "Instant").effect).toEqual({
      ...chosen,
      to: "your-side-creatures",
      amount: "next-time",
      gainLifePrevented: true,
      gainLifeFrom: { colors: ["B"] },
    });
    const lace = face("Target spell or permanent becomes black. (Mana symbols on that permanent remain unchanged.)", "Instant");
    expect(lace.targets).toEqual([{ kind: "spell-or-permanent" }]);
    expect(lace.effect).toEqual({ kind: "become-color", target: 0, colors: ["B"], duration: "permanent" });
    expect(lace.complete).toBe(true);
  });

  it("a text change of one word for another (rule 612) — Sleight of Mind, Magical Hack, Mind Bend, Crystal Spray", () => {
    const sleight = face(
      'Change the text of target spell or permanent by replacing all instances of one color word with another. (For example, you may change "target black spell" to "target blue spell." This effect lasts indefinitely.)',
      "Instant",
    );
    expect(sleight.targets).toEqual([{ kind: "spell-or-permanent" }]);
    expect(sleight.effect).toEqual({ kind: "change-text", target: 0, words: "color", duration: "permanent" });
    expect(sleight.complete).toBe(true);
    const hack = face(
      'Change the text of target spell or permanent by replacing all instances of one basic land type with another. (For example, you may change "swampwalk" to "plainswalk." This effect lasts indefinitely.)',
      "Instant",
    );
    expect(hack.effect).toEqual({ kind: "change-text", target: 0, words: "land-type", duration: "permanent" });
    const bend = face(
      'Change the text of target permanent by replacing all instances of one color word with another or one basic land type with another. (For example, you may change "nonblack creature" to "nongreen creature" or "forestwalk" to "islandwalk." This effect lasts indefinitely.)',
      "Instant",
    );
    expect(bend.targets).toEqual(["permanent"]);
    expect(bend.effect).toEqual({ kind: "change-text", target: 0, words: "color-or-land-type", duration: "permanent" });
    const spray = face(
      "Change the text of target spell or permanent by replacing all instances of one color word with another or one basic land type with another until end of turn.\nDraw a card.",
      "Instant",
    );
    expect(spray.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "change-text", target: 0, words: "color-or-land-type", duration: "end-of-turn" },
        { kind: "draw", amount: 1 },
      ],
    });
    expect(spray.complete).toBe(true);
  });

  it("a colour in addition to its others (rule 105.3) — Indigo Faerie, Unctus, Grand Metatect", () => {
    const faerie = face("{U}: Target permanent becomes blue in addition to its other colors until end of turn.", "Creature — Faerie Wizard");
    expect(faerie.activated[0].targets).toEqual(["permanent"]);
    expect(faerie.activated[0].effect).toEqual({
      kind: "become-color",
      target: 0,
      colors: ["U"],
      inAddition: true,
      duration: "end-of-turn",
    });
    const unctus = face(
      "{U/P}: Until end of turn, target creature you control becomes a blue artifact in addition to its other colors and types. Activate only as a sorcery.",
      "Legendary Artifact Creature — Phyrexian Vedalken",
    );
    expect(unctus.activated[0].targets).toEqual(["creature-you-control"]);
    expect(unctus.activated[0].effect).toEqual({
      kind: "add-types",
      target: 0,
      addTypes: ["artifact"],
      addColors: ["U"],
      duration: "end-of-turn",
    });
  });

  it("rampage (rule 702.23): its becomes-blocked trigger, counted as it resolves", () => {
    const berserker = face("Rampage 3 (Whenever this creature becomes blocked, it gets +3/+3 until end of turn for each creature blocking it beyond the first.)", "Creature — Human Berserker");
    expect(berserker.triggered[0].trigger).toEqual({ on: "becomes-blocked", who: "self" });
    expect(berserker.triggered[0].effect).toMatchObject({ kind: "modify-pt", target: "source", power: { product: [3, { difference: [{ blockersOf: "source" }, 1] }] } });
    expect(berserker.complete).toBe(true);
  });

  it("renown (rule 702.112): its trigger, the renowned designation's statics, intervening ifs and triggers", () => {
    const REMINDER = "(When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)";
    const chaser = face(`Renown 1 ${REMINDER}\nAs long as this creature is renowned, it has menace.`, "Creature — Goblin Warrior");
    expect(chaser.triggered[0]).toMatchObject({
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      effect: { kind: "renown", amount: 1 },
    });
    expect(chaser.static[0]).toMatchObject({ grantKeywords: ["menace"], condition: { kind: "source", filter: { renowned: true } } });
    expect(chaser.complete).toBe(true);
    const wardens = face(`Renown 2 ${REMINDER}\nWhenever a creature you control becomes renowned, draw a card.`, "Creature — Human Monk");
    expect(wardens.triggered[1].trigger).toEqual({ on: "becomes-renowned", who: "you-control", filter: { type: "creature" } });
    const seeker = face("When this creature becomes renowned, draw a card.", "Creature — Human Soldier");
    expect(seeker.triggered[0].trigger).toEqual({ on: "becomes-renowned", who: "self" });
    const consul = face("Whenever this creature attacks, if it's renowned, draw a card.", "Creature — Human Soldier");
    expect(consul.triggered[0].condition).toEqual({ kind: "source", filter: { renowned: true } });
  });

  it("level up (rule 702.87a) and a leveler's level symbols (rule 711.2), and umbra armor (702.89a)", () => {
    const student = face(
      "Level up {W} ({W}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 2-6\n3/3\nFirst strike\nLEVEL 7+\n4/4\nDouble strike",
      "Creature — Human Knight",
    );
    expect(student.activated[0]).toMatchObject({
      cost: { mana: "{W}", tap: false },
      sorcerySpeed: true,
      effect: { kind: "add-counter", target: "source", counter: "level", amount: 1 },
    });
    expect(student.static[0]).toMatchObject({
      condition: { kind: "all" },
      setBasePt: { power: 3, toughness: 3 },
      grantKeywords: ["first-strike"],
      text: "LEVEL 2-6\n3/3\nFirst strike",
    });
    expect(student.static[1]).toMatchObject({
      condition: { kind: "self-counters", counter: "level", compare: { op: "gte", n: 7 } },
      setBasePt: { power: 4, toughness: 4 },
    });
    expect(student.complete).toBe(true);
    // A band's line that isn't a keyword is a person's.
    const ruled = face("Level up {1}\nLEVEL 1-3\n2/2\nWhenever this creature attacks, draw a card.\nLEVEL 4+\n3/3", "Creature — Human");
    expect(ruled.todo).toEqual(["LEVEL 1-3", "2/2", "Whenever this creature attacks, draw a card."]);
    expect(ruled.static).toHaveLength(1);
    // A Class's level bar (rule 716.2a): it and every line after it are a
    // person's, each class ability gated by its level.
    const rogue = face("{1}{U}{B}: Level 2\nCreatures you control have menace.", "Enchantment — Class");
    expect(rogue.static).toEqual([]);
    expect(rogue.todo).toEqual(["{1}{U}{B}: Level 2", "Creatures you control have menace."]);
    // A keyword line's reminder text is dropped before it's read.
    const wave = face("Level up {2}\nLEVEL 5+\n6/6\nIslandwalk (This creature can't be blocked as long as defending player controls an Island.)", "Creature — Merfolk");
    expect(wave.static[0]).toMatchObject({ grantKeywords: ["islandwalk"], setBasePt: { power: 6, toughness: 6 } });
    expect(face("Enchant creature\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)", "Enchantment — Aura").keywords).toEqual(["umbra-armor"]);
  });

  it("'attacks and isn't blocked' (rule 509.3g) and 'if you do, ~ assigns no combat damage this turn'", () => {
    const ophidian = face(
      "Whenever this creature attacks and isn't blocked, you may draw a card. If you do, this creature assigns no combat damage this turn.",
      "Creature — Snake",
    );
    expect(ophidian.triggered[0].trigger).toEqual({ on: "attacks-unblocked", who: "self" });
    expect(ophidian.triggered[0].effect).toMatchObject({
      kind: "may",
      effect: { kind: "draw", amount: 1 },
      then: { kind: "assigns-no-combat-damage", target: "source" },
    });
    expect(ophidian.complete).toBe(true);
  });

  it("state triggers (rule 603.8): counters on ~, and what you control", () => {
    const flarg = face("When you control a Dwarf, sacrifice this creature.", "Creature — Goblin Warrior");
    expect(flarg.triggered[0].trigger).toEqual({
      on: "state",
      state: { kind: "controls", filter: { subtype: "Dwarf" }, atLeast: 1 },
    });
    expect(flarg.triggered[0].effect).toEqual({ kind: "sacrifice-source" });
    expect(flarg.complete).toBe(true);
    const tide = face("Whenever there are four or more tide counters on this creature, sacrifice it.", "Creature — Homarid");
    expect(tide.triggered[0].trigger).toEqual({
      on: "state",
      state: { kind: "self-counters", counter: "tide", compare: { op: "gte", n: 4 } },
    });
  });

  it("cumulative upkeep (rule 702.24a): mana, life or a sacrifice, once per age counter", () => {
    const reminder =
      "(At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)";
    const wall = face(`Cumulative upkeep {U} ${reminder}`, "Creature — Illusion Wall");
    expect(wall.triggered[0].trigger).toEqual({ on: "step-begins", step: "upkeep", who: "you" });
    expect(wall.triggered[0].effect).toMatchObject({
      kind: "conditional",
      then: { effects: [{ kind: "add-counter", counter: "age" }, { kind: "unless", options: [{ pay: "{U}", times: { countersOn: "source", counter: "age" } }] }] },
    });
    expect(wall.complete).toBe(true);
    expect(face(`Cumulative upkeep—Pay 2 life. ${reminder}`, "Enchantment").complete).toBe(true);
    expect(face(`Cumulative upkeep—Sacrifice a land. ${reminder}`, "Creature — Kraken").complete).toBe(true);
  });

  it("echo (rule 702.30a): a mana cost, a discard or two lands, once after it comes under your control", () => {
    const reminder =
      "(At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)";
    const hellion = face(`Echo {4}{R}{R} ${reminder}`, "Creature — Hellion Beast");
    expect(hellion.triggered[0].trigger).toEqual({ on: "step-begins", step: "upkeep", who: "you" });
    expect(hellion.triggered[0].condition).toEqual({ kind: "source-came-under-control-since-last-upkeep" });
    expect(hellion.triggered[0].effect).toMatchObject({ kind: "unless", options: [{ pay: "{4}{R}{R}" }], otherwise: { kind: "sacrifice-source" } });
    expect(hellion.complete).toBe(true);
    expect(face(`Echo—Discard a card. ${reminder}`, "Creature — Goblin").triggered[0].effect).toMatchObject({ options: [{ discard: 1 }] });
    expect(face(`Echo—Sacrifice two lands. ${reminder}`, "Creature — Elemental").complete).toBe(true);
    // Shah of Naar Isle: "when its echo cost is paid" needs an echo that says so.
    const shah = face(`Echo {0} ${reminder}\nWhen this creature's echo cost is paid, each opponent may draw up to three cards.`, "Creature — Efreet");
    expect(shah.complete).toBe(false);
    expect(shah.triggered[0].__todo).toEqual(["its echo has to say when the cost is paid"]);
  });

  it("recover (rule 702.59a) and ripple (702.60a): a graveyard trigger, and a cast trigger naming the card", () => {
    const recover = face(
      "Return target creature card from your graveyard to your hand.\nRecover {2}{B} (When a creature is put into your graveyard from the battlefield, you may pay {2}{B}. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)",
      "Instant",
    );
    expect(recover.triggered[0]).toMatchObject({
      fromGraveyard: true,
      trigger: { on: "dies", filter: { type: "creature", ownedBy: "you" } },
      effect: { kind: "may", cost: "{2}{B}", else: { kind: "exile", target: "source" } },
    });
    expect(recover.complete).toBe(true);
    expect(face("Recover—Pay half your life, rounded up. (When another creature is put into your graveyard from the battlefield, you may pay half your life, rounded up. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)").triggered[0].effect).toMatchObject({ costLife: { half: { lifeTotal: "you" } } });
    const ripple = face(
      "Ripple 4 (When you cast this spell, you may reveal the top four cards of your library. You may cast spells with the same name as this spell from among those cards without paying their mana costs. Put the rest on the bottom of your library.)\n~ deals 2 damage to any target.",
      "Instant",
    );
    expect(ripple.triggered[0]).toMatchObject({
      trigger: { on: "this-cast" },
      effect: { kind: "may", effect: { kind: "cast-now", from: { libraryTop: 4 }, spell: { name: "Test Card" }, free: true, repeat: true, rest: "bottom-any-order" } },
    });
    expect(ripple.complete).toBe(true);
  });

  it("bushido (702.45a) and soulshift (702.46a): Kamigawa's keyword lines, their triggers", () => {
    const samurai = face(
      "Bushido 2 (Whenever this creature blocks or becomes blocked, it gets +2/+2 until end of turn.)",
      "Creature — Human Samurai",
    );
    expect(samurai.triggered[0].trigger).toEqual({ on: "blocks", who: "self" });
    expect(samurai.triggered[1].trigger).toEqual({ on: "becomes-blocked", who: "self" });
    expect(samurai.triggered[1].effect).toEqual({ kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" });
    expect(samurai.complete).toBe(true);
    const kami = face(
      "Soulshift 3 (When this creature dies, you may return target Spirit card with mana value 3 or less from your graveyard to your hand.)",
      "Creature — Spirit",
    );
    expect(kami.triggered[0].trigger).toEqual({ on: "dies", who: "self" });
    expect(kami.triggered[0].targets).toEqual([
      { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Spirit", manaValue: { op: "lte", n: 3 } } },
    ]);
    expect(kami.complete).toBe(true);
  });

  it("sunburst (702.44a) and Modular—Sunburst (702.44c): Fifth Dawn's keyword lines", () => {
    const myr = face(
      "Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.)",
      "Artifact Creature — Myr",
    );
    expect(myr.static[0].replacement).toEqual({ event: "enters-battlefield", sunburst: true });
    expect(myr.static[0].text).toMatch(/^Sunburst \(This creature enters with a \+1\/\+1 counter/);
    expect(myr.complete).toBe(true);
    const prism = face(
      "Sunburst (This artifact enters with a charge counter on it for each color of mana spent to cast it.)",
      "Artifact",
    );
    expect(prism.static[0].text).toMatch(/^Sunburst \(This artifact enters with a charge counter/);
    const wanderer = face(
      "Modular—Sunburst (This creature enters with a +1/+1 counter on it for each color of mana spent to cast it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
      "Artifact Creature — Golem",
    );
    expect(wanderer.static[0].replacement).toEqual({
      event: "enters-battlefield",
      counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } },
    });
    expect(wanderer.triggered[0].trigger).toEqual({ on: "dies", who: "self" });
    expect(wanderer.complete).toBe(true);
  });

  it("'remove any number of counters' as a cost (count 'x'), and the mana it makes", () => {
    const battery = face(
      "{T}, Remove any number of charge counters from this artifact: Add {U}, then add an additional {U} for each charge counter removed this way.",
      "Artifact",
    );
    expect(battery.activated[0].cost).toEqual({ mana: null, tap: true, removeCounter: { kind: "charge", count: "x" } });
    expect(battery.activated[0].effect).toEqual({ kind: "add-mana", mana: "U", amount: { sum: [1, "x"] } });
    expect(battery.complete).toBe(true);
  });

  it("'you may choose not to untap' (rule 502.3) and 'for as long as ~ remains tapped'", () => {
    const gear = face(
      "You may choose not to untap this artifact during your untap step.\n{2}, {T}: Target creature you control gets +2/-2 for as long as this artifact remains tapped.",
      "Artifact",
    );
    expect(gear.static[0]).toMatchObject({ affects: { scope: "self" }, mayChooseNotToUntap: true });
    expect(gear.activated[0].effect).toEqual({ kind: "modify-pt", target: 0, power: 2, toughness: -2, duration: "while-source-tapped" });
    expect(gear.complete).toBe(true);
  });

  it("entwine (rule 702.42): a kicker that chooses every mode", () => {
    const spell = face("Choose one —\n• You gain 4 life.\n• Draw a card.\nEntwine {2} (Choose both if you pay the entwine cost.)", "Sorcery");
    expect(spell.kicker).toEqual({ cost: "{2}", keyword: "entwine" });
    expect(spell.castModal).toMatchObject({ minModes: 1, maxModes: 1, kickedModes: 2 });
    expect(spell.complete).toBe(true);
  });

  it("'you may choose the same mode more than once' (rule 700.2d): a repeatable castModal", () => {
    const spell = face(
      "Choose three. You may choose the same mode more than once.\n• Create a 2/2 white Knight creature token with vigilance.\n• Exile target enchantment.\n• You gain 5 life.",
      "Sorcery",
    );
    expect(spell.castModal).toMatchObject({ minModes: 3, maxModes: 3, repeatModes: true });
    expect(spell.castModal.modes[1]).toMatchObject({ targets: ["enchantment"] });
    expect(spell.castModal.modes[2].effect).toEqual({ kind: "gain-life", amount: 5 });
  });

  it("'shuffles their hand and graveyard into their library' (rule 701.24a): the zones, then the draw", () => {
    const twister = face("Each player shuffles their hand and graveyard into their library, then draws seven cards.", "Sorcery");
    expect(twister.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
        { kind: "draw", amount: 7, who: "each-player" },
      ],
    });
    const winds = face("Each player shuffles the cards from their hand into their library, then draws that many cards.", "Sorcery");
    expect(winds.effect).toEqual({ kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand"], drawThatMany: true });
    const nexus = face("Each player shuffles their graveyard into their library.", "Instant");
    expect(nexus.effect).toEqual({ kind: "shuffle-graveyard-into-library", target: "each-player" });
  });

  it("buyback (rule 702.27): a kicker whose cast returns to its owner's hand", () => {
    const spell = face(
      "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nDraw a card.",
      "Instant",
    );
    expect(spell.kicker).toEqual({ cost: "{3}", keyword: "buyback" });
    expect(spell.complete).toBe(true);
  });

  it("splice onto Arcane / instant or sorcery (rule 702.47) with a mana cost", () => {
    const visit = face(
      "Create a 1/1 colorless Spirit creature token.\nSplice onto Arcane {W} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
      "Instant — Arcane",
    );
    expect(visit.splice).toEqual({ onto: "arcane", cost: "{W}" });
    const everdream = face(
      "Draw a card.\nSplice onto instant or sorcery {2}{U} (As you cast an instant or sorcery spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
      "Instant",
    );
    expect(everdream.splice).toEqual({ onto: "instant-or-sorcery", cost: "{2}{U}" });
    expect(everdream.complete).toBe(true);
    // A non-mana splice cost stays a person's.
    expect(face("Draw a card.\nSplice onto Arcane—Exile four cards from your graveyard.", "Instant — Arcane").complete).toBe(false);
  });

  it("buyback with a non-mana cost: kicker.also", () => {
    const flood = face(
      "Buyback—Pay 3 life, Discard a card at random. (You may pay 3 life and discard a card at random in addition to any other costs as you cast this spell. If you do, put this card into your hand as it resolves.)\nDestroy target land.",
      "Sorcery",
    );
    expect(flood.kicker).toEqual({
      cost: "",
      keyword: "buyback",
      also: { text: "Pay 3 life, Discard a card at random", payLife: 3, discard: 1, discardAtRandom: true },
    });
    const stampede = face("Buyback—Sacrifice a land. (reminder)\nYou gain 2 life.", "Instant");
    expect(stampede.kicker?.also).toEqual({ text: "Sacrifice a land", sacrifice: { filter: { type: "land" }, count: 1 } });
  });

  it("a cost of discarding a card at random", () => {
    expect(parseCost("{2}, Discard a card at random").cost).toEqual({ mana: "{2}", tap: false, discard: { count: 1, random: true } });
  });

  it("madness (rule 702.35): the keyword line's cost, a mana cost only", () => {
    const imp = face(
      "Flying, haste\nMadness {B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
      "Creature — Imp",
    );
    expect(imp.madness).toEqual({ cost: "{B}" });
    expect(imp.complete).toBe(true);
    const fiend = face("Madness—{2}{B}, Pay 8 life.", "Creature — Demon");
    expect(fiend.madness).toBeUndefined();
    expect(fiend.complete).toBe(false);
  });

  it("miracle (rule 702.94a): the keyword line's cost", () => {
    const spell = face(
      "Draw a card.\nMiracle {R} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
      "Instant",
    );
    expect(spell.miracle).toEqual({ cost: "{R}" });
    expect(spell.complete).toBe(true);
  });

  it("soulbond (rule 702.95a): the keyword's two triggers, and the pairing static in the `paired` scope", () => {
    const reminder =
      "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)";
    const paladin = face(
      `${reminder}\nAs long as this creature is paired with another creature, both creatures have double strike.`,
      "Creature — Human Knight",
    );
    expect(paladin.triggered).toEqual(soulbond());
    expect(paladin.static[0]).toMatchObject({ affects: { scope: "paired" }, grantKeywords: ["double-strike"] });
    expect(paladin.complete).toBe(true);
    const familiar = face(
      `${reminder}\nAs long as this creature is paired with another creature, each of those creatures gets +2/+2.`,
      "Creature — Bear",
    );
    expect(familiar.static[0]).toMatchObject({ affects: { scope: "paired" }, grantPt: [2, 2] });
    expect(familiar.complete).toBe(true);
  });

  it("learn (rule 701.48a): the rummage, or else a Lesson from outside the game, as `learn()` writes it", () => {
    expect(parseSentence("Learn.", ctx())).toEqual(learn());
    const eyetwitch = face(
      "Flying\nWhen this creature dies, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
      "Creature — Eye Bat",
    );
    expect(eyetwitch.triggered[0].effect).toEqual(learn());
    expect(eyetwitch.complete).toBe(true);
  });

  it("venturing (rule 701.49): 'venture into the dungeon' and 'into Undercity'", () => {
    expect(parseSentence("Venture into the dungeon.", ctx())).toEqual({ kind: "venture" });
    expect(parseSentence("Venture into Undercity.", ctx())).toEqual({ kind: "venture", into: "undercity" });
    const delver = face(
      "When Test Card enters, venture into the dungeon. (Enter the first room or advance to the next room.)",
      "Creature — Human Rogue",
    );
    expect(delver.triggered[0].effect).toEqual({ kind: "venture" });
    expect(delver.complete).toBe(true);
  });

  it("a Licid's ability: it becomes an Aura on target creature until the cost is paid", () => {
    const licid = face(
      "{U}, {T}: This creature loses this ability and becomes an Aura enchantment with enchant creature. Attach it to target creature. You may pay {U} to end this effect.\nEnchanted creature has flying.",
      "Creature — Licid",
    );
    expect(licid.activated[0]).toMatchObject({
      cost: { mana: "{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "become-licid-aura", target: 0, endCost: "{U}" },
      licid: true,
    });
    expect(licid.complete).toBe(true);
  });

  it("reconfigure (rule 702.151): the keyword line's two abilities", () => {
    const boar = face("Equipped creature gets +3/+2.\nReconfigure {5}", "Artifact Creature — Equipment Boar");
    expect([boar.activated[0].reconfigure, boar.activated[1].reconfigure]).toEqual(["attach", "unattach"]);
    expect(boar.activated[0].targets).toEqual([{ kind: "other", of: "creature-you-control" }]);
    expect(boar.activated[1].effect).toEqual({ kind: "unattach", target: "source" });
    expect(boar.complete).toBe(true);
  });

  it("training (702.149) and exploit (702.110): the keyword lines and their 'trains' / 'exploits' triggers", () => {
    const rider = face("Flying\nTraining (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)", "Creature — Human Knight");
    expect(rider.triggered[0].trigger).toEqual({ on: "attacks", who: "self", withGreaterPower: true });
    expect(rider.complete).toBe(true);
    const skaab = face(
      "Exploit (When this creature enters, you may sacrifice a creature.)\nWhenever a creature you control exploits a nontoken creature, create a 2/2 black Zombie creature token.",
      "Creature — Zombie",
    );
    expect(skaab.triggered[0].trigger).toEqual({ on: "enters-battlefield", who: "self" });
    expect(skaab.triggered[1].trigger).toEqual({ on: "exploits", who: "you-control", filter: { type: "creature", token: false } });
    expect(skaab.complete).toBe(true);
  });

  it("shield counters (rule 122.1c): 'enters with a shield counter on him'", () => {
    const cap = face("Test Card enters with a shield counter on him.", "Legendary Creature — Human Soldier Hero");
    expect(cap.static[0].replacement).toEqual({ event: "enters-battlefield", counters: { kind: "shield", amount: 1 } });
    expect(cap.complete).toBe(true);
  });

  it("intervening ifs: 'if you have the initiative', 'if you've completed a dungeon'", () => {
    const seer = face(
      "At the beginning of your end step, if you have the initiative, put a +1/+1 counter on Test Card.",
      "Creature — Tiefling Warlock",
    );
    expect(seer.triggered[0].condition).toEqual({ kind: "initiative", who: "you" });
    expect(seer.complete).toBe(true);
    const delver = face("At the beginning of your upkeep, if you've completed a dungeon, draw a card.", "Creature — Human");
    expect(delver.triggered[0].condition).toEqual({ kind: "completed-dungeon" });
    expect(delver.complete).toBe(true);
  });

  it("read ahead (rule 702.155): the keyword line", () => {
    const saga = parseFace({
      name: "Test Saga",
      type_line: "Enchantment — Saga",
      oracle_text:
        "Read ahead (Choose a chapter and start with that many lore counters. Add one after your draw step. Skipped chapters don't trigger. Sacrifice after III.)",
    });
    expect(saga.readAhead).toBe(true);
  });

  it("Pithing Needle's and Meddling Mage's chosen card name (decision:choose-card-name)", () => {
    const needle = face(
      "As this artifact enters, choose a card name.\nActivated abilities of sources with the chosen name can't be activated unless they're mana abilities.",
      "Artifact",
    );
    expect(needle.chooseCardNameOnEnter).toEqual({ aim: "opponent-permanents" });
    expect(needle.static).toEqual([
      {
        affects: { scope: "self" },
        prohibits: { who: "each-player", abilitiesOf: { chosenName: true }, anyZone: true, exceptManaAbilities: true },
        text: "Activated abilities of sources with the chosen name can't be activated unless they're mana abilities.",
      },
    ]);
    const mage = face(
      "As this creature enters, choose a nonland card name.\nSpells with the chosen name can't be cast.",
      "Creature — Human Wizard",
    );
    expect(mage.chooseCardNameOnEnter).toEqual({ filter: { notTypes: ["land"] } });
    expect(mage.static).toEqual([
      { affects: { scope: "self" }, prohibits: { who: "each-player", spells: { chosenName: true } }, text: "Spells with the chosen name can't be cast." },
    ]);
    const council = face(
      "As this creature enters, choose a noncreature, nonland card name.\nYour opponents can't cast spells with the chosen name.\nSpells with the chosen name you cast cost {2} less to cast.",
      "Creature — Human Advisor",
    );
    expect(council.chooseCardNameOnEnter).toEqual({ filter: { notTypes: ["creature", "land"] } });
    expect(council.static[0]).toEqual({
      affects: { scope: "self" },
      prohibits: { who: "opponents", spells: { chosenName: true } },
      text: "Your opponents can't cast spells with the chosen name.",
    });
    // Only with the choice on the card.
    expect(face("Spells with the chosen name can't be cast.").complete).toBe(false);
  });

  it("a permanent chosen as it enters, the chosen creature, and a choice by the trigger's player (decision:choose-permanent)", () => {
    const pitlord = face(
      "Flying, trample\nAs this creature enters, choose another creature you control.\nThe chosen creature gets +3/+3 and has flying.\nWhen this creature leaves the battlefield, sacrifice the chosen creature.",
      "Creature — Demon",
    );
    expect(pitlord.complete).toBe(true);
    expect(pitlord.choosePermanentOnEnter).toEqual({
      filter: { type: "creature", controlledBy: "you" },
      prompt: "Choose another creature you control",
    });
    expect(pitlord.static).toEqual([
      {
        affects: { scope: "chosen" },
        grantPt: [3, 3],
        grantKeywords: ["flying"],
        text: "The chosen creature gets +3/+3 and has flying.",
      },
    ]);
    expect(pitlord.triggered[0].effect).toEqual({ kind: "sacrifice-target", target: "chosen" });
    const guard = face(
      "As this creature enters, choose another creature you control.\nSacrifice this creature: The chosen creature gains indestructible until end of turn.",
      "Creature — Human Knight",
    );
    expect(guard.activated[0].effect).toEqual({
      kind: "grant-keyword",
      target: "chosen",
      keyword: "indestructible",
      duration: "end-of-turn",
    });
    const hope = face(
      "At the beginning of each player's upkeep, that player returns a creature they control to its owner's hand.",
      "Enchantment",
    );
    expect(hope.triggered[0].effect).toEqual({
      kind: "choose-permanents",
      chooser: "active-player",
      filter: { type: "creature", controlledBy: "you" },
      min: 1,
      upTo: 1,
      then: { kind: "return-to-hand", target: 0 },
      prompt: "Return a creature you control to its owner's hand",
    });
    // "That player" outside a trigger that names one isn't read.
    expect(face("When this enchantment enters, that player untaps a land they control.", "Enchantment").complete).toBe(false);
  });

  it("restrictions keyed to the other creatures in combat (static:cant-attack-or-block-alone and its group)", () => {
    const self = (line: string): unknown => face(line, "Creature").static?.[0];
    expect(self("This creature can't attack or block alone.")).toMatchObject({
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone", "cant-block-alone"],
    });
    expect(self("This creature can't attack alone.")).toMatchObject({ restrictions: ["cant-attack-alone"] });
    expect(self("This creature can't block alone.")).toMatchObject({ restrictions: ["cant-block-alone"] });
    expect(self("This creature can only attack alone.")).toMatchObject({ restrictions: ["can-only-attack-alone"] });
    expect(self("This creature can't attack unless at least two other creatures attack.")).toMatchObject({
      restrictions: ["cant-attack-unless-two-others"],
    });
    expect(self("This creature can't block unless at least two other creatures block.")).toMatchObject({
      restrictions: ["cant-block-unless-two-others"],
    });
    expect(face("Enchant creature\nEnchanted creature gets +3/+0 and can only attack alone.", "Enchantment").static?.[0]).toMatchObject({
      affects: { scope: "attached" },
      grantPt: [3, 0],
      restrictions: ["can-only-attack-alone"],
    });
  });

  it("limits on the untap step (static:untap-step-limit, rule 502.3)", () => {
    const orb = face(
      "As long as this artifact is untapped, players can't untap more than one land during their untap steps.",
      "Artifact",
    );
    expect(orb.static?.[0]).toMatchObject({
      condition: { kind: "source", filter: { tapped: false } },
      untapLimit: { who: "each-player", count: 1, filter: { type: "land" } },
    });
    expect(face("As long as this artifact is untapped, players can't untap more than two permanents during their untap steps.", "Artifact").static?.[0]?.untapLimit).toEqual({
      who: "each-player",
      count: 2,
    });
    expect(face("Players can't untap more than one nonbasic land during their untap steps.", "Artifact").static?.[0]?.untapLimit).toEqual({
      who: "each-player",
      count: 1,
      filter: { type: "land", notSupertype: "basic" },
    });
    expect(face("You can't untap more than one land during your untap step.", "Creature").static?.[0]?.untapLimit).toEqual({
      who: "you",
      count: 1,
      filter: { type: "land" },
    });
    const matrix = face(
      "As long as this artifact is untapped, each player chooses artifact, creature, or land during their untap step. That player can untap only permanents of the chosen type this step.",
      "Artifact",
    );
    expect(matrix.static?.[0]).toMatchObject({
      condition: { kind: "source", filter: { tapped: false } },
      untapOnlyChosenType: { who: "each-player", types: ["artifact", "creature", "land"] },
    });
  });

  it("step skips as statics and as one-shots (static:skip-untap-step, skip-draw-step)", () => {
    expect(face("Skip your draw step.\nPay 1 life: Draw a card.", "Enchantment").static).toEqual([
      { affects: { scope: "self" }, skipsSteps: { who: "you", steps: ["draw"] }, text: "Skip your draw step." },
    ]);
    expect(face("Players skip their untap steps.", "Enchantment").static?.[0]?.skipsSteps).toEqual({
      who: "each-player",
      steps: ["untap"],
    });
    expect(face("Players skip their upkeep steps.", "Artifact").static?.[0]?.skipsSteps).toEqual({
      who: "each-player",
      steps: ["upkeep"],
    });
    expect(face("Target player skips their next draw step.", "Sorcery").effect).toEqual({
      kind: "skip-step",
      step: "draw",
      who: 0,
    });
  });

  it("damage rules over a target, and the static prevention for other creatures (prevent-combat-damage-to-and-by-target)", () => {
    expect(face("Untap target attacking creature. Prevent all combat damage that would be dealt to and dealt by that creature this turn.", "Instant").effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "untap", target: 0 },
        { kind: "damage-rule", to: { target: 0 }, combat: true },
        { kind: "damage-rule", by: { target: 0 }, combat: true },
      ],
    });
    expect(face("The next time target creature would deal damage this turn, prevent that damage. You gain life equal to the damage prevented this way.", "Instant").effect).toEqual({
      kind: "damage-rule",
      by: { target: 0 },
      amount: "next-time",
      gainLifePrevented: true,
    });
    expect(face("{4}{W}: Prevent all damage that would be dealt to this creature by target creature this turn.", "Creature — Human Wizard").activated?.[0]?.effect).toEqual({
      kind: "damage-rule",
      to: { target: "source" },
      by: { target: 0 },
    });
    expect(face("Prevent all noncombat damage that would be dealt to other creatures you control.", "Creature — Human Soldier").static?.[0]?.replacement).toEqual({
      event: "would-deal-damage",
      combat: false,
      prevent: true,
      toFilter: { type: "creature", controlledBy: "you" },
      toOther: true,
    });
  });

  it("a player chosen as it enters, and the lines that read the chosen player (decision:choose-player)", () => {
    const rack = face(
      "As this artifact enters, choose an opponent.\nThe chosen player's maximum hand size is four.",
      "Artifact",
    );
    expect(rack.choosePlayerOnEnter).toBe("opponent");
    expect(rack.static).toEqual([
      {
        affects: { scope: "self" },
        maxHandSize: { who: "chosen-player", set: 4 },
        text: "The chosen player's maximum hand size is four.",
      },
    ]);
    expect(face("As this creature enters, choose a player.", "Creature — Construct").choosePlayerOnEnter).toBe("player");
    expect(parseTrigger("At the beginning of the chosen player's upkeep")).toEqual([
      { on: "step-begins", step: "upkeep", who: "chosen-player" },
    ]);
    // "Choose two players" is another feature.
    expect(face("As this creature enters, choose two players.", "Creature — Demon").choosePlayerOnEnter).toBeUndefined();
  });

  it("a count from the chosen player's side (amount:count-for-chosen-player)", () => {
    const order = face(
      "As this creature enters, choose an opponent.\nTest Card's power and toughness are each equal to 1 plus the number of creatures the chosen player controls.",
      "Creature — Human Knight",
    );
    expect(order.static[0].setBasePtFromCount).toEqual({
      countOf: { countOf: { type: "creature", controlledBy: "you" } },
      plusPower: 1,
      plusToughness: 1,
      forChosenPlayer: true,
    });
    expect(order.complete).toBe(true);
    const specter = face(
      "As this creature enters, choose an opponent.\nTest Card's power and toughness are each equal to the number of cards in the chosen player's hand.",
      "Creature — Specter",
    );
    expect(specter.static[0].setBasePtFromCount).toEqual({
      countOf: "cards-in-your-hand",
      plusPower: 0,
      plusToughness: 0,
      forChosenPlayer: true,
    });
    const nyx = face(
      "As this creature enters, choose an opponent.\nThis creature gets -1/-1 for each card in the chosen player's hand.",
      "Creature — Elemental",
    );
    expect(nyx.static[0].grantPtPerCount).toEqual({ cardsInHand: true, forChosenPlayer: true, pt: [-1, -1] });
    expect(nyx.complete).toBe(true);
  });

  it("a bonus scaled by a hand size or a life total, and a life-total CDA (static:pt-per-amount)", () => {
    const strider = face("This creature gets -1/-1 for each card in your hand.", "Creature — Horror");
    expect(strider.static[0]).toMatchObject({ affects: { scope: "self" }, grantPtPerCount: { cardsInHand: true, pt: [-1, -1] } });
    expect(strider.complete).toBe(true);
    const enemy = face("This creature gets -1/-1 for each card in your opponents' hands.", "Creature — Demon");
    expect(enemy.static[0].grantPtPerCount).toEqual({ cardsInHand: "opponents", pt: [-1, -1] });
    const authority = face("Enchant creature\nEnchanted creature gets +1/+1 for each card in its controller's hand.", "Enchantment — Aura");
    expect(authority.static[0]).toMatchObject({
      affects: { scope: "attached" },
      grantPtPerCount: { cardsInHand: "affected-controller", pt: [1, 1] },
    });
    const meishin = face("All creatures get -X/-0, where X is the number of cards in your hand.", "Legendary Enchantment");
    expect(meishin.static[0]).toMatchObject({ affects: { scope: "all-creatures" }, grantPtPerCount: { cardsInHand: true, pt: [-1, 0] } });
    const shadow = face("This creature gets -X/-X, where X is your life total.", "Creature — Avatar");
    expect(shadow.static[0].grantPtPerCount).toEqual({ lifeTotal: true, pt: [-1, -1] });
    expect(shadow.complete).toBe(true);
    const avatar = face("Test Card's power and toughness are each equal to your life total.", "Creature — Avatar");
    expect(avatar.static[0].setBasePtFromCount).toEqual({ countOf: "your-life-total", plusPower: 0, plusToughness: 0 });
    expect(avatar.complete).toBe(true);
  });

  it("base power or base toughness alone (effect:set-base-power-only)", () => {
    const wak = face("{T}: Target creature with flying has base power 0 until end of turn.", "Land");
    expect(wak.activated[0].effect).toEqual({
      kind: "animate",
      target: 0,
      power: 0,
      addTypes: [],
      addSubtypes: [],
      duration: "end-of-turn",
    });
    expect(wak.complete).toBe(true);
    const duck = face("{3}: Until end of turn, this creature has base power 4 and gains trample.", "Creature — Turtle Bird");
    expect(duck.activated[0].effect).toEqual({
      kind: "animate",
      target: "source",
      power: 4,
      addTypes: [],
      addSubtypes: [],
      keywords: ["trample"],
      duration: "end-of-turn",
    });
    const chariot = face(
      "{2}, {T}: Until end of turn, target creature you control gains flying and has base toughness 1.",
      "Artifact",
    );
    expect(chariot.activated[0].effect).toMatchObject({ kind: "animate", target: 0, toughness: 1, keywords: ["flying"] });
    expect(chariot.activated[0].effect.power).toBeUndefined();
    const mangler = face(
      "{1}{U}: This creature's base power becomes equal to target creature's power. (This effect lasts indefinitely.)",
      "Creature — Beast",
    );
    expect(mangler.activated[0].effect).toMatchObject({ kind: "animate", target: "source", power: { powerOf: 0 }, duration: "permanent" });
    const wall = face(
      "At the beginning of your upkeep, this creature's base toughness becomes equal to 1 plus the number of creature cards in your graveyard. (This effect lasts indefinitely.)",
      "Creature — Wall",
    );
    expect(wall.triggered[0].effect).toMatchObject({
      kind: "animate",
      target: "source",
      toughness: { sum: [1, { countInGraveyard: { type: "creature", ownedBy: "you" } }] },
      duration: "permanent",
    });
  });

  it("its controller draws, discards or gets a poison counter (effect:player-scope-extensions)", () => {
    const who = { controllerOfTarget: 0 };
    const strike = face("Destroy target creature. Its controller discards a card.", "Sorcery");
    expect(strike.effect).toEqual({
      kind: "sequence",
      effects: [{ kind: "destroy", target: 0 }, { kind: "discard", target: who, amount: 1 }],
    });
    expect(strike.complete).toBe(true);
    const heel = face("Return target creature to its owner's hand. Its controller draws a card.", "Instant");
    expect(heel.effect.effects[1]).toEqual({ kind: "draw", who, amount: 1 });
    const pistus = face("Destroy target creature with flying. Its controller gets a poison counter.", "Instant");
    expect(pistus.effect.effects[1]).toEqual({ kind: "add-player-counters", counter: "poison", who, amount: 1 });
  });

  it("Titan of Littjara's chosen creature type (static:self-type-changes)", () => {
    const titan = face(
      "As this creature enters, choose a creature type.\nThis creature is the chosen type in addition to its other types.",
      "Creature — Illusion",
    );
    expect(titan.chooseCreatureTypeOnEnter).toBe(true);
    expect(titan.static).toEqual([
      { affects: { scope: "self" }, addsChosenCreatureType: true, text: "This creature is the chosen type in addition to its other types." },
    ]);
    // Only with the choice on the card.
    expect(face("This creature is the chosen type in addition to its other types.").complete).toBe(false);
    // Arixmethes, Slumbering Isle: its card types replaced while it has a counter.
    expect(face("As long as Test Card has a slumber counter on it, it's a land. (It's not a creature.)").static[0]).toMatchObject({
      condition: { kind: "self-counters", counter: "slumber", compare: { op: "gte", n: 1 } },
      setTypes: ["land"],
    });
  });

  it("moving counters (rule 122.5): of a kind, all, a chosen kind or any number between two targets", () => {
    const closet = face("{T}: Move a +1/+1 counter from this artifact onto target creature you control.", "Artifact");
    expect(closet.activated[0].effect).toEqual({ kind: "move-counters", from: "source", to: 0, counter: "+1/+1" });
    expect(closet.activated[0].targets).toEqual(["creature-you-control"]);
    const ozolith = face(
      "At the beginning of combat on your turn, if Test Card has counters on it, you may move all counters from Test Card onto target creature.",
      "Legendary Artifact",
    );
    expect(ozolith.triggered[0].condition).toEqual({ kind: "self-counters", compare: { op: "gte", n: 1 } });
    expect(ozolith.triggered[0].effect).toMatchObject({
      kind: "may",
      effect: { kind: "move-counters", from: "source", to: 0, amount: "all" },
    });
    const grounds = face("{1}, {T}: Move a counter from target permanent you control onto a second target permanent.", "Land");
    expect(grounds.activated[0].effect).toEqual({ kind: "move-counters", from: 0, to: 1 });
    expect(grounds.activated[0].targets).toEqual([{ kind: "permanent", whose: "you", filter: {} }, "permanent"]);
    const defense = face(
      "{4}{W}: Move any number of counters from target permanent you control onto a second target permanent you control.",
      "Enchantment",
    );
    expect(defense.activated[0].effect).toEqual({ kind: "move-counters", from: 0, to: 1, amount: "any" });
    expect(defense.complete).toBe(true);
  });

  it("graft N (rule 702.58a): enters with the counters, and may move one onto another creature that enters", () => {
    const frog = face("Graft 3", "Creature — Frog Mutant");
    expect(frog.static).toEqual([
      { affects: { scope: "self" }, replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } }, text: "Graft 3" },
    ]);
    expect(frog.triggered[0]).toMatchObject({
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      effect: { kind: "may", effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" } },
    });
    expect(frog.complete).toBe(true);
  });

  it("vanishing N (rule 702.63a) and time travel (rule 701.56a)", () => {
    const knocks = face(
      "Vanishing 4 (This enchantment enters with four time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)",
      "Enchantment",
    );
    expect(knocks.static).toMatchObject([
      { affects: { scope: "self" }, replacement: { event: "enters-battlefield", counters: { kind: "time", amount: 4 } } },
    ]);
    expect(knocks.triggered.map((t: { trigger: unknown }) => t.trigger)).toEqual([
      { on: "step-begins", step: "upkeep", who: "you" },
      { on: "counters-removed", who: "self", counter: "time", last: true },
    ]);
    expect(knocks.complete).toBe(true);
    expect(parseSentence("Time travel.")).toEqual({ kind: "time-travel" });
    expect(parseSentence("Amass Orcs 2.")).toEqual({ kind: "amass", amount: 2, creatureType: "Orc" });
    expect(parseSentence("Amass Zombies 4.")).toEqual({ kind: "amass", amount: 4, creatureType: "Zombie" });
  });

  it("incubate N (rule 701.53a)", () => {
    expect(parseSentence("Incubate 5.", ctx())).toEqual({ kind: "incubate", amount: 5 });
  });

  it("Phyrexia: All Will Be One's lines: toxic, For Mirrodin!, counters of any named kind", () => {
    const mite = parseFace({ name: "Test Mite", type_line: "Creature — Phyrexian Mite", oracle_text: "Toxic 2\nThis creature enters with two oil counters on it." });
    expect(mite.toxic).toBe(2);
    expect(mite.static?.[0]?.replacement).toEqual({ event: "enters-battlefield", counters: { kind: "oil", amount: 2 } });
    expect(mite.complete).toBe(true);
    const walker = parseFace({ name: "Test Walker", type_line: "Legendary Planeswalker — Test", oracle_text: "Compleated" });
    expect(walker.compleated).toBe(true);
    const blade = parseFace({ name: "Test Blade", type_line: "Artifact — Equipment", oracle_text: "For Mirrodin!" });
    expect(blade.triggered?.[0]?.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "create-token", token: "Rebel Token", count: 1 },
        { kind: "attach", target: "created", attachment: "source" },
      ],
    });
    expect(parseSentence("Put an oil counter on ~.", ctx())).toEqual({ kind: "add-counter", target: "source", counter: "oil", amount: 1 });
  });

  it("the owner's choice of top or bottom of their library", () => {
    expect(parseSentence("Target creature's owner puts it on their choice of the top or bottom of their library.", ctx())).toEqual({
      kind: "put-on-library",
      target: 0,
      position: { ownerChooses: ["top", "bottom"] },
    });
    expect(
      parseSentence("The owner of target nonland permanent puts it on their choice of the top or bottom of their library.", ctx()),
    ).toEqual({ kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } });
  });

  it("several cards into their owners' libraries at once (put-on-libraries, rule 401.4)", () => {
    const plow = ctx();
    expect(parseSentence("Put two target lands on top of their owners' libraries.", plow)).toEqual({
      kind: "put-on-libraries",
      what: { targetsFrom: 0 },
      position: "top",
    });
    expect(plow.targets).toEqual(["land", { kind: "other", of: "land", than: { slots: [0] } }]);
    const young = ctx();
    expect(
      parseSentence("Put any number of target creature cards from your graveyard on top of your library.", young),
    ).toEqual({ kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" });
    expect(young.targets).toEqual([
      { kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
    ]);
    const reinforcements = ctx();
    parseSentence("Put up to three target creature cards from your graveyard on top of your library.", reinforcements);
    expect(reinforcements.targets).toEqual([
      { kind: "any-number", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, max: 3 },
    ]);
    expect(parseSentence("Put all enchantments on top of their owners' libraries.", ctx())).toEqual({
      kind: "put-on-libraries",
      what: { all: { type: "enchantment" } },
      position: "top",
    });
    expect(
      parseSentence(
        "For each attacking creature, its owner puts it on their choice of the top or bottom of their library.",
        ctx(),
      ),
    ).toEqual({ kind: "put-on-libraries", what: { all: { type: "creature", attacking: true } }, position: "owner-chooses" });
  });

  it("a graveyard's matching cards, or target cards, shuffled into libraries (rule 701.24a)", () => {
    expect(parseSentence("Shuffle all nonland cards from your graveyard into your library.", ctx())).toEqual({
      kind: "shuffle-graveyard-into-library",
      target: "you",
      filter: { notTypes: ["land"] },
    });
    const repopulate = ctx();
    expect(
      parseSentence("Shuffle all creature cards from target player's graveyard into that player's library.", repopulate),
    ).toEqual({ kind: "shuffle-graveyard-into-library", target: 0, filter: { type: "creature" } });
    expect(repopulate.targets).toEqual(["player"]);
    expect(parseSentence("You gain life equal to the number of cards shuffled into your library this way.", ctx())).toEqual({
      kind: "gain-life",
      amount: { thisWay: "shuffled-into-library" },
    });
    const serene = ctx();
    expect(
      parseSentence("Shuffle ~ and up to three target cards from a single graveyard into their owners' libraries.", serene),
    ).toEqual({ kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "shuffle", withSource: true });
    expect(serene.targets).toEqual([
      { kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 3, sameController: true },
    ]);
  });

  it("amplify N (rule 702.38a) and provoke (rule 702.39a)", () => {
    const throwback = face(
      "Amplify 2 (As this creature enters, put two +1/+1 counters on it for each Beast card you reveal in your hand.)\nProvoke (Whenever this creature attacks, you may have target creature defending player controls untap and block it if able.)",
      "Creature — Beast",
    );
    expect(throwback.amplify).toBe(2);
    expect(throwback.triggered[0].trigger).toEqual({ on: "attacks", who: "self" });
    expect(throwback.triggered[0].effect.effect.effects[1]).toEqual({ kind: "block-if-able", target: 0, attacker: "source" });
    expect(throwback.complete).toBe(true);
  });

  it("devour N, devour land N and devour Food N (rule 702.82)", () => {
    const myco = face(
      "Devour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)",
      "Creature — Fungus",
    );
    expect(myco.devour).toEqual({ multiplier: 2, filter: { type: "creature" } });
    expect(myco.complete).toBe(true);
    const hobbit = face(
      "Devour Food 3 (As this creature enters, you may sacrifice any number of Foods. It enters with three times that many +1/+1 counters on it.)",
      "Creature — Halfling Citizen",
    );
    expect(hobbit.devour).toEqual({ multiplier: 3, filter: { type: "artifact", subtype: "Food" } });
  });

  it("'any player may activate this ability' (rule 602.2) and 'unless any player pays' (Prophecy)", () => {
    const snake = face("{2}: This creature loses flying until end of turn. Any player may activate this ability.", "Creature — Snake");
    expect(snake.activated[0].anyPlayer).toBe(true);
    const revel = face(
      "{4}: Return target creature card from a graveyard to its owner's hand. Any player may activate this ability but only as a sorcery.",
      "Enchantment",
    );
    expect(revel.activated[0].anyPlayer).toBe(true);
    expect(revel.activated[0].sorcerySpeed).toBe(true);
    const tutor = face("Unless any player pays {2}, search your library for a card, put that card into your hand, then shuffle.", "Sorcery");
    expect(tutor.effect).toMatchObject({ kind: "unless", chooser: "any-player", options: [{ pay: "{2}", text: "Pay {2}" }] });
    const shade = face("{B}: This creature gets +1/+1 until end of turn unless any player pays {2}.", "Creature — Shade");
    expect(shade.activated[0].effect).toEqual({
      kind: "unless",
      chooser: "any-player",
      options: [{ pay: "{2}", text: "Pay {2}" }],
      otherwise: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
    });
  });

  it("a Role token created attached (rule 303.7): to a target, to up to one other target, to it", () => {
    const genealogist = face(
      "When this creature enters, create a Royal Role token attached to another target creature you control.",
      "Creature — Elf Advisor",
    );
    expect(genealogist.triggered[0]).toMatchObject({
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "create-token", token: "Royal Role Token", count: 1, attachedTo: 0 },
    });
    const courtier = face("When this creature enters, create a Cursed Role token attached to it.", "Creature — Human Noble");
    expect(courtier.triggered[0]).toMatchObject({
      targets: [],
      effect: { kind: "create-token", token: "Cursed Role Token", count: 1, attachedTo: "source" },
    });
    const parents = face(
      "When this creature dies, create a Young Hero Role token attached to up to one target creature you control.",
      "Creature — Human Peasant",
    );
    expect(parents.triggered[0]).toMatchObject({
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: { kind: "create-token", token: "Young Hero Role Token", attachedTo: 0 },
    });
  });

  it("'put its counters on …' of a permanent that left (rule 122.8), and 'if it had counters on it'", () => {
    // Its own: the source, the intervening if on its counters as it died.
    const apprentice = face(
      "When this creature dies, if it had counters on it, put those counters on target creature you control.",
      "Artifact Creature — Construct",
    );
    expect(apprentice.triggered[0]).toMatchObject({
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 1 } },
      targets: ["creature-you-control"],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
    });
    expect(face("When this creature leaves the battlefield, put its counters on target creature you control.").triggered[0].effect).toEqual({
      kind: "put-counters-of",
      of: "source",
      target: 0,
    });
    // Another's: the trigger object, the "if" on what left as the trigger's
    // filter; "this creature or another" is the two triggers it is.
    const ozolith = face(
      "Whenever a creature you control leaves the battlefield, if it had counters on it, put those counters on Test Card.",
      "Legendary Artifact",
    );
    expect(ozolith.triggered[0]).toMatchObject({
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } } },
      effect: { kind: "put-counters-of", of: "trigger-object", target: "source" },
    });
    const host = face(
      "Whenever this creature or another creature you control dies, if it had counters on it, put its counters on up to one target creature you control.",
    );
    expect(host.triggered.map((t: { trigger: unknown }) => t.trigger)).toEqual([
      { on: "dies", who: "self", filter: { counters: { compare: { op: "gte", n: 1 } } } },
      { on: "dies", who: "you-control", filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } }, otherOnly: true },
    ]);
    expect(host.triggered[0].targets).toEqual([{ kind: "optional", of: "creature-you-control" }]);
    expect(host.triggered[1].effect).toEqual({ kind: "put-counters-of", of: "trigger-object", target: 0 });
    // Not after another sentence: "its" is then whatever that one was about.
    expect(face("When this creature dies, draw a card. Put its counters on target creature you control.").complete).toBe(false);
  });
});

describe("block limits, lost abilities and chosen types (B249)", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Card", type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'can block an additional creature' and 'any number of creatures'", () => {
    expect(face("Creature — Giant", "This creature can block an additional creature each combat.").static[0]).toMatchObject({
      affects: { scope: "self" },
      blockAdditional: 1,
    });
    expect(face("Creature — Spider", "This creature can block an additional seven creatures each combat.").static[0]).toMatchObject({
      blockAdditional: 7,
    });
    expect(face("Enchantment — Aura", "Enchant creature\nEnchanted creature can block any number of creatures.").static[0]).toMatchObject({
      affects: { scope: "attached" },
      blockAdditional: "any",
    });
    expect(face("Creature — Chimera", "{1}{W}: This creature can block an additional creature this turn.").activated[0].effect).toEqual({
      kind: "block-additional",
      target: "source",
      amount: 1,
      duration: "end-of-turn",
    });
  });

  it("reads a static loss of all abilities, with a P/T beside it", () => {
    expect(face("Enchantment", "Creatures lose all abilities.").static[0]).toMatchObject({
      affects: { scope: "all-creatures" },
      loseAllAbilities: true,
    });
    expect(face("Enchantment — Aura", "Enchant creature\nEnchanted creature gets -2/-0 and loses all abilities.").static[0]).toMatchObject({
      affects: { scope: "attached" },
      grantPt: [-2, 0],
      loseAllAbilities: true,
    });
    expect(
      face("Enchantment — Aura", "Enchant creature\nEnchanted creature loses all abilities and has base power and toughness 1/1.").static[0],
    ).toMatchObject({ loseAllAbilities: true, setBasePt: { power: 1, toughness: 1 } });
  });

  it("reads 'becomes the creature type of your choice'", () => {
    expect(face("Creature — Illusion", "{1}: This creature becomes the creature type of your choice until end of turn.").activated[0].effect).toEqual({
      kind: "choose-creature-type",
      then: { kind: "add-types", target: "source", setSubtypes: ["$chosen"], duration: "end-of-turn" },
    });
  });
});

describe("agreement with the hand-authored pool", () => {
  it("every ability the parser claims complete matches the authored one", () => {
    const { stats, mismatches } = checkPool(POOL_CARDS);
    expect(stats.claimed).toBeGreaterThan(400);
    expect(mismatches.map((m: { card: string; text: string }) => `${m.card}: ${m.text}`)).toEqual([]);
  });
});

describe("land-type setting statics (rule 305.7)", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Land Setter", type_line, oracle_text }, { tokenFor: () => null });
  it("reads Blood Moon's, Spreading Seas's and Convincing Mirage's", () => {
    expect(face("Enchantment", "Nonbasic lands are Mountains.").static[0]).toMatchObject({
      affects: { scope: "filter", filter: { type: "land", notSupertype: "basic" } },
      setSubtypes: ["Mountain"],
    });
    expect(face("Enchantment — Aura", "Enchant land\nEnchanted land is an Island.").static[0]).toMatchObject({
      affects: { scope: "attached" },
      setSubtypes: ["Island"],
    });
    expect(face("Enchantment — Aura", "Enchant land\nEnchanted land is the chosen type.").static[0]).toMatchObject({
      affects: { scope: "attached" },
      setsChosenLandType: true,
    });
  });
});

describe("chosen counter costs, modal activated abilities, the host's prohibition (B254)", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test B254", type_line, oracle_text }, { tokenFor: () => null });
  it("reads a counter removed from a permanent you control, or from among them", () => {
    const ghave = face("Creature — Fungus", "{1}, Remove a +1/+1 counter from a creature you control: Draw a card.");
    expect(ghave.activated[0].cost).toEqual({
      mana: "{1}",
      tap: false,
      removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } },
    });
    const among = face("Creature — Beast", "{3}, Remove three counters from among creatures you control: Draw a card.");
    expect(among.activated[0].cost.removeCounter).toEqual({ kind: "any", count: 3, from: { type: "creature" }, among: true });
    const another = face("Artifact Creature — Construct", "{1}, Remove a counter from another creature you control: Draw a card.");
    expect(another.activated[0].cost.removeCounter).toEqual({ kind: "any", count: 1, from: { type: "creature" }, excludeSource: true });
    const self = face("Creature — Giant", "{1}{R}, Remove a counter from this creature: Draw a card.");
    expect(self.activated[0].cost.removeCounter).toEqual({ kind: "any", count: 1 });
  });

  it("reads a modal activated ability's modes, each with its targets, announced", () => {
    const bloom = face(
      "Creature — Fungus",
      "{1}, Sacrifice this creature: Choose one —\n• Destroy target artifact.\n• Destroy target enchantment.\n• Draw a card.",
    );
    expect(bloom.activated[0].effect).toMatchObject({
      kind: "modal",
      announced: true,
      minModes: 1,
      maxModes: 1,
      modes: [
        { text: "Destroy target artifact.", targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
        { text: "Destroy target enchantment.", targets: ["enchantment"], effect: { kind: "destroy", target: 0 } },
        { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
      ],
    });
    const bowls = face("Artifact — Food", "{2}, {T}: Choose one that hasn't been chosen —\n• Draw a card.\n• You gain 3 life.");
    expect(bowls.activated[0].effect).toMatchObject({ kind: "modal", announced: true, notChosenBefore: true });
  });

  it("reads 'its activated abilities can't be activated' as the host's (Arrest)", () => {
    const arrest = face(
      "Enchantment — Aura",
      "Enchant creature\nEnchanted creature can't attack or block, and its activated abilities can't be activated.",
    );
    expect(arrest.static[0]).toMatchObject({
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
    });
    const fetters = face(
      "Enchantment — Aura",
      "Enchant permanent\nEnchanted permanent can't attack or block, and its activated abilities can't be activated unless they're mana abilities.",
    );
    expect(fetters.static[0].prohibits).toEqual({ who: "each-player", abilitiesOf: { hostOfSource: true }, exceptManaAbilities: true });
  });
});

describe("damage by this source, switches, defending-player restrictions, a targeted chooser (B255)", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test B255", type_line, oracle_text }, { tokenFor: () => null });
  it("reads 'a creature dealt damage by ~ this turn' as a dies trigger and a replacement", () => {
    const sengir = face(
      "Creature — Vampire",
      "Whenever a creature dealt damage by this creature this turn dies, put a +1/+1 counter on this creature.",
    );
    expect(sengir.triggered[0].trigger).toEqual({
      on: "dies",
      who: "any",
      filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
    });
    const embrace = face(
      "Enchantment — Aura",
      "Whenever a creature dealt damage by enchanted creature this turn dies, put a +1/+1 counter on that creature.",
    );
    expect(embrace.triggered[0].trigger.filter.damagedThisTurnBy).toEqual({ source: "host" });
    const pupils = face("Creature — Human Shaman", "If a creature dealt damage by this creature this turn would die, exile it instead.");
    expect(pupils.static[0].replacement.filter).toEqual({ type: "creature", damagedThisTurnBy: { source: "this" } });
  });

  it("reads a power and toughness switch (rule 613.4d)", () => {
    expect(parseSentence("Switch target creature's power and toughness until end of turn.", ctx())).toEqual({
      kind: "switch-pt",
      target: 0,
      duration: "end-of-turn",
    });
    expect(parseSentence("Switch ~'s power and toughness until end of turn.", ctx())).toEqual({
      kind: "switch-pt",
      target: "source",
      duration: "end-of-turn",
    });
    expect(parseSentence("Switch each creature's power and toughness until end of turn.", ctx())).toEqual({
      kind: "switch-pt",
      all: { type: "creature" },
      duration: "end-of-turn",
    });
  });

  it("reads restrictions asked of the defending or attacking player", () => {
    const serpent = face("Creature — Serpent", "This creature can't attack unless defending player controls an Island.");
    expect(serpent.static[0].cantAttackUnlessDefender).toEqual({ controls: { subtype: "Island" } });
    const hireling = face("Creature — Ogre", "This creature can't attack unless defending player is the monarch.");
    expect(hireling.static[0].cantAttackUnlessDefender).toEqual({ monarch: true });
    const toady = face(
      "Creature — Goblin",
      "This creature can't attack unless you control more creatures than defending player.\nThis creature can't block unless you control more creatures than attacking player.",
    );
    expect(toady.static[0].cantAttackUnlessDefender).toEqual({ youControlMore: { type: "creature" } });
    expect(toady.static[1].cantBlockUnlessAttacker).toEqual({ youControlMore: { type: "creature" } });
    // "Unless attacking player" on an attack is no sentence the rules write.
    expect(face("Creature — Goblin", "This creature can't attack unless attacking player is poisoned.").static ?? []).toEqual([]);
  });

  it("reads 'target … of defending player's choice' as that player choosing the targets", () => {
    const erithizon = face("Creature — Beast", "Whenever this creature attacks, put a +1/+1 counter on target creature of defending player's choice.");
    expect(erithizon.triggered[0]).toMatchObject({
      trigger: { on: "attacks", who: "self" },
      targets: ["creature"],
      targetsChosenBy: "trigger-player",
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
    });
    // "That player" on an attack names nobody: not read.
    const wrong = face("Creature — Beast", "Whenever this creature attacks, put a +1/+1 counter on target creature of that player's choice.");
    expect(wrong.triggered?.[0]?.targetsChosenBy).toBeUndefined();
  });

  it("reads a sweep that leaves out its source: other, other than, except for", () => {
    const wurm = face("Creature — Wurm", "Whenever this creature attacks, destroy all other creatures.");
    expect(wurm.triggered[0].effect).toEqual({ kind: "destroy-all", filter: { type: "creature" }, exceptSource: true });
    const grove = face("Enchantment", "{1}{G}{G}: Destroy all other enchantments.");
    expect(grove.activated[0].effect).toEqual({ kind: "destroy-all", filter: { type: "enchantment" }, exceptSource: true });
    expect(parseSentence("Destroy all permanents other than ~.", ctx())).toEqual({ kind: "destroy-all", filter: {}, exceptSource: true });
    const mageta = face("Creature — Human Spellshaper", "{2}{W}{W}, {T}: Destroy all creatures except for this creature. Those creatures can't be regenerated.");
    expect(mageta.activated[0].effect).toEqual({ kind: "destroy-all", filter: { type: "creature" }, exceptSource: true, cantBeRegenerated: true });
    expect(parseSentence("Destroy all other permanents except for lands and tokens.", ctx())).toEqual({
      kind: "destroy-all",
      filter: { notTypes: ["land"], token: false },
      exceptSource: true,
    });
    const giant = face("Sorcery", "Destroy all other creatures you control.");
    expect(giant.effect).toEqual({ kind: "destroy-all", filter: { type: "creature", controlledBy: "you" }, exceptSource: true });
  });

  it("reads a life total set (rule 119.5): a number, the starting total, a count of each player's, the lowest", () => {
    const sphinx = face("Artifact Creature — Sphinx", "When this creature enters, target player's life total becomes 10.");
    expect(sphinx.triggered[0].effect).toEqual({ kind: "set-life-total", who: 0, amount: 10 });
    const wind = face("Sorcery", "Target player's life total becomes 20.");
    expect(wind.effect).toEqual({ kind: "set-life-total", who: 0, amount: 20 });
    const sorin = face("Sorcery", "Target opponent's life total becomes 10.");
    expect(sorin.effect).toEqual({ kind: "set-life-total", who: 0, amount: 10 });
    const biorhythm = face("Sorcery", "Each player's life total becomes the number of creatures they control.");
    expect(biorhythm.effect).toEqual({
      kind: "set-life-total",
      who: "each-player",
      amount: { countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true },
    });
    const repay = face("Sorcery", "Each player's life total becomes the lowest life total among all players.");
    expect(repay.effect).toEqual({ kind: "set-life-total", who: "each-player", amount: { lowestLifeTotal: true } });
    const stone = face("Sorcery", "Your life total becomes half your starting life total, rounded up.");
    expect(stone.effect).toEqual({ kind: "set-life-total", who: "you", amount: { half: { startingLifeTotal: true }, round: "up" } });
    const mercy = face("Sorcery", "Your life total becomes equal to your starting life total.");
    expect(mercy.effect).toEqual({ kind: "set-life-total", who: "you", amount: { startingLifeTotal: true } });
    // "Becomes X" with nothing reading X isn't read.
    expect(face("Sorcery", "Your life total becomes the number of cards in your hand.").effect).toBeNull();
  });

  it("reads a choice among cards revealed from a hand: reveals and picks", () => {
    const blackmail = face("Sorcery", "Target player reveals three cards from their hand and you choose one of them. That player discards that card.");
    expect(blackmail.effect).toEqual({ kind: "discard-chosen", target: 0, reveals: 3 });
    const whack = face("Sorcery", "Target player reveals three cards from their hand. You choose two of them. That player discards those cards.");
    expect(whack.effect).toEqual({ kind: "discard-chosen", target: 0, reveals: 3, picks: 2 });
    const toll = face("Sorcery", "Target player reveals a number of cards from their hand equal to the number of Swamps you control. You choose one of them. That player discards that card.");
    expect(toll.effect).toEqual({ kind: "discard-chosen", target: 0, reveals: { countOf: { subtype: "Swamp", controlledBy: "you" } } });
    const sprite = face("Creature — Faerie Rogue", "When this creature enters, target player reveals X cards from their hand, where X is the number of Faeries you control. You choose one of those cards. That player discards that card.");
    expect(sprite.triggered[0].effect).toEqual({ kind: "discard-chosen", target: 0, reveals: { countOf: { subtype: "Faerie", controlledBy: "you" } } });
    const interrogator = face("Sorcery", "Target player reveals X cards from their hand and you choose one of them. That player discards that card.");
    expect(interrogator.effect).toEqual({ kind: "discard-chosen", target: 0, reveals: "x" });
    // An amount nothing reads stays unread.
    const klaw = face("Sorcery", "Target player reveals a number of cards from their hand equal to one plus the number of creature cards in your graveyard. You choose one of them. That player discards that card.");
    expect(klaw.effect).toBeNull();
  });

  it("reads a choice from a revealed hand, discarded or exiled", () => {
    const seer = face(
      "Creature — Eldrazi",
      "When this creature enters, target opponent reveals their hand. You choose a nonland card from it and exile that card.",
    );
    expect(seer.triggered[0].effect).toEqual({ kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" });
    const terrors = face("Sorcery", "Target player reveals their hand. You choose a nonland card from it. Exile that card.");
    expect(terrors.effect).toEqual({ kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" });
    // "A nonland permanent card" isn't read: the type phrase would drop "permanent".
    const sentence = face("Sorcery", "Target opponent reveals their hand. You choose a nonland permanent card from it. That player discards that card.");
    expect(sentence.effect).toBeNull();
  });

  it("reads 'target opponent exiles a card from their hand' as their choice", () => {
    expect(parseSentence("Target opponent exiles two cards from their hand.", ctx())).toEqual({
      kind: "for-each-player",
      who: { target: 0 },
      effect: { kind: "look-and-choose", player: "that-player", zone: "hand", min: 2, max: 2, destination: "exile", unlinked: true, leftover: "stay" },
    });
  });

  it("reads separating into two piles (rule 700.3)", () => {
    const fof = face(
      "Instant",
      "Reveal the top five cards of your library. An opponent separates those cards into two piles. Put one pile into your hand and the other into your graveyard.",
    );
    expect(fof.effect).toEqual({
      kind: "choose-opponent",
      then: {
        kind: "separate-into-piles",
        objects: { libraryTop: 5, reveal: true },
        separator: "that-player",
        chooser: "you",
        chosen: "hand",
        rest: "graveyard",
      },
    });
    const augury = face(
      "Instant",
      "Reveal the top five cards of your library and separate them into two piles. An opponent chooses one of those piles. Put that pile into your hand and the other into your graveyard.",
    );
    expect(augury.effect.then).toEqual({
      kind: "separate-into-piles",
      objects: { libraryTop: 5, reveal: true },
      chooser: "that-player",
      chosen: "hand",
      rest: "graveyard",
    });
    const favor = face(
      "Instant",
      "Target opponent looks at the top four cards of your library and separates them into a face-down pile and a face-up pile. Put one pile into your hand and the other into your graveyard.",
    );
    expect(favor.targets).toEqual(["opponent"]);
    expect(favor.effect).toMatchObject({ objects: { libraryTop: 4 }, faceDown: true, separator: { target: 0 }, chooser: "you" });
    const doOrDie = face(
      "Sorcery",
      "Separate all creatures target player controls into two piles. Destroy all creatures in the pile of that player's choice. They can't be regenerated.",
    );
    expect(doOrDie.effect).toEqual({
      kind: "separate-into-piles",
      objects: { permanents: { type: "creature" }, whose: { target: 0 } },
      chooser: { target: 0 },
      chosen: { effect: { kind: "destroy", target: 0, cantBeRegenerated: true } },
    });
    // A look with two plain piles names no card's shape, and isn't read.
    const look = face(
      "Instant",
      "Look at the top five cards of your library and separate them into two piles. An opponent chooses one of those piles. Put that pile into your hand and the other into your graveyard.",
    );
    expect(look.effect).toBeNull();
  });
});

describe("a value chosen as it resolves (choose-value)", () => {
  const spell = (name: string, oracle_text: string) => parseFace({ name, type_line: "Sorcery", oracle_text });

  it("reads a colour chosen, then a discard or a sweep of that colour", () => {
    const persecute = spell(
      "Persecute",
      "Choose a color. Target player reveals their hand and discards all cards of that color.",
    );
    expect(persecute.complete).toBe(true);
    expect(persecute.targets).toEqual(["player"]);
    expect(persecute.effect).toEqual({
      kind: "choose-value",
      value: "color",
      then: { kind: "discard-hand", who: 0, filter: { colors: ["$chosenColor"] }, reveal: true },
    });
    const demise = spell("Sudden Demise", "Choose a color. Sudden Demise deals X damage to each creature of the chosen color.");
    expect(demise.effect).toEqual({
      kind: "choose-value",
      value: "color",
      then: { kind: "damage-all", filter: { type: "creature", colors: ["$chosenColor"] }, amount: "x" },
    });
  });

  it("reads a card type chosen and counted among a revealed hand", () => {
    const oath = spell(
      "Blood Oath",
      "Choose a card type. Target opponent reveals their hand. Blood Oath deals 3 damage to that player for each card of the chosen type revealed this way. (Artifact, battle, creature, enchantment, instant, kindred, land, planeswalker, and sorcery are card types.)",
    );
    expect(oath.complete).toBe(true);
    expect(oath.targets).toEqual(["opponent"]);
    expect(oath.effect).toEqual({
      kind: "choose-value",
      value: "card-type",
      then: {
        kind: "sequence",
        effects: [
          { kind: "reveal-hand", who: 0 },
          { kind: "damage", target: 0, amount: { product: [3, { thisWay: "revealed", filter: { type: "$chosenCardType" } }] } },
        ],
      },
    });
  });

  it("reads a counter chosen on a target, and leaves an unknown follow-up alone", () => {
    const targets: unknown[] = [];
    const counter = parseEffect("Choose a counter on target permanent. Put an additional counter of that kind on that permanent.", {
      targets,
    });
    expect(counter.effect).toEqual({
      kind: "choose-value",
      value: "counter-kind",
      on: 0,
      then: { kind: "add-counter", target: 0, counter: "$chosenCounter", amount: 1 },
    });
    expect(targets).toEqual(["permanent"]);
    // Not one of the shapes read: no choose-value, the sentence left to do.
    expect(spell("Mondo", "Choose a color. Target player loses 2 life for each permanent of that color.").effect).toBeNull();
  });
});

describe("distinct values and Equipment attached to the source", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Distinct", type_line, oracle_text }, { tokenFor: () => null });
  it("reads 'a card for each different mana value / power among …'", () => {
    const lunar = face("Sorcery", "Draw a card for each different mana value among nonland permanents you control.");
    expect(lunar.complete).toBe(true);
    expect(lunar.effect).toEqual({
      kind: "draw",
      amount: { aggregate: "distinct", of: "mana-value", filter: { notTypes: ["land"], controlledBy: "you" } },
    });
    const ratio = face("Sorcery", "Draw a card for each different power among creatures you control.");
    expect(ratio.effect).toEqual({
      kind: "draw",
      amount: { aggregate: "distinct", of: "power", filter: { type: "creature", controlledBy: "you" } },
    });
  });

  it("reads 'five or more mana values among cards in your graveyard', differently named lands, and Equipment on it", () => {
    const aven = face(
      "Creature — Bird Assassin",
      "As long as there are five or more mana values among cards in your graveyard, this creature gets +2/+2 and has deathtouch.",
    );
    expect(aven.static[0]).toMatchObject({
      grantPt: [2, 2],
      grantKeywords: ["deathtouch"],
      condition: {
        kind: "aggregate",
        value: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
        compare: { op: "gte", n: 5 },
      },
    });
    const amalgam = face(
      "Artifact Creature — Golem",
      "Test Distinct's power and toughness are each equal to the number of differently named lands you control.",
    );
    expect(amalgam.static[0].setBasePtFromCount).toEqual({
      countOf: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
      plusPower: 0,
      plusToughness: 0,
    });
    const gaveleer = face("Creature — Goblin Warrior", "This creature gets +2/+0 for each Equipment attached to it.");
    expect(gaveleer.static[0].grantPtPerCount).toEqual({
      filter: { subtype: "Equipment", attachedTo: { isSource: true } },
      pt: [2, 0],
    });
    expect(gaveleer.complete).toBe(true);
  });
});

describe("blocking restrictions and requirements on one creature", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Blocks", type_line, oracle_text }, { tokenFor: () => null });
  it("reads 'except by N or more creatures', on it or each creature you control with menace", () => {
    expect(face("Creature — Troll", "This creature can't be blocked except by three or more creatures.").static[0]).toEqual({
      affects: { scope: "self" },
      blockedByAtLeast: 3,
      text: "This creature can't be blocked except by three or more creatures.",
    });
    const howl = face("Creature — Human Warrior", "Each creature you control with menace can't be blocked except by three or more creatures.");
    expect(howl.static[0].affects).toEqual({ scope: "filter", filter: { type: "creature", controlledBy: "you", keyword: "menace" } });
  });

  it("reads 'can't be blocked as long as / unless defending player …' as unblockable on an of-player condition", () => {
    const defending = (condition: unknown) => ({ kind: "of-player", player: "defending-player", condition });
    const hazy = face("Creature — Homunculus", "This creature can't be blocked as long as defending player controls an untapped land.");
    expect(hazy.static[0].grantKeywords).toEqual(["unblockable"]);
    expect(hazy.static[0].condition).toEqual(defending({ kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 }));
    const ayesha = face("Creature — Human", "This creature can't be blocked as long as defending player controls three or more artifacts.");
    expect(ayesha.static[0].condition).toEqual(defending({ kind: "controls", filter: { type: "artifact" }, atLeast: 3 }));
    const ambusher = face("Creature — Mutant", "This creature can't be blocked as long as defending player has a rad counter.");
    expect(ambusher.static[0].condition).toEqual(defending({ kind: "player-counters", counter: "rad", who: "you", atLeast: 1 }));
    const grax = face(
      "Creature — Beast",
      "This creature can't be blocked unless defending player controls three or more creatures that share a creature type.",
    );
    expect(grax.static[0].condition).toEqual(
      defending({ kind: "not", of: { kind: "controls", filter: { type: "creature" }, atLeast: 3, sharingACreatureType: true } }),
    );
    const tromo = face("Legendary Creature — Kraken", "This creature can't be blocked unless all creatures defending player controls block it.");
    expect(tromo.static[0].blockedOnlyByAll).toBe(true);
  });

  it("reads 'blocks each combat if able', 'attacks or blocks', and 'can't block ~ this turn'", () => {
    expect(face("Artifact Creature — Wall", "This creature blocks each combat if able.").static[0].restrictions).toEqual(["must-block"]);
    expect(face("Artifact Creature — Golem", "This creature attacks or blocks each combat if able.").static[0].restrictions).toEqual([
      "must-attack",
      "must-block",
    ]);
    expect(parseSentence("Target creature can't block ~ this turn.", ctx())).toEqual({
      kind: "restrict",
      target: 0,
      restrictions: [],
      cantBlockAttacker: "source",
    });
  });

  it("reads 'assign its combat damage as though it weren't blocked', on it, an Aura's creature, or this turn", () => {
    expect(face("Creature — Elemental", "You may have this creature assign its combat damage as though it weren't blocked.").static[0]).toMatchObject({
      affects: { scope: "self" },
      assignAsThoughUnblocked: true,
    });
    expect(
      face("Enchantment — Aura", "Enchant creature\nEnchanted creature's controller may have it assign its combat damage as though it weren't blocked.").static[0],
    ).toMatchObject({ affects: { scope: "attached" }, assignAsThoughUnblocked: true });
    expect(parseSentence("You may have ~ assign its combat damage this turn as though it weren't blocked.", ctx())).toEqual({
      kind: "assign-as-though-unblocked",
      target: "source",
      optional: true,
    });
    expect(
      parseSentence("You may have creatures you control assign their combat damage this turn as though they weren't blocked.", ctx()),
    ).toEqual({ kind: "assign-as-though-unblocked", filter: { type: "creature", controlledBy: "you" }, optional: true });
  });
});

describe("removing counters in bulk (remove-counter's 'all', remove-counter-all)", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Remover", type_line, oracle_text }, { tokenFor: () => null });
  it("reads 'remove all counters from target permanent' and one kind's 'all' from it", () => {
    const hexmage = face("Creature — Vampire Shaman", "First strike\nSacrifice this creature: Remove all counters from target permanent.");
    expect(hexmage.activated[0].effect).toEqual({ kind: "remove-counter", target: 0, counter: "any", amount: "all" });
    const hound = face("Creature — Elemental Dog", "At the beginning of your end step, remove all +1/+1 counters from this creature.");
    expect(hound.triggered[0].effect).toEqual({ kind: "remove-counter", target: "source", counter: "+1/+1", amount: "all" });
  });

  it("reads 'remove all [kind] counters from all …' and 'remove N [kind] counters from each …'", () => {
    const stone = parseSentence("Remove all fate counters from all permanents.", ctx());
    expect(stone).toEqual({ kind: "remove-counter-all", filter: {}, counter: "fate", amount: "all" });
    expect(parseSentence("Remove all counters from all permanents.", ctx())).toEqual({
      kind: "remove-counter-all",
      filter: {},
      counter: "any",
      amount: "all",
    });
    expect(parseSentence("Remove two loyalty counters from each planeswalker.", ctx())).toEqual({
      kind: "remove-counter-all",
      filter: { type: "planeswalker" },
      counter: "loyalty",
      amount: 2,
    });
    expect(parseSentence("Remove a -1/-1 counter from each creature you control.", ctx())).toEqual({
      kind: "remove-counter-all",
      filter: { type: "creature", controlledBy: "you" },
      counter: "-1/-1",
      amount: 1,
    });
    const layer = face("Creature — Dwarf", "When this creature leaves the battlefield, remove all mine counters from all lands.");
    expect(layer.triggered[0].effect).toEqual({ kind: "remove-counter-all", filter: { type: "land" }, counter: "mine", amount: "all" });
  });
});

describe("can't-do effects for a duration (prohibit's regeneration and monarch)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  it("reads 'target creature can't be regenerated this turn', and 'it' after a targeted sentence", () => {
    expect(face("Hurr Jackal", "Creature — Jackal", "{T}: Target creature can't be regenerated this turn.").activated[0].effect).toEqual({
      kind: "prohibit",
      target: 0,
      regeneration: true,
    });
    const flames = face("Engulfing Flames", "Instant", "Engulfing Flames deals 1 damage to target creature. It can't be regenerated this turn.");
    expect(flames.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 1, target: 0 },
        { kind: "prohibit", target: 0, regeneration: true },
      ],
    });
  });

  it("reads 'creatures dealt damage this way can't be regenerated this turn' after the damage", () => {
    const flamebreak = face(
      "Flamebreak",
      "Sorcery",
      "Flamebreak deals 3 damage to each creature without flying and each player. Creatures dealt damage this way can't be regenerated this turn.",
    );
    expect(flamebreak.complete).toBe(true);
    expect(flamebreak.effect.effects[1]).toEqual({ kind: "prohibit", regeneration: true, dealtDamageThisWay: "creature" });
    const incinerate = face("Incinerate", "Instant", "Incinerate deals 3 damage to any target. A creature dealt damage this way can't be regenerated this turn.");
    expect(incinerate.effect.effects[1]).toEqual({ kind: "prohibit", regeneration: true, dealtDamageThisWay: "creature" });
  });

  it("reads Disintegrate's 'if it's a creature' pair as one conditional", () => {
    const disintegrate = face(
      "Disintegrate",
      "Sorcery",
      "Disintegrate deals X damage to any target. If it's a creature, it can't be regenerated this turn, and if it would die this turn, exile it instead.",
    );
    expect(disintegrate.effect.effects[1]).toEqual({
      kind: "conditional",
      condition: { kind: "target", index: 0, filter: { type: "creature" } },
      then: {
        kind: "sequence",
        effects: [
          { kind: "prohibit", target: 0, regeneration: true },
          { kind: "exile-if-dies-this-turn", target: 0 },
        ],
      },
    });
  });

  it("reads 'target opponent becomes the monarch' and 'you can't become the monarch this turn'", () => {
    const jared = face(
      "Jared Carthalion, True Heir",
      "Legendary Creature — Human Warrior",
      "When Jared Carthalion enters, target opponent becomes the monarch. You can't become the monarch this turn.",
    );
    expect(jared.triggered[0].targets).toEqual(["opponent"]);
    expect(jared.triggered[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "become-monarch", who: 0 },
        { kind: "prohibit", who: "you", monarch: true },
      ],
    });
  });
});

describe("the turn history's graveyard tallies (discarded, to-graveyard)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  it("reads 'draw a card for each card you've discarded this turn', after a discard or alone", () => {
    const change = face("Change of Fortune", "Sorcery", "Discard your hand, then draw a card for each card you've discarded this turn.");
    expect(change.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "discard-hand", who: "you" },
        { kind: "draw", amount: { turnHistory: "discarded" } },
      ],
    });
    expect(parseSentence("Then draw a card for each card you've discarded this turn.", ctx())).toEqual({
      kind: "draw",
      amount: { turnHistory: "discarded" },
    });
  });

  it("reads 'cards put into target player's graveyard from their library this turn'", () => {
    const cruel = face(
      "Cruel Calculations",
      "Sorcery",
      "Draw X cards, where X is the number of cards that were put into target player's graveyard from their library this turn.",
    );
    expect(cruel.complete).toBe(true);
    expect(cruel.effect).toEqual({ kind: "draw", amount: { turnHistory: "to-graveyard", target: 0, from: ["library"] } });
  });

  it("reads 'if you've discarded a card this turn' as an activation restriction and a spell's condition", () => {
    const prowler = face(
      "Gilt-Blade Prowler",
      "Creature — Human Rogue",
      "{1}, {T}, Pay 1 life: Draw a card. Activate only if you've discarded a card this turn.",
    );
    expect(prowler.activated[0].condition).toEqual({ kind: "turn-history", what: "discarded" });
    const recalibrate = face(
      "Recalibrate",
      "Instant",
      "Return target creature to its owner's hand. If you've discarded a card this turn, draw a card.",
    );
    expect(recalibrate.effect.effects[1]).toEqual({
      kind: "conditional",
      condition: { kind: "turn-history", what: "discarded" },
      then: { kind: "draw", amount: 1 },
    });
  });

  it("reads 'put into a graveyard from the battlefield this turn' and 'from anywhere other than the battlefield' intervening ifs", () => {
    const shade = face(
      "Ichor Shade",
      "Creature — Phyrexian Shade",
      "At the beginning of your end step, if an artifact or creature was put into a graveyard from the battlefield this turn, put a +1/+1 counter on this creature.",
    );
    expect(shade.triggered[0].condition).toEqual({
      kind: "turn-history",
      what: "to-graveyard",
      who: "any-player",
      from: ["battlefield"],
      filter: { typesAnyOf: ["artifact", "creature"] },
    });
    const strand = face(
      "Dimir Strandcatcher",
      "Creature — Faerie Rogue",
      "At the beginning of each end step, if three or more cards were put into your graveyard from anywhere other than the battlefield this turn, draw a card.",
    );
    expect(strand.triggered[0].condition).toEqual({ kind: "turn-history", what: "to-graveyard", notFrom: ["battlefield"], atLeast: 3 });
  });

  it("reads 'all cards in your graveyard that you cycled or discarded this turn'", () => {
    const shadow = face("Shadow of the Grave", "Instant", "Return to your hand all cards in your graveyard that you cycled or discarded this turn.");
    expect(shadow.effect).toEqual({ kind: "return-from-graveyard", filter: { discardedThisTurn: true }, destination: "hand", count: "all" });
  });
});

describe("choices by other players: among the targets, an opponent's targets, an opponent's mode", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  const sacrifice = { effect: { kind: "sacrifice-target", target: 0, byItsController: true } };

  it("reads 'their controller chooses and sacrifices one of them' as a choice among the targets", () => {
    const spite = face(
      "Barrin's Spite",
      "Sorcery",
      "Choose two target creatures controlled by the same player. Their controller chooses and sacrifices one of them. Return the other to its owner's hand.",
    );
    expect(spite.targets).toEqual(["creature", { kind: "other", of: "creature", than: { slot: 0 }, sameController: true }]);
    expect(spite.effect).toEqual({ kind: "choose-among-targets", chooser: "their-controller", count: 1, chosen: sacrifice, rest: "hand" });
    const incriminate = face(
      "Incriminate",
      "Sorcery",
      "Choose two target creatures controlled by the same player. That player sacrifices one of them of their choice.",
    );
    expect(incriminate.effect).toEqual({ kind: "choose-among-targets", chooser: "their-controller", count: 1, chosen: sacrifice });
    const retribution = face(
      "Retribution",
      "Sorcery",
      "Choose two target creatures controlled by the same opponent. That player chooses and sacrifices one of those creatures. Put a -1/-1 counter on the other.",
    );
    expect(retribution.targets?.[0]).toBe("creature-an-opponent-controls");
    expect(retribution.effect).toMatchObject({ rest: { effect: { kind: "add-counter", counter: "-1/-1", amount: 1 } } });
  });

  it("reads 'target creature of an opponent's choice they control' as that slot an opponent's to choose", () => {
    const evangelize = face("Evangelize", "Sorcery", "Gain control of target creature of an opponent's choice they control.");
    expect(evangelize.targets).toEqual([{ kind: "permanent", filter: { type: "creature", controlledBy: "chooser" } }]);
    expect(evangelize.opponentChoosesTargets).toEqual([0]);
    expect(evangelize.effect).toEqual({ kind: "gain-control", target: 0, untilEndOfTurn: false });
    // Without the choice, an ordinary target.
    const plain = face("Act of Treason", "Sorcery", "Gain control of target creature until end of turn.");
    expect(plain.opponentChoosesTargets).toBeUndefined();
    expect(plain.effect).toEqual({ kind: "gain-control", target: 0, untilEndOfTurn: true });
  });

  it("reads 'An opponent chooses one —' as modes an opponent chooses, never with targets", () => {
    const theirs = face("Their Choice", "Sorcery", "An opponent chooses one —\n• You draw three cards.\n• You gain 3 life.");
    expect(theirs.castModal).toEqual({
      minModes: 1,
      maxModes: 1,
      chosenBy: "opponent",
      modes: [
        { text: "You draw three cards.", effect: { kind: "draw", amount: 3 } },
        { text: "You gain 3 life.", effect: { kind: "gain-life", amount: 3 } },
      ],
    });
    const fatal = face(
      "Fatal Lore",
      "Sorcery",
      "An opponent chooses one —\n• You draw three cards.\n• You destroy up to two target creatures that player controls. They can't be regenerated. That player draws up to three cards.",
    );
    expect(fatal.castModal).toBeUndefined();
  });
});

describe("loyalty costs", () => {
  it("reads a −X cost as `\"-x\"`, its X the effect's, and leaves a +X one a TODO", () => {
    const face = parseFace(
      {
        name: "Chandra Nalaar",
        type_line: "Legendary Planeswalker — Chandra",
        loyalty: "6",
        oracle_text:
          "+1: Chandra Nalaar deals 1 damage to target player or planeswalker.\n−X: Chandra Nalaar deals X damage to target creature.\n+X: Draw X cards.",
      },
      { tokenFor: () => null },
    );
    expect(face.activated[1]).toMatchObject({
      loyaltyCost: "-x",
      targets: ["creature"],
      effect: { kind: "damage", amount: "x", target: 0 },
    });
    expect(face.activated[1].__todo).toBeUndefined();
    // The engine has no "+X" cost.
    expect(face.activated[2].__todo).toEqual(["a +X loyalty cost"]);
  });
});

describe("meld (rule 701.42)", () => {
  it("reads a meld trigger's intervening if as `meld-ready` and its instruction whole as `meld`", () => {
    const gisela = parseFace(
      {
        name: "Gisela, the Broken Blade",
        type_line: "Legendary Creature — Angel Horror",
        oracle_text:
          "Flying, first strike, lifelink\nAt the beginning of your end step, if you both own and control Gisela and a creature named Bruna, the Fading Light, exile them, then meld them into Brisela, Voice of Nightmares.",
      },
      { tokenFor: () => null },
    );
    const partner = { name: "Bruna, the Fading Light", type: "creature" };
    expect(gisela.triggered[0]).toMatchObject({
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "meld-ready", partner },
      effect: { kind: "meld", partner, into: "Brisela, Voice of Nightmares" },
    });
    expect(gisela.triggered[0].__todo).toBeUndefined();
  });

  it("reads an activated meld, keeping a back face named after the card itself", () => {
    const urza = parseFace(
      {
        name: "Urza, Lord Protector",
        type_line: "Legendary Creature — Human Artificer",
        oracle_text:
          "{7}: If you both own and control Urza, Lord Protector and an artifact named The Mightstone and Weakstone, exile them, then meld them into Urza, Planeswalker. Activate only as a sorcery.",
      },
      { tokenFor: () => null },
    );
    expect(urza.activated[0].effect).toEqual({
      kind: "meld",
      partner: { name: "The Mightstone and Weakstone", type: "artifact" },
      into: "Urza, Planeswalker",
    });
  });
});

describe("counters of chosen kinds removed (remove-counters, a target's orPlayer)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  it("reads 'remove up to N counters from target …, or opponent' with the slot taking a player", () => {
    const price = face("Price of Betrayal", "Sorcery", "Remove up to five counters from target artifact, creature, planeswalker, or opponent.");
    expect(price.targets).toEqual([
      { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "planeswalker"] }, orPlayer: "opponent" },
    ]);
    expect(price.effect).toEqual({ kind: "remove-counters", target: 0, counter: "any", count: 5, upTo: true });
  });

  it("reads 'a counter', 'any number of counters', 'you may remove a counter' and 'up to N [kind]'", () => {
    expect(parseSentence("Remove a counter from target nonland permanent.", ctx())).toMatchObject({
      kind: "remove-counters",
      counter: "any",
      count: 1,
    });
    expect(parseSentence("Remove any number of counters from target creature you control.", ctx())).toMatchObject({
      kind: "remove-counters",
      counter: "any",
      count: "any",
    });
    expect(parseSentence("You may remove a counter from target permanent.", ctx())).toMatchObject({
      kind: "remove-counters",
      counter: "any",
      count: 1,
      upTo: true,
    });
    expect(parseSentence("Remove up to four charge counters from target noncreature artifact.", ctx())).toMatchObject({
      kind: "remove-counters",
      counter: "charge",
      count: 4,
      upTo: true,
    });
    // A "may" over more than one is all or none — a `may` around exactly
    // two — and one named kind a fixed number has nothing to choose.
    expect(parseSentence("You may remove two counters from target permanent.", ctx())).toMatchObject({
      kind: "may",
      effect: { kind: "remove-counters", counter: "any", count: 2 },
    });
    expect(parseSentence("You may remove two counters from target permanent.", ctx()).effect.upTo).toBeUndefined();
    expect(parseSentence("Remove a +1/+1 counter from target creature.", ctx())?.kind).not.toBe("remove-counters");
  });

  it("reads Hex Parasite's 'up to X' and its pump by the counters removed this way", () => {
    const hex = face(
      "Hex Parasite",
      "Artifact Creature — Phyrexian Insect",
      "{X}{B/P}: Remove up to X counters from target permanent. For each counter removed this way, this creature gets +1/+0 until end of turn.",
    );
    expect(hex.activated[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "remove-counters", target: 0, counter: "any", count: "x", upTo: true },
        { kind: "modify-pt", target: "source", power: { thisWay: "counters-removed" }, toughness: 0, duration: "end-of-turn" },
      ],
    });
  });

  it("reads Eventide's Shadow's 'from among permanents on the battlefield' as anyone's", () => {
    const shadow = face(
      "Eventide's Shadow",
      "Sorcery",
      "Remove any number of counters from among permanents on the battlefield. You draw cards and lose life equal to the number of counters removed this way.",
    );
    expect(shadow.complete).toBe(true);
    expect(JSON.stringify(shadow.effect)).toContain('"anyController":true');
    expect(JSON.stringify(shadow.effect)).toContain('"kind":"lose-life","amount":{"thisWay":"counters-removed"}');
  });
});

describe("energy paid in an amount the player chooses (costEnergyX)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'you get {E}' as get-energy", () => {
    expect(parseSentence("You get {E}{E}.", ctx())).toEqual({ kind: "get-energy", amount: 2 });
  });

  it("reads Harnessed Lightning's 'any amount of {E}' and 'that much damage to that creature'", () => {
    const lightning = face(
      "Harnessed Lightning",
      "Instant",
      "Choose target creature. You get {E}{E}{E} (three energy counters), then you may pay any amount of {E}. Harnessed Lightning deals that much damage to that creature.",
    );
    expect(lightning.complete).toBe(true);
    expect(lightning.targets).toEqual(["creature"]);
    expect(lightning.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "get-energy", amount: 3 },
        { kind: "may", prompt: "Pay any amount of {E}?", costEnergyX: "any", effect: { kind: "damage", amount: "x", target: 0 } },
      ],
    });
  });

  it("reads Die Young's '-1/-1 … for each {E} paid this way' as -X/-X", () => {
    const die = face(
      "Die Young",
      "Sorcery",
      "Choose target creature. You get {E}{E} (two energy counters), then you may pay any amount of {E}. The creature gets -1/-1 until end of turn for each {E} paid this way.",
    );
    expect(die.complete).toBe(true);
    expect(JSON.stringify(die.effect)).toContain('"power":{"product":["x",-1]}');
  });

  it("reads 'one or more {E}. If you do, …' and leaves one with no 'if you do', or 'when you do', alone", () => {
    const more = face(
      "Test Energy",
      "Creature — Snake",
      "When this creature enters, you get {E}{E}. Then you may pay one or more {E}. If you do, put that many +1/+1 counters on this creature.",
    );
    expect(more.triggered[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "get-energy", amount: 2 },
        {
          kind: "may",
          prompt: "Pay one or more {E}?",
          costEnergyX: "one-or-more",
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
        },
      ],
    });
    const reflexive = face(
      "Territorial Aetherkite",
      "Creature — Cat Dragon",
      "When this creature enters, you get {E}{E}. Then you may pay one or more {E}. When you do, this creature deals that much damage to each other creature.",
    );
    expect(reflexive.triggered[0].effect).toBeNull();
  });
});

describe("a spell's own conditional flash (flashIf)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a condition on what its caster controls or has in their graveyard", () => {
    expect(
      face("Bard's Company", "Creature — Human Citizen", "You may cast this spell as though it had flash if you control a Human.").flashIf,
    ).toEqual({ condition: { kind: "controls", filter: { subtype: "Human" }, atLeast: 1 } });
    expect(
      face(
        "Hungering Yeti",
        "Creature — Yeti",
        "As long as you control a green or blue permanent, you may cast this spell as though it had flash. (You may cast it any time you could cast an instant.)",
      ).flashIf,
    ).toEqual({ condition: { kind: "controls", filter: { anyOf: [{ colors: ["G"] }, { colors: ["U"] }] }, atLeast: 1 } });
    expect(
      face(
        "Swift Reckoning",
        "Sorcery",
        "Spell mastery — If there are two or more instant and/or sorcery cards in your graveyard, you may cast this spell as though it had flash. (You may cast it any time you could cast an instant.)\nDestroy target tapped creature.",
      ).flashIf,
    ).toEqual({ condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } } });
    expect(
      face("Crashing Tide", "Sorcery", "This spell has flash as long as you control a Merfolk.\nReturn target creature to its owner's hand.\nDraw a card.").flashIf,
    ).toEqual({ condition: { kind: "controls", filter: { subtype: "Merfolk" }, atLeast: 1 } });
  });

  it("reads a condition on its targets", () => {
    expect(
      face("Flash Photography", "Sorcery", "You may cast this spell as though it had flash if it targets a permanent you control.").flashIf,
    ).toEqual({ targets: { controlledBy: "you" } });
    expect(
      face("Timely Ward", "Enchantment — Aura", "You may cast this spell as though it had flash if it targets a commander.").flashIf,
    ).toEqual({ targets: { isCommander: true } });
  });

  it("leaves a permanent's own 'has flash as long as' to a person: that's its keyword on the battlefield too", () => {
    const wurm = face("Colossal Rattlewurm", "Creature — Wurm", "Colossal Rattlewurm has flash as long as you control a Desert.");
    expect(wurm.flashIf).toBeUndefined();
    expect(wurm.complete).toBe(false);
  });
});

describe("has all activated abilities of … (grantsActivatedOf)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  it("reads graveyard cards, all or your own", () => {
    const ooze = face(
      "Necrotic Ooze",
      "Creature — Ooze",
      "As long as Necrotic Ooze is on the battlefield, it has all activated abilities of all creature cards in all graveyards.",
    );
    expect(ooze.static[0].grantsActivatedOf).toEqual({ zone: "graveyard", filter: { type: "creature" } });
    expect(ooze.complete).toBe(true);
    const thranduil = face(
      "Thranduil, the Elvenking",
      "Legendary Creature — Elf Noble",
      "Thranduil has all activated abilities of all Elf cards in your graveyard.",
    );
    expect(thranduil.static[0].grantsActivatedOf).toEqual({ zone: "graveyard", filter: { subtype: "Elf", ownedBy: "you" } });
  });

  it("reads other permanents: counters, controller, a different name, mana and loyalty exceptions", () => {
    expect(
      face("Experiment Kraj", "Legendary Creature — Ooze Mutant", "Experiment Kraj has all activated abilities of each other creature with a +1/+1 counter on it.")
        .static[0].grantsActivatedOf,
    ).toEqual({ zone: "battlefield", filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } });
    expect(
      face(
        "Marvin, Murderous Mimic",
        "Legendary Artifact Creature — Toy",
        "Marvin has all activated abilities of creatures you control that don't have the same name as this creature.",
      ).static[0].grantsActivatedOf,
    ).toEqual({ zone: "battlefield", filter: { type: "creature", controlledBy: "you", sameNameAsSource: false } });
    expect(
      face(
        "Sharkey, Tyrant of the Shire",
        "Legendary Creature — Avatar Rogue",
        "Sharkey has all activated abilities of lands your opponents control except mana abilities.\nMana of any type can be spent to activate Sharkey's abilities.",
      ).static,
    ).toMatchObject([
      { grantsActivatedOf: { zone: "battlefield", filter: { type: "land", controlledBy: "opponent" }, except: "mana" } },
      { spendManaAs: { as: "any-type", activating: "this" } },
    ]);
    expect(
      face("Nicol Bolas, Dragon-God", "Legendary Planeswalker — Bolas", "Nicol Bolas has all loyalty abilities of all other planeswalkers on the battlefield.")
        .static[0].grantsActivatedOf,
    ).toEqual({ zone: "battlefield", filter: { type: "planeswalker" }, only: "loyalty" });
  });

  it("reads the top card of the library", () => {
    const borrower = face(
      "Skill Borrower",
      "Artifact Creature — Human Wizard",
      "As long as the top card of your library is an artifact or creature card, this creature has all activated abilities of that card. (If any of the abilities use that card's name, use this creature's name instead.)",
    );
    expect(borrower.static[0].grantsActivatedOf).toEqual({ zone: "library-top", filter: { typesAnyOf: ["artifact", "creature"] } });
  });

  it("leaves an exiled card's or a chosen permanent's abilities to a person", () => {
    const fence = face(
      "Scheming Fence",
      "Creature — Human Citizen",
      "This creature has all activated abilities of the chosen permanent except for loyalty abilities.",
    );
    expect(fence.static).toHaveLength(0);
  });
});

describe("a value chosen as it enters, read by its other lines", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a chosen color: a target, a cast trigger and a source of your choice", () => {
    const paladin = face(
      "Pentarch Paladin",
      "Creature — Human Knight",
      "As this creature enters, choose a color.\n{W}{W}, {T}: Destroy target permanent of the chosen color.",
    );
    expect(paladin.chooseOnEnter).toEqual(["W", "U", "B", "R", "G"]);
    expect(paladin.activated[0].targets).toEqual([{ kind: "permanent", filter: { ofChosenColor: true } }]);
    expect(parseTrigger("Whenever a player casts a spell of the chosen color")).toEqual([
      { on: "cast-spell", who: "any", filter: { ofChosenColor: true } },
    ]);
    expect(parseTrigger("Whenever you cast a creature spell of the chosen type")).toEqual([
      { on: "cast-spell", who: "you", filter: { type: "creature", ofChosenType: true } },
    ]);
    const circle = face(
      "Story Circle",
      "Enchantment",
      "As this enchantment enters, choose a color.\n{W}: The next time a source of your choice of the chosen color would deal damage to you this turn, prevent that damage.",
    );
    expect(circle.activated[0].effect).toEqual({
      kind: "prevent-damage-from-chosen-source",
      filter: { ofChosenColor: true },
      to: "you",
      amount: "next-time",
    });
  });

  it("reads a chosen card type and name as a player's protection", () => {
    const emissary = face(
      "Serra's Emissary",
      "Creature — Angel",
      "Flying\nAs this creature enters, choose a card type.\nYou and creatures you control have protection from the chosen card type.",
    );
    expect(emissary.chooseOnEnter).toContain("instant");
    expect(emissary.static).toMatchObject([
      { affects: { scope: "creatures-you-control" }, protection: { chosenCardType: true } },
      { affects: { scope: "self" }, playerProtection: { chosenCardType: true } },
    ]);
    const halo = face(
      "Runed Halo",
      "Enchantment",
      "As this enchantment enters, choose a card name.\nYou have protection from the chosen card name. (You can't be targeted, dealt damage, or enchanted by anything with that name.)",
    );
    expect(halo.static).toMatchObject([{ playerProtection: { filter: { chosenName: true } } }]);
    // Without a card type chosen, the line is a person's.
    expect(face("Not A Card", "Enchantment", "You have protection from the chosen card type.").static).toHaveLength(0);
  });

  it("reads a chosen creature type in a lord, an entering replacement and a trigger doubler", () => {
    expect(
      face("Patchwork Banner", "Artifact", "As this artifact enters, choose a creature type.\nCreatures you control of the chosen type get +1/+1.")
        .static[0],
    ).toMatchObject({ affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", ofChosenType: true } }, grantPt: [1, 1] });
    const mimic = face(
      "Metallic Mimic",
      "Artifact Creature — Shapeshifter",
      "As this creature enters, choose a creature type.\nThis creature is the chosen type in addition to its other types.\nEach other creature you control of the chosen type enters with an additional +1/+1 counter on it.",
    );
    expect(mimic.static[1].replacement).toEqual({
      event: "others-enter-battlefield",
      filter: { type: "creature", controlledBy: "you", ofChosenType: true },
      counters: { kind: "+1/+1", amount: 1 },
    });
    const throne = face(
      "Roaming Throne",
      "Artifact Creature — Golem",
      "As this creature enters, choose a creature type.\nIf a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time.",
    );
    expect(throne.static[0].doubleTriggersOf).toEqual({
      filter: { type: "creature", controlledBy: "you", ofChosenType: true },
      others: true,
    });
  });
});

describe("an aggregate over a set, as a static's X", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a graveyard's greatest power and other permanents' greatest mana value", () => {
    expect(
      face("Carrion Grub", "Creature — Insect", "This creature gets +X/+0, where X is the greatest power among creature cards in your graveyard.")
        .static[0].grantPtPerCount,
    ).toEqual({
      aggregate: { aggregate: "max", of: "power", filter: { type: "creature", ownedBy: "you" }, in: "graveyards" },
      pt: [1, 0],
    });
    expect(
      face("Emissary Escort", "Artifact Creature — Robot Soldier", "This creature gets +X/+0, where X is the greatest mana value among other artifacts you control.")
        .static[0].grantPtPerCount,
    ).toEqual({
      aggregate: { aggregate: "max", of: "mana-value", filter: { type: "artifact", controlledBy: "you" }, excludeSelf: true },
      pt: [1, 0],
    });
  });

  it("reads a union of the battlefield and a graveyard, a graveyard total and a count over exile", () => {
    expect(
      face(
        "Ambitious Dragonborn",
        "Creature — Dragon Barbarian",
        "This creature enters with X +1/+1 counters on it, where X is the greatest power among creatures you control and creature cards in your graveyard.",
      ).static[0].replacement,
    ).toEqual({
      event: "enters-battlefield",
      counters: {
        kind: "+1/+1",
        amount: {
          aggregate: "max",
          of: "power",
          filter: { type: "creature", controlledBy: "you" },
          plus: [{ filter: { type: "creature", ownedBy: "you" }, in: "graveyards" }],
        },
      },
    });
    expect(
      face(
        "Inferno Project",
        "Creature — Elemental",
        "This creature enters with X +1/+1 counters on it, where X is the total mana value of instant and sorcery cards in your graveyard.",
      ).static[0].replacement.counters.amount,
    ).toEqual({ aggregate: "sum", of: "mana-value", filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" }, in: "graveyards" });
    expect(
      face(
        "Crackling Drake",
        "Creature — Drake",
        "Crackling Drake's power is equal to the total number of instant and sorcery cards you own in exile and in your graveyard.",
      ).static[0].setBasePtFromCount,
    ).toEqual({
      countOf: { aggregate: "count", filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" }, in: ["graveyards", "exile"] },
      plusPower: 0,
      plusToughness: 0,
      only: "power",
    });
    // A plain battlefield count is `countOf`'s, not a CDA aggregate's.
    expect(face("Not A Card", "Creature — Drake", "This creature's power is equal to the greatest power among creatures you control.").static).toHaveLength(0);
  });
});

describe("damage divided as you choose (rule 601.2d), its total fixed or read as it's announced", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a spell's fixed total, capping the group as authored", () => {
    const p = face("Arc Lightning", "Sorcery", "Arc Lightning deals 3 damage divided as you choose among one, two, or three targets.");
    expect(p.targets).toEqual([{ kind: "any-number", of: "any-target", min: 1, max: 3 }]);
    expect(p.divided).toEqual({ total: 3, slot: 0 });
    expect(p.effect).toEqual({ kind: "damage-divided", from: 0 });
  });

  it("reads a spell's count or aggregate total, the group uncapped", () => {
    const wind = face(
      "Volcanic Wind",
      "Sorcery",
      "Volcanic Wind deals X damage divided as you choose among any number of target creatures, where X is the number of creatures on the battlefield as you cast this spell.",
    );
    expect(wind.targets).toEqual([{ kind: "any-number", of: "creature" }]);
    expect(wind.divided).toEqual({ total: { countOf: { type: "creature" } }, slot: 0 });
    expect(
      face(
        "Monstrous Onslaught",
        "Sorcery",
        "Monstrous Onslaught deals X damage divided as you choose among any number of target creatures, where X is the greatest power among creatures you control as you cast this spell.",
      ).divided,
    ).toEqual({ total: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } }, slot: 0 });
  });

  it("reads a trigger's and an activation's totals: lands, its power, counters on it, greatest power", () => {
    const ureni = face(
      "Ureni, the Song Unending",
      "Legendary Creature — Spirit Dragon",
      "When Ureni enters, it deals X damage divided as you choose among any number of target creatures and/or planeswalkers your opponents control, where X is the number of lands you control.",
    ).triggered[0];
    expect(ureni.targets).toEqual([
      { kind: "any-number", of: { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
    ]);
    expect(ureni.divided).toEqual({ total: { countOf: { type: "land", controlledBy: "you" } }, slot: 0 });
    expect(
      face(
        "Orca, Siege Demon",
        "Legendary Creature — Demon",
        "When Orca dies, it deals damage equal to its power divided as you choose among any number of targets.",
      ).triggered[0].divided,
    ).toEqual({ total: { powerOf: "source" }, slot: 0 });
    expect(
      face(
        "Magmatic Core",
        "Enchantment",
        "At the beginning of your end step, this enchantment deals X damage divided as you choose among any number of target creatures, where X is the number of age counters on it.",
      ).triggered[0].divided,
    ).toEqual({ total: { countersOn: "source", counter: "age" }, slot: 0 });
    const lukka = parseFace(
      {
        name: "Lukka, Bound to Ruin",
        type_line: "Legendary Planeswalker — Lukka",
        loyalty: "5",
        oracle_text:
          "−4: Lukka deals X damage divided as you choose among any number of target creatures and/or planeswalkers, where X is the greatest power among creatures you control as you activate this ability.",
      },
      { tokenFor: () => null },
    ).activated[0];
    expect(lukka.divided).toEqual({
      total: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
      slot: 0,
    });
  });

  it("leaves what it can't read whole: an X plus 1, an ability's bare X", () => {
    expect(face("Meteor Shower", "Sorcery", "Meteor Shower deals X plus 1 damage divided as you choose among any number of targets.").effect).toBeNull();
    const bare = face("Not A Card", "Creature — Elemental", "{T}: This creature deals X damage divided as you choose among any number of targets.");
    expect(bare.activated[0].effect).toBeNull();
    expect(bare.activated[0].divided).toBeUndefined();
  });
});

describe("face down by an effect (rule 708.2)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads turning face down, with the characteristics the next sentence lists", () => {
    const conversion = face("Cyber Conversion", "Instant", "Turn target creature face down. It's a 2/2 Cyberman artifact creature.");
    expect(conversion.complete).toBe(true);
    expect(conversion.effect).toEqual({ kind: "turn-face-down", target: 0, as: "2/2 Cyberman artifact creature" });
    expect(conversion.targets).toEqual(["creature"]);
    const wall = face("Wall of Deceit", "Creature — Wall", "{3}: Turn this creature face down.");
    expect(wall.activated[0].effect).toEqual({ kind: "turn-face-down", target: "source" });
    // A listing the engine has no definition for stays to author.
    expect(face("Test Horror", "Instant", "Turn target creature face down. It's a 2/2 Horror creature.").complete).toBe(false);
  });

  it("reads entering face down: a dying creature returned, cards from hand put", () => {
    const yedora = face(
      "Yedora, Grave Gardener",
      "Legendary Creature — Treefolk Druid",
      "Whenever another nontoken creature you control dies, you may return it to the battlefield face down under its owner's control. It's a Forest land. (It has no other types or abilities.)",
    );
    expect(yedora.triggered[0].effect).toEqual({
      kind: "may",
      prompt: "Return it to the battlefield face down under its owner's control?",
      effect: { kind: "put-onto-battlefield", target: "trigger-object", faceDown: "Forest land" },
    });
    const tezzeret = parseEffect("Put any number of cards from your hand onto the battlefield face down. They're 5/5 artifact creatures.", ctx());
    expect(tezzeret.effect).toEqual({
      kind: "look-and-choose",
      zone: "hand",
      min: 0,
      max: 99,
      destination: "battlefield",
      leftover: "stay",
      enterAs: { faceDown: "5/5 artifact creature" },
    });
  });

  it("reads what a permanent put onto the battlefield is in addition to its own (enterAs)", () => {
    const rise = face(
      "Rise from the Grave",
      "Sorcery",
      "Put target creature card from a graveyard onto the battlefield under your control. That creature is a black Zombie in addition to its other colors and types.",
    );
    expect(rise.complete).toBe(true);
    expect(rise.effect).toEqual({
      kind: "put-onto-battlefield",
      target: 0,
      underYourControl: true,
      enterAs: { addColors: ["B"], addSubtypes: ["Zombie"] },
    });
    // Subtypes alone stay the field Portal to Phyrexia is authored with.
    expect(
      parseEffect(
        "Put target creature card from a graveyard onto the battlefield under your control. It's a Phyrexian in addition to its other types.",
        ctx(),
      ).effect,
    ).toEqual({ kind: "put-onto-battlefield", target: 0, underYourControl: true, addSubtypes: ["Phyrexian"] });
    expect(
      parseEffect(
        "Return target artifact card from your graveyard to the battlefield. It's a 4/4 Construct artifact creature with flying and haste in addition to its other types.",
        ctx(),
      ).effect,
    ).toEqual({
      kind: "put-onto-battlefield",
      target: 0,
      enterAs: { keywords: ["flying", "haste"], basePt: [4, 4], addSubtypes: ["Construct"], addTypes: ["artifact", "creature"] },
    });
    expect(
      parseEffect(
        "Return target creature card from your graveyard to the battlefield. If it's a creature, it's a Zombie in addition to its other creature types.",
        ctx(),
      ).effect,
    ).toEqual({ kind: "put-onto-battlefield", target: 0, enterAs: { addSubtypes: ["Zombie"], ifCreature: true } });
    // Half-read descriptions stay to author: a P/T on something not made a
    // creature, a colour without "colors and", an unknown keyword.
    for (const second of [
      "It's a 3/3 Golem artifact in addition to its other types.",
      "It's black in addition to its other types.",
      "It's a 1/1 Spirit creature with shmoofing in addition to its other types.",
    ]) {
      expect(parseEffect(`Return target artifact card from your graveyard to the battlefield. ${second}`, ctx()).effect).toBeNull();
    }
  });

  it("reads copying a spell, with the copy's exceptions and new targets", () => {
    const major = face(
      "Double Major",
      "Instant",
      "Copy target creature spell you control, except it isn't legendary if the spell is legendary. (A copy of a creature spell becomes a token.)",
    );
    expect(major.complete).toBe(true);
    expect(major.effect).toEqual({ kind: "copy-spell", target: 0, except: { notLegendary: true } });
    expect(major.targets).toEqual([{ kind: "spell", whose: "you", filter: { type: "creature" } }]);
    const twin = parseEffect("Copy target instant or sorcery spell. You may choose new targets for the copy.", ctx());
    expect(twin.effect).toEqual({ kind: "copy-spell", target: 0, newTargets: true });
    // In a cast trigger, "it" is the spell cast.
    const toy = face(
      "Test Toymaker",
      "Legendary Creature — Human Artificer",
      "Whenever you cast a creature spell, you may copy it, except the copy is a 1/1 Spirit artifact in addition to its other types.",
    );
    expect(toy.triggered[0].effect).toMatchObject({
      kind: "may",
      effect: { kind: "copy-spell", target: "trigger-spell", except: { basePt: [1, 1], addSubtypes: ["Spirit"], addTypes: ["artifact"] } },
    });
    // Outside a cast trigger "copy it" isn't the spell; an exception it
    // doesn't read stays to author.
    expect(parseEffect("Copy it.", ctx()).effect).toBeNull();
    expect(parseEffect("Copy target creature spell you control, except it has haste.", ctx()).effect).toBeNull();
  });

  it("reads manifest from another player's library, and can't be turned face up", () => {
    const amalgam = face(
      "Thieving Amalgam",
      "Creature — Ape Snake",
      "At the beginning of each opponent's upkeep, you manifest the top card of that player's library.",
    );
    expect(amalgam.triggered[0].effect).toEqual({ kind: "manifest", who: "you", from: "active-player" });
    const scream = face(
      "Unable to Scream",
      "Enchantment — Aura",
      "Enchant creature\nAs long as enchanted creature is face down, it can't be turned face up.",
    );
    expect(scream.static[0]).toMatchObject({ affects: { scope: "attached" }, restrictions: ["cant-turn-face-up"] });
    const watchdog = face("Karlov Watchdog", "Creature — Dog", "Permanents your opponents control can't be turned face up during your turn.");
    expect(watchdog.static[0]).toMatchObject({
      affects: { scope: "filter", filter: { controlledBy: "opponent" } },
      restrictions: ["cant-turn-face-up"],
      condition: { kind: "your-turn" },
    });
  });
});

describe("cost changes for one kind of ability (rule 602.2b)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  const mod = (name: string, type_line: string, oracle_text: string) => face(name, type_line, oracle_text).static[0]?.abilityCostModification;

  it("reads equip, exhaust and cycling reductions, with who activates and whose abilities", () => {
    expect(mod("Bureau Test", "Creature — Human", "Equip abilities you activate cost {1} less to activate.")).toEqual({
      applies: {},
      abilityKind: "equip",
      byYou: true,
      reduceGeneric: 1,
    });
    expect(mod("Dwarven Mauler", "Creature — Dwarf Warrior", "Equip abilities you activate that target this creature cost {2} less to activate.")).toEqual({
      applies: {},
      abilityKind: "equip",
      byYou: true,
      targetingSource: true,
      reduceGeneric: 2,
    });
    expect(mod("Whip Test", "Artifact — Equipment", "Equip abilities you activate of other Equipment cost {1} less to activate.")).toEqual({
      applies: { subtype: "Equipment", isSource: false },
      abilityKind: "equip",
      byYou: true,
      reduceGeneric: 1,
    });
    expect(mod("Auriok Steelshaper", "Creature — Human Soldier", "Equip costs you pay cost {1} less.")).toMatchObject({ abilityKind: "equip", byYou: true, reduceGeneric: 1 });
    expect(mod("Boom Scholar", "Creature — Goblin Advisor", "Exhaust abilities of other permanents you control cost {2} less to activate.")).toEqual({
      applies: { controlledBy: "you", isSource: false },
      abilityKind: "exhaust",
      reduceGeneric: 2,
    });
    expect(mod("Fluctuator", "Artifact", "Cycling abilities you activate cost {2} less to activate.")).toMatchObject({ abilityKind: "cycling", byYou: true, reduceGeneric: 2 });
    // "Equip costs you pay cost {1} more" isn't a line any card prints.
    expect(mod("Test", "Artifact", "Equip costs you pay cost {1} more.")).toBeUndefined();
  });

  it("reads loyalty abilities' mana tax and an added loyalty cost", () => {
    expect(mod("Eidolon of Obstruction", "Enchantment Creature — Spirit", "Loyalty abilities of planeswalkers your opponents control cost {1} more to activate.")).toEqual({
      applies: { type: "planeswalker", controlledBy: "opponent" },
      abilityKind: "loyalty",
      increaseGeneric: 1,
    });
    expect(mod("Carth Test", "Legendary Creature — Human Warrior", "Planeswalkers' loyalty abilities you activate cost an additional [+1] to activate.")).toEqual({
      applies: { type: "planeswalker" },
      abilityKind: "loyalty",
      byYou: true,
      increaseLoyalty: 1,
    });
  });
});

describe("each permanent of a kind deals damage (each-deals-damage)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads damage to itself, to a target, and to each opponent", () => {
    const blaze = face("Solar Blaze", "Sorcery", "Each creature deals damage to itself equal to its power.");
    expect(blaze.complete).toBe(true);
    expect(blaze.effect).toEqual({ kind: "each-deals-damage", filter: { type: "creature" }, amount: "its-power", to: "itself" });
    const war = face("Test War", "Sorcery", "Each tapped creature deals damage to itself equal to its power.");
    expect(war.effect).toMatchObject({ filter: { type: "creature", tapped: true }, to: "itself" });
    const bartz = face(
      "Bartz and Boko",
      "Legendary Creature — Human Bird",
      "When Bartz and Boko enters, each other Bird you control deals damage equal to its power to target creature an opponent controls.",
    );
    expect(bartz.triggered[0].effect).toEqual({
      kind: "each-deals-damage",
      filter: { type: "creature", subtype: "Bird", controlledBy: "you" },
      exceptSource: true,
      amount: "its-power",
      to: 0,
    });
    expect(bartz.triggered[0].targets).toEqual(["creature-an-opponent-controls"]);
    const lukka = face("Test Lukka", "Sorcery", "Each creature you control deals damage equal to its power to each opponent.");
    expect(lukka.effect).toMatchObject({ amount: "its-power", to: { who: "each-opponent" } });
    // A fixed amount: a noncreature Dragon deals it too, so no creature type is added.
    const dragons = face("Test Dragons", "Sorcery", "Each Dragon you control deals 1 damage to target creature.");
    expect(dragons.effect).toEqual({ kind: "each-deals-damage", filter: { subtype: "Dragon", controlledBy: "you" }, amount: 1, to: 0 });
    // Not a kind of permanent: left alone.
    expect(face("Test", "Sorcery", "Each opponent deals damage to itself equal to its power.").complete).toBe(false);
  });

  it("reads \"choose target …\" with the next sentence's \"that creature\"", () => {
    const hunt = face(
      "Moonlight Hunt",
      "Instant",
      "Choose target creature you don't control. Each creature you control that's a Wolf or a Werewolf deals damage equal to its power to that creature.",
    );
    expect(hunt.complete).toBe(true);
    expect(hunt.targets).toEqual(["creature-an-opponent-controls"]);
    expect(hunt.effect).toEqual({
      kind: "each-deals-damage",
      filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
      amount: "its-power",
      to: 0,
    });
  });
});

describe("a card's own graveyard permission with costs (castSelfFromGraveyard)", () => {
  const read = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null }).castSelfFromGraveyard;
  it("reads the costs, the alternative cost, the per-card increase and 'or from exile'", () => {
    expect(
      read(
        "Demonic Embrace",
        "Enchantment — Aura",
        "Enchant creature\nYou may cast this card from your graveyard by paying 3 life and discarding a card in addition to paying its other costs.",
      ),
    ).toEqual({ payLife: 3, discard: 1 });
    expect(
      read("Raffine's Guidance", "Enchantment — Aura", "Enchant creature\nYou may cast this card from your graveyard by paying {2}{W} rather than paying its mana cost."),
    ).toEqual({ mana: "{2}{W}" });
    expect(
      read(
        "Squee, Dubious Monarch",
        "Legendary Creature — Goblin Noble",
        "You may cast this card from your graveyard by paying {3}{R} and exiling four other cards from your graveyard rather than paying its mana cost.",
      ),
    ).toEqual({ mana: "{3}{R}", exileOthers: 4 });
    expect(
      read(
        "Helbrute",
        "Artifact Creature — Astartes Dreadnought",
        "Sarcophagus — You may cast this card from your graveyard by exiling another creature card from your graveyard in addition to paying its other costs.",
      ),
    ).toEqual({ exileOthers: 1, exileFilter: { type: "creature" } });
    expect(
      read(
        "Wickerfolk Indomitable",
        "Artifact Creature — Scarecrow",
        "You may cast this card from your graveyard by paying 2 life and sacrificing an artifact or creature in addition to paying its other costs.",
      ),
    ).toEqual({ payLife: 2, sacrifice: { typesAnyOf: ["artifact", "creature"] } });
    expect(
      read(
        "Risen Executioner",
        "Creature — Zombie Warrior",
        "You may cast this creature from your graveyard if you pay {1} more to cast it for each other creature card in your graveyard.",
      ),
    ).toEqual({ costIncreasePerOther: { type: "creature" } });
    expect(read("Squee, the Immortal", "Legendary Creature — Goblin", "You may cast this card from your graveyard or from exile.")).toEqual({
      fromExile: true,
    });
    // A count of sacrifices isn't a cost the permission can take.
    expect(
      read(
        "Scourge of Nel Toth",
        "Creature — Zombie Dragon",
        "You may cast this creature from your graveyard by paying {B}{B} and sacrificing two creatures rather than paying its mana cost.",
      ),
    ).toBeUndefined();
  });
});

describe("casting abilities given to the spells you cast (grantsToSpells)", () => {
  const statics = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null }).static;
  it("reads convoke, improvise and prowl for a kind of spell, and from exile", () => {
    expect(
      statics(
        "Chief Engineer",
        "Creature — Vedalken Artificer",
        "Artifact spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while casting an artifact spell pays for {1} or one mana of that creature's color.)",
      )[0]?.grantsToSpells,
    ).toEqual({ filter: { type: "artifact" }, convoke: true });
    expect(
      statics(
        "Inspiring Statuary",
        "Artifact",
        "Nonartifact spells you cast have improvise. (Your artifacts can help cast those spells. Each artifact you tap after you're done activating mana abilities pays for {1}.)",
      )[0]?.grantsToSpells,
    ).toEqual({ filter: { notTypes: ["artifact"] }, improvise: true });
    expect(
      statics("Hunting Velociraptor", "Creature — Dinosaur", "First strike\nDinosaur spells you cast have prowl {2}{R}.")[0]
        ?.grantsToSpells,
    ).toEqual({ filter: { subtype: "Dinosaur" }, prowl: "{2}{R}" });
    expect(statics("Test Broodlord", "Creature — Dragon", "Spells you cast from exile have convoke.")[0]?.grantsToSpells).toEqual({
      castFrom: ["exile"],
      convoke: true,
    });
  });
});

describe("one-shot grants to the next or first matching spell", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  const CASCADE = { trigger: { on: "this-cast" }, targets: [], effect: { kind: "cascade" }, resolve: null, text: "Cascade" };
  it("reads the next spell's cascade, convoke and can't-be-countered as a next grant-spells-this-turn", () => {
    const apostle = face(
      "Dark Apostle",
      "Creature — Astartes Warlock",
      "Gift of Chaos — {3}, {T}: The next noncreature spell you cast this turn has cascade.",
    );
    expect(apostle.activated?.[0]?.effect).toEqual({
      kind: "grant-spells-this-turn",
      next: true,
      filter: { notTypes: ["creature"] },
      triggered: [CASCADE],
    });
    expect(face("Wand of the Worldsoul", "Artifact", "{T}: The next spell you cast this turn has convoke.").activated?.[0]?.effect).toEqual({
      kind: "grant-spells-this-turn",
      next: true,
      convoke: true,
    });
    expect(
      face("Overmaster", "Sorcery", "The next instant or sorcery spell you cast this turn can't be countered.\nDraw a card.").effect,
    ).toEqual({
      kind: "sequence",
      effects: [
        { kind: "grant-spells-this-turn", next: true, filter: { typesAnyOf: ["instant", "sorcery"] }, cantBeCountered: true },
        { kind: "draw", amount: 1 },
      ],
    });
    expect(
      face(
        "Smoldering Stagecoach",
        "Artifact — Vehicle",
        "Whenever this Vehicle attacks, the next instant spell and the next sorcery spell you cast this turn each have cascade.",
      ).triggered?.[0]?.effect,
    ).toEqual({
      kind: "sequence",
      effects: [
        { kind: "grant-spells-this-turn", next: true, filter: { type: "instant" }, triggered: [CASCADE] },
        { kind: "grant-spells-this-turn", next: true, filter: { type: "sorcery" }, triggered: [CASCADE] },
      ],
    });
  });

  it("reads cascade for the first spell each turn, from exile or paid for with Treasure mana", () => {
    const grant = (name: string, text: string) => face(name, "Creature — Orc", text).static?.[0]?.grantsToSpells;
    expect(grant("Maelstrom Nexus", "The first spell you cast each turn has cascade.")).toEqual({ firstEachTurn: true, triggered: [CASCADE] });
    expect(grant("Wild-Magic Sorcerer", "The first spell you cast from exile each turn has cascade.")).toEqual({
      filter: { castFrom: "exile" },
      firstEachTurn: true,
      triggered: [CASCADE],
    });
    expect(
      grant("Rain of Riches", "The first spell you cast each turn that mana from a Treasure was spent to cast has cascade."),
    ).toEqual({ filter: { manaFrom: { subtype: "Treasure" } }, firstEachTurn: true, triggered: [CASCADE] });
  });
});

describe("kicker and entwine costs that aren't mana, and life per target", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  it("reads a kicker that returns or taps a permanent, and an entwine that sacrifices", () => {
    expect(face("Arctic Merfolk", "Creature — Merfolk", "Kicker—Return a creature you control to its owner's hand.").kicker).toEqual({
      cost: "",
      also: { text: "Return a creature you control to its owner's hand", returnToHand: { filter: { type: "creature" }, count: 1 } },
    });
    expect(face("Test Vampire", "Creature — Vampire", "Kicker—Tap an untapped Vampire you control.").kicker).toEqual({
      cost: "",
      also: { text: "Tap an untapped Vampire you control", tapUntapped: { filter: { subtype: "Vampire" }, count: 1 } },
    });
    expect(face("Betrayal of Flesh", "Instant", "Choose one —\n• Destroy target creature.\n• Return target creature card from your graveyard to the battlefield.\nEntwine—Sacrifice three lands.").kicker).toEqual({
      cost: "",
      keyword: "entwine",
      also: { text: "Sacrifice three lands", sacrifice: { filter: { type: "land" }, count: 3 } },
    });
    // A spell's kicker stays a person's: what kicking changes isn't read.
    expect(face("Vicious Offering", "Instant", "Kicker—Sacrifice a creature.\nTarget creature gets -2/-2 until end of turn.").kicker).toBeUndefined();
  });

  it("reads \"costs N life more to cast for each target\"", () => {
    expect(
      face("Phyrexian Purge", "Sorcery", "This spell costs 3 life more to cast for each target.\nDestroy any number of target creatures.").additionalCost,
    ).toEqual({ payLifePerTarget: 3 });
  });
});

describe("alternative costs paid from the hand: discard, exile for X, reveal", () => {
  const alt = (name: string, oracle_text: string) =>
    parseFace({ name, type_line: "Instant", oracle_text }, { tokenFor: () => null }).alternativeCost;
  it("reads a discard of a land-type card, and one more card", () => {
    expect(alt("Abolish", "You may discard a Plains card rather than pay this spell's mana cost.\nDestroy target artifact or enchantment.")).toEqual({
      mana: "{0}",
      discard: { filter: { subtype: "Plains" }, text: "a Plains card" },
    });
    expect(alt("Foil", "You may discard an Island card and another card rather than pay this spell's mana cost.\nCounter target spell.")).toEqual({
      mana: "{0}",
      discard: { filter: { subtype: "Island" }, others: 1, text: "an Island card and another card" },
    });
  });

  it("reads the Shoals' card with mana value X, and Land Grant's revealed hand", () => {
    expect(
      alt("Sickening Shoal", "You may exile a black card with mana value X from your hand rather than pay this spell's mana cost.\nTarget creature gets -X/-X until end of turn."),
    ).toEqual({ mana: "{0}", exileFromHand: { filter: { colors: ["B"] }, text: "a black card", manaValueX: true } });
    expect(
      alt("Land Grant", "If you have no land cards in hand, you may reveal your hand rather than pay this spell's mana cost.\nSearch your library for a Forest card, reveal that card, put it into your hand, then shuffle."),
    ).toEqual({ mana: "{0}", revealHand: true, condition: { kind: "hand-size", atMost: 0, filter: { type: "land" } } });
  });
});

describe("creatures in a blocking relation (blockingRelation)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  const relation = (rel: string, of?: string) => ({
    type: "creature",
    blockingRelation: { relation: rel, ...(of !== undefined ? { of } : {}) },
  });

  it("reads a target creature blocking, or blocked by, the source or its host", () => {
    const javelineer = face(
      "Goblin Javelineer",
      "Creature — Goblin Warrior",
      "Haste\nWhenever this creature becomes blocked, it deals 1 damage to target creature blocking it.",
    );
    expect(javelineer.complete).toBe(true);
    expect(javelineer.triggered[0].targets).toEqual([{ kind: "permanent", filter: relation("blocking") }]);
    expect(javelineer.triggered[0].effect).toEqual({ kind: "damage", amount: 1, target: 0 });
    // "It deals" on a permanent's own activated ability is its source.
    const tinder = face(
      "Tinder Wall",
      "Creature — Plant Wall",
      "Defender\nSacrifice this creature: Add {R}{R}.\n{R}, Sacrifice this creature: It deals 2 damage to target creature it's blocking.",
    );
    expect(tinder.complete).toBe(true);
    expect(tinder.activated[1].targets).toEqual([{ kind: "permanent", filter: relation("blocked-by") }]);
    expect(tinder.activated[1].effect).toEqual({ kind: "damage", amount: 2, target: 0 });
    const corpses = face(
      "Wall of Corpses",
      "Creature — Wall",
      "Defender\n{B}, Sacrifice this creature: Destroy target creature this creature is blocking.",
    );
    expect(corpses.activated[0].targets).toEqual([{ kind: "permanent", filter: relation("blocked-by") }]);
    const cromat = face("Test", "Creature — Illusion", "{W}{B}: Destroy target creature blocking or blocked by this creature.");
    expect(cromat.activated[0].targets).toEqual([{ kind: "permanent", filter: relation("either") }]);
    const host = face("Test", "Artifact — Equipment", "{1}: Tap target creature blocking equipped creature.");
    expect(host.activated[0].targets).toEqual([{ kind: "permanent", filter: relation("blocking", "host") }]);
  });

  it("reads each and all creatures in one, and the end of combat trigger", () => {
    const goblin = face(
      "Battle-Scarred Goblin",
      "Creature — Goblin Warrior",
      "Whenever this creature becomes blocked, it deals 1 damage to each creature blocking it.",
    );
    expect(goblin.complete).toBe(true);
    expect(goblin.triggered[0].effect).toEqual({ kind: "damage-all", amount: 1, filter: relation("blocking") });
    const beast = face(
      "Kjeldoran Frostbeast",
      "Creature — Elemental Beast",
      "At end of combat, destroy all creatures blocking or blocked by this creature.",
    );
    expect(beast.complete).toBe(true);
    expect(beast.triggered[0].trigger).toEqual({ on: "step-begins", step: "end-combat", who: "any" });
    expect(beast.triggered[0].effect).toEqual({ kind: "destroy-all", filter: relation("either") });
    const coils = face(
      "Coils of the Medusa",
      "Enchantment — Aura",
      "Enchant creature\nEnchanted creature gets +1/-1.\nSacrifice this Aura: Destroy all non-Wall creatures blocking enchanted creature.",
    );
    expect(coils.complete).toBe(true);
    expect(coils.activated[0].effect).toEqual({
      kind: "destroy-all",
      filter: { type: "creature", notSubtypes: ["Wall"], blockingRelation: { relation: "blocking", of: "host" } },
    });
    // An exile's link to the card's other abilities is a person's to read.
    const nets = face("Wall of Nets", "Creature — Wall", "Defender\nAt end of combat, exile all creatures blocked by this creature.");
    expect(nets.complete).toBe(false);
  });
});

describe("attack requirements narrowed (attack-requirement, rule 508.1d)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a target creature's requirement, aimed and timed", () => {
    const siren = face("Alluring Siren", "Creature — Siren", "{T}: Target creature an opponent controls attacks you this turn if able.");
    expect(siren.complete).toBe(true);
    expect(siren.activated[0].targets).toEqual(["creature-an-opponent-controls"]);
    expect(siren.activated[0].effect).toEqual({ kind: "attack-requirement", target: 0, attacks: "you", duration: "this-turn" });
    const sirens = face("Dulcet Sirens", "Creature — Siren", "{U}, {T}: Target creature attacks target opponent this turn if able.");
    expect(sirens.activated[0].targets).toEqual(["creature", "opponent"]);
    expect(sirens.activated[0].effect).toEqual({ kind: "attack-requirement", target: 0, attacks: 1, duration: "this-turn" });
    const behemoth = face(
      "Test",
      "Creature — Kraken",
      "Landfall — Whenever a land you control enters, target creature an opponent controls attacks during its controller's next combat phase if able.",
    );
    expect(behemoth.triggered[0].effect).toEqual({ kind: "attack-requirement", target: 0, duration: "controllers-next-combat" });
  });

  it("reads a target player's creatures' requirement, this turn or during their next", () => {
    const taunt = face("Taunt", "Sorcery", "During target player's next turn, creatures that player controls attack you if able.");
    expect(taunt.complete).toBe(true);
    expect(taunt.targets).toEqual(["player"]);
    expect(taunt.effect).toEqual({
      kind: "attack-requirement",
      filter: { type: "creature" },
      controlledByTarget: 0,
      attacks: "you",
      duration: "that-players-next-turn",
    });
    const threats = face("Test", "Instant", "Creatures target opponent controls attack this turn if able.");
    expect(threats.effect).toEqual({
      kind: "attack-requirement",
      filter: { type: "creature" },
      controlledByTarget: 0,
      duration: "this-turn",
    });
  });
});

describe("flash permissions (castAsThoughFlash for any player, first each turn, this turn, next spell)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads the statics: any player, a filter, the first spell each turn", () => {
    expect(face("Vernal Equinox", "Enchantment", "Any player may cast creature and enchantment spells as though they had flash.").static[0]).toEqual({
      affects: { scope: "self" },
      castAsThoughFlash: { typesAnyOf: ["creature", "enchantment"] },
      castAsThoughFlashAnyPlayer: true,
      text: "Any player may cast creature and enchantment spells as though they had flash.",
    });
    expect(face("Test Sliver", "Creature — Sliver", "Any player may cast Sliver spells as though they had flash.").static[0]).toMatchObject({
      castAsThoughFlash: { subtype: "Sliver" },
      castAsThoughFlashAnyPlayer: true,
    });
    const heliod = face("Test Heliod", "Enchantment", "You may cast spells as though they had flash.").static[0];
    expect(heliod.castAsThoughFlash).toBe(true);
    expect(heliod.castAsThoughFlashAnyPlayer).toBeUndefined();
    expect(
      face("The Blue Spirit", "Legendary Creature — Human Rogue Ally", "You may cast the first creature spell you cast each turn as though it had flash.").static[0],
    ).toMatchObject({ castAsThoughFlash: { type: "creature" }, castAsThoughFlashFirstEachTurn: true });
    // Not a spell phrase: left alone.
    expect(face("Test", "Enchantment", "Any player may cast blue and green spells as though they had flash.").static).toEqual([]);
  });

  it("reads this turn's permission and the next spell's", () => {
    const borne = face("Borne Upon a Wind", "Instant", "You may cast spells this turn as though they had flash.\nDraw a card.");
    expect(borne.complete).toBe(true);
    expect(borne.effect).toEqual({
      kind: "sequence",
      effects: [{ kind: "player-effect", duration: "end-of-turn", castAsThoughFlash: {} }, { kind: "draw", amount: 1 }],
    });
    expect(parseSentence("You may cast creature spells this turn as though they had flash.", ctx())).toEqual({
      kind: "player-effect",
      duration: "end-of-turn",
      castAsThoughFlash: { filter: { type: "creature" } },
    });
    expect(parseSentence("The next sorcery spell you cast this turn can be cast as though it had flash.", ctx())).toEqual({
      kind: "player-effect",
      duration: "end-of-turn",
      castAsThoughFlash: { filter: { type: "sorcery" }, next: true },
    });
    expect(parseSentence("The next spell of the chosen type you cast this turn can be cast as though it had flash.", ctx())).toEqual({
      kind: "player-effect",
      duration: "end-of-turn",
      castAsThoughFlash: { filter: { ofChosenType: true }, next: true },
    });
  });
});

describe("a library search's finds going card by card (search-library's instead)", () => {
  const spell = (name: string, type_line: string, oracle_text: string) => parseFace({ name, type_line, oracle_text });

  it("reads the split to the graveyard, the choice of hand or graveyard, and a destination read from the card", () => {
    const orders = spell(
      "Jarad's Orders",
      "Sorcery",
      "Search your library for up to two creature cards and reveal them. Put one into your hand and the other into your graveyard. Then shuffle.",
    );
    expect(orders.complete).toBe(true);
    expect(orders.effect).toEqual({
      kind: "search-library",
      filter: { type: "creature" },
      destination: "graveyard",
      min: 0,
      max: 2,
      reveal: true,
      instead: { destination: "hand", pick: "one" },
    });
    const guidance = spell(
      "Dina's Guidance",
      "Instant",
      "Search your library for a creature card, reveal it, put it into your hand or graveyard, then shuffle.",
    );
    expect(guidance.complete).toBe(true);
    expect(guidance.effect).toMatchObject({ destination: "hand", instead: { destination: "graveyard", pick: "any" } });
    const pathmaker = parseFace({
      name: "Guidelight Pathmaker",
      type_line: "Artifact — Vehicle",
      oracle_text:
        "When this Vehicle enters, you may search your library for an artifact card and reveal it. Put it onto the battlefield if its mana value is 2 or less. Otherwise, put it into your hand. If you search your library this way, shuffle.",
    });
    expect(pathmaker.triggered[0].effect).toEqual({
      kind: "may",
      prompt: "Search your library for an artifact card?",
      effect: {
        kind: "search-library",
        filter: { type: "artifact" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
        instead: { destination: "battlefield", filter: { manaValue: { op: "lte", n: 2 } }, pick: "all" },
      },
    });
    // Archdruid's Charm's mode: tapped, by the card's type.
    const charm = parseEffect(
      "Search your library for a creature or land card and reveal it. Put it onto the battlefield tapped if it's a land card. Otherwise, put it into your hand. Then shuffle.",
      { targets: [] },
    );
    expect(charm.effect?.instead).toEqual({ destination: "battlefield", enterTapped: true, filter: { type: "land" }, pick: "all" });
  });
});

describe("can't be the target of … (hexproofFrom's qualifiers, graveyardCardsUntargetable)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads spells only, any player's, abilities only and no quality", () => {
    const paladin = face(
      "Fiendslayer Paladin",
      "Creature — Human Knight",
      "First strike\nLifelink\nThis creature can't be the target of black or red spells your opponents control.",
    );
    expect(paladin.static[0]).toMatchObject({ affects: { scope: "self" }, hexproofFrom: { colors: ["B", "R"], spellsOnly: true } });
    const informer = face(
      "Suq'Ata Firewalker",
      "Creature — Human Wizard",
      "This creature can't be the target of red spells or abilities from red sources.",
    );
    expect(informer.static[0].hexproofFrom).toEqual({ colors: ["R"], anyController: true });
    const ward = face("Ward A", "Enchantment — Aura", "Enchant creature\nEnchanted creature can't be the target of abilities from artifact sources.").static[0];
    expect(ward.hexproofFrom).toEqual({ types: ["artifact"], abilitiesOnly: true, anyController: true });
    expect(face("Dense Foliage", "Enchantment", "Creatures can't be the targets of spells.").static[0]).toMatchObject({
      affects: { scope: "all-creatures" },
      hexproofFrom: { spellsOnly: true, anyController: true },
    });
    expect(face("Tetsuo B", "Creature — Human", "This creature can't be the target of Aura spells.").static[0].hexproofFrom).toEqual({
      filter: { subtype: "Aura" },
      spellsOnly: true,
      anyController: true,
    });
    expect(face("Plax C", "Enchantment — Aura", "Enchant creature\nEnchanted creature can't be the target of spells or abilities your opponents control.").static[0].hexproofFrom).toEqual({});
  });

  it("reads the graveyard rule", () => {
    expect(face("Ground Seal", "Enchantment", "Cards in graveyards can't be the targets of spells or abilities.").static[0]).toMatchObject({
      graveyardCardsUntargetable: {},
    });
  });
});

describe("restrict over a set of creatures this turn (controlledByTarget, rule 611.2c)", () => {
  it("reads a target player's creatures, a side's, and every creature", () => {
    const targets: unknown[] = [];
    const oriss = parseEffect("Creatures target player controls can't attack this turn.", { targets });
    expect(oriss.effect).toEqual({
      kind: "restrict",
      filter: { type: "creature", controlledBy: "you" },
      controlledByTarget: 0,
      restrictions: ["cant-attack"],
    });
    expect(targets).toHaveLength(1);
    expect(parseEffect("Creatures your opponents control can't block this turn.", { targets: [] }).effect).toEqual({
      kind: "restrict",
      filter: { type: "creature", controlledBy: "opponent" },
      restrictions: ["cant-block"],
    });
    expect(parseEffect("Creatures can't be blocked this turn.", { targets: [] }).effect).toEqual({
      kind: "restrict",
      filter: { type: "creature" },
      restrictions: ["cant-be-blocked"],
    });
  });
});

describe("prevention shields: to you, and divided among any number of targets (rules 601.2d, 615.7)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads the next N (combat) damage to you as a damage-rule with an amount", () => {
    const conservator = face("Conservator", "Artifact", "{3}, {T}: Prevent the next 2 damage that would be dealt to you this turn.");
    expect(conservator.activated[0].effect).toEqual({ kind: "damage-rule", to: { players: "you" }, amount: 2 });
    const griffin = face(
      "Decorated Griffin",
      "Creature — Griffin",
      "Flying\n{1}{W}: Prevent the next 1 combat damage that would be dealt to you this turn.",
    );
    expect(griffin.activated[0].effect).toEqual({ kind: "damage-rule", to: { players: "you" }, amount: 1, combat: true });
  });

  it("reads a divided prevention as shields over an any-number group", () => {
    const remedy = face(
      "Remedy",
      "Instant",
      "Prevent the next 5 damage that would be dealt this turn to any number of targets, divided as you choose.",
    );
    expect(remedy.complete).toBe(true);
    expect(remedy.targets).toEqual([{ kind: "any-number", of: "any-target", max: 5 }]);
    expect(remedy.divided).toEqual({ total: 5, slot: 0, of: "damage to prevent" });
    expect(remedy.effect).toEqual({ kind: "prevent-damage-divided", from: 0 });
  });
});
describe("attach hosts (attachedTo among / a player / put-this-way, ontoChosen, attachOnlyTo)", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });
  const YOURS = { among: { type: "creature", controlledBy: "you" } };

  it("reads a card put onto the battlefield attached to a creature you control", () => {
    const myth = face("Nomad Mythmaker", "Creature — Human Nomad Cleric", "{W}, {T}: Put target Aura card from a graveyard onto the battlefield under your control attached to a creature you control.");
    expect(myth.complete).toBe(true);
    expect(myth.activated[0].effect).toEqual({ kind: "put-onto-battlefield", target: 0, underYourControl: true, attachedTo: YOURS });
    expect(
      parseSentence("Return target Aura card from your graveyard to the battlefield attached to a creature you control.", ctx()),
    ).toEqual({ kind: "put-onto-battlefield", target: 0, attachedTo: YOURS });
  });

  it("reads a search attached to target player, and a hand card attached to this creature", () => {
    const witch = face("Bitterheart Witch", "Creature — Human Shaman", "Deathtouch\nWhen this creature dies, you may search your library for a Curse card, put it onto the battlefield attached to target player, then shuffle.");
    expect(witch.complete).toBe(true);
    expect(witch.triggered[0].targets).toEqual(["player"]);
    expect(witch.triggered[0].effect).toMatchObject({ kind: "may", effect: { kind: "search-library", filter: { subtype: "Curse" }, attachedTo: 0 } });
    const researchers = face("Academy Researchers", "Creature — Human Wizard", "When this creature enters, you may put an Aura card from your hand onto the battlefield attached to this creature.");
    expect(researchers.complete).toBe(true);
    expect(researchers.triggered[0].effect).toEqual({
      kind: "look-and-choose",
      zone: "hand",
      min: 0,
      max: 1,
      destination: "battlefield",
      leftover: "stay",
      filter: { subtype: "Aura" },
      attachedTo: "source",
    });
  });

  it("reads attach onto what was returned, and onto a creature chosen as it resolves", () => {
    expect(parseSentence("Return target creature card from your graveyard to the battlefield and attach ~ to it.", ctx())).toEqual({
      kind: "sequence",
      effects: [{ kind: "put-onto-battlefield", target: 0 }, { kind: "attach", target: "put-this-way" }],
    });
    const giant = face("Stonehewer Giant", "Creature — Giant Warrior", "Vigilance\n{1}{W}, {T}: Search your library for an Equipment card, put it onto the battlefield, attach it to a creature you control, then shuffle.");
    expect(giant.complete).toBe(true);
    expect(giant.activated[0].effect).toMatchObject({
      kind: "search-library",
      filter: { subtype: "Equipment" },
      then: { kind: "attach", target: 0, attachment: 0, ontoChosen: { filter: { type: "creature", controlledBy: "you" } } },
    });
  });

  it("reads a static granting a static (grantsStatic)", () => {
    expect(face("Inspiring Leader", "Legendary Enchantment — Background", 'Commander creatures you own have "Creature tokens you control get +2/+2."').static[0]).toEqual({
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsStatic: [{ affects: { scope: "creatures-you-control", tokenOnly: true }, grantPt: [2, 2], text: "Creature tokens you control get +2/+2." }],
      text: 'Commander creatures you own have "Creature tokens you control get +2/+2."',
    });
    expect(face("Test Sliver", "Creature — Sliver", 'All Sliver creatures have "This creature gets +1/+1 as long as you control a Swamp."').static[0]).toMatchObject({
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantsStatic: [
        {
          affects: { scope: "self" },
          condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
          grantPt: [1, 1],
          text: "This creature gets +1/+1 as long as you control a Swamp.",
        },
      ],
    });
    expect(
      face("Cloudsteel Kirin", "Artifact Creature — Equipment Kirin", 'Equipped creature has flying and "You can\'t lose the game and your opponents can\'t win the game."').static[0],
    ).toMatchObject({ affects: { scope: "attached" }, grantKeywords: ["flying"], grantsStatic: [{ cantLoseGame: true, opponentsCantWinGame: true }] });
    const rune = face("Rune of Might", "Enchantment — Aura Rune", 'Enchant permanent\nWhen this Aura enters, draw a card.\nAs long as enchanted permanent is a creature, it gets +1/+1 and has trample.\nAs long as enchanted permanent is an Equipment, it has "Equipped creature gets +1/+1 and has trample."');
    expect(rune.complete).toBe(true);
    expect(rune.static[1]).toMatchObject({
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Equipment" } } },
      grantsStatic: [{ affects: { scope: "attached" }, grantPt: [1, 1], grantKeywords: ["trample"] }],
    });
    // A quoted line it can't read: left alone.
    expect(face("Test", "Enchantment", 'Creatures you control have "This creature can\'t be the target of anything weird."').static).toEqual([]);
  });

  it("reads an attach-only-to restriction", () => {
    expect(face("Gate Smasher", "Artifact — Equipment", "This Equipment can be attached only to a creature with toughness 4 or greater.").static[0]).toEqual({
      affects: { scope: "self" },
      attachOnlyTo: { type: "creature", toughness: { op: "gte", n: 4 } },
      text: "This Equipment can be attached only to a creature with toughness 4 or greater.",
    });
  });
});

describe("counters put or removed this way", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads Fangs of Kalonia's doubling and Spectacular Showdown's goad on what had a counter put on it this way", () => {
    const fangs = face(
      "Fangs of Kalonia",
      "Sorcery",
      "Put a +1/+1 counter on target creature you control, then double the number of +1/+1 counters on each creature that had a +1/+1 counter put on it this way.",
    );
    expect(fangs.complete).toBe(true);
    expect(fangs.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        { kind: "double-counters-all", filter: { type: "creature", thisWay: "counters-put" }, counterKind: "+1/+1" },
      ],
    });
    const showdown = face(
      "Spectacular Showdown",
      "Sorcery",
      "Put a double strike counter on target creature, then goad each creature that had a double strike counter put on it this way.",
    );
    expect(showdown.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "double-strike", amount: 1 },
        { kind: "goad", filter: { type: "creature", thisWay: "counters-put" } },
      ],
    });
    // A different kind put than the one asked about isn't read.
    expect(
      face("Test", "Sorcery", "Put a +1/+1 counter on target creature, then goad each creature that had a shield counter put on it this way.").complete,
    ).toBe(false);
  });

  it("reads 'that many' / 'that much' after a removal as the counters removed this way — a player's too", () => {
    const leeches = face("Leeches", "Sorcery", "Target player loses all poison counters. Leeches deals that much damage to that player.");
    expect(leeches.complete).toBe(true);
    expect(leeches.targets).toEqual(["player"]);
    expect(leeches.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "remove-player-counters", counter: "poison", amount: "all", target: 0 },
        { kind: "damage", amount: { thisWay: "counters-removed" }, target: 0 },
      ],
    });
    const take = face("Take", "Sorcery", "Remove all +1/+1 counters from target creature you control. Draw that many cards.");
    expect(take.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "remove-counter", target: 0, counter: "+1/+1", amount: "all" },
        { kind: "draw", amount: { thisWay: "counters-removed" } },
      ],
    });
  });

  it("reads a 'remove all … counters' cost, its count the ability's X", () => {
    expect(parseCost("{T}, Remove all +1/+1 counters from ~")?.cost.removeCounter).toEqual({ kind: "+1/+1", count: "all" });
    const hydra = face(
      "Molten Hydra",
      "Creature — Hydra",
      "{T}, Remove all +1/+1 counters from this creature: It deals damage to any target equal to the number of +1/+1 counters removed this way.",
    );
    expect(hydra.activated[0]).toMatchObject({
      cost: { tap: true, removeCounter: { kind: "+1/+1", count: "all" } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
    });
    const amulet = face("Relic Amulet", "Artifact", "{2}, {T}, Remove all charge counters from this artifact: It deals that much damage to target creature.");
    expect(amulet.activated[0].effect).toEqual({ kind: "damage", amount: "x", target: 0 });
  });

  it("reads counters distributed by an amount among targets, the total read as it's announced", () => {
    const caller = face(
      "Quirion Beastcaller",
      "Creature — Dryad Warrior",
      "When this creature dies, distribute X +1/+1 counters among any number of target creatures you control, where X is the number of +1/+1 counters on this creature.",
    );
    expect(caller.triggered[0]).toMatchObject({
      targets: [{ kind: "any-number", of: "creature-you-control" }],
      divided: { total: { countersOn: "source", counter: "+1/+1" }, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
    });
    const upheaval = face(
      "Undercity Upheaval",
      "Sorcery",
      "Undergrowth — Distribute X +1/+1 counters among any number of target creatures you control, where X is the number of creature cards in your graveyard as you cast this spell. Creatures you control gain vigilance until end of turn.",
    );
    expect(upheaval.complete).toBe(true);
    expect(upheaval.divided).toEqual({ total: { countInGraveyard: { type: "creature", ownedBy: "you" } }, slot: 0, of: "+1/+1 counters" });
  });

  it("reads counters distributed among permanents chosen as it resolves (untargeted)", () => {
    const frost = face(
      "Blessing of Frost",
      "Snow Sorcery",
      "Distribute X +1/+1 counters among any number of creatures you control, where X is the amount of {S} spent to cast this spell.",
    );
    expect(frost.effect).toEqual({
      kind: "counters-distributed",
      counter: "+1/+1",
      total: { manaSpentOf: "source", from: { supertype: "snow" } },
      filter: { type: "creature", controlledBy: "you" },
      among: "creatures you control",
    });
    const hydra = face(
      "Vastwood Hydra",
      "Creature — Hydra",
      "When this creature dies, you may distribute a number of +1/+1 counters equal to the number of +1/+1 counters on this creature among any number of creatures you control.",
    );
    expect(hydra.triggered[0].effect).toMatchObject({
      kind: "may",
      effect: { kind: "counters-distributed", total: { countersOn: "source", counter: "+1/+1" }, filter: { type: "creature", controlledBy: "you" } },
    });
    // A total it can't read leaves the line alone.
    expect(face("Test", "Sorcery", "Distribute X +1/+1 counters among any number of creatures you control, where X is your luck.").complete).toBe(false);
  });

  it("reads Thief of Blood's removal as it enters and the counters it enters with", () => {
    const thief = face(
      "Thief of Blood",
      "Creature — Vampire",
      "As this creature enters, remove all counters from all permanents. This creature enters with a +1/+1 counter on it for each counter removed this way.",
    );
    expect(thief.static[0].replacement).toEqual({
      event: "enters-battlefield",
      removeAllCountersFrom: {},
      counters: { kind: "+1/+1", amount: "removed-as-enters" },
    });
  });
});

describe("the card discarded to pay a cost", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads its mana value and its type where a discard cost discarded it", () => {
    // Volrath the Fallen's line, under a name the short-name reader knows
    // ("Volrath" alone isn't read as ~).
    const volrath = face(
      "Test Volrath",
      "Legendary Creature — Phyrexian Shapeshifter",
      "{1}{B}, Discard a creature card: Test Volrath gets +X/+X until end of turn, where X is the discarded card's mana value.",
    );
    expect(volrath.complete).toBe(true);
    expect(volrath.activated[0].effect).toEqual({
      kind: "modify-pt",
      target: "source",
      power: { manaValueOf: "discarded" },
      toughness: { manaValueOf: "discarded" },
      duration: "end-of-turn",
    });
    const chemister = face(
      "Mercurial Chemister",
      "Creature — Human Wizard",
      "{R}, {T}, Discard a card: This creature deals damage to target creature equal to the discarded card's mana value.",
    );
    expect(chemister.activated[0].effect).toEqual({ kind: "damage", amount: { manaValueOf: "discarded" }, target: 0 });
    const moria = face(
      "Moria Scavenger",
      "Creature — Orc Rogue",
      "Deathtouch, haste\n{T}, Discard a card: Draw a card. If the discarded card was a creature card, amass Orcs 1.",
    );
    expect(moria.activated[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "draw", amount: 1 },
        { kind: "conditional", condition: { kind: "discarded", filter: { type: "creature" } }, then: { kind: "amass", amount: 1, creatureType: "Orc" } },
      ],
    });
    const grab = face(
      "Grab the Prize",
      "Sorcery",
      "As an additional cost to cast this spell, discard a card.\nDraw two cards. If the discarded card wasn't a land card, Grab the Prize deals 2 damage to each opponent.",
    );
    expect(grab.complete).toBe(true);
    expect(grab.effect.effects[1]).toEqual({
      kind: "conditional",
      condition: { kind: "discarded", filter: { notTypes: ["land"] } },
      then: { kind: "damage", amount: 2, who: "each-opponent" },
    });
  });

  it("reads a granted ability naming the permanent that grants it (rule 201.5a)", () => {
    const kunai = face(
      "Ninja's Kunai",
      "Artifact — Equipment",
      "Equipped creature has \"{1}, {T}, Sacrifice Ninja's Kunai: Ninja's Kunai deals 3 damage to any target.\"\nEquip {1}",
    );
    expect(kunai.complete).toBe(true);
    expect(kunai.static[0].grantsActivated[0]).toMatchObject({
      cost: { mana: "{1}", tap: true, sacrifice: "granter" },
      effect: { kind: "damage", amount: 3, target: 0, from: "granter" },
    });
    const boomerang = face(
      "Trusty Boomerang",
      "Artifact — Equipment",
      "Equipped creature has \"{1}, {T}: Tap target creature. Return Trusty Boomerang to its owner's hand.\"\nEquip {1}",
    );
    expect(boomerang.static[0].grantsActivated[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "tap", target: 0 },
        { kind: "return-to-hand", target: "granter" },
      ],
    });
    // A granter named any other way is left to a person.
    const pole = face(
      "Fishing Pole",
      "Artifact — Equipment",
      "Equipped creature has \"{1}, {T}, Tap Fishing Pole: Put a bait counter on Fishing Pole.\"",
    );
    expect(pole.complete).toBe(false);
  });

  it("leaves a discard the effect itself makes to a person", () => {
    const rummage = face("Test Rummage", "Sorcery", "Draw a card, then discard a card. If the discarded card was a creature card, draw a card.");
    expect(rummage.complete).toBe(false);
  });
});

describe("put into a hand this way, and the cards exiled this way to their owners' hands", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: (name: string) => `${name} Token` });

  it("reads Adventure Awaits' look, its reveal-and-take and its 'if you didn't put a card into your hand this way'", () => {
    const awaits = face(
      "Adventure Awaits",
      "Sorcery",
      "Look at the top five cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, draw a card.",
    );
    expect(awaits.complete).toBe(true);
    expect(awaits.effect).toEqual({
      kind: "sequence",
      effects: [
        {
          kind: "look-and-choose",
          zone: "library",
          count: 5,
          reveal: "chosen",
          min: 0,
          max: 1,
          filter: { type: "creature" },
          destination: "hand",
          leftover: "bottom-random",
        },
        { kind: "conditional", condition: { kind: "this-way", what: "put-into-hand", atMost: 0 }, then: { kind: "draw", amount: 1 } },
      ],
    });
    // A look that isn't taken whole leaves the lines alone.
    expect(
      face("Test Card", "Sorcery", "Look at the top five cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest into your graveyard.").complete,
    ).toBe(false);
  });

  it("reads Courier of Comestibles' 'if you don't put a card into your hand this way' after its search", () => {
    const courier = face(
      "Courier of Comestibles",
      "Creature — Human Citizen",
      "When this creature enters, you may search your library for a Food card, reveal it, put it into your hand, then shuffle. If you don't put a card into your hand this way, create a Food token.",
    );
    expect(courier.complete).toBe(true);
    expect(courier.triggered[0].effect).toMatchObject({
      kind: "sequence",
      effects: [
        { kind: "may", effect: { kind: "search-library", filter: { subtype: "Food" }, destination: "hand" } },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
          then: { kind: "create-token", token: "Food Token", count: 1 },
        },
      ],
    });
  });

  it("reads 'then put all cards exiled this way into their owners' hands'", () => {
    expect(parseSentence("Then put all cards exiled this way into their owners' hands.", ctx())).toEqual({
      kind: "move-exiled-this-way",
      to: "hand",
    });
    expect(parseSentence("Then put all cards exiled this way into your hand.", ctx())).toBeNull();
  });
});

describe("exiled this way, then a pick or the rest moved on", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads Herald of Amity's exile, free cast from among them and the rest to the bottom", () => {
    const herald = face(
      "Herald of Amity",
      "Creature — Griffin",
      "When this creature enters, exile the top eight cards of your library. You may cast an Aura spell from among them without paying its mana cost. Then put the rest on the bottom of your library in a random order.",
    );
    expect(herald.triggered[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "exile-from-library", amount: 8 },
        { kind: "cast-now", from: "exiled-this-way", free: true, spell: { subtype: "Aura" } },
        { kind: "move-exiled-this-way", to: "library-bottom" },
      ],
    });
    // "The rest" with nothing exiled before it isn't this.
    expect(face("Test Card", "Sorcery", "Draw a card. Then put the rest on the bottom of your library in a random order.").complete).toBe(false);
  });

  it("reads Muse Vortex's instants and sorceries to the hand and the rest under", () => {
    const vortex = face(
      "Muse Vortex",
      "Sorcery",
      "Exile the top X cards of your library. You may cast an instant or sorcery spell with mana value X or less from among them without paying its mana cost. Then put the exiled instant and sorcery cards that weren't cast this way into your hand and the rest on the bottom of your library in a random order.",
    );
    expect(vortex.complete).toBe(true);
    expect(vortex.effect.effects.slice(1)).toEqual([
      { kind: "cast-now", from: "exiled-this-way", free: true, spell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: { amount: "x" } } } },
      { kind: "move-exiled-this-way", to: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      { kind: "move-exiled-this-way", to: "library-bottom" },
    ]);
  });

  it("reads Lord of the Void's and Tezzeret's puts from among the cards exiled", () => {
    const lord = face(
      "Lord of the Void",
      "Creature — Demon",
      "Whenever this creature deals combat damage to a player, exile the top seven cards of that player's library, then put a creature card from among them onto the battlefield under your control.",
    );
    expect(lord.triggered[0].effect.effects).toEqual([
      { kind: "exile-from-library", whose: "trigger-player", amount: 7 },
      { kind: "look-and-choose", zone: "exile", min: 1, max: 1, filter: { thisWay: "exiled", type: "creature" }, destination: "battlefield", leftover: "stay" },
    ]);
    const all = face("Test Card", "Sorcery", "Exile the top ten cards of your library. Put all artifact cards from among them onto the battlefield.");
    expect(all.effect.effects[1]).toMatchObject({ zone: "exile", min: 10, max: 10, filter: { thisWay: "exiled", type: "artifact" } });
    const any = face("Test Card", "Sorcery", "Exile the top seven cards of your library. You may put any number of creature and/or land cards from among them onto the battlefield.");
    expect(any.effect.effects[1]).toMatchObject({ min: 0, max: 7, filter: { thisWay: "exiled", typesAnyOf: ["creature", "land"] } });
  });

  it("reads a look whose pick is exiled to be played this turn, or cast free", () => {
    expect(
      face("Test Card", "Sorcery", "Look at the top three cards of your library. Exile one of those cards and put the rest on the bottom of your library in a random order. You may play the exiled card this turn.").effect,
    ).toEqual({
      kind: "look-and-choose",
      zone: "library",
      count: 3,
      min: 1,
      max: 1,
      destination: "exile",
      unlinked: true,
      playable: { duration: "end-of-turn" },
      leftover: "bottom-random",
    });
    expect(
      face("Test Card", "Sorcery", "Look at the top four cards of your library. You may exile a nonland card from among them. Put the rest on the bottom of your library in a random order. You may cast the exiled card without paying its mana cost.").effect,
    ).toMatchObject({ min: 0, filter: { notTypes: ["land"] }, destination: "exile", then: { kind: "cast-now", target: 0, free: true } });
    // Exiled with no permission after it isn't read.
    expect(
      face("Test Card", "Sorcery", "Look at the top three cards of your library. Exile one of those cards and put the rest on the bottom of your library in a random order.").complete,
    ).toBe(false);
  });
});

describe("the card revealed to pay a cost", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a mandatory reveal as the spell's additional cost, and the revealed card's numbers", () => {
    const despair = face(
      "Induce Despair",
      "Instant",
      "As an additional cost to cast this spell, reveal a creature card from your hand.\nTarget creature gets -X/-X until end of turn, where X is the revealed card's mana value.",
    );
    expect(despair.complete).toBe(true);
    expect(despair.additionalCost).toEqual({ behold: { filter: { type: "creature" }, text: "a creature card", fromHand: true } });
    expect(despair.effect).toEqual({
      kind: "modify-pt",
      target: 0,
      power: { product: [{ manaValueOf: "revealed" }, -1] },
      toughness: { product: [{ manaValueOf: "revealed" }, -1] },
      duration: "end-of-turn",
    });
    const calamity = face(
      "Calamity of the Titans",
      "Sorcery",
      "As an additional cost to cast this spell, reveal a colorless creature card from your hand.\nExile each creature and planeswalker with mana value less than the revealed card's mana value.",
    );
    expect(calamity.complete).toBe(true);
    expect(calamity.additionalCost.behold.filter).toEqual({ type: "creature", colorless: true });
    // Without the reveal, "the revealed card" is nothing to read.
    const unrevealed = face("Test Despair", "Instant", "Target creature gets -X/-X until end of turn, where X is the revealed card's mana value.");
    expect(unrevealed.complete).toBe(false);
  });

  it("reads 'Reveal two cards from your hand that share a color' as a cost", () => {
    expect(parseCost("{1}, {T}, Reveal two cards from your hand that share a color").cost).toEqual({
      mana: "{1}",
      tap: true,
      reveal: { count: 2, filter: {}, text: "cards", shareColor: true },
    });
  });
});

describe("a choice drawn from several zones, or one card a slot", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a revealed hand's choice that takes in the graveyard or the library's top card", () => {
    const remorse = face(
      "Agonizing Remorse",
      "Sorcery",
      "Target opponent reveals their hand. You choose a nonland card from it or a card from their graveyard. Exile that card. You lose 1 life.",
    );
    expect(remorse.complete).toBe(true);
    expect(remorse.effect.effects[0]).toEqual({
      kind: "discard-chosen",
      target: 0,
      filter: { notTypes: ["land"] },
      destination: "exile",
      alsoFrom: { zone: "graveyard" },
    });
    const episode = face(
      "Psychotic Episode",
      "Sorcery",
      "Target player reveals their hand and the top card of their library. You choose a card revealed this way. That player puts the chosen card on the bottom of their library.",
    );
    expect(episode.effect).toEqual({ kind: "discard-chosen", target: 0, destination: "library-bottom", alsoFrom: { zone: "library-top" } });
    // A graveyard's card can't be discarded.
    const discard = face(
      "Test Remorse",
      "Sorcery",
      "Target opponent reveals their hand. You choose a nonland card from it or a card from their graveyard. That player discards that card.",
    );
    expect(discard.complete).toBe(false);
  });

  it("reads up to X cards from the hand and/or graveyard", () => {
    const rage = face(
      "Worldsoul's Rage",
      "Sorcery",
      "Worldsoul's Rage deals X damage to any target. Put up to X land cards from your hand and/or graveyard onto the battlefield tapped.",
    );
    expect(rage.complete).toBe(true);
    expect(rage.effect.effects[1]).toEqual({
      kind: "return-from-graveyard",
      from: "hand-or-graveyard",
      filter: { type: "land" },
      destination: "battlefield",
      count: "x",
      upTo: true,
      enterTapped: true,
    });
  });

  it("reads a look whose chosen cards fill one slot each", () => {
    const atraxa = face(
      "Atraxa, Grand Unifier",
      "Legendary Creature — Phyrexian Angel",
      "When Atraxa enters, reveal the top ten cards of your library. For each card type, you may put a card of that type from among the revealed cards into your hand. Put the rest on the bottom of your library in a random order.",
    );
    const look = atraxa.triggered[0].effect;
    expect(look).toMatchObject({ kind: "look-and-choose", zone: "library", count: 10, reveal: true, min: 0, max: 9, destination: "hand", leftover: "bottom-random" });
    expect(look.together.oneEach.map((slot: { filter: unknown }) => slot.filter)).toContainEqual({ type: "kindred" });
    const harper = face(
      "Harper Recruiter",
      "Creature — Human Warrior",
      "Whenever this creature attacks, look at the top four cards of your library. You may reveal a Cleric card, a Rogue card, a Warrior card, and/or a Wizard card from among them and put those cards into your hand. Put the rest on the bottom of your library in a random order.",
    );
    expect(harper.triggered[0].effect).toMatchObject({
      count: 4,
      reveal: "chosen",
      max: 4,
      together: {
        oneEach: [
          { filter: { subtype: "Cleric" } },
          { filter: { subtype: "Rogue" } },
          { filter: { subtype: "Warrior" } },
          { filter: { subtype: "Wizard" } },
        ],
      },
    });
    // "An Angel card, a Demon card, and/or a Dragon card … put them": Kaalia.
    const kaalia = face(
      "Kaalia, Zenith Seeker",
      "Legendary Creature — Human Cleric",
      "When Kaalia enters, look at the top six cards of your library. You may reveal an Angel card, a Demon card, and/or a Dragon card from among them and put them into your hand. Put the rest on the bottom of your library in a random order.",
    );
    expect(kaalia.triggered[0].effect).toMatchObject({ count: 6, reveal: "chosen", max: 3 });
    // The slots read from the spells cast this turn: Hurkyl.
    const hurkyl = face(
      "Hurkyl, Master Wizard",
      "Legendary Creature — Human Wizard Advisor",
      "At the beginning of your end step, if you've cast a noncreature spell this turn, reveal the top five cards of your library. For each card type among noncreature spells you've cast this turn, you may put a card of that type from among the revealed cards into your hand. Put the rest on the bottom of your library in a random order.",
    );
    expect(hurkyl.triggered[0].effect).toMatchObject({
      count: 5,
      reveal: true,
      together: { oneEachTypeAmong: { spellsYouCastThisTurn: { notTypes: ["creature"] } } },
      leftover: "bottom-random",
    });
    // Each chosen card by what it is: Zimone's Experiment.
    const zimone = face(
      "Zimone's Experiment",
      "Sorcery",
      "Look at the top five cards of your library. You may reveal up to two creature and/or land cards from among them, then put the rest on the bottom of your library in a random order. Put all land cards revealed this way onto the battlefield tapped and put all creature cards revealed this way into your hand.",
    );
    expect(zimone.effect).toMatchObject({
      kind: "look-and-choose",
      count: 5,
      reveal: "chosen",
      max: 2,
      filter: { typesAnyOf: ["creature", "land"] },
      split: [
        { filter: { type: "land" }, destination: "battlefield", enterTapped: true },
        { filter: { type: "creature" }, destination: "hand" },
      ],
    });
    // A total mana value cap: Michelangelo's Technique's look.
    const technique = face(
      "Test Technique",
      "Sorcery",
      "Look at the top eight cards of your library. Put up to two creature cards with total mana value 6 or less from among them onto the battlefield and the rest on the bottom of your library in a random order.",
    );
    expect(technique.effect).toMatchObject({
      count: 8,
      max: 2,
      filter: { type: "creature" },
      together: { totalManaValueAtMost: 6 },
      destination: "battlefield",
      leftover: "bottom-random",
    });
    // Another player divides the finds.
    const intuition = face(
      "Intuition",
      "Instant",
      "Search your library for three cards and reveal them. Target opponent chooses one. Put that card into your hand and the rest into your graveyard. Then shuffle.",
    );
    expect(intuition.effect).toMatchObject({
      kind: "search-library",
      destination: "graveyard",
      min: 3,
      max: 3,
      reveal: true,
      instead: { destination: "hand", pick: "one", chooser: { target: 0 } },
    });
    const teachings = face(
      "Elemental Teachings",
      "Instant — Lesson",
      "Search your library for up to four land cards with different names and reveal them. An opponent chooses two of those cards. Put the chosen cards into your graveyard and the rest onto the battlefield tapped, then shuffle.",
    );
    expect(teachings.effect).toMatchObject({
      filter: { type: "land" },
      destination: "battlefield",
      enterTapped: true,
      min: 0,
      max: 4,
      together: { distinctNames: true },
      instead: { destination: "graveyard", pick: { exactly: 2 }, chooser: "an-opponent" },
    });
    // Another player chooses in a graveyard, the card under your control.
    const dredge = face(
      "Dredge the Mire",
      "Sorcery",
      "Each opponent chooses a creature card in their graveyard. Put those cards onto the battlefield under your control.",
    );
    expect(dredge.effect).toMatchObject({
      kind: "for-each-player",
      who: "each-opponent",
      choicesHeld: true,
      effect: { kind: "look-and-choose", player: "that-player", zone: "graveyard", filter: { type: "creature" }, under: "you" },
    });
    const scrounge = face(
      "Scrounge",
      "Sorcery",
      "Target opponent chooses an artifact card in their graveyard. Put that card onto the battlefield under your control.",
    );
    expect(scrounge.effect).toMatchObject({ who: { target: 0 }, effect: { filter: { type: "artifact" }, under: "you" } });
    // The rest anywhere but the bottom is another shape.
    const rest = face(
      "Test Recruiter",
      "Creature — Human",
      "Whenever this creature attacks, look at the top four cards of your library. You may reveal a Cleric card and/or a Rogue card from among them and put those cards into your hand. Put the rest into your graveyard.",
    );
    expect(rest.complete).toBe(false);
  });
});

describe("a card name chosen and used", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a name chosen as a spell resolves, and a sacrifice-only flashback", () => {
    const therapy = face(
      "Cabal Therapy",
      "Sorcery",
      "Choose a nonland card name. Target player reveals their hand and discards all cards with that name.\nFlashback—Sacrifice a creature. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    );
    expect(therapy.complete).toBe(true);
    expect(therapy.effect).toEqual({
      kind: "choose-card-name",
      filter: { notTypes: ["land"] },
      then: { kind: "discard-hand", who: 0, filter: { hasName: "$chosenName" }, reveal: true },
    });
    expect(therapy.flashback).toEqual({ cost: "", sacrifice: { filter: { type: "creature" }, count: 1 } });
    const predict = face(
      "Predict",
      "Instant",
      "Choose a card name, then target player mills a card. If a card with the chosen name was milled this way, you draw two cards. Otherwise, you draw a card.",
    );
    expect(predict.complete).toBe(true);
    expect(predict.effect.then.effects[1]).toMatchObject({
      condition: { kind: "this-way", what: "milled", filter: { hasName: "$chosenName" } },
      then: { kind: "draw", amount: 2 },
      else: { kind: "draw", amount: 1 },
    });
  });

  it("reads a player and a name chosen as it enters, the player's draws revealed and the named one sprung", () => {
    const trap = face(
      "Booby Trap",
      "Artifact",
      "As this artifact enters, choose an opponent and a card name other than a basic land card name.\nThe chosen player reveals each card they draw.\nWhen the chosen player draws a card with the chosen name, sacrifice this artifact. If you do, this artifact deals 10 damage to that player.",
    );
    expect(trap.complete).toBe(true);
    expect(trap.choosePlayerOnEnter).toBe("opponent");
    expect(trap.chooseCardNameOnEnter).toEqual({ filter: { notBasicLand: true }, aim: "opponent-library" });
    expect(trap.static[0]).toMatchObject({ revealsDraws: "chosen-player" });
    expect(trap.triggered[0]).toMatchObject({
      trigger: { on: "draws", who: "chosen-player", filter: { chosenName: true } },
      effect: { kind: "sacrifice-source", then: { kind: "damage", amount: 10, who: "trigger-controller" } },
    });
  });
});

describe("target relations among the chosen targets: shared types, equal toughness, different names", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'two target … that share a card type / a creature type / no creature types' as a related pair", () => {
    const loyalties = face("Shifting Loyalties", "Sorcery", "Exchange control of two target permanents that share a card type.");
    expect(loyalties.targets).toEqual(["permanent", { kind: "other", of: "permanent", than: { slot: 0 }, shares: { kind: "card" } }]);
    expect(loyalties.effect).toEqual({ kind: "exchange-control", objects: [0, 1] });
    const duel = face(
      "Rivals' Duel",
      "Sorcery",
      "Choose two target creatures that share no creature types. Those creatures fight each other.",
    );
    expect(duel.targets).toEqual([
      "creature",
      { kind: "other", of: "creature", than: { slot: 0 }, shares: { kind: "creature", none: true } },
    ]);
    expect(duel.effect).toEqual({ kind: "fight", a: 0, b: 1 });
    const tunnel = parseSentence("Two target creatures you control that share a creature type can't be blocked this turn.", ctx());
    expect(tunnel).toEqual({
      kind: "sequence",
      effects: [
        { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        { kind: "grant-keyword", target: 1, keyword: "unblockable", duration: "end-of-turn" },
      ],
    });
  });

  it("reads 'another target permanent that shares one of those types with it' as sharing the first slot's types", () => {
    const legerdemain = face(
      "Legerdemain",
      "Sorcery",
      "Exchange control of target artifact or creature and another target permanent that shares one of those types with it.",
    );
    expect(legerdemain.targets).toEqual([
      "artifact-or-creature",
      { kind: "other", of: "permanent", than: { slot: 0 }, shares: { kind: "card", among: ["artifact", "creature"] } },
    ]);
    expect(legerdemain.effect).toEqual({ kind: "exchange-control", objects: [0, 1] });
  });

  it("reads 'with equal toughness' and 'with different names' as a group's relation", () => {
    const vats = face(
      "V.A.T.S.",
      "Instant",
      "Choose any number of target creatures with equal toughness. Destroy the chosen creatures.",
    );
    expect(vats.targets).toEqual([{ kind: "any-number", of: "creature", equalToughness: true }]);
    expect(vats.effect).toEqual({ kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } });
    const six = face(
      "Behold the Sinister Six!",
      "Sorcery",
      "Return up to six target creature cards with different names from your graveyard to the battlefield.",
    );
    expect(six.targets).toEqual([
      {
        kind: "any-number",
        of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
        max: 6,
        differentNames: true,
      },
    ]);
    expect(six.effect).toEqual({
      kind: "for-each-target",
      from: 0,
      simultaneous: true,
      effect: { kind: "put-onto-battlefield", target: 0 },
    });
  });

  it("leaves a choice followed by something else unread", () => {
    expect(
      face("Test Card", "Sorcery", "Choose two target creatures that share no creature types. You gain 3 life.").complete,
    ).toBe(false);
  });
});

describe("what's attached to a target or a player", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'target creature and all Auras / Equipment attached to it' as one instruction, the attachments first", () => {
    const hubris = face("Hubris", "Instant", "Return target creature and all Auras attached to it to their owners' hands.");
    expect(hubris.targets).toEqual(["creature"]);
    expect(hubris.effect).toEqual({
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "return-to-hand-all", filter: { subtype: "Aura", attachedToTarget: 0 } },
        { kind: "return-to-hand", target: 0 },
      ],
    });
    const spiders = face("Eaten by Spiders", "Instant", "Destroy target creature with flying and all Equipment attached to that creature.");
    expect(spiders.effect).toEqual({
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "destroy-all", filter: { subtype: "Equipment", attachedToTarget: 0 } },
        { kind: "destroy", target: 0 },
      ],
    });
  });

  it("reads 'all Equipment attached to that creature / target creature / you'", () => {
    const bolt = face(
      "Blastfire Bolt",
      "Instant",
      "Blastfire Bolt deals 5 damage to target creature. Destroy all Equipment attached to that creature.",
    );
    expect(bolt.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 5, target: 0 },
        { kind: "destroy-all", filter: { subtype: "Equipment", attachedToTarget: 0 } },
      ],
    });
    expect(parseSentence("Destroy all Auras and Equipment attached to target creature.", ctx())).toEqual({
      kind: "destroy-all",
      filter: { subtypes: ["Aura", "Equipment"], attachedToTarget: 0 },
    });
    expect(parseSentence("Destroy all Curses attached to you.", ctx())).toEqual({
      kind: "destroy-all",
      filter: { subtype: "Curse", attachedToPlayer: "you" },
    });
    // "That creature" with no one target before it is a person's call.
    expect(parseSentence("Destroy all Equipment attached to that creature.", ctx())).toBeNull();
  });

  it("reads 'up to one target Equipment attached to that creature' as a slot attached to the one before", () => {
    const fiery = face(
      "Fiery Annihilation",
      "Instant",
      "Fiery Annihilation deals 5 damage to target creature. Exile up to one target Equipment attached to that creature. If that creature would die this turn, exile it instead.",
    );
    expect(fiery.targets).toEqual([
      "creature",
      {
        kind: "optional",
        of: { kind: "other", of: { kind: "permanent", filter: { subtype: "Equipment" } }, than: { slot: 0 }, attachedToThan: true },
      },
    ]);
    expect(fiery.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 5, target: 0 },
        { kind: "exile", target: 1 },
        { kind: "exile-if-dies-this-turn", target: 0 },
      ],
    });
  });
});

describe("a graveyard card put there this turn", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'Choose target … card in a graveyard that was put there from … this turn' and the move after it", () => {
    const grim = face(
      "Grim Return",
      "Instant",
      "Choose target creature card in a graveyard that was put there from the battlefield this turn. Put that card onto the battlefield under your control.",
    );
    expect(grim.complete).toBe(true);
    expect(grim.targets).toEqual([
      { kind: "card-in-graveyard", whose: "any", filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } } },
    ]);
    expect(grim.effect).toEqual({ kind: "put-onto-battlefield", target: 0, underYourControl: true });
    const nurse = face(
      "Night Nurse, Healer of Heroes",
      "Legendary Creature — Human Doctor Hero",
      "When Night Nurse enters, choose target permanent card in your graveyard that was put there from anywhere this turn. Return it to your hand.",
    );
    expect(nurse.triggered[0].targets).toEqual([
      { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"], putIntoGraveyardThisTurn: {} } },
    ]);
    expect(nurse.triggered[0].effect).toEqual({ kind: "return-to-hand", target: 0, from: "graveyard" });
    // A library keeps the older milled-this-turn clause.
    const captain = face(
      "Test Captain",
      "Creature — Horror",
      "At the beginning of your end step, choose target creature card in an opponent's graveyard that was put there from their library this turn. Put it onto the battlefield under your control.",
    );
    expect(captain.triggered[0].targets[0].filter).toEqual({ type: "creature", putIntoGraveyardFromLibraryThisTurn: true });
    // Another move after the choice isn't read as one.
    const exile = face(
      "Test Return",
      "Instant",
      "Choose target creature card in a graveyard that was put there from the battlefield this turn. Exile it.",
    );
    expect(exile.complete).toBe(false);
  });

  it("reads 'if a land you controlled was put into a graveyard from the battlefield this turn' as the turn's history", () => {
    const lady = face(
      "Test Lady",
      "Creature — Avatar",
      "At the beginning of each end step, if a land you controlled was put into a graveyard from the battlefield this turn, draw a card.",
    );
    expect(lady.complete).toBe(true);
    expect(lady.triggered[0].condition).toEqual({
      kind: "turn-history",
      what: "to-graveyard",
      who: "any-player",
      from: ["battlefield"],
      filter: { type: "land", controlledBy: "you" },
    });
  });
});

describe("discard triggers: this card, its cause, the turn's first", () => {
  it("reads 'When you discard this card' and 'When a spell or ability an opponent controls causes you to discard ~'", () => {
    expect(parseTrigger("When you discard this card")).toEqual([{ on: "this-discarded" }]);
    expect(parseTrigger("When you discard ~")).toEqual([{ on: "this-discarded" }]);
    expect(parseTrigger("When a spell or ability an opponent controls causes you to discard ~")).toEqual([
      { on: "this-discarded", byOpponent: true },
    ]);
    expect(parseTrigger("Whenever you discard one or more cards for the first time each turn")).toEqual([
      { on: "discards", who: "you", firstTimeEachTurn: true },
    ]);
    // Not another card's discard.
    expect(parseTrigger("When you discard a card")).toBeNull();
    const gnome = parseFace(
      {
        name: "Metrognome",
        type_line: "Artifact",
        oracle_text:
          "When a spell or ability an opponent controls causes you to discard Metrognome, create four 1/1 colorless Gnome artifact creature tokens.\n{4}, {T}: Create a 1/1 colorless Gnome artifact creature token.",
      },
      { tokenFor: () => "Gnome Token" },
    );
    expect(gnome.complete).toBe(true);
    expect(gnome.triggered[0].trigger).toEqual({ on: "this-discarded", byOpponent: true });
  });
});

describe("land-play and cast-by-zone prohibitions", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'target player can't play lands this turn' as a prohibit effect's lands", () => {
    const wound = face("Turf Wound", "Instant", "Target player can't play lands this turn.\nDraw a card.");
    expect(wound.complete).toBe(true);
    expect(wound.targets).toEqual(["player"]);
    expect(wound.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "prohibit", who: 0, lands: true },
        { kind: "draw", amount: 1 },
      ],
    });
    const miner = face("Pardic Miner", "Creature — Dwarf", "Sacrifice this creature: Target player can't play lands this turn.");
    expect(miner.complete).toBe(true);
    expect(miner.activated[0].effect).toEqual({ kind: "prohibit", who: 0, lands: true });
  });

  it("reads the static land-play lock and the casting locks by zone", () => {
    const dispute = face(
      "Territorial Dispute",
      "Enchantment",
      "At the beginning of your upkeep, sacrifice this enchantment unless you sacrifice a land.\nPlayers can't play lands.",
    );
    expect(dispute.static[0].prohibits).toEqual({ who: "each-player", lands: {} });
    const mining = face("Aggressive Mining", "Enchantment", "You can't play lands.");
    expect(mining.static[0].prohibits).toEqual({ who: "you", lands: {} });
    const magistrate = face(
      "Drannith Magistrate",
      "Creature — Human Wizard",
      "Your opponents can't cast spells from anywhere other than their hands.",
    );
    expect(magistrate.complete).toBe(true);
    expect(magistrate.static[0].prohibits).toEqual({ who: "opponents", spells: true, notFrom: ["hand"] });
    const frenzy = face("Experimental Frenzy", "Enchantment", "You can't play lands or cast spells from your hand.");
    expect(frenzy.static[0].prohibits).toEqual({ who: "you", spells: true, lands: {}, from: ["hand"] });
  });
});

describe("a player named as the owner of a target or trigger object", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'its owner gains N life' and 'then that player discards' after the target's moved", () => {
    const path = face("Path of Peace", "Sorcery", "Destroy target creature. Its owner gains 4 life.");
    expect(path.complete).toBe(true);
    expect(path.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "gain-life", amount: 4, who: { ownerOfTarget: 0 } },
      ],
    });
    const recoil = face("Recoil", "Instant", "Return target permanent to its owner's hand. Then that player discards a card.");
    expect(recoil.complete).toBe(true);
    expect(recoil.effect.effects[1]).toEqual({ kind: "discard", target: { ownerOfTarget: 0 }, amount: 1 });
  });

  it("doesn't read 'that player' after a move that names no owner", () => {
    const card = face("Test Sorcery", "Sorcery", "Destroy target creature. Then that player discards a card.");
    expect(card.complete).toBe(false);
  });

  it("reads Geth's mill and Nurgle's Conscription's graveyard as the card's owner", () => {
    const geth = face(
      "Geth, Lord of the Vault",
      "Legendary Creature — Phyrexian Zombie",
      "{X}{B}: Put target artifact or creature card with mana value X from an opponent's graveyard onto the battlefield tapped under your control. Then that player mills X cards.",
    );
    expect(geth.activated[0].effect.effects[1]).toEqual({ kind: "mill", target: { ownerOfTarget: 0 }, amount: "x" });
    expect(geth.activated[0].targets[0].filter.manaValue).toEqual({ op: "eq", n: "x" });
    const nurgle = face(
      "Nurgle's Conscription",
      "Instant",
      "Put target creature card from an opponent's graveyard onto the battlefield tapped under your control, then exile that player's graveyard.",
    );
    expect(nurgle.complete).toBe(true);
    expect(nurgle.effect.effects[1]).toEqual({ kind: "exile-graveyard", target: { ownerOfTarget: 0 } });
  });

  it("reads 'enchanted creature deals N damage to its owner' and Oblation's shuffle", () => {
    const enslave = face(
      "Test Aura",
      "Enchantment — Aura",
      "Enchant creature\nAt the beginning of your upkeep, enchanted creature deals 1 damage to its owner.",
    );
    expect(enslave.triggered[0].effect).toEqual({ kind: "damage", amount: 1, who: "attached-owner", from: "attached" });
    const oblation = face("Oblation", "Instant", "The owner of target nonland permanent shuffles it into their library, then draws two cards.");
    expect(oblation.complete).toBe(true);
    expect(oblation.effect.effects[1]).toEqual({ kind: "draw", amount: 2, who: { ownerOfTarget: 0 } });
  });

  it("reads the triggers 'returned to a player's hand' and 'into a player's graveyard', with that player their owner", () => {
    const devotion = face("Warped Devotion", "Enchantment", "Whenever a permanent is returned to a player's hand, that player discards a card.");
    expect(devotion.complete).toBe(true);
    expect(devotion.triggered[0].trigger).toEqual({ on: "leaves-battlefield", who: "any", to: ["hand"] });
    expect(devotion.triggered[0].effect).toEqual({ kind: "discard", target: "trigger-owner", amount: 1 });
    const liability = face(
      "Liability",
      "Enchantment",
      "Whenever a nontoken permanent is put into a player's graveyard from the battlefield, that player loses 1 life.",
    );
    expect(liability.complete).toBe(true);
    expect(liability.triggered[0].trigger).toEqual({ on: "leaves-battlefield", who: "any", filter: { token: false }, to: ["graveyard"] });
    expect(liability.triggered[0].effect).toEqual({ kind: "lose-life", amount: 1, who: "trigger-owner" });
  });
});

describe("costs keyed to a spell's target", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'spells your opponents cast that target this creature cost {N} more' and its life form", () => {
    const boreal = face("Boreal Elemental", "Creature — Elemental", "Flying\nSpells your opponents cast that target this creature cost {2} more to cast.");
    expect(boreal.complete).toBe(true);
    expect(boreal.static[0].targetedBySpellsCost).toEqual({ payGeneric: 2 });
    const charix = face("Charix, the Raging Isle", "Legendary Creature — Leviathan Crab", "Spells your opponents cast that target Charix cost {2} more to cast.");
    expect(charix.static[0].targetedBySpellsCost).toEqual({ payGeneric: 2 });
    const terror = face("Test Terror", "Creature — Dragon", "Spells your opponents cast that target this creature cost an additional 3 life to cast.");
    expect(terror.static[0].targetedBySpellsCost).toEqual({ payLife: 3 });
  });

  it("reads 'that target a Merfolk you control' and 'one or more commanders you control', and the abilities' half", () => {
    const kopala = face(
      "Kopala, Warden of Waves",
      "Legendary Creature — Merfolk Wizard",
      "Spells your opponents cast that target a Merfolk you control cost {2} more to cast.\nAbilities your opponents activate that target a Merfolk you control cost {2} more to activate.",
    );
    expect(kopala.complete).toBe(true);
    expect(kopala.static[0].targetedBySpellsCost).toEqual({ payGeneric: 2, targeting: { subtype: "Merfolk", controlledBy: "you" } });
    expect(kopala.static[1].abilityCostModification).toEqual({
      applies: {},
      anyZone: true,
      byOpponents: true,
      targeting: { subtype: "Merfolk", controlledBy: "you" },
      increaseGeneric: 2,
    });
    const esior = face(
      "Esior, Wardwing Familiar",
      "Legendary Creature — Bird",
      "Spells your opponents cast that target one or more commanders you control cost {3} more to cast.",
    );
    expect(esior.static[0].targetedBySpellsCost).toEqual({ payGeneric: 3, targeting: { isCommander: true, controlledBy: "you" } });
  });

  it("reads the same line quoted, granted to what it names", () => {
    const skybonder = face(
      "Jubilant Skybonder",
      "Creature — Human Wizard",
      'Creatures you control with flying have "Spells your opponents cast that target this creature cost {2} more to cast."',
    );
    expect(skybonder.static[0].affects).toEqual({ scope: "filter", filter: { type: "creature", keyword: "flying", controlledBy: "you" } });
    expect(skybonder.static[0].grantsStatic[0].targetedBySpellsCost).toEqual({ payGeneric: 2 });
    const callaphe = face(
      "Test Demigod",
      "Enchantment Creature — Demigod",
      'Creatures and enchantments you control have "Spells your opponents cast that target this permanent cost {1} more to cast."',
    );
    expect(callaphe.static[0].affects).toEqual({
      scope: "filter",
      filter: { typesAnyOf: ["creature", "enchantment"], controlledBy: "you" },
    });
    expect(callaphe.static[0].grantsStatic[0].targetedBySpellsCost).toEqual({ payGeneric: 1 });
  });

  it("reads a reduction on the target's controller's graveyard, and not one of some other count", () => {
    const line = (count: string) =>
      `This spell costs {3} less to cast if it targets a creature whose controller has ${count} in their graveyard.\nGain control of target creature with mana value X.`;
    const domination = face("Lullmage's Domination", "Sorcery", line("eight or more cards"));
    expect(domination.targetCostReduction).toEqual({
      filter: { type: "creature", controllerGraveyardAtLeast: 8 },
      reduceGeneric: 3,
    });
    expect(face("Test Sorcery", "Sorcery", line("eight or fewer cards")).targetCostReduction).toBeUndefined();
  });
});

describe("activation counts this turn", () => {
  const face = (name: string, type_line: string, oracle_text: string) =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'activate no more than twice / three times each turn' as timesEachTurn", () => {
    const imp = face("Pit Imp", "Creature — Imp", "Flying\n{B}: This creature gets +1/+0 until end of turn. Activate no more than twice each turn.");
    expect(imp.complete).toBe(true);
    expect(imp.activated[0].timesEachTurn).toBe(2);
    const rats = face(
      "Sewer Rats",
      "Creature — Rat",
      "{B}, Pay 1 life: This creature gets +1/+0 until end of turn. Activate no more than three times each turn.",
    );
    expect(rats.complete).toBe(true);
    expect(rats.activated[0].timesEachTurn).toBe(3);
  });

  it("reads a limit counted from the permanents you control", () => {
    const wisps = face(
      "Withering Wisps",
      "Enchantment",
      "{B}: This enchantment deals 1 damage to each creature and each player. Activate no more times each turn than the number of snow Swamps you control.",
    );
    expect(wisps.complete).toBe(true);
    expect(wisps.activated[0].timesEachTurn).toEqual({ countOf: { subtype: "Swamp", supertype: "snow", controlledBy: "you" } });
  });

  it("reads 'if this ability has been activated four or more times this turn' as a conditional", () => {
    const card = face(
      "Test Whelp",
      "Creature — Dragon",
      "{R}: This creature gets +1/+0 until end of turn. If this ability has been activated four or more times this turn, draw a card.",
    );
    expect(card.activated[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
        { kind: "conditional", condition: { kind: "activated-this-turn", atLeast: 4 }, then: { kind: "draw", amount: 1 } },
      ],
    });
  });

});

describe("cards outside the battlefield", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Outside", type_line, oracle_text }, { tokenFor: () => null });

  it("reads keyword abilities and types given to cards outside the battlefield", () => {
    const statics = (type_line: string, oracle_text: string) => {
      const card = face(type_line, oracle_text);
      expect(card.complete).toBe(true);
      return card.static[0];
    };
    expect(statics("Artifact", "Each artifact card in your graveyard has unearth {1}{B}{R}.").grantsToGraveyard).toEqual({
      filter: { type: "artifact" },
      keywords: [{ keyword: "unearth", cost: "{1}{B}{R}" }],
    });
    expect(
      statics("Artifact", "Each artifact creature card in your graveyard has encore. Its encore cost is equal to its mana cost.")
        .grantsToGraveyard,
    ).toEqual({ filter: { types: ["artifact", "creature"] }, keywords: [{ keyword: "encore" }] });
    expect(
      statics("Artifact", "Each outlaw creature card in your graveyard has encore {X}, where X is its mana value.").grantsToGraveyard,
    ).toEqual({
      filter: { type: "creature", subtypes: ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"] },
      keywords: [{ keyword: "encore", cost: "mana-value" }],
    });
    expect(
      statics("Artifact", "Each creature card in your graveyard that's a Cleric, Rogue, Warrior, and/or Wizard has unearth {1}{B}.")
        .grantsToGraveyard?.filter,
    ).toEqual({ type: "creature", subtypes: ["Cleric", "Rogue", "Warrior", "Wizard"] });
    expect(statics("Artifact", "Merfolk and Druid cards in your graveyard have retrace.").grantsToGraveyard).toEqual({
      filter: { subtypes: ["Merfolk", "Druid"] },
      keywords: [{ keyword: "retrace" }],
    });
    const six = statics("Artifact", "During your turn, nonland permanent cards in your graveyard have retrace.");
    expect(six.condition).toEqual({ kind: "your-turn" });
    expect(six.grantsToGraveyard?.filter).toEqual({ notTypes: ["land", "instant", "sorcery"] });
    expect(statics("Artifact", "You may cast creature spells from your graveyard using their sneak abilities.").castWithSneakFromGraveyard).toEqual(
      { filter: { type: "creature" } },
    );
    expect(statics("Artifact", "Each creature card in your hand has cycling {1}{U}.").grantsCyclingInHand).toEqual({
      cost: "{1}{U}",
      filter: { type: "creature" },
    });
    expect(statics("Artifact", "Each Sliver card in each player's hand has slivercycling {3}.").grantsCyclingInHand).toEqual({
      cost: "{3}",
      filter: { subtype: "Sliver" },
      search: { subtype: "Sliver" },
      eachPlayer: true,
    });
    expect(
      statics("Artifact", "Each nonland card in your hand without foretell has foretell. Its foretell cost is equal to its mana cost reduced by {2}.")
        .grantsForetellInHand,
    ).toEqual({ filter: { notTypes: ["land"] }, reducedBy: 2 });
    expect(
      statics("Artifact", "Each creature card in your graveyard has the chosen creature type in addition to its other types.")
        .typesOutsideBattlefield,
    ).toEqual({ ofType: "creature", zones: ["graveyard"], addsChosenCreatureType: true });
    const same =
      "The same is true for creature spells you control and creature cards you own that aren't on the battlefield.";
    const conspiracy = statics("Enchantment", `Creatures you control are the chosen type. ${same}`);
    expect(conspiracy.setsChosenCreatureType).toBe(true);
    expect(conspiracy.typesOutsideBattlefield).toEqual({ ofType: "creature", setsChosenCreatureType: true });
    expect(statics("Enchantment", `Creatures you control are artifacts in addition to their other types. ${same}`).typesOutsideBattlefield).toEqual({
      ofType: "creature",
      addTypes: ["artifact"],
    });
    expect(
      statics("Creature — Plant", "Lands you control and land cards you own that aren't on the battlefield are Deserts in addition to their other types.")
        .typesOutsideBattlefield,
    ).toEqual({ ofType: "land", addSubtypes: ["Desert"] });
  });

  it("reads 'gains [keyword] until end of turn' of a graveyard card, and 'whenever you foretell a card'", () => {
    const wrappings = face(
      "Artifact",
      "{T}: Target creature card in your graveyard gains embalm until end of turn. The embalm cost is equal to its mana cost.",
    );
    expect(wrappings.complete).toBe(true);
    expect(wrappings.activated[0].targets).toEqual([{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }]);
    expect(wrappings.activated[0].effect).toEqual({ kind: "grant-graveyard-keyword", target: 0, grant: { keyword: "embalm" } });
    const mass = face("Artifact", "{T}: Each artifact creature card in your graveyard gains unearth {3} until end of turn.");
    expect(mass.activated[0].effect).toEqual({
      kind: "grant-graveyard-keyword",
      filter: { types: ["artifact", "creature"] },
      grant: { keyword: "unearth", cost: "{3}" },
    });
    const devourer = face("Creature — Demon", "Whenever you foretell a card, this creature gets +2/+0 until end of turn.");
    expect(devourer.triggered[0].trigger).toEqual({ on: "foretells", who: "you" });
  });
});

describe("impulse permissions with a window", () => {
  const trigger = (window: string) => {
    const card = parseFace(
      {
        name: "Test Window",
        type_line: "Enchantment",
        oracle_text: `When this enchantment enters, exile the top card of your library. ${window}`,
      },
      { tokenFor: () => null },
    );
    expect(card.complete).toBe(true);
    return card.triggered[0].effect;
  };
  const impulse = { kind: "impulse-exile", amount: 1 };

  it("reads each window", () => {
    expect(trigger("During your next turn, you may play that card.")).toEqual({ ...impulse, duration: "your-next-turn-only" });
    expect(trigger("Until end of combat on your next turn, you may play that card.")).toEqual({
      ...impulse,
      duration: "until-end-of-combat-your-next-turn",
    });
    expect(trigger("You may play that card until you exile another card with this enchantment.")).toEqual({
      ...impulse,
      duration: "until-next-exile",
    });
    expect(trigger("You may play that card for as long as you control this enchantment.")).toEqual({
      ...impulse,
      duration: "while-you-control",
    });
    expect(trigger("During any turn you attacked with this enchantment, you may play that card.")).toEqual({
      ...impulse,
      duration: "while-exiled",
      sourceDid: "attacked",
    });
    expect(trigger("During any turn you put a lore counter on this enchantment, you may play that card.")).toEqual({
      ...impulse,
      duration: "while-exiled",
      sourceDid: "lore-counter",
    });
  });

  it("reads casting only, and leaves a window it doesn't know", () => {
    expect(trigger("You may cast that card until the end of your next turn.")).toEqual({
      ...impulse,
      duration: "your-next-turn",
      castOnly: true,
    });
    const card = parseFace(
      {
        name: "Test Window",
        type_line: "Enchantment",
        oracle_text: "When this enchantment enters, exile the top card of your library. You may play that card next week.",
      },
      { tokenFor: () => null },
    );
    expect(card.complete).toBe(false);
  });

  it("reads a target exiled from your graveyard with a permission", () => {
    const parsed = parseFace(
      {
        name: "Test Window",
        type_line: "Creature — Human",
        oracle_text:
          "When this creature enters, exile up to one target instant or sorcery card from your graveyard. You may cast that card until the end of your next turn.",
      },
      { tokenFor: () => null },
    );
    expect(parsed.complete).toBe(true);
    expect(parsed.triggered[0].targets).toEqual([
      { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } } },
    ]);
    expect(parsed.triggered[0].effect).toEqual({ kind: "exile", target: 0, mayCast: { duration: "your-next-turn" } });

    const victor = parseFace(
      {
        name: "Test Window",
        type_line: "Creature — Human",
        oracle_text: "When this creature enters, exile target card from your graveyard. You may play it for as long as you control this creature.",
      },
      { tokenFor: () => null },
    );
    expect(victor.triggered[0].effect).toEqual({
      kind: "exile",
      target: 0,
      mayCast: { duration: "while-you-control", play: true },
    });
  });
});

describe("token copies of a linked source", () => {
  const read = (type_line: string, oracle_text: string) => {
    const card = parseFace({ name: "Test Copy", type_line, oracle_text }, { tokenFor: () => null });
    expect(card.complete).toBe(true);
    return card;
  };

  it("reads enchanted creature, its fixed P/T too", () => {
    expect(
      read(
        "Enchantment — Aura",
        "Enchant creature\nAt the beginning of your upkeep, create a token that's a copy of enchanted creature.",
      ).triggered[0].effect,
    ).toEqual({ kind: "create-token-copy", of: "enchanted", count: 1, who: "you" });
    expect(
      read(
        "Enchantment — Aura",
        "Enchant creature\nAt the beginning of your upkeep, create a token that's a copy of enchanted creature, except the token is 1/1.",
      ).triggered[0].effect,
    ).toEqual({ kind: "create-token-copy", of: "enchanted", count: 1, who: "you", basePt: [1, 1] });
  });

  it("reads the card exiled with this: one chosen, or the exiled card", () => {
    expect(
      read("Artifact", "{3}, {T}: Create a token that's a copy of a card exiled with this artifact.").activated[0].effect,
    ).toEqual({ kind: "create-token-copy", of: "exiled-with-source", chooseOne: true, count: 1 });
    expect(
      read("Artifact", "{4}, {T}: Create a token that's a copy of the exiled card.").activated[0].effect,
    ).toEqual({ kind: "create-token-copy", of: "exiled-with-source", count: 1 });
  });

  it("reads the card its cost exiled, with its types in addition", () => {
    const card = read(
      "Creature — Human",
      "{1}, {T}, Exile a creature card from your graveyard: Create a token that's a copy of the exiled card, except it isn't legendary and is a Mutant in addition to its other types.",
    );
    expect(card.activated[0].effect).toEqual({
      kind: "create-token-copy",
      of: "exiled-as-cost",
      count: 1,
      notLegendary: true,
      exceptions: { addSubtypes: ["Mutant"] },
    });
  });
});

describe("attack taxes", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Tax", type_line, oracle_text }, { tokenFor: () => null });
  const tax = (rest: string) => {
    const card = face("Enchantment", `Creatures can't attack ${rest}`);
    return card.complete ? card.static[0].attackTax : null;
  };

  it("reads what a tax covers", () => {
    expect(tax("you unless their controller pays {2} for each creature they control that's attacking you.")).toEqual({ generic: 2 });
    expect(tax("you or planeswalkers you control unless their controller pays {1} for each of those creatures.")).toEqual({
      generic: 1,
      covers: "you-and-planeswalkers",
    });
    expect(
      tax("planeswalkers you control unless their controller pays {1} for each creature they control that's attacking a planeswalker you control."),
    ).toEqual({ generic: 1, covers: "planeswalkers" });
  });

  it("reads {X} by a count, and nothing else as {X}", () => {
    expect(
      tax("you or planeswalkers you control unless their controller pays {X} for each of those creatures, where X is the number of enchantments you control."),
    ).toEqual({ generic: { countOf: { type: "enchantment", controlledBy: "you" } }, covers: "you-and-planeswalkers" });
    expect(
      tax("you unless their controller pays {X} for each creature they control that's attacking you, where X is the number of basic land types among lands you control."),
    ).toEqual({ generic: { basicLandTypes: "you" } });
    expect(tax("you unless their controller pays {X} for each of those creatures.")).toBeNull();
    // What it charges for has to be what it guards.
    expect(tax("you unless their controller pays {2} for each creature they control that's attacking a planeswalker you control.")).toBeNull();
  });

  it("reads a tax for a while, in mana or in life", () => {
    const plus = parseEffect(
      "Until your next turn, creatures can't attack you or planeswalkers you control unless their controller pays 2 life for each of those creatures.",
      ctx(),
    );
    expect(plus.effect).toEqual({
      kind: "player-effect",
      duration: "until-your-next-turn",
      attackTax: { life: 2, covers: "you-and-planeswalkers" },
    });
    const chapter = parseEffect("Until your next turn, creatures can't attack you unless their controller pays {2} for each of those creatures.", ctx());
    expect(chapter.effect).toEqual({ kind: "player-effect", duration: "until-your-next-turn", attackTax: { generic: 2 } });
    const war = parseEffect("This turn, creatures can't attack unless their controller pays {X} for each attacking creature they control.", ctx());
    expect(war.effect).toEqual({ kind: "player-effect", duration: "end-of-turn", attackTax: { generic: "x", covers: "all" } });
  });
});

describe("a cost on a creature to attack or block", () => {
  const read = (type_line: string, oracle_text: string) => {
    const card = parseFace({ name: "Test Tax", type_line, oracle_text }, { tokenFor: () => null });
    return card.complete ? card.static[card.static.length - 1] : null;
  };
  const aura = (line: string) => read("Enchantment — Aura", `Enchant creature\n${line}`);
  const own = (line: string) => read("Creature — Golem", line);

  it("reads the creature's own, and an Aura's on its host", () => {
    expect(own("This creature can't attack unless you pay {1} for each +1/+1 counter on it.")).toMatchObject({
      affects: { scope: "self" },
      combatTax: { on: ["attack"], generic: 1, perCounter: "+1/+1" },
    });
    expect(own("This creature can't attack or block unless you pay {2}.")).toMatchObject({
      affects: { scope: "self" },
      combatTax: { on: ["attack", "block"], generic: 2 },
    });
    expect(aura("Enchanted creature can't attack unless its controller pays {3}.")).toMatchObject({
      affects: { scope: "attached" },
      combatTax: { on: ["attack"], generic: 3 },
    });
    expect(aura("Enchanted creature can't attack or block unless its controller pays {1} for each card in your hand.")).toMatchObject({
      combatTax: { on: ["attack", "block"], generic: "cards-in-your-hand" },
    });
    // "You pay" is a creature's own, "its controller pays" an Aura's; and only
    // {1} for each card is a count this reads.
    expect(aura("Enchanted creature can't attack unless you pay {3}.")).toBeNull();
    expect(aura("Enchanted creature can't block unless its controller pays {2} for each card in your hand.")).toBeNull();
  });

  it("reads a block's by the attacker, and the attacker's own", () => {
    expect(own("This creature can't block creatures with power 3 or greater unless you pay {1}.")).toMatchObject({
      combatTax: { on: ["block"], generic: 1, attacker: { power: { op: "gte", n: 3 } } },
    });
    expect(aura("Enchanted creature can't be blocked unless defending player pays {3} for each creature they control that's blocking it.")).toMatchObject({
      affects: { scope: "attached" },
      combatTax: { on: ["be-blocked"], generic: 3 },
    });
  });

  it("reads Nils's, per counter on the attacker", () => {
    expect(
      read(
        "Enchantment",
        "Each creature with one or more counters on it can't attack you or planeswalkers you control unless its controller pays {X}, where X is the number of counters on that creature.",
      ),
    ).toMatchObject({
      affects: { scope: "all-creatures" },
      combatTax: { on: ["attack"], generic: 1, perCounter: "any", covers: "you-and-planeswalkers" },
    });
  });

  it("reads can't attack you, the player alone, by what it names", () => {
    const line = (subject: string) => read("Enchantment", `${subject} can't attack you.`);
    expect(line("Creatures")).toMatchObject({
      affects: { scope: "filter", filter: { type: "creature" } },
      cantAttackController: "player",
    });
    expect(line("Creatures with power 2 or less")).toMatchObject({
      affects: { filter: { type: "creature", power: { op: "lte", n: 2 } } },
    });
    expect(line("Black creatures")).toMatchObject({ affects: { filter: { type: "creature", colors: ["B"] } } });
    expect(line("Creatures without flying")).toMatchObject({ affects: { filter: { type: "creature", notKeyword: "flying" } } });
    expect(line("Creatures of the chosen color without flying")).toMatchObject({
      affects: { filter: { type: "creature", ofChosenColor: true, notKeyword: "flying" } },
    });
    expect(line("Goblins and elves")).toBeNull();
    expect(read("Enchantment", "As long as you're the monarch, creatures with power 2 or less can't attack you.")).toMatchObject({
      condition: { kind: "monarch", who: "you" },
      cantAttackController: "player",
    });
  });

  it("reads the taxes by colour, and the restriction by who it attacked", () => {
    expect(
      read("Enchantment", "Nonblack creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you."),
    ).toMatchObject({
      affects: { filter: { type: "creature", notColors: ["B"] } },
      combatTax: { on: ["attack"], generic: 2, covers: "you" },
    });
    expect(
      read("Enchantment", "Nonblue creatures can't block creatures you control unless their controller pays 1 life for each blocking creature they control."),
    ).toMatchObject({
      affects: { filter: { type: "creature", notColors: ["U"] } },
      combatTax: { on: ["block"], life: 1, attacker: { controlledBy: "you" } },
    });
    expect(own("This creature can't attack a player it has already attacked this turn.")).toMatchObject({
      restrictions: ["cant-attack-player-attacked-this-turn"],
    });
  });

  it("reads creatures can't attack you for a while", () => {
    const escape = parseEffect("Until your next turn, creatures can't attack you.", ctx());
    expect(escape.effect).toEqual({ kind: "player-effect", duration: "until-your-next-turn", cantAttack: "you" });
  });

  it("reads a block tax for the turn", () => {
    const cadence = parseEffect("This turn, creatures can't block unless their controller pays {X} for each blocking creature they control.", ctx());
    expect(cadence.effect).toEqual({ kind: "player-effect", duration: "end-of-turn", blockTax: { generic: "x" } });
  });
});

describe("an unless's payments", () => {
  const read = (sentence: string, context = ctx()) => parseEffect(sentence, context).effect;

  it("reads mana and life together, and life by toughness", () => {
    expect(read("Counter target spell unless its controller pays {1} and 1 life.")).toEqual({
      kind: "unless",
      chooser: 0,
      options: [{ pay: "{1}", andLife: 1, text: "Pay {1} and 1 life" }],
      otherwise: { kind: "counter", target: 0 },
    });
    expect(read("Destroy target creature unless its controller pays life equal to its toughness.")).toEqual({
      kind: "unless",
      chooser: 0,
      options: [{ payLifeAmount: { toughnessOf: 0 }, text: "Pay {X} life" }],
      otherwise: { kind: "destroy", target: 0 },
    });
  });

  it("reads energy", () => {
    expect(read("Then discard a card at random unless you pay {E}{E}.")).toEqual({
      kind: "unless",
      chooser: "you",
      options: [{ payEnergy: 2, text: "Pay {E}{E}" }],
      otherwise: { kind: "discard", target: "you", amount: 1, random: true },
    });
  });

  it("reads returning and tapping a permanent", () => {
    expect(read("Sacrifice it unless you return an untapped Plains you control to its owner's hand.")).toEqual({
      kind: "unless",
      chooser: "you",
      options: [
        {
          returnToHand: { subtype: "Plains", controlledBy: "you", tapped: false },
          text: "Return an untapped Plains you control to its owner's hand",
        },
      ],
      otherwise: { kind: "sacrifice-source" },
    });
    expect(read("Sacrifice it unless you tap an untapped permanent you control.")).toEqual({
      kind: "unless",
      chooser: "you",
      options: [{ tapPermanent: { controlledBy: "you", tapped: false }, text: "Tap an untapped permanent you control" }],
      otherwise: { kind: "sacrifice-source" },
    });
    // Tapping doesn't go to a hand; returning has to say where.
    expect(read("Sacrifice it unless you tap an untapped Plains you control to its owner's hand.")).toBeNull();
    expect(read("Sacrifice it unless you return an untapped Plains you control.")).toBeNull();
  });

  it("reads sacrificing the target", () => {
    expect(read("Target enchantment deals damage equal to its mana value to its controller unless that player sacrifices it.")).toEqual({
      kind: "unless",
      chooser: 0,
      options: [{ sacrificeThat: 0, text: "Sacrifice it" }],
      otherwise: { kind: "damage", amount: { manaValueOf: 0 }, toControllerOfTarget: 0, from: { target: 0 } },
    });
  });
});

describe("P/T bonuses per amount", () => {
  const per = (type_line: string, oracle_text: string) => {
    const card = parseFace({ name: "Test Per", type_line, oracle_text }, { tokenFor: () => null });
    expect(card.complete).toBe(true);
    return card.static[0];
  };
  const AURA = "Enchantment — Aura";

  it("reads a bonus relative to the affected permanent", () => {
    const attached = per(AURA, "Enchant creature\nEnchanted creature gets +2/+2 for each Aura attached to it.");
    expect(attached.affects).toEqual({ scope: "attached" });
    expect(attached.grantPtPerCount).toEqual({
      filter: { subtype: "Aura", attachedTo: { isSource: true } },
      relativeToAffected: true,
      pt: [2, 2],
    });
    expect(per("Creature — Human", "This creature gets +2/+2 for each Aura and Equipment attached to it.").grantPtPerCount).toEqual({
      filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } },
      pt: [2, 2],
    });
    const coat = per(
      "Artifact",
      "Each creature gets +1/+1 for each other creature on the battlefield that shares at least one creature type with it.",
    );
    expect(coat.affects).toEqual({ scope: "all-creatures" });
    expect(coat.grantPtPerCount?.sharesCreatureTypeWithAffected).toBe(true);
    expect(per("Creature — Sliver", "All Sliver creatures get +1/+1 for each other Sliver on the battlefield.").grantPtPerCount).toEqual({
      filter: { subtype: "Sliver" },
      relativeToAffected: true,
      excludeSelf: true,
      pt: [1, 1],
    });
    expect(per("Artifact — Equipment", "Equipped creature gets +X/+X, where X is its mana value.").grantPtPerCount).toEqual({
      ofAffected: "mana-value",
      pt: [1, 1],
    });
    expect(per("Artifact — Equipment", "Equipped creature gets +1/+0 for each of its colors.").grantPtPerCount).toEqual({
      ofAffected: "colors",
      pt: [1, 0],
    });
  });

  it("reads the other amounts", () => {
    expect(per("Creature — Horror", "This creature gets +1/+1 for each poison counter your opponents have.").grantPtPerCount).toEqual({
      playerCounters: "poison",
      playerCountersOf: "opponents",
      pt: [1, 1],
    });
    expect(
      per("Enchantment", "Creatures you control get +X/+X, where X is the number of cards you've drawn this turn.").grantPtPerCount,
    ).toEqual({ turnStat: "cards-drawn", pt: [1, 1] });
    expect(
      per("Artifact — Equipment", "Equipped creature gets +1/+1 for each basic land type among lands you control.").grantPtPerCount,
    ).toEqual({ basicLandTypes: true, pt: [1, 1] });
    expect(per("Creature — Human", "This creature gets +2/+0 for every seven cards in your graveyard.").grantPtPerCount).toEqual({
      inGraveyard: { ownedBy: "you" },
      step: 7,
      pt: [2, 0],
    });
    expect(
      per(AURA, "Enchant creature\nEnchanted creature gets -X/-0, where X is the number of cards in its controller's graveyard.").grantPtPerCount,
    ).toEqual({ inGraveyard: { ownedBy: "you" }, fromAffectedController: true, pt: [-1, 0] });
  });
});

describe("a sweep of the cards put into a graveyard from the battlefield this turn", () => {
  const spell = (text: string) => parseFace({ name: "Test Sweep", type_line: "Instant", oracle_text: text }, { tokenFor: () => null });
  const FROM_BATTLEFIELD = { putIntoGraveyardThisTurn: { from: ["battlefield"] } };

  it("reads 'return to the battlefield / to your hand all … in your graveyard'", () => {
    const reward = spell("Return to the battlefield all permanent cards in your graveyard that were put there from the battlefield this turn.");
    expect(reward.complete).toBe(true);
    expect(reward.effect).toEqual({
      kind: "return-from-graveyard",
      filter: { notTypes: ["instant", "sorcery"], ...FROM_BATTLEFIELD },
      destination: "battlefield",
      count: "all",
    });
    const hand = spell("Return to your hand all cards in your graveyard that were put there from the battlefield this turn.");
    expect(hand.effect).toEqual({ kind: "return-from-graveyard", filter: FROM_BATTLEFIELD, destination: "hand", count: "all" });
  });

  it("reads each player's own, and all graveyards under your control", () => {
    const sunrise = spell(
      "Each player returns to the battlefield all artifact, creature, enchantment, and land cards in their graveyard that were put there from the battlefield this turn.",
    );
    expect(sunrise.complete).toBe(true);
    expect(sunrise.effect).toEqual({
      kind: "return-from-graveyard",
      from: "each-graveyard",
      filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"], ...FROM_BATTLEFIELD },
      destination: "battlefield",
      count: "all",
    });
    const encore = spell("Put onto the battlefield under your control all creature cards in all graveyards that were put there from the battlefield this turn.");
    expect(encore.effect).toEqual({
      kind: "return-from-graveyard",
      from: "all-graveyards",
      filter: { type: "creature", ...FROM_BATTLEFIELD },
      destination: "battlefield",
      count: "all",
    });
  });

  it("leaves a graveyard and a verb that don't go together unread", () => {
    // Another player's card under its owner's control isn't "return".
    const odd = spell("Return to the battlefield all creature cards in their graveyard that were put there from the battlefield this turn.");
    expect(odd.complete).toBe(false);
    // An "and" list of something other than card types.
    const notTypes = spell("Return to your hand all red and blue cards in your graveyard that were put there from the battlefield this turn.");
    expect(notTypes.complete).toBe(false);
  });
});

describe("turning a face-down permanent face up by an effect", () => {
  const face = (type_line: string, oracle_text: string) => parseFace({ name: "Test Turn", type_line, oracle_text }, { tokenFor: () => null });

  it("reads 'turn target face-down creature face up', whoever controls it", () => {
    const open = face("Instant", "Turn target face-down creature an opponent controls face up.");
    expect(open.complete).toBe(true);
    expect(open.targets).toEqual([{ kind: "permanent", filter: { type: "creature", faceDown: true, controlledBy: "opponent" } }]);
    expect(open.effect).toEqual({ kind: "turn-face-up", target: 0 });
    const sculptor = face("Creature — Human Wizard", "{2}{U}: Turn target face-down creature face up.");
    expect(sculptor.complete).toBe(true);
    expect(sculptor.activated[0].targets).toEqual([{ kind: "permanent", filter: { type: "creature", faceDown: true } }]);
    expect(sculptor.activated[0].effect).toEqual({ kind: "turn-face-up", target: 0 });
    const kaust = face("Creature — Dryad", "{T}: Turn target face-down attacking creature you control face up.");
    expect(kaust.activated[0].targets).toEqual([
      { kind: "permanent", filter: { type: "creature", faceDown: true, attacking: true, controlledBy: "you" } },
    ]);
  });

  it("reads 'you may turn a face-down creature you control face up' as a choice as it resolves", () => {
    const mastery = face("Enchantment", "Whenever you attack, you may turn a face-down creature you control face up.");
    expect(mastery.complete).toBe(true);
    expect(mastery.triggered[0].effect).toMatchObject({
      kind: "choose-permanents",
      filter: { type: "creature", faceDown: true, controlledBy: "you" },
      min: 0,
      upTo: 1,
      then: { kind: "turn-face-up", target: 0 },
    });
  });
});

describe("what's done instead of entering (EnterInstead)", () => {
  const land = (oracle_text: string) => parseFace({ name: "Test Vale", type_line: "Land", oracle_text }, { tokenFor: () => null });
  const instead = (face: { static: readonly { replacement?: unknown }[] }) => (face.static[0].replacement as { instead: unknown }).instead;

  it("reads a sacrifice with an 'if you don't'", () => {
    expect(
      instead(land("If this land would enter, sacrifice a Swamp instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.")),
    ).toEqual({ sacrifice: { filter: { subtype: "Swamp" }, count: 1 } });
    expect(
      instead(land("If this land would enter, sacrifice an untapped Mountain instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.")),
    ).toEqual({ sacrifice: { filter: { subtype: "Mountain", tapped: false }, count: 1 } });
    expect(
      instead(land("If this land would enter, sacrifice two untapped lands instead. If you do, put this land onto the battlefield. If you don't, put it into its owner's graveyard.")),
    ).toEqual({ sacrifice: { filter: { type: "land", tapped: false }, count: 2 } });
  });

  it("reads a discard, and a sacrifice with no way to fail", () => {
    const mox = parseFace(
      { name: "Test Mox", type_line: "Artifact", oracle_text: "If this artifact would enter, you may discard a land card instead. If you do, put this artifact onto the battlefield. If you don't, put it into its owner's graveyard." },
      { tokenFor: () => null },
    );
    expect(instead(mox)).toEqual({ discard: { filter: { type: "land" } } });
    expect(
      instead(land("If this land would enter, instead sacrifice each other permanent named Test Vale you control, then put this land onto the battlefield.")),
    ).toEqual({ sacrifice: { filter: { name: "Test Vale" }, count: "all" } });
    const terrain = parseFace({ name: "Test Terrain", type_line: "Enchantment", oracle_text: "As this enchantment enters, sacrifice all lands you control." }, { tokenFor: () => null });
    expect(instead(terrain)).toEqual({ sacrifice: { filter: { type: "land" }, count: "all" } });
  });
});

describe("entering as a copy, or as a choice of forms", () => {
  const creature = (oracle_text: string) => parseFace({ name: "Test Copy", type_line: "Creature — Shapeshifter", oracle_text }, { tokenFor: () => null });

  it("reads a copy of a card in a graveyard or exile", () => {
    expect(creature("You may have this creature enter as a copy of any creature card in a graveyard.").copyOnEnter).toEqual({
      filter: { type: "creature" },
      from: "graveyards",
    });
    expect(
      creature(
        "You may have this creature enter as a copy of any creature card in a graveyard that was put there from the battlefield this turn, except it's a Phyrexian in addition to its other types.",
      ).copyOnEnter,
    ).toEqual({
      filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
      from: "graveyards",
      except: { addSubtypes: ["Phyrexian"] },
    });
    expect(creature("You may have this creature enter as a copy of a creature card in exile with a takeover counter on it.").copyOnEnter).toEqual({
      filter: { type: "creature", counters: { kind: "takeover", compare: { op: "gte", n: 1 } } },
      from: "exile",
    });
    const land = parseFace(
      { name: "Test Deeps", type_line: "Land — Cave", oracle_text: "You may have this land enter tapped as a copy of any land card in a graveyard, except it's a Cave in addition to its other types." },
      { tokenFor: () => null },
    );
    expect(land.copyOnEnter).toEqual({ filter: { type: "land" }, from: "graveyards", tapped: true, except: { addSubtypes: ["Cave"] } });
  });

  it("reads raid, 'when you do', and an exception on what it copied", () => {
    expect(creature("Raid — If you attacked this turn, you may have this creature enter as a copy of any creature on the battlefield.").copyOnEnter).toEqual({
      filter: { type: "creature" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    });
    const wall = creature(
      "You may have this creature enter as a copy of any creature on the battlefield, except it's a Wall in addition to its other types and has defender. When you do, tap the copied creature and it doesn't untap during its controller's untap step for as long as you control this creature.",
    ).copyOnEnter;
    expect(wall.except).toEqual({ addSubtypes: ["Wall"], keywords: ["defender"] });
    expect(wall.whenYouDo.effect.effects[0]).toEqual({ kind: "tap", target: "trigger-object" });
    expect(
      creature("You may have this creature enter as a copy of any creature on the battlefield, except it enters with a shield counter on it if you control that creature.").copyOnEnter.counters,
    ).toEqual([{ kind: "shield", amount: 1, ifYouControlCopied: true }]);
    expect(
      creature("You may have this creature enter as a copy of an artifact or creature you control, except it's an artifact creature in addition to its other types, and its power and toughness are equal to this creature's power and toughness.").copyOnEnter,
    ).toEqual({
      filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
      except: { addTypes: ["artifact", "creature"] },
      ownPt: true,
    });
    // An exception it can't say stays a person's.
    const odd = creature("You may have this creature enter as a copy of any creature on the battlefield, except it has this ability.");
    expect(odd.copyOnEnter).toBeUndefined();
    expect(odd.complete).toBe(false);
  });

  it("reads 'it becomes your choice of', and the coin", () => {
    const clay = creature(
      "As this creature enters, it becomes your choice of a 3/3 artifact creature, a 2/2 artifact creature with flying, or a 1/6 Wall artifact creature with defender in addition to its other types.",
    ).becomesOnEnter;
    expect(clay.forms.map((f: { label: string }) => f.label)).toEqual(["3/3 artifact creature", "2/2 artifact creature with flying", "1/6 Wall artifact creature with defender"]);
    expect(clay.forms[2].as).toEqual({ basePt: [1, 6], addTypes: ["artifact", "creature"], addSubtypes: ["Wall"], keywords: ["defender"] });
    const sentry = creature(
      "As this creature enters, flip a coin. If the coin comes up heads, this creature enters as a 5/2 creature with haste. If it comes up tails, this creature enters as a 2/5 creature with defender.",
    ).becomesOnEnter;
    expect(sentry.flip).toBe(true);
    expect(sentry.forms[0]).toEqual({ label: "5/2 creature with haste", as: { basePt: [5, 2], keywords: ["haste"] } });
  });
});

describe("the turn's blocks", () => {
  const face = (type_line: string, oracle_text: string) => parseFace({ name: "Test Block", type_line, oracle_text }, { tokenFor: () => null });
  const either = (partner: object) => ({ type: "creature", blockedThisTurn: { relation: "either", partner } });

  it("reads 'target creature that blocked or was blocked by …', the partner by type, supertype or color", () => {
    const pass = face("Instant", "Destroy target creature that blocked or was blocked by a legendary creature this turn.");
    expect(pass.complete).toBe(true);
    expect(pass.targets).toEqual([{ kind: "permanent", filter: either({ supertype: "legendary" }) }]);
    expect(pass.effect).toEqual({ kind: "destroy", target: 0 });
    const reflect = face("Instant", "Exile target creature that blocked or was blocked by a Zombie this turn.");
    expect(reflect.targets).toEqual([{ kind: "permanent", filter: either({ subtype: "Zombie" }) }]);
    expect(reflect.effect).toEqual({ kind: "exile", target: 0 });
    const barrage = face("Instant", "Test Block deals 4 damage to target creature that blocked this turn.");
    expect(barrage.targets).toEqual([{ kind: "permanent", filter: { type: "creature", blockedThisTurn: { relation: "blocked" } } }]);
    // A partner it can't say stays unread.
    const odd = face("Instant", "Destroy target creature that blocked or was blocked by a creature with flying this turn.");
    expect(odd.complete).toBe(false);
  });

  it("reads Sea Troll's activation condition", () => {
    const troll = face("Creature — Troll", "{U}: Regenerate this creature. Activate only if this creature blocked or was blocked by a blue creature this turn.");
    expect(troll.complete).toBe(true);
    expect(troll.activated[0].condition).toEqual({
      kind: "source",
      filter: { blockedThisTurn: { relation: "either", partner: { colors: ["U"] } } },
    });
  });

  it.each([
    [
      "Gyruda, Doom of Depths",
      "Your starting deck contains only cards with even mana values.",
      { kind: "each-card", of: "card", test: { manaValueIs: "even" } },
    ],
    [
      "Obosh, the Preypiercer",
      "Your starting deck contains only cards with odd mana values and land cards.",
      { kind: "each-card", of: "nonland", test: { manaValueIs: "odd" } },
    ],
    [
      "Keruga, the Macrosage",
      "Your starting deck contains only cards with mana value 3 or greater and land cards.",
      { kind: "each-card", of: "nonland", test: { manaValueAtLeast: 3 } },
    ],
    [
      "Lurrus of the Dream-Den",
      "Each permanent card in your starting deck has mana value 2 or less.",
      { kind: "each-card", of: "permanent", test: { manaValueAtMost: 2 } },
    ],
    [
      "Kaheera, the Orphanguard",
      "Each creature card in your starting deck is a Cat, Elemental, Nightmare, Dinosaur, or Beast card.",
      { kind: "each-card", of: "creature", test: { subtypeAmong: ["Cat", "Elemental", "Nightmare", "Dinosaur", "Beast"] } },
    ],
    [
      "Zirda, the Dawnwaker",
      "Each permanent card in your starting deck has an activated ability.",
      { kind: "each-card", of: "permanent", test: { hasActivatedAbility: true } },
    ],
    [
      "Jegantha, the Wellspring",
      "No card in your starting deck has more than one of the same mana symbol in its mana cost.",
      { kind: "each-card", of: "card", test: { noRepeatedManaSymbol: true } },
    ],
    [
      "Lutri, the Spellchaser",
      "Each nonland card in your starting deck has a different name.",
      { kind: "different-names", of: "nonland" },
    ],
    [
      "Umori, the Collector",
      "Each nonland card in your starting deck shares a card type.",
      { kind: "shared-card-type", of: "nonland" },
    ],
    [
      "Yorion, Sky Nomad",
      "Your starting deck contains at least twenty cards more than the minimum deck size.",
      { kind: "deck-size-over-minimum", atLeast: 20 },
    ],
  ])("reads %s's companion condition (702.139)", (name, condition, expected) => {
    const parsed = parseFace({
      name,
      type_line: "Legendary Creature — Test",
      oracle_text: `Companion — ${condition} (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)`,
    });
    expect(parsed.companion).toEqual(expected);
    expect(parsed.todo).toEqual([]);
  });

  it("leaves a companion line no template reads to a person", () => {
    const parsed = parseFace({
      name: "Test Companion",
      type_line: "Creature — Test",
      oracle_text: "Companion — Your starting deck contains only blue cards.",
    });
    expect(parsed.companion).toBeUndefined();
    expect(parsed.todo.length).toBe(1);
  });

  it("reads a card's own copy limit (100.2a, 903.5b): any number, and up to seven", () => {
    const rats = parseFace({
      name: "Rat Colony",
      type_line: "Creature — Rat",
      oracle_text: "This creature gets +1/+0 for each other Rat you control.\nA deck can have any number of cards named Rat Colony.",
    });
    expect(rats.deckCopies).toBe("any");
    expect(rats.todo.join("\n")).not.toContain("A deck can have");
    const dwarves = parseFace({
      name: "Seven Dwarves",
      type_line: "Creature — Dwarf",
      oracle_text: "A deck can have up to seven cards named Seven Dwarves.",
    });
    expect(dwarves.deckCopies).toBe(7);
    expect(dwarves.todo).toEqual([]);
    // Someone else's name is no line about this card.
    const other = parseFace({
      name: "Not The Rats",
      type_line: "Creature — Rat",
      oracle_text: "A deck can have any number of cards named Rat Colony.",
    });
    expect(other.deckCopies).toBeUndefined();
    expect(other.todo.length).toBe(1);
  });

  it("reads 'at this turn's next end of combat, destroy all creatures that …', and Ride Down's rider", () => {
    const breath = face("Instant", "Choose target creature. At this turn's next end of combat, destroy all creatures that blocked or were blocked by it this turn.");
    expect(breath.complete).toBe(true);
    expect(breath.targets).toEqual(["creature"]);
    expect(breath.effect).toEqual({
      kind: "delayed-trigger",
      at: "end-of-combat-this-turn",
      effect: { kind: "destroy-all", filter: { type: "creature", blockedThisTurn: { relation: "either", of: 0 } } },
      text: "Destroy all creatures that blocked or were blocked by it this turn.",
    });
    const doom = face("Instant", "Choose target Wall creature. At this turn's next end of combat, destroy all creatures that were blocked by that creature this turn.");
    expect(doom.targets).toEqual([{ kind: "permanent", filter: { type: "creature", subtype: "Wall" } }]);
    expect(doom.effect.effect.filter.blockedThisTurn).toEqual({ relation: "blocked-by", of: 0 });
    const ride = face("Instant", "Destroy target blocking creature. Creatures that were blocked by that creature this combat gain trample until end of turn.");
    expect(ride.effect.effects[1]).toEqual({
      kind: "grant-keyword-all",
      filter: { type: "creature", blockedThisTurn: { relation: "blocked-by", of: 0, thisCombat: true } },
      keyword: "trample",
      duration: "end-of-turn",
    });
  });

  it("reads a limit on the spells a player casts each turn, and 'only one more spell this turn'", () => {
    const limit = (who: string, spells: unknown, line: string) => {
      const card = face("Enchantment", line);
      expect(card.complete).toBe(true);
      expect(card.static).toEqual([
        { affects: { scope: "self" }, prohibits: { who, spells, castLimit: 1 }, text: line },
      ]);
    };
    limit("each-player", true, "Each player can't cast more than one spell each turn.");
    limit("each-player", { notTypes: ["creature"] }, "Each player can't cast more than one noncreature spell each turn.");
    limit("each-player", { notSubtypes: ["Phyrexian"] }, "Each player can't cast more than one non-Phyrexian spell each turn.");
    limit("you", true, "You can't cast more than one spell each turn.");
    limit("enchanted-player", true, "Enchanted player can't cast more than one spell each turn.");
    limit(
      "each-player",
      { notTypes: ["artifact"] },
      "Each player who has cast a nonartifact spell this turn can't cast additional nonartifact spells.",
    );
    const feat = face("Sorcery", "Add seven {R}. You can cast only one more spell this turn.");
    expect(feat.complete).toBe(true);
    expect(feat.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "add-mana", mana: "R", amount: 7 },
        { kind: "player-effect", duration: "end-of-turn", castsLeft: { count: 1 } },
      ],
    });
  });

  it("reads a cost reduction on the next spell, by {N}, by an {X} read as it resolves, and affinity", () => {
    const berserker = face("Creature — Human Berserker", "Whenever this creature attacks, the next spell you cast this turn costs {1} less to cast.");
    expect(berserker.complete).toBe(true);
    expect(berserker.triggered[0].effect).toEqual({ kind: "grant-spells-this-turn", next: true, reduceGeneric: 1 });
    const giants = face("Sorcery", "The next Giant spell you cast this turn costs {2} less to cast.");
    expect(giants.effect).toEqual({ kind: "grant-spells-this-turn", next: true, filter: { subtype: "Giant" }, reduceGeneric: 2 });
    const kaza = face(
      "Creature — Human Wizard",
      "{T}: The next instant or sorcery spell you cast this turn costs {X} less to cast, where X is the number of Wizards you control as this ability resolves.",
    );
    expect(kaza.complete).toBe(true);
    expect(kaza.activated[0].effect).toEqual({
      kind: "grant-spells-this-turn",
      next: true,
      filter: { typesAnyOf: ["instant", "sorcery"] },
      reduceGeneric: { countOf: { subtype: "Wizard", controlledBy: "you" } },
    });
    const muse = face(
      "Creature — Djinn Wizard",
      "Whenever this creature attacks, the next instant or sorcery spell you cast this turn costs {X} less to cast, where X is this creature's power as this ability resolves.",
    );
    expect(muse.triggered[0].effect.reduceGeneric).toEqual({ powerOf: "source" });
    const unread = face("Sorcery", "The next spell you cast this turn costs {X} less to cast.");
    expect(unread.complete).toBe(false);
    const turtles = face(
      "Creature — Mutant Ninja Turtle",
      "Whenever this creature attacks, the next noncreature spell you cast this turn has affinity for artifacts. (It costs {1} less to cast for each artifact you control.)",
    );
    expect(turtles.complete).toBe(true);
    expect(turtles.triggered[0].effect).toEqual({
      kind: "grant-spells-this-turn",
      next: true,
      filter: { notTypes: ["creature"] },
      affinityFor: { type: "artifact", controlledBy: "you" },
    });
  });

  it("reads who may see what, and a look at a library's top card", () => {
    const telepathy = face("Enchantment", "Your opponents play with their hands revealed.");
    expect(telepathy.complete).toBe(true);
    expect(telepathy.static[0].visibility).toEqual({ handsRevealed: "opponents" });
    expect(face("Creature — Illusion", "Flying\nPlayers play with their hands revealed.").static[0].visibility).toEqual({ handsRevealed: "each-player" });
    expect(face("Creature — Faerie Rogue", "Players play with the top card of their libraries revealed.").static[0].visibility).toEqual({ libraryTopRevealed: "each-player" });
    for (const line of [
      "You may look at face-down creatures you don't control any time.",
      "You may look at face-down creatures your opponents control any time.",
    ]) {
      expect(face("Artifact Creature — Golem", line).static[0].visibility).toEqual({ looksAtFaceDownCreatures: true });
    }
    const observer = face("Creature — Merfolk Rogue", "When this creature enters, look at the top card of target player's library.");
    expect(observer.complete).toBe(true);
    expect(observer.triggered[0].effect).toEqual({ kind: "look-at-library-top", target: 0 });
  });

  it("reads a trigger's recipient: that creature, and the player or planeswalker it's attacking", () => {
    const viper = face(
      "Creature — Snake",
      "Whenever this creature deals combat damage to a creature, destroy that creature at end of combat.",
    );
    expect(viper.complete).toBe(true);
    expect(viper.triggered[0].trigger).toEqual({ on: "deals-damage", who: "self", to: "creature", combat: true });
    expect(viper.triggered[0].effect).toEqual({
      kind: "delayed-trigger",
      at: "end-of-combat",
      effect: { kind: "destroy", target: "trigger-recipient" },
      text: "Destroy that creature.",
    });
    const sosuke = face(
      "Creature — Snake Warrior",
      "Whenever a Warrior you control deals combat damage to a creature, destroy that creature at end of combat.",
    );
    expect(sosuke.triggered[0].trigger).toEqual({
      on: "deals-damage",
      who: "you-control",
      filter: { subtype: "Warrior" },
      to: "creature",
      combat: true,
    });
    const mass = face("Creature — Spirit", "Whenever this creature deals combat damage to a creature, that creature becomes a copy of this creature.");
    expect(mass.triggered[0].effect).toEqual({ kind: "become-copy", target: "trigger-recipient", of: "source" });
    const spider = face("Creature — Spider", "Whenever this creature deals combat damage to a creature, put a -1/-1 counter on that creature.");
    expect(spider.triggered[0].effect).toEqual({ kind: "add-counter", target: "trigger-recipient", counter: "-1/-1", amount: 1 });
    const neko = face(
      "Artifact — Equipment",
      "Whenever equipped creature deals damage to a creature, tap that creature. That creature doesn't untap during its controller's untap step for as long as this Equipment remains on the battlefield.",
    );
    expect(neko.complete).toBe(true);
    expect(neko.triggered[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "tap", target: "trigger-recipient" },
        { kind: "restrict", target: "trigger-recipient", restrictions: ["doesnt-untap"], duration: "while-source" },
      ],
    });
    const ogre = face("Creature — Ogre Warrior", "Whenever this creature becomes blocked, it deals 1 damage to the player or planeswalker it's attacking.");
    expect(ogre.complete).toBe(true);
    expect(ogre.triggered[0].effect).toEqual({
      kind: "conditional",
      condition: { kind: "trigger-object", filter: { attacking: true } },
      then: { kind: "damage", amount: 1, toTriggerRecipient: true },
    });
  });
});

describe("revealing from a hand", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Reveal", type_line, oracle_text }, { tokenFor: () => "Treasure Token" });

  it("reads a whole hand shown, alone, beside a life loss and with a count of it", () => {
    const agent = face("Artifact Creature — Human Rogue", "{U}{B}, {T}: Target player loses 1 life and reveals their hand.");
    expect(agent.complete).toBe(true);
    expect(agent.activated[0].targets).toEqual(["player"]);
    expect(agent.activated[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: 1, target: 0 },
        { kind: "reveal-hand", who: 0 },
      ],
    });
    const warrant = face("Sorcery", "Target player reveals their hand. You gain life equal to the number of cards in that player's hand.");
    expect(warrant.complete).toBe(true);
    expect(warrant.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "reveal-hand", who: 0 },
        { kind: "gain-life", amount: { cardsInHand: { target: 0 } } },
      ],
    });
  });

  it("reads a card at random, for the player a trigger is about and for what follows on it", () => {
    const spy = face("Creature — Merfolk Rogue", "Whenever this creature deals combat damage to a player, that player reveals a card at random from their hand.");
    expect(spy.complete).toBe(true);
    expect(spy.triggered[0].effect).toEqual({ kind: "choose-random-card", zone: "hand", whose: "that-player", show: "reveal" });
    const fury = face(
      "Enchantment",
      "{3}{R}: Target opponent reveals a card at random from their hand. This enchantment deals damage equal to that card's mana value to that player. Activate only as a sorcery.",
    );
    expect(fury.complete).toBe(true);
    expect(fury.activated[0].targets).toEqual(["opponent"]);
    expect(fury.activated[0].effect).toEqual({
      kind: "choose-random-card",
      zone: "hand",
      whose: 0,
      show: "reveal",
      slot: 1,
      then: { kind: "damage", target: 0, amount: { manaValueOf: 1 } },
    });
    const mirth = face("Enchantment", "{3}{W}: Target opponent reveals a card at random from their hand. You gain life equal to that card's mana value.");
    expect(mirth.activated[0].effect.then).toEqual({ kind: "gain-life", amount: { manaValueOf: 1 } });
    // What follows unread, none of it is claimed.
    expect(face("Sorcery", "Target player reveals a card at random from their hand. Destroy that card's owner.").complete).toBe(false);
  });

  it("reads up to N cards chosen, and a count of those sharing a mana value", () => {
    const targets: unknown[] = [];
    const parsed = parseEffect(
      "Reveal up to five nonland cards from your hand. For each of those cards that has the same mana value as another card revealed this way, create a Treasure token.",
      { targets, tokenFor: () => "Treasure Token" },
    );
    expect(parsed.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "look-and-choose", zone: "hand", min: 0, max: 5, filter: { notTypes: ["land"] }, destination: "reveal", leftover: "stay" },
        { kind: "create-token", token: "Treasure Token", count: { thisWay: "revealed", who: "you", sharingManaValue: true } },
      ],
    });
  });

  it("reads 'if you do or if you control another', the gain by either road", () => {
    const kincaller = face(
      "Creature — Dinosaur",
      "When this creature enters, you may reveal a Dinosaur card from your hand. If you do or if you control another Dinosaur, you gain 3 life.",
    );
    expect(kincaller.complete).toBe(true);
    expect(kincaller.triggered[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "look-and-choose", zone: "hand", min: 0, max: 1, filter: { subtype: "Dinosaur" }, destination: "reveal", leftover: "stay" },
        {
          kind: "conditional",
          condition: { kind: "this-way", what: "revealed", atLeast: 1 },
          then: { kind: "gain-life", amount: 3 },
          else: {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Dinosaur" }, atLeast: 1, excludeSelf: true },
            then: { kind: "gain-life", amount: 3 },
          },
        },
      ],
    });
  });
});

describe("a card chosen from a set as an effect resolves", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Chooser", type_line, oracle_text }, { tokenFor: () => null });

  it("reads a nonland card from that player's graveyard or hand, and casting it", () => {
    const leak = face("Sorcery", "Target opponent reveals their hand. You choose a nonland card from that player's graveyard or hand and exile it.");
    expect(leak.complete).toBe(true);
    expect(leak.targets).toEqual(["opponent"]);
    expect(leak.effect).toEqual({
      kind: "discard-chosen",
      target: 0,
      filter: { notTypes: ["land"] },
      destination: "exile",
      alsoFrom: { zone: "graveyard", filter: { notTypes: ["land"] } },
    });
    const intrusion = face(
      "Sorcery",
      "Target opponent reveals their hand. You choose a nonland card from that player's graveyard or hand and exile it. You may cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell.",
    );
    expect(intrusion.complete).toBe(true);
    expect(intrusion.effect.mayCast).toEqual({ duration: "while-exiled", spendAs: "any-color" });
  });

  it("reads a card exiled with the source chosen for a hand, the battlefield, or to play", () => {
    const broker = face("Creature — Human Rogue", "{U}{B}, {T}: Return a card exiled with this creature to its owner's hand.");
    expect(broker.complete).toBe(true);
    expect(broker.activated[0].effect).toEqual({
      kind: "look-and-choose",
      zone: "exiled-with-source",
      min: 1,
      max: 1,
      destination: "hand",
      leftover: "stay",
    });
    const purgatory = face(
      "Enchantment",
      "At the beginning of your upkeep, you may pay {4} and 2 life. If you do, return a card exiled with this enchantment to the battlefield.",
    );
    expect(purgatory.complete).toBe(true);
    expect(purgatory.triggered[0].effect).toMatchObject({
      kind: "may",
      cost: "{4}",
      costLife: 2,
      effect: { kind: "look-and-choose", zone: "exiled-with-source", destination: "battlefield", under: "owners" },
    });
    const vessel = face(
      "Artifact",
      "{3}, {T}: Target player exiles a card from their hand. Activate only as a sorcery.\n{1}: Choose a card exiled with this artifact. You may play that card this turn.",
    );
    expect(vessel.complete).toBe(true);
    expect(vessel.activated[1].effect).toEqual({ kind: "choose-exiled-to-play", linked: true });
    // The face reads "exiled with this artifact", so its own exile is linked.
    expect(vessel.activated[0].effect.effect.unlinked).toBeUndefined();
    const elsewhere = face("Sorcery", "Target player exiles a card from their hand.");
    expect(elsewhere.effect.effect.unlinked).toBe(true);
  });

  it("reads up to X such cards after a die, and a copy of one", () => {
    const bag = face(
      "Artifact",
      "{3}, {T}, Sacrifice this artifact: Roll a d10. Return up to X cards from among cards exiled with this artifact to their owners' hands, where X is the result.",
    );
    expect(bag.complete).toBe(true);
    expect(bag.activated[0].effect).toEqual({
      kind: "roll-dice",
      sides: 10,
      then: { kind: "look-and-choose", zone: "exiled-with-source", min: 0, max: { roll: "total" }, destination: "hand", leftover: "stay" },
    });
    const lazav = face(
      "Legendary Creature — Shapeshifter Detective",
      "Whenever you sacrifice a Clue, you may have this creature become a copy of a creature card exiled with it until end of turn.",
    );
    expect(lazav.complete).toBe(true);
    expect(lazav.triggered[0].effect.effect).toEqual({
      kind: "look-and-choose",
      zone: "exiled-with-source",
      min: 1,
      max: 1,
      filter: { type: "creature" },
      destination: "stay",
      leftover: "stay",
      then: { kind: "become-copy", target: "source", of: 0, ofCard: true, until: "end-of-turn" },
    });
  });
});

describe("a tapped-for-mana trigger that uses the stack", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Tap", type_line, oracle_text }, { tokenFor: () => "Spirit Token (Colorless)" });

  it("reads who tapped what, and 'that player'", () => {
    const earth = face("Enchantment", "Whenever a player taps a nonbasic land for mana, this enchantment deals 1 damage to that player.");
    expect(earth.complete).toBe(true);
    expect(earth.triggered[0].trigger).toEqual({ on: "tapped-for-mana", who: "any", filter: { type: "land", notSupertype: "basic" } });
    expect(earth.triggered[0].effect).toEqual({ kind: "damage", amount: 1, who: "trigger-player" });
    const sanctimony = face("Enchantment", "Whenever an opponent taps a Mountain for mana, you may gain 1 life.");
    expect(sanctimony.complete).toBe(true);
    expect(sanctimony.triggered[0].trigger).toEqual({ on: "tapped-for-mana", who: "opponent", filter: { subtype: "Mountain" } });
    const you = face("Creature — Elemental Cat", "Whenever you tap a land for mana, remove a +1/+1 counter from this creature.");
    expect(you.triggered[0].trigger).toEqual({ on: "tapped-for-mana", who: "you-control", filter: { type: "land" } });
  });

  it("reads itself tapped, 'it' as the source; a land tapped, 'it' as the trigger's object", () => {
    const druid = face("Creature — Human Druid", "{T}: Add {G}.\nWhenever you tap this creature for mana, it deals 1 damage to each opponent.");
    expect(druid.complete).toBe(true);
    expect(druid.triggered[0].trigger).toEqual({ on: "tapped-for-mana", who: "self" });
    expect(druid.triggered[0].effect).toEqual({ kind: "damage", amount: 1, who: "each-opponent" });
    const cauldron = face("Artifact", "Whenever a land is tapped for mana, return it to its owner's hand.");
    expect(cauldron.complete).toBe(true);
    expect(cauldron.triggered[0].trigger).toEqual({ on: "tapped-for-mana", who: "any", filter: { type: "land" } });
    expect(cauldron.triggered[0].effect).toEqual({ kind: "return-to-hand", target: "trigger-object" });
  });

  it("reads a target, the token that player's", () => {
    const orchard = face("Land", "Whenever you tap this land for mana, target opponent creates a 1/1 colorless Spirit creature token.");
    expect(orchard.complete).toBe(true);
    expect(orchard.triggered[0].targets).toEqual(["opponent"]);
    expect(orchard.triggered[0].effect).toEqual({ kind: "create-token", token: "Spirit Token (Colorless)", count: 1, who: "target-controller" });
  });
});
describe("a static acting on a player", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Curse", type_line, oracle_text }, { tokenFor: () => null });
  const aura = (line: string) => face("Enchantment — Aura Curse", `Enchant player\n${line}`);
  const creatures = { type: "creature", controlledBy: "enchanted-player" };

  it("reads what the enchanted player controls", () => {
    expect(aura("Creatures enchanted player controls get -1/-1.").static[0]).toMatchObject({
      affects: { scope: "filter", filter: creatures },
      grantPt: [-1, -1],
    });
    expect(aura("Creatures enchanted player controls attack each combat if able.").static[0]).toMatchObject({
      affects: { scope: "filter", filter: creatures },
      restrictions: ["must-attack"],
    });
    expect(
      aura("Nonlegendary creatures enchanted player controls have base power and toughness 3/3 and lose all creature types.").static[0],
    ).toMatchObject({
      affects: { scope: "filter", filter: { ...creatures, notSupertype: "legendary" } },
      setBasePt: { power: 3, toughness: 3 },
      loseCreatureTypes: true,
    });
  });

  it("reads damage to them, the life they gain, and the trigger on being dealt damage", () => {
    expect(aura("If a source would deal damage to enchanted player, it deals double that damage to that player instead.").static[0].replacement).toEqual({
      event: "would-deal-damage",
      multiplier: 2,
      to: "enchanted-player",
    });
    const wound = aura("Enchanted player can't gain life.\nWhenever enchanted player is dealt damage, they lose half their life, rounded up.");
    expect(wound.complete).toBe(true);
    expect(wound.static[0].replacement).toEqual({ event: "would-gain-life", who: "enchanted-player", prevent: true });
    expect(wound.triggered[0].trigger).toEqual({ on: "deals-damage-batch", who: "any", to: "enchanted-player" });
    expect(wound.triggered[0].effect).toEqual({ kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "up" } });
  });

  it("reads Abyssal Persecutor's inverse pair", () => {
    const demon = face("Creature — Demon", "You can't win the game and your opponents can't lose the game.");
    expect(demon.complete).toBe(true);
    expect(demon.static[0]).toMatchObject({ cantWinGame: true, opponentsCantLoseGame: true });
  });
});

describe("a graveyard's order", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Pile", type_line, oracle_text }, { tokenFor: () => null });

  it("reads an exile cost from the top of the pile", () => {
    const alms = face("Enchantment", "{1}, Exile the top card of your graveyard: Prevent the next 1 damage that would be dealt to target creature this turn.");
    expect(alms.complete).toBe(true);
    expect(alms.activated[0].cost.exileFromGraveyard).toEqual({ count: 1, fromTop: true });
    const atog = face("Creature — Atog", "Exile the top creature card of your graveyard: This creature gets +2/+2 until end of turn.");
    expect(atog.complete).toBe(true);
    expect(atog.activated[0].cost.exileFromGraveyard).toEqual({ count: 1, filter: { type: "creature" }, fromTop: true });
  });

  it("reads the effects: the top, the bottom, an 'if it's', a reorder", () => {
    const digger = face("Artifact", "{2}: Put the top card of your graveyard on the bottom of your library.");
    expect(digger.activated[0].effect).toEqual({
      kind: "top-of-graveyard",
      then: { kind: "put-on-library", target: 0, position: "bottom" },
    });
    const furnace = face("Artifact", "{T}: Exile the bottom card of target player's graveyard.");
    expect(furnace.activated[0].targets).toEqual(["player"]);
    expect(furnace.activated[0].effect).toEqual({
      kind: "top-of-graveyard",
      whose: 0,
      bottom: true,
      then: { kind: "exile", target: 0 },
    });
    const spirit = face("Creature — Spirit", "{T}: If the top card of target player's graveyard is a creature card, put that card on top of that player's library.");
    expect(spirit.activated[0].effect).toEqual({
      kind: "top-of-graveyard",
      whose: 0,
      ifIt: { type: "creature" },
      then: { kind: "put-on-library", target: 0, position: "top" },
    });
    const find = face("Sorcery", "Return a card at random from your graveyard to your hand, then reorder your graveyard as you choose.");
    expect(find.complete).toBe(true);
    expect(find.effect.effects[1]).toEqual({ kind: "reorder-graveyard" });
    const grave = face("Instant", "Return the top creature card of your graveyard to the battlefield. That creature gains haste until end of turn. Exile it at the beginning of the next end step.");
    expect(grave.complete).toBe(true);
    expect(grave.effect.kind).toBe("top-of-graveyard");
    expect(grave.effect.filter).toEqual({ type: "creature" });
  });
});

describe("the most common color among permanents", () => {
  const face = (type_line: string, oracle_text: string, name = "Test Common") =>
    parseFace({ name, type_line, oracle_text }, { tokenFor: () => null });

  it("reads a Djinn's color, an Aura's 'unless it shares a color', and a chosen color", () => {
    const djinn = face("Creature — Djinn", "This creature gets -2/-2 as long as white is the most common color among all permanents or is tied for most common.");
    expect(djinn.complete).toBe(true);
    expect(djinn.static[0]).toMatchObject({
      affects: { scope: "self" },
      grantPt: [-2, -2],
      condition: { kind: "most-common-color", color: "W" },
    });
    const aura = face("Enchantment — Aura", "Enchant creature\nEnchanted creature gets +3/+3 unless it shares a color with the most common color among all permanents or a color tied for most common.");
    expect(aura.complete).toBe(true);
    expect(aura.static[0]).toMatchObject({
      affects: { scope: "attached" },
      grantPt: [3, 3],
      condition: { kind: "not", of: { kind: "most-common-color", sharedBy: "attached" } },
    });
    const call = face(
      "Enchantment",
      "As this enchantment enters, choose a color and an opponent.\nWhite creatures get +1/+1 as long as the chosen color is the most common color among nontoken permanents the chosen player controls but isn't tied for most common.\nWhen the chosen color isn't the most common color among nontoken permanents the chosen player controls or is tied for most common, sacrifice this enchantment.",
    );
    const leads = { kind: "most-common-color", color: "chosen", among: { nontoken: true, chosenPlayer: true }, untied: true };
    expect(call.complete).toBe(true);
    expect(call.chooseOnEnter).toEqual(["W", "U", "B", "R", "G"]);
    expect(call.choosePlayerOnEnter).toBe("opponent");
    expect(call.static[0].condition).toEqual(leads);
    expect(call.triggered[0].trigger).toEqual({ on: "state", state: { kind: "not", of: leads } });
  });

  it("reads the same test on a target as an effect resolves", () => {
    const assassin = face(
      "Creature — Assassin",
      "{T}: Destroy target creature if it shares a color with the most common color among all permanents or a color tied for most common. A creature destroyed this way can't be regenerated.",
    );
    expect(assassin.complete).toBe(true);
    expect(assassin.activated[0].effect).toEqual({
      kind: "conditional",
      condition: { kind: "most-common-color", sharedBy: { target: 0 } },
      then: { kind: "destroy", target: 0, cantBeRegenerated: true },
    });
    const unmaking = face("Instant", "Return target permanent to its owner's hand if that permanent shares a color with the most common color among all permanents or a color tied for most common.");
    expect(unmaking.complete).toBe(true);
    expect(unmaking.effect).toEqual({
      kind: "conditional",
      condition: { kind: "most-common-color", sharedBy: { target: 0 } },
      then: { kind: "return-to-hand", target: 0 },
    });
  });
});

describe("doesn't untap during a chosen player's next N untap steps", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Hold", type_line, oracle_text }, { tokenFor: () => null });
  const yours = { doesntUntapNext: true, onlyDoesntUntap: true, untapStepOf: "you" };

  it("reads N and whose step, on a target, on the source, or on the sentence before's object", () => {
    const telekinesis = face(
      "Instant",
      "Tap target creature. Prevent all combat damage that would be dealt by that creature this turn. It doesn't untap during its controller's next two untap steps.",
    );
    expect(telekinesis.complete).toBe(true);
    expect(telekinesis.effect.effects).toEqual([
      { kind: "tap", target: 0 },
      { kind: "damage-rule", by: { target: 0 }, combat: true },
      { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true, doesntUntapSteps: 2 },
    ]);
    const reveka = face("Creature — Dwarf Wizard", "{T}: This creature deals 2 damage to any target and doesn't untap during your next untap step.");
    expect(reveka.complete).toBe(true);
    expect(reveka.activated[0].effect.effects[1]).toEqual({ kind: "tap", target: "source", ...yours });
    const alchemist = face(
      "Creature — Human Cleric",
      "{W}{W}, {T}: Prevent the next 4 damage that would be dealt this turn to target creature you control. Tap that creature. It doesn't untap during your next untap step.",
    );
    expect(alchemist.complete).toBe(true);
    expect(alchemist.activated[0].effect.effects).toEqual([
      { kind: "prevent-damage", target: 0, amount: 4 },
      { kind: "tap", target: 0, doesntUntapNext: true, untapStepOf: "you" },
    ]);
    const vorinclex = face(
      "Creature — Phyrexian Praetor",
      "Whenever an opponent taps a land for mana, that land doesn't untap during its controller's next untap step.",
    );
    expect(vorinclex.complete).toBe(true);
    expect(vorinclex.triggered[0].effect).toEqual({ kind: "tap", target: "trigger-object", doesntUntapNext: true, onlyDoesntUntap: true });
  });

  it("folds a tap and the hold on it into one, and rides a mana ability off the stack (rule 605.1a)", () => {
    const frost = face("Creature — Elemental", "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.");
    expect(frost.complete).toBe(true);
    expect(frost.triggered[0].effect).toEqual({ kind: "tap", target: 0, doesntUntapNext: true });
    const marsh = face("Land", "{T}: Add {B} or {R}. This land doesn't untap during your next untap step.");
    expect(marsh.complete).toBe(true);
    expect(marsh.activated[0].effect.also).toEqual({ kind: "tap", target: "source", ...yours });
  });

  it("leaves another number of steps unread", () => {
    const longer = face("Creature — Wall", "{T}: This creature deals 1 damage to any target and doesn't untap during your next three untap steps.");
    expect(longer.complete).toBe(false);
  });
});

describe("exile until a named event (rule 610.3)", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Test Until", type_line, oracle_text }, { tokenFor: () => null });

  it("a card from a hand, until this creature leaves, revealed or looked at", () => {
    const freebooter = face(
      "Creature — Human Pirate",
      "When this creature enters, target opponent reveals their hand. You choose a noncreature, nonland card from it. Exile that card until this creature leaves the battlefield.",
    );
    expect(freebooter.complete).toBe(true);
    expect(freebooter.triggered[0].effect).toEqual({
      kind: "discard-chosen",
      target: 0,
      filter: { notTypes: ["creature", "land"] },
      destination: "exile",
      untilSourceLeaves: true,
    });
    const maggot = face(
      "Enchantment Creature — Insect",
      "When this creature enters, target opponent reveals their hand and you choose a nonland card from it. Exile that card until this creature leaves the battlefield.",
    );
    expect(maggot.complete).toBe(true);
    expect(maggot.triggered[0].effect.untilSourceLeaves).toBe(true);
    const bat = face(
      "Creature — Bat",
      "When this creature enters, look at target opponent's hand. You may exile a nonland card from it until this creature leaves the battlefield.",
    );
    expect(bat.complete).toBe(true);
    expect(bat.triggered[0].effect).toEqual({
      kind: "discard-chosen",
      target: 0,
      filter: { notTypes: ["land"] },
      lookOnly: true,
      optional: true,
      destination: "exile",
      untilSourceLeaves: true,
    });
  });

  it("until an opponent becomes the monarch, or another target leaves", () => {
    const jailer = face("Creature — Human Soldier", "When this creature enters, exile target creature an opponent controls until an opponent becomes the monarch.");
    expect(jailer.complete).toBe(true);
    expect(jailer.triggered[0].effect).toEqual({ kind: "exile", target: 0, until: "opponent-becomes-monarch" });
    const calix = face("Enchantment", "When this enchantment enters, exile target creature you don't control until target enchantment you control leaves the battlefield.");
    expect(calix.complete).toBe(true);
    expect(calix.triggered[0].targets).toHaveLength(2);
    expect(calix.triggered[0].effect).toEqual({ kind: "exile", target: 0, until: { targetLeaves: 1 } });
  });

  it("leaves a discard with an until, and any other event, unread", () => {
    const discard = face(
      "Creature — Horror",
      "When this creature enters, target opponent reveals their hand. You choose a nonland card from it. That player discards that card until this creature leaves the battlefield.",
    );
    expect(discard.complete).toBe(false);
    const other = face("Enchantment", "When this enchantment enters, exile target creature an opponent controls until an opponent loses the game.");
    expect(other.complete).toBe(false);
  });
});

describe("a number of yours against another player's (player-compare)", () => {
  const face = (type_line: string, oracle_text: string, name = "Thing") =>
    parseFace({ name, type_line, mana_cost: "{1}", oracle_text }, { tokenFor: () => "A Token" });
  const SPELL = "Sorcery";

  it("a spell's own conditional sentence, read as it comes up", () => {
    const fields = face(SPELL, "You gain 4 life. Then if an opponent has more life than you, return Thing to its owner's hand.");
    expect(fields.effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "gain-life", amount: 4 },
        {
          kind: "conditional",
          condition: { kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" },
          then: { kind: "return-to-hand", target: "source", from: "stack" },
        },
      ],
    });
    expect(fields.complete).toBe(true);
    const timely = face(SPELL, "If you have less life than an opponent, you gain 6 life. If you control fewer creatures than an opponent, create three 1/1 white Soldier creature tokens.");
    expect(timely.effect.effects[0].condition).toEqual({ kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" });
    expect(timely.effect.effects[1].condition).toEqual({ kind: "opponent-controls-more", filter: { type: "creature" } });
    const cache = face(SPELL, "You gain 2 life. Then if you have more life than an opponent, draw a card.");
    expect(cache.effect.effects[1].condition).toEqual({ kind: "player-compare", stat: "life", compare: "more", than: "an-opponent" });
  });

  it("a target slot's player, or a planeswalker's controller", () => {
    const dross = face(SPELL, "Target player discards a card. Then if that player has more cards in hand than you, return Thing to its owner's hand.");
    expect(dross.effect.effects[1].condition).toEqual({ kind: "player-compare", stat: "hand", compare: "fewer", than: { target: 0 } });
    expect(dross.complete).toBe(true);
    const forge = face("Instant", "Thing deals 4 damage to target player or planeswalker. Then if that player or that planeswalker's controller has more life than you, return Thing to its owner's hand.");
    expect(forge.effect.effects[1].condition).toEqual({ kind: "player-compare", stat: "life", compare: "fewer", than: { controllerOfTarget: 0 } });
    expect(forge.complete).toBe(true);
  });

  it("the clause after the instruction, and as an intervening-if", () => {
    const beza = face("Creature — Elk", "When Thing enters, create a Treasure token if an opponent controls more lands than you. You gain 4 life if an opponent has more life than you. Draw a card if an opponent has more cards in hand than you.");
    expect(beza.triggered[0].effect.effects.map((e: { condition: unknown }) => e.condition)).toEqual([
      { kind: "opponent-controls-more", filter: { type: "land" } },
      { kind: "player-compare", stat: "life", compare: "fewer", than: "an-opponent" },
      { kind: "player-compare", stat: "hand", compare: "fewer", than: "an-opponent" },
    ]);
    const enforcer = face("Creature — Angel", "At the beginning of each combat, if you have more life than an opponent, this creature gains double strike until end of turn.");
    expect(enforcer.triggered[0].condition).toEqual({ kind: "player-compare", stat: "life", compare: "more", than: "an-opponent" });
  });

  it("a count of the opponents it holds for; no other player's clause is read as one", () => {
    const wojek = face("Creature — Angel", "At the beginning of your upkeep, investigate once for each opponent who has more cards in hand than you.");
    expect(wojek.triggered[0].effect).toEqual({
      kind: "create-token",
      token: "Clue Token",
      count: { countPlayers: "each-opponent", where: { kind: "player-compare", stat: "hand", compare: "fewer", than: "that-player" } },
    });
    expect(face(SPELL, "If a player has more life than you, draw a card.").complete).toBe(false);
    expect(face(SPELL, "If that player has more life than you, draw a card.").complete).toBe(false);
  });
});

describe("amounts read from what has happened this turn", () => {
  const face = (type_line: string, oracle_text: string) =>
    parseFace({ name: "Thing", type_line, mana_cost: "{1}", oracle_text }, { tokenFor: () => "A Token" });
  const CREATURE = "Creature — Insect";

  it("counters put: an amount and intervening-ifs", () => {
    const beetle = face(CREATURE, "At the beginning of your end step, create a 1/1 green Insect creature token for each +1/+1 counter you've put on creatures under your control this turn.");
    expect(beetle.triggered[0].effect).toEqual({
      kind: "create-token",
      token: "A Token",
      count: { countersPutThisTurn: { counter: "+1/+1", onType: "creature", onYours: true } },
    });
    expect(face(CREATURE, "At the beginning of each end step, if you put a counter on a creature this turn, investigate.").triggered[0].condition)
      .toEqual({ kind: "counters-put-this-turn", onType: "creature" });
    expect(face(CREATURE, "At the beginning of each end step, if you put a counter on this creature this turn, investigate.").complete).toBe(false);
    expect(face(CREATURE, "At the beginning of each end step, if a +1/+1 counter was put on a permanent under your control this turn, put a +1/+1 counter on this creature.").triggered[0].condition)
      .toEqual({ kind: "counters-put-this-turn", by: "any-player", counter: "+1/+1", onYours: true });
  });

  it("the total mana value of other spells, and a stat read per player", () => {
    expect(face("Sorcery", "Thing deals damage to each creature your opponents control equal to the total mana value of other spells you've cast this turn.").effect).toEqual({
      kind: "damage-all",
      filter: { type: "creature", controlledBy: "opponent" },
      amount: { castThisTurn: {}, total: "mana-value", other: true },
    });
    expect(face("Enchantment", "At the beginning of each end step, each opponent loses life equal to the life they lost this turn.").triggered[0].effect).toEqual({
      kind: "lose-life",
      who: "each-opponent",
      amount: { turnStat: "life-lost", who: "each" },
    });
  });

  it("cards discarded: a condition, an amount with a target, a cost", () => {
    expect(face(CREATURE, "At the beginning of each end step, if a player discarded a card this turn, draw a card.").triggered[0].condition)
      .toEqual({ kind: "turn-history", what: "discarded", who: "any-player" });
    const salvage = face("Instant", "Draw cards equal to the number of cards target opponent discarded this turn.");
    expect(salvage.effect).toEqual({ kind: "draw", amount: { turnHistory: "discarded", target: 0 } });
    expect(salvage.targets).toEqual(["opponent"]);
    expect(face(CREATURE, "This spell costs {2} less to cast for each card you've cycled or discarded this turn.").selfCostReduction).toEqual({
      condition: { kind: "controls", filter: {}, atLeast: 0 },
      reduceGeneric: { turnHistory: "discarded", times: 2 },
    });
  });

  it("lands entered, and the opponents past a threshold", () => {
    expect(face("Enchantment", "Each creature you control enters with an additional +1/+1 counter on it for each land that entered the battlefield under your control this turn.").static[0].replacement).toEqual({
      event: "others-enter-battlefield",
      filter: { type: "creature", controlledBy: "you" },
      counters: { kind: "+1/+1", amount: { turnHistory: "entered", filter: { type: "land" } } },
    });
    const share = face("Enchantment", "At the beginning of each end step, draw a card for each opponent who drew two or more cards this turn, then create a Treasure token for each opponent who had two or more lands enter the battlefield under their control this turn.");
    const each = (condition: unknown) => ({ countPlayers: "each-opponent", where: { kind: "of-player", player: "that-player", condition } });
    expect(share.triggered[0].effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "draw", amount: each({ kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: 2 }) },
        { kind: "create-token", token: "A Token", count: each({ kind: "turn-history", what: "entered", filter: { type: "land" }, atLeast: 2 }) },
      ],
    });
  });

  it("the opponents attacked; no other 'for each' is read as one", () => {
    const rose = face(CREATURE, "At end of combat on your turn, if you attacked this turn, create a Junk token for each opponent you attacked.");
    expect(rose.triggered[0].trigger).toEqual({ on: "step-begins", step: "end-combat", who: "you" });
    expect(rose.triggered[0].effect).toEqual({ kind: "create-token", token: "A Token", count: { turnStat: "opponents-attacked" } });
    const angel = face(CREATURE, "When this creature enters, create a number of 2/2 white Knight creature tokens with vigilance equal to the number of opponents you attacked this turn.");
    expect(angel.triggered[0].effect).toEqual({ kind: "create-token", token: "A Token", count: { turnStat: "opponents-attacked" } });
    expect(face("Sorcery", "This spell costs {1} less to cast for each opponent you attacked this turn.").selfCostReduction.reduceGeneric).toEqual({ turnStat: "opponents-attacked", who: "you" });
    expect(face("Sorcery", "Draw a card for each opponent who attacked this turn.").complete).toBe(false);
  });

  it("limits on how many creatures attack or block", () => {
    const limit = (text: string) => face("Artifact", text).static?.[0];
    expect(limit("No more than two creatures can attack you each combat.")).toMatchObject({
      affects: { scope: "self" },
      attackLimit: { most: 2, covers: "you" },
    });
    expect(limit("No more than one creature can attack each combat.")).toMatchObject({ attackLimit: { most: 1, covers: "all" } });
    expect(limit("No more than one creature can block each combat.")).toMatchObject({ blockLimit: { most: 1 } });
    expect(limit("No more than one creature can attack this artifact each combat.")).toMatchObject({ attackLimit: { most: 1, covers: "self" } });
    expect(limit("As long as this artifact is tapped, no more than one creature can attack you each combat.")).toMatchObject({
      condition: { kind: "source", filter: { tapped: true } },
      attackLimit: { most: 1, covers: "you" },
    });
    const tomik = limit('Planeswalkers you control have "No more than one creature can attack this planeswalker each combat."');
    expect(tomik).toMatchObject({
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsStatic: [{ attackLimit: { most: 1, covers: "self" } }],
    });
    expect(limit("No more than one creature can block you each combat.")?.blockLimit).toBeUndefined();
    expect(face(CREATURE, "Whenever this creature attacks, each opponent can't block with more than one creature this combat.").triggered?.[0]).toMatchObject({
      effect: { kind: "limit-blockers", who: "each-opponent", most: 1 },
    });
  });

  it("ending the turn and the combat phase (rule 724)", () => {
    expect(face("Instant", "End the turn.").effect).toEqual({ kind: "end-the-turn" });
    expect(face("Instant", "End the combat phase.").effect).toEqual({ kind: "end-the-combat-phase" });
    expect(face("Instant", "Draw a card. End the turn.").effect).toEqual({
      kind: "sequence",
      effects: [{ kind: "draw", amount: 1 }, { kind: "end-the-turn" }],
    });
    expect(face("Sorcery", "If it's your turn, end the turn.").effect).toEqual({
      kind: "conditional",
      condition: { kind: "your-turn" },
      then: { kind: "end-the-turn" },
    });
    expect(face("Artifact", "{1}, {T}: End the turn. Activate only during your turn.").activated[0].effect).toEqual({ kind: "end-the-turn" });
    expect(face(CREATURE, "{T}: The player whose turn it is may end the turn.").activated[0].effect).toEqual({
      kind: "each-player-may",
      who: "active-player",
      prompt: "End the turn?",
      effect: { kind: "end-the-turn" },
    });
  });
});

describe("a number a player chooses", () => {
  const read = (name: string, type_line: string, oracle_text: string, power?: string, toughness?: string) =>
    parseFace({ name, type_line, oracle_text, ...(power !== undefined ? { power, toughness } : {}) });

  it("as an additional cost, read as X (Liquid Fire)", () => {
    const fire = read(
      "Liquid Fire",
      "Sorcery",
      "As an additional cost to cast this spell, choose a number between 0 and 5.\nLiquid Fire deals X damage to target creature and 5 minus X damage to that creature's controller, where X is the chosen number.",
    );
    expect(fire.complete).toBe(true);
    expect(fire.additionalCost).toEqual({ chooseNumber: { min: 0, max: 5 } });
    expect(fire.effect).toEqual({
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: "x", target: 0 },
        { kind: "damage", amount: { sum: [5, { product: ["x", -1] }] }, who: { controllerOfTarget: 0 } },
      ],
    });
  });

  it("by each player in secret, or by a target opponent (a vote of numbers)", () => {
    const wheel = read(
      "Wheel of Misfortune",
      "Sorcery",
      "Each player secretly chooses a number 0 or greater, then all players reveal those numbers simultaneously and determine the highest and lowest numbers revealed this way. Wheel of Misfortune deals damage equal to the highest number to each player who chose that number. Each player who didn't choose the lowest number discards their hand, then draws seven cards.",
    );
    expect(wheel.complete).toBe(true);
    expect(wheel.effect.effects[0]).toEqual({ kind: "vote", choose: true, secret: true, for: { number: { min: 0 } } });

    const ogre = read(
      "Menacing Ogre",
      "Creature — Ogre",
      "Trample, haste\nWhen this creature enters, each player secretly chooses a number. Then those numbers are revealed. Each player with the highest number loses that much life. If you are one of those players, put two +1/+1 counters on this creature.",
      "3",
      "3",
    );
    expect(ogre.complete).toBe(true);
    expect(ogre.triggered[0].effect.effects[2].condition).toEqual({ kind: "voted-number", who: "you", is: "highest" });

    const choice = read(
      "Choice of Damnations",
      "Sorcery — Arcane",
      "Target opponent chooses a number. You may have that player lose that much life. If you don't, that player sacrifices all but that many permanents of their choice.",
    );
    expect(choice.complete).toBe(true);
    expect(choice.effect.effects[0]).toEqual({ kind: "vote", choose: true, who: { target: 0 }, for: { number: {} } });
    expect(choice.effect.effects[1].else.keep).toEqual({ votedNumber: 0 });
  });

  it("by each player in turn, drawing as they go (Diminishing Returns)", () => {
    const returns = read(
      "Diminishing Returns",
      "Sorcery",
      "Each player shuffles their hand and graveyard into their library. You exile the top ten cards of your library. Then each player draws up to seven cards.",
    );
    expect(returns.complete).toBe(true);
    expect(returns.effect.effects[2].effect).toMatchObject({ kind: "choose-value", who: "that-player", max: 7 });
  });

  it("as an enters ability resolves, with an echo of your life total (Volcano Hellion)", () => {
    const hellion = read(
      "Volcano Hellion",
      "Creature — Hellion",
      "This creature has echo {X}, where X is your life total. (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, it deals an amount of damage of your choice to you and target creature. The damage can't be prevented.",
      "6",
      "5",
    );
    expect(hellion.complete).toBe(true);
    expect(hellion.triggered[0].effect.options[0]).toEqual({ payGeneric: { lifeTotal: "you" }, text: "Pay {X}" });
    expect(hellion.triggered[1].effect).toMatchObject({ kind: "choose-value", min: 0 });
  });

  it("as it enters and at upkeep, setting its P/T (Shapeshifter), and an enters menu of numbers alone (Talion)", () => {
    const shifter = read(
      "Shapeshifter",
      "Artifact Creature — Shapeshifter",
      "As this creature enters, choose a number between 0 and 7.\nAt the beginning of your upkeep, you may choose a number between 0 and 7.\nShapeshifter's power is equal to the last chosen number and its toughness is equal to 7 minus that number.",
      "*",
      "7-*",
    );
    expect(shifter.complete).toBe(true);
    expect(shifter.chooseOnEnter).toEqual(["0", "1", "2", "3", "4", "5", "6", "7"]);
    expect(shifter.static[0].setBasePtFromCount).toEqual({
      countOf: "chosen-number",
      plusPower: 0,
      plusToughness: 7,
      toughnessMinusCount: true,
    });
    expect(shifter.triggered[0].effect.effect).toMatchObject({ kind: "choose-value", remember: true, max: 7 });
    expect(read("Elsewhere", "Creature — Bird", "As this creature enters, choose a number between 1 and 3.", "1", "1").chooseOnEnter).toEqual(["1", "2", "3"]);
  });
});

describe("choices kept, the rest destroyed", () => {
  const effectOf = (text: string): unknown => parseEffect(text, { targets: [] }).effect;
  const rest = (filter: object): object => ({ kind: "destroy-all", filter: { ...filter, notThisWay: "chosen" } });

  it("reads each player choosing their own, and what the rest are", () => {
    expect(effectOf("Each player chooses a creature they control. Destroy the rest.")).toEqual({
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, for: { permanent: { type: "creature", controlledBy: "you" }, own: true, keep: true } },
        rest({ type: "creature" }),
      ],
    });
    expect(effectOf("Each player chooses three nonland permanents they control. Destroy all other nonland permanents.")).toEqual({
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, for: { permanent: { notTypes: ["land"], controlledBy: "you" }, own: true, count: 3, keep: true } },
        rest({ notTypes: ["land"] }),
      ],
    });
    expect(effectOf("Each player chooses six lands they control. Destroy all other permanents.")).toEqual({
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, for: { permanent: { type: "land", controlledBy: "you" }, own: true, count: 6, keep: true } },
        rest({}),
      ],
    });
  });

  it("reads the controller choosing any, up to some, one way or the other", () => {
    expect(effectOf("Choose up to one creature. Destroy the rest.")).toEqual({
      kind: "sequence",
      effects: [{ kind: "vote", choose: true, who: "you", for: { permanent: { type: "creature" }, upTo: 1, keep: true } }, rest({ type: "creature" })],
    });
    expect(effectOf("Choose up to two creatures, then destroy the rest.")).toEqual({
      kind: "sequence",
      effects: [{ kind: "vote", choose: true, who: "you", for: { permanent: { type: "creature" }, upTo: 2, keep: true } }, rest({ type: "creature" })],
    });
    expect(effectOf("Choose a creature or planeswalker, then destroy all other creatures and planeswalkers.")).toMatchObject({
      effects: [{ who: "you", for: { keep: true } }, { filter: { notThisWay: "chosen", typesAnyOf: ["creature", "planeswalker"] } }],
    });
  });

  it("reads Fortunate Few and Druid of Purification whole", () => {
    expect(
      effectOf(
        "Choose a nonland permanent you don't control, then each other player chooses a nonland permanent they don't control that hasn't been chosen this way. Destroy all other nonland permanents.",
      ),
    ).toMatchObject({
      effects: [{ startingWith: "you-then-active-player", for: { own: true, permanent: { notThisWay: "chosen" } } }, rest({ notTypes: ["land"] })],
    });
    expect(
      effectOf("Starting with you, each player may choose an artifact or enchantment you don't control. Destroy each permanent chosen this way."),
    ).toEqual({
      kind: "sequence",
      effects: [
        {
          kind: "vote",
          choose: true,
          startingWith: "you",
          for: { permanent: { typesAnyOf: ["artifact", "enchantment"], controlledBy: "opponent" }, upTo: 1 },
        },
        { kind: "destroy-all", filter: { thisWay: "chosen" } },
      ],
    });
  });

  it("leaves a random choice alone: nothing here reads it", () => {
    expect(effectOf("Choose a creature at random, then destroy the rest.")).toBeNull();
  });
});

describe("exchanges with a life total", () => {
  const effectOf = (text: string): unknown => parseEffect(text, { targets: [] }).effect;
  const ability = (name: string, type_line: string, oracle_text: string, power?: string, toughness?: string) =>
    parseFace({ name, type_line, oracle_text, power, toughness }, { tokenFor: () => null }).activated[0];

  it("reads two players' life totals", () => {
    expect(effectOf("Exchange life totals with target opponent.")).toEqual({ kind: "exchange-life-totals", second: { target: 0 } });
    expect(effectOf("Two target players exchange life totals.")).toEqual({
      kind: "exchange-life-totals",
      first: { target: 0 },
      second: { target: 1 },
    });
    expect(effectOf("You may have two target players exchange life totals.")).toMatchObject({
      kind: "may",
      effect: { kind: "exchange-life-totals", first: { target: 0 }, second: { target: 1 } },
    });
  });

  it("reads the clauses that go with them whole", () => {
    expect(effectOf("You may exchange life totals with target opponent. If you lost life this way, draw that many cards.")).toMatchObject({
      kind: "may",
      then: { kind: "draw", amount: { lifeLostThisWay: true, who: "you" } },
    });
    expect(
      effectOf("If the difference between your life total and target player's life total is 5 or less, exchange life totals with that player."),
    ).toEqual({
      kind: "conditional",
      condition: { kind: "player-compare", stat: "life", compare: "within", by: 5, than: { target: 0 } },
      then: { kind: "exchange-life-totals", second: { target: 0 } },
    });
  });

  it("reads a power or a toughness, and an upkeep's restriction", () => {
    expect(ability("Evra", "Creature — Avatar", "{4}: Exchange your life total with Evra's power.", "4", "4").effect).toEqual({
      kind: "exchange-life-stat",
      stat: "power",
      target: "source",
    });
    expect(ability("A Tree", "Creature — Plant", "{T}: Exchange target opponent's life total with this creature's toughness.", "0", "13").effect).toEqual({
      kind: "exchange-life-stat",
      stat: "toughness",
      target: "source",
      player: { target: 0 },
    });
    const mirror = ability("A Mirror", "Artifact", "{T}, Sacrifice this artifact: Exchange life totals with target opponent. Activate only during your upkeep.");
    expect(mirror.condition).toEqual({ kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] });
    expect(mirror.effect).toEqual({ kind: "exchange-life-totals", second: { target: 0 } });
  });

  it("reads attack triggers narrowed by their attackers and the player attacked", () => {
    expect(parseTrigger("Whenever one or more Merfolk you control attack a player")).toEqual([
      { on: "attacks-player", who: "you", defender: "any", filter: { subtype: "Merfolk" } },
    ]);
    expect(parseTrigger("Whenever a creature attacks enchanted player")).toEqual([
      { on: "attacks", who: "any", attackedPlayer: "attached" },
    ]);
  });

  it("reads a 'When you do' naming what the step before made, returned or targeted", () => {
    const opponentCreature = { kind: "optional", of: { kind: "permanent", whose: "opponent", filter: { type: "creature" } } };
    const fight = { kind: "fight", a: "trigger-object", b: 0 };
    const back = ctx();
    const it = "When you do, it fights up to one target creature you don't control.";
    expect(parseEffect(`Return target creature card from your graveyard to the battlefield. ${it}`, back).effect).toEqual({
      kind: "sequence",
      effects: [
        { kind: "put-onto-battlefield", target: 0 },
        { kind: "reflexive-trigger", about: "put-this-way", targets: [opponentCreature], effect: fight, text: it },
      ],
    });
    // The reflexive ability's target is its own, not a slot of the spell's.
    expect(back.targets).toHaveLength(1);
    const curse = "When you do, that creature fights up to one target creature you don't control.";
    expect(
      parseEffect(`Create a Monster Role token attached to target creature you control. ${curse}`, ctx()).effect,
    ).toMatchObject({ effects: [{ kind: "create-token", attachedTo: 0 }, { kind: "reflexive-trigger", about: 0, effect: fight, text: curse }] });
    // Nothing the template knows: the whole thing stays for a person.
    expect(parseEffect(`Draw a card. ${it}`, ctx()).todo).not.toHaveLength(0);
  });
});

describe("references to the source's host and to attachments", () => {
  const aura = (oracle_text: string) =>
    parseFace({ name: "Card", type_line: "Enchantment — Aura", oracle_text }, { tokenFor: (d: string) => d });

  it("reads a live read of the host, and another Aura on it", () => {
    const banner = parseFace(
      {
        name: "Card",
        type_line: "Artifact — Equipment",
        oracle_text:
          "Creatures that share a color with equipped creature get +1/+1.\nCreatures that share a creature type with equipped creature get +1/+1.",
      },
      { tokenFor: (d: string) => d },
    );
    expect(banner.static).toMatchObject([
      { affects: { scope: "filter", filter: { type: "creature", sharesColorWithHost: true } }, grantPt: [1, 1] },
      { affects: { scope: "filter", filter: { type: "creature", sharesCreatureTypeWithHost: true } }, grantPt: [1, 1] },
    ]);
    expect(
      aura("Enchant creature\nAs long as another Aura is attached to enchanted creature, it has first strike and lifelink.")
        .static,
    ).toMatchObject([
      {
        affects: { scope: "attached" },
        condition: { filter: { attachedTo: { attachments: { filter: { subtype: "Aura" }, otherThanSource: true } } } },
        grantKeywords: ["first-strike", "lifelink"],
      },
    ]);
  });

  it("reads a target other than enchanted creature", () => {
    const reading = ctx();
    parseEffect("Target creature other than enchanted creature gets +2/+2 until end of turn.", reading);
    expect(reading.targets).toMatchObject([{ kind: "permanent", whose: "any", filter: { type: "creature", hostOfSource: false } }]);
  });
});

describe("changes of control", () => {
  it("reads the triggers about one, and the delayed ability about the one target", () => {
    expect(parseTrigger("When you lose control of ~")).toEqual([{ on: "loses-control", who: "self" }]);
    expect(parseTrigger("When you gain control of ~ from another player")).toEqual([{ on: "gains-control", who: "self" }]);
    expect(parseTrigger("Whenever an opponent gains control of a permanent from you")).toEqual([{ on: "control-taken" }]);
    const tapIt = parseEffect(
      "Gain control of target creature until end of turn. When you lose control of the creature, tap it.",
      ctx(),
    ).effect;
    expect(tapIt).toMatchObject({
      effects: [{ kind: "gain-control" }, { kind: "delayed-trigger", at: { losesControl: 0 }, effect: { kind: "tap", target: 0 } }],
    });
    // No one target to be about: left for a person.
    expect(parseEffect("When you lose control of the creature, tap it.", ctx()).todo).not.toHaveLength(0);
  });
});

describe("a target's namesakes off the battlefield", () => {
  const face = (name: string, type_line: string, oracle_text: string) => parseFace({ name, type_line, oracle_text });

  it("in your graveyard", () => {
    const echoing = face(
      "Echoing Return",
      "Sorcery",
      "Return target creature card and all other cards with the same name as that card from your graveyard to your hand.",
    );
    expect(echoing.complete).toBe(true);
    expect(echoing.targets).toEqual([{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }]);
    expect(echoing.effect).toEqual({
      kind: "return-from-graveyard",
      filter: { sameNameAsTarget: 0 },
      destination: "hand",
      count: "all",
    });
    const stone = parseEffect(
      "Exile target nonland card from a graveyard, all other cards from graveyards with the same name as that card, and all permanents with that name.",
      ctx(),
    );
    expect(stone.effect.effects.map((e: { kind: string }) => e.kind)).toEqual(["exile-graveyard", "exile-all"]);
  });

  it("in your library", () => {
    const salvage = face(
      "Secret Salvage",
      "Sorcery",
      "Exile target nonland card from your graveyard. Search your library for any number of cards with the same name as that card, reveal them, put them into your hand, then shuffle.",
    );
    expect(salvage.complete).toBe(true);
    expect(salvage.effect.effects[1]).toEqual({
      kind: "search-library",
      filter: { sameNameAsTarget: 0 },
      destination: "hand",
      reveal: true,
      min: 0,
      max: 99,
    });
    const mask = parseEffect(
      "Search your library for a card with the same name as target nontoken creature, put that card onto the battlefield, then shuffle.",
      ctx(),
    );
    expect(mask.effect.filter).toEqual({ sameNameAsTarget: 0 });
  });

  it("in a revealed hand and graveyard", () => {
    const end = face(
      "Legion's End",
      "Sorcery",
      "Exile target creature an opponent controls with mana value 2 or less and all other creatures that player controls with the same name as that creature. Then that player reveals their hand and exiles all cards with that name from their hand and graveyard.",
    );
    expect(end.complete).toBe(true);
    expect(end.effect.effects.map((e: { kind: string }) => e.kind)).toEqual(["exile-all", "reveal-hand", "exile-graveyard"]);
    expect(end.effect.effects[2].fromHand).toBe("also");
    const hour = face(
      "Hour of Glory",
      "Instant",
      "Exile target creature. If that creature was a God, its controller reveals their hand and exiles all cards from it with the same name as that creature.",
    );
    expect(hour.complete).toBe(true);
    expect(hour.effect.effects[1].then.effects[1].fromHand).toBe("only");
    const distortion = face(
      "Thought Distortion",
      "Sorcery",
      "Target opponent reveals their hand. Exile all noncreature, nonland cards from that player's hand and graveyard.",
    );
    expect(distortion.complete).toBe(true);
    expect(distortion.effect.effects[1]).toEqual({
      kind: "exile-graveyard",
      target: 0,
      filter: { notTypes: ["creature", "land"] },
      fromHand: "also",
    });
  });

  it("the target and same-named tokens", () => {
    const ashes = face(
      "Legions to Ashes",
      "Sorcery",
      "Exile target nonland permanent an opponent controls and all tokens that player controls with the same name as that permanent.",
    );
    expect(ashes.complete).toBe(true);
    expect(ashes.effect).toEqual({
      kind: "exile-all",
      filter: { controlledBy: "you", sameNameAsTarget: 0, sameNameTokensOnly: true },
      controlledByTarget: 0,
    });
  });
});

describe("a search of your own zones", () => {
  it("reads \"and/or\" as a choice of zones as it resolves, attached or not", () => {
    const giant = parseEffect(
      "You may search your graveyard, hand, and/or library for an Aura card and put it onto the battlefield attached to this creature. If you search your library this way, shuffle.",
      ctx(),
    );
    expect(giant.todo).toEqual([]);
    expect(giant.effect.kind).toBe("may");
    const modal = giant.effect.effect.effects[0];
    expect(modal.modes.map((mode: { text: string }) => mode.text)).toEqual([
      "Search your graveyard, hand, and library",
      "Search your graveyard and hand",
      "Search your graveyard and library",
      "Search your hand and library",
      "Search your graveyard",
      "Search your hand",
      "Search your library",
    ]);
    expect(modal.modes[3].effect).toEqual({
      kind: "search-library",
      filter: { subtype: "Aura" },
      destination: "battlefield",
      attachedToSource: true,
      min: 0,
      max: 1,
      zones: "hand-and-library",
    });
    const named = parseEffect(
      "Search your graveyard, hand, and/or library for a card named Scion of Darkness and put it onto the battlefield. If you search your library this way, shuffle.",
      ctx(),
    );
    expect(named.effect.kind).toBe("sequence");
    expect(named.effect.effects[0].modes[0].effect.filter).toEqual({ name: "Scion of Darkness" });
  });

  it("reads the same name as that spell, and the printed order of the zones", () => {
    const crown = parseEffect(
      "You may search your library, hand, and/or graveyard for a Rune card and put it onto the battlefield attached to this Equipment. If you search your library this way, shuffle.",
      ctx(),
    );
    expect(crown.effect.effect.effects[0].modes[0].text).toBe("Search your library, hand, and graveyard");
    const mishra = parseEffect(
      "You may search your graveyard, hand, and/or library for a card with the same name as that spell and put it onto the battlefield. If you search your library this way, shuffle.",
      ctx(),
    );
    expect(mishra.effect.effect.effects[0].modes[0].effect.filter).toEqual({ sameNameAsTriggerObject: true });
  });

  it("reads all three zones with no choice, and Doomsday's five", () => {
    expect(
      parseEffect("Search your graveyard, hand, and library for a card named The Spear of Leonidas, put it onto the battlefield, then shuffle.", ctx()).effect,
    ).toEqual({
      kind: "search-library",
      zones: "graveyard-hand-library",
      filter: { name: "The Spear of Leonidas" },
      destination: "battlefield",
      min: 0,
      max: 1,
    });
    const doomsday = parseFace({
      name: "Doomsday",
      type_line: "Sorcery",
      oracle_text:
        "Search your library and graveyard for five cards and exile the rest. Put the chosen cards on top of your library in any order. You lose half your life, rounded up.",
    });
    expect(doomsday.complete).toBe(true);
    expect(doomsday.effect.effects[0]).toMatchObject({ exileRest: true, inAnyOrder: true, destination: "library-top", min: 5 });
  });
});
