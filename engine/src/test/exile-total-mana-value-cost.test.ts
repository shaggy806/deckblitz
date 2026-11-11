/**
 * "Exile any number of [historic] cards from your graveyard with total mana
 * value N or greater" as an activated ability's cost
 * (`AbilityCost.collectEvidence`'s record: `{ totalManaValue, filter }`): the
 * payment collect evidence makes (rule 701.59a), over the matching cards only,
 * chosen as the cost is paid (602.2b, 601.2h), and no evidence collected — The
 * Capitoline Triad.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, activate, cast, lands, pickFromZone, pt, settle, spawn, table, toGraveyard, toHand, tokensNamed } from "./harness.js";

const offered = (game: Game, triad: ObjectId): boolean =>
  game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === triad);

describe("exile cards with total mana value N or greater, as a cost", () => {
  it("counts only the matching cards: 29 of historic mana value isn't 30", () => {
    const { game } = table();
    const triad = spawn(game, "The Capitoline Triad");
    toGraveyard(game, "Ulamog, the Ceaseless Hunger"); // 10, legendary
    toGraveyard(game, "Kozilek, the Great Distortion"); // 10, legendary
    toGraveyard(game, "Platinum Emperion"); // 8, an artifact
    toGraveyard(game, "Sol Ring"); // 1, an artifact
    toGraveyard(game, "Void Winnower"); // 9, not historic
    expect(offered(game, triad)).toBe(false);
    toGraveyard(game, "Sol Ring");
    expect(offered(game, triad)).toBe(true);
  });

  it("exiles the chosen cards and makes the emblem; it collects no evidence", () => {
    const { game, a } = table();
    const triad = spawn(game, "The Capitoline Triad");
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Surveillance Monitor"); // "Whenever you collect evidence, create a Thopter"
    const ulamog = toGraveyard(game, "Ulamog, the Ceaseless Hunger");
    const kozilek = toGraveyard(game, "Kozilek, the Great Distortion");
    const emperion = toGraveyard(game, "Platinum Emperion");
    const battlesphere = toGraveyard(game, "Myr Battlesphere"); // 7
    const ring = toGraveyard(game, "Sol Ring");
    const winnower = toGraveyard(game, "Void Winnower");
    const seen = pickFromZone(a, ulamog, kozilek, emperion, battlesphere);
    activate(game, triad);
    settle(game);
    expect(seen.offered).not.toContain(winnower);
    expect(seen.offered).toContain(ring);
    for (const id of [ulamog, kozilek, emperion, battlesphere]) expect(game.state.objects[id].zone).toBe("exile");
    expect(game.state.objects[ring].zone).toBe("graveyard");
    expect(game.state.objects[winnower].zone).toBe("graveyard");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(0);
    expect(game.state.emblems).toHaveLength(1);
    expect(pt(game, bear)).toEqual({ power: 9, toughness: 9 });
    expect(pt(game, triad)).toEqual({ power: 9, toughness: 9 });
  });

  it("refuses a choice whose total falls short", () => {
    const { game } = table();
    const triad = spawn(game, "The Capitoline Triad");
    const ulamog = toGraveyard(game, "Ulamog, the Ceaseless Hunger");
    const kozilek = toGraveyard(game, "Kozilek, the Great Distortion");
    toGraveyard(game, "Platinum Emperion");
    toGraveyard(game, "Myr Battlesphere");
    activate(game, triad, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    // 20 isn't 30.
    expect(() => game.dispatch({ type: "choose-from-zone", player: A, chosen: [ulamog, kozilek] })).toThrow();
    expect(game.state.objects[ulamog].zone).toBe("graveyard");
  });
});

describe("The Capitoline Triad's cost", () => {
  it("is {1} less for each historic card in your graveyard", () => {
    const { game } = table();
    lands(game, "Island", 7);
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Ulamog, the Ceaseless Hunger");
    toGraveyard(game, "Void Winnower"); // not historic
    const triad = toHand(game, "The Capitoline Triad");
    expect(() => cast(game, triad)).toThrow();
    toGraveyard(game, "Platinum Emperion");
    cast(game, triad);
    expect(game.state.objects[triad].zone).toBe("battlefield");
  });
});
