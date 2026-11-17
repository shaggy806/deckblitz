/**
 * Eye of Ojer Taq // Apex Observatory: "As it enters, choose a card type
 * shared among two exiled cards used to craft it" (`chooseOnEnter` over
 * `CARD_TYPE_CHOICES` narrowed by `chooseOnEnterSharedByExiled` to the types
 * two or more of the craft materials in exile share — rules 607.2a, 702.167c)
 * and "{T}: The next spell you cast this turn of the chosen type can be cast
 * without paying its mana cost" (`grant-spells-this-turn` with `next`,
 * `free` and the filter clause `ofChosenCardType`, fixed as it resolves —
 * rule 608.2h).
 */
import { describe, expect, it } from "vitest";
import { invalidateComputedCache } from "../characteristics.js";
import { matchesFilter } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import type { Game } from "../game.js";
import { A, activate, cast, lands, named, pickFromZone, registryOf, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

/** Craft the Eye with `materials` (cards in A's graveyard or permanents),
 * answering the as-enters choice with `answer` (or the first offered). */
function craft(
  game: Game,
  a: ReturnType<typeof table>["a"],
  materials: readonly ObjectId[],
  answer?: string,
): { eye: ObjectId; offered: string[][] } {
  lands(game, "Wastes", 6);
  const eye = spawn(game, "Eye of Ojer Taq");
  const offered: string[][] = [];
  a.chooseCreatureTypeFn = (_view, _source, options) => {
    offered.push([...options]);
    return answer ?? options[0];
  };
  pickFromZone(a, ...materials);
  activate(game, eye, 1);
  return { eye, offered };
}

const untap = (game: Game, id: ObjectId): void => {
  game.state.objects[id].tapped = false;
  invalidateComputedCache();
};

describe("Apex Observatory: a card type shared among the exiled cards used to craft it", () => {
  it("offers only the card types the two materials share, and enters tapped", () => {
    const { game, a } = table();
    const thopter = toGraveyard(game, "Ornithopter");
    const bears = toGraveyard(game, "Grizzly Bears");
    const { eye, offered } = craft(game, a, [thopter, bears]);
    expect(printedCardName(game.state.objects[eye])).toBe("Apex Observatory");
    expect(zone(game, eye)).toBe("battlefield");
    expect(game.state.objects[eye].tapped).toBe(true);
    expect(offered).toEqual([["creature"]]);
    expect(game.state.objects[eye].chosenOnEnter).toBe("creature");
    expect(zone(game, thopter)).toBe("exile");
  });

  it("two artifact creatures share both of their card types, in the rule's order", () => {
    const { game, a } = table();
    const first = toGraveyard(game, "Ornithopter");
    const second = spawn(game, "Ornithopter");
    const { eye, offered } = craft(game, a, [first, second], "artifact");
    expect(offered).toEqual([["artifact", "creature"]]);
    expect(game.state.objects[eye].chosenOnEnter).toBe("artifact");
  });

  it("with a token among the materials only one card is in exile: nothing is asked or chosen", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    const treasure = named(game, "Treasure", A)[0];
    const stone = toGraveyard(game, "Mind Stone");
    const { eye, offered } = craft(game, a, [treasure, stone]);
    expect(printedCardName(game.state.objects[eye])).toBe("Apex Observatory");
    expect(offered).toEqual([]);
    expect(game.state.objects[eye].chosenOnEnter ?? null).toBe(null);
    // Its ability reaches no spell.
    untap(game, eye);
    activate(game, eye, 0);
    expect(() => cast(game, toHand(game, "Mind Stone"), { altCost: true })).toThrow(/cost|alternative|free/i);
  });
});

describe("Apex Observatory: the next spell of the chosen type is free", () => {
  it("the next creature spell is cast for nothing, once; another type never", () => {
    const { game, a } = table();
    const { eye } = craft(game, a, [toGraveyard(game, "Ornithopter"), toGraveyard(game, "Grizzly Bears")]);
    untap(game, eye);
    activate(game, eye, 0);
    // An artifact that isn't a creature isn't of the chosen type.
    expect(() => cast(game, toHand(game, "Mind Stone"), { altCost: true })).toThrow(/cost|alternative|free/i);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { altCost: true });
    expect(zone(game, bears)).toBe("battlefield");
    // Used up: the next creature costs its mana again.
    expect(() => cast(game, toHand(game, "Grizzly Bears"), { altCost: true })).toThrow(/cost|alternative|free/i);
  });

  it("the type is fixed as the ability resolves, even once the Observatory has left", () => {
    const { game, a } = table();
    const { eye } = craft(game, a, [toGraveyard(game, "Ornithopter"), toGraveyard(game, "Grizzly Bears")]);
    untap(game, eye);
    activate(game, eye, 0);
    game.debugMove(eye, "graveyard");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { altCost: true });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("ofChosenCardType reads the source's chosen card type, and matches nothing without one", () => {
    const { game } = table();
    const observatory = spawn(game, "Apex Observatory");
    const bears = spawn(game, "Grizzly Bears");
    const stone = spawn(game, "Mind Stone");
    const reg = registryOf(game);
    expect(matchesFilter(game.state, reg, bears, { ofChosenCardType: true }, { you: A, source: observatory })).toBe(false);
    game.state.objects[observatory].chosenOnEnter = "creature";
    invalidateComputedCache();
    expect(matchesFilter(game.state, reg, bears, { ofChosenCardType: true }, { you: A, source: observatory })).toBe(true);
    expect(matchesFilter(game.state, reg, stone, { ofChosenCardType: true }, { you: A, source: observatory })).toBe(false);
    expect(matchesFilter(game.state, reg, bears, { ofChosenCardType: true }, { you: A })).toBe(false);
  });
});
