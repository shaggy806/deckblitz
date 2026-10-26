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
    // Exert as a cost (rule 701.43 — Steward of Solidarity).
    expect(parseCost("{T}, Exert ~").cost).toEqual({ mana: null, tap: true, exertSelf: true });
    expect(parseCost("{2}, Exile the top card of your library").cost).toEqual({ mana: "{2}", tap: false, exileTop: 1 });
    expect(parseCost("{3}, Exile the top four cards of your library").cost).toEqual({ mana: "{3}", tap: false, exileTop: 4 });
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
    expect(face("Improvise", "Sorcery", {}).improvise).toBe(true);
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
    expect(face("Splice onto Arcane {1}{R}").complete).toBe(false);
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

  it("a source of your choice (rule 609.7) and a colour set (layer 5) — Alpha's Circles and Laces", () => {
    const circle = face("{1}: The next time a red source of your choice would deal damage to you this turn, prevent that damage.", "Enchantment");
    expect(circle.activated[0].effect).toEqual({
      kind: "prevent-damage-from-chosen-source",
      filter: { colors: ["R"] },
      to: "you",
      amount: "next-time",
    });
    expect(circle.complete).toBe(true);
    const lace = face("Target spell or permanent becomes black. (Mana symbols on that permanent remain unchanged.)", "Instant");
    expect(lace.targets).toEqual([{ kind: "spell-or-permanent" }]);
    expect(lace.effect).toEqual({ kind: "become-color", target: 0, colors: ["B"], duration: "permanent" });
    expect(lace.complete).toBe(true);
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

  it("buyback (rule 702.27): a kicker whose cast returns to its owner's hand", () => {
    const spell = face(
      "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nDraw a card.",
      "Instant",
    );
    expect(spell.kicker).toEqual({ cost: "{3}", keyword: "buyback" });
    expect(spell.complete).toBe(true);
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

  it("learn (rule 701.48a): the rummage alone, as `learn()` writes it — no sideboard, so no Lesson to fetch", () => {
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

describe("agreement with the hand-authored pool", () => {
  it("every ability the parser claims complete matches the authored one", () => {
    const { stats, mismatches } = checkPool(POOL_CARDS);
    expect(stats.claimed).toBeGreaterThan(400);
    expect(mismatches.map((m: { card: string; text: string }) => `${m.card}: ${m.text}`)).toEqual([]);
  });
});
