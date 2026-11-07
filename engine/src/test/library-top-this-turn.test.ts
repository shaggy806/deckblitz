/**
 * The library-top permissions for a while — a `player-effect`'s
 * `looksAtOwnLibraryTop`, `playFromLibraryTop` and `castFromLibraryTop`
 * (rule 601.3): "until end of turn, you may look at the top card of your
 * library any time, and you may play lands and cast spells from the top of
 * your library" (The Belligerent), and with `payLifeManaValue`, "if you cast
 * a spell this way, pay life equal to its mana value rather than pay its mana
 * cost" (Gwenom, Remorseless — an alternative cost, rule 118.9).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, activate, attack, cast, destroy, lands, life, nextTurn, spawn, table, toLibrary, toStep, tokensNamed, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
const landOffer = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "play-land" && a.card === card);

describe("Gwenom, Remorseless", () => {
  it("after it attacks, the top card is seen and cast for life equal to its mana value, and no other way", () => {
    const { game, a } = table();
    const gwenom = spawn(game, "Gwenom, Remorseless");
    const forests = lands(game, "Forest", 4);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(offers(game, bears)).toEqual([]);
    expect(game.viewFor(A).revealedLibraryTop[A]).toBeNull();
    attack(game, a, [gwenom]);
    expect(game.viewFor(A).revealedLibraryTop[A]).toBe(bears);
    const [offer, ...rest] = offers(game, bears);
    expect(rest).toEqual([]);
    expect(offer.via).toBe("library-top");
    expect(offer.altCostText).toBe("pay 2 life");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "library-top" })).toMatch(
      /only by paying life/,
    );
    const lifeAfterCombat = life(game, A);
    cast(game, bears, { via: "library-top", altCost: true });
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(lifeAfterCombat - 2);
    expect(forests.some((id) => game.state.objects[id].tapped === true)).toBe(false);
  });

  it("plays a land off the top with the land drop, and lasts though Gwenom has gone", () => {
    const { game, a } = table();
    const gwenom = spawn(game, "Gwenom, Remorseless");
    attack(game, a, [gwenom]);
    destroy(game, gwenom);
    const forest = toLibrary(game, "Forest");
    expect(landOffer(game, forest)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    const bears = toLibrary(game, "Grizzly Bears");
    expect(offers(game, bears).map((o) => o.altCostText)).toEqual(["pay 2 life"]);
  });

  it("is gone at end of turn", () => {
    const { game, a } = table();
    const gwenom = spawn(game, "Gwenom, Remorseless");
    attack(game, a, [gwenom]);
    nextTurn(game);
    toStep(game, "precombat-main", A);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(offers(game, bears)).toEqual([]);
    expect(game.viewFor(A).revealedLibraryTop[A]).toBeNull();
  });
});

describe("The Belligerent", () => {
  it("crewed and attacking: a Treasure, and the top card played or cast for its ordinary cost", () => {
    const { game, a } = table();
    const belligerent = spawn(game, "The Belligerent");
    spawn(game, "Hill Giant");
    activate(game, belligerent, 0);
    const forests = lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(offers(game, bears)).toEqual([]);
    attack(game, a, [belligerent]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(game.viewFor(A).revealedLibraryTop[A]).toBe(bears);
    const [offer, ...rest] = offers(game, bears);
    expect(rest).toEqual([]);
    expect(offer.altCost).toBeUndefined();
    const before = life(game, A);
    cast(game, bears, { via: "library-top" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(before);
    expect(forests.every((id) => game.state.objects[id].tapped === true)).toBe(true);
  });
});
