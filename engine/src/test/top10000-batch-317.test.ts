// Batch 317: the top 5000's next cards by EDHREC rank (3865–4159), each on
// the feature it needed. Metalworker is in mana-ability-first.test.ts, Mystic
// Reflection in enter-as-copy.test.ts.

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { B, cast, destroy, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const named = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const tokensOf = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken && named(game, id) === name);

describe("Vesuvan Duplimancy: a token copy of the spell's one target", () => {
  const setup = () => {
    const { game } = table();
    spawn(game, "Vesuvan Duplimancy");
    lands(game, "Forest", 4);
    return game;
  };

  it("copies the artifact or creature you control the spell targets, before the spell resolves", () => {
    const game = setup();
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)] });
    const copies = tokensOf(game, "Grizzly Bears");
    expect(copies).toHaveLength(1);
    // The Growth resolved after the token was made: only the original grew.
    expect(game.characteristics(copies[0]).power).toBe(2);
    expect(game.characteristics(bear).power).toBe(5);
  });

  it("the copy of a legendary creature isn't legendary, so both stay", () => {
    const game = setup();
    const thalia = spawn(game, "Thalia, Guardian of Thraben");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(thalia)] });
    const copies = tokensOf(game, "Thalia, Guardian of Thraben");
    expect(copies).toHaveLength(1);
    expect(game.state.objects[copies[0]].modifiers.some((m) => m.removeSupertypes?.includes("legendary"))).toBe(true);
    expect(game.state.awaiting).toBeNull();
    expect(zone(game, thalia)).toBe("battlefield");
  });

  it("copies the target as it last existed when it has left before the ability resolves", () => {
    const game = setup();
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)], settle: false });
    destroy(game, bear);
    expect(zone(game, bear)).toBe("graveyard");
    expect(tokensOf(game, "Grizzly Bears")).toHaveLength(1);
  });

  it("still makes the token when the spell is countered in response", () => {
    const game = setup();
    const bear = spawn(game, "Grizzly Bears");
    const growth = toHand(game, "Giant Growth");
    cast(game, growth, { targets: [ref(bear)], settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(growth)]);
    settle(game);
    expect(zone(game, growth)).toBe("graveyard");
    expect(tokensOf(game, "Grizzly Bears")).toHaveLength(1);
    expect(game.characteristics(bear).power).toBe(2);
  });

  it("doesn't trigger for a spell aimed at an opponent's creature", () => {
    const game = setup();
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(tokensOf(game, "Grizzly Bears")).toHaveLength(0);
  });
});
