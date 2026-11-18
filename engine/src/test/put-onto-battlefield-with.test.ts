/**
 * "The creature put onto the battlefield with this enchantment" after the
 * enchantment has left (rule 607.2c): the `{ putOntoBattlefieldWith }` set
 * reads what an ability of the source put there in the stint the resolving
 * ability refers to (`FilterContext.sourceStint`), and a source's look-back
 * trigger (603.10a) reads `putThereBySource` against the stint it left —
 * Diabolic Servitude.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, destroy, enter, hand, pickTargets, settle, spawn, table, toGraveyard, zone } from "./harness.js";

const SERVITUDE = "Diabolic Servitude";

function bounce(game: Game, id: ObjectId): void {
  game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [{ kind: "object", object: id }]);
  settle(game);
}

/** Diabolic Servitude enters and returns Grizzly Bears from Alice's graveyard. */
function servitudeWithBears(): { game: Game; servitude: ObjectId; bears: ObjectId } {
  const { game, a } = table();
  const bears = toGraveyard(game, "Grizzly Bears");
  pickTargets(a, bears);
  const servitude = enter(game, SERVITUDE);
  expect(zone(game, bears)).toBe("battlefield");
  return { game, servitude, bears };
}

describe("Diabolic Servitude", () => {
  it("exiles the returned creature when it dies, and returns to its owner's hand", () => {
    const { game, servitude, bears } = servitudeWithBears();
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game, A)).toContain(servitude);
  });

  it("ignores another creature dying", () => {
    const { game, servitude } = servitudeWithBears();
    const other = spawn(game, "Grizzly Bears");
    destroy(game, other);
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, servitude)).toBe("battlefield");
  });

  it("exiles the returned creature when it leaves the battlefield", () => {
    const { game, servitude, bears } = servitudeWithBears();
    destroy(game, servitude);
    expect(zone(game, servitude)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
  });

  it("leaves another creature alone when it leaves", () => {
    const { game, servitude } = servitudeWithBears();
    const other = spawn(game, "Grizzly Bears");
    destroy(game, servitude);
    expect(zone(game, other)).toBe("battlefield");
  });

  it("loses track of a creature returned to its owner's hand (the ruling)", () => {
    const { game, servitude, bears } = servitudeWithBears();
    bounce(game, bears);
    expect(zone(game, bears)).toBe("hand");
    destroy(game, servitude);
    expect(zone(game, bears)).toBe("hand");
  });

  it("destroyed beside the creature, still exiles it as it dies, and stays in its graveyard", () => {
    const { game, servitude, bears } = servitudeWithBears();
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { notTypes: ["land"] } });
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, servitude)).toBe("graveyard");
  });
});
