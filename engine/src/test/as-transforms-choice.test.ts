import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  lands,
  life,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

// "As this permanent transforms into Curse of Leeches, attach it to a
// player" (rule 712.20): `choosePlayerOnTransform` asked as a day/night change
// turns a daybound permanent over — in the untap step when that's where it
// happens (rule 502.2), before the upkeep — and `asTransformsInto` attaching
// it to the one chosen. Leeching Lurker, a creature, isn't attached to anyone
// (704.5p, the rulings).

const faceOf = (game: Game, id: ObjectId): number => game.state.objects[id].face ?? 0;
const enchanted = (game: Game, id: ObjectId): PlayerId | undefined => game.state.objects[id].attachedToPlayer;

/** Alice casts two spells this turn, so night becomes day as the next turn
 * begins (rule 726.3, 502.2). */
const castTwo = (game: Game): void => {
  cast(game, toHand(game, "Ornithopter"));
  cast(game, toHand(game, "Ornithopter"));
};

describe("Curse of Leeches // Leeching Lurker", () => {
  it("drains the enchanted player each upkeep, and as night falls is a 4/4 attached to no one", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const curse = toHand(game, "Curse of Leeches");
    cast(game, curse, { targets: [ref(B)] });
    expect(game.state.dayNight).toBe("day");
    expect(enchanted(game, curse)).toBe(B);
    nextTurn(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    // Bob cast nothing: night as Alice's turn begins, and the Curse is the Lurker.
    nextTurn(game);
    expect(game.state.dayNight).toBe("night");
    expect(faceOf(game, curse)).toBe(1);
    expect(enchanted(game, curse)).toBeUndefined();
    expect(zone(game, curse)).toBe("battlefield");
  });

  it("cast at night, enters as Leeching Lurker attached to no one", () => {
    const { game } = table();
    game.state.dayNight = "night";
    lands(game, "Swamp", 3);
    const curse = toHand(game, "Curse of Leeches");
    cast(game, curse, { targets: [ref(B)] });
    expect(faceOf(game, curse)).toBe(1);
    expect(enchanted(game, curse)).toBeUndefined();
  });

  it("as day comes in an opponent's untap step, attaches to the player chosen before their upkeep", () => {
    const { game, a } = table({ players: 3 });
    game.state.dayNight = "night";
    lands(game, "Swamp", 3);
    const curse = toHand(game, "Curse of Leeches");
    cast(game, curse, { targets: [ref(B)] });
    const offered: (readonly string[])[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered.push(texts);
      return [texts.indexOf("Choose bob")];
    };
    castTwo(game);
    // Bob's turn: day comes in his untap step; the Curse goes onto him, and
    // his upkeep's trigger sees it.
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(game.state.dayNight).toBe("day");
    expect(offered).toEqual([["Choose bob", "Choose carol", "Choose alice"]]);
    expect(faceOf(game, curse)).toBe(0);
    expect(enchanted(game, curse)).toBe(B);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("can be put on its own controller, or another opponent than it was cast on", () => {
    const { game, a } = table({ players: 3 });
    game.state.dayNight = "night";
    lands(game, "Swamp", 3);
    const curse = toHand(game, "Curse of Leeches");
    cast(game, curse, { targets: [ref(B)] });
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.indexOf("Choose carol")];
    castTwo(game);
    nextTurn(game);
    expect(enchanted(game, curse)).toBe(C);
    expect(life(game, B)).toBe(20);
    // Bob casts a spell, so it stays day; Carol's upkeep, the next turn.
    cast(game, toHand(game, "Ornithopter", B), { player: B });
    nextTurn(game);
    expect(game.state.dayNight).toBe("day");
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("asks once an effect makes it day, before anything sees it unattached", () => {
    const { game, a } = table();
    const celestus = spawn(game, "The Celestus");
    game.state.dayNight = "night";
    lands(game, "Swamp", 6);
    const curse = toHand(game, "Curse of Leeches");
    cast(game, curse, { targets: [ref(B)] });
    let asked = 0;
    a.chooseModesFn = (_view, _min, _max, texts) => {
      if (!texts[0]?.startsWith("Choose")) return [];
      asked += 1;
      return [texts.indexOf("Choose alice")];
    };
    activate(game, celestus, 1);
    settle(game);
    expect(game.state.dayNight).toBe("day");
    expect(asked).toBe(1);
    expect(faceOf(game, curse)).toBe(0);
    expect(enchanted(game, curse)).toBe(A);
    expect(zone(game, curse)).toBe("battlefield");
  });
});
