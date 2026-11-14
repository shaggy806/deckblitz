/**
 * `PlayTerms.entersTapped`: "if you cast a spell this way, that artifact
 * enters tapped" (Edgar, Master Machinist) — a replacement on the entry of
 * the permanent a spell cast under the permission resolves into (rule
 * 614.1d), or of a land played under it. Kept on the spell
 * (`GameObject.entersTappedAsCast`) only while it's that spell (rule 400.7).
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, attack, cast, lands, nextTurn, pt, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const offered = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Edgar, Master Machinist", () => {
  it("casts an artifact spell from the graveyard, and that artifact enters tapped", () => {
    const { game } = table();
    spawn(game, "Edgar, Master Machinist");
    const ornithopter = toGraveyard(game, "Ornithopter");
    expect(offered(game, ornithopter)).toBe(true);
    cast(game, ornithopter, { via: "graveyard-permission" });
    settle(game);
    expect(zone(game, ornithopter)).toBe("battlefield");
    expect(tapped(game, ornithopter)).toBe(true);
  });

  it("a noncreature artifact too; a nonartifact card isn't offered", () => {
    const { game } = table();
    spawn(game, "Edgar, Master Machinist");
    lands(game, "Plains", 1);
    const ring = toGraveyard(game, "Sol Ring");
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(offered(game, bears)).toBe(false);
    cast(game, ring, { via: "graveyard-permission" });
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(tapped(game, ring)).toBe(true);
  });

  it("once during each of your turns, and not on an opponent's", () => {
    const { game } = table();
    spawn(game, "Edgar, Master Machinist");
    const first = toGraveyard(game, "Ornithopter");
    const second = toGraveyard(game, "Ornithopter");
    cast(game, first, { via: "graveyard-permission" });
    settle(game);
    expect(offered(game, second)).toBe(false);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(offered(game, second)).toBe(false);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    expect(offered(game, second)).toBe(true);
  });

  it("an artifact cast from the hand enters untapped", () => {
    const { game } = table();
    spawn(game, "Edgar, Master Machinist");
    const ornithopter = toHand(game, "Ornithopter");
    cast(game, ornithopter);
    settle(game);
    expect(zone(game, ornithopter)).toBe("battlefield");
    expect(tapped(game, ornithopter)).toBe(false);
  });

  it("Tools: attacking, it gets +X/+0, X the greatest mana value among artifacts you control", () => {
    const { game, a } = table();
    const edgar = spawn(game, "Edgar, Master Machinist");
    spawn(game, "Sol Ring");
    spawn(game, "Ornithopter");
    spawn(game, "Wurmcoil Engine", B);
    attack(game, a, [edgar]);
    expect(pt(game, edgar)).toEqual({ power: 3, toughness: 4 });
  });
});

const ROVER = "Test Tapped Rover";
const rover = defineCard({
  name: ROVER,
  manaCost: "{1}",
  types: ["artifact"],
  text: "You may cast creature spells from your graveyard. If you cast a spell this way, that creature enters tapped.",
  static: [{ affects: { scope: "self" }, mayPlay: { from: "graveyard", filter: { type: "creature" }, entersTapped: true }, text: "" }],
});

describe("entersTapped stays with the spell (rule 400.7)", () => {
  it("an unlimited permission's creature enters tapped; the same card back in hand and cast from there doesn't", () => {
    const { game } = table({ ownRegistry: true });
    game.registry.register(rover);
    spawn(game, ROVER);
    lands(game, "Forest", 6);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, bears, { via: "graveyard-permission", settle: false });
    expect(zone(game, bears)).toBe("stack");
    // Returned to its owner's hand while it's a spell: a new object.
    game.debugMove(bears, "hand");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(tapped(game, bears)).toBe(false);
    const other = toGraveyard(game, "Grizzly Bears");
    cast(game, other, { via: "graveyard-permission" });
    expect(zone(game, other)).toBe("battlefield");
    expect(tapped(game, other)).toBe(true);
  });
});
