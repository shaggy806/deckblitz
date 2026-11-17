/**
 * Tomik, Distinguished Advokist: "Your opponents can't play land cards from
 * graveyards" — a `play-land` prohibition `from: ["graveyard"]` for opponents,
 * which beats a permission to play them (Crucible of Worlds; rule 101.2) —
 * and "Lands on the battlefield and land cards in graveyards can't be the
 * targets of spells or abilities your opponents control": two `be-targeted`
 * prohibitions by opponents, every player's lands and land cards, not a land
 * card in exile.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, ref, spawn, table, toGraveyard, toHand, toStep } from "./harness.js";

const canPlay = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((l) => l.kind === "play-land" && l.card === card);

/** Bob's main phase, priority his. */
const bobsTurn = (game: Game): void => toStep(game, "precombat-main", B);

describe("Tomik: opponents can't play land cards from graveyards", () => {
  it("an opponent's Crucible of Worlds doesn't let them; without Tomik it does", () => {
    const { game } = table();
    for (const p of [A, B]) game.state.zones.perPlayer[p].hand = [];
    const tomik = spawn(game, "Tomik, Distinguished Advokist");
    spawn(game, "Crucible of Worlds", B);
    const forest = toGraveyard(game, "Forest", B);
    bobsTurn(game);
    expect(canPlay(game, B, forest)).toBe(false);
    expect(() => game.dispatch({ type: "play-land", player: B, card: forest })).toThrow();
    game.debugMove(tomik, "graveyard");
    expect(canPlay(game, B, forest)).toBe(true);
  });

  it("its controller still plays lands from their graveyard, and from hand everyone does", () => {
    const { game } = table();
    for (const p of [A, B]) game.state.zones.perPlayer[p].hand = [];
    spawn(game, "Tomik, Distinguished Advokist");
    spawn(game, "Crucible of Worlds");
    const forest = toGraveyard(game, "Forest");
    expect(canPlay(game, A, forest)).toBe(true);
    const fromHand = toHand(game, "Forest", B);
    bobsTurn(game);
    expect(canPlay(game, B, fromHand)).toBe(true);
  });
});

describe("Tomik: lands and land cards in graveyards can't be targeted by opponents", () => {
  it("an opponent's Stone Rain can't target any land, its own included; once Tomik has gone it can", () => {
    const { game } = table();
    for (const p of [A, B]) game.state.zones.perPlayer[p].hand = [];
    const tomik = spawn(game, "Tomik, Distinguished Advokist");
    const mine = lands(game, "Plains", 1)[0];
    const theirs = lands(game, "Mountain", 4, B);
    bobsTurn(game);
    expect(() => cast(game, toHand(game, "Stone Rain", B), { player: B, targets: [ref(mine)] })).toThrow(/target/i);
    expect(() => cast(game, toHand(game, "Stone Rain", B), { player: B, targets: [ref(theirs[3])] })).toThrow(/target/i);
    game.debugMove(tomik, "graveyard");
    cast(game, toHand(game, "Stone Rain", B), { player: B, targets: [ref(mine)] });
    expect(game.state.objects[mine].zone).toBe("graveyard");
  });

  it("its controller's Stone Rain can target an opponent's land", () => {
    const { game } = table();
    for (const p of [A, B]) game.state.zones.perPlayer[p].hand = [];
    spawn(game, "Tomik, Distinguished Advokist");
    lands(game, "Mountain", 3);
    const theirs = lands(game, "Mountain", 1, B)[0];
    cast(game, toHand(game, "Stone Rain"), { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].zone).toBe("graveyard");
  });

  it("an opponent can't target a land card in a graveyard, but can a nonland card there", () => {
    const { game } = table();
    for (const p of [A, B]) game.state.zones.perPlayer[p].hand = [];
    spawn(game, "Tomik, Distinguished Advokist");
    lands(game, "Forest", 2, B);
    const land = toGraveyard(game, "Forest", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    bobsTurn(game);
    expect(() => cast(game, toHand(game, "Regrowth", B), { player: B, targets: [ref(land)], settle: false })).toThrow(/target/i);
    cast(game, toHand(game, "Regrowth", B), { player: B, targets: [ref(bears)] });
    expect(game.state.objects[bears].zone).toBe("hand");
  });

  it("its controller can target land cards in graveyards", () => {
    const { game } = table();
    for (const p of [A, B]) game.state.zones.perPlayer[p].hand = [];
    spawn(game, "Tomik, Distinguished Advokist");
    lands(game, "Forest", 2);
    const land = toGraveyard(game, "Forest");
    cast(game, toHand(game, "Regrowth"), { targets: [ref(land)] });
    expect(game.state.objects[land].zone).toBe("hand");
  });
});
