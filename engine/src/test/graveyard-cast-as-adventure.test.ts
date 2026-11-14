/**
 * "When this creature dies, you may cast it from your graveyard **as an
 * Adventure** until the end of your next turn" (Mosswood Dreadknight,
 * Hildibrand Manderville): a `grant-play` over the card that died, whose
 * `spell` filter is judged as the face cast (rule 601.3e), so only the
 * Adventure face — a spell of subtype Adventure (715.3a) — is offered. Cast
 * that way it resolves into exile on an adventure (715.3d), and the creature
 * may then be cast from exile.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, hand, lands, life, named, nextTurn, pt, spawn, table, tokensNamed, zone } from "./harness.js";

type Cast = Extract<LegalAction, { kind: "cast-spell" }>;

const castOffers = (game: Game, card: ObjectId): Cast[] =>
  game.legalActions(A).filter((a): a is Cast => a.kind === "cast-spell" && a.card === card);

describe("cast from the graveyard as an Adventure", () => {
  it("Mosswood Dreadknight: after it dies only Dread Whispers is offered, and it goes on an adventure", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const knight = spawn(game, "Mosswood Dreadknight");
    destroy(game, knight);
    expect(zone(game, knight)).toBe("graveyard");
    const offers = castOffers(game, knight);
    expect(offers.map((o) => [o.face, o.cardName])).toEqual([[1, "Dread Whispers"]]);
    const held = hand(game, A).length;
    const before = life(game, A);
    cast(game, knight, { face: 1, via: "graveyard-permission" });
    expect(hand(game, A).length).toBe(held + 1);
    expect(life(game, A)).toBe(before - 1);
    expect(zone(game, knight)).toBe("exile");
    expect(game.state.objects[knight].onAdventure).toBe(true);
    // From exile it's the creature now (715.3d), cast as usual.
    lands(game, "Forest", 2);
    expect(castOffers(game, knight).map((o) => o.face)).toEqual([0]);
  });

  it("the permission lasts until the end of its controller's next turn, and no longer", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const knight = spawn(game, "Mosswood Dreadknight");
    destroy(game, knight);
    nextTurn(game); // bob's turn: a sorcery isn't castable, but the permission holds
    nextTurn(game); // alice's next turn
    expect(castOffers(game, knight).map((o) => o.face)).toEqual([1]);
    nextTurn(game); // bob's
    nextTurn(game); // alice's turn after that
    expect(castOffers(game, knight)).toEqual([]);
  });

  it("the permission is over the card that died: once it moves again (rule 400.7) it ends", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    const knight = spawn(game, "Mosswood Dreadknight");
    destroy(game, knight);
    // A move out and back is a new object (rule 400.7): the permission ends.
    game.debugMove(knight, "hand");
    game.debugMove(knight, "graveyard");
    expect(castOffers(game, knight)).toEqual([]);
  });

  it("Hildibrand Manderville: Gentleman's Rise from the graveyard, an instant, on an opponent's turn", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Plains", 2);
    const hildibrand = spawn(game, "Hildibrand Manderville");
    destroy(game, hildibrand, B);
    expect(zone(game, hildibrand)).toBe("graveyard");
    nextTurn(game); // bob's turn: an instant, cast from alice's graveyard
    game.advanceUntil((s) => s.priority.holder === A);
    const offers = castOffers(game, hildibrand);
    expect(offers.map((o) => [o.face, o.cardName])).toEqual([[1, "Gentleman's Rise"]]);
    cast(game, hildibrand, { face: 1, via: "graveyard-permission" });
    expect(tokensNamed(game, "Zombie Token")).toBe(1);
    expect(zone(game, hildibrand)).toBe("exile");
    expect(game.state.objects[hildibrand].onAdventure).toBe(true);
  });

  it("Hildibrand Manderville's anthem pumps creature tokens you control", () => {
    const { game } = table();
    spawn(game, "Hildibrand Manderville");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Zombie Token", count: 1 }, []);
    const [zombie] = named(game, "Zombie Token");
    expect(pt(game, zombie)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});
