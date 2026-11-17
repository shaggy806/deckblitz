/**
 * Chandra, Pyromaster. Its −7: "Exile the top ten cards of your library.
 * Choose an instant or sorcery card exiled this way and copy it three times.
 * You may cast the copies without paying their mana costs." — one card chosen
 * as it lies in exile (a `look-and-choose` over `"exiled-this-way"`, `stay`),
 * then `cast-now` from `"chosen-this-way"` with `copies: 3`: each copy its own
 * "may" (rule 707.12a), the card itself left in exile (Capricious
 * Hellraiser's shape). Its +1 and 0 are Soul of Shandalar's targets and an
 * impulse exile.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, blockOffer, hand, life, loyalty, pickFromZone, ref, spawn, table, toLibrary, zone } from "./harness.js";

/** The seat casts every copy it's offered, recording each. */
function castCopies(seat: ScriptedController): ObjectId[] {
  const made: ObjectId[] = [];
  seat.chooseCastNowFn = (_view, offer) => {
    if (offer.casts.length === 0) return null;
    const way = offer.casts[0];
    made.push(way.card);
    return { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
  };
  return made;
}

describe("Chandra, Pyromaster", () => {
  it("+1: 1 damage to a player and to up to one creature they control, which can't block this turn", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra, Pyromaster");
    const bears = spawn(game, "Grizzly Bears", B);
    const wall = spawn(game, "Hill Giant", B);
    const giant = spawn(game, "Hill Giant");
    loyalty(game, chandra, 1, { targets: [ref(B), ref(bears)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[chandra].counters.loyalty).toBe(5);
    blockOffer(game, a, [giant]);
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: bears, attacker: giant }] })).not.toBeNull();
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: wall, attacker: giant }] })).toBeNull();
  });

  it("+1 with no creature: the player alone is dealt damage", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Pyromaster");
    loyalty(game, chandra, 1, { targets: [ref(B), null] });
    expect(life(game, B)).toBe(19);
  });

  it("+1: the creature must be the first target's player's, or that planeswalker's controller's", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Pyromaster");
    const walker = spawn(game, "Chandra, Torch of Defiance", B);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => loyalty(game, chandra, 1, { targets: [ref(walker), ref(mine)] })).toThrow(/target/i);
    loyalty(game, chandra, 1, { targets: [ref(walker), ref(theirs)] });
    expect(game.state.objects[walker].counters.loyalty).toBe(3);
    expect(game.state.objects[theirs].damageMarked).toBe(1);
  });

  it("0: exiles the top card, which may be played this turn — a land with a land drop", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Pyromaster");
    const forest = toLibrary(game, "Forest");
    loyalty(game, chandra, 0);
    expect(zone(game, forest)).toBe("exile");
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("−7: one instant or sorcery card of the ten is chosen, and three copies of it are cast; the card stays exiled", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra, Pyromaster");
    const library = [
      "Divination",
      "Lightning Bolt",
      "Grizzly Bears",
      "Forest",
      "Shock",
      "Forest",
      "Forest",
      "Forest",
      "Forest",
      "Forest",
    ];
    // `toLibrary` puts each on top: the last one named ends up first.
    const ids = library.map((name) => toLibrary(game, name));
    const divination = ids[0];
    const picked = pickFromZone(a, divination);
    const made = castCopies(a);
    const before = hand(game).length;
    loyalty(game, chandra, -7, { atLeast: 7 });
    expect(ids.every((id) => zone(game, id) === "exile")).toBe(true);
    // The instants and sorceries alone are offered.
    expect([...picked.offered].sort()).toEqual([ids[0], ids[1], ids[4]].sort());
    expect(made).toHaveLength(3);
    expect(made).not.toContain(divination);
    expect(hand(game).length).toBe(before + 6);
    expect(zone(game, divination)).toBe("exile");
  });
});
