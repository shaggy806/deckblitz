/**
 * "Add mana equal to enchanted permanent's mana cost" (Elemental Resonance):
 * the `add-mana` effect's `{ manaCostOf }`. Its rulings: {2}{W}{U} adds
 * {C}{C}{W}{U}, {X}{G} adds {G}, and {W/U}{W/U} lets its controller choose
 * {W}{W}, {W}{U} or {U}{U} — a choice for each symbol of two colours as the
 * ability resolves (rule 608.2d). Not a mana ability: it uses the stack.
 */
import { describe, expect, it } from "vitest";

import { manaOfManaCost } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../index.js";
import { A, cast, lands, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string =>
  game.state.players[player].manaPool
    .map((u) => u.type)
    .sort()
    .join("");

function resonate(name: string): { t: ReturnType<typeof table>; host: ObjectId } {
  const t = table();
  const host = spawn(t.game, name);
  lands(t.game, "Forest", 4);
  cast(t.game, toHand(t.game, "Elemental Resonance"), { targets: [ref(host)] });
  return { t, host };
}

describe("Elemental Resonance", () => {
  it("adds {C}{C}… for generic and each coloured symbol its colour, at the beginning of your first main phase", () => {
    const { t } = resonate("Detention Sphere");
    toStep(t.game, "precombat-main", A);
    // On the stack first: it isn't a mana ability.
    expect(t.game.state.zones.shared.stack).toHaveLength(1);
    settle(t.game);
    expect(pool(t.game)).toBe("CUW");
  });

  it("adds nothing for {X} (Hangarback Walker's {X}{X})", () => {
    const { t } = resonate("Hangarback Walker");
    toStep(t.game, "precombat-main", A);
    settle(t.game);
    expect(pool(t.game)).toBe("");
  });

  it("asks a colour for each hybrid symbol (Kitchen Finks's {1}{G/W}{G/W})", () => {
    const { t } = resonate("Kitchen Finks");
    const asked: string[][] = [];
    let answer = 0;
    t.a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...(texts ?? [])]);
      return [answer++ === 0 ? 0 : 1];
    };
    toStep(t.game, "precombat-main", A);
    settle(t.game);
    expect(asked).toHaveLength(2);
    expect(asked[0]).toEqual(["Add {G}.", "Add {W}."]);
    expect(pool(t.game)).toBe("CGW");
  });
});

describe("manaOfManaCost", () => {
  it("reads each kind of symbol", () => {
    expect(manaOfManaCost("{2}{W}{U}")).toEqual([
      { mana: "C", amount: 2 },
      { mana: "W", amount: 1 },
      { mana: "U", amount: 1 },
    ]);
    expect(manaOfManaCost("{0}{G}")).toEqual([{ mana: "G", amount: 1 }]);
    expect(manaOfManaCost("{W/U}{G/P}{2/B}{C}")).toEqual([
      { mana: { oneOf: ["W", "U"] }, amount: 1 },
      { mana: "G", amount: 1 },
      { mana: "B", amount: 1 },
      { mana: "C", amount: 1 },
    ]);
    expect(manaOfManaCost(null)).toEqual([]);
  });
});
