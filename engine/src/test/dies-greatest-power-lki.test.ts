/**
 * "Whenever a creature an opponent controls with the greatest power among
 * creatures that player controls dies" (Kraven the Hunter): a dies trigger
 * looks back in time (rule 603.10a), so `greatestAmongItsController` is
 * asked of the creature as it compared just before it died — the board as
 * it was, its fellows in a wrath and a lord that died with it included —
 * through the snapshot taken as it left (`LastKnownInfo.
 * greatestAmongItsController`). Ties count, each player's creatures apart.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, counters, destroy, hand, settle, spawn, table } from "./harness.js";
import type { Game } from "../game.js";

const KRAVEN = "Kraven the Hunter";

/** Destroy every creature alice's opponents control at once, as her effect,
 * and play out the triggers. */
function wipe(game: Game): void {
  game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature", controlledBy: "opponent" } }, []);
  settle(game);
}

describe("Kraven the Hunter", () => {
  it("an opponent's greatest-power creature dies: draw a card and a +1/+1 counter", () => {
    const { game } = table();
    const kraven = spawn(game, KRAVEN);
    spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const before = hand(game, A).length;
    destroy(game, giant);
    expect(counters(game, kraven)).toBe(1);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("a smaller one dies: nothing", () => {
    const { game } = table();
    const kraven = spawn(game, KRAVEN);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    destroy(game, bears);
    expect(counters(game, kraven)).toBe(0);
  });

  it("a wrath: only the one that was greatest before it triggers, read against the board as it was", () => {
    const { game } = table();
    const kraven = spawn(game, KRAVEN);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    wipe(game);
    expect(counters(game, kraven)).toBe(1);
  });

  it("ties count: two creatures tied for the greatest dying together trigger twice", () => {
    const { game } = table();
    const kraven = spawn(game, KRAVEN);
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", B);
    wipe(game);
    expect(counters(game, kraven)).toBe(2);
  });

  it("a lord that pumped a bigger creature isn't the greatest, though the other shrinks once it's gone", () => {
    const { game } = table();
    const kraven = spawn(game, KRAVEN);
    // Lord of Atlantis is 2/2; Coral Merfolk, 2/1, is 3/2 with it: greater.
    const lord = spawn(game, "Lord of Atlantis", B);
    spawn(game, "Coral Merfolk", B);
    destroy(game, lord);
    // Once the lord is gone the Coral Merfolk is 2/1, tied with the lord's 2:
    // read now, the lord would be "the greatest". As it was, it wasn't.
    expect(counters(game, kraven)).toBe(0);
  });

  it("a lord tied for the greatest as it died does trigger", () => {
    const { game } = table();
    const kraven = spawn(game, KRAVEN);
    // Merfolk of the Pearl Trident, 1/1, is 2/2 with the lord: tied.
    const lord = spawn(game, "Lord of Atlantis", B);
    spawn(game, "Merfolk of the Pearl Trident", B);
    destroy(game, lord);
    expect(counters(game, kraven)).toBe(1);
  });

  it("each player's creatures apart: the greatest of the one who lost it", () => {
    const { game } = table({ players: 3 });
    const kraven = spawn(game, KRAVEN);
    spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", C);
    destroy(game, bears);
    expect(counters(game, kraven)).toBe(1);
  });

  it("only an opponent's: Kraven's controller's own greatest creature dying is nothing", () => {
    const { game } = table();
    const kraven = spawn(game, KRAVEN);
    const giant = spawn(game, "Hill Giant", A);
    destroy(game, giant);
    expect(counters(game, kraven)).toBe(0);
  });

  it("Kraven dying in the same wrath still triggers, looking back: it draws", () => {
    const { game } = table();
    spawn(game, KRAVEN);
    spawn(game, "Hill Giant", B);
    const before = hand(game, A).length;
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });
});
