/**
 * "If you didn't play a card from exile this turn" (Visions of Phyrexia): a
 * spell cast from exile (`cast-this-turn`'s `castFrom: "exile"`) or a land
 * played from exile (`turn-history`'s `lands-played` with `from:
 * ["exile"]`), whatever permission let it — no new engine code.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, lands, nextTurn, settle, spawn, table, tokensNamed, toHand, toLibrary, toStep, zone } from "./harness.js";

/** Alice's next turn's main phase, `top` the card her upkeep exiles. */
const toHerUpkeepExiling = (game: Game, top: string): ObjectId => {
  nextTurn(game);
  const card = toLibrary(game, top);
  nextTurn(game);
  expect(zone(game, card)).toBe("exile");
  return card;
};

const powerstones = (game: Game): number => tokensNamed(game, "Powerstone Token", A);

describe("Visions of Phyrexia", () => {
  it("nothing played from exile: a tapped Powerstone at the end step", () => {
    const { game } = table();
    spawn(game, "Visions of Phyrexia");
    toHerUpkeepExiling(game, "Lightning Bolt");
    const before = powerstones(game);
    toStep(game, "end");
    settle(game);
    expect(powerstones(game)).toBe(before + 1);
    // Turn 1's untapped in this untap step; this one came in tapped.
    const stones = Object.values(game.state.objects).filter(
      (o) => o.zone === "battlefield" && o.cardName === "Powerstone Token",
    );
    expect(stones.some((o) => o.tapped === true)).toBe(true);
  });

  it("a spell cast from your hand doesn't count", () => {
    const { game } = table();
    spawn(game, "Visions of Phyrexia");
    toHerUpkeepExiling(game, "Lightning Bolt");
    const before = powerstones(game);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    toStep(game, "end");
    settle(game);
    expect(powerstones(game)).toBe(before + 1);
  });

  it("the exiled card cast: no Powerstone", () => {
    const { game } = table();
    spawn(game, "Visions of Phyrexia");
    const bolt = toHerUpkeepExiling(game, "Lightning Bolt");
    const before = powerstones(game);
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [{ kind: "player", player: B }], via: "impulse" });
    expect(zone(game, bolt)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(powerstones(game)).toBe(before);
  });

  it("a land played from exile: no Powerstone", () => {
    const { game } = table();
    spawn(game, "Visions of Phyrexia");
    const land = toHerUpkeepExiling(game, "Mountain");
    const before = powerstones(game);
    game.dispatch({ type: "play-land", player: A, card: land });
    expect(zone(game, land)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(powerstones(game)).toBe(before);
  });
});
