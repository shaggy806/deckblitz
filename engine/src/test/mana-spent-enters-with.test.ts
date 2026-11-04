/**
 * Mana that adds counters to the spell it's spent on (`add-mana`'s
 * `spellEntersWith`, rules 106.6 and 614.1c), and the commander casts of a
 * target player (`{ commanderCasts: <slot> }`).
 */
import { describe, expect, it } from "vitest";
import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import { A, B, cast, counters, hand, lands, ref, spawn, table, toHand } from "./harness.js";
import type { ObjectId } from "../primitives.js";
import type { Color } from "../mana.js";

const COMMANDER = "Anafenza, the Foremost"; // {W}{B}{G}, a 4/4

function commanderGame(): { game: Game; a: ScriptedController } {
  const a = new ScriptedController(A);
  const b = new ScriptedController(B);
  const game = Game.create({
    seed: 1,
    shuffle: false,
    startingPlayer: A,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    controllers: { [A]: a, [B]: b },
    decks: [
      { player: A, cards: Array<string>(40).fill("Wastes"), commanders: [COMMANDER] },
      { player: B, cards: Array<string>(40).fill("Wastes") },
    ],
  });
  game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
  return { game, a };
}

const commanderIn = (game: Game): ObjectId =>
  Object.values(game.state.objects).find((o) => o.isCommander === true && o.cardName === COMMANDER)!.id;

const pool = (game: Game) => game.state.players[A].manaPool;

/** `land`'s second ability ("{1}, {T}: Add one mana of any color"), a Wastes
 * tapped for the {1}. */
function floatFrom(game: Game, land: ObjectId, color: Color): void {
  lands(game, "Wastes", 1);
  game.dispatch({ type: "activate-ability", player: A, source: land, abilityIndex: 1, targets: [], manaColors: [color] });
}

function floatPlain(game: Game, basic: string): void {
  const [land] = lands(game, basic, 1);
  game.dispatch({ type: "activate-ability", player: A, source: land, abilityIndex: 0, targets: [] });
}

/** Animal Attendant's mana. */
function floatAttendant(game: Game, color: Color): void {
  const attendant = spawn(game, "Animal Attendant");
  game.dispatch({ type: "activate-ability", player: A, source: attendant, abilityIndex: 0, targets: [], manaColors: [color] });
}

describe("Opal Palace", () => {
  it("{T}: Add {C}, the plain half, adds nothing", () => {
    const { game } = commanderGame();
    const palace = spawn(game, "Opal Palace");
    game.dispatch({ type: "activate-ability", player: A, source: palace, abilityIndex: 0, targets: [] });
    expect(pool(game).map((u) => u.type)).toEqual(["C"]);
    expect(pool(game)[0].spellEntersWith).toBeUndefined();
  });

  it("the first cast from the command zone enters with one counter: the count includes this cast (the ruling)", () => {
    const { game } = commanderGame();
    floatFrom(game, spawn(game, "Opal Palace"), "G");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const commander = commanderIn(game);
    cast(game, commander);
    expect(game.state.objects[commander].zone).toBe("battlefield");
    expect(counters(game, commander)).toBe(1);
  });

  it("without its mana the commander enters with none", () => {
    const { game } = commanderGame();
    spawn(game, "Opal Palace");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const commander = commanderIn(game);
    cast(game, commander);
    expect(game.state.objects[commander].zone).toBe("battlefield");
    expect(counters(game, commander)).toBe(0);
  });

  it("the second cast enters with two", () => {
    const { game } = commanderGame();
    const commander = commanderIn(game);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    cast(game, commander);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(commander)] });
    expect(game.state.objects[commander].zone).toBe("command");

    floatFrom(game, spawn(game, "Opal Palace"), "G");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2); // the tax
    cast(game, commander);
    expect(game.state.players[A].commanderCastCounts[COMMANDER]).toBe(2);
    expect(counters(game, commander)).toBe(2);
  });

  it("each unit adds its own: Mana Reflection's two mana on a second cast is four (the ruling)", () => {
    const { game } = commanderGame();
    game.state.players[A].commanderCastCounts[COMMANDER] = 1;
    spawn(game, "Mana Reflection");
    floatFrom(game, spawn(game, "Opal Palace"), "G");
    expect(pool(game).filter((u) => u.spellEntersWith !== undefined).length).toBe(2);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const commander = commanderIn(game);
    cast(game, commander);
    expect(counters(game, commander)).toBe(4);
  });

  it("offers only your commander's identity", () => {
    const { game } = commanderGame();
    const palace = spawn(game, "Opal Palace");
    lands(game, "Wastes", 1);
    const offer = game
      .legalActions(A)
      .find((a) => a.kind === "activate-ability" && a.source === palace && a.abilityIndex === 1);
    expect(offer).toBeDefined();
    expect(game.canDispatch({ type: "activate-ability", player: A, source: palace, abilityIndex: 1, targets: [], manaColors: ["W"] })).toBeNull();
    game.dispatch({ type: "activate-ability", player: A, source: palace, abilityIndex: 1, targets: [], manaColors: ["U"] });
    expect(pool(game).filter((u) => u.type === "U")).toEqual([]);
  });

  it("cast from hand, it counts the casts from the command zone so far", () => {
    const { game, a } = commanderGame();
    const commander = commanderIn(game);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    cast(game, commander);
    // Bounced, and left in the hand (rule 903.9b's choice declined).
    a.commanderReplacementFn = () => false;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(commander)] });
    expect(game.state.objects[commander].zone).toBe("hand");

    floatFrom(game, spawn(game, "Opal Palace"), "G");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    cast(game, commander);
    expect(game.state.objects[commander].zone).toBe("battlefield");
    expect(counters(game, commander)).toBe(1);
  });

  it("another creature paid with it gets nothing", () => {
    const { game } = commanderGame();
    floatFrom(game, spawn(game, "Opal Palace"), "G");
    lands(game, "Wastes", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });

  it("no commander, no mana (the ruling)", () => {
    const { game } = table();
    floatFrom(game, spawn(game, "Opal Palace"), "G");
    expect(pool(game)).toEqual([]);
  });
});

