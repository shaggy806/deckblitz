/**
 * "…a token that's a copy of Jace, except it's not legendary and **its
 * starting loyalty is 1**" (Jace, Mirror Mage): `CopyExceptions.loyalty`, a
 * copiable value (rule 707.9b) read as the copy enters in place of the printed
 * loyalty (306.5b).
 *
 * - not kicked: no token, and Jace enters with 4;
 * - kicked: a nonlegendary token with one loyalty counter beside him;
 * - something entering as a copy of the token has starting loyalty 1 too, and
 *   isn't legendary (Spark Double, with its own additional counter: 2), while
 *   a copy of Jace himself has 4 (Spark Double: 5);
 * - the token isn't kicked: it makes no token;
 * - "0: Draw a card and reveal it. Remove a number of loyalty counters equal
 *   to that card's mana value from Jace": from whichever Jace it is, all of
 *   them if the mana value is greater (then he's put into the graveyard).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { cast, counters, hand, lands, loyalty, named, supertypes, table, toHand, toLibrary, zone } from "./harness.js";

const JACE = "Jace, Mirror Mage";

function castJace(game: Game, kicked: boolean): ObjectId {
  lands(game, "Island", kicked ? 5 : 3);
  const jace = toHand(game, JACE);
  cast(game, jace, kicked ? { kicked: true, kickCount: 1 } : {});
  expect(zone(game, jace)).toBe("battlefield");
  return jace;
}

const jaces = (game: Game): readonly ObjectId[] => named(game, JACE);
const tokenOf = (game: Game): ObjectId => {
  const token = jaces(game).find((id) => game.state.objects[id].isToken);
  if (token === undefined) throw new Error("no Jace token");
  return token;
};

describe("Jace, Mirror Mage", () => {
  it("not kicked, enters with 4 loyalty and makes no token", () => {
    const { game } = table();
    const jace = castJace(game, false);
    expect(counters(game, jace, "loyalty")).toBe(4);
    expect(jaces(game)).toEqual([jace]);
  });

  it("kicked, makes a nonlegendary token copy with starting loyalty 1", () => {
    const { game } = table();
    const jace = castJace(game, true);
    expect(jaces(game)).toHaveLength(2);
    const token = tokenOf(game);
    expect(counters(game, jace, "loyalty")).toBe(4);
    expect(counters(game, token, "loyalty")).toBe(1);
    expect(supertypes(game, token)).not.toContain("legendary");
    expect(supertypes(game, jace)).toContain("legendary");
    // Both stay (the legend rule sees one legendary Jace), and the token,
    // not kicked, made no token of its own.
    expect(zone(game, jace)).toBe("battlefield");
    expect(zone(game, token)).toBe("battlefield");
  });

  it("a copy of the token has starting loyalty 1 too; a copy of Jace has 4", () => {
    const { game, a } = table();
    const jace = castJace(game, true);
    const token = tokenOf(game);
    lands(game, "Island", 8);
    // Spark Double: "…it enters with an additional loyalty counter on it if
    // it's a planeswalker, and it isn't legendary."
    const ofToken = toHand(game, "Spark Double");
    a.chooseCopyFn = () => token;
    cast(game, ofToken);
    expect(zone(game, ofToken)).toBe("battlefield");
    expect(counters(game, ofToken, "loyalty")).toBe(2);
    const ofJace = toHand(game, "Spark Double");
    a.chooseCopyFn = () => jace;
    cast(game, ofJace);
    expect(counters(game, ofJace, "loyalty")).toBe(5);
  });

  it("0: draws and reveals a card, and loses loyalty equal to its mana value", () => {
    const { game } = table();
    const jace = castJace(game, false);
    const bears = toLibrary(game, "Grizzly Bears");
    const before = hand(game).length;
    loyalty(game, jace, 0);
    expect(hand(game)).toContain(bears);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, jace, "loyalty")).toBe(2);
    expect(game.state.eventLog.some((e) => e.type === "cards-revealed" && e.objects.includes(bears))).toBe(true);
  });

  it("a land drawn removes nothing", () => {
    const { game } = table();
    const jace = castJace(game, false);
    toLibrary(game, "Island");
    loyalty(game, jace, 0);
    expect(counters(game, jace, "loyalty")).toBe(4);
    expect(zone(game, jace)).toBe("battlefield");
  });

  it("a mana value greater than his loyalty removes it all, and he's put into the graveyard", () => {
    const { game } = table();
    const jace = castJace(game, true);
    const token = tokenOf(game);
    // The token's own ability: its one counter, not the original's four.
    toLibrary(game, "Grizzly Bears");
    loyalty(game, token, 0);
    expect(jaces(game)).toEqual([jace]);
    expect(counters(game, jace, "loyalty")).toBe(4);
  });
});
