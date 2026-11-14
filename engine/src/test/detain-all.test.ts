/**
 * Detain each matching permanent (rule 701.35a) — a `for-each-permanent`
 * around `detain`: Lavinia of the Tenth's "detain each nonland permanent your
 * opponents control with mana value 4 or less".
 */
import { describe, expect, it } from "vitest";

import { A, B, C, enter, nextTurn, spawn, table } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

const canActivate = (game: Game, player: PlayerId, id: ObjectId): boolean =>
  game.legalActions(player).some((o) => o.kind === "activate-ability" && o.source === id);

describe("detain each — Lavinia of the Tenth", () => {
  it("detains every opponent's nonland permanent with mana value 4 or less, and nothing else", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    const rod = spawn(game, "Rod of Ruin", C);
    const giant = spawn(game, "Craw Wurm", B); // mana value 6
    const mine = spawn(game, "Grizzly Bears", A);
    enter(game, "Lavinia of the Tenth");
    const detained = (id: ObjectId): boolean =>
      game.state.objects[id].modifiers.some((m) => m.abilitiesCantBeActivated === true);
    expect(detained(bears)).toBe(true);
    expect(detained(rod)).toBe(true);
    expect(detained(giant)).toBe(false);
    expect(detained(mine)).toBe(false);
  });

  it("lasts until Lavinia's controller's next turn", () => {
    const { game } = table();
    const rod = spawn(game, "Rod of Ruin", B);
    spawn(game, "Wastes", B);
    spawn(game, "Wastes", B);
    spawn(game, "Wastes", B);
    enter(game, "Lavinia of the Tenth");
    nextTurn(game); // bob's turn
    expect(activePlayerOf(game.state)).toBe(B);
    expect(canActivate(game, B, rod)).toBe(false);
    nextTurn(game); // alice's: it ends
    nextTurn(game); // bob's again
    expect(canActivate(game, B, rod)).toBe(true);
  });
});
