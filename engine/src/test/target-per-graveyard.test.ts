/**
 * "For each graveyard with an instant or sorcery card in it, exile target
 * instant or sorcery card from that graveyard" (Mysterious Stranger): a seat
 * slot with `ifAny` — required where that player's graveyard has a match,
 * defined nowhere else (rule 601.2c). "If two or more cards are exiled this
 * way, choose one of them at random and copy it": `choose-random-card` of
 * `"exiled-this-way"`, the copy cast for free (rule 707.12) or not at all.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, enter, hand, table, toGraveyard, watchTargets, zone } from "./harness.js";

describe("Mysterious Stranger — a target from each graveyard with a match", () => {
  it("a slot is required where there's a match and defined nowhere else", () => {
    const { game, a } = table({ players: 3 });
    const mine = toGraveyard(game, "Divination", A);
    const bobs = toGraveyard(game, "Divination", B);
    // A second choice in bob's graveyard, so the targets are asked.
    const counterspell = toGraveyard(game, "Counterspell", B);
    toGraveyard(game, "Grizzly Bears", C);
    let offered = 0;
    a.chooseCastNowFn = (_view, offer) => {
      offered += 1;
      const way = offer.casts[0];
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, free: true };
    };
    const seen = { specs: [] as unknown[] };
    const watch = watchTargets(a, (offered, specs) => {
      seen.specs = [...specs];
      return offered.map((slot) => (slot.includes(bobs) ? bobs : (slot[0] ?? null)));
    });
    const handBefore = hand(game).length;
    enter(game, "Mysterious Stranger");
    expect(watch.asked).toBe(1);
    expect(watch.offered[0]).toEqual([mine]);
    expect([...watch.offered[1]].sort()).toEqual([bobs, counterspell].sort());
    // Carol's graveyard and the empty seat define no target: nothing asked there.
    expect(watch.offered.slice(2).every((slot) => slot.length === 0)).toBe(true);
    // The two that are defined are required, not "up to one".
    const optional = seen.specs.map((s) => typeof s === "object" && (s as { kind: string }).kind === "optional");
    expect(optional.slice(0, 2)).toEqual([false, false]);
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, bobs)).toBe("exile");
    expect(zone(game, counterspell)).toBe("graveyard");
    // Two exiled: one copied and cast — a Divination, two cards drawn.
    expect(offered).toBe(1);
    expect(hand(game).length).toBe(handBefore + 2);
  });

  it("only one exiled: nothing is copied", () => {
    const { game, a } = table({ players: 2 });
    const bobs = toGraveyard(game, "Divination", B);
    let offered = 0;
    a.chooseCastNowFn = (_view, offer) => {
      offered += 1;
      const way = offer.casts[0];
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, free: true };
    };
    watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    const handBefore = hand(game).length;
    enter(game, "Mysterious Stranger");
    // Its one target, chosen for it.
    expect(zone(game, bobs)).toBe("exile");
    expect(offered).toBe(0);
    expect(hand(game).length).toBe(handBefore);
  });

  it("declining the copy: nothing is cast", () => {
    const { game, a } = table({ players: 2 });
    toGraveyard(game, "Divination", A);
    toGraveyard(game, "Divination", B);
    let offered = 0;
    a.chooseCastNowFn = () => {
      offered += 1;
      return null;
    };
    watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    const handBefore = hand(game).length;
    enter(game, "Mysterious Stranger");
    expect(offered).toBe(1);
    expect(hand(game).length).toBe(handBefore);
    expect(game.state.zones.shared.exile.length).toBe(2);
  });
});
