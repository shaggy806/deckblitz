/**
 * "Target player searches their library and/or graveyard for a card named …
 * If they search their library this way, they shuffle": the target player
 * does the searching, so which of their zones to search is theirs to choose,
 * not the caster's — an `as-player` around Tower Winder's resolution `modal`.
 *
 * Proving card: Auditore Ambush.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, hand, lands, ref, table, toGraveyard, toHand, toLibrary, spawn, zone } from "./harness.js";

const AMBUSH = "Auditore Ambush";
const EZIO = "Ezio, Blade of Vengeance";

type G = ReturnType<typeof table>["game"];
const shuffles = (game: G, player: typeof A): number =>
  game.state.eventLog.filter((e) => e.type === "library-shuffled" && e.player === player).length;

describe("Auditore Ambush — a target player's search, their zones their choice", () => {
  it("the target player chooses: their graveyard alone finds Ezio there, and they don't shuffle", () => {
    const { game, a, b } = table();
    const ezio = toGraveyard(game, EZIO, B);
    toLibrary(game, EZIO, B);
    let aliceAsked = 0;
    a.chooseModesFn = () => {
      aliceAsked += 1;
      return [0];
    };
    b.chooseModesFn = (_view, _min, _max, texts) => [texts.indexOf("Search your graveyard")];
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const ambush = toHand(game, AMBUSH);
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const before = shuffles(game, B);
    cast(game, ambush, { modes: [1], targets: [ref(B)] });
    expect(aliceAsked).toBe(0);
    expect(zone(game, ezio)).toBe("hand");
    expect(hand(game, B)).toContain(ezio);
    expect(shuffles(game, B)).toBe(before);
  });

  it("searching their library, they find it there and shuffle", () => {
    const { game, b } = table();
    const ezio = toLibrary(game, EZIO, B);
    b.chooseModesFn = (_view, _min, _max, texts) => [texts.indexOf("Search your library")];
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const ambush = toHand(game, AMBUSH);
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const before = shuffles(game, B);
    cast(game, ambush, { modes: [1], targets: [ref(B)] });
    expect(zone(game, ezio)).toBe("hand");
    expect(shuffles(game, B)).toBe(before + 1);
  });

  it("both modes: the creature goes back to its owner's hand, and you search your own", () => {
    const { game, a } = table();
    const bear: ObjectId = spawn(game, "Grizzly Bears", B);
    const ezio = toGraveyard(game, EZIO);
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.indexOf("Search your library and graveyard")];
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const ambush = toHand(game, AMBUSH);
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    cast(game, ambush, { modes: [0, 1], targets: [ref(bear), ref(A)] });
    expect(zone(game, bear)).toBe("hand");
    expect(hand(game, B)).toContain(bear);
    expect(zone(game, ezio)).toBe("hand");
    expect(graveyard(game)).toContain(ambush);
  });
});
