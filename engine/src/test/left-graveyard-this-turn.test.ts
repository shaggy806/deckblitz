/**
 * "If a creature card left your graveyard this turn"
 * (`condition:creature-card-left-graveyard-this-turn`): the journal word
 * `"left-graveyard"` — each card that left its owner's graveyard, for
 * anywhere, its entry keeping the card as it was there (the
 * `cards-left-graveyard` event's snapshots), so a `turn-history` filter reads
 * what it was in the graveyard. Syrix, Carrier of the Flame.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  destroy,
  lands,
  life,
  pickTargets,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Syrix, Carrier of the Flame", () => {
  it("has a Phoenix deal damage equal to its power at the end step once a creature card left your graveyard", () => {
    const { game, a } = table();
    const syrix = spawn(game, "Syrix, Carrier of the Flame");
    const bears = toGraveyard(game, "Grizzly Bears");
    game.debugMove(bears, "hand");
    pickTargets(a, syrix, B);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("reads the card as it was in the graveyard: an instant card leaving, or a creature card leaving an opponent's graveyard, doesn't count", () => {
    const { game, a } = table();
    spawn(game, "Syrix, Carrier of the Flame");
    game.debugMove(toGraveyard(game, "Lightning Bolt"), "exile");
    game.debugMove(toGraveyard(game, "Grizzly Bears", B), "exile");
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [];
    };
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(20);
  });

  it("can be cast from your graveyard as another Phoenix you control dies", () => {
    const { game, a } = table();
    const syrix = toGraveyard(game, "Syrix, Carrier of the Flame");
    const phoenix = spawn(game, "Arclight Phoenix");
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    let offered = 0;
    a.chooseCastNowFn = (_view, offer) => {
      offered += 1;
      const way = offer.casts.find((c) => c.card === syrix);
      return way === undefined ? null : { type: "cast-spell", player: A, card: syrix, targets: [], via: way.via };
    };
    destroy(game, phoenix);
    settle(game);
    expect(offered).toBe(1);
    expect(zone(game, syrix)).toBe("battlefield");
  });

  it("doesn't trigger for an opponent's Phoenix, nor when it dies at the same time as the other Phoenix", () => {
    const { game, a } = table();
    toGraveyard(game, "Syrix, Carrier of the Flame");
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    let offered = 0;
    a.chooseCastNowFn = () => {
      offered += 1;
      return null;
    };
    destroy(game, spawn(game, "Arclight Phoenix", B));
    expect(offered).toBe(0);

    // Its ruling: it must already be in the graveyard as the other dies.
    const { game: g2, a: a2 } = table();
    const syrix = spawn(g2, "Syrix, Carrier of the Flame");
    spawn(g2, "Arclight Phoenix");
    lands(g2, "Plains", 4);
    a2.chooseCastNowFn = () => {
      offered += 1;
      return null;
    };
    cast(g2, toHand(g2, "Wrath of God"));
    settle(g2);
    expect(zone(g2, syrix)).toBe("graveyard");
    expect(offered).toBe(0);
  });
});
