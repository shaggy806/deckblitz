/**
 * Behold (rule 701.4): "behold a [quality]" is revealing a card with that
 * quality from your hand or choosing a permanent you control with it
 * (701.4a). The choice is one `choose-from-zone` decision whose candidates
 * span both zones (its `behold` set), asked only when there's a choice; a
 * card revealed is shown to every player, and nothing offers a behold that
 * can't be done. "If a Dragon was beheld" (701.4b) is the kicked cast.
 *
 * Each shape the engine has: a branch of a choice of additional costs, an
 * optional additional cost (a kicker, with flash for Molten Exhale), a
 * mandatory "behold … and exile it" whose exiled card is linked to the
 * permanent the spell becomes (607.2q — the Champions), a flashback cost's
 * "behold three Elementals", the `behold` effect, and a land's "as this
 * enters, you may behold".
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const casts = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game
    .legalActions(player)
    .filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

/** The pending behold, if `player` is being asked one. */
const beholdAsked = (game: Game, player: PlayerId = A) => {
  const awaiting = game.state.awaiting;
  return awaiting?.kind === "choose-from-zone" && awaiting.player === player && awaiting.behold !== undefined
    ? awaiting
    : undefined;
};

/** Every card revealed from a hand so far. */
const revealedFromHand = (game: Game): ObjectId[] =>
  game.state.eventLog.flatMap((e) => (e.type === "cards-revealed" && e.from === "hand" ? [...e.objects] : []));

describe("behold as a branch of a choice of additional costs (Caustic Exhale)", () => {
  it("is offered only with a Dragon card in hand or a Dragon you control — not an opponent's", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const exhale = toHand(game, "Caustic Exhale");
    spawn(game, "Shivan Dragon", B);
    expect(casts(game, exhale).map((c) => c.costOptionText)).toEqual(["Pay {1}"]);
    toHand(game, "Shivan Dragon");
    expect(casts(game, exhale).map((c) => c.costOptionText)).toEqual(["Behold a Dragon", "Pay {1}"]);
  });

  it("asks once the spell is on the stack, both zones at once; a card from the hand is revealed to everyone", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const inHand = toHand(game, "Shivan Dragon");
    const onBoard = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears", B);
    const exhale = toHand(game, "Caustic Exhale");
    const seen = pickFromZone(a, inHand);
    cast(game, exhale, { targets: [ref(bears)], costOption: 0, settle: false });
    const asked = beholdAsked(game);
    expect(asked?.destination).toBe("behold");
    expect(zone(game, exhale)).toBe("stack");
    // The other player sees only the permanents it could choose: which hand
    // cards could be revealed would say what they are.
    const theirs = game.viewFor(B).awaiting;
    expect(theirs?.kind === "choose-from-zone" ? theirs.eligible : null).toEqual([onBoard]);
    settle(game);
    expect(new Set(seen.offered)).toEqual(new Set([inHand, onBoard]));
    expect(revealedFromHand(game)).toEqual([inHand]);
    expect(game.state.revealedThisTurn).toContain(inHand);
    expect(game.viewFor(B).objects[inHand]?.cardName).toBe("Shivan Dragon");
    // Revealed, not moved; the spell resolved for one mana.
    expect(zone(game, inHand)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a Dragon chosen on the battlefield stays there, and nothing is revealed", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    toHand(game, "Shivan Dragon");
    const onBoard = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears", B);
    const exhale = toHand(game, "Caustic Exhale");
    pickFromZone(a, onBoard);
    cast(game, exhale, { targets: [ref(bears)], costOption: 0 });
    expect(revealedFromHand(game)).toEqual([]);
    expect(zone(game, onBoard)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("with one Dragon to behold, it's beheld unasked", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const inHand = toHand(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears", B);
    let asked = 0;
    a.chooseFromZoneFn = (_v, eligible, min) => {
      asked += 1;
      return eligible.slice(0, min);
    };
    cast(game, toHand(game, "Caustic Exhale"), { targets: [ref(bears)], costOption: 0 });
    expect(asked).toBe(0);
    expect(revealedFromHand(game)).toEqual([inHand]);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a changeling card is a Dragon card (rule 702.73a works in the hand)", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const outcast = toHand(game, "Changeling Outcast");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Caustic Exhale"), { targets: [ref(bears)], costOption: 0 });
    expect(revealedFromHand(game)).toEqual([outcast]);
  });

  it("a creature spell can't behold itself: Lys Alana Dignitary with no other Elf only pays", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const dignitary = toHand(game, "Lys Alana Dignitary");
    expect(casts(game, dignitary).map((c) => c.costOptionText)).toEqual(["Pay {2}"]);
    const elves = toHand(game, "Llanowar Elves");
    expect(casts(game, dignitary).map((c) => c.costOptionText)).toEqual(["Behold an Elf", "Pay {2}"]);
    cast(game, dignitary, { costOption: 0 });
    expect(zone(game, dignitary)).toBe("battlefield");
    expect(revealedFromHand(game)).toEqual([elves]);
  });
});

