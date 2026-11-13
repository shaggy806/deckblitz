/**
 * Sacrifice costs of a chosen count: "Sacrifice X Clues" with the Clues in
 * one token stack or apart (Lonis, Cryptozoologist); "Sacrifice an artifact with mana value X" (Scrap Welder).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  keywords,
  named,
  pickFromZone,
  quiet,
  ref,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** `count` tokens named `name` for alice, made by an effect (so they're
 * tokens, and stack past the threshold). */
function tokens(game: Game, name: string, count: number): void {
  game.debugApplyEffect(A, { kind: "create-token", token: name, count });
}
const clues = (game: Game): number =>
  named(game, "Clue Token", A).reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);

describe("Lonis, Cryptozoologist", () => {
  /** Bob's library, top first: a 2-drop creature, a land, a 3-drop. */
  function bobsLibrary(game: Game): { bears: ObjectId; forest: ObjectId; ogre: ObjectId } {
    const ogre = toLibrary(game, "Gray Ogre", B);
    const forest = toLibrary(game, "Forest", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    return { bears, forest, ogre };
  }

  it("sacrifices X Clues — both, when they're two — and puts a revealed card onto the battlefield under its controller's control", () => {
    const { game, a } = table();
    const lonis = spawn(game, "Lonis, Cryptozoologist");
    tokens(game, "Clue Token", 2);
    expect(clues(game)).toBe(2);
    const { bears } = bobsLibrary(game);
    pickFromZone(a, bears);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: lonis,
      abilityIndex: 0,
      xValue: 2,
      targets: [{ kind: "player", player: B }],
    });
    // Both go as the cost is paid, with nothing to choose.
    expect(clues(game)).toBe(0);
    game.advanceUntil(quiet);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    // A nontoken creature entered under Lonis's controller's control:
    // investigate (B296's "one sacrificed for X = 2" was this new Clue).
    expect(clues(game)).toBe(1);
  });

  it("from a stack of Clue tokens, sacrifices exactly X of them", () => {
    const { game, a } = table();
    const lonis = spawn(game, "Lonis, Cryptozoologist");
    tokens(game, "Clue Token", 1);
    // Twelve Clues in one object, as a compacted stack is.
    const [stack] = named(game, "Clue Token", A);
    game.state.objects[stack].stackCount = 12;
    const { ogre, forest, bears } = bobsLibrary(game);
    a.chooseSacrificesFn = (_view, eligible, count) => Array<ObjectId>(count).fill(eligible[0]);
    pickFromZone(a, ogre);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: lonis,
      abilityIndex: 0,
      xValue: 3,
      targets: [{ kind: "player", player: B }],
    });
    // Which three is asked of the stack's twelve.
    expect(game.state.awaiting?.kind).toBe("sacrifice");
    game.advanceUntil(quiet);
    expect(zone(game, ogre)).toBe("battlefield");
    // Nine left, and Gray Ogre's entry investigates.
    expect(clues(game)).toBe(10);
    // The other two go to the bottom of Bob's library.
    expect(zone(game, forest)).toBe("library");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Scrap Welder", () => {
  it("sacrifices an artifact with mana value X and returns one with mana value less than X, with haste", () => {
    const { game } = table();
    const welder = spawn(game, "Scrap Welder");
    const stone = spawn(game, "Mind Stone");
    const thopter = toGraveyard(game, "Ornithopter");
    activate(game, welder, 0, { x: 2, sacrifice: stone, targets: [ref(thopter)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(keywords(game, thopter).has("haste")).toBe(true);
  });

  it("can't return a card whose mana value is X, nor pay with an artifact of another mana value", () => {
    const { game } = table();
    const welder = spawn(game, "Scrap Welder");
    const stone = spawn(game, "Mind Stone");
    const otherStone = toGraveyard(game, "Mind Stone");
    const thopter = toGraveyard(game, "Ornithopter");
    expect(() => activate(game, welder, 0, { x: 2, sacrifice: stone, targets: [ref(otherStone)] })).toThrow(/target/i);
    expect(() => activate(game, welder, 0, { x: 3, sacrifice: stone, targets: [ref(thopter)] })).toThrow(/sacrific/i);
    expect(zone(game, stone)).toBe("battlefield");
  });
});
