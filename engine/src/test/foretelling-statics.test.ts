/**
 * Foretelling changed by a permanent (rules 702.143a, 116.2h: pay {2} and
 * exile a card with foretell from your hand face down, on your own turn): the
 * `foretelling` static. Ranar the Ever-Watchful's "the first card you foretell
 * each turn costs {0}" (the journal's `foretold`), Cosmos Charger's "costs {1}
 * less and can be done on any player's turn".
 *
 * And Ranar's trigger — "whenever one or more cards are put into exile from
 * your hand or a spell or ability you control exiles one or more permanents
 * from the battlefield": a `put-into-exile` from the hand and a batched
 * `leaves-battlefield` with `byEffectOf`, one ability written as two entries
 * (`sameAbilityAs`), triggering once for one move that does both.
 */

import { describe, expect, it } from "vitest";

import { activePlayerOf } from "../state.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, nextTurn, ref, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const foretell = (game: Game, card: ObjectId, player: PlayerId = A): void => {
  game.dispatch({ type: "foretell", player, card });
};
const offered = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "foretell" && a.card === card);

describe("Ranar the Ever-Watchful — the first card you foretell each turn costs {0}", () => {
  it("the first is free, the second costs {2}", () => {
    const { game } = table();
    spawn(game, "Ranar the Ever-Watchful");
    const first = toHand(game, "Saw It Coming");
    const second = toHand(game, "Saw It Coming");
    expect(offered(game, first)).toBe(true);
    foretell(game, first);
    expect(zone(game, first)).toBe("exile");
    expect(offered(game, second)).toBe(false);
    expect(() => foretell(game, second)).toThrow(/foretell cost/);
    lands(game, "Island", 2);
    foretell(game, second);
    expect(zone(game, second)).toBe("exile");
  });

  it("free again on a later turn", () => {
    const { game } = table();
    spawn(game, "Ranar the Ever-Watchful");
    foretell(game, toHand(game, "Saw It Coming"));
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    const later = toHand(game, "Saw It Coming");
    foretell(game, later);
    expect(zone(game, later)).toBe("exile");
  });

  it("without Ranar, foretelling costs {2}", () => {
    const { game } = table();
    const card = toHand(game, "Saw It Coming");
    expect(offered(game, card)).toBe(false);
    lands(game, "Island", 2);
    expect(offered(game, card)).toBe(true);
  });
});

describe("Ranar the Ever-Watchful — the Spirits", () => {
  it("a card put into exile from your hand (foretold) makes a Spirit", () => {
    const { game } = table();
    spawn(game, "Ranar the Ever-Watchful");
    foretell(game, toHand(game, "Saw It Coming"));
    settle(game);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });

  it("your spell exiling an opponent's creature, or a token, makes a Spirit", () => {
    const { game } = table();
    spawn(game, "Ranar the Ever-Watchful");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    const [spirit] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Spirit Token");
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(spirit!)] });
    // That Spirit gone, another made.
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    expect(game.state.objects[spirit!]?.zone).not.toBe("battlefield");
  });

  it("an opponent's spell exiling your creature makes none", () => {
    const { game } = table();
    spawn(game, "Ranar the Ever-Watchful");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    lands(game, "Plains", 1, B);
    cast(game, toHand(game, "Swords to Plowshares", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
  });

  it("one spell exiling two permanents makes one Spirit", () => {
    const { game } = table();
    spawn(game, "Ranar the Ever-Watchful");
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", A);
    game.debugApplyEffect(A, { kind: "exile-all", filter: { type: "artifact" } }, []);
    settle(game);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });

  it("one move exiling cards from your hand and permanents makes one Spirit", () => {
    const { game } = table();
    spawn(game, "Ranar the Ever-Watchful");
    spawn(game, "Sol Ring", B);
    toHand(game, "Saw It Coming");
    game.debugApplyEffect(
      A,
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile-all", filter: { type: "artifact" } },
          { kind: "exile-graveyard", target: "each-player", fromHand: "also" },
        ],
      },
      [],
    );
    settle(game);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(0);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});

describe("Cosmos Charger", () => {
  it("foretelling costs {1} less", () => {
    const { game } = table();
    spawn(game, "Cosmos Charger");
    const card = toHand(game, "Saw It Coming");
    expect(offered(game, card)).toBe(false);
    lands(game, "Island", 1);
    foretell(game, card);
    expect(zone(game, card)).toBe("exile");
  });

  it("two of them make it {0}", () => {
    const { game } = table();
    spawn(game, "Cosmos Charger");
    spawn(game, "Cosmos Charger");
    const card = toHand(game, "Saw It Coming");
    foretell(game, card);
    expect(zone(game, card)).toBe("exile");
  });

  it("can be done on an opponent's turn, with priority", () => {
    const { game } = table();
    spawn(game, "Cosmos Charger");
    lands(game, "Island", 1);
    const card = toHand(game, "Saw It Coming");
    game.advanceUntil((s) => activePlayerOf(s) === B && s.priority.holder === A);
    foretell(game, card);
    expect(zone(game, card)).toBe("exile");
  });

  it("without it, not on an opponent's turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const card = toHand(game, "Saw It Coming");
    game.advanceUntil((s) => activePlayerOf(s) === B && s.priority.holder === A);
    expect(offered(game, card)).toBe(false);
    expect(() => foretell(game, card)).toThrow(/own turn/);
  });

  it("doesn't touch foretelling itself from the hand (its ruling)", () => {
    const { game } = table();
    const charger = toHand(game, "Cosmos Charger");
    lands(game, "Island", 1);
    expect(offered(game, charger)).toBe(false);
    lands(game, "Island", 1);
    foretell(game, charger);
    expect(zone(game, charger)).toBe("exile");
  });

  it("with Ranar: the first is {0}, then {1}", () => {
    const { game } = table();
    spawn(game, "Cosmos Charger");
    spawn(game, "Ranar the Ever-Watchful");
    foretell(game, toHand(game, "Saw It Coming"));
    const second = toHand(game, "Saw It Coming");
    expect(offered(game, second)).toBe(false);
    lands(game, "Island", 1);
    foretell(game, second);
    expect(zone(game, second)).toBe("exile");
  });
});
