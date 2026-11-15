/**
 * Jorn, God of Winter // Kaldring, the Rimestaff — the old top-500
 * commander that waited on `zone:play-from-graveyard-this-turn-enters-tapped`.
 * Kaldring's "you may play target snow permanent card from your graveyard
 * this turn. If you do, it enters tapped" is a `grant-play` permission kept on
 * the card (rule 400.7) with `play` (a land as the land play, rule 305.1) and
 * the entry replacement both ways (614.1d): `entersTapped` for a permanent
 * spell cast this way, `landsEnterTapped` for a land played this way.
 */

import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, activate, attack, lands, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "cast-spell" | "play-land" }>;

const plays = (game: Game, card: ObjectId, player: PlayerId = A): Offer[] =>
  game.legalActions(player).filter((a): a is Offer => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

/** Plays `card` by its first offer, as the driver would echo it back. */
const playIt = (game: Game, card: ObjectId): void => {
  const [offer] = plays(game, card);
  if (offer === undefined) throw new Error("not offered");
  const fromGraveyard = zone(game, card) === "graveyard";
  const shared = {
    player: A,
    card,
    ...(offer.face !== undefined ? { face: offer.face } : {}),
    ...(offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
  };
  const action: Action =
    offer.kind === "cast-spell"
      ? { type: "cast-spell", targets: [], ...(fromGraveyard ? { via: "graveyard-permission" as const } : {}), ...shared }
      : { type: "play-land", ...shared };
  game.dispatch(action);
  settle(game);
};

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

/** Jorn's card with its back face up, as if Kaldring had been cast (rule 712.8d). */
const kaldringUp = (game: Game): ObjectId => {
  const card = spawn(game, "Jorn, God of Winter");
  game.state.objects[card].face = 1;
  return card;
};

describe("Kaldring, the Rimestaff", () => {
  it("plays a snow creature card from the graveyard this turn, and it enters tapped", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const kaldring = kaldringUp(game);
    const troll = toGraveyard(game, "Icehide Troll");
    expect(plays(game, troll)).toHaveLength(0);
    activate(game, kaldring, 0, { targets: [ref(troll)] });
    playIt(game, troll);
    expect(zone(game, troll)).toBe("battlefield");
    expect(tapped(game, troll)).toBe(true);
  });

  it("a snow land too, as the land play, entering tapped", () => {
    const { game } = table();
    const kaldring = kaldringUp(game);
    const forest = toGraveyard(game, "Snow-Covered Forest");
    activate(game, kaldring, 0, { targets: [ref(forest)] });
    expect(plays(game, forest).map((a) => a.kind)).toEqual(["play-land"]);
    playIt(game, forest);
    expect(zone(game, forest)).toBe("battlefield");
    expect(tapped(game, forest)).toBe(true);
  });

  it("targets only a snow permanent card", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const kaldring = kaldringUp(game);
    const bears = toGraveyard(game, "Grizzly Bears");
    const heart = toGraveyard(game, "Coldsteel Heart");
    expect(() => activate(game, kaldring, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, kaldring, 0, { targets: [ref(heart)] });
    expect(plays(game, heart).length).toBeGreaterThan(0);
  });

  it("the permission lasts this turn only", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const kaldring = kaldringUp(game);
    const troll = toGraveyard(game, "Icehide Troll");
    activate(game, kaldring, 0, { targets: [ref(troll)] });
    expect(plays(game, troll).length).toBeGreaterThan(0);
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(game.state.result.over).toBe(false);
    expect(zone(game, troll)).toBe("graveyard");
    expect(plays(game, troll)).toHaveLength(0);
  });

  it("the same snow card cast from the hand enters untapped", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const troll = toHand(game, "Icehide Troll");
    playIt(game, troll);
    expect(zone(game, troll)).toBe("battlefield");
    expect(tapped(game, troll)).toBe(false);
  });
});

describe("Jorn, God of Winter // Kaldring, the Rimestaff", () => {
  it("cast as its back face, it's Kaldring, a snow artifact, and its ability works", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 4);
    const card = toHand(game, "Jorn, God of Winter");
    const offer = plays(game, card).find((o) => o.face === 1);
    expect(offer).toBeDefined();
    game.dispatch({ type: "cast-spell", player: A, card, targets: [], face: 1 });
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.characteristics(card).types).toEqual(["artifact"]);
    const troll = toGraveyard(game, "Icehide Troll");
    activate(game, card, 0, { targets: [ref(troll)] });
    expect(plays(game, troll).length).toBeGreaterThan(0);
  });


  it("attacking, untaps each snow permanent you control, Jorn itself included, and nothing else", () => {
    const { game, a } = table();
    const jorn = spawn(game, "Jorn, God of Winter");
    const snowForest = spawn(game, "Snow-Covered Forest", A, { tapped: true });
    const heart = spawn(game, "Coldsteel Heart", A, { tapped: true });
    const forest = spawn(game, "Forest", A, { tapped: true });
    const theirs = spawn(game, "Snow-Covered Forest", B, { tapped: true });
    attack(game, a, [jorn]);
    expect(tapped(game, snowForest)).toBe(false);
    expect(tapped(game, heart)).toBe(false);
    expect(tapped(game, jorn)).toBe(false);
    expect(tapped(game, forest)).toBe(true);
    expect(tapped(game, theirs)).toBe(true);
  });
});
