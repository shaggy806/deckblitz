/**
 * An opponent exiles a card from the cards you revealed and may cast it free
 * — Allure of the Unknown: `look-and-choose` `chooser: "an-opponent"`, its
 * `then` a `cast-now` run for the player who chose (rule 608.2g: as part of
 * the resolution, timing ignored).
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, controller, hand, lands, table, toHand, toLibrary, zone } from "./harness.js";

describe("Allure of the Unknown", () => {
  it("bob exiles a nonland card and casts it free; alice puts the rest into her hand", () => {
    const { game, a, b } = table();
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    let offered: readonly ObjectId[] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [giant];
    };
    let castBy: string | undefined;
    b.chooseCastNowFn = (_v, o) => {
      castBy = "bob";
      expect(o.cards).toEqual([giant]);
      return { type: "cast-spell", player: B, card: giant, targets: [], via: "effect", free: true };
    };
    a.chooseCastNowFn = () => {
      castBy = "alice";
      return null;
    };
    cast(game, toHand(game, "Allure of the Unknown"));
    expect(offered).toContain(bears);
    expect(offered).not.toContain(forest);
    expect(castBy).toBe("bob");
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(B);
    expect(hand(game, A)).toEqual(expect.arrayContaining([forest, bears]));
  });

  it("bob may decline: the card stays exiled", () => {
    const { game, b } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    b.chooseFromZoneFn = () => [bears];
    b.chooseCastNowFn = () => null;
    cast(game, toHand(game, "Allure of the Unknown"));
    expect(zone(game, bears)).toBe("exile");
  });

  it("six lands: nothing is exiled and all six go to hand", () => {
    const { game } = table();
    const top = Array.from({ length: 6 }, () => toLibrary(game, "Forest"));
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Allure of the Unknown"));
    for (const id of top) expect(zone(game, id)).toBe("hand");
  });

  it("with two opponents, alice picks which one, and that one casts", () => {
    const { game, a, b, c } = table({ players: 3 });
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    a.chooseModesFn = (_view, _min, _max, texts) => [texts.findIndex((t) => /carol/i.test(t))];
    b.chooseFromZoneFn = () => {
      throw new Error("bob wasn't chosen");
    };
    c.chooseFromZoneFn = () => [bears];
    c.chooseCastNowFn = () => ({ type: "cast-spell", player: C, card: bears, targets: [], via: "effect", free: true });
    cast(game, toHand(game, "Allure of the Unknown"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(C);
  });
});
