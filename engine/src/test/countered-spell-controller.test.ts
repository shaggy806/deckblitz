/**
 * Spellshift: "its controller" read after the spell is countered — the
 * spell's controller as it last existed on the stack (rule 608.2h), a copy's
 * too, though a countered copy ceases to exist (rule 707.10a): that player
 * reveals until an instant or sorcery, may cast it free, then shuffles.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, hand, lands, ref, settle, table, toHand, toLibrary, zone } from "./harness.js";

const pass = (game: ReturnType<typeof table>["game"], player: typeof A): void => {
  game.dispatch({ type: "pass-priority", player });
};

/** The seat casts whatever a `cast-now` offers, free, with no targets. */
const castFree = (seat: ScriptedController): void => {
  seat.chooseCastNowFn = (_v, offer) => {
    const way = offer.casts[0];
    return way === undefined ? null : { type: "cast-spell", player: seat.playerId, card: way.card, targets: [], via: way.via, free: true };
  };
};

describe("Spellshift", () => {
  it("counters a spell, and its controller reveals until an instant, casting it free", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 4, B);
    const twice = toLibrary(game, "Think Twice");
    const bears = toLibrary(game, "Grizzly Bears");
    castFree(a);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pass(game, A);
    const before = hand(game).length;
    cast(game, toHand(game, "Spellshift", B), { player: B, targets: [ref(bolt)] });
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, twice)).toBe("graveyard");
    // Think Twice drew a card; the Bears were shuffled back.
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, bears)).not.toBe("exile");
  });

  it("reads a countered copy's controller", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    lands(game, "Island", 4, B);
    const twice = toLibrary(game, "Think Twice");
    castFree(a);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Twincast"), { targets: [ref(bolt)], settle: false });
    pass(game, A);
    pass(game, B);
    // The copy's "may choose new targets" answered (kept), nothing resolved.
    game.advanceUntil(
      (s) =>
        s.awaiting === null &&
        s.zones.shared.stack.length === 2 &&
        s.objects[s.zones.shared.stack.at(-1)!]?.cardName === "Lightning Bolt",
    );
    const copy: ObjectId = game.state.zones.shared.stack.at(-1)!;
    expect(copy).not.toBe(bolt);
    expect(game.state.objects[copy].controller).toBe(A);
    pass(game, A);
    cast(game, toHand(game, "Spellshift", B), { player: B, targets: [ref(copy)] });
    settle(game);
    expect(game.state.objects[copy]).toBeUndefined();
    expect(zone(game, twice)).toBe("graveyard");
  });
});
