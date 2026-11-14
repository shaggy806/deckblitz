/**
 * "Whenever an opponent activates an ability of an artifact **they control**"
 * (`activates-ability`'s `sourceControlledByActivator`): the permanent is the
 * activating player's own, a mana ability included where the card doesn't
 * exclude one (`orMana`, rule 605). Avalanche of Sector 7, written from the
 * Oracle text, with its power equal to the artifacts its controller's
 * opponents control (a CDA, rule 604.3).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { A, B, activate, lands, life, pt, settle, spawn, table } from "./harness.js";

const AVALANCHE = "Avalanche of Sector 7";

/** An artifact whose ability any player may activate (rule 602.2). */
const sharedLever = defineCard({
  name: "Test Shared Lever",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{1}: You gain 1 life. Any player may activate this ability.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{1}: You gain 1 life. Any player may activate this ability.",
      anyPlayer: true,
    },
  ],
});

describe("Avalanche of Sector 7", () => {
  it("deals 1 damage to an opponent who activates an ability of an artifact they control", () => {
    const { game } = table();
    spawn(game, AVALANCHE, B);
    const stone = spawn(game, "Mind Stone", A);
    // Mind Stone's mana ability: a mana ability counts (the card doesn't exclude one).
    activate(game, stone, 0);
    settle(game);
    expect(life(game, A)).toBe(19);
  });

  it("sees an artifact ability whose cost sacrificed the artifact", () => {
    const { game } = table();
    spawn(game, AVALANCHE, B);
    lands(game, "Plains", 2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 }, []);
    const clue = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Clue Token");
    expect(clue).toBeDefined();
    activate(game, clue!, 0);
    settle(game);
    expect(life(game, A)).toBe(19);
  });

  it("ignores a non-artifact's ability, and its controller's own artifacts", () => {
    const { game } = table();
    spawn(game, AVALANCHE, B);
    activate(game, spawn(game, "Llanowar Elves", A), 0);
    settle(game);
    expect(life(game, A)).toBe(20);

    const { game: game2 } = table();
    spawn(game2, AVALANCHE, A);
    activate(game2, spawn(game2, "Mind Stone", A), 0);
    settle(game2);
    expect(life(game2, A)).toBe(20);
  });

  it("ignores an opponent activating an artifact they don't control", () => {
    const { game } = table({ ownRegistry: true });
    game.registry.register(sharedLever);
    spawn(game, AVALANCHE, B);
    const lever = spawn(game, "Test Shared Lever", B);
    lands(game, "Plains", 1);
    activate(game, lever, 0, { player: A });
    settle(game);
    // Alice gained the 1 life and took no damage.
    expect(life(game, A)).toBe(21);
  });

  it("has power equal to the artifacts its controller's opponents control", () => {
    const { game } = table();
    const avalanche = spawn(game, AVALANCHE, A);
    spawn(game, "Mind Stone", A);
    expect(pt(game, avalanche)).toEqual({ power: 0, toughness: 3 });
    spawn(game, "Mind Stone", B);
    spawn(game, "Sol Ring", B);
    expect(pt(game, avalanche)).toEqual({ power: 2, toughness: 3 });
  });
});
