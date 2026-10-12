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
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
// @ts-expect-error — a plain .mjs script, typed only at runtime.
import { parseFace, parseTrigger, parseCost, parseSentence, parseTypePhrase } from "../../scripts/oracle-parse.mjs";
// @ts-expect-error — as above.
import { checkPool } from "../../scripts/oracle-parse-check.mjs";

type Ctx = { targets: unknown[]; target: (spec: unknown) => number; tokenFor: () => string | null; onStack?: boolean };
const ctx = (overrides: Partial<Ctx> = {}): Ctx => {
  const targets: unknown[] = [];
  return { targets, target: (spec) => targets.push(spec) - 1, tokenFor: () => null, ...overrides };
};

describe("effect templates", () => {
  it.each([
    ["Draw two cards.", { kind: "draw", amount: 2 }],
    ["You gain 3 life.", { kind: "gain-life", amount: 3 }],
    ["Each opponent loses 1 life.", { kind: "lose-life", amount: 1, who: "each-opponent" }],
    ["~ deals 3 damage to any target.", { kind: "damage", amount: 3, target: 0 }],
    ["Destroy target nonland permanent.", { kind: "destroy", target: 0 }],
    ["Scry 2.", { kind: "scry", amount: 2 }],
    ["~ gets +1/+0 until end of turn.", { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" }],
    ["Target creature gains flying until end of turn.", { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" }],
    ["Add {G}.", { kind: "add-mana", mana: "G", amount: 1 }],
    ["Add {R} or {G}.", { kind: "add-mana", mana: { oneOf: ["R", "G"] }, amount: 1 }],
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
    // Discard as a cost isn't modeled.
    expect(parseCost("{1}, Discard a card")).toBeNull();
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
    expect(parseTrigger("Whenever another Zombie you control enters")).toEqual([
      { on: "enters-battlefield", who: "you-control", filter: { subtype: "Zombie" }, otherOnly: true },
    ]);
    expect(parseTrigger("At the beginning of combat on your turn")).toEqual([
      { on: "step-begins", step: "begin-combat", who: "you" },
    ]);
    expect(parseTrigger("Whenever you cast an instant or sorcery spell")).toEqual([
      { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
    ]);
    expect(parseTrigger("Whenever you cycle or discard another card")).toBeNull();
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
    expect(face("Convoke", "Instant", {}).convoke).toBe(true);
    // Mayhem: a cost, or none on a land (played from the graveyard).
    expect(face("Mayhem {4}{R}").mayhem).toEqual({ cost: "{4}{R}" });
    expect(face("Mayhem", "Land").mayhem).toEqual({});
    expect(face("Rebound", "Instant", {}).rebound).toBe(true);
    expect(face("Teamwork 4", "Instant", {}).kicker).toEqual({ cost: "", keyword: "teamwork", teamwork: 4 });
    expect(face("Sneak {1}{R}{R}").sneak).toEqual({ cost: "{1}{R}{R}" });
    // Web-slinging (rule 702.188a): the line, its reminder text stripped.
    const slinger = face(
      "Web-slinging {R}{G} (You may cast this spell for {R}{G} if you also return a tapped creature you control to its owner's hand.)",
    );
    expect(slinger.webSlinging).toEqual({ cost: "{R}{G}" });
    expect(slinger.complete).toBe(true);
    expect(face("Basic landcycling {1}").cycling).toEqual({ cost: "{1}", search: { supertype: "basic", type: "land" } });
    expect(face("Undying").triggered[0].trigger).toEqual({ on: "dies", who: "self" });
    const fab = face("Fabricate 2").triggered[0];
    // The choice only while it's still there; gone, the Servos (rule 702.123a's ruling).
    expect(fab.effect.condition).toEqual({ kind: "source-on-battlefield" });
    expect(fab.effect.then.modes.map((m: { effect: { kind: string } }) => m.effect.kind)).toEqual(["add-counter", "create-token"]);
    expect(fab.effect.else).toEqual({ kind: "create-token", token: "Servo Token", count: 2 });
    // A keyword the engine doesn't run leaves the line to a person.
    expect(face("Bushido 2").complete).toBe(false);
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
});

describe("agreement with the hand-authored pool", () => {
  it("every ability the parser claims complete matches the authored one", () => {
    const { stats, mismatches } = checkPool(POOL_CARDS);
    expect(stats.claimed).toBeGreaterThan(400);
    expect(mismatches.map((m: { card: string; text: string }) => `${m.card}: ${m.text}`)).toEqual([]);
  });
});
