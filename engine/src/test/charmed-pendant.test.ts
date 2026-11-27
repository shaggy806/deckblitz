/**
 * "{T}, Mill a card: For each colored mana symbol in the milled card's mana
 * cost, add one mana of that color" (Charmed Pendant): a `do: mill` cost's
 * card as `{ paid: "milled" }`, and `add-mana`'s `{ manaCostOf,
 * coloredSymbols }`. Its cost moves a card from a library, so it isn't a mana
 * ability (rule 605.1a): it uses the stack.
 */
import { describe, expect, it } from "vitest";

import { manaOfManaCost } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, settle, spawn, table, toLibrary, zone } from "./harness.js";

const pool = (game: Game): string =>
  game.state.players[A].manaPool
    .map((u) => u.type)
    .sort()
    .join("");

function pendant(top: string): { game: Game; milled: ObjectId } {
  const { game } = table();
  const source = spawn(game, "Charmed Pendant");
  const milled = toLibrary(game, top);
  activate(game, source, 0, { settle: false });
  expect(zone(game, milled)).toBe("graveyard");
  return { game, milled };
}

describe("Charmed Pendant", () => {
  it("adds each coloured symbol's colour and nothing for generic (Detention Sphere's {1}{W}{U})", () => {
    const { game } = pendant("Detention Sphere");
    // On the stack: not a mana ability.
    expect(game.state.zones.shared.stack).toHaveLength(1);
    expect(pool(game)).toBe("");
    settle(game);
    expect(pool(game)).toBe("UW");
  });

  it("adds nothing for a land or for {X} alone (Hangarback Walker)", () => {
    const { game } = pendant("Hangarback Walker");
    settle(game);
    expect(pool(game)).toBe("");
    const again = pendant("Forest");
    settle(again.game);
    expect(pool(again.game)).toBe("");
  });

  it("asks a colour for each hybrid symbol (Kitchen Finks's {1}{G/W}{G/W})", () => {
    const t = table();
    const source = spawn(t.game, "Charmed Pendant");
    toLibrary(t.game, "Kitchen Finks");
    const asked: string[][] = [];
    let answer = 0;
    t.a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...(texts ?? [])]);
      return [answer++ === 0 ? 0 : 1];
    };
    activate(t.game, source, 0, { settle: false });
    settle(t.game);
    expect(asked).toHaveLength(2);
    expect(asked[0]).toEqual(["Add {G}.", "Add {W}."]);
    expect(pool(t.game)).toBe("GW");
  });

  it("still reads the milled card once it has left the graveyard (rule 608.2h)", () => {
    const { game, milled } = pendant("Detention Sphere");
    game.debugMove(milled, "exile");
    settle(game);
    expect(pool(game)).toBe("UW");
  });
});

describe("manaOfManaCost's coloured symbols", () => {
  it("drops generic, {C} and {S}, and keeps hybrid and Phyrexian symbols", () => {
    expect(manaOfManaCost("{3}{U}{U}{B}", true)).toEqual([
      { mana: "U", amount: 1 },
      { mana: "U", amount: 1 },
      { mana: "B", amount: 1 },
    ]);
    expect(manaOfManaCost("{W/U}{G/P}{2/B}{C}{S}{X}", true)).toEqual([
      { mana: { oneOf: ["W", "U"] }, amount: 1 },
      { mana: "G", amount: 1 },
      { mana: "B", amount: 1 },
    ]);
  });
});
