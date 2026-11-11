/**
 * A warp cost with life in it, and warp from the graveyard (rule 702.185a;
 * `warp`'s `payLife` and `fromGraveyard`) — Timeline Culler: "You may cast
 * this card from your graveyard using its warp ability. Warp—{B}, Pay 2 life."
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, cast, lands, life, nextTurn, table, toGraveyard, toHand, zone } from "./harness.js";

const casts = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> =>
    a.kind === "cast-spell" && a.card === card,
  );

describe("Warp—{B}, Pay 2 life, from the hand or the graveyard — Timeline Culler", () => {
  it("from the hand: either its mana cost or its warp cost, the warp paying 2 life", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const culler = toHand(game, "Timeline Culler");
    expect(casts(game, culler).map((a) => a.via).sort()).toEqual(["warp", undefined]);
    cast(game, culler, { via: "warp" });
    expect(zone(game, culler)).toBe("battlefield");
    expect(life(game)).toBe(18);
    // One Swamp paid it: the other is still untapped.
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(1);
    // Cast for its mana cost instead, no life is paid and nothing exiles it.
    const second = toHand(game, "Timeline Culler");
    lands(game, "Swamp", 2);
    cast(game, second);
    expect(life(game)).toBe(18);
    nextTurn(game);
    expect(zone(game, culler)).toBe("exile");
    expect(zone(game, second)).toBe("battlefield");
  });

  it("from the graveyard: only for its warp cost, then exiled at the end step and castable from exile later", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const culler = toGraveyard(game, "Timeline Culler");
    expect(casts(game, culler).map((a) => a.via)).toEqual(["warp"]);
    // Its mana cost isn't a way out of the graveyard.
    expect(game.canDispatch({ type: "cast-spell", player: A, card: culler, targets: [] })).not.toBeNull();
    cast(game, culler, { via: "warp" });
    expect(zone(game, culler)).toBe("battlefield");
    expect(life(game)).toBe(18);
    expect(game.state.objects[culler].castVia).toBe("warp");
    // A spell cast from a graveyard, for what counts those (Laboratory Drudge).
    expect(game.state.players[A].usedGraveyardThisTurn).toBe(true);
    nextTurn(game);
    expect(zone(game, culler)).toBe("exile");
    // A later turn of its owner's: from exile, for its mana cost.
    nextTurn(game);
    expect(casts(game, culler).map((a) => a.via)).toEqual(["impulse"]);
    cast(game, culler, { via: "impulse" });
    expect(zone(game, culler)).toBe("battlefield");
    expect(life(game)).toBe(18);
  });

  it("can't be warped by a player without 2 life to pay (rule 119.4)", () => {
    const { game } = table({ life: 1 });
    lands(game, "Swamp", 2);
    const inHand = toHand(game, "Timeline Culler");
    const inYard = toGraveyard(game, "Timeline Culler");
    expect(casts(game, inHand).map((a) => a.via)).toEqual([undefined]);
    expect(casts(game, inYard)).toEqual([]);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: inYard, targets: [], via: "warp" })).toMatch(/2 life/);
  });

  it("a plain warp card stays a hand cast: nothing from the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const vocalist = toGraveyard(game, "Starfield Vocalist");
    expect(casts(game, vocalist)).toEqual([]);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: vocalist, targets: [], via: "warp" })).toMatch(
      /graveyard/,
    );
  });
});
