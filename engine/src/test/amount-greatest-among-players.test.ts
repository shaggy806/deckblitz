/**
 * Counting cards in a revealed hand (`reveal-hand` then `{ thisWay: "revealed",
 * filter }`), and `greatestAmongPlayers`: an amount read once per player, the
 * greatest kept — "the greatest number of creatures a player controls", "the
 * player with the most cards in hand".
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

/** The seat's hand, exactly `n` cards: its opening seven go back first. */
const setHand = (game: Game, player: PlayerId, n: number): void => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "library");
  for (let i = 0; i < n; i++) toHand(game, "Wastes", player);
};

describe("counting a revealed hand", () => {
  it("Inquisition deals damage to the target for each white card in their hand", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const spell = toHand(game, "Inquisition");
    toHand(game, "Savannah Lions", B);
    toHand(game, "Serra Angel", B);
    toHand(game, "Grizzly Bears", B);
    const before = life(game, B);
    cast(game, spell, { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 2);
  });

  it("Inquisition aimed at its caster counts their own hand", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const spell = toHand(game, "Inquisition");
    toHand(game, "Savannah Lions", A);
    toHand(game, "Serra Angel", B);
    const before = life(game, A);
    cast(game, spell, { targets: [ref(A)] });
    expect(life(game, A)).toBe(before - 1);
  });

  it("Baleful Stare draws for each Mountain and each red card", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const spell = toHand(game, "Baleful Stare");
    toHand(game, "Mountain", B);
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Taiga", B); // A Mountain Forest, colorless: counts as a Mountain.
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Forest", B);
    const before = hand(game, A).length;
    cast(game, spell, { targets: [ref(B)] });
    // Baleful Stare itself left the hand; three cards drawn.
    expect(hand(game, A).length).toBe(before - 1 + 3);
  });

  it("Withering Gaze counts a card that is both a Forest and green only once", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const spell = toHand(game, "Withering Gaze");
    toHand(game, "Dryad Arbor", B);
    toHand(game, "Lightning Bolt", B);
    const before = hand(game, A).length;
    cast(game, spell, { targets: [ref(B)] });
    expect(hand(game, A).length).toBe(before - 1 + 1);
  });

  it("Darigaaz: pays, chooses a color, then counts that color in the damaged player's hand", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Darigaaz, the Igniter");
    lands(game, "Mountain", 3);
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Shock", B);
    toHand(game, "Grizzly Bears", B);
    pickModes(a, 0);
    a.chooseCreatureTypeFn = (_v, _s, options) => {
      expect(options).toContain("R");
      return "R";
    };
    const before = life(game, B);
    attack(game, a, [dragon]);
    expect(life(game, B)).toBe(before - 6 - 2);
  });

  it("Darigaaz: declining the payment asks nothing and deals only the combat damage", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Darigaaz, the Igniter");
    lands(game, "Mountain", 3);
    toHand(game, "Lightning Bolt", B);
    pickModes(a);
    let asked = false;
    a.chooseCreatureTypeFn = (_v, _s, options) => {
      asked = true;
      return options[0];
    };
    const before = life(game, B);
    attack(game, a, [dragon]);
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(before - 6);
  });

  it("Isperia: a named card in the hand finds a creature with flying", () => {
    const { game, a } = table();
    const sphinx = spawn(game, "Isperia the Inscrutable");
    toHand(game, "Lightning Bolt", B);
    const angel = toLibrary(game, "Serra Angel");
    toLibrary(game, "Grizzly Bears");
    a.chooseCardNameFn = () => "Lightning Bolt";
    const seen = pickFromZone(a, angel);
    attack(game, a, [sphinx]);
    expect(seen.offered).toEqual([angel]);
    expect(zone(game, angel)).toBe("hand");
  });

  it("Isperia: a name not in the hand searches for nothing", () => {
    const { game, a } = table();
    const sphinx = spawn(game, "Isperia the Inscrutable");
    toHand(game, "Lightning Bolt", B);
    const angel = toLibrary(game, "Serra Angel");
    a.chooseCardNameFn = () => "Shock";
    const seen = pickFromZone(a, angel);
    attack(game, a, [sphinx]);
    expect(seen.offered).toEqual([]);
    expect(zone(game, angel)).toBe("library");
  });
});

