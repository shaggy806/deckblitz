/**
 * "Any number of … with different names / powers": a rule over the chosen set,
 * on a `choose-permanents` (Sigarda's Vanguard, Battle for Bretagard), a
 * `look-and-choose` (Eerie Ultimatum, Rip, Spawn Hunter) and a search (Threats
 * Undetected). Rules 201.2a-b for names.
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import { choosePermanents } from "../decisions/choose-permanents.js";
import type { CandidateHelpers, RandomSource } from "../decisions/contract.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  enter,
  hand,
  keywords,
  lands,
  named,
  nextTurn,
  pickFromZone,
  pickPermanents,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

type Offer = Extract<LegalAction, { kind: "choose-permanents" }>;
const offerOf = (game: Game): Offer => {
  const offer = game.legalActions(A).find((a): a is Offer => a.kind === "choose-permanents");
  if (offer === undefined) throw new Error("no choose-permanents offer");
  return offer;
};
const waitForChoice = (game: Game, kind: "choose-permanents" | "choose-from-zone"): void =>
  game.advanceUntil((s) => s.awaiting?.kind === kind);
const canChoose = (game: Game, ...permanents: readonly ObjectId[]): string | null =>
  game.canDispatch({ type: "choose-permanents", player: A, permanents });
const canChooseCards = (game: Game, ...chosen: readonly ObjectId[]): string | null =>
  game.canDispatch({ type: "choose-from-zone", player: A, chosen });
const token = (game: Game, name: string, player = A, stack = 1): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].isToken = true;
  if (stack > 1) game.state.objects[id].stackCount = stack;
  return id;
};

/** Alice's next turn but one's precombat main, whose lore counter reads `chapter`. */
const toChapter = (game: Game, chapter: number): void => {
  nextTurn(game);
  game.advanceUntil((s) => s.turn.number === 2 * chapter - 1 && s.turn.step === "precombat-main");
};

describe("Sigarda's Vanguard: any number of creatures with different powers", () => {
  it("offers every creature, any side, and each chosen one gains double strike", () => {
    const { game, a } = table();
    const two = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const left = spawn(game, "Runeclaw Bear");
    const pick = pickPermanents(a, two, theirs);
    enter(game, "Sigarda's Vanguard");
    expect(pick.offered).toEqual(expect.arrayContaining([two, theirs, left]));
    expect(keywords(game, two).has("double-strike")).toBe(true);
    expect(keywords(game, theirs).has("double-strike")).toBe(true);
    expect(keywords(game, left).has("double-strike")).toBe(false);
  });

  it("refuses two creatures of one power, and says the rule in the offer", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Runeclaw Bear");
    const giant = spawn(game, "Hill Giant");
    enter(game, "Sigarda's Vanguard", A, { settle: false });
    waitForChoice(game, "choose-permanents");
    const offer = offerOf(game);
    // Bears 2, Vanguard 3, Hill Giant 3: two powers, so at most two picks.
    expect(offer.max).toBe(2);
    expect(offer.min).toBe(0);
    expect(offer.together?.text).toBe("with different powers");
    expect(canChoose(game, bears, other)).toMatch(/different powers/);
    expect(canChoose(game, bears, giant)).toBeNull();
    expect(canChoose(game)).toBeNull();
  });

  it("reads powers as they are now, not as printed", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Runeclaw Bear");
    game.state.objects[other].counters["+1/+1"] = 1;
    enter(game, "Sigarda's Vanguard", A, { settle: false });
    waitForChoice(game, "choose-permanents");
    // A 2/2 and a 3/3 with its counter: different powers now.
    expect(canChoose(game, bears, other)).toBeNull();
  });

  it("the bots' candidates and a random player's answer all keep the rule", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Runeclaw Bear");
    spawn(game, "Hill Giant", B);
    spawn(game, "Air Elemental", B);
    enter(game, "Sigarda's Vanguard", A, { settle: false });
    waitForChoice(game, "choose-permanents");
    const offer = offerOf(game);
    const helpers: CandidateHelpers = {
      order: (ids) => ids,
      controllerOf: (id) => game.state.objects[id].controller,
    };
    const answers = choosePermanents.candidates!(offer, A, 8, helpers);
    expect(answers.length).toBeGreaterThan(1);
    for (const action of answers) expect(game.canDispatch(action)).toBeNull();
    let draw = 0.13;
    const rng = {
      random: () => (draw = (draw + 0.37) % 1),
      pickIndex: (length: number) => Math.floor((draw = (draw + 0.37) % 1) * length),
    } as unknown as RandomSource;
    for (let i = 0; i < 20; i += 1) expect(game.canDispatch(choosePermanents.randomAnswer!(offer, A, rng))).toBeNull();
  });

  it("takes one of a token stack, its tokens all sharing a power", () => {
    const { game, a } = table();
    const stack = token(game, "Human Warrior Token", A, 3);
    const pick = pickPermanents(a, stack);
    enter(game, "Sigarda's Vanguard");
    expect(pick.offered).toContain(stack);
    const striking = named(game, "Human Warrior Token", A).filter((id) => keywords(game, id).has("double-strike"));
    expect(striking).toHaveLength(1);
    expect(game.state.objects[striking[0]].stackCount ?? 1).toBe(1);
    expect(tokensNamed(game, "Human Warrior Token", A)).toBe(3);
  });

  it("refuses a stack named twice", () => {
    const { game } = table();
    const stack = token(game, "Human Warrior Token", A, 3);
    enter(game, "Sigarda's Vanguard", A, { settle: false });
    waitForChoice(game, "choose-permanents");
    expect(offerOf(game).copies).toBeUndefined();
    expect(canChoose(game, stack, stack)).not.toBeNull();
    expect(canChoose(game, stack)).toBeNull();
  });
});