describe("Guildmages' Forum", () => {
  it("adds a counter to a multicolored creature spell", () => {
    const { game } = table();
    floatFrom(game, spawn(game, "Guildmages' Forum"), "W");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const anafenza = toHand(game, COMMANDER);
    cast(game, anafenza);
    expect(game.state.objects[anafenza].zone).toBe("battlefield");
    expect(counters(game, anafenza)).toBe(1);
  });

  it("not a mono-colored one", () => {
    const { game } = table();
    floatFrom(game, spawn(game, "Guildmages' Forum"), "G");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });

  it("the plain {C} adds nothing", () => {
    const { game } = table();
    const forum = spawn(game, "Guildmages' Forum");
    game.dispatch({ type: "activate-ability", player: A, source: forum, abilityIndex: 0, targets: [] });
    expect(pool(game)[0].spellEntersWith).toBeUndefined();
  });
});

describe("Animal Attendant", () => {
  it("adds a counter to a non-Human creature spell", () => {
    const { game } = table();
    floatAttendant(game, "G");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(1);
  });

  it("not a Human one", () => {
    const { game } = table();
    floatAttendant(game, "G");
    lands(game, "Forest", 1);
    const human = toHand(game, "Animal Attendant");
    cast(game, human);
    expect(game.state.objects[human].zone).toBe("battlefield");
    expect(counters(game, human)).toBe(0);
  });

  it("not a noncreature spell", () => {
    const { game } = table();
    floatAttendant(game, "U");
    const spell = toHand(game, "Unsummon");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, spell, { targets: [ref(bears)] });
    expect(game.state.objects[spell].entersWithCounters ?? []).toEqual([]);
  });

  it("is spent ahead of plain mana of its colour", () => {
    const { game } = table();
    floatPlain(game, "Forest");
    floatPlain(game, "Forest");
    floatAttendant(game, "G");
    const bears = toHand(game, "Grizzly Bears"); // {1}{G}
    cast(game, bears);
    expect(counters(game, bears)).toBe(1);
    expect(pool(game).map((u) => [u.type, u.spellEntersWith])).toEqual([["G", undefined]]);
  });

  it("each unit adds its own", () => {
    const { game } = table();
    floatAttendant(game, "G");
    floatAttendant(game, "G");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(2);
  });

  it("reaches a generic pip, ahead of plain mana", () => {
    const { game } = table();
    floatPlain(game, "Plains");
    floatAttendant(game, "R");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears"); // {1}{G}
    cast(game, bears);
    expect(counters(game, bears)).toBe(1);
    expect(pool(game).map((u) => u.type)).toEqual(["W"]);
  });

  it("goes with the spell: bounced after it resolves, the card comes back with nothing", () => {
    const { game } = table();
    floatAttendant(game, "G");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].zone).toBe("hand");
    lands(game, "Forest", 2);
    cast(game, bears);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Commander's Insight", () => {
  it("draws X plus the target player's own casts from the command zone", () => {
    const { game } = commanderGame();
    const commander = commanderIn(game);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    cast(game, commander);
    lands(game, "Island", 5);
    const insight = toHand(game, "Commander's Insight");
    const before = hand(game).length;
    cast(game, insight, { targets: [ref(A)], x: 2 });
    // The Insight left the hand; X = 2, plus one cast of Anafenza.
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("reads the target's count, not the caster's", () => {
    const { game } = commanderGame();
    const commander = commanderIn(game);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    cast(game, commander);
    lands(game, "Island", 4);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Commander's Insight"), { targets: [ref(B)], x: 1 });
    expect(hand(game, B).length).toBe(before + 1);
  });
});
