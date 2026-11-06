// Star Trek Commander, batch 1 — the lead's cards beside the agents' groups
// (set-trc-batch-1A/B/C), and Star Trek's creature types in the catalog.
import { describe, expect, it } from "vitest";
import { CREATURE_TYPES } from "../creature-types.js";
import { nameOf } from "../state.js";
import { A, B, activate, cast, lands, pickFromZone, pt, ref, spawn, subtypes, supertypes, table, toGraveyard, toHand } from "./harness.js";

describe("Star Trek's creature types", () => {
  it("are in the creature-type catalog", () => {
    for (const type of ["Trill", "Ocampa", "Tribble", "Android", "Bajoran", "Romulan", "Ferengi", "Jem'Hadar"]) {
      expect(CREATURE_TYPES).toContain(type);
    }
  });

  it("count toward Federation (Captain Jonathan Archer: Human, Officer, Ocampa, Advisor)", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const archer = spawn(game, "Captain Jonathan Archer");
    spawn(game, "Kes, Evolving Telepath");
    activate(game, archer, 0, { targets: [ref(archer)] });
    expect(pt(game, archer)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Ezri Dax, Newly Joined", () => {
  it("enters as a copy of a creature card that died this turn, a legendary Trill named Ezri Dax", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    toGraveyard(game, "Serra Angel"); // never on the battlefield this turn
    const died = spawn(game, "Grizzly Bears");
    game.debugMove(died, "graveyard");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugMove(theirs, "graveyard");
    const seen = pickFromZone(a, died);
    const ezri = toHand(game, "Ezri Dax, Newly Joined");
    cast(game, ezri);
    // Only a card in *your* graveyard.
    expect(seen.offered).toEqual([died]);
    expect(game.state.objects[ezri].copyOf).toBe("Grizzly Bears");
    expect(nameOf(game.state.objects[ezri])).toBe("Ezri Dax, Newly Joined");
    expect(supertypes(game, ezri)).toContain("legendary");
    expect(subtypes(game, ezri)).toEqual(expect.arrayContaining(["Bear", "Trill"]));
    expect(pt(game, ezri)).toEqual({ power: 2, toughness: 2 });
    expect(game.state.objects[ezri].controller).toBe(A);
  });
});
