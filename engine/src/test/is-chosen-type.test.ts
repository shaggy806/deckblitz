/**
 * Adaptive Automaton: "this creature is the chosen type in addition to its
 * other types" (`addsChosenCreatureType`, the record's `static:is-chosen-type`,
 * which needed no engine code) beside "other creatures you control of the
 * chosen type get +1/+1" (`ofChosenType`, `excludeSelf`).
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, pt, spawn, subtypes, table, toHand } from "./harness.js";

function automaton(chosen: string) {
  const t = table();
  t.a.chooseCreatureTypeFn = () => chosen;
  lands(t.game, "Wastes", 3);
  const id = toHand(t.game, "Adaptive Automaton");
  cast(t.game, id);
  return { ...t, automaton: id };
}

describe("Adaptive Automaton", () => {
  it("is the chosen type as well as a Construct, and isn't pumped by itself", () => {
    const { game, automaton: id } = automaton("Elf");
    expect(game.state.objects[id].chosenCreatureType).toBe("Elf");
    expect(subtypes(game, id)).toEqual(expect.arrayContaining(["Construct", "Elf"]));
    expect(pt(game, id)).toEqual({ power: 2, toughness: 2 });
  });

  it("other creatures you control of that type get +1/+1, a changeling too", () => {
    const { game } = automaton("Elf");
    expect(pt(game, spawn(game, "Llanowar Elves"))).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, spawn(game, "Changeling Outcast"))).toEqual({ power: 2, toughness: 2 });
  });

  it("an opponent's of that type and yours of another don't", () => {
    const { game } = automaton("Elf");
    expect(pt(game, spawn(game, "Llanowar Elves", B))).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, spawn(game, "Grizzly Bears"))).toEqual({ power: 2, toughness: 2 });
  });

  it("another Construct isn't pumped unless Construct was the choice", () => {
    const other = automaton("Elf");
    expect(pt(other.game, spawn(other.game, "Phyrexian Walker"))).toEqual({ power: 0, toughness: 3 });
    const chose = automaton("Construct");
    expect(pt(chose.game, spawn(chose.game, "Phyrexian Walker"))).toEqual({ power: 1, toughness: 4 });
  });

  it("two naming one type pump each other", () => {
    const { game, automaton: id } = automaton("Elf");
    const second = spawn(game, "Adaptive Automaton");
    game.state.objects[second].chosenCreatureType = "Elf";
    expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, second)).toEqual({ power: 3, toughness: 3 });
  });
});
