/**
 * "As this artifact enters, choose two colors" (`CardDefinition.chooseOnEnterCount`
 * — Tablet of the Guilds, Seal of the Guildpact): two different colours, the
 * second asked from the four left, kept as `chosenOnEnter` and
 * `chosenOnEnterAlso`. `ofChosenColor` matches either; `colorsOf`'s `chosen`
 * counts how many of them an object is.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, cast, lands, life, ref, settle, table, toHand, zone } from "./harness.js";

const setUp = (artifact: string, first: string, second: string) => {
  const t = table();
  const { game, a } = t;
  const asked: (readonly string[])[] = [];
  a.chooseCreatureTypeFn = (_view, _source, options) => {
    asked.push(options);
    return asked.length === 1 ? first : second;
  };
  lands(game, "Wastes", artifact === "Seal of the Guildpact" ? 5 : 2);
  const id = toHand(game, artifact);
  cast(game, id);
  // Its lands spent: what comes next is paid by fresh ones.
  for (const land of game.state.zones.shared.battlefield) {
    if (game.state.objects[land].cardName === "Wastes") game.state.objects[land].tapped = true;
  }
  return { ...t, id, asked };
};

const castFrom = (game: ReturnType<typeof table>["game"], name: string): ObjectId => {
  const id = toHand(game, name);
  cast(game, id);
  return id;
};

describe("Tablet of the Guilds", () => {
  it("chooses two different colours as it enters, the second from the four left", () => {
    const { game, id, asked } = setUp("Tablet of the Guilds", "W", "G");
    expect(asked).toEqual([
      ["W", "U", "B", "R", "G"],
      ["U", "B", "R", "G"],
    ]);
    expect(game.state.objects[id].chosenOnEnter).toBe("W");
    expect(game.state.objects[id].chosenOnEnterAlso).toEqual(["G"]);
  });

  it("gains 1 life for each of the chosen colours a spell is", () => {
    const { game } = setUp("Tablet of the Guilds", "W", "G");
    lands(game, "Forest", 3);
    lands(game, "Plains", 1);
    castFrom(game, "Watchwolf");
    expect(life(game, A)).toBe(22);
    castFrom(game, "Grizzly Bears");
    expect(life(game, A)).toBe(23);
    lands(game, "Forest", 2);
    // Red and green: one of the chosen colours.
    castFrom(game, "Burning-Tree Emissary");
    expect(life(game, A)).toBe(24);
  });

  it("doesn't trigger for a spell of neither chosen colour", () => {
    const { game } = setUp("Tablet of the Guilds", "W", "G");
    lands(game, "Mountain", 4);
    castFrom(game, "Hill Giant");
    castFrom(game, "Ornithopter");
    expect(life(game, A)).toBe(20);
  });

  it("asks again as the ability resolves (rule 603.4): a spell no longer of either gains nothing", () => {
    const { game } = setUp("Tablet of the Guilds", "W", "G");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(game.state.zones.shared.stack.length).toBe(2);
    // The Bears' colour changed before the trigger resolves: to red.
    game.debugApplyEffect(A, { kind: "become", target: 0, setColors: ["R"], duration: "end-of-turn" }, [ref(bears)]);
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Seal of the Guildpact", () => {
  it("each spell costs {1} less for each of the chosen colours it is", () => {
    const { game } = setUp("Seal of the Guildpact", "G", "W");
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    // {2}{G}{W}, two less: {G}{W}.
    const hierarch = castFrom(game, "Loxodon Hierarch");
    expect(zone(game, hierarch)).toBe("battlefield");
    lands(game, "Forest", 1);
    // {1}{G}, one less: {G}.
    expect(zone(game, castFrom(game, "Grizzly Bears"))).toBe("battlefield");
  });

  it("takes nothing off a spell of neither colour", () => {
    const { game } = setUp("Seal of the Guildpact", "G", "W");
    lands(game, "Mountain", 3);
    // {3}{R} with three Mountains: not enough.
    expect(() => castFrom(game, "Hill Giant")).toThrow(/mana|pay|afford|cost/i);
  });
});
