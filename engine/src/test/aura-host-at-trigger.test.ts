/**
 * "At the beginning of the end step of enchanted creature's controller,
 * destroy **that creature** if it didn't attack this turn": the creature the
 * Aura enchanted as the ability triggered (`"attached-as-triggered"`), asked
 * as it resolves (not an intervening if). Moving the enchantment after the
 * ability triggers doesn't change which creature is affected (Aggression's
 * ruling). The step is that creature's controller's (`who: "attached"`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, keywords, nextTurn, ref, settle, spawn, table, toStep, zone } from "./harness.js";

const enchant = (game: Game, aura: ObjectId, creature: ObjectId, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "attach", target: 0 }, [ref(creature)], { source: aura });
  settle(game);
};

describe("Aggression", () => {
  it("gives first strike and trample, and destroys the creature at its controller's end step if it didn't attack", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Aggression");
    enchant(game, aura, bears);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("spares a creature that attacked this turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Aggression");
    enchant(game, aura, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("waits for the end step of the enchanted creature's controller, not the Aura's", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const aura = spawn(game, "Aggression");
    enchant(game, aura, bears);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    // Bob's end step comes before alice's next turn.
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("destroys the creature enchanted as it triggered, though the Aura has moved since", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Aggression");
    enchant(game, aura, bears);
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    enchant(game, aura, other);
    expect(game.state.objects[aura].attachedTo).toBe(other);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });
});
