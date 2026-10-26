/**
 * "As an additional cost to cast this spell, exile N [creature] cards from
 * your graveyard" (`additionalCost.exileFromGraveyard` — the Skaabs, rule
 * 601.2b): castable only with enough matching cards, never the spell itself;
 * which ones chosen as the cost is paid with the spell on the stack (601.2h),
 * no choice when there's no more than enough; exiled even if it's countered.
 */
import { describe, expect, it } from "vitest";

import { A, cast, graveyard, lands, pickFromZone, table, toGraveyard, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card);

describe("a spell's additional cost of exiling cards from your graveyard", () => {
  it("can't be cast without enough matching cards in the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const drake = toHand(game, "Stitched Drake");
    toGraveyard(game, "Island");
    expect(castable(game, drake)).toBe(false);
    toGraveyard(game, "Grizzly Bears");
    expect(castable(game, drake)).toBe(true);
  });

  it("exiles the only matching card without asking", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const drake = toHand(game, "Stitched Drake");
    const land = toGraveyard(game, "Island");
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, drake);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, drake)).toBe("battlefield");
  });

  it("asks which when there are more than enough, offering only the matching cards", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const goliath = toHand(game, "Skaab Goliath");
    const land = toGraveyard(game, "Island");
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Grizzly Bears");
    const three = toGraveyard(game, "Grizzly Bears");
    const seen = pickFromZone(a, one, three);
    cast(game, goliath);
    expect([...seen.offered].sort()).toEqual([one, two, three].sort());
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, three)).toBe("exile");
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, goliath)).toBe("battlefield");
  });

  it("cast from the graveyard, the card can't pay for itself (Skaab Ruinator)", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const ruinator = toGraveyard(game, "Skaab Ruinator");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    expect(castable(game, ruinator)).toBe(false);
    toGraveyard(game, "Grizzly Bears");
    expect(castable(game, ruinator)).toBe(true);
    const offer = game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === ruinator);
    expect(offer?.kind === "cast-spell" && offer.via).toBe("graveyard-permission");
    cast(game, ruinator, { via: "graveyard-permission" });
    expect(zone(game, ruinator)).toBe("battlefield");
    expect(graveyard(game)).toHaveLength(0);
  });

  it("any six cards for Abhorrent Oculus", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const oculus = toHand(game, "Abhorrent Oculus");
    const cards = [1, 2, 3, 4, 5].map(() => toGraveyard(game, "Island"));
    expect(castable(game, oculus)).toBe(false);
    cards.push(toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Island"));
    pickFromZone(a, ...cards.slice(1));
    cast(game, oculus);
    expect(zone(game, cards[0])).toBe("graveyard");
    expect(cards.slice(1).every((id) => zone(game, id) === "exile")).toBe(true);
  });
});
