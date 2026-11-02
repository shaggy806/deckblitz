/**
 * Companion (rule 702.139): its deck conditions (`companion.ts`), the reveal
 * before the game (103.2b), and the special action that puts it into the hand
 * for {3} (116.2g).
 */
import { describe, expect, it } from "vitest";

import { createDefaultRegistry, defineCard } from "../cards.js";
import { CardRegistry } from "../cards/card-registry.js";
import { companionConditionProblem, companionProblem, hasActivatedAbility } from "../companion.js";
import type { CompanionCondition } from "../companion.js";
import { HeuristicBotController, ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { DeckList } from "../game.js";
import { viewFor } from "../view.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, hand, keywords, lands, nextTurn, pt, settle, spawn, table, toHand, toStep } from "./harness.js";

const reg = createDefaultRegistry();

const check = (condition: CompanionCondition, cards: readonly string[], commanders: readonly string[] = []) =>
  companionConditionProblem(condition, { cards, commanders }, reg);

describe("the conditions (702.139, printed wording in the comments)", () => {
  it("Gyruda: only even mana values, lands (0) among them", () => {
    const even: CompanionCondition = { kind: "each-card", of: "card", test: { manaValueIs: "even" } };
    expect(check(even, ["Forest", "Grizzly Bears", "Sol Ring"])).toBe('"Sol Ring" has mana value 1');
    expect(check(even, ["Forest", "Grizzly Bears"])).toBeNull();
  });

  it("Obosh: odd mana values and land cards", () => {
    const odd: CompanionCondition = { kind: "each-card", of: "nonland", test: { manaValueIs: "odd" } };
    expect(check(odd, ["Forest", "Sol Ring"])).toBeNull();
    expect(check(odd, ["Forest", "Grizzly Bears"])).toBe('"Grizzly Bears" has mana value 2');
  });

  it("Keruga: mana value 3 or greater and land cards, X counting 0 (202.3e)", () => {
    const big: CompanionCondition = { kind: "each-card", of: "nonland", test: { manaValueAtLeast: 3 } };
    expect(check(big, ["Island", "Murder"])).toBeNull();
    expect(check(big, ["Island", "Counterspell"])).toBe('"Counterspell" has mana value 2');
    // {X}{G}: 1 in a library, whatever it may be on the stack.
    expect(check(big, ["Green Sun's Zenith"])).toBe('"Green Sun\'s Zenith" has mana value 1');
  });

  it("Lurrus: each permanent card, instants and sorceries left alone (the ruling)", () => {
    const small: CompanionCondition = { kind: "each-card", of: "permanent", test: { manaValueAtMost: 2 } };
    expect(check(small, ["Forest", "Grizzly Bears", "Time Stretch"])).toBeNull();
    expect(check(small, ["Murder", "Hill Giant"])).toBe('"Hill Giant" has mana value 4');
  });

  it("Kaheera: each creature card is one of the five, changeling too (702.73a)", () => {
    const types: CompanionCondition = {
      kind: "each-card",
      of: "creature",
      test: { subtypeAmong: ["Cat", "Elemental", "Nightmare", "Dinosaur", "Beast"] },
    };
    expect(check(types, ["Forest", "Murder", "Taurean Mauler", "Kaheera, the Orphanguard"])).toBeNull();
    expect(check(types, ["Taurean Mauler", "Hill Giant"])).toBe('"Hill Giant" is none of those types');
  });

  it("Zirda: each permanent card has an activated ability, basics by their land type (305.6)", () => {
    const activated: CompanionCondition = { kind: "each-card", of: "permanent", test: { hasActivatedAbility: true } };
    expect(check(activated, ["Forest", "Breeding Pool", "Sol Ring", "Murder"])).toBeNull();
    expect(check(activated, ["Grizzly Bears"])).toBe('"Grizzly Bears" has no activated ability');
    // A keyword that's an activated ability, not on `activated`: cycling.
    expect(hasActivatedAbility(reg.get("Forgotten Cave"))).toBe(true);
    // And one printed behind "Max speed —", authored as a static that grants it.
    expect(hasActivatedAbility(reg.get("Gas Guzzler"))).toBe(true);
    // A static that isn't one, and a triggered ability that isn't one.
    expect(hasActivatedAbility(reg.get("Fluctuator"))).toBe(false);
    expect(hasActivatedAbility(reg.get("Venerated Stormsinger"))).toBe(false);
  });

  it("Jegantha: the exact symbols, so {W}{W}, {X}{X} and {R/G}{R/G} all fail (the rulings)", () => {
    const once: CompanionCondition = { kind: "each-card", of: "card", test: { noRepeatedManaSymbol: true } };
    expect(check(once, ["Forest", "Grizzly Bears", "Lightning Bolt"])).toBeNull();
    expect(check(once, ["Hill Giant", "Wrath of God"])).toBe('"Wrath of God" repeats a mana symbol in its cost');
    expect(check(once, ["Kaheera, the Orphanguard"])).toBe('"Kaheera, the Orphanguard" repeats a mana symbol in its cost');
  });

  it("Lutri: each nonland card has a different name, basics repeating freely", () => {
    const different: CompanionCondition = { kind: "different-names", of: "nonland" };
    expect(check(different, ["Forest", "Forest", "Murder", "Grizzly Bears"])).toBeNull();
    expect(check(different, ["Murder", "Grizzly Bears", "Murder"])).toBe('the deck has more than one "Murder"');
    // The commander is in the starting deck (702.139b).
    expect(check(different, ["Grizzly Bears"], ["Grizzly Bears"])).toBe('the deck has more than one "Grizzly Bears"');
  });

  it("Umori: one card type every nonland card has, not a chain of pairs (the ruling)", () => {
    const shared: CompanionCondition = { kind: "shared-card-type", of: "nonland" };
    // Artifact creature, creature: creature.
    expect(check(shared, ["Forest", "Grizzly Bears", "Ornithopter"])).toBeNull();
    // Artifact creature, artifact, creature: each pair shares one, all three none.
    expect(check(shared, ["Grizzly Bears", "Ornithopter", "Sol Ring"])).toBe(
      "no card type is shared by every one of those cards",
    );
    expect(check(shared, ["Forest"])).toBeNull();
  });

  it("Yorion: at least twenty over the minimum, and never in Commander (the ruling)", () => {
    const yorion: CompanionCondition = { kind: "deck-size-over-minimum", atLeast: 20 };
    expect(check(yorion, Array<string>(79).fill("Forest"))).toBe("the deck has 79 cards, and this wants at least 80");
    expect(check(yorion, Array<string>(80).fill("Forest"))).toBeNull();
    expect(check(yorion, Array<string>(120).fill("Forest"), ["Krenko, Mob Boss"])).toBe("a Commander deck is exactly 100 cards");
  });

  it("the commander counts toward each-card conditions (702.139b)", () => {
    const small: CompanionCondition = { kind: "each-card", of: "permanent", test: { manaValueAtMost: 2 } };
    expect(check(small, ["Forest"], ["Krenko, Mob Boss"])).toBe('"Krenko, Mob Boss" has mana value 4');
  });

  it("companionProblem: by name, for the deck builder", () => {
    expect(companionProblem("Grizzly Bears", { cards: [] }, reg)).toBe('"Grizzly Bears" has no companion ability');
    expect(companionProblem("Keruga, the Macrosage", { cards: ["Grizzly Bears"] }, reg)).toBe(
      '"Grizzly Bears" has mana value 2',
    );
    expect(companionProblem("Keruga, the Macrosage", { cards: ["Murder"] }, reg)).toBeNull();
  });
});

/** A two-player game of real decks, each seat scripted, stopped at the first
 * thing asked: the point is what's asked. */
function start(
  decks: readonly Omit<DeckList, "player">[],
  opts: { startingPlayer?: PlayerId; mulligans?: boolean } = {},
): { game: Game; a: ScriptedController; b: ScriptedController } {
  const players = [A, B];
  const a = new ScriptedController(A);
  const b = new ScriptedController(B);
  const game = Game.create({
    seed: 1,
    shuffle: false,
    startingPlayer: opts.startingPlayer ?? A,
    mulligans: opts.mulligans ?? false,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 20 },
    controllers: { [A]: a, [B]: b },
    decks: decks.map((deck, i) => ({ ...deck, player: players[i] })),
  });
  return { game, a, b };
}

