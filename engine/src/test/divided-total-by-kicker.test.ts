/**
 * A divided total that reads whether the spell is kicked (rule 702.33d):
 * the kicker is announced before the targets and the division (601.2b before
 * 601.2d), so the total is read for the variant being cast — the offer and
 * the cast each pass `kicked` to `Game.dividedNow`, where `self-kicked`
 * answers from it (the spell hasn't recorded it yet). Pollen Remedy.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

type CastSpellOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId): CastSpellOffer[] =>
  game.legalActions(A).filter((a): a is CastSpellOffer => a.kind === "cast-spell" && a.card === card);

describe("Pollen Remedy: prevent 3 divided, or 6 if kicked", () => {
  it("offers 3 unkicked and 6 kicked", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const card = toHand(game, "Pollen Remedy");
    const all = offers(game, card);
    expect(all.find((o) => o.kicked !== true)?.divide?.total).toBe(3);
    expect(all.find((o) => o.kicked === true)?.divide?.total).toBe(6);
  });

  it("unkicked: 3 divided, so no more than 3 points", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Hill Giant");
    lands(game, "Plains", 2);
    const card = toHand(game, "Pollen Remedy");
    expect(() => cast(game, card, { targets: [ref(bear), ref(ogre)], division: [3, 3] })).toThrow();
    cast(game, card, { targets: [ref(bear), ref(ogre)], division: [2, 1] });
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(ogre)] });
    expect(game.state.objects[ogre].damageMarked).toBe(2);
  });

  it("kicked by sacrificing a land: 6 divided", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Hill Giant");
    const plains = lands(game, "Plains", 2);
    const card = toHand(game, "Pollen Remedy");
    cast(game, card, { kicked: true, targets: [ref(bear), ref(ogre)], division: [3, 3] });
    expect(plains.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bear)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(ogre)] });
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].damageMarked ?? 0).toBe(0);
    expect(game.state.objects[ogre].damageMarked ?? 0).toBe(0);
  });
});
