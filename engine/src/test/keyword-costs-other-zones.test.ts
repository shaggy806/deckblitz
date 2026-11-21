/**
 * Sneak (rule 702.190a), web-slinging (702.188a) and More Than Meets the Eye
 * (702.162a) from a zone a permission lets the card be cast from: each is one
 * more alternative cost of the permission's cast (`altCost`), as blitz and
 * dash are (`blitz-dash-other-zones.test.ts`), with what the keyword adds —
 * the creature returned, the back face up.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, lands, settle, spawn, table, toGraveyard, toLibrary, toStep, zone } from "./harness.js";

/** The offers to cast `card` for an alternative cost. */
const altOffers = (game: Game, card: ObjectId) =>
  game
    .legalActions(A)
    .flatMap((a) => (a.kind === "cast-spell" && a.card === card && a.altCost === true ? [a] : []));

const impulse = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true });
};

const faceName = (game: Game, id: ObjectId): string => {
  const object = game.state.objects[id];
  return object.faces?.[object.face ?? 0] ?? object.cardName;
};

describe("sneak, web-slinging and More Than Meets the Eye from another zone", () => {
  it("sneaks a card exiled with permission to play it: in the declare blockers step, tapped and attacking", () => {
    const g = table();
    const { game } = g;
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const raph = toLibrary(game, "Raphael, the Nightwatcher");
    impulse(game);
    expect(zone(game, raph)).toBe("exile");
    // Three Mountains don't cast it for {2}{R}{R}, and nothing sneaks yet.
    expect(altOffers(game, raph)).toHaveLength(0);
    g.a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    const offers = altOffers(game, raph);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ via: "impulse", altCostText: "sneak {1}{R}{R}", sneakReturn: { object: bears } });
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: raph,
      targets: [],
      via: "impulse",
      altCost: true,
      ...(offers[0].altCostIndex !== undefined ? { altCostIndex: offers[0].altCostIndex } : {}),
      sneakReturn: bears,
    });
    expect(zone(game, bears)).toBe("hand");
    settle(game);
    expect(zone(game, raph)).toBe("battlefield");
    expect(game.state.objects[raph].tapped).toBe(true);
    expect(game.state.objects[raph].attacking).toBe(B);
  });

  it("web-slings the top card of the library under Future Sight, returning the tapped creature named", () => {
    const { game } = table();
    spawn(game, "Future Sight");
    lands(game, "Plains", 3);
    const girl = toLibrary(game, "Amazing Spider-Girl");
    // No tapped creature to return: not offered.
    const untapped = spawn(game, "Grizzly Bears");
    expect(altOffers(game, girl)).toHaveLength(0);
    const first = spawn(game, "Hill Giant", A, { tapped: true });
    const second = spawn(game, "Grizzly Bears", A, { tapped: true });
    const offers = altOffers(game, girl);
    expect(offers.map((o) => o.webSlingingReturn?.object).sort()).toEqual([first, second].sort());
    expect(offers[0]).toMatchObject({ via: "library-top", altCostText: "web-slinging {2}{W}" });
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: girl,
      targets: [],
      via: "library-top",
      altCost: true,
      ...(offers[0].altCostIndex !== undefined ? { altCostIndex: offers[0].altCostIndex } : {}),
      webSlingingReturn: second,
    });
    settle(game);
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, untapped)).toBe("battlefield");
    expect(zone(game, girl)).toBe("battlefield");
  });

  it("casts a card converted from the graveyard under Muldrotha: its back face up, for that cost", () => {
    const { game } = table();
    spawn(game, "Muldrotha, the Gravetide");
    const arcee = toGraveyard(game, "Arcee, Sharpshooter");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    // {R}{W} casts it converted, not for its {1}{R}{W}.
    const all = game.legalActions(A).flatMap((a) => (a.kind === "cast-spell" && a.card === arcee ? [a] : []));
    expect(all).toHaveLength(1);
    const [offer] = all;
    expect(offer).toMatchObject({
      via: "graveyard-permission",
      face: 1,
      altCost: true,
      altCostText: "More Than Meets the Eye {R}{W}",
    });
    game.dispatch({
      type: "cast-spell",
      player: A,
      card: arcee,
      targets: [],
      via: "graveyard-permission",
      face: 1,
      altCost: true,
      ...(offer.altCostIndex !== undefined ? { altCostIndex: offer.altCostIndex } : {}),
      ...(offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
    });
    settle(game);
    expect(zone(game, arcee)).toBe("battlefield");
    expect(faceName(game, arcee)).toBe("Arcee, Acrobatic Coupe");
  });

  it("a transforming card's back face isn't cast under a permission any other way", () => {
    const { game } = table();
    spawn(game, "Muldrotha, the Gravetide");
    const arcee = toGraveyard(game, "Arcee, Sharpshooter");
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: arcee, targets: [], via: "graveyard-permission", face: 1 })).not.toBeNull();
    const faces = game
      .legalActions(A)
      .flatMap((a) => (a.kind === "cast-spell" && a.card === arcee ? [`${a.face ?? 0}${a.altCost === true ? " alt" : ""}`] : []));
    // The front face as an artifact or as a creature (Muldrotha's one of each).
    expect([...new Set(faces)].sort()).toEqual(["0", "1 alt"]);
  });
});