describe("'you may behold' as an optional additional cost (Osseous Exhale, Dispelling Exhale, Molten Exhale)", () => {
  it("the beholding cast is offered only with a Dragon, labelled for it", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const exhale = toHand(game, "Osseous Exhale");
    const attacker = spawn(game, "Grizzly Bears", B);
    game.state.objects[attacker].attacking = A;
    expect(casts(game, exhale).map((c) => c.kicked === true)).toEqual([false]);
    spawn(game, "Shivan Dragon");
    const kicked = casts(game, exhale).find((c) => c.kicked === true);
    expect(kicked?.kickerKeyword).toBe("behold");
    expect(kicked?.kickerCost).toBe("a Dragon");
  });

  it("'if a Dragon was beheld' is the beholding cast: Osseous Exhale gains 2 life only then", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Shivan Dragon");
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    for (const id of [first, second]) game.state.objects[id].attacking = A;
    cast(game, toHand(game, "Osseous Exhale"), { targets: [ref(first)] });
    expect(life(game)).toBe(20);
    expect(zone(game, first)).toBe("graveyard");
    cast(game, toHand(game, "Osseous Exhale"), { targets: [ref(second)], kicked: true });
    expect(life(game)).toBe(22);
    expect(zone(game, second)).toBe("graveyard");
  });

  it("Dispelling Exhale beheld taxes {4} instead of {2}", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    // Two more open once both spells are cast: {2} could be paid, {4} not.
    lands(game, "Wastes", 2);
    spawn(game, "Shivan Dragon");
    a.chooseModesFn = (_v, _min, _max, texts) => (texts[0]?.startsWith("Pay") ? [0] : []);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Dispelling Exhale"), { targets: [ref(shock)], kicked: true });
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    // Unbeheld, the {2} is paid and the Shock resolves.
    const second = toHand(game, "Shock");
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    cast(game, second, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Dispelling Exhale"), { targets: [ref(second)] });
    expect(life(game, B)).toBe(18);
  });

  it("Molten Exhale may be cast any time it's beheld for, at sorcery timing otherwise", () => {
    const { game } = table({ step: "upkeep" });
    lands(game, "Mountain", 2);
    const exhale = toHand(game, "Molten Exhale");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(casts(game, exhale)).toEqual([]);
    spawn(game, "Shivan Dragon");
    expect(casts(game, exhale).map((c) => c.kicked === true)).toEqual([true]);
    cast(game, exhale, { targets: [ref(bears)], kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("'behold … and exile it' (the Champions)", () => {
  it("can't be cast with nothing to behold — the Champion itself isn't one", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const champion = toHand(game, "Champions of the Perfect");
    expect(casts(game, champion)).toEqual([]);
    toHand(game, "Llanowar Elves");
    expect(casts(game, champion)).toHaveLength(1);
  });

  it("an Elf card from the hand is revealed and exiled, and comes back when the Champion leaves", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const elves = toHand(game, "Llanowar Elves");
    spawn(game, "Elvish Mystic");
    pickFromZone(a, elves);
    const champion = toHand(game, "Champions of the Perfect");
    cast(game, champion, { settle: false });
    expect(beholdAsked(game)?.destination).toBe("exile");
    settle(game);
    expect(revealedFromHand(game)).toEqual([elves]);
    expect(zone(game, elves)).toBe("exile");
    expect(zone(game, champion)).toBe("battlefield");
    // Bounced: the linked card returns to its owner's hand.
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(champion)] });
    expect(zone(game, champion)).toBe("hand");
    expect(zone(game, elves)).toBe("hand");
  });

  it("an Elf chosen on the battlefield leaves it, and returns to its owner's hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const mystic = spawn(game, "Elvish Mystic");
    toHand(game, "Llanowar Elves");
    pickFromZone(a, mystic);
    const champion = toHand(game, "Champions of the Perfect");
    cast(game, champion);
    expect(zone(game, mystic)).toBe("exile");
    expect(game.state.eventLog.some((e) => e.type === "permanent-exiled" && e.object === mystic)).toBe(true);
    destroy(game, champion);
    expect(zone(game, champion)).toBe("graveyard");
    expect(zone(game, mystic)).toBe("hand");
  });

  it("a token beheld this way ceases to exist: nothing comes back", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const token = spawn(game, "2/2 Black Green Elf Token");
    game.state.objects[token].isToken = true;
    const champion = toHand(game, "Champions of the Perfect");
    cast(game, champion);
    expect(game.state.objects[token]?.zone ?? "gone").not.toBe("battlefield");
    destroy(game, champion);
    expect(zone(game, champion)).toBe("graveyard");
    expect(hand(game).includes(token)).toBe(false);
  });

  it("countered, the beheld card stays exiled for good (the ruling) — a later Champion doesn't bring it back", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const elves = toHand(game, "Llanowar Elves");
    const champion = toHand(game, "Champions of the Perfect");
    cast(game, champion, { settle: false });
    expect(zone(game, elves)).toBe("exile");
    lands(game, "Island", 2);
    // Countered (by its own caster, holding priority).
    cast(game, toHand(game, "Counterspell"), { targets: [ref(champion)] });
    expect(zone(game, champion)).toBe("graveyard");
    expect(zone(game, elves)).toBe("exile");
    // Reanimated, then gone again: a new object, linked to nothing (607.2q).
    game.debugMove(champion, "battlefield");
    destroy(game, champion);
    expect(zone(game, champion)).toBe("graveyard");
    expect(zone(game, elves)).toBe("exile");
  });

  it("Champion of the Weird: pay 1 life and blight 2, and the target opponent blights 2", () => {
    const { game, a, b } = table();
    const champion = spawn(game, "Champion of the Weird");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const big = spawn(game, "Shivan Dragon", B);
    a.choosePermanentsFn = () => [mine];
    b.choosePermanentsFn = () => [theirs];
    activate(game, champion, 0, { targets: [ref(B)] });
    expect(life(game)).toBe(19);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(counters(game, big, "-1/-1")).toBe(0);
  });
});

