import { describe, expect, it } from "vitest";

import { A, B, cast, destroy, lands, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

/**
 * A rules audit (2026-11-26): what counts as casting a commander (rule
 * 903.8 — the tax is the casts from the command zone), what a copy of one
 * is (707.10, 903.3), and a "can't lose" holding until it's gone (104.3, 704.5a).
 */
const KIKI = "Kiki-Jiki, Mirror Breaker";

describe("commander casts and copies, audited", () => {
  it("a copy of the commander spell (Double Major) is a token, not a commander, and adds no tax (rules 707.10f, 903.3, 903.8)", () => {
    const { game } = table({ commanders: [KIKI] });
    const kiki = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === KIKI)!;
    lands(game, "Mountain", 5);
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    cast(game, kiki, { settle: false });
    cast(game, toHand(game, "Double Major"), { targets: [ref(kiki)] });
    const all = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === KIKI);
    expect(all).toHaveLength(2);
    const copy = all.find((id) => id !== kiki)!;
    expect(game.state.objects[copy].isToken).toBe(true);
    expect(game.state.objects[copy].isCommander).toBe(false);
    expect(game.state.objects[kiki].isCommander).toBe(true);
    expect(game.state.players[A].commanderCastCounts[KIKI]).toBe(1);
  });

  it("the commander cast from hand adds no tax: only casts from the command zone count (rule 903.8)", () => {
    const { game } = table();
    // A commander its owner left in hand (rule 903.9b declined).
    const kiki = toHand(game, KIKI);
    game.state.objects[kiki].isCommander = true;
    lands(game, "Mountain", 5);
    cast(game, kiki);
    expect(zone(game, kiki)).toBe("battlefield");
    expect(game.state.players[A].commanderCastCounts[KIKI] ?? 0).toBe(0);
  });

  it("Platinum Angel: at 0 life its controller stays in; once it's gone, they lose (rules 104.3b, 704.5a)", () => {
    const { game } = table({ players: 3 });
    const angel = spawn(game, "Platinum Angel", B);
    game.state.players[B].life = 0;
    toStep(game, "postcombat-main");
    expect(game.state.players[B].hasLost).toBe(false);
    destroy(game, angel, A);
    settle(game);
    toStep(game, "end");
    expect(game.state.players[B].hasLost).toBe(true);
  });
});
