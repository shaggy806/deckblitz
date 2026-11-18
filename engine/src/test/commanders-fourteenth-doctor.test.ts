/**
 * The Fourteenth Doctor (top-1000 commander #745): its cast trigger reveals
 * the top fourteen cards and puts the Doctors into the graveyard, then it may
 * enter as a copy of a Doctor card put into your graveyard from your library
 * this turn — "if you do, it gains haste until end of turn"
 * (`CopyOnEnter.gainsHaste`, an additional effect of copying, rule 707.9e).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, cast, graveyard, keywords, lands, nextTurn, pickFromZone, pt, table, toGraveyard, toHand, toLibrary } from "./harness.js";

/** Its mana, a Doctor already in the graveyard (not from the library this
 * turn), and the library's top three: Savannah Lions, The Fifth Doctor,
 * Grizzly Bears. */
function setUp(game: Game): { fifth: ObjectId; eighth: ObjectId; lions: ObjectId; doctor: ObjectId } {
  lands(game, "Plains", 1);
  lands(game, "Island", 1);
  lands(game, "Forest", 1);
  const eighth = toGraveyard(game, "The Eighth Doctor");
  toLibrary(game, "Grizzly Bears");
  const fifth = toLibrary(game, "The Fifth Doctor");
  const lions = toLibrary(game, "Savannah Lions");
  return { fifth, eighth, lions, doctor: toHand(game, "The Fourteenth Doctor") };
}

describe("The Fourteenth Doctor", () => {
  it("mills the revealed Doctors, then enters as a copy of one of them with haste until end of turn", () => {
    const { game, a } = table();
    const { fifth, eighth, lions, doctor } = setUp(game);
    const seen = pickFromZone(a, fifth);
    cast(game, doctor);
    expect(graveyard(game)).toEqual(expect.arrayContaining([fifth, eighth]));
    // The rest went to the bottom: Savannah Lions is no longer on top.
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).not.toBe(lions);
    expect(library).toContain(lions);
    // Only the Doctor put there from the library this turn.
    expect(seen.offered).toEqual([fifth]);
    expect(nameOf(game.state.objects[doctor])).toBe("The Fifth Doctor");
    expect(pt(game, doctor)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, doctor).has("haste")).toBe(true);
    nextTurn(game);
    expect(keywords(game, doctor).has("haste")).toBe(false);
  });

  it("declining the copy, it enters as itself without haste", () => {
    const { game, a } = table();
    const { fifth, doctor } = setUp(game);
    // The cast trigger's "all Doctor cards" first (every one it may), then
    // the copy, declined.
    const asked: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push(eligible);
      return asked.length === 1 ? eligible : [];
    };
    cast(game, doctor);
    expect(asked).toEqual([[fifth], [fifth]]);
    expect(nameOf(game.state.objects[doctor])).toBe("The Fourteenth Doctor");
    expect(pt(game, doctor)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, doctor).has("haste")).toBe(false);
  });
});
