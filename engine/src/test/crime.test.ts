/**
 * Committing a crime (rule 700.13): "A player commits a crime as that player
 * casts a spell, activates an ability, or puts a triggered ability on the
 * stack and that spell or ability targets at least one opponent; at least one
 * permanent, spell, or ability an opponent controls; and/or at least one card
 * in an opponent's graveyard." — read by "whenever you commit a crime"
 * (`crime-committed` triggers) and "if you've committed a crime this turn"
 * (`committed-crime-this-turn`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  enter,
  keywords,
  lands,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
} from "./harness.js";

const crimes = (game: Game, player: PlayerId = A): number => game.state.players[player].crimesThisTurn ?? 0;

const bolt = (game: Game, target: PlayerId | string, player: PlayerId = A): void => {
  lands(game, "Mountain", 1, player);
  cast(game, toHand(game, "Lightning Bolt", player), { player, targets: [ref(target as never)] });
};

describe("committing a crime", () => {
  it("targeting an opponent is a crime; targeting yourself or your own creature isn't", () => {
    const { game } = table();
    const buster = spawn(game, "Slickshot Vault-Buster");
    const bear = spawn(game, "Grizzly Bears");
    bolt(game, A);
    bolt(game, bear);
    expect(crimes(game)).toBe(0);
    expect(pt(game, buster)).toEqual({ power: 1, toughness: 4 });
    bolt(game, B);
    expect(crimes(game)).toBe(1);
    expect(pt(game, buster)).toEqual({ power: 3, toughness: 4 });
  });

  it("an opponent's permanent, their spell, and a card in their graveyard are crimes; your own graveyard isn't", () => {
    const { game } = table();
    // A permanent an opponent controls.
    bolt(game, spawn(game, "Grizzly Bears", B));
    expect(crimes(game)).toBe(1);
    // A card in your own graveyard, then one in theirs (an ability).
    const ooze = spawn(game, "Scavenging Ooze");
    lands(game, "Forest", 2);
    activate(game, ooze, 0, { targets: [ref(toGraveyard(game, "Grizzly Bears", A))] });
    expect(crimes(game)).toBe(1);
    activate(game, ooze, 0, { targets: [ref(toGraveyard(game, "Grizzly Bears", B))] });
    expect(crimes(game)).toBe(2);
    // A spell an opponent controls: Bob's crime this time.
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const bobsBolt = toHand(game, "Lightning Bolt", B);
    game.dispatch({ type: "cast-spell", player: B, card: bobsBolt, targets: [ref(B)] });
    expect(crimes(game, B)).toBe(0);
    lands(game, "Island", 2);
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Counterspell"), { targets: [ref(bobsBolt)] });
    expect(crimes(game)).toBe(1);
  });

  it("a triggered ability put on the stack targeting an opponent's creature is a crime", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Flametongue Kavu");
    expect(crimes(game)).toBe(1);
  });

  it("a copy isn't cast, so it commits no crime", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const first = toHand(game, "Lightning Bolt");
    game.dispatch({ type: "cast-spell", player: A, card: first, targets: [ref(B)] });
    expect(crimes(game)).toBe(1);
    lands(game, "Island", 2);
    // Twincast targets Alice's own Bolt — no crime — and its copy targets Bob.
    cast(game, toHand(game, "Twincast"), { targets: [ref(first)] });
    expect(crimes(game)).toBe(1);
  });

  it("'whenever you commit a crime' triggers once each turn, and resets with the turn", () => {
    const { game } = table();
    const hustler = spawn(game, "Blood Hustler");
    lands(game, "Swamp", 8);
    // Its own drain targets an opponent: a crime.
    activate(game, hustler, 0, { targets: [ref(B)] });
    expect(counters(game, hustler)).toBe(1);
    activate(game, hustler, 0, { targets: [ref(B)] });
    expect(crimes(game)).toBe(2);
    expect(counters(game, hustler)).toBe(1);
    nextTurn(game);
    expect(crimes(game)).toBe(0);
    nextTurn(game);
    bolt(game, B);
    expect(counters(game, hustler)).toBe(2);
  });

  it("'during your turn' — not on an opponent's turn", () => {
    const { game } = table();
    const muscle = spawn(game, "Overzealous Muscle");
    nextTurn(game); // Bob's turn: Alice's instant is a crime, but not during her turn.
    lands(game, "Mountain", 1);
    game.dispatch({ type: "pass-priority", player: B });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(crimes(game)).toBe(1);
    expect(keywords(game, muscle).has("indestructible")).toBe(false);
    nextTurn(game);
    bolt(game, B);
    expect(keywords(game, muscle).has("indestructible")).toBe(true);
  });

  it("an opponent's crime against a third player still triggers 'whenever an opponent commits a crime'", () => {
    const { game } = table({ players: 3 });
    const peacemaker = enter(game, "Patrolling Peacemaker");
    expect(counters(game, peacemaker)).toBe(2);
    // Alice's own crime doesn't.
    bolt(game, B);
    expect(counters(game, peacemaker)).toBe(2);
    nextTurn(game);
    bolt(game, C, B);
    settle(game);
    expect(crimes(game, B)).toBe(1);
    expect(counters(game, peacemaker)).toBe(3);
  });
});
