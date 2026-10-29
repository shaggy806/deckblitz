/**
 * "Its controller draws / discards / gets a poison counter" (the need-keys
 * `effect:player-scope-extensions` group): a `draw`'s `who`, a `discard`'s
 * `target` and an `add-player-counters`' `who` naming one player through a
 * target slot (`{ controllerOfTarget: n }`), read as the permanent last
 * existed once it has left the battlefield (rule 608.2h).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, ref, settle, spawn, table, toHand } from "./harness.js";

describe("the controller of a target as the player an effect names", () => {
  it("Assassin's Strike: the destroyed creature's controller discards", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bear = spawn(game, "Grizzly Bears", B);
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    cast(game, toHand(game, "Assassin's Strike"), { targets: [ref(bear)] });
    settle(game);
    expect(game.state.objects[bear].zone).toBe("graveyard");
    expect(hand(game, B).length).toBe(handB - 1);
    expect(hand(game, A).length).toBe(handA);
  });

  it("Call to Heel: the returned creature's controller draws", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    cast(game, toHand(game, "Call to Heel"), { targets: [ref(bear)] });
    settle(game);
    expect(hand(game, B)).toContain(bear);
    expect(hand(game, B).length).toBe(handB + 2);
    expect(hand(game, A).length).toBe(handA);
  });

  it("Pistus Strike: the destroyed flyer's controller gets a poison counter", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bird = spawn(game, "Suntail Hawk", B);
    cast(game, toHand(game, "Pistus Strike"), { targets: [ref(bird)] });
    settle(game);
    expect(game.state.objects[bird].zone).toBe("graveyard");
    expect(game.state.players[B].counters.poison ?? 0).toBe(1);
    expect(game.state.players[A].counters.poison ?? 0).toBe(0);
  });
});
