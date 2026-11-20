/**
 * `look-and-choose`'s `withCounters` on an exile (The Dragon-Kami Reborn's
 * "exile one of them face down with a hatching counter on it"), and
 * `cast-now`'s `exiledOwnedWithCounter` reaching face-down cards the caster
 * may look at (rule 406.3b — Dragon-Kami's Egg).
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  counters,
  destroy,
  enter,
  lands,
  life,
  ref,
  settle,
  table,
  toExile,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("The Dragon-Kami Reborn", () => {
  it("chapter I gains 2 life and exiles one of the top three face down with a hatching counter, the rest to the bottom", () => {
    const { game, a } = table();
    const library = (): readonly ObjectId[] => game.state.zones.perPlayer[A].library;
    const bottomBefore = library()[library().length - 1];
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Hill Giant");
    const three = toLibrary(game, "Shock");
    lands(game, "Forest", 3);
    const seen = { offered: [] as readonly ObjectId[] };
    // The pick, then the bottom's order.
    a.chooseFromZoneFn = (_view, eligible) => {
      if (seen.offered.length > 0) return eligible;
      seen.offered = eligible;
      return [two];
    };
    cast(game, toHand(game, "The Dragon-Kami Reborn"));
    expect([...seen.offered].sort()).toEqual([one, two, three].sort());
    expect(life(game, A)).toBe(22);
    expect(zone(game, two)).toBe("exile");
    expect(counters(game, two, "hatching")).toBe(1);
    const faceDown = game.state.objects[two].exiledFaceDown;
    expect(faceDown?.lookers).toEqual([A]);
    // The other two went under the library's old bottom card.
    expect(library().slice(-3, -2)).toEqual([bottomBefore]);
    expect(library().slice(-2).sort()).toEqual([one, three].sort());
  });
});

describe("Dragon-Kami's Egg", () => {
  /** The Saga's chapter III: it comes back transformed. */
  function egg(game: ReturnType<typeof table>["game"]): ObjectId {
    const saga = enter(game, "The Dragon-Kami Reborn");
    game.debugApplyEffect(A, { kind: "flicker", target: 0, transformed: true, underYourControl: true }, [ref(saga)]);
    settle(game);
    return saga;
  }

  function hatching(game: ReturnType<typeof table>["game"], id: ObjectId, lookers: readonly ("a" | "b")[] | null): ObjectId {
    const object = game.state.objects[id];
    object.counters.hatching = 1;
    if (lookers !== null) object.exiledFaceDown = { lookers: lookers.map((l) => (l === "a" ? A : B)), group: 99, lookersOnly: true };
    return id;
  }

  it("when it dies, casts a creature card from its owner's face-down hatching cards for free", () => {
    const { game, a } = table();
    const theEgg = egg(game);
    const bears = hatching(game, toExile(game, "Grizzly Bears"), ["a"]);
    const unseen = hatching(game, toExile(game, "Hill Giant"), []);
    const theirs = hatching(game, toExile(game, "Gray Ogre", B), null);
    const spell = hatching(game, toExile(game, "Divination"), ["a"]);
    const plain = toExile(game, "Llanowar Elves");
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_v, o) => {
      offered = o.cards;
      return { type: "cast-spell", player: A, card: bears, targets: [], via: "effect", free: true };
    };
    destroy(game, theEgg);
    expect(offered).toContain(bears);
    expect(offered).not.toContain(unseen);
    expect(offered).not.toContain(theirs);
    expect(offered).not.toContain(plain);
    expect(offered).not.toContain(spell);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("triggers when a Dragon you control dies, and a face-up hatching card counts", () => {
    const { game, a } = table();
    egg(game);
    const dragon = enter(game, "Shivan Dragon");
    const bears = hatching(game, toExile(game, "Grizzly Bears"), null);
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked++;
      return { type: "cast-spell", player: A, card: bears, targets: [], via: "effect", free: true };
    };
    destroy(game, dragon);
    expect(asked).toBe(1);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
