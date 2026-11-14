/**
 * "Whenever equipped creature dies, exile it. … As long as a card exiled with
 * Eater of Virtue has flying, equipped creature has flying. The same is true
 * for …, protection, …" (Eater of Virtue): the dead creature's card is
 * exiled linked to the Equipment (rule 607.2a), and a `sharesKeywords` static
 * scoped to the equipped creature gives it each listed keyword those cards
 * have, with their protection abilities (702.16a). A new Eater is a new object
 * with nothing exiled with it (rule 400.7, the ruling).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  cast,
  destroy,
  keywords,
  lands,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

/** Eater of Virtue equipped to `creature` for {1}. */
function equipTo(game: Game, eater: ObjectId, creature: ObjectId): void {
  lands(game, "Plains", 1);
  activate(game, eater, 0, { targets: [ref(creature)] });
}

describe("Eater of Virtue", () => {
  it("gives +2/+0, exiles the equipped creature that dies, and gives the next one its keywords", () => {
    const { game } = table();
    const eater = spawn(game, "Eater of Virtue");
    const angel = spawn(game, "Serra Angel");
    equipTo(game, eater, angel);
    expect(pt(game, angel)).toEqual({ power: 6, toughness: 4 });
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears)).not.toContain("flying");
    destroy(game, angel);
    expect(zone(game, angel)).toBe("exile");
    equipTo(game, eater, bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect([...keywords(game, bears)]).toEqual(expect.arrayContaining(["flying", "vigilance"]));
    // Only the equipped creature has them.
    const other = spawn(game, "Grizzly Bears");
    expect(keywords(game, other)).not.toContain("flying");
  });

  it("gives the equipped creature an exiled card's protection: White Knight's from black", () => {
    const { game } = table();
    const eater = spawn(game, "Eater of Virtue");
    const knight = spawn(game, "White Knight");
    equipTo(game, eater, knight);
    destroy(game, knight);
    expect(zone(game, knight)).toBe("exile");
    const giant = spawn(game, "Hill Giant");
    equipTo(game, eater, giant);
    expect(keywords(game, giant)).toContain("first-strike");
    lands(game, "Swamp", 3);
    const at = [ref(giant)];
    expect(() => cast(game, toHand(game, "Murder"), { targets: at })).toThrow(/target/i);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: at });
    // A red spell can; it died equipped, so it's exiled with the Eater too.
    expect(zone(game, giant)).toBe("exile");
  });

  it("a creature that dies unequipped isn't exiled, and an Eater that returns has nothing exiled with it", () => {
    const { game } = table();
    const eater = spawn(game, "Eater of Virtue");
    const angel = spawn(game, "Serra Angel");
    destroy(game, angel);
    expect(zone(game, angel)).toBe("graveyard");
    const second = spawn(game, "Serra Angel");
    equipTo(game, eater, second);
    destroy(game, second);
    expect(zone(game, second)).toBe("exile");
    // Back from the hand: a new object (rule 400.7).
    game.debugMove(eater, "hand");
    game.debugMove(eater, "battlefield");
    const bears = spawn(game, "Grizzly Bears");
    equipTo(game, eater, bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears)).not.toContain("flying");
    expect(game.state.objects[eater].controller).toBe(A);
  });
});

describe("Death-Mask Duplicant", () => {
  it("has the landwalk of the cards it imprinted, named or not (rule 702.14a, the ruling)", () => {
    const { game } = table();
    const duplicant = spawn(game, "Death-Mask Duplicant");
    const wraith = toGraveyard(game, "Bog Wraith");
    const dryad = toGraveyard(game, "Dryad Sophisticate");
    expect(keywords(game, duplicant)).not.toContain("swampwalk");
    lands(game, "Plains", 2);
    activate(game, duplicant, 0, { targets: [ref(wraith)] });
    activate(game, duplicant, 0, { targets: [ref(dryad)] });
    expect(zone(game, wraith)).toBe("exile");
    expect([...keywords(game, duplicant)]).toEqual(expect.arrayContaining(["swampwalk", "landwalk"]));
    expect(computeCharacteristics(game.state, registryOf(game), duplicant).landwalk).toEqual([
      { type: "land", notSupertype: "basic" },
    ]);
    // Gone from exile, gone from it.
    game.debugMove(wraith, "graveyard");
    expect(keywords(game, duplicant)).not.toContain("swampwalk");
  });

  it("has fear, but not a keyword its list leaves out", () => {
    const { game } = table();
    const duplicant = spawn(game, "Death-Mask Duplicant");
    const horror = toGraveyard(game, "Severed Legion");
    const angel = toGraveyard(game, "Serra Angel");
    lands(game, "Plains", 2);
    activate(game, duplicant, 0, { targets: [ref(horror)] });
    activate(game, duplicant, 0, { targets: [ref(angel)] });
    const has = [...keywords(game, duplicant)];
    expect(has).toEqual(expect.arrayContaining(["fear", "flying"]));
    expect(has).not.toContain("vigilance");
  });
});
