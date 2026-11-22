/**
 * B338 (decisions lane, agent n): Shrouded Lore and Forgotten Lore (need key
 * effect:repeat-choice-excluding-earlier-passes) — a `repeat` whose pass
 * can't take a card an earlier pass chose (`thisWayScope: "across-passes"`),
 * then the last chosen card (`thisWayScope: "last"`) put into your hand.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { B, cast, lands, ref, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Shrouded Lore", () => {
  it("the opponent chooses again for each {B} paid, never a card chosen before, and the last one comes to hand", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 3);
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant"), toGraveyard(game, "Craw Wurm")];
    const offers: ObjectId[][] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      offers.push([...eligible]);
      // Bob takes the first card he's offered each time.
      return [eligible[0]];
    };
    let payments = 0;
    a.chooseModesFn = () => {
      payments += 1;
      return payments <= 2 ? [0] : [];
    };
    cast(game, toHand(game, "Shrouded Lore"), { targets: [ref(B)] });
    expect(offers.length).toBe(3);
    expect(offers[0].length).toBe(3);
    expect(offers[1]).not.toContain(offers[0][0]);
    expect(offers[1].length).toBe(2);
    expect(offers[2]).toEqual(cards.filter((id) => id !== offers[0][0] && id !== offers[1][0]));
    // The last card chosen, and only it, comes to hand.
    const last = offers[2][0];
    expect(zone(game, last)).toBe("hand");
    expect(cards.filter((id) => zone(game, id) === "graveyard").length).toBe(2);
  });

  it("declining at once returns the first card chosen", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    b.chooseFromZoneFn = () => [giant];
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    cast(game, toHand(game, "Shrouded Lore"), { targets: [ref(B)] });
    expect(asked).toBe(1);
    expect(zone(game, giant)).toBe("hand");
  });

  it("with every card already chosen, paying again chooses nothing and the last chosen still comes to hand", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    let chosen = 0;
    b.chooseFromZoneFn = (_view, eligible) => {
      chosen += 1;
      return eligible.slice(0, 1);
    };
    let payments = 0;
    a.chooseModesFn = () => {
      payments += 1;
      return payments <= 1 ? [0] : [];
    };
    cast(game, toHand(game, "Shrouded Lore"), { targets: [ref(B)] });
    expect(chosen).toBe(1);
    expect(payments).toBe(2);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Forgotten Lore", () => {
  it("is Shrouded Lore paid in {G}", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const offers: ObjectId[][] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      offers.push([...eligible]);
      return [eligible.includes(giant) ? giant : eligible[0]];
    };
    let payments = 0;
    a.chooseModesFn = () => {
      payments += 1;
      return payments <= 1 ? [0] : [];
    };
    cast(game, toHand(game, "Forgotten Lore"), { targets: [ref(B)] });
    expect(offers[0].length).toBe(2);
    expect(offers[1]).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
