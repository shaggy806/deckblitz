/**
 * Hexproof from a quality gained for a while (rule 702.11d): on permanents (a
 * `grant-protection` with `asHexproof`) and on players (`grant-player-hexproof`
 * with `from`). And "spells you control can't be countered this turn": a change
 * to the game's rules (rule 611.2c), so it reaches spells already on the stack.
 * Veil of Summer has all of it, Mondo Gecko the choice of a colour.
 */
import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
  C,
  cast,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/** Pass priority until `player` holds it, with the stack as it is. */
const give = (game: Game, player: PlayerId): void => {
  for (let i = 0; i < 8 && game.state.priority.holder !== player; i++) {
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder as PlayerId });
  }
  expect(game.state.priority.holder).toBe(player);
};

const veil = (game: Game): ObjectId => {
  lands(game, "Forest", 1);
  const card = toHand(game, "Veil of Summer");
  give(game, A);
  cast(game, card, { settle: false });
  return card;
};

const bears = (game: Game): ObjectId => {
  lands(game, "Forest", 2);
  const card = toHand(game, "Grizzly Bears");
  cast(game, card, { settle: false });
  return card;
};

const counterspell = (game: Game, spell: ObjectId, player: PlayerId = B): ObjectId => {
  lands(game, "Island", 2, player);
  const card = toHand(game, "Counterspell", player);
  give(game, player);
  cast(game, card, { player, targets: [ref(spell)], settle: false });
  return card;
};

const hexColors = (game: Game, id: ObjectId): ReadonlySet<string> =>
  computeCharacteristics(game.state, registryOf(game), id).hexproofFrom.colors;

