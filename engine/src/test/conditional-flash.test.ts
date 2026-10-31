/**
 * A spell's own conditional flash (`CardDefinition.flashIf`): "you may cast
 * this spell as though it had flash if you control a Human" / "this spell has
 * flash as long as you control a Merfolk" — a condition read as the cast
 * begins (rule 601.3d) — and "…if it targets a permanent you control" / "…if
 * it targets a commander", judged on the targets chosen (rules 601.3b,
 * 601.6). Hungering Yeti, Crashing Tide, Swift Reckoning, Flash Photography,
 * Timely Ward.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const castOffers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

/** Alice in her upkeep, holding priority — a time only an instant (or
 * something that may be cast as one) can be cast. */
const atInstantSpeed = () => table({ step: "upkeep" });

describe("flashIf with a condition (rule 601.3d)", () => {
  it("Hungering Yeti: castable in the upkeep only while its caster controls a green or blue permanent", () => {
    const { game } = atInstantSpeed();
    lands(game, "Mountain", 5);
    const yeti = toHand(game, "Hungering Yeti");
    expect(castOffers(game, yeti)).toHaveLength(0);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: yeti, targets: [] })).toMatch(/sorcery|main phase|stack/i);
    // A blue permanent of an opponent's doesn't count: "you control".
    spawn(game, "Island", B);
    spawn(game, "Coral Merfolk", B);
    expect(castOffers(game, yeti)).toHaveLength(0);
    spawn(game, "Coral Merfolk", A);
    expect(castOffers(game, yeti)).toHaveLength(1);
    cast(game, yeti);
    expect(zone(game, yeti)).toBe("battlefield");
  });

  it("Crashing Tide: \"has flash as long as you control a Merfolk\" — the cast at instant speed bounces and draws", () => {
    const { game } = atInstantSpeed();
    lands(game, "Island", 3);
    const tide = toHand(game, "Crashing Tide");
    const bear = spawn(game, "Grizzly Bears", B);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: tide, targets: [ref(bear)] })).not.toBeNull();
    spawn(game, "Coral Merfolk", A);
    const before = hand(game).length;
    cast(game, tide, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("hand");
    // Crashing Tide left the hand, a card was drawn.
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toContain(tide);
  });

  it("Swift Reckoning: spell mastery counts instant and sorcery cards in its caster's graveyard", () => {
    const { game } = atInstantSpeed();
    lands(game, "Plains", 2);
    const reckoning = toHand(game, "Swift Reckoning");
    const bear = spawn(game, "Grizzly Bears", B, { tapped: true });
    toGraveyard(game, "Lightning Bolt");
    // Bob's graveyard isn't "your graveyard".
    toGraveyard(game, "Lightning Bolt", B);
    toGraveyard(game, "Grizzly Bears");
    expect(castOffers(game, reckoning)).toHaveLength(0);
    toGraveyard(game, "Divination");
    expect(castOffers(game, reckoning)).toHaveLength(1);
    cast(game, reckoning, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("sorcery timing needs no condition: in the main phase it's cast like any sorcery", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const yeti = toHand(game, "Hungering Yeti");
    expect(castOffers(game, yeti)).toHaveLength(1);
    cast(game, yeti);
    expect(zone(game, yeti)).toBe("battlefield");
  });

  it("the condition is read for the caster: on an opponent's turn, Bob's own Merfolk lets him cast his Crashing Tide", () => {
    const { game } = table();
    lands(game, "Island", 3, B);
    const tide = toHand(game, "Crashing Tide", B);
    const bear = spawn(game, "Grizzly Bears", A);
    // Bob gets priority in Alice's upkeep of her next turn.
    toStep(game, "upkeep", B);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: tide, targets: [ref(bear)] })).not.toBeNull();
    spawn(game, "Coral Merfolk", B);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: tide, targets: [ref(bear)] })).toBeNull();
  });
});

describe("flashIf with targets (rules 601.3b, 601.6)", () => {
  it("Flash Photography at instant speed: offered with only its caster's own permanents", () => {
    const { game } = atInstantSpeed();
    const islands = lands(game, "Island", 4);
    const photo = toHand(game, "Flash Photography");
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Serra Angel", B);
    const offers = castOffers(game, photo);
    expect(offers).toHaveLength(1);
    const options = offers[0].targetOptions[0].map((t) => (t.kind === "object" ? t.object : null));
    expect(options).toContain(mine);
    expect(options).toContain(islands[0]);
    expect(options).not.toContain(theirs);
    // A target an opponent controls makes the cast illegal (rule 601.6).
    expect(game.canDispatch({ type: "cast-spell", player: A, card: photo, targets: [ref(theirs)] })).not.toBeNull();
    cast(game, photo, { targets: [ref(mine)] });
    expect(named(game, "Grizzly Bears", A)).toHaveLength(2);
  });

  it("Flash Photography at sorcery timing copies an opponent's permanent: every target is offered", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const photo = toHand(game, "Flash Photography");
    const theirs = spawn(game, "Serra Angel", B);
    const options = castOffers(game, photo)[0].targetOptions[0].map((t) => (t.kind === "object" ? t.object : null));
    expect(options).toContain(theirs);
    cast(game, photo, { targets: [ref(theirs)] });
    expect(named(game, "Serra Angel", A)).toHaveLength(1);
  });

  it("Flash Photography's flashback from the graveyard keeps the permission", () => {
    const { game } = atInstantSpeed();
    lands(game, "Island", 6);
    const photo = toGraveyard(game, "Flash Photography");
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Serra Angel", B);
    const flashback = castOffers(game, photo).filter((o) => o.via === "flashback");
    expect(flashback).toHaveLength(1);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: photo, via: "flashback", targets: [ref(theirs)] })).not.toBeNull();
    cast(game, photo, { via: "flashback", targets: [ref(mine)] });
    expect(zone(game, photo)).toBe("exile");
    expect(named(game, "Grizzly Bears", A)).toHaveLength(2);
  });

  it("Timely Ward: at instant speed only onto a commander — any player's", () => {
    const { game } = atInstantSpeed();
    lands(game, "Plains", 3);
    const ward = toHand(game, "Timely Ward");
    const bear = spawn(game, "Grizzly Bears", A);
    const theirCommander = spawn(game, "Serra Angel", B);
    // No commander on the battlefield: no target could allow it, so it isn't offered.
    expect(castOffers(game, ward)).toHaveLength(0);
    game.state.objects[theirCommander].isCommander = true;
    const offers = castOffers(game, ward);
    expect(offers).toHaveLength(1);
    expect(offers[0].targetOptions[0]).toEqual([ref(theirCommander)]);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: ward, targets: [ref(bear)] })).not.toBeNull();
    cast(game, ward, { targets: [ref(theirCommander)] });
    settle(game);
    expect(keywords(game, theirCommander).has("indestructible")).toBe(true);
  });

  it("Timely Ward at sorcery timing enchants any creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const ward = toHand(game, "Timely Ward");
    const bear = spawn(game, "Grizzly Bears", A);
    cast(game, ward, { targets: [ref(bear)] });
    expect(keywords(game, bear).has("indestructible")).toBe(true);
  });
});
