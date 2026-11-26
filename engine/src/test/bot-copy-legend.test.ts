/**
 * A token copy of a legend of ours meets the legend rule (rule 704.5j) and
 * one of the two goes at once. Kept game G9TFZ (2026-11-25): Echocasting
 * Symposium's free copy made a Sakashima the Impostor (a copy of Indomitable
 * Ancients, legendary by its copy exception, rule 707.9b) every turn for
 * sixty turns, each dying at once, with Fatespinners there to copy instead.
 */

import { describe, expect, it } from "vitest";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import { A, enter, lands, table, toHand } from "./harness.js";

const viewFor = (game: Game) => ({ player: A, state: game.state, legalActions: () => game.legalActions(A) });

describe("a token copy of a creature of ours", () => {
  it("isn't made of a legend of ours while another creature can be copied", () => {
    const { game } = table({ step: "precombat-main" });
    lands(game, "Island", 6);
    enter(game, "Grizzly Bears");
    // A 12/12 ranks far above the Bears, and its copy would die at once.
    const ghalta = enter(game, "Ghalta, Primal Hunger");
    game.state.zones.perPlayer[A].hand = [];
    toHand(game, "Echocasting Symposium");
    const answer = new HeuristicBotController(A, game.registry).act(viewFor(game));
    expect(answer.type).toBe("cast-spell");
    if (answer.type !== "cast-spell") return;
    const copied = answer.targets?.[1];
    expect(copied?.kind).toBe("object");
    expect(copied?.kind === "object" ? copied.object : undefined).not.toBe(ghalta);
  });
});
