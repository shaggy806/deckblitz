/**
 * An effect acting on the card a cost exiled, where it is (`{ paid: "exiled" }`
 * as an effect's object): Jhoira of the Ghitu's "{2}, Exile a nonland card
 * from your hand: Put four time counters on the exiled card. If it doesn't
 * have suspend, it gains suspend." The card stays in exile, now suspended
 * (rule 702.62b), and is cast for free when the last counter comes off, a
 * creature with haste (702.62a).
 */
import { describe, expect, it } from "vitest";
import {
  A,
  activate,
  counters,
  hand,
  lands,
  pickFromZone,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Jhoira of the Ghitu", () => {
  it("puts four time counters on the card its cost exiled, which is then suspended and cast for free with haste", () => {
    const { game, a } = table();
    const jhoira = spawn(game, "Jhoira of the Ghitu");
    lands(game, "Island", 2);
    const giant = toHand(game, "Hill Giant");
    const bolt = toHand(game, "Lightning Bolt");
    const land = toHand(game, "Mountain");
    const seen = pickFromZone(a, giant);
    activate(game, jhoira, 0);
    // Nonland only.
    expect([...seen.offered].sort()).toEqual([giant, bolt].sort());
    expect(seen.offered).not.toContain(land);
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, giant, "time")).toBe(4);
    expect(game.state.objects[giant].suspended).toBe(true);
    expect(hand(game)).toContain(land);

    a.chooseCastNowFn = (_v, offer) =>
      offer.casts.length === 0 ? null : { type: "cast-spell", player: A, card: offer.cards[0], targets: [], via: "effect", free: true };
    for (const left of [3, 2, 1]) {
      toStep(game, "upkeep");
      settle(game);
      expect(counters(game, giant, "time")).toBe(left);
    }
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    // Suspend's haste (rule 702.62a), held as the engine holds it.
    expect(game.state.objects[giant].hastyUntilItLeaves).toBe(true);
  });

  it("can't be activated with only lands in hand", () => {
    const { game } = table();
    const jhoira = spawn(game, "Jhoira of the Ghitu");
    lands(game, "Island", 2);
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    toHand(game, "Mountain");
    expect(game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === jhoira)).toBe(false);
  });
});
