/**
 * Doc Aurlock, Grizzled Genius: "Spells you cast from your graveyard or from
 * exile cost {2} less to cast" (a cost modification with two cast zones) and
 * "Plotting cards from your hand costs {2} less" (`plotCostReduction`: the
 * plot special action's cost, rule 702.170a / 116.2k, generic mana only,
 * rule 118.7a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, lands, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const plotOffer = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).find((a) => a.kind === "plot" && a.card === card);

const castable = (game: Game, card: ObjectId) =>
  game.legalActions(A).some((l) => l.kind === "cast-spell" && l.card === card);

describe("Doc Aurlock, Grizzled Genius", () => {
  it("plotting a card from your hand costs {2} less", () => {
    const { game } = table();
    spawn(game, "Doc Aurlock, Grizzled Genius");
    const djinn = toHand(game, "Djinn of Fool's Fall");
    lands(game, "Island", 2);
    // Plot {3}{U} becomes {1}{U}: two Islands pay it.
    expect(plotOffer(game, djinn)).toMatchObject({ cost: "{1}{U}" });
    game.dispatch({ type: "plot", player: A, card: djinn });
    expect(zone(game, djinn)).toBe("exile");
    expect(game.state.objects[djinn].plottedOnTurn).toBe(game.state.turn.number);
  });

  it("takes generic mana only, and leaves the coloured part", () => {
    const { game } = table();
    spawn(game, "Doc Aurlock, Grizzled Genius");
    const bandit = toHand(game, "Visage Bandit");
    lands(game, "Island", 1);
    // Plot {2}{U}: the {2} goes, the {U} stays.
    expect(plotOffer(game, bandit)).toMatchObject({ cost: "{U}" });
  });

  it("doesn't reduce an opponent's plotting, nor anything without it", () => {
    const { game } = table();
    spawn(game, "Doc Aurlock, Grizzled Genius", B);
    const djinn = toHand(game, "Djinn of Fool's Fall");
    lands(game, "Island", 2);
    expect(plotOffer(game, djinn)).toBeUndefined();
    lands(game, "Island", 2);
    expect(plotOffer(game, djinn)).toMatchObject({ cost: "{3}{U}" });
  });

  it("spells you cast from your graveyard cost {2} less", () => {
    const { game } = table();
    spawn(game, "Doc Aurlock, Grizzled Genius");
    const divination = toGraveyard(game, "Divination", A);
    game.debugApplyEffect(A, { kind: "grant-play", cards: 0, duration: "end-of-turn" }, [ref(divination)]);
    lands(game, "Island", 1);
    // {2}{U} with one Island: castable only reduced.
    expect(castable(game, divination)).toBe(true);
  });

  it("spells you cast from exile cost {2} less (an Adventurer's creature half)", () => {
    const { game } = table();
    const giant = toHand(game, "Bonecrusher Giant");
    lands(game, "Mountain", 2);
    // Stomp {1}{R} from hand isn't reduced: both Mountains pay it.
    cast(game, giant, { face: 1, targets: [{ kind: "player", player: B }] });
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    spawn(game, "Doc Aurlock, Grizzled Genius");
    lands(game, "Mountain", 1);
    // {2}{R} from exile with one untapped Mountain.
    expect(castable(game, giant)).toBe(true);
    cast(game, giant, { via: "adventure" });
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("without Doc, an exiled Adventurer costs its full mana cost", () => {
    const { game } = table();
    const giant = toHand(game, "Bonecrusher Giant");
    lands(game, "Mountain", 2);
    cast(game, giant, { face: 1, targets: [{ kind: "player", player: B }] });
    settle(game);
    lands(game, "Mountain", 1);
    expect(castable(game, giant)).toBe(false);
  });
});
