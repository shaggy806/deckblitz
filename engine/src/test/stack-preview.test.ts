import { describe, expect, it } from "vitest";
import { wouldAffectPlayer } from "../stack-preview.js";
import { A, B, cast, lands, ref, spawn, table, toHand } from "./harness.js";

// The server's auto-pass stops for an opponent's spell only when it would
// affect the seat (the user, 2026-11-11): `wouldAffectPlayer` answers that by
// resolving it on a copy.

const top = (game: ReturnType<typeof table>["game"]) => {
  const stack = game.state.zones.shared.stack;
  return stack[stack.length - 1];
};

describe("wouldAffectPlayer", () => {
  it("a Bolt at a player affects them, and not the other player", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    expect(wouldAffectPlayer(game.state, game.registry, top(game), B)).toBe(true);
    expect(wouldAffectPlayer(game.state, game.registry, top(game), game.state.turnOrder[2])).toBe(false);
    // Asked on a copy: the real Bolt is still waiting.
    expect(game.state.players[B].life).toBe(20);
  });

  it("an untargeted sweeper affects whoever has a creature in it", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Pyroclasm"), { settle: false });
    expect(wouldAffectPlayer(game.state, game.registry, top(game), B)).toBe(true);
  });

  it("a sweeper that misses a player's board leaves them alone", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Grizzly Bears", A);
    cast(game, toHand(game, "Pyroclasm"), { settle: false });
    expect(wouldAffectPlayer(game.state, game.registry, top(game), B)).toBe(false);
  });

  it("a creature spell affects no one else", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Grizzly Bears"), { settle: false });
    expect(wouldAffectPlayer(game.state, game.registry, top(game), B)).toBe(false);
  });

  it("a pump on the board through the layers counts: Overrun on a player's creatures, not an opponent's", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Overrun"), { settle: false });
    expect(wouldAffectPlayer(game.state, game.registry, top(game), A)).toBe(true);
    expect(wouldAffectPlayer(game.state, game.registry, top(game), B)).toBe(false);
  });

  it("is null for something not on the stack", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    expect(wouldAffectPlayer(game.state, game.registry, bears, B)).toBeNull();
  });
});
