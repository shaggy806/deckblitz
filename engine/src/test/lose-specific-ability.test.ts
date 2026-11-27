/**
 * "Until end of turn, this creature loses 'Prevent all damage that would be
 * dealt to this creature'" (Glittering Lynx, Glittering Lion): one static
 * ability taken away by its text (layer 6, `PtModifier.loseStatics`). Its own
 * text's whenever, and one granted it only by a loss later than the grant
 * (rule 613.7). Any player may activate it (rule 602.2).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

function bolt(game: Game, at: ObjectId, player = A): void {
  lands(game, "Mountain", 1, player);
  cast(game, toHand(game, "Lightning Bolt", player), { targets: [ref(at)], player });
}

describe("Glittering Lynx", () => {
  it("prevents all damage dealt to it", () => {
    const { game } = table();
    const lynx = spawn(game, "Glittering Lynx");
    bolt(game, lynx);
    expect(zone(game, lynx)).toBe("battlefield");
    expect(damage(game, lynx)).toBe(0);
  });

  it("loses the prevention until end of turn once activated", () => {
    const { game } = table();
    const lynx = spawn(game, "Glittering Lynx");
    lands(game, "Plains", 2);
    activate(game, lynx, 0);
    bolt(game, lynx);
    expect(zone(game, lynx)).toBe("graveyard");
  });

  it("has it back the next turn", () => {
    const { game } = table();
    const lynx = spawn(game, "Glittering Lynx");
    lands(game, "Plains", 2);
    activate(game, lynx, 0);
    nextTurn(game);
    bolt(game, lynx, B);
    expect(zone(game, lynx)).toBe("battlefield");
  });

  it("any player may activate it", () => {
    const { game } = table();
    const lynx = spawn(game, "Glittering Lynx");
    lands(game, "Plains", 2, B);
    nextTurn(game); // Bob's turn: he has priority
    activate(game, lynx, 0, { player: B });
    bolt(game, lynx, B);
    expect(zone(game, lynx)).toBe("graveyard");
  });
});

describe("Glittering Lion", () => {
  it("a granted ability of the same text from before the loss goes too", () => {
    const { game } = table();
    game.state.players[A].life = 30;
    const lion = spawn(game, "Glittering Lion");
    lands(game, "Plains", 5);
    const caduceus = spawn(game, "Caduceus, Staff of Hermes");
    activate(game, caduceus, 0, { targets: [ref(lion)] });
    // Granted before the loss: lost with the Lion's own.
    activate(game, lion, 0);
    bolt(game, lion);
    expect(damage(game, lion)).toBe(3);
  });

  it("an equal ability granted after the loss stays (rule 613.7)", () => {
    const { game } = table();
    game.state.players[A].life = 30;
    const lion = spawn(game, "Glittering Lion");
    lands(game, "Plains", 5);
    activate(game, lion, 0);
    const caduceus = spawn(game, "Caduceus, Staff of Hermes");
    activate(game, caduceus, 0, { targets: [ref(lion)] });
    bolt(game, lion);
    expect(damage(game, lion)).toBe(0);
  });
});
