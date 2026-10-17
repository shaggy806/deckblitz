/**
 * Bargain (rule 702.166): "As an additional cost to cast this spell, you may
 * sacrifice an artifact, enchantment, or token" (702.166a). A spell whose
 * controller paid it was "bargained" (702.166b), which its other abilities
 * read (702.166c) — on resolution, or as "if it was bargained" on the
 * permanent it became — and a part of it that targets only when bargained
 * has those targets only then (702.166d). "This spell costs {N} less to cast
 * if it's bargained" (Ice Out) is a reduction of the bargained cast's total.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, enter, lands, life, pt, ref, settle, spawn, table, zone } from "./harness.js";

/** A token on alice's battlefield — `count` of them as one stack. */
function token(game: Game, name: string, count = 1): ObjectId {
  const id = spawn(game, name);
  game.state.objects[id].isToken = true;
  if (count > 1) game.state.objects[id].stackCount = count;
  return id;
}

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).flatMap((l) => (l.kind === "cast-spell" && l.card === card ? [l] : []));

describe("bargain", () => {
  it("is offered only with an artifact, enchantment or token to sacrifice, labelled for what it is", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Grizzly Bears", B);
    const grapple = game.debugSpawn("Candy Grapple", A, "hand");
    // A nontoken creature is none of the three.
    spawn(game, "Grizzly Bears");
    expect(offers(game, grapple).map((o) => o.kicked === true)).toEqual([false]);
    // A token creature is.
    token(game, "Saproling Token");
    const bargained = offers(game, grapple).find((o) => o.kicked === true);
    expect(bargained?.kickerKeyword).toBe("bargain");
    expect(bargained?.kickerCost).toBe("");
  });

  it("sacrifices the one chosen as the cost is paid; 'if this spell was bargained' (702.166b)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const target = spawn(game, "Hill Giant", B); // 3/3
    const clue = token(game, "Clue Token");
    const food = token(game, "Food Token");
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible, count) => {
      offered = eligible;
      expect(count).toBe(1);
      return [food];
    };
    const grapple = game.debugSpawn("Candy Grapple", A, "hand");
    cast(game, grapple, { targets: [ref(target)], kicked: true, settle: false });
    // Paid as it's cast, before anyone can respond (rule 601.2h).
    game.advanceUntil((s) => s.awaiting === null);
    expect(offered).toEqual(expect.arrayContaining([clue, food]));
    expect(game.state.objects[food]).toBeUndefined(); // a token sacrificed ceases to exist
    expect(zone(game, clue)).toBe("battlefield");
    expect(zone(game, grapple)).toBe("stack");
    settle(game);
    expect(zone(game, target)).toBe("graveyard");
  });

  it("the bargained effect replaces the unbargained one", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const big = spawn(game, "Colossal Dreadmaw", B); // 6/6
    token(game, "Clue Token");
    cast(game, game.debugSpawn("Candy Grapple", A, "hand"), { targets: [ref(big)], kicked: true });
    expect(pt(game, big)).toEqual({ power: 1, toughness: 1 });
    const other = spawn(game, "Colossal Dreadmaw", B);
    cast(game, game.debugSpawn("Candy Grapple", A, "hand"), { targets: [ref(other)] });
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
  });

  it("takes one token out of a stack, never the whole stack", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const target = spawn(game, "Grizzly Bears", B);
    const stack = token(game, "Saproling Token", 3);
    cast(game, game.debugSpawn("Candy Grapple", A, "hand"), { targets: [ref(target)], kicked: true });
    const left = Object.values(game.state.objects)
      .filter((o) => o.zone === "battlefield" && o.cardName === "Saproling Token")
      .reduce((n, o) => n + (o.stackCount ?? 1), 0);
    expect(left).toBe(2);
    expect(game.state.objects[stack]).toBeDefined();
  });

  it("a Treasure can't both pay the mana and be the bargain (rule 601.2g)", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    spawn(game, "Grizzly Bears", B);
    token(game, "Treasure Token");
    const grapple = game.debugSpawn("Candy Grapple", A, "hand");
    // {1}{B}: the Swamp and the Treasure pay it, leaving nothing to sacrifice.
    expect(offers(game, grapple).map((o) => o.kicked === true)).toEqual([false]);
    lands(game, "Swamp", 1);
    expect(offers(game, grapple).map((o) => o.kicked === true)).toEqual([false, true]);
  });

  it("'costs {1} less if it's bargained' (Ice Out) lowers only the bargained cast", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bolt = game.debugSpawn("Lightning Bolt", A, "hand");
    // Alice keeps priority with her Bolt on the stack (rule 117.3c).
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const islands = lands(game, "Island", 2);
    const iceOut = game.debugSpawn("Ice Out", A, "hand");
    // {1}{U}{U} with two Islands: not unbargained.
    expect(offers(game, iceOut)).toHaveLength(0);
    token(game, "Clue Token");
    expect(offers(game, iceOut).map((o) => o.kicked === true)).toEqual([true]);
    cast(game, iceOut, { targets: [ref(bolt)], kicked: true });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(islands.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("on a permanent: 'when this enters, if it was bargained' (702.166c)", () => {
    const { game } = table();
    lands(game, "Swamp", 10);
    token(game, "Clue Token");
    cast(game, game.debugSpawn("High Fae Negotiator", A, "hand"), { kicked: true });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    // Unbargained, nothing — and a copy entering isn't bargained either.
    cast(game, game.debugSpawn("High Fae Negotiator", A, "hand"));
    expect(life(game, B)).toBe(17);
    enter(game, "High Fae Negotiator");
    expect(life(game, B)).toBe(17);
  });

  it("targets only when bargained (702.166d)", () => {
    const { game } = table();
    const forest = lands(game, "Forest", 1)[0];
    token(game, "Clue Token");
    const wilds = game.debugSpawn("Brave the Wilds", A, "hand");
    const [plain, bargained] = offers(game, wilds);
    expect(plain.targetSpecs).toHaveLength(0);
    expect(bargained.targetSpecs).toHaveLength(1);
    expect(bargained.targetOptions[0]).toEqual([ref(forest)]);
  });
});
