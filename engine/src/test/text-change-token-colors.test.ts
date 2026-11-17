/**
 * A token made by changed text is the changed colour (rules 612.4, 111.3 —
 * `create-token`'s `tokenTextChanges`), whichever text-changing card changed
 * it: Whim of Volrath (until end of turn, buyback), Trait Doctoring (cipher)
 * and Glamerdye (indefinitely, on a spell or a permanent).
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { effectiveColors } from "../characteristics.js";
import { activate, cast, hand, lands, nextTurn, pickPermanents, ref, registryOf, spawn, subtypes, table, toHand, zone } from "./harness.js";

/** `seat` answers the two words of a text change, in order. */
const answer = (seat: ScriptedController, ...words: string[]): void => {
  let asked = 0;
  seat.chooseCreatureTypeFn = () => words[asked++];
};

const colorsOf = (game: Game, id: ObjectId): string[] => [...effectiveColors(game.state, registryOf(game), game.state.objects[id])];

const newTokens = (game: Game, before: readonly ObjectId[]): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken === true && !before.includes(id));

describe("Whim of Volrath", () => {
  it("a permanent's changed ability makes its tokens the new colour, this turn; bought back to hand", () => {
    const { game, a } = table();
    const mobilization = spawn(game, "Mobilization");
    lands(game, "Island", 3);
    lands(game, "Plains", 6);
    answer(a, "white", "blue");
    const whim = toHand(game, "Whim of Volrath");
    cast(game, whim, { targets: [ref(mobilization)], kicked: true });
    expect(hand(game)).toContain(whim);
    let before = [...game.battlefield];
    activate(game, mobilization, 0);
    const [blue] = newTokens(game, before);
    expect(colorsOf(game, blue)).toEqual(["U"]);
    // Next turn the change is over: a white Soldier again, and the blue one stays blue.
    nextTurn(game);
    nextTurn(game);
    before = [...game.battlefield];
    activate(game, mobilization, 0);
    const [white] = newTokens(game, before);
    expect(colorsOf(game, white)).toEqual(["W"]);
    expect(colorsOf(game, blue)).toEqual(["U"]);
  });

  it("without buyback it goes to the graveyard", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    lands(game, "Island", 1);
    answer(a, "Forest", "Island");
    const whim = toHand(game, "Whim of Volrath");
    cast(game, whim, { targets: [ref(forest)] });
    expect(zone(game, whim)).toBe("graveyard");
    expect(subtypes(game, forest)).toEqual(["Island"]);
  });
});

describe("Trait Doctoring", () => {
  it("changes a land type until end of turn, and is encoded on a creature you control", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    answer(a, "Forest", "Swamp");
    pickPermanents(a, bears);
    const doctoring = toHand(game, "Trait Doctoring");
    cast(game, doctoring, { targets: [ref(forest)] });
    expect(subtypes(game, forest)).toEqual(["Swamp"]);
    expect(zone(game, doctoring)).toBe("exile");
    expect((game.state.objects[bears].encodedCards ?? []).map((e) => e.card)).toEqual([doctoring]);
    nextTurn(game);
    expect(subtypes(game, forest)).toEqual(["Forest"]);
  });
});

describe("Glamerdye", () => {
  it("changes a spell's colour word: the tokens it makes are the new colour", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    const alarm = toHand(game, "Raise the Alarm");
    cast(game, alarm, { settle: false });
    answer(a, "white", "black");
    const before = [...game.battlefield];
    cast(game, toHand(game, "Glamerdye"), { targets: [ref(alarm)] });
    const tokens = newTokens(game, before);
    expect(tokens.length).toBe(2);
    for (const id of tokens) expect(colorsOf(game, id)).toEqual(["B"]);
  });

  it("changes a permanent's for good: its tokens stay the new colour on later turns", () => {
    const { game, a } = table();
    const mobilization = spawn(game, "Mobilization");
    lands(game, "Island", 2);
    lands(game, "Plains", 3);
    answer(a, "white", "green");
    cast(game, toHand(game, "Glamerdye"), { targets: [ref(mobilization)] });
    nextTurn(game);
    nextTurn(game);
    const before = [...game.battlefield];
    activate(game, mobilization, 0);
    const [token] = newTokens(game, before);
    expect(colorsOf(game, token)).toEqual(["G"]);
  });
});
