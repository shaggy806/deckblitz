/**
 * "Each [option] with the most votes or tied for most votes" over named
 * options (rule 701.38): the `vote-won` condition's `orTied` — no other
 * option got more, and at least one vote. Council Guardian.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { Color } from "../mana.js";
import { protectionBlocks } from "../targeting.js";
import type { ObjectId } from "../primitives.js";
import { enter, pickModes, registryOf, table } from "./harness.js";

const BLUE = 0;
const BLACK = 1;
const RED = 2;
const GREEN = 3;

const from = (game: Game, id: ObjectId): Color[] =>
  (["U", "B", "R", "G"] as const).filter((c) =>
    protectionBlocks(game.state, registryOf(game), id, { colors: [c], types: ["instant"] }),
  );

describe("Council Guardian", () => {
  it("gains protection from the one color with the most votes", () => {
    const { game, a, b, c } = table({ players: 3 });
    pickModes(a, RED);
    pickModes(b, RED);
    pickModes(c, GREEN);
    const guardian = enter(game, "Council Guardian");
    expect(from(game, guardian)).toEqual(["R"]);
  });

  it("gains protection from each color tied for most", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    pickModes(a, BLUE);
    pickModes(b, BLACK);
    pickModes(c, BLACK);
    pickModes(d, BLUE);
    const guardian = enter(game, "Council Guardian");
    expect(from(game, guardian)).toEqual(["U", "B"]);
  });

  it("a three-way tie of single votes protects from all three, not the one nobody chose", () => {
    const { game, a, b, c } = table({ players: 3 });
    pickModes(a, BLUE);
    pickModes(b, RED);
    pickModes(c, GREEN);
    const guardian = enter(game, "Council Guardian");
    expect(from(game, guardian)).toEqual(["U", "R", "G"]);
  });
});
