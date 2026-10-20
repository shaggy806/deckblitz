/**
 * "Spells you cast from **your** graveyard cost {1} less" (Patrician Geist, Green Goblin): a
 * card is in its owner's graveyard, so the reduction reaches only a card the static's controller
 * owns (the cost-modification `castFrom` check). Nothing in the pool yet casts a paid spell from
 * an opponent's graveyard (Memory Plunder's cast is free), so what this guards is that the owner
 * check leaves your own graveyard's discount alone.
 */
import { describe, expect, it } from "vitest";

import { A, lands, ref, spawn, table, toGraveyard } from "./harness.js";

describe("a graveyard cost reduction reads whose graveyard (Patrician Geist)", () => {
  it("reduces a card cast from your own graveyard", () => {
    const { game } = table();
    spawn(game, "Patrician Geist");
    const mine = toGraveyard(game, "Divination", A);
    game.debugApplyEffect(A, { kind: "grant-graveyard-cast", target: 0 }, [ref(mine)]);
    lands(game, "Island", 2);
    // {2}{U} with two Islands: castable only reduced.
    expect(game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === mine)).toBe(true);
  });
});
