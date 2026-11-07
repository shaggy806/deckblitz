// One play shared among the cards one effect gave a permission
// (`GameState.permissionGroups`): Locke, Treasure Hunter's "until end of turn,
// you may cast a spell from among those cards" over every player's milled card
// (`grant-graveyard-cast`'s `upTo`), wherever each is — a graveyard, or the
// exile Rest in Peace put it in (rule 701.17c) — and Unlucky Witness's "you may
// play one of those cards" (`impulse-exile`'s `upTo`).

import { describe, expect, it } from "vitest";
import { A, B, attack, cast, destroy, lands, nextTurn, ref, spawn, table, toLibrary, tokensNamed, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const playable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "play-land" && a.card === card);

describe("Locke, Treasure Hunter", () => {
  it("lets one spell be cast from among every player's milled card, and no second", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const locke = spawn(game, "Locke, Treasure Hunter");
    const mine = toLibrary(game, "Lightning Bolt");
    const theirs = toLibrary(game, "Shock", B);
    attack(game, a, [locke]);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(castable(game, mine)).toBe(true);
    expect(castable(game, theirs)).toBe(true);
    cast(game, theirs, { targets: [ref(B)], via: "graveyard-permission" });
    // Cast from another player's graveyard: the caster's spell (rule 108.3).
    expect(zone(game, theirs)).toBe("graveyard");
    expect(castable(game, mine)).toBe(false);
  });

  it("makes a Treasure for a milled land card, which can't be played this way", () => {
    const { game, a } = table();
    const locke = spawn(game, "Locke, Treasure Hunter");
    const forest = toLibrary(game, "Forest");
    attack(game, a, [locke]);
    expect(zone(game, forest)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(playable(game, forest)).toBe(false);
  });

  it("makes no Treasure when no land card was milled", () => {
    const { game, a } = table();
    const locke = spawn(game, "Locke, Treasure Hunter");
    toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Shock", B);
    attack(game, a, [locke]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("shares the one cast with a card Rest in Peace exiled instead (rule 701.17c)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Rest in Peace");
    const locke = spawn(game, "Locke, Treasure Hunter");
    const mine = toLibrary(game, "Lightning Bolt");
    const theirs = toLibrary(game, "Shock", B);
    attack(game, a, [locke]);
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(castable(game, mine)).toBe(true);
    cast(game, mine, { targets: [ref(B)], via: "impulse" });
    expect(castable(game, theirs)).toBe(false);
  });

  it("ends with the turn, and the shared play with it", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const locke = spawn(game, "Locke, Treasure Hunter");
    const mine = toLibrary(game, "Lightning Bolt");
    attack(game, a, [locke]);
    expect(game.state.permissionGroups).toHaveLength(1);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(castable(game, mine)).toBe(false);
    expect(game.state.permissionGroups).toBeUndefined();
  });

  it("gives each attack its own cast", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const locke = spawn(game, "Locke, Treasure Hunter");
    const first = toLibrary(game, "Lightning Bolt");
    attack(game, a, [locke]);
    // A second trigger this turn, as an extra combat's attack would make.
    const second = toLibrary(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "sequence", effects: [
      { kind: "mill", target: "you", amount: 1 },
      { kind: "grant-graveyard-cast", cards: "milled-this-way", upTo: 1 },
    ] }, []);
    cast(game, first, { targets: [ref(B)], via: "graveyard-permission" });
    expect(castable(game, second)).toBe(true);
  });
});

describe("Unlucky Witness", () => {
  it("lets one of the two exiled cards be played: a land played, the spell no longer may be", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const witness = spawn(game, "Unlucky Witness");
    const bolt = toLibrary(game, "Lightning Bolt");
    const forest = toLibrary(game, "Forest");
    destroy(game, witness);
    expect(zone(game, forest)).toBe("exile");
    expect(zone(game, bolt)).toBe("exile");
    expect(castable(game, bolt)).toBe(true);
    expect(playable(game, forest)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    expect(castable(game, bolt)).toBe(false);
  });

  it("a spell cast, the land no longer may be played", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const witness = spawn(game, "Unlucky Witness");
    const bolt = toLibrary(game, "Lightning Bolt");
    const forest = toLibrary(game, "Forest");
    destroy(game, witness);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(playable(game, forest)).toBe(false);
  });
});
