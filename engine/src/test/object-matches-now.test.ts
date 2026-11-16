/**
 * `object-matches` with `now`: "if it's a Samurai card" asked of the card
 * where it is now — the one the instruction it gates acts on — not as it last
 * existed (rule 608.2h). Oathkeeper, Takeno's Daisho, written from its Oracle
 * text and ruling: the card's creature type in the graveyard, not the
 * creature's as it died.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, destroy, lands, pt, ref, settle, spawn, table, zone } from "./harness.js";

/** Oathkeeper on the battlefield, equipped to `creature`. */
function equipped(game: Game, creature: ObjectId): ObjectId {
  const oath = spawn(game, "Oathkeeper, Takeno's Daisho");
  lands(game, "Wastes", 2);
  activate(game, oath, 0, { targets: [ref(creature)] });
  expect(game.state.objects[oath].attachedTo).toBe(creature);
  return oath;
}

/** A layer-4 change of `creature`'s creature types for good. */
function become(game: Game, creature: ObjectId, patch: { addSubtypes?: string[]; setSubtypes?: string[] }): void {
  game.debugApplyEffect(A, { kind: "become", target: 0, ...patch, duration: "permanent" }, [ref(creature)]);
  settle(game);
}

describe("Oathkeeper, Takeno's Daisho", () => {
  it("equipped creature gets +3/+1", () => {
    const { game } = table();
    const ronin = spawn(game, "Akki Ronin");
    equipped(game, ronin);
    // Akki Ronin is 1/3.
    expect(pt(game, ronin)).toEqual({ power: 4, toughness: 4 });
  });

  it("a Samurai card that dies equipped returns under your control", () => {
    const { game } = table();
    const ronin = spawn(game, "Akki Ronin");
    equipped(game, ronin);
    destroy(game, ronin);
    expect(zone(game, ronin)).toBe("battlefield");
    expect(game.state.objects[ronin].controller).toBe(A);
  });

  it("a creature that was a Samurai only on the battlefield stays in the graveyard (the ruling)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    become(game, giant, { addSubtypes: ["Samurai"] });
    equipped(game, giant);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("a Samurai card that wasn't a Samurai as it died still returns: the card is asked", () => {
    const { game } = table();
    const ronin = spawn(game, "Akki Ronin");
    become(game, ronin, { setSubtypes: ["Frog"] });
    equipped(game, ronin);
    destroy(game, ronin);
    expect(zone(game, ronin)).toBe("battlefield");
  });

  it("a Samurai card gone from the graveyard by then isn't returned", () => {
    const { game } = table();
    const ronin = spawn(game, "Akki Ronin");
    equipped(game, ronin);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(ronin)]);
    expect(zone(game, ronin)).toBe("graveyard");
    // Exiled from the graveyard with the trigger still waiting: a new object (rule 400.7).
    game.debugMove(ronin, "exile");
    settle(game);
    expect(zone(game, ronin)).toBe("exile");
  });

  it("put into a graveyard from the battlefield, it exiles the creature it equipped", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const oath = equipped(game, giant);
    destroy(game, oath);
    expect(zone(game, giant)).toBe("exile");
  });
});
