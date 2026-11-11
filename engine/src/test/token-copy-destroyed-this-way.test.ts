/**
 * "For each artifact destroyed this way, create a token that's a copy of it"
 * (Red Sun's Twilight): a `create-token-copy` of `{ thisWay: "destroyed" }`
 * copies each permanent as it last existed on the battlefield (rule 608.2h)
 * — a destroyed token included, which is no card to copy — and only what was
 * actually destroyed.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, keywords, lands, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

/** `player`'s tokens on the battlefield that are (copies of) `name`. */
const tokens = (game: Game, name: string, player: PlayerId): ObjectId[] =>
  game.battlefield.filter((id) => {
    const o = game.state.objects[id];
    return o.isToken === true && o.controller === player && (o.copyOf ?? o.cardName) === name;
  });

const treasure = (game: Game, player: PlayerId): ObjectId => {
  game.debugApplyEffect(player, { kind: "create-token", token: "Treasure Token", count: 1 });
  return tokens(game, "Treasure Token", player)[0];
};

describe("Red Sun's Twilight", () => {
  it("X is 5: copies what was destroyed — a token too, not the indestructible one — with haste, exiled at the end step", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    const thopter = spawn(game, "Ornithopter", B);
    const gold = treasure(game, B);
    const citadel = spawn(game, "Darksteel Citadel", B);
    cast(game, toHand(game, "Red Sun's Twilight"), { x: 5, targets: [ref(thopter), ref(gold), ref(citadel)] });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, citadel)).toBe("battlefield");
    expect(tokens(game, "Treasure Token", B)).toEqual([]);
    // Yours: "create a token".
    const copies = tokens(game, "Ornithopter", A);
    expect(copies.length).toBe(1);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    expect(tokens(game, "Treasure Token", A).length).toBe(1);
    expect(tokens(game, "Darksteel Citadel", A)).toEqual([]);
    nextTurn(game);
    expect(tokens(game, "Ornithopter", A)).toEqual([]);
    expect(tokens(game, "Treasure Token", A)).toEqual([]);
  });

  it("X is 4: destroys, and makes nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const thopter = spawn(game, "Ornithopter", B);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Red Sun's Twilight"), { x: 4, targets: [ref(thopter), ref(ring)] });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(game.battlefield.filter((id) => game.state.objects[id].isToken === true)).toEqual([]);
  });
});

describe("a token copy of each permanent destroyed this way", () => {
  it("untargeted: each as it last existed, under its last controller without a `who`", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter", B);
    treasure(game, B);
    spawn(game, "Sol Ring");
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        { kind: "destroy-all", filter: { type: "artifact" } },
        { kind: "create-token-copy", of: { thisWay: "destroyed" }, count: 1 },
      ],
    });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(tokens(game, "Ornithopter", B).length).toBe(1);
    expect(tokens(game, "Treasure Token", B).length).toBe(1);
    expect(tokens(game, "Sol Ring", A).length).toBe(1);
  });
});
