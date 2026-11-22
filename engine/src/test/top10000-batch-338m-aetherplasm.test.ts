/**
 * B338, combat-targeting lane: Aetherplasm — "you may return this creature to
 * its owner's hand. If you do, you may put a creature card from your hand onto
 * the battlefield blocking that creature" (509.4, `enter-blocking`); the
 * attacker stays blocked with nothing put in (509.1h).
 */
import { describe, expect, it } from "vitest";

import { B, life, pickFromZone, pickModes, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Aetherplasm", () => {
  it("returns to hand and puts a creature card from hand onto the battlefield blocking that creature", () => {
    const { game, a, b } = table();
    const plasm = spawn(game, "Aetherplasm", B);
    const wurm = toHand(game, "Craw Wurm", B);
    toHand(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = () => [{ blocker: plasm, attacker: giant }];
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    pickModes(b, 0);
    const offered = pickFromZone(b, wurm);
    game.advanceUntil((s) => s.turn.step === "combat-damage");
    expect(offered.offered).toContain(wurm);
    expect(zone(game, plasm)).toBe("hand");
    expect(game.state.objects[wurm].blocking).toBe(giant);
    toStep(game, "postcombat-main");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("leaves the attacker blocked when nothing is put in", () => {
    const { game, a, b } = table();
    const plasm = spawn(game, "Aetherplasm", B);
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = () => [{ blocker: plasm, attacker: giant }];
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    pickModes(b, 0);
    pickFromZone(b);
    toStep(game, "postcombat-main");
    expect(zone(game, plasm)).toBe("hand");
    expect(life(game, B)).toBe(20);
  });

  it("does nothing when declined", () => {
    const { game, a, b } = table();
    const plasm = spawn(game, "Aetherplasm", B);
    const giant = spawn(game, "Hill Giant");
    b.declareBlockersFn = () => [{ blocker: plasm, attacker: giant }];
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    pickModes(b);
    toStep(game, "postcombat-main");
    expect(zone(game, plasm)).toBe("graveyard");
  });
});