describe("the behold effect (Sarkhan, Dragon Ascendant; Elven Passage)", () => {
  it("'you may behold a Dragon' isn't offered with no Dragon", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    enter(game, "Sarkhan, Dragon Ascendant");
    expect(asked).toBe(0);
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
  });

  it("taken, the Dragon is beheld and a Treasure made; declined, nothing", () => {
    const { game, a } = table();
    const dragon = toHand(game, "Shivan Dragon");
    pickModes(a, 0);
    enter(game, "Sarkhan, Dragon Ascendant");
    expect(revealedFromHand(game)).toEqual([dragon]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    pickModes(a);
    enter(game, "Sarkhan, Dragon Ascendant");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("a Dragon entering makes Sarkhan a flying Dragon until end of turn, with a counter", () => {
    const { game } = table();
    const sarkhan = spawn(game, "Sarkhan, Dragon Ascendant");
    enter(game, "Shivan Dragon");
    expect(counters(game, sarkhan)).toBe(1);
    expect(pt(game, sarkhan)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[sarkhan] !== undefined).toBe(true);
  });

  it("Elven Passage: beholding an Elf untaps the land it found", () => {
    const { game, a } = table({ deck: "Forest" });
    const passage = spawn(game, "Elven Passage");
    spawn(game, "Llanowar Elves");
    pickModes(a, 0);
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 1);
    activate(game, passage);
    const forest = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Forest",
    );
    expect(forest).toBeDefined();
    expect(game.state.objects[forest as ObjectId].tapped).toBe(false);
    expect(life(game)).toBe(19);
    expect(graveyard(game)).toContain(passage);
  });

  it("Elven Passage: with no Elf, the land stays tapped", () => {
    const { game, a } = table({ deck: "Forest" });
    const passage = spawn(game, "Elven Passage");
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 1);
    activate(game, passage);
    const forest = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Forest",
    );
    expect(game.state.objects[forest as ObjectId].tapped).toBe(true);
  });
});

