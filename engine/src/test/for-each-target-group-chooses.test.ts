/**
 * A `for-each-target` in turn order whose groups are ordered by their own
 * players (`groupChooses`), over only the members exiled this way (`only`),
 * each object once (`eachObjectOnce`) — Chaotic Transformation's ruling: "If a
 * player controls multiple permanents that were exiled this way, that player
 * first chooses which target they're considering, then they reveal cards
 * until they reveal a card that shares a type with that permanent as it last
 * existed on the battlefield … They then repeat this process for the
 * remaining targets they controlled." The pick is the
 * `choose-permanent-or-player` decision, asked of that player, over the cards
 * in exile.
 */
import { describe, expect, it } from "vitest";

import type { ChoosePermanentOrPlayerOffer, ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, controller, lands, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/** Stack the top of `player`'s library: first name on top. */
const stack = (game: Game, names: readonly string[], player: PlayerId): ObjectId[] =>
  [...names].reverse().map((name) => toLibrary(game, name, player)).reverse();

/** Answer each pick with `want` while the offer holds it; record the offers. */
function picking(seat: ScriptedController, want?: ObjectId): ChoosePermanentOrPlayerOffer[] {
  const offers: ChoosePermanentOrPlayerOffer[] = [];
  seat.choosePermanentOrPlayerFn = (_view, offer) => {
    offers.push(offer);
    return offer.eligible.find((e) => e.kind === "object" && e.object === want) ?? offer.eligible[0];
  };
  return offers;
}

const onBattlefield = (game: Game, ids: readonly ObjectId[]): boolean[] => ids.map((id) => zone(game, id) === "battlefield");

describe("Chaotic Transformation", () => {
  it("a player whose two permanents were exiled picks which is replaced first: the artifact first finds the artifact creature, then the creature", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 6);
    const ring = spawn(game, "Sol Ring", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const [thopter, bears] = stack(game, ["Ornithopter", "Grizzly Bears"], B);
    const asked = picking(b, ring);
    const alice = picking(a);
    cast(game, toHand(game, "Chaotic Transformation"), { targets: [ref(ring), ref(elves), null, null, null] });
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, elves)).toBe("exile");
    // Bob, not the caster, is asked, once, over his two cards in exile.
    expect(alice).toHaveLength(0);
    expect(asked).toHaveLength(1);
    expect(asked[0].eligible).toEqual(expect.arrayContaining([ref(ring), ref(elves)]));
    expect(asked[0].eligible).toHaveLength(2);
    // The artifact first: Ornithopter (an artifact); then the creature: the Bears.
    expect(onBattlefield(game, [thopter, bears])).toEqual([true, true]);
    expect(controller(game, thopter)).toBe(B);
    expect(controller(game, bears)).toBe(B);
  });

  it("the creature first instead: Ornithopter is the creature found, and no artifact is left to find", () => {
    const { game, b } = table();
    lands(game, "Mountain", 6);
    const ring = spawn(game, "Sol Ring", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const [thopter, bears] = stack(game, ["Ornithopter", "Grizzly Bears"], B);
    picking(b, elves);
    cast(game, toHand(game, "Chaotic Transformation"), { targets: [ref(ring), ref(elves), null, null, null] });
    expect(onBattlefield(game, [thopter, bears])).toEqual([true, false]);
    expect(zone(game, bears)).toBe("library");
  });

  it("the active player's permanents first, whatever the targets' order, and nobody asked about one", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 6);
    const myElves = spawn(game, "Llanowar Elves");
    const ring = spawn(game, "Sol Ring", B);
    const [bears] = stack(game, ["Grizzly Bears"], A);
    const [thopter] = stack(game, ["Ornithopter"], B);
    const alice = picking(a);
    const bob = picking(b);
    cast(game, toHand(game, "Chaotic Transformation"), { targets: [ref(ring), ref(myElves), null, null, null] });
    expect(alice).toHaveLength(0);
    expect(bob).toHaveLength(0);
    // Alice's Bears entered before bob's Ornithopter (rule 608.2f, APNAP).
    const battlefield = game.state.zones.shared.battlefield;
    expect(battlefield.indexOf(bears)).toBeGreaterThanOrEqual(0);
    expect(battlefield.indexOf(bears)).toBeLessThan(battlefield.indexOf(thopter));
  });

  it("at four players, asks only the player with two of theirs exiled, over their own", () => {
    const { game, a, b } = table({ players: 4 });
    lands(game, "Mountain", 6);
    const myRing = spawn(game, "Sol Ring");
    const anthem = spawn(game, "Glorious Anthem", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const [thopter] = stack(game, ["Ornithopter"], A);
    const [giant, honor] = stack(game, ["Hill Giant", "Honor of the Pure"], B);
    const alice = picking(a);
    const bob = picking(b, anthem);
    cast(game, toHand(game, "Chaotic Transformation"), {
      targets: [ref(myRing), ref(elves), ref(anthem), null, null],
    });
    expect(alice).toHaveLength(0);
    expect(bob).toHaveLength(1);
    expect(bob[0].eligible).toHaveLength(2);
    expect(bob[0].eligible).toEqual(expect.arrayContaining([ref(elves), ref(anthem)]));
    expect(onBattlefield(game, [thopter, giant, honor])).toEqual([true, true, true]);
  });

  it("one artifact creature chosen as both the artifact and the creature is one permanent exiled: one reveal", () => {
    const { game, b } = table();
    lands(game, "Mountain", 6);
    const thopter = spawn(game, "Ornithopter", B);
    const [bears, giant] = stack(game, ["Grizzly Bears", "Hill Giant"], B);
    const asked = picking(b);
    cast(game, toHand(game, "Chaotic Transformation"), { targets: [ref(thopter), ref(thopter), null, null, null] });
    expect(zone(game, thopter)).toBe("exile");
    expect(asked).toHaveLength(0);
    expect(onBattlefield(game, [bears, giant])).toEqual([true, false]);
  });
});
