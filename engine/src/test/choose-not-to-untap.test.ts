/**
 * "You may choose not to untap ~ during your untap step" (rule 502.3) and
 * effects lasting "for as long as ~ remains tapped" (611.2b): Antiquities'
 * Ashnod's Battle Gear and Phyrexian Gremlins. The choice is asked in the
 * untap step, with no priority (502.4); the effect ends as the source
 * untaps or leaves.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, destroy, lands, nextTurn, pickPermanents, pt, ref, spawn, table } from "./harness.js";

describe("may choose not to untap", () => {
  it("Ashnod's Battle Gear: left tapped, the bonus lasts; untapped, it ends", () => {
    const { game, a } = table();
    const gear = spawn(game, "Ashnod's Battle Gear");
    lands(game, "Wastes", 2);
    const giant = spawn(game, "Hill Giant");
    activate(game, gear, 0, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 1 });
    // Bob's turn, then Alice's: she keeps the Gear tapped.
    const kept = pickPermanents(a, gear);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.step).toBe("precombat-main");
    expect(kept.offered).toEqual([gear]);
    expect(game.state.objects[gear].tapped).toBe(true);
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 1 });
    // The next time she lets it untap: the bonus ends with it.
    pickPermanents(a);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[gear].tapped).toBe(false);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("the bonus ends as the source leaves the battlefield", () => {
    const { game } = table();
    const gear = spawn(game, "Ashnod's Battle Gear");
    lands(game, "Wastes", 2);
    const giant = spawn(game, "Hill Giant");
    activate(game, gear, 0, { targets: [ref(giant)] });
    destroy(game, gear);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("Phyrexian Gremlins: the artifact stays tapped while the Gremlins do", () => {
    const { game, a } = table();
    const gremlins = spawn(game, "Phyrexian Gremlins");
    const rock = spawn(game, "Mind Stone", B);
    activate(game, gremlins, 0, { targets: [ref(rock)] });
    expect(game.state.objects[rock].tapped).toBe(true);
    pickPermanents(a, gremlins);
    nextTurn(game); // Bob's untap step: the Mind Stone doesn't untap.
    expect(game.state.turn.step).toBe("precombat-main");
    expect(game.state.objects[rock].tapped).toBe(true);
    nextTurn(game); // Alice keeps the Gremlins tapped.
    expect(game.state.objects[gremlins].tapped).toBe(true);
    pickPermanents(a);
    nextTurn(game);
    nextTurn(game); // Alice lets them untap; the restriction ends.
    expect(game.state.objects[gremlins].tapped).toBe(false);
    nextTurn(game); // Bob's next untap step untaps the Mind Stone.
    expect(game.state.objects[rock].tapped).toBe(false);
    expect(game.state.turn.number).toBeGreaterThan(4);
  });

  it("asks only when the permanent would untap, and only its controller", () => {
    const { game, a } = table();
    spawn(game, "Ashnod's Battle Gear");
    const seen = pickPermanents(a);
    nextTurn(game);
    nextTurn(game);
    // Untapped all along: nothing to choose.
    expect(seen.offered).toEqual([]);
    expect(game.state.players[A].life).toBe(20);
  });
});
