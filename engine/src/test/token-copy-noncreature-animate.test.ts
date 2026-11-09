/**
 * "Create a token that's a copy of it. If the token isn't a creature, it
 * becomes a 2/2 Robot Villain creature in addition to its other types"
 * (Ultron, Artificial Malevolence): `create-token-copy`, then `become`
 * over the token made this way (`thisWay: "created"`) that isn't a creature
 * as this resolves. Not a copy exception — no "except" — so a copy of the
 * token is a plain copy of the artifact (rule 707.2: an effect that isn't a
 * copy effect isn't copied).
 */
import { describe, expect, it } from "vitest";

import { A, cast, enter, lands, named, pickModes, pt, spawn, subtypes, table, toHand, types } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const ULTRON = "Ultron, Artificial Malevolence";

const tokenOf = (game: Game, name: string): ObjectId | undefined =>
  named(game, name, A).find((id) => game.state.objects[id].isToken === true);
const wastes = (game: Game): number =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Wastes" && !game.state.objects[id].tapped).length;

describe("Ultron, Artificial Malevolence", () => {
  it("pays {2} for a token copy of a noncreature artifact, which becomes a 2/2 Robot Villain creature too", () => {
    const { game, a } = table();
    spawn(game, ULTRON);
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    enter(game, "Sol Ring");
    const token = tokenOf(game, "Sol Ring");
    expect(token).toBeDefined();
    if (token === undefined) return;
    expect(wastes(game)).toBe(0);
    expect(types(game, token)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, token)).toEqual(expect.arrayContaining(["Robot", "Villain"]));
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
    // Still a Sol Ring: its mana ability is the copy's.
    expect(game.registry.get(game.state.objects[token].cardName).name).toBe("Sol Ring");
  });

  it("leaves a copy of an artifact creature as it is", () => {
    const { game, a } = table();
    spawn(game, ULTRON);
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    const token = tokenOf(game, "Ornithopter");
    expect(token).toBeDefined();
    if (token === undefined) return;
    expect(pt(game, token)).toEqual({ power: 0, toughness: 2 });
    expect(subtypes(game, token)).not.toContain("Robot");
    expect(subtypes(game, token)).toContain("Thopter");
  });

  it("makes nothing when you decline to pay", () => {
    const { game, a } = table();
    spawn(game, ULTRON);
    lands(game, "Wastes", 2);
    pickModes(a);
    enter(game, "Mind Stone");
    expect(tokenOf(game, "Mind Stone")).toBeUndefined();
    expect(wastes(game)).toBe(2);
  });

  it("animates only the token made this way, not an earlier one", () => {
    const { game, a } = table();
    spawn(game, ULTRON);
    lands(game, "Wastes", 4);
    pickModes(a, 0);
    enter(game, "Mind Stone");
    const first = tokenOf(game, "Mind Stone");
    expect(first).toBeDefined();
    if (first === undefined) return;
    enter(game, "Mind Stone");
    const tokens = named(game, "Mind Stone", A).filter((id) => game.state.objects[id].isToken === true);
    const count = tokens.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(count).toBe(2);
    for (const id of tokens) expect(pt(game, id)).toEqual({ power: 2, toughness: 2 });
  });
});
