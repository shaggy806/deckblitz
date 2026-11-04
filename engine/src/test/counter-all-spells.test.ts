/**
 * "Counter all [other] spells": `for-each-on-stack` with a filter, the
 * `countered` this-way kind ("for each spell countered this way"), and overload's
 * "each". And spells that go to a hand instead of a graveyard as they resolve:
 * their own text (`from: "stack"`), in the order written (`now`), and the next
 * spell you cast (`intoHandAsItResolves` — Soulfire Grand Master).
 */
import { describe, expect, it } from "vitest";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
  C,
  cast,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
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

const castInResponse = (
  game: Game,
  seat: ScriptedController,
  card: ObjectId,
  player: PlayerId,
  extra: { readonly overload?: boolean; readonly target?: ObjectId; readonly modes?: readonly number[] } = {},
): void => {
  seat.enqueue({
    type: "cast-spell",
    player,
    card,
    targets: extra.target === undefined ? [] : [{ kind: "object", object: extra.target }],
    ...(extra.overload === true ? { overload: true } : {}),
    ...(extra.modes !== undefined ? { modes: extra.modes } : {}),
  });
  settle(game);
};

const bolt = (game: Game, at: PlayerId | ObjectId = B, player: PlayerId = A): ObjectId => {
  lands(game, "Mountain", 1, player);
  const card = toHand(game, "Lightning Bolt", player);
  cast(game, card, { player, targets: [ref(at)], settle: false });
  return card;
};

describe("Swift Silence: all other spells, whoever's, and a card for each", () => {
  it("counters every spell but itself, its controller's too, and draws for each", () => {
    const { game, b } = table();
    const first = bolt(game);
    const second = bolt(game);
    lands(game, "Plains", 1, B);
    lands(game, "Island", 2, B);
    lands(game, "Wastes", 2, B);
    const silence = toHand(game, "Swift Silence", B);
    const before = hand(game, B).length;
    castInResponse(game, b, silence, B);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(zone(game, silence)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 1 + 2);
  });

  it("draws nothing for a spell that can't be countered", () => {
    const { game, b } = table();
    lands(game, "Forest", 6);
    const tyrant = toHand(game, "Carnage Tyrant");
    cast(game, tyrant, { settle: false });
    lands(game, "Plains", 1, B);
    lands(game, "Island", 2, B);
    lands(game, "Wastes", 2, B);
    const before = hand(game, B).length;
    castInResponse(game, b, toHand(game, "Swift Silence", B), B);
    expect(zone(game, tyrant)).toBe("battlefield");
    expect(hand(game, B).length).toBe(before);
  });
});

describe("Glen Elendra's Answer: your opponents' spells and abilities, and a Faerie for each", () => {
  it("counters a spell and an ability of an opponent, leaves your own and what can't be, and counts only those", () => {
    const { game, b } = table();
    lands(game, "Forest", 6);
    const tyrant = toHand(game, "Carnage Tyrant");
    cast(game, tyrant, { settle: false });
    lands(game, "Wastes", 3);
    const rod = spawn(game, "Rod of Ruin");
    activate(game, rod, 0, { targets: [ref(B)], settle: false });
    const first = bolt(game);
    lands(game, "Island", 4, B);
    castInResponse(game, b, toHand(game, "Glen Elendra's Answer", B), B);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, tyrant)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
    expect(tokensNamed(game, "Faerie Token (Glen Elendra's Answer)", B)).toBe(2);
  });

  it("leaves its controller's own spell alone", () => {
    const { game, b } = table();
    const theirs = bolt(game);
    lands(game, "Mountain", 1, B);
    lands(game, "Island", 4, B);
    const mine = toHand(game, "Lightning Bolt", B);
    const answer = toHand(game, "Glen Elendra's Answer", B);
    b.enqueue({ type: "cast-spell", player: B, card: mine, targets: [ref(A)] });
    b.enqueue({ type: "cast-spell", player: B, card: answer, targets: [] });
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(17);
    expect(tokensNamed(game, "Faerie Token (Glen Elendra's Answer)", B)).toBe(1);
  });

  it("isn't stopped by a counterspell", () => {
    const { game, a, b } = table();
    const theirs = bolt(game);
    lands(game, "Island", 4, B);
    lands(game, "Island", 2);
    const answer = toHand(game, "Glen Elendra's Answer", B);
    const counter = toHand(game, "Counterspell");
    game.advanceUntil((s) => s.priority.holder === B);
    b.enqueue({ type: "cast-spell", player: B, card: answer, targets: [] });
    a.enqueue({ type: "cast-spell", player: A, card: counter, targets: [ref(answer)] });
    settle(game);
    expect(zone(game, counter)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, answer)).toBe("graveyard");
    expect(tokensNamed(game, "Faerie Token (Glen Elendra's Answer)", B)).toBe(1);
  });
});

