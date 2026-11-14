import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import { CREATURE_TYPES } from "../creature-types.js";
import { A, activate, cast, counters, enter, hand, lands, named, nextTurn, ref, settle, table as openTable, toHand } from "./harness.js";

// "Note a creature type that hasn't been noted for this permanent"
// (`choose-creature-type`'s `note`), "one of its creature types"
// (`amongTypesOf`), and the count of them (`{ notedCreatureTypes }`): Volo,
// Itinerant Scholar's Journal and Long List of the Ents.

/** A table whose opening hands are gone: what's in hand is what a test put there. */
function table(): ReturnType<typeof openTable> {
  const seated = openTable();
  for (const player of seated.players) seated.game.state.zones.perPlayer[player].hand = [];
  return seated;
}

/** The seat answers each creature-type choice with the next of `answers` (or
 * the first option), recording every list it was offered. */
function noteAnswers(seat: ScriptedController, ...answers: string[]): { offered: (readonly string[])[] } {
  const seen = { offered: [] as (readonly string[])[] };
  seat.chooseCreatureTypeFn = (_view, _source, options) => {
    seen.offered.push(options);
    return answers.shift() ?? options[0];
  };
  return seen;
}

describe("Volo, Itinerant Scholar and Volo's Journal", () => {
  it("notes one of each creature spell's types not yet noted, and draws for each", () => {
    const { game, a } = table();
    enter(game, "Volo, Itinerant Scholar");
    const [journal] = named(game, "Volo's Journal Token", A);
    expect(journal).toBeDefined();
    lands(game, "Forest", 6);
    const seen = noteAnswers(a, "Bear", "Druid");
    cast(game, toHand(game, "Grizzly Bears"));
    cast(game, toHand(game, "Llanowar Elves"));
    // Bear is noted: a second Bear has nothing left to note, and isn't asked.
    cast(game, toHand(game, "Grizzly Bears"));
    expect(seen.offered.map((types) => [...types].sort())).toEqual([["Bear"], ["Druid", "Elf"]]);
    expect(game.state.objects[journal].notedCreatureTypes?.types).toEqual(["Bear", "Druid"]);

    const volo = named(game, "Volo, Itinerant Scholar", A)[0];
    lands(game, "Island", 2);
    const before = hand(game, A).length;
    activate(game, volo, 0, { targets: [ref(journal)] });
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("a changeling offers every creature type but those noted", () => {
    const { game, a } = table();
    enter(game, "Volo, Itinerant Scholar");
    const [journal] = named(game, "Volo's Journal Token", A);
    lands(game, "Forest", 2);
    lands(game, "Swamp", 1);
    const seen = noteAnswers(a, "Bear");
    cast(game, toHand(game, "Grizzly Bears"));
    cast(game, toHand(game, "Changeling Outcast"));
    expect(seen.offered[1].length).toBe(CREATURE_TYPES.length - 1);
    expect(seen.offered[1]).not.toContain("Bear");
    expect(game.state.objects[journal].notedCreatureTypes?.types.length).toBe(2);
  });

});

describe("Long List of the Ents", () => {
  it("notes a type each chapter, never one noted before; the next creature spell of it this turn gets a counter", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const seen = noteAnswers(a, "Bear", "Elf");
    const list = toHand(game, "Long List of the Ents");
    cast(game, list);
    expect(seen.offered[0].length).toBe(CREATURE_TYPES.length);
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(counters(game, elves, "+1/+1")).toBe(0);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears, "+1/+1")).toBe(1);
    // Only the next one.
    const second = toHand(game, "Grizzly Bears");
    cast(game, second);
    expect(counters(game, second, "+1/+1")).toBe(0);

    // Chapter II, on Alice's next turn: Bear is noted already.
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(seen.offered[1]).not.toContain("Bear");
    expect(seen.offered[1].length).toBe(CREATURE_TYPES.length - 1);
    expect(game.state.objects[list].notedCreatureTypes?.types).toEqual(["Bear", "Elf"]);
    const elf = toHand(game, "Llanowar Elves");
    cast(game, elf);
    expect(counters(game, elf, "+1/+1")).toBe(1);
  });

  it("only this turn", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    noteAnswers(a, "Bear", "Elf");
    cast(game, toHand(game, "Long List of the Ents"));
    nextTurn(game);
    nextTurn(game);
    settle(game);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears, "+1/+1")).toBe(0);
  });

  it("a new object has nothing noted (rule 400.7)", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const seen = noteAnswers(a, "Bear", "Bear");
    const list = toHand(game, "Long List of the Ents");
    cast(game, list);
    game.debugMove(list, "hand");
    cast(game, list);
    expect(seen.offered[1].length).toBe(CREATURE_TYPES.length);
    expect(game.state.objects[list].notedCreatureTypes?.types).toEqual(["Bear"]);
  });
});
