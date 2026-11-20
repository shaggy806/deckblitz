/**
 * An escape cost's part that isn't mana or the graveyard exile (rule
 * 702.138a: "[cost]" is any cost) — `escape.also`. Lunar Hatchling's
 * "Escape—{4}{G}{U}, Exile a land you control, Exile five other cards from
 * your graveyard": the land chosen as the cost is paid (601.2h), and the
 * escape offered only while there is one to exile.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, pickPermanents, table, toGraveyard, toHand, zone } from "./harness.js";

const HATCHLING = "Lunar Hatchling";

const offers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "escape");

const fiveOthers = (game: Game): ObjectId[] =>
  ["Grizzly Bears", "Opt", "Lightning Bolt", "Shock", "Forest"].map((name) => toGraveyard(game, name));

describe("an escape cost's other part (`escape.also`) — Lunar Hatchling", () => {
  it("escapes for {4}{G}{U}, a land you control and five other cards, which land chosen as it's paid", () => {
    const { game, a } = table();
    const forests = lands(game, "Forest", 4);
    const islands = lands(game, "Island", 3);
    const others = fiveOthers(game);
    const hatchling = toGraveyard(game, HATCHLING);
    expect(offers(game, hatchling)).toHaveLength(1);
    const seen = pickPermanents(a, islands[2]!);
    cast(game, hatchling, { via: "escape", escapeExile: others });
    expect(seen.offered).toEqual(expect.arrayContaining([...forests, ...islands]));
    expect(zone(game, islands[2]!)).toBe("exile");
    expect(others.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(zone(game, hatchling)).toBe("battlefield");
    expect([...forests, ...islands.slice(0, 2)].every((id) => zone(game, id) === "battlefield")).toBe(true);
  });

  it("isn't offered without five other cards in the graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Island", 3);
    toGraveyard(game, "Opt");
    const hatchling = toGraveyard(game, HATCHLING);
    expect(offers(game, hatchling)).toHaveLength(0);
  });

  it("from the hand it's an ordinary cast: no land exiled", () => {
    const { game } = table();
    const all = [...lands(game, "Forest", 4), ...lands(game, "Island", 2)];
    const hatchling = toHand(game, HATCHLING);
    cast(game, hatchling);
    expect(zone(game, hatchling)).toBe("battlefield");
    expect(all.every((id) => zone(game, id) === "battlefield")).toBe(true);
  });
});
