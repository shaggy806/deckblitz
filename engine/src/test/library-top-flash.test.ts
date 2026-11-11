/**
 * "You may cast noncreature spells from the top of your library. If you cast
 * a spell this way, you may cast it as though it had flash" (Elsha of the
 * Infinite): `PlayTerms.flash`, the one thing a permission says about timing
 * (rules 601.3c, 702.8a). It belongs to the permission: the same card under
 * another one (Bolas's Citadel's, for life) keeps a sorcery's timing.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, cast, hand, lands, life, pt, spawn, table, toHand, toLibrary, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

describe("Elsha of the Infinite", () => {
  it("casts a sorcery off the top of the library in her controller's upkeep, and grows", () => {
    const { game } = table({ step: "upkeep" });
    const elsha = spawn(game, "Elsha of the Infinite");
    lands(game, "Island", 3);
    const divination = toLibrary(game, "Divination");
    expect(offers(game, divination).map((o) => o.via)).toEqual(["library-top"]);
    const before = hand(game).length;
    cast(game, divination, { via: "library-top", settle: false });
    // Prowess saw a noncreature spell cast.
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    expect(pt(game, elsha)).toEqual({ power: 4, toughness: 4 });
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.turn.step).toBe("upkeep");
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });

  it("casts an artifact off the top on an opponent's turn", () => {
    const { game } = table();
    spawn(game, "Elsha of the Infinite");
    lands(game, "Island", 1);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A);
    const ring = toLibrary(game, "Sol Ring");
    expect(offers(game, ring)).toHaveLength(1);
    cast(game, ring, { via: "library-top" });
    expect(zone(game, ring)).toBe("battlefield");
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("reaches no creature spell and no land, and gives a card in hand no flash", () => {
    const { game } = table();
    spawn(game, "Elsha of the Infinite");
    lands(game, "Island", 5);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(offers(game, bears)).toEqual([]);
    const island = toLibrary(game, "Island");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === island)).toBe(false);

    const upkeep = table({ step: "upkeep" });
    spawn(upkeep.game, "Elsha of the Infinite");
    lands(upkeep.game, "Island", 5);
    const inHand = toHand(upkeep.game, "Divination");
    expect(offers(upkeep.game, inHand)).toEqual([]);
  });

  it("gives no flash to a cast under another permission: Bolas's Citadel's life payment keeps sorcery timing", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Elsha of the Infinite");
    spawn(game, "Bolas's Citadel");
    lands(game, "Island", 3);
    const divination = toLibrary(game, "Divination");
    // In the upkeep, only Elsha's way: for its mana cost.
    expect(offers(game, divination).map((o) => o.altCost === true)).toEqual([false]);
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: divination, targets: [], via: "library-top", altCost: true }),
    ).not.toBeNull();
    cast(game, divination, { via: "library-top" });
    expect(life(game)).toBe(20);

    // In a main phase, both ways.
    const main = table();
    spawn(main.game, "Elsha of the Infinite");
    spawn(main.game, "Bolas's Citadel");
    lands(main.game, "Island", 3);
    const again = toLibrary(main.game, "Divination");
    expect(offers(main.game, again).map((o) => o.altCost === true).sort()).toEqual([false, true]);
  });

  it("without her, a sorcery on top keeps its timing (Future Sight)", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Future Sight");
    lands(game, "Island", 3);
    const divination = toLibrary(game, "Divination");
    expect(offers(game, divination)).toEqual([]);
  });
});