describe("the greatest of an amount among players", () => {
  it("Investigator's Journal reads the player with the most creatures, whoever they are", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", C);
    lands(game, "Wastes", 2);
    const journal = toHand(game, "Investigator's Journal");
    cast(game, journal);
    expect(counters(game, journal, "suspect")).toBe(3);
  });

  it("Investigator's Journal has no counters on an empty board, and its abilities draw", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const journal = toHand(game, "Investigator's Journal");
    cast(game, journal);
    expect(counters(game, journal, "suspect")).toBe(0);
    const before = hand(game, A).length;
    activate(game, journal, 1);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
    expect(zone(game, journal)).toBe("graveyard");
  });

  it("Investigator's Journal removes a suspect counter to draw", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    const journal = toHand(game, "Investigator's Journal");
    cast(game, journal);
    const before = hand(game, A).length;
    activate(game, journal, 0);
    settle(game);
    expect(counters(game, journal, "suspect")).toBe(1);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Thought Sponge counts the one opponent who drew the most, not their total nor its controller", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 4);
    game.state.players[A].cardsDrawnThisTurn = 9;
    game.state.players[B].cardsDrawnThisTurn = 2;
    game.state.players[C].cardsDrawnThisTurn = 1;
    const sponge = toHand(game, "Thought Sponge");
    cast(game, sponge);
    expect(counters(game, sponge)).toBe(2);
    expect(pt(game, sponge)).toEqual({ power: 3, toughness: 3 });
  });

  it("Thought Sponge counts an opponent who has since left the game (its ruling)", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 4);
    game.state.players[B].cardsDrawnThisTurn = 3;
    game.state.players[C].cardsDrawnThisTurn = 1;
    game.state.players[B].hasLost = true;
    const sponge = toHand(game, "Thought Sponge");
    cast(game, sponge);
    expect(counters(game, sponge)).toBe(3);
  });

  it("Thought Sponge draws its last power as it dies", () => {
    const { game } = table();
    lands(game, "Island", 4);
    game.state.players[B].cardsDrawnThisTurn = 2;
    const sponge = toHand(game, "Thought Sponge");
    cast(game, sponge);
    const before = hand(game, A).length;
    destroy(game, sponge);
    settle(game);
    expect(hand(game, A).length).toBe(before + 3);
  });

  it("Tales of the Ancestors brings each player up to the most, the most draws nothing", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 4);
    setHand(game, A, 1);
    setHand(game, B, 5);
    setHand(game, C, 3);
    const tales = toHand(game, "Tales of the Ancestors");
    cast(game, tales);
    expect(hand(game, A).length).toBe(5);
    expect(hand(game, B).length).toBe(5);
    expect(hand(game, C).length).toBe(5);
  });

  it("Adamaro is the size of the largest opponent's hand, updated as it changes", () => {
    const { game } = table({ players: 3 });
    const adamaro = spawn(game, "Adamaro, First to Desire");
    setHand(game, A, 7);
    setHand(game, B, 2);
    setHand(game, C, 4);
    expect(pt(game, adamaro)).toEqual({ power: 4, toughness: 4 });
    setHand(game, B, 5);
    expect(pt(game, adamaro)).toEqual({ power: 5, toughness: 5 });
  });

  it("Adamaro ignores the hand of an opponent who has left the game (rule 800.4a)", () => {
    const { game } = table({ players: 3 });
    const adamaro = spawn(game, "Adamaro, First to Desire");
    setHand(game, B, 6);
    setHand(game, C, 2);
    game.state.players[B].hasLost = true;
    expect(pt(game, adamaro)).toEqual({ power: 2, toughness: 2 });
  });

  it("Scholarship Sponsor: each player behind searches up to their own difference (its ruling's example)", () => {
    const { game, a, b, c } = table({ players: 3, deck: "Plains" });
    lands(game, "Wastes", 4, A);
    lands(game, "Wastes", 6, B);
    lands(game, "Wastes", 7, C);
    const offers: Record<string, number> = {};
    const answer = (seat: typeof a, player: PlayerId) => {
      seat.chooseFromZoneFn = (_view, eligible, _min, max) => {
        offers[player] = max;
        return eligible.slice(0, max);
      };
    };
    answer(a, A);
    answer(b, B);
    answer(c, C);
    enter(game, "Scholarship Sponsor");
    expect(offers[A]).toBe(3);
    expect(offers[B]).toBe(1);
    expect(offers[C]).toBeUndefined();
    const landsOf = (p: PlayerId): number =>
      game.state.zones.shared.battlefield.filter(
        (id) => game.state.objects[id].controller === p && types(game, id).includes("land"),
      ).length;
    expect(landsOf(A)).toBe(7);
    expect(landsOf(B)).toBe(7);
    expect(landsOf(C)).toBe(7);
  });

  it("Sokenzan Renegade goes to the one player with the most cards in hand", () => {
    const { game } = table({ players: 3 });
    const ogre = spawn(game, "Sokenzan Renegade", B);
    setHand(game, C, 4);
    setHand(game, A, 1);
    setHand(game, B, 2);
    // Bob's upkeep: alice's turn ends, his begins.
    nextTurn(game, "draw");
    expect(controller(game, ogre)).toBe(C);
  });

  it("Sokenzan Renegade stays put when the most is tied (its ruling)", () => {
    const { game } = table({ players: 3 });
    const ogre = spawn(game, "Sokenzan Renegade", B);
    setHand(game, C, 4);
    setHand(game, A, 4);
    setHand(game, B, 0);
    nextTurn(game, "draw");
    expect(controller(game, ogre)).toBe(B);
  });

  it("the read isn't fooled by a graveyard or the battlefield", () => {
    const { game } = table();
    const adamaro = spawn(game, "Adamaro, First to Desire");
    setHand(game, B, 0);
    toGraveyard(game, "Wastes", B);
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, adamaro)).toEqual({ power: 0, toughness: 0 });
    expect(graveyard(game, B).length).toBe(1);
  });
});
