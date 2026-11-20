/**
 * `"attached-as-triggered"`: what a triggered ability's source was attached
 * to as it triggered (`LastKnownRefs.attachedHost`), proven on Dead-Iron
 * Sledge — "Whenever equipped creature blocks or becomes blocked by a
 * creature, destroy both creatures." Moving the Sledge after it triggers
 * doesn't change which creatures are destroyed (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, ref, settle, spawn, table, toStep, zone } from "./harness.js";

const equip = (game: Game, sledge: ObjectId, creature: ObjectId, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "attach", target: 0 }, [ref(creature)], { source: sledge });
  settle(game);
};

describe("Dead-Iron Sledge", () => {
  it("destroys the equipped attacker and the creature blocking it", () => {
    const { game, a, b } = table();
    const sledge = spawn(game, "Dead-Iron Sledge");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Craw Wurm", B);
    equip(game, sledge, bears);
    expect(game.state.objects[sledge].attachedTo).toBe(bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, sledge)).toBe("battlefield");
  });

  it("destroys the equipped blocker and the creature it blocks", () => {
    const { game, a, b } = table();
    const sledge = spawn(game, "Dead-Iron Sledge", B);
    const wall = spawn(game, "Horned Turtle", B);
    const wurm = spawn(game, "Craw Wurm");
    equip(game, sledge, wall, B);
    a.declareAttackersFn = () => [{ attacker: wurm, defender: B }];
    b.declareBlockersFn = () => [{ blocker: wall, attacker: wurm }];
    toStep(game, "postcombat-main");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("destroys the creature equipped as it triggered, though the Sledge has moved since", () => {
    const { game, a, b } = table();
    const sledge = spawn(game, "Dead-Iron Sledge");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Horned Turtle");
    const giant = spawn(game, "Craw Wurm", B);
    equip(game, sledge, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.zones.shared.stack.length > 0);
    game.debugApplyEffect(A, { kind: "attach", target: 0 }, [ref(other)], { source: sledge });
    expect(game.state.objects[sledge].attachedTo).toBe(other);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("an unequipped creature blocking triggers nothing", () => {
    const { game, a, b } = table();
    spawn(game, "Dead-Iron Sledge");
    const bears = spawn(game, "Grizzly Bears");
    const turtle = spawn(game, "Horned Turtle", B);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [{ blocker: turtle, attacker: bears }];
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, turtle)).toBe("battlefield");
  });
});
