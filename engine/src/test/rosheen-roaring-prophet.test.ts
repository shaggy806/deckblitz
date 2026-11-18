/**
 * Rosheen, Roaring Prophet: "When Rosheen enters, mill six cards. You may put
 * a card with {X} in its mana cost from among them into your hand." and
 * "{T}: Reveal any number of cards with {X} in their mana cost in your hand.
 * Add {C}{C} for each card revealed this way. Spend this mana only on costs
 * that contain {X}." The mana ability reveals as Sacellum Godspeaker's does
 * (an `add-mana` `first`, asked as it's activated — rule 605.3b), its amount
 * twice the revealed count (`product`), its mana restricted as Rosheen
 * Meanderer's (`"cost-with-x"`).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, enter, hand, lands, pickFromZone, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const pool = (game: Game): readonly string[] => game.state.players[A].manaPool.map((u) => u.type);
const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const tap = (game: Game, id: ObjectId): void => {
  game.dispatch({ type: "activate-ability", player: A, source: id, abilityIndex: 0, targets: [] });
};

describe("Rosheen, Roaring Prophet", () => {
  it("mills six and may take a card with {X} in its mana cost from among them", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const blaze = toLibrary(game, "Blaze");
    const deep = Array.from({ length: 4 }, () => toLibrary(game, "Wastes"));
    const seventh = game.state.zones.perPlayer[A].library[6];
    const seen = pickFromZone(a, blaze);
    enter(game, "Rosheen, Roaring Prophet");
    expect(seen.offered).toEqual([blaze]);
    expect(zone(game, blaze)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    for (const card of deep) expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, seventh)).toBe("library");
  });

  it("reveals cards with {X} in their mana costs for {C}{C} each, offering only those", () => {
    const { game } = table();
    const rosheen = spawn(game, "Rosheen, Roaring Prophet");
    const blaze = toHand(game, "Blaze");
    const fireball = toHand(game, "Fireball");
    const bears = toHand(game, "Grizzly Bears");
    tap(game, rosheen);
    const asked = game.state.awaiting;
    expect(asked?.kind).toBe("choose-from-zone");
    if (asked?.kind !== "choose-from-zone") return;
    expect([...asked.eligible].sort()).toEqual([blaze, fireball].sort());
    expect(asked.min).toBe(0);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [blaze, fireball] });
    expect(pool(game)).toEqual(["C", "C", "C", "C"]);
    expect(hand(game)).toEqual(expect.arrayContaining([blaze, fireball, bears]));
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("may reveal none, for no mana", () => {
    const { game } = table();
    const rosheen = spawn(game, "Rosheen, Roaring Prophet");
    toHand(game, "Blaze");
    tap(game, rosheen);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    expect(pool(game)).toEqual([]);
    expect(game.state.objects[rosheen].tapped).toBe(true);
  });

  it("its mana pays only a cost with {X} in it", () => {
    const { game } = table();
    const rosheen = spawn(game, "Rosheen, Roaring Prophet");
    const blaze = toHand(game, "Blaze");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    tap(game, rosheen);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [blaze] });
    expect(pool(game)).toEqual(["C", "C"]);
    // {1}{G} has no {X}: the Forest's {G} and nothing for the {1}.
    expect(castable(game, bears)).toBe(false);
    lands(game, "Mountain", 1);
    expect(castable(game, bears)).toBe(true);
    const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === blaze);
    // {X}{R}: the Mountain's {R}, and X up to Rosheen's two plus the Forest.
    expect(offer !== undefined && "xCost" in offer ? offer.xCost?.maxX : undefined).toBe(3);
  });
});
