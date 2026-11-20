/**
 * A commander that chooses its colour before the game begins (rule 903.4b):
 * Clara Oswald (top-1000 commander #737) and The Prismatic Piper —
 * `CardDefinition.chooseColorAsCommander`, `DeckList.commanderColors`. The
 * choice is the deck's, revealed as the commander goes into the command zone
 * (103.2c); it's part of the colour identity, and the commander is that
 * colour in every zone all game (a characteristic-defining ability, 604.3,
 * linked to the choice, 607.2p). Clara's own Doctor trigger doubler beside it.
 */
import { describe, expect, it } from "vitest";

import { effectiveColors } from "../characteristics.js";
import { validateCommanderDeck } from "../deck-validation.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, destroy, enter, lands, life, registryOf, spawn, table, zone } from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...effectiveColors(game.state, registryOf(game), game.state.objects[id])].sort();

const commanderNamed = (game: Game, name: string): ObjectId => {
  const id = game.state.zones.shared.command.find((c) => game.state.objects[c].cardName === name);
  if (id === undefined) throw new Error(`${name} isn't in the command zone`);
  return id;
};

describe("Clara Oswald — Impossible Girl", () => {
  it("is the chosen colour in the command zone, revealed as she goes there, and it's her deck's identity", () => {
    const { game } = table({ commanders: ["Clara Oswald"], commanderColors: { "Clara Oswald": "U" } });
    const clara = commanderNamed(game, "Clara Oswald");
    expect(colorsOf(game, clara)).toEqual(["U"]);
    expect(game.state.players[A].commanderIdentity).toEqual(["U"]);
    expect(game.state.eventLog.some((e) => e.type === "creature-type-chosen" && e.object === clara && e.creatureType === "U")).toBe(true);
  });

  it("stays the chosen colour on the stack, on the battlefield and back in the command zone", () => {
    const { game } = table({ commanders: ["Clara Oswald"], commanderColors: { "Clara Oswald": "R" } });
    const clara = commanderNamed(game, "Clara Oswald");
    lands(game, "Wastes", 6);
    cast(game, clara, { settle: false });
    expect(zone(game, clara)).toBe("stack");
    expect(colorsOf(game, clara)).toEqual(["R"]);
    game.advanceUntil((s) => s.objects[clara].zone === "battlefield" && s.zones.shared.stack.length === 0);
    expect(colorsOf(game, clara)).toEqual(["R"]);
    destroy(game, clara);
    // Wherever she went (graveyard, or on to the command zone), still red.
    expect(zone(game, clara)).not.toBe("battlefield");
    expect(colorsOf(game, clara)).toEqual(["R"]);
  });

  it("in the 99, or with no colour chosen, she's colourless", () => {
    const { game } = table({ commanders: ["Clara Oswald"] });
    expect(colorsOf(game, commanderNamed(game, "Clara Oswald"))).toEqual([]);
    expect(game.state.players[A].commanderIdentity).toEqual([]);
    const other = spawn(game, "Clara Oswald");
    expect(colorsOf(game, other)).toEqual([]);
  });

  it("a Doctor's triggered ability triggers an additional time", () => {
    const { game } = table();
    spawn(game, "Clara Oswald");
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const before = life(game);
    // Christine Chapel (a Human Doctor): two differently named lands, twice.
    enter(game, "Christine Chapel, Combat Medic");
    expect(life(game)).toBe(before + 4);
  });
});

describe("The Prismatic Piper", () => {
  it("is the chosen colour beside its partner, and the pair's identity has it", () => {
    const { game } = table({
      commanders: ["The Prismatic Piper", "Akiri, Line-Slinger"],
      commanderColors: { "The Prismatic Piper": "G" },
    });
    expect(colorsOf(game, commanderNamed(game, "The Prismatic Piper"))).toEqual(["G"]);
    expect(game.state.players[A].commanderIdentity).toEqual(["W", "R", "G"]);
  });
});

describe("deck validation with a colour chosen before the game begins", () => {
  const { game } = table();
  const registry = registryOf(game);
  const deck = (cards: readonly string[]) => [...cards, ...Array<string>(98 - cards.length).fill("Wastes")];

  it("a chosen colour widens the identity", () => {
    const result = validateCommanderDeck(
      { commanders: ["Clara Oswald", "The Eighth Doctor"], cards: deck(["Lightning Bolt"]), commanderColors: { "Clara Oswald": "R" } },
      registry,
    );
    expect(result.violations).toEqual([]);
    // W and U from The Eighth Doctor, R from Clara's choice.
    expect(result.identity).toBe("WUR");
  });

  it("the deck's cards settle a colour left unchosen", () => {
    const result = validateCommanderDeck({ commanders: ["Clara Oswald", "The Eighth Doctor"], cards: deck(["Lightning Bolt"]) }, registry);
    expect(result.violations).toEqual([]);
    expect(result.commanderColors).toEqual({ "Clara Oswald": "R" });
  });

  it("nothing settles it: a violation asks for a colour", () => {
    const result = validateCommanderDeck({ commanders: ["Clara Oswald", "The Eighth Doctor"], cards: deck([]) }, registry);
    expect(result.legal).toBe(false);
    expect(result.violations.some((v) => v.includes("choose a colour for \"Clara Oswald\""))).toBe(true);
  });

  it("a card outside the chosen colour is outside the identity", () => {
    const result = validateCommanderDeck(
      { commanders: ["Clara Oswald", "The Eighth Doctor"], cards: deck(["Lightning Bolt"]), commanderColors: { "Clara Oswald": "G" } },
      registry,
    );
    expect(result.violations.some((v) => v.includes("Lightning Bolt"))).toBe(true);
  });
});
