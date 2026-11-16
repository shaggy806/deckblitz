/**
 * Which permission a play is made under, when several reach a card outside a
 * graveyard, is the player's choice (rule 601.3: a rule or effect allows it —
 * any of them may be the one). The engine offers a play under each
 * (`Game.playGrantChoices`, the offer's `graveyardGrant` naming its source),
 * and a play naming one is made under that one alone: what it spends, what it
 * costs, and what it brings ("when you do"). The Fourth Doctor's once-each-
 * turn permission and its Food beside Crystal Skull, Isu Spyglass and
 * Courser of Kruphix, which spend nothing.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, lands, settle, spawn, table, tokensNamed } from "./harness.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);
const landOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "play-land" && a.card === card);
const foods = (game: Game): number => tokensNamed(game, "Food Token", A);
const top = (game: Game, name: string): ObjectId => game.debugSpawn(name, A, "library");

describe("The Fourth Doctor alone", () => {
  it("casts one historic spell a turn from the top, and a Food comes with it", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "The Fourth Doctor");
    lands(game, "Wastes", 4);
    const bears = top(game, "Grizzly Bears");
    expect(castOffers(game, bears)).toHaveLength(0);

    const thopter = top(game, "Ornithopter");
    const [offer] = castOffers(game, thopter);
    expect(offer).toBeDefined();
    // One permission reaches it: the offer names none.
    expect(offer).not.toHaveProperty("graveyardGrant");
    game.dispatch({ type: "cast-spell", player: A, card: thopter, targets: [], via: "library-top" });
    settle(game);
    expect(game.state.objects[thopter].zone).toBe("battlefield");
    expect(foods(game)).toBe(1);

    // Used this turn: neither another historic spell nor a historic land.
    const second = top(game, "Ornithopter");
    expect(castOffers(game, second)).toHaveLength(0);
    const cradle = top(game, "Gaea's Cradle");
    expect(landOffers(game, cradle)).toHaveLength(0);
  });

  it("plays a historic land from the top instead, and a Food comes with it", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "The Fourth Doctor");
    const cradle = top(game, "Gaea's Cradle");
    expect(landOffers(game, cradle)).toHaveLength(1);
    game.dispatch({ type: "play-land", player: A, card: cradle });
    settle(game);
    expect(game.state.objects[cradle].zone).toBe("battlefield");
    expect(foods(game)).toBe(1);
    // The once-a-turn play is spent on the land.
    const thopter = top(game, "Ornithopter");
    expect(castOffers(game, thopter)).toHaveLength(0);
  });
});

describe("choosing among permissions that reach the top of a library", () => {
  it("offers a cast under each, the one spending nothing first", () => {
    const { game } = table({ seed: 1 });
    const doctor = spawn(game, "The Fourth Doctor");
    const skull = spawn(game, "Crystal Skull, Isu Spyglass");
    lands(game, "Wastes", 4);
    const thopter = top(game, "Ornithopter");
    const offers = castOffers(game, thopter);
    expect(offers.map((o) => (o.kind === "cast-spell" ? o.graveyardGrant?.source : undefined))).toEqual([skull, doctor]);
  });

  it("under the Doctor's: it's spent and the Food comes; the Skull's stays open", () => {
    const { game } = table({ seed: 1 });
    const doctor = spawn(game, "The Fourth Doctor");
    spawn(game, "Crystal Skull, Isu Spyglass");
    lands(game, "Wastes", 4);
    const first = top(game, "Ornithopter");
    game.dispatch({ type: "cast-spell", player: A, card: first, targets: [], via: "library-top", graveyardGrant: { source: doctor } });
    settle(game);
    expect(game.state.objects[first].zone).toBe("battlefield");
    expect(foods(game)).toBe(1);
    // Only the Skull's reaches the next one now: one offer, naming none.
    const second = top(game, "Ornithopter");
    const offers = castOffers(game, second);
    expect(offers).toHaveLength(1);
    expect(offers[0]).not.toHaveProperty("graveyardGrant");
    game.dispatch({ type: "cast-spell", player: A, card: second, targets: [], via: "library-top" });
    settle(game);
    expect(game.state.objects[second].zone).toBe("battlefield");
    expect(foods(game)).toBe(1);
  });

  it("under the Skull's: no Food, and the Doctor's play is still there", () => {
    const { game } = table({ seed: 1 });
    const doctor = spawn(game, "The Fourth Doctor");
    const skull = spawn(game, "Crystal Skull, Isu Spyglass");
    lands(game, "Wastes", 4);
    const first = top(game, "Ornithopter");
    game.dispatch({ type: "cast-spell", player: A, card: first, targets: [], via: "library-top", graveyardGrant: { source: skull } });
    settle(game);
    expect(game.state.objects[first].zone).toBe("battlefield");
    expect(foods(game)).toBe(0);
    const second = top(game, "Ornithopter");
    game.dispatch({ type: "cast-spell", player: A, card: second, targets: [], via: "library-top", graveyardGrant: { source: doctor } });
    settle(game);
    expect(foods(game)).toBe(1);
  });

  it("a cast naming none is under the one that spends nothing", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "The Fourth Doctor");
    spawn(game, "Crystal Skull, Isu Spyglass");
    lands(game, "Wastes", 4);
    const first = top(game, "Ornithopter");
    game.dispatch({ type: "cast-spell", player: A, card: first, targets: [], via: "library-top" });
    settle(game);
    expect(foods(game)).toBe(0);
  });

  it("a land under Courser's or the Doctor's, each its own offer", () => {
    const { game } = table({ seed: 1 });
    const doctor = spawn(game, "The Fourth Doctor");
    const courser = spawn(game, "Courser of Kruphix");
    const cradle = top(game, "Gaea's Cradle");
    const offers = landOffers(game, cradle);
    expect(offers.map((o) => (o.kind === "play-land" ? o.graveyardGrant?.source : undefined))).toEqual([courser, doctor]);
    game.dispatch({ type: "play-land", player: A, card: cradle, graveyardGrant: { source: doctor } });
    settle(game);
    expect(game.state.objects[cradle].zone).toBe("battlefield");
    expect(foods(game)).toBe(1);
  });

  it("a land only Courser's reaches is one offer naming none", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "The Fourth Doctor");
    spawn(game, "Courser of Kruphix");
    const forest = top(game, "Forest");
    const offers = landOffers(game, forest);
    expect(offers).toHaveLength(1);
    expect(offers[0]).not.toHaveProperty("graveyardGrant");
  });

  it("two of the same permission are one offer", () => {
    const { game } = table({ seed: 1 });
    spawn(game, "Courser of Kruphix");
    spawn(game, "Courser of Kruphix");
    const forest = top(game, "Forest");
    const offers = landOffers(game, forest);
    expect(offers).toHaveLength(1);
    expect(offers[0]).not.toHaveProperty("graveyardGrant");
  });

  it("a play naming a permission that doesn't reach the card is refused", () => {
    const { game } = table({ seed: 1 });
    const doctor = spawn(game, "The Fourth Doctor");
    spawn(game, "Courser of Kruphix");
    const forest = top(game, "Forest");
    expect(() =>
      game.dispatch({ type: "play-land", player: A, card: forest, graveyardGrant: { source: doctor } }),
    ).toThrow();
    expect(game.state.objects[forest].zone).toBe("library");
  });
});
