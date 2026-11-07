/**
 * "You may cast that card … Do this only once each turn", spent only by
 * casting (Planetarium of Wan Shi Tong's ruling): a `cast-now` with
 * `marksAbilityDone` marks the ability done this turn when a spell is cast
 * off it, and its `this-ability-did-this-turn` condition keeps it from
 * triggering again — declining, or a land on top, leaves it free.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, lands, spawn, table, toLibrary, toStep, zone } from "./harness.js";

type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;

/** Accept every cast-now offer, recording what each offered. */
function acceptAll(seat: ScriptedController): string[][] {
  const offered: string[][] = [];
  seat.chooseCastNowFn = (_view, offer: CastNowOffer) => {
    offered.push(offer.casts.map((c) => c.cardName));
    const way = offer.casts[0];
    return way === undefined ? null : { type: "cast-spell", player: A, card: way.card, targets: [], via: "effect", free: true };
  };
  return offered;
}

const board = () => {
  const t = table();
  const planetarium = spawn(t.game, "Planetarium of Wan Shi Tong");
  // A second scry, the same turn: Crystal Ball's.
  const ball = spawn(t.game, "Crystal Ball");
  lands(t.game, "Island", 4);
  return { ...t, planetarium, ball };
};

const scry = (game: Game, planetarium: ObjectId): void => activate(game, planetarium, 0);

describe("Planetarium of Wan Shi Tong", () => {
  it("after a scry, casts the top card of the library free", () => {
    const { game, a, planetarium } = board();
    const offered = acceptAll(a);
    const bears = toLibrary(game, "Grizzly Bears");
    scry(game, planetarium);
    expect(offered).toEqual([["Grizzly Bears"]]);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("once it has cast a card, doesn't trigger again that turn — but does the next", () => {
    const { game, a, planetarium, ball } = board();
    const offered = acceptAll(a);
    toLibrary(game, "Grizzly Bears");
    scry(game, planetarium);
    expect(offered).toHaveLength(1);
    // Another scry this turn: no further offer.
    const giant = toLibrary(game, "Hill Giant");
    scry(game, ball);
    expect(offered).toHaveLength(1);
    expect(zone(game, giant)).toBe("library");
    // Alice's next turn it's free again.
    toStep(game, "precombat-main", A);
    const next = toLibrary(game, "Grizzly Bears");
    scry(game, planetarium);
    expect(offered).toHaveLength(2);
    expect(zone(game, next)).toBe("battlefield");
  });

  it("declining leaves it free to trigger again the same turn", () => {
    const { game, a, planetarium, ball } = board();
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked += 1;
      return null;
    };
    toLibrary(game, "Grizzly Bears");
    scry(game, planetarium);
    expect(asked).toBe(1);
    scry(game, ball);
    expect(asked).toBe(2);
  });

  it("a land on top can't be cast: nothing is offered and nothing is spent", () => {
    const { game, a, planetarium, ball } = board();
    const offered = acceptAll(a);
    toLibrary(game, "Forest");
    scry(game, planetarium);
    expect(offered).toHaveLength(0);
    const bears = toLibrary(game, "Grizzly Bears");
    scry(game, ball);
    expect(offered).toEqual([["Grizzly Bears"]]);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
