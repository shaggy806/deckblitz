/**
 * "As an additional cost to cast this spell, sacrifice a creature. Choose
 * target creature card in your graveyard. Return that card and the
 * sacrificed card to the battlefield under your control at the beginning of
 * your next upkeep." (Rescue from the Underworld): a delayed trigger that
 * keeps its creator's target and remembers the cost's `{ paid: "sacrificed"
 * }` in the stint it went to, both put onto the battlefield in one
 * simultaneous `sequence` (rule 603.6a). Need key
 * effect:delayed-return-target-and-sacrificed-card.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, controller, lands, life, named, nextTurn, settle, spawn, table, toGraveyard, toHand, zone, ref } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** Cast Rescue on alice's main phase, sacrificing `victim`, aimed at `card`. */
function rescue(game: Game, victim: ObjectId, card: ObjectId): ObjectId {
  lands(game, "Swamp", 5);
  const spell = toHand(game, "Rescue from the Underworld");
  cast(game, spell, { targets: [ref(card)], sacrifice: victim });
  return spell;
}

/** On to alice's next upkeep, its delayed trigger resolved. */
function toAliceUpkeep(game: Game): void {
  nextTurn(game, "upkeep"); // bob's
  nextTurn(game, "upkeep"); // alice's
  settle(game);
}

describe("Rescue from the Underworld", () => {
  it("returns the target card and the sacrificed card at your next upkeep, and is exiled", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const spell = rescue(game, bears, giant);
    expect(zone(game, spell)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    nextTurn(game, "upkeep"); // bob's upkeep: not yet
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
  });

  it("returns a creature you controlled but didn't own under your control", () => {
    const { game } = table();
    const stolen = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    settle(game);
    expect(controller(game, stolen)).toBe(A);
    const giant = toGraveyard(game, "Hill Giant");
    rescue(game, stolen, giant);
    expect(game.state.zones.perPlayer[B].graveyard).toContain(stolen);
    toAliceUpkeep(game);
    expect(zone(game, stolen)).toBe("battlefield");
    expect(controller(game, stolen)).toBe(A);
  });

  it("puts both onto the battlefield at once: each sees the other enter", () => {
    const { game } = table();
    const warden = spawn(game, "Soul Warden"); // another creature entering: 1 life
    const giant = toGraveyard(game, "Hill Giant");
    rescue(game, warden, giant);
    const before = life(game, A);
    toAliceUpkeep(game);
    expect(zone(game, warden)).toBe("battlefield");
    // The Giant was put first: only entering together does the Warden see it.
    expect(life(game, A)).toBe(before + 1);
  });

  it("doesn't return a card that left the graveyard since", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    rescue(game, bears, giant);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bears)]);
    settle(game);
    toAliceUpkeep(game);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("returns the sacrificed card from exile when a replacement sent it there", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    spawn(game, "Rest in Peace", B);
    const bears = spawn(game, "Grizzly Bears");
    rescue(game, bears, giant);
    expect(zone(game, bears)).toBe("exile");
    toAliceUpkeep(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("returns only the target card when a token was sacrificed", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Zombie Token", count: 1 }, []);
    settle(game);
    const token = named(game, "Zombie Token", A)[0];
    const giant = toGraveyard(game, "Hill Giant");
    rescue(game, token, giant);
    toAliceUpkeep(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(named(game, "Zombie Token", A)).toHaveLength(0);
  });
});
