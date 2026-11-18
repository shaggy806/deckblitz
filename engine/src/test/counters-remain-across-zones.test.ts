/**
 * "Counters remain on Me as it moves to any zone other than a player's hand
 * or library" — `countersPersistAcrossZones` (Skullbriar's, see
 * `persistent-counters.test.ts`) on Me, the Immortal: its keyword counters
 * and +1/+1 counters go with it to the graveyard and back by its own
 * graveyard cast (two cards discarded), aren't "put" on it there (Doubling
 * Season doesn't double them — its ruling), and count in every zone (a
 * +1/+1 counter makes it a 4/4 in the graveyard — its ruling).
 *
 * Proving card: Me, the Immortal.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  cast,
  destroy,
  hand,
  keywords,
  lands,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const ME = "Me, the Immortal";
const counters = (game: Game, id: ObjectId): Record<string, number> => ({ ...game.state.objects[id].counters });

/** Me on the battlefield, given a counter of each mode picked by its own
 * beginning-of-combat trigger, one combat a turn. */
const grown = (game: Game, a: Parameters<typeof pickModes>[0], ...modes: readonly number[]): ObjectId => {
  const me = spawn(game, ME);
  for (const mode of modes) {
    pickModes(a, mode);
    toStep(game, "begin-combat");
    toStep(game, "end");
  }
  return me;
};

describe("Me, the Immortal", () => {
  it("at the beginning of combat on your turn, puts the counter of your choice on it", () => {
    const { game, a } = table();
    const me = spawn(game, ME);
    pickModes(a, 1);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, me)).toEqual({ "first-strike": 1 });
    expect(keywords(game, me).has("first-strike")).toBe(true);
  });

  it("dies with its counters, a 4/4 in the graveyard, and is cast from there by discarding two, counters and all", () => {
    const { game, a } = table();
    const me = grown(game, a, 0, 3);
    expect(counters(game, me)).toEqual({ "+1/+1": 1, menace: 1 });
    destroy(game, me);
    expect(zone(game, me)).toBe("graveyard");
    expect(counters(game, me)).toEqual({ "+1/+1": 1, menace: 1 });
    expect(pt(game, me)).toEqual({ power: 4, toughness: 4 });

    // Its own graveyard cast at sorcery speed, two cards discarded.
    toStep(game, "precombat-main");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Mountain", 3);
    const discards = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant")];
    a.chooseDiscardsFn = () => discards;
    const before = hand(game).length;
    cast(game, me, { via: "graveyard-permission" });
    expect(discards.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(hand(game)).toHaveLength(before - 2);
    expect(zone(game, me)).toBe("battlefield");
    expect(counters(game, me)).toEqual({ "+1/+1": 1, menace: 1 });
    expect(keywords(game, me).has("menace")).toBe(true);
  });

  it("the counters it keeps aren't put on it: Doubling Season doesn't double them (its ruling)", () => {
    const { game, a } = table();
    const me = grown(game, a, 0);
    spawn(game, "Doubling Season");
    destroy(game, me);
    toStep(game, "precombat-main");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Mountain", 3);
    const discards = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant")];
    a.chooseDiscardsFn = () => discards;
    cast(game, me, { via: "graveyard-permission" });
    expect(zone(game, me)).toBe("battlefield");
    expect(counters(game, me)).toEqual({ "+1/+1": 1 });
  });

  it("to a hand, it loses them", () => {
    const { game, a } = table();
    const me = grown(game, a, 0);
    const bounce = toHand(game, "Unsummon");
    lands(game, "Island", 1);
    cast(game, bounce, { targets: [ref(me)] });
    expect(zone(game, me)).toBe("hand");
    expect(counters(game, me)).toEqual({});
  });
});
