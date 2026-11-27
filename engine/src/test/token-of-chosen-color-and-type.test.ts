/**
 * "As this artifact enters, choose a color and a creature type" and "create
 * an X/X creature token of the chosen color and type" (Riptide Replicator,
 * Volrath's Laboratory): the colour asked first, then the creature type
 * (kept as `chosenCreatureType`); the token made that colour and type,
 * named for the type, with no abilities of its own (the rulings) —
 * `create-token`'s `ofChosenColorAndType`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, activate, cast, keywords, lands, pt, subtypes, table, toHand } from "./harness.js";

function replicator(color: string, type: string, x: number): { game: Game; id: ObjectId; asked: (readonly string[])[] } {
  const { game, a } = table();
  const asked: (readonly string[])[] = [];
  a.chooseCreatureTypeFn = (_view, _source, options) => {
    asked.push(options);
    return asked.length === 1 ? color : type;
  };
  lands(game, "Wastes", 4 + x);
  const id = toHand(game, "Riptide Replicator");
  cast(game, id, { x });
  for (const land of game.state.zones.shared.battlefield) {
    if (game.state.objects[land].cardName === "Wastes") game.state.objects[land].tapped = true;
  }
  return { game, id, asked };
}

const tokens = (game: Game): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].controller === A);

describe("Riptide Replicator", () => {
  it("chooses a colour, then a creature type, as it enters", () => {
    const { game, id, asked } = replicator("U", "Merfolk", 3);
    expect(asked[0]).toEqual(["W", "U", "B", "R", "G"]);
    expect(asked[1]).toContain("Merfolk");
    expect(asked[1]).not.toContain("U");
    expect(game.state.objects[id].chosenOnEnter).toBe("U");
    expect(game.state.objects[id].chosenCreatureType).toBe("Merfolk");
    expect(game.state.objects[id].counters.charge).toBe(3);
  });

  it("makes an X/X token of that colour and type, named for the type", () => {
    const { game, id } = replicator("U", "Merfolk", 3);
    lands(game, "Wastes", 4);
    activate(game, id, 0);
    const [token] = tokens(game);
    expect(token).toBeDefined();
    expect(pt(game, token!)).toEqual({ power: 3, toughness: 3 });
    expect([...game.characteristics(token!).colors]).toEqual(["U"]);
    expect(subtypes(game, token!)).toEqual(["Merfolk"]);
    expect(nameOf(game.state.objects[token!])).toBe("Merfolk Token");
  });

  it("a Bird token has no flying (the ruling)", () => {
    const { game, id } = replicator("W", "Bird", 1);
    lands(game, "Wastes", 4);
    activate(game, id, 0);
    const [token] = tokens(game);
    expect(subtypes(game, token!)).toEqual(["Bird"]);
    expect([...game.characteristics(token!).colors]).toEqual(["W"]);
    expect(keywords(game, token!).has("flying")).toBe(false);
    expect(pt(game, token!)).toEqual({ power: 1, toughness: 1 });
  });

  it("white Soldier, chosen: a white Soldier", () => {
    const { game, id } = replicator("W", "Soldier", 2);
    lands(game, "Wastes", 4);
    activate(game, id, 0);
    const [token] = tokens(game);
    expect(subtypes(game, token!)).toEqual(["Soldier"]);
    expect([...game.characteristics(token!).colors]).toEqual(["W"]);
  });
});

describe("Volrath's Laboratory", () => {
  it("makes a 2/2 of the chosen colour and type", () => {
    const { game, a } = table();
    const answers = ["B", "Zombie"];
    a.chooseCreatureTypeFn = () => answers.shift()!;
    lands(game, "Wastes", 5);
    const lab = toHand(game, "Volrath's Laboratory");
    cast(game, lab);
    for (const land of game.state.zones.shared.battlefield) {
      if (game.state.objects[land].cardName === "Wastes") game.state.objects[land].tapped = true;
    }
    lands(game, "Wastes", 5);
    activate(game, lab, 0);
    const [token] = tokens(game);
    expect(pt(game, token!)).toEqual({ power: 2, toughness: 2 });
    expect([...game.characteristics(token!).colors]).toEqual(["B"]);
    expect(subtypes(game, token!)).toEqual(["Zombie"]);
  });
});
