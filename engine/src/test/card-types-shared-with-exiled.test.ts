/**
 * "Spells you cast cost {1} less to cast for each card type they share with
 * cards exiled with this creature" (Cemetery Prowler): the
 * `{ cardTypesSharedWith: "exiled-with-source", of: "priced" }` amount as a
 * `costModification`'s `reduceGeneric` — each card type once, however many
 * exiled cards have it, and only the cards this Prowler exiled (rule 607.2a).
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, destroy, enter, lands, pickFromZone, toGraveyard, toHand, zone } from "./harness.js";
import { table } from "./harness.js";

describe("Cemetery Prowler", () => {
  it("a creature spell costs {1} less with a creature card exiled; a sorcery doesn't", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    enter(game, "Cemetery Prowler");
    expect(zone(game, bears)).toBe("exile");
    // Hill Giant, {3}{R}, for three Mountains.
    lands(game, "Mountain", 3);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
    // Divination, {2}{U}, shares nothing: two Islands aren't enough.
    lands(game, "Island", 2);
    const divination = toHand(game, "Divination");
    expect(() => cast(game, divination)).toThrow();
  });

  it("without the Prowler's discount the same cast is refused", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    expect(() => cast(game, toHand(game, "Hill Giant"))).toThrow();
  });

  it("counts each shared card type: an artifact creature card exiled takes {2} off Juggernaut, {1} off an artifact", () => {
    const { game, a } = table();
    const thopter = toGraveyard(game, "Ornithopter", A);
    pickFromZone(a, thopter);
    enter(game, "Cemetery Prowler");
    lands(game, "Wastes", 2);
    const juggernaut = toHand(game, "Juggernaut");
    cast(game, juggernaut);
    expect(zone(game, juggernaut)).toBe("battlefield");
    // Jayemdae Tome, {4}: {3} now — two more lands aren't enough, three are.
    lands(game, "Wastes", 2);
    const tome = toHand(game, "Jayemdae Tome");
    expect(() => cast(game, tome)).toThrow();
    lands(game, "Wastes", 1);
    cast(game, tome);
    expect(zone(game, tome)).toBe("battlefield");
  });

  it("counts a card type once however many exiled cards have it, and exiles again as it attacks", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const elves = toGraveyard(game, "Llanowar Elves", B);
    pickFromZone(a, bears);
    const prowler = enter(game, "Cemetery Prowler");
    game.state.objects[prowler].summoningSick = false;
    pickFromZone(a, elves);
    attack(game, a, [prowler]);
    expect(zone(game, elves)).toBe("exile");
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Hill Giant"))).toThrow();
    lands(game, "Mountain", 1);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("a new Prowler has nothing exiled with it (rule 400.7)", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    const first = enter(game, "Cemetery Prowler");
    destroy(game, first);
    // Spawned silently: its enters trigger exiles nothing.
    game.debugSpawn("Cemetery Prowler", A, "battlefield");
    lands(game, "Mountain", 3);
    expect(() => cast(game, toHand(game, "Hill Giant"))).toThrow();
  });
});
