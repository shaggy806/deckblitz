/**
 * "When this Aura enters attached to a creature, each other nontoken creature you control becomes
 * a copy of that creature" (Infinite Reflection): a `becomes-attached` trigger with `asEnters`,
 * read only as the Aura enters attached (rule 303.4), its trigger object the host it entered on.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { A, B, cast, destroy, lands, pickTargets, pt, ref, spawn, table, toHand, zone } from "./harness.js";

const nameOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

describe("Infinite Reflection", () => {
  it("each other nontoken creature you control becomes a copy of the creature it enters on", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    const dragon = spawn(game, "Shivan Dragon", B);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    const aura = toHand(game, "Infinite Reflection");
    cast(game, aura, { targets: [ref(dragon)] });
    expect(game.state.objects[aura].attachedTo).toBe(dragon);
    expect(nameOf(game, bears)).toBe("Shivan Dragon");
    expect(nameOf(game, giant)).toBe("Shivan Dragon");
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
    expect(nameOf(game, theirs)).toBe("Grizzly Bears");
  });

  it("not the creature it enchants itself, and nontoken creatures then enter as copies of it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Island", 6);
    lands(game, "Forest", 2);
    const aura = toHand(game, "Infinite Reflection");
    pickTargets(a, bears);
    cast(game, aura, { targets: [ref(bears)] });
    expect(nameOf(game, bears)).toBe("Grizzly Bears");
    expect(nameOf(game, giant)).toBe("Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(nameOf(game, elves)).toBe("Grizzly Bears");
  });

  it("the copies last after the Aura is gone", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", A);
    const dragon = spawn(game, "Shivan Dragon", B);
    lands(game, "Island", 6);
    const aura = toHand(game, "Infinite Reflection");
    cast(game, aura, { targets: [ref(dragon)] });
    destroy(game, aura);
    expect(zone(game, aura)).toBe("graveyard");
    expect(nameOf(game, giant)).toBe("Shivan Dragon");
  });
});
