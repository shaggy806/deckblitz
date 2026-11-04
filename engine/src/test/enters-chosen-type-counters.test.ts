/**
 * Banner of Kinship: the type is chosen as it enters, the counters are counted
 * with that type (rule 614.1c, 614.12), and the anthem reads the counters it
 * has from then on.
 */
import { describe, expect, it } from "vitest";
import { B, cast, counters, lands, pt, spawn, table, toHand } from "./harness.js";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";

function castBanner(game: Game, a: ScriptedController, type: string) {
  lands(game, "Wastes", 5);
  a.chooseCreatureTypeFn = () => type;
  const banner = toHand(game, "Banner of Kinship");
  cast(game, banner);
  return banner;
}

describe("Banner of Kinship", () => {
  it("counts the creatures of the type it chose, only yours, and pumps them per counter", () => {
    const { game, a } = table();
    const bear1 = spawn(game, "Grizzly Bears");
    const bear2 = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    const theirBear = spawn(game, "Grizzly Bears", B);
    const banner = castBanner(game, a, "Bear");
    expect(counters(game, banner, "fellowship")).toBe(2);
    expect(pt(game, bear1)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, bear2)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, elf)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, theirBear)).toEqual({ power: 2, toughness: 2 });
  });

  it("a different type gives a different count", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    const banner = castBanner(game, a, "Elf");
    expect(counters(game, banner, "fellowship")).toBe(1);
    expect(pt(game, elf)).toEqual({ power: 2, toughness: 2 });
  });

  it("the count is fixed as it enters: a later creature doesn't add a counter but does get the bonus", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const banner = castBanner(game, a, "Bear");
    expect(counters(game, banner, "fellowship")).toBe(1);
    const later = spawn(game, "Grizzly Bears");
    expect(counters(game, banner, "fellowship")).toBe(1);
    expect(pt(game, later)).toEqual({ power: 3, toughness: 3 });
  });

  it("no creature of the type: no counters and no bonus", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const banner = castBanner(game, a, "Goblin");
    expect(counters(game, banner, "fellowship")).toBe(0);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
  });

  it("reads every counter it has, however they got there", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const banner = castBanner(game, a, "Bear");
    game.state.objects[banner].counters.fellowship = 3;
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
  });
});
