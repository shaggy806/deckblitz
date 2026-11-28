/**
 * "This turn and next turn" (`"until-end-of-next-turn"`, an `UntilPoint` of
 * `next-turn-ends`: the next turn to begin, whoever's, over at its cleanup —
 * rule 514.2), and `be-targeted`'s `only: "spells-and-activated"`, which
 * leaves a triggered ability's targets alone (rules 601.2c, 602.2b, 603.3d):
 * Peace Talks.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, enter, lands, nextTurn, pickTargets, ref, registryOf, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const canAttack = (game: Game, player: PlayerId, attacker: ObjectId, defender: PlayerId): boolean =>
  whyCannotAttack(game.state, registryOf(game), player, attacker, defender) === null;

function peaceTalks(): ReturnType<typeof table> & { bears: ObjectId; giant: ObjectId } {
  const t = table();
  const bears = spawn(t.game, "Grizzly Bears", A);
  const giant = spawn(t.game, "Hill Giant", B);
  lands(t.game, "Plains", 2);
  cast(t.game, toHand(t.game, "Peace Talks"));
  return { ...t, bears, giant };
}

describe("Peace Talks", () => {
  it("no creature can attack this turn or next turn, and the turn after they can", () => {
    const { game, bears, giant } = peaceTalks();
    expect(canAttack(game, A, bears, B)).toBe(false);
    nextTurn(game);
    expect(canAttack(game, B, giant, A)).toBe(false);
    nextTurn(game);
    expect(canAttack(game, A, bears, B)).toBe(true);
  });

  it("no spell can target a player or a permanent, this turn or next", () => {
    const { game, bears, giant } = peaceTalks();
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    expect(() => cast(game, shock, { targets: [ref(giant)] })).toThrow(/target/i);
    expect(() => cast(game, shock, { targets: [ref(B)] })).toThrow(/target/i);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    expect(() => cast(game, bolt, { player: B, targets: [ref(bears)] })).toThrow(/target/i);
    expect(() => cast(game, bolt, { player: B, targets: [ref(A)] })).toThrow(/target/i);
    nextTurn(game);
    cast(game, shock, { targets: [ref(giant)] });
    expect(zone(game, shock)).toBe("graveyard");
  });

  it("no activated ability can target either", () => {
    const { game, giant } = peaceTalks();
    const sorcerer = spawn(game, "Prodigal Sorcerer", A);
    expect(() => activate(game, sorcerer, 0, { targets: [ref(giant)] })).toThrow(/target/i);
    expect(() => activate(game, sorcerer, 0, { targets: [ref(B)] })).toThrow(/target/i);
  });

  it("a triggered ability still targets", () => {
    const { game, a, giant } = peaceTalks();
    lands(game, "Mountain", 4);
    pickTargets(a, giant);
    enter(game, "Flametongue Kavu");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("a card in a graveyard is no permanent, and can still be targeted", () => {
    const { game } = peaceTalks();
    lands(game, "Swamp", 1);
    const dead = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Disentomb"), { targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("hand");
  });
});
