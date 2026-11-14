/**
 * "Choose X. You may choose the same mode more than once." — Doomsday
 * Confluence ({X}{X}{B}): `CastModalSpec.modesX`, exactly X modes, X the
 * spell's own, both announced as it's cast (rule 601.2b). Written from the
 * Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { A, B, cast, hand, lands, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

describe("Doomsday Confluence", () => {
  it("X = 2, the Dalek mode twice: two Daleks, for {2}{2}{B}", () => {
    const { game } = table();
    const card = toHand(game, "Doomsday Confluence");
    const swamps = lands(game, "Swamp", 6);
    cast(game, card, { x: 2, modes: [1, 1] });
    expect(tokensNamed(game, "Dalek Token", A)).toBe(2);
    expect(swamps.filter((id) => game.state.objects[id].tapped).length).toBe(5);
  });

  it("X = 3, each mode once: each player sacrifices a nonartifact creature, a Dalek, and the opponent discards", () => {
    const { game } = table();
    const card = toHand(game, "Doomsday Confluence");
    lands(game, "Swamp", 7);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const relic = spawn(game, "Ornithopter", B);
    toHand(game, "Island", B);
    const before = hand(game, B).length;
    cast(game, card, { x: 3, modes: [2, 1, 0] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    // A nonartifact creature: the Ornithopter isn't one.
    expect(zone(game, relic)).toBe("battlefield");
    expect(tokensNamed(game, "Dalek Token", A)).toBe(1);
    expect(hand(game, B).length).toBe(before - 1);
  });

  it("the cast's X is the number of modes it chose", () => {
    const { game } = table();
    const card = toHand(game, "Doomsday Confluence");
    const swamps = lands(game, "Swamp", 3);
    // One mode is X = 1, {1}{1}{B}, whatever X the cast named.
    cast(game, card, { x: 5, modes: [1] });
    expect(tokensNamed(game, "Dalek Token", A)).toBe(1);
    expect(swamps.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(game.state.objects[card].xValue ?? 1).toBe(1);
  });

  it("is offered with as many modes as the X it can pay for", () => {
    const { game } = table();
    const card = toHand(game, "Doomsday Confluence");
    lands(game, "Swamp", 5);
    const offer = game.legalActions(A).find((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
    expect(offer?.castModal).toMatchObject({ minModes: 0, maxModes: 2, modesX: true, repeatModes: true });
  });

  it("more modes than mana for them is refused", () => {
    const { game } = table();
    const card = toHand(game, "Doomsday Confluence");
    lands(game, "Swamp", 4);
    expect(() => cast(game, card, { x: 2, modes: [1, 1, 1] })).toThrow(/mana|pay|afford/i);
  });
});
