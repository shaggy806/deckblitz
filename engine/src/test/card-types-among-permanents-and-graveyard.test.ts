/**
 * "Six or more card types among permanents you control and/or cards in your
 * graveyard" — a `distinct` `"card-type"` aggregate over your permanents with
 * a `plus` of your graveyard's cards: each type once, a permanent's types as
 * they are now, a card's printed ones. Proved on Happily Ever After, whose
 * upkeep trigger has one long intervening "if" (rule 603.4, the ruling).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, enter, hand, life, nextTurn, ref, spawn, table, toGraveyard } from "./harness.js";

/** Five colors among alice's creatures, Happily Ever After, a Plains and a
 * Sol Ring: creature, enchantment, land and artifact on her battlefield. */
function board(game: Game, { solRing = true } = {}): void {
  spawn(game, "Happily Ever After");
  for (const name of ["Savannah Lions", "Merfolk Looter", "Vampire Nighthawk", "Goblin Guide", "Grizzly Bears"]) spawn(game, name);
  spawn(game, "Plains");
  if (solRing) spawn(game, "Sol Ring");
}
/** On to alice's next upkeep, its trigger resolved. */
function toHerUpkeep(game: Game): void {
  nextTurn(game);
  nextTurn(game, "draw");
}

describe("Happily Ever After", () => {
  it("as it enters, each player gains 5 life and draws a card", () => {
    const { game } = table();
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    enter(game, "Happily Ever After");
    expect([life(game, A), life(game, B)]).toEqual([25, 25]);
    expect([hand(game, A).length, hand(game, B).length]).toEqual([mine + 1, theirs + 1]);
  });

  it("five colors, six card types with the graveyard's, life at the starting total: you win at your upkeep", () => {
    const { game } = table();
    board(game);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toHerUpkeep(game);
    expect(game.state.result.over).toBe(true);
    expect(game.state.result.winner).toBe(A);
  });

  it("five card types only (no sorcery in the graveyard): nothing happens", () => {
    const { game } = table();
    board(game);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Lightning Bolt");
    toHerUpkeep(game);
    expect(game.state.result.over).toBe(false);
  });

  it("a life total below the starting one: nothing happens", () => {
    const { game } = table();
    board(game);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    game.state.players[A].life = 19;
    toHerUpkeep(game);
    expect(game.state.result.over).toBe(false);
  });

  it("four colors: nothing happens", () => {
    const { game } = table();
    spawn(game, "Happily Ever After");
    for (const name of ["Savannah Lions", "Merfolk Looter", "Vampire Nighthawk", "Grizzly Bears"]) spawn(game, name);
    spawn(game, "Plains");
    spawn(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toHerUpkeep(game);
    expect(game.state.result.over).toBe(false);
  });

  it("a permanent's card types are its own now: a creature made an artifact is the artifact", () => {
    const { game } = table();
    board(game, { solRing: false });
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    const bears = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    if (bears === undefined) throw new Error("no Bears");
    game.debugApplyEffect(A, { kind: "become", target: 0, addTypes: ["artifact"], duration: "permanent" }, [ref(bears)]);
    toHerUpkeep(game);
    expect(game.state.result.over).toBe(true);
  });

  it("without that, five card types: nothing happens", () => {
    const { game } = table();
    board(game, { solRing: false });
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toHerUpkeep(game);
    expect(game.state.result.over).toBe(false);
  });
});
