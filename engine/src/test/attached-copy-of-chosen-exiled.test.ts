/**
 * "As this Equipment becomes attached to a creature, choose an exiled creature
 * card used to craft this Equipment. Equipped creature is a copy of the last
 * chosen card": an `asBecomesAttached` `look-and-choose` over the cards exiled
 * with it (craft's materials, rule 702.167c, linked by 607.2a) whose `then` is
 * `note` `copyOf` — the card's printed values kept as `chosenCopy` — read by a
 * `copyOfChosen` static on what it's attached to (layer 1, rule 707.2).
 *
 * Proving card: Paleontologist's Pick-Axe // Dinosaur Headdress.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf, printedCardName } from "../state.js";
import type { ScriptedController } from "../controller.js";
import { activate, attack, hand, keywords, lands, pickTargets, pt, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

/** Pick-Axe crafted with Serra Angel and Hill Giant from the graveyard, the
 * Headdress then attached to the Bears by its enters trigger; `chosen` are
 * the cards chosen at each attachment, in order. */
function crafted(game: Game, a: ScriptedController, chosen: readonly string[]) {
  const bears = spawn(game, "Grizzly Bears");
  const axe = spawn(game, "Paleontologist's Pick-Axe");
  const angel = toGraveyard(game, "Serra Angel");
  const giant = toGraveyard(game, "Hill Giant");
  const byName: Record<string, ObjectId> = { "Serra Angel": angel, "Hill Giant": giant };
  const offered: (readonly ObjectId[])[] = [];
  let materialsPicked = false;
  a.chooseFromZoneFn = (_view, eligible) => {
    if (!materialsPicked) {
      materialsPicked = true;
      return [angel, giant];
    }
    offered.push(eligible);
    return [byName[chosen[offered.length - 1]!]!];
  };
  pickTargets(a, bears);
  lands(game, "Wastes", 5);
  activate(game, axe, 1);
  return { bears, headdress: axe, angel, giant, offered };
}

describe("Paleontologist's Pick-Axe // Dinosaur Headdress", () => {
  it("crafted, it enters attached to a creature, which becomes a copy of the creature card chosen", () => {
    const { game, a } = table();
    const { bears, headdress, angel, giant, offered } = crafted(game, a, ["Serra Angel"]);
    expect(printedCardName(game.state.objects[headdress]!)).toBe("Dinosaur Headdress");
    expect(zone(game, angel)).toBe("exile");
    expect(game.state.objects[headdress]!.attachedTo).toBe(bears);
    expect([...offered[0]!].sort()).toEqual([angel, giant].sort());
    expect(nameOf(game.state.objects[bears]!)).toBe("Serra Angel");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });

  it("moved to another creature, it chooses again: the new one is the copy, the old one itself again", () => {
    const { game, a } = table();
    const { bears, headdress } = crafted(game, a, ["Serra Angel", "Hill Giant"]);
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Wastes", 2);
    activate(game, headdress, 0, { targets: [ref(elves)] });
    expect(game.state.objects[headdress]!.attachedTo).toBe(elves);
    expect(nameOf(game.state.objects[elves]!)).toBe("Hill Giant");
    expect(pt(game, elves)).toEqual({ power: 3, toughness: 3 });
    expect(nameOf(game.state.objects[bears]!)).toBe("Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("the front face: equipped creature attacks, its controller draws then discards", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const axe = spawn(game, "Paleontologist's Pick-Axe");
    lands(game, "Wastes", 1);
    activate(game, axe, 0, { targets: [ref(bears)] });
    const card = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [card];
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before);
    expect(zone(game, card)).toBe("graveyard");
  });
});
