import { describe, expect, it } from "vitest";
import { B, C, cast, controller, keywords, lands, named, nextTurn, pt, ref, spawn, subtypes, table, toHand, types } from "./harness.js";

// "For each of them, that creature's controller faces a villainous choice"
// (Hunted by The Family): a `for-each-target` of a villainous
// `each-player-may` whose `who` is `{ controllerOf }`. The players facing
// them go one at a time in APNAP order whatever order the targets were chosen
// in (rule 701.55d), each choice carried out before the next is made.

describe("a villainous choice per target, in turn order", () => {
  it("Hunted by The Family: bob faces his before carol's, though carol's creature was targeted first", () => {
    const { game, b, c } = table({ players: 3 });
    const carolsFirst = spawn(game, "Grizzly Bears", C);
    const bobs = spawn(game, "Ornithopter", B);
    const carolsSecond = spawn(game, "Llanowar Elves", C);
    lands(game, "Island", 7);
    const spell = toHand(game, "Hunted by The Family");
    const asked: string[] = [];
    let bearsCopiesWhenCarolAskedAgain = -1;
    b.chooseModesFn = () => {
      asked.push("bob");
      return [0];
    };
    c.chooseModesFn = () => {
      asked.push("carol");
      if (asked.filter((who) => who === "carol").length === 2) {
        bearsCopiesWhenCarolAskedAgain = named(game, "Grizzly Bears").length;
        return [0];
      }
      return [1];
    };
    cast(game, spell, { targets: [ref(carolsFirst), ref(bobs), ref(carolsSecond)] });
    expect(asked).toEqual(["bob", "carol", "carol"]);
    // Carol's first choice was done before her second was asked.
    expect(bearsCopiesWhenCarolAskedAgain).toBe(2);

    // Bob's Ornithopter: a 1/1 white Human creature with no abilities, no
    // longer an artifact (rule 205.1a), for good.
    expect(types(game, bobs)).toEqual(["creature"]);
    expect(subtypes(game, bobs)).toEqual(["Human"]);
    expect(pt(game, bobs)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, bobs).has("flying")).toBe(false);
    // Carol's Bears copied for alice; her Elves made Human.
    const copy = named(game, "Grizzly Bears").find((id) => id !== carolsFirst);
    expect(copy).toBeDefined();
    expect(controller(game, copy as typeof carolsFirst)).toBe("alice");
    expect(subtypes(game, carolsSecond)).toEqual(["Human"]);
    expect(subtypes(game, carolsFirst)).toEqual(["Bear"]);
    nextTurn(game);
    expect(subtypes(game, bobs)).toEqual(["Human"]);
  });
});