const SIXTY_MURDERS = Array<string>(60).fill("Murder");

describe("revealing a companion (103.2b)", () => {
  it("asks before the hands are drawn, offering only what the deck fulfils", () => {
    const { game } = start([
      { cards: SIXTY_MURDERS, sideboard: ["Keruga, the Macrosage", "Kaheera, the Orphanguard", "Lightning Bolt"] },
      { cards: SIXTY_MURDERS },
    ]);
    const awaiting = game.state.awaiting;
    if (awaiting?.kind !== "choose-from-zone") throw new Error(`asked ${awaiting?.kind}`);
    expect(awaiting.player).toBe(A);
    expect(awaiting.companion).toBeDefined();
    expect(awaiting.min).toBe(0);
    expect(awaiting.max).toBe(1);
    // Both conditions hold over sixty Murders; a Bolt has no companion ability.
    expect(awaiting.eligible.map((id) => game.state.objects[id].cardName)).toEqual([
      "Keruga, the Macrosage",
      "Kaheera, the Orphanguard",
    ]);
    expect(game.state.zones.perPlayer[A].hand).toEqual([]);
    expect(game.legalActions(A)[0]).toMatchObject({ kind: "choose-from-zone", openingHand: true, destination: "reveal" });
  });

  it("doesn't ask when the deck breaks the condition: the card just stays out there", () => {
    const { game } = start([
      { cards: ["Grizzly Bears", ...SIXTY_MURDERS], sideboard: ["Keruga, the Macrosage"] },
      { cards: SIXTY_MURDERS },
    ]);
    expect(game.state.awaiting?.kind).not.toBe("choose-from-zone");
    expect(game.state.companions).toBeUndefined();
    expect(game.state.outside?.[A]?.length).toBe(1);
  });

  it("doesn't ask a deck with no companion, and draws the hands as ever", () => {
    const { game } = start([{ cards: SIXTY_MURDERS, sideboard: ["Lightning Bolt"] }, { cards: SIXTY_MURDERS }], { mulligans: true });
    expect(game.state.awaiting?.kind).toBe("mulligan");
    expect(game.state.zones.perPlayer[A].hand.length).toBe(7);
  });

  it("the starting player answers first, then turn order, then the mulligans (the rulings)", () => {
    const { game } = start(
      [
        { cards: SIXTY_MURDERS, sideboard: ["Keruga, the Macrosage"] },
        { cards: SIXTY_MURDERS, sideboard: ["Keruga, the Macrosage"] },
      ],
      { startingPlayer: B, mulligans: true },
    );
    const first = game.state.awaiting;
    if (first?.kind !== "choose-from-zone") throw new Error(`asked ${first?.kind}`);
    expect(first.player).toBe(B);
    // Hidden from the other seat until revealed: no ids, no names.
    const hidden = viewFor(game.state, game.registry, A);
    expect(hidden.objects[first.eligible[0]]).toBeUndefined();
    expect(hidden.awaiting).toMatchObject({ kind: "choose-from-zone", eligible: [], ids: [] });

    game.dispatch({ type: "choose-from-zone", player: B, chosen: first.eligible });
    const second = game.state.awaiting;
    if (second?.kind !== "choose-from-zone") throw new Error(`asked ${second?.kind}`);
    expect(second.player).toBe(A);
    // B's is public now; A's isn't anyone's business, and A has seen B's.
    const seen = viewFor(game.state, game.registry, A);
    expect(seen.players[B].companion).toBe(first.eligible[0]);
    expect(seen.objects[first.eligible[0]]?.cardName).toBe("Keruga, the Macrosage");
    expect(seen.players[A].companion).toBeNull();

    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    expect(game.state.awaiting?.kind).toBe("mulligan");
    expect(game.state.companions?.[A]).toBeUndefined();
    expect(game.state.companions?.[B]).toBe(first.eligible[0]);
    const log = game.events.filter((e) => e.type === "companion-revealed");
    expect(log.length).toBe(1);
  });

  it("refuses two: a player may reveal no more than one", () => {
    const { game } = start([
      { cards: SIXTY_MURDERS, sideboard: ["Keruga, the Macrosage", "Kaheera, the Orphanguard"] },
      { cards: SIXTY_MURDERS },
    ]);
    const awaiting = game.state.awaiting;
    if (awaiting?.kind !== "choose-from-zone") throw new Error(`asked ${awaiting?.kind}`);
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [...awaiting.eligible] })).not.toBeNull();
  });

  it("a bot reveals one", () => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      controllers: { [A]: new HeuristicBotController(A) },
      decks: [
        { player: A, cards: SIXTY_MURDERS, sideboard: ["Keruga, the Macrosage"] },
        { player: B, cards: SIXTY_MURDERS },
      ],
    });
    game.advanceUntil((s) => s.turn.number >= 1 && s.awaiting === null);
    expect(game.state.companions?.[A]).toBeDefined();
  });

  it("a Commander deck can bring one (702.139d), its commander counted (702.139b), and nothing else", () => {
    const fits = start([
      {
        cards: Array<string>(99).fill("Forest"),
        commanders: ["Aesi, Tyrant of Gyre Strait"],
        sideboard: ["Keruga, the Macrosage", "Lightning Bolt"],
      },
      { cards: SIXTY_MURDERS },
    ]);
    const awaiting = fits.game.state.awaiting;
    if (awaiting?.kind !== "choose-from-zone") throw new Error(`asked ${awaiting?.kind}`);
    expect(awaiting.eligible.map((id) => fits.game.state.objects[id].cardName)).toEqual(["Keruga, the Macrosage"]);
    expect(fits.game.state.outside?.[A]?.map((id) => fits.game.state.objects[id].cardName)).toEqual(["Keruga, the Macrosage"]);

    // Within the identity, but a mana value 2 card in the deck fails Keruga's condition.
    const fails = start([
      {
        cards: [...Array<string>(98).fill("Forest"), "Grizzly Bears"],
        commanders: ["Aesi, Tyrant of Gyre Strait"],
        sideboard: ["Keruga, the Macrosage"],
      },
      { cards: SIXTY_MURDERS },
    ]);
    expect(fails.game.state.awaiting?.kind).not.toBe("choose-from-zone");
  });

  it("a Commander deck can't reveal one outside its commander's colour identity (903.5c), asked or not", () => {
    // Kaheera is green-white, and Keruga's blue is outside it. The deck meets Keruga's condition.
    const outside = start([
      {
        cards: Array<string>(99).fill("Forest"),
        commanders: ["Kaheera, the Orphanguard"],
        sideboard: ["Keruga, the Macrosage"],
      },
      { cards: SIXTY_MURDERS },
    ]);
    expect(outside.game.state.awaiting?.kind).not.toBe("choose-from-zone");
    expect(outside.game.state.companions?.[A]).toBeUndefined();

    const forests = Array<string>(99).fill("Forest");
    const problem = (commanders: readonly string[]) =>
      companionProblem("Keruga, the Macrosage", { cards: forests, commanders }, reg);
    expect(problem(["Kaheera, the Orphanguard"])).toBe("it's outside the commander's colour identity (WG)");
    expect(problem(["Aesi, Tyrant of Gyre Strait"])).toBeNull();
    // A pair's identity is the union of both (903.4): neither alone covers Keruga's.
    expect(problem(["Kodama of the East Tree"])).toBe("it's outside the commander's colour identity (G)");
    expect(problem(["Sakashima of a Thousand Faces", "Kodama of the East Tree"])).toBeNull();
    // Not a Commander deck, so no identity to fall within.
    expect(problem([])).toBeNull();
  });
});

