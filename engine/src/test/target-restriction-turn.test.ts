/**
 * A targeting restriction for a turn (rule 611.2c: it changes no
 * characteristic, so it reaches what enters later): Display of Dominance's
 * "permanents you control can't be the targets of blue or black spells your
 * opponents control this turn", a `prohibit` effect's `be-targeted`. And
 * Lurker's "unless it attacked or blocked this turn", a printed one.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { createDefaultRegistry, defineCard } from "../cards.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, attack, cast, lands, nextTurn, spawn, table, toHand } from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;

const DISPLAY = defineCard({
  name: "Test Display",
  manaCost: "{0}",
  types: ["instant"],
  text: "Permanents you control can't be the targets of blue or black spells your opponents control this turn.",
  targets: [],
  effect: {
    kind: "prohibit",
    prohibits: [
      {
        act: "be-targeted",
        object: { controlledBy: "you" },
        by: "opponents",
        only: "spells",
        sourceFilter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
      },
    ],
  },
});
const registry = createDefaultRegistry().register(DISPLAY);

/** The objects `card` could target for `player`. */
const targetsFor = (game: Game, card: ObjectId, player = B): unknown[] => {
  const offer = game.legalActions(player).find((a): a is Cast => a.kind === "cast-spell" && a.card === card);
  return offer?.targetOptions?.[0] ?? [];
};
const has = (options: unknown[], id: ObjectId): boolean => options.some((o) => (o as { object?: ObjectId }).object === id);

/** Alice casts Display, and a Bears she leaves on the stack, then passes so Bob can respond. */
const displayed = () => {
  const t = table({ registry });
  const { game } = t;
  const bears = spawn(game, "Grizzly Bears", A);
  lands(game, "Forest", 2);
  lands(game, "Swamp", 2, B);
  lands(game, "Mountain", 1, B);
  const blade = toHand(game, "Doom Blade", B);
  const bolt = toHand(game, "Lightning Bolt", B);
  cast(game, toHand(game, "Test Display"));
  return { ...t, bears, blade, bolt };
};

const passToBob = (game: Game): void => {
  cast(game, toHand(game, "Grizzly Bears"), { settle: false });
  game.dispatch({ type: "pass-priority", player: A });
  expect(game.state.priority.holder).toBe(B);
};

describe("a targeting restriction that lasts a turn", () => {
  it("Display of Dominance: not blue or black spells of opponents, red ones can; on what enters later too", () => {
    const { game, bears, blade, bolt } = displayed();
    const later = spawn(game, "Hill Giant", A);
    passToBob(game);
    expect(has(targetsFor(game, blade), bears)).toBe(false);
    expect(has(targetsFor(game, blade), later)).toBe(false);
    expect(has(targetsFor(game, bolt), bears)).toBe(true);
  });

  it("is gone at end of turn", () => {
    const { game, bears, blade } = displayed();
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(has(targetsFor(game, blade), bears)).toBe(true);
  });

  it("Lurker: spells can't target it until it has attacked this turn", () => {
    const { game, a } = table();
    const lurker = spawn(game, "Lurker", A);
    lands(game, "Swamp", 2);
    const blade = toHand(game, "Doom Blade");
    expect(has(targetsFor(game, blade, A), lurker)).toBe(false);
    attack(game, a, [lurker]);
    expect(has(targetsFor(game, blade, A), lurker)).toBe(true);
  });
});