describe("'as this land enters, you may behold a Jace' (Theorist's Sanctum)", () => {
  it("with no Jace, it enters tapped, unasked", () => {
    const { game } = table();
    const sanctum = toHand(game, "Theorist's Sanctum");
    game.dispatch({ type: "play-land", player: A, card: sanctum });
    settle(game);
    expect(game.state.objects[sanctum].tapped).toBe(true);
  });

  it("a Jace card revealed from the hand: untapped", () => {
    const { game, a } = table();
    const jace = toHand(game, "Jace Beleren");
    const sanctum = toHand(game, "Theorist's Sanctum");
    pickFromZone(a, jace);
    game.dispatch({ type: "play-land", player: A, card: sanctum });
    settle(game);
    expect(game.state.objects[sanctum].tapped).toBe(false);
    expect(revealedFromHand(game)).toEqual([jace]);
  });

  it("declining — none chosen — it enters tapped", () => {
    const { game, a } = table();
    toHand(game, "Jace Beleren");
    const sanctum = toHand(game, "Theorist's Sanctum");
    pickFromZone(a);
    game.dispatch({ type: "play-land", player: A, card: sanctum });
    settle(game);
    expect(game.state.objects[sanctum].tapped).toBe(true);
    expect(revealedFromHand(game)).toEqual([]);
  });

  it("a Jace you control on the battlefield: untapped, nothing revealed", () => {
    const { game, a } = table();
    const jace = spawn(game, "Jace Beleren");
    const sanctum = toHand(game, "Theorist's Sanctum");
    const seen = pickFromZone(a, jace);
    game.dispatch({ type: "play-land", player: A, card: sanctum });
    settle(game);
    expect(seen.offered).toEqual([jace]);
    expect(game.state.objects[sanctum].tapped).toBe(false);
  });
});

describe("behold three (Kindle the Inner Flame's flashback)", () => {
  it("needs three different Elementals — a token stack's tokens count each — and takes any mix", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const kindle = toGraveyard(game, "Kindle the Inner Flame");
    const target = spawn(game, "Grizzly Bears");
    const air = toHand(game, "Air Elemental");
    const flashbackCasts = () => casts(game, kindle).filter((c) => c.via === "flashback");
    expect(flashbackCasts()).toEqual([]);
    const stack = spawn(game, "4/4 Blue Red Elemental Token");
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 3;
    expect(flashbackCasts()).toHaveLength(1);
    const seen = { offered: [] as readonly ObjectId[] };
    a.chooseFromZoneFn = (_v, eligible) => {
      seen.offered = eligible;
      // The card and two of the tokens.
      return [air, ...eligible.filter((id) => id !== air).slice(0, 2)];
    };
    cast(game, kindle, { via: "flashback", targets: [ref(target)] });
    // The hand card and the stack's tokens — three of them, each its own
    // candidate (the stack's third stays behind the first).
    expect(seen.offered).toHaveLength(3 + 1);
    expect(seen.offered).toContain(air);
    expect(revealedFromHand(game)).toEqual([air]);
    expect(zone(game, kindle)).toBe("exile");
    expect(named(game, "Grizzly Bears")).toHaveLength(2);
  });
});

const named = (game: Game, name: string): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name);
