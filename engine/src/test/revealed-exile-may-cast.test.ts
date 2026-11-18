/**
 * `discard-chosen`'s `reveals` with `destination: "exile"` and a `mayPlay` (Taster of Wares):
 * the opponent picks which X cards of their hand to show (X counted as it resolves), the
 * effect's controller chooses one, it's exiled, and an instant or sorcery card exiled this way
 * may be cast for as long as they control the source, with mana of any type (rule 609.4b).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, enter, hand, lands, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const TASTER = "Taster of Wares";

const awaitingChoice = (game: Game) => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-from-zone") throw new Error(`expected a zone choice, not ${awaiting?.kind}`);
  return awaiting;
};

/** Bob's hand: these cards alone. */
const bobsHand = (game: Game, names: readonly string[]): ObjectId[] => {
  for (const id of [...hand(game, B)]) game.debugMove(id, "library");
  return names.map((name) => toHand(game, name, B));
};

const castOffered = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card && x.via === "impulse");

describe("Taster of Wares", () => {
  it("Bob shows as many cards as Alice has Goblins; the instant she chooses is exiled, and she may cast it", () => {
    const { game, a } = table();
    spawn(game, "Goblin Piker", A);
    const [shock, bears, wurm] = bobsHand(game, ["Shock", "Grizzly Bears", "Craw Wurm"]);
    pickTargets(a, B);
    enter(game, TASTER, A, { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    // Two Goblins: Bob picks two of his three to show.
    const showing = awaitingChoice(game);
    expect(showing.player).toBe(B);
    expect([showing.min, showing.max]).toEqual([2, 2]);
    game.dispatch({ type: "choose-from-zone", player: B, chosen: [shock, bears] });
    const choosing = awaitingChoice(game);
    expect(choosing.player).toBe(A);
    expect(choosing.destination).toBe("exile");
    expect(choosing.ids).toEqual([shock, bears]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [shock] });
    settle(game);
    expect(zone(game, shock)).toBe("exile");
    expect(zone(game, wurm)).toBe("hand");
    // Castable by Alice, with any type of mana: a Forest pays for Shock's {R}.
    lands(game, "Forest", 1);
    expect(castOffered(game, shock)).toBe(true);
    cast(game, shock, { targets: [ref(B)], via: "impulse" });
    expect(game.state.players[B].life).toBe(18);
  });

  it("a creature card exiled this way stays exiled, not castable", () => {
    const { game, a } = table();
    const [bears] = bobsHand(game, ["Grizzly Bears"]);
    pickTargets(a, B);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    enter(game, TASTER, A);
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Forest", 2);
    expect(castOffered(game, bears)).toBe(false);
  });

  it("once Alice no longer controls it, the exiled instant can't be cast", () => {
    const { game, a } = table();
    const [shock] = bobsHand(game, ["Shock"]);
    pickTargets(a, B);
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const taster = enter(game, TASTER, A);
    expect(zone(game, shock)).toBe("exile");
    lands(game, "Mountain", 1);
    expect(castOffered(game, shock)).toBe(true);
    destroy(game, taster);
    settle(game);
    expect(castOffered(game, shock)).toBe(false);
    expect(zone(game, shock)).toBe("exile");
  });
});