/** Alice's game with a revealed companion, at her precombat main. */
function tableWithCompanion(players: 2 | 3 | 4 = 2): ReturnType<typeof table> & { companion: ObjectId } {
  // `table` declines the reveal for her (a scripted seat picks the minimum).
  const t = table({ players, sideboard: ["Keruga, the Macrosage"], deck: "Forest" });
  const card = t.game.state.outside![A][0];
  t.game.debugRevealCompanion(A, card);
  return { ...t, companion: card };
}

describe("the special action (116.2g, 702.139a)", () => {
  it("is offered at sorcery timing with {3} available, and moves the card into the hand", () => {
    const t = tableWithCompanion();
    const card = t.companion;
    expect(t.game.legalActions(A).some((a) => a.kind === "take-companion")).toBe(false);
    expect(t.game.canDispatch({ type: "take-companion", player: A })).toContain("cannot pay");

    const forests = lands(t.game, "Forest", 3);
    expect(t.game.legalActions(A).find((a) => a.kind === "take-companion")).toEqual({
      kind: "take-companion",
      card,
      cardName: "Keruga, the Macrosage",
      cost: "{3}",
    });

    t.game.dispatch({ type: "take-companion", player: A });
    expect(hand(t.game)).toContain(card);
    expect(t.game.state.objects[card].zone).toBe("hand");
    expect(forests.every((id) => t.game.state.objects[id].tapped)).toBe(true);
    // Out of the sideboard, and off the table's view of outside the game.
    expect(t.game.state.outside?.[A]).toEqual([]);
    expect(viewFor(t.game.state, t.game.registry, B).players[A].companion).toBeNull();
  });

  it("uses no stack: it's at once, and the player still has priority (116.2g)", () => {
    const t = tableWithCompanion();
    lands(t.game, "Forest", 3);
    t.game.dispatch({ type: "take-companion", player: A });
    expect(t.game.state.zones.shared.stack).toEqual([]);
    expect(t.game.state.priority.holder).toBe(A);
  });

  it("only once: the second time there's no companion (702.139c)", () => {
    const t = tableWithCompanion();
    lands(t.game, "Forest", 6);
    t.game.dispatch({ type: "take-companion", player: A });
    expect(t.game.legalActions(A).some((a) => a.kind === "take-companion")).toBe(false);
    expect(t.game.canDispatch({ type: "take-companion", player: A })).toContain("no companion");
  });

  it("not on an opponent's turn, in combat, or over a spell on the stack", () => {
    const t = tableWithCompanion();
    lands(t.game, "Forest", 6);
    toStep(t.game, "begin-combat");
    expect(t.game.canDispatch({ type: "take-companion", player: A })).toContain("main phase");
    toStep(t.game, "postcombat-main");
    expect(t.game.canDispatch({ type: "take-companion", player: A })).toBeNull();

    spawn(t.game, "Mountain");
    cast(t.game, toHand(t.game, "Lightning Bolt"), { settle: false, targets: [{ kind: "player", player: B }] });
    expect(t.game.state.zones.shared.stack.length).toBe(1);
    expect(t.game.canDispatch({ type: "take-companion", player: A })).toContain("stack is empty");
    settle(t.game);

    nextTurn(t.game);
    expect(t.game.state.turn.step).toBe("precombat-main");
    // Bob's main phase, stack empty, Alice given priority: still not hers.
    t.game.dispatch({ type: "pass-priority", player: B });
    expect(t.game.state.priority.holder).toBe(A);
    expect(t.game.canDispatch({ type: "take-companion", player: A })).toContain("your own turn");
  });

  it("the card plays as a card: cast from the hand, its other abilities on the battlefield only (the rulings)", () => {
    const t = tableWithCompanion();
    const card = t.companion;
    lands(t.game, "Forest", 8);
    // Outside the game its abilities do nothing (400.11c): no trigger, no static.
    t.game.dispatch({ type: "take-companion", player: A });
    cast(t.game, card);
    expect(t.game.state.objects[card].zone).toBe("battlefield");
    // It stays in the game (702.139c): bounced or killed it's a card like any other.
  });

  it("a wish can bring a constructed companion in first, and then there's no action left", () => {
    const t = tableWithCompanion();
    const card = t.companion;
    lands(t.game, "Forest", 6);
    t.a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    cast(t.game, toHand(t.game, "Living Wish"));
    expect(t.game.state.objects[card].zone).toBe("hand");
    expect(t.game.canDispatch({ type: "take-companion", player: A })).toContain("no companion");
    expect(viewFor(t.game.state, t.game.registry, B).players[A].companion).toBeNull();
  });

  it("a wish can't find one in a Commander game: only the special action brings it in (702.139d)", () => {
    const a = new ScriptedController(A);
    const game = Game.create({
      seed: 1,
      shuffle: false,
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 40 },
      controllers: { [A]: a },
      skipCompanionReveals: true,
      decks: [
        { player: A, cards: Array<string>(99).fill("Forest"), commanders: ["Aesi, Tyrant of Gyre Strait"], sideboard: ["Keruga, the Macrosage"] },
        { player: B, cards: SIXTY_MURDERS },
      ],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    const card = game.state.outside![A][0];
    game.debugRevealCompanion(A, card);
    // Its sideboard is none, for the panel as for the wish.
    expect(viewFor(game.state, game.registry, A).players[A].sideboardSize).toBe(0);
    expect(viewFor(game.state, game.registry, A).zones.sideboard).toEqual([]);
    expect(viewFor(game.state, game.registry, B).players[A].companion).toBe(card);

    lands(game, "Forest", 6);
    const asked: number[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push(eligible.length);
      return [];
    };
    cast(game, toHand(game, "Living Wish"));
    expect(asked).toEqual([]);
    expect(game.state.objects[card].zone).toBe("outside");

    game.dispatch({ type: "take-companion", player: A });
    expect(game.state.objects[card].zone).toBe("hand");
  });

  it("the other seats at a four-player table see it, and it's nobody's action but its owner's", () => {
    const t = tableWithCompanion(4);
    const card = t.companion;
    lands(t.game, "Forest", 3);
    for (const seat of [B, C]) {
      const view = viewFor(t.game.state, t.game.registry, seat);
      expect(view.players[A].companion).toBe(card);
      expect(view.objects[card]?.cardName).toBe("Keruga, the Macrosage");
      expect(view.players[A].sideboardSize).toBe(1);
      expect(view.zones.sideboard).toEqual([]);
    }
    expect(t.game.canDispatch({ type: "take-companion", player: B })).toContain("no companion");
  });
});

describe("the proving cards", () => {
  it("Kaheera: other creatures of the five types get +1/+1 and vigilance, once for two types", () => {
    const { game } = table();
    const kaheera = spawn(game, "Kaheera, the Orphanguard");
    const twoTypes = spawn(game, "Kaheera, the Orphanguard");
    const bears = spawn(game, "Grizzly Bears");
    const rival = spawn(game, "Kaheera, the Orphanguard", B);
    // Each Kaheera lifts the other once, however many of the five it is.
    expect(pt(game, kaheera)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, twoTypes)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, rival)).toEqual({ power: 3, toughness: 2 });
    const cat = spawn(game, "Taurean Mauler");
    expect(keywords(game, cat).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(false);
  });

  it("Keruga: draws for each other permanent you control with mana value 3 or greater", () => {
    const { game } = table({ deck: "Forest" });
    spawn(game, "Hill Giant");
    spawn(game, "Murder Investigation");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    const before = hand(game).length;
    game.debugSpawn("Keruga, the Macrosage", A, "battlefield", { announceEntry: true });
    settle(game);
    // Hill Giant (4); Murder Investigation ({1}{W}, 2) and the Bears don't, nor Bob's.
    expect(hand(game).length).toBe(before + 1);
  });

  it("a definition without the ability has no condition, and a registry of test cards can hold one", () => {
    const local = new CardRegistry();
    const zero = defineCard({ name: "Test Companion", types: ["creature"], text: "", companion: { kind: "deck-size-over-minimum", atLeast: 0 } });
    local.register(zero);
    expect(local.get("Test Companion").companion).toEqual({ kind: "deck-size-over-minimum", atLeast: 0 });
  });
});
