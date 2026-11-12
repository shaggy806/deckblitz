/**
 * `perType` on a grant over cards — one play of each type among them all
 * (`GameState.permissionGroups`' `types`), the cast naming the type it spends
 * in `graveyardGrant.asType` — Aminatou's Augury: exile the top eight, put a
 * land onto the battlefield, then for each nonland card type cast a spell of
 * that type from among them, free, until end of turn.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { A, B, cast, lands, ref, settle, table, toHand, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;
const casts = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card && a.via === "impulse");
/** The offer echoed as a cast's options. */
const as = (offer: Cast) => ({
  via: "impulse" as const,
  ...(offer.free === true ? { free: true } : {}),
  ...(offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
});

/** The eight under the Augury, top first. */
function augury(game: Game, names: readonly string[]): ObjectId[] {
  const ids = [...names].reverse().map((n) => toLibrary(game, n)).reverse();
  lands(game, "Island", 8);
  cast(game, toHand(game, "Aminatou's Augury"));
  settle(game);
  return ids;
}

describe("Aminatou's Augury", () => {
  it("one spell of each type, the land onto the battlefield", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const [forest, bears, giant, growth, shock, ornithopter, bolt, opt] = augury(game, [
      "Forest", "Grizzly Bears", "Hill Giant", "Giant Growth", "Shock", "Ornithopter", "Lightning Bolt", "Opt",
    ]);
    expect(zone(game, forest!)).toBe("battlefield");
    // A creature: Grizzly Bears, free. Then no second creature.
    expect(casts(game, bears!)).toHaveLength(1);
    cast(game, bears!, as(casts(game, bears!)[0]!));
    settle(game);
    expect(zone(game, bears!)).toBe("battlefield");
    expect(casts(game, giant!)).toHaveLength(0);
    // An instant: one of the three.
    cast(game, shock!, { ...as(casts(game, shock!)[0]!), targets: [ref(B)] });
    settle(game);
    expect(casts(game, bolt!)).toHaveLength(0);
    expect(casts(game, growth!)).toHaveLength(0);
    expect(casts(game, opt!)).toHaveLength(0);
    // An artifact creature as an artifact — creature's already spent.
    expect(casts(game, ornithopter!).map((c) => c.graveyardGrant?.asType)).toEqual(["artifact"]);
  });

  it("an artifact creature is cast as either type, and spends that one", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = () => [];
    const [ornithopter, bears, , , , , , opt] = augury(game, [
      "Ornithopter", "Grizzly Bears", "Wastes", "Wastes", "Wastes", "Wastes", "Wastes", "Opt",
    ]);
    expect(casts(game, ornithopter!).map((c) => c.graveyardGrant?.asType).sort()).toEqual(["artifact", "creature"]);
    const asArtifact = casts(game, ornithopter!).find((c) => c.graveyardGrant?.asType === "artifact")!;
    cast(game, ornithopter!, as(asArtifact));
    settle(game);
    expect(zone(game, ornithopter!)).toBe("battlefield");
    expect(casts(game, bears!)).toHaveLength(1);
    expect(casts(game, opt!)).toHaveLength(1);
  });

  it("the permission lasts until end of turn only", () => {
    const { game, a } = table();
    a.chooseFromZoneFn = () => [];
    const [bears] = augury(game, ["Grizzly Bears", "Wastes", "Wastes", "Wastes", "Wastes", "Wastes", "Wastes", "Wastes"]);
    expect(casts(game, bears!)).toHaveLength(1);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    expect(casts(game, bears!)).toHaveLength(0);
  });
});
