/**
 * "As this creature enters, each player chooses war or peace"
 * (`CardDefinition.chooseOnEnterBy: "each-player"`): every player in the game
 * answers, the active player first and the rest in turn order (rule 101.4),
 * each answer kept as `GameObject.chosenOnEnterBy` and read by
 * `CardFilter.controllerChoseOnEnter` for "creatures controlled by players who
 * chose war".
 *
 * Proving card: Archangel of Strife.
 */

import { describe, expect, it } from "vitest";

import type { PlayerId } from "../primitives.js";
import { A, B, C, cast, lands, pt, ref, spawn, table, toHand, zone } from "./harness.js";

const setUp = (answers: Readonly<Record<string, string>>) => {
  const t = table({ players: 3 });
  const asked: PlayerId[] = [];
  for (const [seat, player] of [
    [t.a, A],
    [t.b, B],
    [t.c, C],
  ] as const) {
    seat.chooseCreatureTypeFn = (_view, _source, options) => {
      expect(options).toEqual(["war", "peace"]);
      asked.push(player);
      return answers[player]!;
    };
  }
  const bearsA = spawn(t.game, "Grizzly Bears", A);
  const bearsB = spawn(t.game, "Grizzly Bears", B);
  const bearsC = spawn(t.game, "Grizzly Bears", C);
  lands(t.game, "Plains", 7);
  const angel = toHand(t.game, "Archangel of Strife");
  cast(t.game, angel);
  return { ...t, asked, angel, bearsA, bearsB, bearsC };
};

describe("Archangel of Strife", () => {
  it("each player chooses, the active player first, then in turn order", () => {
    const { game, asked, angel } = setUp({ [A]: "war", [B]: "peace", [C]: "war" });
    expect(asked).toEqual([A, B, C]);
    expect(game.state.objects[angel]!.chosenOnEnterBy).toEqual([
      { player: A, option: "war" },
      { player: B, option: "peace" },
      { player: C, option: "war" },
    ]);
    // Nothing is chosen for its controller alone.
    expect(game.state.objects[angel]!.chosenOnEnter).toBeUndefined();
  });

  it("at two players, both choose", () => {
    const { game, a, b } = table();
    const asked: PlayerId[] = [];
    a.chooseCreatureTypeFn = () => (asked.push(A), "war");
    b.chooseCreatureTypeFn = () => (asked.push(B), "peace");
    lands(game, "Plains", 7);
    const angel = toHand(game, "Archangel of Strife");
    cast(game, angel);
    expect(asked).toEqual([A, B]);
    expect(pt(game, angel)).toEqual({ power: 9, toughness: 6 });
  });

  it("each player's creatures get the bonus of their own choice, the Angel too (9/6)", () => {
    const { game, angel, bearsA, bearsB, bearsC } = setUp({ [A]: "war", [B]: "peace", [C]: "war" });
    expect(pt(game, angel)).toEqual({ power: 9, toughness: 6 });
    expect(pt(game, bearsA)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, bearsB)).toEqual({ power: 2, toughness: 5 });
    expect(pt(game, bearsC)).toEqual({ power: 5, toughness: 2 });
  });

  it("the bonus ends as it leaves, and a new entry chooses afresh", () => {
    const { game, a, b, c, angel, bearsB } = setUp({ [A]: "peace", [B]: "peace", [C]: "peace" });
    expect(pt(game, angel)).toEqual({ power: 6, toughness: 9 });
    expect(pt(game, bearsB)).toEqual({ power: 2, toughness: 5 });
    for (const seat of [a, b, c]) seat.chooseCreatureTypeFn = () => "war";
    // Flickered: it leaves, and enters as a new object that chooses again.
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("battlefield");
    expect(game.state.objects[angel]!.chosenOnEnterBy?.map((answer) => answer.option)).toEqual(["war", "war", "war"]);
    expect(pt(game, angel)).toEqual({ power: 9, toughness: 6 });
    expect(pt(game, bearsB)).toEqual({ power: 5, toughness: 2 });
    // Gone: no bonus.
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("exile");
    expect(pt(game, bearsB)).toEqual({ power: 2, toughness: 2 });
  });
});
