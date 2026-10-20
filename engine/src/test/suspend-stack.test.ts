/**
 * Suspend's two triggered abilities use the stack (rule 702.62a): "at the beginning of your
 * upkeep, if this card is suspended, remove a time counter from it", then "when the last time
 * counter is removed from this card, if it's exiled, you may play it without paying its mana
 * cost". Players can respond to each — the counter is still there while the first waits, and the
 * card still in exile while the second does.
 */
import { describe, expect, it } from "vitest";

import { A, B, lands, life, table, toHand } from "./harness.js";

describe("suspend's triggers go on the stack (702.62a)", () => {
  it("removes the counter as the upkeep trigger resolves, then offers the cast from a trigger of its own", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const rift = toHand(game, "Rift Bolt");
    game.dispatch({ type: "suspend", player: A, card: rift });
    expect(game.state.objects[rift].counters.time).toBe(1);
    a.chooseCastNowFn = (_view, offer) =>
      offer.casts.some((c) => c.card === rift)
        ? { type: "cast-spell", player: A, card: rift, targets: [{ kind: "player", player: B }], via: "effect", free: true }
        : null;

    // Alice's next upkeep: the remove trigger is on the stack, the counter still on the card.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "upkeep" && s.zones.shared.stack.length > 0);
    const top = game.state.objects[game.state.zones.shared.stack.at(-1)!];
    expect(top.kind).toBe("ability");
    expect(top.sourceObjectId).toBe(rift);
    expect(game.state.objects[rift].counters.time).toBe(1);

    // It resolves: the last counter is off, and the cast trigger waits on the stack, the card in exile.
    game.advanceUntil(
      (s) => (s.objects[rift].counters.time ?? 0) === 0 && s.zones.shared.stack.length > 0 && s.awaiting === null,
    );
    expect(game.state.objects[rift].zone).toBe("exile");
    expect(game.state.objects[game.state.zones.shared.stack.at(-1)!].sourceObjectId).toBe(rift);

    // That resolves: the free cast, haste and all, and the Bolt hits bob.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    expect(game.eventsOfType("spell-cast").some((e) => e.object === rift && e.via === "suspend")).toBe(true);
    expect(life(game, B)).toBe(17);
  });

  it("declined, the card stays exiled and is no longer suspended", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const rift = toHand(game, "Rift Bolt");
    game.dispatch({ type: "suspend", player: A, card: rift });
    a.chooseCastNowFn = () => null;
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    expect(game.state.objects[rift].zone).toBe("exile");
    expect(game.state.objects[rift].suspended).toBe(false);
    expect(life(game, B)).toBe(20);
  });
});
