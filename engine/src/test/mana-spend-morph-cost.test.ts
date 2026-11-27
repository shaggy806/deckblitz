/**
 * "Spend this mana only to cast a face-down creature spell, pay a mana cost to
 * turn a manifested creature face up, or pay a morph cost" (Qarsi Deceiver):
 * `ManaSpendPurpose` `"face-down-spell"` beside the two narrower parts of
 * turning face up, `"morph-cost"` (a morph or megamorph cost, 702.37b/e — not
 * a disguise cost, 702.168d) and `"manifested-face-up"` (a manifested
 * permanent's mana cost, 701.40b — not a cloaked one's, 701.58b), read from
 * the special action's purpose `faceUpBy`.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { FaceDownKind } from "../state.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, settle, spawn, table, toHand } from "./harness.js";

const castable = (game: Game, card: ObjectId, via?: string): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card && (via === undefined ? a.via === undefined : a.via === via));

const turnable = (game: Game, id: ObjectId, morph: boolean): boolean =>
  game.legalActions(A).some((a) => a.kind === "turn-face-up" && a.permanent === id && (a.morph !== undefined) === morph);

const faceDownOnBattlefield = (game: Game, name: string, kind: FaceDownKind): ObjectId => {
  const id = spawn(game, name);
  game.state.objects[id].faceDown = { kind };
  invalidateComputedCache();
  return id;
};

describe("Qarsi Deceiver", () => {
  it("its {C} and two more cast a morph face down, but not a face-up spell", () => {
    const { game } = table();
    const qarsi = spawn(game, "Qarsi Deceiver");
    lands(game, "Wastes", 1);
    const stone = toHand(game, "Mind Stone");
    expect(castable(game, stone)).toBe(false);
    const den = toHand(game, "Den Protector");
    expect(castable(game, den, "face-down")).toBe(false);
    lands(game, "Wastes", 1);
    expect(castable(game, den, "face-down")).toBe(true);
    cast(game, den, { via: "face-down" });
    expect(game.state.objects[den].faceDown).toBeDefined();
    expect(game.state.objects[qarsi].tapped).toBe(true);
  });

  it("pays a megamorph cost (a morph cost)", () => {
    const { game } = table();
    const qarsi = spawn(game, "Qarsi Deceiver");
    lands(game, "Forest", 1);
    const den = faceDownOnBattlefield(game, "Den Protector", "morph");
    expect(turnable(game, den, true)).toBe(true);
    game.dispatch({ type: "turn-face-up", player: A, permanent: den, morph: true });
    settle(game);
    expect(game.state.objects[den].faceDown).toBeUndefined();
    expect(game.state.objects[qarsi].tapped).toBe(true);
  });

  it("doesn't pay a disguise cost", () => {
    const { game } = table();
    spawn(game, "Qarsi Deceiver");
    lands(game, "Mountain", 1);
    const bender = faceDownOnBattlefield(game, "Boltbender", "disguise");
    expect(turnable(game, bender, true)).toBe(false);
    lands(game, "Wastes", 1);
    expect(turnable(game, bender, true)).toBe(true);
  });

  it("pays a manifested creature's mana cost, not a cloaked one's", () => {
    const { game } = table();
    const qarsi = spawn(game, "Qarsi Deceiver");
    lands(game, "Forest", 1);
    const cloaked = faceDownOnBattlefield(game, "Grizzly Bears", "cloak");
    expect(turnable(game, cloaked, false)).toBe(false);
    const manifested = faceDownOnBattlefield(game, "Grizzly Bears", "manifest");
    expect(turnable(game, manifested, false)).toBe(true);
    game.dispatch({ type: "turn-face-up", player: A, permanent: manifested });
    settle(game);
    expect(game.state.objects[manifested].faceDown).toBeUndefined();
    expect(game.state.objects[qarsi].tapped).toBe(true);
  });
});
