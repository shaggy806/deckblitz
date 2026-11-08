/**
 * Reveal until a card sharing a card type with a permanent that has just
 * left — `reveal-until`'s filter with `sharesCardTypeWith` of the target
 * slot, read as the permanent last existed (rule 608.2h), in its controller's
 * library (`whose: { controllerOf }`). Wild Magic Surge: "Destroy
 * target permanent an opponent controls. Its controller reveals cards from
 * the top of their library until they reveal a permanent card that shares a
 * card type with that permanent. They put that card onto the battlefield and
 * the rest on the bottom of their library in a random order."
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, controller, hand, lands, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

// Every library is Lightning Bolts — no permanent cards — so what's put on
// top is all a reveal can find.
const board = () => table({ deck: "Lightning Bolt" });

describe("Wild Magic Surge", () => {
  it("a land destroyed: its controller reveals past a creature to a land, which enters under them; the creature goes to the bottom", () => {
    const t = board();
    const { game } = t;
    const forest = spawn(game, "Forest", B);
    const mountain = toLibrary(game, "Mountain", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Wild Magic Surge"), { targets: [ref(forest)] });

    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, mountain)).toBe("battlefield");
    expect(controller(game, mountain)).toBe(B);
    expect(zone(game, bears)).toBe("library");
    // On the bottom: bob's next draw is a Bolt.
    const before = hand(game, B).length;
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    const drawn = hand(game, B)[before];
    expect(game.state.objects[drawn].cardName).toBe("Lightning Bolt");
  });

  it("an artifact creature: either type will do, but not a nonpermanent card", () => {
    const t = board();
    const { game } = t;
    const thopter = spawn(game, "Ornithopter", B);
    const ring = toLibrary(game, "Sol Ring", B);
    const bolt = toLibrary(game, "Lightning Bolt", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Wild Magic Surge"), { targets: [ref(thopter)] });

    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, bolt)).toBe("library");
  });

  it("an indestructible permanent isn't destroyed, and its controller still reveals", () => {
    const t = board();
    const { game } = t;
    const myr = spawn(game, "Darksteel Myr", B);
    const ring = toLibrary(game, "Sol Ring", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Wild Magic Surge"), { targets: [ref(myr)] });

    expect(zone(game, myr)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("nothing shares a type: every card is revealed and goes to the bottom, nothing enters", () => {
    const t = board();
    const { game } = t;
    const forest = spawn(game, "Forest", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    const libraryBefore = game.state.zones.perPlayer[B].library.length;
    cast(game, toHand(game, "Wild Magic Surge"), { targets: [ref(forest)] });

    expect(zone(game, bears)).toBe("library");
    expect(game.state.zones.perPlayer[B].library.length).toBe(libraryBefore);
    expect(game.state.zones.shared.battlefield.filter((id) => controller(game, id) === B)).toEqual([]);
  });

  it("targets only an opponent's permanent (Reweave, any permanent, below)", () => {
    const t = board();
    const { game } = t;
    const mine = spawn(game, "Forest", A);
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Wild Magic Surge"), { targets: [ref(mine)] })).toThrow(/target/i);
  });
});

describe("Reweave", () => {
  it("the controller sacrifices it, then reveals to a permanent card sharing a type with it", () => {
    const t = board();
    const { game } = t;
    const ogre = spawn(game, "Gray Ogre", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const ring = toLibrary(game, "Sol Ring", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Reweave"), { targets: [ref(ogre)] });

    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    expect(zone(game, ring)).toBe("library");
  });

  it("spliced onto an Arcane spell, with a target of its own", () => {
    const t = board();
    const { game } = t;
    const ogre = spawn(game, "Gray Ogre", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    lands(game, "Island", 4);
    const reweave = toHand(game, "Reweave");
    cast(game, toHand(game, "Glacial Ray"), { targets: [ref(B), ref(ogre)], splice: [reweave] });

    expect(game.state.players[B].life).toBe(18);
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, reweave)).toBe("hand");
  });
});