describe("Veil of Summer: spells you control can't be countered this turn", () => {
  it("saves a spell a counterspell is already aimed at, and draws for the blue spell", () => {
    const { game } = table();
    toLibrary(game, "Wastes");
    const spell = bears(game);
    const answer = counterspell(game, spell);
    const before = hand(game).length;
    const card = veil(game);
    // Veil left the hand; the draw puts one back.
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    // The counterspell resolved, did nothing, and went to its graveyard.
    expect(zone(game, answer)).toBe("graveyard");
    expect(zone(game, spell)).toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
  });

  it("reaches a spell cast later in the turn, and only its controller's", () => {
    const { game } = table();
    veil(game);
    settle(game);
    const spell = bears(game);
    counterspell(game, spell);
    settle(game);
    expect(zone(game, spell)).toBe("battlefield");
    // Bob's own spell is as counterable as ever.
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    give(game, B);
    cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
    const answer = toHand(game, "Counterspell");
    lands(game, "Island", 2);
    give(game, A);
    cast(game, answer, { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });

  it("is over with the turn", () => {
    const { game } = table();
    veil(game);
    settle(game);
    expect(game.state.spellGrantsThisTurn?.length).toBe(1);
    nextTurn(game);
    expect(game.state.spellGrantsThisTurn).toBeUndefined();
    expect(game.state.hexproofFromPlayers).toBeUndefined();
  });
});

describe("Veil of Summer: draw a card if an opponent has cast a blue or black spell this turn", () => {
  it("draws nothing when no opponent has", () => {
    const { game } = table();
    toLibrary(game, "Wastes");
    const before = hand(game).length;
    veil(game);
    settle(game);
    expect(hand(game).length).toBe(before);
  });

  it("draws nothing for your own blue spell, or an opponent's red one", () => {
    const { game } = table();
    toLibrary(game, "Wastes");
    const spell = bears(game);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Counterspell"), { targets: [ref(spell)], settle: false });
    lands(game, "Mountain", 1, B);
    give(game, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(A)], settle: false });
    const before = hand(game).length;
    veil(game);
    settle(game);
    expect(hand(game).length).toBe(before);
  });

  it("draws one card however many they have cast, a black one counting too", () => {
    const { game } = table();
    toLibrary(game, "Wastes");
    toLibrary(game, "Wastes");
    lands(game, "Swamp", 4, B);
    give(game, B);
    cast(game, toHand(game, "Doom Blade", B), { player: B, targets: [ref(spawn(game, "Grizzly Bears", B))], settle: false });
    give(game, B);
    cast(game, toHand(game, "Doom Blade", B), { player: B, targets: [ref(spawn(game, "Grizzly Bears", B))], settle: false });
    const before = hand(game).length;
    veil(game);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("hexproof from blue and from black on you and your permanents", () => {
  it("makes an opposing black spell already aimed at your creature fizzle", () => {
    const { game } = table();
    const creature = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2, B);
    const blade = toHand(game, "Doom Blade", B);
    give(game, B);
    cast(game, blade, { player: B, targets: [ref(creature)], settle: false });
    veil(game);
    settle(game);
    expect(zone(game, creature)).toBe("battlefield");
    expect(zone(game, blade)).toBe("graveyard");
  });

  it("stops any opponent's blue and black spells, on you and on your permanents, and nothing else", () => {
    const { game } = table({ players: 4 });
    const creature = spawn(game, "Grizzly Bears");
    veil(game);
    settle(game);
    const refused = (card: string, player: PlayerId, target: PlayerId | ObjectId): void => {
      lands(game, "Swamp", 3, player);
      const id = toHand(game, card, player);
      give(game, player);
      expect(() => cast(game, id, { player, targets: [ref(target)], settle: false })).toThrow();
    };
    refused("Doom Blade", B, creature);
    refused("Mind Rot", C, A);
    // A red spell doesn't care.
    lands(game, "Mountain", 1, B);
    give(game, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(creature)] });
    expect(zone(game, creature)).toBe("graveyard");
  });

  it("stops an ability from a black source", () => {
    const { game } = table();
    const creature = spawn(game, "Grizzly Bears", A, { tapped: true });
    const assassin = spawn(game, "Royal Assassin", B);
    veil(game);
    settle(game);
    give(game, B);
    expect(() => activate(game, assassin, 0, { player: B, targets: [ref(creature)] })).toThrow();
    expect(zone(game, creature)).toBe("battlefield");
  });

  it("doesn't stop your own blue and black spells", () => {
    const { game } = table();
    const creature = spawn(game, "Grizzly Bears");
    veil(game);
    settle(game);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Doom Blade"), { targets: [ref(creature)] });
    expect(zone(game, creature)).toBe("graveyard");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Mind Rot"), { targets: [ref(A)] });
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("covers permanents you control as it resolves, not one you get later (rule 611.2c)", () => {
    const { game } = table();
    veil(game);
    settle(game);
    const later = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2, B);
    give(game, B);
    cast(game, toHand(game, "Doom Blade", B), { player: B, targets: [ref(later)] });
    expect(zone(game, later)).toBe("graveyard");
  });

  it("goes with a later loss of hexproof (rule 702.11e)", () => {
    const { game } = table();
    const creature = spawn(game, "Grizzly Bears");
    veil(game);
    settle(game);
    expect(hexColors(game, creature).has("U")).toBe(true);
    const lighthouse = spawn(game, "Arcane Lighthouse", B);
    lands(game, "Wastes", 1, B);
    give(game, B);
    activate(game, lighthouse, 1, { player: B });
    expect(hexColors(game, creature).size).toBe(0);
    lands(game, "Swamp", 2, B);
    give(game, B);
    cast(game, toHand(game, "Doom Blade", B), { player: B, targets: [ref(creature)] });
    expect(zone(game, creature)).toBe("graveyard");
  });

  it("is over with the turn, on you and on your permanents", () => {
    const { game } = table();
    const creature = spawn(game, "Grizzly Bears");
    veil(game);
    settle(game);
    nextTurn(game);
    expect(hexColors(game, creature).size).toBe(0);
    lands(game, "Swamp", 5, B);
    cast(game, toHand(game, "Doom Blade", B), { player: B, targets: [ref(creature)] });
    cast(game, toHand(game, "Mind Rot", B), { player: B, targets: [ref(A)] });
    expect(zone(game, creature)).toBe("graveyard");
    expect(graveyard(game, A).length).toBeGreaterThan(0);
  });
});

describe("Mondo Gecko: hexproof from the colour it becomes", () => {
  it("becomes the colour chosen and gains hexproof from that colour alone", () => {
    const { game, a } = table();
    const gecko = spawn(game, "Mondo Gecko");
    lands(game, "Wastes", 1);
    toHand(game, "Wastes");
    pickModes(a, 3); // Red
    activate(game, gecko, 0);
    settle(game);
    const c = computeCharacteristics(game.state, registryOf(game), gecko);
    expect([...c.colors]).toEqual(["R"]);
    expect(hexColors(game, gecko).has("R")).toBe(true);
    expect(hexColors(game, gecko).has("B")).toBe(false);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    give(game, B);
    expect(() => cast(game, bolt, { player: B, targets: [ref(gecko)], settle: false })).toThrow();
    nextTurn(game);
    expect(hexColors(game, gecko).size).toBe(0);
  });

  it("draws a card for each colour among your permanents as it connects", () => {
    const { game, a } = table();
    const gecko = spawn(game, "Mondo Gecko");
    spawn(game, "Grizzly Bears");
    spawn(game, "Royal Assassin");
    for (let i = 0; i < 4; i++) toLibrary(game, "Wastes");
    const before = hand(game).length;
    attack(game, a, [gecko]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before + 3);
  });
});
