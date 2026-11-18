/**
 * Rooting Moloch: "When this creature enters, exile target card with a
 * cycling ability from your graveyard. Until the end of your next turn, you
 * may play that card." An `exile` of a graveyard target with `mayPlay: {
 * duration: "until-end-of-your-next-turn", play: true }` (Practiced
 * Scrollsmith's shape, a land too, with a land play — rule 305.2a). "A cycling
 * ability" is typecycling too (rule 702.29e); the card can't be cycled from
 * exile (its ruling: cycling works only from a hand, 702.29a).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, enter, pickTargets, table, toGraveyard, watchTargets, zone } from "./harness.js";

const playable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => (o.kind === "play-land" || o.kind === "cast-spell") && o.card === card);
const cyclable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((o) => o.kind === "cycle" && o.card === card);

describe("Rooting Moloch", () => {
  it("only a card with cycling (typecycling too) can be targeted", () => {
    const { game, a } = table();
    const steppe = toGraveyard(game, "Secluded Steppe");
    const abomination = toGraveyard(game, "Twisted Abomination");
    toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [abomination]);
    enter(game, "Rooting Moloch");
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([steppe, abomination].sort());
    expect(zone(game, abomination)).toBe("exile");
  });

  it("the exiled land may be played this turn and through your next turn, then no longer; it can't be cycled", () => {
    const { game, a } = table();
    const steppe = toGraveyard(game, "Secluded Steppe");
    pickTargets(a, steppe);
    enter(game, "Rooting Moloch");
    expect(zone(game, steppe)).toBe("exile");
    expect(playable(game, steppe)).toBe(true);
    expect(cyclable(game, steppe)).toBe(false);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    expect(playable(game, steppe)).toBe(true);
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "precombat-main" && s.priority.holder === A);
    expect(playable(game, steppe)).toBe(false);
    expect(zone(game, steppe)).toBe("exile");
  });
});
