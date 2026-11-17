/**
 * "During each player's turn, that player may cast a spell from among the
 * cards **they don't own** exiled with [this], and mana of any type can be
 * spent to cast it" (Ian Malcolm, Chaotician): a static `mayPlay` every
 * player holds (`eachPlayer`, `yourTurnOnly`, `linked`), its `filter` read
 * from the casting player's side (`ownedBy: "opponent"`), with `spendAs:
 * "any-type"` (rule 609.4b) — colorless mana pays a red pip. The cards come
 * from "whenever a player draws their second card each turn, that player
 * exiles the top card of their library", exiled with Ian (rule 607.2a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, life, nextTurn, ref, settle, spawn, table, toLibrary, zone } from "./harness.js";

const castable = (game: Game, player: PlayerId, card: ObjectId): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);
const draw = (game: Game, player: PlayerId): void => {
  game.debugApplyEffect(player, { kind: "draw", amount: 1 });
  settle(game);
};

describe("Ian Malcolm, Chaotician", () => {
  it("a second draw exiles the drawer's top card with Ian; each player casts the ones they don't own on their own turn, with mana of any type", () => {
    const { game } = table();
    const ian = spawn(game, "Ian Malcolm, Chaotician");
    // Alice drew her first card in her draw step; this is her second.
    const aliceShock = toLibrary(game, "Shock", A);
    toLibrary(game, "Wastes", A);
    draw(game, A);
    expect(zone(game, aliceShock)).toBe("exile");
    expect(game.state.objects[aliceShock].exiledWith?.source).toBe(ian);
    // Her own card: not hers to cast.
    lands(game, "Mountain", 1);
    expect(castable(game, A, aliceShock)).toBe(false);
    // A third draw that turn exiles nothing more.
    const third = game.state.zones.perPlayer[A].library[1];
    draw(game, A);
    expect(zone(game, third)).toBe("library");

    // Bob's turn: his second draw exiles his top card.
    nextTurn(game);
    expect(game.activePlayer).toBe(B);
    const bobBolt = toLibrary(game, "Lightning Bolt", B);
    toLibrary(game, "Wastes", B);
    draw(game, B);
    expect(zone(game, bobBolt)).toBe("exile");
    expect(castable(game, B, bobBolt)).toBe(false);
    // Alice's Shock, with Bob's one Wastes: colorless mana pays its {R}.
    // (Mana of any color would too: the next test tells the two apart.)
    lands(game, "Wastes", 1, B);
    expect(castable(game, B, aliceShock)).toBe(true);
    // Not Alice's turn: Bob's Bolt isn't hers to cast now.
    lands(game, "Mountain", 1);
    expect(castable(game, A, bobBolt)).toBe(false);
    cast(game, aliceShock, { player: B, via: "impulse", targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
    expect(game.state.zones.perPlayer[A].graveyard).toContain(aliceShock);

    // Alice's next turn: Bob's Bolt is hers to cast.
    nextTurn(game);
    expect(game.activePlayer).toBe(A);
    expect(castable(game, A, bobBolt)).toBe(true);
  });

  it("mana of any type: red mana pays a {C} pip, which mana of any color wouldn't", () => {
    const { game } = table();
    spawn(game, "Ian Malcolm, Chaotician");
    const reshaper = toLibrary(game, "Matter Reshaper", A);
    toLibrary(game, "Wastes", A);
    draw(game, A);
    expect(zone(game, reshaper)).toBe("exile");
    nextTurn(game);
    lands(game, "Mountain", 3, B);
    expect(castable(game, B, reshaper)).toBe(true);
    cast(game, reshaper, { player: B, via: "impulse" });
    expect(zone(game, reshaper)).toBe("battlefield");
    expect(game.state.objects[reshaper].controller).toBe(B);
  });

  it("once Ian leaves, the cards exiled with it can't be cast", () => {
    const { game } = table();
    const ian = spawn(game, "Ian Malcolm, Chaotician");
    nextTurn(game);
    const bobBolt = toLibrary(game, "Lightning Bolt", B);
    toLibrary(game, "Wastes", B);
    draw(game, B);
    expect(zone(game, bobBolt)).toBe("exile");
    nextTurn(game);
    lands(game, "Mountain", 1);
    expect(castable(game, A, bobBolt)).toBe(true);
    game.debugMove(ian, "graveyard");
    expect(castable(game, A, bobBolt)).toBe(false);
  });
});
