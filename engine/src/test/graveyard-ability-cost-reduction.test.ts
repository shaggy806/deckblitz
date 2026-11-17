/**
 * "Activated abilities of cards in your graveyard cost {2} less to activate"
 * (Convergence of Dominion) and "…of creature cards in your graveyard cost
 * {1} less" (Embalmer's Tools): an `abilityCostModification` whose `applies`
 * reads `inZone: "graveyard"` and `ownedBy: "you"`, with `anyZone` so it
 * reaches a card that isn't a permanent. The cost is totalled while the card
 * is still in the graveyard (rule 601.2f, by way of 602.2b), before a cost
 * that exiles it is paid.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, activate, graveyard, lands, ref, spawn, table, toGraveyard, toLibrary, zone } from "./harness.js";

/** A creature of alice's made her commander (rule 903.3). */
function commander(game: Game): ObjectId {
  const id = spawn(game, "Grizzly Bears");
  game.state.objects[id].isCommander = true;
  return id;
}

describe("Convergence of Dominion — Dynastic Command Node", () => {
  it("takes {2} off a graveyard card's ability while you control your commander", () => {
    const { game } = table();
    spawn(game, "Convergence of Dominion");
    commander(game);
    // Unearth {2}, down to one mana: one land pays it.
    const sliver = toGraveyard(game, "Dregscape Sliver");
    lands(game, "Wastes", 1);
    activate(game, sliver, 0);
    expect(zone(game, sliver)).toBe("battlefield");
  });

  it("does nothing without your commander", () => {
    const { game } = table();
    spawn(game, "Convergence of Dominion");
    const sliver = toGraveyard(game, "Dregscape Sliver");
    lands(game, "Wastes", 1);
    expect(() => activate(game, sliver, 0)).toThrow(/mana|pay|afford/i);
    expect(zone(game, sliver)).toBe("graveyard");
  });

  it("can't take the cost below one mana, but takes all the generic beside a coloured symbol", () => {
    const { game } = table();
    spawn(game, "Convergence of Dominion");
    commander(game);
    // {2}{B} is {B}: a single Swamp.
    const specimen = toGraveyard(game, "Persistent Specimen");
    lands(game, "Swamp", 1);
    activate(game, specimen, 0);
    expect(zone(game, specimen)).toBe("battlefield");
  });

  it("leaves a permanent's ability alone — its own {3} mill included", () => {
    const { game } = table();
    const convergence = spawn(game, "Convergence of Dominion");
    commander(game);
    lands(game, "Wastes", 2);
    expect(() => activate(game, convergence, 0)).toThrow(/mana|pay|afford/i);
    lands(game, "Wastes", 1);
    for (let i = 0; i < 3; i++) toLibrary(game, "Wastes");
    const before = graveyard(game).length;
    activate(game, convergence, 0);
    expect(graveyard(game).length).toBe(before + 3);
  });
});

describe("Embalmer's Tools", () => {
  it("takes {1} off a creature card's ability in your graveyard", () => {
    const { game } = table();
    spawn(game, "Embalmer's Tools");
    // {2}{B} is {1}{B}.
    const specimen = toGraveyard(game, "Persistent Specimen");
    lands(game, "Swamp", 1);
    expect(() => activate(game, specimen, 0)).toThrow(/mana|pay|afford/i);
    lands(game, "Wastes", 1);
    activate(game, specimen, 0);
    expect(zone(game, specimen)).toBe("battlefield");
  });

  it("two of them take {2}, never below {0}", () => {
    const { game } = table();
    spawn(game, "Embalmer's Tools");
    spawn(game, "Embalmer's Tools");
    // Unearth {2} is free.
    const sliver = toGraveyard(game, "Dregscape Sliver");
    activate(game, sliver, 0);
    expect(zone(game, sliver)).toBe("battlefield");
  });

  it("taps an untapped Zombie you control: target player mills a card", () => {
    const { game } = table();
    const tools = spawn(game, "Embalmer's Tools");
    const zombie = spawn(game, "Dregscape Zombie");
    toLibrary(game, "Wastes", B);
    const before = graveyard(game, B).length;
    activate(game, tools, 0, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(before + 1);
    expect(game.state.objects[zombie].tapped).toBe(true);
    expect(() => activate(game, tools, 0, { targets: [ref(B)] })).toThrow(/untapped|Zombie|tap/i);
  });
});
