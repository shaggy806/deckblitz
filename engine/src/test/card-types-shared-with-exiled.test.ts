/**
 * "Spells you cast cost {1} less to cast for each card type they share with
 * cards exiled with this creature" (Cemetery Prowler): the
 * `{ cardTypesSharedWith: "exiled-with-source", of: "priced" }` amount as a
 * `costModification`'s `reduceGeneric` — each card type once, however many
 * exiled cards have it, and only the cards this Prowler exiled (rule 607.2a).
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, destroy, enter, lands, life, pickFromZone, ref, toGraveyard, toHand, zone } from "./harness.js";
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

  // The spell's types are those of the face or half being cast (rules 715.3a,
  // 712.11b), never the card's other face.
  it("an Adventure cast as the Adventure is an instant spell, not a creature spell", () => {
    const { game, a } = table();
    pickFromZone(a, toGraveyard(game, "Grizzly Bears", B));
    enter(game, "Cemetery Prowler");
    // Stomp, {1}{R}: a creature card exiled takes nothing off it.
    lands(game, "Mountain", 1);
    const stomp = toHand(game, "Bonecrusher Giant");
    expect(() => cast(game, stomp, { face: 1, targets: [ref(B)] })).toThrow();
    // Bonecrusher Giant itself, {2}{R}, is a creature spell: two Mountains.
    lands(game, "Mountain", 1);
    cast(game, stomp);
    expect(zone(game, stomp)).toBe("battlefield");
  });

  it("with an instant card exiled, Stomp costs {1} less and the Giant doesn't", () => {
    const { game, a } = table();
    pickFromZone(a, toGraveyard(game, "Lightning Bolt", B));
    enter(game, "Cemetery Prowler");
    lands(game, "Mountain", 2);
    const giant = toHand(game, "Bonecrusher Giant");
    expect(() => cast(game, giant)).toThrow();
    const stomp = toHand(game, "Bonecrusher Giant");
    game.state.objects[game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Mountain")!].tapped = true;
    cast(game, stomp, { face: 1, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });

  it("a modal double-faced card's back face is read as the back face", () => {
    const { game, a } = table();
    pickFromZone(a, toGraveyard(game, "Grizzly Bears", B));
    enter(game, "Cemetery Prowler");
    // Sword of the Realms, {1}{W}, an artifact spell: no discount.
    lands(game, "Plains", 1);
    const sword = toHand(game, "Halvar, God of Battle");
    expect(() => cast(game, sword, { face: 1 })).toThrow();
    // Halvar, {2}{W}{W}, a creature spell: three Plains.
    lands(game, "Plains", 2);
    cast(game, sword);
    expect(zone(game, sword)).toBe("battlefield");
    expect(game.state.objects[sword].cardName).toBe("Halvar, God of Battle");
  });

  it("with an artifact card exiled, the artifact back face costs {1} less", () => {
    const { game, a } = table();
    pickFromZone(a, toGraveyard(game, "Jayemdae Tome", B));
    enter(game, "Cemetery Prowler");
    lands(game, "Plains", 1);
    const sword = toHand(game, "Halvar, God of Battle");
    cast(game, sword, { face: 1 });
    expect(zone(game, sword)).toBe("battlefield");
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
