/**
 * "Until end of turn, you may tap lands you don't control for mana. Spend
 * this mana only to cast spells" (Piracy): the `player-effect`'s
 * `tapsLandsYouDontControl`. Its caster activates the {T} mana abilities of
 * other players' lands (rule 602.2: only an object's controller may, unless
 * it says otherwise — here an effect does), by hand with priority; the mana
 * is theirs, and pays for spells alone.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../index.js";
import { A, B, cast, lands, nextTurn, spawn, table, toHand } from "./harness.js";

const offersOn = (game: Game, player: PlayerId, source: ObjectId): number =>
  game.legalActions(player).filter((a) => a.kind === "activate-ability" && a.source === source).length;

function pirate(): { t: ReturnType<typeof table>; forests: ObjectId[] } {
  const t = table();
  lands(t.game, "Island", 2);
  const forests = lands(t.game, "Forest", 2, B);
  cast(t.game, toHand(t.game, "Piracy"));
  return { t, forests };
}

const tapFor = (game: Game, land: ObjectId): void => {
  game.dispatch({ type: "activate-ability", player: A, source: land, abilityIndex: 0, targets: [] });
};

describe("Piracy", () => {
  it("lets its caster tap an opponent's lands for mana and cast a spell with it", () => {
    const { t, forests } = pirate();
    expect(offersOn(t.game, A, forests[0])).toBeGreaterThan(0);
    for (const f of forests) tapFor(t.game, f);
    expect(t.game.state.objects[forests[0]].tapped).toBe(true);
    const pool = t.game.state.players[A].manaPool;
    expect(pool.map((u) => u.type)).toEqual(["G", "G"]);
    expect(pool.every((u) => u.restriction !== undefined)).toBe(true);
    expect(t.game.state.players[B].manaPool).toHaveLength(0);
    const bears = toHand(t.game, "Grizzly Bears");
    cast(t.game, bears);
    expect(t.game.state.objects[bears].zone).toBe("battlefield");
  });

  it("its mana can't pay for an ability", () => {
    const { t, forests } = pirate();
    const walla = spawn(t.game, "Rootwalla");
    for (const f of forests) tapFor(t.game, f);
    expect(t.game.canDispatch({ type: "activate-ability", player: A, source: walla, abilityIndex: 0, targets: [] })).not.toBeNull();
  });

  it("only lands, and only for the caster", () => {
    const { t } = pirate();
    const elves = spawn(t.game, "Llanowar Elves", B);
    expect(offersOn(t.game, A, elves)).toBe(0);
    const mine = lands(t.game, "Forest", 1, A)[0];
    expect(offersOn(t.game, B, mine)).toBe(0);
  });

  it("lasts until end of turn", () => {
    const { t, forests } = pirate();
    nextTurn(t.game);
    nextTurn(t.game);
    expect(offersOn(t.game, A, forests[0])).toBe(0);
  });

  it("without it, an opponent's land is theirs alone", () => {
    const t = table();
    const forest = lands(t.game, "Forest", 1, B)[0];
    expect(offersOn(t.game, A, forest)).toBe(0);
    expect(t.game.canDispatch({ type: "activate-ability", player: A, source: forest, abilityIndex: 0, targets: [] })).toMatch(
      /does not control/,
    );
  });
});
