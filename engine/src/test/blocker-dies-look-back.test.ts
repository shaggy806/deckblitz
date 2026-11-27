/**
 * "Whenever a creature blocking this creature dies": a `dies` trigger whose
 * filter's `blockingRelation` reads the creature as it last existed (rule
 * 603.10a) — the attackers it was blocking as it left
 * (`LastKnownInfo.blockedAttackers`, `wasInBlockingRelation`) — with the
 * attacker still in combat, or gone with it in the same event. Baneclaw
 * Marauder, Baneblade Scoundrel's night face.
 */
import { describe, expect, it } from "vitest";

import { nameOf } from "../state.js";
import { A, B, enter, life, spawn, table, toStep, zone } from "./harness.js";

describe("Baneclaw Marauder", () => {
  it("makes the controller of a blocker that dies lose 1 life", () => {
    const { game, a, b } = table();
    const marauder = enter(game, "Baneclaw Marauder");
    expect(nameOf(game.state.objects[marauder])).toBe("Baneclaw Marauder");
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: marauder, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: marauder }];
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("counts each blocker that dies, and a blocker that dies with it", () => {
    const { game, a, b } = table();
    const marauder = enter(game, "Baneclaw Marauder");
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: marauder, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: wurm, attacker: marauder },
      { blocker: bears, attacker: marauder },
    ];
    toStep(game, "postcombat-main");
    // The -1/-1 makes the Wurm 5/3 and the Bears 1/1; the Wurm's 5 kills the
    // Marauder in the same damage step.
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, marauder)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("ignores a creature that wasn't blocking it", () => {
    const { game, a } = table();
    const marauder = enter(game, "Baneclaw Marauder");
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: marauder, defender: B }];
    toStep(game, "combat-damage");
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: bears }]);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
  });
});