describe("Counterflux: a target spell you don't control, or overloaded each of them", () => {
  it("counters one target", () => {
    const { game, b } = table();
    const first = bolt(game);
    lands(game, "Island", 2, B);
    lands(game, "Mountain", 1, B);
    castInResponse(game, b, toHand(game, "Counterflux", B), B, { target: first });
    expect(zone(game, first)).toBe("graveyard");
  });

  it("overloaded, counters each spell it doesn't control, no target chosen", () => {
    const { game, b, c } = table({ players: 3 });
    void c;
    const first = bolt(game);
    const second = bolt(game);
    lands(game, "Island", 3, B);
    lands(game, "Mountain", 1, B);
    castInResponse(game, b, toHand(game, "Counterflux", B), B, { overload: true });
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
  });
});

describe("Reverse the Polarity's first mode", () => {
  it("counters all other spells, and draws nothing", () => {
    const { game, b } = table();
    const first = bolt(game);
    lands(game, "Island", 3, B);
    const before = hand(game, B).length;
    castInResponse(game, b, toHand(game, "Reverse the Polarity", B), B, { modes: [0] });
    expect(zone(game, first)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before);
  });

  it("switches each creature's power and toughness until end of turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const lions = spawn(game, "Savannah Lions", B);
    const mine = spawn(game, "Savannah Lions");
    cast(game, toHand(game, "Reverse the Polarity"), { modes: [1] });
    expect(pt(game, lions)).toEqual({ power: 1, toughness: 2 });
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 2 });
    nextTurn(game);
    expect(pt(game, lions)).toEqual({ power: 2, toughness: 1 });
  });

  it("lets no creature be blocked this turn", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Reverse the Polarity"), { modes: [2] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
  });
});

describe("for-each-on-stack's filter: counter all spells with those names", () => {
  it("counters only spells named as a card exiled with the source, whoever's", () => {
    const { game } = table({ players: 3 });
    const source = spawn(game, "Forest");
    const card = toGraveyard(game, "Lightning Bolt", B);
    game.debugApplyEffect(A, { kind: "exile", target: 0, linked: true }, [ref(card)], { source });
    expect(zone(game, card)).toBe("exile");
    const named1 = bolt(game);
    lands(game, "Mountain", 1);
    const other = toHand(game, "Shock");
    cast(game, other, { targets: [ref(C)], settle: false });
    game.debugApplyEffect(
      A,
      {
        kind: "for-each-on-stack",
        spells: true,
        filter: { sameNameWith: "exiled-with-source" },
        effect: { kind: "counter", target: 0 },
      },
      [],
      { source },
    );
    expect(zone(game, named1)).toBe("graveyard");
    expect(zone(game, other)).toBe("stack");
  });
});

describe("a spell back to its owner's hand by its own text", () => {
  it("View from Above: only with a white permanent", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    const first = toHand(game, "View from Above");
    cast(game, first, { targets: [ref(bears)] });
    expect(zone(game, first)).toBe("graveyard");
    spawn(game, "Savannah Lions");
    const second = toHand(game, "View from Above");
    cast(game, second, { targets: [ref(bears)] });
    expect(zone(game, second)).toBe("hand");
  });

  it("Molten Birth: two Elementals, and the card back on a won flip only", () => {
    const seen = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game } = table({ seed });
      lands(game, "Mountain", 3);
      const birth = toHand(game, "Molten Birth");
      cast(game, birth);
      expect(tokensNamed(game, "Elemental Token (Molten Birth)", A)).toBe(2);
      seen.add(zone(game, birth));
    }
    expect([...seen].sort()).toEqual(["graveyard", "hand"]);
  });

  it("Hanabi Blast: back in hand before the random discard, which can take it", () => {
    const outcomes = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) {
      const { game } = table({ seed });
      lands(game, "Mountain", 3);
      const blast = toHand(game, "Hanabi Blast");
      const before = hand(game).length;
      cast(game, blast, { targets: [ref(B)] });
      expect(life(game, B)).toBe(18);
      expect(hand(game).length).toBe(before - 1);
      outcomes.add(zone(game, blast));
    }
    expect(outcomes.has("hand")).toBe(true);
    expect(outcomes.has("graveyard")).toBe(true);
  });

  it("a copy of Hanabi Blast can't go back, and still discards", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 2);
    const blast = toHand(game, "Hanabi Blast");
    const twincast = toHand(game, "Twincast");
    cast(game, blast, { targets: [ref(B)], settle: false });
    const before = hand(game).length;
    pickTargets(a, B);
    cast(game, twincast, { targets: [ref(blast)] });
    expect(life(game, B)).toBe(16);
    // Twincast left the hand, the original came back, and each discarded one.
    expect(hand(game).length).toBe(before - 1 + 1 - 2);
  });
});