describe("Battle for Bretagard: tokens with different names", () => {
  it("makes its two tokens, then copies one token of each name chosen, and is sacrificed", () => {
    const { game, a } = table();
    const saga = enter(game, "Battle for Bretagard");
    expect(tokensNamed(game, "Human Warrior Token", A)).toBe(1);
    toChapter(game, 2);
    settle(game);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(1);
    pickPermanents(a, named(game, "Human Warrior Token", A)[0], named(game, "Elf Warrior Token", A)[0]);
    toChapter(game, 3);
    settle(game);
    expect(tokensNamed(game, "Human Warrior Token", A)).toBe(2);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("leaves out nontokens and other players' tokens, and refuses two of one name", () => {
    const { game } = table();
    enter(game, "Battle for Bretagard");
    toChapter(game, 2);
    settle(game);
    const human = named(game, "Human Warrior Token", A)[0];
    const human2 = token(game, "Human Warrior Token");
    const elf = named(game, "Elf Warrior Token", A)[0];
    token(game, "Elf Warrior Token", B);
    spawn(game, "Grizzly Bears");
    toChapter(game, 3);
    waitForChoice(game, "choose-permanents");
    const offer = offerOf(game);
    expect([...offer.eligible].sort()).toEqual([human, human2, elf].sort());
    expect(offer.max).toBe(2);
    expect(canChoose(game, human, human2)).toMatch(/different names/);
    expect(canChoose(game, human2, elf)).toBeNull();
  });

  it("a face-down token has no name, so it isn't among different names (rule 201.2b)", () => {
    const { game } = table();
    enter(game, "Battle for Bretagard");
    toChapter(game, 2);
    settle(game);
    const human = named(game, "Human Warrior Token", A)[0];
    const elf = named(game, "Elf Warrior Token", A)[0];
    game.state.objects[elf].faceDown = { kind: "manifest" } as never;
    toChapter(game, 3);
    waitForChoice(game, "choose-permanents");
    expect(offerOf(game).eligible).toEqual([human]);
  });
});

describe("Eerie Ultimatum: any number from the graveyard with different names", () => {
  const mana = (game: Game): void => {
    lands(game, "Plains", 2);
    lands(game, "Swamp", 3);
    lands(game, "Forest", 2);
  };

  it("returns the chosen, one a name", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const twin = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const pick = pickFromZone(a, bears, giant);
    mana(game);
    cast(game, toHand(game, "Eerie Ultimatum"));
    expect(pick.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, twin)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("refuses two cards of one name", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const twin = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    mana(game);
    cast(game, toHand(game, "Eerie Ultimatum"), { settle: false });
    waitForChoice(game, "choose-from-zone");
    expect(canChooseCards(game, bears, twin)).toMatch(/different names/);
    expect(canChooseCards(game, bears)).toBeNull();
    expect(canChooseCards(game)).toBeNull();
  });
});

describe("Rip, Spawn Hunter: creature and/or Vehicle cards with different powers", () => {
  it("takes the chosen to hand and the rest to the bottom, a Vehicle counting by its power", () => {
    const { game, a } = table();
    const rip = spawn(game, "Rip, Spawn Hunter", A, { tapped: true });
    const land = toLibrary(game, "Wastes");
    const vehicle = toLibrary(game, "Smuggler's Copter");
    const twin = toLibrary(game, "Runeclaw Bear");
    const giant = toLibrary(game, "Hill Giant");
    const pick = pickFromZone(a, vehicle, twin);
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, rip)).toBe("battlefield");
    expect(pick.offered).toEqual(expect.arrayContaining([vehicle, twin, giant]));
    expect(pick.offered).not.toContain(land);
    expect(hand(game)).toEqual(expect.arrayContaining([vehicle, twin]));
    expect(zone(game, giant)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-2)).toEqual(expect.arrayContaining([giant, land]));
  });

  it("a Vehicle's power counts against a creature's of the same power", () => {
    const { game } = table();
    spawn(game, "Rip, Spawn Hunter", A, { tapped: true });
    const vehicle = toLibrary(game, "Smuggler's Copter");
    const giant = toLibrary(game, "Hill Giant");
    toLibrary(game, "Grizzly Bears");
    toStep(game, "postcombat-main");
    waitForChoice(game, "choose-from-zone");
    expect(canChooseCards(game, vehicle, giant)).toMatch(/different powers/);
  });

  it("refuses two cards of one power", () => {
    const { game } = table();
    spawn(game, "Rip, Spawn Hunter", A, { tapped: true });
    const bears = toLibrary(game, "Grizzly Bears");
    const twin = toLibrary(game, "Runeclaw Bear");
    toLibrary(game, "Hill Giant");
    toStep(game, "postcombat-main");
    waitForChoice(game, "choose-from-zone");
    expect(canChooseCards(game, bears, twin)).toMatch(/different powers/);
    expect(canChooseCards(game, twin)).toBeNull();
  });

  it("does nothing untapped", () => {
    const { game } = table();
    spawn(game, "Rip, Spawn Hunter");
    const bears = toLibrary(game, "Grizzly Bears");
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Threats Undetected: an opponent's two go back, the rest to hand", () => {
  it("shuffles the opponent's two in and hands over the rest", () => {
    const { game, a, b } = table();
    const one = toLibrary(game, "Llanowar Elves");
    const two = toLibrary(game, "Grizzly Bears");
    const three = toLibrary(game, "Hill Giant");
    const four = toLibrary(game, "Air Elemental");
    pickFromZone(a, one, two, three, four);
    pickFromZone(b, one, three);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Threats Undetected"));
    expect(zone(game, one)).toBe("library");
    expect(zone(game, three)).toBe("library");
    expect(zone(game, two)).toBe("hand");
    expect(zone(game, four)).toBe("hand");
  });

  it("with two finds or fewer, those go back unasked (the opponent must choose them)", () => {
    const { game, a } = table();
    const one = toLibrary(game, "Llanowar Elves");
    const two = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, one, two);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Threats Undetected"));
    expect(zone(game, one)).toBe("library");
    expect(zone(game, two)).toBe("library");
  });

  it("refuses finds of one power", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const twin = toLibrary(game, "Runeclaw Bear");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Threats Undetected"), { settle: false });
    waitForChoice(game, "choose-from-zone");
    expect(canChooseCards(game, bears, twin)).toMatch(/different powers/);
    expect(canChooseCards(game, bears)).toBeNull();
  });
});
