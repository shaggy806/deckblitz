/**
 * Cityscape Leveler (cast and attack triggers; "its controller creates a tapped Powerstone") and
 * Varragoth, Bloodsky Sire (boast: the target player searches and puts the card on top).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, lands, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const powerstones = (game: ReturnType<typeof table>["game"], player: typeof A): number =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === "Powerstone Token" && game.state.objects[id].controller === player,
  ).length;

describe("Cityscape Leveler", () => {
  it("cast: destroys a nonland permanent; its controller gets a tapped Powerstone", () => {
    const { game, a } = table();
    lands(game, "Wastes", 8);
    const giant = spawn(game, "Hill Giant", B);
    a.chooseTargetsFn = () => [ref(giant)];
    cast(game, toHand(game, "Cityscape Leveler"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(powerstones(game, B)).toBe(1);
    expect(powerstones(game, A)).toBe(0);
  });

  it("attacks: the same again", () => {
    const { game, a } = table();
    const leveler = spawn(game, "Cityscape Leveler");
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bears)];
    attack(game, a, [leveler]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(powerstones(game, B)).toBe(1);
  });
});

describe("Varragoth, Bloodsky Sire", () => {
  it("boast: the target player searches and puts the card on top", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    const varragoth = spawn(game, "Varragoth, Bloodsky Sire");
    const sought = toLibrary(game, "Hill Giant", B);
    // Bury it under a few.
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Wastes", B);
    b.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === sought);
    attack(game, a, [varragoth]);
    activate(game, varragoth, 0, { targets: [ref(B)] });
    const library = game.state.zones.perPlayer[B].library;
    expect(library[0]).toBe(sought);
    expect(game.eventsOfType("library-shuffled").some((e) => e.player === B)).toBe(true);
  });
});