describe("Soulfire Grand Master", () => {
  const armed = (game: Game): ObjectId => {
    lands(game, "Island", 4);
    const master = spawn(game, "Soulfire Grand Master");
    activate(game, master, 0);
    return master;
  };

  it("the next instant or sorcery from your hand goes back to it; the one after doesn't", () => {
    const { game } = table();
    armed(game);
    lands(game, "Mountain", 2);
    const first = toHand(game, "Lightning Bolt");
    const second = toHand(game, "Lightning Bolt");
    cast(game, first, { targets: [ref(B)] });
    expect(zone(game, first)).toBe("hand");
    cast(game, second, { targets: [ref(B)] });
    expect(zone(game, second)).toBe("graveyard");
  });

  it("gives instants and sorceries lifelink", () => {
    const { game } = table();
    spawn(game, "Soulfire Grand Master");
    bolt(game);
    settle(game);
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(17);
  });

  it("a countered spell goes to the graveyard, and the mark is used up", () => {
    const { game, b } = table();
    armed(game);
    const first = bolt(game);
    lands(game, "Island", 3, B);
    castInResponse(game, b, toHand(game, "Counterspell", B), B, { target: first });
    expect(zone(game, first)).toBe("graveyard");
    const second = bolt(game);
    settle(game);
    expect(zone(game, second)).toBe("graveyard");
  });

  it("a spell not from your hand neither returns nor uses it up", () => {
    const { game } = table();
    armed(game);
    lands(game, "Island", 3);
    const twice = toGraveyard(game, "Think Twice");
    cast(game, twice, { via: "flashback" });
    expect(zone(game, twice)).toBe("exile");
    lands(game, "Mountain", 1);
    const later = toHand(game, "Lightning Bolt");
    cast(game, later, { targets: [ref(B)] });
    expect(zone(game, later)).toBe("hand");
  });

  it("a spell that exiles itself isn't put into your hand (the ruling)", () => {
    const { game } = table();
    armed(game);
    lands(game, "Island", 7);
    const mastery = toHand(game, "Temporal Mastery");
    cast(game, mastery);
    expect(zone(game, mastery)).toBe("exile");
  });

  it("under Rest in Peace its owner chooses which replacement is first (rule 616.1)", () => {
    const hereFirst = table();
    armed(hereFirst.game);
    spawn(hereFirst.game, "Rest in Peace");
    const kept = bolt(hereFirst.game);
    pickModes(hereFirst.a, 0);
    settle(hereFirst.game);
    expect(zone(hereFirst.game, kept)).toBe("hand");

    const otherFirst = table();
    armed(otherFirst.game);
    spawn(otherFirst.game, "Rest in Peace");
    const gone = bolt(otherFirst.game);
    pickModes(otherFirst.a, 1);
    settle(otherFirst.game);
    expect(zone(otherFirst.game, gone)).toBe("exile");
  });

  it("twice activated, the one next spell uses both", () => {
    const { game } = table();
    lands(game, "Island", 8);
    const master = spawn(game, "Soulfire Grand Master");
    activate(game, master, 0);
    activate(game, master, 0);
    lands(game, "Mountain", 2);
    const first = toHand(game, "Lightning Bolt");
    const second = toHand(game, "Lightning Bolt");
    cast(game, first, { targets: [ref(B)] });
    cast(game, second, { targets: [ref(B)] });
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("graveyard");
  });
});
