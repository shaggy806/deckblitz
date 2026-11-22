/**
 * "Change the target to enchanted creature if able" (`change-targets`
 * `to: "attached"`, rule 115.7a — Captured by the Consulate): the one new
 * target is the creature the source enchants; a spell that can't target it
 * keeps its target, and only a spell with a single target (115.9a) triggers it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, life, lands, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

/** Alice's Captured by the Consulate on Bob's Grizzly Bears; Bob holding
 * priority with red and green mana. */
const setUp = () => {
  const t = table();
  lands(t.game, "Plains", 4);
  lands(t.game, "Mountain", 2, B);
  lands(t.game, "Forest", 1, B);
  const captive = spawn(t.game, "Grizzly Bears", B);
  const mine = spawn(t.game, "Llanowar Elves");
  const aura = toHand(t.game, "Captured by the Consulate");
  cast(t.game, aura, { targets: [ref(captive)] });
  expect(t.game.state.objects[aura].attachedTo).toBe(captive);
  return { ...t, captive, mine, aura };
};
const toBob = (game: Game): void => {
  game.dispatch({ type: "pass-priority", player: A });
};

describe("Captured by the Consulate", () => {
  it("an opponent's spell aimed at my creature hits the enchanted creature instead", () => {
    const { game, captive, mine } = setUp();
    toBob(game);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(mine)] });
    expect(zone(game, captive)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("a spell aimed at me goes to the enchanted creature", () => {
    const { game, captive } = setUp();
    toBob(game);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(zone(game, captive)).toBe("graveyard");
    expect(life(game)).toBe(20);
  });

  it("a spell that can't target a creature keeps its target", () => {
    const { game, captive } = setUp();
    toStep(game, "precombat-main", B);
    cast(game, toHand(game, "Lava Spike", B), { player: B, targets: [ref(A)] });
    expect(life(game)).toBe(17);
    expect(zone(game, captive)).toBe("battlefield");
  });

  it("my own spells aren't changed", () => {
    const { game, captive } = setUp();
    lands(game, "Mountain", 1);
    const target = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    expect(zone(game, captive)).toBe("battlefield");
  });
});
