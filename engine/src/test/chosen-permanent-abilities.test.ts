/**
 * "The chosen permanent" in a static's filter (`CardFilter.chosenBySource`):
 * the permanent chosen as the source entered (rule 614.1c,
 * `choosePermanentOnEnter`), while it's still that object (rule 400.7).
 * Scheming Fence's lock on it ("activated abilities of the chosen permanent
 * can't be activated" — a `prohibits`) and its copies of them ("has all
 * activated abilities of the chosen permanent except for loyalty abilities"
 * — a `grantsActivatedOf`), paid with mana as though of any color.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, lands, life, named, nextTurn, pickPermanents, pt, ref, spawn, table, toHand } from "./harness.js";

const canActivate = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((x) => x.kind === "activate-ability" && x.source === source);

/** Alice casts Scheming Fence, choosing `chosen` (none when it's absent). */
function castFence(game: Game, seat: Parameters<typeof pickPermanents>[0], chosen?: ObjectId): ObjectId {
  pickPermanents(seat, ...(chosen === undefined ? [] : [chosen]));
  lands(game, "Plains", 1);
  lands(game, "Island", 1);
  cast(game, toHand(game, "Scheming Fence"));
  return named(game, "Scheming Fence")[0];
}

describe("Scheming Fence", () => {
  it("locks the chosen permanent's abilities and has them itself, paid with mana of any color", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears");
    const fence = castFence(game, a, dragon);
    expect(game.state.objects[fence].chosenPermanent?.id).toBe(dragon);
    lands(game, "Plains", 1);
    expect(canActivate(game, dragon)).toBe(false);
    expect(canActivate(game, fence)).toBe(true);
    // "{R}: This creature gets +1/+0" — the Fence's, paid with a Plains.
    activate(game, fence, 0);
    expect(pt(game, fence)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, dragon)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("offers nonland permanents only, and choosing none locks and grants nothing", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Shivan Dragon");
    const seen = pickPermanents(a);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Scheming Fence"));
    const [fence] = named(game, "Scheming Fence");
    expect(seen.offered).toContain(dragon);
    expect(seen.offered.every((id) => !game.state.objects[id].cardName.match(/Plains|Island/))).toBe(true);
    expect(seen.offered).not.toContain(fence);
    expect(game.state.objects[fence].chosenPermanent).toBeUndefined();
    lands(game, "Mountain", 1);
    expect(canActivate(game, dragon)).toBe(true);
    expect(canActivate(game, fence)).toBe(false);
  });

  it("an opponent's permanent: its controller can't activate it; the Fence's copy is the Fence's (it deals the damage)", () => {
    const { game, a } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    const fence = castFence(game, a, sorcerer);
    nextTurn(game); // bob's
    expect(canActivate(game, sorcerer, B)).toBe(false);
    nextTurn(game); // alice's: the Fence can tap now
    activate(game, fence, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });

  it("leaves out loyalty abilities, though the lock still holds them", () => {
    const { game, a } = table();
    const ajani = spawn(game, "Ajani Goldmane");
    expect(canActivate(game, ajani)).toBe(true);
    const fence = castFence(game, a, ajani);
    expect(canActivate(game, ajani)).toBe(false);
    expect(canActivate(game, fence)).toBe(false);
  });

  it("a chosen permanent that leaves and returns is a new object: unlocked, and the Fence no longer has its abilities", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Shivan Dragon");
    const fence = castFence(game, a, dragon);
    game.debugMove(dragon, "exile");
    game.debugMove(dragon, "battlefield");
    lands(game, "Mountain", 1);
    expect(canActivate(game, dragon)).toBe(true);
    expect(canActivate(game, fence)).toBe(false);
  });
});
